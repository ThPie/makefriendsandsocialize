import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, ShieldCheck, ShieldOff, Loader2, Copy, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

type MFAStep = 'loading' | 'disabled' | 'setup_intro' | 'setup_qr' | 'setup_verify' | 'enabled';

export default function PortalSecurity() {
  const { user } = useAuth();
  const [step, setStep] = useState<MFAStep>('loading');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [showDisable, setShowDisable] = useState(false);

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('user-mfa', {
        body: { action: 'check' },
      });
      if (error) throw error;
      setStep(data.mfaVerified ? 'enabled' : 'disabled');
    } catch (err) {
      console.error('MFA check error:', err);
      setStep('disabled');
    }
  };

  const startSetup = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('user-mfa', {
        body: { action: 'setup' },
      });
      if (error) throw error;
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setFactorId(data.factorId);
      setStep('setup_qr');
    } catch (err: any) {
      console.error('MFA setup error:', err);
      toast.error('Failed to initialize MFA setup');
    } finally {
      setLoading(false);
    }
  };

  const verifySetup = async () => {
    if (verifyCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('user-mfa', {
        body: { action: 'verify', code: verifyCode, factorId },
      });
      if (error) throw error;
      toast.success('Two-factor authentication enabled!');
      setStep('enabled');
      setVerifyCode('');
    } catch (err: any) {
      console.error('MFA verify error:', err);
      toast.error(err.message || 'Invalid verification code');
      setVerifyCode('');
    } finally {
      setLoading(false);
    }
  };

  const disableMFA = async () => {
    if (disableCode.length !== 6) {
      toast.error('Please enter a 6-digit code to confirm');
      return;
    }
    setLoading(true);
    try {
      // Verify first
      const { error: verifyErr } = await supabase.functions.invoke('user-mfa', {
        body: { action: 'verify', code: disableCode },
      });
      if (verifyErr) throw verifyErr;

      // Then unenroll
      const { error: unenrollErr } = await supabase.functions.invoke('user-mfa', {
        body: { action: 'unenroll' },
      });
      if (unenrollErr) throw unenrollErr;

      toast.success('Two-factor authentication disabled');
      setStep('disabled');
      setShowDisable(false);
      setDisableCode('');
    } catch (err: any) {
      console.error('MFA disable error:', err);
      toast.error(err.message || 'Failed to disable MFA. Check your code.');
      setDisableCode('');
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    toast.success('Secret copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (step === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full pb-16 space-y-8">
      <div className="text-center max-w-[680px] mx-auto mb-8">
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">Security</h1>
        <p className="text-muted-foreground">Manage your account security settings</p>
      </div>

      {/* MFA Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step === 'enabled' ? 'bg-green-500/10' : 'bg-muted'
            }`}>
              {step === 'enabled' ? (
                <ShieldCheck className="h-5 w-5 text-green-600" />
              ) : (
                <Shield className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                {step === 'enabled'
                  ? 'Your account is protected with 2FA'
                  : 'Add an extra layer of security to your account'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Disabled state */}
          {step === 'disabled' && (
            <>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Two-factor authentication adds an extra layer of security by requiring a code from your authenticator app when signing in.</p>
                <p className="font-medium">Compatible apps:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Google Authenticator</li>
                  <li>Authy</li>
                  <li>1Password</li>
                  <li>Microsoft Authenticator</li>
                </ul>
              </div>
              <Button onClick={startSetup} disabled={loading} className="w-full sm:w-auto">
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Enable Two-Factor Authentication
              </Button>
            </>
          )}

          {/* QR Code step */}
          {step === 'setup_qr' && (
            <>
              <p className="text-sm text-muted-foreground">Scan this QR code with your authenticator app:</p>
              <div className="flex justify-center py-4">
                {qrCode && (
                  <img src={qrCode} alt="MFA QR Code" className="w-48 h-48 border rounded-lg" />
                )}
              </div>
              <div className="text-center text-sm text-muted-foreground">
                <p>Can't scan? Enter this code manually:</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <code className="bg-muted px-3 py-1.5 rounded text-xs font-mono select-all">
                    {secret}
                  </code>
                  <Button variant="ghost" size="sm" onClick={copySecret} className="h-8 w-8 p-0">
                    {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setStep('disabled')} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setStep('setup_verify')} className="flex-1">
                  I've Added the Code
                </Button>
              </div>
            </>
          )}

          {/* Verify step */}
          {step === 'setup_verify' && (
            <>
              <p className="text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app to complete setup:</p>
              <div className="space-y-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && verifyCode.length === 6 && verifySetup()}
                  className="text-center text-2xl tracking-widest font-mono max-w-xs mx-auto"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('setup_qr')} className="flex-1">
                  Back
                </Button>
                <Button onClick={verifySetup} disabled={loading || verifyCode.length !== 6} className="flex-1">
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Verify & Enable
                </Button>
              </div>
            </>
          )}

          {/* Enabled state */}
          {step === 'enabled' && (
            <>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Two-factor authentication is active</p>
                  <p className="text-xs text-muted-foreground">Your account has an extra layer of protection</p>
                </div>
              </div>

              {!showDisable ? (
                <Button
                  variant="outline"
                  onClick={() => setShowDisable(true)}
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  <ShieldOff className="h-4 w-4 mr-2" />
                  Disable Two-Factor Authentication
                </Button>
              ) : (
                <div className="space-y-3 p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                  <p className="text-sm font-medium text-destructive">Confirm by entering your authenticator code:</p>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => e.key === 'Enter' && disableCode.length === 6 && disableMFA()}
                    className="text-center text-2xl tracking-widest font-mono max-w-xs"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { setShowDisable(false); setDisableCode(''); }}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={disableMFA}
                      disabled={loading || disableCode.length !== 6}
                    >
                      {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Disable 2FA
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Session Info Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>Session Security</CardTitle>
              <CardDescription>Your session automatically expires after 30 minutes of inactivity</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            For your protection, you'll be automatically logged out after 30 minutes without activity. 
            A warning will appear 2 minutes before logout, giving you a chance to stay signed in.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
