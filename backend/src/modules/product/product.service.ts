import { ApiError } from "../../utils/ApiError.js";
import Product, { ProductStatus } from "./product.model.js";
import { uploadFileToS3, deleteFileFromS3 } from "../../services/s3.service.js";
import { invalidateProductsCache } from "../../utils/productCache.js";
import slugify from "slugify";
import { IGetAdminProductsQuery } from "../../types/product.js";
import { validateObjectId } from "../../utils/mongoIDValidator.js";
import _ from "lodash";

export const createProductService = async (payload: any, files: Express.Multer.File[]) => {
    let uploadedImageUrls: string[] = [];
    let isSavedToDb = false;

    if (!files || files.length === 0) {
        throw new ApiError(400, "Cannot create a product without gallery media.");
    }

    if (payload.discountPrice > payload.price) {
        throw new ApiError(400, "Discount price must be less than original price");
    }

    if (payload.price < payload.costPrice) {
        throw new ApiError(400, "Cost price must be less than original price");
    }

    try {
        uploadedImageUrls = await Promise.all(
            files.map((file) => uploadFileToS3(file, "catalog-products"))
        );

        const parsedDimensions = payload.dimensions;
        const parsedTags = payload.tags;

        const thumbnailTargetIndex = Number(payload.thumbnailIndex) || 0;
        const computedThumbnailUrl = uploadedImageUrls[thumbnailTargetIndex] || uploadedImageUrls[0];
        const generationSlug = payload.slug || slugify(payload.title, { lower: true, strict: true });

        const newProduct = new Product({
            ...payload,
            slug: generationSlug,
            dimensions: parsedDimensions,
            tags: Array.isArray(parsedTags) ? parsedTags : [],
            images: uploadedImageUrls,
            thumbnail: computedThumbnailUrl,
        });

        const savedProduct = await newProduct.save();
        isSavedToDb = true;

        // Invalidate products cache after new creation
        await invalidateProductsCache();

        return savedProduct;
    } finally {
        if (uploadedImageUrls.length > 0 && !isSavedToDb) {
            console.log("Database save failed. Rolling back uploaded S3 images...");
            await Promise.all(uploadedImageUrls.map((url) => deleteFileFromS3(url)));
        }
    }
};

const MAX_LIMIT = 20;
const DEFAULT_LIMIT = 10;

export const getAdminProductsService = async (query: IGetAdminProductsQuery) => {
    const { escapeRegExp } = _;

    let page = parseInt(query.page || "1", 10);
    let limit = parseInt(query.limit || String(DEFAULT_LIMIT), 10);

    if (!Number.isInteger(page) || page < 1) page = 1;
    if (!Number.isInteger(limit) || limit < 1) limit = DEFAULT_LIMIT;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    const filterConditions: any = {};

    if (query.search) {
        const safeSearch = escapeRegExp(query.search.trim()).slice(0, 100);
        filterConditions.$or = [
            { title: { $regex: safeSearch, $options: "i" } },
            { tags: { $regex: safeSearch, $options: "i" } }
        ];
    }

    if (query.category && query.category !== "All Categories") {
        filterConditions.productCategory = query.category;
    }

    if (query.status && query.status !== "All Status") {
        filterConditions.status = query.status;
    }

    const totalProducts = await Product.countDocuments(filterConditions);
    const totalPages = Math.max(Math.ceil(totalProducts / limit), 1);
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;

    const products = await Product.find(filterConditions)
        .select("title sku stock lowStockThreshold price status productCategory thumbnail")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    return {
        products,
        pagination: {
            totalItems: totalProducts,
            totalPages,
            currentPage: safePage,
            limit,
        },
    };
};

export const getAdminProductByIdService = async (productId: string) => {
    validateObjectId(productId, "productId");
    const product = await Product.findById(productId).lean();
    return product;
};

export const updateProductByIdService = async (
    productId: string,
    body: any,
    newUploadedFiles: Express.Multer.File[]
) => {
    if (!productId) {
        throw new ApiError(400, "Product identifier parameter is required");
    }
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
        throw new ApiError(404, "Product record not found");
    }

    let parsedDimensions = body.dimensions;
    let parsedTags = body.tags;

    let retainedS3Urls: string[] = [];
    if (body.existingImages) {
        retainedS3Urls = Array.isArray(body.existingImages)
            ? body.existingImages
            : [body.existingImages];
    }

    const targetsForS3Deletion = currentProduct.images.filter(
        (oldUrl: string) => !retainedS3Urls.includes(oldUrl)
    );

    if (targetsForS3Deletion.length > 0) {
        Promise.all(targetsForS3Deletion.map(deleteFileFromS3)).catch((err) =>
            console.error("[S3-BACKGROUND-PURGE-FAIL]: Failed to erase orphaned images", err)
        );
    }

    if (body.discountPrice > body.price) {
        throw new ApiError(400, "Discount price must be less than or equal to price");
    }

    let newUploadedUrls: string[] = [];
    if (newUploadedFiles && newUploadedFiles.length > 0) {
        const uploadPromises = newUploadedFiles.map((file) => uploadFileToS3(file));
        newUploadedUrls = await Promise.all(uploadPromises);
    }

    const updatedImagesCollection = [...retainedS3Urls, ...newUploadedUrls];

    if (updatedImagesCollection.length === 0) {
        throw new ApiError(400, "A product must retain or contain at least one asset file image");
    }

    const requestedIndex = parseInt(body.thumbnailIndex, 10);
    const safeIndex = isNaN(requestedIndex) || requestedIndex >= updatedImagesCollection.length || requestedIndex < 0
        ? 0
        : requestedIndex;

    const assignedThumbnailUrl = updatedImagesCollection[safeIndex];

    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
            ...body,
            dimensions: parsedDimensions,
            tags: parsedTags,
            images: updatedImagesCollection,
            thumbnail: assignedThumbnailUrl,
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedProduct) {
        throw new ApiError(500, "Database runtime layer failed to patch product changes");
    }

    // Invalidate products cache after update
    await invalidateProductsCache();

    return updatedProduct;
};

export const archiveProductService = async (productId: string) => {
    validateObjectId(productId, "productId");

    const product = await Product.findById(productId).select(
        "title sku stock lowStockThreshold price status productCategory thumbnail"
    );
    if (!product) {
        throw new ApiError(404, "Product record not found");
    }

    if (product.status === ProductStatus.ARCHIVED) {
        throw new ApiError(400, "Product record has already been archived");
    }

    product.status = ProductStatus.ARCHIVED;
    await product.save({ validateModifiedOnly: true });

    // Invalidate products cache after status change/archival
    await invalidateProductsCache();

    return {
        _id: product._id,
        title: product.title,
        sku: product.sku,
        stock: product.stock,
        lowStockThreshold: product.lowStockThreshold,
        price: product.price,
        productCategory: product.productCategory,
        thumbnail: product.thumbnail,
        status: product.status,
    };
};