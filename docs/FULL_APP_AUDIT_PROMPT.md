# Complete Platform Technical Audit Prompt

## Instructions for AI Analysis

You are acting as a **Senior Full-Stack Developer**, **Expert UI/UX Designer**, **Security Engineer**, **AI/ML Engineer**, **Database Architect**, and **DevOps Specialist** conducting an exhaustive step-by-step audit of a social club and networking platform. This is a PRODUCTION system. Analyze every aspect critically and provide actionable recommendations.

---

## Platform Overview

This is a **curated social club platform** featuring:

### Core Features:
- **Member Portal**: Profiles, connections, networking, onboarding wizard
- **Event Management**: RSVP, waitlists, check-in, calendar integration, reminders
- **Slow Dating/Matchmaking**: AI-powered compatibility scoring, weekly matches, reveal mechanic
- **Business Directory**: Lead generation, verification, introduction requests
- **Connected Circles**: Exclusive community groups (Les Amis, The Gentlemen)
- **Journal/Blog**: Articles with likes, comments, bookmarks, social sharing
- **Admin Dashboard**: Full platform management, analytics, security

### Tech Stack:
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Storage, Realtime)
- **Payments**: Stripe (subscriptions, one-time purchases, customer portal)
- **Email**: Resend
- **SMS**: Twilio
- **Push Notifications**: Web Push API
- **Monitoring**: Sentry
- **Analytics**: Google Analytics + custom events table

---

## COMPLETE FILE INVENTORY

### Frontend Entry Points
```
src/main.tsx
src/App.tsx
src/index.css
tailwind.config.ts
vite.config.ts
index.html
```

### Authentication System
```
src/contexts/AuthContext.tsx
src/pages/AuthPage.tsx
src/pages/AuthCallbackPage.tsx
src/pages/AuthWaitingPage.tsx
src/pages/ForgotPasswordPage.tsx
src/pages/ResetPasswordPage.tsx
src/pages/EmailVerificationPage.tsx
src/components/auth/AuthErrorCard.tsx
src/components/auth/InactivityWarningModal.tsx
src/components/auth/PhoneOTPLogin.tsx
src/components/auth/SimpleCaptcha.tsx
src/hooks/useInactivityLogout.ts
src/hooks/useSessionManager.ts
src/hooks/useAuthRateLimit.ts
```

### Public Pages
```
src/pages/HomePage.tsx
src/pages/AboutPage.tsx
src/pages/EventsPage.tsx
src/pages/EventDetailPage.tsx
src/pages/ContactPage.tsx
src/pages/MembershipPage.tsx
src/pages/GalleryPage.tsx
src/pages/JournalPage.tsx
src/pages/JournalPostPage.tsx
src/pages/FAQPage.tsx
src/pages/TermsPage.tsx
src/pages/PrivacyPage.tsx
src/pages/CookiesPage.tsx
src/pages/CodeOfConductPage.tsx
src/pages/NotFound.tsx
src/pages/HealthCheckPage.tsx
```

### Slow Dating System
```
src/pages/SlowDatingLandingPage.tsx
src/pages/SlowDatingPage.tsx
src/pages/DatingIntakePage.tsx (~2200 lines - NEEDS REFACTORING)
src/pages/DateConfirmationPage.tsx
src/pages/portal/PortalSlowDating.tsx
src/pages/portal/PortalMatchDetail.tsx
src/components/dating/AppStoreBadges.tsx
src/components/dating/BlurredMatchCard.tsx
src/components/dating/CompatibilityBreakdown.tsx
src/components/dating/CoreValuesPicker.tsx
src/components/dating/DateScheduler.tsx
src/components/dating/MatchCard.tsx
src/components/dating/MatchDecision.tsx
src/components/dating/MatchRevealModal.tsx
src/components/dating/ReactivationModal.tsx
src/components/dating/VoiceBioRecorder.tsx
src/components/dating/intake/*.tsx
src/hooks/useDatingProfile.ts
src/hooks/useMatchReveal.ts
```

### Business System
```
src/pages/BusinessLandingPage.tsx
src/pages/BusinessDirectoryPage.tsx
src/pages/portal/PortalBusiness.tsx
src/components/business/BusinessCard.tsx
src/components/business/BusinessProfileDialog.tsx
src/components/business/BusinessVerificationStatus.tsx
src/components/business/LeadAnalyticsCharts.tsx
src/components/business/LeadCard.tsx
src/components/business/LeadDetailSheet.tsx
src/components/business/LeadExportButton.tsx
src/components/business/LeadStatsCards.tsx
src/hooks/useLeadRealtime.ts
```

### Connected Circles
```
src/pages/CirclesPage.tsx
src/pages/ConnectedCirclePage.tsx
src/pages/ConnectedCircleDirectoryPage.tsx
src/pages/circles/LesAmisPage.tsx
src/pages/circles/TheGentlemenPage.tsx
```

### Member Portal
```
src/pages/portal/PortalDashboard.tsx
src/pages/portal/PortalProfile.tsx
src/pages/portal/PortalEvents.tsx
src/pages/portal/PortalEventCheckin.tsx
src/pages/portal/PortalConnections.tsx
src/pages/portal/PortalNetwork.tsx
src/pages/portal/PortalBilling.tsx
src/pages/portal/PortalConcierge.tsx
src/pages/portal/PortalPerks.tsx
src/pages/portal/PortalReferrals.tsx
src/pages/portal/PortalOnboarding.tsx
src/components/portal/*.tsx (20+ components)
```

### Admin Dashboard
```
src/pages/admin/AdminDashboard.tsx
src/pages/admin/AdminMembers.tsx
src/pages/admin/AdminApplications.tsx
src/pages/admin/AdminEvents.tsx
src/pages/admin/AdminEventAnalytics.tsx
src/pages/admin/AdminPhotos.tsx
src/pages/admin/AdminContent.tsx
src/pages/admin/AdminDating.tsx
src/pages/admin/AdminDatingProfile.tsx
src/pages/admin/AdminMatches.tsx
src/pages/admin/AdminBusinesses.tsx
src/pages/admin/AdminLeads.tsx
src/pages/admin/AdminCircles.tsx
src/pages/admin/AdminConnections.tsx
src/pages/admin/AdminReferrals.tsx
src/pages/admin/AdminPerks.tsx
src/pages/admin/AdminConcierge.tsx
src/pages/admin/AdminTestimonials.tsx
src/pages/admin/AdminAnalytics.tsx
src/pages/admin/AdminRoles.tsx
src/pages/admin/AdminSettings.tsx
src/pages/admin/AdminSecurityDashboard.tsx
src/pages/admin/AdminSecurityReports.tsx
src/pages/admin/AdminAppeals.tsx
src/components/admin/*.tsx
```

### Home Page Sections
```
src/components/home/Hero.tsx
src/components/home/EthosSection.tsx
src/components/home/EventSection.tsx
src/components/home/BusinessEventsSection.tsx
src/components/home/SlowDatingSection.tsx
src/components/home/WhyChooseSection.tsx
src/components/home/TestimonialsSection.tsx
src/components/home/PricingSection.tsx
src/components/home/FAQSection.tsx
src/components/home/PhotoGallerySection.tsx
src/components/home/ContactFormSection.tsx
src/components/home/SocialProofBanner.tsx
src/components/home/EventCountdown.tsx
src/components/home/MemberAvatars.tsx
```

### Layout Components
```
src/components/layout/Header.tsx
src/components/layout/Footer.tsx
src/components/layout/Layout.tsx
```

### UI Components (shadcn + custom)
```
src/components/ui/*.tsx (60+ components)
```

### Blog Components
```
src/components/blog/BlogCommentsSection.tsx
src/components/blog/BlogLikeBookmark.tsx
src/components/blog/SocialShareButtons.tsx
```

### Events Components
```
src/components/events/AddToCalendarButton.tsx
```

### All Custom Hooks
```
src/hooks/use-mobile.tsx
src/hooks/use-toast.ts
src/hooks/useAdminRateLimit.ts
src/hooks/useAnimatedCounter.ts
src/hooks/useApiRateLimit.ts
src/hooks/useAuthRateLimit.ts
src/hooks/useCachedData.ts
src/hooks/useCapacitor.ts
src/hooks/useConfetti.ts
src/hooks/useConnectionQuality.tsx
src/hooks/useDatingProfile.ts
src/hooks/useFoundersStats.ts
src/hooks/useGeoRedirect.ts
src/hooks/useInactivityLogout.ts
src/hooks/useLeadRealtime.ts
src/hooks/useMatchReveal.ts
src/hooks/usePushNotifications.ts
src/hooks/useScrollAnimation.tsx
src/hooks/useSensitiveDataEncryption.ts
src/hooks/useSessionManager.ts
src/hooks/useSiteStats.ts
src/hooks/useSubscription.ts
```

### Utility Libraries
```
src/lib/analytics.ts
src/lib/auth-redirect.ts
src/lib/calendar-utils.ts
src/lib/date-utils.ts
src/lib/deep-link-handler.ts
src/lib/event-categorization.ts
src/lib/image-optimization.ts
src/lib/location-data.ts
src/lib/responsive-images.ts
src/lib/sentry.ts
src/lib/stripe-products.ts
src/lib/subdomain-utils.ts
src/lib/text-validation.ts
src/lib/utils.ts
```

### Edge Functions (Backend)
```
# Authentication & Security
supabase/functions/verify-admin-mfa/index.ts
supabase/functions/oauth-rate-limiter/index.ts
supabase/functions/admin-rate-limiter/index.ts
supabase/functions/api-rate-limiter/index.ts
supabase/functions/check-password-strength/index.ts
supabase/functions/send-security-alert/index.ts
supabase/functions/send-admin-access-alert/index.ts
supabase/functions/encrypt-sensitive-data/index.ts

# Payments & Subscriptions
supabase/functions/stripe-webhook/index.ts
supabase/functions/create-subscription-checkout/index.ts
supabase/functions/create-reveal-checkout/index.ts
supabase/functions/customer-portal/index.ts
supabase/functions/check-subscription/index.ts
supabase/functions/handle-payment-failed/index.ts

# Dating/Matching System
supabase/functions/find-matches/index.ts
supabase/functions/preprocess-dating-profile/index.ts
supabase/functions/reveal-match/index.ts
supabase/functions/handle-date-confirmation/index.ts
supabase/functions/send-dating-notification/index.ts
supabase/functions/send-dating-reminders/index.ts
supabase/functions/send-2hour-meeting-reminders/index.ts
supabase/functions/verify-social-profiles/index.ts

# Notifications
supabase/functions/send-push-notification/index.ts
supabase/functions/test-push-notification/index.ts
supabase/functions/send-sms/index.ts
supabase/functions/notification-throttle/index.ts
supabase/functions/process-notification-bundles/index.ts
supabase/functions/send-event-reminders/index.ts
supabase/functions/send-rsvp-notification/index.ts
supabase/functions/send-profile-notification/index.ts
supabase/functions/send-waitlist-notification/index.ts
supabase/functions/send-password-changed-email/index.ts

# Business Features
supabase/functions/submit-business-lead/index.ts
supabase/functions/find-leads/index.ts
supabase/functions/match-leads-to-businesses/index.ts
supabase/functions/send-business-lead-notification/index.ts
supabase/functions/send-business-notification/index.ts
supabase/functions/send-lead-followup-reminders/index.ts
supabase/functions/verify-business-profile/index.ts
supabase/functions/deep-osint-analysis/index.ts
supabase/functions/scheduled-lead-discovery/index.ts
supabase/functions/trigger-periodic-osint-scan/index.ts

# Referrals
supabase/functions/track-referral/index.ts
supabase/functions/send-referral-invite/index.ts
supabase/functions/send-referral-notification/index.ts

# Appeals
supabase/functions/send-appeal-confirmation/index.ts
supabase/functions/send-appeal-notification/index.ts

# Content & Events
supabase/functions/generate-daily-quote/index.ts
supabase/functions/fetch-instagram-photos/index.ts
supabase/functions/scrape-meetup/index.ts
supabase/functions/scrape-meetup-events/index.ts
supabase/functions/sync-meetup-upcoming-events/index.ts
supabase/functions/scheduled-event-sync/index.ts

# Other
supabase/functions/detect-location/index.ts
supabase/functions/elevenlabs-scribe-token/index.ts

# Email Templates
supabase/functions/_shared/email-templates/*.tsx
```

### Database Tables (40+ tables)
```
profiles, user_roles, memberships, application_waitlist
events, event_rsvps, event_waitlist, event_reminders, event_photos
dating_profiles, dating_matches, dating_profile_sensitive_data
dating_meeting_reminders, date_confirmation_requests, meeting_proposals
match_reveal_purchases
business_profiles, business_leads, business_lead_packages, business_lead_usage
business_introduction_requests, business_verification_reports
connections, referrals
circle_applications, circle_application_contacts
journal_posts, blog_likes, blog_bookmarks, blog_comments
testimonials
notification_queue, pending_notification_bundle, notification_throttle_log
push_subscriptions
admin_audit_log, admin_mfa_status, admin_mfa_sessions, admin_rate_limits
api_rate_limits, oauth_rate_limits
cache_metadata, analytics_events
leads, lead_followup_reminders
member_security_reports, appeals
daily_quotes, meetup_stats
dunning_retry_log
```

### Configuration Files
```
vite.config.ts
tailwind.config.ts
tsconfig.json
tsconfig.app.json
tsconfig.node.json
vitest.config.ts
playwright.config.ts
capacitor.config.ts
vercel.json
eslint.config.js
components.json
supabase/config.toml
```

### Tests
```
src/test/setup.ts
src/test/password-validation.test.ts
src/test/text-validation.test.ts
src/test/useSiteStats.test.ts
e2e/user-registration.spec.ts
```

### Documentation
```
docs/ARCHITECTURE_400K.md
docs/DEPLOYMENT_CHECKLIST.md
docs/EMAIL_SETUP.md
docs/ENVIRONMENT_SETUP.md
docs/MONITORING.md
docs/NATIVE_APP_SETUP.md
docs/MATCHMAKING_AUDIT_PROMPT.md
README.md
```

---

## STEP-BY-STEP AUDIT PROCESS

Complete each step fully before moving to the next. Document ALL findings with file paths and line numbers.

---

## STEP 1: ARCHITECTURE & PROJECT STRUCTURE

### 1.1 Entry Point Analysis
Review:
- `src/main.tsx` - App initialization
- `src/App.tsx` - Route configuration, providers
- `index.html` - Meta tags, SEO

**Checklist:**
- [ ] Is code splitting implemented (lazy loading routes)?
- [ ] Are error boundaries in place?
- [ ] Is the provider hierarchy correct?
- [ ] Are there circular dependencies?
- [ ] Is SEO properly configured?

### 1.2 Routing Architecture
Review all routes in `src/App.tsx`:
- [ ] Are protected routes properly guarded?
- [ ] Is route organization logical?
- [ ] Are there orphan routes?
- [ ] Is the 404 page handling correct?

### 1.3 Component Architecture
- [ ] Is the folder structure scalable?
- [ ] Are components properly separated (UI/feature/page)?
- [ ] Are there barrel export issues?
- [ ] Is co-location of related files followed?

### 1.4 State Management
Review:
- `src/contexts/AuthContext.tsx`
- All hooks in `src/hooks/`

**Checklist:**
- [ ] Is global state minimal?
- [ ] Is React Query used consistently?
- [ ] Are there prop drilling issues?
- [ ] Is context used appropriately?

### Deliverable:
```
📁 ARCHITECTURE REPORT
├── Route Map with Auth Status
├── Component Hierarchy Diagram
├── State Flow Analysis
├── Circular Dependency Issues
├── Code Splitting Opportunities
└── Refactoring Priority List
```

---

## STEP 2: AUTHENTICATION & SESSION MANAGEMENT

### 2.1 Auth Flow
Review:
```
src/contexts/AuthContext.tsx
src/pages/AuthPage.tsx
src/pages/AuthCallbackPage.tsx
src/pages/ForgotPasswordPage.tsx
src/pages/ResetPasswordPage.tsx
src/pages/EmailVerificationPage.tsx
```

**Checklist:**
- [ ] Is email verification enforced?
- [ ] Is password strength validated? (check `check-password-strength` function)
- [ ] Are auth state changes handled correctly?
- [ ] Is the callback handling secure?
- [ ] Are error messages safe (no info leakage)?

### 2.2 Session Management
Review:
```
src/hooks/useSessionManager.ts
src/hooks/useInactivityLogout.ts
src/components/auth/InactivityWarningModal.tsx
```

**Checklist:**
- [ ] Is session timeout implemented?
- [ ] Is multi-tab session sync working?
- [ ] Are sessions invalidated on logout?
- [ ] Is there protection against session fixation?

### 2.3 Admin MFA
Review:
```
src/components/admin/MFAGuard.tsx
src/components/admin/MFASetup.tsx
src/components/admin/MFAVerify.tsx
supabase/functions/verify-admin-mfa/index.ts
```

**Checklist:**
- [ ] Is MFA required for all admin actions?
- [ ] Is TOTP implementation secure?
- [ ] Are backup codes provided?
- [ ] Is MFA status stored securely?

### 2.4 Rate Limiting
Review:
```
src/hooks/useAuthRateLimit.ts
supabase/functions/oauth-rate-limiter/index.ts
supabase/functions/admin-rate-limiter/index.ts
supabase/functions/api-rate-limiter/index.ts
```

**Checklist:**
- [ ] Is brute force protection in place?
- [ ] Are rate limits appropriate?
- [ ] Is the implementation bypassable?

### Deliverable:
```
🔐 AUTHENTICATION REPORT
├── Auth Flow Diagram
├── Security Vulnerabilities
├── Session Management Issues
├── MFA Implementation Review
├── Rate Limiting Analysis
└── Remediation Steps
```

---

## STEP 3: DATABASE SECURITY AUDIT

### 3.1 RLS Policy Review
For EACH table, verify:
- [ ] RLS is enabled
- [ ] Policies are not overly permissive
- [ ] No `true` policies without justification
- [ ] `auth.uid()` checks are correct
- [ ] Service role access is minimized

### 3.2 Critical Tables Deep Dive

**User Data Tables:**
```
profiles - Personal information
user_roles - Admin privilege escalation risk
memberships - Subscription status manipulation
application_waitlist - Application tampering
```

**Dating System:**
```
dating_profiles - Profile data exposure
dating_matches - Match manipulation
dating_profile_sensitive_data - PII exposure
match_reveal_purchases - Payment fraud
```

**Business System:**
```
business_profiles - Business data
business_leads - Lead theft
business_verification_reports - Report tampering
```

**Financial:**
```
memberships - Subscription fraud
match_reveal_purchases - Purchase fraud
dunning_retry_log - Payment manipulation
```

### 3.3 Sensitive Data
- [ ] Is PII encrypted? (check `dating_profile_sensitive_data`, `circle_application_contacts`)
- [ ] Are encryption keys rotated?
- [ ] Is data properly masked in logs?

### 3.4 Query Patterns
- [ ] Are there N+1 queries?
- [ ] Are complex queries optimized?
- [ ] Are indexes in place?
- [ ] Is pagination implemented?

### Deliverable:
```
🗄️ DATABASE SECURITY REPORT
├── RLS Policy Matrix (per table)
├── Privilege Escalation Risks
├── Data Exposure Vulnerabilities
├── Encryption Status
├── Query Performance Issues
├── Missing Indexes
└── SQL Remediation Scripts
```

---

## STEP 4: EDGE FUNCTIONS COMPREHENSIVE AUDIT

### 4.1 Security Functions
```
verify-admin-mfa/index.ts
send-security-alert/index.ts
send-admin-access-alert/index.ts
encrypt-sensitive-data/index.ts
```

**Checklist per function:**
- [ ] Input validation (Zod schemas)
- [ ] Auth verification
- [ ] Error handling
- [ ] Secrets management
- [ ] CORS headers
- [ ] Logging (not excessive)
- [ ] Rate limiting

### 4.2 Payment Functions
```
stripe-webhook/index.ts - CRITICAL: Webhook signature verification
create-subscription-checkout/index.ts
create-reveal-checkout/index.ts
customer-portal/index.ts
check-subscription/index.ts
handle-payment-failed/index.ts
```

**Critical Checks:**
- [ ] Is webhook signature verified?
- [ ] Are idempotency keys used?
- [ ] Is amount manipulation prevented?
- [ ] Are subscription states validated?

### 4.3 Matching Algorithm
```
find-matches/index.ts - Core algorithm
preprocess-dating-profile/index.ts - AI preprocessing
reveal-match/index.ts - Reveal mechanic
```

**Algorithm Review:**
- [ ] Is the scoring fair and unbiased?
- [ ] Are dealbreakers enforced correctly?
- [ ] Is reciprocal matching working?
- [ ] Are edge cases handled?
- [ ] Is the AI prompt secure?

### 4.4 Notification Functions
```
send-push-notification/index.ts
send-sms/index.ts
notification-throttle/index.ts
process-notification-bundles/index.ts
send-event-reminders/index.ts
send-dating-notification/index.ts
send-dating-reminders/index.ts
send-2hour-meeting-reminders/index.ts
```

**Checklist:**
- [ ] Is throttling implemented?
- [ ] Are notifications bundled?
- [ ] Is opt-out respected?
- [ ] Are templates secure (no injection)?

### 4.5 Business Functions
```
submit-business-lead/index.ts
find-leads/index.ts
match-leads-to-businesses/index.ts
verify-business-profile/index.ts
deep-osint-analysis/index.ts
```

**Checklist:**
- [ ] Is lead data validated?
- [ ] Is OSINT analysis secure?
- [ ] Are API keys protected?

### 4.6 Email Templates
```
supabase/functions/_shared/email-templates/welcome.tsx
supabase/functions/_shared/email-templates/event-confirmation.tsx
supabase/functions/_shared/email-templates/payment-failed.tsx
supabase/functions/_shared/email-templates/subscription-renewed.tsx
```

**Checklist:**
- [ ] Is HTML injection prevented?
- [ ] Are links secure?
- [ ] Is branding consistent?

### Deliverable:
```
⚡ EDGE FUNCTIONS REPORT
├── Function-by-Function Security Analysis
├── Payment Flow Vulnerabilities
├── Matching Algorithm Issues
├── Notification System Problems
├── API Integration Risks
├── Code Quality Issues
└── Consolidation Opportunities
```

---

## STEP 5: ADMIN DASHBOARD AUDIT

### 5.1 Access Control
Review:
```
src/components/admin/AdminLayout.tsx
src/components/admin/MFAGuard.tsx
```

- [ ] Is admin check server-side (not localStorage)?
- [ ] Is MFA enforced before access?
- [ ] Are sensitive actions audited?

### 5.2 Admin Pages
Review each admin page for:
- [ ] Proper authorization
- [ ] Data validation
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Audit logging

**Pages to Review:**
```
AdminDashboard.tsx - Overview and stats
AdminMembers.tsx - Member management
AdminApplications.tsx - Application approval
AdminEvents.tsx - Event CRUD
AdminDating.tsx - Dating profile management
AdminMatches.tsx - Match management
AdminBusinesses.tsx - Business verification
AdminLeads.tsx - Lead management
AdminCircles.tsx - Circle applications
AdminRoles.tsx - Role assignment (CRITICAL)
AdminSettings.tsx - System settings
AdminSecurityDashboard.tsx - Security overview
AdminSecurityReports.tsx - OSINT reports
AdminAppeals.tsx - User appeals
```

### 5.3 Audit Logging
Review:
- [ ] Are all admin actions logged?
- [ ] Is the audit log tamper-proof?
- [ ] Are logs accessible only to super-admins?

### Deliverable:
```
👑 ADMIN DASHBOARD REPORT
├── Access Control Matrix
├── Authorization Bypass Risks
├── Data Manipulation Vulnerabilities
├── Audit Logging Gaps
├── UI/UX Issues
└── Remediation Priority List
```

---

## STEP 6: MEMBER PORTAL AUDIT

### 6.1 Onboarding Flow
Review:
```
src/pages/portal/PortalOnboarding.tsx
src/components/portal/OnboardingWizard.tsx
src/components/portal/OnboardingStep.tsx
src/components/portal/VpnBlockedModal.tsx
```

**Checklist:**
- [ ] Is VPN/proxy blocking working?
- [ ] Is progress saved correctly?
- [ ] Are all steps validated?
- [ ] Is incomplete profile access blocked?

### 6.2 Profile Management
Review:
```
src/pages/portal/PortalProfile.tsx
src/components/portal/ProfileCompletionIndicator.tsx
```

**Checklist:**
- [ ] Is profile data validated?
- [ ] Are uploads secure?
- [ ] Is sensitive data masked?

### 6.3 Connections & Networking
Review:
```
src/pages/portal/PortalConnections.tsx
src/pages/portal/PortalNetwork.tsx
```

**Checklist:**
- [ ] Can users see unauthorized profiles?
- [ ] Is tier-gating enforced?
- [ ] Are connection requests validated?

### 6.4 Billing & Subscriptions
Review:
```
src/pages/portal/PortalBilling.tsx
src/hooks/useSubscription.ts
```

**Checklist:**
- [ ] Is subscription status cached correctly?
- [ ] Can users manipulate tier?
- [ ] Is payment flow secure?

### 6.5 Events
Review:
```
src/pages/portal/PortalEvents.tsx
src/pages/portal/PortalEventCheckin.tsx
```

**Checklist:**
- [ ] Is RSVP manipulation prevented?
- [ ] Is waitlist fair?
- [ ] Is check-in secure?

### 6.6 Referrals
Review:
```
src/pages/portal/PortalReferrals.tsx
src/components/portal/ReferralDashboard.tsx
```

**Checklist:**
- [ ] Can referral codes be abused?
- [ ] Are rewards validated?

### Deliverable:
```
👤 MEMBER PORTAL REPORT
├── Access Control Issues
├── Data Exposure Risks
├── Feature Gate Bypasses
├── UX Problems
├── Performance Issues
└── Security Recommendations
```

---

## STEP 7: SLOW DATING SYSTEM DEEP DIVE

### 7.1 Intake Flow
Review:
```
src/pages/DatingIntakePage.tsx (~2200 lines - CRITICAL REFACTOR)
src/components/dating/intake/*.tsx
```

**Checklist:**
- [ ] Is the 2200-line file maintainable?
- [ ] Is validation comprehensive?
- [ ] Can users skip required fields?
- [ ] Is progress saved?
- [ ] Is mobile UX acceptable?

### 7.2 Matching Algorithm
Review:
```
supabase/functions/find-matches/index.ts
supabase/functions/preprocess-dating-profile/index.ts
```

**Algorithm Analysis:**
```javascript
// Current weights to evaluate:
Communication: 20%
Values: 25%
Goals: 20%
Lifestyle: 15%
Emotional Intelligence: 20%
```

**Questions:**
- [ ] Are weights optimal?
- [ ] Is 60% threshold appropriate?
- [ ] Are dealbreakers truly blocking?
- [ ] How are sparse profiles handled?
- [ ] Is there gender/age bias?
- [ ] Are reciprocal preferences enforced?

### 7.3 Match Reveal
Review:
```
src/components/dating/BlurredMatchCard.tsx
src/components/dating/MatchRevealModal.tsx
src/hooks/useMatchReveal.ts
supabase/functions/reveal-match/index.ts
```

**Checklist:**
- [ ] Can reveal be bypassed?
- [ ] Is payment verified server-side?
- [ ] Is the blur reversible client-side?

### 7.4 Date Scheduling
Review:
```
src/components/dating/DateScheduler.tsx
src/pages/DateConfirmationPage.tsx
supabase/functions/handle-date-confirmation/index.ts
```

**Checklist:**
- [ ] Is woman-first scheduling enforced?
- [ ] Are confirmation tokens secure?
- [ ] Is timezone handled correctly?

### Deliverable:
```
💕 DATING SYSTEM REPORT
├── Algorithm Analysis
├── Bias Detection Results
├── UX Improvement Recommendations
├── Refactoring Roadmap for DatingIntakePage
├── Security Issues
├── Edge Cases to Handle
└── Proposed Component Structure
```

---

## STEP 8: BUSINESS DIRECTORY AUDIT

### 8.1 Business Profiles
Review:
```
src/pages/BusinessDirectoryPage.tsx
src/components/business/BusinessCard.tsx
src/components/business/BusinessProfileDialog.tsx
```

### 8.2 Lead Generation
Review:
```
src/components/business/LeadCard.tsx
src/components/business/LeadDetailSheet.tsx
supabase/functions/submit-business-lead/index.ts
supabase/functions/find-leads/index.ts
supabase/functions/match-leads-to-businesses/index.ts
```

**Checklist:**
- [ ] Is lead data validated?
- [ ] Can leads be stolen?
- [ ] Is lead matching fair?

### 8.3 Verification
Review:
```
src/components/business/BusinessVerificationStatus.tsx
supabase/functions/verify-business-profile/index.ts
supabase/functions/deep-osint-analysis/index.ts
```

**Checklist:**
- [ ] Is verification tamper-proof?
- [ ] Are OSINT results stored securely?
- [ ] Can verification be bypassed?

### Deliverable:
```
🏢 BUSINESS SYSTEM REPORT
├── Lead Security Analysis
├── Verification Process Review
├── Data Access Issues
├── UX Recommendations
└── Integration Opportunities
```

---

## STEP 9: PUBLIC PAGES & SEO AUDIT

### 9.1 Home Page Performance
Review:
```
src/pages/HomePage.tsx
src/components/home/*.tsx (all sections)
```

**Checklist:**
- [ ] Is LCP optimized (< 2.5s)?
- [ ] Is hero video optimized?
- [ ] Are images lazy loaded?
- [ ] Is CLS minimized?

### 9.2 SEO Analysis
Review:
```
src/components/SEOHead.tsx
public/robots.txt
public/sitemap.xml
```

**Checklist:**
- [ ] Are meta tags complete?
- [ ] Is structured data (JSON-LD) present?
- [ ] Is sitemap comprehensive?
- [ ] Are canonical tags correct?

### 9.3 Landing Pages
Review:
```
src/pages/MembershipPage.tsx
src/pages/SlowDatingLandingPage.tsx
src/pages/BusinessLandingPage.tsx
src/pages/AboutPage.tsx
```

**Checklist:**
- [ ] Are CTAs clear?
- [ ] Is conversion tracking in place?
- [ ] Is mobile layout optimized?

### Deliverable:
```
🌐 PUBLIC PAGES REPORT
├── Core Web Vitals Analysis
├── SEO Score Card
├── Conversion Optimization Opportunities
├── Accessibility Issues
├── Mobile Responsiveness Problems
└── Image Optimization Checklist
```

---

## STEP 10: UI/UX COMPREHENSIVE REVIEW

### 10.1 Design System
Review:
```
tailwind.config.ts
src/index.css
src/components/ui/*.tsx
```

**Checklist:**
- [ ] Are design tokens consistent?
- [ ] Is dark mode working?
- [ ] Are colors from theme tokens?
- [ ] Is typography hierarchy clear?

### 10.2 Component Quality
Review all `src/components/ui/`:
- [ ] Are components properly typed?
- [ ] Is accessibility implemented (ARIA)?
- [ ] Are animations performant?
- [ ] Is keyboard navigation working?

### 10.3 Large Files to Refactor
```
src/pages/DatingIntakePage.tsx (~2200 lines)
src/pages/portal/PortalSlowDating.tsx
src/pages/admin/AdminEvents.tsx
src/pages/admin/AdminMembers.tsx
```

### 10.4 Mobile Experience
- [ ] Is responsive design consistent?
- [ ] Are touch targets adequate?
- [ ] Is navigation mobile-friendly?
- [ ] Are modals/sheets mobile-optimized?

### Deliverable:
```
🎨 UI/UX REPORT
├── Design System Audit
├── Accessibility Violations (WCAG 2.1)
├── Component Refactoring List
├── Mobile UX Issues
├── Animation Performance
└── User Flow Optimizations
```

---

## STEP 11: PERFORMANCE AUDIT

### 11.1 Bundle Analysis
- [ ] Total bundle size
- [ ] Largest chunks
- [ ] Tree-shaking opportunities
- [ ] Dynamic import opportunities

### 11.2 Runtime Performance
- [ ] Re-render hotspots
- [ ] Memoization opportunities
- [ ] Expensive calculations

### 11.3 Network Performance
- [ ] API call patterns
- [ ] Redundant requests
- [ ] Caching effectiveness
- [ ] WebSocket (Realtime) usage

### 11.4 Image/Asset Performance
- [ ] Image formats (WebP usage)
- [ ] Responsive images
- [ ] Lazy loading
- [ ] CDN usage

### Deliverable:
```
⚡ PERFORMANCE REPORT
├── Core Web Vitals Scores
├── Bundle Size Breakdown
├── Re-render Analysis
├── Network Waterfall Analysis
├── Lazy Loading Audit
├── Caching Strategy Review
└── Optimization Priority List
```

---

## STEP 12: TESTING & ERROR HANDLING

### 12.1 Test Coverage
Review:
```
src/test/*.test.ts
e2e/*.spec.ts
vitest.config.ts
playwright.config.ts
```

**Checklist:**
- [ ] What is current coverage?
- [ ] Are critical paths tested?
- [ ] Are edge cases covered?
- [ ] Are tests reliable (no flakes)?

### 12.2 Error Handling
Review:
```
src/lib/sentry.ts
src/components/ErrorBoundary.tsx
src/components/ui/widget-error-boundary.tsx
```

**Checklist:**
- [ ] Is Sentry configured correctly?
- [ ] Are errors categorized?
- [ ] Is user feedback collected?
- [ ] Are API errors handled gracefully?

### Deliverable:
```
🧪 TESTING & ERROR REPORT
├── Coverage Analysis
├── Missing Test Cases
├── E2E Test Gaps
├── Error Handling Audit
├── Recommended Test Suite
└── CI/CD Integration Plan
```

---

## STEP 13: NATIVE APP READINESS

### 13.1 Capacitor Configuration
Review:
```
capacitor.config.ts
docs/NATIVE_APP_SETUP.md
src/hooks/useCapacitor.ts
src/lib/deep-link-handler.ts
```

**Checklist:**
- [ ] Is config correct for iOS/Android?
- [ ] Are deep links working?
- [ ] Is the splash screen configured?
- [ ] Are push notifications set up?

### Deliverable:
```
📱 NATIVE APP REPORT
├── Configuration Review
├── Missing Capabilities
├── Deep Link Testing Plan
├── Push Notification Status
└── Store Submission Readiness
```

---

## STEP 14: DEVOPS & MONITORING

### 14.1 Deployment
Review:
```
vercel.json
docs/DEPLOYMENT_CHECKLIST.md
```

**Checklist:**
- [ ] Are environment variables correct?
- [ ] Is caching configured?
- [ ] Are redirects working?

### 14.2 Monitoring
Review:
```
src/lib/sentry.ts
src/lib/analytics.ts
docs/MONITORING.md
```

**Checklist:**
- [ ] Is error tracking comprehensive?
- [ ] Is analytics capturing key events?
- [ ] Is uptime monitoring in place?

### 14.3 Secrets Management
- [ ] Are all secrets in environment variables?
- [ ] Are there hardcoded credentials?
- [ ] Is key rotation possible?

### Deliverable:
```
🚀 DEVOPS REPORT
├── Deployment Configuration
├── Monitoring Gaps
├── Secret Management Review
├── CI/CD Recommendations
├── Disaster Recovery Plan
└── Backup Strategy
```

---

## FINAL DELIVERABLES

After completing all 14 steps, provide:

### 1. Executive Summary
```
Overall Platform Health Score: X/10

Critical Issues (Fix Immediately):
1. [Issue] - [Location] - [Impact]
2. ...

Quick Wins (Low effort, high impact):
1. [Issue] - [Fix] - [Estimated time]
2. ...

Technical Debt Summary:
- Total issues found: X
- Critical: X
- High: X
- Medium: X
- Low: X
```

### 2. Prioritized Action Plan
```
IMMEDIATE (This Week):
├── Critical security fixes
├── Breaking bugs
└── Data exposure issues

SHORT-TERM (This Month):
├── Performance optimizations
├── UX critical issues
└── Payment flow fixes

MEDIUM-TERM (This Quarter):
├── DatingIntakePage refactoring
├── Test coverage improvement
├── Mobile experience enhancement

LONG-TERM (6+ Months):
├── Architecture refactoring
├── Technical debt reduction
└── Scalability improvements
```

### 3. Technical Debt Register
| Issue | File Location | Severity | Effort | Impact | Priority |
|-------|---------------|----------|--------|--------|----------|
| 2200-line DatingIntakePage | src/pages/DatingIntakePage.tsx | High | High | High | P1 |
| ... | ... | ... | ... | ... | ... |

### 4. Security Vulnerability Matrix
| Vulnerability | Location | CVSS Score | Exploitation | Fix |
|---------------|----------|------------|--------------|-----|
| ... | ... | ... | ... | ... |

### 5. Component Refactoring Roadmap
```
src/pages/DatingIntakePage.tsx → 
  src/components/dating/intake/
    ├── IntakeWizard.tsx (orchestrator)
    ├── steps/
    │   ├── BasicInfoStep.tsx
    │   ├── LifestyleStep.tsx
    │   ├── ValuesStep.tsx
    │   ├── RelationshipGoalsStep.tsx
    │   ├── DealbreakersStep.tsx
    │   ├── CommunicationStep.tsx
    │   ├── EmotionalIntelligenceStep.tsx
    │   └── PhotoUploadStep.tsx
    ├── hooks/
    │   └── useIntakeProgress.ts
    └── validation/
        └── intakeSchema.ts
```

### 6. AI/Matching Algorithm Recommendations
```
Current Weights:
- Communication: 20%
- Values: 25%
- Goals: 20%
- Lifestyle: 15%
- Emotional Intelligence: 20%

Recommended Changes:
- [Specific recommendations]

Bias Mitigation:
- [Specific recommendations]

Edge Case Handling:
- [Specific recommendations]
```

---

## AUDIT INSTRUCTIONS

1. **Be Exhaustive**: Check every file listed. No skipping.
2. **Be Critical**: This is production. Sugar-coating helps no one.
3. **Be Specific**: File paths, line numbers, exact code fixes.
4. **Be Practical**: Balance severity with implementation effort.
5. **Consider Scale**: Does this work with 100,000 users?
6. **Document Everything**: Future developers depend on this.
7. **Prioritize Security**: Security issues come before features.
8. **Test Assumptions**: Verify claims, don't trust comments.

**BEGIN YOUR COMPREHENSIVE AUDIT NOW. START WITH STEP 1.**
