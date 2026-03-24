'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useMCPPromptDetail } from '@/hooks/useMCPContent';
import { MCPDifficultyBadge } from '@/components/mcp/MCPDifficultyBadge';
import { MCPPromptPreview } from '@/components/mcp/MCPPromptPreview';
import { MCPPromptVariableForm } from '@/components/mcp/MCPPromptVariableForm';
import { MCPModelBadges } from '@/components/mcp/MCPModelBadges';
import { extractVariableNames } from '@/lib/mcp-utils';

export default function MCPPromptDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: prompt, isLoading } = useMCPPromptDetail(slug);
  const [values, setValues] = useState<Record<string, string>>({});

  const variables = useMemo(() => {
    if (!prompt) return [];
    // Use prompt.variables if available, otherwise extract from template
    if (prompt.variables?.length) return prompt.variables;
    return extractVariableNames(prompt.prompt_template).map((name) => ({
      name,
      description: '',
      example: '',
    }));
  }, [prompt]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 rounded bg-[var(--card)]" />
        <div className="h-12 w-96 rounded bg-[var(--card)]" />
        <div className="h-64 rounded-xl bg-[var(--card)]" />
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-[var(--fg)]/60">Prompt not found</p>
        <button onClick={() => router.push('/mcp/prompts')} className="mt-4 text-[#C9A227] text-sm hover:underline">
          Back to Prompts
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-[var(--fg)]/50
                   hover:text-[#C9A227] transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <MCPDifficultyBadge difficulty={prompt.difficulty} />
          {prompt.is_featured && (
            <span className="inline-flex items-center rounded-full bg-[#C9A227]/15 px-2.5 py-0.5 text-xs font-medium text-[#C9A227]">
              ★ Featured
            </span>
          )}
          <MCPModelBadges models={prompt.target_models} />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-[var(--fg)] mb-2">{prompt.title}</h1>
        <p className="text-[var(--fg)]/60">{prompt.description}</p>

        <div className="flex items-center gap-4 mt-3 text-xs text-[var(--fg)]/50">
          <span>{prompt.category_icon} {prompt.category_name}</span>
          <span>{prompt.usage_count} uses</span>
          {prompt.avg_rating && <span>★ {prompt.avg_rating.toFixed(1)}</span>}
          <span>{prompt.credit_cost} credit{prompt.credit_cost !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Tags */}
      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {prompt.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-[var(--bg)] px-2.5 py-0.5 text-xs text-[var(--fg)]/60">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Variable form + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <MCPPromptVariableForm
            variables={variables}
            values={values}
            onChange={setValues}
          />
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <MCPPromptPreview
            template={prompt.prompt_template}
            values={values}
          />
        </div>
      </div>

      {/* Example output */}
      {prompt.example_output && (
        <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h3 className="font-semibold text-[var(--fg)] mb-3">Example Output</h3>
          <div className="rounded-lg bg-[var(--bg)] p-4 text-sm text-[var(--fg)]/70 whitespace-pre-wrap">
            {prompt.example_output}
          </div>
        </div>
      )}
    </div>
  );
}
