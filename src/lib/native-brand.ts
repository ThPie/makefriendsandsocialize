/**
 * Splash screen and app icon configuration guide.
 * 
 * This module exports brand constants used by the native splash screen
 * and provides helper functions for generating adaptive icon layers.
 */

/** Brand color palette for native assets */
export const NATIVE_BRAND = {
  /** Primary background color for splash screen */
  splashBackground: '#1a1a1a',
  /** Status bar color (matches splash) */
  statusBarColor: '#1a1a1a',
  /** Primary accent used in notification icons */
  accentColor: '#6366f1',
  /** App name as displayed on home screen */
  displayName: 'MakeFriends',
} as const;

/**
 * Asset file paths relative to the `resources/` directory.
 * 
 * To generate all platform icons and splash screens:
 * 1. Place source files at these paths
 * 2. Run: npx @capacitor/assets generate
 * 
 * Icon requirements:
 * - 1024×1024 PNG, no transparency (iOS), PNG with transparency OK (Android)
 * - Keep important content in center 60% for adaptive icon safe zone
 * 
 * Splash screen:
 * - 2732×2732 PNG
 * - Dark background (#1a1a1a) with centered logo
 * - Logo should be max 800×800px centered
 */
export const ASSET_PATHS = {
  icon: 'resources/icon.png',
  iconForeground: 'resources/icon-foreground.png',
  iconBackground: 'resources/icon-background.png',
  splash: 'resources/splash.png',
  splashDark: 'resources/splash-dark.png',
} as const;

/**
 * iOS Info.plist privacy usage descriptions.
 * These must be added to ios/App/App/Info.plist for App Store approval.
 */
export const IOS_USAGE_DESCRIPTIONS = {
  NSCameraUsageDescription: 'MakeFriends needs camera access for your profile photo',
  NSMicrophoneUsageDescription: 'MakeFriends uses the microphone to record voice notes',
  NSLocationWhenInUseUsageDescription: 'MakeFriends uses your location to find nearby events',
  NSContactsUsageDescription: 'MakeFriends can help you find friends already on the app',
  NSPhotoLibraryUsageDescription: 'MakeFriends needs photo library access to select your profile photo',
  NSFaceIDUsageDescription: 'Use Face ID to quickly and securely unlock MakeFriends',
} as const;
