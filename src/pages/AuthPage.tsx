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

  // Inline form feedback
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const clearFormFeedback = useCallback(() => {
    setFormError(null);
    setFormSuccess(null);
  }, []);

  // Real-time email validation
  const validateEmail = useCallback((value: string) => {
    if (!value) { setEmailError('Email is required'); return false; }
    try { emailSchema.parse(value); setEmailError(undefined); return true; }
    catch (err) { if (err instanceof z.ZodError) setEmailError(err.errors[0].message); return false; }
  }, []);

  // Real-time password validation
  const validatePasswordField = useCallback((value: string) => {
    const { isValid, errors } = validatePassword(value);
    if (!isValid && value.length > 0) { setPasswordError(errors[0]); return false; }
    setPasswordError(undefined); return true;
  }, []);

  // Real-time confirm password validation
  const validateConfirmPassword = useCallback((value: string) => {
    if (value !== password) { setConfirmPasswordError('Passwords do not match'); return false; }
    setConfirmPasswordError(undefined); return true;
  }, [password]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; setEmail(value); clearFormFeedback();
    if (emailTouched) validateEmail(value);
  };

  const [passwordCheckTimeout, setPasswordCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value); clearFormFeedback(); setPasswordServerError(null);
    if (mode === 'signup') validatePasswordField(value);
    if (confirmPasswordTouched && confirmPassword) {
      if (value !== confirmPassword) setConfirmPasswordError('Passwords do not match');
      else setConfirmPasswordError(undefined);
    }
    if (mode === 'signup' && value.length >= 10) {
      if (passwordCheckTimeout) clearTimeout(passwordCheckTimeout);
      const timeout = setTimeout(async () => {
        setIsCheckingPassword(true);
        try {
          const { data, error } = await supabase.functions.invoke('check-password-strength', { body: { password: value } });
          if (!error && data && !data.isSecure) {
            if (data.breachCount) setPasswordServerError(`This password has appeared in ${data.breachCount.toLocaleString()} data breaches. Please choose a different one.`);
            else setPasswordServerError(data.reason || 'Please choose a stronger password');
          }
        } catch (err) { console.error('Password check failed:', err); }
        finally { setIsCheckingPassword(false); }
      }, 800);
      setPasswordCheckTimeout(timeout);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; setConfirmPassword(value);
    if (confirmPasswordTouched) validateConfirmPassword(value);
  };

  // Check for referral code in URL
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref.toUpperCase());
      setMode('signup');
      const lookupReferrer = async () => {
        const { data } = await supabase.from('profiles').select('first_name').eq('referral_code', ref.toUpperCase()).single();
        if (data?.first_name) setReferrerName(data.first_name);
      };
      lookupReferrer();
    }
  }, [searchParams]);

  // Handle redirect after login
  useEffect(() => {
    const handleRedirect = async () => {
      if (!user || isLoading) return;
      const returnTo = searchParams.get('returnTo');
      if (returnTo && returnTo.startsWith('/portal')) {
        const { data: profileData } = await supabase.from('profiles').select('onboarding_completed, first_name, last_name, bio, avatar_urls, interests, industry, job_title, city').eq('id', user.id).maybeSingle();
        if (profileData && !profileData.onboarding_completed) { navigate('/portal/onboarding'); return; }
        navigate(returnTo); return;
      }
      const { data: profileData } = await supabase.from('profiles').select('onboarding_completed').eq('id', user.id).maybeSingle();
      if (!profileData?.onboarding_completed) { navigate('/portal/onboarding'); return; }
      const { data: appData } = await supabase.from('application_waitlist').select('status').eq('user_id', user.id).maybeSingle();
      if (appData?.status === 'pending') { navigate('/auth/waiting'); return; }
      navigate('/portal');
    };
    handleRedirect();
  }, [user, isLoading, navigate, searchParams]);

  const validateStep1 = () => {
    setEmailTouched(true); setPasswordTouched(true); clearFormFeedback();
    if (mode === 'signup') setConfirmPasswordTouched(true);
    let isValid = true; let firstError: string | null = null;
    try { emailSchema.parse(email); setEmailError(undefined); }
    catch (err) { if (err instanceof z.ZodError) { setEmailError(err.errors[0].message); if (!firstError) firstError = err.errors[0].message; } isValid = false; }
    if (mode === 'signup') {
      const { isValid: passwordValid, errors } = validatePassword(password);
      if (!passwordValid) { setPasswordError(errors[0]); if (!firstError) firstError = errors[0]; isValid = false; } else setPasswordError(undefined);
      if (password !== confirmPassword) { setConfirmPasswordError('Passwords do not match'); if (!firstError) firstError = 'Passwords do not match'; isValid = false; } else setConfirmPasswordError(undefined);
    } else { if (password.length < 1) { if (!firstError) firstError = 'Password is required'; isValid = false; } }
    if (firstError) setFormError(firstError);
    return isValid;
  };

  const handleStep1Submit = async () => {
    if (!validateStep1()) return;
    if (requiresCaptcha && !captchaVerified) { setFormError('Please complete the security check first'); return; }
    if (mode === 'signup') {
      const { isValid, errors } = validatePassword(password);
      if (!isValid) { setFormError(`Password must meet all requirements: ${errors.join(', ')}`); return; }
      if (password !== confirmPassword) { setFormError('Passwords do not match'); return; }
      setIsCheckingPassword(true); setIsSubmitting(true);
      try {
        const { data, error } = await supabase.functions.invoke('check-password-strength', { body: { password } });
        if (error) console.error('Password check error:', error);
        else if (data && !data.isSecure) { setFormError(data.reason || 'Please choose a stronger password'); setPasswordServerError(data.reason); setIsSubmitting(false); setIsCheckingPassword(false); return; }
      } catch (err) { console.error('Error checking password:', err); }
      setIsCheckingPassword(false); setIsSubmitting(false);
    }
    if (mode === 'signin') {
      setIsSubmitting(true); clearFormFeedback();
      await recordAttempt(false);
      const { error } = await signIn(email, password);
      if (error) { await recordAttempt(true); setIsSubmitting(false); setFormError('Invalid email or password. Please check your credentials and try again.'); return; }
      await createSession(rememberMe);
      setIsSubmitting(false); navigate('/portal');
    } else {
      setIsSubmitting(true); clearFormFeedback();
      try {
        const signUpResult = await signUp(email, password);
        if (signUpResult.error) {
          const errorMessage = signUpResult.error.message?.toLowerCase() || '';
          if (errorMessage.includes('already registered') || errorMessage.includes('user already exists') || errorMessage.includes('email already')) { setFormError('This email is already registered. Please sign in instead.'); setMode('signin'); }
          else setFormError(signUpResult.error.message || 'Unable to create account. Please try again.');
          setIsSubmitting(false); return;
        }
        setIsSubmitting(false); navigate('/auth/verify-email');
      } catch (err) { console.error('Signup error:', err); setFormError('An unexpected error occurred. Please try again.'); setIsSubmitting(false); }
    }
  };

  const handleFinalSubmit = async () => {
    if (!acceptedTerms) { setFormError('Please accept the Privacy Policy and Terms of Service'); return; }
    setIsSubmitting(true); clearFormFeedback();
    try {
      const signUpResult = await signUp(email, password);
      if (signUpResult.error) {
        const signUpError = signUpResult.error;
        const errorMessage = signUpError.message?.toLowerCase() || '';
        const errorStatus = (signUpError as any)?.status;
        if (errorMessage.includes('already registered') || errorMessage.includes('user already exists') || errorMessage.includes('already been registered') || errorMessage.includes('email already') || errorMessage.includes('duplicate') || errorMessage.includes('unique constraint')) { setFormError('This email is already registered. Please sign in instead.'); setMode('signin'); setStep(1); setIsSubmitting(false); return; }
        if (errorStatus === 422) { setFormError(signUpError.message || 'Please check your email and password meet the requirements.'); setStep(1); setIsSubmitting(false); return; }
        if (errorMessage.includes('invalid api key') || errorMessage.includes('api key')) { setFormError('Account creation temporarily unavailable. Please try again in a few minutes or contact support.'); setStep(1); setIsSubmitting(false); return; }
        if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) { setFormError('Too many signup attempts. Please wait a few minutes and try again.'); setStep(1); setIsSubmitting(false); return; }
        if (errorMessage.includes('signups not allowed') || errorMessage.includes('signup disabled')) { setFormError('New registrations are temporarily disabled. Please try again later or contact support.'); setStep(1); setIsSubmitting(false); return; }
        if (errorMessage.includes('email') && errorMessage.includes('invalid')) { setFormError('Please enter a valid email address.'); setStep(1); setIsSubmitting(false); return; }
        console.error('Signup error:', signUpError); setFormError('Unable to create account. Please check your information and try again.'); setStep(1); setIsSubmitting(false); return;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const finalIndustry = industry === 'Other' ? customIndustry : industry;
        await supabase.from('profiles').update({ first_name: firstName, last_name: lastName, signature_style: signatureStyle, favorite_brands: selectedBrands, values_in_partner: valuesInPartner, interests: selectedInterests, industry: finalIndustry, job_title: jobTitle, terms_accepted_at: new Date().toISOString() }).eq('id', session.user.id);
        await supabase.from('application_waitlist').insert({ user_id: session.user.id, style_description: signatureStyle, favorite_brands: selectedBrands, values_in_partner: valuesInPartner, interests: selectedInterests, industry: finalIndustry, job_title: jobTitle, status: 'pending' });
        if (referralCode) { try { await supabase.functions.invoke('track-referral', { body: { referral_code: referralCode, new_user_id: session.user.id } }); } catch (err) { console.error('Failed to track referral:', err); } }
        try { await supabase.functions.invoke('send-profile-notification', { body: { user_id: session.user.id, notification_type: 'account_created' } }); } catch (emailErr) { console.error('Failed to send welcome email:', emailErr); }
        setIsSubmitting(false); setFormSuccess('🎉 Account created! Welcome to Make Friends & Socialize.'); setTimeout(() => navigate('/portal/onboarding'), 1500);
      } else { setIsSubmitting(false); setFormSuccess('Account created! Please check your email to verify your account.'); navigate('/auth/verify-email'); }
    } catch (err) { console.error('Unexpected signup error:', err); setFormError('An unexpected error occurred. Please try again.'); setIsSubmitting(false); }
  };

  const toggleMotivation = (motivation: string) => setSelectedBrands(prev => prev.includes(motivation) ? prev.filter(b => b !== motivation) : [...prev, motivation]);
  const toggleInterest = (interest: string) => setSelectedInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);

  if (isLoading) return <BrandedLoader />;

  // ─── Step 1: Credentials ─── Split layout: Image LEFT 55%, Form RIGHT 45%
  if (step === 1) {
    return (
      <div className="min-h-screen flex bg-background">
        {/* Left — Image panel (desktop only) */}
        <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80"
            alt="Luxury interior"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
          <div className="relative z-10 flex flex-col justify-center items-center w-full px-16">
            <p className="font-display italic text-4xl xl:text-5xl text-white text-center leading-tight max-w-lg">
              Where exceptional people find their circle.
            </p>
          </div>
          {/* Social proof card anchored bottom-left */}
          <div className="absolute bottom-8 left-8 z-20">
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-[12px] px-5 py-4">
              <MemberAvatars avatarUrls={avatarUrls} memberCount={memberCount} isLoading={isLoadingStats} />
            </div>
          </div>
        </div>

        {/* Right — Form panel */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 md:px-12 lg:px-16 py-12 bg-surface-raised">
          <div className="max-w-md mx-auto w-full">
            {/* Logo */}
            <Link to="/" className="inline-block mb-10">
              <img src={logoWhite} alt="MakeFriends & Socialize" className="h-8" />
            </Link>

            {/* Eyebrow + Headline */}
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Member Access
            </p>
            <h1 className="font-display text-4xl text-foreground mb-8">
              {mode === 'signin' ? 'Welcome back.' : 'Join the circle.'}
            </h1>

            {/* Referral Banner */}
            {referralCode && referrerName && mode === 'signup' && (
              <div className="mb-6 p-4 bg-[hsl(var(--gold))]/10 border border-[hsl(var(--gold))]/20 rounded-[10px]">
                <p className="text-sm text-foreground">
                  🎉 <strong>{referrerName}</strong> invited you! Sign up to get <span className="text-[hsl(var(--gold))] font-semibold">10% off</span> your first month.
                </p>
              </div>
            )}

            {/* Google Sign-In */}
            <button
              onClick={async () => {
                clearFormFeedback();
                try {
                  const { lovable } = await import('@/integrations/lovable/index');
                  const result = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin });
                  if (result.error) setFormError(result.error.message || 'Could not connect to Google. Please try again.');
                } catch (err) { setFormError('Could not connect to Google. Please try again.'); }
              }}
              disabled={isSubmitting || isRateLimited}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-[10px] border border-border bg-transparent hover:bg-muted/30 text-foreground font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-surface-raised px-3 text-muted-foreground">or continue with email</span>
              </div>
            </div>

            {/* Auth Method Toggle — Sign In only */}
            {mode === 'signin' && (
              <div className="flex gap-0 mb-5 border-b border-border">
                <button
                  onClick={() => setAuthMethod('email')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors duration-200 border-b-2 -mb-px ${
                    authMethod === 'email'
                      ? 'border-[hsl(var(--gold))] text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Mail className="h-4 w-4" /> Email
                </button>
                <button
                  onClick={() => setAuthMethod('phone')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors duration-200 border-b-2 -mb-px ${
                    authMethod === 'phone'
                      ? 'border-[hsl(var(--gold))] text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Phone className="h-4 w-4" /> Phone
                </button>
              </div>
            )}

            {/* Inline Feedback */}
            {formError && (
              <div className="flex items-start gap-2 p-3 rounded-[10px] bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="flex items-start gap-2 p-3 rounded-[10px] bg-green-500/10 border border-green-500/20 text-green-500 text-sm mb-4">
                <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Form */}
            <div className="space-y-4">
              {mode === 'signin' && authMethod === 'phone' ? (
                <PhoneOTPLogin onSuccess={() => navigate('/portal')} onSwitchToEmail={() => setAuthMethod('email')} disabled={isRateLimited} />
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-medium">Email</Label>
                    <ValidatedInput
                      id="email" type="email" placeholder="you@example.com" value={email}
                      onChange={handleEmailChange}
                      onBlur={() => { setEmailTouched(true); validateEmail(email); }}
                      error={emailTouched ? emailError : undefined}
                      success={emailTouched && !emailError && email.length > 0}
                      icon={<Mail className="h-4 w-4 text-muted-foreground" />}
                      autoComplete="email" inputMode="email"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-medium">Password</Label>
                    <PasswordInput
                      id="password" placeholder="••••••••" value={password}
                      onChange={handlePasswordChange}
                      onBlur={() => { setPasswordTouched(true); if (mode === 'signup') validatePasswordField(password); }}
                      showStrengthIndicator={mode === 'signup'}
                      error={mode === 'signup' ? passwordError : undefined}
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    />
                    {mode === 'signup' && passwordServerError && (
                      <div className="flex items-start gap-2 p-3 rounded-[10px] bg-destructive/10 border border-destructive/20 text-destructive text-sm mt-1">
                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{passwordServerError}</span>
                      </div>
                    )}
                    {mode === 'signup' && isCheckingPassword && (
                      <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Checking password security...
                      </p>
                    )}
                  </div>

                  {mode === 'signup' && (
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-medium">Confirm Password</Label>
                        <PasswordInput
                          id="confirmPassword" placeholder="••••••••" value={confirmPassword}
                          onChange={handleConfirmPasswordChange}
                          onBlur={() => { setConfirmPasswordTouched(true); validateConfirmPassword(confirmPassword); }}
                          error={confirmPasswordTouched ? confirmPasswordError : undefined}
                          autoComplete="new-password"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="firstName" className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-medium">First Name</Label>
                          <ValidatedInput id="firstName" placeholder="James" value={firstName} onChange={(e) => setFirstName(e.target.value)} icon={<User className="h-4 w-4 text-muted-foreground" />} autoComplete="given-name" />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="lastName" className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-medium">Last Name</Label>
                          <Input id="lastName" placeholder="Harrington" value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-transparent border-border" autoComplete="family-name" />
                        </div>
                      </div>
                    </>
                  )}

                  {mode === 'signin' && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} />
                        <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">Remember me</label>
                      </div>
                      <Link to="/auth/forgot-password" className="text-xs text-muted-foreground hover:text-[hsl(var(--gold))] transition-colors">Forgot password?</Link>
                    </div>
                  )}

                  {isRateLimited && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-[10px] text-destructive text-sm">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      <span>Too many attempts. Please try again {rateLimitInfo?.resetAt ? `after ${new Date(rateLimitInfo.resetAt).toLocaleTimeString()}` : 'later'}.</span>
                    </div>
                  )}

                  {requiresCaptcha && !isRateLimited && (
                    <SimpleCaptcha onVerify={setCaptchaVerified} disabled={isSubmitting} />
                  )}

                  <button
                    onClick={() => { requestAnimationFrame(() => { setTimeout(() => { handleStep1Submit(); }, 0); }); }}
                    disabled={isSubmitting || isRateLimited || (requiresCaptcha && !captchaVerified)}
                    className="w-full h-12 rounded-[10px] bg-[hsl(var(--gold))] text-background font-medium text-sm transition-colors duration-200 hover:bg-[hsl(var(--gold-light))] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : mode === 'signin' ? 'Sign In' : (
                      <span className="flex items-center gap-2">Continue <ArrowRight className="h-4 w-4" /></span>
                    )}
                  </button>
                </>
              )}

              <p className="text-center text-sm text-muted-foreground pt-2">
                {mode === 'signin' ? "Don't have an account?" : 'Already a member?'}{' '}
                <button
                  onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setStep(1); setAuthMethod('email'); }}
                  className="text-[hsl(var(--gold))] hover:text-[hsl(var(--gold-light))] font-medium transition-colors"
                >
                  {mode === 'signin' ? 'Apply' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Steps 2 & 3: Multi-step signup ───
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img src={logoWhite} alt="MakeFriends & Socialize" className="h-8 mx-auto" />
          </Link>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-2">Application</p>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">Complete Your Application</h1>
          <p className="text-muted-foreground text-sm">Just a few more details to personalize your experience</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 w-12 rounded-full transition-colors duration-200 ${s <= step ? 'bg-[hsl(var(--gold))]' : 'bg-border'}`} />
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-surface border border-border rounded-[16px] p-8">
          {/* Inline Feedback */}
          {formError && (
            <div className="flex items-start gap-2 p-3 rounded-[10px] bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-6">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><span>{formError}</span>
            </div>
          )}
          {formSuccess && (
            <div className="flex items-start gap-2 p-3 rounded-[10px] bg-green-500/10 border border-green-500/20 text-green-500 text-sm mb-6">
              <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" /><span>{formSuccess}</span>
            </div>
          )}

          {/* Step 2: About You */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl text-foreground">About You</h2>
                <p className="text-muted-foreground text-sm mt-1">Tell us a bit about yourself</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-medium">Industry</Label>
                <Select value={industry} onValueChange={(value) => { setIndustry(value); if (value !== 'Other') setCustomIndustry(''); }}>
                  <SelectTrigger className="bg-transparent border-border"><SelectValue placeholder="Select your industry" /></SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => (<SelectItem key={ind} value={ind}>{ind}</SelectItem>))}
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {industry === 'Other' && (
                  <Input placeholder="Please specify your industry" value={customIndustry} onChange={(e) => setCustomIndustry(e.target.value)} className="bg-transparent border-border mt-2" />
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="jobTitle" className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-medium">Job Title</Label>
                <Input id="jobTitle" placeholder="e.g. Creative Director, Founder" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="bg-transparent border-border" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signatureStyle" className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-medium">Tell us about yourself</Label>
                <Textarea id="signatureStyle" placeholder="I'm a creative director with a passion for art and design..." value={signatureStyle} onChange={(e) => setSignatureStyle(e.target.value)} className="bg-transparent border-border min-h-[100px]" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-medium">What brings you to our community?</Label>
                <div className="flex flex-wrap gap-2">
                  {MOTIVATIONS.map((motivation) => (
                    <button key={motivation} onClick={() => toggleMotivation(motivation)}
                      className={`px-4 py-2 rounded-full text-sm border transition-colors duration-200 ${
                        selectedBrands.includes(motivation)
                          ? 'bg-[hsl(var(--gold))] text-background border-[hsl(var(--gold))]'
                          : 'bg-transparent text-foreground border-border hover:border-[hsl(var(--gold))]/40'
                      }`}>
                      {motivation}{selectedBrands.includes(motivation) && <Check className="inline ml-1.5 h-3 w-3" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <button onClick={() => { requestAnimationFrame(() => { setTimeout(() => { startTransition(() => setStep(3)); }, 0); }); }}
                  className="flex-1 h-11 rounded-[10px] bg-[hsl(var(--gold))] text-background font-medium text-sm transition-colors duration-200 hover:bg-[hsl(var(--gold-light))] flex items-center justify-center gap-2">
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Your Lifestyle */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl text-foreground">Your Lifestyle</h2>
                <p className="text-muted-foreground text-sm mt-1">Help us understand what you're looking for</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="values" className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-medium">What would make your membership valuable?</Label>
                <Textarea id="values" placeholder="Access to curated events, meeting inspiring people..." value={valuesInPartner} onChange={(e) => setValuesInPartner(e.target.value)} className="bg-transparent border-border min-h-[100px]" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-medium">Your Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <button key={interest} onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full text-sm border transition-colors duration-200 ${
                        selectedInterests.includes(interest)
                          ? 'bg-[hsl(var(--gold))] text-background border-[hsl(var(--gold))]'
                          : 'bg-transparent text-foreground border-border hover:border-[hsl(var(--gold))]/40'
                      }`}>
                      {interest}{selectedInterests.includes(interest) && <Check className="inline ml-1.5 h-3 w-3" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)} />
                <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                  I have read and agree to the{' '}
                  <Link to="/privacy" target="_blank" className="text-[hsl(var(--gold))] hover:underline">Privacy Policy</Link>{' '}and{' '}
                  <Link to="/terms" target="_blank" className="text-[hsl(var(--gold))] hover:underline">Terms of Service</Link>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <button
                  onClick={() => { requestAnimationFrame(() => { setTimeout(() => { handleFinalSubmit(); }, 0); }); }}
                  disabled={isSubmitting || !acceptedTerms}
                  className="flex-1 h-11 rounded-[10px] bg-[hsl(var(--gold))] text-background font-medium text-sm transition-colors duration-200 hover:bg-[hsl(var(--gold-light))] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Submit Application</span><Check className="h-4 w-4" /></>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
