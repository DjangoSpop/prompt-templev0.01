/**
 * Module 11: AI Agent Chatbot with Long-Term Memory — Quiz
 * 6 Questions | 70% Passing Score | 50 XP Reward
 */

import type { Quiz } from '../../types';

export const module11Quiz: Quiz = {
  id: 'quiz-module-11',
  moduleId: 'module-11',
  title: 'The Memory Agent Trial',
  description: 'Test your knowledge of AI agent chatbots with short-term and long-term memory systems.',
  passingScore: 70,
  xpReward: 50,
  questions: [
    {
      id: 'q-11-1',
      question: 'What is the key difference between a traditional chatbot and an AI agent?',
      type: 'multiple-choice',
      options: [
        'AI agents are faster at generating responses',
        'AI agents can reason about actions, call tools, and adapt behavior autonomously',
        'AI agents only work with Telegram',
        'AI agents don\'t need an internet connection',
      ],
      correctAnswer: '1',
      explanation: 'AI agents use the ReAct (Reasoning + Acting) framework to autonomously decide what actions to take. They can reason about a situation, call tools to interact with external systems, observe results, and adapt — unlike traditional chatbots that follow scripted flows.',
      points: 15,
    },
    {
      id: 'q-11-2',
      question: 'What does the Window Buffer Memory with windowSize: 10 do?',
      type: 'multiple-choice',
      options: [
        'Stores all messages forever in a database',
        'Keeps the last 10 message pairs in memory and drops older ones',
        'Limits the response to 10 words',
        'Creates 10 separate conversation threads',
      ],
      correctAnswer: '1',
      explanation: 'The Window Buffer Memory maintains a sliding window of the most recent N message pairs (user + assistant). With windowSize: 10, it keeps the last 10 exchanges for context. As new messages arrive, the oldest ones are dropped from the buffer.',
      points: 15,
    },
    {
      id: 'q-11-3',
      question: 'In the ReAct framework, what is the correct sequence the agent follows?',
      type: 'multiple-choice',
      options: [
        'Act → Think → Respond',
        'Thought → Action → Observation → (repeat or respond)',
        'Observe → Plan → Execute → Report',
        'Input → Process → Output',
      ],
      correctAnswer: '1',
      explanation: 'ReAct stands for Reasoning + Acting. The agent first has a Thought (reasoning about what to do), then takes an Action (calls a tool), then makes an Observation (processes the result). This loop repeats until the agent has enough information to provide a final response.',
      points: 20,
    },
    {
      id: 'q-11-4',
      question: 'Why is Google Docs used as the long-term memory store in this architecture?',
      type: 'multiple-choice',
      options: [
        'It\'s the only storage option n8n supports',
        'It provides free, human-readable, editable storage with API access',
        'It automatically encrypts all data',
        'It has built-in AI summarization features',
      ],
      correctAnswer: '1',
      explanation: 'Google Docs is chosen because it\'s free, has a powerful API for reading and appending content, is human-readable (you can inspect memories in the browser), editable (correct or delete memories manually), and supports shared access for team review.',
      points: 15,
    },
    {
      id: 'q-11-5',
      question: 'What is the difference between the save_note and save_long_term_memory tools?',
      type: 'multiple-choice',
      options: [
        'They are identical — just different names',
        'save_note is triggered by explicit user requests; save_long_term_memory is used proactively by the agent',
        'save_note stores text; save_long_term_memory stores images',
        'save_note is temporary; save_long_term_memory is permanent',
      ],
      correctAnswer: '1',
      explanation: 'save_note is used when the user explicitly asks to save something (structured with title and category). save_long_term_memory is used proactively by the agent when it detects important information like the user\'s name, preferences, or key facts — without being explicitly asked.',
      points: 20,
    },
    {
      id: 'q-11-6',
      question: 'How can you use DeepSeek as an alternative to GPT-4o-mini in the n8n agent?',
      type: 'multiple-choice',
      options: [
        'Install a special DeepSeek plugin for n8n',
        'Rewrite the entire workflow from scratch',
        'Use the OpenAI Chat Model node but change the Base URL to DeepSeek\'s API endpoint',
        'DeepSeek is not compatible with n8n agents',
      ],
      correctAnswer: '2',
      explanation: 'DeepSeek\'s API is compatible with the OpenAI API format. In n8n, you simply use the OpenAI Chat Model node but change the Base URL to https://api.deepseek.com/v1 and provide your DeepSeek API key. No code or workflow changes needed.',
      points: 15,
    },
  ],
};
