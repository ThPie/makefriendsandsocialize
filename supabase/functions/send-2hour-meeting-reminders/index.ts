import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map time slots to approximate hours for calculation
const TIME_SLOT_HOURS: Record<string, number> = {
  morning: 10,    // 10 AM
  afternoon: 14,  // 2 PM
  evening: 18,    // 6 PM
};

const getTimeLabel = (timeValue: string): string => {
  const labels: Record<string, string> = {
    morning: 'Morning (10 AM)',
    afternoon: 'Afternoon (2 PM)',
    evening: 'Evening (6 PM)',
  };
  return labels[timeValue] || timeValue;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-2hour-meeting-reminders function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const now = new Date();
    const today = now.toISOString().split("T")[0]; // YYYY-MM-DD format
    const currentHour = now.getHours();

    console.log(`Checking for meetings on ${today}, current hour: ${currentHour}`);

    // Find accepted meeting proposals for today
    const { data: proposals, error: proposalsError } = await supabaseClient
      .from("meeting_proposals")
      .select(`
        id,
        match_id,
        proposed_date,
        proposed_time,
        proposed_by,
        dating_matches!meeting_proposals_match_id_fkey (
          id,
          user_a_id,
          user_b_id
        )
      `)
      .eq("status", "accepted")
      .eq("proposed_date", today);

    if (proposalsError) {
      throw proposalsError;
    }

    console.log(`Found ${proposals?.length || 0} accepted proposals for today`);

    const results: any[] = [];

    for (const proposal of proposals || []) {
      const meetingHour = TIME_SLOT_HOURS[proposal.proposed_time] || 14;
      const hoursUntilMeeting = meetingHour - currentHour;

      console.log(`Proposal ${proposal.id}: Meeting at ${meetingHour}, hours until meeting: ${hoursUntilMeeting}`);

      // Send reminder if meeting is between 1.5 and 2.5 hours away
      if (hoursUntilMeeting >= 1.5 && hoursUntilMeeting <= 2.5) {
        // dating_matches is returned as a single object when using FK relationship
        const match = proposal.dating_matches as unknown as { id: string; user_a_id: string; user_b_id: string } | null;
        if (!match) continue;

        const usersToNotify = [match.user_a_id, match.user_b_id];

        for (const userId of usersToNotify) {
          // Check if 2h reminder already sent
          const { data: existingReminder } = await supabaseClient
            .from("dating_meeting_reminders")
            .select("id")
            .eq("meeting_proposal_id", proposal.id)
            .eq("user_id", userId)
            .eq("reminder_type", "2h")
            .single();

          if (existingReminder) {
            console.log(`2h reminder already sent for proposal ${proposal.id}, user ${userId}`);
            continue;
          }

          // Get user's dating profile for notification preferences and name
          const { data: userProfile } = await supabaseClient
            .from("dating_profiles")
            .select("user_id, display_name, push_notifications_enabled")
            .eq("id", userId)
            .single();

          if (!userProfile) {
            console.log(`No dating profile found for user ${userId}`);
            continue;
          }

          // Get the other person's name for the notification
          const otherUserId = userId === match.user_a_id ? match.user_b_id : match.user_a_id;
          const { data: otherProfile } = await supabaseClient
            .from("dating_profiles")
            .select("display_name")
            .eq("id", otherUserId)
            .single();

          const matchName = otherProfile?.display_name || "your match";

          // Record the reminder first to prevent duplicates
          const { error: insertError } = await supabaseClient
            .from("dating_meeting_reminders")
            .insert({
              meeting_proposal_id: proposal.id,
              user_id: userId,
              reminder_type: "2h",
              status: "pending",
            });

          if (insertError) {
            console.error(`Error inserting reminder record: ${insertError.message}`);
            continue;
          }

          // Send push notification if enabled
          if (userProfile.push_notifications_enabled !== false) {
            try {
              const { error: pushError } = await supabaseClient.functions.invoke("send-push-notification", {
                body: {
                  user_id: userProfile.user_id,
                  title: "Your date is in 2 hours! ⏰",
                  body: `Get ready - you're meeting ${matchName} soon!`,
                  data: { 
                    url: `/portal/match/${proposal.match_id}`,
                    type: "meeting-reminder"
                  },
                  tag: "meeting-reminder-2h",
                },
              });

              if (pushError) {
                console.error(`Push notification error: ${pushError.message}`);
                
                // Update reminder status to failed
                await supabaseClient
                  .from("dating_meeting_reminders")
                  .update({ 
                    status: "failed", 
                    error_message: pushError.message 
                  })
                  .eq("meeting_proposal_id", proposal.id)
                  .eq("user_id", userId)
                  .eq("reminder_type", "2h");
              } else {
                console.log(`2h reminder push sent to user ${userId} for proposal ${proposal.id}`);
                
                // Update reminder status to sent
                await supabaseClient
                  .from("dating_meeting_reminders")
                  .update({ 
                    status: "sent", 
                    sent_at: new Date().toISOString() 
                  })
                  .eq("meeting_proposal_id", proposal.id)
                  .eq("user_id", userId)
                  .eq("reminder_type", "2h");

                results.push({
                  proposal_id: proposal.id,
                  user_id: userId,
                  status: "sent",
                });
              }
            } catch (pushError: any) {
              console.error(`Error sending push notification: ${pushError.message}`);
              
              await supabaseClient
                .from("dating_meeting_reminders")
                .update({ 
                  status: "failed", 
                  error_message: pushError.message 
                })
                .eq("meeting_proposal_id", proposal.id)
                .eq("user_id", userId)
                .eq("reminder_type", "2h");
            }
          } else {
            console.log(`Push notifications disabled for user ${userId}`);
            
            // Mark as skipped
            await supabaseClient
              .from("dating_meeting_reminders")
              .update({ 
                status: "skipped", 
                error_message: "Push notifications disabled" 
              })
              .eq("meeting_proposal_id", proposal.id)
              .eq("user_id", userId)
              .eq("reminder_type", "2h");
          }
        }
      }
    }

    console.log(`Processed ${results.length} 2-hour reminders`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length, 
        results,
        timestamp: now.toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-2hour-meeting-reminders:", error);
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
