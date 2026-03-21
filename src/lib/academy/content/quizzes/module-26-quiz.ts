/**
 * Module 26: Connectors & Integrations — Quiz
 * 6 Questions | 70% Passing Score | 50 XP Reward
 */

import type { Quiz } from '../../types';

export const module26Quiz: Quiz = {
  id: 'quiz-module-26',
  moduleId: 'module-26',
  title: 'The Connectors Trial',
  description: 'Test your knowledge of Cowork\'s connector architecture, Google Drive and Slack integrations, enterprise connectors, and the custom plugin system.',
  passingScore: 70,
  xpReward: 50,
  questions: [
    {
      id: 'q-26-1',
      question: 'What are the three layers of Cowork\'s connector architecture?',
      type: 'multiple-choice',
      options: [
        'Input, Processing, Output',
        'Authentication (OAuth 2.0), Schema Mapping, and Action Handlers',
        'Connection, Execution, Logging',
        'Request, Transform, Response',
      ],
      correctAnswer: '1',
      explanation: 'Every Cowork connector follows a three-layer architecture: Authentication (OAuth 2.0 for secure access), Schema Mapping (translating external data into Cowork\'s internal format), and Action Handlers (executing read/write operations on the external service). This standardized architecture is what allowed Anthropic to build connectors rapidly.',
      points: 15,
    },
    {
      id: 'q-26-2',
      question: 'What is the recommended approach when first setting up the Google Drive and Slack connectors?',
      type: 'multiple-choice',
      options: [
        'Enable full read/write access immediately to maximize productivity',
        'Start with read-only permissions and grant write access after auditing Cowork\'s judgment',
        'Only use the connectors in offline mode until fully tested',
        'Create a separate Google/Slack account specifically for Cowork',
      ],
      correctAnswer: '1',
      explanation: 'The recommended approach is to start with read-only permissions on both connectors. This lets Cowork prove its value by summarizing and organizing before you grant write access. It builds team trust and lets you audit Cowork\'s judgment before giving it the ability to post messages or modify documents.',
      points: 15,
    },
    {
      id: 'q-26-3',
      question: 'How does Cowork\'s Salesforce connector threaten Salesforce\'s business model?',
      type: 'multiple-choice',
      options: [
        'It stores CRM data in a competing cloud service',
        'It allows users to read, update, and report on CRM data without ever opening the Salesforce UI, questioning the value of the $300/user/month platform fee',
        'It migrates all Salesforce data to Google Sheets',
        'It blocks Salesforce from accessing its own API',
      ],
      correctAnswer: '1',
      explanation: 'The Salesforce connector gives Cowork read/write access to CRM data — contacts, opportunities, cases, and custom objects — all without anyone opening the Salesforce UI. This raised the fundamental question: if an AI coworker can manage pipelines, log activities, and generate reports directly, what justifies Salesforce\'s premium pricing?',
      points: 20,
    },
    {
      id: 'q-26-4',
      question: 'In the DocuSign connector workflow, what happens when a contract stalls without a signature?',
      type: 'multiple-choice',
      options: [
        'The contract is automatically cancelled and archived',
        'Cowork resends the contract with a discount offer',
        'Cowork tracks signing status and can escalate after a configured time period (e.g., 48 hours)',
        'The connector disconnects and requires manual re-authentication',
      ],
      correctAnswer: '2',
      explanation: 'The DocuSign connector includes status tracking that monitors whether contracts are pending, viewed, partially signed, or completed. When configured with an escalation timer (e.g., "escalate_after": "48h"), Cowork automatically alerts the appropriate team when contracts stall, preventing deals from dying in the signature queue.',
      points: 15,
    },
    {
      id: 'q-26-5',
      question: 'What is the recommended approach for writing plugin handler logic in Cowork?',
      type: 'multiple-choice',
      options: [
        'Write comprehensive business logic with hundreds of conditional rules',
        'Use "thin wrappers" — focus plugin code on I/O while delegating analysis and judgment to the AI layer via context.ai',
        'Avoid using AI capabilities inside plugins for performance reasons',
        'Copy logic from existing enterprise software and translate it to TypeScript',
      ],
      correctAnswer: '1',
      explanation: 'The most powerful Cowork plugins are "thin wrappers" around AI instructions. Instead of writing hundreds of lines of business logic, you write clear instructions and let Claude handle the judgment. Plugin code should focus on I/O (reading files, calling APIs, writing outputs) while the context.ai interface handles analysis and decision-making.',
      points: 20,
    },
    {
      id: 'q-26-6',
      question: 'What are the five steps for building a Cowork plugin?',
      type: 'multiple-choice',
      options: [
        'Design, Code, Test, Deploy, Monitor',
        'Create /plugins/ directory, write plugin.json manifest, write handler functions, register in cowork.config.json, test with sample inputs',
        'Fork the SDK, modify source code, compile, install, restart Cowork',
        'Request API access, write documentation, submit for review, wait for approval, deploy',
      ],
      correctAnswer: '1',
      explanation: 'Building a Cowork plugin involves: (1) creating a /plugins/ directory in your project folder, (2) writing a plugin.json manifest defining capabilities/inputs/outputs, (3) writing handler functions for each capability, (4) registering the plugin in cowork.config.json, and (5) testing with sample inputs before deploying to your team.',
      points: 15,
    },
  ],
};
