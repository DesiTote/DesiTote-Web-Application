import { emailLayout } from "../layout/email-layout.js";

/**
 * Sent to the shop owner the moment an order is confirmed, so a new order is
 * never missed. It is a work order, not a marketing email: everything needed
 * to pack and ship — what was bought, where it goes, who to call, and how it
 * was paid — on one screen, so the owner can act straight from their inbox.
 */
interface AdminOrderAlertItem {
    name: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
}

interface AdminOrderAlertProps {
    orderNumber: string;
    paymentMethod: "COD" | "ONLINE";
    grandTotal: number;
    items: AdminOrderAlertItem[];
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    address: {
        addressLine1: string;
        addressLine2?: string;
        district: string;
        state: string;
        pincode: string;
    };
}

const money = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

export const orderAdminAlertTemplate = ({
    orderNumber,
    paymentMethod,
    grandTotal,
    items,
    customerName,
    customerPhone,
    customerEmail,
    address,
}: AdminOrderAlertProps) => {
    const rows = items
        .map(
            (i) => `
      <tr>
        <td style="padding:8px 0;color:#333;">${i.name}${i.sku ? ` <span style="color:#999;font-size:12px;">(${i.sku})</span>` : ""}</td>
        <td style="padding:8px 0;color:#333;text-align:center;">×${i.quantity}</td>
        <td style="padding:8px 0;color:#333;text-align:right;">${money(i.unitPrice * i.quantity)}</td>
      </tr>`
        )
        .join("");

    const payLabel = paymentMethod === "COD" ? "Cash on Delivery — collect on delivery" : "Paid online — money already received";

    const addressLines = [
        address.addressLine1,
        address.addressLine2,
        `${address.district}, ${address.state} ${address.pincode}`,
    ]
        .filter(Boolean)
        .join("<br/>");

    return emailLayout({
        title: `New order ${orderNumber} 🛍️`,
        preview: `New order ${orderNumber} — ${money(grandTotal)} — pack & ship`,
        body: `
      <p style="color:#555;line-height:1.8;">
        A new order just came in. Here is everything you need to pack and ship it.
      </p>

      <p style="color:#111;font-size:18px;margin:18px 0 6px;">
        <strong>${orderNumber}</strong> &nbsp;·&nbsp; <strong>${money(grandTotal)}</strong>
      </p>
      <p style="color:#555;margin:0 0 18px;">${payLabel}</p>

      <table style="width:100%;border-collapse:collapse;border-top:1px solid #e5ddc8;border-bottom:1px solid #e5ddc8;margin-bottom:18px;">
        ${rows}
      </table>

      <p style="color:#111;margin:0 0 4px;"><strong>Deliver to</strong></p>
      <p style="color:#555;line-height:1.7;margin:0 0 18px;">
        ${customerName}<br/>
        ${addressLines}<br/>
        📞 ${customerPhone}${customerEmail ? `<br/>✉️ ${customerEmail}` : ""}
      </p>

      <p style="color:#555;line-height:1.8;">
        <strong>What to do:</strong> pack the tote(s), then open this order in your
        Shiprocket account, click <em>Ship Now</em>, pick a courier, print the label
        and hand it over. The website updates the customer automatically after pickup.
      </p>
    `,
    });
};
