/**
 * Haptic feedback utility using the Vibration API.
 * Falls back silently on unsupported devices.
 */

type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'error';

const patterns: Record<HapticStyle, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  selection: 5,
  success: [10, 30, 10],
  error: [30, 50, 30],
};

export function haptic(style: HapticStyle = 'light') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(patterns[style]);
    } catch {
      // Silently fail on unsupported devices
    }
  }
}
