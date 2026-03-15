/**
 * Shared SMS helper for server-side Twilio SMS sending via connector gateway.
 * Uses LOVABLE_API_KEY + TWILIO_API_KEY (connector gateway) with TWILIO_PHONE_NUMBER.
 * Falls back to direct Twilio API if gateway keys are not available.
 * Safe for background/automated functions — no JWT or admin auth required.
 */

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/twilio';

export interface SendSmsResult {
  success: boolean;
  sid?: string;
  error?: string;
}

export async function sendSms(to: string, message: string): Promise<SendSmsResult> {
  const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
  if (!fromNumber) {
    console.warn("[SMS] TWILIO_PHONE_NUMBER not configured — skipping SMS");
    return { success: false, error: "Twilio phone number not configured" };
  }

  // Basic phone validation
  const cleaned = to.replace(/[\s-]/g, "");
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  if (!phoneRegex.test(cleaned)) {
    console.warn("[SMS] Invalid phone number format:", to.substring(0, 6) + "...");
    return { success: false, error: "Invalid phone number format" };
  }

  try {
    // Try connector gateway first
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const twilioApiKey = Deno.env.get("TWILIO_API_KEY");

    if (lovableApiKey && twilioApiKey) {
      return await sendViaGateway(to, fromNumber, message, lovableApiKey, twilioApiKey);
    }

    // Fallback to direct Twilio API
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");

    if (accountSid && authToken) {
      return await sendDirect(to, fromNumber, message, accountSid, authToken);
    }

    console.warn("[SMS] No Twilio credentials configured — skipping SMS");
    return { success: false, error: "Twilio not configured" };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown SMS error";
    console.error("[SMS] Exception:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

async function sendViaGateway(
  to: string, from: string, body: string,
  lovableApiKey: string, twilioApiKey: string
): Promise<SendSmsResult> {
  console.log("[SMS] Sending via connector gateway");
  const response = await fetch(`${GATEWAY_URL}/Messages.json`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${lovableApiKey}`,
      "X-Connection-Api-Key": twilioApiKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  });

  const result = await response.json();
  if (!response.ok) {
    console.error("[SMS] Gateway error:", result.code, result.message);
    return { success: false, error: result.message || `Twilio gateway error [${response.status}]` };
  }

  console.log("[SMS] Sent successfully via gateway:", result.sid);
  return { success: true, sid: result.sid };
}

async function sendDirect(
  to: string, from: string, body: string,
  accountSid: string, authToken: string
): Promise<SendSmsResult> {
  console.log("[SMS] Sending via direct Twilio API");
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + btoa(`${accountSid}:${authToken}`),
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }),
    }
  );

  const result = await response.json();
  if (!response.ok) {
    console.error("[SMS] Twilio error:", result.code, result.message);
    return { success: false, error: result.message || "Twilio API error" };
  }

  console.log("[SMS] Sent successfully:", result.sid);
  return { success: true, sid: result.sid };
}
