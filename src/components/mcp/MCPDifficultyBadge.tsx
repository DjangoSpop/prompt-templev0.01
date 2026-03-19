import type { PromptDifficulty } from '@/types/mcp';
import { DIFFICULTY_CONFIG } from '@/lib/mcp-utils';

interface Props {
  difficulty: PromptDifficulty;
}

export function MCPDifficultyBadge({ difficulty }: Props) {
  const config = DIFFICULTY_CONFIG[difficulty];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color} ${config.bg}`}>
      {config.label}
    </span>
  );
}
