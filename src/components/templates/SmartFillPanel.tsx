'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Wand2, Check, X, Loader2, Lightbulb, RotateCcw } from 'lucide-react';
import { useSmartFill } from '@/hooks/api/useSmartTemplates';
import { CostPreviewPill } from '@/components/credits/CostPreviewPill';
import { toast } from 'sonner';

interface SmartFillPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  templateTitle?: string;
  templatePreview?: string;
  variables: Record<string, string>;
  onApply: (suggestions: Record<string, string>) => void;
}

type Step = 'setup' | 'loading' | 'results' | 'error';

export function SmartFillPanel({
  open,
  onOpenChange,
  templateId,
  templateTitle,
  templatePreview,
  variables,
  onApply,
}: SmartFillPanelProps) {
  const smartFill = useSmartFill(templateId);
  const [context, setContext] = useState('');
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState<Step>('setup');

  const handleRun = () => {
    setStep('loading');
    // Merge context into variables so the AI has extra signal
    const payload: Record<string, string> = {
      ...variables,
      ...(context.trim() ? { _context: context.trim() } : {}),
    };

    smartFill.mutate(payload, {
      onSuccess: (data) => {
        const initialAccepted: Record<string, boolean> = {};
        Object.keys(data.suggestions).forEach((k) => {
          initialAccepted[k] = true;
        });
        setAccepted(initialAccepted);
        setStep('results');
      },
      onError: () => {
        setStep('error');
      },
    });
  };

  const handleReset = () => {
    setStep('setup');
    setAccepted({});
  };

  const handleApply = () => {
    if (!smartFill.data) return;
    const toApply: Record<string, string> = {};
    Object.entries(smartFill.data.suggestions).forEach(([key, values]) => {
      if (accepted[key] && values.length > 0) {
        toApply[key] = values[0];
      }
    });
    onApply(toApply);
    toast.success('AI suggestions applied');
    onOpenChange(false);
  };

  const toggleAccepted = (key: string) => {
    setAccepted((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const acceptedCount = Object.values(accepted).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleReset(); onOpenChange(v); }}>
      <DialogContent className="w-full sm:max-w-lg max-h-[92vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Smart Fill
          </DialogTitle>
          <DialogDescription>
            Describe your use-case and AI will suggest values for every template variable.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">

          {/* â”€â”€ Setup step â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {step === 'setup' && (
            <div className="space-y-4">
              {/* Template preview chip */}
              {(templateTitle || templatePreview) && (
                <div className="rounded-lg border bg-muted/40 px-3 py-2 space-y-1">
                  {templateTitle && (
                    <p className="text-xs font-semibold text-foreground">{templateTitle}</p>
                  )}
                  {templatePreview && (
                    <p className="text-xs text-muted-foreground line-clamp-3">{templatePreview}</p>
                  )}
                </div>
              )}

              {/* Variables summary */}
              {Object.keys(variables).length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">
                    Variables to fill ({Object.keys(variables).length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(variables).map((k) => (
                      <Badge key={k} variant="secondary" className="text-xs">
                        {k.replace(/_/g, ' ')}
                        {variables[k] && (
                          <span className="ml-1 opacity-50">= {variables[k].slice(0, 12)}{variables[k].length > 12 ? 'â€¦' : ''}</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Context textarea */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                  Your context <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g. I'm writing a cold outreach email for a B2B SaaS targeting HR managers in healthcareâ€¦"
                  className="w-full h-24 px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-shadow"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">{context.length}/500</p>
              </div>

              {/* Cost + CTA */}
              <div className="flex items-center justify-between pt-1">
                <CostPreviewPill feature="template_smart_fill" />
                <Button
                  onClick={handleRun}
                  disabled={smartFill.isPending}
                  className="gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  Generate Suggestions
                </Button>
              </div>
            </div>
          )}

          {/* â”€â”€ Loading step â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {step === 'loading' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Analysing your template and contextâ€¦</span>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
          )}

          {/* â”€â”€ Results step â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {step === 'results' && smartFill.data && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Toggle to accept or reject each suggestion.
                </p>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Start over
                </button>
              </div>

              {Object.entries(smartFill.data.suggestions).map(([key, values]) => (
                <div key={key} className="rounded-lg border bg-card p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <button
                      onClick={() => toggleAccepted(key)}
                      className={`rounded-full p-0.5 transition-colors ${
                        accepted[key]
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                      aria-label={accepted[key] ? 'Mark as rejected' : 'Mark as accepted'}
                    >
                      {accepted[key] ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="space-y-1">
                    {values.slice(0, 3).map((v, i) => (
                      <p
                        key={i}
                        className={`text-sm rounded px-2 py-1.5 cursor-pointer transition-colors ${
                          i === 0
                            ? 'bg-primary/5 text-foreground border border-primary/20'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                        onClick={() => {
                          // clicking a suggestion auto-accepts it
                          setAccepted((prev) => ({ ...prev, [key]: true }));
                        }}
                      >
                        {v}
                        {i === 0 && (
                          <Badge variant="outline" className="ml-2 text-[10px]">best</Badge>
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              ))}

              {smartFill.data.credits_used !== undefined && (
                <p className="text-xs text-muted-foreground text-right">
                  {smartFill.data.credits_used} credit{smartFill.data.credits_used !== 1 ? 's' : ''} used
                </p>
              )}
            </div>
          )}

          {/* â”€â”€ Error step â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {step === 'error' && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive space-y-3">
              <p>Failed to generate suggestions. Please try again.</p>
              <Button variant="ghost" size="sm" className="w-full" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Try again
              </Button>
            </div>
          )}
        </div>

        {/* Footer â€” only shown when results ready */}
        {step === 'results' && smartFill.data && (
          <DialogFooter className="shrink-0 pt-3 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={acceptedCount === 0}
            >
              Apply {acceptedCount > 0 ? `${acceptedCount} ` : ''}
              {acceptedCount === 1 ? 'Suggestion' : 'Suggestions'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
