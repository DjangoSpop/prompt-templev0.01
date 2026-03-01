'use client';

import { PrivacyPolicyContent } from '@/components/privacy/PrivacyPolicyContent';
import { AppLayoutWithSidebar } from '@/components/sidebar/AppLayoutWithSidebar';
import { Metadata } from 'next';

/**
 * Privacy Policy Page
 * 
 * This page displays the comprehensive privacy policy for the Prompt Temple Broadcaster extension
 * Complies with Chrome Web Store Developer Program Policies
 * Can be shared as: https://yoursite.com/privacy-policy
 * Or embedded in the extension page
 */
export default function PrivacyPolicyPage() {
  return (
    <AppLayoutWithSidebar>
      <div className="w-full max-w-4xl mx-auto">
        <PrivacyPolicyContent />
      </div>
    </AppLayoutWithSidebar>
  );
}
