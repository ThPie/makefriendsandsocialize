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
import logoWhite from '@/assets/logo-white.png';

// Enhanced email validation
const emailSchema = z.string()
  .trim()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters');


const INTERESTS = [
  'Arts & Culture', 'Fine Dining & Wine', 'Travel & Adventure', 'Entrepreneurship',
  'Wellness & Mindfulness', 'Music & Nightlife', 'Philanthropy', 'Fashion & Design',
  'Technology & Innovation', 'Sports & Fitness'
];

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Real Estate', 'Media & Entertainment',
  'Consulting', 'Legal', 'Education', 'Hospitality', 'Retail',
  'Manufacturing', 'Non-Profit', 'Government'
];

const MOTIVATIONS = [
  'Networking', 'New Friendships', 'Dating & Romance', 'Business Connections',
  'Cultural Events', 'Personal Growth', 'Exclusive Experiences', 'Like-minded Community'
];

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
  const { user, signUp, signIn, isLoading } = useAuth();
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
    
    if (passwordTouched && mode === 'signup') {
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
        
        setIsSubmitting(false);
        navigate('/portal/onboarding');
      } else {
        // No session but no error - user needs to verify email
        console.log('Signup completed, awaiting email confirmation');
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
      <div className="min-h-screen flex relative">
        {/* Background Video for Mobile/Tablet */}
        <div className="absolute inset-0 lg:hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            poster="/images/hero-poster.webp"
          >
            <source src="/videos/auth-chess.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(180,45%,8%)]/85 via-[hsl(180,50%,12%)]/75 to-[hsl(180,55%,15%)]/65" />
          <FloatingParticles count={15} />
        </div>

        {/* Floating Particles - Desktop */}
        <div className="absolute inset-0 hidden lg:block pointer-events-none">
          <FloatingParticles count={12} />
        </div>

        {/* Left Side - Form with Gradient Background */}
        <div className="w-full lg:w-1/2 relative flex flex-col justify-center px-8 md:px-16 lg:px-20 py-12 overflow-hidden">
          {/* Layered Gradient Background - Desktop only */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(180,45%,8%)] via-[hsl(180,50%,12%)] to-[hsl(180,55%,15%)] hidden lg:block" />
          
          {/* Radial Glow Effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[hsl(180,60%,25%)]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
          
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
            <span className="font-display text-[20rem] font-bold text-white/[0.02] select-none tracking-tighter">
              MFS
            </span>
          </div>
          
          {/* Glassmorphism Form Container */}
          <div className="relative z-10 max-w-md mx-auto w-full">
            <div className="bg-white/[0.03] lg:backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl animate-fade-in">
              {/* Logo */}
              <Link to="/" className="inline-block mb-10">
                <img src={logoWhite} alt="MakeFriends & Socialize" className="h-10" />
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
                <h1 className="font-display text-3xl md:text-4xl text-white mb-2">
                  {mode === 'signin' ? 'Sign in' : 'Create Account'}
                </h1>
                <p className="text-white/60">
                  {mode === 'signin' 
                    ? 'Welcome back! Please enter your details.'
                    : referralCode 
                      ? `You've been invited to join our exclusive community.`
                      : 'Join our exclusive community today.'
                  }
                </p>
              </div>

              {/* Auth Method Toggle - Only for Sign In */}
              {mode === 'signin' && (
                <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
                  <button
                    onClick={() => setAuthMethod('email')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      authMethod === 'email'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </button>
                  <button
                    onClick={() => setAuthMethod('phone')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      authMethod === 'phone'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Phone className="h-4 w-4" />
                    Phone
                  </button>
                </div>
              )}

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
                {/* Phone Login - Sign In Only */}
                {mode === 'signin' && authMethod === 'phone' ? (
                  <PhoneOTPLogin 
                    onSuccess={() => navigate('/portal')} 
                    onSwitchToEmail={() => setAuthMethod('email')}
                    disabled={isRateLimited}
                  />
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white/90">Email Address</Label>
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
                      <Label htmlFor="password" className="text-white/90">Password</Label>
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
                        error={passwordTouched && mode === 'signup' ? passwordError : undefined}
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
                          <Label htmlFor="confirmPassword" className="text-white/90">Confirm Password</Label>
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
                            <Label htmlFor="firstName" className="text-white/90">First Name</Label>
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
                            <Label htmlFor="lastName" className="text-white/90">Last Name</Label>
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
                        <Link to="/auth/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors">
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
                      onClick={handleStep1Submit}
                      disabled={isSubmitting || isRateLimited || (requiresCaptcha && !captchaVerified)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
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
                  </>
                )}

                <p className="text-center text-sm text-white/50">
                  {mode === 'signin' ? "Don't have an account?" : 'Already a member?'}{' '}
                  <button
                    onClick={() => {
                      setMode(mode === 'signin' ? 'signup' : 'signin');
                      setStep(1);
                      setAuthMethod('email');
                    }}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    {mode === 'signin' ? 'Sign up' : 'Sign In'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Video Panel */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-end p-12 overflow-hidden">
          {/* Video Background */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            poster="/images/hero-poster.webp"
          >
            <source src="/videos/auth-chess.mp4" type="video/mp4" />
          </video>
          
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          <div className="relative z-10 flex flex-col items-start animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="font-display text-4xl xl:text-5xl text-white mb-4 drop-shadow-lg">
              Welcome to<br />
              <span className="text-primary">MakeFriends & Socialize</span>
            </h2>
            <p className="text-white/90 text-lg max-w-md mb-8 drop-shadow-md">
              Join an exclusive community of refined individuals who share a passion for meaningful connections, curated experiences, and extraordinary moments.
            </p>
            
            {/* Floating Card with Avatars */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 w-full max-w-md animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <p className="text-white font-medium mb-4">
                Get access to exclusive events and connect with like-minded people
              </p>
              <MemberAvatars 
                avatarUrls={avatarUrls} 
                memberCount={memberCount} 
                isLoading={isLoadingStats}
              />
            </div>
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
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(180,45%,8%)]/95 via-[hsl(180,50%,12%)]/90 to-[hsl(180,55%,15%)]/85" />
      
      {/* Floating Particles */}
      <FloatingParticles count={20} />
      
      <div className="relative z-10 w-full max-w-2xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img src={logoWhite} alt="MakeFriends & Socialize" className="h-10 mx-auto" />
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
              className={`h-2 w-12 rounded-full transition-all duration-300 ${
                s < step ? 'bg-primary' : s === step ? 'bg-primary shadow-lg shadow-primary/50' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Form Card - Glassmorphism */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Step 2: About You */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl text-white">About You</h2>
                <p className="text-white/50 text-sm mt-1">Tell us a bit about yourself</p>
              </div>

              <div className="space-y-3">
                <Label className="text-white/90">Industry</Label>
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
                <Label htmlFor="jobTitle" className="text-white/90">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g. Creative Director, Founder"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signatureStyle" className="text-white/90">
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
                <Label className="text-white/90">What brings you to our community?</Label>
                <div className="flex flex-wrap gap-2">
                  {MOTIVATIONS.map((motivation) => (
                    <button
                      key={motivation}
                      onClick={() => toggleMotivation(motivation)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all duration-200 ${
                        selectedBrands.includes(motivation)
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
                  onClick={() => setStep(3)}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Your Lifestyle */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl text-white">Your Lifestyle</h2>
                <p className="text-white/50 text-sm mt-1">Help us understand what you're looking for</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="values" className="text-white/90">
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
                <Label className="text-white/90">Your Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all duration-200 ${
                        selectedInterests.includes(interest)
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
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting || !acceptedTerms}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-50"
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
