/**
 * PromptCraft Academy - Module Definitions
 *
 * All 17 modules with metadata, lessons, and quizzes
 */

import type { Module } from '../types';
import { module1Lessons } from './lessons/module-1-lessons';
import { module1Quiz } from './quizzes/module-1-quiz';
import { module2Lessons } from './lessons/module-2-lessons';
import { module2Quiz } from './quizzes/module-2-quiz';
import { module3Lessons } from './lessons/module-3-lessons';
import { module3Quiz } from './quizzes/module-3-quiz';
import { module4Lessons } from './lessons/module-4-lessons';
import { module4Quiz } from './quizzes/module-4-quiz';
import { module5Lessons } from './lessons/module-5-lessons';
import { module5Quiz } from './quizzes/module-5-quiz';
import { module6Lessons } from './lessons/module-6-lessons';
import { module6Quiz } from './quizzes/module-6-quiz';
import { module7Lessons } from './lessons/module-7-lessons';
import { module7Quiz } from './quizzes/module-7-quiz';
import { module8Lessons } from './lessons/module-8-lessons';
import { module8Quiz } from './quizzes/module-8-quiz';
import { module9Lessons } from './lessons/module-9-lessons';
import { module9Quiz } from './quizzes/module-9-quiz';
import { module10Lessons } from './lessons/module-10-lessons';
import { module10Quiz } from './quizzes/module-10-quiz';
import { module11Lessons } from './lessons/module-11-lessons';
import { module11Quiz } from './quizzes/module-11-quiz';
import { module12Lessons } from './lessons/module-12-lessons';
import { module12Quiz } from './quizzes/module-12-quiz';
import { module13Lessons } from './lessons/module-13-lessons';
import { module13Quiz } from './quizzes/module-13-quiz';
import { module14Lessons } from './lessons/module-14-lessons';
import { module14Quiz } from './quizzes/module-14-quiz';
import { module15Lessons } from './lessons/module-15-lessons';
import { module15Quiz } from './quizzes/module-15-quiz';
import { module16Lessons } from './lessons/module-16-lessons';
import { module16Quiz } from './quizzes/module-16-quiz';
import { module17Lessons } from './lessons/module-17-lessons';
import { module17Quiz } from './quizzes/module-17-quiz';

export const modules: Module[] = [
  {
    id: 'module-1',
    title: 'Foundations of Prompt Engineering',
    shortTitle: 'Foundations',
    duration: 15,
    description: 'Learn what prompt engineering is, why it matters, and the CCCEFI framework basics',
    objectives: [
      'Define prompt engineering and explain its business impact',
      'Calculate personal ROI of improved prompting skills',
      'Identify 5 characteristics of high-quality vs. poor prompts',
      'Apply the CCCEFI framework to transform a basic prompt',
    ],
    badge: '🏛️',
    xpReward: 100,
    order: 1,
    locked: false, // Module 1 is always free
    lessons: module1Lessons,
    quiz: module1Quiz,
    prerequisites: [],
  },
  {
    id: 'module-2',
    title: 'Anatomy of a Perfect Prompt',
    shortTitle: 'Perfect Prompt',
    duration: 20,
    description: 'Master the CCCEFI framework and build production-ready prompts',
    objectives: [
      'Apply all 6 CCCEFI principles independently',
      'Construct prompts that score 80%+ on quality rubrics',
      'Debug failing prompts using the framework',
      'Build custom templates for your industry',
    ],
    badge: '⚡',
    xpReward: 150,
    order: 2,
    locked: false,
    lessons: module2Lessons,
    quiz: module2Quiz,
    prerequisites: ['module-1'],
  },
  {
    id: 'module-3',
    title: 'Prompt Typology & Use Cases',
    shortTitle: 'Prompt Types',
    duration: 25,
    description: 'Master 8 essential prompt types and learn when to use each',
    objectives: [
      'Identify and differentiate 8 core prompt types',
      'Select the optimal prompt type for any task',
      'Chain multiple prompt types for complex workflows',
      'Apply prompt patterns to real-world scenarios',
    ],
    badge: '📚',
    xpReward: 150,
    order: 3,
    locked: false,
    lessons: module3Lessons,
    quiz: module3Quiz,
    prerequisites: ['module-1', 'module-2'],
  },
  {
    id: 'module-4',
    title: 'Multi-Model Orchestration Strategy',
    shortTitle: 'Multi-Model',
    duration: 30,
    description: 'Learn to route tasks across GPT-4, Claude, Gemini, and more',
    objectives: [
      'Map AI model strengths to specific task types',
      'Design multi-model validation workflows',
      'Optimize costs across model tiers',
      'Implement intelligent task routing',
    ],
    badge: '🎭',
    xpReward: 200,
    order: 4,
    locked: false,
    lessons: module4Lessons,
    quiz: module4Quiz,
    prerequisites: ['module-1', 'module-2', 'module-3'],
  },
  {
    id: 'module-5',
    title: 'Advanced Techniques & Production Patterns',
    shortTitle: 'Advanced',
    duration: 25,
    description: 'Tree of Thoughts, RAG, fine-tuning, and production deployment',
    objectives: [
      'Apply Tree of Thoughts technique to complex problems',
      'Design production-ready prompt templates with error handling',
      'Understand when to use RAG vs. fine-tuning',
      'Implement A/B testing for prompt optimization',
    ],
    badge: '🏆',
    xpReward: 200,
    order: 5,
    locked: false,
    lessons: module5Lessons,
    quiz: module5Quiz,
    prerequisites: ['module-1', 'module-2', 'module-3', 'module-4'],
  },
  {
    id: 'module-6',
    title: 'The Pharaoh\'s Decree: Capstone Project',
    shortTitle: 'Capstone',
    duration: 30,
    description: 'Design, build, and validate a production-grade prompt workflow for a real-world problem',
    objectives: [
      'Define a measurable problem statement for prompt automation',
      'Architect a multi-step prompt workflow with validation gates',
      'Write production-grade prompt templates with variables and error handling',
      'Test and validate workflow quality using the 5-Point Validation Protocol',
    ],
    badge: '👑',
    xpReward: 300,
    order: 6,
    locked: false,
    lessons: module6Lessons,
    quiz: module6Quiz,
    prerequisites: ['module-1', 'module-2', 'module-3', 'module-4', 'module-5'],
  },
  {
    id: 'module-7',
    title: 'MCP & AI Agents: The Agentic Era',
    shortTitle: 'MCP & Agents',
    duration: 30,
    description: 'Master the Model Context Protocol, AI agents, and context engineering — the future of AI',
    objectives: [
      'Explain MCP architecture and its three capability types (tools, resources, prompts)',
      'Design AI agent workflows using the observe-think-act-evaluate loop',
      'Apply context engineering techniques to optimize agent performance',
      'Build a complete agent system prompt using CCCEFI for tool orchestration',
    ],
    badge: '⚡',
    xpReward: 250,
    order: 7,
    locked: false,
    lessons: module7Lessons,
    quiz: module7Quiz,
    prerequisites: ['module-1', 'module-2', 'module-3', 'module-4', 'module-5', 'module-6'],
  },
  {
    id: 'module-8',
    title: 'LinkedIn Posts Automation with AI',
    shortTitle: 'LinkedIn AI',
    duration: 25,
    description: 'Automate LinkedIn publishing from a Notion content calendar using n8n and AI',
    objectives: [
      'Design a Notion content calendar for automated publishing',
      'Build an n8n workflow for scheduled LinkedIn posting',
      'Use OpenAI to reformat content for professional tone',
      'Extend the workflow for multi-platform publishing',
    ],
    badge: '🔗',
    xpReward: 250,
    order: 8,
    locked: false,
    lessons: module8Lessons,
    quiz: module8Quiz,
    prerequisites: ['module-1', 'module-2', 'module-3', 'module-4', 'module-5', 'module-6', 'module-7'],
  },
  {
    id: 'module-9',
    title: 'YouTube AI Summarization & Analysis',
    shortTitle: 'YouTube AI',
    duration: 25,
    description: 'Process YouTube playlists with AI summarization, vector storage, and RAG-powered Q&A',
    objectives: [
      'Build a transcript processing pipeline with text splitting',
      'Implement map-reduce summarization with Gemini AI',
      'Store content in Qdrant vector database for semantic search',
      'Create a RAG-powered Q&A chatbot over video content',
    ],
    badge: '🎬',
    xpReward: 250,
    order: 9,
    locked: false,
    lessons: module9Lessons,
    quiz: module9Quiz,
    prerequisites: ['module-1', 'module-2', 'module-3', 'module-4', 'module-5', 'module-6', 'module-7', 'module-8'],
  },
  {
    id: 'module-10',
    title: 'Google Maps Lead Generation',
    shortTitle: 'Lead Gen',
    duration: 25,
    description: 'Automate lead generation by scraping Google Maps businesses and extracting validated emails',
    objectives: [
      'Search Google Maps API for targeted business leads',
      'Scrape websites for email addresses using regex extraction',
      'Validate and deduplicate leads with multi-layer filtering',
      'Build a production-ready pipeline with rate limiting and error handling',
    ],
    badge: '📍',
    xpReward: 300,
    order: 10,
    locked: false,
    lessons: module10Lessons,
    quiz: module10Quiz,
    prerequisites: ['module-1', 'module-2', 'module-3', 'module-4', 'module-5', 'module-6', 'module-7', 'module-8', 'module-9'],
  },
  {
    id: 'module-11',
    title: 'AI Agent Chatbot with Long-Term Memory',
    shortTitle: 'AI Chatbot',
    duration: 25,
    description: 'Build a persistent AI assistant with short-term and long-term memory via Telegram',
    objectives: [
      'Implement the ReAct framework for AI agent reasoning',
      'Configure Window Buffer Memory for short-term context',
      'Use Google Docs as a long-term memory store',
      'Deploy a multi-LLM Telegram chatbot to production',
    ],
    badge: '🤖',
    xpReward: 250,
    order: 11,
    locked: false,
    lessons: module11Lessons,
    quiz: module11Quiz,
    prerequisites: ['module-1', 'module-2', 'module-3', 'module-4', 'module-5', 'module-6', 'module-7'],
  },
  {
    id: 'module-12',
    title: 'Social Media Publishing Factory',
    shortTitle: 'Social Factory',
    duration: 25,
    description: 'Orchestrate multi-platform content publishing with AI-adapted posts for every channel',
    objectives: [
      'Design an AI orchestrator agent for content distribution',
      'Build platform-specific sub-workflows with toolWorkflow nodes',
      'Adapt content for X, LinkedIn, Instagram, and Facebook',
      'Automate scheduled publishing with a Notion content calendar',
    ],
    badge: '📱',
    xpReward: 250,
    order: 12,
    locked: false,
    lessons: module12Lessons,
    quiz: module12Quiz,
    prerequisites: ['module-1', 'module-2', 'module-3', 'module-4', 'module-5', 'module-6', 'module-7'],
  },
  {
    id: 'module-13',
    title: 'WhatsApp AI Chatbot',
    shortTitle: 'WhatsApp Bot',
    duration: 25,
    description: 'Production-ready WhatsApp bot handling text, voice, images, and PDFs with AI',
    objectives: [
      'Set up WhatsApp Business API with Meta Developer Portal',
      'Route messages by type using Switch nodes',
      'Transcribe voice with Whisper and analyze images with GPT-4 Vision',
      'Build a unified AI agent that handles all message types',
    ],
    badge: '💬',
    xpReward: 250,
    order: 13,
    locked: false,
    lessons: module13Lessons,
    quiz: module13Quiz,
    prerequisites: ['module-1', 'module-2', 'module-3', 'module-4', 'module-5', 'module-6', 'module-7'],
  },
  {
    id: 'module-14',
    title: 'CV / Resume AI Screening & Tracker',
    shortTitle: 'CV Screening',
    duration: 25,
    description: 'Automated resume screening with AI scoring, folder sorting, and recruiter notifications',
    objectives: [
      'Build a Google Drive trigger for automatic CV processing',
      'Extract text from PDF and DOCX resume files',
      'Implement AI scoring with Accept/KIV/Reject classification',
      'Automate recruiter notifications with assessment summaries',
    ],
    badge: '📄',
    xpReward: 250,
    order: 14,
    locked: false,
    lessons: module14Lessons,
    quiz: module14Quiz,
    prerequisites: ['module-1', 'module-2', 'module-3', 'module-4', 'module-5', 'module-6', 'module-7'],
  },
  {
    id: 'module-15',
    title: 'Financial Tracker: Invoices to Reports',
    shortTitle: 'Finance AI',
    duration: 25,
    description: 'Capture invoices via Telegram, extract data with Gemini AI, and generate weekly reports',
    objectives: [
      'Process invoice photos with Gemini AI structured extraction',
      'Store transactions in a categorized Notion database',
      'Generate weekly financial reports with charts via QuickChart',
      'Build a complete Telegram-to-Notion finance pipeline',
    ],
    badge: '💰',
    xpReward: 250,
    order: 15,
    locked: false,
    lessons: module15Lessons,
    quiz: module15Quiz,
    prerequisites: ['module-1', 'module-2', 'module-3', 'module-4', 'module-5', 'module-6', 'module-7'],
  },
  {
    id: 'module-16',
    title: 'HR Automation Pipeline with AI',
    shortTitle: 'HR Pipeline',
    duration: 25,
    description: 'End-to-end hiring pipeline from application form to AI-powered candidate evaluation',
    objectives: [
      'Build application forms with n8n Form Trigger',
      'Extract structured data with LangChain Information Extractor',
      'Implement AI-powered CV summarization and HR evaluation',
      'Save candidate records to Google Sheets with structured output',
    ],
    badge: '👥',
    xpReward: 250,
    order: 16,
    locked: false,
    lessons: module16Lessons,
    quiz: module16Quiz,
    prerequisites: ['module-1', 'module-2', 'module-3', 'module-4', 'module-5', 'module-6', 'module-7'],
  },
  {
    id: 'module-17',
    title: 'Email Management with AI',
    shortTitle: 'Email AI',
    duration: 25,
    description: 'Intelligent email classification, summarization, vector search, and AI-powered replies',
    objectives: [
      'Configure IMAP triggers for automatic email processing',
      'Classify emails with AI text classification nodes',
      'Store emails in Qdrant vector database for semantic search',
      'Draft AI-powered replies with human-in-the-loop review',
    ],
    badge: '📧',
    xpReward: 300,
    order: 17,
    locked: false,
    lessons: module17Lessons,
    quiz: module17Quiz,
    prerequisites: ['module-1', 'module-2', 'module-3', 'module-4', 'module-5', 'module-6', 'module-7'],
  },
];

// Helper function to get module by ID
export function getModuleById(moduleId: string): Module | undefined {
  return modules.find((m) => m.id === moduleId);
}

// Helper function to get next module
export function getNextModule(currentModuleId: string): Module | undefined {
  const currentModule = getModuleById(currentModuleId);
  if (!currentModule) return undefined;

  return modules.find((m) => m.order === currentModule.order + 1);
}

// Helper function to get previous module
export function getPreviousModule(currentModuleId: string): Module | undefined {
  const currentModule = getModuleById(currentModuleId);
  if (!currentModule) return undefined;

  return modules.find((m) => m.order === currentModule.order - 1);
}
