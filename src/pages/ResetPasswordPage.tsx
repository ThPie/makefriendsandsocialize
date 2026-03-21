import { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2, CheckCircle, AlertTriangle, Shield, X, AlertCircle, Mail, Smartphone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PasswordInput, validatePassword, getPasswordStrength } from '@/components/ui/password-input';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { BrandedLoader } from '@/components/ui/branded-loader';
import { BrandLogo } from '@/components/common/BrandLogo';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { session, isRecoveryMode, isLoading: authLoading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [codeExchangeDone, setCodeExchangeDone] = useState(false);
  const [codeExchangeSession, setCodeExchangeSession] = useState(false);
  
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
  const [passwordCheckTimeout, setPasswordCheckTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Explicitly handle PKCE code exchange when landing with ?code= parameter
  useEffect(() => {
    const handleCodeExchange = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      
      if (code) {
        try {
          console.log('Reset password: exchanging PKCE code for session');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Code exchange failed:', error);
          } else if (data?.session) {
            console.log('Code exchange successful, session established');
            setCodeExchangeSession(true);
          }
          
          // Clean up URL
          url.searchParams.delete('code');
          window.history.replaceState({}, '', url.pathname + url.search);
        } catch (err) {
          console.error('Code exchange error:', err);
        }
      }
      
      setCodeExchangeDone(true);
    };
    
    handleCodeExchange();
  }, []);

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
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: mfaFactorId,
      });
      
      if (challengeError) {
        setMfaError(challengeError.message);
        setIsVerifyingMfa(false);
        return;
      }
      
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
      
      setMfaVerified(true);
      setMfaRequired(false);
    } catch (err) {
      console.error('MFA verification error:', err);
      setMfaError('Verification failed. Please try again.');
    } finally {
      setIsVerifyingMfa(false);
    }
  };

  const hasValidSession = session !== null || isRecoveryMode || codeExchangeSession;
  const isLoading = authLoading || !codeExchangeDone || (hasValidSession && !mfaChecked);
  const showError = !authLoading && codeExchangeDone && !hasValidSession;
  const showMfaVerification = hasValidSession && mfaChecked && mfaRequired && !mfaVerified;
  const showPasswordForm = hasValidSession && mfaChecked && (!mfaRequired || mfaVerified);

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

  const validateConfirmPasswordField = useCallback((value: string) => {
    if (value !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError(undefined);
    return true;
  }, [password]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setFormError(null);
    setPasswordServerError(null);
    
    if (passwordTouched) {
      validatePasswordField(value);
    }
    
    if (confirmPasswordTouched && confirmPassword) {
      if (value !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError(undefined);
      }
    }

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
    
    if (passwordServerError) {
      setFormError(passwordServerError);
      return;
    }

    setIsSubmitting(true);

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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.functions.invoke('send-password-changed-email', {
          body: { userId: user.id },
        });
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const strength = getPasswordStrength(password);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-background">
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
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 bg-background">
        <div className="z-[2]">
          <FloatingParticles />
        </div>
        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <TransitionLink to="/" className="inline-block mb-8">
            <BrandLogo className="h-12 md:h-14" />
          </TransitionLink>

          <div className="bg-card backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-border">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-amber-500 dark:text-amber-400" />
            </div>
            <h1 className="font-display text-2xl text-card-foreground mb-2">Link Expired</h1>
            <p className="text-muted-foreground text-sm mb-6">
              The reset link is invalid or has expired. Please request a new one.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <TransitionLink to="/auth/forgot-password">Request New Reset Link</TransitionLink>
              </Button>
              <Button asChild variant="outline" className="w-full" size="lg">
                <TransitionLink to="/auth">Back to Sign In</TransitionLink>
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
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 bg-background">
        <div className="z-[2]">
          <FloatingParticles />
        </div>
        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <TransitionLink to="/" className="inline-block mb-8">
            <BrandLogo className="h-12 md:h-14" />
          </TransitionLink>

          <div className="bg-card backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <h1 className="font-display text-2xl text-card-foreground">Verify Your Identity</h1>
            </div>
            <p className="text-muted-foreground text-sm mb-6 ml-[52px]">
              Your account has two-factor authentication enabled. Enter the code from your authenticator app.
            </p>

            {mfaError && (
              <div className="mb-6 p-3 rounded-lg bg-destructive/20 border border-destructive/30 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{mfaError}</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Label className="text-muted-foreground text-center">Enter 6-digit code</Label>
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

            <div className="mt-6 p-3 rounded-lg bg-muted border border-border">
              <p className="text-muted-foreground text-xs text-center">
                🔒 This extra step keeps your account secure when changing your password.
              </p>
            </div>

            <div className="mt-6 text-center">
              <Button 
                variant="link"
                onClick={() => navigate('/auth')}
                className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 transition-colors"
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
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 bg-background">
        <div className="z-[2]">
          <FloatingParticles />
        </div>
        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <TransitionLink to="/" className="inline-block mb-8">
            <BrandLogo className="h-12 md:h-14" />
          </TransitionLink>
          
          <div className="bg-card backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-border text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-500 dark:text-green-400" />
            </div>
            
            <h1 className="font-display text-2xl text-card-foreground mb-3">Password Updated!</h1>
            
            <p className="text-muted-foreground mb-6">
              Your password has been successfully changed. You can now sign in with your new password.
            </p>
            
            <div className="bg-muted border border-border rounded-lg p-4 mb-6 flex items-start gap-3 text-left">
              <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-foreground text-sm font-medium">Confirmation Email Sent</p>
                <p className="text-muted-foreground text-xs mt-1">
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
            
            <p className="text-muted-foreground text-xs mt-4">
              If you didn't make this change, please contact support immediately.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 bg-background">
      <div className="z-[2]">
        <FloatingParticles />
      </div>
      
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <TransitionLink to="/" className="inline-block mb-8">
          <BrandLogo className="h-12 md:h-14" />
        </TransitionLink>

        <div className="bg-card backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h1 className="font-display text-2xl text-card-foreground">Set New Password</h1>
          </div>
          <p className="text-muted-foreground text-sm mb-6 ml-[52px]">
            Create a strong, secure password for your account.
          </p>

          {formError && (
            <div className="mb-6 p-3 rounded-lg bg-destructive/20 border border-destructive/30 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/80">New Password</Label>
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
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Checking password security...
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground/80">Confirm Password</Label>
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

            {confirmPassword.length > 0 && (
              <div className={`flex items-center gap-2 text-xs ${
                password === confirmPassword ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
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

          <div className="mt-6 text-center">
            <Button 
              variant="link"
              onClick={() => navigate('/auth')}
              className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Button>
          </div>
        </div>

        <p className="text-center text-muted-foreground text-xs mt-6">
          🔒 Your password is encrypted and never stored in plain text
        </p>
      </div>
    </div>
  );
}
