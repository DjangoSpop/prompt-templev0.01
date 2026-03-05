/**
 * Chrome extension communication utilities.
 * Extension ID: olojhcohjhnhjnemhpgjiammpkeincon
 *
 * For chrome.runtime.sendMessage to work from the web page, the extension's
 * manifest.json must include:
 *   "externally_connectable": { "matches": ["https://yourdomain.com/*"] }
 *
 * Fallback: window.postMessage is used for content-script based communication.
 */

export const EXTENSION_ID = 'olojhcohjhnhjnemhpgjiammpkeincon';
export const CHROME_STORE_URL = `https://chromewebstore.google.com/detail/${EXTENSION_ID}`;

export type ExtensionMessage =
  | { type: 'PROMPTTEMPLE_USE_PROMPT'; payload: PromptPayload }
  | { type: 'PROMPTTEMPLE_PING' };

export interface PromptPayload {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
}

/** Returns true if we're in a browser context with Chrome APIs available. */
function hasChromeRuntime(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof (window as any).chrome !== 'undefined' &&
    typeof (window as any).chrome?.runtime?.sendMessage === 'function'
  );
}

/**
 * Detects whether the PromptTemple extension is installed and responsive.
 * Resolves to true/false, never rejects.
 */
export async function detectExtension(): Promise<boolean> {
  if (!hasChromeRuntime()) return false;
  return new Promise((resolve) => {
    try {
      (window as any).chrome.runtime.sendMessage(
        EXTENSION_ID,
        { type: 'PROMPTTEMPLE_PING' },
        (response: unknown) => {
          const err = (window as any).chrome.runtime.lastError;
          resolve(!err && response != null);
        }
      );
      // Safety timeout — if the extension never responds, treat as not installed
      setTimeout(() => resolve(false), 1000);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Sends a prompt to the extension via chrome.runtime.sendMessage.
 * Falls back to window.postMessage for content-script listeners.
 * Returns true if the extension acknowledged the message.
 */
export async function sendPromptToExtension(prompt: PromptPayload): Promise<boolean> {
  const message: ExtensionMessage = { type: 'PROMPTTEMPLE_USE_PROMPT', payload: prompt };

  // Primary: chrome.runtime.sendMessage (requires externally_connectable in manifest)
  if (hasChromeRuntime()) {
    const acked = await new Promise<boolean>((resolve) => {
      try {
        (window as any).chrome.runtime.sendMessage(EXTENSION_ID, message, (response: unknown) => {
          const err = (window as any).chrome.runtime.lastError;
          resolve(!err);
        });
        setTimeout(() => resolve(false), 2000);
      } catch {
        resolve(false);
      }
    });
    if (acked) return true;
  }

  // Fallback: postMessage (content script must listen for PROMPTTEMPLE_USE_PROMPT)
  window.postMessage({ source: 'prompttemple-web', ...message }, '*');
  return false; // can't confirm ack via postMessage
}
