import { useState, useEffect, useCallback } from 'react';
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
import { RegistrationSteps } from '@/components/auth/RegistrationSteps';

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
  const { user, signUp, signIn, signInWithGoogle, isLoading } = useAuth();
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
  const [passwordCheckTimeout, setPasswordCheckTimeout] = useState<NodeJS.Timeout | null>(null);

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
          const { data, error } = await supabase.functions.invoke('check-password-strength', {
            body: { password: value },
          });

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
        const { data, error } = await supabase.functions.invoke('check-password-strength', {
          body: { password },
        });

        if (error) {
          console.error('Password check error:', error);
          // Don't block signup on API errors, just log and continue
        } else if (data && !data.isSecure) {
          setFormError(data.reason || 'Please choose a stronger password');
          setPasswordServerError(data.reason);
          setIsSubmitting(false);
          setIsCheckingPassword(false);
          return;
        }
      } catch (err) {
        console.error('Error checking password:', err);
        // Continue if the check fails
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
        {/* Left Side — Image panel (55%) — hidden on mobile */}
        <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-end items-center overflow-hidden">
          <img
            src="/images/founders/founder-group-hero.jpg"
            alt="MakeFriends members socializing at an event"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
          <div className="relative z-10 text-center px-12 mb-24">
            <h2 className="font-display italic text-3xl xl:text-4xl text-white mb-4 leading-tight">
              Where Connections<br />Become Community.
            </h2>
          </div>
          {/* Member count social proof — bottom-center */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-4">
            <MemberAvatars
              avatarUrls={avatarUrls}
              memberCount={memberCount}
              isLoading={isLoadingStats}
            />
          </div>
        </div>

        {/* Right Side — Form (45%) */}
        <div className="w-full lg:w-[45%] relative flex flex-col justify-center px-8 md:px-16 py-12 bg-popover">
          <div className="relative z-10 max-w-md mx-auto w-full animate-fade-in">
            {/* Logo */}
            <Link to="/" className="inline-block mb-10">
              <BrandLogo className="h-14 w-auto drop-shadow-sm" />
            </Link>

            {/* Referral Banner */}
            {referralCode && referrerName && mode === 'signup' && (
              <div className="mb-6 p-4 bg-primary/20 border border-primary/30 rounded-xl">
                <p className="text-sm text-white/90">
                  🎉 <strong>{referrerName}</strong> invited you! Sign up to get <span className="text-primary font-semibold">10% off</span> your first month.
                </p>
              </div>
            )}

            {/* Header */}
            <div className="mb-8">
              <h1 className="font-display text-3xl md:text-[40px] text-foreground leading-[1.15]">
                {mode === 'signin' ? 'Welcome back.' : 'Join the Circle.'}
              </h1>
              <p className="text-muted-foreground text-sm mt-2">
                {mode === 'signin'
                  ? 'Sign in to access your membership.'
                  : referralCode
                    ? `You've been invited to join our exclusive community.`
                    : 'Submit your application to begin.'
                }
              </p>
            </div>

            {/* Social Sign-In Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={async () => {
                  clearFormFeedback();
                  try {
                    const { error } = await signInWithGoogle();
                    if (error) {
                      setFormError(error.message || 'Could not connect to Google. Please try again.');
                    }
                  } catch (err) {
                    setFormError('Could not connect to Google. Please try again.');
                  }
                }}
                disabled={isSubmitting || isRateLimited}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-[10px] border border-border bg-card hover:bg-accent text-foreground font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>

            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-popover px-3 text-muted-foreground text-xs">or continue with email</span>
              </div>
            </div>



            {/* Inline Form Feedback */}
            {formError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Form */}
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-wider text-white/60 font-medium ml-1">Email Address</Label>
                <ValidatedInput
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => {
                    setEmailTouched(true);
                    validateEmail(email);
                  }}
                  error={emailTouched ? emailError : undefined}
                  success={emailTouched && !emailError && email.length > 0}
                  icon={<Mail className="h-5 w-5 text-white/40" />}
                  autoComplete="email"
                  inputMode="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs uppercase tracking-wider text-white/60 font-medium ml-1">Password</Label>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => {
                    setPasswordTouched(true);
                    if (mode === 'signup') {
                      validatePasswordField(password);
                    }
                  }}
                  showStrengthIndicator={mode === 'signup'}
                  error={mode === 'signup' ? passwordError : undefined}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
                {/* Password breach warning - shown while typing */}
                {mode === 'signup' && passwordServerError && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mt-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{passwordServerError}</span>
                  </div>
                )}
                {mode === 'signup' && isCheckingPassword && (
                  <p className="text-xs text-white/40 flex items-center gap-2 mt-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Checking password security...
                  </p>
                )}
              </div>

              {mode === 'signup' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-wider text-white/60 font-medium ml-1">Confirm Password</Label>
                    <PasswordInput
                      id="confirmPassword"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      onBlur={() => {
                        setConfirmPasswordTouched(true);
                        validateConfirmPassword(confirmPassword);
                      }}
                      error={confirmPasswordTouched ? confirmPasswordError : undefined}
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-xs uppercase tracking-wider text-white/60 font-medium ml-1">First Name</Label>
                      <ValidatedInput
                        id="firstName"
                        placeholder="James"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        icon={<User className="h-5 w-5 text-white/40" />}
                        autoComplete="given-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-xs uppercase tracking-wider text-white/60 font-medium ml-1">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Harrington"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20"
                        autoComplete="family-name"
                      />
                    </div>
                  </div>
                </>
              )}

              {mode === 'signin' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label htmlFor="remember" className="text-sm text-white/60 cursor-pointer">
                      Remember me
                    </label>
                  </div>
                  <Link to="/auth/forgot-password" className="text-xs text-white/50 hover:text-[hsl(var(--accent-gold))] transition-colors">
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* Rate Limit Warning */}
              {isRateLimited && (
                <div className="flex items-center gap-2 p-3 bg-destructive/20 border border-destructive/30 rounded-lg text-destructive text-sm">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Too many attempts. Please try again {rateLimitInfo?.resetAt ? `after ${new Date(rateLimitInfo.resetAt).toLocaleTimeString()}` : 'later'}.
                  </span>
                </div>
              )}

              {/* CAPTCHA - shown after 3 failed attempts */}
              {requiresCaptcha && !isRateLimited && (
                <SimpleCaptcha
                  onVerify={setCaptchaVerified}
                  disabled={isSubmitting}
                />
              )}

              <Button
                onClick={() => { requestAnimationFrame(() => { setTimeout(() => { handleStep1Submit(); }, 0); }); }}
                disabled={isSubmitting || isRateLimited || (requiresCaptcha && !captchaVerified)}
                className="w-full gold-fill hover:opacity-90 text-white font-medium rounded-[10px] h-12 transition-opacity duration-150"
                size="lg"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : mode === 'signin' ? (
                  'Sign In'
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            <p className="text-center text-sm text-white/50">
              {mode === 'signin' ? "Don't have an account?" : 'Already a member?'}{' '}
              <button
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setStep(1);
                  setAuthMethod('email');
                }}
                className="text-[hsl(var(--accent-gold))] hover:text-[hsl(var(--accent-gold-light))] font-medium transition-colors"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Multi-step signup (steps 2 & 3)
  return (
    <RegistrationSteps
      step={step}
      setStep={setStep}
      isSubmitting={isSubmitting}
      acceptedTerms={acceptedTerms}
      setAcceptedTerms={setAcceptedTerms}
      industry={industry}
      setIndustry={setIndustry}
      customIndustry={customIndustry}
      setCustomIndustry={setCustomIndustry}
      jobTitle={jobTitle}
      setJobTitle={setJobTitle}
      signatureStyle={signatureStyle}
      setSignatureStyle={setSignatureStyle}
      selectedBrands={selectedBrands}
      toggleMotivation={toggleMotivation}
      valuesInPartner={valuesInPartner}
      setValuesInPartner={setValuesInPartner}
      selectedInterests={selectedInterests}
      toggleInterest={toggleInterest}
      handleFinalSubmit={handleFinalSubmit}
    />
  );
}
