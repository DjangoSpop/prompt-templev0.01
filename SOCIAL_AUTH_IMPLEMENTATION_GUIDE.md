# Social Authentication Implementation Guide

## 🔐 Complete OAuth2 Integration for PromptCraft/PromptTemple

This guide provides comprehensive implementation instructions for adding Google and GitHub OAuth2 authentication to your existing Django backend and Next.js frontend.

## 📋 Table of Contents

1. [Frontend Implementation](#frontend-implementation)
2. [Backend API Requirements](#backend-api-requirements)
3. [Database Schema](#database-schema)
4. [OAuth2 Setup](#oauth2-setup)
5. [Integration Examples](#integration-examples)
6. [Security Considerations](#security-considerations)
7. [Error Handling](#error-handling)
8. [Testing Guide](#testing-guide)
9. [Deployment Checklist](#deployment-checklist)

## 🎨 Frontend Implementation

### Components Created

#### 1. **Core Hook: `useSocialAuth`**
```typescript
// Usage in components
const {
  providers,
  signInWithProvider,
  handleAuthCallback,
  linkAccount,
  unlinkAccount,
  isAuthenticating,
  authError
} = useSocialAuth({
  onAuthSuccess: (response) => {
    // Handle successful authentication
    console.log('User authenticated:', response.user);
    // response.access and response.refresh contain JWT tokens
  },
  onAuthError: (error) => {
    // Handle authentication errors
    console.error('Auth failed:', error);
  }
});
```

#### 2. **Social Auth Buttons Component**
```tsx
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';

// Basic usage
<SocialAuthButtons
  mode="signin" // or "signup" or "link"
  onSuccess={(response) => {
    // Same JWT structure as your existing login
    localStorage.setItem('access_token', response.access);
    localStorage.setItem('refresh_token', response.refresh);
  }}
/>

// In existing login forms
<SocialAuthButtons
  mode="signin"
  className="mb-4"
  onSuccess={handleLoginSuccess}
/>
```

#### 3. **Enhanced Auth Page**
```tsx
import { EnhancedAuthPage } from '@/components/auth/EnhancedAuthPage';

// Complete auth page with social + email/password
<EnhancedAuthPage
  defaultTab="signin"
  onAuthSuccess={(response) => {
    // Handle both social and email/password auth
    setUser(response.user);
    setTokens(response.access, response.refresh);
    router.push('/dashboard');
  }}
/>
```

#### 4. **Social Account Manager**
```tsx
import { SocialAccountManager } from '@/components/auth/SocialAccountManager';

// In user settings/profile page
<SocialAccountManager />
```

### Integration with Existing Auth

```typescript
// In your existing AuthProvider/context
import { useSocialAuth } from '@/hooks/useSocialAuth';

const AuthProvider = ({ children }) => {
  const { handleAuthCallback } = useSocialAuth({
    onAuthSuccess: (response) => {
      // Same as your existing login success handler
      setUser(response.user);
      setAccessToken(response.access);
      setRefreshToken(response.refresh);

      if (response.is_new_user) {
        // Handle new user onboarding
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    }
  });

  // Handle OAuth callback in useEffect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      handleAuthCallback(code, state);
    }
  }, []);

  // Rest of your existing AuthProvider logic
};
```

## 🔧 Backend API Requirements

### Required Endpoints

Your Django backend needs to implement these endpoints:

#### 1. **GET /api/v2/auth/social/providers/**
```python
# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def social_providers(request):
    return Response({
        "providers": [
            {
                "id": "google",
                "name": "google",
                "display_name": "Google",
                "is_enabled": True,
                "configuration": {
                    "scopes": ["openid", "email", "profile"],
                    "authorize_url": "https://accounts.google.com/o/oauth2/v2/auth",
                    "token_url": "https://oauth2.googleapis.com/token"
                }
            },
            {
                "id": "github",
                "name": "github",
                "display_name": "GitHub",
                "is_enabled": True,
                "configuration": {
                    "scopes": ["user:email"],
                    "authorize_url": "https://github.com/login/oauth/authorize",
                    "token_url": "https://github.com/login/oauth/access_token"
                }
            }
        ],
        "enabled_count": 2
    })
```

#### 2. **POST /api/v2/auth/social/{provider}/initiate/**
```python
import secrets
from urllib.parse import urlencode
from django.conf import settings

@api_view(['POST'])
def initiate_social_auth(request, provider):
    data = request.data
    redirect_uri = data.get('redirect_uri', settings.SOCIAL_AUTH_REDIRECT_URI)

    # Generate CSRF state
    state = secrets.token_urlsafe(32)

    # Store state in cache/session for validation
    cache.set(f"oauth_state_{state}", {
        'provider': provider,
        'user_id': request.user.id if request.user.is_authenticated else None,
        'redirect_uri': redirect_uri
    }, timeout=600)  # 10 minutes

    if provider == 'google':
        params = {
            'client_id': settings.GOOGLE_CLIENT_ID,
            'redirect_uri': redirect_uri,
            'scope': 'openid email profile',
            'response_type': 'code',
            'state': state,
            'access_type': 'offline',
            'prompt': 'consent'
        }
        auth_url = 'https://accounts.google.com/o/oauth2/v2/auth?' + urlencode(params)

    elif provider == 'github':
        params = {
            'client_id': settings.GITHUB_CLIENT_ID,
            'redirect_uri': redirect_uri,
            'scope': 'user:email',
            'state': state
        }
        auth_url = 'https://github.com/login/oauth/authorize?' + urlencode(params)

    return Response({
        'authorization_url': auth_url,
        'state': state,
        'provider': provider,
        'expires_in': 600
    })
```

#### 3. **POST /api/v2/auth/social/callback/**
```python
import requests
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

@api_view(['POST'])
def social_auth_callback(request):
    data = request.data
    provider = data.get('provider')
    code = data.get('code')
    state = data.get('state')

    # Validate state parameter
    state_data = cache.get(f"oauth_state_{state}")
    if not state_data or state_data['provider'] != provider:
        return Response({'error': 'Invalid state parameter'}, status=400)

    # Exchange code for token
    if provider == 'google':
        token_response = requests.post('https://oauth2.googleapis.com/token', {
            'client_id': settings.GOOGLE_CLIENT_ID,
            'client_secret': settings.GOOGLE_CLIENT_SECRET,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': state_data['redirect_uri']
        })

        if token_response.status_code == 200:
            token_data = token_response.json()
            access_token = token_data['access_token']

            # Get user info from Google
            user_response = requests.get(
                f"https://www.googleapis.com/oauth2/v2/userinfo?access_token={access_token}"
            )
            user_info = user_response.json()

    elif provider == 'github':
        token_response = requests.post('https://github.com/login/oauth/access_token', {
            'client_id': settings.GITHUB_CLIENT_ID,
            'client_secret': settings.GITHUB_CLIENT_SECRET,
            'code': code
        }, headers={'Accept': 'application/json'})

        if token_response.status_code == 200:
            token_data = token_response.json()
            access_token = token_data['access_token']

            # Get user info from GitHub
            user_response = requests.get(
                f"https://api.github.com/user",
                headers={'Authorization': f'token {access_token}'}
            )
            user_info = user_response.json()

            # Get email if not public
            email_response = requests.get(
                "https://api.github.com/user/emails",
                headers={'Authorization': f'token {access_token}'}
            )
            emails = email_response.json()
            primary_email = next((e['email'] for e in emails if e['primary']), None)
            user_info['email'] = user_info.get('email') or primary_email

    # Find or create user
    email = user_info.get('email')
    if not email:
        return Response({'error': 'Email not provided by OAuth provider'}, status=400)

    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            'username': user_info.get('login') or user_info.get('name', '').replace(' ', '_').lower(),
            'first_name': user_info.get('given_name', ''),
            'last_name': user_info.get('family_name', ''),
            'is_active': True,
            'social_avatar_url': user_info.get('picture') or user_info.get('avatar_url'),
            'provider_id': str(user_info.get('id')),
            'provider_name': provider,
        }
    )

    if not created:
        # Update social info for existing user
        user.social_avatar_url = user_info.get('picture') or user_info.get('avatar_url')
        user.provider_id = str(user_info.get('id'))
        user.provider_name = provider
        user.save()

    # Generate JWT tokens (same as your existing login)
    refresh = RefreshToken.for_user(user)

    # Clean up state
    cache.delete(f"oauth_state_{state}")

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'avatar': user.social_avatar_url,
            'is_premium': user.is_premium,
            'social_avatar_url': user.social_avatar_url,
            'provider_id': user.provider_id,
            'provider_name': user.provider_name,
        },
        'is_new_user': created,
        'linked_accounts': [{
            'provider': provider,
            'provider_id': user.provider_id,
            'email': email,
            'linked_at': user.date_joined.isoformat() if created else user.last_login.isoformat()
        }]
    })
```

### Database Schema Updates

Add these fields to your User model:

```python
# models.py
class User(AbstractUser):
    # Your existing fields...

    # Social authentication fields
    social_avatar_url = models.URLField(null=True, blank=True)
    provider_id = models.CharField(max_length=100, null=True, blank=True)
    provider_name = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        db_table = 'auth_user'
        unique_together = [('provider_name', 'provider_id')]

# Migration command
# python manage.py makemigrations
# python manage.py migrate
```

## 🔑 OAuth2 Setup

### Google OAuth2 Setup

1. **Google Cloud Console:**
   - Go to https://console.cloud.google.com/
   - Create a new project or select existing
   - Enable Google+ API and OAuth2 APIs
   - Go to Credentials → Create Credentials → OAuth 2.0 Client IDs

2. **Configuration:**
   ```
   Application type: Web application
   Name: PromptTemple Auth
   Authorized JavaScript origins:
   - http://localhost:3000 (development)
   - https://yourdomain.com (production)

   Authorized redirect URIs:
   - http://localhost:3000/auth/callback
   - https://yourdomain.com/auth/callback
   ```

3. **Environment Variables:**
   ```bash
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-secret-key
   ```

### GitHub OAuth2 Setup

1. **GitHub Developer Settings:**
   - Go to https://github.com/settings/applications/new
   - Fill out the application details

2. **Configuration:**
   ```
   Application name: PromptTemple
   Homepage URL: https://yourdomain.com
   Authorization callback URL: https://yourdomain.com/auth/callback
   ```

3. **Environment Variables:**
   ```bash
   NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-secret
   ```

## 🔐 Security Considerations

### CSRF Protection
```typescript
// State parameter validation in backend
const validateState = (state, storedState) => {
  if (!state || !storedState || state !== storedState) {
    throw new Error('Invalid state parameter - possible CSRF attack');
  }
};
```

### Token Security
```python
# Django settings.py
SOCIAL_AUTH_REDIRECT_URI = env('SOCIAL_AUTH_REDIRECT_URI')
SOCIAL_AUTH_STATE_SECRET = env('SOCIAL_AUTH_STATE_SECRET')

# Never store OAuth access tokens permanently
# Only use them to fetch user info, then discard
```

### Rate Limiting
```python
# Add rate limiting to auth endpoints
from django_ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='10/m', method='POST')
def social_auth_callback(request):
    # Your callback logic
```

## 🧪 Testing Guide

### Unit Tests
```typescript
// useSocialAuth.test.ts
import { renderHook } from '@testing-library/react';
import { useSocialAuth } from '@/hooks/useSocialAuth';

test('should handle OAuth callback', async () => {
  const { result } = renderHook(() => useSocialAuth());

  const mockResponse = {
    access: 'mock-token',
    refresh: 'mock-refresh',
    user: { email: 'test@example.com' }
  };

  const response = await result.current.handleAuthCallback('code', 'state');
  expect(response).toEqual(mockResponse);
});
```

### Integration Tests
```python
# test_social_auth.py
from django.test import TestCase
from django.urls import reverse

class SocialAuthTest(TestCase):
    def test_social_auth_callback_google(self):
        url = reverse('social_auth_callback')
        data = {
            'provider': 'google',
            'code': 'test-code',
            'state': 'test-state'
        }

        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.json())
```

## 🚀 Deployment Checklist

### Frontend Deployment
- [ ] Update `NEXT_PUBLIC_API_URL` for production
- [ ] Set correct OAuth redirect URIs
- [ ] Enable HTTPS for OAuth callbacks
- [ ] Test social auth flow in staging

### Backend Deployment
- [ ] Set production OAuth client IDs/secrets
- [ ] Configure CORS for frontend domain
- [ ] Set up Redis for state caching
- [ ] Run database migrations
- [ ] Test OAuth callback endpoints

### Production Environment Variables
```bash
# Frontend (.env.production)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=prod-google-client-id
NEXT_PUBLIC_GITHUB_CLIENT_ID=prod-github-client-id
SOCIAL_AUTH_REDIRECT_URI=https://yourdomain.com/auth/callback

# Backend
GOOGLE_CLIENT_SECRET=prod-google-secret
GITHUB_CLIENT_SECRET=prod-github-secret
SOCIAL_AUTH_STATE_SECRET=prod-state-secret
REDIS_URL=redis://production-redis:6379
```

## 📱 Integration Examples

### Basic Login Flow
```tsx
// pages/auth/login.tsx
import { EnhancedAuthPage } from '@/components/auth/EnhancedAuthPage';

export default function LoginPage() {
  return (
    <EnhancedAuthPage
      defaultTab="signin"
      onAuthSuccess={(response) => {
        // Handle successful login (social or email/password)
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        router.push('/dashboard');
      }}
    />
  );
}
```

### Settings Page Integration
```tsx
// pages/settings/account.tsx
import { SocialAccountManager } from '@/components/auth/SocialAccountManager';

export default function AccountSettings() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1>Account Settings</h1>

      <SocialAccountManager className="mt-6" />

      {/* Your other settings components */}
    </div>
  );
}
```

### Mobile-First Auth
```tsx
// components/MobileAuth.tsx
import { SocialAuthButtonsCompact } from '@/components/auth/SocialAuthButtons';

export function MobileAuth() {
  return (
    <div className="p-4">
      <h2>Quick Sign In</h2>
      <SocialAuthButtonsCompact
        mode="signin"
        onSuccess={handleSuccess}
      />
    </div>
  );
}
```

## 🎯 Success Metrics

Track these metrics to measure success:

1. **Conversion Rates:**
   - Social sign-up vs email sign-up conversion
   - Authentication completion rate
   - User onboarding completion after social auth

2. **User Experience:**
   - Authentication flow completion time
   - Error rates by provider
   - User preference (social vs email/password)

3. **Security Metrics:**
   - Failed authentication attempts
   - CSRF attack attempts blocked
   - Account takeover prevention

## 🔧 Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Check OAuth app configuration
   - Ensure exact match with registered URIs
   - Include protocol (http/https)

2. **"State parameter mismatch"**
   - Check Redis/cache connectivity
   - Verify state timeout (10 minutes)
   - Ensure CSRF protection is working

3. **"Email not provided"**
   - Request proper OAuth scopes
   - Handle private email cases (GitHub)
   - Provide fallback email collection

4. **JWT token issues**
   - Ensure same JWT structure as existing login
   - Check token expiration settings
   - Verify user serialization matches existing format

---

**Implementation Time:** 1-2 weeks
**Team Requirements:** 1 frontend + 1 backend developer
**Testing Phase:** 3-5 days
**Expected Results:** 30-50% faster user onboarding, improved conversion rates

This implementation provides a seamless OAuth2 experience that integrates perfectly with your existing authentication system while maintaining the pharaonic theme and user experience standards of PromptCraft/PromptTemple.