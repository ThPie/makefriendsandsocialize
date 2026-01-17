import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_URL = 'https://qzqomqctuqldexnxgmlh.lovableproject.com';

// Input validation schemas
const NewDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "time must be in HH:MM format"),
});

const RequestSchema = z.object({
  token: z.string().min(1, "token is required").max(500, "token too long"),
  action: z.enum(['confirm', 'reschedule', 'cancel', 'get'], {
    errorMap: () => ({ message: "action must be one of: confirm, reschedule, cancel, get" })
  }),
  newDates: z.array(NewDateSchema).max(5, "maximum 5 new dates allowed").optional(),
  reason: z.string().max(500, "reason must be less than 500 characters").optional(),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    // Parse and validate input
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const parseResult = RequestSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      console.error("Validation failed:", errorMessage);
      return new Response(
        JSON.stringify({ error: `Invalid input: ${errorMessage}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { token, action, newDates, reason } = parseResult.data;

    // Get the confirmation request
    const { data: confirmationRequest, error: fetchError } = await supabase
      .from('date_confirmation_requests')
      .select(`
        *,
        meeting_proposals (
          *,
          dating_matches (
            *,
            user_a:dating_profiles!dating_matches_user_a_id_fkey (
              id, user_id, display_name, photo_url
            ),
            user_b:dating_profiles!dating_matches_user_b_id_fkey (
              id, user_id, display_name, photo_url
            )
          )
        )
      `)
      .eq('confirmation_token', token)
      .single();

    if (fetchError || !confirmationRequest) {
      return new Response(JSON.stringify({ error: 'Invalid or expired confirmation token' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if expired
    if (new Date(confirmationRequest.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'This confirmation link has expired' }), {
        status: 410,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if already actioned
    if (confirmationRequest.status !== 'pending' && action !== 'get') {
      return new Response(JSON.stringify({ 
        error: 'This confirmation has already been processed',
        status: confirmationRequest.status 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const proposal = confirmationRequest.meeting_proposals;
    const match = proposal?.dating_matches;

    if (!match) {
      return new Response(JSON.stringify({ error: 'Meeting details not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Determine who is the current user and who is the match
    const isUserA = confirmationRequest.user_id === match.user_a?.user_id;
    const currentUserProfile = isUserA ? match.user_a : match.user_b;
    const matchProfile = isUserA ? match.user_b : match.user_a;

    if (action === 'get') {
      // Just return the meeting details
      return new Response(JSON.stringify({
        success: true,
        meeting: {
          date: proposal.proposed_date,
          time: proposal.proposed_time,
          matchName: matchProfile?.display_name || 'Your match',
          userName: currentUserProfile?.display_name || 'You',
          status: confirmationRequest.status,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'confirm') {
      // Update confirmation request
      await supabase
        .from('date_confirmation_requests')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', confirmationRequest.id);

      // Notify the match
      await supabase
        .from('notification_queue')
        .insert({
          user_id: matchProfile?.user_id,
          notification_type: 'date_confirmation',
          payload: {
            match_display_name: currentUserProfile?.display_name,
            meeting_date: proposal.proposed_date,
            meeting_time: proposal.proposed_time,
            confirmed: true,
          },
        });

      // Send email to match
      if (resend && matchProfile?.user_id) {
        const { data: matchUser } = await supabase.auth.admin.getUserById(matchProfile.user_id);
        if (matchUser?.user?.email) {
          await resend.emails.send({
            from: 'Slow Dating <notifications@resend.dev>',
            to: [matchUser.user.email],
            subject: `✅ ${currentUserProfile?.display_name || 'Your match'} confirmed for tomorrow!`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #333;">Great news! 🎉</h1>
                <p>${currentUserProfile?.display_name || 'Your match'} has confirmed they'll be there for your date tomorrow!</p>
                <p><strong>Date:</strong> ${proposal.proposed_date}<br>
                <strong>Time:</strong> ${proposal.proposed_time}</p>
                <p>Have a wonderful time!</p>
              </div>
            `,
          });
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Your attendance has been confirmed. Your match will be notified!' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'reschedule') {
      // Update confirmation request
      await supabase
        .from('date_confirmation_requests')
        .update({
          status: 'reschedule_requested',
          response_notes: reason || 'User requested to reschedule',
        })
        .eq('id', confirmationRequest.id);

      // Update original proposal status
      await supabase
        .from('meeting_proposals')
        .update({ status: 'rescheduled' })
        .eq('id', proposal.id);

      // Create new proposals if dates provided
      if (newDates && newDates.length > 0) {
        const newProposals = newDates.map(d => ({
          match_id: match.id,
          proposed_by: currentUserProfile?.id,
          proposed_date: d.date,
          proposed_time: d.time,
          status: 'proposed',
        }));

        await supabase
          .from('meeting_proposals')
          .insert(newProposals);
      }

      // Notify the match about reschedule request
      await supabase
        .from('notification_queue')
        .insert({
          user_id: matchProfile?.user_id,
          notification_type: 'reschedule_requested',
          payload: {
            match_display_name: currentUserProfile?.display_name,
            original_date: proposal.proposed_date,
            reason: reason || 'Schedule conflict',
            new_dates_proposed: newDates?.length || 0,
          },
        });

      // Send email to match
      if (resend && matchProfile?.user_id) {
        const { data: matchUser } = await supabase.auth.admin.getUserById(matchProfile.user_id);
        if (matchUser?.user?.email) {
          await resend.emails.send({
            from: 'Slow Dating <notifications@resend.dev>',
            to: [matchUser.user.email],
            subject: `📅 ${currentUserProfile?.display_name || 'Your match'} needs to reschedule`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #333;">Reschedule Request</h1>
                <p>${currentUserProfile?.display_name || 'Your match'} needs to reschedule your date originally planned for ${proposal.proposed_date}.</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                ${newDates && newDates.length > 0 ? `
                  <p>They've proposed ${newDates.length} new date(s). Check your portal to respond!</p>
                ` : ''}
                <a href="${SITE_URL}/portal/slow-dating" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">View New Dates</a>
              </div>
            `,
          });
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Reschedule request sent. Your match will be notified.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'cancel') {
      // Update confirmation request
      await supabase
        .from('date_confirmation_requests')
        .update({
          status: 'cancelled',
          response_notes: reason || 'User cancelled',
        })
        .eq('id', confirmationRequest.id);

      // Update proposal status
      await supabase
        .from('meeting_proposals')
        .update({ status: 'cancelled' })
        .eq('id', proposal.id);

      // Update match meeting status
      await supabase
        .from('dating_matches')
        .update({ meeting_status: 'cancelled' })
        .eq('id', match.id);

      // Notify the match
      await supabase
        .from('notification_queue')
        .insert({
          user_id: matchProfile?.user_id,
          notification_type: 'date_cancelled',
          payload: {
            match_display_name: currentUserProfile?.display_name,
            original_date: proposal.proposed_date,
            reason: reason,
          },
        });

      // Send email to match
      if (resend && matchProfile?.user_id) {
        const { data: matchUser } = await supabase.auth.admin.getUserById(matchProfile.user_id);
        if (matchUser?.user?.email) {
          await resend.emails.send({
            from: 'Slow Dating <notifications@resend.dev>',
            to: [matchUser.user.email],
            subject: `Date with ${currentUserProfile?.display_name || 'your match'} cancelled`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #333;">Date Cancelled</h1>
                <p>Unfortunately, ${currentUserProfile?.display_name || 'your match'} had to cancel your date planned for ${proposal.proposed_date}.</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                <p>Don't worry - we'll help you find a new match soon!</p>
              </div>
            `,
          });
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Date has been cancelled. We hope to see you again soon!' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in handle-date-confirmation:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);
