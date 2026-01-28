import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
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
      <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-[hsl(var(--secondary))]">
        {/* Decorative corner shapes */}
        <div className="absolute top-0 left-0 w-[300px] h-[300px] md:w-[400px] md:h-[400px]">
          <div className="absolute top-0 left-0 w-full h-full border-[3px] border-primary/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-8 left-8 w-[80%] h-[80%] border-[3px] border-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
        
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] md:w-[400px] md:h-[400px]">
          <div className="absolute bottom-0 right-0 w-full h-full border-[3px] border-primary/20 rounded-full translate-x-1/2 translate-y-1/2" />
          <div className="absolute bottom-8 right-8 w-[80%] h-[80%] border-[3px] border-primary/10 rounded-full translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Subtle glow */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        
        <div className="w-full max-w-md text-center relative z-10">
          <Link to="/" className="inline-block mb-10">
            <img src={currentLogo} alt="MakeFriends & Socialize" className="h-10 mx-auto" />
          </Link>
          
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-border/30">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl text-foreground mb-3">Check Your Email</h1>
            <p className="text-muted-foreground mb-6">
              We've sent a password reset link to <strong className="text-foreground">{email}</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Click the link in the email to reset your password. If you don't see it, check your spam folder.
            </p>
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-[hsl(var(--secondary))]">
      {/* Decorative corner shapes - Top Left */}
      <div className="absolute top-0 left-0 w-[250px] h-[250px] md:w-[350px] md:h-[350px]">
        <div className="absolute top-0 left-0 w-full h-full border-[3px] border-primary/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-6 left-6 w-[85%] h-[85%] border-[3px] border-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>
      
      {/* Decorative corner shapes - Bottom Right */}
      <div className="absolute bottom-0 right-0 w-[250px] h-[250px] md:w-[350px] md:h-[350px]">
        <div className="absolute bottom-0 right-0 w-full h-full border-[3px] border-primary/20 rounded-full translate-x-1/2 translate-y-1/2" />
        <div className="absolute bottom-6 right-6 w-[85%] h-[85%] border-[3px] border-primary/10 rounded-full translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Subtle center glow */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="inline-block mb-10">
          <img src={currentLogo} alt="MakeFriends & Socialize" className="h-10" />
        </Link>

        <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-border/30">
          <h1 className="font-display text-3xl text-foreground mb-2">Forgot password?</h1>
          <p className="text-muted-foreground text-sm mb-8">
            No worries, we'll send you reset instructions.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/60 h-12 rounded-xl border-border/50 pl-4"
                />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-full text-base font-medium" size="lg">
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Reset password'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
