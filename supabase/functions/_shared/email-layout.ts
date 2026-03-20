// Shared branded email layout for all transactional emails
// Brand: Dark green header (#0D1F0F), gold accents (#8B6914), cream surface (#F2F1EE)
// Typography: Cormorant Garamond (headings), Inter (body)

export const SITE_URL = "https://makefriendsandsocialize.com";
export const BRAND_NAME = "Make Friends and Socialize";
export const BRAND_LOGO_URL = "https://makefriendsandsocialize.com/images/email-logo-dark.png";
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
 *
 * Premium design: header with background image + dark overlay containing
 * the heading in Cormorant Garamond italic, cream card body, gold pill CTA,
 * dark forest-green footer with white logo.
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
    ? `<table cellpadding="0" cellspacing="0" style="margin:32px auto 0;">
        <tr>
          <td style="background:linear-gradient(135deg,${ctaColor},#A47D1E);border-radius:28px;box-shadow:0 4px 14px rgba(139,105,20,0.3);">
            <a href="${ctaUrl}" style="display:inline-block;padding:16px 44px;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;">
              ${ctaText}
            </a>
          </td>
        </tr>
      </table>`
    : "";

  const subheadingBlock = subheading
    ? `<p style="margin:8px 0 0;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.55);">${subheading}</p>`
    : "";

  const footerBlock = footerText
    ? `<p style="margin:0 0 12px;font-size:12px;color:#9BA89D;line-height:20px;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${footerText}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${preheader ? `<title>${preheader}</title>` : ""}
  <!--[if !mso]><!-->
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500;1,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <!--<![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}${"&zwnj;&nbsp;".repeat(20)}</div>` : ""}
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(13,31,15,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-image:url('${HEADER_BG_URL}');background-size:cover;background-position:center;background-color:${headerBg};">
              <!--[if gte mso 9]>
              <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;">
              <v:fill type="frame" src="${HEADER_BG_URL}" />
              <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
              <![endif]-->
              <div style="background:linear-gradient(180deg,rgba(13,31,15,0.78) 0%,rgba(13,31,15,0.88) 100%);padding:48px 40px 40px;text-align:center;">
                <h1 style="margin:0;font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;font-size:32px;font-weight:600;font-style:italic;color:#ffffff;line-height:1.2;letter-spacing:0.01em;">${heading}</h1>
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
            <td style="padding:36px 40px 40px;background-color:#F2F1EE;">
              ${body}
              ${ctaBlock}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:28px 40px 32px;text-align:center;background-color:#0D1F0F;">
              <img src="${BRAND_LOGO_FULL_URL}" alt="Make Friends and Socialize" width="140" height="auto" style="display:block;margin:0 auto 20px;max-width:140px;" />
              ${footerBlock}
              <p style="margin:0 0 6px;font-size:11px;color:rgba(155,168,157,0.7);font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                ${COPYRIGHT}
              </p>
              <p style="margin:0;font-size:11px;color:rgba(155,168,157,0.5);font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
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
  `<p style="margin:0 0 20px;font-size:15px;line-height:26px;color:#4A5A4D;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${text}</p>`;

/** Helper: styled heading inside body */
export const h2 = (text: string) =>
  `<h2 style="margin:0 0 16px;font-family:'Cormorant Garamond',Georgia,serif;font-size:24px;font-weight:600;font-style:italic;color:#0D1F0F;line-height:1.3;">${text}</h2>`;

/** Helper: info/detail box */
export const infoBox = (content: string) =>
  `<div style="background-color:#E8E6E1;border-radius:12px;padding:24px;margin:0 0 24px;">${content}</div>`;

/** Helper: warning/alert box */
export const alertBox = (content: string) =>
  `<div style="background-color:#FEF3CD;border-left:4px solid #8B6914;border-radius:0 12px 12px 0;padding:18px 22px;margin:0 0 24px;">${content}</div>`;

/** Helper: detail row inside info box */
export const detailRow = (icon: string, label: string, value: string) =>
  `<p style="margin:0 0 10px;font-size:14px;color:#4A5A4D;line-height:22px;">${icon} <strong style="color:#0D1F0F;">${label}:</strong> ${value}</p>`;
