import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2, CheckCircle, AlertTriangle, Shield, X, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PasswordInput, validatePassword, getPasswordStrength } from '@/components/ui/password-input';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { BrandedLoader } from '@/components/ui/branded-loader';
import logoWhite from '@/assets/logo-white.png';
import logoDark from '@/assets/logo-dark.png';
import { useTheme } from 'next-themes';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { session, isRecoveryMode, isLoading: authLoading } = useAuth();
  const { resolvedTheme } = useTheme();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Validation states
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>();
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const [passwordServerError, setPasswordServerError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [passwordCheckTimeout, setPasswordCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  // The user arrives here after being redirected from the home page by RecoveryRedirectHandler.
  const hasValidSession = session !== null || isRecoveryMode;
  const isLoading = authLoading;
  const showError = !isLoading && !hasValidSession;
  
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

    setIsSubmitting(false);

    if (error) {
      setFormError(error.message);
      toast.error(error.message);
      return;
    }

    setIsSuccess(true);
    toast.success('Password updated successfully!');
    
    setTimeout(() => {
      navigate('/portal');
    }, 2000);
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
          className="absolute inset-0 w-full h-full object-cover"
          poster="/images/hero-poster.webp"
        >
          <source src="/videos/hero-1.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />
        
        <FloatingParticles />
        
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
          className="absolute inset-0 w-full h-full object-cover"
          poster="/images/hero-poster.webp"
        >
          <source src="/videos/hero-1.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />
        
        <FloatingParticles />
        
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
          className="absolute inset-0 w-full h-full object-cover"
          poster="/images/hero-poster.webp"
        >
          <source src="/videos/hero-1.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />
        
        <FloatingParticles />
        
        <div className="relative z-10 w-full max-w-md text-center animate-fade-in">
          <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl text-card-foreground mb-2">Password Updated!</h1>
            <p className="text-muted-foreground">Redirecting you to your portal...</p>
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
        className="absolute inset-0 w-full h-full object-cover"
        poster="/images/hero-poster.webp"
      >
        <source src="/videos/hero-1.mp4" type="video/mp4" />
      </video>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />
      
      <FloatingParticles />
      
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
            <Link 
              to="/auth" 
              className="text-sm text-white/60 hover:text-primary inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
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
