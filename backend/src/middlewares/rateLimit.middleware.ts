import { Request, Response, NextFunction } from "express";
import { getRedis } from "../config/redis.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * A small Redis-backed fixed-window limiter for the auth surface.
 *
 * It is one layer, never the only one: the OTP and login flows already cap
 * attempts per email. This caps requests per *caller*, so one machine cannot
 * cycle through many emails or hammer an endpoint.
 *
 * Two rules it holds to, because this guards a live shop:
 *  - Fail OPEN. If the caller cannot be identified, or Redis is unreachable,
 *    the request proceeds. A limiter that fails closed, or that lumps every
 *    unidentified caller onto one key, would lock out real customers — a worse
 *    outcome than the abuse it prevents.
 *  - Limits are generous. A real person triggers a handful of these per
 *    session; the ceilings sit far above that.
 */
function clientIp(req: Request): string | null {
    // Cloudflare fronts the Render service and sets cf-connecting-ip to the
    // real remote peer, discarding any client-supplied copy — so where it is
    // present it is the trustworthy one. For requests proxied through Vercel
    // that peer is Vercel, so fall back to the left-most x-forwarded-for, which
    // Vercel fills with the actual visitor. Neither is perfectly unspoofable by
    // someone hitting the origin directly, which is exactly why this is not the
    // only guard on any sensitive action.
    const cf = req.headers["cf-connecting-ip"];
    if (typeof cf === "string" && cf.trim()) return cf.trim();

    const xff = req.headers["x-forwarded-for"];
    if (typeof xff === "string" && xff.split(",")[0]?.trim()) return xff.split(",")[0].trim();

    return req.ip ?? null;
}

export function rateLimit(opts: { name: string; limit: number; windowSeconds: number }) {
    return async (req: Request, _res: Response, next: NextFunction) => {
        let ip: string | null;
        try {
            ip = clientIp(req);
        } catch {
            ip = null;
        }
        if (!ip) return next(); // unidentifiable caller — fail open

        const key = `rl:${opts.name}:${ip}`;
        try {
            const redis = getRedis();
            const count = await redis.incr(key);
            if (count === 1) await redis.expire(key, opts.windowSeconds);
            if (count > opts.limit) {
                const ttl = await redis.ttl(key);
                return next(
                    new ApiError(429, `Too many requests. Please try again in ${Math.max(1, ttl)} seconds.`)
                );
            }
        } catch {
            return next(); // Redis hiccup must never block a real request
        }
        next();
    };
}
