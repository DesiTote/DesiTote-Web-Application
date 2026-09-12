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
