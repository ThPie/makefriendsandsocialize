/**
 * Haptic feedback utility using the Vibration API.
 * Falls back silently on unsupported devices.
 */

type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection';

const patterns: Record<HapticStyle, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  selection: 5,
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
