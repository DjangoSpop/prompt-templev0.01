/**
 * Module 4: Multi-Model Orchestration Strategy - Quiz
 * 7 questions | Passing score: 70%
 */

import type { Quiz } from '../../types';

export const module4Quiz: Quiz = {
  id: 'quiz-module-4',
  moduleId: 'module-4',
  title: 'Multi-Model Orchestration Quiz',
  description: 'Test your understanding of model selection and routing strategies',
  passingScore: 70,
  xpReward: 70,
  questions: [
    {
      id: 'q-4-1',
      question: 'Which AI model is generally BEST for analyzing very long documents (100K+ tokens)?',
      type: 'multiple-choice',
      options: [
        'GPT-4 (128K context)',
        'Claude (200K context)',
        'GPT-3.5 (16K context)',
        'All models are equally good',
      ],
      correctAnswer: '1',
      explanation: 'Claude has the largest context window (200K tokens) and is specifically optimized for long document analysis. While GPT-4 can handle 128K, Claude was designed with document processing as a core strength.',
      points: 15,
    },

    {
      id: 'q-4-2',
      question: 'What is "triangulation" in multi-model orchestration?',
      type: 'multiple-choice',
      options: [
        'Using three different prompts on one model',
        'Running the same prompt through multiple models and comparing results',
        'Training three custom models',
        'Using models in a triangle pattern',
      ],
      correctAnswer: '1',
      explanation: 'Triangulation means running the identical prompt through 2-3 different models, then comparing outputs. Areas where models agree = high confidence. Areas of disagreement = need deeper investigation. This validates results and provides multiple perspectives.',
      points: 15,
    },

    {
      id: 'q-4-3',
      question: 'A company processes 10,000 customer support tickets daily. Most are simple FAQs. What\'s the best cost optimization strategy?',
      type: 'multiple-choice',
      options: [
        'Use GPT-4 for everything to ensure quality',
        'Use escalation: cheap model for simple queries, expensive for complex',
        'Use only free open-source models',
        'Process everything manually to save API costs',
      ],
      correctAnswer: '1',
      explanation: 'Escalation workflow: 80% of simple queries handled by cheaper models, 15% escalate to premium models, 5% to humans. This saves 60-90% on costs while maintaining quality. Using only one model (cheap or expensive) is inefficient.',
      points: 15,
    },

    {
      id: 'q-4-4',
      question: 'What does the "80/20 principle" mean in multi-model cost optimization?',
      type: 'multiple-choice',
      options: [
        'Use 80% GPT-4, 20% Claude',
        '80% of tasks can use cheaper models, 20% need premium',
        'Spend 80% of budget on models, 20% on humans',
        'Use models 80% of the time, humans 20%',
      ],
      correctAnswer: '1',
      explanation: 'The 80/20 principle: Most tasks (80%) don\'t need the most expensive model. Only complex/critical tasks (20%) justify premium pricing. Route accordingly to save 60-70% vs. using premium models for everything.',
      points: 15,
    },

    {
      id: 'q-4-5',
      question: 'Which orchestration pattern is best for creating content that needs multiple stages (outline, draft, edit, fact-check)?',
      type: 'multiple-choice',
      options: [
        'Parallel Processing + Synthesis',
        'Sequential Processing Pipeline',
        'Escalation Workflow',
        'Voting Ensemble',
      ],
      correctAnswer: '1',
      explanation: 'Sequential Processing Pipeline: Each stage uses the model best suited for that task. Example: Outline (fast model) → Draft (creative model) → Edit (instruction-following model) → Fact-check (accuracy-focused model). Each step builds on the previous.',
      points: 15,
    },

    {
      id: 'q-4-6',
      question: 'True or False: You should always use multi-model orchestration from day one to maximize quality.',
      type: 'true-false',
      options: [
        'True',
        'False',
      ],
      correctAnswer: '1',
      explanation: 'FALSE! Start simple with one good model until you have clear cost/quality pain points. Premature optimization adds complexity without proven benefit. Only add multi-model strategies when you have data showing specific needs for cost reduction or capability gaps.',
      points: 10,
    },

    {
      id: 'q-4-7',
      question: 'A legal tech company saved 67% on API costs by routing simple contract reviews to cheaper models and complex analysis to GPT-4. What strategy did they use?',
      type: 'multiple-choice',
      options: [
        'Sequential Pipeline',
        'Triangulation',
        'Task-based Routing',
        'Parallel Processing',
      ],
      correctAnswer: '2',
      explanation: 'Task-based Routing (also called Rule-based or Capability-based routing): Route each task type to the optimal model. Simple contract review = cheap model. Complex analysis = premium model. This leverages model strengths while optimizing costs.',
      points: 15,
    },
  ],
};
