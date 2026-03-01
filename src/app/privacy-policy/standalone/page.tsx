'use client';

import { PrivacyPolicyContent } from '@/components/privacy/PrivacyPolicyContent';

/**
 * Standalone Privacy Policy Page (No Sidebar)
 * 
 * This version is suitable for:
 * - Embedding in the Chrome Extension settings/options page
 * - Standalone view without navigation sidebar
 * - Mobile-first responsive design
 */
export default function PrivacyPolicyStandalonePage() {
  return (
    <div className="min-h-screen min-h-dvh bg-gradient-to-br from-background via-papyrus/5 to-background/80 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Standalone Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Privacy Policy
            </span>
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Prompt Temple Broadcaster - Professional Browser Extension
          </p>
        </div>

        {/* Policy Content */}
        <div className="rounded-2xl bg-white dark:bg-gray-900/80 backdrop-blur-xl border border-gold-accent/20 shadow-2xl p-6 md:p-10">
          <PrivacyPolicyContent />
        </div>
      </div>
    </div>
  );
}
