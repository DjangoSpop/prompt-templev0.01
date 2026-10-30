'use client';

/**
 * F5 — sign-up sheet shown when an anonymous visitor likes, saves or forks.
 *
 * The intended reaction is stored with `setPendingReaction` and replayed by
 * `usePendingReactionReplay` once the visitor comes back signed in (login and
 * register both honour `?redirect=`).
 */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bookmark, GitFork, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { setPendingReaction } from '@/lib/feed/pending';
import type { ReactionKind } from '@/lib/feed/types';

export type CtaIntent = { kind: ReactionKind | 'fork' | 'for_you'; slug?: string } | null;

const COPY: Record<NonNullable<CtaIntent>['kind'], { title: string; body: string; icon: typeof Heart }> = {
  like: { title: 'Like prompts with a free account', body: 'Your likes shape the For you tab.', icon: Heart },
  save: { title: 'Save this prompt to your library — free account', body: 'Saved prompts are one click away in your library.', icon: Bookmark },
  fork: { title: 'Fork this prompt — free account', body: 'Forks are private copies you can edit in your library.', icon: GitFork },
  for_you: { title: 'Get prompts picked for you', body: 'Save or like three prompts and the For you tab fills up.', icon: Sparkles },
};

interface SignUpCtaProps {
  intent: CtaIntent;
  onClose: () => void;
}

export function SignUpCta({ intent, onClose }: SignUpCtaProps) {
  const [returnTo, setReturnTo] = useState('/feed');

  useEffect(() => {
    if (!intent) return;
    const here = `${window.location.pathname}${window.location.search}`;
    setReturnTo(here);
    if (intent.slug && (intent.kind === 'like' || intent.kind === 'save')) {
      setPendingReaction({ slug: intent.slug, kind: intent.kind, returnTo: here });
    }
  }, [intent]);

  const copy = intent ? COPY[intent.kind] : COPY.save;
  const Icon = copy.icon;
  const redirect = encodeURIComponent(returnTo);

  return (
    <Dialog open={!!intent} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <span className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A227]/10 text-[#C9A227]" aria-hidden>
            <Icon className="h-5 w-5" />
          </span>
          <DialogTitle className="text-center font-display">{copy.title}</DialogTitle>
          <DialogDescription className="text-center">{copy.body}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
          <Button asChild className="w-full">
            <Link href={`/auth/register?redirect=${redirect}`}>Create a free account</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href={`/auth/login?redirect=${redirect}`}>I already have an account</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
