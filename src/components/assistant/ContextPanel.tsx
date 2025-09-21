'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { TavilyContext } from '@/types/assistant';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ExternalLinkIcon,
  PinIcon,
  CopyIcon,
  CalendarIcon,
  StarIcon
} from 'lucide-react';

interface ContextPanelProps {
  context: TavilyContext[];
  onPinToContext?: (item: TavilyContext) => void;
  className?: string;
}

export function ContextPanel({ context, onPinToContext, className }: ContextPanelProps) {
  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const getReliabilityColor = (score?: number) => {
    if (!score) return 'gray';
    if (score >= 0.8) return 'green';
    if (score >= 0.6) return 'yellow';
    return 'red';
  };

  const getReliabilityLabel = (score?: number) => {
    if (!score) return 'Unknown';
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className={cn('space-y-3', className)}>
      {context.map((item, index) => (
        <ContextCard
          key={index}
          item={item}
          onPin={onPinToContext}
          onCopyUrl={handleCopyUrl}
          reliabilityColor={getReliabilityColor(item.score)}
          reliabilityLabel={getReliabilityLabel(item.score)}
        />
      ))}
    </div>
  );
}

interface ContextCardProps {
  item: TavilyContext;
  onPin?: (item: TavilyContext) => void;
  onCopyUrl: (url: string) => void;
  reliabilityColor: string;
  reliabilityLabel: string;
}

function ContextCard({
  item,
  onPin,
  onCopyUrl,
  reliabilityColor,
  reliabilityLabel,
}: ContextCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
              {item.title}
            </h4>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="truncate">{getDomain(item.url)}</span>
              {item.published_date && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="h-3 w-3" />
                    <span>{formatDate(item.published_date)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {/* Reliability Score */}
            {item.score !== undefined && (
              <Badge
                variant={reliabilityColor === 'green' ? 'default' : 'secondary'}
                className={cn(
                  'text-xs h-5 px-2',
                  reliabilityColor === 'green' && 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                  reliabilityColor === 'yellow' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
                  reliabilityColor === 'red' && 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                )}
              >
                <StarIcon className="h-2 w-2 mr-1" />
                {reliabilityLabel}
              </Badge>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-1">
              {onPin && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onPin(item)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Pin to context"
                >
                  <PinIcon className="h-3 w-3" />
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCopyUrl(item.url)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Copy URL"
              >
                <CopyIcon className="h-3 w-3" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open(item.url, '_blank')}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Open in new tab"
              >
                <ExternalLinkIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
          {item.content}
        </p>
      </CardContent>
    </Card>
  );
}