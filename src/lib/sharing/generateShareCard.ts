/**
 * Share card generation utilities for PromptTemple viral system
 */

export interface ShareableOptimization {
  id: string;
  shareId?: string;
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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://prompttemple.vercel.app';

export function generateShareCard(optimization: ShareableOptimization): ShareCard {
  const shareId = optimization.shareId || optimization.id;
  const shareUrl = `${APP_URL}/share/${shareId}`;
  const imageUrl = `${APP_URL}/api/og/share?id=${shareId}&before=${encodeURIComponent(
    optimization.beforeScore.toString()
  )}&after=${encodeURIComponent(optimization.afterScore.toString())}`;

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
