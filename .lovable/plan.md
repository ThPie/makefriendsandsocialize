

# Add Intimacy & Fear Questions to Matchmaking Intake

## Overview

This plan adds two important relationship compatibility questions to the dating intake form:
1. **Intimacy expectations beyond the honeymoon phase** - Physical compatibility is crucial for long-term success
2. **What fear keeps you from finding "the one"** - Deep self-awareness question to help identify limiting beliefs

These questions will improve match quality by revealing important compatibility factors currently not captured.

---

## Analysis

### Current State
- The dating intake form has 8 steps with comprehensive questions covering lifestyle, values, communication, and dealbreakers
- Step 5 ("Deep Dive") already includes a "Vulnerability Check" question about dating fears/insecurities
- Step 6 ("Dealbreakers") includes trust/fidelity views but nothing about physical intimacy expectations
- The `dating_profiles` table already has all the columns we need (discovered via query)

### Where to Add These Questions

**Question 1: Intimacy/Sex Beyond Honeymoon Phase**
- Best fit: Step 5 ("Deep Dive") after "Emotional Connection" - this is about relationship dynamics
- This is research-backed (Gottman's intimacy research) and belongs with the emotional compatibility questions
- Only shown to users seeking serious/marriage relationships (casual daters don't need this)

**Question 2: Fear Keeping You From Finding The One**
- Best fit: Step 6 ("Dealbreakers & Future") in the "Self-Awareness Indicators" section
- This complements the existing "accountability_reflection" question
- Helps matchmakers understand patterns that may affect success

---

## Implementation

### Step 1: Add New Fields to FormData Interface

Add two new fields to the `FormData` interface and `initialFormData`:

```typescript
// In FormData interface (around line 21)
intimacy_expectations: string;  // For the honeymoon phase question
finding_love_fear: string;      // For the fear question

// In initialFormData (around line 105)
intimacy_expectations: "",
finding_love_fear: "",
```

### Step 2: Add Database Migration

Add two new columns to the `dating_profiles` table:

```sql
ALTER TABLE dating_profiles 
ADD COLUMN intimacy_expectations text,
ADD COLUMN finding_love_fear text;
```

### Step 3: Add Intimacy Question to Step 5 (Deep Dive)

Insert after the "Emotional Connection" question (around line 1483), only for serious relationship seekers:

```typescript
{/* Physical Intimacy Expectations - Only for serious relationships */}
{isSeekingSerious() && (
  <div className="space-y-3">
    <Label htmlFor="intimacy_expectations" className="text-base">
      Physical Intimacy Expectations
    </Label>
    <p className="text-sm text-muted-foreground">
      Beyond the honeymoon phase, what does a healthy intimate life look like to you? This helps us match partners with compatible expectations.
    </p>
    <Select value={formData.intimacy_expectations} onValueChange={(value) => updateField("intimacy_expectations", value)}>
      <SelectTrigger className="bg-background/50">
        <SelectValue placeholder="Select your expectation" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="very_important">Very important - frequent physical connection</SelectItem>
        <SelectItem value="important_regular">Important - regular but not constant</SelectItem>
        <SelectItem value="quality_over_quantity">Quality over quantity - meaningful moments</SelectItem>
        <SelectItem value="fluctuates">Fluctuates - depends on life circumstances</SelectItem>
        <SelectItem value="lower_priority">Lower priority - emotional connection is enough</SelectItem>
        <SelectItem value="prefer_not_say">Prefer not to say</SelectItem>
      </SelectContent>
    </Select>
  </div>
)}
```

### Step 4: Add Fear Question to Step 6 (Dealbreakers)

Add in the "Self-Awareness Indicators" section (around line 1920):

```typescript
{/* Fear of Finding Love */}
<div className="space-y-3">
  <Label htmlFor="finding_love_fear" className="text-base">
    What's holding you back?
  </Label>
  <p className="text-sm text-muted-foreground">
    What fear or belief do you think has kept you from finding "the one"? Understanding our patterns helps us grow beyond them.
  </p>
  <Textarea
    id="finding_love_fear"
    value={formData.finding_love_fear}
    onChange={(e) => updateField("finding_love_fear", e.target.value)}
    placeholder="Be honest with yourself - awareness is the first step to change..."
    className="min-h-[100px] bg-background/50"
  />
</div>
```

### Step 5: Update Form Submission

Add the new fields to the Supabase insert (around line 569):

```typescript
// Add these to the insert object
intimacy_expectations: formData.intimacy_expectations || null,
finding_love_fear: formData.finding_love_fear || null,
```

### Step 6: Update Match-Finding AI Prompt

Update the `find-matches` edge function to include these new fields in the compatibility analysis:

Add to the prompt template (around line 230):

```typescript
// In the prompt for PERSON A and PERSON B
Physical Intimacy:
- Intimacy Expectations: ${targetProfile.intimacy_expectations || "Not specified"}

Self-Awareness:
- Finding Love Fear: ${targetProfile.finding_love_fear || "Not specified"}
```

Add to the scoring guide:

```typescript
**INTIMACY COMPATIBILITY - 10% of score:**
- Same intimacy expectations → +10 points
- One level difference → +5 points
- Very different expectations → -5 points (flag as potential issue)
```

### Step 7: Update DatingProfile Interface in Edge Function

Add the new fields to the `DatingProfile` interface in `find-matches/index.ts`:

```typescript
intimacy_expectations: string | null;
finding_love_fear: string | null;
```

---

## Question Design Rationale

### Intimacy Question Design
- Uses discreet, professional language appropriate for a premium matchmaking service
- Offers range of options from high priority to low priority
- Includes "prefer not to say" for those uncomfortable sharing
- Only shown to serious relationship seekers (casual daters typically prioritize this naturally)
- Framed positively as "healthy intimate life" not demands or requirements

### Fear Question Design
- Open-ended to allow genuine reflection
- Encourages vulnerability and self-awareness
- Helps matchmakers identify potential red flags or coaching opportunities
- Aligns with existing self-awareness questions (accountability_reflection, growth_work)
- Framed as growth-oriented, not judgmental

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/DatingIntakePage.tsx` | Add FormData fields, add two new questions to UI |
| `supabase/functions/find-matches/index.ts` | Update DatingProfile interface, add to AI prompt |
| Database migration | Add `intimacy_expectations` and `finding_love_fear` columns |

---

## Benefits

1. **Better matches** - Physical compatibility expectations are often overlooked but crucial
2. **Deeper insights** - The fear question reveals limiting beliefs that affect dating success
3. **Research-backed** - Intimacy research from Gottman Institute shows this predicts satisfaction
4. **Matchmaker value** - Gives human matchmakers additional context for curated introductions

