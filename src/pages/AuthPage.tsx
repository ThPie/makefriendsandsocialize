import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSiteStats } from '@/hooks/useSiteStats';
import { ArrowLeft, ArrowRight, Check, Loader2, Mail, User, AlertTriangle } from 'lucide-react';
import { z } from 'zod';
import { MemberAvatars } from '@/components/home/MemberAvatars';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { BrandedLoader } from '@/components/ui/branded-loader';
import { PasswordInput, validatePassword } from '@/components/ui/password-input';
import { ValidatedInput } from '@/components/ui/validated-input';
import { SimpleCaptcha } from '@/components/auth/SimpleCaptcha';
import { useOAuthRateLimit } from '@/hooks/useOAuthRateLimit';
import { useSessionManager } from '@/hooks/useSessionManager';
import logoWhite from '@/assets/logo-white.png';

// Enhanced email validation
const emailSchema = z.string()
  .trim()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters');

// Enhanced password validation schema
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

const INTERESTS = [
  'Arts & Culture', 'Fine Dining & Wine', 'Travel & Adventure', 'Entrepreneurship',
  'Wellness & Mindfulness', 'Music & Nightlife', 'Philanthropy', 'Fashion & Design',
  'Technology & Innovation', 'Sports & Fitness'
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
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  
  // OAuth rate limiting
  const { checkRateLimit, recordAttempt, rateLimitInfo, isRateLimited, requiresCaptcha } = useOAuthRateLimit();
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
  const [jobTitle, setJobTitle] = useState('');
  
  // Real-time validation errors
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>();
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

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
    if (emailTouched) {
      validateEmail(value);
    }
  };

  // Update password with validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
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

  // Handle redirect after login
  useEffect(() => {
    if (user && !isLoading) {
      const returnTo = searchParams.get('returnTo');
      if (returnTo && returnTo.startsWith('/')) {
        navigate(returnTo);
      } else {
        navigate('/portal');
      }
    }
  }, [user, isLoading, navigate, searchParams]);

  const validateStep1 = () => {
    // Mark all fields as touched to show errors
    setEmailTouched(true);
    setPasswordTouched(true);
    if (mode === 'signup') {
      setConfirmPasswordTouched(true);
    }
    
    // Validate email
    let isValid = true;
    try {
      emailSchema.parse(email);
      setEmailError(undefined);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setEmailError(err.errors[0].message);
        toast.error(err.errors[0].message);
      }
      isValid = false;
    }
    
    // For signup, validate password strength
    if (mode === 'signup') {
      const { isValid: passwordValid, errors } = validatePassword(password);
      if (!passwordValid) {
        setPasswordError(errors[0]);
        if (isValid) toast.error(errors[0]); // Only show if email was valid
        isValid = false;
      } else {
        setPasswordError(undefined);
      }
      
      // Validate confirm password
      if (password !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
        if (isValid) toast.error('Passwords do not match');
        isValid = false;
      } else {
        setConfirmPasswordError(undefined);
      }
    } else {
      // For signin, just check password isn't empty
      if (password.length < 1) {
        toast.error('Password is required');
        isValid = false;
      }
    }
    
    return isValid;
  };

  const handleStep1Submit = async () => {
    if (!validateStep1()) return;

    // Check CAPTCHA if required
    if (requiresCaptcha && !captchaVerified) {
      toast.error('Please complete the security check first');
      return;
    }

    if (mode === 'signin') {
      setIsSubmitting(true);
      
      // Record login attempt for rate limiting
      await recordAttempt(false);
      
      const { error } = await signIn(email, password);
      
      if (error) {
        // Record failed attempt
        await recordAttempt(true);
        setIsSubmitting(false);
        
        // Prevent account enumeration - use generic error message
        toast.error('Invalid email or password. Please check your credentials and try again.');
        return;
      }
      
      // Create session with remember me preference
      await createSession(rememberMe);
      
      setIsSubmitting(false);
      navigate('/portal');
    } else {
      setStep(2);
    }
  };

  const handleFinalSubmit = async () => {
    if (!acceptedTerms) {
      toast.error('Please accept the Privacy Policy and Terms of Service');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const signUpResult = await signUp(email, password);
      
      if (signUpResult.error) {
        const signUpError = signUpResult.error;
        // Handle specific error cases with user-friendly messages
        const errorMessage = signUpError.message?.toLowerCase() || '';
        
        if (errorMessage.includes('already registered') || errorMessage.includes('user already exists')) {
          toast.error('This email is already registered. Please sign in instead.');
          setMode('signin');
          setStep(1);
          setIsSubmitting(false);
          return;
        }
        
        if (errorMessage.includes('invalid api key') || errorMessage.includes('api key')) {
          // This is likely an email service configuration issue, not a user error
          console.error('Email service configuration error:', signUpError);
          toast.error('Account creation temporarily unavailable. Please try again in a few minutes or contact support.');
          setIsSubmitting(false);
          return;
        }
        
        if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
          toast.error('Too many signup attempts. Please wait a few minutes and try again.');
          setIsSubmitting(false);
          return;
        }
        
        if (errorMessage.includes('signups not allowed') || errorMessage.includes('signup disabled')) {
          toast.error('New registrations are temporarily disabled. Please try again later or contact support.');
          setIsSubmitting(false);
          return;
        }
        
        if (errorMessage.includes('email') && errorMessage.includes('invalid')) {
          toast.error('Please enter a valid email address.');
          setIsSubmitting(false);
          return;
        }
        
        // Generic fallback for unknown errors
        console.error('Signup error:', signUpError);
        toast.error('Unable to create account. Please check your information and try again.');
        setIsSubmitting(false);
        return;
      }

      // Wait briefly for session to be established
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
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
            industry,
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
            industry,
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
        navigate('/auth/waiting');
      } else {
        // No session but no error - might need email confirmation
        console.log('Signup completed, awaiting email confirmation');
        setIsSubmitting(false);
        toast.success('Account created! Please check your email to verify your account.');
        navigate('/auth/waiting');
      }
    } catch (err) {
      console.error('Unexpected signup error:', err);
      toast.error('An unexpected error occurred. Please try again.');
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

  const handleGoogleSignIn = async () => {
    // Check rate limit first
    const rateLimit = await checkRateLimit();
    
    if (!rateLimit.allowed) {
      const resetTime = rateLimit.resetAt ? new Date(rateLimit.resetAt).toLocaleTimeString() : 'soon';
      toast.error(`Too many sign-in attempts. Please try again after ${resetTime}.`);
      return;
    }
    
    // Check CAPTCHA if required
    if (rateLimit.requiresCaptcha && !captchaVerified) {
      toast.error('Please complete the security check first');
      return;
    }
    
    setIsGoogleLoading(true);
    
    // Record the OAuth attempt
    await recordAttempt(false);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        // Record as failed attempt
        await recordAttempt(true);
        
        if (error.message.includes('provider is not enabled') || error.message.includes('Provider not found')) {
          toast.error('Google sign-in is not configured. Please use email/password or contact support.');
        } else if (error.message.includes('popup_closed_by_user') || error.message.includes('popup')) {
          toast.error('Sign-in was cancelled. Please try again.');
        } else if (error.message.includes('access_denied')) {
          toast.error('Access was denied. Please check your Google account permissions.');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          toast.error('Network error. Please check your connection and try again.');
        } else {
          toast.error('Sign-in failed. Please try again.');
        }
        setIsGoogleLoading(false);
      }
      // On success, page will redirect, so no need to reset loading
    } catch (err) {
      await recordAttempt(true);
      toast.error('An unexpected error occurred. Please try again.');
      setIsGoogleLoading(false);
    }
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

              {/* Form */}
              <div className="space-y-5">
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
                    disabled={isSubmitting || isGoogleLoading}
                  />
                )}

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-transparent text-white/40">or continue with</span>
                  </div>
                </div>

                {/* Google Sign-in Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isSubmitting || isRateLimited || (requiresCaptcha && !captchaVerified)}
                  className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Connecting to Google...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>

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

                <p className="text-center text-sm text-white/50">
                  {mode === 'signin' ? "Don't have an account?" : 'Already a member?'}{' '}
                  <button
                    onClick={() => {
                      setMode(mode === 'signin' ? 'signup' : 'signin');
                      setStep(1);
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-white/90">Industry</Label>
                  <Input
                    id="industry"
                    placeholder="e.g. Finance, Technology, Media"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-primary/20"
                  />
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
