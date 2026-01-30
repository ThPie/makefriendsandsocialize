
# Comprehensive QA/QC Assessment Report
## Pre-Domain Connection Audit

This comprehensive assessment covers email processes (Resend), APIs (SMS/Twilio), edge functions, design consistency, and security vulnerabilities across your MakeFriends & Socialize platform.

---

## Executive Summary

| Category | Status | Critical Issues | Warnings | Info |
|----------|--------|-----------------|----------|------|
| Email (Resend) | 🟡 Needs Work | 2 | 5 | 2 |
| SMS (Twilio) | ✅ Good | 0 | 1 | 0 |
| Edge Functions | 🟡 Needs Work | 1 | 22 | 0 |
| Design/Branding | 🔴 Critical | 4 | 6 | 0 |
| Security | 🟡 Needs Work | 2 | 4 | 1 |
| API Configuration | 🟡 Needs Work | 1 | 1 | 0 |

---

## 1. EMAIL SYSTEM (Resend) - Critical Fixes Required

### 1.1 CRITICAL: Sandbox Domain Still in Use

All 14+ email-sending edge functions use `onboarding@resend.dev` (Resend sandbox):

```text
send-dating-notification/index.ts     → "Make Friends and Socialize <onboarding@resend.dev>"
send-waitlist-notification/index.ts   → "Events <onboarding@resend.dev>"
send-event-reminders/index.ts         → "Club Events <onboarding@resend.dev>"
send-security-alert/index.ts          → "Security Alerts <onboarding@resend.dev>"
send-referral-invite/index.ts         → "Club Invitations <onboarding@resend.dev>"
send-referral-notification/index.ts   → "Club Referrals <onboarding@resend.dev>"
send-profile-notification/index.ts    → "Make Friends and Socialize <onboarding@resend.dev>"
send-rsvp-notification/index.ts       → "Events <onboarding@resend.dev>"
send-appeal-confirmation/index.ts     → "Make Friends & Socialize <onboarding@resend.dev>"
send-appeal-notification/index.ts     → "Make Friends & Socialize <onboarding@resend.dev>"
send-password-changed-email/index.ts  → "MakeFriends & Socialize <onboarding@resend.dev>"
send-dating-reminders/index.ts        → "Make Friends and Socialize <onboarding@resend.dev>"
send-business-lead-notification       → "MakeFriends <noreply@updates.makefriends.com>" ⚠️ Different domain!
```

**Impact:** Emails go to spam, get rate-limited, and show "via resend.dev" which damages trust.

**Fix Required:**
1. Verify domain `makefriendsandsocialize.com` in Resend Dashboard
2. Update ALL edge functions to use verified domain sender addresses
3. Standardize sender naming (some use "MakeFriends", others "Make Friends and Socialize")

### 1.2 Email Template Issues

| Issue | Affected Functions | Severity |
|-------|-------------------|----------|
| Hardcoded old URLs (makefriends.social) | event-confirmation.tsx, subscription-renewed.tsx, payment-failed.tsx, welcome.tsx | Medium |
| Inconsistent branding names | Multiple functions | Low |
| Missing footer unsubscribe links | All marketing-style emails | Medium |
| No email preference checking | Some functions | Medium |

### 1.3 Recommended Email Domain Strategy

```text
noreply@makefriendsandsocialize.com      → Transactional (password reset, verification)
events@makefriendsandsocialize.com       → Event reminders, RSVPs
hello@makefriendsandsocialize.com        → Welcome, referrals
security@makefriendsandsocialize.com     → Security alerts
dating@makefriendsandsocialize.com       → Slow Dating notifications
```

---

## 2. SMS SYSTEM (Twilio) - Good Condition

### 2.1 Configuration Status
- ✅ `TWILIO_ACCOUNT_SID` configured
- ✅ `TWILIO_AUTH_TOKEN` configured
- ✅ `TWILIO_PHONE_NUMBER` configured

### 2.2 Security Analysis

**Good Practices Found:**
- Admin-only access restriction
- Rate limiting (50 SMS/hour per admin)
- Phone number validation regex
- Audit logging with masked phone numbers
- No sensitive data in logs

**One Warning:**
- The `send-sms` function is auth-protected but `send-dating-reminders` calls it internally without re-validating admin status (acceptable for scheduled jobs)

---

## 3. EDGE FUNCTIONS - 22 Files Need Updates

### 3.1 CRITICAL: Outdated Deno Standard Library

**22 functions use deprecated version `0.168.0`:**

```text
scrape-meetup-events/index.ts
test-push-notification/index.ts
send-waitlist-notification/index.ts
encrypt-sensitive-data/index.ts
admin-rate-limiter/index.ts
find-matches/index.ts
scrape-meetup/index.ts
verify-admin-mfa/index.ts
scheduled-lead-discovery/index.ts
generate-daily-quote/index.ts
elevenlabs-scribe-token/index.ts
scheduled-event-sync/index.ts
sync-meetup-upcoming-events/index.ts
preprocess-dating-profile/index.ts
verify-social-profiles/index.ts
api-rate-limiter/index.ts
detect-location/index.ts
find-leads/index.ts
send-rsvp-notification/index.ts
send-push-notification/index.ts
deep-osint-analysis/index.ts
verify-business-profile/index.ts
```

**Required Update:** Change to `0.190.0` for edge-runtime compatibility

### 3.2 Inconsistent Supabase Client Versions

```text
@supabase/supabase-js@2.7.1    → send-waitlist-notification, send-rsvp-notification
@supabase/supabase-js@2.50.0   → oauth-rate-limiter
@supabase/supabase-js@2.57.2   → send-sms, stripe-webhook, generate-daily-quote
@supabase/supabase-js@2.89.0   → send-event-reminders, send-referral-invite
@supabase/supabase-js@2        → Most other functions (auto-resolves to latest)
```

**Fix:** Standardize all to `@supabase/supabase-js@2.89.0` or `@2` (latest)

### 3.3 Missing STRIPE_WEBHOOK_SECRET

The stripe-webhook function checks for `STRIPE_WEBHOOK_SECRET` but will skip signature verification if not set:

```javascript
if (webhookSecret) {
  event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
} else {
  event = JSON.parse(body); // INSECURE FALLBACK
}
```

**Required:** Add `STRIPE_WEBHOOK_SECRET` to secrets before production

### 3.4 CORS Headers Inconsistency

Most functions use basic headers:
```javascript
'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
```

But the recommended headers include additional Supabase client headers:
```javascript
'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version'
```

**Affected:** 30+ functions should be updated

---

## 4. DESIGN & BRANDING - Critical Inconsistencies

### 4.1 CRITICAL: Multiple Conflicting Domain References

| URL Pattern | Location | Status |
|-------------|----------|--------|
| `the-gathering.lovable.app` | send-dating-notification, send-dating-reminders, send-profile-notification | ❌ OLD/WRONG |
| `makefriends.social` | email templates (welcome, event-confirmation, etc.) | ❌ OLD/WRONG |
| `preview--make-friends-socialize.lovable.app` | send-security-alert | ❌ PREVIEW URL |
| `makefriendsandsocializecom.lovable.app` | send-business-lead-notification | ⚠️ Lovable URL |
| `makefriendsandsocialize.com` | send-password-changed-email, send-appeal-* | ✅ CORRECT |

**Fix Required:** All URLs should use `makefriendsandsocialize.com` (or use `SITE_URL` env variable)

### 4.2 SITE_URL Environment Variable

**Functions with hardcoded fallbacks:**
- send-dating-notification: `https://the-gathering.lovable.app` ❌
- send-dating-reminders: `https://the-gathering.lovable.app` ❌
- send-waitlist-notification: `https://lovable.dev` ❌
- send-business-lead-notification: `https://makefriendsandsocializecom.lovable.app` ⚠️

**Fix:** Add `SITE_URL=https://makefriendsandsocialize.com` as a secret and update all fallbacks

### 4.3 Brand Name Inconsistencies

Found variations across the codebase:
- "Make Friends and Socialize"
- "MakeFriends & Socialize"
- "MakeFriends Social Club"
- "The Gathering"
- "Make Friends & Socialize"

**Standardize to:** "MakeFriends & Socialize" or "Make Friends and Socialize" (pick one)

### 4.4 Email Contact Addresses

Multiple email addresses referenced:
- `hello@makefriends.social` (wrong domain)
- `hello@makefriendsandsocialize.com` ✅
- `billing@makefriends.social` (wrong domain)
- `support@makefriendsandsocialize.com` ✅

---

## 5. SECURITY FINDINGS

### 5.1 Critical Security Issues (from automated scan)

| Finding | Severity | Table/Function |
|---------|----------|----------------|
| Customer Personal Data Could Be Stolen | 🔴 ERROR | profiles table |
| Business Lead Contact Information Exposure | 🔴 ERROR | business_leads table |
| Referred Email Addresses Harvesting Risk | 🟡 WARN | referrals table |
| Dating Sensitive Data RLS Bypass | 🟡 WARN | get_dating_profile_sensitive_data |
| Session Tokens in LocalStorage | 🟡 WARN | useSessionManager.ts |
| Analytics Events Injection | 🟡 WARN | analytics_events table |

### 5.2 Database Linter Warning

```text
WARN: Function Search Path Mutable
One or more functions do not have search_path set, which could allow schema injection attacks.
```

### 5.3 Missing Secrets

| Secret | Status | Required For |
|--------|--------|--------------|
| STRIPE_WEBHOOK_SECRET | ❌ NOT CONFIGURED | Stripe webhook signature verification |
| SITE_URL | ❌ NOT CONFIGURED | Email link generation |

---

## 6. API CONFIGURATION

### 6.1 Stripe Configuration
- ✅ STRIPE_SECRET_KEY configured
- ⚠️ STRIPE_WEBHOOK_SECRET NOT configured (critical for production)
- ✅ Price IDs properly mapped
- ✅ Trial period updated to 30 days

### 6.2 External API Dependencies

| API | Secret | Status | Notes |
|-----|--------|--------|-------|
| Resend | RESEND_API_KEY | ✅ | Domain verification needed |
| Twilio | TWILIO_* (3 secrets) | ✅ | Working |
| ElevenLabs | ELEVENLABS_API_KEY | ✅ | Voice features |
| Perplexity | PERPLEXITY_API_KEY | ✅ | AI features |
| Firecrawl | FIRECRAWL_API_KEY | ✅ | Meetup scraping |
| VAPID | VAPID_PUBLIC/PRIVATE_KEY | ✅ | Push notifications |

---

## 7. FIX IMPLEMENTATION PLAN

### Phase 1: Critical Pre-Launch (Do Before Domain Connection)

```text
Priority 1 - Email Domain (2-3 hours)
├── Verify makefriendsandsocialize.com in Resend
├── Update 14 edge functions with correct sender addresses
├── Standardize brand name across all emails
└── Test email delivery

Priority 2 - URL Fixes (1 hour)
├── Add SITE_URL secret: https://makefriendsandsocialize.com
├── Update hardcoded URLs in 6 edge functions
└── Fix email template URLs

Priority 3 - Stripe Webhook Security (30 min)
├── Add STRIPE_WEBHOOK_SECRET to secrets
├── Get webhook secret from Stripe Dashboard → Webhooks → Signing secret
└── Test webhook signature verification

Priority 4 - Deno Library Updates (1-2 hours)
├── Update 22 functions from 0.168.0 → 0.190.0
├── Standardize Supabase client versions
└── Test all affected functions
```

### Phase 2: Security Hardening (Post-Launch)

```text
├── Encrypt business_leads contact information
├── Add field-level RLS to profiles table
├── Set search_path on database functions
├── Implement rate limiting on analytics insertions
└── Review session token storage strategy
```

### Phase 3: Polish & Consistency

```text
├── Standardize CORS headers across all functions
├── Add email preference checking to all notifications
├── Implement unsubscribe links in marketing emails
└── Add comprehensive logging to all functions
```

---

## 8. FILES TO MODIFY

### Email Domain Updates (14 files)

| File | Change |
|------|--------|
| supabase/functions/send-dating-notification/index.ts | Update sender, SITE_URL fallback |
| supabase/functions/send-waitlist-notification/index.ts | Update sender, SITE_URL fallback |
| supabase/functions/send-event-reminders/index.ts | Update sender |
| supabase/functions/send-security-alert/index.ts | Update sender, fix preview URL |
| supabase/functions/send-referral-invite/index.ts | Update sender |
| supabase/functions/send-referral-notification/index.ts | Update sender |
| supabase/functions/send-profile-notification/index.ts | Update sender, fix URLs |
| supabase/functions/send-rsvp-notification/index.ts | Update sender |
| supabase/functions/send-appeal-confirmation/index.ts | Update sender |
| supabase/functions/send-appeal-notification/index.ts | Update sender |
| supabase/functions/send-password-changed-email/index.ts | Update sender |
| supabase/functions/send-dating-reminders/index.ts | Update sender, SITE_URL fallback |
| supabase/functions/send-business-notification/index.ts | Update sender |
| supabase/functions/send-admin-access-alert/index.ts | Update sender |

### Deno Version Updates (22 files)
All files listed in Section 3.1

### Email Templates (4 files)
| File | Change |
|------|--------|
| supabase/functions/_shared/email-templates/welcome.tsx | Fix makefriends.social URLs |
| supabase/functions/_shared/email-templates/event-confirmation.tsx | Fix makefriends.social URLs |
| supabase/functions/_shared/email-templates/subscription-renewed.tsx | Fix makefriends.social URLs |
| supabase/functions/_shared/email-templates/payment-failed.tsx | Fix makefriends.social URLs |

---

## 9. VERIFICATION CHECKLIST

Before connecting domain, verify:

- [ ] Domain verified in Resend Dashboard
- [ ] All emails send from @makefriendsandsocialize.com
- [ ] STRIPE_WEBHOOK_SECRET configured
- [ ] SITE_URL secret added
- [ ] All URLs point to production domain
- [ ] Test email delivery to multiple providers (Gmail, Outlook)
- [ ] Test Stripe webhook with test events
- [ ] Test SMS sending
- [ ] Test push notifications
- [ ] Verify OAuth redirects work with new domain

---

## 10. ESTIMATED EFFORT

| Phase | Time | Priority |
|-------|------|----------|
| Phase 1: Critical Pre-Launch | 4-6 hours | 🔴 MUST DO |
| Phase 2: Security Hardening | 3-4 hours | 🟡 SHOULD DO |
| Phase 3: Polish | 2-3 hours | 🟢 NICE TO HAVE |

**Recommendation:** Complete Phase 1 before connecting the production domain. Phase 2 and 3 can be done incrementally after launch.
