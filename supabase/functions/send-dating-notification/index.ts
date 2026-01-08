import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  notification_id?: string;
  process_pending?: boolean;
}

const SITE_URL = Deno.env.get("SITE_URL") || "https://the-gathering.lovable.app";

const getVettedEmailHtml = (displayName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: Georgia, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1B4332; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: normal;">Welcome to Slow Dating</h1>
              <p style="color: #A3C9A8; margin: 10px 0 0 0; font-size: 16px;">You've Been Approved 💚</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #2D3748; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                Dear ${displayName},
              </p>
              <p style="color: #4A5568; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                Wonderful news! Your Slow Dating profile has been carefully reviewed by our matchmakers, and we're delighted to welcome you into our curated dating community.
              </p>
              <p style="color: #4A5568; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                Our team is now actively working to find meaningful connections for you based on your values, aspirations, and what you're looking for in a partner.
              </p>
              <p style="color: #4A5568; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0;">
                We believe in quality over quantity. Rather than endless swiping, we'll introduce you to carefully selected individuals who align with your vision for partnership.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${SITE_URL}/portal/slow-dating" 
                       style="display: inline-block; background-color: #C65D3B; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-size: 16px;">
                      View Your Profile
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F7FAFC; padding: 30px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="color: #718096; font-size: 14px; margin: 0;">
                With warmth,<br>
                <strong>Make Friends and Socialize Team</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getNewMatchEmailHtml = (displayName: string, matchName: string, compatibilityScore: number, matchReason: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: Georgia, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #C65D3B; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: normal;">You Have a New Match!</h1>
              <p style="color: #FFE4D6; margin: 10px 0 0 0; font-size: 16px;">💕 Someone special is waiting</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #2D3748; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                Great news, ${displayName}!
              </p>
              <p style="color: #4A5568; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                We've found someone special who shares your values and vision for partnership. After careful consideration, our matchmakers believe you and <strong>${matchName}</strong> could be a wonderful match.
              </p>
              
              <!-- Match Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7FAFC; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="color: #1B4332; font-size: 20px; margin: 0 0 8px 0; font-weight: bold;">
                      ${matchName}
                    </p>
                    <p style="color: #C65D3B; font-size: 24px; margin: 0 0 16px 0; font-weight: bold;">
                      ${compatibilityScore}% Compatible
                    </p>
                    <p style="color: #4A5568; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">
                      "${matchReason}"
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-top: 20px;">
                    <a href="${SITE_URL}/portal/slow-dating" 
                       style="display: inline-block; background-color: #1B4332; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-size: 16px;">
                      View Your Match
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F7FAFC; padding: 30px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="color: #718096; font-size: 14px; margin: 0;">
                With warmth,<br>
                <strong>Make Friends and Socialize Team</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getMeetingScheduledEmailHtml = (displayName: string, meetingDate: string, meetingTime: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: Georgia, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1B4332; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: normal;">Your Meeting is Confirmed!</h1>
              <p style="color: #A3C9A8; margin: 10px 0 0 0; font-size: 16px;">📅 Mark your calendar</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #2D3748; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                Dear ${displayName},
              </p>
              <p style="color: #4A5568; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                Great news! Your first meeting has been scheduled. We're excited for you to connect with your match in person.
              </p>
              
              <!-- Meeting Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1B4332; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="color: #A3C9A8; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
                      Meeting Date
                    </p>
                    <p style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0; font-weight: bold;">
                      ${meetingDate}
                    </p>
                    <p style="color: #A3C9A8; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
                      Time Slot
                    </p>
                    <p style="color: #ffffff; font-size: 18px; margin: 0;">
                      ${meetingTime}
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #4A5568; font-size: 16px; line-height: 1.8; margin: 20px 0;">
                <strong>What to expect:</strong><br>
                You'll meet at our curated venue for a relaxed conversation. Just be yourself – there's no pressure, just an opportunity to connect authentically.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-top: 20px;">
                    <a href="${SITE_URL}/portal/slow-dating" 
                       style="display: inline-block; background-color: #C65D3B; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-size: 16px;">
                      View Match Details
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F7FAFC; padding: 30px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="color: #718096; font-size: 14px; margin: 0;">
                With warmth,<br>
                <strong>Make Friends and Socialize Team</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getDecisionTimeEmailHtml = (displayName: string, matchName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: Georgia, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #C65D3B; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: normal;">How Did It Go?</h1>
              <p style="color: #FFE4D6; margin: 10px 0 0 0; font-size: 16px;">💭 We'd love to hear from you</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #2D3748; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                Dear ${displayName},
              </p>
              <p style="color: #4A5568; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                We hope your meeting with ${matchName} was a wonderful experience! We're curious to know how it went.
              </p>
              <p style="color: #4A5568; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                When you're ready, please log in to share your decision. Remember, your response is completely private – only you know what you've chosen until there's a mutual connection.
              </p>
              
              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7FAFC; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1B4332;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #4A5568; font-size: 14px; line-height: 1.6; margin: 0;">
                      <strong>Remember:</strong> There's no pressure. Whether you felt a spark or not, your honest feedback helps us continue to improve our matching process.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-top: 20px;">
                    <a href="${SITE_URL}/portal/slow-dating" 
                       style="display: inline-block; background-color: #1B4332; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-size: 16px;">
                      Share Your Decision
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F7FAFC; padding: 30px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="color: #718096; font-size: 14px; margin: 0;">
                With warmth,<br>
                <strong>Make Friends and Socialize Team</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getMutualMatchEmailHtml = (displayName: string, matchName: string, matchId: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: Georgia, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1B4332 0%, #C65D3B 100%); padding: 50px; text-align: center;">
              <p style="color: #ffffff; font-size: 48px; margin: 0 0 10px 0;">🎉</p>
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: normal;">It's a Connection!</h1>
              <p style="color: #FFE4D6; margin: 15px 0 0 0; font-size: 18px;">You both felt the spark ✨</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #2D3748; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                Wonderful news, ${displayName}!
              </p>
              <p style="color: #4A5568; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                Both you and <strong>${matchName}</strong> expressed interest in continuing your connection. This is a beautiful moment, and we're thrilled to be part of your journey.
              </p>
              
              <!-- Celebration Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1B4332; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="color: #A3C9A8; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
                      Your Match
                    </p>
                    <p style="color: #ffffff; font-size: 24px; margin: 0 0 8px 0; font-weight: bold;">
                      ${matchName}
                    </p>
                    <p style="color: #A3C9A8; font-size: 14px; margin: 0;">
                      Full profile now revealed!
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #4A5568; font-size: 16px; line-height: 1.8; margin: 20px 0;">
                Their full profile is now visible in your portal. Take some time to learn more about them – we hope this is the beginning of something beautiful.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-top: 20px;">
                    <a href="${SITE_URL}/portal/match/${matchId}" 
                       style="display: inline-block; background-color: #C65D3B; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-size: 16px;">
                      View ${matchName}'s Profile
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F7FAFC; padding: 30px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="color: #718096; font-size: 14px; margin: 0;">
                Cheering you on,<br>
                <strong>Make Friends and Socialize Team</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getMatchDeclinedEmailHtml = (displayName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: Georgia, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #4A5568; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: normal;">Match Update</h1>
              <p style="color: #E2E8F0; margin: 10px 0 0 0; font-size: 16px;">Some news about your recent match</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #2D3748; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                Dear ${displayName},
              </p>
              <p style="color: #4A5568; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                We wanted to let you know that this particular match has come to a close. While it wasn't meant to be this time, please know that finding the right connection takes time.
              </p>
              <p style="color: #4A5568; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                Our matchmakers continue to search for meaningful connections for you. The right person is out there, and we're committed to helping you find them.
              </p>
              
              <!-- Encouragement Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7FAFC; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1B4332;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #4A5568; font-size: 14px; line-height: 1.6; margin: 0;">
                      <strong>Remember:</strong> Every step in this journey brings you closer to finding your person. Stay open, stay authentic, and trust the process. 💚
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-top: 20px;">
                    <a href="${SITE_URL}/portal/slow-dating" 
                       style="display: inline-block; background-color: #1B4332; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-size: 16px;">
                      View Your Matches
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F7FAFC; padding: 30px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="color: #718096; font-size: 14px; margin: 0;">
                With warmth,<br>
                <strong>Make Friends and Socialize Team</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getDatesProposedEmailHtml = (displayName: string, proposerName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: Georgia, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #C65D3B; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: normal;">New Date Proposals!</h1>
              <p style="color: #FFE4D6; margin: 10px 0 0 0; font-size: 16px;">📅 ${proposerName} wants to meet</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #2D3748; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                Exciting news, ${displayName}!
              </p>
              <p style="color: #4A5568; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                <strong>${proposerName}</strong> has proposed some dates to meet! Log in to review their suggested times and select one that works for you.
              </p>
              
              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7FAFC; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1B4332;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #4A5568; font-size: 14px; line-height: 1.6; margin: 0;">
                      <strong>Tip:</strong> Review the proposed dates and accept one that fits your schedule. If none work, you can suggest alternatives.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-top: 20px;">
                    <a href="${SITE_URL}/portal/slow-dating" 
                       style="display: inline-block; background-color: #1B4332; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-size: 16px;">
                      View Date Proposals
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F7FAFC; padding: 30px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="color: #718096; font-size: 14px; margin: 0;">
                With warmth,<br>
                <strong>Make Friends and Socialize Team</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getDateAcceptedEmailHtml = (displayName: string, accepterName: string, meetingDate: string, meetingTime: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: Georgia, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1B4332; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: normal;">Your Date is Confirmed!</h1>
              <p style="color: #A3C9A8; margin: 10px 0 0 0; font-size: 16px;">🎉 ${accepterName} accepted your date</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #2D3748; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                Wonderful news, ${displayName}!
              </p>
              <p style="color: #4A5568; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                <strong>${accepterName}</strong> has accepted one of your proposed dates! Your meeting is now confirmed.
              </p>
              
              <!-- Meeting Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1B4332; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="color: #A3C9A8; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
                      Meeting Date
                    </p>
                    <p style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0; font-weight: bold;">
                      ${meetingDate}
                    </p>
                    <p style="color: #A3C9A8; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
                      Time Slot
                    </p>
                    <p style="color: #ffffff; font-size: 18px; margin: 0;">
                      ${meetingTime}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-top: 20px;">
                    <a href="${SITE_URL}/portal/slow-dating" 
                       style="display: inline-block; background-color: #C65D3B; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-size: 16px;">
                      View Match Details
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F7FAFC; padding: 30px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="color: #718096; font-size: 14px; margin: 0;">
                With warmth,<br>
                <strong>Make Friends and Socialize Team</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getTimeLabel = (timeValue: string): string => {
  const labels: Record<string, string> = {
    morning: 'Morning (10 AM - 12 PM)',
    afternoon: 'Afternoon (2 PM - 5 PM)',
    evening: 'Evening (6 PM - 9 PM)',
  };
  return labels[timeValue] || timeValue;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-dating-notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { notification_id, process_pending }: NotificationRequest = await req.json();

    // If process_pending is true, fetch all pending notifications
    let notifications: any[] = [];
    
    if (notification_id) {
      const { data, error } = await supabaseClient
        .from("notification_queue")
        .select("*")
        .eq("id", notification_id)
        .eq("status", "pending");
      
      if (error) throw error;
      notifications = data || [];
    } else if (process_pending) {
      const { data, error } = await supabaseClient
        .from("notification_queue")
        .select("*")
        .eq("status", "pending")
        .limit(10);
      
      if (error) throw error;
      notifications = data || [];
    }

    console.log(`Processing ${notifications.length} notifications`);

    const results = [];

    for (const notification of notifications) {
      try {
        // Fetch user email
        const { data: userData, error: userError } = await supabaseClient
          .auth.admin.getUserById(notification.user_id);
        
        if (userError || !userData?.user?.email) {
          console.error("Could not fetch user email:", userError);
          continue;
        }

        const userEmail = userData.user.email;
        const displayName = notification.payload?.display_name || "Member";

        // Fetch dating profile to check notification preferences
        const { data: datingProfile } = await supabaseClient
          .from("dating_profiles")
          .select("email_notifications_enabled, push_notifications_enabled, phone_number, sms_notifications_enabled")
          .eq("user_id", notification.user_id)
          .single();

        const emailEnabled = datingProfile?.email_notifications_enabled !== false;
        const pushEnabled = datingProfile?.push_notifications_enabled !== false;

        let emailResult;
        let subject = "";
        let pushTitle = "";
        let pushBody = "";

        switch (notification.notification_type) {
          case "dating_vetted":
            subject = "Welcome to Slow Dating - You've Been Approved! 💚";
            pushTitle = "Profile Approved! 💚";
            pushBody = "Your dating profile has been approved. Start meeting your matches!";
            if (emailEnabled) {
              emailResult = await resend.emails.send({
                from: "Make Friends and Socialize <onboarding@resend.dev>",
                to: [userEmail],
                subject,
                html: getVettedEmailHtml(displayName),
              });
            }
            break;

          case "new_match":
            const matchName = notification.payload?.match_display_name || "Your Match";
            const compatibilityScore = notification.payload?.compatibility_score || 0;
            const matchReason = notification.payload?.match_reason || "A promising connection";

            subject = "You Have a New Match! 💕";
            pushTitle = "New Match! 💕";
            pushBody = `You've been matched with ${matchName}. Check it out!`;
            if (emailEnabled) {
              emailResult = await resend.emails.send({
                from: "Make Friends and Socialize <onboarding@resend.dev>",
                to: [userEmail],
                subject,
                html: getNewMatchEmailHtml(displayName, matchName, compatibilityScore, matchReason),
              });
            }
            break;

          case "meeting_scheduled":
            const meetingDate = notification.payload?.meeting_date || "TBD";
            const meetingTime = getTimeLabel(notification.payload?.meeting_time || "afternoon");

            subject = "Your Meeting is Confirmed! 📅";
            pushTitle = "Meeting Confirmed! 📅";
            pushBody = `Your meeting is scheduled for ${meetingDate}`;
            if (emailEnabled) {
              emailResult = await resend.emails.send({
                from: "Make Friends and Socialize <onboarding@resend.dev>",
                to: [userEmail],
                subject,
                html: getMeetingScheduledEmailHtml(displayName, meetingDate, meetingTime),
              });
            }
            break;

          case "decision_time":
            const decisionMatchName = notification.payload?.match_display_name || "your match";

            subject = "How Did Your Meeting Go? 💭";
            pushTitle = "Decision Time 💭";
            pushBody = "How did your meeting go? Share your decision now.";
            if (emailEnabled) {
              emailResult = await resend.emails.send({
                from: "Make Friends and Socialize <onboarding@resend.dev>",
                to: [userEmail],
                subject,
                html: getDecisionTimeEmailHtml(displayName, decisionMatchName),
              });
            }
            break;

          case "mutual_match":
            const mutualMatchName = notification.payload?.match_display_name || "Your Match";
            const matchId = notification.payload?.match_id || "";

            subject = "🎉 It's a Connection!";
            pushTitle = "It's a Connection! 🎉";
            pushBody = `You and ${mutualMatchName} both want to continue!`;
            if (emailEnabled) {
              emailResult = await resend.emails.send({
                from: "Make Friends and Socialize <onboarding@resend.dev>",
                to: [userEmail],
                subject,
                html: getMutualMatchEmailHtml(displayName, mutualMatchName, matchId),
              });
            }
            break;

          case "match_declined":
            subject = "Match Update";
            pushTitle = "Match Update";
            pushBody = "We have an update about your recent match.";
            if (emailEnabled) {
              emailResult = await resend.emails.send({
                from: "Make Friends and Socialize <onboarding@resend.dev>",
                to: [userEmail],
                subject,
                html: getMatchDeclinedEmailHtml(displayName),
              });
            }
            break;

          case "dates_proposed":
            const proposerName = notification.payload?.proposer_display_name || "Your match";

            subject = "Your Match Has Proposed Dates! 📅";
            pushTitle = "New Date Proposals! 📅";
            pushBody = `${proposerName} wants to schedule a meeting!`;
            if (emailEnabled) {
              emailResult = await resend.emails.send({
                from: "Make Friends and Socialize <onboarding@resend.dev>",
                to: [userEmail],
                subject,
                html: getDatesProposedEmailHtml(displayName, proposerName),
              });
            }
            break;

          case "date_accepted":
            const accepterName = notification.payload?.accepter_display_name || "Your match";
            const acceptedDate = notification.payload?.meeting_date || "TBD";
            const acceptedTime = getTimeLabel(notification.payload?.meeting_time || "afternoon");

            subject = "Your Date is Confirmed! 🎉";
            pushTitle = "Date Confirmed! 🎉";
            pushBody = `${accepterName} accepted your date for ${acceptedDate}!`;
            if (emailEnabled) {
              emailResult = await resend.emails.send({
                from: "Make Friends and Socialize <onboarding@resend.dev>",
                to: [userEmail],
                subject,
                html: getDateAcceptedEmailHtml(displayName, accepterName, acceptedDate, acceptedTime),
              });
            }
            break;

          default:
            console.log(`Unknown notification type: ${notification.notification_type}`);
            continue;
        }

        console.log("Email sent successfully:", emailResult);

        // Send push notification if enabled
        if (pushEnabled && pushTitle && pushBody) {
          try {
            await supabaseClient.functions.invoke("send-push-notification", {
              body: {
                user_id: notification.user_id,
                title: pushTitle,
                body: pushBody,
                data: { url: "/portal/slow-dating" },
                tag: notification.notification_type,
              },
            });
            console.log("Push notification sent successfully");
          } catch (pushError) {
            console.error("Error sending push notification:", pushError);
          }
        }

        // Update notification status
        await supabaseClient
          .from("notification_queue")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", notification.id);

        results.push({ id: notification.id, status: "sent" });
      } catch (emailError: any) {
        console.error("Error sending email:", emailError);

        // Update notification with error
        await supabaseClient
          .from("notification_queue")
          .update({
            status: "failed",
            error_message: emailError.message,
          })
          .eq("id", notification.id);

        results.push({ id: notification.id, status: "failed", error: emailError.message });
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-dating-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
