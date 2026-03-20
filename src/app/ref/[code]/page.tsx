import type { Metadata } from 'next';
import ReferralLanding from './ReferralLanding';

const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://prompt-temple.com').replace(/\/$/, '');
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com';

interface ReferralData {
  referrer_name: string;
  signup_url: string;
  welcome_bonus: number;
}

async function fetchReferral(code: string): Promise<ReferralData | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE}/api/v1/ref/${code}/`, {
      signal: controller.signal,
      next: { revalidate: 300 },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const referral = await fetchReferral(code);

  const referrerName = referral?.referrer_name || 'a friend';
  const ogTitle = `Join Prompt Temple — Invited by ${referrerName}`;
  const ogDescription = `${referrerName} invited you to PromptTemple. Get 25 free credits and start optimizing your AI prompts.`;

  return {
    title: ogTitle,
    description: ogDescription,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: 'website',
      siteName: 'PromptTemple',
      url: `${SITE_URL}/ref/${code}`,
      images: [{ url: `${SITE_URL}/api/og/share`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [`${SITE_URL}/api/og/share`],
      creator: '@prompttemple',
    },
    robots: { index: false, follow: true },
  };
}

export default async function ReferralPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const referral = await fetchReferral(code);

  return (
    <ReferralLanding
      code={code}
      referrerName={referral?.referrer_name || null}
      welcomeBonus={referral?.welcome_bonus || 25}
    />
  );
}
