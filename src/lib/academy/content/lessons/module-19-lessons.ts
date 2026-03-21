/**
 * Module 19: Native AI Agent Nodes in n8n
 * Duration: 25 minutes | 3 Lessons
 */

import type { Lesson } from '../../types';

export const module19Lessons: Lesson[] = [
  // ==========================================================================
  // LESSON 19.1: AI Agent Node Overview
  // ==========================================================================
  {
    id: 'lesson-19-1',
    moduleId: 'module-19',
    title: 'AI Agent Node Overview',
    estimatedTime: 8,
    order: 1,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'The AI Agent node is n8n\'s most powerful feature — a visual implementation of the ReAct (Reasoning + Acting) framework that turns LLMs from simple text generators into autonomous agents capable of using tools, maintaining memory, and completing multi-step tasks. Instead of hardcoding every step in your workflow, you give the agent a goal and the tools to achieve it, and it figures out the steps on its own.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The ReAct Framework',
      },
      {
        type: 'text',
        value: 'ReAct stands for Reasoning + Acting. It\'s an AI agent pattern where the LLM follows a loop: Think about the task, choose an Action (tool to call), Observe the result, then repeat until the task is complete. This is fundamentally different from a chain, where every step is predetermined.',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "react_loop": {\n    "step_1_think": "I need to find the customer\'s recent orders. Let me query the database.",\n    "step_2_act": "Call SQL tool: SELECT * FROM orders WHERE customer_id = 42 ORDER BY date DESC LIMIT 5",\n    "step_3_observe": "Found 5 orders. The most recent was placed yesterday for $129.99.",\n    "step_4_think": "Now I need to check if this order has shipped. Let me check the shipping API.",\n    "step_5_act": "Call HTTP tool: GET /api/shipping/status?order_id=1234",\n    "step_6_observe": "Order is in transit, expected delivery tomorrow.",\n    "step_7_respond": "Your most recent order (#1234) for $129.99 is currently in transit and should arrive tomorrow."\n  }\n}',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Agents vs Chains',
        text: 'A chain is like a recipe — every step is predetermined. An agent is like a chef — it knows the goal (make the customer happy) and has tools (kitchen equipment) but decides the steps dynamically based on what it discovers. Agents handle unexpected situations; chains break on them.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Tool Calling in n8n',
      },
      {
        type: 'text',
        value: 'The AI Agent node supports tool calling — the ability for the LLM to invoke specific functions during its reasoning process. In n8n, tools are connected as sub-nodes to the agent. Each tool has a name, description, and input schema that the LLM uses to decide when and how to call it.',
      },
      {
        type: 'list',
        items: [
          'Tools are connected to the Agent node via the "tools" input',
          'Each tool gets a name and description that the LLM reads to decide when to use it',
          'The agent can call multiple tools in sequence or even in parallel (with supported LLMs)',
          'Tool results are fed back into the agent\'s context for the next reasoning step',
          'You can limit the maximum number of tool calls per execution to prevent runaway loops',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Memory Types',
      },
      {
        type: 'text',
        value: 'Agents need memory to maintain context across interactions. n8n supports four memory types, each suited to different use cases:',
      },
      {
        type: 'list',
        items: [
          'Window Memory — Keeps the last N messages in context. Simple and effective for short conversations. Set window size to 10-20 messages for most use cases.',
          'Token Buffer Memory — Keeps messages up to a token limit. Better than window memory when message sizes vary significantly.',
          'Summary Memory — Uses an LLM to summarize older messages, keeping the summary plus recent messages. Best for long conversations where early context matters.',
          'Vector Store Memory — Stores all messages in a vector database and retrieves the most relevant ones. Best for agents that need to recall specific details from very long interaction histories.',
        ],
        ordered: false,
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Memory Best Practice',
        text: 'Start with Window Memory (size 10) for most agents. Only upgrade to Summary or Vector Store memory if your agents have long conversations where early context is critical. Each memory type adds latency and cost — simpler is usually better.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Agent Node Configuration',
      },
      {
        type: 'text',
        value: 'To set up an AI Agent node in n8n, you connect four types of sub-nodes: an LLM (required), tools (optional but usually needed), memory (optional), and an output parser (optional). The agent node itself has settings for the system prompt, max iterations, and return format. We\'ll build a complete agent in Lesson 19.3.',
      },
    ],
  },
  // ==========================================================================
  // LESSON 19.2: Built-in AI Tools
  // ==========================================================================
  {
    id: 'lesson-19-2',
    moduleId: 'module-19',
    title: 'Built-in AI Tools',
    estimatedTime: 8,
    order: 2,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'n8n ships with a rich set of built-in tools that you can connect to your AI Agent node out of the box. These tools cover the most common needs — from calculations and web requests to code execution and calling other workflows. Understanding what\'s available helps you build powerful agents without creating custom tools from scratch.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Calculator Tool',
      },
      {
        type: 'text',
        value: 'LLMs are notoriously bad at math. The Calculator tool solves this by giving your agent access to precise mathematical computation. When the agent needs to perform calculations — pricing, percentages, unit conversions — it delegates to the Calculator tool instead of attempting (and likely failing at) mental math.',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "tool": "Calculator",\n  "description": "Useful for performing mathematical calculations",\n  "example_usage": {\n    "agent_thought": "I need to calculate 15% discount on $1,249.99",\n    "tool_input": "1249.99 * 0.15",\n    "tool_output": "187.4985",\n    "agent_response": "The 15% discount would be $187.50, making the final price $1,062.49"\n  }\n}',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Code Tool',
      },
      {
        type: 'text',
        value: 'The Code tool lets your agent write and execute JavaScript or Python code on the fly. This is incredibly powerful — the agent can parse complex data structures, transform formats, generate files, or implement any custom logic it needs. The code runs in a sandboxed environment with access to the workflow context.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Code Tool Safety',
        text: 'The Code tool executes real code on your server. In production, always set a timeout limit and consider restricting network access if the agent doesn\'t need it. The code runs with the same permissions as the n8n process, so treat it like any server-side code execution.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'HTTP Request Tool',
      },
      {
        type: 'text',
        value: 'The HTTP Request tool gives your agent the ability to call any REST API. This effectively extends your agent\'s capabilities to any service with an API — even those without dedicated n8n nodes. The agent constructs the URL, headers, and body based on the API documentation you provide in the tool description.',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "tool": "HTTP Request",\n  "configuration": {\n    "method": "GET",\n    "url": "https://api.example.com/customers/{{customerId}}",\n    "headers": {\n      "Authorization": "Bearer {{$env.API_KEY}}"\n    },\n    "description": "Look up customer details by ID. Returns name, email, plan, and account status."\n  }\n}',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Wikipedia Tool',
      },
      {
        type: 'text',
        value: 'The Wikipedia tool lets your agent search and retrieve information from Wikipedia. It\'s useful for agents that need factual information, definitions, or background context. The tool searches for the most relevant article and returns a summary, giving the agent grounded factual information to work with.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Workflow Tool (Sub-workflow)',
      },
      {
        type: 'text',
        value: 'The Workflow tool is perhaps the most powerful built-in tool. It allows your agent to call another n8n workflow as a tool. This enables modular agent architectures — you build specialized workflows (send email, query database, generate report) and let the agent orchestrate them as needed.',
      },
      {
        type: 'list',
        items: [
          'Each sub-workflow becomes a tool with a name and description the agent can call',
          'Sub-workflows can contain any n8n nodes — databases, APIs, file operations, even other agents',
          'Input parameters are defined in the sub-workflow and passed by the agent',
          'Results from the sub-workflow are returned to the agent for further reasoning',
          'This pattern enables "agent swarms" where a coordinator agent delegates to specialist sub-agents',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Modular Agent Architecture',
        text: 'Build your workflows as small, focused tools. A "send email" workflow, a "query CRM" workflow, a "generate invoice" workflow. Then connect them all to a single coordinator agent. This pattern is easier to debug, test, and maintain than one massive monolithic workflow.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Other Built-in Tools',
      },
      {
        type: 'list',
        items: [
          'SerpAPI / Google Search — Let the agent search the web for current information',
          'Vector Store Tool — Query a vector database for semantic search (RAG)',
          'Read/Write File — Access the local filesystem for reading and writing files',
          'Postgres/MySQL/MongoDB — Direct database query tools for structured data access',
        ],
        ordered: false,
      },
    ],
  },
  // ==========================================================================
  // LESSON 19.3: Building a Complete AI Agent
  // ==========================================================================
  {
    id: 'lesson-19-3',
    moduleId: 'module-19',
    title: 'Building a Complete AI Agent',
    estimatedTime: 9,
    order: 3,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Now let\'s put everything together and build a complete AI agent in n8n — a customer support agent that can look up orders, check shipping status, process refunds, and escalate complex issues to a human. This walkthrough covers the full agent configuration from trigger to output.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Step 1: Define the Trigger',
      },
      {
        type: 'text',
        value: 'Every agent needs a trigger — the event that starts its execution. For a customer support agent, this is typically a webhook (from your chat widget), an email trigger, or the n8n Chat Trigger for testing. The Chat Trigger is perfect for development as it provides a built-in chat interface.',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "node": "Chat Trigger",\n  "parameters": {\n    "mode": "webhook",\n    "options": {\n      "allowedOrigins": "https://yourapp.com"\n    }\n  },\n  "notes": "Provides a chat interface at /webhook/chat for testing"\n}',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Step 2: Configure the AI Agent Node',
      },
      {
        type: 'text',
        value: 'Add an AI Agent node and configure its system prompt. The system prompt defines the agent\'s personality, capabilities, and boundaries. A well-crafted system prompt is the difference between a helpful agent and a chaotic one.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'You are a customer support agent for Acme Corp.\n\nYour capabilities:\n- Look up customer orders by email or order ID\n- Check shipping status for any order\n- Process refunds for orders under $100 (auto-approve)\n- Escalate refunds over $100 to a human manager\n\nRules:\n- Always verify the customer\'s identity before sharing order details\n- Never share internal system IDs or database details\n- Be friendly, concise, and helpful\n- If you cannot resolve an issue, escalate to a human with context\n\nCurrent date: {{ $now.format(\'yyyy-MM-dd\') }}',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'System Prompt Tips',
        text: 'Include explicit rules and boundaries in your system prompt. Agents without guardrails will try to be helpful in ways you don\'t expect — like sharing internal data or making promises you can\'t keep. The system prompt is your first line of defense.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Step 3: Connect the LLM',
      },
      {
        type: 'text',
        value: 'Connect an LLM sub-node to the agent. For tool-calling agents, use models that excel at function calling: GPT-4o, Claude 3.5 Sonnet, or Gemini 1.5 Pro. Configure the temperature to 0-0.3 for consistent, reliable responses in a support context.',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "node": "OpenAI Chat Model",\n  "parameters": {\n    "model": "gpt-4o",\n    "temperature": 0.1,\n    "maxTokens": 2048\n  },\n  "credentials": {\n    "openAiApi": "your-credential-name"\n  }\n}',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Step 4: Add Tools',
      },
      {
        type: 'text',
        value: 'Connect the tools your agent needs. For our support agent, we\'ll add four tools:',
      },
      {
        type: 'list',
        items: [
          'Workflow Tool: "lookup_orders" — Calls a sub-workflow that queries the orders database by customer email or order ID',
          'HTTP Request Tool: "check_shipping" — Calls the shipping carrier\'s API with the tracking number',
          'Workflow Tool: "process_refund" — Calls a sub-workflow that initiates refund processing with approval logic',
          'Workflow Tool: "escalate_to_human" — Creates a ticket in the support system and notifies the manager channel',
        ],
        ordered: true,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Step 5: Add Memory',
      },
      {
        type: 'text',
        value: 'Connect a Window Memory node to maintain conversation context. Set the window size to 10 messages (5 human + 5 AI). Use the session ID from the Chat Trigger to keep separate memory per customer conversation.',
      },
      {
        type: 'code',
        language: 'json',
        code: '{\n  "node": "Window Buffer Memory",\n  "parameters": {\n    "sessionKey": "={{ $json.sessionId }}",\n    "contextWindowLength": 10\n  }\n}',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Step 6: Output Parsing',
      },
      {
        type: 'text',
        value: 'Optionally, add a Structured Output Parser to ensure the agent\'s responses follow a consistent format. This is useful when you need to extract structured data (like refund amounts or escalation reasons) from the agent\'s output for downstream processing.',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Testing Your Agent',
        text: 'Use n8n\'s built-in Chat interface (click "Chat" on the Chat Trigger node) to test your agent interactively. Try edge cases: ask for an order that doesn\'t exist, request a refund over $100, ask something outside the agent\'s scope. Each failed test case is an opportunity to improve your system prompt or add guardrails.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Complete Architecture',
      },
      {
        type: 'text',
        value: 'Your finished agent has: a Chat Trigger for input, an AI Agent node with a system prompt, an LLM (GPT-4o), four tools (two workflow tools, one HTTP tool, one escalation tool), Window Memory for conversation context, and optionally a Structured Output Parser. This pattern — trigger, agent, LLM, tools, memory — is the foundation for every AI agent you\'ll build in n8n. The specific tools and prompts change, but the architecture stays the same.',
      },
    ],
  },
];
