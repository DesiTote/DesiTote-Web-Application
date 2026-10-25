/** The shop's number. It is on WhatsApp, and Shiprocket uses it as the pickup contact. */
export const SHOP_PHONE = '9823126309';

/** Link that opens a WhatsApp chat with the shop, the message already typed. */
export const whatsappUrl = (message: string): string =>
  `https://wa.me/91${SHOP_PHONE}?text=${encodeURIComponent(message)}`;

/** Shared by the shop-nav icon, the custom orders section and the footer. */
export const customOrderUrl = whatsappUrl('Hi Desi Totes, I would like a custom order.');
