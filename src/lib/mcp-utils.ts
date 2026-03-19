import type { PromptDifficulty, PromptUseCase, AcademyLevel } from '@/types/mcp';

/**
 * Replace {{variables}} in a prompt template with user values.
 * Unfilled variables remain as highlighted placeholders.
 */
export function renderPromptTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key]?.trim() || match;
  });
}

/**
 * Extract all {{variable}} names from a template string.
 */
export function extractVariableNames(template: string): string[] {
  const matches = template.match(/\{\{(\w+)\}\}/g) || [];
  return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))];
}

/**
 * Difficulty badge color mapping.
 */
export const DIFFICULTY_CONFIG: Record<
  PromptDifficulty,
  { label: string; color: string; bg: string }
> = {
  beginner: {
    label: 'Beginner',
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  intermediate: {
    label: 'Intermediate',
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  advanced: {
    label: 'Advanced',
    color: 'text-orange-700 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
  },
  expert: {
    label: 'Expert',
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
  },
};

/**
 * Use case display name mapping.
 */
export const USE_CASE_LABELS: Record<PromptUseCase, string> = {
  mcp_server_build: 'Build an MCP Server',
  mcp_client_config: 'MCP Client Config',
  agent_design: 'Design an AI Agent',
  tool_creation: 'Create MCP Tools',
  prompt_engineering: 'Prompt Engineering',
  multi_agent: 'Multi-Agent Orchestration',
  context_engineering: 'Context Engineering',
  security_audit: 'Security Audit',
  migration: 'API-to-MCP Migration',
  testing: 'Testing & Validation',
  monitoring: 'Monitoring & Observability',
  enterprise_deploy: 'Enterprise Deployment',
  workflow_automation: 'Workflow Automation',
  data_pipeline: 'Data Pipeline',
  code_review: 'Code Review Agent',
  customer_support: 'Support Agent',
  content_creation: 'Content Creation',
  research_agent: 'Research Agent',
  devops_agent: 'DevOps Agent',
  marketing_agent: 'Marketing Agent',
};

/**
 * Academy level config.
 */
export const LEVEL_CONFIG: Record<
  AcademyLevel,
  { label: string; color: string; bg: string }
> = {
  awareness: {
    label: 'Awareness',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
  },
  practitioner: {
    label: 'Practitioner',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
  },
  expert: {
    label: 'Expert',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
  },
  architect: {
    label: 'Architect',
    color: 'text-[#C9A227]',
    bg: 'bg-[#C9A227]/10',
  },
};

/**
 * Section titles for the MCP Awareness course.
 */
export const COURSE_SECTION_TITLES: Record<number, string> = {
  1: 'The Big Picture',
  2: 'Core Concepts',
  3: 'The Agentic World',
  4: 'Getting Started',
};

/**
 * AI model badge colors.
 */
export const MODEL_COLORS: Record<string, string> = {
  claude: 'bg-[#D97706]/10 text-[#D97706]',
  gpt4: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  deepseek: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  gemini: 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
};
