import { Resend } from "resend";
import nodemailer, { Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport/index.js";
import dns from "dns";

// Two ways to send, chosen by EMAIL_TRANSPORT:
//
//   "gmail"  - signs in to the shop's own Gmail with an app password and sends
//              as that address. No domain or DNS needed, which is why the shop
//              can use desitotes0401@gmail.com directly. Google caps this at
//              roughly 500 messages a day.
//   "resend" - the API. Better deliverability and no daily cap, but it can only
//              send from a domain verified in Resend; a Gmail address can never
//              be the sender, because Google does not authorise anyone else to
//              send as gmail.com.
//
// Defaults to resend so existing deployments keep their behaviour.
const transport = () => (process.env.EMAIL_TRANSPORT || "resend").trim().toLowerCase();

const FREE_MAIL_DOMAINS = ["gmail.com", "googlemail.com", "yahoo.com", "outlook.com", "hotmail.com", "live.com", "rediffmail.com"];

const senderDomain = (from: string) => {
    const match = from.match(/<([^>]+)>/);
    return (match ? match[1] : from).split("@")[1]?.toLowerCase().trim();
};

// Built once and reused: a fresh SMTP connection per email is slow, and the OTP
// is on the critical path of every signup.
let gmailTransporter: Transporter | null = null;
const getGmailTransporter = () => {
    if (gmailTransporter) return gmailTransporter;

    const user = process.env.GMAIL_USER?.trim();
    const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, ""); // Google displays it in four blocks

    if (!user || !pass) {
        throw new Error(
            "EMAIL_TRANSPORT is gmail but GMAIL_USER / GMAIL_APP_PASSWORD are not set. " +
                "Generate an app password at myaccount.google.com/apppasswords (needs 2-Step Verification on)."
        );
    }

    // Render's instances have no outbound IPv6 route, but smtp.gmail.com
    // resolves to IPv6 first, so the connection died with ENETUNREACH before it
    // ever left the box. nodemailer's own `family` option is not in its types,
    // so prefer IPv4 at the resolver instead - which is what we want for every
    // outbound connection on this host anyway.
    dns.setDefaultResultOrder("ipv4first");

    const smtpOptions: SMTPTransport.Options = {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user, pass },
        // Don't let a hung connection hold an OTP request open indefinitely;
        // failing fast lets the caller show a real error instead.
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
    };

    gmailTransporter = nodemailer.createTransport(smtpOptions);
    return gmailTransporter;
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
    // Where customer replies and complaints go, whichever transport is used.
    const replyTo = process.env.EMAIL_REPLY_TO?.trim() || undefined;

    if (transport() === "gmail") {
        const user = process.env.GMAIL_USER?.trim();
        // Gmail rewrites the sender to the authenticated account anyway, so the
        // only part worth setting is the display name.
        const from = process.env.EMAIL_FROM?.includes("<") ? process.env.EMAIL_FROM : `DesiTotes <${user}>`;

        const info = await getGmailTransporter().sendMail({
            from,
            to,
            subject,
            html,
            ...(replyTo ? { replyTo } : {}),
        });
        return info;
    }

    const resend = new Resend(process.env.RESEND_API_KEY!);

    // resend.dev only delivers to the Resend account owner — set EMAIL_FROM to
    // an address on a domain you have verified in Resend before going live.
    const from = process.env.EMAIL_FROM || "DesiTotes <onboarding@resend.dev>";

    // Caught here rather than left to Resend, whose rejection does not say what
    // to do about it. This one misconfiguration stops every signup on the site.
    const domain = senderDomain(from);
    if (domain && FREE_MAIL_DOMAINS.includes(domain)) {
        throw new Error(
            `EMAIL_FROM is set to a ${domain} address, which Resend cannot send as. ` +
                `Either set EMAIL_TRANSPORT=gmail to send through that mailbox directly, ` +
                `or send from a domain verified in Resend and put the ${domain} address in EMAIL_REPLY_TO.`
        );
    }

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
