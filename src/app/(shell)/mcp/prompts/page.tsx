import { Suspense } from 'react';
import MCPPromptsView from './MCPPromptsView';

export default function MCPPromptsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen animate-pulse space-y-6">
          <div className="h-10 w-48 rounded bg-[var(--card)]" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 rounded-xl bg-[var(--card)]" />
            ))}
          </div>
        </div>
      }
    >
      <MCPPromptsView />
    </Suspense>
  );
}
