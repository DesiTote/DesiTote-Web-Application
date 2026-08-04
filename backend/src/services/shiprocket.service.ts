// ─── services/shipping/shiprocket.service.ts ─────────────────
import { shiprocketClient, ShiprocketCourierOption } from "../lib/shiprocket.js";
import { ApiError } from "../utils/ApiError.js";

const PUNE_PICKUP_PINCODE = "411027";

interface GetShippingRateInput {
    deliveryPincode: string;
    weightKg: number; // pass the CHARGEABLE weight (actual product weight + packaging weight)
    isCOD: boolean;
    declaredValue: number;
}

interface ShippingRateResult {
    courierId: number;
    courierName: string;
    shippingCharge: number;
    codCharge: number;
    totalCharge: number;
    estimatedDeliveryDays: string | number | null;
    etd: string | null;
    allOptions: any[];
}

interface NormalisedCourierOption {
    courierId: number;
    courierName: string;
    shippingCharge: number;
    codCharge: number;
    totalCharge: number;
    estimatedDeliveryDays: string | number | null;
    etd: string | null;
}

export async function getShippingRate({
    deliveryPincode,
    weightKg,
    isCOD,
    declaredValue,
}: GetShippingRateInput): Promise<ShippingRateResult> {
    if (!PUNE_PICKUP_PINCODE) {
        throw new ApiError(500, "SHIPROCKET_PICKUP_PINCODE is not configured");
    }
    if (!deliveryPincode || !/^\d{6}$/.test(deliveryPincode)) {
        throw new ApiError(400, "A valid 6-digit delivery pincode is required");
    }

    const response = await shiprocketClient.checkServiceability({
        pickup_postcode: PUNE_PICKUP_PINCODE,
        delivery_postcode: deliveryPincode,
        weight: weightKg,
        cod: isCOD ? 1 : 0,
        declared_value: declaredValue,
    });

    const couriers = response?.data?.available_courier_companies ?? [];

    if (!couriers.length) {
        throw new ApiError(422, "Delivery is not available for this pincode");
    }

    const normalised: NormalisedCourierOption[] = couriers.map((c: ShiprocketCourierOption) => {
        const totalCharge = Number(c.rate ?? c.freight_charge ?? 0);
        const codCharge = isCOD ? Number(c.cod_charges ?? c.cod_charge ?? 0) : 0;
        const shippingCharge = totalCharge - codCharge; // freight-only portion, for display/breakdown

        return {
            courierId: c.courier_company_id,
            courierName: c.courier_name,
            shippingCharge,
            codCharge,
            totalCharge,
            estimatedDeliveryDays: c.estimated_delivery_days ?? null,
            etd: c.etd ?? null,
        };
    });

    const sorted = normalised.sort((a, b) => a.totalCharge - b.totalCharge);
    const cheapest = sorted[0];

    return {
        courierId: cheapest.courierId,
        courierName: cheapest.courierName,
        shippingCharge: cheapest.shippingCharge,
        codCharge: cheapest.codCharge,
        totalCharge: cheapest.totalCharge,
        estimatedDeliveryDays: cheapest.estimatedDeliveryDays,
        etd: cheapest.etd,
        allOptions: sorted,
    };
}

export async function trackShipmentByAwb(awb: string) {
    const response = await shiprocketClient.trackByAwb(awb);

    const track = response?.[awb]?.tracking_data;
    return {
        status: track?.shipment_track?.[0]?.current_status ?? null,
        scans: track?.shipment_track_activities ?? [],
        etd: track?.etd ?? null,
    };
}