'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useMCPPromptDetail } from '@/hooks/useMCPContent';
import { MCPDifficultyBadge } from '@/components/mcp/MCPDifficultyBadge';
import { MCPModelBadges } from '@/components/mcp/MCPModelBadges';
import { MCPPromptVariableForm } from '@/components/mcp/MCPPromptVariableForm';
import { MCPPromptPreview } from '@/components/mcp/MCPPromptPreview';
import { renderPromptTemplate, USE_CASE_LABELS } from '@/lib/mcp-utils';
import { motion } from 'framer-motion';

export default function MCPPromptDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: prompt, isLoading } = useMCPPromptDetail(slug);
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="h-8 w-2/3 bg-[var(--bg)] animate-pulse rounded mb-4" />
        <div className="h-64 bg-[var(--bg)] animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl text-[var(--fg)]/50">Prompt not found</h1>
      </div>
    );
  }

  const handleCopy = () => {
    const rendered = renderPromptTemplate(prompt.prompt_template, values);
    navigator.clipboard.writeText(rendered);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <MCPDifficultyBadge difficulty={prompt.difficulty} />
          {prompt.is_featured && (
            <span className="rounded-full bg-[#C9A227]/15 px-2.5 py-0.5 text-xs font-medium text-[#C9A227]">
              Featured
            </span>
          )}
          {prompt.is_premium && (
            <span className="rounded-full bg-[#1E3A8A]/10 px-2.5 py-0.5 text-xs font-medium text-[#1E3A8A] dark:text-[#6CA0FF]">
              Premium · {prompt.credit_cost} credits
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-[var(--fg)] mb-2">
          {prompt.title}
        </h1>

        <div className="flex items-center gap-3 text-sm text-[var(--fg)]/50 flex-wrap">
          <span>{prompt.category_icon} {prompt.category_name}</span>
          <span>·</span>
          <span>{USE_CASE_LABELS[prompt.use_case]}</span>
          <span>·</span>
          <span>Quality {prompt.quality_score.toFixed(2)}</span>
          <span>·</span>
          <MCPModelBadges models={prompt.target_models} />
        </div>

        <p className="mt-4 text-[var(--fg)]/70">{prompt.description}</p>
      </motion.div>

      {/* Two-column: Form + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Variable Form */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          {prompt.variables && prompt.variables.length > 0 ? (
            <MCPPromptVariableForm
              variables={prompt.variables}
              values={values}
              onChange={setValues}
            />
          ) : (
            <p className="text-sm text-[var(--fg)]/50">
              This prompt has no customizable variables. Copy it directly!
            </p>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="mt-6 w-full rounded-lg bg-[#C9A227] py-3 text-sm font-semibold
                       text-[#0E1B2A] hover:bg-[#C9A227]/90 transition-colors"
          >
            {copied ? 'Copied to Clipboard!' : 'Copy Prompt'}
          </button>
        </div>

        {/* Right: Live Preview */}
        <MCPPromptPreview template={prompt.prompt_template} values={values} />
      </div>

      {/* Tags */}
      <div className="mt-6 flex flex-wrap gap-2">
        {prompt.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-[var(--bg)] border border-[var(--border)]
                       px-3 py-1 text-xs text-[var(--fg)]/60"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
