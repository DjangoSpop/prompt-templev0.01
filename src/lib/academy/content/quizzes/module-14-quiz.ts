/**
 * Module 14: CV / Resume AI Screening & Tracker — Quiz
 * 6 Questions | 70% Passing Score | 50 XP Reward
 */

import type { Quiz } from '../../types';

export const module14Quiz: Quiz = {
  id: 'quiz-module-14',
  moduleId: 'module-14',
  title: 'The AI Screening Trial',
  description: 'Test your knowledge of building an automated resume screening pipeline with n8n, Google Drive, and AI.',
  passingScore: 70,
  xpReward: 50,
  questions: [
    {
      id: 'q-14-1',
      question: 'What triggers the resume screening workflow when a new CV is uploaded?',
      type: 'multiple-choice',
      options: [
        'Webhook Trigger',
        'Google Drive Trigger watching the Inbox folder',
        'Schedule Trigger running every hour',
        'Email Trigger from Gmail',
      ],
      correctAnswer: '1',
      explanation: 'The Google Drive Trigger node polls a specific folder (Inbox) for new files. When a new CV is uploaded to the watched folder, the trigger fires and starts the screening pipeline automatically.',
      points: 15,
    },
    {
      id: 'q-14-2',
      question: 'How does the AI classify candidates based on their screening score?',
      type: 'multiple-choice',
      options: [
        'Pass (above 5) or Fail (below 5)',
        'A, B, C, D, F grade system',
        'ACCEPT (8-10), KIV (5-7), REJECT (1-4)',
        'Hire, Maybe, No Hire with no numeric score',
      ],
      correctAnswer: '2',
      explanation: 'The three-tier classification uses ACCEPT (score 8-10) for strong candidates, KIV/Keep In View (score 5-7) for promising but not perfect fits, and REJECT (score 1-4) for candidates who don\'t meet critical requirements.',
      points: 15,
    },
    {
      id: 'q-14-3',
      question: 'Why is the job description stored in a Google Doc rather than hardcoded in the workflow?',
      type: 'multiple-choice',
      options: [
        'Google Docs load faster than workflow variables',
        'It reduces API costs',
        'So non-technical HR staff can update requirements without modifying the n8n workflow',
        'Google Docs have better security',
      ],
      correctAnswer: '2',
      explanation: 'Storing the job description in a Google Doc allows HR team members to update requirements at any time without accessing n8n. Changes take effect immediately, version history tracks changes, and multiple stakeholders can collaborate on the document.',
      points: 15,
    },
    {
      id: 'q-14-4',
      question: 'What makes the AI Agent node different from a simple LLM/OpenAI node for resume screening?',
      type: 'multiple-choice',
      options: [
        'The AI Agent is faster',
        'The AI Agent can use tools like Gmail and Google Drive to take actions based on its reasoning',
        'The AI Agent costs less per call',
        'The AI Agent supports more languages',
      ],
      correctAnswer: '1',
      explanation: 'Unlike a simple LLM call that only returns text, an AI Agent can use attached tools to take autonomous actions — sending notification emails via Gmail, moving files in Google Drive, and producing structured output. This makes it a true decision-making agent.',
      points: 15,
    },
    {
      id: 'q-14-5',
      question: 'What happens to the physical resume file after AI screening is complete?',
      type: 'multiple-choice',
      options: [
        'It is deleted from Google Drive',
        'It stays in the Inbox folder',
        'It is moved to the Accept, KIV, or Reject folder based on the classification',
        'It is emailed to the hiring manager as an attachment',
      ],
      correctAnswer: '2',
      explanation: 'The resume file is moved from the Inbox folder to the appropriate destination folder (Accept, KIV, or Reject) based on the AI\'s classification. This creates an organized filing system the entire HR team can browse.',
      points: 15,
    },
    {
      id: 'q-14-6',
      question: 'How can the screening pipeline be scaled beyond the basic Google Drive trigger approach?',
      type: 'multiple-choice',
      options: [
        'By adding more Google Drive folders',
        'By using webhooks for real-time intake, integrating with professional ATS platforms, and adding Calendly for interview scheduling',
        'By running the workflow more frequently',
        'By switching to a different AI model',
      ],
      correctAnswer: '1',
      explanation: 'Scaling involves replacing the polling trigger with a webhook for real-time processing, integrating with ATS platforms like Greenhouse or Lever, adding automated interview scheduling via Calendly, and implementing queue systems for high-volume processing.',
      points: 15,
    },
  ],
};
