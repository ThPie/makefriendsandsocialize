import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, AlertTriangle, Loader2, X } from 'lucide-react';

export function EmailVerificationBanner() {
  const { user } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if email is verified
  const isEmailVerified = user?.email_confirmed_at != null;

  // Don't show if verified or dismissed
  if (isEmailVerified || isDismissed || !user) {
    return null;
  }

  const handleResendVerification = async () => {
    if (!user?.email) return;
    
    setIsResending(true);
    setResendStatus('idle');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('Failed to resend verification:', error);
        setResendStatus('error');
      } else {
        setResendStatus('success');
      }
    } catch (err) {
      console.error('Error resending verification:', err);
      setResendStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Alert className="border-amber-500/30 bg-amber-500/10 relative">
      <AlertTriangle className="h-4 w-4 text-amber-500" />
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-amber-500 hidden sm:block" />
          <span className="text-amber-200">
            Please verify your email address to secure your account.
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {resendStatus === 'success' ? (
            <span className="flex items-center gap-1.5 text-green-400 text-sm">
              <CheckCircle className="h-4 w-4" />
              Verification email sent!
            </span>
          ) : resendStatus === 'error' ? (
            <span className="flex items-center gap-1.5 text-red-400 text-sm">
              <AlertTriangle className="h-4 w-4" />
              Failed to send. Try again.
            </span>
          ) : null}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendVerification}
            disabled={isResending || resendStatus === 'success'}
            className="border-amber-500/30 text-amber-200 hover:bg-amber-500/20 hover:text-amber-100"
          >
            {isResending ? (
              <>
                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                Sending...
              </>
            ) : resendStatus === 'success' ? (
              'Sent!'
            ) : (
              'Resend Verification'
            )}
          </Button>
        </div>
      </AlertDescription>
      
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-2 right-2 text-amber-400/60 hover:text-amber-300 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </Alert>
  );
}
