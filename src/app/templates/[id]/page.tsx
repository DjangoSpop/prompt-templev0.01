'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import TemplateDetailView from '@/components/TemplateDetailView';

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  useEffect(() => {
    // If templateId is undefined or invalid, redirect to templates list
    if (!templateId || templateId === 'undefined') {
      console.warn('Invalid template ID detected, redirecting to templates list');
      router.push('/templates');
    }
  }, [templateId, router]);

  // Don't render the component if templateId is invalid
  if (!templateId || templateId === 'undefined') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Invalid template ID. Redirecting...</p>
        </div>
      </div>
    );
  }

  return <TemplateDetailView templateId={templateId} />;
}
