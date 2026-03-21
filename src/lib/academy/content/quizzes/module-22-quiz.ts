/**
 * Module 22: Understanding AI Agents — The Big Picture — Quiz
 * 6 Questions | 70% Passing Score | 50 XP Reward
 */

import type { Quiz } from '../../types';

export const module22Quiz: Quiz = {
  id: 'quiz-module-22',
  moduleId: 'module-22',
  title: 'The Big Picture Trial',
  description: 'Test your understanding of AI agents, the major AI companies, key concepts like LLMs and RAG, and the shift from chatbots to agents.',
  passingScore: 70,
  xpReward: 50,
  questions: [
    {
      id: 'q-22-1',
      question: 'What is the key difference between a chatbot and an AI agent?',
      type: 'multiple-choice',
      options: [
        'Agents are faster at generating text than chatbots',
        'Agents can plan, use tools, and take actions to complete tasks — not just respond to questions',
        'Agents use newer AI models while chatbots use older ones',
        'Agents only work in enterprise settings, while chatbots are for consumers',
      ],
      correctAnswer: '1',
      explanation: 'The defining difference is that AI agents can plan multi-step tasks, use external tools (like sending emails, querying databases, or browsing the web), and take actions autonomously. Chatbots are limited to generating text responses in a conversation.',
      points: 15,
    },
    {
      id: 'q-22-2',
      question: 'Which AI company is known for releasing open-source models that anyone can download and run?',
      type: 'multiple-choice',
      options: [
        'Anthropic with Claude',
        'OpenAI with GPT',
        'Meta with Llama',
        'Google with Gemini',
      ],
      correctAnswer: '2',
      explanation: 'Meta releases the Llama series of models as open-source, meaning anyone can download, modify, and run them on their own servers. This is a fundamentally different approach from Anthropic, OpenAI, and Google, which offer their frontier models as proprietary services.',
      points: 15,
    },
    {
      id: 'q-22-3',
      question: 'What is a "context window" in AI?',
      type: 'multiple-choice',
      options: [
        'The screen where you type your prompts',
        'The total amount of text an AI can process at one time — including your question, conversation history, and any documents shared',
        'The time period during which an AI remembers your previous conversations',
        'A security feature that limits what the AI can access',
      ],
      correctAnswer: '1',
      explanation: 'The context window is the AI\'s "working memory" — the total amount of text it can see at once. Think of it as desk space: a larger context window lets the AI work with more information simultaneously. Current models range from 128K tokens (GPT-4 Turbo) to over 1M tokens (Claude).',
      points: 15,
    },
    {
      id: 'q-22-4',
      question: 'What does RAG (Retrieval-Augmented Generation) do?',
      type: 'multiple-choice',
      options: [
        'It makes AI models run faster on mobile devices',
        'It lets AI search through your own documents before answering, reducing inaccurate responses',
        'It automatically translates AI responses into different languages',
        'It compresses AI models so they use less storage space',
      ],
      correctAnswer: '1',
      explanation: 'RAG lets an AI search through relevant documents (like a company handbook or knowledge base) before generating a response. Instead of relying purely on its training data, the AI cites real documents — like an employee checking the handbook before answering a policy question.',
      points: 20,
    },
    {
      id: 'q-22-5',
      question: 'Which statement best describes the "three waves of AI"?',
      type: 'multiple-choice',
      options: [
        'Wave 1: Image AI, Wave 2: Text AI, Wave 3: Video AI',
        'Wave 1: Chat (AI answers questions), Wave 2: Copilots (AI embedded in tools), Wave 3: Agents (AI takes independent action)',
        'Wave 1: Consumer AI, Wave 2: Business AI, Wave 3: Government AI',
        'Wave 1: English-only AI, Wave 2: Multilingual AI, Wave 3: Universal AI',
      ],
      correctAnswer: '1',
      explanation: 'The three waves are: Chat (2022-2023) where AI was a conversation partner, Copilots (2024) where AI was embedded in your existing tools, and Agents (2025-2026) where AI operates independently to accomplish goals using tools and planning.',
      points: 20,
    },
    {
      id: 'q-22-6',
      question: 'What is Microsoft\'s primary AI strategy?',
      type: 'multiple-choice',
      options: [
        'Building their own frontier AI models from scratch to compete with GPT and Claude',
        'Releasing open-source models to build a developer community',
        'Partnering with OpenAI and embedding AI (Copilot) across their existing products like Office 365, GitHub, and Azure',
        'Focusing exclusively on AI hardware and chip manufacturing',
      ],
      correctAnswer: '2',
      explanation: 'Microsoft\'s strategy is to partner with OpenAI for model capabilities and embed AI across their massive product ecosystem through Microsoft Copilot. This means AI in Word, Excel, PowerPoint, Teams, Outlook, GitHub, and Azure — meeting users where they already work.',
      points: 15,
    },
  ],
};
