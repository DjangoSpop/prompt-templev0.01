/**
 * Module 5: Advanced Techniques & Production Patterns - Quiz
 * 7 questions | Passing score: 70%
 */

import type { Quiz } from '../../types';

export const module5Quiz: Quiz = {
  id: 'quiz-module-5',
  moduleId: 'module-5',
  title: 'Advanced Techniques Mastery Quiz',
  description: 'Test your understanding of ToT, RAG, fine-tuning, and production patterns',
  passingScore: 70,
  xpReward: 80,
  questions: [
    {
      id: 'q-5-1',
      question: 'What is the main difference between Chain-of-Thought (CoT) and Tree of Thoughts (ToT) prompting?',
      type: 'multiple-choice',
      options: [
        'ToT uses more tokens',
        'ToT explores multiple reasoning paths in parallel, while CoT follows a single linear path',
        'ToT only works with GPT-4',
        'ToT is faster than CoT',
      ],
      correctAnswer: '1',
      explanation: 'Tree of Thoughts explores multiple reasoning branches simultaneously, evaluates them, prunes dead-ends, and pursues the most promising path. Chain-of-Thought follows a single linear reasoning sequence. ToT is more powerful for complex problems but uses 3-5x more tokens.',
      points: 15,
    },

    {
      id: 'q-5-2',
      question: 'A healthcare company needs an AI to answer questions using their 1,000 internal medical protocols. What\'s the BEST approach?',
      type: 'multiple-choice',
      options: [
        'Fine-tune GPT-4 on all protocols',
        'Write very detailed prompts with all 1,000 protocols included',
        'Build a RAG system with vector database retrieval',
        'Use chain-of-thought prompting',
      ],
      correctAnswer: '2',
      explanation: 'RAG (Retrieval-Augmented Generation) is the optimal solution: (1) Embed the 1,000 protocols in a vector database, (2) Retrieve the 3-5 most relevant protocols for each question, (3) Include them as context in the prompt. This is cheaper, faster to build, and easier to update than fine-tuning.',
      points: 15,
    },

    {
      id: 'q-5-3',
      question: 'When should you choose fine-tuning over prompt engineering + RAG?',
      type: 'multiple-choice',
      options: [
        'When you need the AI to have custom knowledge',
        'When you have unique domain jargon and need extreme style consistency across 10K+ outputs',
        'When you want faster development time',
        'When you have a limited budget',
      ],
      correctAnswer: '1',
      explanation: 'Fine-tuning makes sense for: (1) Domain-specific jargon the base model doesn\'t understand, (2) Extreme consistency requirements (e.g., legal firm house style), (3) Inference cost optimization at massive scale. For custom knowledge, use RAG. Fine-tuning is expensive and slow, so it should be a last resort after exhausting prompt engineering.',
      points: 15,
    },

    {
      id: 'q-5-4',
      question: 'What is "LLM-as-a-Judge" and when is it useful?',
      type: 'multiple-choice',
      options: [
        'Using AI to moderate user content',
        'Using another LLM to evaluate the quality of AI-generated outputs',
        'A legal AI application',
        'A method for fine-tuning models',
      ],
      correctAnswer: '1',
      explanation: 'LLM-as-a-Judge uses one LLM to evaluate the quality of another LLM\'s output against criteria like accuracy, completeness, and clarity. It correlates 85-90% with human ratings and is 100x faster/cheaper than human evaluation. Perfect for measuring prompt quality on subjective tasks (summaries, creative writing, etc.).',
      points: 15,
    },

    {
      id: 'q-5-5',
      question: 'True or False: In production, you should always use the most powerful model (like GPT-4) to ensure maximum quality.',
      type: 'true-false',
      options: [
        'True',
        'False',
      ],
      correctAnswer: '1',
      explanation: 'FALSE! Production systems should use model routing: simple queries → cheap models (GPT-3.5, Claude Haiku), complex queries → expensive models (GPT-4, Claude Opus). This saves 60-90% on costs while maintaining quality. Use the LEAST powerful model that meets your quality threshold.',
      points: 10,
    },

    {
      id: 'q-5-6',
      question: 'What is the purpose of "confidence scoring" in a Human-in-the-Loop (HITL) system?',
      type: 'multiple-choice',
      options: [
        'To make the AI seem more confident',
        'To flag low-confidence responses for human review, reducing review workload by 80%',
        'To measure user satisfaction',
        'To train the model faster',
      ],
      correctAnswer: '1',
      explanation: 'Confidence scoring asks the AI to self-evaluate (e.g., "How confident are you, 1-10?"). Responses with confidence <7 are flagged for human review, while high-confidence responses go directly to users. This reduces human review workload by ~80% while catching ~95% of errors—critical for high-stakes domains (legal, medical, financial).',
      points: 15,
    },

    {
      id: 'q-5-7',
      question: 'What are the 4 key metrics for measuring prompt quality in production?',
      type: 'multiple-choice',
      options: [
        'Speed, Color, Size, Weight',
        'Accuracy, Consistency, Latency, Cost-per-response',
        'Tokens, Models, Prompts, Outputs',
        'Users, Sessions, Clicks, Conversions',
      ],
      correctAnswer: '1',
      explanation: 'The 4 critical metrics are: (1) Accuracy - % of correct responses, (2) Consistency - same answer when asked twice, (3) Latency - response time (<3s ideal), (4) Cost-per-response - API cost per query. Track all four to balance quality, speed, and budget. Optimize iteratively using A/B testing.',
      points: 15,
    },
  ],
};
