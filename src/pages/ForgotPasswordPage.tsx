import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2, Mail, CheckCircle } from 'lucide-react';
import { z } from 'zod';
import { useTheme } from 'next-themes';
import { FloatingParticles } from '@/components/ui/floating-particles';
import logoLight from '@/assets/logo-transparent.png';
import logoDark from '@/assets/logo-dark.png';

const emailSchema = z.string().email('Please enter a valid email address');

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use light logo for dark theme, dark logo for light theme
  const currentLogo = !mounted || resolvedTheme === 'dark' ? logoLight : logoDark;

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
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/95 to-background" />
        
        {/* Decorative shapes */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        
        {/* Floating particles */}
        <FloatingParticles />
        
        <div className="w-full max-w-md text-center animate-fade-in relative z-10">
          <Link to="/" className="inline-block mb-8">
            <img src={currentLogo} alt="MakeFriends & Socialize" className="h-10 mx-auto" />
          </Link>
          
          <div className="bg-card/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-border/50">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-display text-2xl text-card-foreground mb-2">Check Your Email</h1>
            <p className="text-muted-foreground mb-6">
              We've sent a password reset link to <strong className="text-card-foreground">{email}</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Click the link in the email to reset your password. If you don't see it, check your spam folder.
            </p>
            <Link to="/auth">
              <Button variant="outline" className="w-full rounded-xl">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/95 to-background" />
      
      {/* Decorative shapes */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      
      {/* Floating particles */}
      <FloatingParticles />
      
      <div className="w-full max-w-md animate-fade-in relative z-10">
        <Link to="/" className="inline-block mb-8">
          <img src={currentLogo} alt="MakeFriends & Socialize" className="h-10" />
        </Link>

        <div className="bg-card/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-border/50">
          <h1 className="font-display text-2xl text-card-foreground mb-2">Forgot Password?</h1>
          <p className="text-muted-foreground text-sm mb-6">
            No worries! Enter your email and we'll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 pl-10 rounded-xl border-border/50"
                />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl" size="lg">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
