import { emailLayout } from "../layout/email-layout.js";

interface OrderDeliveredProps {
  name: string;
  orderId: string;
  orderNumber: string;
}

export const orderDeliveredEmailTemplate = ({
  name,
  orderId,
  orderNumber,
}: OrderDeliveredProps) =>
  emailLayout({
    title: "Your Order Has Been Delivered 🎉",

    body: `
      <p style="color:#555;line-height:1.8;">
        Hi <strong>${name}</strong>,
      </p>

      <p style="color:#555;line-height:1.8;">
        Great news! Your order
        <strong>#${orderNumber}</strong> has been successfully delivered.
      </p>

      <p style="color:#555;line-height:1.8;">
        We hope you absolutely love your DesiTotes purchase ❤️.
        Thank you for supporting handcrafted products.
      </p>

      <div
        style="
          background:#FBF8F1;
          border-left:4px solid #C6941E;
          padding:16px;
          border-radius:8px;
          margin:24px 0;
        "
      >
        <strong>Return Policy</strong><br/>
        You may request a return within
        <strong>3 days of delivery</strong> if your order meets our return
        policy.
      </div>

      <div style="text-align:center;margin:32px 0;">
        <a
          href="https://desitotes.com/orders/${orderId}/review-purchase"
          style="
            display:inline-block;
            background:#C6941E;
            color:#1B2A41;
            text-decoration:none;
            padding:14px 30px;
            border-radius:10px;
            font-weight:700;
            margin-bottom:14px;
          "
        >
          ⭐ Review Your Purchase
        </a>

        <br/>

        <a
          href="https://desitotes.com/shop"
          style="
            display:inline-block;
            background:#1B2A41;
            color:#FBF8F1;
            text-decoration:none;
            padding:14px 30px;
            border-radius:10px;
            font-weight:700;
          "
        >
          Shop Again
        </a>
      </div>

      <p style="color:#777;font-size:14px;line-height:1.8;text-align:center;">
        Your feedback helps other shoppers and supports our artisans.
      </p>
    `,
  });