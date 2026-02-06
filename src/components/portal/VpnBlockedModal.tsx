import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, RefreshCw } from 'lucide-react';

interface VpnBlockedModalProps {
  isOpen: boolean;
}

export function VpnBlockedModal({ isOpen }: VpnBlockedModalProps) {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent
        className="bg-card border-border sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="text-center py-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
            <Shield className="h-8 w-8 text-amber-500" />
          </div>

          <h2 className="text-2xl font-display text-foreground mb-3">
            VPN or Proxy Detected
          </h2>

          <p className="text-muted-foreground mb-6 leading-relaxed">
            For security and verification purposes, we need to confirm your actual location.
            Please disable your VPN or proxy service and try again.
          </p>

          <div className="bg-secondary/50 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-medium text-foreground mb-2">How to proceed:</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Turn off your VPN or proxy</li>
              <li>Wait a few seconds for the connection to update</li>
              <li>Click the button below to refresh</li>
            </ol>
          </div>

          <Button
            onClick={handleRefresh}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            I've Turned Off My VPN - Refresh
          </Button>

          <p className="text-xs text-muted-foreground/60 mt-4">
            We take security seriously. Location verification helps us maintain
            a trusted community of members.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
