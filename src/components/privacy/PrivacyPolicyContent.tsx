'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, Lock, Eye, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export function PrivacyPolicyContent() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['single-purpose']);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const sections: Section[] = [
    {
      id: 'single-purpose',
      title: 'Single Purpose & Core Functionality',
      icon: <Sparkles className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-700 dark:text-green-400 font-semibold mb-2">
              ✓ Single Purpose Confirmed
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Prompt Temple Broadcaster is designed with a single, narrow purpose: to help users research and craft better prompts by opening selected AI provider tabs, injecting user prompts into active pages on request, and saving/reusing prompt templates locally.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">Core Features:</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 text-sm">
              <li>Inject user prompts into supported AI provider pages (ChatGPT, Claude, Gemini, etc.)</li>
              <li>Broadcast prompts across multiple AI platforms simultaneously</li>
              <li>Save and reuse prompt templates locally in the browser</li>
              <li>Access side panel with prompt library and research tools</li>
              <li>Optional cross-device sync with user authentication</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'permissions',
      title: 'Permissions & Justifications',
      icon: <Lock className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="grid gap-4">
            {/* activeTab */}
            <div className="border border-gray-300/50 dark:border-gray-600/50 rounded-lg p-4 hover:border-blue-400/50 transition">
              <div className="flex items-start gap-3">
                <span className="inline-block w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center justify-center mt-1 flex-shrink-0">
                  1
                </span>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                    activeTab
                  </h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Used only when the user clicks "Broadcast" to access the currently active AI provider tab and insert the user's prompt into the page.
                  </p>
                  <div className="bg-blue-50/50 dark:bg-blue-950/20 border-l-2 border-blue-400 px-3 py-2 rounded text-xs text-gray-600 dark:text-gray-400">
                    <strong>User-initiated only:</strong> Permission is only used when user explicitly triggers the broadcast action.
                  </div>
                </div>
              </div>
            </div>

            {/* tabs */}
            <div className="border border-gray-300/50 dark:border-gray-600/50 rounded-lg p-4 hover:border-blue-400/50 transition">
              <div className="flex items-start gap-3">
                <span className="inline-block w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center justify-center mt-1 flex-shrink-0">
                  2
                </span>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                    tabs
                  </h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Used to open, list, and manage AI provider tabs during user-initiated broadcasting and to return focus to the extension after completion.
                  </p>
                  <div className="bg-blue-50/50 dark:bg-blue-950/20 border-l-2 border-blue-400 px-3 py-2 rounded text-xs text-gray-600 dark:text-gray-400">
                    <strong>User control:</strong> Users select which tabs to open and manage broadcast destinations.
                  </div>
                </div>
              </div>
            </div>

            {/* storage */}
            <div className="border border-gray-300/50 dark:border-gray-600/50 rounded-lg p-4 hover:border-blue-400/50 transition">
              <div className="flex items-start gap-3">
                <span className="inline-block w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center justify-center mt-1 flex-shrink-0">
                  3
                </span>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                    storage
                  </h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Used to store user settings, selected providers, prompt history, templates, and saved prompts locally in the browser.
                  </p>
                  <div className="bg-blue-50/50 dark:bg-blue-950/20 border-l-2 border-blue-400 px-3 py-2 rounded text-xs text-gray-600 dark:text-gray-400">
                    <strong>Local only:</strong> All data stored locally on user's device. No data synced to servers without explicit user authentication.
                  </div>
                </div>
              </div>
            </div>

            {/* scripting */}
            <div className="border border-gray-300/50 dark:border-gray-600/50 rounded-lg p-4 hover:border-blue-400/50 transition">
              <div className="flex items-start gap-3">
                <span className="inline-block w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center justify-center mt-1 flex-shrink-0">
                  4
                </span>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                    scripting
                  </h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Required to run content scripts on supported AI provider domains selected by the user (e.g., ChatGPT, Claude, Gemini, etc.) to insert prompts and read response text for the results view.
                  </p>
                  <div className="bg-blue-50/50 dark:bg-blue-950/20 border-l-2 border-blue-400 px-3 py-2 rounded text-xs text-gray-600 dark:text-gray-400">
                    <strong>Safe scripts:</strong> All executable code is bundled in the extension package. No remote code execution.
                  </div>
                </div>
              </div>
            </div>

            {/* clipboardWrite */}
            <div className="border border-gray-300/50 dark:border-gray-600/50 rounded-lg p-4 hover:border-blue-400/50 transition">
              <div className="flex items-start gap-3">
                <span className="inline-block w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center justify-center mt-1 flex-shrink-0">
                  5
                </span>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                    clipboardWrite
                  </h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Enables the "Copy" button to copy generated prompts/templates/results to the clipboard when the user explicitly clicks copy.
                  </p>
                  <div className="bg-blue-50/50 dark:bg-blue-950/20 border-l-2 border-blue-400 px-3 py-2 rounded text-xs text-gray-600 dark:text-gray-400">
                    <strong>Explicit action:</strong> Only triggered when user explicitly clicks the copy button.
                  </div>
                </div>
              </div>
            </div>

            {/* sidePanel */}
            <div className="border border-gray-300/50 dark:border-gray-600/50 rounded-lg p-4 hover:border-blue-400/50 transition">
              <div className="flex items-start gap-3">
                <span className="inline-block w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center justify-center mt-1 flex-shrink-0">
                  6
                </span>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                    sidePanel
                  </h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Provides an optional side panel UI to access prompt library, saved prompts, and research tools while browsing without interrupting the current tab.
                  </p>
                  <div className="bg-blue-50/50 dark:bg-blue-950/20 border-l-2 border-blue-400 px-3 py-2 rounded text-xs text-gray-600 dark:text-gray-400">
                    <strong>Non-intrusive:</strong> Optional side panel that doesn't interrupt user workflow. Can be dismissed anytime.
                  </div>
                </div>
              </div>
            </div>

            {/* clipboardRead */}
            <div className="border border-gray-300/50 dark:border-gray-600/50 rounded-lg p-4 hover:border-blue-400/50 transition">
              <div className="flex items-start gap-3">
                <span className="inline-block w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center justify-center mt-1 flex-shrink-0">
                  7
                </span>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                    clipboardRead
                  </h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Used to read clipboard content when user initiates paste actions to pre-fill prompts from previously copied text.
                  </p>
                  <div className="bg-blue-50/50 dark:bg-blue-950/20 border-l-2 border-blue-400 px-3 py-2 rounded text-xs text-gray-600 dark:text-gray-400">
                    <strong>User-triggered:</strong> Only accessed when user explicitly requests paste functionality.
                  </div>
                </div>
              </div>
            </div>

            {/* alarms */}
            <div className="border border-gray-300/50 dark:border-gray-600/50 rounded-lg p-4 hover:border-blue-400/50 transition">
              <div className="flex items-start gap-3">
                <span className="inline-block w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center justify-center mt-1 flex-shrink-0">
                  8
                </span>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                    alarms
                  </h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Used to schedule lightweight periodic tasks such as cleaning expired cached results or rotating temporary session state.
                  </p>
                  <div className="bg-blue-50/50 dark:bg-blue-950/20 border-l-2 border-blue-400 px-3 py-2 rounded text-xs text-gray-600 dark:text-gray-400">
                    <strong>No background tracking:</strong> Only used for housekeeping. No data collection or monitoring.
                  </div>
                </div>
              </div>
            </div>

            {/* identity */}
            <div className="border border-gray-300/50 dark:border-gray-600/50 rounded-lg p-4 hover:border-blue-400/50 transition">
              <div className="flex items-start gap-3">
                <span className="inline-block w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center justify-center mt-1 flex-shrink-0">
                  9
                </span>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                    identity
                  </h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Used for optional sign-in (e.g., Google/GitHub) to sync user prompt library and settings across devices. The extension works perfectly without sign-in.
                  </p>
                  <div className="bg-blue-50/50 dark:bg-blue-950/20 border-l-2 border-blue-400 px-3 py-2 rounded text-xs text-gray-600 dark:text-gray-400">
                    <strong>Optional feature:</strong> Users can choose to authenticate for cross-device sync or remain completely local.
                  </div>
                </div>
              </div>
            </div>

            {/* Host Permissions */}
            <div className="border border-gray-300/50 dark:border-gray-600/50 rounded-lg p-4 hover:border-blue-400/50 transition">
              <div className="flex items-start gap-3">
                <span className="inline-block w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center justify-center mt-1 flex-shrink-0">
                  ✓
                </span>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Host Permissions
                  </h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    The extension does not download or execute remote code. All executable code is bundled in the extension package. Network requests are used only for API calls and web page access to supported sites.
                  </p>
                  <div className="bg-blue-50/50 dark:bg-blue-950/20 border-l-2 border-blue-400 px-3 py-2 rounded text-xs text-gray-600 dark:text-gray-400">
                    <strong>Remote code:</strong> No. All code is bundled locally. No external scripts or WASM files are loaded.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'data-usage',
      title: 'Data Collection & Usage',
      icon: <Eye className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4">
            <p className="text-purple-700 dark:text-purple-400 font-semibold mb-2">
              ✓ Privacy Guaranteed
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Prompt Temple Broadcaster does NOT collect, track, or share any personally identifiable user data. All data remains local on your device.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">We DO NOT Collect:</h4>
            <div className="grid gap-3">
              {[
                'Personally identifiable information (name, address, email, age)',
                'Health information (heart rate, medical history, symptoms)',
                'Financial and payment information (transactions, credit cards)',
                'Authentication information (passwords, credentials, PINs)',
                'Personal communications (emails, texts, chat messages)',
                'Location data (IP address, GPS coordinates)',
                'Web history (pages visited, browsing history)',
                'User activity (keystroke logging, mouse tracking, network monitoring)',
                'Website content or AI responses',
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                >
                  <span className="text-red-500 font-bold text-lg flex-shrink-0">✕</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 mt-6">
            <h4 className="font-semibold text-gray-900 dark:text-white">What We Store Locally:</h4>
            <div className="space-y-3">
              {[
                {
                  title: 'Prompt Templates',
                  desc: 'Stored locally in your browser only',
                },
                {
                  title: 'Broadcast History',
                  desc: 'Your past broadcast records, kept local',
                },
                {
                  title: 'User Preferences',
                  desc: 'Extension settings you configure',
                },
                {
                  title: 'Selected AI Providers',
                  desc: 'Your chosen broadcast destinations',
                },
                {
                  title: 'Session State',
                  desc: 'Temporary data for current session only',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                >
                  <span className="text-green-600 dark:text-green-400 font-bold text-lg flex-shrink-0">✓</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'data-sharing',
      title: 'Data Sharing & Third Parties',
      icon: <Shield className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4 space-y-2">
            <p className="text-green-700 dark:text-green-400 font-semibold">
              ✓ We Certify All Three Disclosures:
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <span className="text-green-600 dark:text-green-400 font-bold">1.</span>
                <p className="text-gray-700 dark:text-gray-300">
                  We do not sell or transfer user data to third parties
                </p>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-green-600 dark:text-green-400 font-bold">2.</span>
                <p className="text-gray-700 dark:text-gray-300">
                  We do not use or transfer user data for purposes unrelated to the extension's single purpose
                </p>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-green-600 dark:text-green-400 font-bold">3.</span>
                <p className="text-gray-700 dark:text-gray-300">
                  We do not use or transfer user data to determine creditworthiness or for lending purposes
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">Third-Party Integrations:</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Our extension integrates with AI platforms only as requested by the user:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 text-sm">
              <li>
                <strong>ChatGPT, Claude, Gemini, etc.:</strong> User prompts are sent directly to these platforms as if the user typed them manually. No data is intercepted or logged by our extension.
              </li>
              <li>
                <strong>Authentication Services (Optional):</strong> Google/GitHub authentication is used only for optional cross-device sync. Users remain completely local without authentication.
              </li>
              <li>
                <strong>No Analytics Tracking:</strong> We do not use Google Analytics, Mixpanel, or any third-party analytics service to track user behavior.
              </li>
              <li>
                <strong>No Advertisement Networks:</strong> No integration with ad networks. No behavioral advertising. No targeted marketing.
              </li>
            </ul>
          </div>

          <div className="space-y-3 mt-6">
            <h4 className="font-semibold text-gray-900 dark:text-white">Data Access Control:</h4>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p>
                The extension respects user privacy at every level:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Prompts sent to AI providers are handled directly by those services</li>
                <li>Saved prompts and templates are encrypted in local browser storage</li>
                <li>No extension developer has access to user data unless explicitly shared for sync</li>
                <li>Users can clear all local data at any time</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'user-controls',
      title: 'Your Privacy Controls',
      icon: <FileText className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            You have complete control over your data and how the extension operates:
          </p>

          <div className="space-y-3">
            {[
              {
                title: 'Manage Permissions',
                desc: 'You can enable/disable permissions at any time through your browser extension settings',
              },
              {
                title: 'Clear Local Storage',
                desc: 'Remove all saved prompts, templates, and settings through the extension options',
              },
              {
                title: 'Choose AI Providers',
                desc: 'Select which platforms you want to broadcast to. No defaults without your consent',
              },
              {
                title: 'Opt-In Sync',
                desc: 'Authentication and cross-device sync is completely optional. The extension works 100% offline',
              },
              {
                title: 'Disable Side Panel',
                desc: 'Close the side panel anytime or disable it entirely from settings',
              },
              {
                title: 'Uninstall Anytime',
                desc: 'Remove the extension from your browser, and all data is immediately deleted',
              },
            ].map((control, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 rounded-lg border border-gray-300/50 dark:border-gray-600/50 hover:border-blue-400/50 transition"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-700 dark:text-blue-400 text-sm font-semibold">
                    {idx + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {control.title}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{control.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'policy-updates',
      title: 'Policy Updates & Compliance',
      icon: <Shield className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">Updates to This Policy:</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              We may update this privacy policy from time to time. When we do, we will notify you through:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>A notice in the extension when you update to a new version</li>
              <li>Updates on our website and Chrome Web Store extension page</li>
              <li>Changes to the "Last Updated" date below</li>
            </ul>
          </div>

          <div className="space-y-3 mt-6">
            <h4 className="font-semibold text-gray-900 dark:text-white">Chrome Web Store Compliance:</h4>
            <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                This extension fully complies with:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>Chrome Web Store Developer Program Policies</li>
                <li>Google Privacy Policy requirements</li>
                <li>User data and privacy protection standards</li>
                <li>Transparency and disclosure requirements</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3 mt-6">
            <h4 className="font-semibold text-gray-900 dark:text-white">Contact & Support:</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Questions about this privacy policy or how we handle your data?
            </p>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <span className="text-lg flex-shrink-0">📧</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  Email Support
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Contact us at: prompttemple2030@gmail.com
                </p>
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
          <Shield className="w-4 h-4" />
          Chrome Web Store Compliant
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-4">
          Privacy Policy
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          <strong>Prompt Temple Broadcaster</strong> — Professional Extension for Broadcasting Prompts Across AI Platforms
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Quick Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-green-900 dark:text-green-100">
              No Data Collection
            </h3>
          </div>
          <p className="text-sm text-green-800 dark:text-green-200">
            We don't collect or sell any personal data
          </p>
        </div>

        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Local Storage Only
            </h3>
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            All data stays on your device. No cloud sync without your consent
          </p>
        </div>

        <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-purple-900 dark:text-purple-100">
              Your Control
            </h3>
          </div>
          <p className="text-sm text-purple-800 dark:text-purple-200">
            Full control over permissions, data, and features
          </p>
        </div>
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

      {/* User Consent Section */}
      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/30 dark:border-blue-600/50 rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              User Consent & Agreement
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              By using Prompt Temple Broadcaster, you acknowledge that you have read and understood this Privacy Policy. You agree to our data practices as described above.
            </p>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p>✓ You understand the extension's single purpose</p>
              <p>✓ You consent to the permissions being used</p>
              <p>✓ You accept local storage of your prompt templates and settings</p>
              <p>✓ You understand that authentication and sync are optional</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 border-t border-gray-300/50 dark:border-gray-600/50">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © 2024-2026 Prompt Temple. All rights reserved.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          This privacy policy complies with Chrome Web Store Developer Program Policies and Google Privacy requirements.
        </p>
      </div>
    </div>
  );
}
