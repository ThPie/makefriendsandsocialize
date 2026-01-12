import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client for service operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user client to verify the user
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error('User verification failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: adminRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!adminRole) {
      return new Response(
        JSON.stringify({ error: 'User is not an admin' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, code } = await req.json();

    if (action === 'setup') {
      // Generate a TOTP secret for MFA setup
      // Using Supabase Auth MFA enrollment
      const { data: factors, error: factorError } = await supabaseUser.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Admin MFA'
      });

      if (factorError) {
        console.error('MFA enrollment error:', factorError);
        return new Response(
          JSON.stringify({ error: 'Failed to setup MFA', details: factorError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Store MFA status
      await supabaseAdmin
        .from('admin_mfa_status')
        .upsert({
          user_id: user.id,
          mfa_enabled: false,
          mfa_required_since: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      console.log(`MFA setup initiated for admin ${user.id}`);

      return new Response(
        JSON.stringify({
          success: true,
          factorId: factors.id,
          qrCode: factors.totp.qr_code,
          secret: factors.totp.secret,
          uri: factors.totp.uri
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'verify') {
      // Verify TOTP code and create session
      if (!code) {
        return new Response(
          JSON.stringify({ error: 'TOTP code is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get the user's MFA factors
      const { data: factors } = await supabaseUser.auth.mfa.listFactors();
      
      if (!factors?.totp || factors.totp.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No MFA factors found. Please set up MFA first.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const totpFactor = factors.totp[0];

      // Create a challenge
      const { data: challenge, error: challengeError } = await supabaseUser.auth.mfa.challenge({
        factorId: totpFactor.id
      });

      if (challengeError) {
        console.error('MFA challenge error:', challengeError);
        return new Response(
          JSON.stringify({ error: 'Failed to create MFA challenge', details: challengeError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify the challenge with the code
      const { data: verifyData, error: verifyError } = await supabaseUser.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.id,
        code: code
      });

      if (verifyError) {
        console.error('MFA verification failed:', verifyError);
        return new Response(
          JSON.stringify({ error: 'Invalid MFA code', details: verifyError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create MFA session
      const sessionExpiry = new Date();
      sessionExpiry.setHours(sessionExpiry.getHours() + 2);

      const { data: session, error: sessionError } = await supabaseAdmin
        .from('admin_mfa_sessions')
        .insert({
          user_id: user.id,
          expires_at: sessionExpiry.toISOString(),
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown'
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Failed to create MFA session:', sessionError);
        return new Response(
          JSON.stringify({ error: 'Failed to create session', details: sessionError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update MFA status
      await supabaseAdmin
        .from('admin_mfa_status')
        .upsert({
          user_id: user.id,
          mfa_enabled: true,
          last_mfa_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      console.log(`MFA verified for admin ${user.id}, session created: ${session.id}`);

      return new Response(
        JSON.stringify({
          success: true,
          sessionToken: session.session_token,
          expiresAt: session.expires_at
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'check') {
      // Check if user has valid MFA session
      const { data: mfaSession } = await supabaseAdmin
        .from('admin_mfa_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const { data: mfaStatus } = await supabaseAdmin
        .from('admin_mfa_status')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Check if user has MFA factors enrolled
      const { data: factors } = await supabaseUser.auth.mfa.listFactors();
      const hasMfaEnrolled = factors?.totp && factors.totp.length > 0;

      return new Response(
        JSON.stringify({
          mfaEnrolled: hasMfaEnrolled,
          mfaEnabled: mfaStatus?.mfa_enabled || false,
          sessionValid: !!mfaSession,
          sessionExpiresAt: mfaSession?.expires_at || null
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'logout') {
      // Invalidate all MFA sessions for this user
      await supabaseAdmin
        .from('admin_mfa_sessions')
        .delete()
        .eq('user_id', user.id);

      console.log(`MFA sessions cleared for admin ${user.id}`);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-admin-mfa:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
