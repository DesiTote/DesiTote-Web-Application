// src/utils/productCache.ts
import { getRedis } from "../config/redis.js"; // adjust path to wherever getRedis lives
const PRODUCTS_VERSION_KEY = "products:version";
const CACHE_TTL_SECONDS = 60;
// Bump this whenever product data changes (create/update/archive)
export const invalidateProductsCache = async () => {
    const redis = getRedis();
    await redis.incr(PRODUCTS_VERSION_KEY);
};
const getProductsVersion = async () => {
    const redis = getRedis();
    const version = await redis.get(PRODUCTS_VERSION_KEY);
    return version ?? 1;
};
export const buildProductsCacheKey = async (query) => {
    const version = await getProductsVersion();
    const normalized = Object.keys(query)
        .sort()
        .filter((k) => query[k] !== undefined && query[k] !== "")
        .map((k) => `${k}=${query[k]}`)
        .join("&");
    return `products:v${version}:list:${normalized}`;
};
export const getCachedProducts = async (key) => {
    try {
        const redis = getRedis();
        const cached = await redis.get(key);
        return cached ?? null;
    }
    catch (err) {
        console.error("[REDIS GET FAILED]", err);
        return null; // treat as cache miss, don't crash the request
    }
};
export const setCachedProducts = async (key, data, ttlSeconds = CACHE_TTL_SECONDS) => {
    try {
        const redis = getRedis();
        await redis.set(key, data, { ex: ttlSeconds });
    }
    catch (err) {
        console.error("[REDIS SET FAILED]", err); // caching is best-effort, never block the response on it
    }
};
//# sourceMappingURL=productCache.js.map