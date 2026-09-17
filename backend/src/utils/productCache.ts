// src/utils/productCache.ts
import { getRedis } from "../config/redis.js"; // adjust path to wherever getRedis lives

const PRODUCTS_VERSION_KEY = "products:version";
const CACHE_TTL_SECONDS = 60;

/**
 * A short-lived in-process layer in front of Redis.
 *
 * Redis lives in Mumbai and the API process does not, so a round trip to it
 * costs far more than the lookup itself — a *cache hit* on the catalogue was
 * measured at 460ms, split evenly between reading the version key and reading
 * the payload it names. Those two reads are necessarily sequential, because
 * the payload's key contains the version, so they cannot be pipelined away.
 *
 * Holding both in memory for a few seconds removes them entirely for all but
 * the first request in each window. The staleness this can introduce is
 * bounded by LOCAL_TTL_MS and is far smaller than the 30s the response already
 * asks browsers to cache for, so it changes nothing a shopper can perceive —
 * and invalidateProductsCache clears it outright, so an admin edit is still
 * reflected immediately on the instance that made it.
 */
const LOCAL_TTL_MS = 5000;

/** Bounded so an unusual spread of query strings cannot grow it without limit. */
const LOCAL_MAX_ENTRIES = 48;

type LocalEntry = { value: unknown; expiresAt: number };
const localCache = new Map<string, LocalEntry>();

function localGet<T>(key: string): T | null {
    const hit = localCache.get(key);
    if (!hit) return null;
    if (hit.expiresAt <= Date.now()) {
        localCache.delete(key);
        return null;
    }
    return hit.value as T;
}

function localSet(key: string, value: unknown) {
    // Oldest-first eviction: Map preserves insertion order, so the first key
    // is the one that has been in here longest.
    if (localCache.size >= LOCAL_MAX_ENTRIES) {
        const oldest = localCache.keys().next().value;
        if (oldest !== undefined) localCache.delete(oldest);
    }
    localCache.set(key, { value, expiresAt: Date.now() + LOCAL_TTL_MS });
}

// Bump this whenever product data changes (create/update/archive)
export const invalidateProductsCache = async () => {
    const redis = getRedis();
    // Drop the local copies first. If the Redis write then fails we have given
    // up a little speed rather than served data we already know is stale.
    localCache.clear();
    await redis.incr(PRODUCTS_VERSION_KEY);
};

const getProductsVersion = async (): Promise<number> => {
    const cached = localGet<number>(PRODUCTS_VERSION_KEY);
    if (cached !== null) return cached;

    const redis = getRedis();
    const version = (await redis.get<number>(PRODUCTS_VERSION_KEY)) ?? 1;
    localSet(PRODUCTS_VERSION_KEY, version);
    return version;
};

export const buildProductsCacheKey = async (query: Record<string, any>) => {
    const version = await getProductsVersion();
    const normalized = Object.keys(query)
        .sort()
        .filter((k) => query[k] !== undefined && query[k] !== "")
        .map((k) => `${k}=${query[k]}`)
        .join("&");

    return `products:v${version}:list:${normalized}`;
};

export const getCachedProducts = async <T>(key: string): Promise<T | null> => {
    const local = localGet<T>(key);
    if (local !== null) return local;

    try {
        const redis = getRedis();
        const cached = await redis.get<T>(key);
        if (cached === null || cached === undefined) return null;
        localSet(key, cached);
        return cached;
    } catch (err) {
        console.error("[REDIS GET FAILED]", err);
        return null; // treat as cache miss, don't crash the request
    }
};

export const setCachedProducts = async (
    key: string,
    data: unknown,
    ttlSeconds: number = CACHE_TTL_SECONDS
) => {
    // Serve the next few seconds from memory whether or not Redis accepts it.
    localSet(key, data);
    try {
        const redis = getRedis();
        await redis.set(key, data, { ex: ttlSeconds });
    } catch (err) {
        console.error("[REDIS SET FAILED]", err); // caching is best-effort, never block the response on it
    }
};
