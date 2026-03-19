# Native Widgets & Live Activities Setup

This guide covers how to implement iOS Widgets (WidgetKit) and Live Activities (ActivityKit) for the MakeFriends app.

## Prerequisites

- Xcode 15+
- iOS 16.1+ target for Live Activities
- iOS 17+ target for Interactive Widgets
- App Group configured (e.g., `group.app.lovable.makefriends`)

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Capacitor App   │────▶│  Native Plugin    │────▶│   Shared Data    │
│  (TypeScript)    │     │  (Swift/Kotlin)   │     │  (App Groups)    │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                           │
                                                  ┌────────▼────────┐
                                                  │  WidgetKit /     │
                                                  │  Live Activities │
                                                  └─────────────────┘
```

The TypeScript hooks (`useHomeWidgets`, `useLiveActivities`) write data via Capacitor plugins. The native widgets read from shared storage (App Groups on iOS).

## Data Endpoint

The `widget-data` edge function provides a lightweight API for widgets to fetch fresh data during background refreshes:

```
POST /functions/v1/widget-data
Authorization: Bearer <user_token>

Response: {
  nextEvent: { title, date, time, venue, daysUntil },
  upcomingEvents: [{ title, date }],
  unreadCount: number,
  dailyQuote: string | null,
  firstName: string | null
}
```

## iOS Implementation

### 1. Create App Group

1. In Xcode, select your app target → Signing & Capabilities
2. Add "App Groups" capability
3. Create group: `group.app.lovable.makefriends`
4. Add the same group to your Widget Extension target

### 2. Capacitor Plugin (Swift)

Create `ios/App/App/Plugins/AppWidgetsPlugin.swift`:

```swift
import Capacitor
import WidgetKit

@objc(AppWidgetsPlugin)
public class AppWidgetsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AppWidgetsPlugin"
    public let jsName = "AppWidgets"
    
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "updateWidgetData", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "reloadAllWidgets", returnType: CAPPluginReturnPromise),
    ]
    
    @objc func updateWidgetData(_ call: CAPPluginCall) {
        guard let data = call.getString("data") else {
            call.reject("Missing data")
            return
        }
        
        let defaults = UserDefaults(suiteName: "group.app.lovable.makefriends")
        defaults?.set(data, forKey: "widgetData")
        defaults?.synchronize()
        
        call.resolve()
    }
    
    @objc func reloadAllWidgets(_ call: CAPPluginCall) {
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }
        call.resolve()
    }
}
```

### 3. Widget Extension

Create a new Widget Extension target in Xcode:
- File → New → Target → Widget Extension
- Name: `MakeFriendsWidget`
- Include Live Activity: ✅

#### Next Event Widget (`NextEventWidget.swift`):

```swift
import WidgetKit
import SwiftUI

struct WidgetData: Codable {
    let nextEvent: NextEvent?
    let unreadCount: Int
    let dailyQuote: String?
    let memberSince: String?
    
    struct NextEvent: Codable {
        let title: String
        let date: String
        let time: String?
        let daysUntil: Int
    }
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), data: nil)
    }
    
    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> Void) {
        let entry = SimpleEntry(date: Date(), data: loadData())
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> Void) {
        let entry = SimpleEntry(date: Date(), data: loadData())
        // Refresh every 30 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func loadData() -> WidgetData? {
        let defaults = UserDefaults(suiteName: "group.app.lovable.makefriends")
        guard let jsonString = defaults?.string(forKey: "widgetData"),
              let data = jsonString.data(using: .utf8) else { return nil }
        return try? JSONDecoder().decode(WidgetData.self, from: data)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let data: WidgetData?
}

struct NextEventWidgetView: View {
    var entry: Provider.Entry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            if let event = entry.data?.nextEvent {
                Text("NEXT EVENT")
                    .font(.caption2)
                    .foregroundColor(.secondary)
                Text(event.title)
                    .font(.headline)
                    .lineLimit(2)
                HStack {
                    Image(systemName: "calendar")
                    Text(event.daysUntil == 0 ? "Today!" : 
                         event.daysUntil == 1 ? "Tomorrow" : 
                         "In \(event.daysUntil) days")
                        .font(.caption)
                }
                .foregroundColor(.accentColor)
            } else {
                Text("MakeFriends")
                    .font(.headline)
                Text("No upcoming events")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
    }
}

@main
struct MakeFriendsWidget: Widget {
    let kind: String = "MakeFriendsWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            NextEventWidgetView(entry: entry)
        }
        .configurationDisplayName("Next Event")
        .description("See your upcoming MakeFriends events.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
```

### 4. Live Activities (`EventLiveActivity.swift`)

```swift
import ActivityKit
import SwiftUI

struct EventAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var status: String // "upcoming", "live", "ended"
        var attendeeCount: Int
    }
    
    var eventId: String
    var title: String
    var date: String
    var time: String?
    var venue: String?
}

struct EventLiveActivityView: View {
    let context: ActivityViewContext<EventAttributes>
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(context.attributes.title)
                    .font(.headline)
                if let venue = context.attributes.venue {
                    Text(venue)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            Spacer()
            VStack {
                Image(systemName: context.state.status == "live" ? "circle.fill" : "clock")
                    .foregroundColor(context.state.status == "live" ? .green : .orange)
                Text(context.state.status == "live" ? "LIVE" : "Soon")
                    .font(.caption2)
                    .bold()
            }
        }
        .padding()
    }
}
```

### 5. Register Plugin

In `ios/App/App/AppDelegate.swift`, register the plugin:

```swift
// In application(_:didFinishLaunchingWithOptions:)
bridge?.registerPluginInstance(AppWidgetsPlugin())
bridge?.registerPluginInstance(LiveActivitiesPlugin())
```

## Android Implementation

### Home Screen Widgets (Jetpack Glance)

Android widgets use Jetpack Glance (or traditional RemoteViews). The data is shared via SharedPreferences.

Create `android/app/src/main/java/.../AppWidgetsPlugin.java`:

```java
@CapacitorPlugin(name = "AppWidgets")
public class AppWidgetsPlugin extends Plugin {
    @PluginMethod
    public void updateWidgetData(PluginCall call) {
        String data = call.getString("data");
        SharedPreferences prefs = getContext()
            .getSharedPreferences("widget_data", Context.MODE_PRIVATE);
        prefs.edit().putString("widgetData", data).apply();
        call.resolve();
    }
    
    @PluginMethod
    public void reloadAllWidgets(PluginCall call) {
        // Trigger widget update
        Intent intent = new Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        getContext().sendBroadcast(intent);
        call.resolve();
    }
}
```

## Usage from TypeScript

```typescript
// Refresh widgets after key actions
const { refreshWidgets } = useHomeWidgets();
await refreshWidgets(); // After RSVP, login, new notification

// Start a Live Activity for an event countdown
const { startEventCountdown } = useLiveActivities();
const activityId = await startEventCountdown(event);

// Start a match decision timer on lock screen
const { startMatchTimer } = useLiveActivities();
await startMatchTimer(matchId, 'Sarah', '2024-01-15T18:00:00Z');
```
