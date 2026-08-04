import { ApiError } from "../../utils/ApiError.js";
import Product, { ProductStatus } from "./product.model.js";
import { uploadFileToS3, deleteFileFromS3 } from "../../services/s3.service.js";
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
        throw new ApiError(
            400,
            "Discount price must be less than original price"
        );
    }

    if (payload.price < payload.costPrice) {
        throw new ApiError(
            400,
            "Cost price must be less than original price"
        );
    }

    // Use try...finally to guarantee S3 cleanup on database failure without swallowing the error
    try {
        // 1. Concurrent execution pool for high-performance S3 uploads
        uploadedImageUrls = await Promise.all(
            files.map((file) => uploadFileToS3(file, "catalog-products"))
        );

        // 2. Decode inline complex objects serialized over FormData fields
        const parsedDimensions = payload.dimensions;

        const parsedTags = payload.tags;

        // 3. Resolve out the user-selected thumbnail index mapping
        const thumbnailTargetIndex = Number(payload.thumbnailIndex) || 0;
        const computedThumbnailUrl = uploadedImageUrls[thumbnailTargetIndex] || uploadedImageUrls[0];

        // 4. Generate fallbacks for system metadata fields
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
        isSavedToDb = true; // Mark as successful so the finally block doesn't trigger a rollback

        return savedProduct;

    } finally {
        // Circuit-Breaker Rollback: If images were uploaded but the database save failed,
        // clean up the orphaned S3 assets. The error still bubbles up to your global handler.
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
    // Parse + sanitize pagination inputs

    
    let page = parseInt(query.page || "1", 10);
    let limit = parseInt(query.limit || String(DEFAULT_LIMIT), 10);

    if (!Number.isInteger(page) || page < 1) page = 1;
    if (!Number.isInteger(limit) || limit < 1) limit = DEFAULT_LIMIT;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    // Construct dynamic match conditions base object
    const filterConditions: any = {};

    // 1. Text Search (Matches title or tags as observed in the search bar UI)
    if (query.search) {
        const safeSearch = escapeRegExp(query.search.trim()).slice(0, 100); // cap length too
        filterConditions.$or = [
            { title: { $regex: safeSearch, $options: "i" } },
            { tags: { $regex: safeSearch, $options: "i" } }
        ];
    }

    // 2. Category Filter Dropdown
    if (query.category && query.category !== "All Categories") {
        filterConditions.productCategory = query.category;
    }

    // 3. Status Filter Dropdown (Active, Draft, etc.)
    if (query.status && query.status !== "All Status") {
        filterConditions.status = query.status;
    }

    // Get total count first so we can clamp the requested page against it
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
            currentPage: safePage, // reflects the clamped page, not the raw request
            limit,
        },
    };
};


export const getAdminProductByIdService = async (productId: string) => {
    // Fetch everything via .lean() for faster, read-only performance
    validateObjectId(productId, "productId");
    const product = await Product.findById(productId).lean();
    return product;
};

export const updateProductByIdService = async (
    productId: string,
    body: any,
    newUploadedFiles: Express.Multer.File[]
) => {
    // 1. Locate the existing product record

    if (!productId) {
        throw new ApiError(400, "Product identifier parameter is required");
    }
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
        throw new ApiError(404, "Product record not found");
    }

    // 2. Parse complex stringified form-data structures safely if transmitted as JSON strings
    let parsedDimensions = body.dimensions;
    let parsedTags = body.tags;


    // 1. Unconditionally normalize retainedS3Urls into a clean array structure
    let retainedS3Urls: string[] = [];

    if (body.existingImages) {
        retainedS3Urls = Array.isArray(body.existingImages)
            ? body.existingImages
            : [body.existingImages];
    }

    // 2. Identify images removed by the user to purge them from S3 storage
    // This will now perfectly compute even if retainedS3Urls is empty []
    const targetsForS3Deletion = currentProduct.images.filter(
        (oldUrl: string) => !retainedS3Urls.includes(oldUrl)
    );

    // 3. Purge those removed items from your S3 bucket
    if (targetsForS3Deletion.length > 0) {
        Promise.all(targetsForS3Deletion.map(deleteFileFromS3)).catch((err) =>
            console.error("[S3-BACKGROUND-PURGE-FAIL]: Failed to erase orphaned images", err)
        );
    }


    if (targetsForS3Deletion.length > 0) {
        // Execute cleanly in the background without blocking the main database runtime block
        Promise.all(targetsForS3Deletion.map(deleteFileFromS3)).catch((err) =>
            console.error("[S3-BACKGROUND-PURGE-FAIL]: Failed to erase orphaned images", err)
        );
    }
    if (body.discountPrice > body.price) {
        throw new ApiError(404, "Discount price must be less than equal to price")
    }

    let newUploadedUrls: string[] = [];
    if (newUploadedFiles && newUploadedFiles.length > 0) {
        const uploadPromises = newUploadedFiles.map((file) => uploadFileToS3(file));
        newUploadedUrls = await Promise.all(uploadPromises);

    }

    // 6. Merge the retained assets with the brand new uploads
    const updatedImagesCollection = [...retainedS3Urls, ...newUploadedUrls];

    if (updatedImagesCollection.length === 0) {
        throw new ApiError(400, "A product must retain or contain at least one asset file image");
    }

    // 7. Calculate the thumbnail URL based on the dynamic incoming index
    const requestedIndex = parseInt(body.thumbnailIndex, 10);
    const safeIndex = isNaN(requestedIndex) || requestedIndex >= updatedImagesCollection.length || requestedIndex < 0
        ? 0
        : requestedIndex;

    const assignedThumbnailUrl = updatedImagesCollection[safeIndex];

    // 8. Commit changes to MongoDB
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

    console.log(updatedProduct)

    if (!updatedProduct) {
        throw new ApiError(500, "Database runtime layer failed to patch product changes");
    }

    return updatedProduct;
};

export const archiveProductService = async (productId: string) => {
    // 0. Reject malformed IDs before hitting the DB
    validateObjectId(productId, "productId");

    // 1. Locate the target product record
    const product = await Product.findById(productId).select(
        "title sku stock lowStockThreshold price status productCategory thumbnail"
    );
    if (!product) {
        throw new ApiError(404, "Product record not found");
    }

    // 2. Prevent redundant update calls if it's already archived
    if (product.status === ProductStatus.ARCHIVED) {
        throw new ApiError(400, "Product record has already been archived");
    }

    // 3. Perform the status field soft update
    product.status = ProductStatus.ARCHIVED;

    // Only validate the field we changed, instead of skipping validation entirely
    await product.save({ validateModifiedOnly: true });

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