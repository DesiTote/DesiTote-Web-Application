import { Resend } from "resend";
// reusable function
export const sendEmail = async ({ to, subject, html, }) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    try {
        const response = await resend.emails.send({
            from: "Acme <delivered+user1@resend.dev>", // change after domain verify
            to,
            subject,
            html,
        });
        return response;
    }
    catch (error) {
        throw new Error("Failed to send email");
    }
};
//# sourceMappingURL=email.service.js.map