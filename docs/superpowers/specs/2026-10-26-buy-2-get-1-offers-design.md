# Buy 2 Get 1 and one-offer-at-a-time checkout

Date: 2026-10-26. Branch: `feat/offers-buy2get1`, built on PR #8 (which carries the Diwali sale from #6 and the phone grid from #7). Supersedes PR #5 (first-order 10%).

## Goal

Pratik wants three separate offers that never combine:

| Offer | When | What the customer gets |
|---|---|---|
| Diwali Sale | 1 Nov 00:00 IST to 12 Nov 00:00 IST | 25% off every tote, shown on every price |
| Buy 2 Get 1 | same dates | For every 2 totes paid for, 1 free tote picked from the picture-only designs |
| First order | every day | 10% off a customer's first order |

Only one offer applies to an order. During the sale dates, a cart with a free bag gets Buy 2 Get 1 and nothing else; a cart without one gets the 25%. On any other day, a first order gets 10%.

## Decisions made with Sahil

- The customer picks the free bag. It is not chosen automatically.
- 1 free bag for every 2 paid bags: 2 paid give 1, 4 give 2, 5 give 2.
- Free bags come only from the 23 picture-only designs listed below (any colour, any zip option). Designs with words on them are excluded.
- One offer at a time. A free bag in the cart means the paid bags are charged at full price.
- Buy 2 Get 1 orders are final sale: no returns unless the item arrived damaged or wrong. The free bag itself can never be returned.
- Cancelling before shipping still refunds in full. Cash on delivery works as usual.

## Free-bag designs

Stored as the products' `group:` tag values in a backend config file, mirrored in the frontend for the picker:

```
desi-print-birdhouse        desi-print-retro-flower     desi-print-modern-floral
desi-print-hand-eye         desi-print-scattered-hearts desi-print-giraffe-bigeyes
desi-print-giraffe-peek     desi-print-elephant         desi-print-cat-peek
desi-print-cat-box          desi-print-white-floral     desi-print-bear-heart
desi-print-cat-basket       desi-print-poppy            desi-print-cat-heart
desi-print-dolphin          desi-print-hanuman          desi-print-blue-wildflower
desi-print-evil-eye-garden  desi-print-purple-floral    desi-print-sunflower-motif
desi-print-daisy            desi-print-mushroom
```

A design added later is not eligible until its group is added to the list.

## Offer rules

One pure function decides every price:

```
applyOffers(lines, { now, isFirstOrder }) -> { lines: priced lines, discount, offer, removedFreeLines }
```

Each input line is `{ productId, group, quantity, price, isFreeGift }`, where `price` is the tote's normal price (`discountPrice ?? price`). Outputs:

1. **During the sale, with free lines.** `offer = buy2get1`. Paid lines cost `price`. Allowed free bags = floor(paid quantity / 2). Free lines are priced 0 up to the allowance, in the order they were added; quantity beyond the allowance is dropped and reported in `removedFreeLines`. A free line whose group is not eligible is dropped and reported. `discount` = sum of the full prices of the free bags kept.
2. **During the sale, no free lines.** `offer = diwali25`. Every line costs `round(price × 0.75)`, as #6 does today. `discount` = the savings.
3. **Outside the sale.** Free lines are all dropped and reported. If `isFirstOrder`, `offer = firstOrder10` and `discount = round(sum × 0.10)`, otherwise no offer.

A customer who qualifies for the first-order 10% during the sale gets the 25% instead, which always saves more. Examples, totes at ₹349 and a free design at ₹299:

| Cart | Day | Offer | Pays for totes |
|---|---|---|---|
| 2 paid + 1 free | 5 Nov | Buy 2 Get 1 | ₹698, free bag ₹0 |
| 3 paid, no free | 5 Nov | 25% | 3 × ₹262 = ₹786 |
| 4 paid + 3 free | 5 Nov | Buy 2 Get 1 | 2 free kept, 1 removed with a message |
| 2 paid + 1 free | 15 Nov | none (first order: 10%) | free line removed with a message |

## Changes by layer

### Backend

- `config/offers.ts`: the free-design list and the sale window (re-exported from `config/sale.ts`, so the two offers can never drift apart).
- `modules/offers/applyOffers.ts`: the function above, plus its tests.
- **Cart.** `ICartItem` gains `isFreeGift?: boolean`. A line is identified by `productId` and `isFreeGift`, so the same tote can be both paid and free. `POST /cart/add` accepts `isFreeGift`. It is refused outside the sale, for an ineligible design, or past the allowance. `PATCH /update-quantity/:productId` and `DELETE /remove-item/:productId` accept `?free=1`. `GET /cart` trims free lines that no longer qualify and returns `freeGiftsRemoved` so the drawer can explain.
- **Checkout session.** Built through `applyOffers`. `CheckoutItem` gains `isFreeGift`; the session gains `offer` (`buy2get1 | diwali25 | firstOrder10 | null`) and `removedFreeLines`. The first-order check is #5's query, moved here. `subtotal`, `discount` and `total` keep their meaning, so Razorpay and COD totals need no other change.
- **Order.** `IOrderItem` gains `isFreeGift`; the order gains `offer` and `finalSale` (true for Buy 2 Get 1). Stock is reduced for free bags like any other.
- **Returns.** `getReturnableItems` never lists free lines. For a final-sale order, `createReturnRequest` accepts only "Defective or damaged product" and "Wrong item received".
- **Shiprocket.** Each line is sent at its original price (`originalPrice`, so the free bag at its normal price), with `sub_total` = the sum of those and `total_discount` = the order discount. Today lines go at the already-discounted price and the discount is sent again, which would under-charge COD once the 25% sale runs. This fixes it for every offer.
- **Emails.** The customer confirmation and Pratik's order alert mark free lines "FREE (not returnable)" and name the offer.

### Frontend

- **Cart drawer.** With the sale on and at least 2 paid totes, a "Choose your free bag" row shows the eligible designs (one card per design and colour, using the first zip option of that colour). Tapping adds that variant as free. Free lines show "FREE · not returnable" and a ₹0 price. When `freeGiftsRemoved` comes back, a short message says why.
- **Prices.** With a free bag in the cart, paid lines show full price and a note: "Buy 2 Get 1 applied instead of 25% off."
- **Checkout.** One offer row: "Buy 2 Get 1: −₹X", "Diwali Sale 25%: −₹X" or "First order 10%: −₹X".
- **Order pages.** Free lines and final sale are shown on the customer's order page and the admin order page.
- **Refunds page.** "Buy 2 Get 1 orders can't be returned unless an item arrives damaged or wrong. The free bag can't be returned."
- **Shop nav.** A "10% off your first order" strip, shown outside the sale dates.

## Error handling

- Adding a free bag when not allowed: 400 with the reason ("Add 2 totes to get a free bag", "Add 2 more totes for another free bag", "Free bags are only from the picture designs", "Buy 2 Get 1 ended on 11 November").
- Free lines dropped later (sale ended, a paid tote removed): removed, never charged, and reported to the customer. A dropped free bag is never quietly turned into a paid one.
- The sale ending between opening checkout and paying: the session's prices stand, as today.

## Testing

- **Unit (backend, new `tsx --test` script):** `applyOffers` for every row of the rule list and the examples, the allowance, ineligible designs, the dates on both edges, and first order versus the 25%. The Shiprocket payload builder for a sale order and a Buy 2 Get 1 order (sub_total − total_discount = what the customer pays).
- **Unit (frontend):** the helper that picks one card per eligible design.
- **Browser (Playwright, local build, live API):** the picker appears after 2 totes on 5 Nov and not on 15 Nov; a free line reads FREE; the checkout row names the right offer.
- **One real order** on the preview, which uses the live API: a COD Buy 2 Get 1 order, then check the Shiprocket order and invoice amounts, then cancel it.

## Out of scope

- An admin screen to edit the free-design list (it is a code list for an 11-day offer).
- Offers on printed-to-order custom bags.

## Rollout

Merge PR #8 first, then this branch, before 1 Nov. Close #5 and #6/#7 once #8 is merged. Until 1 Nov the site behaves as today apart from the first-order 10%.
