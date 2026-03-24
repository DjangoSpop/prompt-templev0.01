'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Wrench } from 'lucide-react';
import type { MCPTool } from '@/types/mcp';

interface Props {
  tools: MCPTool[];
}

export function MCPToolsList({ tools }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!tools.length) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-[var(--fg)]/70 flex items-center gap-2">
        <Wrench className="h-4 w-4" />
        MCP Tools ({tools.length})
      </h4>
      <div className="space-y-1">
        {tools.map((tool) => (
          <div
            key={tool.name}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg)]"
          >
            <button
              onClick={() => setExpanded(expanded === tool.name ? null : tool.name)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm
                         hover:bg-[var(--card)] transition-colors rounded-lg"
            >
              {expanded === tool.name ? (
                <ChevronDown className="h-3.5 w-3.5 text-[var(--fg)]/50" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-[var(--fg)]/50" />
              )}
              <code className="font-mono text-[#C9A227] text-xs">{tool.name}</code>
              <span className="text-[var(--fg)]/50 text-xs truncate ml-1">
                {tool.description}
              </span>
            </button>
            {expanded === tool.name && (
              <div className="px-3 pb-3 pt-1">
                <p className="text-xs text-[var(--fg)]/60 mb-2">{tool.description}</p>
                {tool.input_schema && (
                  <pre className="rounded-md bg-[var(--card)] p-2 text-xs font-mono
                                  text-[var(--fg)]/70 overflow-x-auto">
                    {JSON.stringify(tool.input_schema, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
