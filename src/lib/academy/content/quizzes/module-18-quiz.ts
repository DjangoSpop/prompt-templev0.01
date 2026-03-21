/**
 * Module 18: n8n vs Zapier vs Make — Platform Comparison — Quiz
 * 6 Questions | 70% Passing Score | 50 XP Reward
 */

import type { Quiz } from '../../types';

export const module18Quiz: Quiz = {
  id: 'quiz-module-18',
  moduleId: 'module-18',
  title: 'The Platform Comparison Trial',
  description: 'Test your knowledge of n8n, Zapier, and Make — their differences in AI capabilities, pricing, self-hosting, and when to choose each platform.',
  passingScore: 70,
  xpReward: 50,
  questions: [
    {
      id: 'q-18-1',
      question: 'Which platform is the ONLY one that supports self-hosting on your own infrastructure?',
      type: 'multiple-choice',
      options: [
        'Zapier — with their Enterprise on-premise plan',
        'Make — with their EU data residency option',
        'n8n — via Docker, Kubernetes, or npm on any server',
        'All three platforms support self-hosting',
      ],
      correctAnswer: '2',
      explanation: 'n8n is the only platform among the three that supports self-hosting. You can deploy it via Docker, Kubernetes, or npm on any server or cloud provider. Zapier and Make are both cloud-only platforms. Make offers EU data residency but still runs on their infrastructure, not yours.',
      points: 15,
    },
    {
      id: 'q-18-2',
      question: 'Approximately how many community workflow templates does n8n have available?',
      type: 'multiple-choice',
      options: [
        'About 5,000 curated templates',
        'About 12,000 community templates',
        'About 72,000+ community workflow templates',
        'About 150,000 open-source templates',
      ],
      correctAnswer: '2',
      explanation: 'n8n has over 72,000 community-shared workflow templates available on n8n.io. This is a massive advantage over Zapier (~5,000 curated templates) and Make (~1,200 curated templates). These community templates include battle-tested patterns for RAG pipelines, agent systems, data processing, and more.',
      points: 15,
    },
    {
      id: 'q-18-3',
      question: 'Which platform has native AI Agent nodes with ReAct framework support?',
      type: 'multiple-choice',
      options: [
        'Zapier — through their AI Actions feature',
        'Make — through their OpenAI module',
        'n8n — through the dedicated AI Agent node',
        'All three platforms have native ReAct agent nodes',
      ],
      correctAnswer: '2',
      explanation: 'n8n is the only platform with a dedicated AI Agent node that implements the ReAct (Reasoning + Acting) framework. This node supports tool calling, multiple memory types, and output parsing natively. Zapier has a chatbot builder and Make has an OpenAI module, but neither implements a true agent loop with tool calling.',
      points: 20,
    },
    {
      id: 'q-18-4',
      question: 'Which platform has the largest number of native app integrations?',
      type: 'multiple-choice',
      options: [
        'n8n with 500+ built-in nodes',
        'Zapier with 6,000+ app integrations',
        'Make with 1,500+ app integrations',
        'They all have roughly the same number',
      ],
      correctAnswer: '1',
      explanation: 'Zapier leads in raw integration count with 6,000+ app integrations, followed by Make with 1,500+, and n8n with 500+ built-in nodes. However, n8n\'s HTTP Request node and code nodes can connect to any API, effectively giving it unlimited integration potential. For AI-specific workloads, n8n\'s native AI nodes are more important than raw app count.',
      points: 15,
    },
    {
      id: 'q-18-5',
      question: 'For a team running 150,000 AI workflow executions per month, approximately how much could they save annually by choosing n8n self-hosted over Zapier?',
      type: 'multiple-choice',
      options: [
        'About $500-1,000 per year',
        'About $2,000-3,000 per year',
        'About $6,000-7,000+ per year',
        'There is no significant cost difference',
      ],
      correctAnswer: '2',
      explanation: 'At 150,000 monthly executions, Zapier\'s Team Plan costs approximately $599/month while n8n self-hosted costs $20-40/month for server hosting with unlimited executions. This translates to approximately $6,700-7,100+ in annual savings. The cost advantage of self-hosted n8n grows even more dramatically at higher execution volumes.',
      points: 20,
    },
    {
      id: 'q-18-6',
      question: 'Which platform has native MCP (Model Context Protocol) support?',
      type: 'multiple-choice',
      options: [
        'Zapier — as an MCP client only',
        'Make — as an MCP server only',
        'n8n — both as MCP server (trigger) and MCP client (node)',
        'None of the three platforms support MCP yet',
      ],
      correctAnswer: '2',
      explanation: 'n8n is one of the first automation platforms with native MCP support in both directions: the MCP Server Trigger exposes n8n workflows as tools for AI clients like Claude Desktop, and the MCP Client node lets n8n workflows consume tools from external MCP servers. Neither Zapier nor Make currently offer MCP support.',
      points: 15,
    },
  ],
};
