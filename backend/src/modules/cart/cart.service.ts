import { ApiError } from "../../utils/ApiError.js";
import Cart from "./cart.model.js";
import { validateObjectId } from "../../utils/mongoIDValidator.js";
import { computeDiscountPercentage } from "../../utils/calculateDiscount.js";
import Product from "../product/product.model.js";
import { applyOffers, checkFreeGiftAdd, groupOf, offersNow } from "../offers/applyOffers.js";
import { lineKey, toOfferLines } from "./cartLines.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

const MAX_QUANTITY = 15;
const MAX_CART_ITEMS = 10;

const PRODUCT_POPULATE_FIELDS = "price discountPrice thumbnail sku title slug color stock tags";

function assertValidQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    throw new ApiError(
      400,
      `Quantity must be a whole number between 1 and ${MAX_QUANTITY}. For bulk orders contact us directly.`
    );
  }
}

// Finds a cart line by product and kind. Carts saved before free bags have no flag, so "paid" means "not true".
const lineMatch = (productId: string, isFreeGift: boolean) => ({
  productId,
  isFreeGift: isFreeGift ? true : { $ne: true },
});

// Free bags are capped by the whole cart, so price every line, not just the one being added.
const assertFreeGiftAllowed = async (
  items: { productId: { toString(): string }; quantity: number; isFreeGift?: boolean }[],
  productId: string,
  quantity: number
) => {
  const lineItems = items.map((i) => ({ productId: i.productId.toString(), quantity: i.quantity, isFreeGift: i.isFreeGift }));
  const ids = [...new Set([...lineItems.map((i) => i.productId), productId])];
  const products = await Product.find({ _id: { $in: ids } }).select("price discountPrice tags").lean();
  const productsById = new Map(products.map((p) => [p._id.toString(), p]));

  const candidate = productsById.get(productId);
  if (!candidate) throw new ApiError(404, "Product not found");

  const message = checkFreeGiftAdd(
    toOfferLines(lineItems, productsById),
    { group: groupOf(candidate.tags), quantity },
    offersNow()
  );
  if (message) throw new ApiError(400, message);
};

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
//
// It also prices the cart (each item's unitPrice, the cart's offer) and takes
// out any free bag the cart no longer earns.
const readPopulatedCart = async (userId: string) => {
  const cart = await Cart.findOne({ userId })
    .populate({
      path: "items.productId",
      select: PRODUCT_POPULATE_FIELDS,
    })
    .lean();

  // No cart document yet — hand back an empty one rather than throwing.
  if (!cart) return { userId, items: [], offer: null, offerSaving: 0, freeGiftsRemoved: 0 };

  // A product deleted since it was added populates as null; it is shown as-is but never priced.
  const items: any[] = cart.items;
  const live = items.filter((i) => i.productId);
  const idOf = (i: any): string => String(i.productId._id);
  const result = applyOffers(
    toOfferLines(
      live.map((i) => ({ productId: idOf(i), quantity: i.quantity, isFreeGift: i.isFreeGift === true })),
      new Map(live.map((i) => [idOf(i), i.productId]))
    ),
    // The first-order 10% is shown at checkout, not in the cart.
    { now: offersNow(), isFirstOrder: false }
  );

  // Free bags the cart no longer earns (a paid tote was removed, the offer ended) are taken out for good.
  let freeGiftsRemoved = 0;
  for (const removed of result.removedFreeLines) {
    const item = live.find((i) => i.isFreeGift === true && idOf(i) === removed.productId);
    const left = item.quantity - removed.quantity;
    await Cart.updateOne(
      { userId, items: { $elemMatch: lineMatch(removed.productId, true) } },
      left > 0 ? { $set: { "items.$.quantity": left } } : { $pull: { items: lineMatch(removed.productId, true) } }
    );
    item.quantity = left;
    freeGiftsRemoved += removed.quantity;
  }

  const unitPrices = new Map(result.lines.map((l) => [lineKey(l.productId, l.isFreeGift), l.unitPrice]));
  cart.items = items
    .filter((i) => i.quantity > 0)
    .map((i) => {
      const isFreeGift = i.isFreeGift === true;
      const unitPrice = i.productId ? unitPrices.get(lineKey(idOf(i), isFreeGift)) ?? 0 : 0;
      return { ...i, isFreeGift, unitPrice };
    });

  return {
    ...formatCartItems(cart),
    // An empty or no-saving cart must not advertise an offer.
    offer: result.offerSaving > 0 ? result.offer : null,
    offerSaving: result.offerSaving,
    freeGiftsRemoved,
  };
};

// ─── Services ───────────────────────────────────────────────────────────────

// ➕ ADD TO CART (Fixed Quantity Overflow & Pre-validation)
export const addToCartService = async (
  userId: string,
  productId: string,
  quantity: number,
  priceAtAdd?: number,
  isFreeGift = false
) => {
  validateObjectId(userId, "userId");
  validateObjectId(productId, "productId");
  assertValidQuantity(quantity);

  // Fetch initial cart state as a lean plain object
  let cartDoc = await Cart.findOne({ userId }).lean();

  if (isFreeGift) await assertFreeGiftAllowed(cartDoc?.items ?? [], productId, quantity);

  if (cartDoc) {
    const existingItem = cartDoc.items.find(
      (item) => item.productId.toString() === productId && (item.isFreeGift === true) === isFreeGift
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
        { userId, items: { $elemMatch: lineMatch(productId, isFreeGift) } },
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
              isFreeGift,
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
          isFreeGift,
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
  productId: string,
  isFreeGift = false
) => {
  validateObjectId(userId, "userId");
  validateObjectId(productId, "productId");

  const cart = await Cart.findOneAndUpdate(
    { userId },
    { $pull: { items: lineMatch(productId, isFreeGift) } },
    { new: true }
  ).lean();

  if (!cart) throw new ApiError(404, "Cart not found");

  return readPopulatedCart(userId);
};

// 🔄 UPDATE QUANTITY
export const updateCartItemService = async (
  userId: string,
  productId: string,
  quantity: number,
  isFreeGift = false
) => {
  validateObjectId(userId, "userId");
  validateObjectId(productId, "productId");

  if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_QUANTITY) {
    throw new ApiError(
      400,
      `Quantity must be a whole number between 0 and ${MAX_QUANTITY}.`
    );
  }

  // Only a raise needs the allowance check; lowering a free line is always fine.
  if (isFreeGift && quantity > 0) {
    const current = await Cart.findOne({ userId }).lean();
    const line = current?.items.find((i) => i.productId.toString() === productId && i.isFreeGift === true);
    if (!current || !line) throw new ApiError(404, "Item or Cart not found");
    if (quantity > line.quantity) await assertFreeGiftAllowed(current.items, productId, quantity - line.quantity);
  }

  let cart;

  if (quantity === 0) {
    cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: lineMatch(productId, isFreeGift) } },
      { new: true }
    ).lean();
  } else {
    cart = await Cart.findOneAndUpdate(
      { userId, items: { $elemMatch: lineMatch(productId, isFreeGift) } },
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
