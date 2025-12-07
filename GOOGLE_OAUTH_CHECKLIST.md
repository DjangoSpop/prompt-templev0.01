# OAuth Setup Checklist (Google & GitHub)

## Current Status
✅ Frontend sending correct redirect URIs
✅ Backend receiving and using correct redirect URIs
❌ OAuth providers rejecting because redirect URIs not registered

## Google Cloud Console Configuration

### Step 1: Verify OAuth Client Settings

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID: `367664891760-g0phqsut6h3jm0bq12sorj1e1nlkuf7u.apps.googleusercontent.com`
3. Click on it to edit

### Step 2: Check Authorized Redirect URIs

**CRITICAL:** The redirect URIs list MUST include EXACTLY:

```
http://localhost:3000/auth/callback/google
```

**Common Mistakes:**
- ❌ `http://localhost:3000/auth/callback` (missing `/google`)
- ❌ `http://127.0.0.1:3000/auth/callback/google` (different host)
- ❌ `http://localhost:3000/auth/callback/` (trailing slash)
- ❌ `https://localhost:3000/auth/callback/google` (https vs http)

**What to add:**
- ✅ `http://localhost:3000/auth/callback/google` (exactly this)

### Step 3: Verify Client Secret Matches

Make sure the `GOOGLE_CLIENT_SECRET` in your Django backend matches the one in Google Cloud Console.

Current in `.env.local`: `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`

### Step 4: Check Application Type

Your OAuth client should be configured as:
- **Application type**: Web application
- **NOT** Desktop app or Mobile app

## Testing the Configuration

After updating Google Cloud Console (changes are immediate):

1. Clear your browser's OAuth state:
```javascript
localStorage.clear()
```

2. Try signing in again

3. Check backend logs for the exact Google error:
```python
# In your Django view, add this logging:
import logging
logger = logging.getLogger(__name__)

# After token_response = requests.post(...)
if token_response.status_code != 200:
    logger.error(f"Google token exchange failed: {token_response.status_code}")
    logger.error(f"Google error response: {token_response.json()}")
```

## Common Google Error Responses

### `redirect_uri_mismatch`
**Cause:** The redirect_uri doesn't match what's registered in Google Cloud Console
**Fix:** Add the exact URL to Authorized redirect URIs

### `invalid_grant`
**Cause:** Authorization code already used, expired, or belongs to different client
**Fix:** Get a fresh authorization code (sign in again)

### `invalid_client`
**Cause:** Client ID or Client Secret is wrong
**Fix:** Verify credentials match Google Cloud Console

---

# GitHub OAuth Setup

## Step 1: Go to GitHub OAuth Settings

1. Go to: https://github.com/settings/developers
2. Click on **OAuth Apps**
3. Find your app (Client ID: `Ov23liEYkjrWCP9zoHNF`)
4. Click on it to edit

## Step 2: Update Authorization Callback URL

**Current Error:**
```
The redirect_uri is not associated with this application.
```

**Fix:**

In the **Authorization callback URL** field, enter:
```
http://localhost:3000/auth/callback/github
```

**Important:**
- GitHub only allows ONE callback URL per OAuth app (unlike Google)
- For production, you'll need a separate OAuth app or update this URL
- The URL must match EXACTLY (no trailing slash, correct protocol)

## Step 3: Save Changes

Click **Update application**

---

## Summary: What to Configure

### Google OAuth (https://console.cloud.google.com/apis/credentials)
**Authorized redirect URIs** (can have multiple):
- `http://localhost:3000/auth/callback/google` ← Add this for local dev
- `https://yourdomain.com/auth/callback/google` ← Add this for production

### GitHub OAuth (https://github.com/settings/developers)
**Authorization callback URL** (only one allowed):
- `http://localhost:3000/auth/callback/github` ← For local dev
- OR create a separate OAuth app for production

---

## Next Steps

1. ✅ Add redirect URIs to Google Cloud Console (REQUIRED)
2. ✅ Add callback URL to GitHub OAuth app (REQUIRED)
3. After saving, try signing in again (get fresh authorization codes)
4. If still failing, check that Client IDs and Secrets match
