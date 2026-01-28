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
      <div className="space-y-6">
        {/* Warning banner but still show content */}
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Two-Factor Authentication Recommended</p>
                <p className="text-sm text-muted-foreground">
                  For enhanced security, please set up 2FA. Some sensitive actions may require verification.
                </p>
              </div>
              <button
                onClick={() => setShowVerifyModal(true)}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium shrink-0"
              >
                Set Up 2FA
              </button>
            </div>
          </CardContent>
        </Card>
        {showVerifyModal && (
          <div className="flex items-center justify-center min-h-[400px] p-4">
            <MFASetup onSetupComplete={handleSetupComplete} />
          </div>
        )}
        {!showVerifyModal && children}
      </div>
    );
  }

  if (status === 'needs_verify') {
    return (
      <div className="space-y-6">
        <MFAVerify 
          open={showVerifyModal}
          onVerified={handleVerified}
          onCancel={handleVerifyCancel}
        />
        {/* Warning banner with verify button */}
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Session Verification Required</p>
                <p className="text-sm text-muted-foreground">
                  Your 2FA session has expired. Please verify to access sensitive data.
                </p>
              </div>
              <button
                onClick={() => setShowVerifyModal(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium shrink-0"
              >
                Verify Now
              </button>
            </div>
          </CardContent>
        </Card>
        {/* Show content with overlay for truly sensitive pages */}
        <div className="relative">
          <div className="opacity-50 pointer-events-none select-none blur-sm">
            {children}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Card className="max-w-sm">
              <CardContent className="py-6 text-center">
                <Shield className="w-8 h-8 mx-auto mb-3 text-primary" />
                <p className="font-medium mb-2">Verify to Continue</p>
                <button
                  onClick={() => setShowVerifyModal(true)}
                  className="text-primary hover:underline text-sm"
                >
                  Click to verify your identity
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
