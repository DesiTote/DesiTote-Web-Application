// Pure on purpose: no Mongoose, Redis or Razorpay, so the Shiprocket amounts can be unit-tested.

// Read at call time, not module load — see config/loadEnv.ts.
export const getShiprocketPickupLocation = () => process.env.SHIPROCKET_PICKUP_LOCATION?.trim();
export const DEFAULT_PACKAGE_DIMENSIONS_CM = { length: 25, breadth: 20, height: 5 };

export function buildShiprocketPayload(order: any) {
    // Items go out at MRP and total_discount carries every rupee knocked off, so Shiprocket
    // sees sub_total - total_discount = what the customer pays (a free bag is MRP, fully discounted).
    // A tote bought and also given free is two order lines with one SKU, which Shiprocket rejects, so merge by SKU.
    // Both go out at the same selling_price; the free unit's value is already in total_discount.
    const bySku = new Map<string, any>();
    for (const item of order.items) {
        const existing = bySku.get(item.sku);
        if (existing) {
            existing.units += item.quantity;
            continue;
        }
        bySku.set(item.sku, {
            name: item.name,
            sku: item.sku,
            units: item.quantity,
            selling_price: Number((item.originalPrice ?? item.unitPrice).toFixed(2)),
            discount: "",
            tax: String(item.gstPercentage),
            hsn: "4202", // cotton tote bags — same for the whole catalogue
        });
    }
    const orderItems = [...bySku.values()];

    return {
        order_id: order._id.toString(),
        order_date: new Date().toISOString().slice(0, 10),
        pickup_location: getShiprocketPickupLocation(),

        billing_customer_name: order.deliveryAddress.fullName,
        billing_last_name: "",
        billing_address: order.deliveryAddress.addressLine1,
        billing_address_2: order.deliveryAddress.addressLine2,
        billing_city: order.deliveryAddress.district,
        billing_pincode: order.deliveryAddress.pincode,
        billing_state: order.deliveryAddress.state,
        billing_country: order.deliveryAddress.country,
        billing_phone: order.deliveryAddress.mobileNumber,
        billing_email: order.billingEmail,
        shipping_is_billing: true,

        // Shiprocket expects "COD" or "Prepaid" specifically — not "ONLINE"
        payment_method: order.payment.method === "COD" ? "COD" : "Prepaid",
        sub_total: Number(orderItems.reduce((sum: number, i: any) => sum + i.selling_price * i.units, 0).toFixed(2)),
        total_discount: order.discount,
        shipping_charges: order.shippingCharge,
        length: DEFAULT_PACKAGE_DIMENSIONS_CM.length,
        breadth: DEFAULT_PACKAGE_DIMENSIONS_CM.breadth,
        height: DEFAULT_PACKAGE_DIMENSIONS_CM.height,
        weight: order.packageWeight,

        order_items: orderItems,
    };
}
