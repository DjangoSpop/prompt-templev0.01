/**
 * Module 26: Connectors & Integrations
 * Duration: 25 minutes | 3 Lessons
 */

import type { Lesson } from '../../types';

export const module26Lessons: Lesson[] = [
  // ==========================================================================
  // LESSON 26.1: Core Connectors
  // ==========================================================================
  {
    id: 'lesson-26-1',
    moduleId: 'module-26',
    title: 'Core Connectors',
    estimatedTime: 8,
    order: 1,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Connectors are the nervous system of Claude Cowork. They\'re the bridges that let Cowork reach beyond your local folder and interact with the tools your team already uses. At launch, Cowork shipped with two "core" connectors — Google Drive and Slack — that cover the two most fundamental enterprise workflows: document management and team communication.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'How Connectors Work Under the Hood',
      },
      {
        type: 'text',
        value: 'Every connector follows the same three-layer architecture: Authentication (OAuth 2.0 for secure access), Schema Mapping (translating external data into Cowork\'s internal format), and Action Handlers (executing read/write operations on the external service). This standardized architecture is what allowed Anthropic to build connectors so quickly during the 1.5-week sprint.',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "connector": "google-drive",\n  "auth": {\n    "type": "oauth2",\n    "scopes": [\n      "https://www.googleapis.com/auth/drive.file",\n      "https://www.googleapis.com/auth/drive.readonly"\n    ]\n  },\n  "actions": [\n    "read_file",\n    "write_file",\n    "create_folder",\n    "list_contents",\n    "search_files",\n    "share_file",\n    "move_file"\n  ]\n}',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Google Drive Connector',
      },
      {
        type: 'text',
        value: 'The Google Drive connector gives Cowork full read/write access to your Google Drive (within the scopes you grant). This means Cowork can read Google Docs, Sheets, and Slides; create new documents from scratch; organize files into folders; and even convert between formats.',
      },
      {
        type: 'list',
        items: [
          'Read Operations — Open and parse Google Docs, Sheets, Slides, and PDFs. Cowork understands document structure, not just raw text.',
          'Write Operations — Create new documents, append to existing ones, update specific cells in Sheets, or generate entire presentations.',
          'Organization — Create folder structures, move files between folders, rename documents, and apply labels.',
          'Search — Find files by name, content, date, owner, or type. Cowork can search across your entire Drive.',
          'Sharing — Adjust sharing permissions, generate shareable links, and notify collaborators.',
        ],
        ordered: false,
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Sync vs. On-Demand',
        text: 'The Google Drive connector operates in on-demand mode by default — Cowork fetches files when it needs them rather than syncing everything locally. For frequently accessed files, you can enable "pin" mode to keep a local cached copy in the /connectors/ folder, which speeds up repeated access.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Slack Connector',
      },
      {
        type: 'text',
        value: 'The Slack connector turns Cowork into a team communication participant. It can read messages across channels you grant access to, understand thread context, and — with permission — post messages, react to messages, and even create new channels.',
      },
      {
        type: 'list',
        items: [
          'Channel Monitoring — Cowork can monitor specified channels for messages matching certain criteria (mentions, keywords, sentiment).',
          'Thread Context — When reading a message, Cowork fetches the entire thread for context, not just the single message.',
          'Message Drafting — Cowork can draft messages for your review before posting, or auto-post for pre-approved message types.',
          'Summarization — Generate daily or weekly channel summaries highlighting key decisions, action items, and unresolved questions.',
        ],
        ordered: false,
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "connector": "slack",\n  "channels": ["#sales-team", "#product-updates"],\n  "permissions": {\n    "read_messages": true,\n    "post_messages": false,\n    "read_threads": true,\n    "create_channels": false\n  },\n  "monitors": [\n    {\n      "channel": "#sales-team",\n      "trigger": "keyword",\n      "keywords": ["deal closed", "contract signed", "lost deal"],\n      "action": "summarize_and_log"\n    }\n  ]\n}',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Pro Tip',
        text: 'Start with read-only permissions on both connectors. Let Cowork prove its value by summarizing and organizing before granting write access. This builds trust with your team and lets you audit Cowork\'s judgment before giving it the ability to post messages or modify documents.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 26.2: Enterprise Connectors
  // ==========================================================================
  {
    id: 'lesson-26-2',
    moduleId: 'module-26',
    title: 'Enterprise Connectors',
    estimatedTime: 9,
    order: 2,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Beyond the core connectors, Cowork ships with enterprise-grade connectors for DocuSign and Salesforce. These connectors handle the more complex, high-stakes workflows that enterprise teams deal with daily: contract management, digital signatures, CRM data, and sales pipeline operations. These are the connectors that triggered the $285 billion selloff — because they demonstrated that Cowork could replace significant portions of enterprise software UIs.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'DocuSign Connector',
      },
      {
        type: 'text',
        value: 'The DocuSign connector enables Cowork to manage the entire contract lifecycle: creating envelopes, routing documents for signature, tracking signing status, and archiving completed contracts. This is one of the few connectors where Cowork genuinely enhances the underlying platform rather than threatening it.',
      },
      {
        type: 'list',
        items: [
          'Contract Preparation — Cowork reads a contract draft, identifies signature fields, and creates a DocuSign envelope with the correct recipients and signing order.',
          'Routing & Workflows — Define multi-step approval chains: legal review → manager approval → client signature. Cowork manages the sequence automatically.',
          'Status Tracking — Monitor which contracts are pending, viewed, partially signed, or completed. Get alerts when contracts stall.',
          'Redlining — Cowork can compare contract versions, highlight changes, and generate a summary of modifications for review.',
          'Archive — Completed contracts are automatically downloaded and organized in the project folder by date, client, and contract type.',
        ],
        ordered: false,
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "connector": "docusign",\n  "workflow": "contract-review",\n  "steps": [\n    {\n      "action": "create_envelope",\n      "template": "standard-nda",\n      "recipients": [\n        { "role": "legal_reviewer", "email": "legal@company.com" },\n        { "role": "client_signer", "email": "{{client_email}}" }\n      ]\n    },\n    {\n      "action": "track_status",\n      "notify_on": ["viewed", "signed", "declined"],\n      "escalate_after": "48h"\n    },\n    {\n      "action": "archive",\n      "destination": "./outputs/contracts/{{year}}/{{client_name}}/"\n    }\n  ]\n}',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Salesforce Connector',
      },
      {
        type: 'text',
        value: 'The Salesforce connector is arguably the most powerful and most controversial of all Cowork connectors. It gives Cowork read/write access to your CRM data — contacts, accounts, opportunities, cases, and custom objects. This means Cowork can update deal stages, log activities, generate pipeline reports, and even create new leads, all without anyone opening the Salesforce UI.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Why Salesforce Stock Dropped 18%',
        text: 'If an AI coworker can read your CRM data, update records, generate reports, and manage pipelines without the Salesforce UI, what exactly are companies paying $300/user/month for? The answer — data platform, ecosystem, and AppExchange — is valid, but investors weren\'t sure it justified the premium.',
      },
      {
        type: 'list',
        items: [
          'Pipeline Management — Cowork reads opportunity data, identifies stale deals, and suggests next actions based on deal history and communication patterns.',
          'Contact Intelligence — Cross-references Slack conversations, emails, and CRM notes to build a comprehensive view of each contact relationship.',
          'Report Generation — Creates custom reports by querying Salesforce data directly via SOQL, then formats results as Sheets, PDFs, or executive summaries.',
          'Activity Logging — Automatically logs calls, emails, and meetings as Salesforce activities, reducing the manual data entry reps hate.',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 3,
        value: 'Building Custom Connector Configurations',
      },
      {
        type: 'text',
        value: 'Every enterprise has unique workflows. Cowork\'s connector configuration system lets you customize how connectors behave for your specific use case. You define triggers, conditions, and actions in your cowork.config.json file.',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "custom_workflow": "deal-closed-automation",\n  "trigger": {\n    "connector": "salesforce",\n    "event": "opportunity_stage_change",\n    "condition": "stage === \'Closed Won\'"\n  },\n  "actions": [\n    {\n      "connector": "slack",\n      "action": "post_message",\n      "channel": "#wins",\n      "template": "🎉 {{rep_name}} just closed {{deal_name}} for {{amount}}!"\n    },\n    {\n      "connector": "google-drive",\n      "action": "create_document",\n      "template": "onboarding-checklist",\n      "destination": "./outputs/onboarding/{{client_name}}/"\n    },\n    {\n      "connector": "docusign",\n      "action": "create_envelope",\n      "template": "master-services-agreement",\n      "recipient": "{{client_email}}"\n    }\n  ]\n}',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Pro Tip',
        text: 'The deal-closed automation above replaces what would traditionally require Salesforce Flow Builder, Zapier, and custom code. With Cowork, the entire cross-platform workflow lives in a single JSON config file that anyone on your team can read and understand.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 26.3: Custom Plugins
  // ==========================================================================
  {
    id: 'lesson-26-3',
    moduleId: 'module-26',
    title: 'Custom Plugins',
    estimatedTime: 8,
    order: 3,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'While connectors bridge Cowork to external services, plugins extend Cowork\'s capabilities with custom logic. Plugins let you teach Cowork new skills — from industry-specific document analysis to proprietary data transformations to custom approval workflows. The plugin system is what transforms Cowork from a general-purpose AI coworker into YOUR team\'s AI coworker.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Plugin Architecture',
      },
      {
        type: 'text',
        value: 'Cowork plugins are lightweight modules that follow a simple contract: they declare what they can do (capabilities), what they need (inputs), and what they produce (outputs). Plugins run inside the project sandbox and inherit its security boundaries.',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "plugin": "contract-analyzer",\n  "version": "1.0.0",\n  "description": "Analyzes legal contracts for risk clauses, unusual terms, and compliance issues",\n  "capabilities": ["analyze_contract", "compare_contracts", "extract_terms"],\n  "inputs": {\n    "analyze_contract": {\n      "file": "path to contract (PDF, DOCX, or Google Doc)",\n      "ruleset": "optional path to custom compliance rules"\n    }\n  },\n  "outputs": {\n    "analyze_contract": {\n      "risk_score": "number 0-100",\n      "flagged_clauses": "array of clause objects with risk level and explanation",\n      "summary": "plain-text executive summary"\n    }\n  }\n}',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Building Your First Plugin',
      },
      {
        type: 'text',
        value: 'Creating a Cowork plugin involves three steps: defining the plugin manifest, writing the handler logic, and registering it with your project. The plugin manifest is a JSON file that tells Cowork what the plugin does. The handler is where the actual logic lives — and here\'s where it gets interesting: the handler can itself use Claude\'s AI capabilities.',
      },
      {
        type: 'list',
        items: [
          'Step 1: Create a /plugins/ directory in your project folder',
          'Step 2: Write a plugin.json manifest defining capabilities, inputs, and outputs',
          'Step 3: Write handler functions for each capability',
          'Step 4: Register the plugin in your cowork.config.json',
          'Step 5: Test the plugin with sample inputs before deploying to your team',
        ],
        ordered: true,
      },
      {
        type: 'code',
        language: 'typescript',
        code: '// plugins/contract-analyzer/handler.ts\nimport type { PluginContext, PluginResult } from \'@anthropic/cowork-sdk\';\n\nexport async function analyzeContract(\n  context: PluginContext,\n  input: { file: string; ruleset?: string }\n): Promise<PluginResult> {\n  // Read the contract from the sandbox\n  const contractText = await context.readFile(input.file);\n  \n  // Load custom rules or use defaults\n  const rules = input.ruleset \n    ? await context.readFile(input.ruleset)\n    : DEFAULT_COMPLIANCE_RULES;\n  \n  // Use Claude to analyze the contract\n  const analysis = await context.ai.analyze({\n    document: contractText,\n    instructions: `Review this contract against the following rules:\n      ${rules}\n      Flag any unusual terms, liability risks, or compliance issues.\n      Assign a risk score from 0-100.`,\n  });\n  \n  // Write the report to the outputs folder\n  await context.writeFile(\n    `./outputs/contract-reviews/${context.timestamp}-review.md`,\n    analysis.formatted_report\n  );\n  \n  return analysis;\n}',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'AI-Powered Plugin Logic',
        text: 'Notice that the plugin handler itself calls context.ai.analyze() — this means your plugin logic is powered by Claude. You\'re not writing traditional code that follows rigid rules. You\'re writing code that delegates judgment to AI while maintaining the structure and predictability of a software interface.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Publishing Plugins for Teams',
      },
      {
        type: 'text',
        value: 'Once you\'ve built a plugin that works for your workflow, you can publish it to your organization\'s plugin registry. Team members can then install it in their own Cowork projects with a single command. The plugin registry supports versioning, so you can update plugins without breaking existing projects.',
      },
      {
        type: 'list',
        items: [
          'Private Registry — Host plugins on your company\'s internal registry for team-only access',
          'Public Registry — Share plugins with the broader Cowork community',
          'Versioning — Semantic versioning ensures backward compatibility',
          'Dependency Management — Plugins can depend on other plugins and on specific connector versions',
          'Review Process — Organization admins can require approval before plugins are available to team members',
        ],
        ordered: false,
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Pro Tip',
        text: 'The most powerful Cowork plugins are "thin wrappers" around AI instructions. Instead of writing hundreds of lines of business logic, write clear, specific instructions and let Claude handle the judgment. Your plugin code should focus on I/O (reading files, calling APIs, writing outputs) while delegating analysis and decision-making to the AI layer.',
      },
      {
        type: 'text',
        value: 'In the next module, we\'ll put connectors and plugins together into real enterprise workflows and explore how Microsoft responded to Cowork with their own competing product.',
      },
    ],
  },
];
