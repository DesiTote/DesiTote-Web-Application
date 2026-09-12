import { Resend } from "resend";

export const sendEmail = async ({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) => {
    const resend = new Resend(process.env.RESEND_API_KEY!);

    // resend.dev only delivers to the Resend account owner — set EMAIL_FROM to
    // an address on a domain you have verified in Resend before going live.
    const from = process.env.EMAIL_FROM || "DesiTotes <onboarding@resend.dev>";

    let response;
    try {
        response = await resend.emails.send({ from, to, subject, html });
    } catch (error: any) {
        // Network/transport failure — the SDK only throws for these.
        throw new Error(`Failed to send email: ${error?.message || "network error"}`);
    }

    // API-level rejections (unverified sender domain, invalid recipient, quota)
    // are RETURNED, not thrown. Without this the caller sees a silent success
    // and the customer never gets their OTP.
    if (response.error) {
        throw new Error(`Failed to send email: ${response.error.message}`);
    }

    return response;
};
