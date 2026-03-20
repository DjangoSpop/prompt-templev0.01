/**
 * Module 17: Email Management with AI — Quiz
 * 6 Questions | 70% Passing Score | 50 XP Reward
 */

import type { Quiz } from '../../types';

export const module17Quiz: Quiz = {
  id: 'quiz-module-17',
  moduleId: 'module-17',
  title: 'The Email Management Trial',
  description: 'Test your knowledge of building an AI-powered email management system with IMAP, classification, vector search, and reply drafting.',
  passingScore: 70,
  xpReward: 50,
  questions: [
    {
      id: 'q-17-1',
      question: 'What protocol does the email trigger use to read emails from the server?',
      type: 'multiple-choice',
      options: [
        'SMTP (Simple Mail Transfer Protocol)',
        'POP3 (Post Office Protocol)',
        'IMAP (Internet Message Access Protocol)',
        'HTTP REST API',
      ],
      correctAnswer: '2',
      explanation: 'The system uses IMAP (Internet Message Access Protocol) to read emails. Unlike POP3, IMAP keeps emails on the server and supports folder management, making it ideal for an automated system that works alongside your normal email client.',
      points: 15,
    },
    {
      id: 'q-17-2',
      question: 'What are the five email classification categories used by the Text Classifier node?',
      type: 'multiple-choice',
      options: [
        'High, Medium, Low, Archive, Delete',
        'Urgent, Client, Support, Newsletter, Spam',
        'Personal, Work, Social, Promotions, Updates',
        'Important, Normal, Bulk, Junk, Unknown',
      ],
      correctAnswer: '1',
      explanation: 'The Text Classifier categorizes emails into five categories: Urgent (time-sensitive emergencies), Client (customer communications), Support (internal requests), Newsletter (marketing and updates), and Spam (unsolicited or irrelevant). Each category triggers different processing pipelines.',
      points: 15,
    },
    {
      id: 'q-17-3',
      question: 'What is the purpose of storing email embeddings in the Qdrant vector database?',
      type: 'multiple-choice',
      options: [
        'To compress emails and save storage space',
        'To enable semantic search — finding emails by meaning rather than exact keywords — and power RAG for smarter reply drafting',
        'To encrypt emails for security compliance',
        'To create backup copies of all emails',
      ],
      correctAnswer: '1',
      explanation: 'Vector embeddings in Qdrant enable semantic search (finding related emails by meaning, not keywords) and power RAG (Retrieval-Augmented Generation). When drafting replies, the AI retrieves relevant past emails for context, producing more informed and consistent responses.',
      points: 15,
    },
    {
      id: 'q-17-4',
      question: 'What confidence threshold is recommended as the production default for automated email actions?',
      type: 'multiple-choice',
      options: [
        '0.50 — handle most emails automatically',
        '0.70 — aggressive automation',
        '0.90 — good balance of automation and safety after calibration',
        '0.99 — almost nothing is automated',
      ],
      correctAnswer: '2',
      explanation: 'A 0.90 confidence threshold is recommended for production after initial calibration. Start with 0.95 (conservative) during initial deployment, then lower to 0.90 once the system proves accurate. Below 0.80 risks auto-processing misclassified emails.',
      points: 15,
    },
    {
      id: 'q-17-5',
      question: 'Why are AI-drafted replies saved as Gmail Drafts by default instead of being sent automatically?',
      type: 'multiple-choice',
      options: [
        'Because Gmail\'s API doesn\'t support sending',
        'To reduce API costs',
        'As a human-in-the-loop safety measure — allowing review before sending to catch errors in high-stakes communication',
        'Because drafts are faster to create than sent emails',
      ],
      correctAnswer: '2',
      explanation: 'Email is high-stakes communication. Saving replies as drafts implements a human-in-the-loop pattern where the AI handles the heavy lifting (drafting) while humans maintain control over what actually gets sent. This catches AI errors and inappropriate responses before they reach recipients.',
      points: 15,
    },
    {
      id: 'q-17-6',
      question: 'What does RAG (Retrieval-Augmented Generation) mean in the context of email reply drafting?',
      type: 'multiple-choice',
      options: [
        'A technique for compressing long emails into shorter versions',
        'The AI searches for relevant past emails in the vector database and uses them as context when drafting a reply',
        'A method for filtering spam emails more accurately',
        'An encryption protocol for secure email communication',
      ],
      correctAnswer: '1',
      explanation: 'RAG means the AI first retrieves relevant documents (past emails from Qdrant vector search) and then uses that context to generate a better response. When replying to a client about a project, RAG provides the AI with past emails about that project — enabling informed, consistent replies.',
      points: 15,
    },
  ],
};
