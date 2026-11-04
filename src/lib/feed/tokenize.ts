/**
 * Sprint 09 R3.1 — semantic tokenizer for prompt text.
 *
 * Pure and dependency-free (the Chrome extension imports it next sprint). Lines are
 * classified by meaning (role, heading, rule, example, …) and each line is split into
 * inline spans (variables, emphasis, code, urls, numbers with units). Nothing is
 * trimmed, normalised or dropped: `linesToText(tokenize(t)) === t` for any string.
 * Lines are split on `\n` only, so a `\r` stays inside the last span of its line.
 */

export type LineKind = 'heading' | 'role' | 'rule' | 'list' | 'example' | 'code' | 'format' | 'dialogue' | 'text';
export type SpanKind = 'text' | 'variable' | 'emphasis' | 'inline_code' | 'url' | 'number';

export interface Span {
  kind: SpanKind;
  text: string;
}

export interface Line {
  kind: LineKind;
  spans: Span[];
  /** Headings only: stable id `h-<n>` (n = 0-based heading index) for Outline → Read scrolling. */
  id?: string;
  /** Headings: 1–6 (markdown `#` count, else 2). Lists/rules: nesting depth from leading spaces (0-based). */
  level?: number;
}

export interface TokenizeStructure {
  sections?: string[] | null;
}

const FENCE = /^\s*```/;
const FENCE_EXAMPLE = /^\s*```\s*example\b/i;
const MD_HEADING = /^\s{0,3}(#{1,6})\s+\S/;
const CAPS_HEADING = /^\s*[A-Z0-9&-]+(?:\s+[A-Z0-9&-]+){0,5}\s*:?\s*$/;
const STEP_HEADING = /^\s*step\s+\d+\s*(?:[:.)-]\s*[^.!?]{0,60})?$/i;
const NUM_HEADING = /^\s*\d+[.)]\s+[A-Z][^.,;!?]{0,60}:?$/;
const ROLE = /^\s*(you are|act as|role\s*:|system\s*:)/i;
const BULLET = /^(\s*)(?:[-*•]\s|\d+[.)]\s)/;
const MODAL = /\b(must|never|do not|don't|always|only|avoid|ensure|should not|shall)\b/i;
const EXAMPLE_START = /^\s*(examples?|e\.g\.|input|output|sample)\s*[:：]/i;
const FORMAT = /\b(format|json|table|markdown|return only|respond with|output as|in the form of)\b/i;
const DIALOGUE = /^\s*(user|assistant|human|ai|system)\s*:/i;

// Group order = priority at the same position (longest / most specific first).
const INLINE =
  /(\{\{\s*[A-Za-z_][\w .-]*\}\}|(?<!\{)\{[A-Za-z_][\w .-]*\}(?!\}))|(`[^`\n]+`)|(\*\*[^*\n]+\*\*|(?<![\w*])\*[^*\s][^*\n]*?\*(?![\w*]))|(https?:\/\/\S+)|(\[[A-Za-z_][\w .-]*\](?!\())|(<[A-Za-z_][\w .-]*>)|(\b\d+(?:\.\d+)?\s?(?:words?|chars?|characters|sentences?|paragraphs?|steps?|items?|bullets?|lines?|tokens?|%|seconds?|minutes?|hours?|days?|x)(?!\w))/gi;
const INLINE_KINDS: SpanKind[] = ['variable', 'inline_code', 'emphasis', 'url', 'variable', 'variable', 'number'];

function normTitle(s: string): string {
  return s
    .trim()
    .replace(/^#+\s*/, '')
    .replace(/[\s:#]+$/, '')
    .toLowerCase();
}

function isCapsHeading(line: string): boolean {
  if (!CAPS_HEADING.test(line)) return false;
  const letters = line.replace(/[^A-Z]/g, '').length;
  return letters >= 2;
}

function spansOf(text: string): Span[] {
  const spans: Span[] = [];
  let last = 0;
  INLINE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = INLINE.exec(text))) {
    if (m.index > last) spans.push({ kind: 'text', text: text.slice(last, m.index) });
    let kind: SpanKind = 'text';
    for (let g = 1; g < m.length; g++) {
      if (m[g] !== undefined) {
        kind = INLINE_KINDS[g - 1];
        break;
      }
    }
    spans.push({ kind, text: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length || spans.length === 0) spans.push({ kind: 'text', text: text.slice(last) });
  return spans;
}

function depthOf(indent: string): number {
  let n = 0;
  for (const ch of indent) n += ch === '\t' ? 2 : 1;
  return Math.floor(n / 2);
}

export function tokenize(text: string, structure?: TokenizeStructure | null): Line[] {
  const sections = new Set((structure?.sections ?? []).map(normTitle).filter(Boolean));
  const out: Line[] = [];
  let fence: 'code' | 'example' | null = null;
  let inExample = false;
  let nonEmpty = 0;
  let headings = 0;

  for (const raw of text.split('\n')) {
    const blank = raw.trim() === '';

    if (fence) {
      const closing = FENCE.test(raw);
      out.push(fence === 'code' ? { kind: 'code', spans: [{ kind: 'text', text: raw }] } : { kind: 'example', spans: spansOf(raw) });
      if (closing) fence = null;
      continue;
    }
    if (FENCE.test(raw)) {
      fence = FENCE_EXAMPLE.test(raw) ? 'example' : 'code';
      inExample = false;
      out.push(fence === 'code' ? { kind: 'code', spans: [{ kind: 'text', text: raw }] } : { kind: 'example', spans: spansOf(raw) });
      continue;
    }

    if (blank) {
      inExample = false;
      out.push({ kind: 'text', spans: [{ kind: 'text', text: raw }] });
      continue;
    }
    nonEmpty++;

    const md = MD_HEADING.exec(raw);
    const bullet = BULLET.exec(raw);
    const heading =
      !!md ||
      isCapsHeading(raw) ||
      STEP_HEADING.test(raw) ||
      (NUM_HEADING.test(raw) && !MODAL.test(raw) && raw.trim().split(/\s+/).length <= 7) ||
      sections.has(normTitle(raw));

    let kind: LineKind;
    let level: number | undefined;
    let id: string | undefined;
    if (heading) {
      kind = 'heading';
      level = md ? md[1].length : 2;
      id = `h-${headings++}`;
      inExample = false;
    } else if (nonEmpty <= 3 && ROLE.test(raw)) {
      kind = 'role';
    } else if (inExample || EXAMPLE_START.test(raw)) {
      kind = 'example';
      inExample = true;
    } else if (bullet) {
      kind = MODAL.test(raw) ? 'rule' : 'list';
      level = depthOf(bullet[1]);
    } else if (FORMAT.test(raw)) {
      kind = 'format';
    } else if (DIALOGUE.test(raw)) {
      kind = 'dialogue';
    } else {
      kind = 'text';
    }

    const line: Line = { kind, spans: spansOf(raw) };
    if (id !== undefined) line.id = id;
    if (level !== undefined) line.level = level;
    out.push(line);
  }
  return out;
}

/** Plain text of one line (its spans joined). */
export function lineText(line: Line): string {
  let s = '';
  for (const span of line.spans) s += span.text;
  return s;
}

/** Inverse of `tokenize`: span texts joined, lines joined with '\n'. Equals the input byte for byte. */
export function linesToText(lines: Line[]): string {
  return lines.map(lineText).join('\n');
}

/** Split lines for the staged reveal: `head` holds whole lines up to ~firstChars characters (at least one line). */
export function splitLines(lines: Line[], firstChars = 600): { head: Line[]; tail: Line[] } {
  let total = 0;
  let i = 0;
  while (i < lines.length && (i === 0 || total < firstChars)) {
    total += lineText(lines[i]).length + 1;
    i++;
  }
  return { head: lines.slice(0, i), tail: lines.slice(i) };
}

/** Title text of a heading line with markdown markers / trailing colon stripped (for the outline). */
export function headingTitle(line: Line): string {
  return lineText(line)
    .trim()
    .replace(/^#+\s*/, '')
    .replace(/[\s:#]+$/, '');
}
