'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Zap, MessageSquare, Library, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACTIONS = [
  { href: '/optimization?new=1', label: 'New Prompt',    icon: Zap          },
  { href: '/threads',            label: 'Playground',    icon: MessageSquare },
  { href: '/prompt-library',    label: 'Library',        icon: Library       },
] as const;

interface Props {
  /** Pages where the FAB should be rendered (checked against window.location.pathname prefix) */
  showOnPaths?: string[];
}

export function FloatingActionButton({ showOnPaths = ['/dashboard', '/prompt-library', '/optimization'] }: Props) {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click / tap
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [expanded]);

  // Close on ESC
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpanded(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [expanded]);

  return (
    <div
      ref={containerRef}
      className={cn(
        // Position: above bottom nav (h-16) with extra gap + safe area
        'fixed right-4 z-40 flex flex-col-reverse items-end gap-2',
        'bottom-[calc(4rem+env(safe-area-inset-bottom,0px)+1rem)]',
        // Hide on desktop (sidebar handles nav)
        'lg:hidden',
      )}
    >
      {/* Quick-action items — revealed when expanded */}
      {expanded && ACTIONS.map(({ href, label, icon: Icon }, i) => (
        <Link
          key={href}
          href={href}
          onClick={() => setExpanded(false)}
          aria-label={label}
          style={{ animationDelay: `${i * 40}ms` }}
          className={cn(
            'flex items-center gap-2 rounded-full',
            'border border-royal-gold-500/30 bg-obsidian-900/95 backdrop-blur-sm',
            'px-3 py-2 text-xs font-medium text-desert-sand-200 shadow-pyramid',
            'hover:bg-obsidian-800 transition-colors',
            'animate-in fade-in slide-in-from-bottom-2 duration-200',
          )}
        >
          <Icon className="h-3.5 w-3.5 text-royal-gold-400" />
          {label}
        </Link>
      ))}

      {/* Main FAB button */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-label={expanded ? 'Close quick actions' : 'Quick actions'}
        aria-expanded={expanded}
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full shadow-pyramid-lg',
          'transition-all duration-200',
          expanded
            ? 'bg-obsidian-800 border border-royal-gold-500/40 rotate-45'
            : 'bg-gradient-to-br from-royal-gold-500 to-royal-gold-700 hover:from-royal-gold-400 hover:to-royal-gold-600',
        )}
      >
        {expanded
          ? <X className="h-5 w-5 text-desert-sand-200" />
          : <Plus className="h-5 w-5 text-obsidian-900" strokeWidth={2.5} />
        }
      </button>
    </div>
  );
}
