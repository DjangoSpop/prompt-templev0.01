'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Scale, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { AppLayoutWithSidebar } from '@/components/sidebar/AppLayoutWithSidebar';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

function TermsOfServiceContent() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['acceptance']);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const sections: Section[] = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: <CheckCircle className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            By installing, accessing, and using Prompt Temple Broadcaster (the "Extension"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you should not use the Extension.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'use-license',
      title: 'License & Permitted Use',
      icon: <Zap className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            We grant you a limited, non-exclusive, non-transferable license to use the Extension for personal, non-commercial purposes in accordance with these Terms and our Privacy Policy.
          </p>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-4">You May:</h4>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>Install the Extension from the Chrome Web Store</li>
            <li>Use the Extension to broadcast prompts to supported AI platforms</li>
            <li>Save, edit, and manage your prompt templates locally</li>
            <li>Sync your settings across devices (if signed in)</li>
            <li>Access the side panel for research and prompt management</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white mt-4">You May NOT:</h4>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>Reverse engineer, decompile, or modify the Extension source code</li>
            <li>Remove or alter any proprietary notices or labels</li>
            <li>Use the Extension for any illegal or unauthorized purpose</li>
            <li>Resell, redistribute, or republish the Extension</li>
            <li>Use the Extension to violate any third-party terms of service</li>
            <li>Bypass security features or access controls</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'third-party',
      title: 'Third-Party Services',
      icon: <AlertCircle className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            The Extension integrates with third-party AI platforms (ChatGPT, Claude, Gemini, etc.). Your use of these platforms is governed by their respective Terms of Service and Privacy Policies.
          </p>

          <div className="space-y-3 mt-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Important Disclaimer:</h4>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                <strong>We are not affiliated with or endorsed by ChatGPT, Claude, Gemini, or any other AI platforms.</strong> The Extension is a third-party tool that helps you interact with these platforms. Your use of these services remains subject to their own terms and policies.
              </p>
            </div>
          </div>

          <div className="space-y-2 mt-4 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <strong>Prompt Responsibility:</strong> You are responsible for the content of prompts you broadcast. Do not send illegal, harmful, or abusive content to any platform.
            </p>
            <p>
              <strong>Terms Compliance:</strong> Ensure your use of the Extension and third-party platforms complies with their respective Terms of Service.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'warranty',
      title: 'Warranty Disclaimer',
      icon: <AlertCircle className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-900 dark:text-red-100">
              <strong>DISCLAIMER OF WARRANTIES:</strong> The Extension is provided "AS IS" without any warranties, express or implied. We do not guarantee that the Extension will be error-free, uninterrupted, or meet your specific requirements.
            </p>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300">
            We disclaim all warranties, including:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Merchantability or fitness for a particular purpose</li>
            <li>Non-infringement of third-party rights</li>
            <li>Compatibility with all systems or browsers</li>
            <li>Uninterrupted operation or error-free functionality</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'limitation',
      title: 'Limitation of Liability',
      icon: <AlertCircle className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-900 dark:text-red-100">
              <strong>LIMITATION OF LIABILITY:</strong> To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, profits, or business opportunity.
            </p>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300">
            Our total liability under these Terms shall not exceed the fees you have paid for the Extension in the past 12 months (which is $0 if the Extension is free).
          </p>
        </div>
      ),
    },
    {
      id: 'governing-law',
      title: 'Governing Law',
      icon: <Scale className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            These Terms of Service are governed by and construed in accordance with the laws applicable to the developer's jurisdiction, without regard to its conflict of law principles.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Any dispute arising from these Terms shall be subject to the exclusive jurisdiction of the courts in the applicable jurisdiction.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'changes',
      title: 'Changes to Terms',
      icon: <Zap className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of the Extension after changes are posted constitutes your acceptance of the modified Terms.
          </p>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              <strong>Material changes</strong> will be posted on this page and may include a notification within the Extension or via email.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'contact',
      title: 'Contact Information',
      icon: <CheckCircle className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">📧</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Email</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">support@prompttemple.dev</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">🌐</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Website</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">prompttemple.dev</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold">
          <Scale className="w-4 h-4" />
          Legal Terms
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-4">
          Terms of Service
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          <strong>Prompt Temple Broadcaster</strong> — Browser Extension
        </p>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-3">
        {sections.map((section) => (
          <div
            key={section.id}
            className="border border-gray-300/50 dark:border-gray-600/50 rounded-xl hover:border-blue-400/50 transition overflow-hidden bg-white dark:bg-gray-900/50 shadow-sm hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl text-blue-600 dark:text-blue-400">
                  {section.icon}
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white text-left">
                  {section.title}
                </h2>
              </div>
              {expandedSections.includes(section.id) ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.includes(section.id) && (
              <div className="border-t border-gray-300/50 dark:border-gray-600/50 px-6 py-4 bg-gray-50/50 dark:bg-gray-800/30">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center py-6 border-t border-gray-300/50 dark:border-gray-600/50">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © 2024-2026 Prompt Temple. All rights reserved.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          These Terms of Service were last updated on {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
}

/**
 * Terms of Service Page
 */
export default function TermsOfServicePage() {
  return (
    <AppLayoutWithSidebar>
      <div className="w-full max-w-4xl mx-auto">
        <TermsOfServiceContent />
      </div>
    </AppLayoutWithSidebar>
  );
}
