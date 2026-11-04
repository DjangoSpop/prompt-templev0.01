'use client';

/**
 * R3.2 — colour-coded prompt text. Tokenises once per text (memo), renders lines as
 * <p> / <li> / <pre> / <h4> with `data-kind`, variables as <mark> chips whose inner
 * text is the original characters, so selection and copy stay byte-exact. Colour comes
 * only from the `--pt-*` CSS variables in globals.css.
 *
 * First paint is the head (~600 chars); the tail mounts on the next frame (R2.2). A
 * tokenizer failure falls back to a plain <pre> and reports it (legend chip).
 */
import { Component, memo, useEffect, useMemo, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { headingTitle, lineText, splitLines, tokenize, type Line, type Span, type TokenizeStructure } from '@/lib/feed/tokenize';

export type LegendMode = 'coloured' | 'plain' | 'large';
export const LEGEND_MODES: LegendMode[] = ['coloured', 'plain', 'large'];
export const FIRST_PAINT_CHARS = 600;
const LONG_TEXT_CHARS = 12_000;

export interface PromptTextProps {
  text: string;
  structure?: TokenizeStructure | null;
  rtl?: boolean;
  mode?: LegendMode;
  /** Prefix for heading ids (`<prefix>-h-0`), used by the Outline view. */
  idPrefix: string;
  /** A variable chip was activated → "Fill variables". */
  onVariable?: (name: string) => void;
  /** The tokenizer threw; the plain fallback is showing. */
  onFallback?: () => void;
  /** Render everything at once (tests, SSR of deep links). */
  immediate?: boolean;
  className?: string;
}

const VARIABLE_NAME = /^(?:\{\{\s*|\{|\[|<)([\s\S]*?)(?:\s*\}\}|\}|\]|>)$/;
export function variableName(span: string): string {
  return VARIABLE_NAME.exec(span)?.[1]?.trim() ?? span;
}

function renderSpan(span: Span, i: number, onVariable?: (name: string) => void): ReactNode {
  switch (span.kind) {
    case 'variable':
      return (
        <mark
          key={i}
          data-kind="variable"
          dir="ltr"
          title="Fill variables"
          role={onVariable ? 'button' : undefined}
          tabIndex={onVariable ? 0 : undefined}
          onClick={onVariable ? () => onVariable(variableName(span.text)) : undefined}
          onKeyDown={onVariable ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onVariable(variableName(span.text))) : undefined}
        >
          {span.text}
        </mark>
      );
    case 'inline_code':
      return <code key={i} data-kind="inline_code">{span.text}</code>;
    case 'url':
      return (
        <a key={i} data-kind="url" href={span.text} target="_blank" rel="noopener noreferrer nofollow">
          {span.text}
        </a>
      );
    case 'emphasis':
    case 'number':
      return <span key={i} data-kind={span.kind}>{span.text}</span>;
    default:
      return span.text;
  }
}

type Block = { type: 'list'; lines: Line[] } | { type: 'code'; lines: Line[] } | { type: 'line'; line: Line };

/** Consecutive list/rule lines become one <ul>; consecutive code lines one <pre>. */
export function groupBlocks(lines: Line[]): Block[] {
  const out: Block[] = [];
  for (const line of lines) {
    const last = out[out.length - 1];
    if (line.kind === 'list' || line.kind === 'rule') {
      if (last?.type === 'list') last.lines.push(line);
      else out.push({ type: 'list', lines: [line] });
    } else if (line.kind === 'code') {
      if (last?.type === 'code') last.lines.push(line);
      else out.push({ type: 'code', lines: [line] });
    } else {
      out.push({ type: 'line', line });
    }
  }
  return out;
}

function Blocks({ lines, idPrefix, onVariable, keyOffset }: { lines: Line[]; idPrefix: string; onVariable?: (n: string) => void; keyOffset: number }) {
  return (
    <>
      {groupBlocks(lines).map((block, b) => {
        const key = keyOffset + b;
        if (block.type === 'code') {
          return (
            <pre key={key} data-kind="code">
              {block.lines.map((l) => lineText(l)).join('\n')}
            </pre>
          );
        }
        if (block.type === 'list') {
          return (
            <ul key={key}>
              {block.lines.map((l, i) => (
                <li key={i} data-kind={l.kind} style={l.level ? { marginInlineStart: `${l.level * 0.9}rem` } : undefined}>
                  {l.spans.map((s, j) => renderSpan(s, j, onVariable))}
                </li>
              ))}
            </ul>
          );
        }
        const { line } = block;
        const text = lineText(line);
        if (line.kind === 'heading') {
          return (
            <h4 key={key} id={`${idPrefix}-${line.id ?? `h-${key}`}`} data-kind="heading" data-level={line.level ?? 2} title={headingTitle(line)}>
              {line.spans.map((s, j) => renderSpan(s, j, onVariable))}
            </h4>
          );
        }
        if (!text.trim()) return <p key={key} data-kind="text" data-empty="" aria-hidden />;
        return (
          <p key={key} data-kind={line.kind}>
            {line.spans.map((s, j) => renderSpan(s, j, onVariable))}
          </p>
        );
      })}
    </>
  );
}

function PromptTextInner({ text, structure, rtl, mode = 'coloured', idPrefix, onVariable, immediate, className }: PromptTextProps) {
  const lines = useMemo(() => tokenize(text, structure ?? null), [text, structure]);
  const { head, tail } = useMemo(() => splitLines(lines, FIRST_PAINT_CHARS), [lines]);
  const [showTail, setShowTail] = useState(!!immediate || tail.length === 0);

  useEffect(() => {
    if (showTail || tail.length === 0) return;
    if (typeof requestAnimationFrame !== 'function') {
      setShowTail(true);
      return;
    }
    const id = requestAnimationFrame(() => setShowTail(true));
    return () => cancelAnimationFrame(id);
  }, [showTail, tail.length]);

  return (
    <div
      className={cn('pt-text text-[0.9375rem] leading-relaxed', text.length > LONG_TEXT_CHARS && 'pt-long', rtl && 'font-arabic', className)}
      data-mode={mode}
      dir={rtl ? 'rtl' : undefined}
      data-testid="prompt-text"
      data-tail={showTail ? 'mounted' : 'pending'}
    >
      <Blocks lines={head} idPrefix={idPrefix} onVariable={onVariable} keyOffset={0} />
      {showTail && <Blocks lines={tail} idPrefix={idPrefix} onVariable={onVariable} keyOffset={head.length} />}
    </div>
  );
}

class PromptTextBoundary extends Component<PromptTextProps & { children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFallback?.();
  }
  componentDidUpdate(prev: PromptTextProps) {
    if (prev.text !== this.props.text && this.state.failed) this.setState({ failed: false });
  }
  render() {
    if (this.state.failed) {
      return (
        <pre
          className={cn('whitespace-pre-wrap break-words font-body text-[0.9375rem] leading-relaxed', this.props.rtl && 'font-arabic', this.props.className)}
          dir={this.props.rtl ? 'rtl' : undefined}
          data-testid="prompt-text-plain"
        >
          {this.props.text}
        </pre>
      );
    }
    return this.props.children;
  }
}

export const PromptText = memo(function PromptText(props: PromptTextProps) {
  return (
    <PromptTextBoundary {...props}>
      <PromptTextInner {...props} />
    </PromptTextBoundary>
  );
});
