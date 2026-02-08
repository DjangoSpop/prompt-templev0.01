/**
 * Module 3: Prompt Typology & Use Cases - Lesson Content
 * Duration: 25 minutes | 5 Lessons
 */

import type { Lesson } from '../../types';

export const module3Lessons: Lesson[] = [
  // ==========================================================================
  // LESSON 3.1: The 8 Essential Prompt Types
  // ==========================================================================
  {
    id: 'lesson-3-1',
    moduleId: 'module-3',
    title: 'The 8 Essential Prompt Types',
    estimatedTime: 5,
    order: 1,
    xpReward: 30,
    content: [
      {
        type: 'text',
        value: 'Not all prompts are created equal. Different tasks require different prompt structures. Understanding the 8 core prompt types helps you choose the right tool for each job.',
      },
      {
        type: 'heading',
        level: 2,
        value: '1. Instructional Prompts',
      },
      {
        type: 'text',
        value: 'Direct commands telling the AI exactly what to do. Best for straightforward, single-step tasks.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Example: "Summarize this article in 3 bullet points."\nExample: "Translate this email to Spanish."\nExample: "Extract all email addresses from this text."',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'When to Use',
        text: 'Use instructional prompts when the task is clear, simple, and doesn\'t require context or creativity.',
      },
      {
        type: 'heading',
        level: 2,
        value: '2. Role-Based Prompts',
      },
      {
        type: 'text',
        value: 'Ask the AI to adopt a specific persona or expertise. Taps into the AI\'s training on that role.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Example: "Act as an experienced financial advisor. Review this investment portfolio and suggest rebalancing strategies."\nExample: "You are a skeptical journalist. Identify potential weaknesses in this press release."',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Power Tip',
        text: 'Role-based prompts work because AI models are trained on vast amounts of role-specific text. Saying "act as a lawyer" activates patterns from legal documents.',
      },
      {
        type: 'heading',
        level: 2,
        value: '3. Constrained Output Prompts',
      },
      {
        type: 'text',
        value: 'Heavy focus on format and structure. Best for data extraction, API responses, or strict formatting needs.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Example: "Return ONLY valid JSON with keys: name, email, phone. No additional text."\nExample: "List exactly 5 items, numbered, with no explanations."',
      },
      {
        type: 'heading',
        level: 2,
        value: '4. Few-Shot Prompts',
      },
      {
        type: 'text',
        value: 'Provide examples for the AI to learn from. Pattern-based learning.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Example:\n"Classify these customer reviews as Positive, Neutral, or Negative:\n\nReview: \'Amazing product, works perfectly!\' → Positive\nReview: \'It\'s okay, nothing special.\' → Neutral\nReview: \'Completely broken, waste of money.\' → Negative\n\nNow classify: \'Best purchase I made this year!\'"',
      },
      {
        type: 'heading',
        level: 2,
        value: '5. Chain-of-Thought Prompts',
      },
      {
        type: 'text',
        value: 'Explicitly ask the AI to show its reasoning step-by-step. Dramatically improves accuracy on complex reasoning tasks.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Example: "Solve this problem step-by-step, showing your reasoning:\n\nIf a train leaves Chicago at 60 mph heading west, and another leaves Denver at 80 mph heading east, when will they meet? Chicago to Denver is 1,000 miles.\n\nThink through this step by step."',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Magic Phrase',
        text: 'Adding "Let\'s think step by step" or "Show your reasoning" can improve accuracy by 20-30% on math and logic tasks.',
      },
      {
        type: 'heading',
        level: 2,
        value: '6. Conversational Prompts',
      },
      {
        type: 'text',
        value: 'Multi-turn dialogue where each response builds on the previous. Best for exploratory tasks.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Prompt 1: "What are the main causes of customer churn in SaaS?"\nPrompt 2: "Focus on the onboarding phase. What specific issues happen there?"\nPrompt 3: "Design a 3-step solution to fix onboarding churn."',
      },
      {
        type: 'heading',
        level: 2,
        value: '7. Creative Prompts',
      },
      {
        type: 'text',
        value: 'Open-ended prompts for brainstorming, ideation, or content creation. Less constraints, more freedom.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Example: "Generate 10 creative tagline ideas for an eco-friendly water bottle brand targeting millennials."\nExample: "Write a compelling opening paragraph for a mystery novel set in 1920s Paris."',
      },
      {
        type: 'heading',
        level: 2,
        value: '8. Zero-Shot Prompts',
      },
      {
        type: 'text',
        value: 'No examples, no context—just the task. Relies entirely on the AI\'s training. Works for common, well-understood tasks.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Example: "What is photosynthesis?"\nExample: "Define machine learning."',
      },
    ],
  },

  // ==========================================================================
  // LESSON 3.2: Choosing the Right Prompt Type
  // ==========================================================================
  {
    id: 'lesson-3-2',
    moduleId: 'module-3',
    title: 'Decision Tree: Which Prompt Type to Use?',
    estimatedTime: 5,
    order: 2,
    xpReward: 30,
    content: [
      {
        type: 'text',
        value: 'Choosing the right prompt type dramatically affects output quality. Here\'s a decision framework:',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Start Here: What\'s Your Goal?',
      },
      {
        type: 'heading',
        level: 3,
        value: 'Goal: Get Information or Explanation',
      },
      {
        type: 'list',
        items: [
          'Simple fact? → Zero-shot instructional',
          'Complex analysis? → Chain-of-thought',
          'Expert perspective? → Role-based',
        ],
      },
      {
        type: 'code',
        language: 'text',
        code: 'Zero-shot: "What is quantum computing?"\nChain-of-thought: "Explain how quantum computing could break RSA encryption. Think through this step by step."\nRole-based: "Act as a quantum physicist. Explain quantum entanglement to a high school student."',
      },
      {
        type: 'heading',
        level: 3,
        value: 'Goal: Create Content',
      },
      {
        type: 'list',
        items: [
          'Match specific style? → Few-shot (provide examples)',
          'Open-ended creativity? → Creative prompt',
          'Structured output? → Constrained output',
        ],
      },
      {
        type: 'code',
        language: 'text',
        code: 'Few-shot: Show 3 examples of your brand voice, ask for similar content\nCreative: "Brainstorm 20 blog post ideas for a fitness blog"\nConstrained: "Write a product description in exactly 50 words, formatted as a single paragraph"',
      },
      {
        type: 'heading',
        level: 3,
        value: 'Goal: Analyze or Process Data',
      },
      {
        type: 'list',
        items: [
          'Pattern recognition? → Few-shot',
          'Structured extraction? → Constrained output',
          'Deep analysis? → Role-based + Chain-of-thought',
        ],
      },
      {
        type: 'heading',
        level: 3,
        value: 'Goal: Solve a Problem',
      },
      {
        type: 'list',
        items: [
          'Math or logic? → Chain-of-thought',
          'Strategic planning? → Role-based',
          'Exploratory? → Conversational (multi-turn)',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Combine Types!',
        text: 'The most powerful prompts often combine types. Example: Role-based + Few-shot + Chain-of-thought: "Act as a data scientist. Here are 3 examples of how we\'ve analyzed customer data [examples]. Now analyze this new dataset, thinking through your methodology step by step."',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Quick Reference Table',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Task Type          | Best Prompt Type\n-------------------|----------------------------------\nTranslation        | Instructional (zero-shot)\nStyle matching     | Few-shot\nBrainstorming      | Creative\nMath problems      | Chain-of-thought\nExpert analysis    | Role-based\nData extraction    | Constrained output\nExploration        | Conversational\nSimple facts       | Zero-shot instructional',
      },
    ],
  },

  // ==========================================================================
  // LESSON 3.3: Prompt Chaining for Complex Workflows
  // ==========================================================================
  {
    id: 'lesson-3-3',
    moduleId: 'module-3',
    title: 'Prompt Chaining: Multi-Step Workflows',
    estimatedTime: 5,
    order: 3,
    xpReward: 30,
    content: [
      {
        type: 'text',
        value: 'Prompt chaining breaks complex tasks into a sequence of simpler prompts. Each step builds on the previous, creating a workflow.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Why Chain Prompts?',
      },
      {
        type: 'list',
        items: [
          'Complex tasks overwhelm a single prompt',
          'Each step can use the optimal prompt type',
          'Easier to debug (isolate which step failed)',
          'Better quality control (review each stage)',
          'Reusable components (same chain for similar tasks)',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'Example 1: Content Creation Chain',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Step 1 (Brainstorming - Creative):\n"Generate 10 blog post topics about AI in healthcare."\n\nStep 2 (Selection - Instructional):\n"From this list [paste topics], rank the top 3 by potential reader engagement. Explain your reasoning."\n\nStep 3 (Outlining - Constrained):\n"Create a detailed outline for this topic: [chosen topic]. Use this format:\n## Introduction\n## 3-5 Main Sections\n## Conclusion\nInclude 3-4 bullet points under each section."\n\nStep 4 (Writing - Few-shot):\n"Write the introduction section. Match this tone: [provide example]. 150 words."\n\nStep 5 (Polish - Role-based):\n"Act as an editor. Review this draft and suggest improvements for clarity and engagement."',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Example 2: Data Analysis Chain',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Step 1 (Extraction - Constrained):\n"Extract key metrics from this sales report: [paste report]. Return as JSON with keys: revenue, customers, conversion_rate, avg_order_value."\n\nStep 2 (Analysis - Chain-of-thought):\n"Analyze these metrics [paste JSON]. Identify trends and anomalies. Think through this step by step."\n\nStep 3 (Recommendations - Role-based):\n"Act as a sales strategist. Based on this analysis [paste], recommend 3 action items to improve conversion rate. Prioritize by impact vs. effort."\n\nStep 4 (Reporting - Constrained):\n"Create an executive summary. Format:\n## Key Findings (3 bullets)\n## Recommendations (3 bullets)\n## Next Steps\nKeep under 200 words."',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Pro Tip: Save Successful Chains',
        text: 'When you discover an effective chain, document it as a template. Use the same structure for similar tasks. Example: "Blog Post Creation Chain", "Competitive Analysis Chain", "Meeting Prep Chain".',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Chain Design Principles',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Start broad, narrow down: Brainstorm → Select → Refine',
          'Each step has ONE clear output',
          'Pass context forward: Reference previous outputs',
          'Use checkpoints: Review output before next step',
          'Document the chain: Save as reusable template',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Avoid Chain Pitfalls',
        text: 'Don\'t make chains too long (3-5 steps max for most tasks). Don\'t skip validation between steps. Don\'t chain when a single prompt would suffice.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 3.4: Industry-Specific Prompt Patterns
  // ==========================================================================
  {
    id: 'lesson-3-4',
    moduleId: 'module-3',
    title: 'Industry-Specific Applications',
    estimatedTime: 5,
    order: 4,
    xpReward: 30,
    content: [
      {
        type: 'text',
        value: 'Let\'s see how different industries apply prompt types to solve real problems.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Marketing: Campaign Creation',
      },
      {
        type: 'text',
        value: 'Marketing teams use creative + few-shot + constrained prompts for consistent brand voice.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Prompt Type: Few-shot + Constrained\n\n"Create 3 social media ads for our new eco-friendly sneakers. Target: Gen Z. Match our brand voice:\n\nExample 1: \'Your carbon footprint just got lighter. New kicks, 100% recycled materials. Style that saves the planet.\'\n\nExample 2: \'Fast fashion? Nah. Slow fashion that sprints. Meet the sneaker your grandkids will thank you for.\'\n\nFormat each ad as:\n- Hook (1 sentence)\n- Body (2 sentences)\n- CTA (1 sentence)\n- Max 280 characters total"',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Legal: Contract Analysis',
      },
      {
        type: 'text',
        value: 'Law firms use role-based + constrained prompts for document review.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Prompt Type: Role-based + Constrained\n\n"Act as a corporate attorney specializing in M&A. Review this NDA [paste document]. Extract and list:\n\n1. Definition of confidential information\n2. Term/duration of the agreement\n3. Permitted disclosures\n4. Return/destruction obligations\n5. Any unusual or concerning clauses\n\nFormat as a numbered list with exact clause references."',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Healthcare: Patient Communication',
      },
      {
        type: 'text',
        value: 'Medical professionals use role-based + few-shot for translating complex info.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Prompt Type: Role-based + Few-shot\n\n"Act as a patient educator. Translate this medical diagnosis into patient-friendly language:\n\nExample (Technical): \'Hypertension with LVH\'\nExample (Patient-friendly): \'High blood pressure that\'s caused your heart to work harder and grow slightly larger\'\n\nNow translate: [paste technical diagnosis]\n\nUse:\n- 6th grade reading level\n- Avoid medical jargon\n- Include what it means for daily life\n- Keep under 100 words"',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Education: Lesson Planning',
      },
      {
        type: 'text',
        value: 'Teachers use chain-of-thought + creative prompts for curriculum design.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Prompt Type: Creative + Chain-of-thought\n\n"Create a 45-minute lesson plan teaching fractions to 4th graders. Think through this step by step:\n\n1. What\'s the core concept they need to understand?\n2. What real-world analogies work for this age?\n3. What activities reinforce the concept?\n4. How do we assess understanding?\n\nFormat as:\n- Learning objective\n- Materials needed\n- Activity sequence (3-4 activities)\n- Assessment method"',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Finance: Market Analysis',
      },
      {
        type: 'text',
        value: 'Analysts use role-based + chain-of-thought for investment research.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Prompt Type: Role-based + Chain-of-thought\n\n"Act as a financial analyst. Analyze this company\'s quarterly earnings [paste data]. Think through:\n\n1. Revenue trends (YoY and QoQ)\n2. Margin analysis\n3. Cash flow health\n4. Red flags or concerns\n5. Investment thesis (bull vs. bear case)\n\nProvide step-by-step reasoning for each point. End with a recommendation: Buy, Hold, or Sell."',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Pattern Recognition',
        text: 'Notice the pattern: Most industries benefit from COMBINING prompt types rather than using just one. Role-based adds expertise, few-shot ensures consistency, constrained guarantees format, chain-of-thought improves reasoning.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 3.5: Advanced Combinations & Workflows
  // ==========================================================================
  {
    id: 'lesson-3-5',
    moduleId: 'module-3',
    title: 'Mastering Prompt Combinations',
    estimatedTime: 5,
    order: 5,
    xpReward: 30,
    content: [
      {
        type: 'text',
        value: 'The real power comes from strategically combining prompt types. Here are battle-tested combinations.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Combination 1: Expert Few-Shot',
      },
      {
        type: 'text',
        value: 'Role-based + Few-shot = Expert pattern recognition',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Perfect for: Style replication with expert perspective\n\n"Act as an experienced copywriter. Write product descriptions matching this style:\n\nExample 1: [paste example]\nExample 2: [paste example]\nExample 3: [paste example]\n\nNow write for: [new product]"',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Use Case',
        text: 'Marketing teams use this to maintain brand voice across all writers. New team members can produce on-brand content immediately.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Combination 2: Structured Reasoning',
      },
      {
        type: 'text',
        value: 'Chain-of-thought + Constrained output = Reliable analysis',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Perfect for: Complex analysis with consistent format\n\n"Analyze this business problem. Think through step by step, then format your response as:\n\n## Problem Statement\n[Define the core issue]\n\n## Root Cause Analysis\n[Work through potential causes]\n\n## Recommended Solution\n[Explain your reasoning]\n\n## Implementation Steps\n[Numbered list of 3-5 actions]"',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Combination 3: Iterative Refinement Chain',
      },
      {
        type: 'text',
        value: 'Conversational + Role-based + Few-shot = Collaborative creation',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Perfect for: Content that needs multiple revision rounds\n\nPrompt 1: "Act as a content strategist. Generate 5 email subject lines for [campaign]."\n\nPrompt 2: "From these 5, which 2 have the highest click-through potential? Explain."\n\nPrompt 3: "Take the top 2 and create 3 variations of each, testing different psychological triggers."\n\nPrompt 4: "Now write the full email body for the best variant. Match this tone: [example]."',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Combination 4: Multi-Perspective Analysis',
      },
      {
        type: 'text',
        value: 'Multiple role-based prompts from different angles',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Perfect for: Comprehensive evaluation\n\nPrompt 1: "Act as a supportive mentor. Review this business idea and provide encouraging feedback with suggestions for improvement."\n\nPrompt 2: "Act as a skeptical investor. Identify every potential flaw, risk, and concern with this same business idea."\n\nPrompt 3: "Act as a neutral consultant. Synthesize both perspectives above and provide a balanced assessment."',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'The Devil\'s Advocate Pattern',
        text: 'Always ask for the opposing view. After getting one perspective, prompt: "Now argue the opposite position." This reveals blind spots.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Workflow Design Exercise',
      },
      {
        type: 'text',
        value: 'Think about a repetitive task in your work. Design a prompt combination or chain:',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Break the task into 3-5 steps',
          'Choose the best prompt type for each step',
          'Define the output format for each step',
          'Identify what context to pass between steps',
          'Document as a reusable template',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Complexity Warning',
        text: 'More complex doesn\'t mean better. Start simple. Add complexity only when needed. Many tasks work best with a single well-crafted prompt.',
      },
      {
        type: 'text',
        value: 'You now have the tools to design prompts for any task. The key is matching the prompt type to your goal, and knowing when to combine types for maximum impact.',
      },
    ],
  },
];
