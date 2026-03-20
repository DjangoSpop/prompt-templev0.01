/**
 * Sharing API Client
 *
 * Handles all sharing-related API calls to the Django backend.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com';

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Public endpoints (no auth) ─────────────────────────────────

export async function getPublicShare(shareToken: string) {
  const res = await fetch(`${API_BASE}/api/v1/share/${shareToken}/`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function trackShareEvent(
  shareToken: string,
  eventType: 'view' | 'copy' | 'reshare' | 'cta_click',
  platform?: string
) {
  try {
    await fetch(`${API_BASE}/api/v1/share/${shareToken}/event/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: eventType, platform }),
    });
  } catch {
    // Fire-and-forget analytics
  }
}

export async function getTrendingShares() {
  const res = await fetch(`${API_BASE}/api/v1/share/trending/`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function trackReferralClick(referralCode: string) {
  const res = await fetch(`${API_BASE}/api/v1/ref/${referralCode}/`);
  if (!res.ok) return null;
  return res.json();
}

// ─── Authenticated endpoints ────────────────────────────────────

export async function createShare(data: {
  original_prompt: string;
  optimized_prompt: string;
  wow_score: number;
  title?: string;
  category?: string;
  show_original?: boolean;
}) {
  const res = await fetch(`${API_BASE}/api/v1/share/create/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create share');
  return res.json();
}

export async function getMyShares() {
  const res = await fetch(`${API_BASE}/api/v1/share/mine/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch shares');
  return res.json();
}

export async function deleteShare(shareId: string) {
  const res = await fetch(`${API_BASE}/api/v1/share/${shareId}/delete/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete share');
  return res.json();
}

export async function getMyReferralLink() {
  const res = await fetch(`${API_BASE}/api/v1/referral/mine/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch referral link');
  return res.json();
}

export async function getMyReferralConversions() {
  const res = await fetch(`${API_BASE}/api/v1/referral/conversions/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch conversions');
  return res.json();
}

export async function getViralDashboard() {
  const res = await fetch(`${API_BASE}/api/v1/viral/dashboard/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch dashboard');
  return res.json();
}

export async function getMyAchievements() {
  const res = await fetch(`${API_BASE}/api/v1/viral/achievements/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch achievements');
  return res.json();
}
