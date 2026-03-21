/**
 * Module 19: Native AI Agent Nodes in n8n — Quiz
 * 6 Questions | 70% Passing Score | 50 XP Reward
 */

import type { Quiz } from '../../types';

export const module19Quiz: Quiz = {
  id: 'quiz-module-19',
  moduleId: 'module-19',
  title: 'The AI Agent Mastery Trial',
  description: 'Test your knowledge of n8n\'s native AI Agent nodes — the ReAct framework, tool calling, memory types, and building complete agent systems.',
  passingScore: 70,
  xpReward: 50,
  questions: [
    {
      id: 'q-19-1',
      question: 'What does ReAct stand for in the context of AI agents?',
      type: 'multiple-choice',
      options: [
        'Reactive Actions — agents that respond to events',
        'Reasoning + Acting — agents that think, use tools, observe, and iterate',
        'Real-time Active Computing — agents that process data in real-time',
        'Recursive Agent Chaining — agents that call other agents',
      ],
      correctAnswer: '1',
      explanation: 'ReAct stands for Reasoning + Acting. It\'s a framework where the AI agent follows a loop: Think about the task, choose an Action (tool to call), Observe the result, then repeat until the task is complete. This is fundamentally different from chains where every step is predetermined.',
      points: 15,
    },
    {
      id: 'q-19-2',
      question: 'What is the key difference between an AI agent and a chain?',
      type: 'multiple-choice',
      options: [
        'Agents are faster than chains',
        'Chains can use tools but agents cannot',
        'Agents decide their steps dynamically based on observations, while chains follow predetermined steps',
        'Agents can only use one LLM, while chains can use multiple LLMs',
      ],
      correctAnswer: '2',
      explanation: 'The key difference is autonomy. A chain is like a recipe with predetermined steps — every step runs regardless of the results. An agent is like a chef who decides the next step based on what it discovers. Agents dynamically choose which tools to call and in what order based on the task and intermediate results.',
      points: 15,
    },
    {
      id: 'q-19-3',
      question: 'Which memory type is best suited for very long conversations where the agent needs to recall specific details from early in the interaction?',
      type: 'multiple-choice',
      options: [
        'Window Memory — keeps the last N messages',
        'Token Buffer Memory — keeps messages up to a token limit',
        'Summary Memory — summarizes older messages',
        'Vector Store Memory — stores messages in a vector database and retrieves by relevance',
      ],
      correctAnswer: '3',
      explanation: 'Vector Store Memory is best for very long conversations where specific details from early interactions matter. It stores all messages as vector embeddings in a database and retrieves the most relevant ones based on the current context. Window and Token Buffer memory lose old messages, and Summary memory condenses details.',
      points: 20,
    },
    {
      id: 'q-19-4',
      question: 'What is the Workflow Tool in n8n used for?',
      type: 'multiple-choice',
      options: [
        'To manage n8n workflow versions and deployments',
        'To allow an AI agent to call another n8n workflow as a tool, enabling modular agent architectures',
        'To schedule workflows to run at specific times',
        'To export workflows as JSON for backup purposes',
      ],
      correctAnswer: '1',
      explanation: 'The Workflow Tool lets an AI agent call another n8n workflow as a tool during its reasoning process. This enables modular agent architectures — you build specialized workflows (send email, query database, generate report) as separate tools, and the agent orchestrates them as needed. This pattern enables "agent swarms" where a coordinator agent delegates to specialist sub-agents.',
      points: 20,
    },
    {
      id: 'q-19-5',
      question: 'Why are LLMs given a Calculator tool despite being able to process numbers in their training data?',
      type: 'multiple-choice',
      options: [
        'Calculator tools are faster than LLM computation',
        'LLMs are notoriously unreliable at mathematical calculations and need a dedicated tool for precision',
        'LLMs cannot process any numbers at all',
        'Calculator tools are required by the ReAct framework specification',
      ],
      correctAnswer: '1',
      explanation: 'LLMs are notoriously bad at math. They can approximate simple arithmetic but frequently make errors on multi-step calculations, percentages, and large numbers. The Calculator tool provides precise mathematical computation, ensuring accurate results when the agent needs to calculate prices, discounts, conversions, or any other numerical operation.',
      points: 15,
    },
    {
      id: 'q-19-6',
      question: 'What temperature setting is recommended for AI agents in a customer support context?',
      type: 'multiple-choice',
      options: [
        '0.7-1.0 for creative and varied responses',
        '0-0.3 for consistent and reliable responses',
        '0.5 as a universal default for all use cases',
        'Temperature does not affect agent behavior',
      ],
      correctAnswer: '1',
      explanation: 'For customer support and other production agent use cases, a low temperature (0-0.3) is recommended. Lower temperature produces more consistent, reliable, and predictable responses. Higher temperatures introduce randomness that can lead to inconsistent answers, hallucinations, or unprofessional tone — all undesirable in a support context.',
      points: 15,
    },
  ],
};
