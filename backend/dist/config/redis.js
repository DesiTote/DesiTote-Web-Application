import { Redis } from "@upstash/redis";
import { ApiError } from "../utils/ApiError.js";
let redisInstance;
export const getRedis = () => {
    if (!redisInstance) {
        if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
            throw new ApiError(500, "Missing Redis env variables");
        }
        redisInstance = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    }
    return redisInstance;
};
//# sourceMappingURL=redis.js.map