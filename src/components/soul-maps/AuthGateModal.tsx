import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

interface AuthGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectPath: string;
}

export const AuthGateModal = ({ open, onOpenChange, redirectPath }: AuthGateModalProps) => {
  const navigate = useNavigate();

  const handleAuth = (mode: 'signup' | 'signin') => {
    const params = new URLSearchParams({ redirect: redirectPath });
    if (mode === 'signup') params.set('mode', 'signup');
    navigate(`/auth?${params.toString()}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center space-y-5 p-8">
        <div className="mx-auto w-12 h-12 rounded-full bg-[hsl(var(--accent-gold))]/10 flex items-center justify-center">
          <Lock className="w-5 h-5 text-[hsl(var(--accent-gold))]" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-display font-semibold text-foreground">Your results are ready</h3>
          <p className="text-sm text-muted-foreground">Create a free account or sign in to unlock your full Soul Maps report.</p>
        </div>
        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={() => handleAuth('signup')}
            className="w-full rounded-full h-11 bg-[hsl(var(--accent-gold))] hover:bg-[hsl(var(--accent-gold))]/90 text-white uppercase tracking-widest text-sm font-medium"
          >
            Sign Up Free
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAuth('signin')}
            className="w-full rounded-full h-11 uppercase tracking-widest text-sm font-medium"
          >
            Sign In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
