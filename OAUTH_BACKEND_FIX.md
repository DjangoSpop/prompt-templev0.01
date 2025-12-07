# OAuth Backend Fix Required

## Problem
Google OAuth is failing with `401 Unauthorized` because the backend isn't using the `redirect_uri` sent by the frontend when exchanging authorization codes.

## What's Happening
1. ✅ Frontend sends correct `redirect_uri` in callback request
2. ❌ Backend ignores it and uses a hardcoded/wrong value
3. ❌ Google rejects the token exchange (redirect_uri mismatch)

## Backend Fix (Django)

### 1. Update your callback endpoint to accept and use `redirect_uri`

```python
# In your views.py or wherever you handle /api/v2/auth/social/callback/

@api_view(['POST'])
def social_auth_callback(request):
    code = request.data.get('code')
    state = request.data.get('state')
    provider = request.data.get('provider')
    redirect_uri = request.data.get('redirect_uri')  # ← ADD THIS
    
    # Validate state (your existing code)
    # ...
    
    # Exchange code for token
    if provider == 'google':
        token_response = requests.post('https://oauth2.googleapis.com/token', {
            'client_id': settings.GOOGLE_CLIENT_ID,
            'client_secret': settings.GOOGLE_CLIENT_SECRET,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri  # ← USE THE ONE FROM REQUEST, NOT A HARDCODED VALUE
        })
        
        if token_response.status_code != 200:
            return Response({
                'error': 'Failed to exchange code for token',
                'details': token_response.json()
            }, status=400)
        
        # Rest of your code...
```

### 2. Google Cloud Console Configuration

Make sure these redirect URIs are registered in your OAuth 2.0 Client:

**Development:**
- `http://localhost:3000/auth/callback/google`

**Production:**
- `https://yourdomain.com/auth/callback/google`

### 3. Environment Variables

Add to your Django `.env`:

```bash
# Development
FRONTEND_URL=http://localhost:3000

# Production (Heroku/Railway/etc)
FRONTEND_URL=https://yourdomain.com
```

## Testing

```bash
# 1. Initiate OAuth (this creates the state)
curl -v "http://127.0.0.1:8000/api/v2/auth/social/google/initiate/"

# 2. After Google redirects, test the callback manually
curl -X POST http://127.0.0.1:8000/api/v2/auth/social/callback/ \
  -H "Content-Type: application/json" \
  -d '{
    "code": "<code-from-google>",
    "state": "<state-from-step-1>",
    "provider": "google",
    "redirect_uri": "http://localhost:3000/auth/callback/google"
  }'
```

## Key Points

1. **The `redirect_uri` MUST be identical** in both:
   - Initial authorization request (when you redirect to Google)
   - Token exchange request (when you POST to Google's token endpoint)

2. **The frontend callback URL** (`http://localhost:3000/auth/callback/google`) is where:
   - Google redirects the user
   - Your frontend receives the code
   - This must match what you tell Google during token exchange

3. **Don't use backend URLs** like `http://127.0.0.1:8000/...` as redirect_uri - that's not where users go after OAuth!

## Current State

- ✅ Frontend: Updated to call backend DIRECTLY (bypassing Next.js proxy)
- ✅ Frontend: Correctly sending `redirect_uri` to backend
- ✅ Frontend: Using `NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000`
- ⏳ Backend: Update needed to use the `redirect_uri` from request body
- ❌ Result: Google returns 401 because backend not using correct redirect_uri

## What Changed (Frontend)

The frontend OAuth flow now:
1. Calls Django backend **directly** at `http://127.0.0.1:8000` (not through Next.js proxy)
2. Sends `redirect_uri: "http://localhost:3000/auth/callback/google"` in the callback request
3. Uses environment variable `NEXT_PUBLIC_BACKEND_URL` for OAuth endpoints

This eliminates the proxy middleware from the OAuth flow, making debugging easier.

Once you fix the backend to use `request.data.get('redirect_uri')`, OAuth will work! 🎉
