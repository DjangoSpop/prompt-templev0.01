'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Layers, Copy, Loader2, RefreshCw } from 'lucide-react';
import { useTemplateVariations } from '@/hooks/api/useSmartTemplates';
import { CostPreviewPill } from '@/components/credits/CostPreviewPill';
import { toast } from 'sonner';
import type { TemplateVariation } from '@/lib/api/typed-client';

interface VariationsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  templateTitle: string;
  onUseVariation?: (variation: TemplateVariation) => void;
}

export function VariationsDrawer({
  open,
  onOpenChange,
  templateId,
  templateTitle,
  onUseVariation,
}: VariationsDrawerProps) {
  const variationsMutation = useTemplateVariations(templateId);

  const handleGenerate = () => {
    variationsMutation.mutate({ count: 4 });
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Variation copied to clipboard');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Template Variations
          </DialogTitle>
          <DialogDescription>
            AI-generated variations of <strong>{templateTitle}</strong> for different use cases.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {!variationsMutation.data && !variationsMutation.isPending && (
            <div className="flex items-center justify-between">
              <CostPreviewPill feature="template_variations" />
              <Button onClick={handleGenerate} className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Generate Variations
              </Button>
            </div>
          )}

          {variationsMutation.isPending && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating variations…</span>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border p-4 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </div>
          )}

          {variationsMutation.error && !variationsMutation.isPending && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              Failed to generate variations. Please try again.
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full"
                onClick={handleGenerate}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Retry
              </Button>
            </div>
          )}

          {variationsMutation.data && !variationsMutation.isPending && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {variationsMutation.data.length} variations generated
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerate}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <RefreshCw className="h-3 w-3" />
                  Regenerate
                </Button>
              </div>

              <div className="grid gap-4">
                {variationsMutation.data.map((variation, i) => (
                  <div
                    key={i}
                    className="rounded-lg border bg-card p-4 space-y-3 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-sm">{variation.title}</h3>
                        {variation.difference_summary && (
                          <Badge variant="secondary" className="text-xs font-normal">
                            {variation.difference_summary}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                      {variation.content}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(variation.content)}
                        className="flex items-center gap-1.5"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </Button>
                      {onUseVariation && (
                        <Button
                          size="sm"
                          onClick={() => {
                            onUseVariation(variation);
                            onOpenChange(false);
                          }}
                        >
                          Use This
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
