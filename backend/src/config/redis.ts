import { Redis } from "@upstash/redis";
import { ApiError } from "../utils/ApiError.js";

let redisInstance: Redis;
export const getRedis = () => {
    if (!redisInstance) {
        if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
            throw new ApiError(500, "Missing Redis env variables");
        }

        redisInstance = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL.trim(),
            // The dashboard value carries a trailing newline; Upstash warns it can break auth.
            token: process.env.UPSTASH_REDIS_REST_TOKEN.trim(),
        });
    }

    return redisInstance;
};