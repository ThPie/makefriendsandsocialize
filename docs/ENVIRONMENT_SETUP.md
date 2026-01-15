# Environment Setup Guide

This document outlines all required environment variables and how to obtain them.

## Required Environment Variables

### Core Configuration (Auto-configured by Lovable Cloud)

These are automatically set when using Lovable Cloud:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `SUPABASE_DB_URL` | Direct database connection URL |

---

## Error Tracking - Sentry

### `VITE_SENTRY_DSN`

Used for error tracking and performance monitoring in production.

**How to obtain:**

1. Go to [sentry.io](https://sentry.io) and create an account
2. Create a new project → Select "React"
3. Copy the DSN from the project settings
4. Add to your environment: `VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx`

**Optional flags:**
- `VITE_SENTRY_ENABLED=true` - Enable Sentry in development

---

## Analytics - Google Analytics

### `VITE_GA4_MEASUREMENT_ID`

Google Analytics 4 measurement ID for tracking user behavior.

**How to obtain:**

1. Go to [Google Analytics](https://analytics.google.com)
2. Create a property → Select "Web"
3. Enter your domain details
4. Copy the Measurement ID (format: `G-XXXXXXXXXX`)
5. Add: `VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX`

---

## Analytics - Mixpanel (Optional)

### `VITE_MIXPANEL_TOKEN`

Mixpanel for product analytics and user tracking.

**How to obtain:**

1. Go to [Mixpanel](https://mixpanel.com) and create account
2. Create a new project
3. Go to Settings → Project Settings
4. Copy the Token
5. Add: `VITE_MIXPANEL_TOKEN=your_token_here`

---

## Email Service - Resend

### `RESEND_API_KEY`

Used for transactional emails (welcome, notifications, etc.).

**How to obtain:**

1. Go to [Resend](https://resend.com) and create account
2. Verify your domain at [resend.com/domains](https://resend.com/domains)
3. Create an API key at [resend.com/api-keys](https://resend.com/api-keys)
4. Add as Cloud secret: `RESEND_API_KEY=re_xxx...`

**Important:** Domain verification is required for production emails.

---

## Payments - Stripe

### `STRIPE_SECRET_KEY`

Stripe API key for payment processing.

**How to obtain:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Developers → API keys
3. Copy the Secret key (starts with `sk_`)
4. Add as Cloud secret: `STRIPE_SECRET_KEY=sk_xxx...`

### `STRIPE_WEBHOOK_SECRET`

For verifying webhook signatures from Stripe.

**How to obtain:**

1. In Stripe Dashboard → Developers → Webhooks
2. Create endpoint pointing to your edge function
3. Copy the signing secret (starts with `whsec_`)
4. Add as Cloud secret: `STRIPE_WEBHOOK_SECRET=whsec_xxx...`

---

## SMS Service - Twilio

### Twilio Configuration

| Variable | Description |
|----------|-------------|
| `TWILIO_ACCOUNT_SID` | Your Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Your Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number |

**How to obtain:**

1. Go to [Twilio Console](https://console.twilio.com)
2. Copy Account SID and Auth Token from dashboard
3. Get a phone number from Phone Numbers → Manage → Buy a number
4. Add all three as Cloud secrets

---

## Push Notifications - Web Push

### VAPID Keys

| Variable | Description |
|----------|-------------|
| `VAPID_PUBLIC_KEY` | Public key for web push |
| `VAPID_PRIVATE_KEY` | Private key for web push |

**How to generate:**

```bash
npx web-push generate-vapid-keys
```

Copy the output and add both keys as Cloud secrets.

---

## AI Features

### `PERPLEXITY_API_KEY`

For AI-powered features like lead discovery and matching.

**How to obtain:**

1. Go to [Perplexity AI](https://perplexity.ai)
2. Navigate to API settings
3. Generate an API key
4. Add as Cloud secret

### `ELEVENLABS_API_KEY`

For voice features (voice bio recording).

**How to obtain:**

1. Go to [ElevenLabs](https://elevenlabs.io)
2. Create account and go to Profile → API Keys
3. Copy API key
4. Add as Cloud secret

---

## Web Scraping (Optional)

### `FIRECRAWL_API_KEY`

For web scraping in lead discovery.

**How to obtain:**

1. Go to [Firecrawl](https://firecrawl.dev)
2. Create account and get API key
3. Add as Cloud secret

---

## Encryption

### `DATING_ENCRYPTION_KEY`

For encrypting sensitive dating profile data.

**How to generate:**

```bash
# Generate a secure 32-byte key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Add as Cloud secret.

---

## Summary of Required Secrets

### Minimum Required for Production

1. `RESEND_API_KEY` - Email
2. `STRIPE_SECRET_KEY` - Payments
3. `STRIPE_WEBHOOK_SECRET` - Payment webhooks
4. `VITE_SENTRY_DSN` - Error tracking
5. `VITE_GA4_MEASUREMENT_ID` - Analytics

### Optional but Recommended

6. `TWILIO_*` - SMS notifications
7. `VAPID_*` - Push notifications
8. `PERPLEXITY_API_KEY` - AI features
9. `ELEVENLABS_API_KEY` - Voice features
10. `DATING_ENCRYPTION_KEY` - Data encryption

---

## Setting Secrets in Lovable Cloud

1. Open your project in Lovable
2. Go to Settings → Secrets
3. Add each secret with the appropriate name and value
4. Secrets are automatically available in edge functions as `Deno.env.get("SECRET_NAME")`

For client-side variables (prefixed with `VITE_`), they'll be injected at build time.
