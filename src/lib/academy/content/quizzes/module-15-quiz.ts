/**
 * Module 15: Financial Tracker — Quiz
 * 6 Questions | 70% Passing Score | 50 XP Reward
 */

import type { Quiz } from '../../types';

export const module15Quiz: Quiz = {
  id: 'quiz-module-15',
  moduleId: 'module-15',
  title: 'The Financial Tracker Trial',
  description: 'Test your knowledge of building an AI-powered expense tracker with Telegram, Gemini AI, and Notion.',
  passingScore: 70,
  xpReward: 50,
  questions: [
    {
      id: 'q-15-1',
      question: 'What is the primary input method for capturing invoices in this financial tracking system?',
      type: 'multiple-choice',
      options: [
        'Manually typing amounts into a web form',
        'Sending a photo of the receipt to a Telegram bot',
        'Scanning receipts with a dedicated scanner app',
        'Forwarding email receipts to an inbox',
      ],
      correctAnswer: '1',
      explanation: 'The system uses a Telegram bot as the primary input. Users simply photograph a receipt and send it to their Telegram bot. Gemini AI then extracts all transaction data from the image automatically.',
      points: 15,
    },
    {
      id: 'q-15-2',
      question: 'What does the Structured Output Parser (outputParserStructured) node do in this workflow?',
      type: 'multiple-choice',
      options: [
        'Compresses the image for faster processing',
        'Converts the receipt to a PDF format',
        'Forces the AI response into a valid JSON schema, guaranteeing reliable structured data',
        'Translates the receipt text to English',
      ],
      correctAnswer: '2',
      explanation: 'The Structured Output Parser defines a JSON schema and forces the AI model to produce output conforming exactly to that schema. This eliminates JSON parsing errors and guarantees valid, typed data for downstream nodes.',
      points: 15,
    },
    {
      id: 'q-15-3',
      question: 'Which AI model is used for extracting transaction data from receipt images, and why?',
      type: 'multiple-choice',
      options: [
        'GPT-4 because it\'s the most popular',
        'Gemini because it\'s multimodal — it processes images and text in a single call without separate OCR',
        'DALL-E because it specializes in image processing',
        'Whisper because it can read text from images',
      ],
      correctAnswer: '1',
      explanation: 'Gemini is a multimodal AI model that natively understands both images and text. It can read receipt photos directly without a separate OCR step, accurately extracting amounts, vendor names, dates, and categories.',
      points: 15,
    },
    {
      id: 'q-15-4',
      question: 'How does QuickChart.io generate chart images for the spending report?',
      type: 'multiple-choice',
      options: [
        'It requires a paid desktop application',
        'You construct a URL with chart configuration data, and it returns a PNG image via API',
        'It connects to Notion and generates charts directly',
        'It requires uploading a CSV file to their website',
      ],
      correctAnswer: '1',
      explanation: 'QuickChart.io is a free API that generates Chart.js images via URL. You encode a chart configuration (type, data, colors, labels) as a URL parameter, and the API returns a rendered PNG image that can be sent via Telegram.',
      points: 15,
    },
    {
      id: 'q-15-5',
      question: 'What are the two separate workflows that make up the complete financial tracking system?',
      type: 'multiple-choice',
      options: [
        'Data Import and Data Export workflows',
        'Invoice Capture Pipeline (photo → AI → Notion) and Weekly Report Pipeline (schedule → analyze → chart → Telegram)',
        'Mobile workflow and Desktop workflow',
        'Personal expenses and Business expenses workflows',
      ],
      correctAnswer: '1',
      explanation: 'The system has two workflows: the Invoice Capture Pipeline (Telegram photo → Gemini extraction → Notion save) for real-time expense capture, and the Weekly Report Pipeline (Schedule Trigger → Notion query → AI summary → QuickChart → Telegram) for automated spending reports.',
      points: 15,
    },
    {
      id: 'q-15-6',
      question: 'What categories does the system use for classifying expenses?',
      type: 'multiple-choice',
      options: [
        'Income, Savings, and Expenses',
        'High, Medium, and Low priority',
        'Food, Transport, Utilities, Shopping, Healthcare, Entertainment, and Other',
        'Rent, Bills, and Miscellaneous',
      ],
      correctAnswer: '2',
      explanation: 'The system uses 7 predefined categories enforced by the Output Parser schema: Food, Transport, Utilities, Shopping, Healthcare, Entertainment, and Other. The enum constraint ensures the AI always assigns one of these exact categories.',
      points: 15,
    },
  ],
};
