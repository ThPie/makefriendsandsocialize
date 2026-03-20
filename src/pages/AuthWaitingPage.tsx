import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, Mail, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { BrandedLoader } from '@/components/ui/branded-loader';

export default function AuthWaitingPage() {
  const navigate = useNavigate();
  const { user, profile, applicationStatus, membership, isLoading, isAdmin } = useAuth();
  
  const [isEmailVerified, setIsEmailVerified] = useState<boolean | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (user) {
      setIsEmailVerified(!!user.email_confirmed_at);
    }
  }, [user]);

  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (isAdmin) {
      navigate('/admin');
      return;
    }

    if (!isLoading && profile && !profile.onboarding_completed) {
      navigate('/portal/onboarding');
      return;
    }
    
    if (applicationStatus === 'approved' || membership?.status === 'active') {
      navigate('/portal');
    }
  }, [user, profile, applicationStatus, membership, isLoading, isAdmin, navigate]);

  const handleResendVerification = async () => {
    if (!user?.email || isResending || cooldownSeconds > 0) return;
    
    setIsResending(true);
    setResendStatus('idle');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/waiting`,
        },
      });

      if (error) {
        console.error('Failed to resend verification:', error);
        setResendStatus('error');
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
    return <BrandedLoader message="Loading your application..." />;
  }

  const showEmailVerification = user && !isEmailVerified;

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-16 overflow-hidden bg-background">
      {/* Subtle background for dark mode only */}
      <div className="absolute inset-0 hidden dark:block">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          poster="/images/hero-poster.webp"
        >
          <source src="/videos/hero-2.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/80" />
      </div>
      
      <div className="relative z-10 max-w-lg text-center animate-fade-in">
        <TransitionLink to="/" className="inline-block mb-8">
          <BrandLogo className="h-10 mx-auto" />
        </TransitionLink>

        {/* Email Verification Banner */}
        {showEmailVerification && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 mb-6 text-left">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <Mail className="h-6 w-6 text-amber-500 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground font-medium mb-1">Verify Your Email</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  We sent a verification link to <span className="text-amber-600 dark:text-amber-300">{user?.email}</span>. 
                  Please check your inbox and spam folder.
                </p>
                
                {resendStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm mb-3">
                    <CheckCircle2 className="h-4 w-4" />
                    Verification email sent!
                  </div>
                )}
                
                {resendStatus === 'error' && (
                  <div className="flex items-center gap-2 text-destructive text-sm mb-3">
                    <AlertTriangle className="h-4 w-4" />
                    Failed to send. Try again.
                  </div>
                )}
                
                <Button
                  onClick={handleResendVerification}
                  disabled={isResending || cooldownSeconds > 0}
                  variant="outline"
                  size="sm"
                  className="bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-200 hover:bg-amber-500/20"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                      Sending...
                    </>
                  ) : cooldownSeconds > 0 ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1.5" />
                      Resend in {cooldownSeconds}s
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1.5" />
                      Resend Verification
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Icon */}
        <div className="mb-8">
          {applicationStatus === 'rejected' ? (
            <div className="w-24 h-24 mx-auto rounded-full bg-destructive/20 border border-destructive/30 flex items-center justify-center">
              <Clock className="h-12 w-12 text-destructive" />
            </div>
          ) : (
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
          )}
        </div>

        <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
          {applicationStatus === 'rejected' 
            ? 'Application Not Accepted'
            : 'Application Received'
          }
        </h1>

        <p className="text-muted-foreground text-lg mb-8">
          {applicationStatus === 'rejected' ? (
            'We appreciate your interest, but we are unable to offer membership at this time. We wish you the very best.'
          ) : (
            'Thank you for applying to Make Friends and Socialize. Our membership committee is reviewing your application with the care it deserves. We will be in touch within 48 hours.'
          )}
        </p>

        {applicationStatus !== 'rejected' && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-display text-xl text-card-foreground mb-4 text-center">What Happens Next</h3>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Committee Review', desc: 'Our team carefully reviews each application' },
                { step: '2', title: 'Personal Invitation', desc: "You'll receive an email with your membership details" },
                { step: '3', title: 'Access Granted', desc: 'Begin your journey with exclusive access to events and introductions' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold">{step}</span>
                  </div>
                  <div>
                    <p className="text-foreground font-medium">{title}</p>
                    <p className="text-muted-foreground text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <TransitionLink to="/">Return to Homepage</TransitionLink>
          </Button>
          <Button asChild>
            <TransitionLink to="/events">Browse Upcoming Events</TransitionLink>
          </Button>
        </div>
      </div>
    </div>
  );
}
