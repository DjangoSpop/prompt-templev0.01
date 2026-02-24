'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { Save, Check, AlertCircle, LogIn } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SavePromptButtonProps {
  originalPrompt: string;
  optimizedPrompt: string;
  improvements?: string[];
  disabled?: boolean;
  onSuccess?: (promptId: string) => void;
}

export function SavePromptButton({
  originalPrompt,
  optimizedPrompt,
  improvements = [],
  disabled = false,
  onSuccess,
}: SavePromptButtonProps) {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('optimization');
  const [tags, setTags] = useState('');

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title for your prompt');
      return;
    }

    setIsSaving(true);
    try {
      // Save using the saved prompts endpoint
      const response = await apiClient.createSavedPrompt({
        title: title.trim(),
        content: optimizedPrompt,
        description: description.trim() || `Optimized: ${originalPrompt.substring(0, 100)}...`,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        category: category || 'optimization',
        is_public: false,
      });

      if (response) {
        toast.success('✨ Prompt saved to your library!', {
          description: `"${title}" is ready to use anytime`,
        });
        setIsOpen(false);

        // Reset form
        setTitle('');
        setDescription('');
        setCategory('optimization');
        setTags('');

        // Callback for parent component
        onSuccess?.(response.id || '');
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast.error('Failed to save prompt', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            disabled={disabled}
            className="gap-2 bg-gradient-to-r from-royal-gold-500 to-royal-gold-600 hover:from-royal-gold-600 hover:to-royal-gold-700"
          >
            <Save className="w-4 h-4" />
            Save Prompt
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-obsidian-900 border-royal-gold-500/20">
          <DialogHeader>
            <DialogTitle className="text-desert-sand-100">Sign In to Save</DialogTitle>
            <DialogDescription className="text-desert-sand-400">
              Create an account or sign in to save optimized prompts to your personal library.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <div className="p-4 bg-yellow-500/10 border border-yellow-600/30 rounded-lg flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-600">
                Your optimization results are temporary. Sign in to save them permanently.
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-royal-gold-500/30 text-desert-sand-100 hover:bg-obsidian-800"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                window.location.href = '/auth/login?redirect=/optimizer';
              }}
              className="gap-2 bg-gradient-to-r from-royal-gold-500 to-royal-gold-600 hover:from-royal-gold-600 hover:to-royal-gold-700"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          className="gap-2 bg-gradient-to-r from-royal-gold-500 to-royal-gold-600 hover:from-royal-gold-600 hover:to-royal-gold-700"
        >
          <Save className="w-4 h-4" />
          Save Prompt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-obsidian-900 border-royal-gold-500/20">
        <DialogHeader>
          <DialogTitle className="text-desert-sand-100">Save Optimized Prompt</DialogTitle>
          <DialogDescription className="text-desert-sand-400">
            Save this optimization to your library for future reference and reuse.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-desert-sand-200">
              Prompt Name *
            </Label>
            <Input
              id="title"
              placeholder="e.g., Marketing Email Copywriter"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-obsidian-800 border-royal-gold-500/20 text-desert-sand-100 placeholder-desert-sand-600"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-desert-sand-200">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="What does this prompt do? When should you use it?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-obsidian-800 border-royal-gold-500/20 text-desert-sand-100 placeholder-desert-sand-600 min-h-20"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-desert-sand-200">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-obsidian-800 border-royal-gold-500/20 text-desert-sand-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-obsidian-800 border-royal-gold-500/20">
                <SelectItem value="optimization">AI Optimization</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="creative">Creative Writing</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-desert-sand-200">
              Tags (comma-separated)
            </Label>
            <Input
              id="tags"
              placeholder="e.g., copywriting, email, conversion"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="bg-obsidian-800 border-royal-gold-500/20 text-desert-sand-100 placeholder-desert-sand-600"
            />
          </div>

          {/* Preview */}
          {improvements.length > 0 && (
            <div className="p-3 bg-royal-gold-500/10 border border-royal-gold-500/20 rounded-lg">
              <p className="text-xs font-medium text-royal-gold-300 mb-2">Improvements Applied:</p>
              <ul className="text-xs text-desert-sand-300 space-y-1">
                {improvements.slice(0, 3).map((imp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-royal-gold-500 flex-shrink-0 mt-0.5" />
                    <span>{imp}</span>
                  </li>
                ))}
                {improvements.length > 3 && (
                  <li className="text-desert-sand-400">
                    +{improvements.length - 3} more improvements
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSaving}
            className="border-royal-gold-500/30 text-desert-sand-100 hover:bg-obsidian-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="gap-2 bg-gradient-to-r from-royal-gold-500 to-royal-gold-600 hover:from-royal-gold-600 hover:to-royal-gold-700"
          >
            {isSaving ? (
              <>
                <div className="animate-spin">
                  <Save className="w-4 h-4" />
                </div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save to Library
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
