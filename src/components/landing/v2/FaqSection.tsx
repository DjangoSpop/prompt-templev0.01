'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQS = [
  {
    q: 'Is it really free to start?',
    a: 'Yes. You get free credits when you sign up and daily free optimizations. No credit card is required.',
  },
  {
    q: 'Does it work with ChatGPT, Claude, and Gemini?',
    a: 'Yes. Prompt Temple works across ChatGPT, Claude, Gemini, Perplexity, and Copilot.',
  },
  {
    q: 'What makes these prompts better?',
    a: 'Prompts are structured with role, context, constraints, and output formatting patterns used by professional prompt engineers.',
  },
  {
    q: 'Can I save and organize my own prompts?',
    a: 'Yes. Your prompt library syncs across devices and can be used directly through the extension.',
  },
  {
    q: 'What is the Academy?',
    a: 'The Academy provides learning paths for MCP, agent design, and prompt engineering.',
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section className="bg-sand-50 px-4 py-16 md:py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center font-display text-2xl font-bold text-stone-900 md:text-4xl">
          Frequently Asked Questions
        </h2>

        <div className="mt-8 space-y-3">
          {FAQS.map((item, index) => {
            const expanded = open === index;
            return (
              <div key={item.q} className="overflow-hidden rounded-xl border border-stone-200 bg-white">
                <button
                  type="button"
                  aria-controls={`faq-panel-${index}`}
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                  onClick={() => setOpen(expanded ? -1 : index)}
                >
                  <span className="text-sm font-semibold text-stone-900 md:text-base">{item.q}</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-stone-500 transition-transform duration-200',
                      expanded && 'rotate-180'
                    )}
                  />
                </button>
                {expanded && (
                  <div id={`faq-panel-${index}`} className="border-t border-stone-100 px-4 py-4 text-sm text-stone-600">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
