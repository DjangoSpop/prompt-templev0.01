/**
 * Module 23: The AI Tool Ecosystem
 * Duration: 25 minutes | 3 Lessons
 */

import type { Lesson } from '../../types';

export const module23Lessons: Lesson[] = [
  // ==========================================================================
  // LESSON 23.1: MCP Explained Simply
  // ==========================================================================
  {
    id: 'lesson-23-1',
    moduleId: 'module-23',
    title: 'MCP Explained Simply',
    estimatedTime: 8,
    order: 1,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'One of the biggest breakthroughs in AI during 2024-2025 has a surprisingly boring name: Model Context Protocol, or MCP. But do not let the name fool you — MCP is the technology that turns chatbots into agents. It is the bridge between AI that can only talk and AI that can actually do things.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The USB-C Analogy',
      },
      {
        type: 'text',
        value: 'Remember when every phone had a different charger? Your Samsung needed one cable, your iPhone needed another, your tablet needed a third. Then USB-C came along and said: "One connector to rule them all." MCP does the same thing for AI. Before MCP, every AI tool needed a custom integration for every service it wanted to connect to. Want Claude to read your Google Drive? Custom code. Want it to check your calendar? Different custom code. Want it to query your database? Yet another custom integration.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'MCP = USB-C for AI',
        text: 'MCP is a universal standard that lets any AI model connect to any tool or data source through a single, consistent protocol. Build one MCP server for your tool, and every AI that supports MCP can use it. No more building separate integrations for ChatGPT, Claude, Gemini, and every other AI.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'How MCP Works (Without the Technical Details)',
      },
      {
        type: 'text',
        value: 'MCP has three parts, and they map perfectly to a restaurant analogy:',
      },
      {
        type: 'list',
        items: [
          'MCP Host (The Customer) — This is the AI application you are using, like Claude Desktop or a custom chatbot. It is the one making requests.',
          'MCP Client (The Waiter) — This is the middleman that translates between the AI and the tools. It takes the AI\'s request and delivers it to the right place.',
          'MCP Server (The Kitchen) — This is the actual tool or service that does the work — your Google Drive, Slack, database, or any other system. It receives requests and sends back results.',
        ],
        ordered: true,
      },
      {
        type: 'text',
        value: 'When you ask Claude to "find the latest sales report in Google Drive," here is what happens: Claude (the customer) tells the MCP client (the waiter) what it needs. The client talks to the Google Drive MCP server (the kitchen), which searches your Drive and returns the file. Claude then reads the file and answers your question. All of this happens in seconds, seamlessly.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What MCP Enables',
      },
      {
        type: 'list',
        items: [
          'Tool access — AI can use software tools: search the web, manage files, send messages, query databases',
          'Data access — AI can read from your private data sources: company documents, CRMs, analytics platforms',
          'Action execution — AI can take actions: create tickets, update spreadsheets, trigger workflows',
          'Cross-platform compatibility — One integration works with any MCP-compatible AI model',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Why MCP Changes Everything',
      },
      {
        type: 'text',
        value: 'Before MCP, connecting AI to your business tools required expensive custom development for each connection. A company that wanted AI to access 10 different tools needed 10 custom integrations. With MCP, those tools just need one MCP server each, and any AI can use all of them. This dramatically lowers the cost and complexity of building AI-powered workflows.',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'The Ecosystem is Growing Fast',
        text: 'As of early 2025, there are already hundreds of MCP servers available for popular tools: Google Workspace, Slack, GitHub, Notion, databases, file systems, web browsers, and more. Anthropic created MCP as an open standard, which means anyone can build MCP servers — and thousands of developers are doing exactly that.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Key Takeaway',
        text: 'MCP is the universal standard that lets AI connect to any tool or data source. It is what makes the "agentic" future possible — without it, AI would be stuck in the chat window forever. Think of it as the infrastructure layer that everything else is built on.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 23.2: n8n for Everyone
  // ==========================================================================
  {
    id: 'lesson-23-2',
    moduleId: 'module-23',
    title: 'n8n for Everyone',
    estimatedTime: 8,
    order: 2,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'What if you could build powerful AI automations without writing a single line of code? That is exactly what n8n (pronounced "n-eight-n") offers. It is a visual automation platform where you connect building blocks — called nodes — to create workflows that run automatically. Think of it as building with LEGO bricks, except each brick is a tool like Gmail, Slack, Google Sheets, or an AI model.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'No-Code vs. Low-Code: What Is the Difference?',
      },
      {
        type: 'text',
        value: 'You will hear these terms a lot in the automation world. Here is the simple breakdown:',
      },
      {
        type: 'list',
        items: [
          'No-Code — You build everything by dragging, dropping, and configuring visual elements. Zero programming required. Perfect for business users.',
          'Low-Code — Mostly visual, but you can add small bits of code for advanced customization. Great for power users who want more control.',
          'Full Code — Everything is written in programming languages. Maximum flexibility but requires developer skills.',
        ],
        ordered: false,
      },
      {
        type: 'text',
        value: 'n8n is a "low-code" platform — you can do 80% of what you need without any code, and the other 20% requires only simple snippets that AI can help you write. This makes it the perfect middle ground: accessible enough for beginners but powerful enough for complex business automation.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'How n8n Works: The Visual Approach',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Think Assembly Line',
        text: 'Imagine a factory assembly line. Raw materials enter at one end, pass through different stations (cutting, welding, painting, packaging), and a finished product comes out the other end. An n8n workflow is the same concept: data enters through a trigger, passes through processing nodes, and a result comes out.',
      },
      {
        type: 'text',
        value: 'Every n8n workflow has these components:',
      },
      {
        type: 'list',
        items: [
          'Trigger — What starts the workflow. Examples: a new email arrives, a form is submitted, a scheduled time is reached, a webhook is called.',
          'Nodes — The processing steps. Each node does one thing: read a document, call an AI model, update a spreadsheet, send a message.',
          'Connections — The lines between nodes that define the flow of data. Data from one node becomes the input for the next.',
          'Output — The final result: an email sent, a file created, a database updated, a notification delivered.',
        ],
        ordered: true,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Real Examples of What n8n Can Automate',
      },
      {
        type: 'text',
        value: 'Here are actual workflows that people build with n8n — no programming degree required:',
      },
      {
        type: 'list',
        items: [
          'Lead processing: When a new form submission arrives, AI qualifies the lead, enriches it with company data, scores it, and routes it to the right salesperson in your CRM',
          'Content creation: Every Monday morning, AI researches trending topics, writes three social media posts, creates image descriptions, and queues them in your scheduling tool',
          'Invoice processing: When an invoice PDF arrives via email, AI extracts the amounts and vendor info, matches it against purchase orders, and creates entries in your accounting software',
          'Meeting follow-up: After a calendar event ends, AI generates meeting notes from the transcript, extracts action items, creates tasks in your project manager, and emails a summary to all attendees',
          'Customer feedback: When a review is posted, AI analyzes sentiment, categorizes the feedback, and creates a support ticket if the sentiment is negative',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Why n8n Over Other Automation Tools?',
      },
      {
        type: 'text',
        value: 'You may have heard of Zapier or Make (formerly Integromat). n8n stands apart for several reasons:',
      },
      {
        type: 'list',
        items: [
          'Self-hostable — You can run n8n on your own servers, meaning your data never leaves your control. Critical for privacy-sensitive organizations.',
          'AI-native — n8n has deep, first-class integrations with AI models, vector databases, and agent tools. Other platforms bolted on AI support as an afterthought.',
          'Fair pricing — n8n charges per workflow, not per execution. Run a workflow 10 times or 10,000 times for the same price.',
          'Open source — The core of n8n is open source. You can inspect the code, modify it, and contribute improvements.',
        ],
        ordered: false,
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Key Takeaway',
        text: 'n8n is a visual automation platform that lets anyone build AI-powered workflows without writing code. It bridges the gap between having an idea for automation and actually making it work. Combined with AI models and MCP, it becomes the engine that powers practical AI agent systems.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 23.3: Claude Cowork & Enterprise AI
  // ==========================================================================
  {
    id: 'lesson-23-3',
    moduleId: 'module-23',
    title: 'Claude Cowork & Enterprise AI',
    estimatedTime: 9,
    order: 3,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'In May 2025, Anthropic launched something that fundamentally changed what AI assistants can do: Claude now has the ability to work with files, folders, and tools in a sandboxed computer environment. This capability — sometimes called "Cowork" — means Claude can go beyond chatting and actually perform work tasks in a secure, isolated workspace.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What Is Folder-Based Sandboxing?',
      },
      {
        type: 'text',
        value: 'Think of a sandbox as a secure playroom. When you share a folder or files with Claude, it gets its own isolated workspace where it can read, create, and modify files — but it cannot access anything outside that workspace. It is like giving an assistant a private office with exactly the documents they need, a computer to work on, and nothing else. They cannot wander into other departments or access systems they should not.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Why Sandboxing Matters',
        text: 'Sandboxing solves the biggest concern businesses have about AI: security. When Claude works inside a sandbox, it cannot accidentally access sensitive files, browse the open internet without permission, or make changes to systems outside its designated workspace. This makes it safe to give AI real work without worrying about unintended consequences.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What Claude Can Do in a Sandbox',
      },
      {
        type: 'list',
        items: [
          'Analyze spreadsheets and data files — Upload a CSV and ask Claude to find patterns, create charts, or generate reports',
          'Write and edit documents — Have Claude draft proposals, edit reports, or create presentations from raw notes',
          'Process multiple files — Give Claude a folder of invoices and ask it to extract key information into a summary spreadsheet',
          'Run code — Claude can write and execute Python scripts to perform data analysis, create visualizations, or automate calculations',
          'Create artifacts — Claude can produce new files: PDFs, images (via code), data exports, and formatted documents',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Connectors: Bringing AI to Your Tools',
      },
      {
        type: 'text',
        value: 'Claude\'s enterprise offering includes connectors that link directly to business tools. Instead of manually uploading files, Claude can connect to data sources where your information already lives:',
      },
      {
        type: 'list',
        items: [
          'Google Drive and Docs — Search and analyze documents across your organization',
          'Notion — Query wikis, databases, and project documentation',
          'Confluence and Jira — Access knowledge bases and project management data',
          'Salesforce — Pull customer data and generate account insights',
          'Internal databases — Query company data through secure connections',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Microsoft\'s Response: Copilot Studio and Cowork',
      },
      {
        type: 'text',
        value: 'Microsoft saw what Anthropic was building and responded with their own vision. Microsoft Copilot now includes similar capabilities through what they call "Copilot Cowork" — a system where AI agents work alongside you in the Microsoft 365 ecosystem. The key difference is the ecosystem: Anthropic\'s approach is platform-agnostic and works with any tool through MCP. Microsoft\'s approach is deeply tied to their product suite — Word, Excel, Teams, Outlook, and SharePoint.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'The Platform War',
        text: 'The battle between Anthropic, Microsoft, Google, and OpenAI is not just about which AI is smartest. It is about which platform becomes the operating system of work. Anthropic bets on open standards (MCP). Microsoft bets on their existing enterprise dominance. Google bets on their data and search infrastructure. Understanding these strategies helps you make better decisions about which tools to adopt.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What Enterprise AI Looks Like in Practice',
      },
      {
        type: 'text',
        value: 'Here is a realistic example of how a marketing manager might use enterprise AI in their daily workflow:',
      },
      {
        type: 'list',
        items: [
          'Morning: Claude analyzes overnight campaign performance data from Google Analytics and prepares a briefing document',
          'Mid-morning: Claude drafts three versions of an ad copy based on the top-performing themes, following brand guidelines stored in the company wiki',
          'Afternoon: Claude processes a folder of customer interview transcripts, extracting common themes and pain points into a structured report',
          'End of day: Claude generates a weekly summary for stakeholders, pulling metrics from the analytics connector and formatting them into a polished presentation',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'The Democratization of AI',
        text: 'The most exciting aspect of enterprise AI tools like Claude Cowork is that they do not require technical skills. A marketing manager, an HR director, or a finance analyst can all use these tools to dramatically increase their output — no IT department required.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Key Takeaway',
        text: 'Enterprise AI has evolved from "chat with AI" to "AI as a coworker." Tools like Claude Cowork and Microsoft Copilot give AI access to your real business data and tools in a secure, sandboxed environment. The platform you choose will shape your AI strategy for years — choose based on your existing ecosystem and integration needs.',
      },
    ],
  },
];
