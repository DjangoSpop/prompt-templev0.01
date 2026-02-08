/**
 * Module 6: The Pharaoh's Decree — Capstone Project Quiz
 * 7 questions | Passing score: 70%
 */

import type { Quiz } from '../../types';

export const module6Quiz: Quiz = {
  id: 'quiz-module-6',
  moduleId: 'module-6',
  title: 'The Pharaoh\'s Final Trial',
  description: 'Prove your mastery of end-to-end prompt workflow design — from problem definition to production deployment',
  passingScore: 70,
  xpReward: 100,
  questions: [
    {
      id: 'q-6-1',
      question: 'A good capstone problem statement must include all of the following EXCEPT:',
      type: 'multiple-choice',
      options: [
        'A specific measurable success metric',
        'The target user and their skill level',
        'A list of every AI model ever created',
        'The current state vs. desired state',
      ],
      correctAnswer: '2',
      explanation: 'A strong problem statement (The Pharaoh\'s Decree) needs: Domain, Problem, Current State, Desired State, Target User, and Success Metric. You do NOT need an exhaustive model list — that comes during the architecture phase when you select the right models for specific tasks.',
      points: 15,
    },

    {
      id: 'q-6-2',
      question: 'In a 3-step prompt workflow, Step 1 produces a JSON output that Step 2 needs. What\'s the BEST practice for passing data between steps?',
      type: 'multiple-choice',
      options: [
        'Copy-paste the output manually each time',
        'Use structured output (JSON) from Step 1 and explicitly reference it in Step 2\'s prompt with a variable like {{step_1_output}}',
        'Assume the AI remembers the previous answer',
        'Put all three prompts into one giant prompt',
      ],
      correctAnswer: '1',
      explanation: 'Production workflows use structured output (JSON) for clean data handoffs between steps. Explicitly inject the previous step\'s output as a variable ({{step_1_output}}) into the next prompt. Never assume the AI "remembers" — each prompt call is stateless unless you explicitly provide context.',
      points: 15,
    },

    {
      id: 'q-6-3',
      question: 'You\'re designing a workflow and 90% of your steps use GPT-4 ($0.03/call). Your monthly cost is $500. What\'s the BEST optimization strategy?',
      type: 'multiple-choice',
      options: [
        'Reduce the number of workflow runs',
        'Apply the 90/10 Rule: move simple steps to cheaper models (GPT-4o mini at $0.001/call) and keep GPT-4 only for reasoning-critical steps',
        'Switch everything to a free model regardless of quality',
        'Remove validation steps to save tokens',
      ],
      correctAnswer: '1',
      explanation: 'The 90/10 Rule states that 90% of workflow steps can run on cheaper models without quality loss. Only complex reasoning or quality-critical steps need premium models. This typically reduces costs by 70-80% while maintaining output quality. Never remove validation steps — that\'s cutting safety nets, not costs.',
      points: 15,
    },

    {
      id: 'q-6-4',
      question: 'Which workflow design pattern would you use to get multiple AI perspectives on a controversial claim before presenting it to users?',
      type: 'multiple-choice',
      options: [
        'The Pipeline (Sequential)',
        'The Fan-Out / Fan-In (Parallel)',
        'The Loop (Iterative Refinement)',
        'The Guardian (Validation Gate)',
      ],
      correctAnswer: '1',
      explanation: 'Fan-Out / Fan-In sends the same input to multiple models (e.g., GPT-4, Claude, Gemini) in parallel, then merges their responses. This is the "Triangulation" technique from Module 4 — if 3 models agree, confidence is high. If they disagree, the claim needs deeper investigation. Perfect for fact-checking and controversial topics.',
      points: 15,
    },

    {
      id: 'q-6-5',
      question: 'You run your workflow 5 times with the same input and get wildly different outputs each time. What\'s the MOST likely fix?',
      type: 'multiple-choice',
      options: [
        'Use a different AI model entirely',
        'Lower the temperature setting and add more specific constraints to your prompt',
        'Add more creative language to the prompt',
        'Run it 10 more times and hope for the best',
      ],
      correctAnswer: '1',
      explanation: 'Inconsistent outputs usually mean: (1) Temperature is too high (randomness), or (2) The prompt lacks specific constraints, giving the AI too much freedom. Lower temperature (0.1-0.3) for deterministic tasks and add explicit output structure, length limits, and format requirements. More constraints = more consistency.',
      points: 15,
    },

    {
      id: 'q-6-6',
      question: 'What is the purpose of a System Prompt in a production workflow?',
      type: 'multiple-choice',
      options: [
        'To make the AI respond faster',
        'To define the AI\'s persistent role, boundaries, and operating rules that apply to every interaction',
        'To bypass token limits',
        'To make the AI ignore user instructions',
      ],
      correctAnswer: '1',
      explanation: 'A System Prompt is the "constitution" of your workflow — it defines the AI\'s role (e.g., "senior contract attorney"), boundaries (never provide definitive advice), and formatting preferences (use tables, include TL;DR). It\'s set once and applies to all user prompts, ensuring consistent behavior without repeating instructions.',
      points: 15,
    },

    {
      id: 'q-6-7',
      question: 'True or False: A capstone workflow is "done" once it produces a good output on the first test run.',
      type: 'true-false',
      options: [
        'True',
        'False',
      ],
      correctAnswer: '1',
      explanation: 'FALSE! A single successful run proves nothing. Production workflows must pass the 5-Point Validation Protocol: (1) Happy Path test, (2) Edge Case test, (3) Consistency test (5 identical runs), (4) Cost test (sustainable at scale?), and (5) Human test (does a real user find it useful?). The Pharaoh doesn\'t declare victory after one battle — they build empires.',
      points: 10,
    },
  ],
};
