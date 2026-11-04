import { describe, expect, it } from 'vitest';
import { SPRINT09_ITEMS, SPRINT09_RANGES, firstOfKind, itemsOfKind } from '@/mocks/feed/sprint09';
import { headingTitle, lineText, linesToText, splitLines, tokenize, type Line } from '../tokenize';

// ---------------------------------------------------------------------------
// Property test: join(spans) === input, byte for byte
// ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BLOCKS = [
  '# Heading',
  '## Rules:',
  'OUTPUT FORMAT:',
  'Step 3:',
  '1. Context:',
  '- must never do this',
  '* always keep it short',
  '• avoid jargon',
  '2) an ordinary list item',
  'You are a helpful tutor.',
  'Act as a pirate',
  'Example:',
  'Input: {{ name }} and {topic}',
  'Output: [AUDIENCE] in <LANG>',
  '```',
  '```json',
  '```example',
  '{"a": [1, 2]}',
  'Respond with json only',
  'User: hi',
  'Assistant: hello **there** and *you*',
  'see https://example.com/x?y=1 now',
  'write 500 words in 3 steps, 50% shorter, 2x faster',
  '`code` inline',
  '[link](https://x.y)',
  '',
  '',
  '\t\ttabbed\tline',
  'مرحبا بك في المعبد',
  '## الدور',
  '🔥 emoji ✨ line',
  '{{unclosed',
  '**unbalanced *markers',
  '<>',
  '[]',
  '{}',
  '\r',
  'trailing spaces   ',
  '   leading spaces',
];

function randomPrompt(rand: () => number): string {
  const n = 1 + Math.floor(rand() * 25);
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    const k = rand();
    if (k < 0.85) parts.push(BLOCKS[Math.floor(rand() * BLOCKS.length)]);
    else {
      let s = '';
      const len = Math.floor(rand() * 40);
      for (let j = 0; j < len; j++) s += String.fromCodePoint(32 + Math.floor(rand() * 0x2ff));
      parts.push(s);
    }
  }
  const sep = rand() < 0.2 ? '\r\n' : '\n';
  let out = parts.join(sep);
  if (rand() < 0.3) out += '\n';
  if (rand() < 0.1) out = '\n' + out;
  return out;
}

describe('tokenize round-trip property', () => {
  it('reproduces 500 generated prompts byte for byte', () => {
    const rand = mulberry32(20261104);
    for (let i = 0; i < 500; i++) {
      const t = randomPrompt(rand);
      expect(linesToText(tokenize(t))).toBe(t);
    }
  });

  it('reproduces every Sprint 09 fixture text', () => {
    let checked = 0;
    for (const item of SPRINT09_ITEMS) {
      const text = item.text as string | null;
      if (text === null) continue;
      expect(linesToText(tokenize(text, { sections: (item.structure as { sections: { title: string }[] }).sections.map((s) => s.title) }))).toBe(text);
      checked++;
    }
    expect(checked).toBe(77);
  });

  it('handles the empty string, lone newlines and a 12,000+ char prompt', () => {
    for (const t of ['', '\n', '\n\n', '\r\n', 'a'.repeat(13_000), ('- must x\n'.repeat(2000))]) {
      const lines = tokenize(t);
      expect(linesToText(lines)).toBe(t);
      expect(lines.every((l) => l.spans.length >= 1)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Line kinds
// ---------------------------------------------------------------------------

const kinds = (text: string, sections?: string[]) => tokenize(text, sections ? { sections } : null).map((l) => l.kind);

describe('line kinds', () => {
  it('heading: markdown, ALL CAPS, Step N, numbered, structure section', () => {
    expect(kinds('# Title\n## Rules:\nOUTPUT FORMAT:\nStep 2:\n3. Context:\nMy Section\nplain', ['My Section'])).toEqual([
      'heading',
      'heading',
      'heading',
      'heading',
      'heading',
      'heading',
      'text',
    ]);
    expect(tokenize('# A\n### B').map((l) => l.level)).toEqual([1, 3]);
    expect(kinds('DO')).toEqual(['heading']); // two capital letters is enough
    expect(kinds('A')).toEqual(['text']); // one letter is not a heading
    expect(kinds('This is a normal sentence with many words that goes on.')).toEqual(['text']);
  });

  it('role: within the first three non-empty lines only', () => {
    expect(kinds('You are a tutor.\n\nAct as a coach\nRole: helper\nYou are late')).toEqual(['role', 'text', 'role', 'role', 'text']);
    expect(kinds('System: strict')).toEqual(['role']);
  });

  it('rule: bullet or numbered line with a modal', () => {
    expect(kinds("- Never lie\n* you must\n• Don't shout\n1. only once\n2) Avoid it\n- ensure it")).toEqual(['rule', 'rule', 'rule', 'rule', 'rule', 'rule']);
  });

  it('list: bullets without a modal, with nesting depth', () => {
    const lines = tokenize('- apples\n  - green ones\n\t- tabbed\n1. first thing here now ok.\n2. Second');
    expect(lines.map((l) => l.kind)).toEqual(['list', 'list', 'list', 'list', 'heading']);
    expect(lines.slice(0, 3).map((l) => l.level)).toEqual([0, 1, 1]);
  });

  it('example: Example/Input/Output blocks until a blank line or heading, and ```example fences', () => {
    expect(kinds('Example:\n- must do\nmore\n\nafter\nInput: x\nOutput: y\n## Next\ntext')).toEqual([
      'example',
      'example',
      'example',
      'text',
      'text',
      'example',
      'example',
      'heading',
      'text',
    ]);
    expect(kinds('```example\n# not heading\n```\nback')).toEqual(['example', 'example', 'example', 'text']);
  });

  it('code: fenced blocks including the fences; an unclosed fence runs to the end', () => {
    expect(kinds('a\n```json\n{"x": 1}\n- must\n```\nb')).toEqual(['text', 'code', 'code', 'code', 'code', 'text']);
    expect(kinds('```\n# h\nx')).toEqual(['code', 'code', 'code']);
  });

  it('format: lines mentioning output formats', () => {
    expect(kinds('Respond with JSON.\nUse a table please\nReturn only the title\nnothing here')).toEqual(['format', 'format', 'format', 'text']);
  });

  it('dialogue: user/assistant/human/ai prefixes after the role window', () => {
    expect(kinds('intro\nmore\nthird\nUser: hi\nAssistant: yo\nHuman: ok\nAI: fine\nSystem: later')).toEqual([
      'text',
      'text',
      'text',
      'dialogue',
      'dialogue',
      'dialogue',
      'dialogue',
      'dialogue',
    ]);
  });

  it('text: everything else, blank lines included', () => {
    expect(kinds('just words here.\n\n   \nمرحبا')).toEqual(['text', 'text', 'text', 'text']);
  });
});

// ---------------------------------------------------------------------------
// Inline spans
// ---------------------------------------------------------------------------

const spans = (text: string) => tokenize(text)[0].spans;
const ofKind = (text: string, kind: string) => spans(text).filter((s) => s.kind === kind).map((s) => s.text);

describe('inline spans', () => {
  it('all four variable syntaxes become variable spans; markdown links do not', () => {
    const line = 'Dear {{ name }}, about {topic} for [AUDIENCE] in <LANG>. See [docs](https://x.y) and {{x}}.';
    expect(ofKind(line, 'variable')).toEqual(['{{ name }}', '{topic}', '[AUDIENCE]', '<LANG>', '{{x}}']);
    expect(spans(line).map((s) => s.text).join('')).toBe(line);
    expect(ofKind('<b>bold</b> and </div>', 'variable')).toEqual(['<b>']);
    expect(ofKind('{"json": 1} and [] and {} and <>', 'variable')).toEqual([]);
  });

  it('emphasis keeps its markers; bullet stars are not emphasis', () => {
    expect(ofKind('say **loud** and *soft* here', 'emphasis')).toEqual(['**loud**', '*soft*']);
    expect(ofKind('* a bullet', 'emphasis')).toEqual([]);
    expect(ofKind('2 * 3 * 4', 'emphasis')).toEqual([]);
  });

  it('inline code, urls and numbers with units', () => {
    expect(ofKind('use `npm test` now', 'inline_code')).toEqual(['`npm test`']);
    expect(ofKind('go to https://a.b/c?d=1 then', 'url')).toEqual(['https://a.b/c?d=1']);
    expect(ofKind('write 500 words in 3 steps, 50% shorter, 2x faster, 1.5 hours, 7 items', 'number')).toEqual([
      '500 words',
      '3 steps',
      '50%',
      '2x',
      '1.5 hours',
      '7 items',
    ]);
    expect(ofKind('Step 3 of 10', 'number')).toEqual([]);
  });

  it('adjacent text is merged into one span and code lines have a single span', () => {
    expect(spans('plain text only')).toEqual([{ kind: 'text', text: 'plain text only' }]);
    const code = tokenize('```\n{{x}} and **y**\n```')[1];
    expect(code.kind).toBe('code');
    expect(code.spans).toEqual([{ kind: 'text', text: '{{x}} and **y**' }]);
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

describe('helpers', () => {
  const lines = tokenize(Array.from({ length: 10 }, (_, i) => `line ${i} ${'x'.repeat(100)}`).join('\n'));

  it('splitLines cuts at a line boundary and keeps at least one head line', () => {
    const { head, tail } = splitLines(lines, 300);
    expect(head.length + tail.length).toBe(10);
    expect(head.length).toBeGreaterThanOrEqual(3);
    expect(linesToText([...head, ...tail])).toBe(linesToText(lines));
    expect(splitLines(lines, 0).head).toHaveLength(1);
    expect(splitLines([], 600)).toEqual({ head: [], tail: [] });
    expect(splitLines(lines).head.length).toBeLessThan(10); // default 600 chars
  });

  it('headingTitle strips markdown markers and trailing colons', () => {
    const [a, b, c] = tokenize('## Rules:\nOUTPUT FORMAT:\n# Title ##');
    expect(headingTitle(a)).toBe('Rules');
    expect(headingTitle(b)).toBe('OUTPUT FORMAT');
    expect(headingTitle(c)).toBe('Title');
  });

  it('heading ids count from h-0 in document order', () => {
    const ids = tokenize('# A\ntext\n## B\n```\n# not\n```\nC:').filter((l) => l.kind === 'heading').map((l) => l.id);
    expect(ids).toEqual(['h-0', 'h-1']);
    expect(tokenize('text').every((l) => l.id === undefined)).toBe(true);
  });

  it('CRLF input keeps the \\r inside the line', () => {
    const t = '# Title\r\n- must do\r\nplain\r\n';
    const lines = tokenize(t);
    expect(linesToText(lines)).toBe(t);
    expect(lineText(lines[0])).toBe('# Title\r');
    expect(lines.map((l) => l.kind)).toEqual(['heading', 'rule', 'text', 'text']);
    expect(headingTitle(lines[0])).toBe('Title');
  });

  it('lineText joins spans', () => {
    const line: Line = { kind: 'text', spans: [{ kind: 'text', text: 'a' }, { kind: 'variable', text: '{b}' }] };
    expect(lineText(line)).toBe('a{b}');
  });
});

// ---------------------------------------------------------------------------
// Fixture sanity (§7)
// ---------------------------------------------------------------------------

describe('sprint09 fixture', () => {
  it('has 80 items in the documented ranges', () => {
    expect(SPRINT09_ITEMS).toHaveLength(80);
    expect(Object.values(SPRINT09_RANGES).reduce((n, [a, b]) => n + (b - a + 1), 0)).toBe(80);
    expect(itemsOfKind('link').every((i) => i.text === null && i.text_available === false)).toBe(true);
    expect(itemsOfKind('truncated').every((i) => (i.text as string).length === 12_000 && i.text_truncated === true)).toBe(true);
    expect(firstOfKind('no_views').views).toBeNull();
    expect(firstOfKind('no_views').text).toBeTypeOf('string');
    expect(itemsOfKind('chain').every((i) => (i.views as { steps: unknown[] }).steps.length === 5)).toBe(true);
    expect(itemsOfKind('template_vars').every((i) => (i.views as { variables: { name: string }[] }).variables.map((v) => v.name).join() === 'name,topic,AUDIENCE,LANG')).toBe(true);
    expect(itemsOfKind('arabic').every((i) => i.language === 'ar')).toBe(true);
    expect(itemsOfKind('code').every((i) => (i.text as string).includes('```'))).toBe(true);
    expect(itemsOfKind('system').every((i) => (i.text as string).length >= 400 && (i.text as string).length <= 1500)).toBe(true);
    expect(new Set(SPRINT09_ITEMS.map((i) => i.text)).size).toBe(78); // 77 texts + null
    expect(SPRINT09_ITEMS.map((i) => (i.stats as { trending_rank: number }).trending_rank)).toEqual(Array.from({ length: 80 }, (_, i) => i + 1));
  });
});
