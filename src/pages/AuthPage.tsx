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
import { ArrowLeft, ArrowRight, Check, Loader2, Mail, User, AlertTriangle, Phone, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
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
import { INTERESTS, INDUSTRIES, MOTIVATIONS } from '@/config/constants';

// Enhanced email validation
const emailSchema = z.string()
  .trim()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters');

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

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

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
        // ... (Error handling logic kept same as original)
        const signUpError = signUpResult.error;
        const errorMessage = signUpError.message?.toLowerCase() || '';

        if (errorMessage.includes('already registered')) {
          setFormError('This email is already registered. Please sign in instead.');
          setMode('signin');
          setStep(1);
          setIsSubmitting(false);
          return;
        }

        // Fallback
        setFormError(signUpError.message || 'Unable to create account.');
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
        await supabase
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

        // Add to waitlist
        await supabase
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

        // Track referral if present
        if (referralCode) {
          await supabase.functions.invoke('track-referral', {
            body: {
              referral_code: referralCode,
              new_user_id: session.user.id,
            },
          });
        }

        setIsSubmitting(false);
        navigate('/portal/onboarding');
      } else {
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

  // Define Stitch-inspired components locally for clarity
  const GlassInput = ({ icon: Icon, ...props }: any) => (
    <div className="relative">
      {Icon && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
          <Icon className="h-5 w-5" />
        </span>
      )}
      <input
        {...props}
        className={`input-glass w-full rounded-xl py-3.5 ${Icon ? 'pl-11' : 'pl-4'} pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-0 ${props.className}`}
      />
    </div>
  );

  return (
    <div className="bg-pattern min-h-screen text-white font-body selection:bg-primary selection:text-white flex flex-col items-center justify-between overflow-x-hidden relative">
      {/* Ambient Background Elements */}
      <div className="floating-orb w-64 h-64 bg-primary top-[-10%] left-[-10%]"></div>
      <div className="floating-orb w-96 h-96 bg-[#0d2d15] bottom-[-20%] right-[-10%]"></div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 w-full max-w-md px-6 py-8 flex flex-col min-h-screen justify-center">

        {/* Header Section */}
        <header className="flex flex-col items-center mb-8">
          {/* Logo */}
          <Link to="/" className="inline-block mb-6 hover:opacity-90 transition-opacity">
            <img src={logoWhite} alt="MakeFriends & Socialize" className="h-10" />
          </Link>
          <div className="w-12 h-12 mb-4 rounded-full bg-gradient-to-br from-primary to-black flex items-center justify-center border border-white/10 shadow-lg shadow-green-900/20">
            <span className="material-symbols-outlined text-gold text-2xl text-[#d4af37]">diamond</span>
          </div>
          <h1 className="font-display italic text-3xl md:text-4xl font-medium tracking-tight text-white mb-1">
            {mode === 'signin' ? 'The Club' : 'Apply for Membership'}
          </h1>
          <p className="text-white/50 text-sm font-light tracking-wide uppercase">
            {mode === 'signin' ? 'Members Only' : 'Join the Exclusive'}
          </p>
        </header>

        {/* Auth Card */}
        <main className="w-full">
          <div className="glass-card rounded-2xl p-6 md:p-8 w-full shadow-2xl backdrop-blur-xl">

            {/* Steps Progress for Signup */}
            {mode === 'signup' && (
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 w-8 rounded-full transition-all duration-300 ${s <= step ? 'bg-[#d4af37]' : 'bg-white/10'}`}
                  />
                ))}
              </div>
            )}

            {/* Toggle Switch - Only show on Step 1 */}
            {step === 1 && (
              <div className="flex p-1 mb-8 bg-black/30 rounded-xl relative">
                <label className="flex-1 text-center relative z-10 cursor-pointer" onClick={() => { setMode('signin'); setStep(1); }}>
                  <input type="radio" name="auth_mode" value="signin" checked={mode === 'signin'} readOnly className="peer hidden" />
                  <div className={`py-2.5 text-sm font-medium transition-colors duration-200 ${mode === 'signin' ? 'text-white' : 'text-white/60'}`}>Sign In</div>
                  {mode === 'signin' && (
                    <div className="absolute inset-0 bg-primary/20 rounded-lg shadow-sm border border-white/5 -z-10 animate-fade-in"></div>
                  )}
                </label>
                <label className="flex-1 text-center relative z-10 cursor-pointer" onClick={() => { setMode('signup'); setStep(1); }}>
                  <input type="radio" name="auth_mode" value="signup" checked={mode === 'signup'} readOnly className="peer hidden" />
                  <div className={`py-2.5 text-sm font-medium transition-colors duration-200 ${mode === 'signup' ? 'text-white' : 'text-white/60'}`}>Sign Up</div>
                  {mode === 'signup' && (
                    <div className="absolute inset-0 bg-primary/20 rounded-lg shadow-sm border border-white/5 -z-10 animate-fade-in"></div>
                  )}
                </label>
              </div>
            )}

            {/* Inline Feedback */}
            {formError && (
              <div className="flex items-start gap-2 p-3 mb-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="flex items-start gap-2 p-3 mb-6 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Form Content */}
            <div className="space-y-5">

              {/* STEP 1: Credentials */}
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-white/70 ml-1 uppercase tracking-wider">Email Address</Label>
                    <GlassInput
                      icon={Mail}
                      type="email"
                      placeholder="member@luxury.com"
                      value={email}
                      onChange={handleEmailChange}
                    />
                    {emailTouched && emailError && <p className="text-xs text-red-400 ml-1">{emailError}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-white/70 ml-1 uppercase tracking-wider">Password</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                        <span className="material-symbols-outlined text-[20px]">lock</span>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="input-glass w-full rounded-xl py-3.5 pl-11 pr-10 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-0"
                        placeholder="••••••••"
                        value={password}
                        onChange={handlePasswordChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {passwordTouched && passwordError && mode === 'signup' && <p className="text-xs text-red-400 ml-1">{passwordError}</p>}
                    {mode === 'signup' && passwordServerError && <p className="text-xs text-orange-400 ml-1">{passwordServerError}</p>}
                  </div>

                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-white/70 ml-1 uppercase tracking-wider">Confirm Password</Label>
                      <GlassInput
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                      />
                      {confirmPasswordTouched && confirmPasswordError && <p className="text-xs text-red-400 ml-1">{confirmPasswordError}</p>}
                    </div>
                  )}

                  {mode === 'signin' && (
                    <div className="flex justify-between items-center pt-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember-me"
                          checked={rememberMe}
                          onCheckedChange={(c) => setRememberMe(c as boolean)}
                          className="border-white/30 data-[state=checked]:bg-[#d4af37] data-[state=checked]:border-[#d4af37]"
                        />
                        <label htmlFor="remember-me" className="text-xs text-white/60 cursor-pointer">Remember me</label>
                      </div>
                      <Link to="/auth/forgot-password" class="text-xs text-[#d4af37] hover:text-[#F3E5AB] transition-colors underline decoration-white/0 hover:decoration-[#F3E5AB]/50 underline-offset-4">
                        Forgot Password?
                      </Link>
                    </div>
                  )}

                  <button
                    onClick={handleStep1Submit}
                    disabled={isSubmitting || isRateLimited}
                    className="w-full mt-4 bg-gradient-to-r from-[#AA8C2C] via-[#D4AF37] to-[#AA8C2C] bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.2)] active:scale-[0.98] disabled:opacity-50"
                  >
                    <span className="tracking-wide">
                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (mode === 'signin' ? 'ENTER' : 'CONTINUE')}
                    </span>
                  </button>
                </>
              )}


              {/* STEP 2: About You (Signup Only) */}
              {step === 2 && (
                <>
                  <h2 className="text-xl font-display text-white text-center mb-4">About You</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-white/70 ml-1 uppercase tracking-wider">First Name</Label>
                      <GlassInput value={firstName} onChange={(e: any) => setFirstName(e.target.value)} placeholder="James" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-white/70 ml-1 uppercase tracking-wider">Last Name</Label>
                      <GlassInput value={lastName} onChange={(e: any) => setLastName(e.target.value)} placeholder="Bond" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-white/70 ml-1 uppercase tracking-wider">Industry</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger className="input-glass border-white/10 text-white h-[50px]">
                        <SelectValue placeholder="Select Industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2e21] border-[#d4af37]/20 text-white">
                        {INDUSTRIES.map(i => <SelectItem key={i} value={i} className="focus:bg-[#1a5b2a] focus:text-white cursor-pointer">{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-white/70 ml-1 uppercase tracking-wider">Job Title</Label>
                    <GlassInput value={jobTitle} onChange={(e: any) => setJobTitle(e.target.value)} placeholder="e.g. Founder" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-white/70 ml-1 uppercase tracking-wider">Bio</Label>
                    <Textarea
                      value={signatureStyle}
                      onChange={(e) => setSignatureStyle(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="input-glass min-h-[100px] text-white placeholder-white/30"
                    />
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button onClick={() => setStep(1)} className="flex-1 py-3 border border-white/10 rounded-xl text-white/60 hover:bg-white/5">Back</button>
                    <button onClick={() => setStep(3)} className="flex-1 py-3 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-[#F3E5AB]">Next</button>
                  </div>
                </>
              )}

              {/* STEP 3: Lifestyle (Signup Only) */}
              {step === 3 && (
                <>
                  <h2 className="text-xl font-display text-white text-center mb-4">Lifestyle & Interests</h2>

                  <div className="space-y-3">
                    <Label className="text-xs font-medium text-white/70 ml-1 uppercase tracking-wider">Interests</Label>
                    <div className="flex flex-wrap gap-2">
                      {INTERESTS.slice(0, 8).map(i => (
                        <button
                          key={i}
                          onClick={() => toggleInterest(i)}
                          className={`px-3 py-1 text-xs rounded-full border transition-all ${selectedInterests.includes(i) ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'bg-transparent border-white/20 text-white/60 hover:border-white/40'}`}
                        >
                          {i}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="terms-agree"
                        checked={acceptedTerms}
                        onCheckedChange={(c) => setAcceptedTerms(c as boolean)}
                        className="mt-1 border-white/30 data-[state=checked]:bg-[#d4af37] data-[state=checked]:border-[#d4af37]"
                      />
                      <Label htmlFor="terms-agree" className="text-xs text-white/60 font-normal leading-relaxed">
                        I agree to the <a href="#" className="text-[#d4af37] underline">Code of Conduct</a> and <a href="#" className="text-[#d4af37] underline">Privacy Policy</a>.
                      </Label>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button onClick={() => setStep(2)} className="flex-1 py-3 border border-white/10 rounded-xl text-white/60 hover:bg-white/5">Back</button>
                    <button
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting || !acceptedTerms}
                      className="flex-1 py-3 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-[#F3E5AB] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Finish'}
                    </button>
                  </div>
                </>
              )}

            </div>

            {/* Social Proof Footer (Only on Step 1) */}
            {step === 1 && (
              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <div className="flex items-center justify-center -space-x-3 mb-3">
                  <div className="w-8 h-8 rounded-full border-2 border-[#131f16] bg-[#1a5b2a] flex items-center justify-center text-[10px] text-white font-bold">+2k</div>
                </div>
                <p className="text-xs text-white/40">Join our exclusive community of verified members.</p>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
