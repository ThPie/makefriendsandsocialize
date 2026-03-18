import { useState, useEffect, useCallback, startTransition } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useSiteStats } from '@/hooks/useSiteStats';
import { ArrowLeft, ArrowRight, Check, Loader2, Mail, User, AlertTriangle, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { PhoneOTPLogin } from '@/components/auth/PhoneOTPLogin';
import { z } from 'zod';
import { MemberAvatars } from '@/components/home/MemberAvatars';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { BrandedLoader } from '@/components/ui/branded-loader';
import { PasswordInput, validatePassword } from '@/components/ui/password-input';
import { ValidatedInput } from '@/components/ui/validated-input';
import { SimpleCaptcha } from '@/components/auth/SimpleCaptcha';
import { useAuthRateLimit } from '@/hooks/useAuthRateLimit';
import { useSessionManager } from '@/hooks/useSessionManager';
import { BrandLogo } from '@/components/common/BrandLogo';
import golfSunsetImg from '@/assets/golf-sunset-hero.webp';

// Enhanced email validation
const emailSchema = z.string()
  .trim()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters');


import { INTERESTS, INDUSTRIES, MOTIVATIONS } from '@/config/constants';

const defaultAvatars = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
];

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signUp, signIn, signInWithGoogle, signInWithApple, isLoading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  // Auth rate limiting
  const { recordAttempt, rateLimitInfo, isRateLimited, requiresCaptcha } = useAuthRateLimit();
  const { createSession } = useSessionManager();

  // Use shared site stats hook for consistent data
  const { data: siteStats, isLoading: isLoadingStats } = useSiteStats();
  const memberCount = siteStats?.memberCount || 0;
  const avatarUrls = siteStats?.avatarUrls?.length ? siteStats.avatarUrls : defaultAvatars;

  // Referral tracking
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signatureStyle, setSignatureStyle] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [valuesInPartner, setValuesInPartner] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [industry, setIndustry] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  // Real-time validation errors
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>();
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const [passwordServerError, setPasswordServerError] = useState<string | null>(null);

  // Inline form feedback (replaces toast notifications)
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Clear form feedback when user interacts
  const clearFormFeedback = useCallback(() => {
    setFormError(null);
    setFormSuccess(null);
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    clearFormFeedback();
    const { error } = await signInWithGoogle();
    if (error) {
      setFormError(error.message || 'Could not connect to Google.');
    }
  }, [clearFormFeedback, signInWithGoogle]);

  const handleAppleSignIn = useCallback(async () => {
    clearFormFeedback();
    const { error } = await signInWithApple();
    if (error) {
      setFormError(error.message || 'Could not connect to Apple.');
    }
  }, [clearFormFeedback, signInWithApple]);

  // Real-time email validation
  const validateEmail = useCallback((value: string) => {
    if (!value) {
      setEmailError('Email is required');
      return false;
    }
    try {
      emailSchema.parse(value);
      setEmailError(undefined);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setEmailError(err.errors[0].message);
      }
      return false;
    }
  }, []);

  // Real-time password validation
  const validatePasswordField = useCallback((value: string) => {
    const { isValid, errors } = validatePassword(value);
    if (!isValid && value.length > 0) {
      setPasswordError(errors[0]);
      return false;
    }
    setPasswordError(undefined);
    return true;
  }, []);

  // Real-time confirm password validation
  const validateConfirmPassword = useCallback((value: string) => {
    if (value !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError(undefined);
    return true;
  }, [password]);

  // Update email with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    clearFormFeedback();
    if (emailTouched) {
      validateEmail(value);
    }
  };

  // Debounce timer ref for password breach check
  const [passwordCheckTimeout, setPasswordCheckTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Update password with validation and debounced breach check
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    clearFormFeedback();
    setPasswordServerError(null);

    if (mode === 'signup') {
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

    // Debounced server-side password breach check for signup
    if (mode === 'signup' && value.length >= 10) {
      // Clear previous timeout
      if (passwordCheckTimeout) {
        clearTimeout(passwordCheckTimeout);
      }

      // Set new timeout for debounced check
      const timeout = setTimeout(async () => {
        setIsCheckingPassword(true);
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          const { data, error } = await supabase.functions.invoke('check-password-strength', {
            body: { password: value },
          });
          clearTimeout(timeoutId);

          if (!error && data && !data.isSecure) {
            // Show breach count in error message
            if (data.breachCount) {
              setPasswordServerError(`This password has appeared in ${data.breachCount.toLocaleString()} data breaches. Please choose a different one.`);
            } else {
              setPasswordServerError(data.reason || 'Please choose a stronger password');
            }
          }
        } catch (err) {
          // Silently fail - don't block user
          console.error('Password check failed:', err);
        } finally {
          setIsCheckingPassword(false);
        }
      }, 800); // 800ms debounce

      setPasswordCheckTimeout(timeout);
    }
  };

  // Update confirm password with validation
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (confirmPasswordTouched) {
      validateConfirmPassword(value);
    }
  };

  // Check for referral code in URL
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref.toUpperCase());
      setMode('signup'); // Auto-switch to signup mode when coming from referral

      // Look up the referrer's name
      const lookupReferrer = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('referral_code', ref.toUpperCase())
          .single();

        if (data?.first_name) {
          setReferrerName(data.first_name);
        }
      };
      lookupReferrer();
    }
  }, [searchParams]);

  // Removed: member stats are now fetched via useSiteStats hook

  // Handle redirect after login - use smart redirect logic
  useEffect(() => {
    const handleRedirect = async () => {
      if (!user || isLoading) return;

      const returnTo = searchParams.get('returnTo');
      if (returnTo && returnTo.startsWith('/portal')) {
        // For portal routes, still check if onboarding is needed
        const { data: profileData } = await supabase
          .from('profiles')
          .select('onboarding_completed, first_name, last_name, bio, avatar_urls, interests, industry, job_title, city')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData && !profileData.onboarding_completed) {
          navigate('/portal/onboarding');
          return;
        }
        navigate(returnTo);
        return;
      }

      // For new logins, check profile completion
      const { data: profileData } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();

      if (!profileData?.onboarding_completed) {
        navigate('/portal/onboarding');
        return;
      }

      // Check application status
      const { data: appData } = await supabase
        .from('application_waitlist')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (appData?.status === 'pending') {
        navigate('/auth/waiting');
        return;
      }

      navigate('/portal');
    };

    handleRedirect();
  }, [user, isLoading, navigate, searchParams]);

  const validateStep1 = () => {
    // Mark all fields as touched to show errors
    setEmailTouched(true);
    setPasswordTouched(true);
    clearFormFeedback();

    if (mode === 'signup') {
      setConfirmPasswordTouched(true);
    }

    // Validate email
    let isValid = true;
    let firstError: string | null = null;

    try {
      emailSchema.parse(email);
      setEmailError(undefined);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setEmailError(err.errors[0].message);
        if (!firstError) firstError = err.errors[0].message;
      }
      isValid = false;
    }

    // For signup, validate password strength
    if (mode === 'signup') {
      const { isValid: passwordValid, errors } = validatePassword(password);
      if (!passwordValid) {
        setPasswordError(errors[0]);
        if (!firstError) firstError = errors[0];
        isValid = false;
      } else {
        setPasswordError(undefined);
      }

      // Validate confirm password
      if (password !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
        if (!firstError) firstError = 'Passwords do not match';
        isValid = false;
      } else {
        setConfirmPasswordError(undefined);
      }
    } else {
      // For signin, just check password isn't empty
      if (password.length < 1) {
        if (!firstError) firstError = 'Password is required';
        isValid = false;
      }
    }

    if (firstError) {
      setFormError(firstError);
    }

    return isValid;
  };

  const handleStep1Submit = async () => {
    if (!validateStep1()) return;

    // Check CAPTCHA if required
    if (requiresCaptcha && !captchaVerified) {
      setFormError('Please complete the security check first');
      return;
    }

    // For signup, validate password strength BEFORE proceeding to onboarding
    if (mode === 'signup') {
      const { isValid, errors } = validatePassword(password);
      if (!isValid) {
        setFormError(`Password must meet all requirements: ${errors.join(', ')}`);
        return;
      }

      if (password !== confirmPassword) {
        setFormError('Passwords do not match');
        return;
      }

      // Server-side password check for breached/weak passwords
      setIsCheckingPassword(true);
      setIsSubmitting(true);
      try {
        const checkPromise = supabase.functions.invoke('check-password-strength', {
          body: { password },
        });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000));
        const { data, error } = await Promise.race([checkPromise, timeoutPromise]) as any;

        if (error) {
          console.error('Password check error:', error);
        } else if (data && !data.isSecure) {
          setFormError(data.reason || 'Please choose a stronger password');
          setPasswordServerError(data.reason);
          setIsSubmitting(false);
          setIsCheckingPassword(false);
          return;
        }
      } catch (err) {
        console.error('Error checking password (skipping):', err);
      }
      setIsCheckingPassword(false);
      setIsSubmitting(false);
    }

    if (mode === 'signin') {
      setIsSubmitting(true);
      clearFormFeedback();

      // Record login attempt for rate limiting
      await recordAttempt(false);

      const { error } = await signIn(email, password);

      if (error) {
        // Record failed attempt
        await recordAttempt(true);
        setIsSubmitting(false);

        // Prevent account enumeration - use generic error message
        setFormError('Invalid email or password. Please check your credentials and try again.');
        return;
      }

      // Create session with remember me preference
      await createSession(rememberMe);

      setIsSubmitting(false);
      navigate('/portal');
    } else {
      // For signup, redirect to email verification page
      setIsSubmitting(true);
      clearFormFeedback();

      try {
        const signUpResult = await signUp(email, password);

        if (signUpResult.error) {
          const signUpError = signUpResult.error;
          const errorMessage = signUpError.message?.toLowerCase() || '';

          if (errorMessage.includes('already registered') ||
            errorMessage.includes('user already exists') ||
            errorMessage.includes('email already')) {
            setFormError('This email is already registered. Please sign in instead.');
            setMode('signin');
          } else {
            setFormError(signUpError.message || 'Unable to create account. Please try again.');
          }
          setIsSubmitting(false);
          return;
        }

        // Redirect to email verification
        setIsSubmitting(false);
        navigate('/auth/verify-email');
      } catch (err) {
        console.error('Signup error:', err);
        setFormError('An unexpected error occurred. Please try again.');
        setIsSubmitting(false);
      }
    }
  };

  const handleFinalSubmit = async () => {
    if (!acceptedTerms) {
      setFormError('Please accept the Privacy Policy and Terms of Service');
      return;
    }

    setIsSubmitting(true);
    clearFormFeedback();

    try {
      const signUpResult = await signUp(email, password);

      if (signUpResult.error) {
        const signUpError = signUpResult.error;
        // Handle specific error cases with user-friendly messages
        const errorMessage = signUpError.message?.toLowerCase() || '';
        const errorStatus = (signUpError as any)?.status;

        // Check for duplicate email - only if message explicitly indicates it
        // Don't assume 422 means duplicate - it could be password validation or other issues
        if (errorMessage.includes('already registered') ||
          errorMessage.includes('user already exists') ||
          errorMessage.includes('already been registered') ||
          errorMessage.includes('email already') ||
          errorMessage.includes('duplicate') ||
          errorMessage.includes('unique constraint')) {
          setFormError('This email is already registered. Please sign in instead.');
          setMode('signin');
          setStep(1);
          setIsSubmitting(false);
          return;
        }

        // Handle 422 separately - could be password validation or other validation errors
        if (errorStatus === 422) {
          // Show actual error message or a helpful generic one
          const friendlyMessage = signUpError.message || 'Please check your email and password meet the requirements.';
          setFormError(friendlyMessage);
          setStep(1); // Go back to credentials step to show the error
          setIsSubmitting(false);
          return;
        }

        if (errorMessage.includes('invalid api key') || errorMessage.includes('api key')) {
          // This is likely an email service configuration issue, not a user error
          console.error('Email service configuration error:', signUpError);
          setFormError('Account creation temporarily unavailable. Please try again in a few minutes or contact support.');
          setStep(1);
          setIsSubmitting(false);
          return;
        }

        if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
          setFormError('Too many signup attempts. Please wait a few minutes and try again.');
          setStep(1);
          setIsSubmitting(false);
          return;
        }

        if (errorMessage.includes('signups not allowed') || errorMessage.includes('signup disabled')) {
          setFormError('New registrations are temporarily disabled. Please try again later or contact support.');
          setStep(1);
          setIsSubmitting(false);
          return;
        }

        if (errorMessage.includes('email') && errorMessage.includes('invalid')) {
          setFormError('Please enter a valid email address.');
          setStep(1);
          setIsSubmitting(false);
          return;
        }

        // Generic fallback for unknown errors - always go back to Step 1
        console.error('Signup error:', signUpError);
        setFormError('Unable to create account. Please check your information and try again.');
        setStep(1);
        setIsSubmitting(false);
        return;
      }

      // Wait briefly for session to be established
      await new Promise(resolve => setTimeout(resolve, 500));

      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Use custom industry if "Other" is selected
        const finalIndustry = industry === 'Other' ? customIndustry : industry;

        // Update profile with onboarding data
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: firstName,
            last_name: lastName,
            signature_style: signatureStyle,
            favorite_brands: selectedBrands,
            values_in_partner: valuesInPartner,
            interests: selectedInterests,
            industry: finalIndustry,
            job_title: jobTitle,
            terms_accepted_at: new Date().toISOString(),
          })
          .eq('id', session.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          // Continue anyway - profile can be updated later
        }

        // Add to waitlist
        const { error: waitlistError } = await supabase
          .from('application_waitlist')
          .insert({
            user_id: session.user.id,
            style_description: signatureStyle,
            favorite_brands: selectedBrands,
            values_in_partner: valuesInPartner,
            interests: selectedInterests,
            industry: finalIndustry,
            job_title: jobTitle,
            status: 'pending',
          });

        if (waitlistError) {
          console.error('Waitlist insert error:', waitlistError);
          // Continue anyway - user is registered
        }

        // Track referral if present
        if (referralCode) {
          try {
            await supabase.functions.invoke('track-referral', {
              body: {
                referral_code: referralCode,
                new_user_id: session.user.id,
              },
            });
          } catch (err) {
            console.error('Failed to track referral:', err);
            // Non-critical, continue
          }
        }

        // Send account created notification email
        try {
          await supabase.functions.invoke('send-profile-notification', {
            body: { user_id: session.user.id, notification_type: 'account_created' },
          });
        } catch (emailErr) {
          console.error('Failed to send welcome email:', emailErr);
        }

        setIsSubmitting(false);
        setFormSuccess('🎉 Account created! Welcome to Make Friends & Socialize. Check your email for confirmation.');
        setTimeout(() => navigate('/portal/onboarding'), 1500);
      } else {
        // No session but no error - user needs to verify email
        // console.log('Signup completed, awaiting email confirmation');
        setIsSubmitting(false);
        setFormSuccess('Account created! Please check your email to verify your account.');
        navigate('/auth/verify-email');
      }
    } catch (err) {
      console.error('Unexpected signup error:', err);
      setFormError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const toggleMotivation = (motivation: string) => {
    setSelectedBrands(prev =>
      prev.includes(motivation)
        ? prev.filter(b => b !== motivation)
        : [...prev, motivation]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };


  if (isLoading) {
    return <BrandedLoader />;
  }

  // Split-screen layout for Step 1 (credentials)
  if (step === 1) {
    return (
      <div className="min-h-screen flex relative bg-background">
        {/* Outer frame with subtle border */}
        <div className="hidden lg:flex w-full min-h-screen p-3">
          {/* Left Side — Image Panel with overlay */}
          <div className="relative w-1/2 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <iframe
                src="https://www.youtube.com/embed/bpRUQw2Gzmc?autoplay=1&mute=1&loop=1&playlist=bpRUQw2Gzmc&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[177.78vh] min-h-[100vh] w-auto h-auto"
                style={{ border: 'none', aspectRatio: '9/16' }}
                title="Background video"
              />
            </div>
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-background/20" />
            
            {/* Logo + Back to website */}
            <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-10">
              <Link to="/">
                <BrandLogo forceWhite className="h-10 w-auto" />
              </Link>
              <Link
                to="/"
                className="text-sm text-white/80 hover:text-white border border-white/20 rounded-full px-4 py-2 backdrop-blur-sm bg-white/5 transition-colors duration-200 flex items-center gap-1.5"
              >
                Back to website
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Bottom tagline + member avatars */}
            <div className="absolute bottom-10 left-8 right-8 z-10">
              <h2 className="font-display italic text-3xl xl:text-4xl text-white leading-tight mb-6">
                Where Connections<br />Become Community
              </h2>
              <MemberAvatars avatarUrls={avatarUrls} memberCount={memberCount} isLoading={isLoadingStats} />
            </div>
          </div>

          {/* Right Side — Form Panel */}
          <div className="w-1/2 flex flex-col justify-center px-12 xl:px-20">
            <div className="w-full max-w-md mx-auto">
              {/* Title */}
              <h1 className="font-display italic text-4xl text-foreground mb-2">
                {mode === 'signin' ? 'Welcome back' : 'Create an account'}
              </h1>
              <p className="text-muted-foreground text-sm mb-8">
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setStep(1); clearFormFeedback(); }}
                  className="text-foreground underline underline-offset-4 hover:text-[hsl(var(--accent-gold))] transition-colors"
                >
                  {mode === 'signin' ? 'Sign Up' : 'Log in'}
                </button>
              </p>

              {/* Referral Banner */}
              {referralCode && referrerName && mode === 'signup' && (
                <div className="mb-6 p-4 bg-primary/20 border border-primary/30 rounded-xl">
                  <p className="text-sm text-foreground/90">
                    🎉 <strong>{referrerName}</strong> invited you! Sign up to get <span className="text-primary font-semibold">10% off</span> your first month.
                  </p>
                </div>
              )}

              {/* Inline Form Feedback */}
              {formError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm mb-4">
                  <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Auth Method Toggle (Sign In only) */}
              {mode === 'signin' && (
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setAuthMethod('email')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      authMethod === 'email'
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-foreground/5 text-muted-foreground border border-foreground/10 hover:bg-foreground/10'
                    }`}
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </button>
                  <button
                    onClick={() => setAuthMethod('phone')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      authMethod === 'phone'
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-foreground/5 text-muted-foreground border border-foreground/10 hover:bg-foreground/10'
                    }`}
                  >
                    <Phone className="h-4 w-4" />
                    Phone
                  </button>
                </div>
              )}

              {/* Phone OTP Login */}
              {mode === 'signin' && authMethod === 'phone' ? (
                <PhoneOTPLogin
                  onSuccess={() => navigate('/portal/dashboard')}
                  onSwitchToEmail={() => setAuthMethod('email')}
                  disabled={isSubmitting}
                />
              ) : (
              /* Email Form Fields */
              <div className="space-y-4">
                {mode === 'signup' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-xs uppercase tracking-wider text-muted-foreground font-medium ml-1">First Name</Label>
                      <ValidatedInput
                        id="firstName"
                        placeholder="James"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        icon={<User className="h-4 w-4 text-muted-foreground/60" />}
                        autoComplete="given-name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-xs uppercase tracking-wider text-muted-foreground font-medium ml-1">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Harrington"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20"
                        autoComplete="family-name"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground font-medium ml-1">Email</Label>
                  <ValidatedInput
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => { setEmailTouched(true); validateEmail(email); }}
                    error={emailTouched ? emailError : undefined}
                    success={emailTouched && !emailError && email.length > 0}
                    icon={<Mail className="h-4 w-4 text-muted-foreground/60" />}
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground font-medium ml-1">Password</Label>
                  <PasswordInput
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => { setPasswordTouched(true); if (mode === 'signup') validatePasswordField(password); }}
                    showStrengthIndicator={mode === 'signup'}
                    error={mode === 'signup' ? passwordError : undefined}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  />
                  {mode === 'signup' && passwordServerError && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mt-1">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{passwordServerError}</span>
                    </div>
                  )}
                  {mode === 'signup' && isCheckingPassword && (
                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Checking password security...
                    </p>
                  )}
                </div>

                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-wider text-muted-foreground font-medium ml-1">Confirm Password</Label>
                    <PasswordInput
                      id="confirmPassword"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      onBlur={() => { setConfirmPasswordTouched(true); validateConfirmPassword(confirmPassword); }}
                      error={confirmPasswordTouched ? confirmPasswordError : undefined}
                      autoComplete="new-password"
                    />
                  </div>
                )}

                {mode === 'signin' && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">Remember me</label>
                    </div>
                    <Link to="/auth/forgot-password" className="text-xs text-muted-foreground hover:text-[hsl(var(--accent-gold))] transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                )}

                {/* Rate Limit Warning */}
                {isRateLimited && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/20 border border-destructive/30 rounded-lg text-destructive text-sm">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span>Too many attempts. Please try again {rateLimitInfo?.resetAt ? `after ${new Date(rateLimitInfo.resetAt).toLocaleTimeString()}` : 'later'}.</span>
                  </div>
                )}

                {requiresCaptcha && !isRateLimited && (
                  <SimpleCaptcha onVerify={setCaptchaVerified} disabled={isSubmitting} />
                )}

                {mode === 'signup' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms-step1"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                      className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label htmlFor="terms-step1" className="text-sm text-muted-foreground cursor-pointer">
                      I agree to the{' '}
                      <Link to="/terms" className="underline underline-offset-4 hover:text-foreground">Terms & Conditions</Link>
                    </label>
                  </div>
                )}

                <Button
                  onClick={() => { requestAnimationFrame(() => { setTimeout(() => { handleStep1Submit(); }, 0); }); }}
                  disabled={isSubmitting || isRateLimited || (requiresCaptcha && !captchaVerified)}
                  className="w-full gold-fill hover:opacity-90 text-white font-medium rounded-xl h-12 transition-opacity duration-150"
                  size="lg"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : mode === 'signin' ? 'Login' : (
                    <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-foreground/10" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
                  <div className="h-px flex-1 bg-foreground/10" />
                </div>


              </div>
              )}

            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden min-h-screen flex flex-col bg-background">
          {/* Mobile image header */}
          <div className="relative h-56 overflow-hidden">
            <img src={golfSunsetImg} alt="Golf course sunset" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <Link to="/" className="absolute top-4 left-4 z-10">
              <BrandLogo forceWhite className="h-8 w-auto" />
            </Link>
          </div>

          <div className="flex-1 px-6 py-6 -mt-8 relative z-10">
            <h1 className="font-display italic text-3xl text-foreground mb-1">
              {mode === 'signin' ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setStep(1); clearFormFeedback(); }}
                className="text-foreground underline underline-offset-4"
              >
                {mode === 'signin' ? 'Sign Up' : 'Log in'}
              </button>
            </p>

            {formError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm mb-4">
                <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Auth Method Toggle (Sign In only) */}
            {mode === 'signin' && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setAuthMethod('email')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    authMethod === 'email'
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-foreground/5 text-muted-foreground border border-foreground/10 hover:bg-foreground/10'
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  Email
                </button>
                <button
                  onClick={() => setAuthMethod('phone')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    authMethod === 'phone'
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-foreground/5 text-muted-foreground border border-foreground/10 hover:bg-foreground/10'
                  }`}
                >
                  <Phone className="h-4 w-4" />
                  Phone
                </button>
              </div>
            )}

            {mode === 'signin' && authMethod === 'phone' ? (
              <PhoneOTPLogin
                onSuccess={() => navigate('/portal/dashboard')}
                onSwitchToEmail={() => setAuthMethod('email')}
                disabled={isSubmitting}
              />
            ) : (
            <div className="space-y-4">
              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName-m" className="text-xs uppercase tracking-wider text-muted-foreground font-medium ml-1">First Name</Label>
                    <ValidatedInput id="firstName-m" placeholder="James" value={firstName} onChange={(e) => setFirstName(e.target.value)} icon={<User className="h-4 w-4 text-muted-foreground/60" />} autoComplete="given-name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName-m" className="text-xs uppercase tracking-wider text-muted-foreground font-medium ml-1">Last Name</Label>
                    <Input id="lastName-m" placeholder="Harrington" value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50" autoComplete="family-name" />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email-m" className="text-xs uppercase tracking-wider text-muted-foreground font-medium ml-1">Email</Label>
                <ValidatedInput id="email-m" type="email" placeholder="you@example.com" value={email} onChange={handleEmailChange} onBlur={() => { setEmailTouched(true); validateEmail(email); }} error={emailTouched ? emailError : undefined} success={emailTouched && !emailError && email.length > 0} icon={<Mail className="h-4 w-4 text-muted-foreground/60" />} autoComplete="email" inputMode="email" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password-m" className="text-xs uppercase tracking-wider text-muted-foreground font-medium ml-1">Password</Label>
                <PasswordInput id="password-m" placeholder="Enter your password" value={password} onChange={handlePasswordChange} onBlur={() => { setPasswordTouched(true); if (mode === 'signup') validatePasswordField(password); }} showStrengthIndicator={mode === 'signup'} error={mode === 'signup' ? passwordError : undefined} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
              </div>

              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword-m" className="text-xs uppercase tracking-wider text-muted-foreground font-medium ml-1">Confirm Password</Label>
                  <PasswordInput id="confirmPassword-m" placeholder="••••••••" value={confirmPassword} onChange={handleConfirmPasswordChange} onBlur={() => { setConfirmPasswordTouched(true); validateConfirmPassword(confirmPassword); }} error={confirmPasswordTouched ? confirmPasswordError : undefined} autoComplete="new-password" />
                </div>
              )}

              {mode === 'signin' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember-m" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                    <label htmlFor="remember-m" className="text-sm text-muted-foreground cursor-pointer">Remember me</label>
                  </div>
                  <Link to="/auth/forgot-password" className="text-xs text-muted-foreground hover:text-[hsl(var(--accent-gold))] transition-colors">Forgot password?</Link>
                </div>
              )}

              {isRateLimited && (
                <div className="flex items-center gap-2 p-3 bg-destructive/20 border border-destructive/30 rounded-lg text-destructive text-sm">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>Too many attempts. Try again later.</span>
                </div>
              )}

              {requiresCaptcha && !isRateLimited && <SimpleCaptcha onVerify={setCaptchaVerified} disabled={isSubmitting} />}

              <Button
                onClick={() => { requestAnimationFrame(() => { setTimeout(() => { handleStep1Submit(); }, 0); }); }}
                disabled={isSubmitting || isRateLimited || (requiresCaptcha && !captchaVerified)}
                className="w-full gold-fill hover:opacity-90 text-white font-medium rounded-xl h-12 transition-opacity duration-150"
                size="lg"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'signin' ? 'Login' : <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-foreground/10" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
                <div className="h-px flex-1 bg-foreground/10" />
              </div>



            </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Multi-step signup (steps 2 & 3) - modern video background layout
  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-16 overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster="/images/hero-poster.webp"
      >
        <source src="/videos/hero-1.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay — Stitch forest green */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background/85" />

      {/* Floating Particles */}
      <FloatingParticles count={20} />

      <div className="relative z-10 w-full max-w-2xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6 flex justify-center">
            <BrandLogo className="h-14 w-auto drop-shadow-sm" />
          </Link>
          <h1 className="font-display text-3xl md:text-4xl text-white mb-2">
            Complete Your Application
          </h1>
          <p className="text-white/60">
            Just a few more details to personalize your experience
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-12 rounded-full transition-all duration-300 ${s < step ? 'bg-[hsl(var(--accent-gold))]' : s === step ? 'bg-[hsl(var(--accent-gold))] shadow-lg shadow-[hsl(var(--accent-gold))]/50' : 'bg-white/20'
                }`}
            />
          ))}
        </div>

        {/* Form Card - Glassmorphism */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
          {/* Step 2: About You */}
          {(step as number) === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl text-white">About You</h2>
                <p className="text-white/50 text-sm mt-1">Tell us a bit about yourself</p>
              </div>

              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider text-white/60 font-medium ml-1">Industry</Label>
                <Select
                  value={industry}
                  onValueChange={(value) => {
                    setIndustry(value);
                    if (value !== 'Other') {
                      setCustomIndustry('');
                    }
                  }}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20 [&>span]:text-white/70 [&[data-state=open]>span]:text-white">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10 z-50">
                    {INDUSTRIES.map((ind) => (
                      <SelectItem
                        key={ind}
                        value={ind}
                        className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white"
                      >
                        {ind}
                      </SelectItem>
                    ))}
                    <SelectItem
                      value="Other"
                      className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white"
                    >
                      Other
                    </SelectItem>
                  </SelectContent>
                </Select>

                {industry === 'Other' && (
                  <Input
                    placeholder="Please specify your industry"
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20 mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="text-xs uppercase tracking-wider text-white/60 font-medium ml-1">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g. Creative Director, Founder"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signatureStyle" className="text-xs uppercase tracking-wider text-white/60 font-medium ml-1">
                  Tell us about yourself
                </Label>
                <Textarea
                  id="signatureStyle"
                  placeholder="I'm a creative director with a passion for art and design. I thrive in environments where meaningful conversations happen..."
                  value={signatureStyle}
                  onChange={(e) => setSignatureStyle(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20 min-h-[100px]"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider text-white/60 font-medium ml-1">What brings you to our community?</Label>
                <div className="flex flex-wrap gap-2">
                  {MOTIVATIONS.map((motivation) => (
                    <button
                      key={motivation}
                      onClick={() => toggleMotivation(motivation)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all duration-200 ${selectedBrands.includes(motivation)
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25'
                        : 'bg-white/5 text-white/80 border-white/10 hover:border-white/30 hover:bg-white/10'
                        }`}
                    >
                      {motivation}
                      {selectedBrands.includes(motivation) && <Check className="inline ml-1.5 h-3 w-3" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => { requestAnimationFrame(() => { setTimeout(() => { startTransition(() => setStep(3)); }, 0); }); }}
                  className="flex-1 gold-gradient-bg hover:brightness-110 text-black font-bold shadow-[0_4px_14px_0_rgba(212,175,55,0.3)]"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Your Lifestyle */}
          {(step as number) === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl text-white">Your Lifestyle</h2>
                <p className="text-white/50 text-sm mt-1">Help us understand what you're looking for</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="values" className="text-xs uppercase tracking-wider text-white/60 font-medium ml-1">
                  What would make your membership valuable?
                </Label>
                <Textarea
                  id="values"
                  placeholder="Access to curated events, meeting inspiring people, and being part of a community that values authenticity..."
                  value={valuesInPartner}
                  onChange={(e) => setValuesInPartner(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20 min-h-[100px]"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider text-white/60 font-medium ml-1">Your Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all duration-200 ${selectedInterests.includes(interest)
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25'
                        : 'bg-white/5 text-white/80 border-white/10 hover:border-white/30 hover:bg-white/10'
                        }`}
                    >
                      {interest}
                      {selectedInterests.includes(interest) && <Check className="inline ml-1.5 h-3 w-3" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Terms & Privacy Consent */}
              <div className="flex items-start gap-3 pt-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  className="mt-1 border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label htmlFor="terms" className="text-sm text-white/70 cursor-pointer leading-relaxed">
                  I have read and agree to the{' '}
                  <Link
                    to="/privacy"
                    target="_blank"
                    className="text-primary hover:text-primary/80 underline underline-offset-2"
                  >
                    Privacy Policy
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/terms"
                    target="_blank"
                    className="text-primary hover:text-primary/80 underline underline-offset-2"
                  >
                    Terms of Service
                  </Link>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => { requestAnimationFrame(() => { setTimeout(() => { handleFinalSubmit(); }, 0); }); }}
                  disabled={isSubmitting || !acceptedTerms}
                  className="flex-1 gold-gradient-bg hover:brightness-110 text-black font-bold shadow-[0_4px_14px_0_rgba(212,175,55,0.3)] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Submit Application
                      <Check className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
