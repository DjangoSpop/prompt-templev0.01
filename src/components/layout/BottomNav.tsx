'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Library,
  Zap,
  MessageSquare,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { MobileMoreDrawer } from './MobileMoreDrawer';

const PRIMARY_ITEMS = [
  { href: '/dashboard',      label: 'Home',      icon: LayoutDashboard },
  { href: '/prompt-library', label: 'Library',   icon: Library         },
  { href: '/optimization',   label: 'Optimizer', icon: Zap             },
  { href: '/threads',        label: 'Playground', icon: MessageSquare  },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Main navigation"
        className={cn(
          'fixed bottom-0 inset-x-0 z-40',
          'flex h-16 items-stretch',
          'border-t border-royal-gold-500/20 bg-obsidian-900',
          'pb-safe',          // iOS home-indicator clearance
          'lg:hidden',        // hidden on desktop — sidebar takes over
        )}
      >
        {PRIMARY_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5',
                'min-h-[44px] min-w-[44px] text-[10px] font-medium transition-colors',
                active
                  ? 'text-royal-gold-400'
                  : 'text-obsidian-400 hover:text-obsidian-200'
              )}
            >
              <Icon
                className={cn('h-5 w-5', active && 'drop-shadow-[0_0_6px_rgba(203,161,53,0.6)]')}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span>{label}</span>
              {active && (
                <span className="absolute bottom-[calc(env(safe-area-inset-bottom,0px)+2px)] h-0.5 w-8 rounded-full bg-royal-gold-400" />
              )}
            </Link>
          );
        })}

        {/* More */}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-label="More navigation options"
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-0.5',
            'min-h-[44px] min-w-[44px] text-[10px] font-medium transition-colors',
            'text-obsidian-400 hover:text-obsidian-200',
          )}
        >
          <MoreHorizontal className="h-5 w-5" strokeWidth={1.8} />
          <span>More</span>
        </button>
      </nav>

      {/* Spacer so page content isn't hidden behind the nav bar */}
      <div className="h-16 pb-safe lg:hidden" aria-hidden="true" />

      <MobileMoreDrawer open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
