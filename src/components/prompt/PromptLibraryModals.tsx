/**
 * Global Prompt Library Modals
 * Renders SavePromptModal + PromptIterationModal at the app root
 * so they are accessible from any page (chat, composer, templates, etc.)
 */

'use client';

import React from 'react';
import { SavePromptModal } from './SavePromptModal';
import { PromptIterationModal } from './PromptIterationModal';

export function PromptLibraryModals() {
  return (
    <>
      <SavePromptModal />
      <PromptIterationModal />
    </>
  );
}
