import { OrderStatusBucket } from "@/types/admin/dashboard.type";
import { PaymentMethod } from "@/types/admin/order.type";

export const STATUS_OPTIONS: OrderStatusBucket[] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
export const PAYMENT_OPTIONS: PaymentMethod[] = ["COD", "ONLINE"];
 
export const STATUS_BADGE_CLASS: Record<OrderStatusBucket, string> = {
    Pending: "bg-amber-50 text-amber-700",
    Processing: "bg-blue-50 text-blue-700",
    Shipped: "bg-green-50 text-green-700",
    Delivered: "bg-purple-50 text-purple-700",
    Cancelled: "bg-red-50 text-red-700",
};
 
export const EMPTY_FILTERS = {
    status: "" as OrderStatusBucket | "",
    paymentMethod: "" as PaymentMethod | "",
    dateFrom: "",
    dateTo: "",
};