'use client';

import type { SkillType } from '@/types/mcp';
import { SKILL_TYPE_CONFIG } from '@/lib/mcp-utils';

interface Props {
  type: SkillType;
}

export function SkillTypeBadge({ type }: Props) {
  const config = SKILL_TYPE_CONFIG[type];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color} ${config.bg}`}>
      {config.label}
    </span>
  );
}
