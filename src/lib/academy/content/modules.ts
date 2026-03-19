/**
 * PromptCraft Academy - Module Definitions
 *
 * All 7 modules with metadata, lessons, and quizzes
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
    locked: true,
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
    locked: true,
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
    locked: true,
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
    locked: true,
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
    locked: true,
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
    locked: true,
    lessons: module7Lessons,
    quiz: module7Quiz,
    prerequisites: ['module-1', 'module-2', 'module-3', 'module-4', 'module-5', 'module-6'],
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
