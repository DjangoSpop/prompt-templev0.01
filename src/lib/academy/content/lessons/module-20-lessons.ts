/**
 * Module 20: MCP Integration in n8n
 * Duration: 25 minutes | 3 Lessons
 */

import type { Lesson } from '../../types';

export const module20Lessons: Lesson[] = [
  // ==========================================================================
  // LESSON 20.1: What is MCP (Model Context Protocol)
  // ==========================================================================
  {
    id: 'lesson-20-1',
    moduleId: 'module-20',
    title: 'What is MCP (Model Context Protocol)',
    estimatedTime: 8,
    order: 1,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Model Context Protocol (MCP) is an open standard created by Anthropic that defines how AI applications communicate with external tools and data sources. Think of MCP as the "USB-C of AI" — a universal connector that lets any AI client talk to any compatible server. Before MCP, every AI tool integration required custom code. MCP changes that with a standardized protocol that the entire industry is adopting.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Why MCP Matters',
      },
      {
        type: 'text',
        value: 'Without MCP, connecting an AI assistant to your tools requires building custom integrations for each combination of AI client and tool. If you have 5 AI clients and 10 tools, that\'s 50 custom integrations. With MCP, each tool exposes a single MCP server interface, and each AI client implements a single MCP client interface. Now those same 5 clients and 10 tools need only 15 implementations total — and any new client instantly works with all existing tools.',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "without_mcp": {\n    "ai_clients": ["Claude Desktop", "Cursor", "Windsurf", "Continue", "Custom App"],\n    "tools": ["Database", "Slack", "GitHub", "Calendar", "CRM"],\n    "integrations_needed": "5 clients x 5 tools = 25 custom integrations"\n  },\n  "with_mcp": {\n    "ai_clients": ["Claude Desktop", "Cursor", "Windsurf", "Continue", "Custom App"],\n    "tools": ["Database MCP Server", "Slack MCP Server", "GitHub MCP Server", "Calendar MCP Server", "CRM MCP Server"],\n    "integrations_needed": "5 client implementations + 5 server implementations = 10 total"\n  }\n}',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Industry Adoption',
        text: 'MCP has been adopted by Claude Desktop, Cursor, Windsurf, Continue, Zed, and dozens of other AI tools. Major companies including Block, Apollo, and Replit have built MCP servers. n8n is one of the first automation platforms with native MCP support — both as a server and client.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'MCP Architecture',
      },
      {
        type: 'text',
        value: 'MCP follows a client-server architecture with three core primitives that servers can expose to clients:',
      },
      {
        type: 'list',
        items: [
          'Tools — Functions that the AI can call to perform actions (e.g., "send_email", "query_database", "create_ticket"). Tools have typed input schemas and return results.',
          'Resources — Data sources the AI can read (e.g., file contents, database records, API responses). Resources provide context without executing actions.',
          'Prompts — Pre-built prompt templates that guide the AI for specific tasks. Prompts are reusable instructions optimized for particular workflows.',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Transport Mechanisms',
      },
      {
        type: 'text',
        value: 'MCP supports two transport mechanisms for communication between clients and servers:',
      },
      {
        type: 'list',
        items: [
          'stdio (Standard I/O) — The server runs as a local process, and the client communicates via stdin/stdout. Best for local tools like file system access or local databases. Low latency, no network required.',
          'SSE (Server-Sent Events) over HTTP — The server runs as a web service, and the client connects over HTTP. Best for remote servers, shared tools, and production deployments. This is what n8n uses for its MCP Server Trigger.',
        ],
        ordered: false,
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "mcp_message_example": {\n    "jsonrpc": "2.0",\n    "method": "tools/call",\n    "params": {\n      "name": "query_orders",\n      "arguments": {\n        "customer_email": "user@example.com",\n        "status": "shipped"\n      }\n    },\n    "id": 1\n  }\n}',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'n8n + MCP = Superpower',
        text: 'n8n\'s native MCP support means you can turn ANY of your 500+ node integrations into MCP tools accessible by Claude Desktop, Cursor, or any MCP client. Your n8n workflows become a universal tool library for every AI application in your stack.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'MCP in the n8n Ecosystem',
      },
      {
        type: 'text',
        value: 'n8n implements MCP in two directions. The MCP Server Trigger exposes your n8n workflows as MCP tools that external AI clients can call. The MCP Client node lets your n8n workflows consume external MCP servers, giving your AI agents access to tools provided by other systems. Together, these make n8n a central hub in any MCP-powered AI architecture.',
      },
    ],
  },
  // ==========================================================================
  // LESSON 20.2: MCP Server Trigger
  // ==========================================================================
  {
    id: 'lesson-20-2',
    moduleId: 'module-20',
    title: 'MCP Server Trigger — Exposing Workflows as Tools',
    estimatedTime: 9,
    order: 2,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'The MCP Server Trigger is one of n8n\'s most innovative features. It lets you expose any n8n workflow as an MCP tool that Claude Desktop, Cursor, or any MCP-compatible AI client can call. This means your entire automation library becomes instantly accessible to every AI tool in your stack — no custom integration code needed.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'How It Works',
      },
      {
        type: 'text',
        value: 'When you add an MCP Server Trigger to a workflow, n8n creates an SSE endpoint that speaks the MCP protocol. Any MCP client can connect to this endpoint, discover the available tools (your workflows), and call them with the appropriate parameters. The workflow executes, and the result is returned to the AI client.',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "node": "MCP Server Trigger",\n  "parameters": {\n    "path": "my-mcp-server",\n    "toolName": "query_customer_orders",\n    "toolDescription": "Look up customer orders by email address. Returns order IDs, dates, amounts, and shipping status.",\n    "inputSchema": {\n      "type": "object",\n      "properties": {\n        "customer_email": {\n          "type": "string",\n          "description": "The customer\'s email address"\n        },\n        "limit": {\n          "type": "number",\n          "description": "Maximum number of orders to return (default: 10)"\n        }\n      },\n      "required": ["customer_email"]\n    }\n  }\n}',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Tool Descriptions Are Critical',
        text: 'The AI client decides whether to use your tool based entirely on its name and description. Write clear, specific descriptions that explain what the tool does, what inputs it needs, and what it returns. Vague descriptions lead to the AI either not using the tool when it should, or using it incorrectly.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Connecting to Claude Desktop',
      },
      {
        type: 'text',
        value: 'To connect your n8n MCP server to Claude Desktop, add the server configuration to your Claude Desktop config file:',
      },
      {
        type: 'code',
        language: 'json',
        code: '// File: ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)\n// File: %APPDATA%/Claude/claude_desktop_config.json (Windows)\n\n{\n  "mcpServers": {\n    "n8n-tools": {\n      "url": "https://your-n8n-instance.com/mcp/my-mcp-server/sse",\n      "headers": {\n        "Authorization": "Bearer your-n8n-api-key"\n      }\n    }\n  }\n}',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Connecting to Cursor',
      },
      {
        type: 'text',
        value: 'Cursor (the AI code editor) also supports MCP. Add your n8n server to Cursor\'s MCP configuration:',
      },
      {
        type: 'code',
        language: 'json',
        code: '// File: .cursor/mcp.json (in your project root)\n\n{\n  "mcpServers": {\n    "n8n-tools": {\n      "url": "https://your-n8n-instance.com/mcp/my-mcp-server/sse",\n      "headers": {\n        "Authorization": "Bearer your-n8n-api-key"\n      }\n    }\n  }\n}',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Building the Workflow Behind the Trigger',
      },
      {
        type: 'text',
        value: 'After the MCP Server Trigger, you build a normal n8n workflow. The trigger provides the input parameters from the AI client, and your workflow processes them and returns a result. Here\'s a complete example:',
      },
      {
        type: 'list',
        items: [
          'MCP Server Trigger receives the tool call with parameters (e.g., customer_email)',
          'Postgres node queries the orders database using the email parameter',
          'Code node formats the results into a clean, readable response',
          'Respond to MCP node returns the formatted data to the AI client',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Practical Example',
        text: 'Imagine exposing a "deploy_to_staging" workflow as an MCP tool. Now in Cursor, you can say "deploy my changes to staging" and the AI editor calls your n8n workflow, which runs your CI/CD pipeline, and reports back the deployment status — all through natural language.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Security Considerations',
      },
      {
        type: 'text',
        value: 'Since MCP Server Triggers expose your workflows to external AI clients, security is critical. Always require authentication (API key or Bearer token). Validate all input parameters in your workflow before processing. Use n8n\'s credential system to manage API keys, and restrict the MCP endpoint to known IP addresses if possible. Never expose sensitive internal workflows without proper access controls.',
      },
    ],
  },
  // ==========================================================================
  // LESSON 20.3: MCP Client Node
  // ==========================================================================
  {
    id: 'lesson-20-3',
    moduleId: 'module-20',
    title: 'MCP Client Node — Consuming External MCP Servers',
    estimatedTime: 8,
    order: 3,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'While the MCP Server Trigger lets you expose n8n workflows to AI clients, the MCP Client node does the reverse — it lets your n8n workflows consume tools from external MCP servers. This means your AI agents can access any tool in the growing MCP ecosystem: file systems, databases, GitHub, Slack, Notion, and hundreds more.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'How the MCP Client Node Works',
      },
      {
        type: 'text',
        value: 'The MCP Client node connects to an external MCP server, discovers its available tools, and makes them callable from within your n8n workflow. When used with the AI Agent node, these external MCP tools become part of the agent\'s toolkit — the agent can decide when to call them based on the user\'s request.',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "node": "MCP Client",\n  "parameters": {\n    "sseEndpoint": "https://mcp-server.example.com/sse",\n    "authentication": {\n      "type": "bearer",\n      "token": "={{ $env.MCP_SERVER_TOKEN }}"\n    }\n  },\n  "connection": "Connect to AI Agent node as a tool"\n}',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Connecting to Popular MCP Servers',
      },
      {
        type: 'text',
        value: 'The MCP ecosystem is growing rapidly. Here are some of the most useful MCP servers you can connect to from n8n:',
      },
      {
        type: 'list',
        items: [
          'GitHub MCP Server — Read repos, create issues, manage PRs, search code directly from your AI agents',
          'Slack MCP Server — Send messages, read channels, manage users through MCP',
          'Filesystem MCP Server — Read, write, and manage files on the server where the MCP server runs',
          'PostgreSQL MCP Server — Query databases, inspect schemas, run migrations via MCP',
          'Brave Search MCP Server — Web search capabilities for your agents without API key management',
          'Notion MCP Server — Read and write Notion pages, databases, and blocks',
          'Memory MCP Server — Persistent knowledge graph memory for your agents',
        ],
        ordered: false,
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'MCP Server Registry',
        text: 'Check out mcp.so and the official Anthropic MCP servers repository on GitHub for a growing list of community and official MCP servers. New servers are published weekly as the ecosystem expands.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Using MCP Tools with AI Agents',
      },
      {
        type: 'text',
        value: 'The most powerful pattern is connecting MCP Client nodes as tools for your AI Agent node. The agent automatically discovers the tools provided by the MCP server and can call them during its ReAct reasoning loop.',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "workflow_structure": {\n    "trigger": "Chat Trigger",\n    "agent": {\n      "node": "AI Agent",\n      "llm": "Claude 3.5 Sonnet",\n      "tools": [\n        {\n          "type": "MCP Client",\n          "server": "GitHub MCP Server",\n          "available_tools": ["create_issue", "search_code", "create_pr"]\n        },\n        {\n          "type": "MCP Client",\n          "server": "Slack MCP Server",\n          "available_tools": ["send_message", "read_channel"]\n        },\n        {\n          "type": "Workflow Tool",\n          "name": "deploy_to_staging"\n        }\n      ],\n      "memory": "Window Buffer Memory"\n    }\n  }\n}',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Bi-Directional MCP: n8n as Hub',
      },
      {
        type: 'text',
        value: 'The real power emerges when you combine both MCP directions. n8n acts as a central hub: it consumes MCP tools from external servers (via MCP Client) and exposes its own workflows as MCP tools (via MCP Server Trigger). This creates a mesh architecture where every tool in your organization is accessible from every AI client.',
      },
      {
        type: 'list',
        items: [
          'Claude Desktop calls your n8n MCP Server to "process a customer refund"',
          'Your n8n workflow uses the MCP Client to call a Stripe MCP Server for payment processing',
          'The same workflow uses another MCP Client to call a Slack MCP Server to notify the team',
          'Results flow back through n8n to Claude Desktop — all through MCP',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'The MCP Advantage',
        text: 'With MCP, you build a tool once and it works everywhere. A workflow exposed via n8n\'s MCP Server Trigger is automatically available to Claude Desktop, Cursor, Windsurf, and any future MCP-compatible AI client — no additional integration work required.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Error Handling and Timeouts',
      },
      {
        type: 'text',
        value: 'When consuming external MCP servers, always configure timeout settings and error handling. MCP servers may be slow, unavailable, or return unexpected results. Use n8n\'s error handling nodes to catch failures, implement retry logic for transient errors, and provide fallback responses so your agents degrade gracefully when a tool is unavailable.',
      },
    ],
  },
];
