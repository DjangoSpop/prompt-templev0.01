'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Library,
  Zap,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Settings,
  HelpCircle,
  Crown,
  History,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string[];
}

const COMMANDS: CommandItem[] = [
  { id: 'dashboard',    label: 'Dashboard',       description: 'Overview & analytics',       href: '/dashboard',      icon: LayoutDashboard, keywords: ['home', 'overview'] },
  { id: 'library',      label: 'Prompt Library',  description: 'Browse saved prompts',       href: '/prompt-library', icon: Library,         keywords: ['prompts', 'browse', 'save'] },
  { id: 'optimizer',    label: 'Optimizer',       description: 'AI prompt optimization',     href: '/optimization',   icon: Zap,             keywords: ['optimize', 'improve', 'ai'] },
  { id: 'new-prompt',   label: 'New Prompt',      description: 'Start with a blank prompt',  href: '/optimization?new=1', icon: Zap,         keywords: ['create', 'blank', 'new'] },
  { id: 'playground',   label: 'Playground',      description: 'Chat threads',               href: '/threads',        icon: MessageSquare,   keywords: ['chat', 'conversation'] },
  { id: 'templates',    label: 'Templates',       description: 'Prompt templates library',   href: '/templates',      icon: BookOpen,        keywords: ['template', 'library'] },
  { id: 'analytics',    label: 'Analytics',       description: 'Performance insights',       href: '/analysis',       icon: TrendingUp,      keywords: ['stats', 'insights', 'metrics'] },
  { id: 'history',      label: 'History',         description: 'Past sessions',              href: '/history',        icon: History,         keywords: ['past', 'recent'] },
  { id: 'academy',      label: 'Academy',         description: 'Learning modules',           href: '/academy',        icon: Crown,           keywords: ['learn', 'course', 'tutorial'] },
  { id: 'settings',     label: 'Settings',        description: 'Account & preferences',      href: '/settings',       icon: Settings,        keywords: ['account', 'preferences', 'config'] },
  { id: 'help',         label: 'Help',            description: 'Documentation & support',    href: '/help',           icon: HelpCircle,      keywords: ['docs', 'support', 'faq'] },
];

function score(item: CommandItem, query: string): number {
  const q = query.toLowerCase();
  const label = item.label.toLowerCase();
  const kw = (item.keywords ?? []).join(' ').toLowerCase();
  if (label.startsWith(q)) return 3;
  if (label.includes(q)) return 2;
  if (kw.includes(q)) return 1;
  return 0;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const results = useMemo(() => {
    if (!query.trim()) return COMMANDS;
    return COMMANDS
      .map((item) => ({ item, s: score(item, query) }))
      .filter(({ s }) => s > 0)
      .sort((a, b) => b.s - a.s)
      .map(({ item }) => item);
  }, [query]);

  // Reset when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keep active item visible
  useEffect(() => {
    const el = listRef.current?.children[activeIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  const navigate = useCallback((href: string) => {
    router.push(href);
    onClose();
  }, [router, onClose]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && results[activeIdx]) { navigate(results[activeIdx].href); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, results, activeIdx, navigate, onClose]);

  // Reset active index when results change
  useEffect(() => setActiveIdx(0), [results]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Palette */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className={cn(
          'fixed left-1/2 top-[15%] z-[60] w-full max-w-lg -translate-x-1/2',
          'rounded-2xl border border-royal-gold-500/20 bg-obsidian-900 shadow-pyramid-lg',
          'animate-in zoom-in-95 fade-in duration-150',
          'overflow-hidden',
        )}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-royal-gold-500/10 px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-obsidian-500" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages and actions…"
            className="flex-1 bg-transparent text-sm text-desert-sand-200 placeholder-obsidian-500 focus:outline-none"
            aria-label="Command palette search"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden rounded border border-obsidian-700 bg-obsidian-800 px-1.5 py-0.5 font-mono text-[10px] text-obsidian-500 sm:inline">
            esc
          </kbd>
        </div>

        {/* Results */}
        <ul
          ref={listRef}
          role="listbox"
          aria-label="Commands"
          className="max-h-72 overflow-y-auto py-2"
        >
          {results.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-obsidian-500">
              No results for &ldquo;{query}&rdquo;
            </li>
          ) : results.map((item, idx) => {
            const Icon = item.icon;
            const active = idx === activeIdx;
            return (
              <li
                key={item.id}
                role="option"
                aria-selected={active}
                onClick={() => navigate(item.href)}
                onMouseEnter={() => setActiveIdx(idx)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors',
                  active
                    ? 'bg-royal-gold-500/10 text-desert-sand-100'
                    : 'text-obsidian-300 hover:bg-obsidian-800'
                )}
              >
                <div className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  active ? 'bg-royal-gold-500/20' : 'bg-obsidian-800'
                )}>
                  <Icon className={cn('h-4 w-4', active ? 'text-royal-gold-400' : 'text-obsidian-500')} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.label}</p>
                  {item.description && (
                    <p className="text-[11px] text-obsidian-500 truncate">{item.description}</p>
                  )}
                </div>
                {active && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-royal-gold-500" />}
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-royal-gold-500/10 px-4 py-2 text-[10px] text-obsidian-600">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> open</span>
          <span><kbd className="font-mono">esc</kbd> close</span>
        </div>
      </div>
    </>
  );
}
