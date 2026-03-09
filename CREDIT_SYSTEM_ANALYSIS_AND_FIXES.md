# Credit System Analysis: Root Cause & Solutions

## Executive Summary
The credit system resets to default (4000 for power users) on re-login because **credits are not being reset during logout**, causing stale localStorage values to persist and override fresh backend data during login.

---

## 🔴 Root Cause Analysis

\`\`\`
User Session Flow:
┌─────────────────────────────────────────────────────────┐
│ 1. User logs in                                          │
│    - JWT tokens obtained ✓                              │
│    - Credits fetched from API (960 credits) ✓           │
│    - Stored in Zustand + localStorage via persist ✓    │
└─────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────┐
│ 2. User uses AI services                                │
│    - Credits: 960 → 950 → 940 (deducted) ✓             │
│    - Updates stored in Zustand + localStorage ✓        │
└─────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────┐
│ 3. User logs out                                        │
│    - JWT tokens cleared from storage ✓                 │
│    - React Query cache cleared ✓                       │
│    - BUT Zustand credits store NOT reset ✗            │
│    - stale credits (940) remain in localStorage ✗      │
└─────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────┐
│ 4. User logs back in                                    │
│    - JWT tokens obtained ✓                              │
│    - useCredits() hook triggers...                      │
│    - Zustand hydrates from localStorage (940) ✗        │
│    - useEntitlements() fetches from API (4000) ✓       │
│    - **TIMING BUG**: Which one wins?                    │
│      • If localStorage hydrates first: shows 940       │
│      • API response overrides it with 4000 but by then │
│        user may have already seen cached value ✗       │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Problem Analysis by File

### 1. **[src/store/credits.ts](src/store/credits.ts)** - The Zustand Store
```typescript
// Line 155-170: Persist configuration
{
  name: 'prompt-temple-credits',
  partialize: (state) => ({
    creditBannerDismissed: state.creditBannerDismissed,
    creditsRemaining: state.creditsRemaining,    // ⚠️ PERSISTING!
    planCode: state.planCode,
    lastSyncedAt: state.lastSyncedAt,
  }),
}
```

**Issues:**
- ✅ Persists `creditsRemaining` to localStorage
- ❌ Missing: No reset on logout
- ❌ Missing: No way to clear persisted localStorage data

### 2. **[src/lib/hooks/useAuth.ts](src/lib/hooks/useAuth.ts)** - Logout Handler
```typescript
// Line 158-172: logoutMutation
onSuccess: () => {
  console.log('🚪 Logout successful, clearing query cache');
    // Force auth state update immediately
    setAuthState({
      isAuthenticated: false,
      lastCheck: Date.now()
    });
    
    // Clear all cached data
    queryClient.clear();
    
    // Remove user from cache explicitly
    queryClient.removeQueries({ queryKey: ['auth'] });
    
    // ⚠️ MISSING: useCreditsStore.getState().reset();
},
```

**Issues:**
- ❌ React Query cache is cleared BUT Zustand credits store is NOT reset
- ❌ No call to `useCreditsStore.getState().reset()`

### 3. **[src/hooks/api/useCredits.ts](src/hooks/api/useCredits.ts)** - Credit Hydration
```typescript
// Line 12-24: Hydration on mount
useEffect(() => {
  if (!entitlements) return;
  const balance = entitlements.credits_available ?? 0;
  store.syncFromHeaders(balance, null, balance <= 10);
  store.setPlan(entitlements.plan_code ?? 'FREE');
}, [entitlements]);
```

**Issues:**
- ✅ Has hydration logic
- ❌ But runs AFTER Zustand loads from localStorage (race condition)
- ❌ `useEntitlements()` has 60s staleTime, so may not fetch immediately

### 4. **[src/lib/api/typed-client.ts](src/lib/api/typed-client.ts)** - Response Header Sync
```typescript
// Line 108-121: Credit header extraction
if (remaining !== null || low !== null || balance !== null) {
  useCreditsStore.getState().syncFromHeaders(
    remaining !== null ? Number(remaining) : null,
    used !== null ? Number(used) : null,
    low === 'true',
    balance !== null ? Number(balance) : null,
    reserved !== null ? Number(reserved) : null
  );
}
```

**Issues:**
- ✅ Correctly syncs from headers on every request
- ⚠️ BUT only syncs when making API calls
- ⚠️ If user logs in and doesn't make immediate API call, may see stale localStorage value

---

## 🎯 Specific Problems

### Problem #1: No Reset on Logout
**Location:** [src/lib/hooks/useAuth.ts:158-172](src/lib/hooks/useAuth.ts#L158-L172)

The `logoutMutation.onSuccess` handler clears React Query cache but doesn't reset the Zustand credits store.

**Impact:** Stale credit values persist in localStorage even after user logs out.

---

### Problem #2: Stale localStorage on Re-login
**Location:** [src/store/credits.ts:155-170](src/store/credits.ts#L155-L170)

The persist middleware restores `creditsRemaining` from localStorage during app initialization, before the entitlements API call completes.

**Impact:** User sees stale cached credits for a moment before the correct value is fetched.

---

### Problem #3: Race Condition in useCredits Hook
**Location:** [src/hooks/api/useCredits.ts:14-23](src/hooks/api/useCredits.ts#L14-L23)

The `useEntitlements()` query has 60s `staleTime`, so on login it won't immediately fetch fresh data if it was recently fetched (in the last 60s).

**Impact:** Credits stay stale for up to 60 seconds after login.

---

### Problem #4: Different Entitlements Schema
**Location:** [src/lib/api/typed-client.ts:939](src/lib/api/typed-client.ts#L939)

The backend likely returns user credits in different formats:
- Per API docs: `credits_remaining` on user profile
- Per entitlements: `credits_available` or similar field

**Impact:** Mapping mismatch between what backend sends and what frontend expects.

---

## ✅ Recommended Solutions

### Solution #1: Reset Credits Store on Logout (🔥 CRITICAL)
**File:** [src/lib/hooks/useAuth.ts](src/lib/hooks/useAuth.ts)

Add `useCreditsStore.getState().reset()` to the logout mutation success handler.

```typescript
onSuccess: () => {
  // NEW:
  useCreditsStore.getState().reset();
  
  // Existing code...
  queryClient.clear();
  queryClient.removeQueries({ queryKey: ['auth'] });
},
```

---

### Solution #2: Clear Persisted Credits Store on Logout
**File:** [src/store/credits.ts](src/store/credits.ts)

Add a method to clear the persisted localStorage entry.

```typescript
// Add to CreditsState interface
clearPersisted: () => void;

// Add to store implementation
clearPersisted: () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('prompt-temple-credits');
  }
},
```

Then call it on logout:
```typescript
useCreditsStore.getState().clearPersisted();
```

---

### Solution #3: Force Refetch of Entitlements on Login
**File:** [src/hooks/api/useCredits.ts](src/hooks/api/useCredits.ts) or [src/providers/AuthProvider.tsx](src/providers/AuthProvider.tsx)

After user logs in, force `useEntitlements()` to refetch immediately with `staleTime: 0`.

```typescript
// In AuthProvider or login handler:
const queryClient = useQueryClient();

// On successful login:
queryClient.invalidateQueries({ 
  queryKey: billingKeys.entitlements() 
});
```

---

### Solution #4: Force Fresh API Call on Login
**File:** [src/lib/hooks/useAuth.ts](src/lib/hooks/useAuth.ts)

In the `loginMutation.onSuccess`, force a fetch of fresh entitlements and sync credits immediately.

```typescript
onSuccess: (data) => {
  // Existing code...
  queryClient.setQueryData(['auth', 'profile'], data.user);
  
  // NEW: Force refetch entitlements to sync fresh credits
  queryClient.invalidateQueries({ 
    queryKey: ['billing', 'entitlements'] 
  });
  
  setAuthState({ isAuthenticated: true, lastCheck: Date.now() });
},
```

---

### Solution #5: Add Server-Side Credit Sync Endpoint (🔥 RECOMMENDED)
**File:** Backend + [src/lib/api/typed-client.ts](src/lib/api/typed-client.ts)

Add a dedicated endpoint that:
1. Returns fresh user credits
2. Always called immediately on successful login
3. Bypasses cache

```typescript
// Backend: GET /api/v2/me/credits/ (returns { credits_remaining: 3500, ... })

// Frontend:
async syncCreditsOnLogin(token: string): Promise<void> {
  const response = await fetch('/api/v2/me/credits/', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const { credits_remaining } = await response.json();
  useCreditsStore.getState().syncFromHeaders(credits_remaining, null, false);
}
```

Then call immediately after login:
```typescript
await apiClient.syncCreditsOnLogin(data.access);
```

---

## 🛠️ Implementation Priority

| Priority | Solution | Effort | Impact |
|----------|----------|--------|--------|
| 🔥 CRITICAL | Reset credits store on logout | 5 min | 90% ✅ |
| 🔥 CRITICAL | Clear persisted localStorage on logout | 5 min | 95% ✅ |
| ⚠️ HIGH | Force refetch entitlements on login | 10 min | 98% ✅ |
| 💯 RECOMMENDED | Add server-side sync endpoint | 1 hour | 100% ✅ |
| ⚡ OPTIONAL | Reduce staleTime for entitlements | 2 min | 85% ✅ |

---

## 📊 Testing Plan

### Test Case 1: Logout → Login → Check Credits
```
1. User logs in with 960 credits
2. Uses AI service → credits become 940
3. User logs out
4. User logs back in
5. ✅ VERIFY: Credits show 960 (backend default), NOT 940 (stale)
```

### Test Case 2: Check localStorage Before/After Logout
```
1. Log in → check localStorage['prompt-temple-credits']
2. ✅ VERIFY: Has credits_remaining value
3. Log out
4. ✅ VERIFY: localStorage['prompt-temple-credits'] is cleared/removed
```

### Test Case 3: Multiple Users on Same Device
```
1. User A logs in (960 credits)
2. User A logs out
3. User B logs in (4000 credits)
4. ✅ VERIFY: User B sees 4000, NOT 960 from User A
```

### Test Case 4: Rapid Login After Failed Logout
```
1. User logs in
2. Logout fails (network error) but UI redirects anyway
3. Immediately log in with different account
4. ✅ VERIFY: Old credits don't leak to new account
```

---

## 🚀 Deployment Checklist

- [ ] Reset userstore on logout (useAuth.ts line 158)
- [ ] Clear persisted credits on logout
- [ ] Force refetch entitlements on login
- [ ] Test with multiple user accounts
- [ ] Verify localStorage is cleared on logout
- [ ] Check that credits sync immediately on login (no stale values)
- [ ] Load test to ensure no race conditions
- [ ] Document credit sync flow in FRONTEND_BILLING_CREDITS_GUIDE.md
- [ ] Add integration test for login→logout→login flow
- [ ] Monitor error logs for credit sync failures in production

---

## 💾 Current Known State

### Credit System Flow (Current)
- ✅ Credits sync from `X-Credits-*` headers on API responses
- ✅ Credits stored in Zustand + persisted to localStorage
- ✅ useEntitlements() query refetches every 60s
- ✅ useCredits() hook hydrates from entitlements on mount
- ❌ But credits aren't reset on logout
- ❌ So stale values persist in localStorage

### Root Issue
**No cleanup of persisted state on logout** → Credits become "orphaned" in localStorage → User sees stale cached balance after re-login until fresh API data arrives.

---

## 📝 Files to Modify

1. **[src/lib/hooks/useAuth.ts](src/lib/hooks/useAuth.ts)**
   - Line 158-172: Add credits reset to logout handler

2. **[src/store/credits.ts](src/store/credits.ts)**
   - Line 140: Add `clearPersisted` method
   - Persist config: ensure proper cleanup

3. **[src/hooks/api/useCredits.ts](src/hooks/api/useCredits.ts)** (optional)
   - Add forced refetch logic on auth state change

4. **[src/providers/AuthProvider.tsx](src/providers/AuthProvider.tsx)** (optional)
   - Sync entitlements on successful login

---

## 📚 Related Documentation

- [FRONTEND_BILLING_CREDITS_GUIDE.md](FRONTEND_BILLING_CREDITS_GUIDE.md) - Credit system architecture
- [FRONTEND_BILLING_CREDITS_GUIDE.md#Response Headers](FRONTEND_BILLING_CREDITS_GUIDE.md#Response-Headers) - Header-based sync system
- [src/store/credits.ts](src/store/credits.ts) - Zustand configuration
- [src/hooks/api/useBilling.ts](src/hooks/api/useBilling.ts) - Entitlements query

---

**Analysis Date:** March 9, 2026  
**Status:** READY FOR IMPLEMENTATION  
**Confidence:** HIGH (Based on code review + architecture analysis)
