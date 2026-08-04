import { emailLayout } from "../layout/email-layout.js";
export const welcomeEmailTemplate = (name) => emailLayout({
    title: "Welcome to DesiTotes 🎉",
    body: `
      <p style="color:#555;line-height:1.8;">
        Hi <strong>${name}</strong>,
      </p>

      <p style="color:#555;line-height:1.8;">
        Thank you for joining the DesiTotes family.
        We're excited to have you with us.
      </p>

      <p style="color:#555;line-height:1.8;">
        Explore unique designs, save your favourites,
        and carry culture wherever you go.
      </p>

      <div style="text-align:center;margin-top:32px;">
        <a
          href="https://desitotes.com/shop"
          style="
            background:#C6941E;
            color:#1B2A41;
            text-decoration:none;
            padding:14px 28px;
            border-radius:10px;
            font-weight:700;
          "
        >
          Start Shopping
        </a>
      </div>
    `,
});
//# sourceMappingURL=welcome.js.map