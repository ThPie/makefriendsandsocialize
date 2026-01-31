
# Fix: Password Reset for MFA-Enabled Users

## Problem
When resetting your password, you're seeing the error:
> "AAL2 session is required to update email or password when MFA is enabled"

This happens because your account has Two-Factor Authentication (2FA) enabled. For security, the system requires you to verify your identity through your authenticator app before allowing a password change.

## Solution
I'll update the password reset page to detect if you have 2FA enabled and guide you through verifying your authenticator code before updating your password.

---

## User Experience After Fix

### Step 1: Click password reset link (no change)
You'll land on the password reset page as usual.

### Step 2: MFA Check (new)
The system will automatically check if your account has 2FA enabled.

### Step 3: Enter Authenticator Code (new screen for MFA users)
If 2FA is enabled, you'll see:
- A prompt to enter your 6-digit code from your authenticator app
- Clear explanation that this is required for security
- Option to verify the code

### Step 4: Set New Password
After MFA verification, you'll proceed to set your new password normally.

---

## Technical Implementation

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/ResetPasswordPage.tsx` | Add MFA detection and verification step before password update |

### Implementation Steps

1. **Detect MFA Status**
   - After session is established, call `auth.mfa.listFactors()` to check for enrolled TOTP factors
   - If factors exist, set state to require MFA verification

2. **Add MFA Verification Step**
   - Create new state for `mfaRequired` and `mfaVerified`
   - Display MFA code input when MFA is required
   - Handle MFA challenge/verify flow:
     ```typescript
     const { data: challenge } = await supabase.auth.mfa.challenge({ factorId });
     const { data: verify } = await supabase.auth.mfa.verify({
       factorId,
       challengeId: challenge.id,
       code: userCode
     });
     ```

3. **Update Password Flow**
   - Only show password form after MFA is verified (or if no MFA is enrolled)
   - The session will automatically be upgraded to AAL2 after MFA verification
   - Password update will then succeed

### New Page States

```text
┌─────────────────────────────────────────────────────┐
│  Current States:                                     │
│  1. Loading (checking session)                       │
│  2. Error (invalid/expired link)                     │
│  3. Password Form                                    │
│  4. Success                                          │
├─────────────────────────────────────────────────────┤
│  New States (after fix):                             │
│  1. Loading (checking session)                       │
│  2. Error (invalid/expired link)                     │
│  3. MFA Verification (NEW - only for MFA users)      │
│  4. Password Form                                    │
│  5. Success                                          │
└─────────────────────────────────────────────────────┘
```

### Security Considerations
- MFA verification happens client-side using Supabase's built-in `auth.mfa.challenge()` and `auth.mfa.verify()` APIs
- After successful MFA verification, the JWT is upgraded to AAL2 automatically
- This matches the security requirements set by Supabase for password changes when MFA is enabled

---

## Estimated Time
5-10 minutes to implement and test.
