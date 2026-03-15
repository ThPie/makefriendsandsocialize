/**
 * Shared SMS helper for server-side Twilio SMS sending.
 * Uses TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER secrets directly.
 * Safe for background/automated functions — no JWT or admin auth required.
 */

export interface SendSmsResult {
  success: boolean;
  sid?: string;
  error?: string;
}

export async function sendSms(to: string, message: string): Promise<SendSmsResult> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!accountSid || !authToken || !fromNumber) {
    console.warn("[SMS] Twilio not configured — skipping SMS");
    return { success: false, error: "Twilio not configured" };
  }

  // Basic phone validation
  const cleaned = to.replace(/[\s-]/g, "");
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  if (!phoneRegex.test(cleaned)) {
    console.warn("[SMS] Invalid phone number format:", to.substring(0, 6) + "...");
    return { success: false, error: "Invalid phone number format" };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Basic " + btoa(`${accountSid}:${authToken}`),
        },
        body: new URLSearchParams({
          To: to,
          From: fromNumber,
          Body: message,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("[SMS] Twilio error:", result.code, result.message);
      return { success: false, error: result.message || "Twilio API error" };
    }

    console.log("[SMS] Sent successfully:", result.sid);
    return { success: true, sid: result.sid };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown SMS error";
    console.error("[SMS] Exception:", errorMsg);
    return { success: false, error: errorMsg };
  }
}
