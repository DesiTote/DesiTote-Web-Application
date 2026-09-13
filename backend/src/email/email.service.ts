import { Resend } from "resend";

// Free mailbox providers publish DMARC policies that no third party can send
// under, so Resend refuses them as a sender. The shop's Gmail address belongs
// in EMAIL_REPLY_TO, not EMAIL_FROM — see below.
const FREE_MAIL_DOMAINS = ["gmail.com", "googlemail.com", "yahoo.com", "outlook.com", "hotmail.com", "live.com", "rediffmail.com"];

const senderDomain = (from: string) => {
    const match = from.match(/<([^>]+)>/);
    return (match ? match[1] : from).split("@")[1]?.toLowerCase().trim();
};

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

    // Caught here rather than left to Resend, whose rejection does not say what
    // to do about it. This one misconfiguration stops every signup on the site.
    const domain = senderDomain(from);
    if (domain && FREE_MAIL_DOMAINS.includes(domain)) {
        throw new Error(
            `EMAIL_FROM is set to a ${domain} address. Mailbox providers do not let anyone else ` +
                `send as their domain, so this can never be delivered. Send from an address on a ` +
                `domain verified in Resend and put the shop's ${domain} address in EMAIL_REPLY_TO ` +
                `so replies still land there.`
        );
    }

    // Where customer replies and complaints go. The shop reads a normal inbox;
    // the sending address only has to be one Resend can authenticate.
    const replyTo = process.env.EMAIL_REPLY_TO?.trim() || undefined;

    let response;
    try {
        response = await resend.emails.send({ from, to, subject, html, ...(replyTo ? { replyTo } : {}) });
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
