/**
 * Share card generation utilities for PromptTemple viral system
 */

export interface ShareableOptimization {
  id: string;
  shareId?: string;
  shareToken?: string;
  beforePrompt: string;
  afterPrompt: string;
  beforeScore: number;
  afterScore: number;
  improvements: string[];
  userHandle?: string;
  createdAt?: string;
}

export interface ShareCard {
  imageUrl: string;
  tweetText: string;
  linkedinText: string;
  shareUrl: string;
  copyText: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://prompt-temple.com';

export function generateShareCard(optimization: ShareableOptimization): ShareCard {
  // Prefer backend-backed share URL when a share token is available.
  // Fall back to stateless URL params for crawlers without backend dependency.
  const title = `Prompt Optimized: ${optimization.beforeScore.toFixed(1)} → ${optimization.afterScore.toFixed(1)}/10`;
  const contentPreview = optimization.afterPrompt.slice(0, 300);
  const improvementsList = optimization.improvements.slice(0, 3).join('|');

  let shareUrl: string;
  if (optimization.shareToken) {
    // Backend-backed: short, clean URL with proper OG metadata
    shareUrl = `${APP_URL}/s/${optimization.shareToken}`;
  } else {
    // Stateless fallback
    const shareParams = new URLSearchParams({
      t: title,
      type: 'optimization',
      bs: optimization.beforeScore.toString(),
      s: optimization.afterScore.toString(),
      c: contentPreview,
      ...(improvementsList ? { imp: improvementsList } : {}),
      ...(optimization.shareId || optimization.id ? { id: optimization.shareId || optimization.id } : {}),
    });
    shareUrl = `${APP_URL}/share?${shareParams.toString()}`;
  }

  const imageUrl = `${APP_URL}/api/og/share/optimization?beforeScore=${encodeURIComponent(
    optimization.beforeScore.toString()
  )}&afterScore=${encodeURIComponent(
    optimization.afterScore.toString()
  )}&improvements=${encodeURIComponent(improvementsList)}`;

  const scoreJump = `${optimization.beforeScore.toFixed(1)} → ${optimization.afterScore.toFixed(1)}`;
  const handle = optimization.userHandle ? `@${optimization.userHandle}` : '';

  const tweetText = [
    `Just transformed my prompt from ${scoreJump}/10 🏛️`,
    `PromptTemple is insane — ${optimization.improvements.slice(0, 2).join(' + ')}`,
    handle,
    `Try it free → ${shareUrl}`,
    '#PromptEngineering #AI',
  ]
    .filter(Boolean)
    .join('\n');

  const linkedinText = [
    `🏛️ Prompt engineering just levelled up.`,
    `I went from a ${optimization.beforeScore}/10 prompt to a ${optimization.afterScore}/10 masterpiece in seconds using PromptTemple.`,
    '',
    `Key improvements: ${optimization.improvements.join(', ')}.`,
    '',
    `Whether you're in marketing, coding, or analytics — the quality of your AI prompts determines your output quality. Stop guessing, start optimizing.`,
    '',
    `🔗 ${shareUrl}`,
  ].join('\n');

  const copyText = `My prompt: "${optimization.beforePrompt.slice(0, 80)}..." → Score: ${
    optimization.afterScore
  }/10 | Made with PromptTemple ${shareUrl}`;

  return { imageUrl, tweetText, linkedinText, shareUrl, copyText };
}

/**
 * Generate a stateless share URL for any content type.
 * All data is embedded in query params — no backend dependency.
 */
export function generateShareUrl(params: {
  title: string;
  description?: string;
  content?: string;
  score?: number;
  beforeScore?: number;
  type?: 'prompt' | 'optimization' | 'template' | 'broadcast';
  category?: string;
  improvements?: string[];
  id?: string;
}): string {
  const searchParams = new URLSearchParams();
  searchParams.set('t', params.title.slice(0, 200));
  if (params.type) searchParams.set('type', params.type);
  if (params.description) searchParams.set('d', params.description.slice(0, 300));
  if (params.content) searchParams.set('c', params.content.slice(0, 500));
  if (params.score !== undefined) searchParams.set('s', params.score.toString());
  if (params.beforeScore !== undefined) searchParams.set('bs', params.beforeScore.toString());
  if (params.category) searchParams.set('cat', params.category);
  if (params.improvements?.length) searchParams.set('imp', params.improvements.slice(0, 5).join('|'));
  if (params.id) searchParams.set('id', params.id);

  return `${APP_URL}/share?${searchParams.toString()}`;
}

export function openTwitterShare(text: string): void {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'width=600,height=450,noopener');
}

export function openLinkedInShare(url: string, text: string): void {
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  window.open(shareUrl, '_blank', 'width=600,height=700,noopener');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  }
}
