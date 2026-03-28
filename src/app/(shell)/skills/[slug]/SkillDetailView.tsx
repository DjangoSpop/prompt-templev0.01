'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, ExternalLink, Eye, Bookmark, Zap, Star, CheckCircle, Package } from 'lucide-react';
import { useSkillDetail } from '@/lib/hooks/useSkills';
import { SkillBookmarkButton } from '@/components/skills/SkillBookmarkButton';
import { SkillTypeBadge } from '@/components/skills/SkillTypeBadge';
import { MCPDifficultyBadge } from '@/components/mcp/MCPDifficultyBadge';
import { MCPToolsList } from '@/components/skills/MCPToolsList';
import { MCP_TRANSPORT_LABELS } from '@/lib/mcp-utils';
import type { Skill } from '@/types/mcp';

export default function SkillDetailView() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const { data: skill, isLoading } = useSkillDetail(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen animate-pulse space-y-6">
        <div className="h-8 w-48 rounded bg-[var(--card)]" />
        <div className="h-12 w-full max-w-lg rounded bg-[var(--card)]" />
        <div className="h-64 rounded-xl bg-[var(--card)]" />
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-[var(--fg)]/60">Skill not found</p>
        <button
          onClick={() => router.push('/skills')}
          className="mt-4 text-[#C9A227] hover:underline text-sm"
        >
          Back to Skills
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Back link */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-[var(--fg)]/50
                   hover:text-[#C9A227] transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Skills
      </button>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <SkillTypeBadge type={skill.skill_type} />
              <MCPDifficultyBadge difficulty={skill.difficulty} />
              {skill.is_featured && (
                <span className="inline-flex items-center gap-1 rounded-full
                               bg-[#C9A227]/15 px-2.5 py-0.5 text-xs font-medium
                               text-[#C9A227]">
                  ★ Featured
                </span>
              )}
              {skill.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-full
                               bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium
                               text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-3 w-3" /> Verified
                </span>
              )}
            </div>

            <h1 className="mb-2 text-2xl font-bold text-[var(--fg)] md:text-3xl">
              {skill.title}
            </h1>

            {skill.mcp_server_name && (
              <code className="mb-2 block break-all text-sm font-mono text-[#C9A227]/80">
                {skill.mcp_server_name}
              </code>
            )}

            <p className="text-sm text-[var(--fg)]/60 sm:text-base">{skill.description}</p>
          </div>

          {/* MCP Server Info */}
          {skill.skill_type === 'mcp_server' && (
            <div className="mb-6 space-y-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
              <h3 className="font-semibold text-[var(--fg)]">Server Details</h3>

              {skill.mcp_transport && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-[var(--fg)]/50">Transport:</span>
                  <span className="text-[var(--fg)]">
                    {MCP_TRANSPORT_LABELS[skill.mcp_transport]}
                  </span>
                </div>
              )}

              {skill.mcp_version && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-[var(--fg)]/50">MCP Version:</span>
                  <code className="font-mono text-xs bg-[var(--bg)] px-2 py-0.5 rounded">
                    {skill.mcp_version}
                  </code>
                </div>
              )}

              {/* Packages */}
              {skill.mcp_packages?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-[var(--fg)]/70 mb-2 flex items-center gap-1.5">
                    <Package className="h-4 w-4" /> Packages
                  </h4>
                  <div className="space-y-2">
                    {skill.mcp_packages.map((pkg) => (
                      <div key={pkg.name} className="rounded-lg bg-[var(--bg)] p-3">
                        <code className="break-all text-xs font-mono text-[#C9A227]">{pkg.name}</code>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[var(--fg)]/50">
                          <span>{pkg.registry}</span>
                          <span>v{pkg.version}</span>
                        </div>
                        <div className="mt-2">
                          <code className="block overflow-x-auto rounded bg-[var(--card)] px-2 py-1 text-xs font-mono">
                            {pkg.registry === 'npm'
                              ? `npx ${pkg.name}`
                              : pkg.registry === 'pip'
                                ? `pip install ${pkg.name}`
                                : `${pkg.registry} install ${pkg.name}`}
                          </code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools */}
              {skill.mcp_tools?.length > 0 && (
                <MCPToolsList tools={skill.mcp_tools} />
              )}
            </div>
          )}

          {/* Markdown content */}
          {skill.content && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
              <div className="prose prose-sm dark:prose-invert max-w-none
                            break-words [&_*]:break-words
                            prose-headings:text-[var(--fg)] prose-p:text-[var(--fg)]/80
                            prose-a:text-[#C9A227] prose-code:text-[#C9A227]
                            prose-code:break-all
                            prose-pre:overflow-x-auto prose-pre:bg-[var(--bg)] prose-pre:border prose-pre:border-[var(--border)]">
                <ReactMarkdown>{skill.content}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">
          {/* Actions */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
            <SkillBookmarkButton skillId={skill.id} className="w-full justify-center" />

            {skill.source_url && (
              <a
                href={skill.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-lg
                           border border-[var(--border)] px-4 py-2.5 text-sm
                           text-[var(--fg)]/70 hover:bg-[var(--card)] transition-colors"
              >
                <ExternalLink className="h-4 w-4" /> View Source
              </a>
            )}
          </div>

          {/* Stats */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)]/50">
              Stats
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[var(--fg)]/60">
                  <Eye className="h-4 w-4" /> Views
                </span>
                <span className="text-[var(--fg)]">{skill.view_count.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[var(--fg)]/60">
                  <Bookmark className="h-4 w-4" /> Saves
                </span>
                <span className="text-[var(--fg)]">{skill.save_count.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[var(--fg)]/60">
                  <Zap className="h-4 w-4" /> Uses
                </span>
                <span className="text-[var(--fg)]">{skill.use_count.toLocaleString()}</span>
              </div>
              {skill.github_stars > 0 && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[var(--fg)]/60">
                    <Star className="h-4 w-4 text-[#C9A227]" /> Stars
                  </span>
                  <span className="text-[var(--fg)]">{skill.github_stars.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {skill.tags.length > 0 && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)]/50 mb-2">
                Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {skill.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/skills?search=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-[var(--bg)] px-2.5 py-0.5 text-xs
                               text-[var(--fg)]/60 hover:text-[#C9A227] transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
