/**
 * Module 25: Introduction to Claude Cowork — Quiz
 * 6 Questions | 70% Passing Score | 50 XP Reward
 */

import type { Quiz } from '../../types';

export const module25Quiz: Quiz = {
  id: 'quiz-module-25',
  moduleId: 'module-25',
  title: 'The Cowork Origins Trial',
  description: 'Test your knowledge of Claude Cowork\'s launch, architecture, sandboxing model, and the market impact that shook enterprise software.',
  passingScore: 70,
  xpReward: 50,
  questions: [
    {
      id: 'q-25-1',
      question: 'How long did it take Anthropic to build the core Claude Cowork product?',
      type: 'multiple-choice',
      options: [
        '6 months with a large engineering team',
        '3 months using traditional development',
        '1.5 weeks using Claude Code',
        '1 year of incremental development',
      ],
      correctAnswer: '2',
      explanation: 'Claude Cowork was built in just 1.5 weeks using Claude Code — Anthropic\'s own AI coding tool. This rapid development timeline was a key factor in the market panic, as investors realized AI-assisted development could compress years of enterprise software development into days.',
      points: 15,
    },
    {
      id: 'q-25-2',
      question: 'What is the fundamental architectural principle behind Cowork\'s sandboxing model?',
      type: 'multiple-choice',
      options: [
        'Cloud-based virtual machines that isolate each user',
        'Folder-based sandboxing where each project is a local folder with defined boundaries',
        'Browser-based containers that run in isolated tabs',
        'Docker containers that spin up for each task',
      ],
      correctAnswer: '1',
      explanation: 'Cowork uses folder-based sandboxing. Every project is a folder on your machine, and Cowork can only operate within that folder\'s boundaries. This provides security through simplicity — Cowork cannot access files outside the designated project folder without explicit permission.',
      points: 15,
    },
    {
      id: 'q-25-3',
      question: 'How much market capitalization was wiped from enterprise software companies after the Cowork announcement?',
      type: 'multiple-choice',
      options: [
        '$50 billion across 3 companies',
        '$150 billion from Salesforce alone',
        '$285 billion across CRM, workflow, and HR/finance companies',
        '$500 billion across the entire tech sector',
      ],
      correctAnswer: '2',
      explanation: '$285 billion in market capitalization was wiped from enterprise software companies over two trading days. The selloff was concentrated in CRM (Salesforce -18%), workflow automation (ServiceNow -22%), and HR/finance (Workday -15%) — companies whose core workflows Cowork\'s connectors could replicate.',
      points: 20,
    },
    {
      id: 'q-25-4',
      question: 'Which of the following best describes the difference between a traditional AI chatbot and Claude Cowork?',
      type: 'multiple-choice',
      options: [
        'Cowork uses a more advanced language model with better reasoning',
        'Cowork operates on real work artifacts in real systems rather than simulating conversation about work',
        'Cowork has a better user interface with more design features',
        'Cowork can access the internet while chatbots cannot',
      ],
      correctAnswer: '1',
      explanation: 'The fundamental shift is that Cowork operates on real work artifacts — reading documents, writing files, updating CRM records, managing contracts — rather than just answering questions about work. Chatbots require manual copy-paste; Cowork reads from and writes to your actual systems.',
      points: 15,
    },
    {
      id: 'q-25-5',
      question: 'What is the purpose of the cowork.config.json file in a Cowork project?',
      type: 'multiple-choice',
      options: [
        'It stores the AI model weights for offline usage',
        'It defines sandbox boundaries, connector permissions, and workflow rules in a human-readable format',
        'It contains encrypted authentication tokens for all connected services',
        'It logs all of Cowork\'s actions for compliance auditing',
      ],
      correctAnswer: '1',
      explanation: 'The cowork.config.json file defines the project\'s sandbox boundaries (which paths are writable vs. read-only), connector permissions (which services are enabled and what scopes they have), and approval rules (which actions require confirmation). It\'s human-readable and version-controllable.',
      points: 20,
    },
    {
      id: 'q-25-6',
      question: 'Why did DocuSign\'s stock partially recover after the initial selloff, unlike Salesforce and ServiceNow?',
      type: 'multiple-choice',
      options: [
        'DocuSign announced their own AI coworker product',
        'DocuSign is a platform Cowork connects TO rather than replaces, meaning Cowork increases DocuSign usage',
        'DocuSign\'s market cap was too small to be significantly affected',
        'DocuSign signed an exclusive partnership with Anthropic',
      ],
      correctAnswer: '1',
      explanation: 'DocuSign recovered because investors realized Cowork uses DocuSign as a connector — it connects TO DocuSign to manage contracts and signatures, which actually increases DocuSign usage. Companies whose UI/workflow Cowork replaces (like Salesforce\'s CRM interface) face existential risk, but companies that Cowork integrates with may benefit.',
      points: 15,
    },
  ],
};
