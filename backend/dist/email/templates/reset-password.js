import { emailLayout } from "../layout/email-layout.js";
export const resetPasswordSuccessEmailTemplate = () => emailLayout({
    title: "Password Updated Successfully",
    body: `
      <p style="color:#555;line-height:1.8;">
        Your password has been changed successfully.
      </p>

      <p style="color:#555;line-height:1.8;">
        If you made this change, no further action is required.
      </p>

      <p style="color:#555;line-height:1.8;">
        If you did not change your password,
        please contact our support team immediately.
      </p>
    `,
});
//# sourceMappingURL=reset-password.js.map