'use client';

const STEPS = [
  {
    title: 'Sign up free',
    detail: '30 seconds. No credit card.',
  },
  {
    title: 'Search or paste',
    detail: 'Find a template or optimize your draft.',
  },
  {
    title: 'Use anywhere',
    detail: 'Copy to ChatGPT, Claude, Gemini, or Copilot.',
  },
  {
    title: 'Get better output',
    detail: 'Clearer prompts, better results.',
  },
];

export function OnboardingStepsSection() {
  return (
    <section className="bg-sand-100 px-4 py-10 md:py-12">
      <div className="mx-auto max-w-6xl">
        <p className="mb-6 text-center font-display text-xl font-bold text-stone-900 md:text-2xl">
          What Happens Next
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
            >
              <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#0E3A8C] text-xs font-bold text-white">
                {index + 1}
              </span>
              <p className="text-sm font-semibold text-stone-900">{step.title}</p>
              <p className="mt-1 text-xs text-stone-600">{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OnboardingStepsSection;
