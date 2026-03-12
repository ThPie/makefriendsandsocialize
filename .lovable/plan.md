

## Update Eventbrite API Key

### Current Problem
The `EVENTBRITE_API_KEY` secret exists but contains the wrong value — logs show it's using an 18-character API Key starting with `624U`, not your Private Token (`NGYU...`).

### Plan
1. **Update the `EVENTBRITE_API_KEY` secret** with your Private Token value `NGYUSFDHUGXM7LQ6CKNH`
2. **Test the `sync-eventbrite-events` function** to verify the 401 error is resolved
3. If successful, **run `sync-all-events`** for a full cross-platform sync

### Important Note
If the 401 error persists even with this token, it likely means the token itself is invalid on Eventbrite's side (typical Eventbrite private tokens are 50+ characters). In that case, you may need to regenerate a new API app on Eventbrite.

