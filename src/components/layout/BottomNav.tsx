'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Globe,
  BookOpen,
  Sparkles,
  User,
  Compass,
  Gem,
  Zap,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

const AUTH_NAV_ITEMS = [
  { href: '/dashboard',  label: 'Home',       icon: Home     },
  { href: '/discover',   label: 'Discover',   icon: Globe    },
  { href: '/templates',  label: 'Templates',  icon: BookOpen },
  { href: '/playground', label: 'Playground', icon: Sparkles },
  { href: '/profile',    label: 'Profile',    icon: User     },
] as const;

const PUBLIC_NAV_ITEMS = [
  { href: '/discover',  label: 'Discover',  icon: Compass  },
  { href: '/templates', label: 'Templates', icon: BookOpen },
  { href: '/skills',    label: 'Skills',    icon: Gem      },
  { href: '/mcp',       label: 'MCPs',      icon: Zap      },
  { href: '/academy',   label: 'Academy',   icon: Crown    },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const navItems = isAuthenticated ? AUTH_NAV_ITEMS : PUBLIC_NAV_ITEMS;

  // Hide on full-screen module pages — they have their own navigation footer
  const isModulePage = pathname.startsWith('/academy/module');
  if (isModulePage) return null;

  return (
    <>
      <nav
        aria-label="Main navigation"
        className={cn(
          'fixed bottom-0 inset-x-0 z-40',
          'flex h-16 items-stretch',
          'border-t border-royal-gold-500/20 bg-obsidian-900/95 backdrop-blur-xl',
          'pb-safe',          // iOS home-indicator clearance
          'lg:hidden',        // hidden on desktop — sidebar takes over
        )}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-0.5',
                'min-h-[44px] min-w-[44px] text-[10px] font-medium transition-colors',
                active
                  ? 'text-royal-gold-400'
                  : 'text-obsidian-400 hover:text-obsidian-200'
              )}
            >
              {/* Active top border indicator */}
              {active && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-royal-gold-400" />
              )}
              <Icon
                className={cn('h-5 w-5', active && 'drop-shadow-[0_0_6px_rgba(203,161,53,0.6)]')}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Spacer so page content isn't hidden behind the nav bar */}
      <div className="h-16 pb-safe lg:hidden" aria-hidden="true" />
    </>
  );
}
