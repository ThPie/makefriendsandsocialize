# App Clips (iOS) & Instant Apps (Android)

Lightweight app experiences that let users preview MakeFriends without installing the full app.

## Use Cases

1. **Event Preview** — Scan a QR code at a venue to see event details and RSVP
2. **Profile Card** — Share a link that opens a mini profile view
3. **Referral Landing** — Tap a referral link to see what MakeFriends offers

## Architecture

```
User taps link / scans QR
        │
        ▼
┌──────────────────┐
│  App Clip (iOS)  │  ← 15 MB limit, no push, limited storage
│  Instant App     │  ← 15 MB limit, similar restrictions
│  (Android)       │
└───────┬──────────┘
        │ useAppClips() detects clip mode
        ▼
┌──────────────────┐
│  Minimal UI      │  ← Event preview, RSVP, profile card
│  (React views)   │
└───────┬──────────┘
        │ User interested?
        ▼
┌──────────────────┐
│  Full App Install│  ← promptFullAppInstall()
│  Prompt (native) │
└──────────────────┘
```

## iOS App Clip Setup

### 1. Create App Clip Target

In Xcode: File → New → Target → App Clip

- Bundle ID: `app.lovable.c4cc7ef9b4c34c978cd0fc758a50847e.Clip`
- Associated Domains: `appclips:makefriends.app`

### 2. Capacitor Plugin (`AppClipsPlugin.swift`)

```swift
import Capacitor

@objc(AppClipsPlugin)
public class AppClipsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AppClipsPlugin"
    public let jsName = "AppClips"
    
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAppClip", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getInvocationURL", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "promptFullAppInstall", returnType: CAPPluginReturnPromise),
    ]
    
    @objc func isAppClip(_ call: CAPPluginCall) {
        #if APPCLIP
        call.resolve(["isClip": true])
        #else
        call.resolve(["isClip": false])
        #endif
    }
    
    @objc func getInvocationURL(_ call: CAPPluginCall) {
        let url = UserDefaults.standard.string(forKey: "appClipInvocationURL")
        call.resolve(["url": url ?? ""])
    }
    
    @objc func promptFullAppInstall(_ call: CAPPluginCall) {
        guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene else {
            call.reject("No scene available")
            return
        }
        let config = SKOverlay.AppClipConfiguration(position: .bottom)
        let overlay = SKOverlay(configuration: config)
        overlay.present(in: scene)
        call.resolve()
    }
}
```

### 3. Associated Domains

Add to your `apple-app-site-association` file:

```json
{
  "appclips": {
    "apps": ["TEAMID.app.lovable.c4cc7ef9b4c34c978cd0fc758a50847e.Clip"]
  }
}
```

## Android Instant App Setup

### 1. Enable in `build.gradle`

```gradle
android {
    dynamicFeatures = [':instant']
}
```

### 2. Digital Asset Links

Host at `https://makefriends.app/.well-known/assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "app.lovable.c4cc7ef9b4c34c978cd0fc758a50847e",
    "sha256_cert_fingerprints": ["YOUR_CERT_FINGERPRINT"]
  }
}]
```

## TypeScript Usage

```typescript
import { useAppClips } from '@/hooks/useAppClips';

function EventPreview() {
  const { checkIsAppClip, getInvocationURL, promptInstallFullApp } = useAppClips();

  useEffect(() => {
    async function init() {
      const isClip = await checkIsAppClip();
      if (isClip) {
        const url = await getInvocationURL();
        // Parse event ID from URL, show minimal event UI
      }
    }
    init();
  }, []);

  return (
    <button onClick={promptInstallFullApp}>
      Get the full MakeFriends experience
    </button>
  );
}
```
