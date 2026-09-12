// Shapes returned by the backend API — only the fields the frontend actually reads.

export interface BackendUser {
  fullName: string;
  emailVerified: boolean;
  role: 'CUSTOMER' | 'ADMIN';
  email: string;
}

export interface BackendProductListItem {
  _id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  thumbnail: string;
  price: number;
  discountPrice: number;
  discountPercentage: number;
  productCategory: string;
  tags: string[];
  color: string;
  stock: number;
  isFeatured: boolean;
  createdAt: string;
}

export interface BackendProductsPage {
  products: BackendProductListItem[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface BackendCartProduct {
  _id: string;
  price: number;
  discountPrice: number;
  discountPercentage: number;
  thumbnail: string;
  sku: string;
  title: string;
  slug: string;
  color: string;
  stock: number;
}

export interface BackendCartItem {
  productId: BackendCartProduct;
  quantity: number;
}

export interface BackendCart {
  userId?: string;
  items: BackendCartItem[];
}

export interface BackendAddress {
  _id: string;
  fullName: string;
  mobileNumber: string;
  pincode: string;
  district: string;
  state: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  country?: string;
  isDefault: boolean;
}

export interface BackendShippingQuote {
  courierId: number;
  courierName: string;
  charge: number;
  chargeableWeight: number;
  calculatedAt: number;
}

export interface BackendCheckoutSessionItem {
  productId: string;
  quantity: number;
  priceAtCheckout: number;
  originalPrice: number;
  title: string;
  thumbnail: string;
}

export interface BackendCheckoutSession {
  userId: string;
  source: 'CART' | 'BUY_NOW';
  status: string;
  items: BackendCheckoutSessionItem[];
  subtotal: number;
  discount: number;
  gstAmount: number;
  deliveryAddress: BackendAddress | null;
  paymentMethod: 'COD' | 'ONLINE' | null;
  shippingOptions: { COD: BackendShippingQuote | null; ONLINE: BackendShippingQuote | null } | null;
  shippingError: string | null;
  total: number | null;
}

export interface BackendOrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: 'COD' | 'ONLINE';
  total: number;
  createdAt: string;
  itemCount: number;
  firstItemName: string | null;
  firstItemImage: string | null;
  awb: string | null;
  courierName: string | null;
  canCancel: boolean;
}

export interface BackendOrderItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  image: string;
  price: number;
}

export interface BackendOrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  paymentMethod: 'COD' | 'ONLINE';
  subtotal: number;
  discount: number;
  gstAmount: number;
  shippingCharges: number;
  total: number;
  createdAt: string;
  items: BackendOrderItem[];
  shippingAddress: BackendAddress;
  tracking: {
    awb: string;
    courierName: string | null;
    estimatedDelivery: string | null;
    lastUpdatedAt: string | null;
    externalTrackingUrl: string;
    timeline: { date: string; activity: string; location: string | null }[];
  } | null;
}

export interface RazorpayOrderResponse {
  orderId: string;
  razorpayOrderId: string;
  keyId: string;
  amount: number;
  currency: string;
}

export interface BackendAdminOrderRow {
  _id: string;
  orderNumber: string;
  customerName: string;
  billingEmail: string;
  mobileNumber: string;
  createdAt: string;
  itemsCount: number;
  grandTotal: number;
  paymentMethod: 'COD' | 'ONLINE';
  paymentStatus: string;
  status: string;
  statusBucket: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | null;
  awb?: string;
  courierName?: string;
  shiprocketStatus?: string;
}

export interface BackendAdminOrderListResult {
  orders: BackendAdminOrderRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface BackendAdminProduct {
  _id: string;
  title: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  price: number;
  status: string;
  productCategory: string;
  thumbnail: string;
}

export interface BackendAdminProductListResult {
  products: BackendAdminProduct[];
  pagination: { totalItems: number; totalPages: number; currentPage: number; limit: number };
}

export interface BackendDashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
}
