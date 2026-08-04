// ─── lib/shiprocket.ts ────────────────────────────────────────
import { ApiError } from "../utils/ApiError.js";
import { getRedis } from "../config/redis.js";
import axios from "axios";
const BASE_URL = "https://apiv2.shiprocket.in/v1/external";
const TOKEN_CACHE_KEY = "shiprocket:token";
const TOKEN_TTL_SECONDS = 9 * 24 * 60 * 60; // 9 days — refresh before 10-day expiry
// ─── Token management ─────────────────────────────────────────
export async function getToken() {
    const redis = getRedis();
    const cached = await redis.get(TOKEN_CACHE_KEY);
    if (cached)
        return cached;
    const email = process.env.SHIPROCKET_EMAIL?.trim();
    const password = process.env.SHIPROCKET_PASSWORD?.trim();
    if (!email || !password) {
        throw new ApiError(500, "SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD is not set");
    }
    let response;
    try {
        response = await axios.post(`${BASE_URL}/auth/login`, { email, password }, { headers: { "Content-Type": "application/json" } });
    }
    catch (err) {
        throw new ApiError(502, "Unable to authenticate with Shiprocket");
    }
    const token = response.data.token;
    if (!token) {
        throw new ApiError(502, "Shiprocket authentication failed: no token returned");
    }
    await redis.setex(TOKEN_CACHE_KEY, TOKEN_TTL_SECONDS, token);
    return token;
}
// ─── Core request helper ──────────────────────────────────────
async function shiprocketRequest(method, endpoint, body, query) {
    const token = await getToken();
    const url = new URL(`${BASE_URL}${endpoint}`);
    if (query) {
        for (const [key, value] of Object.entries(query)) {
            if (value !== undefined)
                url.searchParams.set(key, String(value));
        }
    }
    const doFetch = (authToken) => fetch(url.toString(), {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });
    let response = await doFetch(token);
    // Token expired mid-session (edge case) — clear cache and retry once
    if (response.status === 401) {
        const redis = getRedis();
        await redis.del(TOKEN_CACHE_KEY);
        const freshToken = await getToken();
        response = await doFetch(freshToken);
        if (!response.ok) {
            throw new ApiError(502, "Shiprocket request failed after token refresh");
        }
        return response.json();
    }
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("in ship api", error);
        throw new ApiError(502, error?.message || `Shiprocket error: ${response.status}`);
    }
    return response.json();
}
// ─── Exported client ──────────────────────────────────────────
export const shiprocketClient = {
    createOrder: (payload) => shiprocketRequest("POST", "/orders/create/adhoc", payload),
    cancelOrder: (shiprocketOrderId) => shiprocketRequest("POST", "/orders/cancel", {
        ids: [shiprocketOrderId],
    }),
    getOrderById: (shiprocketOrderId) => shiprocketRequest("GET", `/orders/show/${shiprocketOrderId}`),
    // Used by checkout.service.ts for the pre-order rate display —
    // shares this same Redis-cached token, no separate auth logic needed.
    checkServiceability: (params) => shiprocketRequest("GET", "/courier/serviceability/", undefined, params),
    trackByAwb: (awb) => shiprocketRequest("GET", `/courier/track/awb/${awb}`),
};
//# sourceMappingURL=shiprocket.js.map