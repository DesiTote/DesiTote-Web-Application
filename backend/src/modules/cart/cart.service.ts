import { ApiError } from "../../utils/ApiError.js";
import Cart from "./cart.model.js";
import { validateObjectId } from "../../utils/mongoIDValidator.js";
import { computeDiscountPercentage } from "../../utils/calculateDiscount.js";
import Product from "../product/product.model.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

const MAX_QUANTITY = 15;
const MAX_CART_ITEMS = 10;

const PRODUCT_POPULATE_FIELDS = "price discountPrice thumbnail sku title slug color stock";

function assertValidQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    throw new ApiError(
      400,
      `Quantity must be a whole number between 1 and ${MAX_QUANTITY}. For bulk orders contact us directly.`
    );
  }
}

// Reusable single product cleaner helper
const fetchAndFormatInteractedProduct = async (productId: string) => {
  const productDetails = await Product
    .findById(productId)
    .select(PRODUCT_POPULATE_FIELDS)
    .lean();

  if (!productDetails) return null;

  return {
    ...productDetails,
    discountPercentage: computeDiscountPercentage(productDetails.price, productDetails.discountPrice)
  };
};

// Helper used only by GET CART to format a fully populated array cleanly
const formatCartItems = (cart: any) => {
  if (!cart || !cart.items) return cart;

  cart.items = cart.items.map((item: any) => {
    const p = item.productId;
    if (p && typeof p === "object" && "price" in p) {
      return {
        ...item,
        productId: {
          ...p,
          discountPercentage: computeDiscountPercentage(p.price, p.discountPrice),
        },
      };
    }
    return item;
  });
  return cart;
};

// Re-reads the cart with its products populated.
//
// Every mutating service returns this, so add / update / remove hand back the
// same shape as GET /cart. They used to return the raw result of the write,
// whose items carry productId as a bare id string — so a client that reads the
// title, price and image off each cart item saw nothing it could render and
// showed an empty basket right after "added to cart".
const readPopulatedCart = async (userId: string) => {
  const cart = await Cart.findOne({ userId })
    .populate({
      path: "items.productId",
      select: PRODUCT_POPULATE_FIELDS,
    })
    .lean();

  // No cart document yet — hand back an empty one rather than throwing.
  if (!cart) return { userId, items: [] };

  return formatCartItems(cart);
};

// ─── Services ───────────────────────────────────────────────────────────────

// ➕ ADD TO CART (Fixed Quantity Overflow & Pre-validation)
export const addToCartService = async (
  userId: string,
  productId: string,
  quantity: number,
  priceAtAdd?: number
) => {
  validateObjectId(userId, "userId");
  validateObjectId(productId, "productId");
  assertValidQuantity(quantity);

  // Fetch initial cart state as a lean plain object
  let cartDoc = await Cart.findOne({ userId }).lean();

  if (cartDoc) {
    const existingItem = cartDoc.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      // 1. Prevent quantity overflow beyond MAX_QUANTITY
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > MAX_QUANTITY) {
        throw new ApiError(
          400,
          `Cannot add ${quantity} more. Maximum allowed quantity per item is ${MAX_QUANTITY} (you already have ${existingItem.quantity}).`
        );
      }

      // Update existing item quantity
      cartDoc = await Cart.findOneAndUpdate(
        { userId, "items.productId": productId },
        { $set: { "items.$.quantity": newQuantity } },
        { new: true, runValidators: true }
      ).lean();
    } else {
      // 2. Enforce max distinct items limit BEFORE pushing
      if (cartDoc.items.length >= MAX_CART_ITEMS) {
        throw new ApiError(400, `Cart cannot exceed ${MAX_CART_ITEMS} distinct items`);
      }

      // Push new item
      cartDoc = await Cart.findOneAndUpdate(
        { userId },
        {
          $push: {
            items: {
              productId,
              quantity,
              ...(priceAtAdd !== undefined && { priceAtAdd }),
            },
          },
        },
        { new: true, runValidators: true }
      ).lean();
    }
  } else {
    // 3. Create brand new cart if none exists
    const newCart = await Cart.create({
      userId,
      items: [
        {
          productId,
          quantity,
          ...(priceAtAdd !== undefined && { priceAtAdd }),
        },
      ],
    });
    cartDoc = newCart.toObject();
  }

  const interactedProduct = await fetchAndFormatInteractedProduct(productId);

  return { ...(await readPopulatedCart(userId)), interactedProduct };
};

// ❌ REMOVE ITEM
export const removeFromCartService = async (
  userId: string,
  productId: string
) => {
  validateObjectId(userId, "userId");
  validateObjectId(productId, "productId");

  const cart = await Cart.findOneAndUpdate(
    { userId },
    { $pull: { items: { productId } } },
    { new: true }
  ).lean();

  if (!cart) throw new ApiError(404, "Cart not found");

  return readPopulatedCart(userId);
};

// 🔄 UPDATE QUANTITY
export const updateCartItemService = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  validateObjectId(userId, "userId");
  validateObjectId(productId, "productId");

  if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_QUANTITY) {
    throw new ApiError(
      400,
      `Quantity must be a whole number between 0 and ${MAX_QUANTITY}.`
    );
  }

  let cart;

  if (quantity === 0) {
    cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true }
    ).lean();
  } else {
    cart = await Cart.findOneAndUpdate(
      { userId, "items.productId": productId },
      { $set: { "items.$.quantity": quantity } },
      { new: true, runValidators: true }
    ).lean();
  }

  if (!cart) throw new ApiError(404, "Item or Cart not found");

  const interactedProduct = quantity === 0 ? null : await fetchAndFormatInteractedProduct(productId);

  return { ...(await readPopulatedCart(userId)), interactedProduct };
};

// 🧹 CLEAR CART
export const clearCartService = async (userId: string) => {
  validateObjectId(userId, "userId");

  const cart = await Cart.findOneAndUpdate(
    { userId },
    { $set: { items: [] } },
    { new: true }
  ).lean();

  if (!cart) throw new ApiError(404, "Cart not found");

  return readPopulatedCart(userId);
};

// 📦 GET CART (Returns graceful empty cart on 404)
export const getCartService = async (userId: string) => {
  validateObjectId(userId, "userId");

  return readPopulatedCart(userId);
};