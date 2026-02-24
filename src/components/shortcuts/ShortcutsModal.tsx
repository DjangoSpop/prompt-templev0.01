'use client';

import { useEffect, useRef } from 'react';
import { X, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SHORTCUT_MAP } from '@/hooks/useKeyboardShortcuts';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ open, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus close button when opened; restore focus on close
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else      document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-modal-title"
        className={cn(
          'fixed inset-x-4 bottom-0 z-50 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2',
          'w-full sm:w-full sm:max-w-md',
          'rounded-t-2xl sm:rounded-2xl',
          'border border-royal-gold-500/20 bg-obsidian-900 shadow-pyramid-lg',
          'animate-in slide-in-from-bottom sm:zoom-in-95 duration-200',
          'max-h-[85dvh] overflow-y-auto',
        )}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden" aria-hidden="true">
          <div className="h-1 w-10 rounded-full bg-obsidian-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-royal-gold-500/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-royal-gold-400" />
            <h2 id="shortcuts-modal-title" className="text-sm font-semibold text-desert-sand-200">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-obsidian-400 hover:bg-obsidian-800 hover:text-obsidian-100 focus:outline-none focus:ring-2 focus:ring-royal-gold-500"
            aria-label="Close shortcuts"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Shortcut groups */}
        <div className="space-y-5 px-5 py-4">
          {SHORTCUT_MAP.map(({ group, shortcuts }) => (
            <div key={group}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-royal-gold-500/70">
                {group}
              </p>
              <div className="space-y-1.5">
                {shortcuts.map(({ keys, display, label }) => (
                  <div key={keys} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-obsidian-300">{label}</span>
                    <kbd className="rounded-md border border-obsidian-700 bg-obsidian-800 px-2 py-0.5 font-mono text-xs text-desert-sand-300 whitespace-nowrap">
                      {display}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="border-t border-royal-gold-500/10 px-5 py-3 text-center text-[11px] text-obsidian-500">
          Press <kbd className="rounded border border-obsidian-700 bg-obsidian-800 px-1 font-mono text-obsidian-400">?</kbd> anywhere to toggle this panel
        </div>
      </div>
    </>
  );
}
