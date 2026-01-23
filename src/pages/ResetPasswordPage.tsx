import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import { z } from 'zod';
import logoLight from '@/assets/logo-light.png';

const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // IMMEDIATELY check for error parameters in URL hash FIRST
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');
    
    if (error) {
      // Decode the error description (handles + signs and URL encoding)
      const decodedError = errorDescription 
        ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
        : 'The reset link is invalid or has expired.';
      setErrorMessage(decodedError);
      setIsLoading(false);
      return; // Don't set up listeners if there's already an error
    }

    // Listen for auth state changes - this handles the token from the URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Reset password auth event:', event, 'Session:', !!session);
      
      if (event === 'PASSWORD_RECOVERY') {
        // User came from password reset email
        setHasValidSession(true);
        setIsLoading(false);
      } else if (event === 'SIGNED_IN' && session) {
        // Session established after password recovery
        setHasValidSession(true);
        setIsLoading(false);
      }
    });

    // Also check if there's already a session (user may have refreshed)
    const checkExistingSession = async () => {
      // Give Supabase a moment to process the URL hash tokens
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setHasValidSession(true);
      } else if (!hasValidSession) {
        // No session and no valid recovery - show generic error
        setErrorMessage('Invalid or expired reset link. Please request a new one.');
      }
      setIsLoading(false);
    };

    checkExistingSession();

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.updateUser({ password });

    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setIsSuccess(true);
    toast.success('Password updated successfully!');
    
    setTimeout(() => {
      navigate('/portal');
    }, 2000);
  };

  // Loading state while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center animate-fade-in">
          <div className="bg-card rounded-lg p-8 shadow-elegant">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <h1 className="font-display text-xl text-card-foreground">Verifying reset link...</h1>
          </div>
        </div>
      </div>
    );
  }

  // Error state - invalid or expired link
  if (errorMessage && !hasValidSession) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
        <div className="w-full max-w-md animate-fade-in">
          <Link to="/" className="inline-block mb-8">
            <img src={logoLight} alt="MakeFriends & Socialize" className="h-10 brightness-0 invert" />
          </Link>

          <div className="bg-card rounded-lg p-8 shadow-elegant text-center">
            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h1 className="font-display text-2xl text-card-foreground mb-2">Link Expired</h1>
            <p className="text-muted-foreground text-sm mb-6">
              {errorMessage}
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link to="/auth/forgot-password">Request New Reset Link</Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="lg">
                <Link to="/auth">Back to Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center animate-fade-in">
          <div className="bg-card rounded-lg p-8 shadow-elegant">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="font-display text-2xl text-card-foreground mb-2">Password Updated!</h1>
            <p className="text-muted-foreground">Redirecting you to your portal...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <Link to="/" className="inline-block mb-8">
          <img src={logoLight} alt="MakeFriends & Socialize" className="h-10 brightness-0 invert" />
        </Link>

        <div className="bg-card rounded-lg p-8 shadow-elegant">
          <h1 className="font-display text-2xl text-card-foreground mb-2">Set New Password</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-card-foreground">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-card-foreground">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-background pl-10"
                />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Update Password'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
