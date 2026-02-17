import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders } from '../_shared/cors.ts';



// SHA-1 hash function using Web Crypto API
async function sha1Hash(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

// Check password against Have I Been Pwned API using k-anonymity
async function checkPasswordBreached(password: string): Promise<{ isBreached: boolean; count: number }> {
  try {
    const hash = await sha1Hash(password);
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'User-Agent': 'MakeFriendsAndSocialize-PasswordChecker',
      },
    });

    if (!response.ok) {
      console.error('HIBP API error:', response.status);
      return { isBreached: false, count: 0 };
    }

    const text = await response.text();
    const lines = text.split('\n');

    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(':');
      if (hashSuffix.trim() === suffix) {
        const count = parseInt(countStr.trim(), 10);
        console.log(`Password found in ${count} breaches`);
        return { isBreached: true, count };
      }
    }

    return { isBreached: false, count: 0 };
  } catch (error) {
    console.error('Error checking password:', error);
    return { isBreached: false, count: 0 };
  }
}

// Check for common weak password patterns
function checkWeakPatterns(password: string): { isWeak: boolean; reason: string | null } {
  const lowerPassword = password.toLowerCase();
  
  // Common weak patterns
  const weakPatterns = [
    /^123456/,
    /^password/i,
    /^qwerty/i,
    /^abc123/i,
    /^letmein/i,
    /^welcome/i,
    /^admin/i,
    /^login/i,
    /^111111/,
    /^12345678/,
  ];

  for (const pattern of weakPatterns) {
    if (pattern.test(lowerPassword)) {
      return { isWeak: true, reason: 'Password matches a commonly used weak pattern' };
    }
  }

  // Check for sequential characters
  const sequences = ['abcdefgh', '12345678', 'qwertyui', 'asdfghjk'];
  for (const seq of sequences) {
    if (lowerPassword.includes(seq) || lowerPassword.includes(seq.split('').reverse().join(''))) {
      return { isWeak: true, reason: 'Password contains sequential characters' };
    }
  }

  // Check for repeated characters
  if (/(.)\1{4,}/.test(password)) {
    return { isWeak: true, reason: 'Password contains too many repeated characters' };
  }

  return { isWeak: false, reason: null };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password } = await req.json();

    if (!password || typeof password !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Password is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check minimum length
    if (password.length < 10) {
      return new Response(
        JSON.stringify({
          isSecure: false,
          reason: 'Password must be at least 10 characters',
          severity: 'error',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for weak patterns first (faster)
    const patternCheck = checkWeakPatterns(password);
    if (patternCheck.isWeak) {
      return new Response(
        JSON.stringify({
          isSecure: false,
          reason: patternCheck.reason,
          severity: 'error',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check against breached passwords database
    const breachCheck = await checkPasswordBreached(password);
    if (breachCheck.isBreached) {
      const formattedCount = breachCheck.count.toLocaleString();
      return new Response(
        JSON.stringify({
          isSecure: false,
          reason: `This password has appeared in ${formattedCount} data breaches. Please choose a different one.`,
          severity: 'error',
          breachCount: breachCheck.count,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Password passes all checks
    return new Response(
      JSON.stringify({
        isSecure: true,
        reason: null,
        severity: null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in check-password-strength:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
