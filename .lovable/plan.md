

## Eventbrite API Authentication Issue

### Problem
The Private Token (`NGYUSFDHUGXM7LQ6CKNH`) is being rejected by Eventbrite with `INVALID_AUTH`. I just re-tested it and confirmed the 401 persists. This is **not** a secret-storage issue — the token itself is not being accepted by Eventbrite's API.

### Why This Is Happening
Eventbrite private tokens are typically **50+ characters long**. The token you shared is only 20 characters, which suggests one of:
1. **The Eventbrite app hasn't been fully activated** — sometimes new apps need approval or the token isn't ready yet
2. **The token was regenerated** and the old one shown on the page is stale (page needs a refresh)
3. **The app was created on a different Eventbrite account** than the one that owns the organizer page (Make Friends & Socialize)

### What To Try

1. **Go to [eventbrite.com/platform/api-keys](https://www.eventbrite.com/platform/api-keys)** while logged into the **same Eventbrite account** that manages "Make Friends & Socialize" events
2. **Refresh the page** and re-copy the Private Token — make sure it's the full string
3. If the token is still 20 characters, try clicking into the app details and look for a longer "Your personal OAuth token" value
4. If you see a "Get a free API Key" button instead of an existing app, the account may not have an API app yet — create one and use the generated private token

### Plan Once We Have a Valid Token
1. Update the `EVENTBRITE_API_KEY` secret with the correct long-form token
2. Test `sync-eventbrite-events` to confirm it fetches events
3. Run `sync-all-events` to do a full cross-platform sync

