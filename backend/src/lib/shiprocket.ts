// ─── lib/shiprocket.ts ────────────────────────────────────────
import { ApiError } from "../utils/ApiError.js";
import { getRedis } from "../config/redis.js";
import axios from "axios";

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";
const TOKEN_CACHE_KEY = "shiprocket:token";
const TOKEN_TTL_SECONDS = 9 * 24 * 60 * 60; // 9 days — refresh before 10-day expiry

// ─── Token management ─────────────────────────────────────────

export async function getToken(): Promise<string> {
    const redis = getRedis();

    const cached: string | null = await redis.get(TOKEN_CACHE_KEY);
    if (cached) return cached;

    const email = process.env.SHIPROCKET_EMAIL?.trim();
    const password = process.env.SHIPROCKET_PASSWORD?.trim();

    if (!email || !password) {
        throw new ApiError(500, "SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD is not set");
    }

    let response;
    try {
        response = await axios.post(
            `${BASE_URL}/auth/login`,
            { email, password },
            { headers: { "Content-Type": "application/json" } }
        );
    } catch (err: any) {
        throw new ApiError(502, "Unable to authenticate with Shiprocket");
    }

    const token: string = response.data.token;

    if (!token) {
        throw new ApiError(502, "Shiprocket authentication failed: no token returned");
    }

    await redis.setex(TOKEN_CACHE_KEY, TOKEN_TTL_SECONDS, token);
    return token;
}

// ─── Core request helper ──────────────────────────────────────

async function shiprocketRequest<T>(
    method: "GET" | "POST" | "PUT" | "PATCH",
    endpoint: string,
    body?: Record<string, unknown>,
    query?: Record<string, string | number | boolean | undefined>
): Promise<T> {
    const token = await getToken();

    const url = new URL(`${BASE_URL}${endpoint}`);
    if (query) {
        for (const [key, value] of Object.entries(query)) {
            if (value !== undefined) url.searchParams.set(key, String(value));
        }
    }

    const doFetch = (authToken: string) =>
        fetch(url.toString(), {
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
        return response.json() as Promise<T>;
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("in ship api",error)
        throw new ApiError(502, error?.message || `Shiprocket error: ${response.status}`);
    }

    return response.json() as Promise<T>;
}

// ─── Response types ───────────────────────────────────────────

export interface ShiprocketOrderResponse {
    order_id: number; // Shiprocket's own id — different from your order_id
    shipment_id: number;
    status: string;
    awb_code?: string;
    courier_name?: string;
}

export interface ShiprocketCourierOption {
    courier_company_id: number;
    courier_name: string;
    rate: number;
    freight_charge?: number;
    cod_charges?: number;
    cod_charge?: number;
    estimated_delivery_days?: string | number;
    etd?: string;
    [key: string]: unknown; // field names vary slightly by plan — callers normalise what they need
}

export interface ShiprocketServiceabilityResponse {
    data: {
        available_courier_companies: ShiprocketCourierOption[];
    };
}

export interface ShiprocketTrackingResponse {
    [awb: string]: {
        tracking_data: {
            shipment_track?: { current_status: string }[];
            shipment_track_activities?: Array<{
                date: string;
                activity: string;
                location?: string;
                "sr-status-label"?: string;
            }>;
            etd?: string;
        };
    };
}

// ─── Exported client ──────────────────────────────────────────

export const shiprocketClient = {
    createOrder: (payload: Record<string, unknown>) =>
        shiprocketRequest<ShiprocketOrderResponse>("POST", "/orders/create/adhoc", payload),

    cancelOrder: (shiprocketOrderId: number) =>
        shiprocketRequest<{ message: string }>("POST", "/orders/cancel", {
            ids: [shiprocketOrderId],
        }),

    getOrderById: (shiprocketOrderId: number) =>
        shiprocketRequest<{ data: Record<string, unknown> }>("GET", `/orders/show/${shiprocketOrderId}`),

    // Used by checkout.service.ts for the pre-order rate display —
    // shares this same Redis-cached token, no separate auth logic needed.
    checkServiceability: (params: {
        pickup_postcode: string;
        delivery_postcode: string;
        weight: number;
        cod: 0 | 1;
        declared_value?: number;
    }) =>
        shiprocketRequest<ShiprocketServiceabilityResponse>(
            "GET",
            "/courier/serviceability/",
            undefined,
            params
        ),

    trackByAwb: (awb: string) =>
        shiprocketRequest<ShiprocketTrackingResponse>("GET", `/courier/track/awb/${awb}`),
};