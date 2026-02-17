import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getCorsHeaders } from '../_shared/cors.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));



interface SendInviteRequest {
  inviter_id: string;
  recipient_email: string;
  personal_message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { inviter_id, recipient_email, personal_message }: SendInviteRequest = await req.json();

    console.log(`Sending referral invite from ${inviter_id} to ${recipient_email}`);

    if (!inviter_id || !recipient_email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get inviter's profile
    const { data: inviter, error: inviterError } = await supabase
      .from("profiles")
      .select("first_name, last_name, referral_code")
      .eq("id", inviter_id)
      .single();

    if (inviterError || !inviter) {
      console.error("Error fetching inviter profile:", inviterError);
      return new Response(
        JSON.stringify({ error: "Inviter not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const inviterName = inviter.first_name 
      ? `${inviter.first_name}${inviter.last_name ? ` ${inviter.last_name}` : ""}`
      : "A member";

    const referralCode = inviter.referral_code;
    
    // Generate app URL with referral code
    const baseUrl = Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".lovable.app") || "";
    const signupUrl = `${baseUrl}/auth?ref=${referralCode}`;

    // Create referral record
    const { error: referralError } = await supabase
      .from("referrals")
      .insert({
        referrer_id: inviter_id,
        referral_code: referralCode,
        referred_email: recipient_email,
        status: "pending",
      });

    if (referralError && !referralError.message.includes("duplicate")) {
      console.error("Error creating referral record:", referralError);
    }

    // Send invitation email
    const emailResponse = await resend.emails.send({
      from: "Club Invitations <onboarding@resend.dev>",
      to: [recipient_email],
      subject: `${inviterName} has invited you to join our exclusive club`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); padding: 50px 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 3px;">YOU'RE INVITED</h1>
                      <p style="color: #cccccc; margin: 16px 0 0; font-size: 14px; letter-spacing: 1px;">EXCLUSIVE MEMBERSHIP</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="color: #333; font-size: 18px; margin: 0 0 24px; line-height: 1.6;">
                        <strong>${inviterName}</strong> thinks you'd be a great fit for our exclusive community.
                      </p>
                      
                      ${personal_message ? `
                      <div style="background-color: #f8f8f8; border-left: 4px solid #1a1a1a; padding: 20px; margin: 0 0 30px; border-radius: 0 8px 8px 0;">
                        <p style="color: #666; font-size: 15px; margin: 0; font-style: italic;">
                          "${personal_message}"
                        </p>
                        <p style="color: #999; font-size: 13px; margin: 12px 0 0;">— ${inviterName}</p>
                      </div>
                      ` : ""}
                      
                      <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                        Join a curated community of professionals who value meaningful connections, 
                        exclusive events, and personal growth.
                      </p>
                      
                      <!-- Benefits -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                            <span style="color: #1a1a1a; font-size: 18px;">✓</span>
                            <span style="color: #666; font-size: 14px; margin-left: 12px;">Access to exclusive events and gatherings</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                            <span style="color: #1a1a1a; font-size: 18px;">✓</span>
                            <span style="color: #666; font-size: 14px; margin-left: 12px;">Connect with like-minded professionals</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                            <span style="color: #1a1a1a; font-size: 18px;">✓</span>
                            <span style="color: #666; font-size: 14px; margin-left: 12px;">Slow Dating matchmaking service</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0;">
                            <span style="color: #1a1a1a; font-size: 18px;">✓</span>
                            <span style="color: #666; font-size: 14px; margin-left: 12px;">Member-only perks and rewards</span>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Special Offer Badge -->
                      <div style="background: linear-gradient(135deg, #f8f4f0 0%, #efe8e1 100%); border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px;">
                        <p style="color: #8b7355; font-size: 12px; letter-spacing: 2px; margin: 0 0 8px; text-transform: uppercase;">Referral Benefit</p>
                        <p style="color: #1a1a1a; font-size: 18px; font-weight: 500; margin: 0;">10% off your first month</p>
                      </div>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="${signupUrl}" 
                               style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; letter-spacing: 1px;">
                              ACCEPT INVITATION
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #999; font-size: 13px; text-align: center; margin: 24px 0 0;">
                        Your referral code: <strong style="color: #1a1a1a;">${referralCode}</strong>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f8f8; padding: 24px; text-align: center; border-top: 1px solid #eee;">
                      <p style="color: #999; font-size: 12px; margin: 0;">
                        This invitation was sent on behalf of ${inviterName}.
                      </p>
                      <p style="color: #999; font-size: 11px; margin: 12px 0 0;">
                        If you didn't expect this email, you can safely ignore it.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Referral invite sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitation sent successfully" 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-referral-invite:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
