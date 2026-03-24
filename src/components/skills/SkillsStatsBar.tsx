'use client';

import { Server, Layers, BookOpen, TrendingUp } from 'lucide-react';
import { useSkillsStats } from '@/lib/hooks/useSkills';

export function SkillsStatsBar() {
  const { data } = useSkillsStats();

  const stats = [
    { label: 'Total Skills', value: data?.total_skills ?? '—', icon: Layers },
    { label: 'MCP Servers', value: data?.by_type?.mcp_server ?? '—', icon: Server },
    { label: 'Techniques', value: data?.by_type?.prompt_technique ?? '—', icon: BookOpen },
    { label: 'Frameworks', value: data?.by_type?.framework ?? '—', icon: TrendingUp },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex items-center gap-3 rounded-xl border border-[var(--border)]
                     bg-[var(--card)] px-4 py-3"
        >
          <s.icon className="h-5 w-5 text-[#C9A227]" />
          <div>
            <p className="text-lg font-bold text-[var(--fg)]">{s.value}</p>
            <p className="text-xs text-[var(--fg)]/50">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
