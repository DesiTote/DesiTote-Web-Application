// ─── modules/order/stock.service.ts ────────────────────────────────
import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import Product from "../product/product.model.js";
import { invalidateProductsCache } from "../../utils/productCache.js";


interface StockItem {
    productId: mongoose.Types.ObjectId | string;
    quantity: number;
    name: string;
}


export async function decrementStockForOrder(items: StockItem[]) {
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            for (const item of items) {
                const updated = await Product.findOneAndUpdate(
                    { _id: item.productId, stock: { $gte: item.quantity } },
                    { $inc: { stock: -item.quantity } },
                    { session, new: true }
                );

                if (!updated) {
                    throw new ApiError(
                        409,
                        `"${item.name}" doesn't have enough stock left. Please adjust the quantity and try again.`
                    );
                }
            }
            await invalidateProductsCache();
        });
    } finally {
        await session.endSession();
    }
}


export async function restoreStockForOrder(items: StockItem[]) {
    for (const item of items) {
        try {
            await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } });
        } catch (err) {
            console.error(`[stock-restore] Failed to restore stock for product ${item.productId}`, err);
        }
    }

    // The storefront serves a cached catalogue, so without this the returned
    // units stay invisible to shoppers until the cache ages out.
    try {
        await invalidateProductsCache();
    } catch (err) {
        console.error("[stock-restore] Failed to invalidate the products cache", err);
    }
}