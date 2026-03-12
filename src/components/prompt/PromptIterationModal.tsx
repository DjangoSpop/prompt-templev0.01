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
import { usePromptOptimization } from '@/hooks/api/useAI';
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
  RefreshCw,
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
  type InteractionType,
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
  const typeInfo = ITERATION_CHANGE_TYPES.find(
    (ct) => ct.value === iteration.interaction_type
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
          #{iteration.iteration_number}
        </div>
        <div className="w-px h-full bg-border mt-1" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium truncate">
            {iteration.changes_summary || typeInfo?.label || 'Update'}
          </span>
          {isCurrent && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0">
              Current
            </Badge>
          )}
          {iteration.is_bookmarked && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              ★
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-[10px]">
            {typeInfo?.label || iteration.interaction_type}
          </Badge>
          {iteration.diff_size !== undefined && iteration.diff_size !== 0 && (
            <>
              <span>·</span>
              <span className={iteration.diff_size > 0 ? 'text-green-600' : 'text-red-500'}>
                {iteration.diff_size > 0 ? '+' : ''}{iteration.diff_size} chars
              </span>
            </>
          )}
          <span>·</span>
          <Clock className="h-3 w-3" />
          <span>{formatDate(iteration.created_at)}</span>
        </div>
        {iteration.tokens_output && (
          <div className="mt-1 text-xs text-muted-foreground">
            {iteration.tokens_output} tokens out
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
  const [changeType, setChangeType] = useState<InteractionType>('refinement');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // AI Enhance streaming for the Create tab
  const { optimize: runAIEnhance, cancel: cancelAIEnhance, isStreaming: isAIEnhancing, output: aiEnhanceOutput } = usePromptOptimization();

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
    if (!isOpen) cancelAIEnhance();
  }, [isOpen, prompt?.id]);

  // Stream AI enhance output into the new content textarea
  useEffect(() => {
    if (isAIEnhancing && aiEnhanceOutput) setNewContent(aiEnhanceOutput);
  }, [isAIEnhancing, aiEnhanceOutput]);

  const handleAIEnhance = async () => {
    if (!prompt || isAIEnhancing) return;
    setNewContent('');
    setChangeType('optimization');
    setChangeDescription('AI-enhanced version');
    setFormErrors({});
    await runAIEnhance({
      original: prompt.content,
      session_id: `iter_enhance_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      mode: 'fast',
    });
  };

  // Auto-select latest iteration
  useEffect(() => {
    if (iterations.length > 0 && !selectedIteration) {
      setSelectedIteration(iterations[0]);
    }
  }, [iterations]);

  const sortedIterations = useMemo(
    () => [...iterations].sort((a, b) => b.iteration_number - a.iteration_number),
    [iterations]
  );

  // The HEAD iteration — is_active = true, or fall back to the highest-numbered one
  const activeIteration = useMemo(
    () => sortedIterations.find((i) => i.is_active) ?? sortedIterations[0] ?? null,
    [sortedIterations]
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

  // Create iteration — sends correct API field names and chains previous_iteration
  const handleCreateIteration = async () => {
    if (!prompt || !validateCreate()) return;

    const payload: CreateIterationRequest = {
      prompt_text: newContent.trim(),
      // Chain to the current HEAD so diff_size is computed correctly
      previous_iteration: activeIteration?.id ?? null,
      interaction_type: changeType,
      changes_summary: changeDescription.trim(),
      tokens_input: Math.ceil((prompt.content.length || 0) / 4),
      tokens_output: Math.ceil(newContent.trim().length / 4),
    };

    try {
      await createMutation.mutateAsync({
        promptId: prompt.id,
        data: payload,
      });
      // Optimistically reflect new content in the store
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

  // Set iteration as active (HEAD) — calls /iterations/{id}/set-active/
  const handleRevert = async (iteration: PromptIteration) => {
    if (!prompt) return;
    try {
      await revertMutation.mutateAsync({
        promptId: prompt.id,
        iterationId: iteration.id,
      });
      updatePrompt(prompt.id, {
        content: iteration.prompt_text,
        current_version: iteration.iteration_number,
      });
      setNewContent(iteration.prompt_text);
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
            #{activeIteration?.iteration_number ?? currentVersion}
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
            onClick={() => handleSaveAsNew(newContent || activeIteration?.prompt_text || prompt.content)}
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
                      isCurrent={iter.is_active}
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
                            Iteration #{selectedIteration.iteration_number}
                            {selectedIteration.version_tag && (
                              <Badge variant="outline" className="text-[10px]">
                                {selectedIteration.version_tag}
                              </Badge>
                            )}
                            {selectedIteration.is_active && (
                              <Badge variant="default" className="text-[10px]">
                                HEAD
                              </Badge>
                            )}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {selectedIteration.changes_summary || selectedIteration.interaction_type}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(selectedIteration.prompt_text)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          {!selectedIteration.is_active && (
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
                              Set Active
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSaveAsNew(selectedIteration.prompt_text)}
                          >
                            <BookOpen className="h-3.5 w-3.5 mr-1" />
                            Save as New
                          </Button>
                        </div>
                      </div>

                      {/* Content viewer */}
                      <div className="p-3 border rounded-md bg-muted/30 text-sm font-mono whitespace-pre-wrap max-h-[300px] overflow-auto">
                        {selectedIteration.prompt_text}
                      </div>

                      {/* Metrics */}
                      {(selectedIteration.tokens_output || selectedIteration.diff_size) && (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-3">
                          {selectedIteration.tokens_output && (
                            <span>~{selectedIteration.tokens_output} tokens out</span>
                          )}
                          {selectedIteration.diff_size !== undefined && selectedIteration.diff_size !== 0 && (
                            <span className={selectedIteration.diff_size > 0 ? 'text-green-600' : 'text-red-500'}>
                              {selectedIteration.diff_size > 0 ? '+' : ''}{selectedIteration.diff_size} chars
                            </span>
                          )}
                          {selectedIteration.credits_spent && (
                            <span>{selectedIteration.credits_spent} credits</span>
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
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Current Version (v{currentVersion})
                </Label>
                {/* AI Enhance button — streams optimized content into the editor */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isAIEnhancing || createMutation.isPending}
                  onClick={handleAIEnhance}
                  className="h-6 px-2.5 text-xs gap-1.5 text-purple-600 border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  {isAIEnhancing
                    ? <><RefreshCw className="h-3 w-3 animate-spin" /> Enhancing…</>
                    : <><Sparkles className="h-3 w-3" /> AI Enhance (3 credits)</>}
                </Button>
              </div>
              <div className="text-sm font-mono whitespace-pre-wrap max-h-[100px] overflow-auto text-muted-foreground">
                {prompt.content}
              </div>
            </div>

            {/* New content */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-2">
                New Content <span className="text-red-500">*</span>
                {isAIEnhancing && (
                  <span className="text-xs font-normal text-purple-600 flex items-center gap-1">
                    <RefreshCw className="h-3 w-3 animate-spin" /> AI writing…
                  </span>
                )}
              </Label>
              <Textarea
                value={newContent}
                onChange={(e) => {
                  if (isAIEnhancing) return; // don't allow edits while streaming
                  setNewContent(e.target.value);
                  if (formErrors.content)
                    setFormErrors((prev) => ({ ...prev, content: '' }));
                }}
                rows={8}
                className={cn(
                  'font-mono text-sm transition-colors',
                  formErrors.content && 'border-red-500',
                  isAIEnhancing && 'border-purple-300 bg-purple-50/30 dark:bg-purple-900/10'
                )}
                placeholder={isAIEnhancing ? '' : 'Edit the prompt content…'}
                readOnly={isAIEnhancing}
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
                  onValueChange={(v) => setChangeType(v as InteractionType)}
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
                <Label className="text-sm font-medium">Iteration A</Label>
                <Select
                  value={String(compareA)}
                  onValueChange={(v) => setCompareA(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select iteration" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedIterations.map((iter) => (
                      <SelectItem key={iter.id} value={String(iter.iteration_number)}>
                        #{iter.iteration_number} — {iter.changes_summary || iter.interaction_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Iteration B</Label>
                <Select
                  value={String(compareB)}
                  onValueChange={(v) => setCompareB(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select iteration" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedIterations.map((iter) => (
                      <SelectItem key={iter.id} value={String(iter.iteration_number)}>
                        #{iter.iteration_number} — {iter.changes_summary || iter.interaction_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {compareA > 0 && compareB > 0 && compareA !== compareB ? (
              <SimpleDiffView
                before={
                  sortedIterations.find((i) => i.iteration_number === compareA)?.prompt_text ?? ''
                }
                after={
                  sortedIterations.find((i) => i.iteration_number === compareB)?.prompt_text ?? ''
                }
                labelBefore={`Iteration #${compareA}`}
                labelAfter={`Iteration #${compareB}`}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ArrowLeftRight className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">
                  Select two different iterations to compare
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
