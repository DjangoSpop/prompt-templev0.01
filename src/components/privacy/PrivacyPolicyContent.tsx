'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, Lock, Eye, FileText, Sparkles, Database, Globe, Clock, Users } from 'lucide-react';

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
              Single Purpose Confirmed
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
                    Used only when the user clicks &quot;Broadcast&quot; to access the currently active AI provider tab and insert the user&apos;s prompt into the page.
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
                    <strong>Local only:</strong> All data stored locally on user&apos;s device. No data synced to servers without explicit user authentication.
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
                    Enables the &quot;Copy&quot; button to copy generated prompts/templates/results to the clipboard when the user explicitly clicks copy.
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
                    <strong>Non-intrusive:</strong> Optional side panel that doesn&apos;t interrupt user workflow. Can be dismissed anytime.
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
      id: 'data-collection',
      title: 'Data We Collect',
      icon: <Eye className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-700 dark:text-blue-400 font-semibold mb-2">
              Full Transparency
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Prompt Temple Broadcaster collects certain data to provide its core functionality. Below is a complete disclosure of what we collect and why.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">Data Categories:</h4>
            <div className="grid gap-4">
              {[
                {
                  title: 'Account Information',
                  desc: 'Email address and display name obtained from Google or GitHub OAuth.',
                  purpose: 'Authentication and cross-device sync. Only collected if you choose to sign in.',
                  color: 'amber',
                },
                {
                  title: 'User-Created Content',
                  desc: 'Prompts you write, templates you save, and broadcast configurations you set up.',
                  purpose: 'Core functionality — storing and broadcasting your prompts across AI platforms.',
                  color: 'amber',
                },
                {
                  title: 'Browsing Data (Limited)',
                  desc: 'DOM content from AI provider pages only (e.g., ChatGPT, Claude, Gemini) to read AI-generated responses.',
                  purpose: 'Displaying AI responses side-by-side in the results view. This data is never stored on our servers.',
                  color: 'amber',
                },
                {
                  title: 'Analytics Data',
                  desc: 'Page URL, user agent string, and anonymized usage events (e.g., feature usage counts).',
                  purpose: 'Improving the extension, debugging issues, and understanding feature adoption. Retained for 12 months.',
                  color: 'amber',
                },
                {
                  title: 'Search Queries',
                  desc: 'Queries you submit through the extension\'s built-in search features (powered by DuckDuckGo and Bing).',
                  purpose: 'Returning search results to you within the extension. Queries are forwarded to the search provider.',
                  color: 'amber',
                },
                {
                  title: 'Billing Information',
                  desc: 'Payment details for subscriptions are processed entirely by Stripe. Prompt Temple never stores your card number.',
                  purpose: 'Processing subscription payments. Stripe handles all PCI compliance.',
                  color: 'amber',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="border border-amber-300/50 dark:border-amber-600/50 rounded-lg p-4 bg-amber-50/30 dark:bg-amber-900/10"
                >
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {item.title}
                  </h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {item.desc}
                  </p>
                  <div className="bg-amber-50/50 dark:bg-amber-950/20 border-l-2 border-amber-400 px-3 py-2 rounded text-xs text-gray-600 dark:text-gray-400">
                    <strong>Why:</strong> {item.purpose}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'data-storage',
      title: 'How Data is Stored',
      icon: <Database className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">Storage Locations:</h4>
            <div className="grid gap-4">
              <div className="border border-gray-300/50 dark:border-gray-600/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Lock className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Local Storage (chrome.storage.local)
                    </h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Prompt templates, user preferences, selected AI providers, broadcast history, and saved prompts are stored locally on your device.
                    </p>
                    <div className="bg-green-50/50 dark:bg-green-950/20 border-l-2 border-green-400 px-3 py-2 rounded text-xs text-gray-600 dark:text-gray-400">
                      <strong>Retention:</strong> Data persists until you uninstall the extension or manually clear it through extension settings.
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-300/50 dark:border-gray-600/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                      In-Memory (Session)
                    </h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Temporary data such as AI response text read from provider pages and current session state is held in memory only.
                    </p>
                    <div className="bg-blue-50/50 dark:bg-blue-950/20 border-l-2 border-blue-400 px-3 py-2 rounded text-xs text-gray-600 dark:text-gray-400">
                      <strong>Retention:</strong> Cleared automatically when the extension context resets or the browser is closed.
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-300/50 dark:border-gray-600/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Server-Side (api.prompt-temple.com)
                    </h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      For authenticated users only: synced prompts, account data, and subscription status are stored on our servers.
                    </p>
                    <div className="bg-purple-50/50 dark:bg-purple-950/20 border-l-2 border-purple-400 px-3 py-2 rounded text-xs text-gray-600 dark:text-gray-400">
                      <strong>Retention:</strong> Data persists until you delete your account. You can request full deletion at any time.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'data-sharing',
      title: 'Data Sharing & Third Parties',
      icon: <Users className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2">
            <p className="text-blue-700 dark:text-blue-400 font-semibold">
              We Certify:
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <span className="text-green-600 dark:text-green-400 font-bold">1.</span>
                <p className="text-gray-700 dark:text-gray-300">
                  We do <strong>not sell</strong> user data to third parties, advertisers, or data brokers
                </p>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-green-600 dark:text-green-400 font-bold">2.</span>
                <p className="text-gray-700 dark:text-gray-300">
                  We do <strong>not use</strong> or transfer user data for purposes unrelated to the extension&apos;s stated functionality
                </p>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-green-600 dark:text-green-400 font-bold">3.</span>
                <p className="text-gray-700 dark:text-gray-300">
                  We do <strong>not use</strong> or transfer user data to determine creditworthiness or for lending purposes
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">Third Parties That Receive Data:</h4>
            <div className="grid gap-4">
              <div className="border border-gray-300/50 dark:border-gray-600/50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Prompt Temple Servers
                </h5>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">api.prompt-temple.com</code> — Receives synced prompts, account information, and subscription data for authenticated users only.
                </p>
              </div>

              <div className="border border-gray-300/50 dark:border-gray-600/50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                  AI Providers (11 platforms)
                </h5>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Your prompts are injected into the following AI provider websites as if you typed them manually. DOM content is read from these pages to display responses in the results view:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    'ChatGPT (OpenAI)',
                    'Claude (Anthropic)',
                    'Gemini (Google)',
                    'Perplexity',
                    'DeepSeek',
                    'Grok (xAI)',
                    'Meta AI',
                    'Mistral (Le Chat)',
                    'HuggingChat',
                    'Copilot (Microsoft)',
                    'You.com',
                  ].map((provider) => (
                    <span
                      key={provider}
                      className="inline-block px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                    >
                      {provider}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border border-gray-300/50 dark:border-gray-600/50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Stripe
                </h5>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Payment processing for subscriptions. Prompt Temple never sees or stores your full card number. Stripe handles all PCI compliance.
                </p>
              </div>

              <div className="border border-gray-300/50 dark:border-gray-600/50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Google &amp; GitHub
                </h5>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  OAuth authentication providers. Only your email address and display name are received when you choose to sign in. No data is sent to these providers beyond the standard OAuth flow.
                </p>
              </div>

              <div className="border border-gray-300/50 dark:border-gray-600/50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                  DuckDuckGo &amp; Bing
                </h5>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Search queries you submit through the extension&apos;s built-in search features are forwarded to these search providers to return results.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'data-retention',
      title: 'Data Retention',
      icon: <Clock className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">How Long We Keep Your Data:</h4>
            <div className="grid gap-4">
              {[
                {
                  title: 'Local Data',
                  retention: 'Until extension uninstall or manual clear',
                  desc: 'Prompt templates, preferences, provider selections, and broadcast history stored in chrome.storage.local.',
                  badgeClass: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                },
                {
                  title: 'Server-Synced Data',
                  retention: 'Until account deletion',
                  desc: 'Synced prompts, account information, and subscription data stored at api.prompt-temple.com. Deleted within 30 days of account deletion request.',
                  badgeClass: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
                },
                {
                  title: 'Analytics Data',
                  retention: '12 months',
                  desc: 'Page URLs, user agent strings, and anonymized usage events are automatically purged after 12 months.',
                  badgeClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
                },
                {
                  title: 'Billing Records',
                  retention: 'As required by law',
                  desc: 'Transaction records may be retained by Stripe as required by financial regulations (typically up to 7 years).',
                  badgeClass: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-300/50 dark:border-gray-600/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        {item.title}
                      </h5>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.badgeClass}`}>
                        {item.retention}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'user-rights',
      title: 'Your Rights & Controls',
      icon: <FileText className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            You have the following rights regarding your data:
          </p>

          <div className="space-y-3">
            {[
              {
                title: 'Access Your Data',
                desc: 'View all data stored about you through your account settings or by contacting us.',
              },
              {
                title: 'Export Your Data',
                desc: 'Download your prompts, templates, and saved configurations at any time.',
              },
              {
                title: 'Delete Your Data',
                desc: 'Request full account deletion. All server-side data will be removed within 30 days of your request.',
              },
              {
                title: 'Clear Local Data',
                desc: 'Remove all locally stored data through the extension settings page, or by uninstalling the extension.',
              },
              {
                title: 'Manage Permissions',
                desc: 'Enable or disable individual browser permissions at any time through your browser\'s extension settings.',
              },
              {
                title: 'Opt Out of Sync',
                desc: 'Use the extension entirely offline without authentication. No data will be sent to our servers.',
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
      title: 'Policy Updates & Contact',
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
              <li>Changes to the &quot;Last Updated&quot; date at the top of this page</li>
            </ul>
          </div>

          <div className="space-y-3 mt-6">
            <h4 className="font-semibold text-gray-900 dark:text-white">Chrome Web Store Compliance:</h4>
            <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                This extension and privacy policy comply with:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>Chrome Web Store Developer Program Policies</li>
                <li>Google User Data Policy (including Limited Use requirements)</li>
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
          <strong>Last Updated:</strong> March 17, 2026
        </p>
      </div>

      {/* Quick Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Transparent Data Practices
            </h3>
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            We collect only what&apos;s needed for core features. Full disclosure below.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-purple-900 dark:text-purple-100">
              You Control Your Data
            </h3>
          </div>
          <p className="text-sm text-purple-800 dark:text-purple-200">
            Access, export, or delete your data at any time. Sync is optional.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-green-900 dark:text-green-100">
              No Data Sales
            </h3>
          </div>
          <p className="text-sm text-green-800 dark:text-green-200">
            We never sell your personal data to advertisers or third parties.
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
              type="button"
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
              <p>✓ You understand what data is collected and why</p>
              <p>✓ You consent to the permissions described above</p>
              <p>✓ You understand that server sync requires authentication</p>
              <p>✓ You know how to access, export, or delete your data</p>
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
          This privacy policy complies with Chrome Web Store Developer Program Policies and Google User Data Policy requirements.
        </p>
      </div>
    </div>
  );
}
