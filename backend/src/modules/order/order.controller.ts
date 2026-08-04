import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../utils/ApiError.js"; // adjust path
import { CheckoutSession } from "../../types/checkout.js"; // adjust path
import { placeOrderService, getOrderService, cancelOrderService, getRecentOrdersService, createRazorpayOrderService, verifyRazorpayPaymentService } from "./order.service.js"; // adjust filename if colocated differently
import { CancelOrderSchema, VerifyRazorpayPaymentSchema } from "./order.validation.js";

export async function placeOrderController(req: Request, res: Response, next: NextFunction) {
  const paymentMethod = req.body.paymentMethod as "COD" | "ONLINE"; // now only expects { paymentMethod }


  try {
    const result = await placeOrderService({
      sessionId: req.params.sessionId as string,
      paymentMethod, // { paymentMethod }
      sessionData: req.checkoutSession as CheckoutSession,
      userId: req.user.userId as string,
      // set by authenticate middleware
    });
    return res.status(200).json({
      success: true,
      message: "Order created successfully",
      data: result,
    });
  } catch (err: any) {
    next(err);
  }
}

export async function getOrderController(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await getOrderService(req.params.orderId as string, req.user.userId as string);
    return res.status(200).json({
      success: true,
      message: "Order fetched",
      data: order,
    });
  } catch (err: any) {
    next(err);
  }
}

export async function getRecentOrdersController(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = Math.min(Number(req.query?.limit) || 10, 10); 
    const orders = await getRecentOrdersService(req.user.userId as string, limit);
    return res.status(200).json({
      success: true,
      message: "Recent orders fetched",
      data: orders,
    });
  } catch (err: any) {
    next(err);
  }
}

export async function cancelOrderController(req: Request, res: Response, next: NextFunction) {
  const parsed = CancelOrderSchema.safeParse(req.body); // { reason, note? }
  if (!parsed.success) {
    return next(new ApiError(400, "Invalid request data"));
  }

  try {
    const result = await cancelOrderService({
      orderId: req.params.orderId as string,
      userId: req.user.userId as string,
      ...parsed.data,
    });
    return res.status(200).json({
      success: true,
      message: "Order cancelled",
      data: result,
    });
  } catch (err: any) {
    next(err);
  }
}

export async function createRazorpayOrderController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await createRazorpayOrderService({
      sessionId: req.params.sessionId as string,
      sessionData: req.checkoutSession as CheckoutSession,
      userId: req.user.userId as string,
    });
    return res.status(200).json({
      success: true,
      message: "Razorpay order created",
      data: result,
    });
  } catch (err: any) {
    next(err);
  }
}
 
// ── ONLINE payment: phase 2 — verify signature from the client callback ──
export async function verifyRazorpayPaymentController(req: Request, res: Response, next: NextFunction) {
  const parsed = VerifyRazorpayPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(new ApiError(400, "Invalid request data"));
  }
 
  try {
    const result = await verifyRazorpayPaymentService({
      orderId: req.params.orderId as string,
      userId: req.user.userId as string,
      ...parsed.data,
    });
    return res.status(200).json({
      success: true,
      message: "Payment verified",
      data: result,
    });
  } catch (err: any) {
    next(err);
  }
}






















