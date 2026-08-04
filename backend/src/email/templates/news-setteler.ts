import { emailLayout } from "../layout/email-layout.js";

interface NewsletterProps {
  title: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
}

export const newsletterEmailTemplate = ({
  title,
  content,
  buttonText,
  buttonUrl,
}: NewsletterProps) =>
  emailLayout({
    title,

    body: `
      <div
        style="
          color:#555;
          line-height:1.8;
          font-size:15px;
        "
      >
        ${content}
      </div>

      ${
        buttonText && buttonUrl
          ? `
            <div style="text-align:center;margin-top:32px;">
              <a
                href="${buttonUrl}"
                style="
                  background:#C6941E;
                  color:#1B2A41;
                  text-decoration:none;
                  padding:14px 28px;
                  border-radius:10px;
                  font-weight:700;
                "
              >
                ${buttonText}
              </a>
            </div>
          `
          : ""
      }
    `,
  });