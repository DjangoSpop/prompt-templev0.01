/**
 * Module 27: Enterprise Workflows & Competition — Quiz
 * 6 Questions | 70% Passing Score | 50 XP Reward
 */

import type { Quiz } from '../../types';

export const module27Quiz: Quiz = {
  id: 'quiz-module-27',
  moduleId: 'module-27',
  title: 'The Enterprise Strategy Trial',
  description: 'Test your knowledge of production Cowork workflows, Microsoft\'s competitive response, and the AI coworker decision framework.',
  passingScore: 70,
  xpReward: 50,
  questions: [
    {
      id: 'q-27-1',
      question: 'What is the fundamental pattern that all Cowork production workflows follow?',
      type: 'multiple-choice',
      options: [
        'Input → Transform → Output',
        'Trigger → Process → Route (something happens, Cowork analyzes/generates, results go to the right place)',
        'Request → Queue → Execute → Log',
        'Plan → Execute → Review → Iterate',
      ],
      correctAnswer: '1',
      explanation: 'Every Cowork production workflow follows the trigger-process-route pattern: a trigger event occurs (new file uploaded, deal stage changed, message received), Cowork processes it (reads, analyzes, generates), and routes the results to the right destination (Slack channel, Drive folder, CRM record). This pattern is the fundamental building block of all Cowork automation.',
      points: 15,
    },
    {
      id: 'q-27-2',
      question: 'When did Microsoft announce Copilot Cowork, and what major deal accompanied the announcement?',
      type: 'multiple-choice',
      options: [
        'January 2026, with a $10 billion OpenAI expansion',
        'February 2026, with an acquisition of Anthropic',
        'March 2026, with a $30 billion Anthropic Azure deal',
        'April 2026, with a $50 billion cloud infrastructure investment',
      ],
      correctAnswer: '2',
      explanation: 'Microsoft announced Copilot Cowork in March 2026, just two months after Anthropic launched Cowork. The announcement was paired with a $30 billion deal to bring Anthropic\'s Claude models to Azure. This dual strategy lets Microsoft compete with Cowork while also profiting from companies using Claude on their cloud.',
      points: 15,
    },
    {
      id: 'q-27-3',
      question: 'What is the key architectural difference between Claude Cowork and Microsoft Copilot Cowork?',
      type: 'multiple-choice',
      options: [
        'Cowork uses GPT models while Copilot Cowork uses Claude models',
        'Cowork is folder-based and local-first while Copilot Cowork is cloud-based and M365-native',
        'Cowork only works on Mac while Copilot Cowork only works on Windows',
        'Cowork is free and open-source while Copilot Cowork is proprietary',
      ],
      correctAnswer: '1',
      explanation: 'The fundamental architectural divide is local vs. cloud. Cowork uses folder-based sandboxing where projects live on your file system, giving you full data control and offline capability. Copilot Cowork runs entirely in the Microsoft cloud within your M365 tenant, offering zero-setup enterprise compliance but requiring Microsoft ecosystem commitment.',
      points: 20,
    },
    {
      id: 'q-27-4',
      question: 'In the contract review pipeline use case, what improvement did Cowork deliver for average time-to-first-review?',
      type: 'multiple-choice',
      options: [
        'From 1 week to 3 days',
        'From 3-5 business days to same day (contracts analyzed within 5 minutes of upload)',
        'From 2 weeks to 1 week',
        'No improvement in time, but better accuracy',
      ],
      correctAnswer: '1',
      explanation: 'Before Cowork, contracts sat in email attachments for days with manual triage by paralegals. Average time to first review was 3-5 business days. After implementing Cowork, contracts are automatically analyzed within 5 minutes of upload, risk-scored, and routed to the appropriate attorney — enabling same-day first reviews.',
      points: 15,
    },
    {
      id: 'q-27-5',
      question: 'Which AI coworker product is best suited for a 500+ employee company that is already deeply invested in the Microsoft 365 ecosystem?',
      type: 'multiple-choice',
      options: [
        'Claude Cowork — because it has the most connectors',
        'Manus — because it handles large-scale research best',
        'Microsoft Copilot Cowork — zero setup, built-in compliance, and native Teams integration',
        'OpenClaw — because it integrates with the most third-party tools',
      ],
      correctAnswer: '2',
      explanation: 'For large organizations already deep in the Microsoft ecosystem, Copilot Cowork is the natural choice. It requires zero setup for M365 customers, has enterprise admin controls built-in, offers seamless multi-user collaboration through Teams, and includes compliance and audit trails by default. The M365 license add-on pricing model also fits enterprise procurement.',
      points: 15,
    },
    {
      id: 'q-27-6',
      question: 'Why does Microsoft\'s $30 billion Azure deal with Anthropic represent a "hedge" strategy?',
      type: 'multiple-choice',
      options: [
        'It prevents Anthropic from partnering with Google Cloud',
        'It ensures Microsoft profits regardless of whether Copilot Cowork or Claude Cowork wins — they host Claude on Azure either way',
        'It gives Microsoft the right to acquire Anthropic in the future',
        'It forces Cowork users to pay Microsoft for cloud hosting',
      ],
      correctAnswer: '1',
      explanation: 'Microsoft is playing both sides of the AI coworker market. By building Copilot Cowork (a Cowork competitor) while also hosting Claude models on Azure (powering the competition), Microsoft ensures it captures value regardless of which product wins. If Copilot Cowork wins, great. If Cowork wins, Microsoft still profits from Azure hosting fees. It\'s similar to how Azure hosts competing databases.',
      points: 20,
    },
  ],
};
