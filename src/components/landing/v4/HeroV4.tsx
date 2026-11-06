'use client';

/**
 * Sprint 11 I5 — homepage hero (brand v2, "the scribe").
 * Sized to content, no viewport hero. Right column: one real trending card whose
 * reader opens in place after 600 ms via the Sprint 09 `useReader` mechanism
 * (`initialSlug` opens without a history push). Reduced motion → already open.
 */
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFeed } from '@/lib/feed/hooks';
import { isReadable, type FeedItem, type FeedQuery } from '@/lib/feed/types';
import { PromptCard, type ReaderCardProps } from '@/components/feed/PromptCard';
import { useReader } from '@/components/feed/useReader';
import { TryMeButton } from '@/components/try-me/TryMeButton';

const HERO_QUERY: FeedQuery = { tab: 'trending', filters: {} };

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function ExampleCard() {
  return (
    <div className="v2:rounded-cartouche rounded-2xl border border-border bg-card p-5" aria-label="Example prompt card">
      <span className="t-label v2:text-ink-muted text-xs uppercase tracking-wider text-muted-foreground">Example</span>
      <h3 className="t-title mt-2 text-lg font-semibold">Strict senior code reviewer</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        A system prompt that blocks merges on correctness, security and tests, and returns a table of findings.
      </p>
      <p className="mt-3 t-prompt-sm font-mono text-sm v2:text-pt-role">You are a senior engineer reviewing a pull request in {'{{LANGUAGE}}'}.</p>
      <p className="mt-4 text-xs text-muted-foreground">Live prompts could not be loaded right now. See the feed for real results.</p>
    </div>
  );
}

function HeroCard({ item }: { item: FeedItem }) {
  const router = useRouter();
  const readable = useMemo(() => (isReadable(item) ? [item.slug] : []), [item]);
  const [initialSlug, setInitialSlug] = useState<string | null>(null);
  const reader = useReader(readable, { resetKey: 'home-hero', initialSlug });

  useEffect(() => {
    if (!readable.length) return;
    if (prefersReducedMotion()) {
      setInitialSlug(item.slug);
      return;
    }
    const t = setTimeout(() => setInitialSlug(item.slug), 600);
    return () => clearTimeout(t);
  }, [item.slug, readable.length]);

  const readerProps: ReaderCardProps | undefined = readable.length
    ? {
        open: reader.isOpen(item.slug),
        active: reader.active === item.slug,
        onToggle: () => reader.toggle(item.slug, 'tap'),
        onClose: (reason) => reader.close(item.slug, reason),
        onPrev: () => {},
        onNext: () => router.push('/feed'),
        onSwipe: (dir) => {
          if (dir === 1) router.push('/feed');
        },
        hasPrev: false,
        hasNext: true,
        onOpenRelated: (slug) => router.push(`/feed?p=${encodeURIComponent(slug)}`),
        settings: reader.settings,
        onSetting: reader.setSetting,
        focusMode: false,
        copyTick: reader.copyTick,
      }
    : undefined;

  return (
    <PromptCard
      item={item}
      from="home-hero"
      position={1}
      onRequireAuth={() => router.push('/auth/register?from=home')}
      onFork={(it) => router.push(`/feed?p=${encodeURIComponent(it.slug)}`)}
      reader={readerProps}
    />
  );
}

export function HeroV4() {
  const feed = useFeed(HERO_QUERY);
  const first = feed.data?.pages?.[0]?.results?.find((it) => isReadable(it));

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24" aria-labelledby="home-hero-title">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="min-w-0">
          <h1 id="home-hero-title" className="display-xl v2:font-display v2:text-ink text-5xl font-semibold tracking-tight">
            Learn to ask.
          </h1>
          <p className="t-body mt-6 max-w-[65ch] text-lg v2:text-ink text-foreground">
            Clear questions get better answers. Prompt Temple shows you what good prompts produce, lets you use them in one tap,
            and teaches you to write your own.
          </p>
          <div className="mt-8 flex flex-col gap-2">
            <div>
              <TryMeButton className="v2:bg-faience-fill v2:text-faience-on v2:rounded-pill v2:bg-none v2:shadow-none v2:hover:scale-100" />
            </div>
            <p className="text-sm v2:text-ink-muted text-muted-foreground">Free. Nothing to install.</p>
          </div>
          <Link href="/feed" className="mt-6 inline-block text-sm font-medium v2:text-faience text-primary underline-offset-4 hover:underline">
            See today&apos;s trending prompts
          </Link>
        </div>
        <div className="min-w-0">
          {first ? <HeroCard item={first} /> : feed.isLoading ? (
            <div className="h-64 animate-pulse rounded-2xl border border-border bg-card" aria-busy="true" aria-label="Loading a trending prompt" />
          ) : (
            <ExampleCard />
          )}
        </div>
      </div>
    </section>
  );
}
