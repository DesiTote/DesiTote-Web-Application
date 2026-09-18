// Helpers for the admin product PATCH endpoint, which validates via
// productZodSchema and expects the FULL product payload as multipart form
// data on every update — there's no partial-update route, so a "just change
// the stock" edit still has to resend every required field.

export interface BackendFullProduct {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  color: string;
  material: string;
  productCategory: string;
  tags: string[];
  price: number;
  discountPrice: number;
  costPrice: number;
  gstPercentage: number;
  stock: number;
  sku: string;
  weight: number;
  dimensions: { length: number; breadth: number; height: number };
  thumbnail: string;
  images: string[];
  isFeatured: boolean;
  isPublished: boolean;
  status: string;
}

export function buildProductFormData(
  product: BackendFullProduct,
  overrides: Partial<Pick<BackendFullProduct, 'stock' | 'price' | 'discountPrice' | 'isPublished' | 'status'>>
): FormData {
  const merged = { ...product, ...overrides };
  const fd = new FormData();

  fd.append('title', merged.title);
  fd.append('slug', merged.slug);
  fd.append('shortDescription', merged.shortDescription);
  fd.append('description', merged.description);
  fd.append('color', merged.color);
  fd.append('material', merged.material);
  fd.append('productCategory', merged.productCategory);
  fd.append('tags', JSON.stringify(merged.tags || []));
  fd.append('price', String(merged.price));
  fd.append('costPrice', String(merged.costPrice ?? 0));
  fd.append('discountPrice', String(merged.discountPrice));
  fd.append('gstPercentage', String(merged.gstPercentage));
  fd.append('weight', String(merged.weight));
  fd.append('dimensions', JSON.stringify(merged.dimensions));
  fd.append('stock', String(merged.stock));
  fd.append('sku', merged.sku);
  fd.append('thumbnailIndex', String(Math.max(0, merged.images.indexOf(merged.thumbnail))));
  // z.coerce.boolean() treats any non-empty string as true — an empty string is the only way to send `false`.
  fd.append('isFeatured', merged.isFeatured ? 'true' : '');
  fd.append('isPublished', merged.isPublished ? 'true' : '');
  fd.append('status', merged.status);
  for (const url of merged.images) fd.append('existingImages', url);

  return fd;
}

/**
 * Turns the handful of fields an admin actually types when adding a tote into
 * the full multipart payload the create endpoint validates. Everything the
 * shop owner should not have to think about is defaulted here to match the
 * existing catalogue: Cotton Canvas, 18% GST, 0.15kg, the standard tote
 * dimensions. The slug and a starting SKU are derived from the title.
 *
 * Only one price is collected. Every product in the catalogue has
 * price === discountPrice (no strike-through discounts are in use), so the
 * two are set together and the MRP/selling split stays invisible to the user.
 */
export interface NewProductInput {
  title: string;
  shortDescription: string;
  description: string;
  color: string;
  price: number;
  stock: number;
  sku: string;
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function defaultSkuFor(title: string): string {
  const base = slugifyTitle(title).replace(/-/g, '').toUpperCase().slice(0, 12) || 'TOTE';
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}-${suffix}`;
}

export function buildCreateProductFormData(input: NewProductInput, files: File[]): FormData {
  const fd = new FormData();
  fd.append('title', input.title);
  fd.append('slug', slugifyTitle(input.title));
  fd.append('shortDescription', input.shortDescription);
  fd.append('description', input.description);
  fd.append('color', input.color);
  fd.append('material', 'Cotton Canvas');
  fd.append('productCategory', 'Tote Bag');
  fd.append('tags', JSON.stringify([]));
  fd.append('price', String(input.price));
  fd.append('costPrice', '0');
  fd.append('discountPrice', String(input.price)); // no discount — equal is allowed
  fd.append('gstPercentage', '18');
  fd.append('weight', '0.15');
  fd.append('dimensions', JSON.stringify({ length: 35, breadth: 40, height: 1 }));
  fd.append('stock', String(input.stock));
  fd.append('sku', input.sku);
  fd.append('thumbnailIndex', '0');
  // z.coerce.boolean() reads any non-empty string as true; '' is the only false.
  fd.append('isFeatured', '');
  fd.append('isPublished', 'true');
  fd.append('status', 'ACTIVE');
  for (const f of files) fd.append('images', f);
  return fd;
}
