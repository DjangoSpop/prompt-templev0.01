import { MODEL_COLORS } from '@/lib/mcp-utils';

interface Props {
  models: string[];
}

export function MCPModelBadges({ models }: Props) {
  return (
    <div className="flex gap-1">
      {models.slice(0, 3).map((model) => (
        <span
          key={model}
          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${MODEL_COLORS[model] || 'bg-gray-100 text-gray-600'}`}
        >
          {model}
        </span>
      ))}
    </div>
  );
}
