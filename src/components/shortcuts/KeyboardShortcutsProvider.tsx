'use client';

import { useState, useEffect, useCallback } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ShortcutsModal } from './ShortcutsModal';
import { CommandPalette } from './CommandPalette';

/**
 * Mount once in the root layout (client-only).
 * Registers global keyboard shortcuts and renders the shortcuts help modal
 * plus the command palette (Cmd/Ctrl+K or "/").
 */
export function KeyboardShortcutsProvider() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [paletteOpen,   setPaletteOpen]   = useState(false);

  const openShortcuts  = useCallback(() => setShortcutsOpen(true),  []);
  const closeShortcuts = useCallback(() => setShortcutsOpen(false), []);
  const closePalette   = useCallback(() => setPaletteOpen(false),   []);

  useKeyboardShortcuts({ onOpenShortcutsModal: openShortcuts });

  // Cmd/Ctrl+K → toggle command palette
  // "/" → open command palette (skip when user is typing in an input)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditable =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }

      if (e.key === '/' && !isEditable) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <ShortcutsModal open={shortcutsOpen} onClose={closeShortcuts} />
      <CommandPalette open={paletteOpen}   onClose={closePalette}   />
    </>
  );
}
