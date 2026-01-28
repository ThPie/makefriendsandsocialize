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
import { useAuth } from '@/contexts/AuthContext';

const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { session, isRecoveryMode, isLoading: authLoading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // The user arrives here after being redirected from the home page by RecoveryRedirectHandler.
  // The session should already be established by the time they get here.
  // If not, they landed directly on this page without going through the recovery flow.
  const hasValidSession = session !== null || isRecoveryMode;
  const isLoading = authLoading;
  
  // Only show error if auth is done loading and there's no valid session
  const showError = !isLoading && !hasValidSession;

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

  // Error state - no valid session (user landed here directly without recovery flow)
  if (showError) {
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
              The reset link is invalid or has expired. Please request a new one.
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
