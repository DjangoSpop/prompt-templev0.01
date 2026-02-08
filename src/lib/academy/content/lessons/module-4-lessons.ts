/**
 * Module 4: Multi-Model Orchestration Strategy - Lesson Content
 * Duration: 30 minutes | 5 Lessons
 */

import type { Lesson } from '../../types';

export const module4Lessons: Lesson[] = [
  {
    id: 'lesson-4-1',
    moduleId: 'module-4',
    title: 'Why Multiple AI Models?',
    estimatedTime: 6,
    order: 1,
    xpReward: 35,
    content: [
      {
        type: 'text',
        value: 'No single AI model is best at everything. Different models have different strengths, costs, and capabilities. Multi-model orchestration means using the right tool for each job.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Model Landscape (2024-2025)',
      },
      {
        type: 'heading',
        level: 3,
        value: 'GPT-4 (OpenAI)',
      },
      {
        type: 'list',
        items: [
          '**Strengths:** Creative writing, complex reasoning, broad general knowledge',
          '**Best for:** Content creation, brainstorming, conversational AI',
          '**Cost:** High ($0.03 per 1K tokens)',
          '**Context window:** 128K tokens',
        ],
      },
      {
        type: 'heading',
        level: 3,
        value: 'Claude (Anthropic)',
      },
      {
        type: 'list',
        items: [
          '**Strengths:** Long document analysis, instruction-following, safety',
          '**Best for:** Document processing, analysis, coding',
          '**Cost:** Medium ($0.015 per 1K tokens)',
          '**Context window:** 200K tokens',
        ],
      },
      {
        type: 'heading',
        level: 3,
        value: 'Gemini (Google)',
      },
      {
        type: 'list',
        items: [
          '**Strengths:** Multimodal (text + images), fast, Google integration',
          '**Best for:** Image understanding, real-time applications, research',
          '**Cost:** Low to Medium',
          '**Context window:** 1M tokens',
        ],
      },
      {
        type: 'heading',
        level: 3,
        value: 'DeepSeek/Open-Source Models',
      },
      {
        type: 'list',
        items: [
          '**Strengths:** Cost-effective, customizable, self-hosted option',
          '**Best for:** Bulk processing, specialized tasks, privacy-sensitive work',
          '**Cost:** Very low (often free)',
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Key Insight',
        text: 'Each model was trained differently, on different data, with different objectives. This creates unique capabilities—and unique blind spots.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'When to Use Multiple Models',
      },
      {
        type: 'list',
        items: [
          '**Validation:** Run critical tasks through 2-3 models and compare results',
          '**Triangulation:** Combine insights from different models for comprehensive analysis',
          '**Cost optimization:** Use cheaper models for simple tasks, expensive for complex',
          '**Specialized tasks:** Route each task to the model best suited for it',
          '**Redundancy:** Fallback to another model if primary fails',
        ],
      },
    ],
  },

  {
    id: 'lesson-4-2',
    moduleId: 'module-4',
    title: 'Task Routing Strategies',
    estimatedTime: 6,
    order: 2,
    xpReward: 35,
    content: [
      {
        type: 'text',
        value: 'Task routing means matching each task to the optimal AI model. Think of it like choosing the right specialist for a medical problem.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Rule-Based Routing',
      },
      {
        type: 'text',
        value: 'Create simple if-then rules for which model to use.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'IF task = "creative writing" THEN use GPT-4\nIF task = "long document analysis" THEN use Claude\nIF task = "image understanding" THEN use Gemini\nIF task = "bulk data processing" THEN use DeepSeek',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Cost-Based Routing',
      },
      {
        type: 'text',
        value: 'Use the cheapest model that meets your quality requirements.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Example Routing Logic:\n\n1. Try DeepSeek (free/cheap)\n2. If quality < threshold, try GPT-3.5 (medium cost)\n3. If still not good enough, try GPT-4 (expensive)\n\nResult: 80% of tasks handled by cheaper models, 20% escalate to premium.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Capability-Based Routing',
      },
      {
        type: 'text',
        value: 'Route based on specific model capabilities.',
      },
      {
        type: 'list',
        items: [
          'Need 100K+ token context? → Claude or Gemini',
          'Need image analysis? → Gemini or GPT-4 Vision',
          'Need code generation? → Claude or GPT-4',
          'Need factual accuracy? → Perplexity or Gemini',
        ],
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Real Example: Content Agency',
        text: 'A content agency routes: First drafts → GPT-4 (creative), Editing → Claude (instruction-following), SEO optimization → Gemini (Google integration), Fact-checking → Perplexity. Cost savings: 40%, quality: improved.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Fallback Chains',
      },
      {
        type: 'text',
        value: 'If primary model fails or is unavailable, automatically fall back to alternatives.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Primary: Claude\n  ↓ (if error/timeout)\nFallback 1: GPT-4\n  ↓ (if error/timeout)\nFallback 2: Gemini\n  ↓ (if all fail)\nError handling',
      },
    ],
  },

  {
    id: 'lesson-4-3',
    moduleId: 'module-4',
    title: 'Triangulation & Validation',
    estimatedTime: 6,
    order: 3,
    xpReward: 35,
    content: [
      {
        type: 'text',
        value: 'Triangulation means running the same prompt through multiple models and synthesizing their outputs. This is especially powerful for high-stakes decisions.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Triangulation Process',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Run identical prompt through 3+ models',
          'Compare outputs for consistency',
          'Identify areas of agreement (high confidence)',
          'Identify areas of disagreement (dig deeper)',
          'Synthesize insights from all models',
        ],
      },
      {
        type: 'code',
        language: 'text',
        code: 'Example: Market Analysis\n\nPrompt (sent to GPT-4, Claude, Gemini):\n"Analyze the electric vehicle market for 2025. What are the top 3 trends and top 3 risks?"\n\nGPT-4 says: Trends - battery tech, charging infrastructure, govt policy\nClaude says: Trends - battery tech, consumer adoption, supply chain\nGemini says: Trends - battery tech, charging infrastructure, consumer adoption\n\nSynthesis: All agree on battery tech = high confidence. Charging infrastructure (2/3) = likely important. Supply chain (1/3) = worth investigating but less certain.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'When to Triangulate',
        text: 'Use triangulation for: Strategic decisions, fact-checking, novel analysis, high-stakes content, and when you need multiple perspectives. Don\'t triangulate for simple tasks—it\'s overkill.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Ensemble Methods',
      },
      {
        type: 'heading',
        level: 3,
        value: 'Voting',
      },
      {
        type: 'text',
        value: 'For classification or yes/no decisions, take the majority vote.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Task: "Is this email spam?"\n\nGPT-4: Yes (spam)\nClaude: Yes (spam)\nGemini: No (not spam)\n\nMajority vote: Spam (2/3)\nConfidence: Medium (not unanimous)',
      },
      {
        type: 'heading',
        level: 3,
        value: 'Averaging',
      },
      {
        type: 'text',
        value: 'For numerical outputs, average the results.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Task: "Rate this product review sentiment 0-100"\n\nGPT-4: 75\nClaude: 82\nGemini: 79\n\nAverage: 78.7 (more reliable than any single model)',
      },
      {
        type: 'heading',
        level: 3,
        value: 'Validation (Judge Model)',
      },
      {
        type: 'text',
        value: 'Use one model to validate another\'s output.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Step 1: GPT-4 generates content\nStep 2: Claude reviews for accuracy/completeness\nStep 3: Human reviews only flagged issues\n\nResult: Catch 90% of errors with minimal human time.',
      },
    ],
  },

  {
    id: 'lesson-4-4',
    moduleId: 'module-4',
    title: 'Cost Optimization Strategies',
    estimatedTime: 6,
    order: 4,
    xpReward: 35,
    content: [
      {
        type: 'text',
        value: 'Multi-model orchestration can either save money or cost a fortune. The key is intelligent routing.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The 80/20 Principle',
      },
      {
        type: 'text',
        value: '80% of tasks can use cheaper models. 20% require premium models. Route accordingly.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Example Workflow:\n\n1. Classification/tagging → DeepSeek (free)\n2. Simple summaries → GPT-3.5 ($0.001/1K)\n3. Complex analysis → Claude ($0.015/1K)\n4. Creative content → GPT-4 ($0.03/1K)\n\nCost savings vs. all GPT-4: 60-70%',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Caching Strategies',
      },
      {
        type: 'list',
        items: [
          '**Prompt caching:** Reuse common prompts across tasks',
          '**Response caching:** Store responses for repeated queries',
          '**Partial caching:** Cache context, regenerate only the variable part',
        ],
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Real Savings',
        text: 'A legal tech company reduced API costs from $12K/month to $4K/month by routing simple contract reviews to cheaper models and reserving GPT-4 for complex analysis. No quality loss.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Batch Processing',
      },
      {
        type: 'text',
        value: 'Group similar tasks and process in batches with cheaper models.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Instead of:\n100 individual API calls to GPT-4 ($3.00)\n\nUse:\n1 batch call to Claude with all 100 items ($1.50)\n\nSavings: 50%',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Smart Model Selection',
      },
      {
        type: 'text',
        value: 'Ask: "What\'s the minimum model capability needed for this task?"',
      },
      {
        type: 'list',
        items: [
          'Typo fixing? → Smallest model',
          'Translation? → Medium model',
          'Creative writing? → Premium model',
          'Novel research? → Premium model',
        ],
      },
    ],
  },

  {
    id: 'lesson-4-5',
    moduleId: 'module-4',
    title: 'Real-World Orchestration Patterns',
    estimatedTime: 6,
    order: 5,
    xpReward: 35,
    content: [
      {
        type: 'text',
        value: 'Let\'s see how real companies and tools orchestrate multiple models to achieve better results at lower cost.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Pattern 1: Sequential Processing Pipeline',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Content Creation Pipeline:\n\n1. Outline → Gemini (fast, cheap)\n2. Draft → GPT-4 (creative)\n3. Edit → Claude (instruction-following)\n4. SEO optimize → Gemini (Google integration)\n5. Fact-check → Perplexity (accuracy)\n\nEach model handles what it does best.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Pattern 2: Parallel Processing + Synthesis',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Research Task:\n\nPrompt sent to all 3 models simultaneously:\n├── GPT-4: Generates insights\n├── Claude: Analyzes data\n└── Gemini: Fact-checks claims\n\nThen: Human synthesizes all 3 perspectives\n\nResult: Comprehensive, validated research in half the time.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Pattern 3: Escalation Workflow',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Customer Support:\n\nTier 1: Simple model handles FAQs (80% of queries)\n  ↓ (if confidence < 80%)\nTier 2: GPT-4 handles complex issues (15% of queries)\n  ↓ (if cannot resolve)\nTier 3: Human agent (5% of queries)\n\nCost: 90% lower than all-GPT-4\nQuality: Same or better',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Pattern 4: Specialist Router',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Task Categorization:\n\nIncoming task → Classifier determines type\n├── Code task → Claude (best at code)\n├── Creative → GPT-4 (best at creative)\n├── Research → Gemini (best at facts)\n└── Data → Local model (privacy)\n\nAutomatic routing to optimal model.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'PromptCraft\'s Architecture',
        text: 'PromptCraft Extension uses a hybrid approach: Quick tasks → GPT-3.5, Analysis → Claude, Creative → GPT-4, Validation → Cross-model comparison. This provides best-in-class results at sustainable costs.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Designing Your Orchestra',
      },
      {
        type: 'text',
        value: 'Steps to design your multi-model strategy:',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Map your use cases (what tasks do you run regularly?)',
          'Categorize by complexity (simple, medium, complex)',
          'Assign models based on capability + cost',
          'Set up fallback chains for reliability',
          'Monitor: Track cost, quality, speed',
          'Optimize: Adjust routing based on performance data',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Avoid Premature Optimization',
        text: 'Start simple. Use one good model (like GPT-4 or Claude) until you have clear cost/quality pain points. Then optimize. Don\'t over-engineer from day one.',
      },
    ],
  },
];
