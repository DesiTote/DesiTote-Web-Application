// scripts/optimizeProductImages.ts
// Repoints each product at a smaller copy of its photo.
//
// The catalog was seeded straight from the client's originals, so products
// carry photos up to 1333x2160 (2.9 megapixels) that the storefront then
// paints into a 170px card or a 264px quick-view box. A phone still has to
// download and decode every one of those at full size, which is what made
// opening a tote stutter.
//
// Resize the images first (longest side 1000px), then point this at the
// folder holding them. Old S3 objects are left in place and the previous
// URLs are written to a rollback file, so this can be undone.
//
// Usage (from the backend/ folder, with a real .env in place):
//   $env:OPTIMIZED_IMAGES_DIR="$env:TEMP\dt-optimized"
//   npx tsx src/scripts/optimizeProductImages.ts            # dry run
//   npx tsx src/scripts/optimizeProductImages.ts --apply

import "../config/loadEnv.js"; // must stay first

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Product from "../modules/product/product.model.js";
import { uploadFileToS3 } from "../services/s3.service.js";
import { invalidateProductsCache } from "../utils/productCache.js";
import { SEED_PRODUCTS } from "./seedData.js";

interface Rollback {
    slug: string;
    thumbnail: string;
    images: string[];
}

async function main() {
    const apply = process.argv.includes("--apply");
    const imagesDir = process.env.OPTIMIZED_IMAGES_DIR;

    if (!imagesDir || !fs.existsSync(imagesDir)) {
        console.error("Set OPTIMIZED_IMAGES_DIR to the folder holding the resized images.");
        process.exit(1);
    }

    await connectDB();

    const rollback: Rollback[] = [];
    let updated = 0;
    let noSmallerCopy = 0;
    let missingProduct = 0;
    let failed = 0;

    for (const family of SEED_PRODUCTS) {
        for (const variant of family.variants) {
            const localPath = path.join(imagesDir, variant.imageFile);

            // Only the oversized originals were resized; the rest are already
            // small enough and keep the URLs they have.
            if (!fs.existsSync(localPath)) {
                noSmallerCopy++;
                continue;
            }

            const product = await Product.findOne({ slug: variant.id })
                .select("_id slug thumbnail images")
                .lean();

            if (!product) {
                missingProduct++;
                continue;
            }

            if (!apply) {
                updated++;
                continue;
            }

            try {
                const imageUrl = await uploadFileToS3(
                    {
                        buffer: fs.readFileSync(localPath),
                        mimetype: "image/jpeg",
                        originalname: variant.imageFile,
                    } as Express.Multer.File,
                    "catalog-products"
                );

                rollback.push({
                    slug: product.slug,
                    thumbnail: product.thumbnail,
                    images: product.images,
                });

                await Product.updateOne(
                    { _id: product._id },
                    { $set: { thumbnail: imageUrl, images: [imageUrl] } }
                );

                updated++;
                console.log(`${variant.id} -> ${imageUrl.split("/").pop()}`);
            } catch (err: any) {
                failed++;
                console.error(`Failed for "${variant.id}": ${err.message}`);
            }
        }
    }

    console.log(
        `\n${updated} ${apply ? "updated" : "would be updated"}, ` +
            `${noSmallerCopy} already small enough` +
            (missingProduct ? `, ${missingProduct} not in the database` : "") +
            (failed ? `, ${failed} failed` : "")
    );

    if (!apply) {
        console.log("(dry run — pass --apply to write)");
        await mongoose.disconnect();
        return;
    }

    if (rollback.length) {
        const file = path.join(process.cwd(), "image-rollback.json");
        fs.writeFileSync(file, JSON.stringify(rollback, null, 2), "utf8");
        console.log(`Previous URLs saved to ${file} — the old S3 objects were not deleted.`);
    }

    // Written straight to Mongo, so the storefront cache has to be told.
    await invalidateProductsCache();
    console.log("Storefront product cache invalidated.");

    await mongoose.disconnect();
}

main().catch(async (err) => {
    console.error("Image optimisation failed:", err);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
