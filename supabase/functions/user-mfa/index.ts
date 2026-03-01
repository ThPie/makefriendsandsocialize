import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, code, factorId: providedFactorId } = await req.json();

    if (action === 'check') {
      const { data: factors } = await supabaseUser.auth.mfa.listFactors();
      const hasMfaEnrolled = factors?.totp && factors.totp.length > 0;
      const verifiedFactors = factors?.totp?.filter(f => f.status === 'verified') || [];

      return new Response(
        JSON.stringify({
          mfaEnrolled: hasMfaEnrolled,
          mfaVerified: verifiedFactors.length > 0,
          factorCount: factors?.totp?.length || 0,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'setup') {
      const { data: factors, error: factorError } = await supabaseUser.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'MFS Authenticator'
      });

      if (factorError) {
        console.error('MFA enrollment error:', factorError);
        return new Response(
          JSON.stringify({ error: 'Failed to setup MFA', details: factorError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          factorId: factors.id,
          qrCode: factors.totp.qr_code,
          secret: factors.totp.secret,
          uri: factors.totp.uri,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'verify') {
      if (!code) {
        return new Response(
          JSON.stringify({ error: 'TOTP code is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let targetFactorId = providedFactorId;
      if (!targetFactorId) {
        const { data: factors } = await supabaseUser.auth.mfa.listFactors();
        if (factors?.totp && factors.totp.length > 0) {
          targetFactorId = factors.totp[0].id;
        }
      }

      if (!targetFactorId) {
        return new Response(
          JSON.stringify({ error: 'No MFA factor found. Please set up MFA first.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: challenge, error: challengeError } = await supabaseUser.auth.mfa.challenge({
        factorId: targetFactorId
      });

      if (challengeError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create MFA challenge', details: challengeError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: verifyError } = await supabaseUser.auth.mfa.verify({
        factorId: targetFactorId,
        challengeId: challenge.id,
        code,
      });

      if (verifyError) {
        return new Response(
          JSON.stringify({ error: 'Invalid MFA code', details: verifyError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`MFA verified for user ${user.id}`);
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'unenroll') {
      let targetFactorId = providedFactorId;
      if (!targetFactorId) {
        const { data: factors } = await supabaseUser.auth.mfa.listFactors();
        if (factors?.totp && factors.totp.length > 0) {
          targetFactorId = factors.totp[0].id;
        }
      }

      if (!targetFactorId) {
        return new Response(
          JSON.stringify({ error: 'No MFA factor found' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: unenrollError } = await supabaseUser.auth.mfa.unenroll({
        factorId: targetFactorId,
      });

      if (unenrollError) {
        return new Response(
          JSON.stringify({ error: 'Failed to disable MFA', details: unenrollError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`MFA disabled for user ${user.id}`);
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
    console.error('Error in user-mfa:', error);
    const corsHeaders = getCorsHeaders(req);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
