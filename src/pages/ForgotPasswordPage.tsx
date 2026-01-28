import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, KeyRound, Shield, Lock } from 'lucide-react';
import { z } from 'zod';
import { useTheme } from 'next-themes';
import logoLight from '@/assets/logo-transparent.png';
import logoDark from '@/assets/logo-dark.png';

const emailSchema = z.string().email('Please enter a valid email address');

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentLogo = !mounted || resolvedTheme === 'dark' ? logoLight : logoDark;

  // Password reset links must open a URL that serves the actual app.
  // Some "preview--*.lovable.app" vanity preview hosts show a Lovable gate/login page
  // instead of our app, which makes the reset flow appear blank.
  const getPasswordResetRedirectTo = () => {
    const origin = window.location.origin;
    if (origin.includes('preview--') && origin.endsWith('.lovable.app')) {
      return 'https://makefriendsandsocializecom.lovable.app/auth/reset-password';
    }
    return `${origin}/auth/reset-password`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getPasswordResetRedirectTo(),
    });

    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setIsSuccess(true);
  };

  const steps = [
    { icon: KeyRound, title: 'Enter email', description: 'Provide your account email' },
    { icon: Shield, title: 'Check inbox', description: 'Click the reset link' },
    { icon: Lock, title: 'New password', description: 'Create a secure password' },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Branding */}
      <div className="relative w-full lg:w-1/2 bg-secondary p-8 lg:p-12 flex flex-col justify-between min-h-[40vh] lg:min-h-screen overflow-hidden">
        {/* Gradient glow effect */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
        
        {/* Logo */}
        <Link to="/" className="relative z-10">
          <img src={logoLight} alt="MakeFriends & Socialize" className="h-10" />
        </Link>
        
        {/* Content */}
        <div className="relative z-10 mt-auto">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-white mb-4">
            Reset Your<br />Password
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-md">
            Follow these simple steps to regain access to your account.
          </p>
          
          {/* Step cards */}
          <div className="flex flex-wrap gap-3 mt-8">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`rounded-2xl p-4 md:p-5 min-w-[140px] flex-1 max-w-[180px] ${
                  index === 0 
                    ? 'bg-white text-secondary' 
                    : 'bg-white/10 backdrop-blur-sm text-white border border-white/10'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-3 ${
                  index === 0 ? 'bg-secondary text-white' : 'bg-white/20 text-white'
                }`}>
                  {index + 1}
                </div>
                <p className={`text-sm font-medium ${index === 0 ? 'text-secondary' : 'text-white/90'}`}>
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 bg-background flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {isSuccess ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl text-foreground mb-3">Check Your Email</h2>
              <p className="text-muted-foreground mb-2">
                We've sent a password reset link to
              </p>
              <p className="text-foreground font-medium mb-6">{email}</p>
              <p className="text-sm text-muted-foreground mb-8">
                Click the link in the email to reset your password. If you don't see it, check your spam folder.
              </p>
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-display text-2xl md:text-3xl text-foreground mb-2">Forgot password?</h2>
              <p className="text-muted-foreground mb-8">
                No worries, we'll send you reset instructions.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-muted/50 border-border/50 rounded-lg"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  variant="outline"
                  className="w-full h-12 rounded-lg text-base font-medium bg-white text-secondary hover:bg-white/90 border-0" 
                  size="lg"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Reset password'
                  )}
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link to="/auth" className="text-foreground font-medium hover:text-primary transition-colors">
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
