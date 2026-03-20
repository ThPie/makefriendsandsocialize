import { useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MFASetup } from './MFASetup';
import { MFAVerify } from './MFAVerify';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import { AdminTableSkeleton } from './AdminEmptyState';

interface MFAGuardProps {
  children: ReactNode;
  requireMFA?: boolean;
}

type MFAStatus = 'loading' | 'needs_setup' | 'needs_verify' | 'verified';

export function MFAGuard({ children, requireMFA = true }: MFAGuardProps) {
  const [status, setStatus] = useState<MFAStatus>('loading');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [setupDismissed, setSetupDismissed] = useState(() => {
    return sessionStorage.getItem('mfa_setup_dismissed') === 'true';
  });

  useEffect(() => {
    if (requireMFA) {
      checkMFAStatus();
    } else {
      setStatus('verified');
    }
  }, [requireMFA]);

  // Show toast for 2FA setup recommendation (once per session)
  useEffect(() => {
    if (status === 'needs_setup' && !setupDismissed) {
      toast('Two-Factor Authentication Recommended', {
        description: 'Set up 2FA to secure your admin account.',
        duration: 8000,
        icon: <Shield className="h-4 w-4 text-amber-500" />,
        action: {
          label: 'Set Up',
          onClick: () => setShowVerifyModal(true),
        },
        onDismiss: () => {
          setSetupDismissed(true);
          sessionStorage.setItem('mfa_setup_dismissed', 'true');
        },
      });
    }
  }, [status, setupDismissed]);

  const checkMFAStatus = async () => {
    try {
      const storedSession = sessionStorage.getItem('admin_mfa_session');
      const storedExpiry = sessionStorage.getItem('admin_mfa_expires');
      
      if (storedSession && storedExpiry) {
        const expiryDate = new Date(storedExpiry);
        if (expiryDate > new Date()) {
          const { data, error } = await supabase.functions.invoke('verify-admin-mfa', {
            body: { action: 'check' }
          });

          if (!error && data?.sessionValid) {
            setStatus('verified');
            return;
          }
        }
        
        sessionStorage.removeItem('admin_mfa_session');
        sessionStorage.removeItem('admin_mfa_expires');
      }

      const { data, error } = await supabase.functions.invoke('verify-admin-mfa', {
        body: { action: 'check' }
      });

      if (error) {
        console.error('Failed to check MFA status:', error);
        setStatus('needs_setup');
        return;
      }

      if (!data.mfaEnrolled) {
        setStatus('needs_setup');
      } else if (!data.sessionValid) {
        setStatus('needs_verify');
        setShowVerifyModal(true);
      } else {
        setStatus('verified');
      }
    } catch (error) {
      console.error('MFA check error:', error);
      setStatus('needs_setup');
    }
  };

  const handleSetupComplete = () => {
    setStatus('verified');
    setShowVerifyModal(false);
  };

  const handleVerified = () => {
    setShowVerifyModal(false);
    setStatus('verified');
  };

  const handleVerifyCancel = () => {
    setShowVerifyModal(false);
  };

  // Loading state: show skeleton instead of blocking overlay
  if (status === 'loading') {
    return (
      <div className="space-y-6">
        <AdminTableSkeleton rows={6} cols={5} />
      </div>
    );
  }

  // Needs setup: show content normally, 2FA reminder is a toast
  if (status === 'needs_setup') {
    return (
      <>
        {showVerifyModal && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <MFASetup onSetupComplete={handleSetupComplete} />
          </div>
        )}
        {children}
      </>
    );
  }

  // Needs verification: show verify dialog + content behind it
  if (status === 'needs_verify') {
    return (
      <>
        <MFAVerify 
          open={showVerifyModal}
          onVerified={handleVerified}
          onCancel={handleVerifyCancel}
        />
        {children}
      </>
    );
  }

  return <>{children}</>;
}
