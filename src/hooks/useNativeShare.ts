import { useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { haptic } from '@/lib/haptics';
import { toast } from 'sonner';

interface ShareData {
  title: string;
  text?: string;
  url?: string;
}

/**
 * Native share sheet using Capacitor Share plugin.
 * Falls back to Web Share API or clipboard on unsupported platforms.
 */
export function useNativeShare() {
  const isNative = Capacitor.isNativePlatform();

  const share = useCallback(async (data: ShareData) => {
    try {
      if (isNative) {
        await Share.share({
          title: data.title,
          text: data.text,
          url: data.url,
          dialogTitle: 'Share',
        });
        haptic('success');
        return true;
      }

      // Web fallback: use Web Share API
      if (navigator.share) {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url,
        });
        return true;
      }

      // Final fallback: copy to clipboard
      const shareText = data.url || data.text || data.title;
      await navigator.clipboard.writeText(shareText);
      toast.success('Link copied to clipboard!');
      haptic('selection');
      return true;
    } catch (error: any) {
      // User cancelled share — not an error
      if (error?.name === 'AbortError' || error?.message?.includes('cancel')) {
        return false;
      }
      console.error('Share failed:', error);
      toast.error('Failed to share');
      return false;
    }
  }, [isNative]);

  const canShare = isNative || 'share' in navigator || 'clipboard' in navigator;

  return { share, canShare };
}
