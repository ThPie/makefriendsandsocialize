import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from '../_shared/cors.ts';



interface MatchRequest {
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  companyName?: string;
  message: string;
  categoryInterest?: string;
  location?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

interface BusinessScore {
  id: string;
  userId: string;
  businessName: string;
  contactEmail: string | null;
  industry: string | null;
  category: string | null;
  location: string | null;
  services: string[] | null;
  packageType: string | null;
  score: number;
}

// Category relationships for fuzzy matching
const categoryRelationships: Record<string, string[]> = {
  "consulting": ["business", "strategy", "management", "advisory"],
  "technology": ["software", "it", "tech", "digital", "web", "app"],
  "marketing": ["advertising", "branding", "social media", "pr", "communications"],
  "finance": ["accounting", "investment", "banking", "financial"],
  "legal": ["law", "attorney", "compliance", "contracts"],
  "healthcare": ["medical", "wellness", "health", "fitness"],
  "real estate": ["property", "real estate", "housing", "commercial"],
  "design": ["creative", "graphic", "ux", "ui", "visual"],
  "education": ["training", "coaching", "learning", "teaching"],
  "hospitality": ["restaurant", "hotel", "travel", "tourism", "events"]
};

function calculateCategoryScore(businessCategory: string | null, businessServices: string[] | null, searchTerms: string[]): number {
  if (!searchTerms.length) return 0;
  
  let score = 0;
  const normalizedCategory = businessCategory?.toLowerCase() || "";
  const normalizedServices = (businessServices || []).map(s => s.toLowerCase());
  
  for (const term of searchTerms) {
    const normalizedTerm = term.toLowerCase();
    
    // Exact match on category
    if (normalizedCategory.includes(normalizedTerm)) {
      score += 100;
      continue;
    }
    
    // Match on services
    if (normalizedServices.some(s => s.includes(normalizedTerm))) {
      score += 75;
      continue;
    }
    
    // Related category match
    for (const [mainCat, related] of Object.entries(categoryRelationships)) {
      if (normalizedCategory.includes(mainCat) && related.includes(normalizedTerm)) {
        score += 50;
        break;
      }
      if (related.includes(normalizedCategory) && (mainCat === normalizedTerm || related.includes(normalizedTerm))) {
        score += 50;
        break;
      }
    }
  }
  
  return score;
}

function calculateLocationScore(businessLocation: string | null, searchLocation: string | null): number {
  if (!searchLocation || !businessLocation) return 0;
  
  const normalizedBusiness = businessLocation.toLowerCase();
  const normalizedSearch = searchLocation.toLowerCase();
  
  // Same city
  if (normalizedBusiness.includes(normalizedSearch) || normalizedSearch.includes(normalizedBusiness)) {
    return 50;
  }
  
  // Check for state/region match
  const businessParts = normalizedBusiness.split(",").map(p => p.trim());
  const searchParts = normalizedSearch.split(",").map(p => p.trim());
  
  for (const bp of businessParts) {
    for (const sp of searchParts) {
      if (bp === sp) return 25;
    }
  }
  
  return 0;
}

function calculatePackageScore(packageType: string | null): number {
  switch (packageType) {
    case "premium": return 30;
    case "pro": return 20;
    case "basic": return 10;
    default: return 5; // Free tier
  }
}

function extractSearchTerms(message: string, categoryInterest?: string): string[] {
  const terms: string[] = [];
  
  if (categoryInterest) {
    terms.push(...categoryInterest.split(/[\s,]+/).filter(t => t.length > 2));
  }
  
  // Extract key terms from message
  const commonWords = new Set(["i", "the", "a", "an", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "must", "can", "need", "want", "looking", "for", "help", "with", "about", "and", "or", "but", "in", "on", "at", "to", "from", "by", "of", "it", "this", "that", "these", "those", "my", "your", "our", "their", "me", "you", "us", "them", "who", "what", "when", "where", "why", "how", "any", "some", "all", "each", "every", "both", "few", "more", "most", "other", "such", "only", "same", "so", "than", "too", "very", "just", "also", "now", "here", "there", "then", "still", "already", "always", "never", "often", "sometimes", "usually", "really", "please", "thank", "thanks"]);
  
  const words = message.toLowerCase().split(/[\s,.\-!?]+/);
  for (const word of words) {
    if (word.length > 3 && !commonWords.has(word) && !terms.includes(word)) {
      terms.push(word);
    }
  }
  
  return terms.slice(0, 10); // Limit to 10 terms
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

    const body: MatchRequest = await req.json();
    console.log("Match request:", { 
      contactName: body.contactName,
      categoryInterest: body.categoryInterest,
      location: body.location
    });

    // Validate required fields
    if (!body.contactName || !body.contactEmail || !body.message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all approved and visible businesses with their packages
    const { data: businesses, error: businessError } = await supabase
      .from("business_profiles")
      .select(`
        id,
        user_id,
        business_name,
        contact_email,
        industry,
        category,
        location,
        services
      `)
      .eq("status", "approved")
      .eq("is_visible", true);

    if (businessError) {
      console.error("Error fetching businesses:", businessError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch businesses" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!businesses || businesses.length === 0) {
      console.log("No approved businesses found");
      return new Response(
        JSON.stringify({ success: true, matchedCount: 0, message: "No businesses available" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get packages for all businesses
    const businessIds = businesses.map(b => b.id);
    const { data: packages } = await supabase
      .from("business_lead_packages")
      .select("business_id, package_type")
      .in("business_id", businessIds)
      .eq("is_active", true);

    const packageMap = new Map<string, string>();
    for (const pkg of packages || []) {
      packageMap.set(pkg.business_id, pkg.package_type);
    }

    // Extract search terms from the inquiry
    const searchTerms = extractSearchTerms(body.message, body.categoryInterest);
    console.log("Search terms:", searchTerms);

    // Score each business
    const scoredBusinesses: BusinessScore[] = businesses.map(b => {
      const categoryScore = calculateCategoryScore(b.category || b.industry, b.services, searchTerms);
      const locationScore = calculateLocationScore(b.location, body.location || null);
      const packageType = packageMap.get(b.id) || null;
      const packageScore = calculatePackageScore(packageType);
      
      return {
        id: b.id,
        userId: b.user_id,
        businessName: b.business_name,
        contactEmail: b.contact_email,
        industry: b.industry,
        category: b.category,
        location: b.location,
        services: b.services,
        packageType,
        score: categoryScore + locationScore + packageScore
      };
    });

    // Sort by score and take top 3
    const topMatches = scoredBusinesses
      .filter(b => b.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    console.log("Top matches:", topMatches.map(m => ({ name: m.businessName, score: m.score })));

    if (topMatches.length === 0) {
      console.log("No matching businesses found");
      return new Response(
        JSON.stringify({ success: true, matchedCount: 0, message: "No matching businesses" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create leads for matched businesses
    const createdLeads: string[] = [];
    
    for (const match of topMatches) {
      // Check if business can receive leads
      const { data: canReceive } = await supabase
        .rpc("can_receive_leads", { p_business_id: match.id });

      if (canReceive === false) {
        console.log(`Business ${match.businessName} at capacity, skipping`);
        continue;
      }

      // Create lead
      const { data: lead, error: insertError } = await supabase
        .from("business_leads")
        .insert({
          business_id: match.id,
          contact_name: body.contactName,
          contact_email: body.contactEmail,
          contact_phone: body.contactPhone || null,
          company_name: body.companyName || null,
          message: body.message,
          source: "ai_matched",
          utm_source: body.utmSource || null,
          utm_medium: body.utmMedium || null,
          utm_campaign: body.utmCampaign || null,
          location: body.location || null,
          category_interest: body.categoryInterest || null,
          matched_at: new Date().toISOString(),
          status: "new"
        })
        .select()
        .single();

      if (insertError) {
        console.error(`Error creating lead for ${match.businessName}:`, insertError);
        continue;
      }

      createdLeads.push(lead.id);

      // Increment lead count
      await supabase.rpc("increment_lead_count", { 
        p_business_id: match.id, 
        p_is_matched: true 
      });

      // Send notification
      try {
        await supabase.functions.invoke("send-business-lead-notification", {
          body: {
            leadId: lead.id,
            businessId: match.id,
            businessName: match.businessName,
            businessEmail: match.contactEmail,
            contactName: body.contactName,
            contactEmail: body.contactEmail,
            message: body.message
          }
        });
      } catch (notifError) {
        console.error("Failed to send notification:", notifError);
      }
    }

    console.log(`Created ${createdLeads.length} leads via AI matching`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        matchedCount: createdLeads.length,
        leadIds: createdLeads
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in match-leads-to-businesses:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
