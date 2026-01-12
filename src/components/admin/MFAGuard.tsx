import { useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MFASetup } from './MFASetup';
import { MFAVerify } from './MFAVerify';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';

interface MFAGuardProps {
  children: ReactNode;
  requireMFA?: boolean;
}

type MFAStatus = 'loading' | 'needs_setup' | 'needs_verify' | 'verified';

export function MFAGuard({ children, requireMFA = true }: MFAGuardProps) {
  const [status, setStatus] = useState<MFAStatus>('loading');
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  useEffect(() => {
    if (requireMFA) {
      checkMFAStatus();
    } else {
      setStatus('verified');
    }
  }, [requireMFA]);

  const checkMFAStatus = async () => {
    try {
      // First check if we have a valid session in sessionStorage
      const storedSession = sessionStorage.getItem('admin_mfa_session');
      const storedExpiry = sessionStorage.getItem('admin_mfa_expires');
      
      if (storedSession && storedExpiry) {
        const expiryDate = new Date(storedExpiry);
        if (expiryDate > new Date()) {
          // Session is still valid locally, verify with server
          const { data, error } = await supabase.functions.invoke('verify-admin-mfa', {
            body: { action: 'check' }
          });

          if (!error && data?.sessionValid) {
            setStatus('verified');
            return;
          }
        }
        
        // Clear expired session
        sessionStorage.removeItem('admin_mfa_session');
        sessionStorage.removeItem('admin_mfa_expires');
      }

      // Check MFA status with server
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
  };

  const handleVerified = () => {
    setShowVerifyModal(false);
    setStatus('verified');
  };

  const handleVerifyCancel = () => {
    setShowVerifyModal(false);
    // User cancelled, but they still need to verify
    // Keep status as needs_verify so they see the prompt
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Checking security status...</p>
        </div>
      </div>
    );
  }

  if (status === 'needs_setup') {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <MFASetup onSetupComplete={handleSetupComplete} />
      </div>
    );
  }

  if (status === 'needs_verify') {
    return (
      <>
        <MFAVerify 
          open={showVerifyModal}
          onVerified={handleVerified}
          onCancel={handleVerifyCancel}
        />
        <Card className="max-w-md mx-auto mt-8">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle>Verification Required</CardTitle>
            <CardDescription>
              This area contains sensitive information and requires two-factor authentication.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <button 
              onClick={() => setShowVerifyModal(true)}
              className="text-primary hover:underline"
            >
              Click here to verify your identity
            </button>
          </CardContent>
        </Card>
      </>
    );
  }

  return <>{children}</>;
}
