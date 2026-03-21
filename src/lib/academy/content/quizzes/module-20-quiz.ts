/**
 * Module 20: MCP Integration in n8n — Quiz
 * 6 Questions | 70% Passing Score | 50 XP Reward
 */

import type { Quiz } from '../../types';

export const module20Quiz: Quiz = {
  id: 'quiz-module-20',
  moduleId: 'module-20',
  title: 'The MCP Protocol Trial',
  description: 'Test your knowledge of the Model Context Protocol (MCP) — its architecture, n8n\'s MCP Server Trigger, MCP Client node, and how to build MCP-powered AI systems.',
  passingScore: 70,
  xpReward: 50,
  questions: [
    {
      id: 'q-20-1',
      question: 'What is the best analogy for MCP (Model Context Protocol)?',
      type: 'multiple-choice',
      options: [
        'A programming language for AI models',
        'The "USB-C of AI" — a universal connector between AI clients and tool servers',
        'A database protocol for storing AI training data',
        'A security standard for encrypting AI communications',
      ],
      correctAnswer: '1',
      explanation: 'MCP is best understood as the "USB-C of AI" — a universal, standardized connector that lets any AI client talk to any compatible server. Just as USB-C eliminated the need for different cables for each device, MCP eliminates the need for custom integrations between each AI client and tool combination.',
      points: 15,
    },
    {
      id: 'q-20-2',
      question: 'What are the three core primitives that MCP servers can expose to clients?',
      type: 'multiple-choice',
      options: [
        'Inputs, Outputs, and Logs',
        'Queries, Mutations, and Subscriptions',
        'Tools, Resources, and Prompts',
        'Endpoints, Schemas, and Responses',
      ],
      correctAnswer: '2',
      explanation: 'MCP servers expose three core primitives: Tools (functions the AI can call to perform actions), Resources (data sources the AI can read for context), and Prompts (pre-built prompt templates for specific tasks). Together, these primitives give AI clients everything they need to interact with external systems.',
      points: 15,
    },
    {
      id: 'q-20-3',
      question: 'What transport mechanism does n8n\'s MCP Server Trigger use?',
      type: 'multiple-choice',
      options: [
        'stdio (Standard I/O) — communicating via stdin/stdout',
        'WebSocket — bidirectional real-time communication',
        'SSE (Server-Sent Events) over HTTP — suitable for remote and production deployments',
        'gRPC — high-performance binary protocol',
      ],
      correctAnswer: '2',
      explanation: 'n8n\'s MCP Server Trigger uses SSE (Server-Sent Events) over HTTP as its transport mechanism. SSE is ideal for remote servers and production deployments because it works over standard HTTP, passes through firewalls and load balancers, and supports authentication headers. The stdio transport is used for local processes only.',
      points: 20,
    },
    {
      id: 'q-20-4',
      question: 'Which AI clients can connect to an n8n MCP Server Trigger?',
      type: 'multiple-choice',
      options: [
        'Only Claude Desktop',
        'Only Claude Desktop and Cursor',
        'Any MCP-compatible client including Claude Desktop, Cursor, Windsurf, and others',
        'Only n8n\'s own MCP Client node',
      ],
      correctAnswer: '2',
      explanation: 'Because MCP is an open standard, any MCP-compatible client can connect to an n8n MCP Server Trigger. This includes Claude Desktop, Cursor, Windsurf, Continue, Zed, and any future application that implements the MCP client protocol. This is the power of standardization — build once, use everywhere.',
      points: 15,
    },
    {
      id: 'q-20-5',
      question: 'What is the "bi-directional MCP" pattern in n8n?',
      type: 'multiple-choice',
      options: [
        'Sending MCP messages in both JSON and XML formats',
        'n8n acts as both MCP server (exposing workflows as tools) and MCP client (consuming external MCP servers)',
        'Running MCP over both HTTP and WebSocket simultaneously',
        'Having two n8n instances communicating with each other via MCP',
      ],
      correctAnswer: '1',
      explanation: 'The bi-directional MCP pattern means n8n acts as a central hub: it exposes its own workflows as MCP tools via the MCP Server Trigger (so Claude Desktop, Cursor, etc. can call them), AND it consumes external MCP servers via the MCP Client node (giving n8n agents access to GitHub, Slack, and other MCP tools). This creates a mesh architecture where every tool is accessible from every client.',
      points: 20,
    },
    {
      id: 'q-20-6',
      question: 'Why is the tool description critical when configuring an MCP Server Trigger?',
      type: 'multiple-choice',
      options: [
        'It determines the execution speed of the workflow',
        'The AI client uses the name and description to decide whether and how to use the tool',
        'It sets the authentication requirements for the endpoint',
        'It defines the maximum payload size for the tool',
      ],
      correctAnswer: '1',
      explanation: 'The tool name and description are critical because the AI client reads them to decide when and how to use the tool. A vague description like "does stuff with orders" will lead the AI to either ignore the tool or use it incorrectly. Clear, specific descriptions like "Look up customer orders by email address. Returns order IDs, dates, amounts, and shipping status" help the AI make accurate decisions.',
      points: 15,
    },
  ],
};
