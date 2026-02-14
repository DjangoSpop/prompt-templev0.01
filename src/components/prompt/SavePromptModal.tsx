/**
 * Save Prompt Modal
 * Allows users to save prompts to their library from chat, templates, or manual entry.
 * Supports create & edit modes with category, tags, metadata, and favorites.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, useModal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Save,
  Heart,
  Tag,
  X,
  Plus,
  Loader2,
  BookOpen,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSavedPromptsStore } from '@/store/saved-prompts';
import { useCreateSavedPrompt, useUpdateSavedPrompt } from '@/hooks/api/useSavedPrompts';
import {
  PROMPT_CATEGORIES,
  type SavePromptRequest,
  type SavedPrompt,
} from '@/types/saved-prompts';

// ============================================
// Component
// ============================================

export function SavePromptModal() {
  const { saveModal, closeSaveModal } = useSavedPromptsStore();
  const createMutation = useCreateSavedPrompt();
  const updateMutation = useUpdateSavedPrompt();

  const { isOpen, mode, initialData, promptId, sourceTemplateName } = saveModal;

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('General');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = mode === 'edit';
  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Initialize form from initialData / mode
  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setDescription(initialData.description || '');
      setCategory(initialData.category || 'General');
      setTags(initialData.tags || []);
      setIsFavorite(initialData.is_favorite || false);
      setIsPublic(initialData.is_public || false);
    } else if (isOpen) {
      resetForm();
    }
  }, [isOpen, initialData]);

  const resetForm = useCallback(() => {
    setTitle('');
    setContent('');
    setDescription('');
    setCategory('General');
    setTags([]);
    setTagInput('');
    setIsFavorite(false);
    setIsPublic(false);
    setErrors({});
  }, []);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    else if (title.trim().length < 3) newErrors.title = 'Title must be at least 3 characters';
    else if (title.trim().length > 200) newErrors.title = 'Title must be less than 200 characters';

    if (!content.trim()) newErrors.content = 'Prompt content is required';
    else if (content.trim().length < 10) newErrors.content = 'Content must be at least 10 characters';

    if (!category) newErrors.category = 'Category is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Tag management
  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  // Submit
  const handleSubmit = async () => {
    if (!validate()) return;

    const payload: SavePromptRequest = {
      title: title.trim(),
      content: content.trim(),
      description: description.trim() || undefined,
      category,
      tags,
      is_favorite: isFavorite,
      is_public: isPublic,
      source: initialData?.source || 'manual',
      source_template_id: initialData?.source_template_id,
      variables_snapshot: initialData?.variables_snapshot,
      metadata: initialData?.metadata,
    };

    try {
      if (isEdit && promptId) {
        await updateMutation.mutateAsync({ id: promptId, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      resetForm();
    } catch {
      // Error handled by mutation onError
    }
  };

  const handleClose = () => {
    resetForm();
    closeSaveModal();
  };

  // Title helpers
  const getModalTitle = () => {
    switch (mode) {
      case 'edit':
        return 'Edit Saved Prompt';
      case 'save-from-chat':
        return 'Save Prompt from Chat';
      case 'save-from-template':
        return `Save from Template${sourceTemplateName ? `: ${sourceTemplateName}` : ''}`;
      default:
        return 'Save Prompt to Library';
    }
  };

  const getModalIcon = () => {
    switch (mode) {
      case 'save-from-chat':
        return <Sparkles className="h-5 w-5 text-pharaoh" />;
      case 'save-from-template':
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <BookOpen className="h-5 w-5 text-pharaoh" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={getModalTitle()}
      size="lg"
      headerActions={getModalIcon()}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFavorite(!isFavorite)}
            className={cn(
              'flex items-center gap-1.5 transition-colors',
              isFavorite && 'text-red-500'
            )}
          >
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
            {isFavorite ? 'Favorited' : 'Add to Favorites'}
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="pharaoh-button flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isEdit ? 'Update' : 'Save to Library'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="prompt-title" className="text-sm font-medium">
            Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="prompt-title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            placeholder="Give your prompt a descriptive title..."
            className={cn(errors.title && 'border-red-500')}
          />
          {errors.title && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.title}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {title.length}/200 characters
          </p>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <Label htmlFor="prompt-content" className="text-sm font-medium">
            Prompt Content <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="prompt-content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errors.content) setErrors((prev) => ({ ...prev, content: '' }));
            }}
            placeholder="Enter the prompt content..."
            rows={6}
            className={cn('font-mono text-sm', errors.content && 'border-red-500')}
          />
          {errors.content && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.content}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {content.length} characters &middot; ~{Math.ceil(content.length / 4)} tokens
          </p>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="prompt-description" className="text-sm font-medium">
            Description <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="prompt-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this prompt for? When to use it..."
            rows={2}
          />
        </div>

        {/* Category + Visibility row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className={cn(errors.category && 'border-red-500')}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {PROMPT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.category}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Visibility</Label>
            <Select
              value={isPublic ? 'public' : 'private'}
              onValueChange={(v) => setIsPublic(v === 'public')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">🔒 Private</SelectItem>
                <SelectItem value="public">🌍 Public</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">
            Tags <span className="text-muted-foreground">(up to 10)</span>
          </Label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type a tag and press Enter..."
                className="pl-8"
                disabled={tags.length >= 10}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addTag}
              disabled={!tagInput.trim() || tags.length >= 10}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1 text-xs cursor-pointer hover:bg-destructive/20"
                  onClick={() => removeTag(tag)}
                >
                  {tag}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Source info (read-only) */}
        {(mode === 'save-from-chat' || mode === 'save-from-template') && (
          <div className="rounded-md border border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 p-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">
                {mode === 'save-from-chat'
                  ? 'This prompt will be saved from your chat session'
                  : `Saved from template: ${sourceTemplateName || 'Unknown'}`}
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default SavePromptModal;
