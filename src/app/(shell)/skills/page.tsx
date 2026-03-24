import { Suspense } from 'react';
import SkillsView from './SkillsView';

export default function SkillsPage() {
  return (
    <Suspense fallback={<SkillsLoading />}>
      <SkillsView />
    </Suspense>
  );
}

function SkillsLoading() {
  return (
    <div className="min-h-screen animate-pulse space-y-6">
      <div className="h-48 rounded-2xl bg-[var(--card)]" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-[var(--card)]" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 rounded-xl bg-[var(--card)]" />
        ))}
      </div>
    </div>
  );
}
