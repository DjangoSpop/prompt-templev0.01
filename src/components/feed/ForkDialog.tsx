'use client';

/** F3 — confirm a fork; the fork is a private copy in the user's library (`/prompt-library`). */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GitFork, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trackFeed } from '@/lib/feed/analytics';
import { isAuthRequired } from '@/lib/feed/api';
import { useFork } from '@/lib/feed/hooks';
import type { FeedItem } from '@/lib/feed/types';

interface ForkDialogProps {
  item: Pick<FeedItem, 'slug' | 'title' | 'form'> | null;
  onClose: () => void;
}

export function ForkDialog({ item, onClose }: ForkDialogProps) {
  const fork = useFork();
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (item) setTitle(`${item.title} (my version)`.slice(0, 200));
  }, [item]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    try {
      await fork.mutateAsync({ slug: item.slug, title: title.trim() || undefined });
      trackFeed('prompt_forked', { form: item.form });
      toast.success('Forked to your library', {
        description: 'It is private until you share it.',
        action: { label: 'Open library', onClick: () => window.location.assign('/prompt-library') },
      });
      onClose();
    } catch (error) {
      toast.error(isAuthRequired(error) ? 'Please sign in again to fork.' : 'Could not fork this prompt. Try again.');
    }
  };

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <GitFork className="h-4 w-4 text-[#C9A227]" aria-hidden /> Fork this prompt
            </DialogTitle>
            <DialogDescription>
              A private copy goes to your <Link href="/prompt-library" className="underline">library</Link>, where you
              can edit it. The original stays as it is.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 space-y-2">
            <Label htmlFor="fork-title">Title</Label>
            <Input id="fork-title" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={fork.isPending}>
              {fork.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
              Fork
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
