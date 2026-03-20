import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from '../_shared/cors.ts';
import { buildBrandedEmail, SENDERS, SITE_URL, p, infoBox, detailRow, alertBox } from '../_shared/email-layout.ts';

interface UncontactedLead {
  id: string;
  contact_name: string;
  contact_email: string;
  company_name: string | null;
  created_at: string;
  business_id: string;
  business_name: string;
  business_contact_email: string;
  business_user_id: string;
  hours_old: number;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Checking for uncontacted leads...");

    const { data: leads, error: leadsError } = await supabase
      .from("business_leads")
      .select(`
        id,
        contact_name,
        contact_email,
        company_name,
        created_at,
        business_id,
        business_profiles!inner (
          business_name,
          contact_email,
          user_id
        )
      `)
      .eq("status", "new")
      .is("contacted_at", null)
      .order("created_at", { ascending: true });

    if (leadsError) {
      console.error("Error fetching leads:", leadsError);
      throw leadsError;
    }

    if (!leads || leads.length === 0) {
      console.log("No uncontacted leads found");
      return new Response(
        JSON.stringify({ message: "No uncontacted leads to remind about", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${leads.length} uncontacted leads`);

    const { data: existingReminders } = await supabase
      .from("lead_followup_reminders")
      .select("lead_id, reminder_type");

    const reminderSet = new Set(
      existingReminders?.map((r) => `${r.lead_id}-${r.reminder_type}`) || []
    );

    const remindersToSend: {
      lead: UncontactedLead;
      reminderType: "24h" | "48h" | "72h";
    }[] = [];

    for (const lead of leads) {
      const hoursOld = Math.floor(
        (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60)
      );

      const businessProfile = lead.business_profiles as unknown as {
        business_name: string;
        contact_email: string;
        user_id: string;
      };

      const enrichedLead: UncontactedLead = {
        id: lead.id,
        contact_name: lead.contact_name,
        contact_email: lead.contact_email,
        company_name: lead.company_name,
        created_at: lead.created_at,
        business_id: lead.business_id,
        business_name: businessProfile.business_name,
        business_contact_email: businessProfile.contact_email,
        business_user_id: businessProfile.user_id,
        hours_old: hoursOld,
      };

      if (hoursOld >= 72 && !reminderSet.has(`${lead.id}-72h`)) {
        remindersToSend.push({ lead: enrichedLead, reminderType: "72h" });
      } else if (hoursOld >= 48 && hoursOld < 72 && !reminderSet.has(`${lead.id}-48h`)) {
        remindersToSend.push({ lead: enrichedLead, reminderType: "48h" });
      } else if (hoursOld >= 24 && hoursOld < 48 && !reminderSet.has(`${lead.id}-24h`)) {
        remindersToSend.push({ lead: enrichedLead, reminderType: "24h" });
      }
    }

    console.log(`${remindersToSend.length} reminders to send`);

    let sentCount = 0;
    const errors: string[] = [];

    for (const { lead, reminderType } of remindersToSend) {
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(
          lead.business_user_id
        );

        const recipientEmail =
          lead.business_contact_email || authUser?.user?.email;

        if (!recipientEmail) {
          console.log(`No email found for business ${lead.business_id}`);
          continue;
        }

        let urgencyMessage = "";
        let urgencyLevel = "";
        switch (reminderType) {
          case "24h":
            urgencyMessage = "has been waiting for 24 hours";
            urgencyLevel = "Friendly Reminder";
            break;
          case "48h":
            urgencyMessage = "has been waiting for 48 hours. Leads contacted within 48h are 3x more likely to convert!";
            urgencyLevel = "Important";
            break;
          case "72h":
            urgencyMessage = "has been waiting for 72 hours. This is a final reminder — leads older than 72h have significantly lower conversion rates.";
            urgencyLevel = "Final Reminder";
            break;
        }

        if (resendApiKey) {
          const emailHtml = buildBrandedEmail({
            preheader: `Follow-up reminder: ${lead.contact_name} is waiting`,
            heading: "Lead Follow-Up Reminder",
            subheading: urgencyLevel,
            body: `
              ${p(`Your lead <strong style="color:#0D1F0F;">${lead.contact_name}</strong>${lead.company_name ? ` from ${lead.company_name}` : ''} ${urgencyMessage}.`)}
              ${infoBox(`
                <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#8B6914;font-weight:600;">Contact Details</p>
                ${detailRow('👤', 'Name', lead.contact_name)}
                <p style="margin:0 0 10px;font-size:14px;color:#4A5A4D;line-height:22px;">📧 <strong style="color:#0D1F0F;">Email:</strong> <a href="mailto:${lead.contact_email}" style="color:#8B6914;text-decoration:none;">${lead.contact_email}</a></p>
                ${lead.company_name ? detailRow('🏢', 'Company', lead.company_name) : ''}
              `)}
              ${reminderType === '72h' ? alertBox(`<p style="margin:0;font-size:14px;color:#856404;text-align:center;">⚡ This is your final reminder. Quick response times lead to higher conversion rates!</p>`) : ''}
            `,
            ctaUrl: `${SITE_URL}/portal/business`,
            ctaText: "View in Dashboard",
            footerText: "The Founders Circle · Quick response times lead to higher conversion rates.",
          });

          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: SENDERS.business,
              to: [recipientEmail],
              subject: `⏰ Follow-up reminder: ${lead.contact_name} is waiting`,
              html: emailHtml,
            }),
          });

          if (!emailResponse.ok) {
            const error = await emailResponse.text();
            console.error("Resend error:", error);
            errors.push(`Email failed for ${lead.id}: ${error}`);
            continue;
          }
        }

        await supabase.from("lead_followup_reminders").insert({
          lead_id: lead.id,
          business_id: lead.business_id,
          reminder_type: reminderType,
          sent_at: new Date().toISOString(),
        });

        await supabase.from("notification_queue").insert({
          user_id: lead.business_user_id,
          notification_type: "lead_followup_reminder",
          payload: {
            lead_id: lead.id,
            lead_name: lead.contact_name,
            company_name: lead.company_name,
            reminder_type: reminderType,
            hours_waiting: lead.hours_old,
          },
        });

        sentCount++;
        console.log(`Sent ${reminderType} reminder for lead ${lead.id}`);
      } catch (err) {
        console.error(`Error processing lead ${lead.id}:`, err);
        errors.push(`Lead ${lead.id}: ${err}`);
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${remindersToSend.length} leads, sent ${sentCount} reminders`,
        processed: sentCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-lead-followup-reminders:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
