import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Verify the caller is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { emails } = await req.json();
    if (!Array.isArray(emails) || emails.length === 0) {
      return new Response(JSON.stringify({ matches: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Limit to prevent abuse
    const limitedEmails = emails.slice(0, 200).map((e: string) => e.toLowerCase());

    // Query auth.users for matching emails and join with profiles for names
    const { data: users, error } = await supabase.auth.admin.listUsers({
      perPage: 1000,
    });

    if (error) {
      console.error('Error listing users:', error);
      return new Response(JSON.stringify({ matches: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Filter users whose emails match the provided list
    const matchedUsers = (users?.users || []).filter(
      (u) => u.email && limitedEmails.includes(u.email.toLowerCase())
    );

    // Get profile names for matched users
    const matchedIds = matchedUsers.map((u) => u.id);
    let profileMap = new Map<string, string>();

    if (matchedIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name')
        .in('id', matchedIds);

      if (profiles) {
        profiles.forEach((p: any) => {
          profileMap.set(p.id, p.first_name || 'Member');
        });
      }
    }

    const matches = matchedUsers
      .filter((u) => u.id !== user.id) // Exclude the caller
      .map((u) => ({
        email: u.email!.toLowerCase(),
        id: u.id,
        name: profileMap.get(u.id) || 'Member',
      }));

    return new Response(JSON.stringify({ matches }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('match-contacts error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
