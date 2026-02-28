// Shared branded email layout for all transactional emails
// Brand: Dark green header (#0D1F0F), gold accents (#8B6914), cream surface (#F2F1EE)
// Typography: Cormorant Garamond (headings), Inter (body)
// Production URL: makefriendsandsocializecom.lovable.app

export const SITE_URL = "https://makefriendsandsocialize.com";
export const BRAND_NAME = "Make Friends and Socialize";
export const BRAND_LOGO_URL = "https://makefriendsandsocialize.com/images/logo-monogram.png";
export const BRAND_LOGO_FULL_URL = "https://makefriendsandsocialize.com/images/logo-full-white.png";
export const HEADER_BG_URL = "https://makefriendsandsocialize.com/images/email-header-bg.jpg";
export const COPYRIGHT = `© ${new Date().getFullYear()} Make Friends and Socialize LLC`;

// Sender addresses by role
export const SENDERS = {
  events: "Make Friends and Socialize <events@makefriendsandsocialize.com>",
  dating: "Intentional Connections <dating@makefriendsandsocialize.com>",
  referrals: "Make Friends and Socialize <referrals@makefriendsandsocialize.com>",
  security: "Make Friends and Socialize <security@makefriendsandsocialize.com>",
  billing: "Make Friends and Socialize <billing@makefriendsandsocialize.com>",
  business: "The Founders Circle <business@makefriendsandsocialize.com>",
  noreply: "Make Friends and Socialize <noreply@makefriendsandsocialize.com>",
  hello: "Make Friends and Socialize <hello@makefriendsandsocialize.com>",
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
 * Wraps email content in the branded Make Friends and Socialize layout.
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
    ? `<p style="margin:8px 0 0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.6);">${subheading}</p>`
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
          <!-- Header with background image -->
          <tr>
            <td style="padding:40px 40px 24px;text-align:center;background-image:url('${HEADER_BG_URL}');background-size:cover;background-position:center;background-color:${headerBg};">
              <!--[if gte mso 9]>
              <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;">
              <v:fill type="frame" src="${HEADER_BG_URL}" />
              <v:textbox style="mso-fit-shape-to-text:true" inset="40px,40px,24px,40px">
              <![endif]-->
              <div style="background:rgba(0,0,0,0.55);border-radius:16px 16px 0 0;margin:-40px -40px -24px;padding:40px 40px 24px;">
                ${subheadingBlock}
              </div>
              <!--[if gte mso 9]>
              </v:textbox>
              </v:rect>
              <![endif]-->
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
            <td style="padding:24px 40px;border-top:1px solid #E3E0D8;text-align:center;background-color:#0D1F0F;border-radius:0 0 16px 16px;">
              <img src="${BRAND_LOGO_FULL_URL}" alt="Make Friends and Socialize" width="160" height="auto" style="display:block;margin:0 auto 16px;max-width:160px;" />
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
