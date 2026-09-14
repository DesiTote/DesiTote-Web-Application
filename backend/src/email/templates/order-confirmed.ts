import { emailLayout } from "../layout/email-layout.js";

interface OrderConfirmedProps {
    name: string;
    orderId: string;
    orderNumber:string;
}

export const orderConfirmedEmailTemplate = ({
    name,
    orderId,
    orderNumber,
}: OrderConfirmedProps) =>
    emailLayout({
        title: "Your Order is Confirmed 🎉",

        body: `
      <p style="color:#555;line-height:1.8;">
        Hi <strong>${name}</strong>,
      </p>

      <p style="color:#555;line-height:1.8;">
        Thank you for shopping with
        <strong>DesiTotes</strong>!
      </p>

      <p style="color:#555;line-height:1.8;">
        We've successfully received your order and it's now being prepared.
      </p>

      <div
        style="
          background:#FBF8F1;
          border-left:4px solid #C6941E;
          padding:18px;
          border-radius:8px;
          margin:24px 0;
        "
      >
        <strong>Order Number</strong><br/>
        #${orderNumber}
      </div>

      <p style="color:#555;line-height:1.8;">
        We'll notify you as soon as your order is packed, shipped, and on its
        way.
      </p>

      <div style="text-align:center;margin:32px 0;">
        <a
          href="https://desitotes.com/orders/${orderId}"
          style="
            display:inline-block;
            background:#C6941E;
            color:#1B2A41;
            text-decoration:none;
            padding:14px 30px;
            border-radius:10px;
            font-weight:700;
          "
        >
          View Your Order
        </a>
      </div>

      <div
        style="
          background:#F8F8F8;
          border-radius:8px;
          padding:16px;
          margin-top:24px;
        "
      >
        <strong>What happens next?</strong>

        <ul style="padding-left:18px;color:#555;line-height:1.8;margin-top:10px;">
          <li>✔️ Your order is being prepared.</li>
          <li>📦 You'll receive a shipping confirmation once dispatched.</li>
          <li>🚚 We'll notify you again when it's delivered.</li>
        </ul>
      </div>

      <p style="color:#777;font-size:14px;line-height:1.8;text-align:center;margin-top:28px;">
        Thank you for choosing DesiTotes ❤️
      </p>
    `,
    });