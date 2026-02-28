// Shared branded email layout for all transactional emails
// Brand: Dark green header (#0D1F0F), gold accents (#8B6914), cream surface (#F2F1EE)
// Typography: Cormorant Garamond (headings), Inter (body)
// Production URL: makefriendsandsocializecom.lovable.app

export const SITE_URL = "https://makefriendsandsocializecom.lovable.app";
export const BRAND_NAME = "Make Friends and Socialize";
export const BRAND_LOGO_URL = "https://qzqomqctuqldexnxgmlh.supabase.co/storage/v1/object/public/email-assets/logo-monogram.png";
export const COPYRIGHT = `© ${new Date().getFullYear()} Make Friends and Socialize LLC`;

// Sender addresses by role
export const SENDERS = {
  events: "MakeFriends Events <events@makefriendsandsocialize.com>",
  dating: "Intentional Connections <dating@makefriendsandsocialize.com>",
  referrals: "MakeFriends <referrals@makefriendsandsocialize.com>",
  security: "MakeFriends Security <security@makefriendsandsocialize.com>",
  billing: "MakeFriends Billing <billing@makefriendsandsocialize.com>",
  business: "The Founders Circle <business@makefriendsandsocialize.com>",
  noreply: "MakeFriends <noreply@makefriendsandsocialize.com>",
  hello: "MakeFriends <hello@makefriendsandsocialize.com>",
};

interface EmailLayoutOptions {
  preheader?: string;
  heading: string;
  subheading?: string;
  body: string;
  ctaUrl?: string;
  ctaText?: string;
  footerText?: string;
  /** Override header background color (default: #0D1F0F) */
  headerBg?: string;
  /** Override CTA button color (default: #8B6914) */
  ctaColor?: string;
}

/**
 * Wraps email content in the branded MakeFriends layout.
 * Uses table-based HTML for maximum email client compatibility.
 */
export function buildBrandedEmail(options: EmailLayoutOptions): string {
  const {
    preheader = "",
    heading,
    subheading,
    body,
    ctaUrl,
    ctaText,
    footerText,
    headerBg = "#0D1F0F",
    ctaColor = "#8B6914",
  } = options;

  const ctaBlock = ctaUrl && ctaText
    ? `<table cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
        <tr>
          <td style="background-color:${ctaColor};border-radius:10px;">
            <a href="${ctaUrl}" style="display:inline-block;padding:14px 36px;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.04em;text-transform:uppercase;">
              ${ctaText}
            </a>
          </td>
        </tr>
      </table>`
    : "";

  const subheadingBlock = subheading
    ? `<p style="margin:8px 0 0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#9BA89D;">${subheading}</p>`
    : "";

  const footerBlock = footerText
    ? `<p style="margin:0 0 8px;font-size:12px;color:#9BA89D;line-height:20px;">${footerText}</p>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${preheader ? `<title>${preheader}</title>` : ""}
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ""}
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#F2F1EE;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 24px;text-align:center;background-color:${headerBg};">
              <img src="${BRAND_LOGO_URL}" alt="Make Friends and Socialize" width="60" height="60" style="display:block;margin:0 auto 16px;border-radius:8px;" />
              <h1 style="margin:0;font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;font-size:28px;font-weight:600;font-style:italic;color:#B8892A;letter-spacing:0.02em;">
                ${heading}
              </h1>
              ${subheadingBlock}
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              ${body}
              ${ctaBlock}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #E3E0D8;text-align:center;">
              ${footerBlock}
              <p style="margin:0 0 8px;font-size:12px;color:#9BA89D;">
                ${COPYRIGHT}
              </p>
              <p style="margin:0;font-size:11px;color:#9BA89D;">
                Salt Lake City, Utah, USA
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Helper: styled paragraph */
export const p = (text: string) =>
  `<p style="margin:0 0 20px;font-size:15px;line-height:24px;color:#4A5A4D;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${text}</p>`;

/** Helper: styled heading inside body */
export const h2 = (text: string) =>
  `<h2 style="margin:0 0 16px;font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-weight:600;font-style:italic;color:#0D1F0F;">${text}</h2>`;

/** Helper: info/detail box */
export const infoBox = (content: string) =>
  `<div style="background-color:#E8E6E1;border-radius:10px;padding:20px;margin:0 0 20px;">${content}</div>`;

/** Helper: warning/alert box */
export const alertBox = (content: string) =>
  `<div style="background-color:#FEF3CD;border-left:4px solid #8B6914;border-radius:0 10px 10px 0;padding:16px 20px;margin:0 0 20px;">${content}</div>`;

/** Helper: detail row inside info box */
export const detailRow = (icon: string, label: string, value: string) =>
  `<p style="margin:0 0 8px;font-size:14px;color:#4A5A4D;">${icon} <strong style="color:#0D1F0F;">${label}:</strong> ${value}</p>`;
