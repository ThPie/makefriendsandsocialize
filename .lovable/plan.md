
Goal
- Fix the “blank page” when clicking the password reset link that currently lands on the vanity preview host:
  https://preview--makefriendsandsocializecom.lovable.app/auth/reset-password#access_token=...

What I believe is happening (root cause)
- You requested the reset email from the “vanity preview” site (preview--…lovable.app).
- That vanity preview host is not reliably serving your actual React app (JS + routes). So when the email link redirects there with tokens in the URL hash, the page can appear blank because the app bundle/router never loads.
- Since you said it’s “blank immediately” (no “Verifying reset link…” UI), that strongly indicates the request is landing on a host that isn’t loading your app at all (so our ResetPasswordPage code never even runs).

Fix strategy (make password reset links always open a host that serves the real app)
We’ll solve this in two layers so it’s robust:

Layer A — Frontend safety redirect (handles existing “bad” links)
1) Add a “vanity preview host → published host” redirect that runs before React renders:
   - If window.location.hostname starts with `preview--` and ends with `.lovable.app`,
     immediately `window.location.replace(...)` to the published URL, preserving:
     - pathname
     - search
     - hash (CRITICAL: contains access_token / recovery info)
2) Place this redirect in the same place you already do www→root redirect:
   - `src/main.tsx` (right next to `redirectWwwToRoot()`).
3) Implementation detail:
   - Create a helper in `src/lib/subdomain-utils.ts` (similar to `redirectWwwToRoot`) such as:
     - `redirectVanityPreviewToPublished(): boolean`
   - Hardcode the published base for now:
     - `https://makefriendsandsocializecom.lovable.app`
   - Ensure no redirect loop if you’re already on the published host.

Layer B — Ensure new reset emails never generate preview-- links
4) Update `getPasswordResetRedirectTo()` in `src/pages/ForgotPasswordPage.tsx` to be stricter and more deterministic:
   - Right now it checks `origin.includes('preview--')`, which is a bit broad and can behave unexpectedly across different Lovable hosts.
   - We’ll switch to hostname-based checks:
     - `hostname.startsWith('preview--')` → use published
     - (optionally) `hostname.startsWith('id-preview--')` → use published as well (since you want stability during reset)
   - Result: whenever you request a reset email from any preview host, the email will point to the published reset route.

Layer C — Backend authentication URL allowlist (prevents the system from favoring preview--)
5) In Lovable Cloud backend settings (you’ll do this step in the UI):
   - Confirm the “Site URL” is set to the published URL while your custom domain is not connected:
     - `https://makefriendsandsocializecom.lovable.app`
   - Add allowed redirect URLs for:
     - `https://makefriendsandsocializecom.lovable.app/auth/reset-password`
     - (and keep your auth callback URLs you use for login)
   - Optional but recommended: remove/avoid using the vanity preview host (`https://preview--makefriendsandsocializecom.lovable.app`) in redirect allowlists, since it’s the one causing the blank page.

Files we will change (in implementation mode)
- `src/lib/subdomain-utils.ts`
  - Add `redirectVanityPreviewToPublished()` (modeled after `redirectWwwToRoot()`).
- `src/main.tsx`
  - Call `redirectVanityPreviewToPublished()` before app initialization and stop execution if redirecting (same pattern as existing redirect).
- `src/pages/ForgotPasswordPage.tsx`
  - Tighten redirect URL logic to avoid generating preview-- links.

How we’ll verify (step-by-step)
1) After changes, open the published site:
   - https://makefriendsandsocializecom.lovable.app/auth/forgot-password
2) Request a NEW password reset email for pngalamulume46@gmail.com.
3) Click the link in the NEW email:
   - Expected: it should end up on the published domain (or if it starts on preview--, it should instantly redirect to published while keeping the #access_token hash).
4) You should see the “Verifying reset link…” screen (not a blank page), then the “Set New Password” form.
5) Set a new password and confirm you land in `/portal`.

Edge cases covered
- Even if an email link still points to preview--, Layer A will bounce it to the published host while preserving tokens.
- If you accidentally request reset from preview-- again, Layer B ensures the email redirects to the published host anyway.

Notes / constraints
- This fix is necessary because the vanity preview host is not guaranteed to serve the live app bundle/routes.
- Once your custom domain is connected, we can switch the “target” from the published Lovable URL to your custom domain cleanly.

If you approve this plan, I’ll implement these changes next.