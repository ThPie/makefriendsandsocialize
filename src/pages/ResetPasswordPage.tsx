import { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2, CheckCircle, AlertTriangle, Shield, X, AlertCircle, Mail, Smartphone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PasswordInput, validatePassword, getPasswordStrength } from '@/components/ui/password-input';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { BrandedLoader } from '@/components/ui/branded-loader';
import logoWhite from '@/assets/logo-white.png';
import logoDark from '@/assets/logo-dark.png';
import { useTheme } from 'next-themes';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { session, isRecoveryMode, isLoading: authLoading } = useAuth();
  const { resolvedTheme } = useTheme();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // MFA states
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaVerified, setMfaVerified] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false);
  const [mfaChecked, setMfaChecked] = useState(false);
  
  // Validation states
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>();
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const [passwordServerError, setPasswordServerError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [passwordCheckTimeout, setPasswordCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  // Check for MFA factors when session is established
  useEffect(() => {
    const checkMfaFactors = async () => {
      if (!session || mfaChecked) return;
      
      try {
        const { data: factors, error } = await supabase.auth.mfa.listFactors();
        
        if (error) {
          console.error('Error checking MFA factors:', error);
          setMfaChecked(true);
          return;
        }
        
        // Check for verified TOTP factors
        const verifiedFactors = factors?.totp?.filter(f => f.status === 'verified') || [];
        
        if (verifiedFactors.length > 0) {
          setMfaRequired(true);
          setMfaFactorId(verifiedFactors[0].id);
        }
        
        setMfaChecked(true);
      } catch (err) {
        console.error('MFA check error:', err);
        setMfaChecked(true);
      }
    };
    
    checkMfaFactors();
  }, [session, mfaChecked]);

  // Handle MFA verification
  const handleMfaVerify = async () => {
    if (!mfaFactorId || mfaCode.length !== 6) return;
    
    setIsVerifyingMfa(true);
    setMfaError(null);
    
    try {
      // Create MFA challenge
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: mfaFactorId,
      });
      
      if (challengeError) {
        setMfaError(challengeError.message);
        setIsVerifyingMfa(false);
        return;
      }
      
      // Verify with the code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challenge.id,
        code: mfaCode,
      });
      
      if (verifyError) {
        setMfaError('Invalid code. Please try again.');
        setMfaCode('');
        setIsVerifyingMfa(false);
        return;
      }
      
      // MFA verified successfully - session is now AAL2
      setMfaVerified(true);
      setMfaRequired(false);
    } catch (err) {
      console.error('MFA verification error:', err);
      setMfaError('Verification failed. Please try again.');
    } finally {
      setIsVerifyingMfa(false);
    }
  };

  // The user arrives here after being redirected from the home page by RecoveryRedirectHandler.
  const hasValidSession = session !== null || isRecoveryMode;
  const isLoading = authLoading || (hasValidSession && !mfaChecked);
  const showError = !authLoading && !hasValidSession;
  const showMfaVerification = hasValidSession && mfaChecked && mfaRequired && !mfaVerified;
  const showPasswordForm = hasValidSession && mfaChecked && (!mfaRequired || mfaVerified);
  
  // Get the right logo based on theme
  const logoSrc = resolvedTheme === 'dark' ? logoWhite : logoDark;

  // Password validation
  const validatePasswordField = useCallback((value: string) => {
    const { isValid, errors } = validatePassword(value);
    if (!isValid && value.length > 0) {
      setPasswordError(errors[0]);
      return false;
    }
    setPasswordError(undefined);
    return true;
  }, []);

  // Confirm password validation
  const validateConfirmPasswordField = useCallback((value: string) => {
    if (value !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError(undefined);
    return true;
  }, [password]);

  // Handle password change with validation and breach check
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setFormError(null);
    setPasswordServerError(null);
    
    if (passwordTouched) {
      validatePasswordField(value);
    }
    
    // Also validate confirm password when password changes
    if (confirmPasswordTouched && confirmPassword) {
      if (value !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError(undefined);
      }
    }

    // Debounced server-side password breach check
    if (value.length >= 10) {
      if (passwordCheckTimeout) {
        clearTimeout(passwordCheckTimeout);
      }
      
      const timeout = setTimeout(async () => {
        setIsCheckingPassword(true);
        try {
          const { data, error } = await supabase.functions.invoke('check-password-strength', {
            body: { password: value },
          });

          if (!error && data && !data.isSecure) {
            if (data.breachCount) {
              setPasswordServerError(`This password has appeared in ${data.breachCount.toLocaleString()} data breaches. Please choose a different one.`);
            } else {
              setPasswordServerError(data.reason || 'Please choose a stronger password');
            }
          }
        } catch (err) {
          console.error('Password check failed:', err);
        } finally {
          setIsCheckingPassword(false);
        }
      }, 800);
      
      setPasswordCheckTimeout(timeout);
    }
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (confirmPasswordTouched) {
      validateConfirmPasswordField(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);
    
    // Validate password strength
    const { isValid, errors } = validatePassword(password);
    if (!isValid) {
      setPasswordError(errors[0]);
      setFormError(`Password must meet all requirements: ${errors.join(', ')}`);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      setFormError('Passwords do not match');
      return;
    }
    
    // Check for server-side password issues
    if (passwordServerError) {
      setFormError(passwordServerError);
      return;
    }

    setIsSubmitting(true);

    // Final server-side check before updating
    try {
      const { data, error: checkError } = await supabase.functions.invoke('check-password-strength', {
        body: { password },
      });

      if (!checkError && data && !data.isSecure) {
        setFormError(data.reason || 'Please choose a stronger password');
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      console.error('Password check error:', err);
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setFormError(error.message);
      setIsSubmitting(false);
      return;
    }

    // Send password changed confirmation email
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.functions.invoke('send-password-changed-email', {
          body: { userId: user.id },
        });
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't block success on email failure
    }

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const strength = getPasswordStrength(password);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          poster="/images/hero-poster.webp"
        >
          <source src="/videos/hero-1.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 z-[1]" />
        
        <div className="z-[2]">
          <FloatingParticles />
        </div>
        
        <div className="relative z-10 text-center">
          <BrandedLoader message="Verifying reset link..." />
        </div>
      </div>
    );
  }

  // Error state - no valid session
  if (showError) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          poster="/images/hero-poster.webp"
        >
          <source src="/videos/hero-1.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 z-[1]" />
        
        <div className="z-[2]">
          <FloatingParticles />
        </div>
        
        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <Link to="/" className="inline-block mb-8">
            <img src={logoWhite} alt="MakeFriends & Socialize" className="h-12 md:h-14" />
          </Link>

          <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-amber-400" />
            </div>
            <h1 className="font-display text-2xl text-card-foreground mb-2">Link Expired</h1>
            <p className="text-muted-foreground text-sm mb-6">
              The reset link is invalid or has expired. Please request a new one.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link to="/auth/forgot-password">Request New Reset Link</Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-white/20 text-white hover:bg-white/10" size="lg">
                <Link to="/auth">Back to Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MFA Verification state
  if (showMfaVerification) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          poster="/images/hero-poster.webp"
        >
          <source src="/videos/hero-1.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 z-[1]" />
        
        <div className="z-[2]">
          <FloatingParticles />
        </div>
        
        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <Link to="/" className="inline-block mb-8">
            <img src={logoWhite} alt="MakeFriends & Socialize" className="h-12 md:h-14" />
          </Link>

          <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
            {/* Header with Shield Icon */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <h1 className="font-display text-2xl text-white">Verify Your Identity</h1>
            </div>
            <p className="text-white/60 text-sm mb-6 ml-[52px]">
              Your account has two-factor authentication enabled. Enter the code from your authenticator app.
            </p>

            {/* MFA Error Banner */}
            {mfaError && (
              <div className="mb-6 p-3 rounded-lg bg-destructive/20 border border-destructive/30 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{mfaError}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* OTP Input */}
              <div className="flex flex-col items-center gap-4">
                <Label className="text-white/80 text-center">Enter 6-digit code</Label>
                <InputOTP
                  maxLength={6}
                  value={mfaCode}
                  onChange={(value) => setMfaCode(value)}
                  disabled={isVerifyingMfa}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {/* Verify Button */}
              <Button 
                onClick={handleMfaVerify}
                disabled={isVerifyingMfa || mfaCode.length !== 6} 
                className="w-full" 
                size="lg"
              >
                {isVerifyingMfa ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Continue'
                )}
              </Button>
            </div>

            {/* Security Note */}
            <div className="mt-6 p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-white/60 text-xs text-center">
                🔒 This extra step keeps your account secure when changing your password.
              </p>
            </div>

            {/* Back to Sign In Link */}
            <div className="mt-6 text-center">
              <Button 
                variant="link"
                onClick={() => navigate('/auth')}
                className="text-sm text-white/60 hover:text-primary inline-flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          poster="/images/hero-poster.webp"
        >
          <source src="/videos/hero-1.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 z-[1]" />
        
        <div className="z-[2]">
          <FloatingParticles />
        </div>
        
        <div className="relative z-10 w-full max-w-md animate-fade-in">
          {/* Logo */}
          <Link to="/" className="inline-block mb-8">
            <img src={logoWhite} alt="MakeFriends & Socialize" className="h-12 md:h-14" />
          </Link>
          
          <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
            
            <h1 className="font-display text-2xl text-white mb-3">Password Updated!</h1>
            
            <p className="text-white/70 mb-6">
              Your password has been successfully changed. You can now sign in with your new password.
            </p>
            
            {/* Email confirmation notice */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6 flex items-start gap-3 text-left">
              <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-white/90 text-sm font-medium">Confirmation Email Sent</p>
                <p className="text-white/60 text-xs mt-1">
                  We've sent a confirmation email to your registered address for your records.
                </p>
              </div>
            </div>
            
            <Button 
              onClick={() => navigate('/portal')} 
              className="w-full" 
              size="lg"
            >
              Go to Your Portal
            </Button>
            
            <p className="text-white/40 text-xs mt-4">
              If you didn't make this change, please contact support immediately.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        poster="/images/hero-poster.webp"
      >
        <source src="/videos/hero-1.mp4" type="video/mp4" />
      </video>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 z-[1]" />
      
      <div className="z-[2]">
        <FloatingParticles />
      </div>
      
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Logo - visible for both themes */}
        <Link to="/" className="inline-block mb-8">
          <img 
            src={logoWhite} 
            alt="MakeFriends & Socialize" 
            className="h-12 md:h-14" 
          />
        </Link>

        {/* Glassmorphism Card */}
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
          {/* Header with Shield Icon */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h1 className="font-display text-2xl text-white">Set New Password</h1>
          </div>
          <p className="text-white/60 text-sm mb-6 ml-[52px]">
            Create a strong, secure password for your account.
          </p>

          {/* Form Error Banner */}
          {formError && (
            <div className="mb-6 p-3 rounded-lg bg-destructive/20 border border-destructive/30 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">New Password</Label>
              <PasswordInput
                id="password"
                placeholder="Enter your new password"
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => {
                  setPasswordTouched(true);
                  validatePasswordField(password);
                }}
                showStrengthIndicator={true}
                error={passwordError || passwordServerError || undefined}
              />
              {isCheckingPassword && (
                <p className="text-xs text-white/50 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Checking password security...
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/80">Confirm Password</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                onBlur={() => {
                  setConfirmPasswordTouched(true);
                  validateConfirmPasswordField(confirmPassword);
                }}
                error={confirmPasswordError}
              />
            </div>

            {/* Password Match Indicator */}
            {confirmPassword.length > 0 && (
              <div className={`flex items-center gap-2 text-xs ${
                password === confirmPassword ? 'text-green-400' : 'text-white/40'
              }`}>
                {password === confirmPassword ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Passwords match</span>
                  </>
                ) : (
                  <>
                    <X className="h-3.5 w-3.5" />
                    <span>Passwords do not match</span>
                  </>
                )}
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isSubmitting || isCheckingPassword || strength.score < 100} 
              className="w-full" 
              size="lg"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Update Password'
              )}
            </Button>
          </form>

          {/* Back to Sign In Link */}
          <div className="mt-6 text-center">
            <Button 
              variant="link"
              onClick={() => navigate('/auth')}
              className="text-sm text-white/60 hover:text-primary inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Button>
          </div>
        </div>

        {/* Security Note */}
        <p className="text-center text-white/40 text-xs mt-6">
          🔒 Your password is encrypted and never stored in plain text
        </p>
      </div>
    </div>
  );
}
