import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrackReferralRequest {
  referral_code: string;
  new_user_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { referral_code, new_user_id }: TrackReferralRequest = await req.json();

    console.log(`Tracking referral: code=${referral_code}, new_user=${new_user_id}`);

    if (!referral_code || !new_user_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Find the referrer by their referral code
    const { data: referrer, error: referrerError } = await supabase
      .from("profiles")
      .select("id, first_name, referral_count")
      .eq("referral_code", referral_code.toUpperCase())
      .single();

    if (referrerError || !referrer) {
      console.log(`Invalid referral code: ${referral_code}`);
      return new Response(
        JSON.stringify({ error: "Invalid referral code", valid: false }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Make sure user isn't referring themselves
    if (referrer.id === new_user_id) {
      return new Response(
        JSON.stringify({ error: "Cannot refer yourself", valid: false }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user was already referred
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("referred_by")
      .eq("id", new_user_id)
      .single();

    if (existingProfile?.referred_by) {
      console.log(`User ${new_user_id} was already referred`);
      return new Response(
        JSON.stringify({ error: "User already has a referrer", valid: false }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update the new user's profile with the referrer
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ referred_by: referrer.id })
      .eq("id", new_user_id);

    if (updateError) {
      console.error("Error updating profile with referrer:", updateError);
      throw updateError;
    }

    // Create a referral record
    const { error: referralError } = await supabase
      .from("referrals")
      .insert({
        referrer_id: referrer.id,
        referral_code: referral_code.toUpperCase(),
        referred_user_id: new_user_id,
        status: "signed_up",
      });

    if (referralError) {
      console.error("Error creating referral record:", referralError);
      // Don't throw, profile was already updated
    }

    // Determine reward based on referral count
    const newReferralCount = (referrer.referral_count || 0) + 1;
    let rewardType: string | null = null;
    let badgeType: string | null = null;

    if (newReferralCount === 1) {
      badgeType = "connector";
      rewardType = "connector_badge";
    } else if (newReferralCount === 3) {
      rewardType = "free_month";
    } else if (newReferralCount === 5) {
      badgeType = "ambassador";
      rewardType = "ambassador_badge";
    } else if (newReferralCount === 10) {
      badgeType = "community_builder";
      rewardType = "lifetime_vip";
    }

    // Award badge if applicable
    if (badgeType) {
      const { error: badgeError } = await supabase
        .from("member_badges")
        .insert({
          user_id: referrer.id,
          badge_type: badgeType,
        });

      if (badgeError && !badgeError.message.includes("duplicate")) {
        console.error("Error awarding badge:", badgeError);
      } else {
        console.log(`Awarded ${badgeType} badge to ${referrer.id}`);
      }
    }

    // Queue notification for referrer
    await supabase.from("notification_queue").insert({
      user_id: referrer.id,
      notification_type: "referral_signup",
      payload: {
        message: "Someone joined using your referral code!",
        referral_count: newReferralCount,
        reward_type: rewardType,
      },
    });

    console.log(`Referral tracked successfully. Referrer: ${referrer.id}, New user: ${new_user_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        valid: true,
        referrer_name: referrer.first_name,
        message: "Referral tracked successfully" 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in track-referral:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
