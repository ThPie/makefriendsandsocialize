
Goal: fix your current Twilio credential error (`70051`) first, then make SMS work across all requested flows.

1) Fix the connector error (step-by-step in UI)
- Step 1: In Twilio Console, open the exact account you want to use (main account or a specific subaccount).
- Step 2: Confirm that account’s SID (`AC...`) and region (US1/IE1/AU1).  
- Step 3: Create a **new Standard API Key** (not Restricted).  
- Step 4: Copy values immediately:
  - Account SID: `AC...` (from the same account)
  - API Key SID: `SK...` (new key)
  - API Key Secret: the one shown once at creation
- Step 5: In Lovable connector form, paste those 3 values + matching region.
- Step 6: Retry connection.
- Step 7: If you still get `70051`, it means one of these is mismatched:
  - key belongs to a different account/subaccount than the `AC...`
  - key is inactive/revoked
  - wrong key secret pasted
  - wrong region selected

2) Unblock immediately (fallback path)
- Your backend already has Twilio secrets configured (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`), so we can continue implementation even if connector validation keeps failing.

3) Implementation plan after credentials are fixed
- Keep admin-only SMS sending for manual admin actions.
- Add a shared SMS helper for system notifications.
- Wire SMS into all requested use cases:
  - RSVP confirmation SMS
  - 24h event reminder SMS
  - dating/match notification SMS
- Ensure every SMS path logs success/failure and never breaks the user flow if SMS fails.

4) Important code issue I will fix in the same pass
- Current background notification functions call `send-sms`, but `send-sms` is admin/JWT-guarded; this can block automated sends.
- I’ll refactor automated notification functions to send through a safe server-side path that doesn’t depend on a logged-in admin token.

5) Validation checklist (end-to-end)
- Test 1: Trigger RSVP → see on-screen success + receive SMS.
- Test 2: Trigger event reminder job → receive SMS on opted-in user.
- Test 3: Trigger dating notification/reminder → receive SMS on opted-in user.
- Test 4: Verify failures are logged cleanly (no crash, no silent failure).

Technical details (implementation)
- Files to update:
  - `supabase/functions/send-sms/index.ts` (admin/manual SMS path)
  - `supabase/functions/send-rsvp-notification/index.ts` (add SMS)
  - `supabase/functions/send-event-reminders/index.ts` (add SMS)
  - `supabase/functions/send-dating-notification/index.ts` and `send-dating-reminders/index.ts` (replace blocked internal SMS invoke path)
  - optional shared helper in `supabase/functions/_shared/`
- No database schema change required.
