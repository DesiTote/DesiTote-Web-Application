import { Review } from '../types';

// The PRODUCTS catalog that used to live here now lives in MongoDB (see
// backend/src/scripts/seedData.ts for the migration source) and is fetched
// live via ProductsContext.
//
// The 65 product-image imports that fed it were left behind when it moved.
// They were dead code, but Vite emits an asset for every image import it
// walks, so they were still being copied into the production build — about
// 1.3 MB of jpgs shipped on every deploy that no page ever requested. The
// image files themselves stay on disk: seedProducts.ts uploads them to S3.

// No reviews are seeded — real customer reviews will appear here as they
// come in through the "Write a Review" flow on the site.
export const REVIEWS: Review[] = [];
