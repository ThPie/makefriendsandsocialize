import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface AuthGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectPath: string;
  onEmailSubmitted?: () => void;
}

export const AuthGateModal = ({ open, onOpenChange, redirectPath, onEmailSubmitted }: AuthGateModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    const trimmedEmail = email.trim();
    try {
      // Store email as a lead + auto-subscribe to newsletter
      await Promise.all([
        supabase.from('soul_maps_leads').insert({
          email: trimmedEmail,
          quiz_slug: 'attachment-style',
          source_url: window.location.href,
        }),
        supabase.functions.invoke('send-newsletter-confirmation', {
          body: { email: trimmedEmail },
        }),
        supabase.functions.invoke('sync-mailchimp-subscriber', {
          body: { email: trimmedEmail },
        }),
      ]);
      setSubmitted(true);
      toast.success('Thanks! Your results are unlocked.');
      onEmailSubmitted?.();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    const params = new URLSearchParams({ redirect: redirectPath });
    navigate(`/auth?${params.toString()}`);
  };

  if (submitted) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center space-y-5 p-8">
        <div className="mx-auto w-12 h-12 rounded-full bg-[hsl(var(--accent-gold))]/10 flex items-center justify-center">
          <Lock className="w-5 h-5 text-[hsl(var(--accent-gold))]" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-display font-semibold text-foreground">Your results are ready</h3>
          <p className="text-sm text-muted-foreground">Enter your email to unlock your full Soul Maps report.</p>
        </div>
        <form onSubmit={handleSubmitEmail} className="space-y-3 pt-2">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 h-11 rounded-full"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full h-11 bg-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))]/90 text-white uppercase tracking-widest text-xs font-medium"
          >
            {loading ? 'Unlocking…' : 'Unlock My Results'}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          Already have an account?{' '}
          <button onClick={handleSignIn} className="text-[hsl(var(--accent-gold))] underline hover:no-underline">
            Sign in
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
};
