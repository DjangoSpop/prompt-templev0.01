'use client';

/** Sprint 11 I5 §2 — three learning blocks. Each "Try this line" copies the example line. */
import { useState } from 'react';
import { copyText } from '@/lib/feed/clipboard';

const LESSONS = [
  {
    title: 'Give it a role',
    body: 'A role line tells the model who to be. It is the single most useful line you can add: it sets the expertise, the tone and what the model should refuse to guess.',
    line: 'You are a senior editor at a technical magazine. Edit for clarity, not style.',
  },
  {
    title: 'Say what good looks like',
    body: 'Models aim at the target you describe. Name the audience, the length and one example of a good answer, and the first draft gets much closer.',
    line: 'Write for a busy manager. Under 120 words. Lead with the decision, then two reasons.',
  },
  {
    title: 'Ask for the format',
    body: 'A format line turns a paragraph into something you can use: a table, a checklist, JSON. Say the shape once and you will not have to reformat it.',
    line: 'Return a markdown table with columns: item, risk, owner, due date.',
  },
];

export function HowAskingWorks() {
  const [copied, setCopied] = useState<number | null>(null);

  async function tryLine(i: number) {
    try {
      await copyText(LESSONS[i].line);
      setCopied(i);
      setTimeout(() => setCopied((c) => (c === i ? null : c)), 1500);
    } catch {
      /* clipboard refused: the line is visible to select by hand */
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16" aria-labelledby="how-asking-title">
      <h2 id="how-asking-title" className="display-md v2:font-display v2:text-ink v2:border-b v2:border-gilt-line inline-block pb-1 text-2xl font-semibold">
        How asking works
      </h2>
      <p className="t-body mt-3 max-w-[65ch] v2:text-ink-muted text-muted-foreground">Three lines that change most answers. Try each one on your next prompt.</p>
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {LESSONS.map((l, i) => (
          <article key={l.title} className="rounded-md border-l-2 v2:border-lapis v2:bg-lapis-soft border-primary bg-secondary p-5">
            <h3 className="t-title text-lg font-semibold v2:text-ink">{l.title}</h3>
            <p className="mt-2 text-sm leading-6 v2:text-ink text-foreground">{l.body}</p>
            <p className="t-prompt-sm mt-3 font-mono text-sm v2:text-lapis text-primary">{l.line}</p>
            <button
              type="button"
              onClick={() => tryLine(i)}
              className="mt-3 text-sm font-semibold v2:text-faience text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-live="polite"
            >
              {copied === i ? 'Copied' : 'Try this line'}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
