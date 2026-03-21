/**
 * Module 23: The AI Tool Ecosystem — Quiz
 * 6 Questions | 70% Passing Score | 50 XP Reward
 */

import type { Quiz } from '../../types';

export const module23Quiz: Quiz = {
  id: 'quiz-module-23',
  moduleId: 'module-23',
  title: 'The Tool Ecosystem Trial',
  description: 'Test your understanding of MCP, n8n automation, Claude Cowork, and how the major AI tool ecosystem fits together.',
  passingScore: 70,
  xpReward: 50,
  questions: [
    {
      id: 'q-23-1',
      question: 'What is the best analogy for MCP (Model Context Protocol)?',
      type: 'multiple-choice',
      options: [
        'A search engine for AI models',
        'USB-C for AI — a universal standard that lets any AI connect to any tool through one protocol',
        'An AI model that is smarter than all others',
        'A security firewall that protects AI from hackers',
      ],
      correctAnswer: '1',
      explanation: 'MCP is like USB-C: before it existed, every AI-to-tool connection required a custom integration. MCP provides a universal standard so that any MCP-compatible AI can connect to any MCP server. Build one integration, and it works with every AI that supports the protocol.',
      points: 15,
    },
    {
      id: 'q-23-2',
      question: 'In the MCP architecture, what are the three main components?',
      type: 'multiple-choice',
      options: [
        'Database, API, and Frontend',
        'Input, Processing, and Output',
        'Host (the AI app), Client (the middleman), and Server (the tool/service)',
        'User, Admin, and Developer',
      ],
      correctAnswer: '2',
      explanation: 'MCP has three parts: the Host (your AI application, like Claude Desktop), the Client (the translator between AI and tools), and the Server (the actual tool or service that does the work, like Google Drive or Slack). Using the restaurant analogy: customer, waiter, and kitchen.',
      points: 15,
    },
    {
      id: 'q-23-3',
      question: 'What makes n8n different from other automation tools like Zapier?',
      type: 'multiple-choice',
      options: [
        'n8n only works with AI tools, while Zapier works with everything',
        'n8n is self-hostable, open-source, has AI-native integrations, and charges per workflow instead of per execution',
        'n8n requires advanced programming skills, while Zapier does not',
        'n8n is owned by Microsoft and integrates only with Office 365',
      ],
      correctAnswer: '1',
      explanation: 'n8n stands out because it is self-hostable (your data stays on your servers), open-source, has deep first-class AI integrations, and uses fair pricing (per workflow, not per execution). This combination makes it particularly powerful for AI-powered automation.',
      points: 15,
    },
    {
      id: 'q-23-4',
      question: 'What is "sandboxing" in the context of Claude Cowork?',
      type: 'multiple-choice',
      options: [
        'A game-like interface that makes AI fun to use',
        'A technique for training AI models on sandbox data',
        'An isolated, secure workspace where AI can read and create files without accessing anything outside the designated area',
        'A method for running multiple AI models simultaneously',
      ],
      correctAnswer: '2',
      explanation: 'Sandboxing gives AI a secure, isolated workspace — like a private office with only the relevant documents. The AI can work freely within the sandbox but cannot access files, systems, or data outside it. This addresses the biggest enterprise concern about AI: security and data control.',
      points: 20,
    },
    {
      id: 'q-23-5',
      question: 'What are the four components of every n8n workflow?',
      type: 'multiple-choice',
      options: [
        'Code, Test, Deploy, and Monitor',
        'Trigger, Nodes, Connections, and Output',
        'Input, AI Model, Database, and Report',
        'Start, Middle, End, and Review',
      ],
      correctAnswer: '1',
      explanation: 'Every n8n workflow has: a Trigger (what starts it — an email, a schedule, a webhook), Nodes (the processing steps), Connections (lines between nodes defining data flow), and Output (the final result — an email sent, a file created, etc.).',
      points: 15,
    },
    {
      id: 'q-23-6',
      question: 'How does Microsoft\'s approach to enterprise AI differ from Anthropic\'s?',
      type: 'multiple-choice',
      options: [
        'Microsoft uses open-source models while Anthropic uses proprietary ones',
        'Microsoft focuses on consumer products while Anthropic focuses on enterprise',
        'Microsoft embeds AI deeply into their own product suite (Office 365), while Anthropic uses open standards (MCP) to connect to any tool',
        'There is no difference — both companies have identical strategies',
      ],
      correctAnswer: '2',
      explanation: 'Microsoft\'s strategy ties AI to their existing ecosystem (Word, Excel, Teams, Outlook, SharePoint). Anthropic\'s approach uses the open MCP standard to be platform-agnostic, connecting to any tool regardless of vendor. The choice between them often depends on what tools your organization already uses.',
      points: 20,
    },
  ],
};
