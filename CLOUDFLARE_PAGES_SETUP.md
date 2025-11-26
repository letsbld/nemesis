# Switch to Cloudflare Pages (Recommended)

## The Issue

The error `Cannot read properties of undefined (reading 'fetch')` is happening because:
1. `@cloudflare/next-on-pages` is deprecated
2. Next.js 14/15 has compatibility issues with the current adapter
3. Cloudflare Workers requires more configuration than Cloudflare Pages

## Solution: Use Cloudflare Pages Instead

Cloudflare Pages has **native Next.js support** and is much easier to configure.

### Steps to Switch:

1. **In Cloudflare Dashboard:**
   - Go to **Workers & Pages**
   - Create a new **Pages** project (not Worker)
   - Connect your GitHub repository
   - Select the `cloudflare` branch

2. **Build Settings for Cloudflare Pages:**
   ```
   Framework preset: Next.js (Static HTML Export)
   Build command: pnpm run build
   Build output directory: .next
   ```

   OR use the Next.js adapter:
   ```
   Framework preset: Next.js
   Build command: pnpm run cf:build
   Build output directory: .vercel/output
   ```

3. **Environment Variables:**
   - Set `NEXT_PUBLIC_API_BASE_URL` in Pages settings
   - Same as before

### Why Pages Instead of Workers?

- ✅ Native Next.js support
- ✅ Automatic framework detection
- ✅ Better compatibility
- ✅ Easier configuration
- ✅ No worker entry point issues

### Alternative: Keep Workers but Fix the Issue

If you must use Workers, the issue is likely in the worker entry point. The generated worker might not be receiving the `env` parameter correctly.

