/**
 * Module 25: Introduction to Claude Cowork
 * Duration: 25 minutes | 3 Lessons
 */

import type { Lesson } from '../../types';

export const module25Lessons: Lesson[] = [
  // ==========================================================================
  // LESSON 25.1: What is Claude Cowork?
  // ==========================================================================
  {
    id: 'lesson-25-1',
    moduleId: 'module-25',
    title: 'What is Claude Cowork?',
    estimatedTime: 8,
    order: 1,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'On January 2026, Anthropic launched Claude Cowork — and the enterprise software world was never the same. Within 48 hours of the announcement, $285 billion in market capitalization evaporated from companies like Salesforce, ServiceNow, and Workday. Cowork wasn\'t just another AI chatbot. It was the first AI product that could actually *do* knowledge work — reading documents, writing contracts, managing pipelines, and coordinating across tools — all from a simple folder on your computer.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The 1.5-Week Miracle',
      },
      {
        type: 'text',
        value: 'Perhaps the most remarkable part of the Cowork story is how it was built. The core product was developed in just 1.5 weeks using Claude Code — Anthropic\'s own AI coding tool. A small team of engineers used Claude Code to scaffold the architecture, build the sandboxing system, write connector integrations, and create the plugin framework. This wasn\'t a decade-long enterprise software project with thousands of engineers. It was a lean team moving at AI speed.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Dogfooding at Its Finest',
        text: 'Anthropic built an AI coworker using an AI coder. Claude Code generated the boilerplate, handled the connector plumbing, and even wrote most of the test suites. The 1.5-week timeline proved that AI-assisted development could compress years of traditional enterprise software development into days.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'From Chatbot to Coworker',
      },
      {
        type: 'text',
        value: 'The fundamental shift that Cowork represents is the transition from AI as a conversation partner to AI as a work partner. Previous AI tools (including earlier versions of Claude) operated in a chat paradigm: you ask a question, you get an answer, you copy-paste it somewhere. Cowork broke this model entirely.',
      },
      {
        type: 'list',
        items: [
          'Chatbots answer questions — Cowork completes tasks end-to-end',
          'Chatbots live in a browser tab — Cowork lives in your file system and connected tools',
          'Chatbots forget context between sessions — Cowork maintains persistent project context in folders',
          'Chatbots require manual copy-paste — Cowork reads from and writes to your actual work artifacts',
          'Chatbots are reactive — Cowork can proactively monitor, flag issues, and suggest actions',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Cowork Mental Model',
      },
      {
        type: 'text',
        value: 'Think of Cowork as a brilliant new hire who sits at a desk next to yours. They have access to the same files, the same Slack channels, the same CRM, and the same document signing tools. When you say "review the Johnson contract and flag any unusual terms," they don\'t ask you to paste the contract into a chat window. They open the file, read it, annotate it, and put the flagged version back in your shared folder.',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Key Insight',
        text: 'The "coworker" metaphor isn\'t marketing — it\'s architecture. Cowork was designed from the ground up to operate on real work artifacts in real systems, not to simulate conversation about work. This is why it triggered a market panic: it actually replaces software workflows, not just answers questions about them.',
      },
      {
        type: 'heading',
        level: 3,
        value: 'What Cowork Can Do Today',
      },
      {
        type: 'list',
        items: [
          'Read, write, and organize files in Google Drive',
          'Send and respond to Slack messages with full thread context',
          'Review, redline, and route contracts through DocuSign',
          'Update CRM records, manage pipelines, and generate reports in Salesforce',
          'Run custom workflows through the plugin system',
          'Chain multiple actions together in automated pipelines',
        ],
        ordered: false,
      },
      {
        type: 'text',
        value: 'In the following lessons, we\'ll explore the architecture that makes this possible, the market dynamics it triggered, and how to harness Cowork for real enterprise workflows.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 25.2: Architecture & Sandboxing
  // ==========================================================================
  {
    id: 'lesson-25-2',
    moduleId: 'module-25',
    title: 'Architecture & Sandboxing',
    estimatedTime: 9,
    order: 2,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'At the heart of Claude Cowork is a deceptively simple architectural idea: folders as sandboxes. Instead of building a complex cloud-based workspace with proprietary file formats and locked-in data, Anthropic made the local file system the center of the experience. Every Cowork project is just a folder. Every task operates within that folder\'s boundaries. This design choice has profound implications for security, transparency, and user control.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Folder-Based Sandboxing Model',
      },
      {
        type: 'text',
        value: 'When you create a Cowork project, you designate a folder on your machine (or a shared drive). Cowork can read, write, and organize files within that folder — and only that folder. It cannot access your desktop, your downloads, or your system files unless you explicitly grant access. This is the sandbox.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Project: Q1 Sales Review\n├── /inputs/          ← Drop files here for Cowork to process\n│   ├── pipeline-export.csv\n│   ├── competitor-analysis.pdf\n│   └── team-notes.docx\n├── /outputs/         ← Cowork places completed work here\n│   ├── q1-summary.md\n│   ├── forecast-model.xlsx\n│   └── exec-presentation.pptx\n├── /connectors/      ← Connector configs and cached data\n│   ├── salesforce-sync.json\n│   └── slack-channel-log.json\n└── cowork.config.json  ← Project settings and permissions',
      },
      {
        type: 'heading',
        level: 2,
        value: 'How Sandboxing Works Under the Hood',
      },
      {
        type: 'text',
        value: 'Cowork uses a layered isolation model that provides security without sacrificing functionality. Each layer adds a boundary that Cowork must explicitly be granted permission to cross.',
      },
      {
        type: 'list',
        items: [
          'File System Boundary — Cowork can only access the designated project folder and its subfolders. All file operations are path-validated before execution.',
          'Connector Permissions — Each connector (Google Drive, Slack, etc.) has its own OAuth scope. Cowork requests only the minimum permissions needed for the task.',
          'Action Approval — Destructive actions (deleting files, sending messages, signing documents) require explicit user confirmation unless pre-approved in the config.',
          'Audit Trail — Every action Cowork takes is logged in a machine-readable audit file within the project folder.',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Security First',
        text: 'The sandbox model means Cowork cannot "escape" its project folder. Even if a malicious prompt injection is embedded in a document Cowork reads, the worst it can do is create files within the sandbox. It cannot access your email, install software, or reach outside the folder boundary.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Comparison with Traditional AI Assistants',
      },
      {
        type: 'text',
        value: 'Traditional AI assistants like ChatGPT, Gemini, or even earlier Claude operate in what we might call "cloud bubble" mode. Your data goes up to a server, gets processed, and comes back as text. You then manually move that text to wherever it needs to go. Cowork flips this model.',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "traditional_ai": {\n    "data_flow": "User → Cloud API → Response text → Manual copy/paste",\n    "context": "Single conversation, no file access",\n    "security": "Data sent to remote servers",\n    "persistence": "Lost when chat window closes"\n  },\n  "cowork": {\n    "data_flow": "Project folder → Local processing → Files updated in-place",\n    "context": "Full project folder + connected tools",\n    "security": "Sandboxed to project folder, local-first",\n    "persistence": "Project folder persists indefinitely"\n  }\n}',
      },
      {
        type: 'heading',
        level: 3,
        value: 'The Config File',
      },
      {
        type: 'text',
        value: 'Every Cowork project contains a cowork.config.json file that defines the sandbox boundaries, connector permissions, and workflow rules. This file is human-readable and version-controllable, meaning teams can review and approve Cowork configurations the same way they review code.',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "project": "Q1 Sales Review",\n  "sandbox": {\n    "root": "./",\n    "writable_paths": ["./outputs/", "./connectors/"],\n    "read_only_paths": ["./inputs/"]\n  },\n  "connectors": {\n    "salesforce": { "enabled": true, "scopes": ["read_contacts", "read_opportunities"] },\n    "slack": { "enabled": true, "channels": ["#sales-team"], "can_post": false }\n  },\n  "approvals": {\n    "require_confirmation": ["delete_file", "send_message", "sign_document"],\n    "auto_approve": ["read_file", "create_file", "update_file"]\n  }\n}',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Pro Tip',
        text: 'Keep your cowork.config.json in version control. This lets your team track permission changes over time and ensures that new team members get the same sandbox configuration. It also serves as documentation for what Cowork is allowed to do in each project.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 25.3: The Market Impact
  // ==========================================================================
  {
    id: 'lesson-25-3',
    moduleId: 'module-25',
    title: 'The Market Impact',
    estimatedTime: 8,
    order: 3,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'When Anthropic announced Claude Cowork in January 2026, the stock market responded with one of the largest single-category selloffs in tech history. Over two trading days, $285 billion in market capitalization evaporated from enterprise software companies. This wasn\'t irrational panic — it was a rational repricing of companies whose core business models were suddenly threatened by a product built in 1.5 weeks.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The $285 Billion Selloff',
      },
      {
        type: 'text',
        value: 'The selloff was concentrated in three categories of enterprise software: CRM platforms, workflow automation tools, and HR/finance suites. Investors recognized that Cowork\'s connector model could replace significant portions of what these platforms do — at a fraction of the cost and complexity.',
      },
      {
        type: 'list',
        items: [
          'Salesforce (CRM) — Stock dropped 18% in two days. Cowork\'s Salesforce connector could read, update, and report on CRM data without the Salesforce UI. Analysts questioned why companies would pay $300/user/month for a platform when an AI coworker could manage the data directly.',
          'ServiceNow (IT/Workflow Automation) — Dropped 22%. Cowork\'s ability to chain actions across connectors replicated core ServiceNow workflow automation features.',
          'Workday (HR/Finance) — Fell 15%. Cowork\'s document processing and approval routing threatened Workday\'s contract management and employee workflow features.',
          'Other affected companies included Atlassian (-12%), HubSpot (-14%), and DocuSign (-9%) — though DocuSign later recovered as investors realized Cowork used DocuSign as a connector rather than replacing it.',
        ],
        ordered: false,
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'The DocuSign Exception',
        text: 'DocuSign is a critical lesson in understanding the Cowork threat model. Companies that Cowork connects TO (DocuSign, Slack, Google Drive) may actually benefit from increased usage. Companies that Cowork replaces the WORKFLOW of (Salesforce\'s UI, ServiceNow\'s automation builder) face existential risk.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Why 1.5 Weeks Matters',
      },
      {
        type: 'text',
        value: 'The development timeline wasn\'t just a fun fact — it was the core of the investment thesis shift. Enterprise software companies had spent decades and billions of dollars building their platforms. Anthropic replicated significant chunks of their functionality in 1.5 weeks using AI-assisted development. This raised a terrifying question for investors: if Anthropic can build this in 10 days, what stops them from building more?',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Anthropic\'s Strategic Positioning',
      },
      {
        type: 'text',
        value: 'Anthropic positioned Cowork not as a replacement for enterprise software but as a "universal interface layer" that sits on top of existing tools. This was strategically brilliant for several reasons:',
      },
      {
        type: 'list',
        items: [
          'It avoided direct confrontation with entrenched enterprise vendors',
          'It made Cowork more valuable the more tools a company already used',
          'It turned potential competitors into connector partners',
          'It created a network effect: each new connector made Cowork more useful for every customer',
        ],
        ordered: true,
      },
      {
        type: 'heading',
        level: 3,
        value: 'What This Means for Enterprise Software',
      },
      {
        type: 'text',
        value: 'The Cowork launch signaled a fundamental shift in how enterprises will consume software. Instead of buying specialized tools for each function (CRM, project management, HR, finance) and then paying for integrations between them, companies can increasingly use an AI coworker as the integration layer itself. The value shifts from the software platform to the data and the AI that operates on it.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'The Platform vs. Interface Debate',
        text: 'Enterprise software companies are now scrambling to answer a strategic question: are they a platform (owning the data and workflows) or an interface (providing the UI for work)? If they\'re primarily an interface, Cowork can replace them. If they\'re primarily a platform, Cowork becomes a better interface to their platform. The companies that survive will be the ones that double down on being irreplaceable data platforms.',
      },
      {
        type: 'text',
        value: 'In Module 27, we\'ll explore how Microsoft responded to this threat with Copilot Cowork and the landmark $30 billion Anthropic Azure deal, and how the competitive landscape is shaping up.',
      },
    ],
  },
];
