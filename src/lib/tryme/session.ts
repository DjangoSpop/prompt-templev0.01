export function generateGuestSessionId(): string {
  return 'guest_' + crypto.randomUUID();
}

export function getGuestSessionId(): string {
  // Use sessionStorage to maintain session across page reloads but not tabs
  const key = 'try_me_session_id';

  if (typeof window === 'undefined') {
    return generateGuestSessionId();
  }

  let sessionId = sessionStorage.getItem(key);

  if (!sessionId) {
    sessionId = generateGuestSessionId();
    sessionStorage.setItem(key, sessionId);
  }

  return sessionId;
}

export function clearGuestSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('try_me_session_id');
  }
}