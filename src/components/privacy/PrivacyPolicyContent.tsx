'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Shield,
  Lock,
  Eye,
  FileText,
  Sparkles,
  Database,
  Globe,
  Clock,
  Users,
  CheckCircle,
  Mail,
  Baby,
  Cookie,
  RefreshCw,
  Key,
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export function PrivacyPolicyContent() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['consent']);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const expandAll = () => {
    setExpandedSections(sections.map((s) => s.id));
  };

  const collapseAll = () => {
    setExpandedSections([]);
  };

  const sections: Section[] = [
    // ═══ SECTION 1: CONSENT ═══
    {
      id: 'consent',
      title: '1. User Consent and Prominent Disclosure',
      icon: <CheckCircle className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            On first launch the extension displays a full-screen consent banner <strong>before any personal or sensitive user data
            is collected or transmitted</strong>. The banner summarises every data category listed in Section 2 and offers two choices:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>
              <strong>Accept &amp; Continue</strong> — the user consents to the data practices in this policy. A consent timestamp
              is saved locally (<code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">chrome.storage.local</code> key <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">privacy_consent</code>).
            </li>
            <li>
              <strong>Decline</strong> — analytics and error reporting are automatically disabled. The consent timestamp is still
              recorded so the banner is not shown again, but usage diagnostics described in Section 2.5 are never collected or sent.
            </li>
          </ul>
          <div className="bg-blue-50/50 dark:bg-blue-950/20 border-l-2 border-blue-400 px-3 py-2 rounded text-sm text-gray-700 dark:text-gray-300">
            The consent banner also contains a direct link to this privacy policy. No network requests carrying user data
            (other than the extension&apos;s own static assets) are made until the user has interacted with the consent banner.
          </div>
        </div>
      ),
    },
    // ═══ SECTION 2: COLLECTION ═══
    {
      id: 'collection',
      title: '2. Data We Collect (Collection)',
      icon: <Eye className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Below is a complete list of every category of personal and sensitive user data the extension collects. The extension
              does <strong>not</strong> collect any data category not listed here.
            </p>
          </div>

          {/* 2.1 PII */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">2.1 Personally Identifiable Information (PII)</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li><strong>Username</strong> — chosen by the user during registration.</li>
              <li><strong>Email address</strong> — provided during registration, or returned by Google/GitHub during OAuth sign-in.</li>
              <li><strong>Password</strong> — transmitted over HTTPS only; stored exclusively as a cryptographic hash on the server. The extension never stores plaintext passwords.</li>
            </ul>
          </div>

          {/* 2.2 Auth */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">2.2 Authentication Information</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li><strong>JWT access token and refresh token</strong> — stored in <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">chrome.storage.local</code> to maintain signed-in sessions. Tokens are short-lived and refreshed automatically.</li>
              <li><strong>OAuth authorisation codes</strong> — exchanged during Google or GitHub sign-in via Chrome&apos;s <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">identity</code> API. The extension receives only the user&apos;s display name and email; it never receives or stores the user&apos;s Google or GitHub password.</li>
            </ul>
          </div>

          {/* 2.3 User-Generated Content */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">2.3 User-Generated Content</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>Prompts, titles, descriptions, tags, categories, and template variable values that the user creates, saves, or broadcasts.</li>
              <li>Search queries entered in the prompt library or template discovery features.</li>
            </ul>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              This data is stored on our servers and associated with the user&apos;s account to provide the prompt library, history, and template features.
            </p>
          </div>

          {/* 2.4 Browsing */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">2.4 Web Browsing Activity (limited scope)</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li><strong>Tab URLs</strong> — the extension reads the URLs of open tabs <strong>only</strong> to detect whether a supported AI-provider page is open. URLs are matched locally; they are <strong>not</strong> transmitted to our servers.</li>
              <li><strong>Website content</strong> — when the user initiates a broadcast, the extension interacts with the DOM of AI-provider pages to insert prompt text into the provider&apos;s input field and read the AI-generated response text. This interaction occurs <strong>only</strong> on the specific AI-provider domains the user has granted permission to (see Section 2.8) and <strong>only</strong> as a direct result of the user clicking the broadcast button.</li>
            </ul>
            <div className="bg-green-50/50 dark:bg-green-950/20 border border-green-500/30 rounded-lg p-3 mt-2">
              <p className="text-sm text-green-700 dark:text-green-400 font-semibold">
                The extension does not monitor, record, or transmit general browsing history. It does not access any website outside the specific domains listed in Section 2.8.
              </p>
            </div>
          </div>

          {/* 2.5 Analytics */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">2.5 Usage Diagnostics and Analytics (opt-out available)</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              If the user has accepted the consent banner and has <strong>not</strong> disabled analytics, the extension collects:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>Session start/end timestamps.</li>
              <li>Feature engagement events (e.g., &quot;broadcast started&quot;, &quot;library save&quot;, &quot;template used&quot;).</li>
              <li>Broadcast counts and operation duration.</li>
              <li>Onboarding/tour completion status.</li>
              <li>Error events and error messages (if error reporting is enabled).</li>
              <li>The page URL within the extension and browser user-agent string at the time of each event.</li>
            </ul>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Events are queued locally (up to 500 in <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">chrome.storage.local</code>), batched in groups of 10, and sent to <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">api.prompt-temple.com/analytics/batch</code> approximately every 30 seconds. No third-party analytics SDKs are used (no Google Analytics, no Facebook Pixel, no advertising trackers of any kind).
            </p>
            <div className="bg-amber-50/50 dark:bg-amber-950/20 border-l-2 border-amber-400 px-3 py-2 rounded text-sm text-gray-700 dark:text-gray-300">
              <strong>Opt-out:</strong> The user can disable analytics and/or error reporting at any time from inside the extension
              by clicking the gear icon in the popup footer to open Settings, then toggling off &quot;Analytics &amp; Usage Tracking&quot;
              and/or &quot;Error Reporting.&quot; When disabled, no events in this category are collected or transmitted.
            </div>
          </div>

          {/* 2.6 Billing */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">2.6 Subscription and Billing Metadata</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>Plan level (Free, Pro, or Power), credit balance, and per-feature usage counters.</li>
            </ul>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              All payment processing is handled by <strong>Stripe</strong>. The extension and our servers <strong>never</strong> collect, receive, or store credit card numbers, bank account details, or any payment instrument information.
            </p>
          </div>

          {/* 2.7 Search */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">2.7 Search Data (Research Tool only)</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>Search queries the user submits via the Research Tool are sent to DuckDuckGo and/or Bing. Results are processed locally and <strong>not</strong> stored on our servers.</li>
            </ul>
          </div>

          {/* 2.8 Domains */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">2.8 Domains the Extension Can Access</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              At install time, the <strong>only</strong> host permission granted is <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">https://api.prompt-temple.com</code> (our own backend). All AI-provider and search-engine domains are declared as <strong>optional host permissions</strong> — Chrome prompts the user for access before the extension can interact with each domain:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                'ChatGPT (chatgpt.com)',
                'Claude (claude.ai)',
                'Gemini (gemini.google.com)',
                'DeepSeek (chat.deepseek.com)',
                'Qwen (chat.qwen.ai)',
                'Grok (grok.com)',
                'Kimi (kimi.com)',
                'Mistral (chat.mistral.ai)',
                'Ernie/Yiyan (ernie.baidu.com)',
                'Manus (manus.ai)',
                'Perplexity (perplexity.ai)',
                'Z.ai (chat.z.ai)',
                'DuckDuckGo (duckduckgo.com)',
                'Bing (bing.com)',
              ].map((domain) => (
                <span
                  key={domain}
                  className="inline-block px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                >
                  {domain}
                </span>
              ))}
            </div>
          </div>

          {/* 2.9 Not Collected */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">2.9 Data We Do NOT Collect</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">The extension does <strong>not</strong> collect:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>General web browsing history or activity on websites not listed above.</li>
              <li>Keystrokes, form data, or autofill data from any website.</li>
              <li>Passwords or credentials from any third-party website.</li>
              <li>Financial or payment instrument information (handled entirely by Stripe).</li>
              <li>Health, biometric, or genetic data.</li>
              <li>Geolocation, contacts, calendar, camera, microphone, or device sensor data.</li>
              <li>Contents of any communication (email, SMS, chat) outside the explicit AI-provider broadcast interaction.</li>
            </ul>
          </div>
        </div>
      ),
    },
    // ═══ SECTION 3: HANDLING ═══
    {
      id: 'handling',
      title: '3. How We Handle Data (Handling)',
      icon: <Sparkles className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Each data category in Section 2 is handled <strong>only</strong> for the purposes listed below:
          </p>
          <div className="overflow-x-auto rounded-lg border border-gray-300/50 dark:border-gray-600/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-300/50 dark:border-gray-600/50">Data Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-300/50 dark:border-gray-600/50">How It Is Handled / Purpose</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-300">
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <td className="px-4 py-3 font-medium">PII and authentication (2.1, 2.2)</td>
                  <td className="px-4 py-3">Authenticate the user, maintain signed-in sessions, and personalise the extension experience.</td>
                </tr>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <td className="px-4 py-3 font-medium">User-generated content (2.3)</td>
                  <td className="px-4 py-3">Store and sync the user&apos;s prompt library; deliver broadcast, template, and discovery features.</td>
                </tr>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <td className="px-4 py-3 font-medium">Web browsing activity (2.4)</td>
                  <td className="px-4 py-3">Detect open AI-provider tabs, inject prompt text on user command, and read AI-generated response text. Tab URLs are never sent to our servers.</td>
                </tr>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <td className="px-4 py-3 font-medium">Usage diagnostics (2.5)</td>
                  <td className="px-4 py-3">Measure reliability, diagnose errors, and prioritise product improvements. Can be disabled by the user.</td>
                </tr>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <td className="px-4 py-3 font-medium">Subscription metadata (2.6)</td>
                  <td className="px-4 py-3">Enforce plan limits and entitlements.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Search data (2.7)</td>
                  <td className="px-4 py-3">Execute web searches on the user&apos;s behalf and return results locally.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-green-50/50 dark:bg-green-950/20 border border-green-500/30 rounded-lg p-3">
            <p className="text-sm text-green-700 dark:text-green-400 font-semibold">
              We do not use any collected data for advertising, user profiling, or sale to third parties.
            </p>
          </div>
        </div>
      ),
    },
    // ═══ SECTION 4: STORAGE ═══
    {
      id: 'storage',
      title: '4. Where and How Data Is Stored (Storage)',
      icon: <Database className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-lg border border-gray-300/50 dark:border-gray-600/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-300/50 dark:border-gray-600/50">Location</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-300/50 dark:border-gray-600/50">Data Stored</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-300/50 dark:border-gray-600/50">Notes</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-300">
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <td className="px-4 py-3 font-medium">Chrome local storage (<code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">chrome.storage.local</code>)</td>
                  <td className="px-4 py-3">JWT tokens, cached profile, consent timestamp, privacy preferences (analytics on/off, error reporting on/off), analytics event queue, prompt history, API response cache.</td>
                  <td className="px-4 py-3">Persists until the user clears extension data, uses the &quot;Clear Local Data&quot; button in Settings, or uninstalls the extension. Isolated to the extension — not accessible by websites.</td>
                </tr>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <td className="px-4 py-3 font-medium">Runtime memory (service worker / popup / side panel)</td>
                  <td className="px-4 py-3">Live broadcast session state, intermediate provider responses, temporary UI state.</td>
                  <td className="px-4 py-3">Cleared automatically when the service worker or tab is closed. Never written to disk.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Prompt Temple servers (<code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">api.prompt-temple.com</code>)</td>
                  <td className="px-4 py-3">Account records, saved prompts, templates, iterations, analytics payloads, subscription records.</td>
                  <td className="px-4 py-3">All transfers use HTTPS/TLS. Authenticated via JWT Bearer tokens. Passwords stored as cryptographic hashes only.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    // ═══ SECTION 5: SHARING ═══
    {
      id: 'sharing',
      title: '5. Data Sharing (Sharing and Disclosure)',
      icon: <Users className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            User data is shared <strong>only</strong> with the recipients below, <strong>only</strong> for the stated purposes, and <strong>only</strong> the minimum data necessary:
          </p>
          <div className="overflow-x-auto rounded-lg border border-gray-300/50 dark:border-gray-600/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-300/50 dark:border-gray-600/50">Recipient</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-300/50 dark:border-gray-600/50">Data Shared</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-300/50 dark:border-gray-600/50">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-300">
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <td className="px-4 py-3 font-medium">Prompt Temple API (api.prompt-temple.com)</td>
                  <td className="px-4 py-3">Account data, saved prompts, analytics events, subscription metadata.</td>
                  <td className="px-4 py-3">Core service operation, account management, analytics processing.</td>
                </tr>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <td className="px-4 py-3 font-medium">AI provider websites selected by user</td>
                  <td className="px-4 py-3">Prompt text only (typed into the provider&apos;s input field via DOM interaction).</td>
                  <td className="px-4 py-3">Broadcast feature — the extension simulates typing the user&apos;s prompt on each provider&apos;s page.</td>
                </tr>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <td className="px-4 py-3 font-medium">Search engines selected by user (DuckDuckGo, Bing)</td>
                  <td className="px-4 py-3">Search queries.</td>
                  <td className="px-4 py-3">Research Tool feature.</td>
                </tr>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <td className="px-4 py-3 font-medium">Google / GitHub (OAuth)</td>
                  <td className="px-4 py-3">OAuth authorisation codes; we receive display name and email in return.</td>
                  <td className="px-4 py-3">Social sign-in only.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Stripe (via our backend)</td>
                  <td className="px-4 py-3">Subscription and payment details routed through our server.</td>
                  <td className="px-4 py-3">Payment processing. The extension never communicates directly with Stripe.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-green-50/50 dark:bg-green-950/20 border border-green-500/30 rounded-lg p-3">
            <p className="text-sm text-green-700 dark:text-green-400 font-semibold">
              We do not sell, rent, trade, or disclose personal data to data brokers, advertisers, or any party not listed above.
            </p>
          </div>
        </div>
      ),
    },
    // ═══ SECTION 6: RETENTION ═══
    {
      id: 'retention',
      title: '6. Data Retention and Deletion',
      icon: <Clock className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-lg border border-gray-300/50 dark:border-gray-600/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-300/50 dark:border-gray-600/50">Data Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-300/50 dark:border-gray-600/50">Retention Period</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-300/50 dark:border-gray-600/50">How to Delete</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-300">
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <td className="px-4 py-3 font-medium">Local extension data</td>
                  <td className="px-4 py-3">Until the user clears it or uninstalls.</td>
                  <td className="px-4 py-3">Click &quot;Clear Local Data&quot; in the extension&apos;s Settings panel, or remove the extension from <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">chrome://extensions</code>.</td>
                </tr>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <td className="px-4 py-3 font-medium">Server-side account and prompt data</td>
                  <td className="px-4 py-3">Retained while the account is active.</td>
                  <td className="px-4 py-3">Email <a href="mailto:privacy@prompt-temple.com" className="text-blue-600 dark:text-blue-400 underline">privacy@prompt-temple.com</a> to request account deletion. All data is permanently removed within 30 days.</td>
                </tr>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <td className="px-4 py-3 font-medium">Analytics data</td>
                  <td className="px-4 py-3">Up to 12 months, then aggregated or deleted.</td>
                  <td className="px-4 py-3">Disable analytics in Settings to stop future collection. Email us to request deletion of existing data.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Billing records</td>
                  <td className="px-4 py-3">As required by financial/tax regulations.</td>
                  <td className="px-4 py-3">Email us. Subject to legal retention requirements.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    // ═══ SECTION 7: USER CONTROLS ═══
    {
      id: 'user-controls',
      title: '7. User Controls and Rights',
      icon: <FileText className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            The extension provides the following controls, all accessible from within the extension itself:
          </p>
          <div className="space-y-3">
            {[
              { title: 'Opt out of analytics', desc: 'Open the popup, click the gear icon (Settings), toggle off "Analytics & Usage Tracking." Takes effect immediately.' },
              { title: 'Opt out of error reporting', desc: 'In the same Settings panel, toggle off "Error Reporting." Takes effect immediately.' },
              { title: 'Clear all local data', desc: 'In the same Settings panel, click "Clear Local Data" to remove all analytics queues, cached data, and user properties from chrome.storage.local.' },
              { title: 'Revoke site access', desc: 'Because AI-provider domains use optional permissions, you can revoke access at any time from chrome://extensions > Prompt Temple Broadcaster > Details > Site access.' },
              { title: 'Access your data', desc: 'View saved prompts, history, and profile in the extension\'s Library and Profile sections.' },
              { title: 'Request data export', desc: 'Email privacy@prompt-temple.com.' },
              { title: 'Request data deletion', desc: 'Email privacy@prompt-temple.com. Completed within 30 days.' },
              { title: 'Uninstall', desc: 'Removing the extension from chrome://extensions deletes all local data immediately.' },
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
    // ═══ SECTION 8: SECURITY ═══
    {
      id: 'security',
      title: '8. Security Measures',
      icon: <Shield className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <ul className="space-y-3">
            {[
              'All network communication uses HTTPS/TLS encryption. No data is transmitted in plaintext.',
              'Authentication uses short-lived JWT tokens refreshed automatically; stored in chrome.storage.local.',
              'Passwords are cryptographically hashed server-side; never stored or logged in plaintext.',
              'User input displayed in the extension UI is escaped with an escapeHtml() function to prevent XSS.',
              'The extension does not use eval(), new Function(), or load any remote JavaScript at runtime.',
              'AI-provider access requires optional permissions granted by the user at runtime via Chrome\'s permission prompt.',
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                <Lock className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    // ═══ SECTION 9: PERMISSIONS ═══
    {
      id: 'permissions',
      title: '9. Chrome Permissions and Justification',
      icon: <Key className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-lg border border-gray-300/50 dark:border-gray-600/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-300/50 dark:border-gray-600/50">Permission</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-300/50 dark:border-gray-600/50">Why It Is Needed</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-300">
                {[
                  { perm: 'activeTab', why: 'Detect the currently active tab to determine which AI provider the user is viewing.' },
                  { perm: 'tabs', why: 'Query, create, and manage AI-provider tabs for the "Open All Tabs" and broadcast features.' },
                  { perm: 'storage', why: 'Store authentication tokens, privacy preferences, analytics queue, prompt history, and API cache locally.' },
                  { perm: 'scripting', why: 'Programmatically inject content scripts into AI-provider pages (only those the user has granted access to) to insert prompts and read responses.' },
                  { perm: 'clipboardWrite', why: 'Copy broadcast results or prompt text to the clipboard when the user clicks a Copy button.' },
                  { perm: 'sidePanel', why: 'Display the prompt library and research tool in Chrome\'s side panel.' },
                  { perm: 'alarms', why: 'Schedule periodic background tasks: flushing the analytics queue and refreshing authentication tokens.' },
                  { perm: 'identity', why: 'Facilitate Google and GitHub OAuth sign-in flows via Chrome\'s built-in identity API.' },
                ].map((row, idx) => (
                  <tr key={idx} className={idx < 7 ? 'border-b border-gray-200/50 dark:border-gray-700/50' : ''}>
                    <td className="px-4 py-3"><code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-semibold">{row.perm}</code></td>
                    <td className="px-4 py-3">{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-blue-50/50 dark:bg-blue-950/20 border-l-2 border-blue-400 px-3 py-2 rounded text-sm text-gray-700 dark:text-gray-300">
            <strong>Host permissions:</strong> The only host permission granted at install is <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">https://api.prompt-temple.com/*</code> (our own API). All AI-provider and search-engine domains are <strong>optional host permissions</strong> — Chrome displays a permission prompt before the extension can interact with each one.
          </div>
        </div>
      ),
    },
    // ═══ SECTION 10: CHILDREN ═══
    {
      id: 'children',
      title: '10. Children\'s Privacy',
      icon: <Baby className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            This extension is not directed to children under the age of 13. We do not knowingly collect personal data from
            children under 13. If you believe a child has provided us with personal information, please contact us and we
            will delete it promptly.
          </p>
        </div>
      ),
    },
    // ═══ SECTION 11: COOKIES ═══
    {
      id: 'cookies',
      title: '11. Cookies and Tracking Technologies',
      icon: <Cookie className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            The extension does <strong>not</strong> use browser cookies, localStorage, sessionStorage, or IndexedDB.
            All local data is stored via the Chrome <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">chrome.storage.local</code> API, which is sandboxed to the
            extension. No third-party tracking scripts, advertising pixels, fingerprinting libraries, or analytics SDKs
            from external providers are embedded in the extension.
          </p>
        </div>
      ),
    },
    // ═══ SECTION 12: CHANGES ═══
    {
      id: 'changes',
      title: '12. Changes to This Policy',
      icon: <RefreshCw className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            We may update this privacy policy. When we do, we will update the &quot;Last Updated&quot; date at the top. If we make
            material changes to data collection or sharing practices, we will re-display the consent banner within the
            extension so the user can review and re-consent.
          </p>
        </div>
      ),
    },
    // ═══ SECTION 13: CONTACT ═══
    {
      id: 'contact',
      title: '13. Contact',
      icon: <Mail className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            For privacy questions, data access requests, or deletion requests:
          </p>
          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Email</p>
                <a href="mailto:privacy@prompt-temple.com" className="text-sm text-blue-600 dark:text-blue-400 underline">
                  privacy@prompt-temple.com
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Website</p>
                <a href="https://prompt-temple.com" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 underline">
                  https://prompt-temple.com
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Developer</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Prompt Temple</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            We aim to respond to all privacy-related requests within 14 business days.
          </p>
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
          <strong>Product:</strong> Prompt Temple Broadcaster (Chrome Extension, ID: olojhcohjhnhjnemhpgjiammpkeincon)
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Developer:</strong> Prompt Temple &nbsp;|&nbsp; <strong>Last Updated:</strong> March 23, 2026
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 max-w-3xl">
          This privacy policy describes, in the sections required by the Chrome Web Store Developer Program Policies, exactly what
          personal and sensitive user data is collected by Prompt Temple Broadcaster, how that data is handled, where and how it is
          stored, and with whom it is shared. It applies to all data processed by the extension and our backend API
          at <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">api.prompt-temple.com</code>.
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
            We collect only what&apos;s needed for core features. Full disclosure in 13 sections below.
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
            Consent-first. Opt out of analytics. Access, export, or delete your data at any time.
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
            We never sell, rent, or trade your personal data to advertisers or third parties.
          </p>
        </div>
      </div>

      {/* Expand / Collapse all */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={expandAll}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          Expand all sections
        </button>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <button
          type="button"
          onClick={collapseAll}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          Collapse all
        </button>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-3">
        {sections.map((section) => (
          <div
            key={section.id}
            className="border border-gray-300/50 dark:border-gray-600/50 rounded-xl hover:border-blue-400/50 transition overflow-hidden bg-white dark:bg-gray-900/50 shadow-sm hover:shadow-md"
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
              User Consent &amp; Agreement
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              By using Prompt Temple Broadcaster, you acknowledge that you have read and understood this Privacy Policy. You agree to our data practices as described above.
            </p>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> You understand what data is collected and why</p>
              <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> You consent to the permissions described above</p>
              <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> You understand that server sync requires authentication</p>
              <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> You know how to access, export, or delete your data</p>
              <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> You can opt out of analytics and error reporting at any time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 border-t border-gray-300/50 dark:border-gray-600/50">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          &copy; 2024-2026 Prompt Temple. All rights reserved.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          This privacy policy complies with Chrome Web Store Developer Program Policies and Google User Data Policy requirements.
        </p>
      </div>
    </div>
  );
}
