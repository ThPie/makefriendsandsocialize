# Production Deployment Checklist

Complete guide for deploying the application to production.

## Pre-Deployment Checklist

### 1. Environment Variables

- [ ] All secrets configured in Lovable Cloud (see ENVIRONMENT_SETUP.md)
- [ ] `RESEND_API_KEY` - Domain verified at resend.com/domains
- [ ] `STRIPE_SECRET_KEY` - Using live key (not test)
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook endpoint configured
- [ ] `VITE_SENTRY_DSN` - Sentry project created
- [ ] `VITE_GA4_MEASUREMENT_ID` - GA4 property configured

### 2. Database

- [ ] All migrations applied
- [ ] RLS policies reviewed and tested
- [ ] Indexes created for common queries
- [ ] Seed data removed (test users, events)

### 3. Authentication

- [ ] Email templates customized
- [ ] Auto-confirm disabled for production
- [ ] OAuth providers configured (if using)
- [ ] Password policies set

---

## Cloudflare CDN Setup

### Step 1: Add Domain to Cloudflare

1. Sign up at [cloudflare.com](https://cloudflare.com)
2. Add your domain
3. Update nameservers at your registrar
4. Wait for DNS propagation (up to 48 hours)

### Step 2: Configure DNS

Add the following records:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | @ | your-lovable-app.lovable.app | Proxied |
| CNAME | www | your-lovable-app.lovable.app | Proxied |

### Step 3: SSL/TLS Settings

1. Go to SSL/TLS → Overview
2. Set mode to "Full (strict)"
3. Enable "Always Use HTTPS"
4. Enable "Automatic HTTPS Rewrites"

### Step 4: Caching Rules

1. Go to Caching → Configuration
2. Set Browser Cache TTL: 1 month
3. Enable "Always Online"

### Step 5: Performance

1. Go to Speed → Optimization
2. Enable "Auto Minify" for JS, CSS, HTML
3. Enable "Brotli" compression
4. Enable "Rocket Loader" (optional, test first)

### Step 6: Security

1. Go to Security → Settings
2. Set Security Level: Medium
3. Enable "Bot Fight Mode"
4. Configure WAF rules as needed

---

## UptimeRobot Monitoring Setup

### Step 1: Create Account

1. Go to [UptimeRobot](https://uptimerobot.com)
2. Create free account (50 monitors included)

### Step 2: Add Monitors

Create the following monitors:

#### Main Website
- Monitor Type: HTTP(s)
- Friendly Name: "Production - Main Site"
- URL: `https://yourdomain.com`
- Monitoring Interval: 5 minutes

#### API Health Check
- Monitor Type: HTTP(s)
- Friendly Name: "Production - API"
- URL: `https://qzqomqctuqldexnxgmlh.supabase.co/rest/v1/`
- Monitoring Interval: 5 minutes

#### Edge Functions (sample)
- Monitor Type: HTTP(s) - Keyword
- Friendly Name: "Edge Function - Check Subscription"
- URL: `https://qzqomqctuqldexnxgmlh.supabase.co/functions/v1/check-subscription`
- Keyword: (expected response content)

### Step 3: Configure Alerts

1. Go to "My Settings" → "Alert Contacts"
2. Add email alerts for the team
3. Optional: Add Slack/Discord webhook integration
4. Set alert frequency to avoid spam

### Step 4: Status Page (Optional)

1. Create public status page at uptimerobot.com
2. Add all monitors to status page
3. Share URL with users: `https://stats.uptimerobot.com/xxxxx`

---

## Running Tests

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm run test

# Run with coverage
npm run test -- --coverage

# Watch mode for development
npm run test -- --watch
```

### E2E Tests (Playwright)

```bash
# Install browsers (first time only)
npx playwright install

# Run all E2E tests
npx playwright test

# Run with UI
npx playwright test --ui

# Run specific test file
npx playwright test e2e/user-registration.spec.ts

# Generate test report
npx playwright show-report
```

### Pre-deployment test commands

```bash
# Full test suite
npm run test && npx playwright test

# Type checking
npx tsc --noEmit

# Lint check
npm run lint
```

---

## Load Testing with k6

### Installation

```bash
# macOS
brew install k6

# Windows
choco install k6

# Linux
sudo apt-get install k6
```

### Sample Load Test Script

Create `k6/load-test.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 20 },   // Stay at 20 users
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 0 },   // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% failures
  },
};

const BASE_URL = 'https://yourdomain.com';

export default function () {
  // Test homepage
  const homeRes = http.get(BASE_URL);
  check(homeRes, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in < 1s': (r) => r.timings.duration < 1000,
  });

  sleep(1);

  // Test events page
  const eventsRes = http.get(`${BASE_URL}/events`);
  check(eventsRes, {
    'events page status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // Test API endpoint
  const apiRes = http.get(
    'https://qzqomqctuqldexnxgmlh.supabase.co/rest/v1/events?select=id,title&limit=10',
    {
      headers: {
        'apikey': 'YOUR_ANON_KEY',
        'Content-Type': 'application/json',
      },
    }
  );
  check(apiRes, {
    'API status is 200': (r) => r.status === 200,
    'API returns data': (r) => JSON.parse(r.body).length > 0,
  });

  sleep(2);
}
```

### Running Load Tests

```bash
# Basic run
k6 run k6/load-test.js

# With output to file
k6 run --out json=results.json k6/load-test.js

# With InfluxDB (for Grafana dashboards)
k6 run --out influxdb=http://localhost:8086/k6 k6/load-test.js
```

### Interpreting Results

Key metrics to monitor:
- **http_req_duration**: Response time (aim for p95 < 500ms)
- **http_req_failed**: Error rate (aim for < 1%)
- **vus**: Virtual users at any point
- **iterations**: Total completed test iterations

---

## Final Deployment Steps

### 1. Deploy to Production

In Lovable:
1. Click "Share" → "Publish"
2. Confirm deployment
3. Wait for build to complete

### 2. Connect Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed
4. Wait for SSL certificate provisioning

### 3. Post-Deployment Verification

- [ ] Homepage loads correctly
- [ ] Authentication works (signup, login, logout)
- [ ] Events page displays data
- [ ] Payment flow works (use Stripe test mode first)
- [ ] Emails are sending
- [ ] Error tracking captures test error
- [ ] Analytics tracking events

### 4. Monitoring Verification

- [ ] UptimeRobot monitors are "Up"
- [ ] Sentry receives test events
- [ ] GA4 shows real-time users

---

## Rollback Procedure

If issues are found post-deployment:

1. In Lovable, go to Version History
2. Find the last stable version
3. Click "Restore" to rollback
4. Verify the rollback was successful

---

## Support Contacts

- Lovable Support: support@lovable.dev
- Supabase Status: status.supabase.com
- Stripe Status: status.stripe.com
