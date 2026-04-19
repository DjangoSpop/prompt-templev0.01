'use client';

import { useEffect, useState } from 'react';
import { isDesktop } from '@/lib/env';

type ShortcutKey = 'quickCapture' | 'mainWindow';

interface ShortcutMap {
  quickCapture: string;
  mainWindow: string;
}

interface PromptTempleAPI {
  getShortcuts(): Promise<ShortcutMap>;
  setShortcut(key: ShortcutKey, accelerator: string): Promise<boolean>;
  getAutoLaunch(): Promise<boolean>;
  setAutoLaunch(enabled: boolean): Promise<boolean>;
  platform: string;
}

declare global {
  interface Window {
    promptTemple?: PromptTempleAPI;
  }
}

const LABELS: Record<ShortcutKey, string> = {
  quickCapture: 'Quick Capture overlay',
  mainWindow: 'Open main window',
};

const HELP: Record<ShortcutKey, string> = {
  quickCapture: 'Press anywhere on the OS to open the small capture overlay.',
  mainWindow: 'Press anywhere to bring the full Prompt Temple window forward.',
};

export default function ShortcutsSettingsPage() {
  const [shortcuts, setShortcuts] = useState<ShortcutMap | null>(null);
  const [autoLaunch, setAutoLaunch] = useState<boolean>(false);
  const [recordingFor, setRecordingFor] = useState<ShortcutKey | null>(null);
  const [recordedKeys, setRecordedKeys] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState<ShortcutKey | null>(null);

  useEffect(() => {
    if (!isDesktop) return;
    const api = window.promptTemple!;
    void Promise.all([api.getShortcuts(), api.getAutoLaunch()]).then(([s, a]) => {
      setShortcuts(s);
      setAutoLaunch(a);
    });
  }, []);

  // Capture keystrokes when recording.
  useEffect(() => {
    if (!recordingFor) return;
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === 'Escape') {
        setRecordingFor(null);
        setRecordedKeys('');
        return;
      }
      const parts: string[] = [];
      if (e.metaKey || e.ctrlKey) parts.push('CommandOrControl');
      if (e.altKey) parts.push('Alt');
      if (e.shiftKey) parts.push('Shift');
      const k = e.key;
      if (k && !['Meta', 'Control', 'Alt', 'Shift'].includes(k)) {
        const normalized = k.length === 1 ? k.toUpperCase() : k;
        parts.push(normalized === ' ' ? 'Space' : normalized);
        const accel = parts.join('+');
        setRecordedKeys(accel);
        void commit(recordingFor, accel);
      } else {
        setRecordedKeys(parts.join('+') + '+…');
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [recordingFor]);

  async function commit(key: ShortcutKey, accelerator: string) {
    setError(null);
    const api = window.promptTemple!;
    const ok = await api.setShortcut(key, accelerator);
    if (!ok) {
      setError(`Could not register ${accelerator}. Another app is using it.`);
      // Refresh from store to revert UI to whatever stuck.
      setShortcuts(await api.getShortcuts());
    } else {
      setShortcuts((prev) => (prev ? { ...prev, [key]: accelerator } : prev));
      setSavedFlash(key);
      setTimeout(() => setSavedFlash(null), 1200);
    }
    setRecordingFor(null);
    setRecordedKeys('');
  }

  async function toggleAutoLaunch() {
    if (!isDesktop) return;
    const next = !autoLaunch;
    setAutoLaunch(next);
    await window.promptTemple!.setAutoLaunch(next);
  }

  if (!isDesktop) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-2xl font-display mb-4">Desktop Shortcuts</h1>
        <p className="text-muted-foreground">
          This page is only available in the Prompt Temple desktop app.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8">
      <header>
        <h1 className="text-2xl font-display">Desktop Shortcuts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Global hotkeys work from any app on your system.
        </p>
      </header>

      <section className="space-y-4">
        {(Object.keys(LABELS) as ShortcutKey[]).map((key) => {
          const value = shortcuts?.[key] ?? '…';
          const isRecording = recordingFor === key;
          return (
            <div
              key={key}
              className="flex items-center justify-between p-4 rounded-lg border border-gold-accent/20 bg-secondary/20"
            >
              <div>
                <div className="font-medium">{LABELS[key]}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{HELP[key]}</div>
              </div>
              <div className="flex items-center gap-2">
                <code className="px-3 py-1.5 rounded border border-gold-accent/30 bg-background/60 text-sm font-mono min-w-[180px] text-center">
                  {isRecording ? recordedKeys || 'Press a combination…' : value}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setRecordingFor(isRecording ? null : key);
                    setRecordedKeys('');
                  }}
                  className="px-3 py-1.5 rounded border border-gold-accent/40 text-sm hover:bg-gold-accent/10 transition-colors"
                >
                  {isRecording ? 'Cancel' : 'Rebind'}
                </button>
                {savedFlash === key && (
                  <span className="text-xs text-green-500">Saved</span>
                )}
              </div>
            </div>
          );
        })}

        {error && (
          <div className="p-3 rounded border border-red-500/40 bg-red-900/20 text-sm text-red-300">
            {error}
          </div>
        )}
      </section>

      <section className="pt-4 border-t border-gold-accent/10">
        <label className="flex items-center justify-between">
          <div>
            <div className="font-medium">Launch on system startup</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Start Prompt Temple hidden in the tray when you log in.
            </div>
          </div>
          <input
            type="checkbox"
            checked={autoLaunch}
            onChange={() => void toggleAutoLaunch()}
            className="w-5 h-5"
          />
        </label>
      </section>
    </div>
  );
}
