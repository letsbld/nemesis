# Cloudflare Workers Environment Variables Setup

## Required Environment Variables

You **MUST** set these environment variables in your Cloudflare Workers/Pages dashboard for the application to work:

### 1. `NEXT_PUBLIC_API_BASE_URL`
- **Purpose**: Base URL for your backend API
- **Example**: `https://api.yourdomain.com` or `http://localhost:5000` (for development)
- **Where to set**: Cloudflare Dashboard → Workers & Pages → Your Worker → Settings → Environment Variables
- **Important**: Do NOT include `/api` at the end - the code adds that automatically

### 2. `NEXT_PUBLIC_PASS_API_BASE_URL` (Optional)
- **Purpose**: Base URL for password manager API (if using separate service)
- **Example**: `https://password-api.yourdomain.com`
- **Where to set**: Same as above

## How to Set Environment Variables in Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages**
3. Click on your worker: **dlpfrontend**
4. Go to **Settings** tab
5. Scroll down to **Environment Variables**
6. Click **Add variable** for each variable
7. For **Production** environment:
   - Variable name: `NEXT_PUBLIC_API_BASE_URL`
   - Value: Your backend API URL (e.g., `https://api.yourdomain.com`)
8. Click **Save**

## Important Notes

⚠️ **After adding environment variables, you MUST redeploy your worker for changes to take effect.**

## Troubleshooting

If you're still getting "Internal Server Error":

1. **Check Environment Variables**: Make sure `NEXT_PUBLIC_API_BASE_URL` is set correctly
2. **Check Backend API**: Ensure your backend API is accessible from Cloudflare Workers
3. **Check CORS**: Your backend must allow requests from your Cloudflare Workers domain
4. **Check Logs**: View worker logs in Cloudflare Dashboard → Workers & Pages → Your Worker → Logs

## Testing

After setting environment variables and redeploying:

1. Visit your worker URL: `https://dlpfrontend.sandeepsandy731-9f0.workers.dev`
2. Check browser console (F12) for any errors
3. Check Cloudflare Worker logs for server-side errors

