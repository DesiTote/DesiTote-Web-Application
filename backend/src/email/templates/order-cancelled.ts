import { emailLayout } from "../layout/email-layout.js";

interface OrderCancelledProps {
    name: string;
    orderNumber: string;
    paymentMethod?: string;
}

export const orderCancelledEmailTemplate = ({
    name,
    orderNumber,
    paymentMethod,
}: OrderCancelledProps) =>
    emailLayout({
        title: "Your order has been cancelled",

        body: `
      <p style="color:#555;line-height:1.8;">
        Hi <strong>${name}</strong>,
      </p>

      <p style="color:#555;line-height:1.8;">
        We're writing to let you know that your DesiTotes order has been
        cancelled. Nothing will be dispatched, and you won't be charged.
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

      ${
          paymentMethod && paymentMethod.toUpperCase() !== "COD"
              ? `<p style="color:#555;line-height:1.8;">
                   If you had already paid for this order, the refund will be
                   returned to your original payment method. Banks usually take
                   5&ndash;7 working days to show it.
                 </p>`
              : `<p style="color:#555;line-height:1.8;">
                   This was a Cash on Delivery order, so there is nothing to refund.
                 </p>`
      }

      <p style="color:#555;line-height:1.8;">
        If you didn't expect this, or you'd like the same bags again, just reply
        to this email and we'll sort it out.
      </p>

      <p style="color:#777;font-size:14px;line-height:1.8;text-align:center;margin-top:28px;">
        Thank you for choosing DesiTotes &#10084;
      </p>
    `,
    });
