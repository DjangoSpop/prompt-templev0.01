'use client';

import { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'pwa-install-dismissed';
const ENGAGEMENT_KEY = 'pwa-session-count';
const MIN_SESSIONS = 2; // show after 2nd visit

/** Detects iOS Safari (where BeforeInstallPromptEvent is not available) */
function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iP(hone|ad|od)/.test(ua) && /WebKit/.test(ua) && !/CriOS|FxiOS|OPiOS/.test(ua);
}

/** Detects if already installed as a standalone PWA */
function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Never show if already installed or dismissed
    if (isStandalone()) return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    // Increment session counter
    const sessions = parseInt(localStorage.getItem(ENGAGEMENT_KEY) || '0', 10) + 1;
    localStorage.setItem(ENGAGEMENT_KEY, String(sessions));
    if (sessions < MIN_SESSIONS) return;

    const ios = isIOSSafari();
    setIsIOS(ios);

    if (ios) {
      // iOS can't use BeforeInstallPrompt — show guide banner
      setShow(true);
      return;
    }

    // Chrome/Edge: listen for the native install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Hide if user installs via native prompt
    window.addEventListener('appinstalled', () => setInstalled(true));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, '1');
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    dismiss();
  };

  if (!show || installed) return null;

  return (
    <div
      role="banner"
      className={cn(
        'fixed bottom-[env(safe-area-inset-bottom,0px)] inset-x-0 z-[45]',
        // Sit just above the bottom nav (h-16 = 4rem)
        'mb-16 lg:mb-0',
        'mx-3 mb-[calc(4rem+env(safe-area-inset-bottom,0px)+0.75rem)] lg:mx-auto lg:mb-6',
        'lg:max-w-sm lg:right-6 lg:left-auto lg:inset-x-auto',
        'rounded-2xl border border-royal-gold-500/30 bg-obsidian-900/95 backdrop-blur-md',
        'shadow-pyramid-lg p-4',
        'animate-in slide-in-from-bottom duration-300',
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-royal-gold-500/10">
          {isIOS ? (
            <Share className="h-5 w-5 text-royal-gold-400" />
          ) : (
            <Download className="h-5 w-5 text-royal-gold-400" />
          )}
        </div>

        {/* Copy */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-desert-sand-200">
            {isIOS ? 'Add to Home Screen' : 'Install Prompt Temple'}
          </p>
          <p className="mt-0.5 text-xs text-obsidian-400 leading-snug">
            {isIOS
              ? 'Tap the Share button then "Add to Home Screen" for quick access.'
              : 'Install for faster access, offline support, and a native-like experience.'}
          </p>

          {!isIOS && (
            <button
              type="button"
              onClick={handleInstall}
              className="mt-2 rounded-lg bg-royal-gold-500 px-3 py-1.5 text-xs font-semibold text-obsidian-900 hover:bg-royal-gold-400 transition-colors"
            >
              Install App
            </button>
          )}
        </div>

        {/* Dismiss */}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install banner"
          className="shrink-0 rounded-md p-1 text-obsidian-500 hover:bg-obsidian-800 hover:text-obsidian-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
