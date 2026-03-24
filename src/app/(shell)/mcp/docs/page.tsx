import { Suspense } from 'react';
import MCPDocsView from './MCPDocsView';

export default function MCPDocsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen animate-pulse space-y-6">
          <div className="h-10 w-48 rounded bg-[var(--card)]" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-[var(--card)]" />
            ))}
          </div>
        </div>
      }
    >
      <MCPDocsView />
    </Suspense>
  );
}
