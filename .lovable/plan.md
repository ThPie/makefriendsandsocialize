
# Fix 2FA Setup, Profile Photo Display, and Auto-Logout Issues

## Issue Analysis

### Issue 1: 2FA Setup Not Working
**Root Cause:** After scanning the QR code and entering the verification code, the flow fails silently.

Looking at the edge function logs, I can see:
- MFA setup is initiated successfully: `"MFA setup initiated for admin dbf66e17-86eb-4789-a800-390c9af4790c"`
- But verification never completes - `mfa_enabled` is still `false` in the database
- The `admin_mfa_sessions` table is empty (no sessions created)

**The Problem:**
The verification flow in `verify-admin-mfa` edge function (lines 104-195) works like this:
1. Get MFA factors using `listFactors()`
2. Create a challenge using `mfa.challenge()`
3. Verify the challenge with the code

However, when setting up MFA for the FIRST time, Supabase requires you to verify the factor during enrollment BEFORE it becomes available in `listFactors()`. The current code:
- Sets up MFA enrollment (creates an unverified factor)
- User scans QR code
- User enters code
- Code tries to `listFactors()` but the factor is NOT yet verified/available
- Returns "No MFA factors found"

**The Fix:** Store the `factorId` from the setup step and use it directly for verification instead of calling `listFactors()`.

### Issue 2: Profile Picture Not Displaying Properly
**Root Cause:** The Avatar component renders images in a circular container, but the `object-cover` class alone doesn't ensure proper aspect ratio fitting.

Looking at the profile photos section (PortalProfile.tsx lines 248-290):
- Photos are rendered using `Avatar` component with `rounded-lg` class
- The `AvatarImage` uses `object-cover` but may have transparency/sizing issues
- Storage bucket images might not be loading with proper caching headers

**The Fix:**
1. Ensure the Avatar container has explicit dimensions that match the image
2. Add proper background color to prevent transparency issues
3. Add `object-position: center` for better cropping

### Issue 3: Sessions Staying Active for 2+ Days (Security Risk)
**Root Cause:** The Supabase Auth session has a long default expiry (7 days) and there's no inactivity-based logout.

Looking at `AuthContext.tsx`:
- Uses Supabase's default session management
- No inactivity timeout is implemented
- `useSessionManager.ts` exists but only tracks custom sessions, not auth sessions

**The Fix:**
1. Implement an inactivity timer that logs users out after a configurable period (e.g., 30 minutes of inactivity)
2. Use Page Visibility API + activity event listeners to track user engagement
3. Show a warning before auto-logout to give users a chance to stay logged in

---

## Implementation Plan

### Step 1: Fix 2FA Setup Flow
**File:** `src/components/admin/MFASetup.tsx`

**Changes:**
- Store the `factorId` from the setup response in component state
- Pass the `factorId` to the verify action instead of relying on `listFactors()`

```typescript
// Add factorId state
const [factorId, setFactorId] = useState<string>('');

// In startSetup, store the factorId
setFactorId(data.factorId);

// In verifySetup, pass factorId to the edge function
const { data, error } = await supabase.functions.invoke('verify-admin-mfa', {
  body: { action: 'verify', code: verifyCode, factorId }
});
```

**File:** `supabase/functions/verify-admin-mfa/index.ts`

**Changes:**
- Accept `factorId` in the verify action
- Use the provided `factorId` if available, otherwise fall back to `listFactors()`
- Handle first-time verification differently (factor needs to be verified to complete enrollment)

```typescript
if (action === 'verify') {
  const providedFactorId = factorId; // From request body
  
  let targetFactorId = providedFactorId;
  
  // If no factorId provided, try to get from listFactors
  if (!targetFactorId) {
    const { data: factors } = await supabaseUser.auth.mfa.listFactors();
    if (factors?.totp?.length > 0) {
      targetFactorId = factors.totp[0].id;
    }
  }
  
  if (!targetFactorId) {
    return new Response(JSON.stringify({ error: 'No MFA factor found' }), ...);
  }
  
  // Create challenge and verify
  const { data: challenge } = await supabaseUser.auth.mfa.challenge({ factorId: targetFactorId });
  const { data: verifyData } = await supabaseUser.auth.mfa.verify({
    factorId: targetFactorId,
    challengeId: challenge.id,
    code: code
  });
}
```

### Step 2: Fix Profile Photo Display
**File:** `src/pages/portal/PortalProfile.tsx`

**Changes:**
- Replace Avatar component with a direct img tag for better control
- Add proper styling to prevent transparency/opaque issues
- Add loading state and error handling for images

```typescript
{/* Profile photo with better display */}
<div className="relative group w-32 h-32 rounded-lg overflow-hidden bg-muted">
  <img
    src={url}
    alt={`Profile photo ${index + 1}`}
    className="w-full h-full object-cover object-center"
    loading="lazy"
    onError={(e) => {
      (e.target as HTMLImageElement).style.display = 'none';
    }}
  />
  {/* Fallback */}
  <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground -z-10">
    {initials}
  </div>
  {/* Remove button */}
  <button ...>
</div>
```

**File:** `src/components/ui/avatar.tsx`

**Changes:**
- Ensure `object-fit: cover` is properly applied
- Add background color to prevent transparent/opaque appearance

### Step 3: Implement Auto-Logout for Security
**New File:** `src/hooks/useInactivityLogout.ts`

**Purpose:** Hook to track user activity and auto-logout after inactivity period

```typescript
export function useInactivityLogout(timeoutMinutes = 30, warningMinutes = 2) {
  // Track last activity time
  // Listen for activity events (mouse, keyboard, touch, scroll)
  // Show warning modal before logout
  // Sign out user when timeout expires
  // Reset timer on any activity
}
```

**File:** `src/contexts/AuthContext.tsx`

**Changes:**
- Integrate the inactivity logout hook
- Add a warning modal component for upcoming logout
- Only apply to authenticated users

**New File:** `src/components/auth/InactivityWarningModal.tsx`

**Purpose:** Modal that appears when user is about to be logged out

```typescript
// Shows countdown timer
// "You will be logged out in X seconds"
// "Stay Logged In" button resets the timer
// "Log Out Now" button logs out immediately
```

**File:** `src/App.tsx` or `src/components/portal/PortalLayout.tsx`

**Changes:**
- Add InactivityWarningModal to authenticated routes
- Configure timeout duration (suggest 30 minutes for normal users, 2 hours for admins)

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/MFASetup.tsx` | Store and pass factorId to verification |
| `supabase/functions/verify-admin-mfa/index.ts` | Accept factorId parameter in verify action |
| `src/pages/portal/PortalProfile.tsx` | Fix profile photo display with better img handling |
| `src/hooks/useInactivityLogout.ts` | New hook for inactivity tracking |
| `src/components/auth/InactivityWarningModal.tsx` | New warning modal component |
| `src/components/portal/PortalLayout.tsx` | Integrate inactivity logout for portal users |
| `src/components/admin/AdminLayout.tsx` | Integrate inactivity logout for admin users (longer timeout) |

---

## Technical Details

### MFA Fix - Factor ID Flow
```text
1. User clicks "Set Up 2FA"
2. Edge function calls mfa.enroll() → returns factorId, qrCode, secret
3. Frontend stores factorId in state
4. User scans QR code in Google Authenticator
5. User enters 6-digit code
6. Frontend sends { action: 'verify', code, factorId }
7. Edge function uses factorId to challenge → verify
8. On success, factor is marked verified, session created
```

### Profile Photo Fix
The "opal" appearance is likely due to:
- The AvatarImage inheriting opacity from a parent
- The rounded-lg on Avatar conflicts with rounded-full default
- Missing background color causing transparency to show

### Inactivity Timeout Logic
```text
- Track: mousemove, mousedown, keydown, touchstart, scroll
- Timeout: 30 minutes of no activity
- Warning: Show modal 2 minutes before logout
- Reset: Any activity resets the full timer
- Pause: Don't count time when tab is hidden (optional)
```

---

## Expected Outcomes

1. **2FA Setup Works**: Users can scan QR code, enter code, and complete MFA enrollment
2. **Profile Photos Display Properly**: Photos show correctly without opacity/transparency issues
3. **Auto-Logout Security**: Users are logged out after 30 minutes of inactivity with a 2-minute warning

---

## Verification Steps

1. **2FA**: Navigate to admin, click Set Up 2FA, scan code, enter verification code → should complete successfully
2. **Profile Photo**: Upload a profile photo → should display clearly without opacity issues
3. **Auto-Logout**: Leave app idle for 28 minutes → warning should appear, 2 more minutes → auto-logout
