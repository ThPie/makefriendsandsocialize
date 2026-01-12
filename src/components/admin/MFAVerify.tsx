import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Loader2 } from 'lucide-react';

interface MFAVerifyProps {
  open: boolean;
  onVerified: () => void;
  onCancel: () => void;
}

export function MFAVerify({ open, onVerified, onCancel }: MFAVerifyProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-admin-mfa', {
        body: { action: 'verify', code }
      });

      if (error) throw error;

      // Store session token in sessionStorage for this browser session
      if (data.sessionToken) {
        sessionStorage.setItem('admin_mfa_session', data.sessionToken);
        sessionStorage.setItem('admin_mfa_expires', data.expiresAt);
      }

      toast.success('Verification successful');
      setCode('');
      onVerified();
    } catch (error: any) {
      console.error('MFA verification error:', error);
      toast.error(error.message || 'Invalid verification code');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6) {
      handleVerify();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Enter the 6-digit code from your authenticator app to access sensitive data.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Verification Code</label>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              onKeyDown={handleKeyDown}
              className="text-center text-2xl tracking-widest font-mono"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onCancel} 
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleVerify} 
              disabled={loading || code.length !== 6}
              className="flex-1"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Verify
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            This session will remain active for 2 hours
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
