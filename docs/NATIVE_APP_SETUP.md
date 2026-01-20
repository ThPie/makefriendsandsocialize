# Native Mobile App Setup Guide

This guide explains how to build and run the MakeFriends native mobile app using Capacitor.

## Prerequisites

### For iOS Development
- Mac with macOS 12+ (Monterey or later)
- Xcode 15+ installed from the App Store
- Xcode Command Line Tools: `xcode-select --install`
- CocoaPods: `sudo gem install cocoapods`

### For Android Development  
- Android Studio (latest stable version)
- Android SDK with API level 22+ (Android 5.1+)
- Java Development Kit (JDK) 17+
- Enable USB debugging on your Android device

### General Requirements
- Node.js 18+
- Git

## Initial Setup

### 1. Clone from GitHub

First, export the project to GitHub via Lovable's "Export to GitHub" feature, then:

```bash
git clone [your-repo-url]
cd [project-name]
npm install
```

### 2. Add Native Platforms

```bash
# Add iOS platform
npx cap add ios

# Add Android platform  
npx cap add android
```

### 3. Update Native Dependencies

```bash
npx cap update ios
npx cap update android
```

### 4. Build the Web App

```bash
npm run build
```

### 5. Sync to Native Platforms

```bash
npx cap sync
```

## Running the App

### Development with Hot Reload

The `capacitor.config.ts` is pre-configured for hot-reload from the Lovable preview:

```
https://c4cc7ef9-b4c3-4c97-8cd0-fc758a50847e.lovableproject.com
```

This means changes made in Lovable will appear instantly on your device without rebuilding.

### Run on iOS

```bash
# Run on iOS simulator or connected device
npx cap run ios

# Or open in Xcode
npx cap open ios
```

### Run on Android

```bash
# Run on Android emulator or connected device
npx cap run android

# Or open in Android Studio
npx cap open android
```

## Building for Production

When ready to submit to app stores:

### 1. Remove Hot Reload Configuration

Edit `capacitor.config.ts` and comment out or remove the `server` section:

```typescript
// server: {
//   url: 'https://...',
//   cleartext: true
// },
```

### 2. Build and Sync

```bash
npm run build
npx cap sync
```

### 3. Build in Native IDEs

**iOS (Xcode):**
1. Open: `npx cap open ios`
2. Select your Team in Signing & Capabilities
3. Product → Archive
4. Distribute App → App Store Connect

**Android (Android Studio):**
1. Open: `npx cap open android`
2. Build → Generate Signed Bundle/APK
3. Follow the signing wizard

## App Icons & Splash Screens

### Icon Requirements

Place your source icon at `resources/icon.png` (1024x1024 PNG):
- No transparency for iOS
- Keep important content in center 60% (safe zone for adaptive icons)

For Android adaptive icons, also provide:
- `resources/icon-foreground.png` - Foreground layer (1024x1024)
- `resources/icon-background.png` - Background layer (1024x1024)

### Splash Screen

Place your splash screen at `resources/splash.png` (2732x2732 PNG):
- Dark background (#1a1a1a)
- Logo centered

### Generate Assets

After adding source images, run:

```bash
npx @capacitor/assets generate
```

## Troubleshooting

### iOS Builds Failing

1. Clean the build: `rm -rf ios/App/Pods ios/App/Podfile.lock`
2. Reinstall pods: `cd ios/App && pod install`
3. Sync again: `npx cap sync ios`

### Android SDK Not Found

Ensure `ANDROID_HOME` environment variable is set:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### Hot Reload Not Working

1. Ensure your device is on the same network as your computer
2. Check that the Lovable preview URL is accessible
3. Verify `server.cleartext: true` is set in `capacitor.config.ts`

## Deep Links Configuration

The app is configured to handle these URL schemes:

- **iOS**: `makefriends://` and Universal Links via `https://makefriendsandsocializecom.lovable.app`
- **Android**: `makefriends://` and App Links via `https://makefriendsandsocializecom.lovable.app`

### iOS Setup (ios/App/App/Info.plist)

Add URL scheme support for deep linking (done automatically by Capacitor).

### Android Setup (android/app/src/main/AndroidManifest.xml)

Intent filters are configured automatically for the app scheme.

## Push Notifications (Phase 3)

Push notification setup will be added in Phase 3 of the mobile app development.

## Useful Commands

```bash
# Sync web assets to native projects
npx cap sync

# Open iOS project in Xcode
npx cap open ios

# Open Android project in Android Studio  
npx cap open android

# Run on specific device
npx cap run ios --target "iPhone 15 Pro"
npx cap run android --target "Pixel_7_API_34"

# List available devices
npx cap run ios --list
npx cap run android --list
```

## Further Reading

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Building Capacitor Apps with Lovable](https://blog.lovable.dev/building-mobile-apps-with-lovable)
- [iOS App Store Submission Guide](https://developer.apple.com/app-store/submitting/)
- [Google Play Console](https://play.google.com/console)
