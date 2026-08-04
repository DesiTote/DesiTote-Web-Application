import { ApiError } from "../../utils/ApiError.js"; // adjust path
import { placeOrderService, getOrderService, cancelOrderService, getRecentOrdersService, createRazorpayOrderService, verifyRazorpayPaymentService } from "./order.service.js"; // adjust filename if colocated differently
import { CancelOrderSchema, VerifyRazorpayPaymentSchema } from "./order.validation.js";
export async function placeOrderController(req, res, next) {
    const paymentMethod = req.body.paymentMethod; // now only expects { paymentMethod }
    try {
        const result = await placeOrderService({
            sessionId: req.params.sessionId,
            paymentMethod, // { paymentMethod }
            sessionData: req.checkoutSession,
            userId: req.user.userId,
            // set by authenticate middleware
        });
        return res.status(200).json({
            success: true,
            message: "Order created successfully",
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
}
export async function getOrderController(req, res, next) {
    try {
        const order = await getOrderService(req.params.orderId, req.user.userId);
        return res.status(200).json({
            success: true,
            message: "Order fetched",
            data: order,
        });
    }
    catch (err) {
        next(err);
    }
}
export async function getRecentOrdersController(req, res, next) {
    try {
        const limit = Math.min(Number(req.query?.limit) || 10, 10);
        const orders = await getRecentOrdersService(req.user.userId, limit);
        return res.status(200).json({
            success: true,
            message: "Recent orders fetched",
            data: orders,
        });
    }
    catch (err) {
        next(err);
    }
}
export async function cancelOrderController(req, res, next) {
    const parsed = CancelOrderSchema.safeParse(req.body); // { reason, note? }
    if (!parsed.success) {
        return next(new ApiError(400, "Invalid request data"));
    }
    try {
        const result = await cancelOrderService({
            orderId: req.params.orderId,
            userId: req.user.userId,
            ...parsed.data,
        });
        return res.status(200).json({
            success: true,
            message: "Order cancelled",
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
}
export async function createRazorpayOrderController(req, res, next) {
    try {
        const result = await createRazorpayOrderService({
            sessionId: req.params.sessionId,
            sessionData: req.checkoutSession,
            userId: req.user.userId,
        });
        return res.status(200).json({
            success: true,
            message: "Razorpay order created",
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
}
// ── ONLINE payment: phase 2 — verify signature from the client callback ──
export async function verifyRazorpayPaymentController(req, res, next) {
    const parsed = VerifyRazorpayPaymentSchema.safeParse(req.body);
    if (!parsed.success) {
        return next(new ApiError(400, "Invalid request data"));
    }
    try {
        const result = await verifyRazorpayPaymentService({
            orderId: req.params.orderId,
            userId: req.user.userId,
            ...parsed.data,
        });
        return res.status(200).json({
            success: true,
            message: "Payment verified",
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=order.controller.js.map