'use client';

import type { PromptVariable } from '@/types/mcp';

interface Props {
  variables: PromptVariable[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}

export function MCPPromptVariableForm({ variables, values, onChange }: Props) {
  const updateValue = (name: string, value: string) => {
    onChange({ ...values, [name]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[var(--fg)]/80 uppercase tracking-wider">
        Fill in Variables
      </h3>
      {variables.map((v) => (
        <div key={v.name}>
          <label className="block text-sm font-medium text-[var(--fg)] mb-1">
            {v.description}
          </label>
          <input
            type="text"
            placeholder={v.example}
            value={values[v.name] || ''}
            onChange={(e) => updateValue(v.name, e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)]
                       px-3 py-2 text-sm text-[var(--fg)]
                       placeholder:text-[var(--fg)]/30
                       focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40
                       focus:border-[#C9A227]"
          />
          <p className="mt-1 text-xs text-[var(--fg)]/40">
            e.g., {v.example}
          </p>
        </div>
      ))}
    </div>
  );
}
