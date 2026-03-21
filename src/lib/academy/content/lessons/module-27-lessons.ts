/**
 * Module 27: Enterprise Workflows & Competition
 * Duration: 25 minutes | 3 Lessons
 */

import type { Lesson } from '../../types';

export const module27Lessons: Lesson[] = [
  // ==========================================================================
  // LESSON 27.1: Production Workflows
  // ==========================================================================
  {
    id: 'lesson-27-1',
    moduleId: 'module-27',
    title: 'Production Workflows',
    estimatedTime: 9,
    order: 1,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Theory is useful, but Cowork\'s real power becomes clear when you see it operating in production workflows. In this lesson, we\'ll walk through four real-world use cases that companies deployed within weeks of the January 2026 launch. Each one replaces what would traditionally require multiple software tools, custom integrations, and dedicated operations staff.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Use Case 1: Contract Review Pipeline',
      },
      {
        type: 'text',
        value: 'A mid-size law firm configured Cowork to handle incoming contract reviews. Clients drop contracts into a shared Google Drive folder. Cowork automatically picks them up, runs them through its contract-analyzer plugin, flags risk clauses, generates a redline summary, and routes the review to the appropriate attorney based on contract type and value.',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "workflow": "contract-review-pipeline",\n  "trigger": {\n    "connector": "google-drive",\n    "event": "new_file",\n    "folder": "/Client Contracts/Incoming/",\n    "file_types": [".pdf", ".docx"]\n  },\n  "steps": [\n    { "plugin": "contract-analyzer", "action": "analyze_contract" },\n    { "plugin": "contract-analyzer", "action": "extract_terms" },\n    {\n      "condition": "risk_score > 70",\n      "action": "route_to",\n      "connector": "slack",\n      "channel": "#legal-urgent",\n      "message": "High-risk contract from {{client}}: {{summary}}"\n    },\n    {\n      "action": "create_review_doc",\n      "connector": "google-drive",\n      "destination": "/Client Contracts/Under Review/{{client}}/"\n    }\n  ],\n  "sla": { "max_processing_time": "5m", "escalate_to": "#legal-ops" }\n}',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Before Cowork vs. After',
        text: 'Before: Contracts sat in email attachments for days. Paralegals manually triaged them. Attorneys received no risk scoring. Average time to first review: 3-5 business days. After: Contracts are analyzed within 5 minutes of upload. Risk-scored. Automatically routed. Average time to first review: same day.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Use Case 2: Sales Pipeline Management',
      },
      {
        type: 'text',
        value: 'A B2B SaaS company connected Cowork to Salesforce and Slack to create an automated pipeline management system. Cowork monitors deal stages, identifies stalled opportunities, cross-references communication history, and generates weekly pipeline reports without any rep manually updating CRM records.',
      },
      {
        type: 'list',
        items: [
          'Daily deal hygiene — Cowork scans all open opportunities and flags any that haven\'t been updated in 7+ days',
          'Communication sync — Slack conversations about deals are automatically logged as Salesforce activities',
          'Forecast generation — Weekly pipeline forecast generated from CRM data plus communication sentiment analysis',
          'Next-action suggestions — For each stalled deal, Cowork suggests specific next actions based on similar deals that closed successfully',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Use Case 3: Customer Support Automation',
      },
      {
        type: 'text',
        value: 'A consumer electronics company uses Cowork to triage and draft responses for customer support tickets. Incoming support emails are classified by category and severity, matched against known solutions in the knowledge base, and drafted for agent review. Cowork handles approximately 60% of tier-1 tickets end-to-end, with agents reviewing and approving the drafted responses.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Use Case 4: Content Creation Pipeline',
      },
      {
        type: 'text',
        value: 'A marketing agency uses Cowork to manage their content production workflow. The content brief goes into the project folder. Cowork generates a first draft, runs it through SEO analysis, creates social media variants, and produces a distribution schedule — all deposited as organized files in the outputs folder.',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "workflow": "content-pipeline",\n  "input": "./inputs/briefs/{{brief_name}}.md",\n  "steps": [\n    { "action": "generate_draft", "output": "./outputs/drafts/{{slug}}-v1.md" },\n    { "plugin": "seo-analyzer", "action": "analyze", "target_keywords": "{{keywords}}" },\n    { "action": "generate_social_variants", "platforms": ["twitter", "linkedin", "instagram"] },\n    { "action": "create_distribution_schedule", "output": "./outputs/schedules/{{slug}}-schedule.csv" },\n    {\n      "connector": "slack",\n      "action": "post_message",\n      "channel": "#content-team",\n      "message": "Draft ready for review: {{slug}}. Risk areas: {{seo_issues}}"\n    }\n  ]\n}',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'The Common Pattern',
        text: 'Notice that every production workflow follows the same pattern: trigger (something happens) → process (Cowork reads, analyzes, generates) → route (results go to the right place and people). This trigger-process-route pattern is the fundamental building block of all Cowork automation.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 27.2: Microsoft's Response
  // ==========================================================================
  {
    id: 'lesson-27-2',
    moduleId: 'module-27',
    title: 'Microsoft\'s Response',
    estimatedTime: 8,
    order: 2,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Microsoft did not take the Cowork launch lightly. Within two months, in March 2026, Microsoft announced two landmark moves: Copilot Cowork — their own AI coworker product deeply integrated with Microsoft 365 — and a $30 billion deal with Anthropic to run Claude models on Azure. These moves revealed Microsoft\'s strategy: if you can\'t beat the AI, partner with the AI company while building your own competing product.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Copilot Cowork: The Microsoft Answer',
      },
      {
        type: 'text',
        value: 'Copilot Cowork is Microsoft\'s direct response to Claude Cowork. It extends the existing Microsoft 365 Copilot with persistent task execution, cross-application workflows, and an agent-like ability to work autonomously across Word, Excel, PowerPoint, Outlook, Teams, and SharePoint.',
      },
      {
        type: 'list',
        items: [
          'Deep M365 Integration — Copilot Cowork lives natively inside Word, Excel, Teams, and Outlook. No separate app or folder structure needed.',
          'Cloud-First Architecture — Unlike Cowork\'s folder-based model, Copilot Cowork runs entirely in the Microsoft cloud. Your "workspace" is your M365 tenant.',
          'Microsoft Graph Access — Copilot Cowork can access any data in the Microsoft Graph: emails, calendars, files, contacts, organizational hierarchy, and more.',
          'Teams as Command Center — Instead of a local folder, Teams channels serve as the primary interface for giving Copilot Cowork instructions and receiving results.',
          'Power Automate Integration — Complex workflows can leverage Power Automate for enterprise-grade orchestration with built-in compliance and auditing.',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'The $30 Billion Anthropic Azure Deal',
      },
      {
        type: 'text',
        value: 'Perhaps more surprising than Copilot Cowork itself was the $30 billion deal to bring Anthropic\'s Claude models to Azure. This deal means that enterprise customers can run Claude — the same AI that powers Cowork — on Microsoft\'s cloud infrastructure. It\'s a hedge: even if Copilot Cowork doesn\'t win, Microsoft profits from companies using Claude on Azure.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'The Strategic Logic',
        text: 'Microsoft is playing both sides: building a competitor to Cowork (Copilot Cowork) while also hosting Cowork\'s underlying AI on their cloud (Azure). This "frenemies" approach ensures Microsoft captures value regardless of which AI coworker product wins the market. It\'s similar to how Azure hosts competing databases — Microsoft profits either way.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Cloud-Based vs. Folder-Based: The Architectural Divide',
      },
      {
        type: 'text',
        value: 'The fundamental architectural difference between the two products reflects deeper philosophical differences about how AI coworkers should operate:',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "cowork": {\n    "architecture": "folder-based / local-first",\n    "data_location": "User\'s file system + connected services",\n    "advantages": [\n      "Full user control over data",\n      "Works offline for local tasks",\n      "Transparent — all artifacts visible as files",\n      "Vendor-agnostic connector model"\n    ],\n    "limitations": [\n      "Requires local setup",\n      "Collaboration requires shared drives",\n      "No native enterprise admin controls"\n    ]\n  },\n  "copilot_cowork": {\n    "architecture": "cloud-based / M365-native",\n    "data_location": "Microsoft 365 cloud tenant",\n    "advantages": [\n      "Zero setup for M365 customers",\n      "Enterprise admin controls built-in",\n      "Seamless multi-user collaboration",\n      "Compliance and audit trail by default"\n    ],\n    "limitations": [\n      "Locked into Microsoft ecosystem",\n      "Data lives in Microsoft cloud",\n      "Less transparent — actions happen in cloud",\n      "Requires M365 E3/E5 license"\n    ]\n  }\n}',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Lock-In Risk',
        text: 'Copilot Cowork\'s deep M365 integration is both its greatest strength and its biggest concern. Companies that go all-in on Copilot Cowork are deeply tying their AI workflows to the Microsoft ecosystem. If they ever want to switch, they\'d need to rebuild all their workflows. Cowork\'s folder-based model is more portable but requires more setup.',
      },
      {
        type: 'heading',
        level: 3,
        value: 'What the Deal Means for Developers',
      },
      {
        type: 'text',
        value: 'For developers and prompt engineers, the Azure deal means Claude\'s capabilities are now available through Azure\'s API alongside OpenAI\'s models. This gives enterprises a single cloud provider for multiple AI models, simplifies procurement, and enables A/B testing between Claude and GPT for different use cases without managing multiple cloud relationships.',
      },
      {
        type: 'text',
        value: 'The next lesson will help you navigate the competitive landscape and choose the right AI coworker for your team\'s specific needs.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 27.3: Choosing Your AI Coworker
  // ==========================================================================
  {
    id: 'lesson-27-3',
    moduleId: 'module-27',
    title: 'Choosing Your AI Coworker',
    estimatedTime: 8,
    order: 3,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'By March 2026, the AI coworker market has four serious contenders: Claude Cowork, Microsoft Copilot Cowork, Manus, and OpenClaw. Each takes a fundamentally different approach to the same problem: making AI do real work. Choosing the right one depends on your team\'s existing tools, security requirements, budget, and workflow complexity.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Four Contenders',
      },
      {
        type: 'text',
        value: 'Let\'s break down each product\'s core philosophy and sweet spot before diving into a detailed comparison.',
      },
      {
        type: 'list',
        items: [
          'Claude Cowork (Anthropic) — Folder-based, connector-driven, local-first. Best for teams that want transparency, vendor flexibility, and custom plugin workflows. Strongest in document analysis and multi-tool orchestration.',
          'Copilot Cowork (Microsoft) — Cloud-native, M365-integrated, enterprise-managed. Best for organizations already deep in the Microsoft ecosystem. Strongest in collaboration and enterprise compliance.',
          'Manus (Manus AI) — Autonomous agent framework focused on web-based research and data gathering tasks. Best for research teams and analysts. Strongest in autonomous multi-step web research.',
          'OpenClaw (OpenAI) — GPT-powered workspace assistant with deep integration into ChatGPT Enterprise. Best for teams already using ChatGPT at scale. Strongest in conversational workflows and code generation.',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Decision Framework',
      },
      {
        type: 'text',
        value: 'Use the following framework to evaluate which AI coworker fits your team. Score each dimension from 1-5 based on your team\'s priorities, then see which product aligns best.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'DECISION MATRIX\n\n                    Cowork    Copilot    Manus    OpenClaw\n                              Cowork\nSetup Ease           3/5       5/5       3/5       4/5\nEnterprise Admin     3/5       5/5       2/5       4/5\nVendor Flexibility   5/5       2/5       4/5       3/5\nOffline Capability   4/5       1/5       1/5       2/5\nDoc Analysis         5/5       4/5       3/5       4/5\nWeb Research         3/5       3/5       5/5       4/5\nCode Generation      4/5       3/5       2/5       5/5\nCustom Plugins       5/5       3/5       3/5       4/5\nCompliance/Audit     4/5       5/5       2/5       3/5\nPricing Model        Per-use   M365 add  Per-use   Per-seat\n                               on',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Scenario-Based Recommendations',
      },
      {
        type: 'list',
        items: [
          'You\'re an M365 shop with 500+ employees → Copilot Cowork. The zero-setup, built-in compliance, and Teams integration make it the obvious choice.',
          'You\'re a 20-person startup using Google Workspace → Claude Cowork. Folder-based flexibility, Google Drive connector, and custom plugins let you build exactly what you need.',
          'You\'re a research firm that needs autonomous web data gathering → Manus. Its autonomous agent capabilities for web research are unmatched.',
          'You\'re a development team that wants AI coding plus task automation → OpenClaw. Deep ChatGPT integration and strong code generation make it natural for dev workflows.',
          'You need maximum data sovereignty and transparency → Claude Cowork. Local-first architecture means your data stays on your machines.',
        ],
        ordered: false,
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'The Multi-Coworker Future',
        text: 'Many enterprises are discovering that the answer isn\'t choosing one AI coworker — it\'s using different ones for different departments. Marketing might use Cowork for content pipelines, IT uses Copilot Cowork for M365 management, and the research team uses Manus. The skill is in knowing which tool fits which workflow.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Future Roadmap',
      },
      {
        type: 'text',
        value: 'The AI coworker space is evolving rapidly. Here\'s what\'s on the horizon based on public roadmaps and industry signals:',
      },
      {
        type: 'list',
        items: [
          'Multi-agent collaboration — Cowork agents working together on complex projects, each specializing in a domain',
          'Voice-first interfaces — Giving your AI coworker instructions by speaking, not typing',
          'Proactive workflow suggestions — AI coworkers that observe your patterns and suggest automations you haven\'t thought of',
          'Cross-organization connectors — Cowork instances at different companies collaborating on shared projects (e.g., vendor-client contract negotiation)',
          'Regulatory frameworks — Government guidelines for AI coworker usage in regulated industries (finance, healthcare, legal)',
        ],
        ordered: false,
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Your Competitive Edge',
        text: 'The professionals who master AI coworkers in 2026 will have the same advantage that early spreadsheet users had in the 1980s or early internet users had in the 1990s. The tool itself is powerful, but the real value is knowing how to configure, customize, and orchestrate it for your specific domain. That\'s the skill this course has been building.',
      },
      {
        type: 'text',
        value: 'Congratulations on completing Course 5: Claude Cowork Mastery. You now understand the architecture, connectors, plugins, production workflows, competitive landscape, and strategic implications of the AI coworker revolution. The quiz for this module will test your ability to make strategic decisions about AI coworker adoption.',
      },
    ],
  },
];
