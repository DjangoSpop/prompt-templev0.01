# Vercel Deployment Guide - Production Environment Setup

## 📋 Pre-Deployment Checklist

### 1. Backend API Setup
- [ ] Ensure Django backend is deployed at `https://api.prompt-temple.com`
- [ ] Verify backend API is accessible: `curl https://api.prompt-temple.com/api/v2/auth/providers/`
- [ ] Configure CORS on backend to allow Vercel domain:
  ```python
  # Django settings.py
  CORS_ALLOWED_ORIGINS = [
      "https://your-app.vercel.app",
      "https://your-custom-domain.com",
  ]
  ```
- [ ] Ensure backend supports `wss://` for WebSocket connections
- [ ] Verify all API endpoints end with trailing slash (Django APPEND_SLASH)

### 2. OAuth Provider Configuration

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create/Edit OAuth 2.0 Client ID
3. Add Authorized Redirect URIs:
   - `https://your-app.vercel.app/auth/callback/google`
   - `https://api.prompt-temple.com/api/v2/auth/social/callback/` (backend)
4. Copy Client ID and Client Secret for Vercel environment variables

#### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create/Edit OAuth App
3. Set Authorization callback URL:
   - `https://your-app.vercel.app/auth/callback/github`
   - Backend callback: `https://api.prompt-temple.com/api/v2/auth/social/callback/`
4. Copy Client ID and Client Secret for Vercel environment variables

### 3. Get Your Vercel Domain
After first deployment, Vercel assigns: `your-project-name.vercel.app`
- Replace `YOUR_VERCEL_DOMAIN` in all configs with actual domain
- If using custom domain, add it to Vercel project settings

---

## 🚀 Vercel Environment Variables Configuration

### Step 1: Access Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**

### Step 2: Add Required Variables

#### API Configuration (Required)
```bash
# Proxy architecture (recommended for CORS handling)
NEXT_PUBLIC_API_BASE_URL=https://your-app.vercel.app/api/proxy

# Backend API target
BACKEND_URL=https://api.prompt-temple.com

# Direct backend for OAuth
NEXT_PUBLIC_BACKEND_URL=https://api.prompt-temple.com

# WebSocket (secure)
NEXT_PUBLIC_WS_URL=wss://api.prompt-temple.com

# Frontend URL
FRONTEND_URL=https://your-app.vercel.app

# OAuth redirects
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**For each variable:**
- Set **Environment**: Production (and optionally Preview/Development)
- Click **Save**

#### OAuth Credentials (Required - Production Only)
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_production_github_client_id
GITHUB_CLIENT_SECRET=your_production_github_client_secret
```

⚠️ **Security Note**: Only add these to **Production** environment in Vercel dashboard. Never commit secrets to `.env.production` file.

#### AI API Keys (Required - Production Only)
```bash
DEEPSEEK_API_KEY=your_production_deepseek_api_key
NEXT_PUBLIC_DEEPSEEK_API_URL=https://api.deepseek.com/v1
```

#### Feature Flags (Optional)
```bash
NEXT_PUBLIC_ENABLE_DEBUG=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_SSE=true
SESSION_DURATION=604800
```

---

## 🔄 Alternative: Direct API Connection (Without Proxy)

If you prefer direct connection to backend (simpler, but requires CORS):

```bash
# Change only this variable
NEXT_PUBLIC_API_BASE_URL=https://api.prompt-temple.com

# Keep these the same
BACKEND_URL=https://api.prompt-temple.com
NEXT_PUBLIC_BACKEND_URL=https://api.prompt-temple.com
NEXT_PUBLIC_WS_URL=wss://api.prompt-temple.com
```

**Backend CORS Requirements:**
```python
# Django settings.py
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = ["https://your-app.vercel.app"]

# Allow required headers
CORS_ALLOW_HEADERS = [
    'authorization',
    'content-type',
    'x-client-version',
    'x-request-id',
]
```

---

## 📦 Deployment Steps

### 1. Initial Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project (run in project directory)
cd c:\Users\ahmed el bahi\PromptTemplev0.01
vercel link
```

### 2. Deploy to Production
```bash
# Deploy to production
vercel --prod
```

### 3. Post-Deployment Verification
After deployment completes, test:

```bash
# 1. Check API connectivity
curl https://your-app.vercel.app/api/proxy/api/v2/auth/providers/

# 2. Visit your app
# https://your-app.vercel.app

# 3. Test OAuth flow
# Click "Sign in with Google" and verify redirect works

# 4. Check logs in Vercel dashboard
# Settings → Functions → View Logs
```

---

## 🐛 Troubleshooting

### Issue: API calls still fail with CORS errors
**Solution**: 
- Verify `BACKEND_URL` in Vercel environment variables
- Check Django CORS settings include Vercel domain
- View Vercel function logs for proxy errors

### Issue: OAuth redirect fails
**Solution**:
- Verify redirect URIs in Google/GitHub match exactly
- Check `NEXT_PUBLIC_APP_URL` matches deployment domain
- Inspect browser console for state validation errors

### Issue: WebSocket connection fails
**Solution**:
- Ensure backend supports `wss://` protocol
- Verify `NEXT_PUBLIC_WS_URL=wss://api.prompt-temple.com`
- Check firewall/load balancer allows WebSocket upgrade

### Issue: Environment variables not taking effect
**Solution**:
- Redeploy after changing variables: `vercel --prod`
- Check variable names match exactly (case-sensitive)
- Verify variable is set for "Production" environment

### Issue: 404 on API routes
**Solution**:
- Django requires trailing slashes: `/api/v2/auth/providers/` not `/api/v2/auth/providers`
- Proxy route auto-adds trailing slash for API paths
- Check backend `APPEND_SLASH = True` setting

---

## 📊 Monitoring

### View Logs
```bash
# Vercel CLI
vercel logs --prod

# Or in dashboard:
# Project → Deployments → [Latest] → View Function Logs
```

### Check Proxy Requests
Proxy route logs to console:
```
[proxy] GET -> https://api.prompt-temple.com/api/v2/auth/providers/
```

Look for these in Vercel function logs to debug API issues.

---

## 🔐 Security Best Practices

1. **Never commit secrets**:
   - Add `.env.production` to `.gitignore`
   - Use Vercel dashboard for production secrets

2. **Rotate OAuth credentials**:
   - Use different OAuth apps for production vs development
   - Regenerate secrets if exposed

3. **Enable HTTPS only**:
   - Vercel automatically provides SSL
   - Ensure backend uses `https://` not `http://`

4. **Review CORS settings**:
   - Only allow specific domains, not `*`
   - Enable credentials only when needed

5. **Monitor API keys**:
   - Set usage alerts for DeepSeek API
   - Rotate keys periodically

---

## ✅ Post-Deployment Checklist

- [ ] All environment variables configured in Vercel dashboard
- [ ] OAuth redirect URIs updated in Google/GitHub
- [ ] Django CORS allows Vercel domain
- [ ] Test login flow (Google + GitHub)
- [ ] Test API calls via proxy
- [ ] Test WebSocket connection
- [ ] Check Vercel function logs for errors
- [ ] Update custom domain (if applicable)
- [ ] Configure production analytics
- [ ] Set up monitoring/alerts

---

## 📞 Support Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/projects/environment-variables)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Django CORS Configuration](https://github.com/adamchainz/django-cors-headers)
- Backend API: `https://api.prompt-temple.com`

---

## 🔄 Update Process

When updating environment variables:

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Edit/Add variable
3. Select environments (Production/Preview/Development)
4. **Redeploy**: `vercel --prod` (variables only apply to new deployments)

---

## 📝 Notes

- **Proxy Architecture**: Frontend → `/api/proxy` → Django backend (recommended)
- **Direct Architecture**: Frontend → Django backend (requires CORS)
- **OAuth Flow**: Always bypasses proxy (uses `NEXT_PUBLIC_BACKEND_URL`)
- **WebSocket**: Uses `NEXT_PUBLIC_WS_URL` directly
- **Environment Files**: `.env.local` (dev) vs Vercel Dashboard (prod)
