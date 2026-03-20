/**
 * Module 16: HR Automation Pipeline with AI — Quiz
 * 6 Questions | 70% Passing Score | 50 XP Reward
 */

import type { Quiz } from '../../types';

export const module16Quiz: Quiz = {
  id: 'quiz-module-16',
  moduleId: 'module-16',
  title: 'The HR Pipeline Trial',
  description: 'Test your knowledge of building an end-to-end HR automation pipeline with n8n, LangChain, and AI evaluation.',
  passingScore: 70,
  xpReward: 50,
  questions: [
    {
      id: 'q-16-1',
      question: 'What is the n8n Form Trigger node used for in this HR pipeline?',
      type: 'multiple-choice',
      options: [
        'Sending automated emails to candidates',
        'Creating a built-in web form where candidates submit their application and upload their CV',
        'Generating PDF reports of candidate evaluations',
        'Connecting to external job boards',
      ],
      correctAnswer: '1',
      explanation: 'The n8n Form Trigger creates a web form accessible via URL where candidates can fill in personal details, upload their CV, select the position, and submit their application — all without building a separate frontend.',
      points: 15,
    },
    {
      id: 'q-16-2',
      question: 'Why does the pipeline use two separate Information Extractor nodes instead of one?',
      type: 'multiple-choice',
      options: [
        'Because n8n only supports one field per extractor',
        'Focused extraction produces higher accuracy, enables parallel processing, and simplifies debugging',
        'Because personal data and qualifications use different AI models',
        'To comply with data privacy regulations',
      ],
      correctAnswer: '1',
      explanation: 'Splitting extraction into personal data and qualifications improves accuracy (focused extraction), enables parallel processing (both run simultaneously), simplifies debugging (isolate failures), and keeps each schema simple and well-defined.',
      points: 15,
    },
    {
      id: 'q-16-3',
      question: 'What does the Information Extractor node do differently from a regular LLM/OpenAI node?',
      type: 'multiple-choice',
      options: [
        'It is faster and cheaper',
        'It uses LangChain extraction chains to pull structured JSON fields from unstructured text using a defined schema',
        'It only works with Notion databases',
        'It can process images natively',
      ],
      correctAnswer: '1',
      explanation: 'The Information Extractor uses LangChain\'s extraction chain to pull structured data from unstructured text. You define a schema (fields, types, descriptions) and the node produces clean JSON matching that schema — no manual text parsing needed.',
      points: 15,
    },
    {
      id: 'q-16-4',
      question: 'What does the HR Expert LLM evaluation include in its output?',
      type: 'multiple-choice',
      options: [
        'Only a pass/fail decision',
        'A salary recommendation and benefits package',
        'Fit score (1-10), strengths, concerns, interview recommendation, and suggested interview questions',
        'A comparison with other candidates in the pipeline',
      ],
      correctAnswer: '2',
      explanation: 'The HR Expert evaluation produces a comprehensive assessment: a fit score (1-10), 3-5 strengths, 2-4 concerns, an interview recommendation (Strongly Recommend/Recommend/Conditional/Not Recommended), and 3-5 suggested behavioral interview questions.',
      points: 15,
    },
    {
      id: 'q-16-5',
      question: 'What role does the Summarization Chain play in the pipeline?',
      type: 'multiple-choice',
      options: [
        'It compresses the CV file to save storage space',
        'It generates a 3-5 sentence summary of the candidate\'s qualifications to provide focused context for the HR Expert evaluation',
        'It translates the CV to multiple languages',
        'It creates a visual summary with charts',
      ],
      correctAnswer: '1',
      explanation: 'The Summarization Chain condenses the extracted CV data into a 3-5 sentence summary. This summary serves as focused input for the HR Expert evaluation (reducing noise) and gives the HR team a quick overview without reading the full CV.',
      points: 15,
    },
    {
      id: 'q-16-6',
      question: 'Where does the pipeline store the final candidate data and CV file?',
      type: 'multiple-choice',
      options: [
        'Only in the n8n database',
        'In a Notion database with board views',
        'Google Sheets for structured data tracking and Google Drive for CV file storage',
        'In an email sent to the HR manager',
      ],
      correctAnswer: '2',
      explanation: 'The pipeline saves all structured data (personal info, qualifications, evaluation, score) to a Google Sheet for tracking and filtering, and uploads the original CV file to Google Drive organized by position with score-prefixed filenames for easy sorting.',
      points: 15,
    },
  ],
};
