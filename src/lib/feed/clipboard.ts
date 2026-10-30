/**
 * Copy text that may still be loading (card Copy fetches the full prompt first).
 *
 * Safari only allows clipboard writes inside the click's user activation, so when
 * `ClipboardItem` is available the write starts synchronously with a promised blob;
 * otherwise the text is awaited and written with `writeText`.
 */
export async function copyText(text: string | Promise<string>): Promise<void> {
  const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
  if (!clipboard) throw new Error('Clipboard unavailable');

  if (typeof text !== 'string' && typeof ClipboardItem !== 'undefined' && typeof clipboard.write === 'function') {
    try {
      const blob = text.then((t) => new Blob([t], { type: 'text/plain' }));
      await clipboard.write([new ClipboardItem({ 'text/plain': blob })]);
      return;
    } catch {
      /* fall through to writeText (Firefox rejects promised items) */
    }
  }
  await clipboard.writeText(await text);
}

/** Collapse a prompt to a short readable excerpt (same idea as the backend `compact`). */
export function compactText(text: string, max = 600): string {
  const joined = text
    .split('\n')
    .map((line) => line.split(/\s+/).filter(Boolean).join(' '))
    .filter(Boolean)
    .join('\n');
  if (joined.length <= max) return joined;
  const cut = joined.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return `${space > 0 ? cut.slice(0, space) : cut}…`;
}

export const OPEN_IN_TARGETS = [
  { id: 'chatgpt', label: 'ChatGPT', url: 'https://chatgpt.com/' },
  { id: 'claude', label: 'Claude', url: 'https://claude.ai/new' },
  { id: 'gemini', label: 'Gemini', url: 'https://gemini.google.com/app' },
] as const;
