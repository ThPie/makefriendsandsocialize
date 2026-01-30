import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Copy, CheckCircle, Loader2 } from 'lucide-react';

interface MFASetupProps {
  onSetupComplete: () => void;
  onCancel?: () => void;
}

export function MFASetup({ onSetupComplete, onCancel }: MFASetupProps) {
  const [step, setStep] = useState<'intro' | 'qr' | 'verify'>('intro');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [factorId, setFactorId] = useState<string>('');
  const [verifyCode, setVerifyCode] = useState('');
  const [copied, setCopied] = useState(false);

  const startSetup = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-admin-mfa', {
        body: { action: 'setup' }
      });

      if (error) throw error;

      setQrCode(data.qrCode);
      setSecret(data.secret);
      setFactorId(data.factorId);
      setStep('qr');
    } catch (error: any) {
      console.error('MFA setup error:', error);
      toast.error('Failed to initialize MFA setup');
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

  const verifySetup = async () => {
    if (verifyCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-admin-mfa', {
        body: { action: 'verify', code: verifyCode, factorId }
      });

      if (error) throw error;

      toast.success('MFA setup complete!');
      onSetupComplete();
    } catch (error: any) {
      console.error('MFA verification error:', error);
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          {step === 'intro' && 'Secure your admin account with 2FA'}
          {step === 'qr' && 'Scan the QR code with your authenticator app'}
          {step === 'verify' && 'Enter the code from your authenticator app'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'intro' && (
          <>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Two-factor authentication adds an extra layer of security to your admin account.</p>
              <p>You'll need an authenticator app like:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Google Authenticator</li>
                <li>Authy</li>
                <li>1Password</li>
                <li>Microsoft Authenticator</li>
              </ul>
            </div>
            <div className="flex gap-2 pt-4">
              {onCancel && (
                <Button variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
              )}
              <Button onClick={startSetup} disabled={loading} className="flex-1">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Set Up 2FA
              </Button>
            </div>
          </>
        )}

        {step === 'qr' && (
          <>
            <div className="flex justify-center">
              {qrCode && (
                <img 
                  src={qrCode} 
                  alt="MFA QR Code" 
                  className="w-48 h-48 border rounded-lg"
                />
              )}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p>Can't scan? Enter this code manually:</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                  {secret}
                </code>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copySecret}
                  className="h-8 w-8 p-0"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button onClick={() => setStep('verify')} className="w-full mt-4">
              I've Added the Code
            </Button>
          </>
        )}

        {step === 'verify' && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Verification Code</label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep('qr')} 
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={verifySetup} 
                disabled={loading || verifyCode.length !== 6}
                className="flex-1"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Verify
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
