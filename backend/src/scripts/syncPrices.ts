// scripts/syncPrices.ts
// Pushes the prices in seedData.ts into MongoDB for products that already
// exist. seedProducts.ts only ever creates products it hasn't seen before, so
// it can't be used to change the price of a catalog that's already live —
// this script is how a price revision reaches the running store.
//
// Both `price` and `discountPrice` are set to the same value. `discountPrice`
// is what checkout actually charges (checkout.service.ts), while `price` is
// the "was" figure the storefront strikes through; keeping them equal means
// no phantom discount is advertised.
//
// Usage (from the backend/ folder, with a real .env in place):
//   npx tsx src/scripts/syncPrices.ts            # dry run, prints the diff
//   npx tsx src/scripts/syncPrices.ts --apply    # writes

import "../config/loadEnv.js"; // must stay first

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Product from "../modules/product/product.model.js";
import { invalidateProductsCache } from "../utils/productCache.js";
import { SEED_PRODUCTS } from "./seedData.js";

interface Change {
    slug: string;
    title: string;
    oldPrice: number;
    oldDiscountPrice: number;
    newPrice: number;
}

async function main() {
    const apply = process.argv.includes("--apply");

    await connectDB();

    const changes: Change[] = [];
    const unchanged: string[] = [];
    const missing: string[] = [];

    for (const family of SEED_PRODUCTS) {
        for (const variant of family.variants) {
            const product = await Product.findOne({ slug: variant.id })
                .select("_id title price discountPrice")
                .lean();

            if (!product) {
                missing.push(variant.id);
                continue;
            }

            if (product.price === variant.price && product.discountPrice === variant.price) {
                unchanged.push(variant.id);
                continue;
            }

            changes.push({
                slug: variant.id,
                title: product.title,
                oldPrice: product.price,
                oldDiscountPrice: product.discountPrice,
                newPrice: variant.price,
            });
        }
    }

    if (changes.length) {
        const width = Math.max(...changes.map((c) => c.slug.length));
        for (const c of changes) {
            console.log(
                `${c.slug.padEnd(width)}  ${String(c.oldDiscountPrice).padStart(4)} -> ${String(c.newPrice).padStart(4)}`
            );
        }
    }

    console.log(
        `\n${changes.length} to change, ${unchanged.length} already correct` +
            (missing.length ? `, ${missing.length} not in the database` : "")
    );
    if (missing.length) {
        console.log(`Not in the database (run seedProducts.ts): ${missing.join(", ")}`);
    }

    if (!apply) {
        console.log("(dry run — pass --apply to write)");
        await mongoose.disconnect();
        return;
    }

    if (changes.length) {
        const result = await Product.bulkWrite(
            changes.map((c) => ({
                updateOne: {
                    filter: { slug: c.slug },
                    update: { $set: { price: c.newPrice, discountPrice: c.newPrice } },
                },
            }))
        );
        console.log(`Updated ${result.modifiedCount} products.`);
    }

    // bulkWrite goes straight to Mongo, bypassing the product service that
    // normally bumps the cache version — without this the storefront keeps
    // serving the old prices until the cached pages expire.
    await invalidateProductsCache();
    console.log("Storefront product cache invalidated.");

    await mongoose.disconnect();
}

main().catch(async (err) => {
    console.error("Price sync failed:", err);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
