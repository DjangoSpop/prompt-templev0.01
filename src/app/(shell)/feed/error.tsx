'use client';

/** F6: any error under /feed renders the library fallback, never a white page. */
import { FeedDisabledNotice } from '@/components/feed/FeedView';

export default function FeedError() {
  return <FeedDisabledNotice />;
}
