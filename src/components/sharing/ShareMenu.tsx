'use client';

import { Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiClient } from '@/lib/api-client';

export type ShareChannel = 'native' | 'copy_link' | 'x' | 'linkedin';

export type ShareEntityType = 'template' | 'skill' | 'mcp_prompt';

interface ShareMenuProps {
  title: string;
  description?: string;
  url: string;
  ogImageUrl?: string;
  entityType: ShareEntityType;
  entityId: string | number;
  extraAnalyticsData?: Record<string, unknown>;
  className?: string;
}

export function ShareMenu({
  title,
  description,
  url,
  ogImageUrl,
  entityType,
  entityId,
  extraAnalyticsData,
  className,
}: ShareMenuProps) {
  const shareText = description
    ? `${description} — via Prompt Temple`
    : `Check out "${title}" on Prompt Temple.`;

  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  const trackShare = async (channel: ShareChannel) => {
    try {
      await apiClient.trackEvent({
        event_type: `${entityType}_shared`,
        data: {
          [`${entityType}_id`]: entityId,
          channel,
          share_url: url,
          ...extraAnalyticsData,
        },
      });
    } catch (analyticsError) {
      console.warn('Analytics tracking failed:', analyticsError);
    }
  };

  const handleShare = async (channel: ShareChannel) => {
    try {
      if (channel === 'x') {
        window.open(xShareUrl, '_blank', 'noopener,noreferrer,width=640,height=560');
        toast.success('Opening X share...');
        await trackShare('x');
        return;
      }

      if (channel === 'linkedin') {
        window.open(linkedInShareUrl, '_blank', 'noopener,noreferrer,width=640,height=560');
        toast.success('Opening LinkedIn share...');
        await trackShare('linkedin');
        return;
      }

      if (channel === 'copy_link') {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied!', { icon: '🔗', duration: 2500 });
        await trackShare('copy_link');
        return;
      }

      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: `${title} · Prompt Temple`,
          text: shareText,
          url,
        });
        toast.success('Shared successfully!');
        await trackShare('native');
        return;
      }

      await navigator.clipboard.writeText(url);
      toast.success('Share not supported here. Link copied instead!', {
        icon: '🔗',
        duration: 3000,
      });
      await trackShare('copy_link');
    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') return;
      console.error('Failed to share:', error);
      toast.error('Unable to share right now.');
    }
  };

  return (
    <div className={className} onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="border-primary/30 hover:border-primary hover:bg-primary/10 text-xs"
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
            }}
            aria-label={`Share ${title}`}
          >
            <Share2 className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuLabel>Share</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => handleShare('native')}>
            <Share2 className="h-4 w-4 mr-2" />
            Quick Share
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleShare('x')}>
            X (Twitter)
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleShare('linkedin')}>
            LinkedIn
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleShare('copy_link')}>
            Copy Link
          </DropdownMenuItem>
          {ogImageUrl && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href={ogImageUrl} target="_blank" rel="noopener noreferrer">
                  Preview OG Card
                </a>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default ShareMenu;
