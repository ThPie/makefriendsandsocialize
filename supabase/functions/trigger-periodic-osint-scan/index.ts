import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';



interface MemberForScan {
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
  country: string | null;
  job_title: string | null;
  industry: string | null;
  bio: string | null;
  last_scanned_at: string | null;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting periodic OSINT scan check...');

    // Calculate the cutoff date (90 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    const cutoffISO = cutoffDate.toISOString();

    // Fetch active members who haven't been scanned in 90+ days or never scanned
    const { data: membersToScan, error: fetchError } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        city,
        country,
        job_title,
        industry,
        bio,
        last_scanned_at
      `)
      .or(`last_scanned_at.is.null,last_scanned_at.lt.${cutoffISO}`)
      .limit(10); // Process 10 members per run to avoid timeouts

    if (fetchError) {
      console.error('Error fetching members for scan:', fetchError);
      throw new Error('Failed to fetch members for scanning');
    }

    if (!membersToScan || membersToScan.length === 0) {
      console.log('No members due for periodic scan');
      return new Response(
        JSON.stringify({ success: true, message: 'No members due for scanning', scanned: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${membersToScan.length} members due for periodic scan`);

    // Fetch emails for these members from auth.users
    const memberIds = membersToScan.map(m => m.id);
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      throw new Error('Failed to fetch user emails');
    }

    const emailMap = new Map<string, string>();
    authUsers.users.forEach(user => {
      if (memberIds.includes(user.id)) {
        emailMap.set(user.id, user.email || '');
      }
    });

    // Process each member
    const results = [];
    for (const member of membersToScan) {
      const email = emailMap.get(member.id) || '';
      
      if (!email) {
        console.log(`Skipping member ${member.id} - no email found`);
        continue;
      }

      console.log(`Triggering OSINT scan for member: ${member.first_name || 'Unknown'} ${member.last_name || ''}`);

      try {
        // Call the deep-osint-analysis function
        const response = await fetch(`${supabaseUrl}/functions/v1/deep-osint-analysis`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            userId: member.id,
            email: email,
            firstName: member.first_name || '',
            lastName: member.last_name || '',
            city: member.city || '',
            country: member.country || '',
            jobTitle: member.job_title || '',
            industry: member.industry || '',
            bio: member.bio || '',
            scanType: 'periodic',
          }),
        });

        const result = await response.json();
        results.push({
          userId: member.id,
          success: result.success,
          status: result.report?.status || 'unknown',
        });

        console.log(`Scan completed for ${member.id}: ${result.success ? 'success' : 'failed'}`);
      } catch (scanError) {
        console.error(`Error scanning member ${member.id}:`, scanError);
        results.push({
          userId: member.id,
          success: false,
          error: String(scanError),
        });
      }
    }

    console.log(`Periodic scan completed. Processed ${results.length} members.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Periodic scan completed`, 
        scanned: results.length,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in periodic OSINT scan:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
