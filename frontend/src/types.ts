export interface ProductVariant {
  /** The backend's real MongoDB product id — this is what cart/checkout calls use. */
  id: string;
  slug: string;
  name: string;
  colorHex: string;
  image: string;
  price: number;
  badge?: string;
  stock: number;
  /** Groups variants into a color swatch (e.g. "Natural", "Black"). Variants that
   *  share a colorLabel are the same color/photo with a different zip option. */
  colorLabel?: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  price: number; // display/starting price (cheapest variant's price)
  category: 'plain' | 'printed';
  description: string;
  features: string[];
  size: string;
  fabric: string;
  variants: ProductVariant[];
  isBestSeller?: boolean;
  isNewDrop?: boolean;
}

export interface CartItem {
  id: string; // unique cart entry id
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  colorHex: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Review {
  id: string;
  author: string;
  city: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  toteModel: string;
  avatarUrl?: string;
}
