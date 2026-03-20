# Deep Links & Universal Links

## Overview

Deep links allow external URLs (web links, QR codes, NFC tags) to open directly inside the native MakeFriends app. If the app isn't installed, the link falls back to the website.

## Supported Link Patterns

| URL Pattern | In-App Route | Description |
|-------------|-------------|-------------|
| `/events/:id` | `/portal/events/:id` | Event detail page |
| `/profile/:id` | `/portal/network/:id` | Member profile |
| `/match/:id` | `/portal/slow-dating` | Dating match view |
| `/business/:slug` | `/business/:slug` | Business profile |
| `/journal/:slug` | `/journal/:slug` | Blog post |
| `/refer/:code` | `/join?ref=:code` | Referral signup |
| `/portal/*` | `/portal/*` | Portal pages |

## iOS: Universal Links

### 1. Apple App Site Association (AASA)

Host at `https://makefriendsandsocialize.com/.well-known/apple-app-site-association`:

```json
{
  "applinks": {
    "details": [
      {
        "appIDs": [
          "TEAMID.app.lovable.c4cc7ef9b4c34c978cd0fc758a50847e"
        ],
        "components": [
          { "/": "/events/*", "comment": "Event pages" },
          { "/": "/event/*", "comment": "Event pages (alt)" },
          { "/": "/profile/*", "comment": "Member profiles" },
          { "/": "/member/*", "comment": "Member profiles (alt)" },
          { "/": "/match/*", "comment": "Dating matches" },
          { "/": "/business/*", "comment": "Business pages" },
          { "/": "/journal/*", "comment": "Blog posts" },
          { "/": "/refer/*", "comment": "Referral links" },
          { "/": "/portal/*", "comment": "Portal pages" }
        ]
      }
    ]
  }
}
```

### 2. Xcode Configuration

1. Select app target → Signing & Capabilities
2. Add "Associated Domains"
3. Add entries:
   - `applinks:makefriendsandsocialize.com`
   - `applinks:makefriendsandsocialize.ca`
   - `applinks:slowdating.makefriendsandsocialize.com`

### 3. Entitlements File

In `ios/App/App/App.entitlements`:

```xml
<key>com.apple.developer.associated-domains</key>
<array>
  <string>applinks:makefriendsandsocialize.com</string>
  <string>applinks:makefriendsandsocialize.ca</string>
  <string>applinks:slowdating.makefriendsandsocialize.com</string>
</array>
```

## Android: App Links

### 1. Digital Asset Links

Host at `https://makefriendsandsocialize.com/.well-known/assetlinks.json`:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "app.lovable.c4cc7ef9b4c34c978cd0fc758a50847e",
      "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
    }
  }
]
```

### 2. AndroidManifest.xml Intent Filters

Add inside `<activity>` in `android/app/src/main/AndroidManifest.xml`:

```xml
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="https"
        android:host="makefriendsandsocialize.com"
        android:pathPrefix="/events" />
  <data android:pathPrefix="/profile" />
  <data android:pathPrefix="/match" />
  <data android:pathPrefix="/business" />
  <data android:pathPrefix="/journal" />
  <data android:pathPrefix="/refer" />
  <data android:pathPrefix="/portal" />
</intent-filter>
```

## Custom URL Scheme (Fallback)

For cases where universal/app links aren't available (e.g., other apps linking directly):

- **iOS scheme**: `makefriends://` (configured in `capacitor.config.ts`)
- **Android scheme**: `makefriends://`

Example: `makefriends://events/abc-123`

## QR Code Deep Links

Use the `DeepLinkQR` component to generate scannable QR codes:

```tsx
import { DeepLinkQR } from '@/components/native/DeepLinkQR';

<DeepLinkQR
  path={`/events/${event.id}`}
  title={event.title}
  description="Scan to view this event in MakeFriends"
/>
```

## TypeScript Integration

```tsx
import { useDeepLinks } from '@/hooks/useDeepLinks';

// In your App component (inside Router)
function AppContent() {
  useDeepLinks(); // Automatically handles incoming links
  return <Routes>...</Routes>;
}
```

## Testing Deep Links

### iOS Simulator
```bash
xcrun simctl openurl booted "https://makefriendsandsocialize.com/events/test-id"
```

### Android Emulator
```bash
adb shell am start -a android.intent.action.VIEW -d "https://makefriendsandsocialize.com/events/test-id"
```

### Custom Scheme
```bash
# iOS
xcrun simctl openurl booted "makefriends://events/test-id"

# Android
adb shell am start -a android.intent.action.VIEW -d "makefriends://events/test-id"
```
