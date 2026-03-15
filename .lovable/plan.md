

## Replace Hero Video with Google Drive Hosted Video

### Approach
Use the Google Drive file as an external video source — no file uploaded to the project.

### What changes
1. **`Hero.tsx`** — Replace the local `/videos/hero-bg-new.mp4` source with the Google Drive direct-stream URL. Simplify the deferred loading logic.
2. **Delete unused video files** — Remove `public/videos/hero-bg-new.mp4`, `hero-1.mp4`, and `hero-background.mp4` to shrink the repo.
3. **Update `PortalOnboardingLayout.tsx`** — It references `/videos/hero-1.mp4`, update to use the same external URL or the poster image fallback.

### Important tradeoff
Google Drive is **not a CDN**. Potential issues:
- **Rate limiting** — If many users visit, Google may throttle or block the video.
- **No edge caching** — Unlike Vercel/CDN-hosted assets, Drive serves from one region, so users far away get slower loads.
- **Link can break** — If sharing settings change or Drive flags high traffic.

**Better alternative**: Host the video on a proper CDN like Cloudflare R2 (free egress), Bunny.net, or even a public S3 bucket. This gives you fast, reliable delivery without bloating the repo.

### Recommendation
If this is a low-traffic site or temporary solution, Google Drive works fine. For production with real users, a CDN is strongly recommended.

**To proceed**: Make the Google Drive link public ("Anyone with the link"), and I'll wire it up directly — no upload to the project.

