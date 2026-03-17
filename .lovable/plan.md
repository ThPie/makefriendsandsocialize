

# Fix Plan: 3 Pre-Deployment Issues

## Fix 1: Secure Exposed OpenRouter API Key

**Problem:** `VITE_OPENROUTER_API_KEY` in `.env` is bundled into client-side JS, exposing the secret key to anyone viewing page source. Only `VoiceBioRecorder.tsx` uses it (via `src/lib/ai.ts`).

**Solution:** The `enhance-bio` edge function already exists and does the same thing (polishes bios via Lovable AI gateway). We will refactor `VoiceBioRecorder` to call `enhance-bio` instead of calling OpenRouter directly from the browser. Then remove `src/lib/ai.ts`, the `VITE_OPENROUTER_API_KEY` from `.env`, and the `ai`/`@ai-sdk/openai` client-side dependencies.

**Changes:**
1. **`src/components/dating/VoiceBioRecorder.tsx`** -- Replace `generateText` + `getModel` with `supabase.functions.invoke('enhance-bio', { body: { bio, firstName } })`. Parse `enhancedBio` from response.
2. **Delete `src/lib/ai.ts`** -- No longer needed (only consumer was VoiceBioRecorder).
3. **`.env`** -- Remove `VITE_OPENROUTER_API_KEY` line (cannot edit .env directly, but removing all references to it eliminates the exposure).
4. **`scripts/`** -- The 3 scripts (`test-ai.ts`, `assess-codebase.ts`, `analyze-design.ts`) reference OpenRouter but are dev-only scripts, not bundled. Leave as-is since they read from `process.env`, not `import.meta.env`.

## Fix 2: Debug & Fix detect-location Edge Function

**Problem:** The function uses `ipapi.co` which has rate limits (free tier: ~1000/day) and may reject requests from edge function IPs. The function also requires JWT (`verify_jwt = true`), which means unauthenticated users can't use it -- but the geo-redirect hook runs on the homepage for all visitors.

**Solution:**
1. **Change `verify_jwt` to `false`** in `config.toml` for `detect-location` -- the geo-redirect banner runs for unauthenticated visitors on the homepage.
2. **Add a fallback geo API** -- If `ipapi.co` fails or rate-limits, fall back to `ip-api.com` (HTTP only but works from server-side edge functions). This provides resilience.
3. **Add proper error handling** for rate-limit responses from ipapi.co (HTTP 429).

**Changes:**
1. **`supabase/config.toml`** -- Set `verify_jwt = false` for `detect-location`.
2. **`supabase/functions/detect-location/index.ts`** -- Add fallback to `http://ip-api.com/json/{ip}?fields=country,regionName,city,proxy,hosting` when ipapi.co fails. Add 429 handling.

## Fix 4: Update VITE_SITE_URL

**Problem:** `VITE_SITE_URL` is set to `http://localhost:5173` but since `.env` is auto-managed and cannot be edited, and the only consumer is `src/lib/ai.ts` (which we're deleting in Fix 1), this issue resolves itself.

The scripts in `scripts/` use `process.env.VITE_SITE_URL` but those are dev-only. No action needed beyond Fix 1.

---

**Summary of file changes:**
- Edit `VoiceBioRecorder.tsx` to use `enhance-bio` edge function
- Delete `src/lib/ai.ts`
- Edit `supabase/functions/detect-location/index.ts` with fallback API + better error handling
- Update `supabase/config.toml` to set `verify_jwt = false` for detect-location

