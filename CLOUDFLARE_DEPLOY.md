# Cloudflare Workers/Pages Deployment Guide

## Build Settings Configuration

In your Cloudflare Workers/Pages dashboard, you need to update the following build settings:

### Required Changes:

1. **Build Command:**
   - ❌ Current: `pnpm run build`
   - ✅ Should be: `pnpm run cf:build`

2. **Deploy Command:**
   - ❌ Current: `npx wrangler versions upload`
   - ✅ Should be: `npx wrangler pages deploy` (for Cloudflare Pages)
   - OR: `npx wrangler deploy` (for Cloudflare Workers)

### Complete Build Settings:

```
Build command: pnpm run cf:build
Deploy command: npx wrangler pages deploy
Root directory: /
Build token: [your token]
Environment variables: [configure as needed]
```

## What `cf:build` does:

The `cf:build` script runs:
1. `next build` - Builds your Next.js application
2. `next-on-pages` - Converts the Next.js build to Cloudflare Pages/Workers format

## Important Notes:

⚠️ **Node.js Dependencies**: Some dependencies like `bcrypt`, `saml2-js`, and `googleapis` may not work in Cloudflare Workers environment as they rely on Node.js APIs. You may need to:
- Use Cloudflare-compatible alternatives
- Move server-side logic to API routes that can use Node.js runtime
- Use Cloudflare Workers-specific APIs

## Environment Variables:

Make sure to set these in Cloudflare dashboard:
- `NEXT_PUBLIC_API_BASE_URL` - Your backend API URL
- Any other environment variables your app needs

