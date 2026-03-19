import { useNativeBiometrics } from '@/hooks/useNativeBiometrics';
import { useAuth } from '@/contexts/AuthContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Fingerprint, ShieldCheck } from 'lucide-react';

/**
 * Settings toggle for biometric app lock.
 * Only visible on native platforms with biometric hardware.
 */
export function BiometricSettings() {
  const { user } = useAuth();
  const { isAvailable, isEnabled, isLoading, biometryLabel, enable, disable } = useNativeBiometrics();

  if (!isAvailable || isLoading) return null;

  const handleToggle = async (checked: boolean) => {
    if (!user) return;
    if (checked) {
      await enable(user.id);
    } else {
      await disable();
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          {biometryLabel.includes('Face') ? (
            <ShieldCheck className="h-5 w-5 text-primary" />
          ) : (
            <Fingerprint className="h-5 w-5 text-primary" />
          )}
        </div>
        <div>
          <Label htmlFor="biometric-toggle" className="text-sm font-medium">
            {biometryLabel} Lock
          </Label>
          <p className="text-xs text-muted-foreground">
            Require {biometryLabel} to open the app
          </p>
        </div>
      </div>
      <Switch
        id="biometric-toggle"
        checked={isEnabled}
        onCheckedChange={handleToggle}
      />
    </div>
  );
}
