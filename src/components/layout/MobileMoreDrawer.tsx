'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import {
  BookOpen,
  TrendingUp,
  Crown,
  Settings,
  HelpCircle,
  Download,
  User,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MORE_ITEMS = [
  { href: '/templates',  label: 'Templates',  icon: BookOpen    },
  { href: '/analysis',   label: 'Analytics',  icon: TrendingUp  },
  { href: '/academy',    label: 'Academy',    icon: Crown       },
  { href: '/settings',   label: 'Settings',   icon: Settings    },
  { href: '/profile',    label: 'Profile',    icon: User        },
  { href: '/help',       label: 'Help',       icon: HelpCircle  },
  { href: '/download',   label: 'Download',   icon: Download    },
] as const;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MobileMoreDrawer({ open, onClose }: Props) {
  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="More navigation"
        className={cn(
          'fixed bottom-0 inset-x-0 z-50 lg:hidden',
          'rounded-t-2xl bg-obsidian-900 border-t border-royal-gold-500/20',
          'pb-safe',
          'animate-in slide-in-from-bottom duration-300',
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
          <div className="h-1 w-10 rounded-full bg-obsidian-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm font-semibold text-desert-sand-300">More</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-obsidian-400 hover:bg-obsidian-800 hover:text-obsidian-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Grid of links */}
        <nav className="grid grid-cols-4 gap-1 px-4 pb-6">
          {MORE_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 rounded-xl p-3',
                'min-h-[72px] text-[11px] font-medium',
                'text-obsidian-300 hover:bg-obsidian-800 hover:text-desert-sand-300',
                'transition-colors',
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.8} />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
