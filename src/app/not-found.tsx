import Link from 'next/link';
import { v2cls } from '@/lib/brand';

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-24 bg-background text-foreground">
      <div className={`max-w-md text-center ${v2cls('v2:bg-surface v2:border v2:border-line v2:rounded-cartouche v2:p-8')}`}>
        <p className={`text-sm font-semibold uppercase tracking-wider text-muted-foreground ${v2cls('v2:text-ink-muted')}`}>404</p>
        <h1 className={`mt-2 text-3xl font-bold ${v2cls('display-lg v2:text-ink')}`}>This page is not in the library.</h1>
        <p className={`mt-3 text-muted-foreground ${v2cls('v2:text-ink-muted')}`}>
          The link may have moved. The feed has today&apos;s prompts, with their results.
        </p>
        <Link
          href="/feed"
          className={`mt-6 inline-block font-semibold text-primary underline-offset-4 hover:underline ${v2cls('v2:text-faience')}`}
        >
          Open the feed
        </Link>
      </div>
    </main>
  );
}
