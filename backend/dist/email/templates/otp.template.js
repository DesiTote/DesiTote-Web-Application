import { emailLayout } from "../layout/email-layout.js";
export const otpEmailTemplate = ({ title, description, otp, }) => emailLayout({
    title,
    body: `
      <p style="color:#555;line-height:1.7;">
        ${description}
      </p>

      <div
        style="
          margin:32px 0;
          background:#FBF8F1;
          border:2px dashed #C6941E;
          border-radius:12px;
          padding:24px;
          text-align:center;
        "
      >
        <span
          style="
            font-size:38px;
            font-weight:700;
            letter-spacing:10px;
            color:#1B2A41;
          "
        >
          ${otp}
        </span>
      </div>

      <p style="font-size:13px;color:#888;">
        This OTP expires in 5 minutes. Never share it with anyone.
      </p>
    `,
});
//# sourceMappingURL=otp.template.js.map