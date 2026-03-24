'use client';

import { Heart } from 'lucide-react';
import { useBookmarkSkill, useUnbookmarkSkill } from '@/lib/hooks/useSkills';
import { cn } from '@/lib/utils';

interface Props {
  skillId: string;
  isBookmarked?: boolean;
  className?: string;
}

export function SkillBookmarkButton({ skillId, isBookmarked = false, className }: Props) {
  const bookmark = useBookmarkSkill();
  const unbookmark = useUnbookmarkSkill();
  const isPending = bookmark.isPending || unbookmark.isPending;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isPending) return;
    if (isBookmarked) {
      unbookmark.mutate(skillId);
    } else {
      bookmark.mutate(skillId);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'inline-flex items-center justify-center rounded-lg p-2 transition-colors',
        isBookmarked
          ? 'text-red-500 hover:bg-red-500/10'
          : 'text-[var(--fg)]/40 hover:text-red-500 hover:bg-red-500/10',
        isPending && 'opacity-50 cursor-not-allowed',
        className,
      )}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark skill'}
    >
      <Heart className={cn('h-4 w-4', isBookmarked && 'fill-current')} />
    </button>
  );
}
