'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface ShortcutHandler {
  /** Display label shown in the shortcuts modal */
  label: string;
  /** Key sequence: single char or two-char combo like 'gl' */
  keys: string;
  /** Human-readable keys display, e.g. "G then L" */
  display: string;
  handler: () => void;
}

/** Returns true if the event target is an editable element (skip shortcuts there) */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

interface Options {
  onOpenShortcutsModal: () => void;
}

export function useKeyboardShortcuts({ onOpenShortcutsModal }: Options) {
  const router = useRouter();
  // Tracks first key of a two-key sequence (e.g. "G" in "G→L")
  const pendingKey = useRef<string | null>(null);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPending = useCallback(() => {
    if (pendingTimer.current) clearTimeout(pendingTimer.current);
    pendingKey.current = null;
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip if user is typing in an input / textarea / contenteditable
      if (isEditableTarget(e.target)) return;
      // Skip modifier combos except Cmd/Ctrl+K
      if (e.altKey || e.shiftKey) return;

      // ── Cmd/Ctrl + K → open command palette (handled separately via provider) ──
      // Handled by ShortcutsProvider; nothing to do here.

      const key = e.key.toLowerCase();

      // ── Two-key sequences starting with "g" ──
      if (pendingKey.current === 'g') {
        clearPending();
        switch (key) {
          case 'l': e.preventDefault(); router.push('/prompt-library'); return;
          case 'o': e.preventDefault(); router.push('/optimization');   return;
          case 'p': e.preventDefault(); router.push('/threads');        return;
          case 'd': e.preventDefault(); router.push('/dashboard');      return;
        }
        // Unknown second key — fall through to single-key handlers
      }

      // ── Single-key shortcuts ──
      switch (key) {
        case 'g':
          // Wait for second key (500 ms window)
          pendingKey.current = 'g';
          pendingTimer.current = setTimeout(clearPending, 500);
          return;

        case 'n':
          e.preventDefault();
          router.push('/optimization?new=1');
          return;

        case '?':
          e.preventDefault();
          onOpenShortcutsModal();
          return;

        case 'escape':
          clearPending();
          return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      clearPending();
    };
  }, [router, onOpenShortcutsModal, clearPending]);
}

/** The shortcut map displayed in the ShortcutsModal */
export const SHORTCUT_MAP: { group: string; shortcuts: Omit<ShortcutHandler, 'handler'>[] }[] = [
  {
    group: 'Navigation',
    shortcuts: [
      { keys: 'gl', display: 'G then L', label: 'Go to Library'    },
      { keys: 'go', display: 'G then O', label: 'Go to Optimizer'  },
      { keys: 'gp', display: 'G then P', label: 'Go to Playground' },
      { keys: 'gd', display: 'G then D', label: 'Go to Dashboard'  },
    ],
  },
  {
    group: 'Actions',
    shortcuts: [
      { keys: 'n',    display: 'N',      label: 'New Prompt'              },
      { keys: '/',    display: '/',      label: 'Open Command Palette'    },
      { keys: '?',    display: '?',      label: 'Open Shortcuts Help'     },
      { keys: 'meta+k', display: '⌘ K', label: 'Open Command Palette'   },
    ],
  },
];
