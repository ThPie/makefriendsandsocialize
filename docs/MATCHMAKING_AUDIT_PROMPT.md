# Matchmaking System Technical Audit Prompt

## Instructions for AI Analysis

You are acting as a **Senior Full-Stack Developer**, **Expert UI/UX Designer**, and **AI/ML Engineer** conducting a comprehensive audit of a slow dating matchmaking system. Analyze every aspect critically and provide actionable recommendations.

---

## Your Role & Expertise

1. **Senior Developer**: Code quality, architecture, performance, security, maintainability
2. **UI/UX Expert**: User flows, accessibility, conversion optimization, mobile responsiveness
3. **AI Engineer**: Matching algorithm accuracy, scoring weights, bias detection, edge cases

---

## System Overview

This is a **curated slow dating platform** where:
- Users complete an extensive intake questionnaire (50+ fields)
- AI analyzes profiles and calculates compatibility scores
- Matches are revealed weekly with a "reveal" mechanic (paid feature)
- Users confirm/decline meetings through the platform

---

## Files to Analyze

### Core Matching Algorithm
```
supabase/functions/find-matches/index.ts
supabase/functions/preprocess-dating-profile/index.ts
```

### Database Schema (dating_profiles table)
Key fields to review:
- Demographics: age, gender, target_gender, location
- Preferences: age_range_min/max, search_radius, wants_children
- Personality: attachment_style, communication_style, conflict_resolution
- Values: core_values_ranked, religion_stance, politics_stance
- Lifestyle: drinking_status, smoking_status, exercise_frequency
- Deep compatibility: love_language, apology_language, stress_response
- Normalized vectors: compatibility_dimensions, lifestyle_normalized, conflict_style_normalized

### Frontend Components
```
src/pages/DatingIntakePage.tsx (~2200 lines - needs refactoring)
src/pages/portal/PortalSlowDating.tsx
src/components/dating/BlurredMatchCard.tsx
src/components/dating/MatchCard.tsx
src/components/dating/MatchRevealModal.tsx
src/components/dating/CompatibilityBreakdown.tsx
src/components/dating/CoreValuesPicker.tsx
src/components/dating/DateScheduler.tsx
src/components/dating/MatchDecision.tsx
src/hooks/useDatingProfile.ts
src/hooks/useMatchReveal.ts
```

---

## Audit Checklist

### 1. MATCHING ALGORITHM ANALYSIS

#### Current Scoring System
The algorithm uses weighted dimensions:
- Communication Style: 20%
- Core Values: 25%
- Life Goals: 20%
- Lifestyle: 15%
- Emotional Intelligence: 20%

**Questions to Answer:**
- Are these weights optimal? Should values weigh more than lifestyle?
- Is the 60% minimum threshold too low/high?
- How are dealbreakers handled? Are they truly blocking?
- What happens with sparse profiles (missing fields)?
- Is there gender/age bias in the matching?
- Are reciprocal preferences properly enforced?

#### Edge Cases to Test
- User A wants kids, User B doesn't → Should this be a hard block?
- Large age gaps within stated preferences
- Location mismatches with flexible users
- Religious/political dealbreakers
- Users with very few completed fields

### 2. UI/UX ANALYSIS

#### Intake Flow (DatingIntakePage.tsx)
**Problems to Identify:**
- Is the 2200-line file maintainable?
- How many steps? Is there progress indication?
- Can users save and resume later?
- Mobile experience on long forms?
- Are questions grouped logically?
- Is there validation feedback?
- Accessibility compliance (ARIA, keyboard nav)?

**Conversion Optimization:**
- Where do users drop off?
- Are required vs optional fields clear?
- Is the "why we ask this" context provided?

#### Match Dashboard (PortalSlowDating.tsx)
- Is the match reveal UX engaging?
- Are compatibility breakdowns understandable?
- Is the scheduling flow intuitive?
- How are "no matches" states handled?

### 3. DATA ARCHITECTURE

#### Profile Preprocessing
Review `preprocess-dating-profile/index.ts`:
- How are free-text fields normalized?
- Are embeddings being generated correctly?
- What triggers re-preprocessing?
- Are there race conditions?

#### Database Queries
- Are there N+1 query issues?
- Is the matching query efficient at scale?
- Are indexes properly configured?
- RLS policies correct?

### 4. SECURITY REVIEW

- Is sensitive data (phone, social URLs) properly encrypted?
- Can users see other users' profile data they shouldn't?
- Are rate limits in place for matching API?
- Is the reveal purchase system tamper-proof?

---

## Expected Deliverables

### 1. Critical Issues Report
List all bugs, security vulnerabilities, and UX failures in priority order:
```
🔴 CRITICAL: [Issue] - [Impact] - [Fix]
🟠 HIGH: [Issue] - [Impact] - [Fix]
🟡 MEDIUM: [Issue] - [Impact] - [Fix]
```

### 2. Algorithm Improvements
Provide specific code changes for:
- Better weight distribution
- Improved dealbreaker handling
- Edge case coverage
- Scoring normalization

### 3. UX Refactoring Plan
Break down the monolithic intake page:
```
src/components/dating/intake/
  ├── IntakeWizard.tsx (orchestrator)
  ├── steps/
  │   ├── BasicInfoStep.tsx
  │   ├── LifestyleStep.tsx
  │   ├── ValuesStep.tsx
  │   ├── RelationshipGoalsStep.tsx
  │   ├── DealbreakersStep.tsx
  │   └── PhotoUploadStep.tsx
  ├── hooks/
  │   └── useIntakeProgress.ts
  └── validation/
      └── intakeSchema.ts
```

### 4. Performance Optimizations
- Query optimizations with exact SQL
- Caching strategies
- Lazy loading recommendations

### 5. AI Model Improvements
- Better compatibility dimension extraction
- Semantic matching for free-text fields
- Confidence scoring for matches

---

## Code Snippets to Review

### Current Matching Logic (find-matches/index.ts)
```typescript
// Review this scoring calculation
const calculateCompatibility = (profileA, profileB) => {
  const dimensions = {
    communication: compareField(profileA.communication_style, profileB.communication_style) * 0.20,
    values: compareArrays(profileA.core_values_ranked, profileB.core_values_ranked) * 0.25,
    goals: compareGoals(profileA, profileB) * 0.20,
    lifestyle: compareLifestyle(profileA, profileB) * 0.15,
    emotional: compareEmotional(profileA, profileB) * 0.20
  };
  return Object.values(dimensions).reduce((a, b) => a + b, 0);
};
```

### Questions:
1. Is `compareField` doing exact match or semantic similarity?
2. How does `compareArrays` handle different array lengths?
3. What constitutes "goals" in `compareGoals`?
4. Are lifestyle preferences weighted equally (smoking vs diet)?

---

## Final Instructions

1. **Be Critical**: Don't sugarcoat issues. This is a production system.
2. **Be Specific**: Provide exact file paths, line numbers, and code fixes.
3. **Prioritize**: Focus on what impacts match quality and user trust.
4. **Consider Scale**: Will this work with 10,000 active users?
5. **Test Edge Cases**: Think of the unhappy paths.

Start your analysis now. Provide your findings in a structured format.
