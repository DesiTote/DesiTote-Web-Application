// ─── modules/order/order-admin.service.ts ──────────────────────
import mongoose, { QueryFilter } from "mongoose";
import { Order, IOrder, OrderStatus, PaymentMethod } from "./order.model.js";
import { OrderStatusBucket, getStatusesForBucket, ORDER_STATUS_BUCKET_MAP, ALL_ORDER_STATUSES } from "./order.constants.js";
import { validateObjectId } from "../../utils/mongoIDValidator.js";
import { ApiError } from "../../utils/ApiError.js";

export interface AdminOrderListQuery {
    page?: number;
    limit?: number;
    status?: OrderStatusBucket;
    paymentMethod?: PaymentMethod;
    dateFrom?: string; // ISO date
    dateTo?: string;   // ISO date
    search?: string;   // orderNumber / billingEmail / mobileNumber / AWB
}

export interface AdminOrderListItem {
    _id: string;
    orderNumber: string;
    customerName: string;
    billingEmail: string;
    mobileNumber: string;
    createdAt: Date;
    itemsCount: number;
    grandTotal: number;
    paymentMethod: PaymentMethod;
    paymentStatus: string;
    status: OrderStatus;
    statusBucket: OrderStatusBucket | null;
    awb?: string;
    courierName?: string;
    shiprocketStatus?: string;
}

function buildFilter(query: AdminOrderListQuery): mongoose.QueryFilter<IOrder> {
    const filter: mongoose.QueryFilter<IOrder> = {};

    if (query.status) {
        filter.status = { $in: getStatusesForBucket(query.status) };
    }

    if (query.paymentMethod) {
        filter["payment.method"] = query.paymentMethod;
    }

    if (query.dateFrom || query.dateTo) {
        filter.createdAt = {};
        if (query.dateFrom) filter.createdAt.$gte = new Date(query.dateFrom);
        if (query.dateTo) {
            const end = new Date(query.dateTo);
            end.setHours(23, 59, 59, 999);
            filter.createdAt.$lte = end;
        }
    }

    if (query.search) {
        const regex = new RegExp(query.search.trim(), "i");
        filter.$or = [
            { orderNumber: regex },
            { billingEmail: regex },
            { "deliveryAddress.mobileNumber": regex },
            { "shiprocket.awb": regex },
        ];
    }

    return filter;
}

export async function fetchAdminOrderList(query: AdminOrderListQuery) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const filter = buildFilter(query);

    const [rows, total] = await Promise.all([
        Order.find(filter)
            .select(
                "orderNumber deliveryAddress.fullName deliveryAddress.mobileNumber billingEmail createdAt items grandTotal payment.method payment.status status shiprocket.awb shiprocket.courierName shiprocket.status"
            )
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Order.countDocuments(filter),
    ]);

    const orders: AdminOrderListItem[] = rows.map((o: any) => ({
        _id: o._id.toString(),
        orderNumber: o.orderNumber,
        customerName: o.deliveryAddress?.fullName ?? "—",
        billingEmail: o.billingEmail,
        mobileNumber: o.deliveryAddress?.mobileNumber ?? "—",
        createdAt: o.createdAt,
        itemsCount: o.items?.length ?? 0,
        grandTotal: o.grandTotal,
        paymentMethod: o.payment?.method,
        paymentStatus: o.payment?.status,
        status: o.status,
        statusBucket: ORDER_STATUS_BUCKET_MAP[o.status as OrderStatus] ?? null,
        awb: o.shiprocket?.awb,
        courierName: o.shiprocket?.courierName,
        shiprocketStatus: o.shiprocket?.status,
    }));

    return {
        orders,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        },
    };
}

/* ────────────────────────────────────────────────────────────
 * Single order — full detail for the /manage-orders/[orderId] page
 * ──────────────────────────────────────────────────────────── */
export async function fetchAdminOrderById(orderId: string) {
    validateObjectId(orderId, "orderId");

    const order = await Order.findById(orderId).lean();
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    return {
        ...order,
        _id: order._id.toString(),
        statusBucket: ORDER_STATUS_BUCKET_MAP[order.status as OrderStatus] ?? null,
    };
}

export async function updateOrderStatusManually(
    orderId: string,
    newStatus: OrderStatus,
    note: string | undefined,
    adminIdentifier: string
) {
    validateObjectId(orderId, "orderId");

    if (!ALL_ORDER_STATUSES.includes(newStatus)) {
        throw new ApiError(400, `Invalid status. Must be one of: ${ALL_ORDER_STATUSES.join(", ")}`);
    }

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const previousStatus = order.status;
    order.status = newStatus;
    order.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        note: note
            ? `${note} (manual override from "${previousStatus}" by ${adminIdentifier})`
            : `Manually changed from "${previousStatus}" by ${adminIdentifier}`,
        source: "admin",
    });

    await order.save();

    return order;
}