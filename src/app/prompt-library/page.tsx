'use client';

import React from 'react';
import { PromptLibrary } from '@/components/prompt/PromptLibrary';
import { SavePromptModal } from '@/components/prompt/SavePromptModal';
import { PromptIterationModal } from '@/components/prompt/PromptIterationModal';

export default function PromptLibraryPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <PromptLibrary />

      {/* Global modals for save & iteration */}
      <SavePromptModal />
      <PromptIterationModal />
    </div>
  );
}
