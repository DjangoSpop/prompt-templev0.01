/**
 * Module 24: Career Skills for the Agentic Era — Quiz
 * 6 Questions | 70% Passing Score | 50 XP Reward
 */

import type { Quiz } from '../../types';

export const module24Quiz: Quiz = {
  id: 'quiz-module-24',
  moduleId: 'module-24',
  title: 'The Career Skills Trial',
  description: 'Test your understanding of how AI changes jobs, the essential skills for the agentic era, and practical steps to build your AI career.',
  passingScore: 70,
  xpReward: 50,
  questions: [
    {
      id: 'q-24-1',
      question: 'What does the statement "AI replaces tasks, not people" mean?',
      type: 'multiple-choice',
      options: [
        'AI will never affect any jobs at all',
        'Every job is a bundle of tasks — AI will automate some tasks while creating demand for new ones, transforming roles rather than eliminating them entirely',
        'AI will only replace manual labor jobs, not knowledge work',
        'AI replaces people temporarily until they retrain',
      ],
      correctAnswer: '1',
      explanation: 'Most jobs consist of many different tasks. AI excels at repetitive, data-heavy, and pattern-matching tasks but struggles with creative strategy, complex judgment, and interpersonal work. Research suggests roughly 70% of tasks may be partially automated, but only 5-10% of entire jobs will be fully replaced.',
      points: 15,
    },
    {
      id: 'q-24-2',
      question: 'Which of these is a brand new role that has emerged because of AI?',
      type: 'multiple-choice',
      options: [
        'Software Developer',
        'Data Analyst',
        'Agent Designer — someone who architects AI agent workflows, guardrails, and human-in-the-loop processes',
        'Project Manager',
      ],
      correctAnswer: '2',
      explanation: 'Agent Designer is a new role created by the AI era. It involves designing how AI agents work: which tasks to automate, how agents interact with each other and humans, what safety guardrails to set, and how to keep humans in the loop for important decisions. Other new roles include Prompt Engineer, AI Operations Specialist, and AI Ethics Officer.',
      points: 15,
    },
    {
      id: 'q-24-3',
      question: 'Why is prompt literacy compared to computer literacy in the 1990s?',
      type: 'multiple-choice',
      options: [
        'Because both skills require a computer science degree',
        'Because both are temporary fads that will fade away',
        'Because just as "knowing how to use a computer" became a baseline job requirement, knowing how to communicate effectively with AI will become equally fundamental',
        'Because prompt literacy is only useful for IT professionals',
      ],
      correctAnswer: '2',
      explanation: 'In the 1990s, computer literacy became a baseline expectation for most jobs. Today, prompt literacy — the ability to communicate effectively with AI to get useful results — is following the same path. It will soon be assumed rather than listed as a special skill.',
      points: 15,
    },
    {
      id: 'q-24-4',
      question: 'What is "automation thinking"?',
      type: 'multiple-choice',
      options: [
        'The fear that automation will take your job',
        'A programming language for building robots',
        'The ability to look at any process and identify which parts can be automated, which should stay manual, and how to connect them',
        'A meditation technique for reducing work stress',
      ],
      correctAnswer: '2',
      explanation: 'Automation thinking is a mindset shift from "How do I do this task?" to "How can I design a system that does this task?" It involves mapping recurring tasks, identifying triggers, spotting decision points where humans should stay involved, and thinking in workflows.',
      points: 20,
    },
    {
      id: 'q-24-5',
      question: 'According to the lesson, what should be your first step in building AI skills?',
      type: 'multiple-choice',
      options: [
        'Enroll in a computer science degree program',
        'Buy the most expensive AI tools available',
        'Audit your current workflow — track every task, estimate time spent, and identify which tasks are repetitive vs. creative',
        'Wait until AI technology matures and becomes easier to use',
      ],
      correctAnswer: '2',
      explanation: 'The first step is understanding where you are now. By auditing your current workflow and identifying time-wasting repetitive tasks, you can find the highest-impact opportunities for AI automation. This practical approach lets you start getting value from AI immediately.',
      points: 20,
    },
    {
      id: 'q-24-6',
      question: 'What is an "AI portfolio" and why does it matter?',
      type: 'multiple-choice',
      options: [
        'A financial investment strategy focused on AI company stocks',
        'A collection of AI-generated artwork for social media',
        'A documented record of your AI projects, automations, and results — used to demonstrate AI competency in career advancement',
        'A subscription bundle that gives you access to multiple AI tools',
      ],
      correctAnswer: '2',
      explanation: 'An AI portfolio documents your practical AI work: the problems you solved, the tools you used, the results you achieved, and the metrics you improved. As AI skills become a hiring differentiator, having a portfolio of real projects demonstrates competency far more effectively than certifications alone.',
      points: 15,
    },
  ],
};
