// scripts/seedProducts.ts
// One-off catalog migration: uploads each product photo to S3 and creates
// one Product document per variant (see seedData.ts for the source data
// and why variants are flattened this way instead of a real variant model).
//
// Usage (from the backend/ folder, with a real .env in place):
//   SEED_IMAGES_DIR="../frontend/src/assets/images" npx tsx src/scripts/seedProducts.ts
//
// Safe to re-run: any slug that already exists in the DB is skipped, so a
// partial/interrupted run can just be started again without re-uploading
// or duplicating anything.

import "../config/loadEnv.js"; // must stay first

import fs from "fs";
import path from "path";
import { connectDB } from "../config/db.js";
import Product, { ProductCategory } from "../modules/product/product.model.js";
import { uploadFileToS3 } from "../services/s3.service.js";
import { SEED_PRODUCTS } from "./seedData.js";

// Placeholder logistics values --- the frontend catalog never captured real
// weight/dimensions per product. Adjust per-SKU later via the admin panel
// once real measurements are available; these are close enough for a
// single folded cotton tote to get Shiprocket quoting a sane rate.
const DEFAULT_WEIGHT_KG = 0.15;
const DEFAULT_DIMENSIONS_CM = { length: 35, breadth: 40, height: 1 };
const DEFAULT_STOCK = 20;
const DEFAULT_GST_PERCENTAGE = 18;

async function main() {
    const imagesDir = process.env.SEED_IMAGES_DIR;
    if (!imagesDir) {
        console.error("Set SEED_IMAGES_DIR to the frontend's src/assets/images folder before running this script.");
        process.exit(1);
    }
    if (!fs.existsSync(imagesDir)) {
        console.error(`SEED_IMAGES_DIR does not exist: ${imagesDir}`);
        process.exit(1);
    }

    await connectDB();

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const family of SEED_PRODUCTS) {
        for (const variant of family.variants) {
            const slug = variant.id;
            const sku = variant.id.toUpperCase();

            const existing = await Product.findOne({ slug }).select("_id").lean();
            if (existing) {
                skipped++;
                continue;
            }

            const imagePath = path.join(imagesDir, variant.imageFile);
            if (!fs.existsSync(imagePath)) {
                console.error(`--- Missing image file for "${slug}": ${imagePath}`);
                failed++;
                continue;
            }

            try {
                const buffer = fs.readFileSync(imagePath);
                const imageUrl = await uploadFileToS3(
                    {
                        buffer,
                        mimetype: "image/jpeg",
                        originalname: variant.imageFile,
                    } as Express.Multer.File,
                    "catalog-products"
                );

                const tags = [
                    `group:${family.familyId}`,
                    `category:${family.category}`,
                    ...(variant.badge ? [`zip:${variant.badge === "With Zip" ? "with" : "without"}`] : []),
                ];

                await Product.create({
                    title: `${family.name} --- ${variant.name}`,
                    slug,
                    shortDescription: family.tagline,
                    description: family.description,
                    color: variant.colorLabel,
                    material: "Cotton Canvas",
                    productCategory: ProductCategory["Tote Bag"],
                    tags,
                    price: variant.price,
                    discountPrice: variant.price,
                    gstPercentage: DEFAULT_GST_PERCENTAGE,
                    stock: DEFAULT_STOCK,
                    sku,
                    weight: DEFAULT_WEIGHT_KG,
                    dimensions: DEFAULT_DIMENSIONS_CM,
                    thumbnail: imageUrl,
                    images: [imageUrl],
                    isFeatured: Boolean(family.isBestSeller),
                    isPublished: true,
                });

                created++;
                console.log(`--- ${slug}`);
            } catch (err: any) {
                failed++;
                console.error(`--- Failed to seed "${slug}": ${err.message}`);
            }
        }
    }

    console.log(`\nDone. Created ${created}, skipped ${skipped} (already existed), failed ${failed}.`);
    process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
    console.error("Seed script crashed:", err);
    process.exit(1);
});
