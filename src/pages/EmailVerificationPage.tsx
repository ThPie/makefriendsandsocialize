import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, RefreshCw, Loader2, ArrowRight, AlertTriangle } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { BrandedLoader } from '@/components/ui/branded-loader';
import { FloatingParticles } from '@/components/ui/floating-particles';

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error' | 'cooldown'>('idle');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  const isConfirmed = searchParams.get('confirmed') === 'true';

  useEffect(() => {
    if (!user) return;

    const checkVerification = async () => {
      const { data: { user: freshUser } } = await supabase.auth.getUser();
      
      if (freshUser?.email_confirmed_at) {
        setIsVerified(true);
        setTimeout(() => {
          navigate('/portal/onboarding');
        }, 2000);
      }
    };

    checkVerification();
    const interval = setInterval(checkVerification, 15000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendStatus === 'cooldown') {
      setResendStatus('idle');
    }
  }, [cooldownSeconds, resendStatus]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  const handleResendVerification = async () => {
    if (!user?.email || isResending || cooldownSeconds > 0) return;
    
    setIsResending(true);
    setResendStatus('idle');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email?confirmed=true`,
        },
      });

      if (error) {
        console.error('Failed to resend verification:', error);
        if (error.message?.includes('rate') || error.message?.includes('limit')) {
          setResendStatus('cooldown');
          setCooldownSeconds(60);
        } else {
          setResendStatus('error');
        }
      } else {
        setResendStatus('success');
        setCooldownSeconds(60);
      }
    } catch (err) {
      console.error('Error resending verification:', err);
      setResendStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  if (isLoading) {
    return <BrandedLoader message="Loading..." />;
  }

  // Success state - email verified
  if (isVerified || isConfirmed) {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-4 py-16 overflow-hidden bg-background">
        <FloatingParticles count={15} />
        
        <div className="relative z-10 max-w-md text-center animate-fade-in">
          <Link to="/" className="inline-block mb-8">
            <BrandLogo className="h-10 mx-auto" />
          </Link>

          <div className="bg-card backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>

            <h1 className="font-display text-3xl text-card-foreground mb-3">Email Verified!</h1>
            <p className="text-muted-foreground mb-6">
              Your email has been successfully verified. Redirecting you to complete your profile...
            </p>

            <div className="flex items-center justify-center gap-2 text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Redirecting...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-16 overflow-hidden bg-background">
      <FloatingParticles count={15} />
      
      <div className="relative z-10 max-w-md w-full text-center animate-fade-in">
        <Link to="/" className="inline-block mb-8">
          <BrandLogo className="h-10 mx-auto" />
        </Link>

        <div className="bg-card backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl">
          {/* Mail Icon with Animation */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
            <div className="relative w-full h-full rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Mail className="h-12 w-12 text-primary" />
            </div>
          </div>

          <h1 className="font-display text-3xl text-card-foreground mb-3">Verify Your Email</h1>
          
          <p className="text-muted-foreground mb-2">
            We've sent a verification link to:
          </p>
          <p className="text-primary font-medium mb-6 break-all">
            {user?.email}
          </p>

          <div className="bg-muted border border-border rounded-xl p-4 mb-6 text-left">
            <h3 className="text-foreground font-medium text-sm mb-2">Next Steps:</h3>
            <ol className="text-muted-foreground text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary font-semibold">1.</span>
                Check your inbox (and spam folder)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-semibold">2.</span>
                Click the verification link in the email
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-semibold">3.</span>
                Complete your profile to join our community
              </li>
            </ol>
          </div>

          {/* Status Messages */}
          {resendStatus === 'success' && (
            <div className="flex items-center gap-2 justify-center text-green-600 dark:text-green-400 text-sm mb-4 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <CheckCircle2 className="h-4 w-4" />
              <span>Verification email sent! Check your inbox.</span>
            </div>
          )}
          
          {resendStatus === 'error' && (
            <div className="flex items-center gap-2 justify-center text-destructive text-sm mb-4 bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <AlertTriangle className="h-4 w-4" />
              <span>Failed to send email. Please try again.</span>
            </div>
          )}

          {/* Resend Button */}
          <Button
            onClick={handleResendVerification}
            disabled={isResending || cooldownSeconds > 0}
            variant="outline"
            className="w-full mb-4"
          >
            {isResending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : cooldownSeconds > 0 ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Resend in {cooldownSeconds}s
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Resend Verification Email
              </>
            )}
          </Button>

          <p className="text-muted-foreground text-xs mt-4">
            Please verify your email to continue. Check your inbox and spam folder.
          </p>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm mb-2">
            Wrong email address?
          </p>
          <Button
            asChild
            variant="link"
            className="text-primary hover:text-primary/80 p-0 h-auto"
          >
            <Link to="/auth">Sign up with a different email</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
