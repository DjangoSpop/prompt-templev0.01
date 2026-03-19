/**
 * Module 7: MCP & AI Agents — Quiz
 * 8 questions | Passing score: 70%
 */

import type { Quiz } from '../../types';

export const module7Quiz: Quiz = {
  id: 'quiz-module-7',
  moduleId: 'module-7',
  title: 'MCP & AI Agents Quiz',
  description: 'Test your understanding of MCP, AI agents, and context engineering',
  passingScore: 70,
  xpReward: 75,
  questions: [
    {
      id: 'q-7-1',
      question: 'What is the best analogy for the Model Context Protocol (MCP)?',
      type: 'multiple-choice',
      options: [
        'A programming language for AI',
        'USB for AI — a universal standard to connect any AI model to any tool or data source',
        'A chatbot framework',
        'A replacement for prompt engineering',
      ],
      correctAnswer: '1',
      explanation: 'MCP is like USB for AI. Just as USB created one standard port for all peripherals, MCP creates one protocol for connecting AI models to any tool, data source, or capability. Before MCP, every integration was custom-built.',
      points: 12,
    },
    {
      id: 'q-7-2',
      question: 'What are the three types of capabilities an MCP server can expose?',
      type: 'multiple-choice',
      options: [
        'Input, Output, and Storage',
        'Tools, Resources, and Prompts',
        'Read, Write, and Execute',
        'Models, Datasets, and APIs',
      ],
      correctAnswer: '1',
      explanation: 'MCP servers expose three capability types: Tools (functions the AI can call), Resources (data the AI can read), and Prompts (pre-built templates the AI can use). This covers the full range of AI-to-system interaction.',
      points: 12,
    },
    {
      id: 'q-7-3',
      question: 'What is the key difference between a chatbot and an AI agent?',
      type: 'multiple-choice',
      options: [
        'Agents use bigger models',
        'A chatbot responds to messages; an agent autonomously plans, uses tools, and takes actions to achieve goals',
        'Agents are always more expensive',
        'There is no real difference',
      ],
      correctAnswer: '1',
      explanation: 'The fundamental difference is autonomy and action. A chatbot generates text responses. An agent can plan a sequence of steps, decide which tools to use, execute actions (file I/O, API calls, database queries), evaluate results, and iterate until the goal is achieved.',
      points: 12,
    },
    {
      id: 'q-7-4',
      question: 'In the agent loop pattern, what are the four steps in order?',
      type: 'multiple-choice',
      options: [
        'Plan → Execute → Report → Exit',
        'Observe → Think → Act → Evaluate',
        'Input → Process → Output → Store',
        'Read → Parse → Transform → Write',
      ],
      correctAnswer: '1',
      explanation: 'The core agent loop is: Observe (read current state and inputs), Think (use the LLM to reason about what to do next), Act (call a tool or produce output), Evaluate (check if the goal is met, loop back if not). This loop repeats until the task is complete.',
      points: 12,
    },
    {
      id: 'q-7-5',
      question: 'What two transport modes does MCP support?',
      type: 'multiple-choice',
      options: [
        'HTTP and WebSocket',
        'stdio (Standard I/O) and SSE (Server-Sent Events)',
        'gRPC and REST',
        'TCP and UDP',
      ],
      correctAnswer: '1',
      explanation: 'MCP supports stdio (the host launches the server as a local subprocess and communicates via stdin/stdout) and SSE (the server runs remotely over HTTP with Server-Sent Events). stdio is best for local tools; SSE is best for remote/shared services.',
      points: 12,
    },
    {
      id: 'q-7-6',
      question: 'What is context engineering?',
      type: 'multiple-choice',
      options: [
        'Writing longer prompts',
        'The art of assembling the right information for an AI at the right time — including retrieved docs, tool results, and conversation history',
        'Training AI models on more data',
        'A new programming paradigm',
      ],
      correctAnswer: '1',
      explanation: 'Context engineering goes beyond prompt engineering. While prompt engineering focuses on the instruction, context engineering focuses on the full information package: system prompts, retrieved documents, tool results, conversation history, and metadata. The challenge is selecting and ordering the right context within the model\'s context window.',
      points: 12,
    },
    {
      id: 'q-7-7',
      question: 'What is the "Lost in the Middle" problem?',
      type: 'multiple-choice',
      options: [
        'AI models forget their training data',
        'Users lose track of their conversations',
        'LLMs pay most attention to the beginning and end of the context window, and less to information in the middle',
        'MCP connections time out after too long',
      ],
      correctAnswer: '2',
      explanation: 'Research shows that LLMs exhibit a U-shaped attention pattern — they pay most attention to the beginning and end of the context window, while information in the middle gets less focus. This means context placement and ordering is as important as context selection.',
      points: 14,
    },
    {
      id: 'q-7-8',
      question: 'How does the CCCEFI framework apply to agent design?',
      type: 'multiple-choice',
      options: [
        'It doesn\'t — agents don\'t use prompts',
        'Context → data retrieval, Constraints → context management, Clarity → tool descriptions, Examples → few-shot in system prompt, Format → output schemas, Instructions → agent goals',
        'You only use the "I" (Instructions) for agents',
        'CCCEFI is replaced by a new agent framework',
      ],
      correctAnswer: '1',
      explanation: 'CCCEFI maps directly to agent design! Context becomes data retrieval strategy, Constraints become context window management, Clarity becomes precise tool descriptions, Examples become few-shot samples in the system prompt, Format becomes structured output schemas, and Instructions become the agent\'s goals. Everything you learned applies — you\'re just orchestrating tools now.',
      points: 14,
    },
  ],
};
