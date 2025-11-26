# Troubleshooting Internal Server Error on Cloudflare Workers

## Quick Fix Checklist

### 1. ✅ Set Environment Variables (MOST COMMON ISSUE)

**This is the #1 cause of Internal Server Error!**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **dlpfrontend**
3. Click **Settings** tab
4. Scroll to **Environment Variables**
5. Add these variables:

   **Required:**
   - `NEXT_PUBLIC_API_BASE_URL` = Your backend API URL (e.g., `https://api.yourdomain.com`)
     - ⚠️ Do NOT include `/api` at the end
     - ⚠️ Must be accessible from Cloudflare Workers (public URL, not localhost)

   **Optional:**
   - `NEXT_PUBLIC_PASS_API_BASE_URL` = Password manager API URL (if separate)

6. **IMPORTANT:** After adding variables, you MUST redeploy:
   - Go to **Deployments** tab
   - Click **Retry deployment** or trigger a new deployment

### 2. ✅ Check Cloudflare Worker Logs

1. Go to Cloudflare Dashboard → **Workers & Pages** → **dlpfrontend**
2. Click **Logs** tab (or **Real-time Logs**)
3. Look for error messages that show what's failing
4. Common errors:
   - `NEXT_PUBLIC_API_BASE_URL is not defined`
   - `Network error` or `Failed to fetch`
   - `CORS error`

### 3. ✅ Check Browser Console

1. Open your deployed URL: `https://dlpfrontend.sandeepsandy731-9f0.workers.dev`
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Look for JavaScript errors
5. Go to **Network** tab to see if API calls are failing

### 4. ✅ Verify Backend API is Accessible

Your backend API must be:
- ✅ Publicly accessible (not `localhost` or `127.0.0.1`)
- ✅ Allowing requests from Cloudflare Workers
- ✅ CORS configured to allow your Cloudflare domain
- ✅ Running and responding to requests

**Test your API:**
```bash
curl https://your-api-url.com/api/health
# or
curl https://your-api-url.com/api/user
```

### 5. ✅ Check CORS Configuration

Your backend must allow requests from:
- `https://dlpfrontend.sandeepsandy731-9f0.workers.dev`
- Or use `*` for development (not recommended for production)

**Example CORS headers your backend should return:**
```
Access-Control-Allow-Origin: https://dlpfrontend.sandeepsandy731-9f0.workers.dev
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### 6. ✅ Verify Worker Configuration

Check that `wrangler.toml` is correct:
- `main` points to the correct worker file
- `bucket` points to the correct static assets directory

## Common Error Messages and Solutions

### "Network error" or "Failed to fetch"
- **Cause:** Backend API is not accessible or CORS issue
- **Solution:** 
  - Verify API URL is correct and publicly accessible
  - Check CORS configuration on backend
  - Test API with curl or Postman

### "NEXT_PUBLIC_API_BASE_URL is undefined"
- **Cause:** Environment variable not set
- **Solution:** Set the environment variable in Cloudflare Dashboard and redeploy

### "Internal Server Error" with no details
- **Cause:** Server-side code is failing
- **Solution:**
  - Check Cloudflare Worker logs
  - Check browser console for client-side errors
  - Verify all environment variables are set

## Still Not Working?

1. **Check Worker Logs:** Cloudflare Dashboard → Workers & Pages → dlpfrontend → Logs
2. **Check Build Logs:** Look at the deployment logs for any warnings
3. **Test Locally:** Try running `pnpm run cf:build` locally to see if there are build issues
4. **Verify Environment Variables:** Double-check they're set correctly in Cloudflare Dashboard

## Need More Help?

- Check Cloudflare Worker logs for detailed error messages
- Review the deployment logs in Cloudflare Dashboard
- Check browser console (F12) for client-side errors
- Verify your backend API is running and accessible

