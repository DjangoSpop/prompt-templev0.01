/**
 * Sprint 09 §7 — 80 feed items carrying the inline `text` / `views` payload (B7), so every
 * reader state in R2–R4 is reproducible without the network. Built on `makeItem`.
 *
 * Index ranges (`SPRINT09_RANGES`):
 *   0–16  short / one-liners          17–19 metadata-only link cards (text null)
 *   20–46 system prompts              47–48 system prompts > 12,000 chars (`text_truncated`)
 *   49    system prompt, `views: null` 50–59 chains (Step 1…5)
 *   60–69 template vars (4 syntaxes)  70–74 conversations (User:/Assistant:)
 *   75–77 fenced code (json/python)   78–79 Arabic (RTL)
 */
import { makeItem, type RawItem } from './factory';

export const SPRINT09_KINDS = [
  'short',
  'link',
  'system',
  'truncated',
  'no_views',
  'chain',
  'template_vars',
  'conversation',
  'code',
  'arabic',
] as const;
export type Sprint09Kind = (typeof SPRINT09_KINDS)[number];

export const SPRINT09_RANGES: Record<Sprint09Kind, [number, number]> = {
  short: [0, 16],
  link: [17, 19],
  system: [20, 46],
  truncated: [47, 48],
  no_views: [49, 49],
  chain: [50, 59],
  template_vars: [60, 69],
  conversation: [70, 74],
  code: [75, 77],
  arabic: [78, 79],
};

export const INLINE_TEXT_CAP = 12_000;

// ---------------------------------------------------------------------------
// Views builder (mirrors the backend `build_views` shape closely enough for the UI)
// ---------------------------------------------------------------------------

interface Views {
  outline: { title: string; body: string; level: number }[];
  variables: { name: string; hint: string | null; placeholder: string | null; default: string | null; required: boolean; occurrences: number }[];
  steps: { n: number; text: string }[];
  compact: string;
}

function compact(text: string, max = 600): string {
  const joined = text
    .split('\n')
    .map((l) => l.split(/\s+/).filter(Boolean).join(' '))
    .filter(Boolean)
    .join('\n');
  if (joined.length <= max) return joined;
  const cut = joined.slice(0, max - 1);
  const sp = cut.lastIndexOf(' ');
  return `${sp > 0 ? cut.slice(0, sp) : cut}…`;
}

function headings(text: string): string[] {
  return text
    .split('\n')
    .filter((l) => /^##? /.test(l))
    .map((l) => l.replace(/^#+\s*/, '').trim());
}

function buildViews(text: string, variables: string[] = []): Views {
  const lines = text.split('\n');
  const outline: Views['outline'] = [];
  let current: { title: string; body: string[]; level: number } | null = null;
  for (const line of lines) {
    const m = /^(#{1,6})\s+(.*)$/.exec(line);
    if (m) {
      if (current) outline.push({ title: current.title, body: current.body.join('\n').trim(), level: current.level });
      current = { title: m[2].trim(), body: [], level: m[1].length };
    } else if (current) {
      current.body.push(line);
    }
  }
  if (current) outline.push({ title: current.title, body: current.body.join('\n').trim(), level: current.level });

  const steps = lines
    .map((l) => /^\s*step\s+(\d+)\s*[:.)-]?\s*(.*)$/i.exec(l))
    .filter((m): m is RegExpExecArray => !!m)
    .map((m, i) => ({ n: i + 1, text: m[2].trim() }));

  return {
    outline,
    variables: variables.map((name) => {
      const re = new RegExp(`\\{\\{\\s*${name}\\s*\\}\\}|(?<!\\{)\\{${name}\\}(?!\\})|\\[${name}\\](?!\\()|<${name}>`, 'g');
      const occurrences = (text.match(re) ?? []).length;
      return { name, hint: `Used ${occurrences} time${occurrences === 1 ? '' : 's'}`, placeholder: null, default: null, required: false, occurrences };
    }),
    steps,
    compact: compact(text),
  };
}

// ---------------------------------------------------------------------------
// Text generators (index-mixed so no two items are identical)
// ---------------------------------------------------------------------------

const DOMAINS = ['code review', 'email outreach', 'blog writing', 'data analysis', 'customer support', 'product specs', 'SQL tuning', 'UX copy', 'lesson plans', 'release notes'];
const ROLES = ['senior engineer', 'marketing lead', 'technical writer', 'data scientist', 'support specialist', 'product manager'];
const AUDIENCES = ['startup founders', 'junior developers', 'busy executives', 'first-time users', 'enterprise buyers'];

const d = (i: number) => DOMAINS[i % DOMAINS.length];
const r = (i: number) => ROLES[i % ROLES.length];
const a = (i: number) => AUDIENCES[i % AUDIENCES.length];

function shortText(i: number): string {
  const variants = [
    `Rewrite this for ${a(i)} in 50 words.`,
    `Summarise the following ${d(i)} notes in 3 bullets.\nKeep the tone neutral.`,
    `Act as a ${r(i)}. Give me one sharp question about ${d(i)}.`,
    `Explain ${d(i)} like I am twelve.\nUse one analogy.\nNo jargon.`,
  ];
  return variants[i % variants.length];
}

function systemText(i: number): string {
  const extraRules = i % 3 === 0 ? `\n- Avoid passive voice and keep every sentence under 20 words.` : i % 3 === 1 ? `\n- Ensure every claim cites the line it comes from.` : '';
  const numbered = i % 2 === 0 ? `\n\n## Process\n1. Read the whole input first\n2. List the three biggest risks\n3. Draft the answer\n4. Check it against the rules` : `\n\n## Process\n1. Restate the goal in one line\n2. Produce the output\n3. Verify the format`;
  return `## Role
You are a ${r(i)} who specialises in ${d(i)} for ${a(i)}. Think step by step and stay concrete.

## Rules
- Never invent facts; say "unknown" when the input does not say.
- Always answer in the language of the user.
- Do not exceed 300 words unless asked.
- Only use *plain* prose, no headings in the answer.${extraRules}
- Prefer examples over abstractions (see \`style.md\`).${numbered}

## Example
Input: a ${d(i)} draft with two problems.
Output: a 3-bullet review that names each problem and the fix.

## Output format
Respond with markdown: a short verdict line, then a table with columns Issue · Why · Fix. Return only the table and the verdict, nothing else.`;
}

function chainText(i: number): string {
  return `# ${d(i)} pipeline
You are a ${r(i)} running a 5-step chain for ${a(i)}.

Step 1: Collect the inputs
Ask for the source material and the deadline. Must confirm both before moving on.

Step 2: Outline
Produce a 5-bullet outline. Keep each bullet under 12 words.

Step 3: Draft
Write the first version in 400 words using the outline.

Step 4: Critique
List what a sceptical ${a(i)} would push back on. Do not fix yet.

Step 5: Finalise
Apply the critique and return only the final text in markdown.`;
}

function templateText(i: number): string {
  return `You are a ${r(i)} writing about ${d(i)} for {{name}}.

Topic: {topic}
Audience: [AUDIENCE]
Language: <LANG>

## Rules
- Must address {{ name }} by name in the first sentence.
- Never switch away from <LANG> once chosen.
- Keep it under 200 words for [AUDIENCE].

## Output format
Return a single paragraph about {topic}, followed by one call to action. Respond with plain text.${i % 2 ? '\n\nSee https://example.com/guide for the style guide.' : ''}`;
}

function conversationText(i: number): string {
  return `System: You are a ${r(i)} helping with ${d(i)}.

User: I need help with ${d(i)} for ${a(i)}. Where do I start?
Assistant: Start with the goal. What should ${a(i)} do after reading it?
User: Decide within 2 minutes whether to buy.
Assistant: Then lead with the outcome, keep it to 3 sentences, and end with one question.${i % 2 ? '\nUser: Show me.\nAssistant: Sure — here is a 3-sentence version.' : ''}`;
}

function codeText(i: number): string {
  const json = `\`\`\`json
{
  "task": "${d(i)}",
  "audience": "${a(i)}",
  "max_words": ${100 + i}
}
\`\`\``;
  const python = `\`\`\`python
def score(review: dict) -> int:
    # {{not_a_variable}} inside code stays as code
    return len(review["issues"]) * 2
\`\`\``;
  return `## Role
You are a ${r(i)} who returns structured output.

## Input
The caller sends this payload:

${json}

## Rules
- Must validate the payload before answering.
- Never return prose outside the JSON.

## Reference implementation
${i % 2 ? python : json}

## Output format
Return only valid JSON with the keys verdict, issues, fix.`;
}

function arabicText(i: number): string {
  return `## الدور
أنت كاتب محتوى محترف تساعد ${i % 2 ? 'رواد الأعمال' : 'الطلاب'} على الكتابة بوضوح.

## القواعد
- يجب أن تكون الإجابة قصيرة ومباشرة.
- لا تستخدم مصطلحات معقدة.
- اكتب دائماً بالعربية الفصحى.

## مثال
المدخل: فكرة مشروع في سطر واحد.
المخرج: وصف من ثلاث جمل.

## صيغة المخرجات
أعد النص بصيغة markdown مع عنوان واحد وثلاث نقاط.`;
}

function longText(i: number): string {
  const parts: string[] = [`## Role\nYou are a ${r(i)} writing an exhaustive ${d(i)} playbook for ${a(i)}.\n`];
  let n = 1;
  while (parts.join('\n').length < INLINE_TEXT_CAP + 2_000) {
    parts.push(`## Section ${n}\n- Must cover ${d(i + n)} in at least 120 words.\n- Never skip the examples.\n\nParagraph ${n}: ${`A detailed explanation of ${d(i + n)} for ${a(i + n)}, with the trade-offs spelled out. `.repeat(6)}\n`);
    n++;
  }
  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------

function withText(i: number, text: string, extra: Partial<RawItem> & Record<string, unknown>): RawItem {
  const words = text.split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  const length_bucket = chars < 200 ? 'xs' : chars < 600 ? 's' : chars < 1500 ? 'm' : chars < 4000 ? 'l' : 'xl';
  const sections = headings(text).map((title) => ({ title }));
  const variables = (extra.variables as string[] | undefined) ?? [];
  const steps = (text.match(/^\s*step\s+\d+/gim) ?? []).length >= 3 ? (text.match(/^\s*step\s+\d+/gim) ?? []).length : 0;
  const { variables: _v, ...rest } = extra;
  return makeItem(i, {
    word_count: words,
    reading_time_sec: Math.round((words / 200) * 60),
    length_bucket,
    preview: compact(text, 280),
    tldr: i % 3 ? `TL;DR for item ${i}: ${d(i)} for ${a(i)}.` : null,
    structure: { sections, variables, steps },
    text,
    text_truncated: false,
    text_available: true,
    views: buildViews(text, variables),
    stats: { likes: 80 - i, saves: i % 7, forks: i % 3, copies: i * 2, applies: 0, views_7d: i * 10, trending_rank: i + 1 },
    ...rest,
  });
}

function build(i: number): RawItem {
  if (i <= 16) return withText(i, shortText(i), { form: i % 2 ? 'one_liner' : 'short' });
  if (i <= 19) {
    return makeItem(i, {
      form: 'short',
      text: null,
      text_truncated: false,
      text_available: false,
      views: null,
      preview: '',
      attribution: { source: 'marketplace:promptbase', license: null, author: 'PromptBase seller', url: `https://promptbase.com/prompt/${i}` },
      stats: { likes: 80 - i, saves: 0, forks: 0, copies: 0, applies: 0, views_7d: 0, trending_rank: i + 1 },
    });
  }
  if (i <= 46) return withText(i, systemText(i), { form: 'system_prompt' });
  if (i <= 48) {
    const full = longText(i);
    return withText(i, full.slice(0, INLINE_TEXT_CAP), { form: 'system_prompt', text_truncated: true, word_count: full.split(/\s+/).length, length_bucket: 'xl' });
  }
  if (i === 49) return withText(i, systemText(i), { form: 'system_prompt', views: null });
  if (i <= 59) return withText(i, chainText(i), { form: 'chain' });
  if (i <= 69) return withText(i, templateText(i), { form: 'template_vars', variables: ['name', 'topic', 'AUDIENCE', 'LANG'] });
  if (i <= 74) return withText(i, conversationText(i), { form: 'conversation' });
  if (i <= 77) return withText(i, codeText(i), { form: 'long_form' });
  return withText(i, arabicText(i), { form: 'system_prompt', language: 'ar', title: `موجه ${i}` });
}

export const SPRINT09_ITEMS: RawItem[] = Array.from({ length: 80 }, (_, i) => build(i));

export function itemsOfKind(kind: Sprint09Kind): RawItem[] {
  const [from, to] = SPRINT09_RANGES[kind];
  return SPRINT09_ITEMS.slice(from, to + 1);
}

export function firstOfKind(kind: Sprint09Kind): RawItem {
  return SPRINT09_ITEMS[SPRINT09_RANGES[kind][0]];
}
