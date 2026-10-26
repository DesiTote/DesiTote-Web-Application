# Buy 2 Get 1 and One-Offer Checkout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Customers pick a free picture-only tote for every 2 they buy (1-11 Nov), only one offer ever applies (Buy 2 Get 1, the 25% sale, or first-order 10%), and every price is decided once on the server.

**Architecture:** A pure `applyOffers` function in a new backend `offers` module prices every cart and checkout line. The cart stores free bags as lines flagged `isFreeGift`; the cart API, checkout session, order, Shiprocket payload, emails and returns all read the result. The frontend shows server prices and adds a free-bag picker to the cart drawer.

**Tech Stack:** Express 5 + TypeScript + Mongoose (backend), React 19 + Vite + Tailwind (frontend), `node:test` via `tsx --test` for unit tests, Playwright (headless Edge) for browser checks.

**Spec:** `docs/superpowers/specs/2026-10-26-buy-2-get-1-offers-design.md`

## Global Constraints

- Sale window comes only from `backend/src/config/sale.ts` (`SALE.startsAt` 2026-11-01T00:00+05:30, `SALE.endsAt` 2026-11-12T00:00+05:30, `SALE.enabled`).
- 25% price is `Math.round(price * (100 - SALE.percent) / 100)`, identical to `salePrice` today.
- First-order discount is `Math.round(total * 0.10)`; "first order" means no earlier order outside `pending_payment`, `payment_failed`, `cancelled`, `failed` (PR #5's query).
- Free bags allowed = `Math.floor(paid quantity / 2)`.
- Free-bag groups are exactly the 23 slugs in the spec, held in `backend/src/config/offers.ts` and mirrored in `frontend/src/lib/offers.ts`.
- A free line is never charged. A free line that stops qualifying is removed and reported, never repriced.
- Customer-facing copy: "FREE · not returnable", "Choose your free bag", "Buy 2 Get 1 applied instead of 25% off", "10% off your first order, taken off at checkout". No em or en dashes in copy.
- Frontend `isSaleOn()` keeps showing the sale early on `*.vercel.app`, `localhost` and `127.0.0.1`; the backend has no such switch except `OFFERS_NOW` (Task 1), honoured only when `NODE_ENV !== "production"`.

## Review Focus

1. The same tote in the cart as a paid line and as a free line: removing or changing one must not touch the other. (Task 2 test `line key separates paid and free copies of one tote`.)
2. A customer raises a free line's quantity in the drawer past the allowance. (Task 2 test `raising a free line past the allowance is refused`.)
3. The sale ends while free bags sit in a cart: the next cart read drops them and says so. (Task 1 test `outside the sale every free line is removed as offer_ended`; Task 2 persists the trim.)
4. A design added later (not in the list) is offered as a free bag through a crafted request. (Task 1 test `ineligible group is removed as not_eligible`; Task 2 `free bag from an unlisted design is refused`.)
5. Buy Now of 2 of one tote during the sale: no picker exists there, the 25% must apply. (Task 1 test `paid lines only during the sale get 25%`.)

---

### Task 1: Offers core (backend)

**Files:**
- Modify: `backend/package.json` (add `"test": "tsx --test \"src/**/*.test.ts\""`)
- Create: `backend/src/config/offers.ts`
- Create: `backend/src/modules/offers/applyOffers.ts`
- Test: `backend/src/modules/offers/applyOffers.test.ts`

**Interfaces:**
- Produces:
  - `FREE_GIFT_GROUPS: readonly string[]` (the 23 slugs) and `isOfferWindow(now: Date): boolean` in `config/offers.ts` (uses `SALE`).
  - `groupOf(tags?: string[]): string | null`: value after `group:`.
  - `type OfferCode = "buy2get1" | "diwali25" | "firstOrder10"`
  - `interface OfferLineInput { productId: string; group: string | null; quantity: number; price: number; isFreeGift: boolean }` (`price` = `discountPrice ?? price`)
  - `interface PricedLine extends OfferLineInput { unitPrice: number }`
  - `interface RemovedFreeLine { productId: string; quantity: number; reason: "not_allowed" | "not_eligible" | "offer_ended" }`
  - `interface OfferResult { lines: PricedLine[]; offer: OfferCode | null; offerSaving: number; orderLevelDiscount: number; removedFreeLines: RemovedFreeLine[] }`
  - `applyOffers(lines: OfferLineInput[], ctx: { now: Date; isFirstOrder: boolean }): OfferResult`
  - `freeGiftAllowance(lines: OfferLineInput[]): number`
  - `checkFreeGiftAdd(lines: OfferLineInput[], add: { group: string | null; quantity: number }, now: Date): string | null` (error message or null)
  - `offersNow(): Date`: `new Date(process.env.OFFERS_NOW)` when set and `NODE_ENV !== "production"`, else `new Date()`.

- [ ] **Step 1: Add the test script and write the failing tests** in `applyOffers.test.ts`, with `const NOV5 = new Date("2026-11-05T12:00:00+05:30")`, `NOV15 = new Date("2026-11-15T12:00:00+05:30")`, a paid tote at ₹349 and a free design (`group: "desi-print-elephant"`) at ₹299:
  - `2 paid + 1 free during the sale is buy2get1` → `offer === "buy2get1"`, paid `unitPrice` 349, free `unitPrice` 0, `offerSaving === 299`, `orderLevelDiscount === 0`.
  - `paid lines only during the sale get 25%` → three ₹349 lines priced 262 each, `offer === "diwali25"`, `offerSaving === 261`.
  - `4 paid + 3 free keeps 2 free and removes 1 as not_allowed` → removed `[{ quantity: 1, reason: "not_allowed" }]`, kept free quantity 2. Free lines are kept in input order.
  - `ineligible group is removed as not_eligible` → free line with `group: "desi-print-namaste"` removed with `not_eligible`; with no free line left, `offer === "diwali25"`.
  - `outside the sale every free line is removed as offer_ended` → on NOV15.
  - `first order outside the sale gets 10%` → NOV15, `isFirstOrder: true`, lines 349 + 349: `offer === "firstOrder10"`, `orderLevelDiscount === 70`, unit prices unchanged.
  - `first order during the sale gets 25%, not 10%` → NOV5, `isFirstOrder: true`, no free lines: `diwali25`.
  - `sale edges`: `2026-11-01T00:00:00+05:30` is in the window; `2026-11-12T00:00:00+05:30` is not.
  - `checkFreeGiftAdd` cases: no paid lines → `"Add 2 totes to get a free bag"`; unlisted design → `"Free bags are only from the picture designs"`; NOV15 → `"Buy 2 Get 1 ended on 11 November"`; 2 paid + 1 free already → `"Add 2 more totes for another free bag"`; 2 paid, none free → `null`.

- [ ] **Step 2: Run `npm test` in `backend/` and confirm the new tests fail** because `./applyOffers` does not exist (and the runner reports more than 0 tests).

- [ ] **Step 3: Implement `config/offers.ts` and `applyOffers.ts`** to the interfaces above. `offerSaving` for `buy2get1` and `diwali25` is `Σ (price - unitPrice) × quantity`; for `firstOrder10` it equals `orderLevelDiscount`.

- [ ] **Step 4: Run `npm test` and confirm every test passes.**

- [ ] **Step 5: Commit** `feat(offers): one pure function decides every offer and price`.

### Task 2: Cart holds free bags (backend)

**Files:**
- Modify: `backend/src/modules/cart/cart.model.ts` (add `isFreeGift: { type: Boolean, default: false }` to `cartItemSchema`)
- Modify: `backend/src/modules/cart/cart.service.ts`
- Modify: `backend/src/modules/cart/cart.controller.ts`
- Create: `backend/src/modules/cart/cartLines.ts` and test `cartLines.test.ts`

**Interfaces:**
- Consumes: Task 1 `applyOffers`, `checkFreeGiftAdd`, `groupOf`, `offersNow`.
- Produces:
  - `lineKey(productId: string, isFreeGift: boolean): string` and `toOfferLines(cartItems, products): OfferLineInput[]` in `cartLines.ts`.
  - Service signatures: `addToCartService(userId, productId, quantity, priceAtAdd?, isFreeGift = false)`, `updateCartItemService(userId, productId, quantity, isFreeGift = false)`, `removeFromCartService(userId, productId, isFreeGift = false)`.
  - Cart response (all routes): each item gains `isFreeGift: boolean` and `unitPrice: number`; the cart gains `offer: OfferCode | null`, `offerSaving: number`, `freeGiftsRemoved: number`.
  - HTTP: `POST /api/cart/add` body accepts `isFreeGift`; `PATCH /api/cart/update-quantity/:productId?free=1`; `DELETE /api/cart/remove-item/:productId?free=1`.

- [ ] **Step 1: Write failing tests** in `cartLines.test.ts`: `line key separates paid and free copies of one tote`; `raising a free line past the allowance is refused` (use `checkFreeGiftAdd` with the line's extra quantity); `free bag from an unlisted design is refused`; `toOfferLines reads group from tags and price from discountPrice`.
- [ ] **Step 2: Run `npm test`; confirm they fail** on the missing module.
- [ ] **Step 3: Implement.** All item matching in the service uses both `productId` and `isFreeGift` (`$elemMatch` for positional updates, `$pull: { items: { productId, isFreeGift } }`). Add `tags` to `PRODUCT_POPULATE_FIELDS`. `addToCartService` with `isFreeGift` refuses with `ApiError(400, message)` when `checkFreeGiftAdd` returns a message. `updateCartItemService` on a free line runs the same check for the increase. `readPopulatedCart` runs `applyOffers(lines, { now: offersNow(), isFirstOrder: false })`, removes every `removedFreeLines` entry from the cart document, and returns `freeGiftsRemoved` as the removed quantity. The controller reads `isFreeGift` from the body for add and `req.query.free === "1"` for update and remove.
- [ ] **Step 4: Run `npm test` and `npx tsc --noEmit -p .`; both pass.**
- [ ] **Step 5: Commit** `feat(cart): free bags as their own cart lines, priced by applyOffers`.

### Task 3: Checkout session uses one offer (backend)

**Files:**
- Modify: `backend/src/modules/checkout/checkout.service.ts` (STEP 1 to STEP 5 of `createCheckoutSessionService`)
- Modify: `backend/src/types/checkout.ts`

**Interfaces:**
- Consumes: Task 1 `applyOffers`, `offersNow`; Task 2 `toOfferLines`.
- Produces: `CheckoutItem.isFreeGift: boolean`; `CheckoutSession.offer: OfferCode | null`, `offerSaving: number`, `removedFreeLines: RemovedFreeLine[]`. `subtotal`, `discount`, `total` keep their meaning.

- [ ] **Step 1: Implement.** Cart checkouts carry each cart line's `isFreeGift` and always include the cart's free lines. Select `tags` with the products. First-order: PR #5's `Order.exists({ userId, status: { $nin: NOT_A_REAL_ORDER } })`. `priceAtCheckout` = the line's `unitPrice`; `subtotal` = `Σ originalPrice × quantity`; `discount` = `subtotal − Σ unitPrice × quantity + orderLevelDiscount`. Free lines go through the existing stock check. Remove the `salePrice` import.
- [ ] **Step 2: Verify** `npm test` (Task 1 tests still pass) and `npx tsc --noEmit -p .` pass.
- [ ] **Step 3: Commit** `feat(checkout): price sessions through applyOffers, first-order 10% included`.

### Task 4: Orders, emails and Shiprocket (backend)

**Files:**
- Modify: `backend/src/modules/order/order.model.ts` (`IOrderItem.isFreeGift: boolean` default false; order `offer: { code: String | null, saving: Number }`, `finalSale: Boolean` default false)
- Modify: `backend/src/modules/order/order.service.ts` (both order-creation paths near lines 88 and 495, `getOrderService` mapping, admin alert call near line 706, `buildShiprocketPayload`)
- Modify: `backend/src/email/templates/order-admin-alert.ts`, `backend/src/email/templates/order-confirmed.ts`
- Modify: the admin order mapping in `backend/src/modules/order/order.admin.service.ts` (add `isFreeGift`, `offer`, `finalSale`)
- Test: `backend/src/modules/order/shiprocketPayload.test.ts`

**Interfaces:**
- Consumes: Task 3 session fields.
- Produces: `export function buildShiprocketPayload(order)`; customer and admin order JSON gain `items[].isFreeGift`, `offer`, `finalSale`.

- [ ] **Step 1: Write failing tests** in `shiprocketPayload.test.ts` with plain order objects: `sale order: sub_total − total_discount equals what the customer paid for totes` (two lines, originalPrice 349, unitPrice 262); `buy2get1 order lists the free bag at its normal price and discounts it` (free line `selling_price` 299, `total_discount` includes 299); `every selling_price is the item's originalPrice`.
- [ ] **Step 2: Run; confirm failure** (function not exported, then wrong amounts).
- [ ] **Step 3: Implement.** Order creation copies `isFreeGift`, sets `offer: { code: session.offer, saving: session.offerSaving }` and `finalSale: session.offer === "buy2get1"`. Shiprocket: `selling_price` = `originalPrice ?? unitPrice`, `sub_total` = `Σ selling_price × units`, `total_discount` = `order.discount`. Admin alert items take `isFreeGift` and show "FREE (not returnable)" in place of the price. `orderConfirmedEmailTemplate` takes `finalSale?: boolean` and, when true, adds: "This order used Buy 2 Get 1, so it is final sale: items can't be returned unless they arrive damaged or wrong, and the free bag can't be returned."
- [ ] **Step 4: Run `npm test` and `npx tsc --noEmit -p .`; pass.**
- [ ] **Step 5: Commit** `feat(orders): record free bags and the offer; send Shiprocket the real amounts`.

### Task 5: Final-sale returns (backend)

**Files:**
- Modify: `backend/src/modules/return/return.service.ts` (`getReturnableItems`, `createReturnRequest`)
- Create: `backend/src/modules/return/returnRules.ts`; test `returnRules.test.ts`

**Interfaces:**
- Produces: `canReturnLine(item: { isFreeGift?: boolean }): boolean`; `reasonAllowed(order: { finalSale?: boolean }, reason: ReturnReason): boolean` (final sale allows only "Defective or damaged product" and "Wrong item received").

- [ ] **Step 1: Write failing tests**: free line never returnable; normal order allows "Changed my mind"; final-sale order refuses "Changed my mind" and allows "Wrong item received".
- [ ] **Step 2: Run; confirm failure.**
- [ ] **Step 3: Implement** the helpers; `getReturnableItems` filters out lines where `canReturnLine` is false; `createReturnRequest` throws `ApiError(400, "Buy 2 Get 1 orders can only be returned if an item arrived damaged or wrong")` when `reasonAllowed` is false, and `ApiError(400, "The free bag can't be returned")` for a free line.
- [ ] **Step 4: Run `npm test` and `npx tsc --noEmit -p .`; pass.**
- [ ] **Step 5: Commit** `feat(returns): free bags and Buy 2 Get 1 orders are final sale`.

### Task 6: Cart drawer picker and server prices (frontend)

**Files:**
- Create: `frontend/src/lib/offers.ts`; test `frontend/src/lib/offers.test.ts`
- Modify: `frontend/src/lib/apiTypes.ts` (`BackendCartItem.isFreeGift`, `unitPrice`; `BackendCart.offer`, `offerSaving`, `freeGiftsRemoved`; `BackendCartProduct.tags?`)
- Modify: `frontend/src/context/CartContext.tsx`
- Modify: `frontend/src/components/CartDrawer.tsx`

**Interfaces:**
- Consumes: Task 2 cart response and routes.
- Produces:
  - `FREE_GIFT_GROUPS` (same 23 slugs) and `freeBagChoices(products: Product[]): { productId: string; name: string; colorLabel: string; image: string }[]`: one entry per eligible design and colour (first variant of each colour group from `getColorGroups`), in catalogue order.
  - `DisplayCartItem.isFreeGift: boolean`; `price` is the server `unitPrice`.
  - Cart context adds `offer`, `freeSlotsLeft` (`floor(paid qty / 2) − free qty`, never below 0), `notice: string | null`, `addFreeGift(productId: string): Promise<void>`; `updateQuantity(productId, quantity, isFreeGift?)` and `removeItem(productId, isFreeGift?)`.

- [ ] **Step 1: Write failing tests** in `offers.test.ts`: `only listed designs are offered`; `one choice per colour of a design`; `designs keep catalogue order`.
- [ ] **Step 2: Run `npm test` in `frontend/`; confirm failure.**
- [ ] **Step 3: Implement** `lib/offers.ts`, the types and the context. `notice` reads "Your free bag was removed: add 2 totes to get it back" when `freeGiftsRemoved > 0` during the sale, and "Buy 2 Get 1 has ended, so the free bag was removed" outside it. In the drawer: when `isSaleOn()` and `freeSlotsLeft > 0`, a "Choose your free bag" row of `freeBagChoices` cards (photo, name, colour) that call `addFreeGift`; free lines show "FREE · not returnable" and no quantity stepper above the allowance; when `offer === "buy2get1"`, the note "Buy 2 Get 1 applied instead of 25% off"; `notice` shown above the items.
- [ ] **Step 4: Run `npm test`, `npm run lint`, `npm run build`; all pass.**
- [ ] **Step 5: Commit** `feat(cart): choose your free bag in the drawer; prices come from the server`.

### Task 7: Checkout, order pages, policy and first-order strip (frontend)

**Files:**
- Modify: `frontend/src/lib/apiTypes.ts` (session `offer`, `offerSaving`, item `isFreeGift`; order item `isFreeGift`, order `offer`, `finalSale`)
- Modify: `frontend/src/pages/CheckoutPage.tsx` (discount row near line 227)
- Modify: `frontend/src/pages/OrderDetailPage.tsx`, `frontend/src/pages/admin/AdminOrderDetail.tsx`
- Modify: `frontend/src/pages/LegalPages.tsx` (refund policy)
- Modify: `frontend/src/components/ShopNav.tsx`

**Interfaces:**
- Consumes: Task 3 session fields, Task 4 order fields.

- [ ] **Step 1: Implement.** Checkout offer row label: `buy2get1` → "Buy 2 Get 1", `diwali25` → `${SALE.name} ${SALE.percent}% off`, `firstOrder10` → "First order 10% off", otherwise "Discount". Order pages: free lines show "FREE · not returnable"; `finalSale` orders show "Final sale (Buy 2 Get 1)". Refund page adds: "Buy 2 Get 1 orders can't be returned unless an item arrives damaged or wrong. The free bag can't be returned." ShopNav, below the icon row, when `!isSaleOn()`: "10% off your first order, taken off at checkout".
- [ ] **Step 2: Run `npm test`, `npm run lint`, `npm run build`; all pass.**
- [ ] **Step 3: Commit** `feat(checkout): name the applied offer; final sale on order pages and policy`.

### Task 8: Verify end to end and roll out

**Files:**
- Modify: `C:/Users/sahil/AppData/Local/Temp/claude/C--Users-sahil-Desktop/bccaa9ab-b91c-4738-a9af-452b0a7d3159/scratchpad/playwright-test-homepage.js` (or a new `playwright-test-offers.js` beside it)

- [ ] **Step 1: Unit suites.** `npm test` in `backend/` and `frontend/`: every test passes, more than 0 tests run in each.
- [ ] **Step 2: Local stack.** Needs `backend/.env` filled by Sahil from Render (Claude does not type secrets). Run the backend with `NODE_ENV=local OFFERS_NOW=2026-11-05T12:00:00+05:30`, point the local frontend build's proxy at it, Sahil signs in, then Playwright checks: picker hidden with 1 tote, shown with 2; adding a free bag shows FREE and ₹0; paid lines show full price with the "instead of 25%" note; a third paid tote does not add a slot, a fourth does; removing a paid tote drops the free bag with the notice; checkout row reads "Buy 2 Get 1". Repeat with `OFFERS_NOW=2026-11-15T12:00:00+05:30`: no picker, first-order row for a new account or none.
- [ ] **Step 3: Real COD order** (only after Sahil confirms in chat): Buy 2 Get 1 COD order through the local stack; check the Shiprocket order's total and invoice lines match the site, then cancel it in Shiprocket and on the site.
- [ ] **Step 4: Roll out.** Push the branch, open the PR on top of #8, merge #8 then this before 1 Nov, close #5, #6 and #7. Confirm on desitotes.com that the first-order strip shows and no picker appears before 1 Nov.
