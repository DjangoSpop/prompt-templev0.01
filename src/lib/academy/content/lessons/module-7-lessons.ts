/**
 * Module 7: MCP & AI Agents — The Agentic Era
 * Duration: 30 minutes | 5 Lessons
 */

import type { Lesson } from '../../types';

export const module7Lessons: Lesson[] = [
  // ==========================================================================
  // LESSON 7.1: What is the Model Context Protocol (MCP)?
  // ==========================================================================
  {
    id: 'lesson-7-1',
    moduleId: 'module-7',
    title: 'What is the Model Context Protocol (MCP)?',
    estimatedTime: 5,
    order: 1,
    xpReward: 30,
    content: [
      {
        type: 'text',
        value: 'You\'ve mastered prompt engineering. Now it\'s time to enter the agentic era — where AI doesn\'t just answer questions, it takes actions. The Model Context Protocol (MCP) is the bridge.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Problem MCP Solves',
      },
      {
        type: 'text',
        value: 'Before MCP, every AI integration was a custom, fragile connection. Want Claude to read your files? Custom code. Want GPT-4 to query your database? Another custom integration. Every tool, every data source — bespoke wiring.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'The USB Analogy',
        text: 'MCP is like USB for AI. Before USB, every peripheral (mouse, keyboard, printer) needed its own unique port and driver. USB created one standard that works for everything. MCP does the same for AI — one protocol to connect any AI model to any tool or data source.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'MCP Architecture in 60 Seconds',
      },
      {
        type: 'text',
        value: 'MCP has three core components:',
      },
      {
        type: 'list',
        items: [
          'MCP Host — The AI application (e.g., Claude Desktop, your custom app) that initiates connections',
          'MCP Client — Lives inside the host, maintains a 1:1 connection to a server',
          'MCP Server — Exposes tools, resources, and prompts to the AI through a standardized interface',
        ],
      },
      {
        type: 'code',
        language: 'text',
        code: `┌─────────────────────────────────────┐
│  MCP Host (e.g., Claude Desktop)    │
│                                     │
│  ┌──────────┐    ┌──────────┐      │
│  │ MCP      │    │ MCP      │      │
│  │ Client A │    │ Client B │      │
│  └────┬─────┘    └────┬─────┘      │
└───────┼───────────────┼─────────────┘
        │               │
        ▼               ▼
  ┌──────────┐    ┌──────────┐
  │ MCP      │    │ MCP      │
  │ Server A │    │ Server B │
  │ (Files)  │    │(Database)│
  └──────────┘    └──────────┘`,
        caption: 'MCP separates the AI (host) from the capabilities (servers) through a clean protocol layer',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What MCP Servers Expose',
      },
      {
        type: 'text',
        value: 'An MCP server can expose three types of capabilities:',
      },
      {
        type: 'list',
        items: [
          'Tools — Functions the AI can call (e.g., search_files, run_query, send_email)',
          'Resources — Data the AI can read (e.g., file contents, database records, API responses)',
          'Prompts — Pre-built prompt templates the AI can use (e.g., "summarize this codebase")',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Real-World Impact',
        text: 'Anthropic launched MCP in November 2024. Within 4 months, the ecosystem exploded — thousands of MCP servers for everything from GitHub to Slack to databases to Kubernetes. Any AI that supports MCP can instantly use all of them.',
      },
      {
        type: 'heading',
        level: 3,
        value: 'Why This Matters for You',
      },
      {
        type: 'list',
        items: [
          'MCP turns prompt engineering from "ask questions" to "orchestrate actions"',
          'Your prompts can now trigger real tools — file I/O, APIs, database queries, deployments',
          'Understanding MCP is the bridge from prompt engineer to AI agent builder',
          'The job market is shifting: "prompt engineer" → "AI agent designer"',
        ],
      },
    ],
  },

  // ==========================================================================
  // LESSON 7.2: MCP Servers — Building Blocks of AI Tools
  // ==========================================================================
  {
    id: 'lesson-7-2',
    moduleId: 'module-7',
    title: 'MCP Servers — Building Blocks of AI Tools',
    estimatedTime: 7,
    order: 2,
    xpReward: 30,
    content: [
      {
        type: 'text',
        value: 'An MCP server is a program that exposes capabilities to AI models through a standardized protocol. Let\'s understand how they work and how to use them.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Anatomy of an MCP Server',
      },
      {
        type: 'text',
        value: 'Every MCP server follows the same pattern: declare capabilities, handle requests, return results.',
      },
      {
        type: 'code',
        language: 'typescript',
        code: `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({
  name: "weather-server",
  version: "1.0.0",
});

// Expose a tool
server.tool(
  "get_weather",
  "Get current weather for a city",
  { city: { type: "string", description: "City name" } },
  async ({ city }) => {
    const data = await fetchWeather(city);
    return {
      content: [{
        type: "text",
        text: \`Weather in \${city}: \${data.temp}°F, \${data.condition}\`
      }]
    };
  }
);`,
        caption: 'A minimal MCP server that exposes a weather tool',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Popular MCP Server Categories',
      },
      {
        type: 'text',
        value: 'The MCP ecosystem already has servers for almost every use case:',
      },
      {
        type: 'list',
        items: [
          'Developer Tools — GitHub, GitLab, filesystem access, terminal commands',
          'Data & Databases — PostgreSQL, MongoDB, Elasticsearch, BigQuery',
          'Communication — Slack, Discord, email, SMS',
          'Cloud & DevOps — AWS, GCP, Kubernetes, Docker',
          'Knowledge — Web search, Wikipedia, documentation crawlers',
          'Productivity — Google Drive, Notion, Linear, Jira',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Pro Tip: Composability',
        text: 'The real power of MCP is composability. An AI agent can use multiple servers simultaneously — read from a database, process with a Python script, and post results to Slack, all in one workflow. Your prompt orchestrates the entire pipeline.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Transport Modes',
      },
      {
        type: 'text',
        value: 'MCP servers communicate via two transport mechanisms:',
      },
      {
        type: 'list',
        items: [
          'stdio (Standard I/O) — Server runs as a local subprocess. The host launches it and communicates via stdin/stdout. Best for local tools like filesystem access.',
          'SSE (Server-Sent Events) — Server runs remotely over HTTP. The client connects to a URL. Best for shared services like databases or APIs.',
        ],
      },
      {
        type: 'code',
        language: 'json',
        code: `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/me/projects"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://localhost:5432/mydb"
      }
    }
  }
}`,
        caption: 'Claude Desktop MCP configuration — adding filesystem and PostgreSQL servers',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Tool Call Flow',
      },
      {
        type: 'text',
        value: 'When you ask an MCP-connected AI to do something:',
      },
      {
        type: 'list',
        items: [
          'You send a prompt: "What files are in my project directory?"',
          'The AI recognizes it needs the filesystem tool',
          'The AI sends a tool_call to the MCP server: list_directory({ path: "/projects" })',
          'The MCP server executes the operation and returns results',
          'The AI incorporates the results into its response to you',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Security Note',
        text: 'MCP servers can access real systems. Always review what permissions you\'re granting. A filesystem server can read your files. A database server can query your data. The principle of least privilege applies — only expose what\'s needed.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 7.3: AI Agents — From Prompts to Autonomous Workflows
  // ==========================================================================
  {
    id: 'lesson-7-3',
    moduleId: 'module-7',
    title: 'AI Agents — From Prompts to Autonomous Workflows',
    estimatedTime: 7,
    order: 3,
    xpReward: 30,
    content: [
      {
        type: 'text',
        value: 'A prompt tells an AI what to think. An agent tells an AI what to do. Let\'s understand the shift from static prompts to autonomous AI agents.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What is an AI Agent?',
      },
      {
        type: 'text',
        value: 'An AI agent is a system that uses an LLM as its "brain" to autonomously plan, decide which tools to use, execute actions, and iterate until a goal is achieved.',
      },
      {
        type: 'code',
        language: 'text',
        code: `Traditional Prompt Flow:
  User → Prompt → LLM → Response → Done

Agent Flow:
  User → Goal → LLM (Plan) → Tool Call → Result →
  LLM (Evaluate) → Tool Call → Result →
  LLM (Evaluate) → ... → Final Answer`,
        caption: 'Agents loop: plan → act → observe → repeat',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Agent Loop',
      },
      {
        type: 'text',
        value: 'Every AI agent follows this core loop:',
      },
      {
        type: 'list',
        items: [
          'Observe — Read the current state (user input, tool results, context)',
          'Think — Use the LLM to reason about what to do next',
          'Act — Call a tool or produce output',
          'Evaluate — Check if the goal is met; if not, loop back',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Key Distinction',
        text: 'A chatbot responds. An agent acts. When you ask Claude "what\'s in my database?" with MCP, it doesn\'t guess — it calls the database tool, reads the actual schema, and gives you real data. That\'s agent behavior.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Agent Design Patterns',
      },
      {
        type: 'heading',
        level: 3,
        value: 'Pattern 1: Tool Use Agent',
      },
      {
        type: 'text',
        value: 'The simplest agent pattern. The LLM decides which tools to call and when.',
      },
      {
        type: 'code',
        language: 'text',
        code: `User: "Find all TODO comments in my codebase and create GitHub issues for them"

Agent Plan:
  1. Call grep_search(pattern="TODO", path="./src")
  2. For each match, call create_github_issue(title, body)
  3. Return summary of created issues`,
      },
      {
        type: 'heading',
        level: 3,
        value: 'Pattern 2: ReAct (Reasoning + Acting)',
      },
      {
        type: 'text',
        value: 'The agent explicitly reasons before each action, creating a chain of thought → action → observation.',
      },
      {
        type: 'heading',
        level: 3,
        value: 'Pattern 3: Multi-Agent Orchestration',
      },
      {
        type: 'text',
        value: 'Multiple specialized agents collaborate. A "planner" agent delegates to "worker" agents.',
      },
      {
        type: 'code',
        language: 'text',
        code: `Orchestrator Agent:
  "I need to deploy this feature"

  → Delegates to Code Review Agent → "Code looks good"
  → Delegates to Test Agent → "All tests pass"
  → Delegates to Deploy Agent → "Deployed to staging"
  → Reports: "Feature deployed to staging, all checks passed"`,
        caption: 'Multi-agent pattern: each agent has a specific role and tool set',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Agent Frameworks',
      },
      {
        type: 'text',
        value: 'Several frameworks make building agents easier:',
      },
      {
        type: 'list',
        items: [
          'Claude Code (Anthropic) — A coding agent that uses MCP natively. Can edit files, run terminals, create PRs.',
          'LangGraph — Build stateful, multi-step agent workflows with branching logic',
          'CrewAI — Multi-agent orchestration where agents have roles and collaborate',
          'AutoGen (Microsoft) — Conversational agent framework for multi-agent chat',
          'Google A2A — Agent-to-Agent protocol for cross-platform agent communication',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'The Prompt Engineer\'s Role',
        text: 'As an agent designer, your prompts become the "instructions" and "system prompts" that define agent behavior. Everything you\'ve learned about CCCEFI, structured prompts, and prompt patterns applies directly — but now your prompts orchestrate tools instead of just generating text.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 7.4: Context Engineering — The New Frontier
  // ==========================================================================
  {
    id: 'lesson-7-4',
    moduleId: 'module-7',
    title: 'Context Engineering — The New Frontier',
    estimatedTime: 6,
    order: 4,
    xpReward: 30,
    content: [
      {
        type: 'text',
        value: 'Prompt engineering is about crafting the right instruction. Context engineering is about assembling the right information. In the agentic era, context is everything.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'From Prompt Engineering to Context Engineering',
      },
      {
        type: 'text',
        value: 'As AI systems get more capable, the bottleneck shifts. The model can follow complex instructions — the challenge is giving it the right context at the right time.',
      },
      {
        type: 'code',
        language: 'text',
        code: `Prompt Engineering (what you've learned):
  "How do I ask the question well?"

Context Engineering (the next level):
  "What information does the AI need to answer well?"

  Context = System Prompt + User Message + Retrieved Docs
          + Tool Results + Conversation History + Metadata`,
        caption: 'Context engineering is about the full information package, not just the instruction',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Context Window Challenge',
      },
      {
        type: 'text',
        value: 'Every AI model has a context window — the maximum amount of text it can process at once:',
      },
      {
        type: 'list',
        items: [
          'GPT-4o: 128K tokens (~300 pages)',
          'Claude 3.5 Sonnet: 200K tokens (~500 pages)',
          'Claude Opus 4: 200K tokens (with extended thinking)',
          'Gemini 1.5 Pro: 1M tokens (~2,500 pages)',
        ],
      },
      {
        type: 'text',
        value: 'More context isn\'t always better. The key is selecting the right context:',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'The "Lost in the Middle" Problem',
        text: 'Research shows that LLMs pay most attention to the beginning and end of the context window. Information buried in the middle gets less attention. This means context placement and ordering matters as much as context selection.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Context Engineering Techniques',
      },
      {
        type: 'heading',
        level: 3,
        value: '1. RAG (Retrieval-Augmented Generation)',
      },
      {
        type: 'text',
        value: 'Dynamically retrieve relevant documents and inject them into the context. Your AI answers based on your actual data, not just training data.',
      },
      {
        type: 'heading',
        level: 3,
        value: '2. Tool-Augmented Context',
      },
      {
        type: 'text',
        value: 'Use MCP tools to pull fresh data at inference time. Instead of static documents, the AI queries live systems — databases, APIs, file systems.',
      },
      {
        type: 'heading',
        level: 3,
        value: '3. Memory Systems',
      },
      {
        type: 'text',
        value: 'Give agents persistent memory across conversations. Short-term memory (conversation history) + long-term memory (stored facts, preferences, past decisions).',
      },
      {
        type: 'heading',
        level: 3,
        value: '4. Context Compression',
      },
      {
        type: 'text',
        value: 'Summarize long documents before injecting them. Use map-reduce patterns to process large datasets into digestible context.',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'CCCEFI + Context Engineering',
        text: 'Your CCCEFI framework maps directly to context engineering. Context → background data retrieval. Constraints → context window management. Clarity → precise tool descriptions. Examples → few-shot samples in the system prompt. Format → structured output schemas. Instructions → the agent\'s goal.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 7.5: Building Your First Agent Workflow
  // ==========================================================================
  {
    id: 'lesson-7-5',
    moduleId: 'module-7',
    title: 'Building Your First Agent Workflow',
    estimatedTime: 5,
    order: 5,
    xpReward: 30,
    content: [
      {
        type: 'text',
        value: 'Let\'s bring everything together. You\'ll design an agent workflow that combines MCP tools, prompt engineering, and context engineering.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Scenario: The Code Review Agent',
      },
      {
        type: 'text',
        value: 'You\'re building an agent that automatically reviews pull requests. It needs to:',
      },
      {
        type: 'list',
        items: [
          'Read the PR diff from GitHub',
          'Understand the codebase context from relevant files',
          'Check for common issues (security, performance, style)',
          'Post a structured review comment',
        ],
        ordered: true,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Step 1: Define the System Prompt',
      },
      {
        type: 'text',
        value: 'The system prompt defines the agent\'s personality, role, and behavioral rules. This is where your CCCEFI skills shine:',
      },
      {
        type: 'code',
        language: 'text',
        code: `You are a senior code reviewer for a TypeScript/React codebase.

[Context] You review PRs on the "prompt-temple" repository.
The codebase uses Next.js 15, Tailwind CSS, and follows
the existing pharaonic design system.

[Constraints]
- Only comment on actual issues, not style preferences
- Maximum 5 review comments per PR
- Be constructive, not critical

[Format] For each issue found:
  - File and line number
  - Severity: 🔴 Critical | 🟡 Warning | 🔵 Suggestion
  - What's wrong and why
  - Suggested fix with code example

[Instructions] Review the provided PR diff. Use the
read_file tool to check surrounding context when needed.
Post your review using the create_review tool.`,
        caption: 'A well-structured agent system prompt using CCCEFI principles',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Step 2: Define the Tool Set',
      },
      {
        type: 'text',
        value: 'The agent needs these MCP tools:',
      },
      {
        type: 'list',
        items: [
          'get_pr_diff — Fetches the PR diff from GitHub',
          'read_file — Reads file contents for context',
          'search_codebase — Searches for patterns in the codebase',
          'create_review — Posts the review comment to GitHub',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'Step 3: Design the Agent Loop',
      },
      {
        type: 'code',
        language: 'text',
        code: `Agent Workflow:

  1. OBSERVE: Call get_pr_diff() → read the changes
  2. THINK:   Identify files changed, assess scope
  3. ACT:     Call read_file() for each changed file's context
  4. THINK:   Analyze changes against best practices
  5. ACT:     Call search_codebase() to check for similar patterns
  6. THINK:   Formulate review comments (max 5)
  7. ACT:     Call create_review() with structured feedback
  8. DONE:    Report summary to user`,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Step 4: Handle Edge Cases',
      },
      {
        type: 'text',
        value: 'Good agent design anticipates failure:',
      },
      {
        type: 'list',
        items: [
          'What if the PR is too large? → Summarize first, review key files',
          'What if a tool call fails? → Retry once, then skip with a note',
          'What if no issues are found? → Post a "looks good" approval',
          'What if there are security issues? → Escalate with 🔴 Critical flag',
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'The Prompt Temple MCP Library',
        text: 'Visit the MCP Library (/mcp) in Prompt Temple to browse 125+ ready-made prompt templates for agent design, MCP server building, context engineering, and more. Each template includes variables you can customize for your use case.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Your Journey So Far',
      },
      {
        type: 'text',
        value: 'Let\'s recap the full path you\'ve traveled:',
      },
      {
        type: 'list',
        items: [
          'Module 1-2: Prompt foundations and the CCCEFI framework',
          'Module 3: Prompt types and when to use each',
          'Module 4: Multi-model orchestration',
          'Module 5: Advanced techniques (ToT, RAG, production patterns)',
          'Module 6: Capstone — production-grade prompt workflows',
          'Module 7 (this module): MCP, AI agents, and context engineering',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'What\'s Next?',
        text: 'You\'ve graduated from prompt engineer to agent designer. The MCP Library in Prompt Temple has 125+ templates to help you build real agents. The Knowledge Base has 49 expert articles on MCP, agentic AI, and production patterns. Start building!',
      },
    ],
  },
];
