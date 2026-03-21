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
import { module18Lessons } from './lessons/module-18-lessons';
import { module18Quiz } from './quizzes/module-18-quiz';
import { module19Lessons } from './lessons/module-19-lessons';
import { module19Quiz } from './quizzes/module-19-quiz';
import { module20Lessons } from './lessons/module-20-lessons';
import { module20Quiz } from './quizzes/module-20-quiz';
import { module21Lessons } from './lessons/module-21-lessons';
import { module21Quiz } from './quizzes/module-21-quiz';
import { module22Lessons } from './lessons/module-22-lessons';
import { module22Quiz } from './quizzes/module-22-quiz';
import { module23Lessons } from './lessons/module-23-lessons';
import { module23Quiz } from './quizzes/module-23-quiz';
import { module24Lessons } from './lessons/module-24-lessons';
import { module24Quiz } from './quizzes/module-24-quiz';
import { module25Lessons } from './lessons/module-25-lessons';
import { module25Quiz } from './quizzes/module-25-quiz';
import { module26Lessons } from './lessons/module-26-lessons';
import { module26Quiz } from './quizzes/module-26-quiz';
import { module27Lessons } from './lessons/module-27-lessons';
import { module27Quiz } from './quizzes/module-27-quiz';

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

  // ==========================================================================
  // COURSE 3: n8n + AI Agents (Modules 18-21)
  // ==========================================================================
  {
    id: 'module-18',
    title: 'n8n vs Zapier vs Make — Platform Comparison',
    shortTitle: 'Platform Compare',
    duration: 20,
    description: 'Compare the top automation platforms: features, pricing, AI capabilities, and when to choose each',
    objectives: [
      'Compare n8n, Zapier, and Make across key dimensions',
      'Evaluate pricing models and self-hosting benefits',
      'Identify which platform fits different use cases',
    ],
    badge: '⚖️',
    xpReward: 200,
    order: 18,
    locked: false,
    lessons: module18Lessons,
    quiz: module18Quiz,
    prerequisites: [],
  },
  {
    id: 'module-19',
    title: 'Native AI Agent Nodes in n8n',
    shortTitle: 'AI Nodes',
    duration: 25,
    description: 'Master n8n\'s built-in AI agent nodes: ReAct framework, tool calling, memory, and LLM integration',
    objectives: [
      'Configure AI Agent nodes with the ReAct framework',
      'Connect built-in tools: Calculator, Code, HTTP, Workflow',
      'Build a complete AI agent with memory and output parsing',
    ],
    badge: '🤖',
    xpReward: 250,
    order: 19,
    locked: false,
    lessons: module19Lessons,
    quiz: module19Quiz,
    prerequisites: ['module-18'],
  },
  {
    id: 'module-20',
    title: 'MCP Integration in n8n',
    shortTitle: 'MCP in n8n',
    duration: 25,
    description: 'Use MCP Server Trigger to expose workflows to AI clients and MCP Client node to consume external servers',
    objectives: [
      'Explain MCP architecture: tools, resources, and prompts',
      'Expose n8n workflows as MCP tools via MCP Server Trigger',
      'Consume external MCP servers from within n8n workflows',
    ],
    badge: '🔌',
    xpReward: 250,
    order: 20,
    locked: false,
    lessons: module20Lessons,
    quiz: module20Quiz,
    prerequisites: ['module-18', 'module-19'],
  },
  {
    id: 'module-21',
    title: 'Human-in-the-Loop & Production Guardrails',
    shortTitle: 'Guardrails',
    duration: 25,
    description: 'Implement approval workflows, safety guardrails, monitoring, and production-ready agent patterns',
    objectives: [
      'Design human-in-the-loop approval and escalation patterns',
      'Implement input validation, output filtering, and rate limiting',
      'Set up monitoring, alerting, and performance tracking',
    ],
    badge: '🛡️',
    xpReward: 250,
    order: 21,
    locked: false,
    lessons: module21Lessons,
    quiz: module21Quiz,
    prerequisites: ['module-18', 'module-19', 'module-20'],
  },

  // ==========================================================================
  // COURSE 4: AI Awareness & Career Skills (Modules 22-24)
  // ==========================================================================
  {
    id: 'module-22',
    title: 'Understanding AI Agents — The Big Picture',
    shortTitle: 'AI Big Picture',
    duration: 25,
    description: 'What AI agents are, the major players (Anthropic, OpenAI, Google, Microsoft, Meta), and the agentic era',
    objectives: [
      'Explain the difference between chatbots and AI agents',
      'Map the AI landscape: key companies and their strengths',
      'Understand core AI concepts without technical jargon',
      'Describe what the agentic era means for business and society',
    ],
    badge: '🧠',
    xpReward: 200,
    order: 22,
    locked: false,
    lessons: module22Lessons,
    quiz: module22Quiz,
    prerequisites: [],
  },
  {
    id: 'module-23',
    title: 'The AI Tool Ecosystem',
    shortTitle: 'AI Tools',
    duration: 20,
    description: 'MCP explained simply, n8n for everyone, and how Claude Cowork is reshaping enterprise AI',
    objectives: [
      'Explain MCP as "USB-C for AI" to non-technical audiences',
      'Describe what n8n automation can do for any job role',
      'Compare Claude Cowork, Copilot Cowork, and other AI assistants',
    ],
    badge: '🔧',
    xpReward: 200,
    order: 23,
    locked: false,
    lessons: module23Lessons,
    quiz: module23Quiz,
    prerequisites: ['module-22'],
  },
  {
    id: 'module-24',
    title: 'Career Skills for the Agentic Era',
    shortTitle: 'AI Careers',
    duration: 20,
    description: 'Which jobs change, what skills to build, and your practical action plan for the AI-powered future',
    objectives: [
      'Identify which roles are augmented vs automated by AI',
      'Build the five essential skills for the agentic era',
      'Create a personal AI action plan with concrete next steps',
    ],
    badge: '🚀',
    xpReward: 200,
    order: 24,
    locked: false,
    lessons: module24Lessons,
    quiz: module24Quiz,
    prerequisites: ['module-22', 'module-23'],
  },

  // ==========================================================================
  // COURSE 5: Claude Cowork Mastery (Modules 25-27)
  // ==========================================================================
  {
    id: 'module-25',
    title: 'Introduction to Claude Cowork',
    shortTitle: 'Cowork Intro',
    duration: 25,
    description: 'The January 2026 launch, folder-based sandboxing, and why it triggered a $285B enterprise selloff',
    objectives: [
      'Explain what Claude Cowork does and how it was built',
      'Describe the folder-based sandboxing architecture',
      'Analyze the market impact and enterprise software disruption',
    ],
    badge: '🏗️',
    xpReward: 200,
    order: 25,
    locked: false,
    lessons: module25Lessons,
    quiz: module25Quiz,
    prerequisites: [],
  },
  {
    id: 'module-26',
    title: 'Connectors & Custom Plugins',
    shortTitle: 'Connectors',
    duration: 25,
    description: 'Google Drive, Slack, DocuSign, Salesforce connectors and building custom Cowork plugins',
    objectives: [
      'Configure core connectors: Google Drive, Slack, DocuSign, Salesforce',
      'Build custom Cowork plugins with the plugin API',
      'Design multi-connector workflows for enterprise use cases',
    ],
    badge: '🔗',
    xpReward: 250,
    order: 26,
    locked: false,
    lessons: module26Lessons,
    quiz: module26Quiz,
    prerequisites: ['module-25'],
  },
  {
    id: 'module-27',
    title: 'Enterprise Workflows & the AI Coworker Wars',
    shortTitle: 'Enterprise AI',
    duration: 25,
    description: 'Production workflows, Microsoft\'s Copilot Cowork response, and choosing your AI coworker platform',
    objectives: [
      'Design production workflows for contract review, sales, and support',
      'Compare Cowork vs Copilot Cowork vs Manus vs OpenClaw',
      'Build a decision framework for choosing an AI coworker platform',
    ],
    badge: '👑',
    xpReward: 300,
    order: 27,
    locked: false,
    lessons: module27Lessons,
    quiz: module27Quiz,
    prerequisites: ['module-25', 'module-26'],
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
