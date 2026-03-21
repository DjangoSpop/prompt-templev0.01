/**
 * Course Catalog - Groups modules into distinct course tracks
 *
 * Course 1: Prompt Engineering Mastery (modules 1-7) — FREE
 * Course 2: n8n Professional Automation (modules 8-17) — FREE
 * Course 3: n8n + AI Agents (modules 18-21) — FREE
 * Course 4: AI Awareness & Career Skills (modules 22-24) — FREE
 * Course 5: Claude Cowork Mastery (modules 25-27) — FREE
 * Course 6: MCP Deep Dive (coming soon) — PREMIUM
 * Course 7: Multi-Agent A2A Systems (coming soon) — PREMIUM
 * Course 8: Context Engineering (coming soon) — PREMIUM
 */

export interface Course {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  emoji: string;
  color: 'gold' | 'teal' | 'blue' | 'purple' | 'green' | 'orange';
  moduleIds: string[];
  tags: string[];
  estimatedHours: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  isFree: boolean;
  isComingSoon: boolean;
  badge: {
    name: string;
    emoji: string;
  };
}

export const courses: Course[] = [
  {
    id: 'course-prompt-engineering',
    title: 'Prompt Engineering Mastery',
    shortTitle: 'Prompt Engineering',
    description: 'From zero to expert prompt engineer. Master the CCCEFI framework, prompt typology, multi-model orchestration, and production patterns.',
    emoji: '🏛️',
    color: 'gold',
    moduleIds: ['module-1', 'module-2', 'module-3', 'module-4', 'module-5', 'module-6', 'module-7'],
    tags: ['GPT-4', 'Claude', 'Gemini', 'CCCEFI', 'Production'],
    estimatedHours: 3,
    level: 'beginner',
    isFree: true,
    isComingSoon: false,
    badge: { name: 'Bronze Scarab', emoji: '🪲' },
  },
  {
    id: 'course-n8n-professional',
    title: 'n8n Professional Automation',
    shortTitle: 'n8n Pro',
    description: '10 real-world automation workflows: AI chatbots, social media factories, lead generation, HR pipelines, and financial tracking — all powered by n8n.',
    emoji: '⚡',
    color: 'orange',
    moduleIds: [
      'module-8', 'module-9', 'module-10', 'module-11', 'module-12',
      'module-13', 'module-14', 'module-15', 'module-16', 'module-17',
    ],
    tags: ['n8n', 'OpenAI', 'Telegram', 'LinkedIn', 'WhatsApp'],
    estimatedHours: 4,
    level: 'intermediate',
    isFree: true,
    isComingSoon: false,
    badge: { name: 'Silver Ankh', emoji: '☥' },
  },
  {
    id: 'course-n8n-ai-agents',
    title: 'n8n + AI Agents',
    shortTitle: 'AI Agents',
    description: 'Build production AI agents with n8n. Native AI nodes, MCP Server & Client integration, human-in-the-loop patterns, and guardrails for safe deployment.',
    emoji: '🤖',
    color: 'purple',
    moduleIds: ['module-18', 'module-19', 'module-20', 'module-21'],
    tags: ['n8n', 'MCP', 'AI Agents', 'Guardrails', 'LangChain'],
    estimatedHours: 3,
    level: 'intermediate',
    isFree: true,
    isComingSoon: false,
    badge: { name: 'Gold Eye of Horus', emoji: '𓂀' },
  },
  {
    id: 'course-ai-awareness',
    title: 'AI Awareness & Career Skills',
    shortTitle: 'AI Awareness',
    description: 'The non-technical overview for every user. Understand AI agents, the big players, how MCP + n8n + Cowork fit together, and career skills for the agentic era.',
    emoji: '🧠',
    color: 'teal',
    moduleIds: ['module-22', 'module-23', 'module-24'],
    tags: ['Non-Technical', 'Career', 'AI Landscape', 'Strategy'],
    estimatedHours: 2,
    level: 'beginner',
    isFree: true,
    isComingSoon: false,
    badge: { name: 'Wisdom Scroll', emoji: '📜' },
  },
  {
    id: 'course-claude-cowork',
    title: 'Claude Cowork Mastery',
    shortTitle: 'Cowork',
    description: 'Master Claude Cowork — folder-based sandboxing, connectors for Google Drive, Slack, DocuSign & Salesforce, custom plugins, and enterprise workflows.',
    emoji: '🏗️',
    color: 'blue',
    moduleIds: ['module-25', 'module-26', 'module-27'],
    tags: ['Claude', 'Cowork', 'Plugins', 'Enterprise', 'Connectors'],
    estimatedHours: 2,
    level: 'intermediate',
    isFree: true,
    isComingSoon: false,
    badge: { name: 'Lapis Crown', emoji: '👑' },
  },
  {
    id: 'course-mcp-deep-dive',
    title: 'MCP Protocol Deep Dive',
    shortTitle: 'MCP Deep Dive',
    description: 'Advanced Model Context Protocol internals — building custom MCP servers, security models, transport layers, and enterprise integration patterns.',
    emoji: '🔌',
    color: 'purple',
    moduleIds: [],
    tags: ['MCP', 'Protocol', 'Security', 'Advanced'],
    estimatedHours: 4,
    level: 'advanced',
    isFree: false,
    isComingSoon: true,
    badge: { name: 'Pharaoh Crown', emoji: '𓋹' },
  },
  {
    id: 'course-multi-agent-a2a',
    title: 'Multi-Agent A2A Systems',
    shortTitle: 'A2A Systems',
    description: 'Design and deploy multi-agent systems using Google\'s Agent-to-Agent protocol. Orchestration, communication patterns, and production architectures.',
    emoji: '🕸️',
    color: 'green',
    moduleIds: [],
    tags: ['A2A', 'Multi-Agent', 'Orchestration', 'Google'],
    estimatedHours: 5,
    level: 'advanced',
    isFree: false,
    isComingSoon: true,
    badge: { name: 'Pharaoh Crown', emoji: '𓋹' },
  },
  {
    id: 'course-context-engineering',
    title: 'Context Engineering',
    shortTitle: 'Context Eng',
    description: 'The art and science of context engineering — token budgets, retrieval strategies, context window optimization, and prompt caching for production AI.',
    emoji: '🧬',
    color: 'gold',
    moduleIds: [],
    tags: ['Context', 'RAG', 'Tokens', 'Optimization'],
    estimatedHours: 4,
    level: 'advanced',
    isFree: false,
    isComingSoon: true,
    badge: { name: 'Pharaoh Crown', emoji: '𓋹' },
  },
];

export function getCourseById(courseId: string): Course | undefined {
  return courses.find((c) => c.id === courseId);
}

export function getCourseForModule(moduleId: string): Course | undefined {
  return courses.find((c) => c.moduleIds.includes(moduleId));
}
