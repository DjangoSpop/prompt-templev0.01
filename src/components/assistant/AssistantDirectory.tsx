'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Assistant } from '@/types/assistant';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BotIcon, StarIcon, SearchIcon } from 'lucide-react';

interface AssistantDirectoryProps {
  assistants: Assistant[];
  defaultAssistantId?: string;
  onSelectAssistant: (assistantId: string) => void;
}

export function AssistantDirectory({
  assistants,
  defaultAssistantId,
  onSelectAssistant,
}: AssistantDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all unique tags
  const allTags = Array.from(
    new Set(assistants.flatMap(assistant => assistant.tags))
  );

  // Filter assistants based on search and tags
  const filteredAssistants = assistants.filter(assistant => {
    const matchesSearch = !searchQuery ||
      assistant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assistant.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(tag => assistant.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search assistants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by tags:
          </label>
          <div className="flex flex-wrap gap-1">
            {allTags.map(tag => (
              <Button
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleTag(tag)}
                className="h-6 px-2 text-xs"
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Assistant Cards */}
      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {filteredAssistants.map(assistant => (
          <AssistantCard
            key={assistant.id}
            assistant={assistant}
            isDefault={assistant.id === defaultAssistantId}
            onClick={() => onSelectAssistant(assistant.id)}
          />
        ))}

        {filteredAssistants.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <BotIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No assistants found</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface AssistantCardProps {
  assistant: Assistant;
  isDefault: boolean;
  onClick: () => void;
}

function AssistantCard({ assistant, isDefault, onClick }: AssistantCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md border",
        "hover:border-blue-300 dark:hover:border-blue-600"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <BotIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {assistant.name}
              </h3>
              {isDefault && (
                <StarIcon className="h-3 w-3 text-yellow-500 flex-shrink-0" />
              )}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
              {assistant.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {assistant.tags.slice(0, 2).map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs px-1.5 py-0.5 h-auto"
                  >
                    {tag}
                  </Badge>
                ))}
                {assistant.tags.length > 2 && (
                  <Badge
                    variant="outline"
                    className="text-xs px-1.5 py-0.5 h-auto"
                  >
                    +{assistant.tags.length - 2}
                  </Badge>
                )}
              </div>

              <div className="text-xs text-gray-400 dark:text-gray-500">
                {assistant.model}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}