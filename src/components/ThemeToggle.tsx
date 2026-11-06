'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { Monitor, Moon, Sun } from 'lucide-react';
import { v2cls } from '@/lib/brand';

type Choice = 'system' | 'light' | 'dark';

const CHOICES: { value: Choice; label: string; Icon: typeof Sun }[] = [
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
];

/**
 * Three-state theme control (System · Light · Dark).
 * Keeps the `ThemeToggle` export name so existing imports keep working.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const current: Choice = (theme as Choice) ?? 'system';

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={`inline-flex items-center gap-0.5 rounded-md border border-border bg-background p-0.5 ${v2cls(
        'v2:rounded-pill v2:border-line v2:bg-surface',
      )}`}
    >
      {CHOICES.map(({ value, label, Icon }) => {
        const selected = current === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${label} theme`}
            title={label}
            onClick={() => setTheme(value)}
            className={`focus-ring inline-flex h-8 min-w-8 items-center justify-center rounded px-2 text-xs font-medium transition-colors ${
              selected ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
            } ${v2cls('v2:rounded-pill v2:duration-tap')} ${selected ? v2cls('v2:bg-faience-soft v2:text-faience') : v2cls('v2:text-ink-muted')}`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
