# Full Application Technical Audit Prompt

## Instructions for AI Analysis

You are acting as a **Senior Full-Stack Developer**, **Expert UI/UX Designer**, **Security Engineer**, and **DevOps Specialist** conducting a comprehensive step-by-step audit of a social club and networking platform. Analyze every aspect critically and provide actionable recommendations.

---

## Platform Overview

This is a **curated social club platform** featuring:
- Member portal with profiles, connections, and networking
- Event management with RSVP, waitlists, and check-in
- Slow dating matchmaking with AI-powered compatibility scoring
- Business directory with lead generation
- Connected Circles (exclusive community groups)
- Journal/Blog with social features
- Multi-tier membership subscriptions

**Tech Stack:**
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion
- Backend: Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- Payments: Stripe
- Email: Resend
- SMS: Twilio
- Monitoring: Sentry

---

## STEP-BY-STEP AUDIT PROCESS

Complete each step fully before moving to the next. Document all findings.

---

## STEP 1: ARCHITECTURE & CODE STRUCTURE AUDIT

### Files to Review:
```
src/App.tsx
src/main.tsx
src/contexts/AuthContext.tsx
src/integrations/supabase/client.ts
vite.config.ts
tailwind.config.ts
```

### Analysis Checklist:
- [ ] Is the routing structure logical and scalable?
- [ ] Are there circular dependencies?
- [ ] Is code splitting implemented properly?
- [ ] Are contexts used appropriately vs prop drilling?
- [ ] Is the folder structure following best practices?
- [ ] Are there any barrel exports causing bundle bloat?

### Questions to Answer:
1. What is the current bundle size? Are there optimization opportunities?
2. Are dynamic imports used for route-based code splitting?
3. Is the component hierarchy clean or deeply nested?
4. Are there any anti-patterns in state management?

### Deliverable:
```
📁 ARCHITECTURE REPORT
├── Bundle Analysis
├── Dependency Graph Issues
├── Recommended Restructuring
└── Priority Refactoring List
```

---

## STEP 2: AUTHENTICATION & SECURITY AUDIT

### Files to Review:
```
src/contexts/AuthContext.tsx
src/pages/AuthPage.tsx
src/pages/AuthCallbackPage.tsx
src/pages/ForgotPasswordPage.tsx
src/pages/ResetPasswordPage.tsx
src/components/auth/*.tsx
src/hooks/useInactivityLogout.ts
src/hooks/useSessionManager.ts
src/hooks/useAuthRateLimit.ts
supabase/functions/verify-admin-mfa/index.ts
supabase/functions/send-security-alert/index.ts
supabase/functions/oauth-rate-limiter/index.ts
```

### Security Checklist:
- [ ] Is email verification enforced before access?
- [ ] Are passwords validated for strength?
- [ ] Is MFA implemented correctly for admins?
- [ ] Are session tokens properly managed?
- [ ] Is there protection against brute force attacks?
- [ ] Are OAuth callbacks secure?
- [ ] Is there CSRF protection?
- [ ] Are sensitive routes protected?

### RLS Policy Audit:
Review ALL tables for:
- [ ] RLS enabled on every table
- [ ] Policies are not overly permissive
- [ ] No `true` policies without justification
- [ ] Proper user_id checks on CRUD operations
- [ ] Service role usage is minimized

### Questions to Answer:
1. Can a user access another user's data?
2. Are there any endpoints without authentication?
3. Is sensitive data (phone, social URLs) properly encrypted?
4. Are rate limits in place on all sensitive endpoints?

### Deliverable:
```
🔒 SECURITY REPORT
├── 🔴 Critical Vulnerabilities
├── 🟠 High-Risk Issues
├── 🟡 Medium Concerns
├── RLS Policy Matrix
└── Remediation Roadmap
```

---

## STEP 3: DATABASE SCHEMA & PERFORMANCE AUDIT

### Schema Review:
Analyze all tables in the database for:
- [ ] Proper indexing on frequently queried columns
- [ ] Foreign key relationships are correct
- [ ] No orphaned data possibilities
- [ ] Timestamps (created_at, updated_at) on all tables
- [ ] Enum types used appropriately

### Key Tables to Audit:
```
profiles
memberships
events
event_rsvps
dating_profiles
dating_matches
connections
business_profiles
business_leads
circle_applications
```

### Query Performance:
- [ ] Are there N+1 query patterns in the codebase?
- [ ] Are complex joins optimized?
- [ ] Is pagination implemented correctly?
- [ ] Are there missing indexes causing slow queries?

### Questions to Answer:
1. What happens at 10,000 users? 100,000?
2. Are there tables without RLS that should have it?
3. Are cascade deletes set up correctly?
4. Is there a data archival strategy?

### Deliverable:
```
🗄️ DATABASE REPORT
├── Schema Optimization Recommendations
├── Missing Indexes List
├── N+1 Query Locations
├── Scalability Concerns
└── SQL Optimization Scripts
```

---

## STEP 4: EDGE FUNCTIONS AUDIT

### Files to Review:
```
supabase/functions/*/index.ts
```

### Categories to Audit:

**Authentication & Security:**
- verify-admin-mfa
- oauth-rate-limiter
- admin-rate-limiter
- api-rate-limiter
- send-security-alert
- check-password-strength

**Payments & Subscriptions:**
- stripe-webhook
- create-subscription-checkout
- create-reveal-checkout
- customer-portal
- check-subscription
- handle-payment-failed

**Dating/Matching:**
- find-matches
- preprocess-dating-profile
- reveal-match
- send-dating-notification
- send-dating-reminders
- handle-date-confirmation

**Notifications:**
- send-push-notification
- send-sms
- process-notification-bundles
- notification-throttle
- send-event-reminders
- send-2hour-meeting-reminders

**Business Features:**
- submit-business-lead
- find-leads
- match-leads-to-businesses
- send-business-lead-notification
- verify-business-profile
- deep-osint-analysis

### Checklist for Each Function:
- [ ] Input validation (Zod schemas)
- [ ] Error handling is comprehensive
- [ ] Secrets are not hardcoded
- [ ] CORS headers are correct
- [ ] Rate limiting where needed
- [ ] Logging is adequate but not excessive
- [ ] Response formats are consistent

### Questions to Answer:
1. Are there functions that could be combined?
2. Are there race conditions?
3. Is error handling consistent across all functions?
4. Are webhook signatures verified?

### Deliverable:
```
⚡ EDGE FUNCTIONS REPORT
├── Function-by-Function Analysis
├── Security Vulnerabilities
├── Performance Bottlenecks
├── Consolidation Opportunities
└── Error Handling Improvements
```

---

## STEP 5: UI/UX COMPREHENSIVE AUDIT

### Pages to Review:

**Public Pages:**
```
src/pages/HomePage.tsx
src/pages/AboutPage.tsx
src/pages/EventsPage.tsx
src/pages/ContactPage.tsx
src/pages/MembershipPage.tsx
src/pages/SlowDatingLandingPage.tsx
src/pages/BusinessLandingPage.tsx
```

**Member Portal:**
```
src/pages/portal/PortalDashboard.tsx
src/pages/portal/PortalProfile.tsx
src/pages/portal/PortalEvents.tsx
src/pages/portal/PortalSlowDating.tsx
src/pages/portal/PortalConnections.tsx
src/pages/portal/PortalBusiness.tsx
```

**Admin Dashboard:**
```
src/pages/admin/AdminDashboard.tsx
src/pages/admin/AdminMembers.tsx
src/pages/admin/AdminEvents.tsx
src/pages/admin/AdminDating.tsx
src/pages/admin/AdminMatches.tsx
```

### UX Checklist:
- [ ] Is navigation intuitive?
- [ ] Are loading states properly shown?
- [ ] Are error states handled gracefully?
- [ ] Is there appropriate feedback for user actions?
- [ ] Are empty states designed well?
- [ ] Is the mobile experience optimized?
- [ ] Is accessibility (ARIA, keyboard nav) implemented?

### UI Consistency Checklist:
- [ ] Is the design system used consistently?
- [ ] Are colors from the theme tokens?
- [ ] Is typography hierarchy clear?
- [ ] Are spacing/padding consistent?
- [ ] Are animations purposeful and not excessive?

### Large Files to Refactor:
```
src/pages/DatingIntakePage.tsx (~2200 lines)
src/pages/portal/PortalSlowDating.tsx
src/pages/admin/AdminEvents.tsx
```

### Questions to Answer:
1. What is the average time to complete key user flows?
2. Where are users most likely to drop off?
3. Are there accessibility violations?
4. Is the mobile experience on par with desktop?

### Deliverable:
```
🎨 UI/UX REPORT
├── Usability Issues by Priority
├── Accessibility Violations
├── Mobile Responsiveness Issues
├── Component Refactoring Plan
├── Design System Inconsistencies
└── User Flow Optimization Recommendations
```

---

## STEP 6: COMPONENT ARCHITECTURE AUDIT

### Component Categories:

**UI Primitives (shadcn):**
```
src/components/ui/*.tsx
```

**Feature Components:**
```
src/components/dating/*.tsx
src/components/portal/*.tsx
src/components/admin/*.tsx
src/components/home/*.tsx
src/components/business/*.tsx
src/components/events/*.tsx
```

**Layout Components:**
```
src/components/layout/*.tsx
```

### Checklist:
- [ ] Are components properly typed with TypeScript?
- [ ] Are props interfaces well-defined?
- [ ] Is there prop drilling that should use context?
- [ ] Are components too large (>300 lines)?
- [ ] Are there duplicate component patterns?
- [ ] Is error boundary implementation adequate?

### Custom Hooks Audit:
```
src/hooks/*.ts
```
- [ ] Are hooks following best practices?
- [ ] Is there duplicate logic that could be extracted?
- [ ] Are dependencies correctly specified in useEffect?
- [ ] Are there potential memory leaks?

### Deliverable:
```
🧩 COMPONENT REPORT
├── Over-sized Components List
├── Duplicate Pattern Identification
├── Prop Drilling Issues
├── Hook Optimization Recommendations
└── Refactoring Priority Matrix
```

---

## STEP 7: STATE MANAGEMENT & DATA FLOW AUDIT

### Files to Review:
```
src/contexts/*.tsx
src/hooks/use*.ts
```

### Data Fetching Patterns:
- [ ] Is React Query used consistently?
- [ ] Are cache invalidation strategies correct?
- [ ] Is optimistic UI implemented where appropriate?
- [ ] Are loading/error states handled uniformly?

### State Management:
- [ ] Is global state minimal and justified?
- [ ] Are there props being passed >3 levels deep?
- [ ] Is derived state computed correctly?
- [ ] Are there stale closure issues?

### Deliverable:
```
📊 STATE MANAGEMENT REPORT
├── Data Flow Diagram
├── Redundant State Locations
├── Cache Strategy Recommendations
├── Context Optimization
└── Performance Improvements
```

---

## STEP 8: PERFORMANCE AUDIT

### Areas to Analyze:

**Bundle Size:**
- Total bundle size
- Largest chunks
- Unused code (tree-shaking opportunities)
- Dynamic import opportunities

**Runtime Performance:**
- Component re-render patterns
- Memoization opportunities (useMemo, useCallback, React.memo)
- Image optimization
- Lazy loading implementation

**Network Performance:**
- API call patterns
- Redundant requests
- Caching effectiveness
- WebSocket usage (Realtime)

### Key Metrics to Measure:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)

### Deliverable:
```
⚡ PERFORMANCE REPORT
├── Core Web Vitals Analysis
├── Bundle Optimization Recommendations
├── Re-render Hotspots
├── Lazy Loading Opportunities
├── Image Optimization Checklist
└── Network Request Optimization
```

---

## STEP 9: TESTING & RELIABILITY AUDIT

### Current Test Files:
```
src/test/*.test.ts
e2e/*.spec.ts
```

### Checklist:
- [ ] What is the current test coverage?
- [ ] Are critical paths covered?
- [ ] Are edge cases tested?
- [ ] Is E2E testing comprehensive?
- [ ] Are there flaky tests?

### Error Handling:
- [ ] Is Sentry configured correctly?
- [ ] Are errors categorized properly?
- [ ] Is there user-facing error messaging?
- [ ] Are API errors handled gracefully?

### Deliverable:
```
🧪 TESTING REPORT
├── Coverage Analysis
├── Critical Paths Without Tests
├── Recommended Test Cases
├── E2E Test Expansion Plan
└── Error Handling Improvements
```

---

## STEP 10: DEVOPS & DEPLOYMENT AUDIT

### Files to Review:
```
vercel.json
vite.config.ts
docs/DEPLOYMENT_CHECKLIST.md
docs/MONITORING.md
```

### Checklist:
- [ ] Is environment configuration correct?
- [ ] Are secrets properly managed?
- [ ] Is there a CI/CD pipeline?
- [ ] Is monitoring adequate?
- [ ] Is there a disaster recovery plan?
- [ ] Are backups configured?

### Deliverable:
```
🚀 DEVOPS REPORT
├── Environment Configuration Issues
├── Secret Management Review
├── Monitoring Gaps
├── Deployment Process Improvements
└── Disaster Recovery Recommendations
```

---

## FINAL DELIVERABLES

After completing all 10 steps, provide:

### 1. Executive Summary
- Overall health score (1-10)
- Top 5 critical issues
- Top 5 quick wins
- Resource requirements for remediation

### 2. Prioritized Action Plan
```
IMMEDIATE (This Week):
- [Critical security fixes]
- [Breaking bug fixes]

SHORT-TERM (This Month):
- [Performance optimizations]
- [UX improvements]

MEDIUM-TERM (This Quarter):
- [Architecture refactoring]
- [Feature improvements]

LONG-TERM (6+ Months):
- [Major overhauls]
- [Technical debt reduction]
```

### 3. Technical Debt Register
| Issue | Location | Severity | Effort | Impact |
|-------|----------|----------|--------|--------|
| ... | ... | ... | ... | ... |

### 4. Recommended Reading Order
Suggest which files the human team should review first based on risk.

---

## INSTRUCTIONS FOR THE AI AUDITOR

1. **Be Exhaustive**: Don't skip any step. Each section matters.
2. **Be Critical**: This is a production system. Don't sugarcoat.
3. **Be Specific**: Provide file paths, line numbers, and code fixes.
4. **Be Practical**: Prioritize by impact and effort.
5. **Consider Scale**: Will this work with 100,000 users?
6. **Document Everything**: Future developers will read this.

**Start your audit now. Begin with Step 1.**
