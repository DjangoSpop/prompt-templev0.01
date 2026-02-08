/**
 * Module 2: Anatomy of a Perfect Prompt - Quiz
 * 7 questions | Passing score: 70%
 */

import type { Quiz } from '../../types';

export const module2Quiz: Quiz = {
  id: 'quiz-module-2',
  moduleId: 'module-2',
  title: 'Perfect Prompt Mastery Quiz',
  description: 'Test your understanding of the CCCEFI framework and prompt construction',
  passingScore: 70,
  xpReward: 60,
  questions: [
    // Question 1
    {
      id: 'q-2-1',
      question: 'What are the three types of context you should include in a prompt?',
      type: 'multiple-choice',
      options: [
        'Past, present, and future',
        'Role-based, situational, and audience',
        'Technical, business, and creative',
        'Internal, external, and personal',
      ],
      correctAnswer: '1',
      explanation: 'The three types of context are: (1) Role-based context (who you are or who the AI should be), (2) Situational context (background/problem), and (3) Audience context (who the output is for). These three layers ensure the AI understands your perspective, situation, and target audience.',
      points: 15,
    },

    // Question 2
    {
      id: 'q-2-2',
      question: 'Which constraint type addresses HOW information should be organized?',
      type: 'multiple-choice',
      options: [
        'Length constraints',
        'Tone constraints',
        'Output constraints (format)',
        'Content constraints',
      ],
      correctAnswer: '2',
      explanation: 'Output constraints (also called Format constraints) specify HOW the information should be structured—bullet points, tables, JSON, paragraphs, etc. Length controls size, tone controls voice, and content controls what to include/exclude.',
      points: 15,
    },

    // Question 3
    {
      id: 'q-2-3',
      question: 'How many examples are typically ideal for few-shot learning in most tasks?',
      type: 'multiple-choice',
      options: [
        '0 examples (zero-shot is always best)',
        '1 example is sufficient',
        '3 examples (the sweet spot)',
        '10+ examples are required',
      ],
      correctAnswer: '2',
      explanation: '3 examples (3-shot learning) is the sweet spot for most tasks. It gives the AI enough pattern recognition without overwhelming the prompt. 0-shot works for simple tasks, 1-shot for straightforward patterns, and 5+ for complex/nuanced tasks.',
      points: 15,
    },

    // Question 4
    {
      id: 'q-2-4',
      question: 'What should you do when a prompt produces output that\'s close but not quite right?',
      type: 'multiple-choice',
      options: [
        'Start over with a completely different prompt',
        'Use iteration: add specific refinements addressing what\'s wrong',
        'Accept the output as good enough',
        'Switch to a different AI model',
      ],
      correctAnswer: '1',
      explanation: 'Iteration is key! When output is close, don\'t start over. Instead, add specific constraints or follow-up instructions addressing what needs improvement: "Make it 50% shorter", "Change tone to more professional", etc. This builds on your initial work.',
      points: 15,
    },

    // Question 5
    {
      id: 'q-2-5',
      question: 'A prompt says "Write something good about our product." What\'s the PRIMARY problem?',
      type: 'multiple-choice',
      options: [
        'It lacks examples of the brand voice',
        'It has no constraints on length or format',
        'It lacks clarity and specificity (too vague)',
        'It doesn\'t specify the audience',
      ],
      correctAnswer: '2',
      explanation: 'While this prompt has MULTIPLE problems, the PRIMARY issue is lack of clarity. "Something" and "good" are extremely vague. What type of content? (email, ad, description?) What makes it "good"? (persuasive? informative? emotional?) Clarity removes ambiguity.',
      points: 15,
    },

    // Question 6
    {
      id: 'q-2-6',
      question: 'In the UN intelligence case study, what was the key to standardizing reports across 5 offices?',
      type: 'multiple-choice',
      options: [
        'Hiring better writers',
        'Using longer, more detailed prompts',
        'Creating a CCCEFI-based template with consistent format',
        'Switching to a more powerful AI model',
      ],
      correctAnswer: '2',
      explanation: 'The solution was a CCCEFI-based prompt template that specified exact format (BLUF), constraints (1 page, military tone, cite sources), and structure. This template ensured consistency without requiring training or new hires. Time saved: 10 hours/week.',
      points: 10,
    },

    // Question 7
    {
      id: 'q-2-7',
      question: 'True or False: When using format specifications, you should provide an empty template structure for the AI to follow.',
      type: 'true-false',
      options: [
        'True',
        'False',
      ],
      correctAnswer: '0',
      explanation: 'TRUE! Providing an empty template is highly effective. Example: "Use this format: ## [Title]\\n**Problem:** [description]\\n**Solution:** [description]" This removes ambiguity and ensures consistent formatting every time.',
      points: 15,
    },
  ],
};
