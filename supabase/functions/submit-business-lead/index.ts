import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from '../_shared/cors.ts';



interface LeadRequest {
  businessId: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  companyName?: string;
  message?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  location?: string;
  categoryInterest?: string;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: LeadRequest = await req.json();
    console.log("Lead submission request:", { 
      businessId: body.businessId, 
      contactName: body.contactName,
      contactEmail: body.contactEmail 
    });

    // Validate required fields
    if (!body.businessId || !body.contactName || !body.contactEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if business exists and is approved
    const { data: business, error: businessError } = await supabase
      .from("business_profiles")
      .select("id, user_id, business_name, contact_email, status")
      .eq("id", body.businessId)
      .eq("status", "approved")
      .single();

    if (businessError || !business) {
      console.error("Business not found or not approved:", businessError);
      return new Response(
        JSON.stringify({ error: "Business not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if business can receive leads (capacity check)
    const { data: canReceive, error: capacityError } = await supabase
      .rpc("can_receive_leads", { p_business_id: body.businessId });

    if (capacityError) {
      console.error("Error checking lead capacity:", capacityError);
      // Continue anyway - don't block the lead
    }

    if (canReceive === false) {
      console.log("Business has reached lead capacity");
      // Still accept the lead but log it
    }

    // Insert the lead
    const { data: lead, error: insertError } = await supabase
      .from("business_leads")
      .insert({
        business_id: body.businessId,
        contact_name: body.contactName,
        contact_email: body.contactEmail,
        contact_phone: body.contactPhone || null,
        company_name: body.companyName || null,
        message: body.message || null,
        source: "direct",
        utm_source: body.utmSource || null,
        utm_medium: body.utmMedium || null,
        utm_campaign: body.utmCampaign || null,
        location: body.location || null,
        category_interest: body.categoryInterest || null,
        status: "new"
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting lead:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to submit lead" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Lead created successfully:", lead.id);

    // Increment lead count
    await supabase.rpc("increment_lead_count", { 
      p_business_id: body.businessId, 
      p_is_matched: false 
    });

    // Send notification to business owner
    try {
      await supabase.functions.invoke("send-business-lead-notification", {
        body: {
          leadId: lead.id,
          businessId: body.businessId,
          businessName: business.business_name,
          businessEmail: business.contact_email,
          contactName: body.contactName,
          contactEmail: body.contactEmail,
          message: body.message
        }
      });
      console.log("Notification sent to business owner");
    } catch (notifError) {
      console.error("Failed to send notification:", notifError);
      // Don't fail the request if notification fails
    }

    return new Response(
      JSON.stringify({ success: true, leadId: lead.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in submit-business-lead:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
