# Monitoring & Observability Setup

This document outlines the monitoring infrastructure for MakeFriends Social Club at scale (400K+ users).

## 1. Error Tracking with Sentry

### Setup

1. **Create Sentry Account**
   - Go to [sentry.io](https://sentry.io) and create an account
   - Create a new React project

2. **Configure Environment Variable**
   ```bash
   VITE_SENTRY_DSN=https://your-public-key@sentry.io/project-id
   ```

3. **Features Enabled**
   - Error capturing with stack traces
   - Performance monitoring (10% sampling in production)
   - Session replay for error reproduction
   - User context tracking
   - Release tracking

### Error Boundary
The app includes a global ErrorBoundary component that:
- Catches React rendering errors
- Reports them to Sentry
- Shows a user-friendly error page
- Allows users to submit feedback

### Performance Transactions
Key user journeys are tracked:
- Page navigation
- API call performance
- Authentication flows
- Payment processing

## 2. Uptime Monitoring with UptimeRobot

### Setup Instructions

1. **Create Account**
   - Go to [uptimerobot.com](https://uptimerobot.com)
   - Sign up for free (50 monitors included)

2. **Create Monitors**
   
   | Monitor Type | URL | Check Interval |
   |-------------|-----|----------------|
   | HTTP(s) | `https://makefriends.social` | 5 min |
   | HTTP(s) | `https://makefriends.social/api/health` | 5 min |
   | HTTP(s) | `https://qzqomqctuqldexnxgmlh.supabase.co/rest/v1/` | 5 min |
   | Keyword | `https://makefriends.social` (check for "MakeFriends") | 5 min |

3. **Configure Alerts**
   - Email notifications for downtime
   - Slack webhook integration (optional)
   - SMS alerts for critical issues (paid plan)

4. **Status Page**
   - Create a public status page at `status.makefriends.social`
   - Display all monitor statuses
   - Show incident history

## 3. Analytics with Vercel/Google Analytics

### Google Analytics 4 Setup

1. **Create GA4 Property**
   - Go to [analytics.google.com](https://analytics.google.com)
   - Create new property
   - Get Measurement ID (G-XXXXXXXXXX)

2. **Configure Environment**
   ```bash
   VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. **Events Tracked**
   - `signup` - User registration
   - `login` - User authentication
   - `event_registration` - Event RSVP
   - `subscription_purchase` - Payment completed
   - `trial_started` - Trial initiated
   - `match_revealed` - Dating match revealed
   - Page views (automatic)

### Vercel Analytics (if deployed on Vercel)

1. **Enable in Vercel Dashboard**
   - Go to Project Settings → Analytics
   - Enable Web Analytics
   - Enable Speed Insights

2. **Features**
   - Real User Monitoring (RUM)
   - Core Web Vitals tracking
   - Traffic analytics
   - Geographical distribution

## 4. Conversion Funnel Tracking

### Funnels Configured

#### User Acquisition Funnel
```
landing_page → signup_started → signup_completed → onboarding_started → onboarding_completed
```

#### Subscription Funnel
```
pricing_viewed → plan_selected → checkout_started → payment_completed
```

#### Event Registration Funnel
```
event_viewed → registration_started → registration_completed
```

#### Dating Funnel
```
dating_page_viewed → intake_started → intake_completed → match_received → match_revealed → date_scheduled
```

## 5. Database Monitoring

### Supabase Dashboard
- Query performance metrics
- Connection pool utilization
- Storage usage
- Authentication logs

### Key Queries to Monitor
```sql
-- Slow query log
SELECT * FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 20;

-- Connection stats
SELECT * FROM pg_stat_activity;

-- Table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 6. Alerting Thresholds

### Critical (Page immediately)
- Site down > 2 minutes
- Error rate > 5% of requests
- Payment failures > 3 in 5 minutes
- Database connections > 90%

### Warning (Email notification)
- Response time > 2 seconds
- Error rate > 1%
- Failed login attempts > 10/minute
- Disk usage > 80%

### Info (Dashboard only)
- New user signups
- Event registrations
- Subscription changes

## 7. Log Aggregation

### Edge Function Logs
- Available in Lovable Cloud dashboard
- Retention: 7 days
- Search by function name

### Application Logs
- Console logs captured by Sentry
- Structured logging format:
  ```
  [COMPONENT] Action - {details}
  ```

## 8. Health Checks

### Endpoints to Create

```typescript
// /api/health - Basic health check
GET /api/health
Response: { status: "ok", timestamp: "2024-01-15T12:00:00Z" }

// /api/health/db - Database connectivity
GET /api/health/db
Response: { status: "ok", latency_ms: 12 }

// /api/health/stripe - Stripe connectivity
GET /api/health/stripe
Response: { status: "ok", mode: "live" }
```

## 9. Performance Budgets

| Metric | Target | Maximum |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | 2.5s |
| Largest Contentful Paint | < 2.5s | 4.0s |
| Time to Interactive | < 3.5s | 7.0s |
| Cumulative Layout Shift | < 0.1 | 0.25 |
| Total Bundle Size | < 500KB | 1MB |

## 10. Incident Response

### Runbook
1. **Detection** - Automated alert received
2. **Acknowledgment** - Assign owner within 5 minutes
3. **Investigation** - Check Sentry, logs, and metrics
4. **Mitigation** - Apply fix or rollback
5. **Resolution** - Confirm issue resolved
6. **Post-mortem** - Document within 24 hours

### Escalation Path
1. On-call engineer
2. Tech lead
3. CTO
4. External support (Supabase, Stripe)
