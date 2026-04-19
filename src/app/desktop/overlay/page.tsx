'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { sseClient } from '@/lib/tryme/sseClient';
import { getGuestSessionId } from '@/lib/tryme/session';

type Status = 'idle' | 'streaming' | 'done' | 'error';

interface OverlayBridge {
  onOpen: (handler: (payload: { sourceText: string; timestamp: number }) => void) => () => void;
  hide: () => void;
  copy: (text: string) => Promise<boolean>;
  openInMain: () => void;
}

declare global {
  interface Window {
    promptTempleOverlay?: OverlayBridge;
  }
}

export default function OverlayPage() {
  const [input, setInput] = useState('');
  const [streamBuffer, setStreamBuffer] = useState('');
  const [finalResult, setFinalResult] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedFlash, setCopiedFlash] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Wire up the IPC `overlay:open` event so the textarea pre-fills with
  // whatever's on the clipboard each time the hotkey fires.
  useEffect(() => {
    const bridge = window.promptTempleOverlay;
    if (!bridge) return;
    return bridge.onOpen((payload) => {
      setStreamBuffer('');
      setFinalResult('');
      setErrorMsg('');
      setStatus('idle');
      setInput(payload.sourceText ?? '');
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      });
    });
  }, []);

  // Esc dismisses the overlay.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        window.promptTempleOverlay?.hide();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const enhance = useCallback(async () => {
    const prompt = input.trim();
    if (!prompt || status === 'streaming') return;
    setStatus('streaming');
    setStreamBuffer('');
    setFinalResult('');
    setErrorMsg('');

    try {
      await sseClient.optimizePrompt(
        {
          prompt,
          guest_session_id: getGuestSessionId(),
          model: 'deepseek-chat',
          temperature: 0.7,
          max_tokens: 1024,
        },
        {
          onToken: ({ token }) => setStreamBuffer((prev) => prev + token),
          onResult: ({ after }) => {
            setFinalResult(after);
            setStatus('done');
          },
          onError: ({ message }) => {
            setErrorMsg(message || 'Optimization failed');
            setStatus('error');
          },
          onComplete: () => {
            setStatus((prev) => (prev === 'streaming' ? 'done' : prev));
          },
        }
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  }, [input, status]);

  const copyAndHide = useCallback(async () => {
    const text = finalResult || streamBuffer;
    if (!text.trim()) return;
    const bridge = window.promptTempleOverlay;
    if (bridge) {
      await bridge.copy(text);
    } else {
      await navigator.clipboard.writeText(text);
      setCopiedFlash(true);
      setTimeout(() => setCopiedFlash(false), 800);
    }
  }, [finalResult, streamBuffer]);

  // Cmd/Ctrl+Enter: if there's no result yet, run enhance; otherwise copy + hide.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (finalResult || streamBuffer) {
          void copyAndHide();
        } else {
          void enhance();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enhance, copyAndHide, finalResult, streamBuffer]);

  const displayedResult = finalResult || streamBuffer;
  const hasResult = displayedResult.trim().length > 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100vh',
          background: 'linear-gradient(160deg, rgba(11, 18, 32, 0.96), rgba(30, 58, 138, 0.92))',
          border: '1px solid rgba(201, 162, 39, 0.55)',
          borderRadius: 12,
          boxShadow: '0 18px 60px rgba(0, 0, 0, 0.55)',
          color: '#EBD5A7',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: "'Crimson Pro', 'Inter', sans-serif",
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px',
            borderBottom: '1px solid rgba(201, 162, 39, 0.18)',
            // Allow the user to drag the frameless window from the header.
            WebkitAppRegion: 'drag',
          } as React.CSSProperties}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#C9A227',
                boxShadow: '0 0 8px rgba(201, 162, 39, 0.6)',
              }}
            />
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 13,
                letterSpacing: '0.08em',
                color: '#EBD5A7',
                textTransform: 'uppercase',
              }}
            >
              Quick Capture
            </span>
          </div>
          <button
            type="button"
            onClick={() => window.promptTempleOverlay?.hide()}
            style={
              {
                WebkitAppRegion: 'no-drag',
                background: 'transparent',
                border: 'none',
                color: 'rgba(235, 213, 167, 0.7)',
                fontSize: 18,
                lineHeight: 1,
                cursor: 'pointer',
                padding: '2px 6px',
              } as React.CSSProperties
            }
            aria-label="Close overlay (Esc)"
          >
            ×
          </button>
        </header>

        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            padding: 14,
            minHeight: 0,
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste or type a prompt to enhance…"
            spellCheck
            style={{
              flex: hasResult ? '0 0 auto' : 1,
              minHeight: 70,
              maxHeight: hasResult ? 100 : undefined,
              resize: 'none',
              padding: '10px 12px',
              background: 'rgba(11, 18, 32, 0.55)',
              border: '1px solid rgba(201, 162, 39, 0.25)',
              borderRadius: 8,
              color: '#F5E9C7',
              fontSize: 14,
              lineHeight: 1.5,
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />

          {hasResult || status === 'streaming' ? (
            <div
              style={{
                flex: 1,
                minHeight: 80,
                padding: '10px 12px',
                background: 'rgba(201, 162, 39, 0.06)',
                border: '1px solid rgba(201, 162, 39, 0.35)',
                borderRadius: 8,
                color: '#FFF7DC',
                fontSize: 13.5,
                lineHeight: 1.55,
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {displayedResult || (
                <span style={{ color: 'rgba(235, 213, 167, 0.5)' }}>
                  The Sacred Forge is at work…
                </span>
              )}
            </div>
          ) : null}

          {status === 'error' && errorMsg ? (
            <div
              style={{
                fontSize: 12,
                color: '#FCA5A5',
                padding: '6px 10px',
                background: 'rgba(127, 29, 29, 0.35)',
                border: '1px solid rgba(248, 113, 113, 0.5)',
                borderRadius: 6,
              }}
            >
              {errorMsg}
            </div>
          ) : null}
        </main>

        <footer
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderTop: '1px solid rgba(201, 162, 39, 0.18)',
            background: 'rgba(11, 18, 32, 0.45)',
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: 'rgba(235, 213, 167, 0.6)',
              letterSpacing: '0.04em',
            }}
          >
            {hasResult
              ? '⌘/Ctrl + Enter to copy · Esc to close'
              : '⌘/Ctrl + Enter to enhance · Esc to close'}
          </span>

          <div style={{ display: 'flex', gap: 6 }}>
            {hasResult ? (
              <button
                type="button"
                onClick={copyAndHide}
                style={primaryButtonStyle()}
              >
                {copiedFlash ? 'Copied' : 'Copy'}
              </button>
            ) : (
              <button
                type="button"
                onClick={enhance}
                disabled={!input.trim() || status === 'streaming'}
                style={primaryButtonStyle(!input.trim() || status === 'streaming')}
              >
                {status === 'streaming' ? 'Enhancing…' : 'Enhance'}
              </button>
            )}
            <button
              type="button"
              onClick={() => window.promptTempleOverlay?.openInMain()}
              style={secondaryButtonStyle()}
            >
              Open in main
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function primaryButtonStyle(disabled = false): React.CSSProperties {
  return {
    padding: '7px 14px',
    fontSize: 12.5,
    fontFamily: 'inherit',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: disabled ? 'rgba(11, 18, 32, 0.55)' : '#0B1220',
    background: disabled
      ? 'rgba(201, 162, 39, 0.35)'
      : 'linear-gradient(135deg, #C9A227, #EBD5A7)',
    border: '1px solid rgba(201, 162, 39, 0.7)',
    borderRadius: 6,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'transform 80ms ease, filter 120ms ease',
  };
}

function secondaryButtonStyle(): React.CSSProperties {
  return {
    padding: '7px 12px',
    fontSize: 12.5,
    fontFamily: 'inherit',
    fontWeight: 500,
    letterSpacing: '0.04em',
    color: '#EBD5A7',
    background: 'transparent',
    border: '1px solid rgba(201, 162, 39, 0.35)',
    borderRadius: 6,
    cursor: 'pointer',
  };
}
