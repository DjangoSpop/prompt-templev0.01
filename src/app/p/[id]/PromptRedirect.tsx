'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PromptRedirect({ promptId }: { promptId: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/discover?prompt=${promptId}`);
  }, [promptId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground text-sm">Redirecting to prompt…</p>
    </div>
  );
}
