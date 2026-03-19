import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Haptic feedback engine for native platforms.
 * Falls back to Vibration API on web, silently no-ops if unsupported.
 */

type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'error';

const vibrationPatterns: Record<HapticStyle, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  selection: 5,
  success: [10, 30, 10],
  error: [30, 50, 30],
};

const isNative = () => Capacitor.isNativePlatform();

/** Legacy web-based haptic (kept for backward compatibility) */
export function haptic(style: HapticStyle = 'light') {
  if (isNative()) {
    // Use native haptics
    switch (style) {
      case 'light': hapticLight(); break;
      case 'medium': hapticMedium(); break;
      case 'heavy': hapticHeavy(); break;
      case 'selection': hapticSelection(); break;
      case 'success': hapticSuccess(); break;
      case 'error': hapticError(); break;
    }
    return;
  }
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(vibrationPatterns[style]);
    } catch {}
  }
}

/** Light tap — button presses, toggles, selection changes */
export async function hapticLight() {
  if (!isNative()) return;
  try { await Haptics.impact({ style: ImpactStyle.Light }); } catch {}
}

/** Medium tap — card swipes, confirming actions, navigation */
export async function hapticMedium() {
  if (!isNative()) return;
  try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch {}
}

/** Heavy tap — important actions like RSVP confirm, match reveal */
export async function hapticHeavy() {
  if (!isNative()) return;
  try { await Haptics.impact({ style: ImpactStyle.Heavy }); } catch {}
}

/** Success pattern */
export async function hapticSuccess() {
  if (!isNative()) return;
  try { await Haptics.notification({ type: NotificationType.Success }); } catch {}
}

/** Warning pattern */
export async function hapticWarning() {
  if (!isNative()) return;
  try { await Haptics.notification({ type: NotificationType.Warning }); } catch {}
}

/** Error pattern */
export async function hapticError() {
  if (!isNative()) return;
  try { await Haptics.notification({ type: NotificationType.Error }); } catch {}
}

/** Selection tick */
export async function hapticSelection() {
  if (!isNative()) return;
  try {
    await Haptics.selectionStart();
    await Haptics.selectionChanged();
    await Haptics.selectionEnd();
  } catch {}
}

/**
 * Semantic haptic patterns mapped to app actions.
 */
export const haptics = {
  // Navigation & UI
  tabSwitch: hapticLight,
  buttonPress: hapticLight,
  toggleSwitch: hapticLight,
  drawerOpen: hapticMedium,
  pullToRefresh: hapticMedium,

  // Events
  rsvpConfirm: hapticSuccess,
  rsvpCancel: hapticWarning,
  addToCalendar: hapticSuccess,

  // Dating
  matchReveal: hapticHeavy,
  matchAccepted: hapticSuccess,
  matchDeclined: hapticWarning,
  dateProposed: hapticSuccess,
  swipeCard: hapticMedium,

  // Social
  connectionSent: hapticSuccess,
  connectionAccepted: hapticSuccess,

  // Errors
  validationError: hapticError,
  actionFailed: hapticError,
  permissionDenied: hapticError,

  // General
  save: hapticSuccess,
  delete: hapticWarning,
  share: hapticLight,
} as const;
