import Link from 'next/link';

/** Sprint 11 I5 §4 — the extension, explained in two sentences. */
export function UseItWhereYouWork() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16" aria-labelledby="extension-title">
      <h2 id="extension-title" className="display-md v2:font-display v2:text-ink v2:border-b v2:border-gilt-line inline-block pb-1 text-2xl font-semibold">
        Use it where you work
      </h2>
      <p className="t-body mt-3 max-w-[65ch] v2:text-ink text-foreground">
        The Chrome extension keeps your prompt history and the library inside ChatGPT, Claude and Gemini. Pick a prompt, fill
        its variables, and it is pasted where you type.
      </p>
      <div className="mt-6 flex flex-col gap-2">
        <div>
          <Link
            href="/download"
            className="t-button inline-flex items-center rounded-full border px-5 py-2.5 text-sm font-semibold v2:border-line v2:text-ink border-border text-foreground hover:bg-muted/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Install the extension
          </Link>
        </div>
        <p className="text-sm v2:text-ink-muted text-muted-foreground">Free. Works in Chrome and Edge. Your prompts stay in your account.</p>
      </div>
    </section>
  );
}
