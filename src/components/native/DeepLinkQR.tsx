import { useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QrCode, Share2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DeepLinkQRProps {
  /** Path portion of the deep link, e.g. /events/abc-123 */
  path: string;
  /** Title shown in the share sheet */
  title?: string;
  /** Description shown in the share sheet */
  description?: string;
  /** Size of the QR code in pixels */
  size?: number;
  /** Custom trigger element; defaults to a QR icon button */
  trigger?: React.ReactNode;
  className?: string;
}

const BASE_DOMAIN = 'makefriendsandsocialize.com';

/**
 * QR code generator + share button for deep links.
 * Generates a universal link URL that opens the native app (if installed)
 * or falls back to the website.
 */
export function DeepLinkQR({
  path,
  title = 'MakeFriends',
  description,
  size = 200,
  trigger,
  className,
}: DeepLinkQRProps) {
  const [copied, setCopied] = useState(false);
  const url = `https://${BASE_DOMAIN}${path.startsWith('/') ? path : `/${path}`}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }, [url]);

  const handleShare = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Share.share({
          title,
          text: description || title,
          url,
          dialogTitle: 'Share link',
        });
      } catch (err: any) {
        // User cancelled - not an error
        if (err?.message !== 'Share canceled') {
          console.error('[DeepLinkQR] Share failed:', err);
        }
      }
    } else {
      // Web fallback
      if (navigator.share) {
        navigator.share({ title, text: description, url }).catch(() => {});
      } else {
        handleCopy();
      }
    }
  }, [url, title, description, handleCopy]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon" className={cn('h-8 w-8', className)}>
            <QrCode className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-center">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="rounded-xl bg-white p-3">
            <QRCodeSVG
              value={url}
              size={size}
              level="M"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>

          <p className="text-xs text-muted-foreground text-center max-w-[200px] break-all">
            {url}
          </p>

          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1 gap-2" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button className="flex-1 gap-2" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
