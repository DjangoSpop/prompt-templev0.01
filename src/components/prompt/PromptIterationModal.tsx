/**
 * Prompt Iteration Modal
 * Full version-control experience for prompt engineering:
 * - View iteration history timeline
 * - Create new iterations with change types
 * - Side-by-side diff view
 * - Revert to any version
 * - Save iteration as new prompt
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  GitBranch,
  GitCommit,
  Clock,
  ArrowLeftRight,
  RotateCcw,
  Plus,
  Save,
  BookOpen,
  Loader2,
  ChevronRight,
  FileText,
  Diff,
  History,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSavedPromptsStore } from '@/store/saved-prompts';
import {
  usePromptIterations,
  useCreateIteration,
  useRevertToIteration,
} from '@/hooks/api/useSavedPrompts';
import {
  ITERATION_CHANGE_TYPES,
  type PromptIteration,
  type IterationChangeType,
  type SavedPrompt,
  type CreateIterationRequest,
} from '@/types/saved-prompts';

// ============================================
// Sub-Components
// ============================================

/** Timeline item for a single iteration */
function IterationTimelineItem({
  iteration,
  isActive,
  isCurrent,
  onClick,
}: {
  iteration: PromptIteration;
  isActive: boolean;
  isCurrent: boolean;
  onClick: () => void;
}) {
  const changeTypeInfo = ITERATION_CHANGE_TYPES.find(
    (ct) => ct.value === iteration.change_type
  );

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors',
        'border border-transparent hover:border-border hover:bg-muted/50',
        isActive && 'border-pharaoh bg-pharaoh/5',
        isCurrent && 'ring-1 ring-pharaoh/30'
      )}
    >
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
            isCurrent
              ? 'bg-pharaoh text-white'
              : isActive
                ? 'bg-pharaoh/20 text-pharaoh'
                : 'bg-muted text-muted-foreground'
          )}
        >
          v{iteration.version}
        </div>
        <div className="w-px h-full bg-border mt-1" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium truncate">
            {iteration.change_description || changeTypeInfo?.label || 'Update'}
          </span>
          {isCurrent && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0">
              Current
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-[10px]">
            {changeTypeInfo?.label || iteration.change_type}
          </Badge>
          <span>·</span>
          <Clock className="h-3 w-3" />
          <span>{formatDate(iteration.created_at)}</span>
        </div>
        {iteration.performance_metrics && (
          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
            {iteration.performance_metrics.tokens_after && (
              <span>{iteration.performance_metrics.tokens_after} tokens</span>
            )}
            {iteration.performance_metrics.quality_score_after && (
              <span>
                Quality: {Math.round(iteration.performance_metrics.quality_score_after * 100)}%
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

/** Simple diff view between two texts */
function SimpleDiffView({
  before,
  after,
  labelBefore = 'Before',
  labelAfter = 'After',
}: {
  before: string;
  after: string;
  labelBefore?: string;
  labelAfter?: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {labelBefore}
        </Label>
        <div className="p-3 border rounded-md bg-red-50/30 dark:bg-red-900/10 text-sm font-mono whitespace-pre-wrap min-h-[120px] max-h-[300px] overflow-auto">
          {before || <span className="italic text-muted-foreground">Empty</span>}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {labelAfter}
        </Label>
        <div className="p-3 border rounded-md bg-green-50/30 dark:bg-green-900/10 text-sm font-mono whitespace-pre-wrap min-h-[120px] max-h-[300px] overflow-auto">
          {after || <span className="italic text-muted-foreground">Empty</span>}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function PromptIterationModal() {
  const { iterationModal, closeIterationModal, openSaveModal, updatePrompt } =
    useSavedPromptsStore();
  const { isOpen, prompt } = iterationModal;

  const promptId = prompt?.id || '';
  const {
    data: iterations = [],
    isLoading: loadingIterations,
  } = usePromptIterations(promptId);
  const createMutation = useCreateIteration();
  const revertMutation = useRevertToIteration();

  // Local state
  const [activeTab, setActiveTab] = useState<'history' | 'create' | 'compare'>('history');
  const [selectedIteration, setSelectedIteration] = useState<PromptIteration | null>(null);

  // Create iteration form
  const [newContent, setNewContent] = useState('');
  const [changeDescription, setChangeDescription] = useState('');
  const [changeType, setChangeType] = useState<IterationChangeType>('refinement');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Compare state
  const [compareA, setCompareA] = useState<number>(0);
  const [compareB, setCompareB] = useState<number>(0);

  // Reset form when prompt changes
  useEffect(() => {
    if (isOpen && prompt) {
      setNewContent(prompt.content);
      setChangeDescription('');
      setChangeType('refinement');
      setSelectedIteration(null);
      setFormErrors({});
      setActiveTab('history');
    }
  }, [isOpen, prompt?.id]);

  // Auto-select latest iteration
  useEffect(() => {
    if (iterations.length > 0 && !selectedIteration) {
      setSelectedIteration(iterations[0]);
    }
  }, [iterations]);

  const sortedIterations = useMemo(
    () => [...iterations].sort((a, b) => b.version - a.version),
    [iterations]
  );

  // Validation
  const validateCreate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!newContent.trim()) errors.content = 'Content is required';
    if (newContent.trim() === prompt?.content)
      errors.content = 'Content must differ from current version';
    if (!changeDescription.trim())
      errors.description = 'Describe what changed';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create iteration
  const handleCreateIteration = async () => {
    if (!prompt || !validateCreate()) return;

    const payload: CreateIterationRequest = {
      content: newContent.trim(),
      change_description: changeDescription.trim(),
      change_type: changeType,
      performance_metrics: {
        tokens_before: Math.ceil((prompt.content.length || 0) / 4),
        tokens_after: Math.ceil(newContent.trim().length / 4),
      },
    };

    try {
      await createMutation.mutateAsync({
        promptId: prompt.id,
        data: payload,
      });
      // Update the prompt's content in store
      updatePrompt(prompt.id, {
        content: newContent.trim(),
        current_version: (prompt.current_version || 1) + 1,
      });
      setActiveTab('history');
      setChangeDescription('');
    } catch {
      // Handled by mutation
    }
  };

  // Revert
  const handleRevert = async (iteration: PromptIteration) => {
    if (!prompt) return;
    try {
      await revertMutation.mutateAsync({
        promptId: prompt.id,
        iterationId: iteration.id,
      });
      updatePrompt(prompt.id, {
        content: iteration.content,
        current_version: iteration.version,
      });
      setNewContent(iteration.content);
    } catch {
      // Handled by mutation
    }
  };

  // Save iteration as new prompt
  const handleSaveAsNew = (content: string) => {
    closeIterationModal();
    openSaveModal({
      mode: 'create',
      initialData: {
        title: `${prompt?.title || 'Prompt'} (iteration)`,
        content,
        category: prompt?.category || 'General',
        tags: prompt?.tags || [],
        source: 'iteration',
        source_template_id: prompt?.source_template_id,
      },
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!prompt) return null;

  const currentVersion = prompt.current_version || 1;

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeIterationModal}
      title="Prompt Iteration Studio"
      size="xl"
      headerActions={
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <GitBranch className="h-3 w-3 mr-1" />
            v{currentVersion}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {sortedIterations.length} iteration{sortedIterations.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Prompt header */}
        <div className="flex items-center justify-between pb-3 border-b">
          <div>
            <h3 className="font-medium">{prompt.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {prompt.category} · {prompt.use_count} uses · Created{' '}
              {formatDate(prompt.created_at)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSaveAsNew(newContent || prompt.content)}
            className="flex items-center gap-1.5"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Save as New
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="w-full">
            <TabsTrigger value="history" className="flex items-center gap-1.5 flex-1">
              <History className="h-3.5 w-3.5" />
              History
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-1.5 flex-1">
              <Plus className="h-3.5 w-3.5" />
              New Iteration
            </TabsTrigger>
            <TabsTrigger
              value="compare"
              className="flex items-center gap-1.5 flex-1"
              disabled={sortedIterations.length < 2}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Compare
            </TabsTrigger>
          </TabsList>

          {/* ========== History Tab ========== */}
          <TabsContent value="history" className="mt-4">
            {loadingIterations ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : sortedIterations.length === 0 ? (
              <div className="text-center py-12">
                <GitCommit className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="font-medium text-muted-foreground">No iterations yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first iteration to start tracking changes
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setActiveTab('create')}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create First Iteration
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
                {/* Timeline sidebar */}
                <div className="space-y-1 max-h-[400px] overflow-auto pr-2">
                  {sortedIterations.map((iter) => (
                    <IterationTimelineItem
                      key={iter.id}
                      iteration={iter}
                      isActive={selectedIteration?.id === iter.id}
                      isCurrent={iter.version === currentVersion}
                      onClick={() => setSelectedIteration(iter)}
                    />
                  ))}
                </div>

                {/* Detail panel */}
                <div className="border rounded-lg p-4 space-y-4">
                  {selectedIteration ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            Version {selectedIteration.version}
                            {selectedIteration.version === currentVersion && (
                              <Badge variant="default" className="text-[10px]">
                                Current
                              </Badge>
                            )}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {selectedIteration.change_description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(selectedIteration.content)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          {selectedIteration.version !== currentVersion && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevert(selectedIteration)}
                              disabled={revertMutation.isPending}
                              className="flex items-center gap-1"
                            >
                              {revertMutation.isPending ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <RotateCcw className="h-3.5 w-3.5" />
                              )}
                              Revert
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSaveAsNew(selectedIteration.content)}
                          >
                            <BookOpen className="h-3.5 w-3.5 mr-1" />
                            Save as New
                          </Button>
                        </div>
                      </div>

                      {/* Content viewer */}
                      <div className="p-3 border rounded-md bg-muted/30 text-sm font-mono whitespace-pre-wrap max-h-[300px] overflow-auto">
                        {selectedIteration.content}
                      </div>

                      {/* Metrics */}
                      {selectedIteration.performance_metrics && (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-3">
                          {selectedIteration.performance_metrics.tokens_after && (
                            <span>
                              ~{selectedIteration.performance_metrics.tokens_after} tokens
                            </span>
                          )}
                          {selectedIteration.performance_metrics.quality_score_after && (
                            <span>
                              Quality:{' '}
                              {Math.round(
                                selectedIteration.performance_metrics.quality_score_after * 100
                              )}
                              %
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Eye className="h-6 w-6 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Select an iteration to view details</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ========== Create Tab ========== */}
          <TabsContent value="create" className="mt-4 space-y-4">
            {/* Current version reference */}
            <div className="rounded-md border bg-muted/20 p-3">
              <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                <FileText className="h-3 w-3" />
                Current Version (v{currentVersion})
              </Label>
              <div className="text-sm font-mono whitespace-pre-wrap max-h-[100px] overflow-auto text-muted-foreground">
                {prompt.content}
              </div>
            </div>

            {/* New content */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                New Content <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={newContent}
                onChange={(e) => {
                  setNewContent(e.target.value);
                  if (formErrors.content)
                    setFormErrors((prev) => ({ ...prev, content: '' }));
                }}
                rows={8}
                className={cn(
                  'font-mono text-sm',
                  formErrors.content && 'border-red-500'
                )}
                placeholder="Edit the prompt content..."
              />
              {formErrors.content && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.content}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {newContent.length} chars · ~{Math.ceil(newContent.length / 4)} tokens
                {newContent.trim() !== prompt.content && (
                  <span className="ml-2 text-pharaoh">
                    ({newContent.length - prompt.content.length > 0 ? '+' : ''}
                    {newContent.length - prompt.content.length} chars)
                  </span>
                )}
              </p>
            </div>

            {/* Change type + description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Change Type</Label>
                <Select
                  value={changeType}
                  onValueChange={(v) => setChangeType(v as IterationChangeType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ITERATION_CHANGE_TYPES.map((ct) => (
                      <SelectItem key={ct.value} value={ct.value}>
                        <div className="flex flex-col">
                          <span>{ct.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {ct.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  What changed? <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={changeDescription}
                  onChange={(e) => {
                    setChangeDescription(e.target.value);
                    if (formErrors.description)
                      setFormErrors((prev) => ({ ...prev, description: '' }));
                  }}
                  placeholder="Describe the changes..."
                  className={cn(formErrors.description && 'border-red-500')}
                />
                {formErrors.description && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Diff preview */}
            {newContent.trim() !== prompt.content && (
              <SimpleDiffView
                before={prompt.content}
                after={newContent.trim()}
                labelBefore={`v${currentVersion} (current)`}
                labelAfter={`v${currentVersion + 1} (new)`}
              />
            )}

            {/* Submit */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setActiveTab('history')}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateIteration}
                disabled={createMutation.isPending}
                className="pharaoh-button flex items-center gap-2"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GitCommit className="h-4 w-4" />
                )}
                Create Iteration v{currentVersion + 1}
              </Button>
            </div>
          </TabsContent>

          {/* ========== Compare Tab ========== */}
          <TabsContent value="compare" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Version A</Label>
                <Select
                  value={String(compareA)}
                  onValueChange={(v) => setCompareA(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedIterations.map((iter) => (
                      <SelectItem key={iter.id} value={String(iter.version)}>
                        v{iter.version} —{' '}
                        {iter.change_description || iter.change_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Version B</Label>
                <Select
                  value={String(compareB)}
                  onValueChange={(v) => setCompareB(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedIterations.map((iter) => (
                      <SelectItem key={iter.id} value={String(iter.version)}>
                        v{iter.version} —{' '}
                        {iter.change_description || iter.change_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {compareA > 0 && compareB > 0 && compareA !== compareB ? (
              <SimpleDiffView
                before={
                  sortedIterations.find((i) => i.version === compareA)?.content ||
                  ''
                }
                after={
                  sortedIterations.find((i) => i.version === compareB)?.content ||
                  ''
                }
                labelBefore={`Version ${compareA}`}
                labelAfter={`Version ${compareB}`}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ArrowLeftRight className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">
                  Select two different versions to compare
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Modal>
  );
}

// ============================================
// Utility
// ============================================

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return dateStr;
  }
}

export default PromptIterationModal;
