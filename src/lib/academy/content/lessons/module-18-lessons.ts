/**
 * Module 18: n8n vs Zapier vs Make — Platform Comparison
 * Duration: 25 minutes | 3 Lessons
 */

import type { Lesson } from '../../types';

export const module18Lessons: Lesson[] = [
  // ==========================================================================
  // LESSON 18.1: The Automation Landscape
  // ==========================================================================
  {
    id: 'lesson-18-1',
    moduleId: 'module-18',
    title: 'The Automation Landscape',
    estimatedTime: 8,
    order: 1,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'The workflow automation market has exploded in the last few years. What started as simple "if this, then that" triggers has evolved into sophisticated platforms capable of orchestrating AI agents, processing millions of records, and running entire business operations. Three platforms dominate the conversation: n8n, Zapier, and Make (formerly Integromat). Understanding their differences is critical for choosing the right foundation for your AI automation stack.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What Each Platform Does',
      },
      {
        type: 'text',
        value: 'At their core, all three platforms solve the same problem: connecting different software tools and automating workflows between them without writing traditional code. However, their philosophies, architectures, and target audiences differ significantly.',
      },
      {
        type: 'heading',
        level: 3,
        value: 'Zapier — The Market Leader',
      },
      {
        type: 'text',
        value: 'Zapier launched in 2011 and pioneered the no-code automation space. It connects over 6,000+ apps through a simple trigger-action model. Zapier is designed for non-technical users who need to automate repetitive tasks quickly. Its strength is breadth of integrations and ease of use. However, its linear workflow model and cloud-only architecture limit what power users can build.',
      },
      {
        type: 'heading',
        level: 3,
        value: 'Make (formerly Integromat) — The Visual Builder',
      },
      {
        type: 'text',
        value: 'Make rebranded from Integromat in 2022 and offers a visual, drag-and-drop workflow builder with 1,500+ integrations. It excels at complex data transformations and multi-branch workflows. Make\'s visual canvas is more flexible than Zapier\'s linear chains, allowing parallel execution paths and sophisticated routing. It sits between Zapier\'s simplicity and n8n\'s power.',
      },
      {
        type: 'heading',
        level: 3,
        value: 'n8n — The Developer-Friendly Powerhouse',
      },
      {
        type: 'text',
        value: 'n8n (pronounced "nodemation") is an open-source, self-hostable workflow automation platform with 500+ built-in integrations and a thriving community of 72,000+ shared workflow templates. What sets n8n apart is its "fair-code" model, native AI agent capabilities, and the ability to run entirely on your own infrastructure — giving you full control over data, costs, and customization.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Why n8n for AI?',
        text: 'While all three platforms now offer AI features, n8n was purpose-built for AI workflows. It includes native AI Agent nodes with ReAct reasoning, built-in vector store support, MCP (Model Context Protocol) integration, and the ability to write custom JavaScript/Python within workflows. This makes it the strongest choice for building production AI agent systems.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Pricing Models Compared',
      },
      {
        type: 'list',
        items: [
          'Zapier: Starts free (100 tasks/month), paid plans from $19.99/month for 750 tasks. Enterprise pricing scales steeply — teams running 50,000+ tasks can pay $600+/month',
          'Make: Starts free (1,000 ops/month), paid plans from $9/month for 10,000 ops. More generous than Zapier but still usage-based with cloud-only hosting',
          'n8n: Free forever when self-hosted (unlimited executions). Cloud plans start at $20/month for 2,500 executions. Self-hosting on a $5/month VPS gives you unlimited workflows at a fraction of competitors\' costs',
        ],
        ordered: false,
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Cost Advantage',
        text: 'For teams running thousands of AI agent executions daily, n8n self-hosted can save 90%+ compared to Zapier or Make cloud plans. A single $20/month server can handle what would cost $500+/month on Zapier.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Target Audience',
      },
      {
        type: 'text',
        value: 'Zapier targets business users and marketers who want quick, simple automations without any technical knowledge. Make targets operations teams and power users who need more complex logic but still prefer visual builders. n8n targets developers, technical teams, and organizations that need maximum flexibility, data privacy, and AI-native capabilities. If you\'re building AI agent systems, n8n is the clear choice.',
      },
    ],
  },
  // ==========================================================================
  // LESSON 18.2: Feature-by-Feature Comparison
  // ==========================================================================
  {
    id: 'lesson-18-2',
    moduleId: 'module-18',
    title: 'Feature-by-Feature Comparison',
    estimatedTime: 9,
    order: 2,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Choosing an automation platform requires looking beyond marketing pages. Let\'s compare n8n, Zapier, and Make across the features that matter most for AI automation: AI capabilities, code execution, self-hosting, integrations, community resources, and data handling.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'AI & Agent Capabilities',
      },
      {
        type: 'text',
        value: 'This is where the platforms diverge most dramatically. AI is no longer a nice-to-have — it\'s the core of modern automation.',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "ai_comparison": {\n    "n8n": {\n      "ai_agent_node": true,\n      "react_framework": true,\n      "tool_calling": true,\n      "memory_types": ["window", "token", "summary", "vector"],\n      "vector_stores": ["Qdrant", "Pinecone", "Supabase", "PGVector"],\n      "mcp_support": "native (server + client)",\n      "custom_code_in_agents": true,\n      "supported_llms": ["OpenAI", "Anthropic", "Google", "Ollama", "Azure", "HuggingFace"]\n    },\n    "zapier": {\n      "ai_agent_node": false,\n      "chatbot_builder": true,\n      "code_steps": "limited",\n      "mcp_support": "none",\n      "supported_llms": ["OpenAI", "Anthropic"]\n    },\n    "make": {\n      "ai_agent_node": false,\n      "openai_module": true,\n      "code_steps": "javascript only",\n      "mcp_support": "none",\n      "supported_llms": ["OpenAI", "Anthropic", "Google"]\n    }\n  }\n}',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Native AI Agents',
        text: 'n8n is the only platform with a dedicated AI Agent node that implements the ReAct (Reasoning + Acting) framework. This means your agents can reason about problems, call tools, observe results, and iterate — all within a visual workflow. Zapier and Make require manual multi-step chains to approximate this behavior.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Code Execution',
      },
      {
        type: 'text',
        value: 'Code nodes are essential for AI workflows — parsing LLM responses, transforming data, implementing custom logic, and building tool functions.',
      },
      {
        type: 'list',
        items: [
          'n8n: Full JavaScript and Python code nodes with npm/pip package access. Execute arbitrary code with access to workflow data, environment variables, and external libraries. You can even build custom nodes.',
          'Zapier: Limited "Code by Zapier" step supporting JavaScript and Python, but with restricted libraries and 1-second timeout on the free plan. No package imports.',
          'Make: JavaScript-only code modules with basic functionality. No external package support. Adequate for simple transformations but limiting for AI workloads.',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Self-Hosting & Data Privacy',
      },
      {
        type: 'text',
        value: 'For organizations handling sensitive data — healthcare, finance, legal — where data must stay on-premise, self-hosting is non-negotiable.',
      },
      {
        type: 'list',
        items: [
          'n8n: Full self-hosting via Docker, Kubernetes, or npm. Deploy on any cloud provider or on-premise hardware. Your data never leaves your infrastructure.',
          'Zapier: Cloud-only. No self-hosting option. All data flows through Zapier\'s servers in the US.',
          'Make: Cloud-only with EU data residency option. No self-hosting. Data processed on Make\'s infrastructure.',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Integration Counts & Community',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "integrations": {\n    "zapier": "6,000+ apps (largest marketplace)",\n    "make": "1,500+ apps (growing steadily)",\n    "n8n": "500+ built-in nodes + unlimited via HTTP/webhook/code"\n  },\n  "community_workflows": {\n    "n8n": "72,000+ shared templates on n8n.io",\n    "zapier": "~5,000 templates (curated)",\n    "make": "~1,200 templates (curated)"\n  },\n  "open_source": {\n    "n8n": "Yes — 50,000+ GitHub stars",\n    "zapier": "No",\n    "make": "No"\n  }\n}',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Community Power',
        text: 'n8n\'s 72,000+ community workflow templates are a massive advantage. Instead of building from scratch, you can import battle-tested workflows for common AI patterns — RAG pipelines, agent systems, data processing, and more — then customize them for your needs.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Workflow Complexity',
      },
      {
        type: 'text',
        value: 'Zapier uses a linear trigger-action chain model, which works well for simple A-to-B automations but struggles with branching, loops, and parallel execution. Make offers a visual canvas with branching and parallel paths but lacks advanced programming constructs. n8n provides the full spectrum: visual canvas, branching, loops (via SplitInBatches), sub-workflows, error handling with dedicated error trigger nodes, and the ability to call workflows from within other workflows.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Summary Table',
      },
      {
        type: 'text',
        value: 'When building AI agent systems, n8n wins on AI capabilities, self-hosting, cost efficiency, and community resources. Zapier wins on integration breadth and simplicity. Make wins on visual complexity handling for non-AI workflows. For our purposes — building production AI agents — n8n is the clear platform of choice.',
      },
    ],
  },
  // ==========================================================================
  // LESSON 18.3: When to Choose n8n
  // ==========================================================================
  {
    id: 'lesson-18-3',
    moduleId: 'module-18',
    title: 'When to Choose n8n',
    estimatedTime: 8,
    order: 3,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Now that we\'ve compared the platforms feature-by-feature, let\'s dive deeper into the specific scenarios where n8n is the optimal choice — and the rare cases where you might consider alternatives. Understanding these trade-offs will help you make confident architectural decisions for your team.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Self-Hosting Advantage',
      },
      {
        type: 'text',
        value: 'Self-hosting is n8n\'s superpower for AI workloads. When you self-host, you gain complete control over your data pipeline. LLM API keys stay on your server. Customer data never passes through a third-party cloud. You can connect to internal databases, private APIs, and on-premise systems without exposing them to the internet.',
      },
      {
        type: 'code',
        language: 'bash',
        code: '# Deploy n8n with Docker in under 2 minutes\ndocker run -d \\\n  --name n8n \\\n  -p 5678:5678 \\\n  -v n8n_data:/home/node/.n8n \\\n  -e N8N_ENCRYPTION_KEY=your-secret-key \\\n  -e WEBHOOK_URL=https://n8n.yourdomain.com/ \\\n  n8nio/n8n:latest\n\n# Access at http://localhost:5678',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Data Privacy Compliance',
        text: 'For GDPR, HIPAA, SOC2, or any data residency requirement, self-hosted n8n is the only automation platform that keeps 100% of your data on your own infrastructure. Zapier and Make both process data on their servers, which can be a compliance blocker for regulated industries.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'AI-Native Features That Matter',
      },
      {
        type: 'text',
        value: 'n8n isn\'t just an automation tool with AI bolted on — it\'s been redesigned around AI-first workflows. Here are the features that make it uniquely suited for AI agent systems:',
      },
      {
        type: 'list',
        items: [
          'AI Agent Node — Native ReAct framework with tool calling, memory management, and output parsing built in',
          'MCP Server Trigger — Expose any n8n workflow as an MCP tool that Claude Desktop, Cursor, or any MCP client can call',
          'MCP Client Node — Consume external MCP servers from within your workflows, accessing tools from other AI systems',
          'Vector Store Nodes — Native support for Qdrant, Pinecone, Supabase, and PGVector for RAG pipelines',
          'Chat Memory — Window, token, summary, and vector-based memory types for conversational agents',
          'LLM Flexibility — Connect to OpenAI, Anthropic Claude, Google Gemini, Ollama (local), Azure OpenAI, and more',
          'Sub-workflow Tools — Turn entire workflows into tools that AI agents can call, enabling modular agent architectures',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Cost Analysis for Teams',
      },
      {
        type: 'text',
        value: 'Let\'s run the numbers for a typical AI automation team running 10 workflows with approximately 5,000 daily executions:',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "monthly_cost_comparison": {\n    "scenario": "10 workflows, ~5,000 executions/day (150,000/month)",\n    "zapier": {\n      "plan": "Team Plan",\n      "cost": "$599/month",\n      "notes": "150,000 tasks included, overage at $0.01/task"\n    },\n    "make": {\n      "plan": "Teams Plan",\n      "cost": "$299/month",\n      "notes": "200,000 ops included, but AI ops count as 5x"\n    },\n    "n8n_cloud": {\n      "plan": "Pro Plan",\n      "cost": "$50/month",\n      "notes": "Execution-based pricing, more generous counting"\n    },\n    "n8n_self_hosted": {\n      "plan": "Self-hosted on VPS",\n      "cost": "$20-40/month",\n      "notes": "Unlimited executions. Server cost only (Hetzner, DigitalOcean, etc.)"\n    }\n  },\n  "annual_savings_vs_zapier": "$6,700 - $7,100"\n}',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Real-World Savings',
        text: 'A team running moderate AI agent workloads saves $6,000-7,000+ per year by choosing n8n self-hosted over Zapier. As your execution volume grows, the savings compound — teams with high-volume AI workflows report 95%+ cost reduction compared to cloud-only platforms.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'When n8n Might NOT Be the Best Choice',
      },
      {
        type: 'list',
        items: [
          'Ultra-simple automations: If you just need "when I get an email, post to Slack" and nothing more, Zapier\'s simplicity is hard to beat',
          'Non-technical solo users: If no one on your team can manage a Docker container or basic server, n8n Cloud or Zapier may be safer',
          'Niche integrations: If you need a specific obscure app connector that only Zapier has (check their 6,000+ list), that matters — though n8n\'s HTTP Request node can connect to any API',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Verdict',
      },
      {
        type: 'text',
        value: 'For building production AI agent systems — which is exactly what this course is about — n8n is the strongest platform available. It combines the visual workflow building of Make, the breadth of Zapier (via HTTP and webhooks), and adds native AI capabilities that neither competitor can match. Combined with self-hosting for data privacy and cost savings, n8n is the foundation we\'ll build everything on for the rest of this course.',
      },
    ],
  },
];
