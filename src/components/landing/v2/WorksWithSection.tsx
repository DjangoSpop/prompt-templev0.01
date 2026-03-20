'use client';

import Image from 'next/image';

const LOGOS = [
  { src: '/logos/chatgpt.svg', alt: 'ChatGPT' },
  { src: '/logos/claude.svg', alt: 'Claude' },
  { src: '/logos/gemini.svg', alt: 'Gemini' },
  { src: '/logos/perplexity.svg', alt: 'Perplexity' },
  { src: '/logos/copilot.svg', alt: 'Copilot' },
];

export function WorksWithSection() {
  return (
    <section className="border-y border-stone-200 bg-sand-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <p className="mb-6 text-center text-sm text-stone-500">Works seamlessly with</p>
        <div className="flex flex-wrap items-center justify-center gap-6 opacity-75 grayscale transition-all hover:grayscale-0 md:gap-12">
          {LOGOS.map((logo) => (
            <Image
              key={logo.alt}
              src={logo.src}
              alt={logo.alt}
              width={120}
              height={28}
              className="h-6 w-auto"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default WorksWithSection;
