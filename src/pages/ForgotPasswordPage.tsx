import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { z } from 'zod';
import { useTheme } from 'next-themes';
import { getPublishedHost } from '@/lib/subdomain-utils';
import { BrandLogo } from '@/components/common/BrandLogo';
import { MemberAvatars } from '@/components/home/MemberAvatars';
import { useSiteStats } from '@/hooks/useSiteStats';

const emailSchema = z.string().email('Please enter a valid email address');

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const { data: siteStats, isLoading: isLoadingStats } = useSiteStats();
  const avatarUrls = siteStats?.avatarUrls ?? [];
  const memberCount = siteStats?.memberCount ?? 0;

  // Redirect directly to the reset password page — NOT the home page.
  // Landing on "/" relied on PASSWORD_RECOVERY event detection which is
  // fragile and can let users log in without resetting their password.
  const getPasswordResetRedirectTo = () => {
    const hostname = window.location.hostname;
    
    if (hostname.endsWith('.lovable.app')) {
      if (hostname.startsWith('preview--') || hostname.startsWith('id-preview--')) {
        return `${getPublishedHost()}/auth/reset-password`;
      }
    }
    
    return `${window.location.origin}/auth/reset-password`;
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

  return (
    <div className="min-h-screen relative bg-background">
      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full min-h-screen p-3">
        {/* Left Side — Video Panel */}
        <div className="relative w-1/2 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/images/hero-poster.webp"
              onCanPlayThrough={() => setVideoReady(true)}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto object-cover transition-opacity duration-1000 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
            >
              <source src="https://s56qldubneyttjo2.public.blob.vercel-storage.com/Videos/hero" type="video/mp4" />
            </video>
          </div>
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(150,38%,6%)]/90 via-[hsl(150,38%,6%)]/40 to-[hsl(150,38%,6%)]/20" />
          
          {/* Logo + Back */}
          <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-10">
            <Link to="/">
              <BrandLogo forceWhite className="h-10 w-auto" />
            </Link>
            <Link
              to="/"
              className="text-sm text-white/80 hover:text-white border border-white/20 rounded-full px-4 py-2 backdrop-blur-sm bg-white/5 transition-colors duration-200 flex items-center gap-1.5"
            >
              Back to homepage
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Bottom tagline + avatars */}
          <div className="absolute bottom-10 left-8 right-8 z-10">
            <h2 className="font-display italic text-3xl xl:text-4xl text-white leading-tight mb-6">
              Reset Your<br />Password
            </h2>
            <MemberAvatars avatarUrls={avatarUrls} memberCount={memberCount} isLoading={isLoadingStats} />
          </div>
        </div>

        {/* Right Side — Form Panel */}
        <div className="w-1/2 flex flex-col justify-center px-12 xl:px-20">
          <div className="w-full max-w-md mx-auto">
            {isSuccess ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h1 className="font-display italic text-3xl text-foreground mb-3">Check Your Email</h1>
                <p className="text-muted-foreground mb-2">
                  We've sent a password reset link to
                </p>
                <p className="text-foreground font-medium mb-6">{email}</p>
                <p className="text-sm text-muted-foreground mb-8">
                  Click the link in the email to reset your password. If you don't see it, check your spam folder.
                </p>
                <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4">
                  Back to login
                </Link>
              </div>
            ) : (
              <>
                <h1 className="font-display italic text-4xl text-foreground mb-2">Forgot password?</h1>
                <p className="text-muted-foreground text-sm mb-8">
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
                    className="w-full h-12 rounded-lg text-base font-medium" 
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
                  <Link to="/auth" className="text-foreground font-medium underline underline-offset-4 hover:text-primary transition-colors">
                    Log in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout — Full-screen video background */}
      <div className="lg:hidden min-h-screen relative flex flex-col">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/images/hero-poster.webp"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto object-cover"
          >
            <source src="https://s56qldubneyttjo2.public.blob.vercel-storage.com/Videos/hero" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

        {/* Logo */}
        <div className="relative z-10 px-6 pt-6">
          <Link to="/">
            <BrandLogo forceWhite className="h-8 w-auto" />
          </Link>
        </div>

        <div className="flex-1 px-6 py-6 relative z-10 flex flex-col justify-end pb-10">
          {isSuccess ? (
            <div className="backdrop-blur-2xl bg-foreground/[0.04] border border-white/10 rounded-2xl p-6">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle className="h-7 w-7 text-primary" />
                </div>
                <h1 className="font-display italic text-2xl text-white mb-2">Check Your Email</h1>
                <p className="text-white/70 text-sm mb-1">We've sent a reset link to</p>
                <p className="text-white font-medium mb-4">{email}</p>
                <p className="text-xs text-white/50 mb-6">
                  Click the link in the email to reset your password.
                </p>
                <Link to="/auth" className="text-sm text-white/60 hover:text-white transition-colors underline underline-offset-4">
                  Back to login
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h1 className="font-display italic text-3xl text-white mb-1">Forgot password?</h1>
              <p className="text-white/60 text-sm mb-6">
                No worries, we'll send you reset instructions.
              </p>

              <div className="backdrop-blur-2xl bg-foreground/[0.04] border border-white/10 rounded-2xl p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email-mobile" className="text-white/80 text-sm">Email</Label>
                    <Input
                      id="email-mobile"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 bg-white/10 border-white/10 text-white placeholder:text-white/30 rounded-lg"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full h-12 rounded-lg text-base font-medium" 
                    size="lg"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      'Reset password'
                    )}
                  </Button>
                </form>

                <p className="mt-5 text-center text-sm text-white/50">
                  Remember your password?{' '}
                  <Link to="/auth" className="text-white font-medium underline underline-offset-4">
                    Log in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
