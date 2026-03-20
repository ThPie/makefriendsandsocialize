# Native App Launch Checklist

Complete guide for preparing the MakeFriends native app for App Store and Google Play submission.

## Phase Summary

| Phase | Features | Status |
|-------|----------|--------|
| 5A | Haptic feedback, app review prompts, IAP framework | ✅ |
| 5B | Offline cache, network status, auto-sync | ✅ |
| 5C | Live Activities, Home Screen Widgets, widget-data API | ✅ |
| 5D | Voice note recording/playback, App Clips/Instant Apps | ✅ |
| 6 | Deep links, onboarding, update checker, launch prep | ✅ |

## Pre-Submission Checklist

### Code & Build

- [ ] Remove hot-reload `server` block from `capacitor.config.ts`
- [ ] Run `npm run build && npx cap sync`
- [ ] Verify no console.log statements in production paths
- [ ] Confirm all edge functions are deployed
- [ ] Run `npx tsc --noEmit` — zero errors

### Native Configuration

- [ ] **App Icon**: Place 1024×1024 `resources/icon.png`, run `npx @capacitor/assets generate`
- [ ] **Splash Screen**: Place 2732×2732 `resources/splash.png` (dark bg, centered logo)
- [ ] **Bundle ID**: `app.lovable.c4cc7ef9b4c34c978cd0fc758a50847e`
- [ ] **Display Name**: "MakeFriends"
- [ ] **Version**: Set in Xcode / build.gradle (match `useAppUpdate.ts` CURRENT_VERSION)

### iOS Specific

- [ ] Set Apple Team ID in Xcode Signing & Capabilities
- [ ] Add Associated Domains: `applinks:makefriendsandsocialize.com`
- [ ] Add App Groups: `group.app.lovable.makefriends` (for widgets)
- [ ] Configure Push Notification capability
- [ ] Add Camera, Microphone, Location, Contacts usage descriptions in Info.plist:
  - `NSCameraUsageDescription`: "MakeFriends needs camera access for your profile photo"
  - `NSMicrophoneUsageDescription`: "MakeFriends uses the microphone to record voice notes"
  - `NSLocationWhenInUseUsageDescription`: "MakeFriends uses your location to find nearby events"
  - `NSContactsUsageDescription`: "MakeFriends can help you find friends already on the app"
- [ ] Register native plugins in `AppDelegate.swift` (see docs/NATIVE_WIDGETS.md)
- [ ] Host AASA file at `makefriendsandsocialize.com/.well-known/apple-app-site-association`
- [ ] Configure App Clip target (optional — see docs/APP_CLIPS.md)
- [ ] Create App Store Connect listing with screenshots

### Android Specific

- [ ] Generate signed keystore for release builds
- [ ] Add intent filters for deep links in AndroidManifest.xml (see docs/DEEP_LINKS.md)
- [ ] Host assetlinks.json at `makefriendsandsocialize.com/.well-known/assetlinks.json`
- [ ] Configure notification icon: `android/app/src/main/res/drawable/ic_stat_icon.png`
- [ ] Add permissions in AndroidManifest.xml:
  - `android.permission.CAMERA`
  - `android.permission.RECORD_AUDIO`
  - `android.permission.ACCESS_FINE_LOCATION`
  - `android.permission.READ_CONTACTS`
  - `android.permission.POST_NOTIFICATIONS` (API 33+)
  - `android.permission.VIBRATE`
- [ ] Create Google Play Console listing with screenshots

### Deep Links & Universal Links

- [ ] AASA file hosted and accessible (iOS)
- [ ] assetlinks.json hosted and accessible (Android)
- [ ] Test all link patterns from docs/DEEP_LINKS.md
- [ ] QR code generator working (`DeepLinkQR` component)
- [ ] Custom scheme `makefriends://` working

### Native Features Verification

- [ ] **Haptics**: Confirm vibration on RSVP, match reveal, errors
- [ ] **Push Notifications**: Receive test notification on device
- [ ] **Offline Mode**: Disconnect WiFi, verify cached data shows
- [ ] **Biometric Lock**: Enable and test Face ID / fingerprint
- [ ] **Voice Notes**: Record, upload, playback works
- [ ] **Camera**: Profile photo capture works
- [ ] **Geolocation**: Nearby events detection works
- [ ] **Share Sheet**: Share event/profile works
- [ ] **Calendar Integration**: .ics download works
- [ ] **App Review Prompt**: Triggers after engagement threshold
- [ ] **Pull-to-refresh**: Works on scrollable pages

### Capacitor Plugins Installed

| Plugin | Purpose |
|--------|---------|
| `@capacitor/core` | Core runtime |
| `@capacitor/app` | App state, deep links, versioning |
| `@capacitor/camera` | Profile photos |
| `@capacitor/geolocation` | Nearby events |
| `@capacitor/haptics` | Touch feedback |
| `@capacitor/push-notifications` | Push notifications |
| `@capacitor/share` | Native share sheet |
| `@capacitor-community/contacts` | Contact matching |
| `@capacitor-community/in-app-review` | App Store reviews |
| `capacitor-native-biometric` | Biometric authentication |

### App Store Assets Needed

#### iOS (App Store Connect)
- [ ] Screenshots: 6.7" (1290×2796), 6.5" (1284×2778), 5.5" (1242×2208)
- [ ] iPad screenshots (if supporting): 12.9" (2048×2732)
- [ ] App Preview videos (optional, up to 30 seconds)
- [ ] App description (4000 chars max)
- [ ] Keywords (100 chars max)
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Category: Social Networking
- [ ] Age rating questionnaire completed

#### Android (Google Play Console)
- [ ] Screenshots: Phone (min 2, 320-3840px), Tablet (optional)
- [ ] Feature graphic: 1024×500
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)
- [ ] Privacy policy URL
- [ ] Category: Social
- [ ] Content rating questionnaire completed
- [ ] Data safety form completed

## Build Commands

```bash
# Development (hot-reload)
npx cap run ios
npx cap run android

# Production build
npm run build
npx cap sync
npx cap open ios     # Archive in Xcode
npx cap open android # Build signed APK/AAB in Android Studio

# Generate app icons & splash screens
npx @capacitor/assets generate

# After pulling code changes
npm install && npx cap sync
```

## Post-Launch Monitoring

- [ ] Sentry error tracking active
- [ ] Analytics events flowing
- [ ] Push notification delivery rates monitored
- [ ] App Store / Play Store crash reports reviewed
- [ ] User reviews monitored and responded to
