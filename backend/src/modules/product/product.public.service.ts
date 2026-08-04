import Product, { ProductStatus } from "./product.model.js";
import { IGetPublicProductsQuery } from "../../types/product.js";
import _ from "lodash";
import {
    getCachedProducts,
    setCachedProducts,
    buildProductsCacheKey,
} from "../../utils/productCache.js";
import { computeDiscountPercentage } from "../../utils/calculateDiscount.js";
import { ApiError } from "../../utils/ApiError.js";
import { REVENUE_EXCLUDED_STATUSES } from "../admin dashboard/dashboard.constant.js";
import { Order } from "../order/order.model.js";

const MAX_LIMIT = 40;
const DEFAULT_LIMIT = 12;
const PUBLIC_CACHE_TTL = 30000;
const ALL_CATEGORIES_VALUE = "all categories";

const parseCategorySelection = (raw?: string | string[]) => {
    if (!raw) return { categories: [] as string[], isAllSelected: true };

    const list = Array.isArray(raw) ? raw : raw.split(",");
    const cleaned = list
        .map((c) => c.trim().toLowerCase())
        .filter((c) => c.length > 0);

    if (cleaned.length === 0) {
        return { categories: [], isAllSelected: true };
    }

    const isAllSelected = cleaned.includes(ALL_CATEGORIES_VALUE);
    return { categories: cleaned, isAllSelected };
};

export interface PublicProductsResult {
    products: Array<{
        _id: any;
        slug: string;
        title: string;
        shortDescription: string;
        thumbnail: string;
        price: number;
        discountPrice: number;
        discountPercentage: number;
        productCategory: string;
        createdAt: Date;
    }>;
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
}

export const getPublicProductsService = async (
    query: IGetPublicProductsQuery
): Promise<PublicProductsResult> => {
    const cacheKey = await buildProductsCacheKey({ ...query, scope: "public" });
    const cached = await getCachedProducts<PublicProductsResult>(cacheKey);
    if (cached) return cached;

    let page = parseInt(query.page || "1", 10);
    let limit = parseInt(query.limit || String(DEFAULT_LIMIT), 10);

    if (!Number.isInteger(page) || page < 1) page = 1;
    if (!Number.isInteger(limit) || limit < 1) limit = DEFAULT_LIMIT;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    const { categories, isAllSelected } = parseCategorySelection(
        query.category
    );

    let sortStage: Record<string, 1 | -1> = { createdAt: -1 };

    switch (query.sort) {
        case "price_asc":
            sortStage = { price: 1 };
            break;
        case "price_desc":
            sortStage = { price: -1 };
            break;
        case "newest":
        default:
            sortStage = { createdAt: -1 };
    }

    const matchStage: any = {
        status: ProductStatus.ACTIVE,
    };

    if (!isAllSelected && categories.length > 0) {
        matchStage.tags = { $in: categories };
    }

    if (query.minPrice || query.maxPrice) {
        matchStage.price = {};

        const min = Number(query.minPrice);
        const max = Number(query.maxPrice);

        if (!isNaN(min) && min >= 0) {
            matchStage.price.$gte = min;
        }

        if (!isNaN(max) && max >= 0) {
            matchStage.price.$lte = max;
        }

        if (Object.keys(matchStage.price).length === 0) {
            delete matchStage.price;
        }
    }

    const pipeline: any[] = [];

    if (query.search?.trim()) {
        pipeline.push({
            $search: {
                index: "default_1",
                text: {
                    query: query.search.trim(),
                    path: [
                        "title",
                        "shortDescription",
                        "description",
                        "brand",
                        "tags",
                        "productCategory",
                        "color",
                        "material",
                    ],
                    fuzzy: {
                        maxEdits: 2,
                        prefixLength: 1,
                    },
                },
            },
        });
    }

    pipeline.push({
        $match: matchStage,
    });

    pipeline.push({
        $sort: sortStage,
    });

    pipeline.push({
        $facet: {
            products: [
                {
                    $skip: (page - 1) * limit,
                },
                {
                    $limit: limit,
                },
                {
                    $project: {
                        title: 1,
                        slug: 1,
                        shortDescription: 1,
                        thumbnail: 1,
                        price: 1,
                        discountPrice: 1,
                        productCategory: 1,
                        createdAt: 1,
                    },
                },
            ],
            totalCount: [
                {
                    $count: "count",
                },
            ],
        },
    });

    const [result] = await Product.aggregate(pipeline);

    const rawProducts = result?.products ?? [];

    const totalProducts =
        result?.totalCount?.length > 0
            ? result.totalCount[0].count
            : 0;

    const totalPages = Math.max(Math.ceil(totalProducts / limit), 1);

    const products = rawProducts.map((p: any) => ({
        _id: p._id,
        slug: p.slug,
        title: p.title,
        shortDescription: p.shortDescription,
        thumbnail: p.thumbnail,
        price: p.price,
        discountPrice: p.discountPrice,
        discountPercentage: computeDiscountPercentage(
            p.price,
            p.discountPrice
        ),
        productCategory: p.productCategory,
        createdAt: p.createdAt,
    }));

    const finalResult: PublicProductsResult = {
        products,
        pagination: {
            totalItems: totalProducts,
            totalPages,
            currentPage: Math.min(page, totalPages),
            limit,
        },
    };
    await setCachedProducts(cacheKey, finalResult, PUBLIC_CACHE_TTL);
    return finalResult;
};

export const getPublicProductBySlugService = async (slug: string) => {
    const query = { slug };
    const cacheKey = await buildProductsCacheKey({
        ...query,
        scope: "public",
    });

    const cached = await getCachedProducts<any>(cacheKey);
    if (cached) return cached;

    const product = await Product.findOne({
        slug,
        status: ProductStatus.ACTIVE,
    })
        .select(
            "title slug shortDescription description thumbnail images price discountPrice productCategory tags color material weight dimensions stock averageRating reviewCount"
        )
        .lean();

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const result = {
        ...product,
        discountPercentage: computeDiscountPercentage(
            product.price,
            product.discountPrice
        ),
    };

    await setCachedProducts(cacheKey, result, PUBLIC_CACHE_TTL);

    return result;
};

const BADGE_TAGS: Record<string, string> = {
    bestseller: "Bestseller",
    "eco-pick": "Eco Pick",
    new: "New",
    limited: "Limited",
};

function deriveBadge(tags: string[] = []): string {
    for (const tag of tags) {
        const label = BADGE_TAGS[tag.toLowerCase()];
        if (label) return label;
    }
    return "Bestseller";
}

export interface StorefrontBestseller {
    productId: string;
    slug: string;
    title: string;
    shortDescription: string;
    thumbnail: string;
    images: string[];
    price: number;
    discountPrice: number;
    discountPercentage: number;
    badge: string;
    totalSold: number;
}

export async function fetchStorefrontBestsellers(
    limit: number
): Promise<StorefrontBestseller[]> {
    const query = {
        limit,
        type: "bestSeller",
    };

    const cacheKey = await buildProductsCacheKey({
        ...query,
        scope: "public",
    });

    const cached = await getCachedProducts<StorefrontBestseller[]>(cacheKey);
    if (cached) return cached;

    const rows = await Order.aggregate([
        { $match: { status: { $nin: REVENUE_EXCLUDED_STATUSES } } },
        { $unwind: "$items" },
        {
            $group: {
                _id: "$items.productId",
                totalSold: { $sum: "$items.quantity" },
            },
        },
        { $sort: { totalSold: -1 } },
        { $limit: limit * 3 },
        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "_id",
                as: "product",
            },
        },
        { $unwind: "$product" },
        {
            $match: {
                "product.isPublished": true,
                "product.status": "ACTIVE",
            },
        },
        { $limit: limit },
        {
            $project: {
                _id: 0,
                productId: "$product._id",
                slug: "$product.slug",
                title: "$product.title",
                shortDescription: "$product.shortDescription",
                thumbnail: "$product.thumbnail",
                images: "$product.images",
                price: "$product.price",
                discountPrice: "$product.discountPrice",
                tags: "$product.tags",
                totalSold: 1,
            },
        },
    ]);

    const result: StorefrontBestseller[] = rows.map((r: any) => ({
        productId: r.productId.toString(),
        slug: r.slug,
        title: r.title,
        shortDescription: r.shortDescription,
        thumbnail: r.thumbnail,
        images: r.images ?? [],
        price: r.price,
        discountPrice: r.discountPrice,
        discountPercentage:
            r.price > 0
                ? Math.round(
                    ((r.price - r.discountPrice) / r.price) * 100
                )
                : 0,
        badge: deriveBadge(r.tags),
        totalSold: r.totalSold,
    }));

    await setCachedProducts(cacheKey, result, PUBLIC_CACHE_TTL);

    return result;
}