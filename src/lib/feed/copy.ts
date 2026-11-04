/**
 * Sprint 09 R3.3 — copy the *plain* prompt text, never rendered HTML.
 *
 * `navigator.clipboard.writeText` first; when the API is missing or rejects (no user
 * activation, insecure context, denied permission) a hidden textarea + `execCommand`
 * is tried. Both failing throws `copy_failed` so the caller can select the text and
 * ask the reader to copy manually (`selectText`). Note: a textarea's value normalises
 * CRLF to LF, so only the legacy path can alter line endings; `writeText` never does.
 */

function legacyCopy(text: string): boolean {
  if (typeof document === 'undefined' || typeof document.execCommand !== 'function') return false;
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.setAttribute('aria-hidden', 'true');
  area.style.position = 'fixed';
  area.style.top = '0';
  area.style.left = '-9999px';
  area.style.opacity = '0';
  document.body.appendChild(area);
  let ok = false;
  try {
    area.select();
    area.setSelectionRange(0, text.length);
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

export async function copyPlain(text: string): Promise<void> {
  const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
  if (clipboard && typeof clipboard.writeText === 'function') {
    try {
      await clipboard.writeText(text);
      return;
    } catch {
      /* fall through to the legacy path */
    }
  }
  if (!legacyCopy(text)) throw new Error('copy_failed');
}

/** Select an element's contents so the reader can copy manually (failure path). */
export function selectText(el: HTMLElement): void {
  if (typeof window === 'undefined' || typeof window.getSelection !== 'function') return;
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(el);
  selection.removeAllRanges();
  selection.addRange(range);
}
