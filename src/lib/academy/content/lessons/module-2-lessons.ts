/**
 * Module 2: Anatomy of a Perfect Prompt - Lesson Content
 * Duration: 20 minutes | 6 Lessons
 */

import type { Lesson } from '../../types';

export const module2Lessons: Lesson[] = [
  // ==========================================================================
  // LESSON 2.1: Deep Dive - Context (The First C)
  // ==========================================================================
  {
    id: 'lesson-2-1',
    moduleId: 'module-2',
    title: 'Context: Setting the Stage',
    estimatedTime: 3,
    order: 1,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'Context is the foundation of every great prompt. It tells the AI who you are, what you\'re trying to accomplish, and who your audience is. Without it, the AI is guessing.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Three Types of Context',
      },
      {
        type: 'heading',
        level: 3,
        value: '1. Role-Based Context',
      },
      {
        type: 'text',
        value: 'Tell the AI what role you\'re in or what role you want IT to adopt.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Example: "I\'m a marketing manager at a B2B SaaS company..."\nExample: "Act as an experienced financial advisor..."',
      },
      {
        type: 'heading',
        level: 3,
        value: '2. Situational Context',
      },
      {
        type: 'text',
        value: 'Describe the situation, background, or problem you\'re facing.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Example: "We\'re launching a new product next quarter and need to build awareness..."\nExample: "Our customer churn rate increased 15% last month..."',
      },
      {
        type: 'heading',
        level: 3,
        value: '3. Audience Context',
      },
      {
        type: 'text',
        value: 'Who is the output for? This dramatically changes tone, complexity, and format.',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Example: "...for C-level executives" (high-level, business focused)\nExample: "...for technical developers" (detailed, code examples)\nExample: "...for 8th grade students" (simple language, relatable)',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Pro Tip: Stack All Three',
        text: 'The most powerful prompts combine role + situation + audience context. Example: "I\'m a teacher [role] preparing for parent-teacher conferences [situation] and need talking points for parents of struggling students [audience]."',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Before & After: The Power of Context',
      },
      {
        type: 'code',
        language: 'text',
        code: '❌ Without Context:\n"Write a proposal for a new initiative."\n\n✅ With Context:\n"I\'m a product manager at a mid-sized e-commerce company. We\'ve noticed that 40% of users abandon cart due to confusing checkout flow. Write a proposal for redesigning the checkout experience, targeting our VP of Product, emphasizing ROI and user data."',
      },
      {
        type: 'text',
        value: 'The second prompt gives the AI everything it needs: your role, the problem, the solution direction, the audience, and what to emphasize.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Common Mistake',
        text: 'Don\'t assume the AI knows your context. Even if you\'re working in a specific domain all day, each prompt starts fresh. Always re-establish context.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 2.2: Deep Dive - Constraints (The Second C)
  // ==========================================================================
  {
    id: 'lesson-2-2',
    moduleId: 'module-2',
    title: 'Constraints: Defining Boundaries',
    estimatedTime: 3,
    order: 2,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'Constraints are guardrails that keep the AI focused. They define what to include, what to avoid, and how to structure the output.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Four Types of Constraints',
      },
      {
        type: 'heading',
        level: 3,
        value: '1. Length Constraints',
      },
      {
        type: 'list',
        items: [
          'Word count: "Write 200 words"',
          'Sentence count: "Use 3-5 sentences"',
          'Paragraph count: "Organize into 4 paragraphs"',
          'Time limit: "A 5-minute presentation"',
        ],
      },
      {
        type: 'heading',
        level: 3,
        value: '2. Tone Constraints',
      },
      {
        type: 'list',
        items: [
          'Professional vs. casual',
          'Formal vs. conversational',
          'Empathetic vs. authoritative',
          'Friendly vs. serious',
          'Optimistic vs. cautious',
        ],
      },
      {
        type: 'heading',
        level: 3,
        value: '3. Content Constraints',
      },
      {
        type: 'list',
        items: [
          'What to include: "Must mention our 3 core features"',
          'What to avoid: "Don\'t mention competitors by name"',
          'Focus areas: "Emphasize cost savings over features"',
          'Complexity: "Avoid technical jargon" or "Use industry terminology"',
        ],
      },
      {
        type: 'heading',
        level: 3,
        value: '4. Output Constraints',
      },
      {
        type: 'list',
        items: [
          'Format: "Bullet points" vs. "Paragraph form" vs. "Table"',
          'Structure: "STAR format" or "Problem-Solution-Benefit"',
          'Style: "Use active voice" or "Write in second person"',
        ],
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Real Example: UN Intelligence Officer',
        text: 'A UN intelligence officer uses constraints like: "Maximum 1 page, use BLUF format (Bottom Line Up Front), avoid speculation, cite sources, formal military tone." This ensures consistency across 50+ weekly reports.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'How Many Constraints?',
      },
      {
        type: 'text',
        value: 'Balance is key:',
      },
      {
        type: 'list',
        items: [
          'Too few: AI wanders and produces unfocused output',
          'Too many: AI feels restricted and output becomes robotic',
          'Sweet spot: 3-5 constraints that address length, tone, and key content guidelines',
        ],
      },
      {
        type: 'code',
        language: 'text',
        code: 'Example with Balanced Constraints:\n"Write a LinkedIn post about our new feature. Keep it under 150 words, use an enthusiastic but professional tone, focus on user benefits (not features), and include a call-to-action to sign up for the beta."',
      },
    ],
  },

  // ==========================================================================
  // LESSON 2.3: Deep Dive - Clarity & Examples
  // ==========================================================================
  {
    id: 'lesson-2-3',
    moduleId: 'module-2',
    title: 'Clarity and Examples: Show, Don\'t Tell',
    estimatedTime: 4,
    order: 3,
    xpReward: 25,
    content: [
      {
        type: 'heading',
        level: 2,
        value: 'Clarity: Remove All Ambiguity',
      },
      {
        type: 'text',
        value: 'Every vague word is an opportunity for the AI to misinterpret your intent. Clarity means being specific about every detail that matters.',
      },
      {
        type: 'heading',
        level: 3,
        value: 'Vague Words to Avoid',
      },
      {
        type: 'list',
        items: [
          '❌ "Some" → ✅ "3-5"',
          '❌ "Good" → ✅ "High-converting with clear value prop"',
          '❌ "Soon" → ✅ "By end of Q2"',
          '❌ "Interesting" → ✅ "Data-driven with actionable insights"',
          '❌ "Comprehensive" → ✅ "Cover all 6 core features with examples"',
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'The Specificity Test',
        text: 'Ask yourself: Could two people read this prompt and interpret it differently? If yes, add more clarity.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Examples: The Power of Few-Shot Learning',
      },
      {
        type: 'text',
        value: 'Examples are the fastest way to teach the AI exactly what you want. This is called "few-shot learning" — showing examples before asking for output.',
      },
      {
        type: 'heading',
        level: 3,
        value: 'When to Use Examples',
      },
      {
        type: 'list',
        items: [
          'Style matching: Want AI to match your brand voice? Show 2-3 examples.',
          'Format replication: Need a specific structure? Provide a template.',
          'Tone calibration: Show examples of the exact tone you want.',
          'Complexity level: Demonstrate how technical or simple to be.',
        ],
      },
      {
        type: 'heading',
        level: 3,
        value: 'How Many Examples?',
      },
      {
        type: 'list',
        items: [
          '0-shot: No examples (works for simple, common tasks)',
          '1-shot: One example (good for straightforward patterns)',
          '3-shot: Three examples (ideal for most tasks)',
          '5-shot+: Five or more (for complex or nuanced tasks)',
        ],
      },
      {
        type: 'code',
        language: 'text',
        code: 'Example: Using Examples for Style Matching\n\nPrompt:\n"Write social media posts in our brand voice. Here are examples:\n\nExample 1: \'Spent the last 3 months building something wild. Meet our new AI assistant—it\'s like having a senior engineer on speed dial. Beta drops Monday.\'\n\nExample 2: \'Real talk: most automation tools are overhyped. Ours isn\'t. Cut our deployment time by 60%. No fluff, just results.\'\n\nNow write a similar post about our new analytics dashboard."',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Pro Tip: Label Your Examples',
        text: 'Use clear labels like "Example 1:", "Example 2:" to help the AI distinguish between examples and instructions.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 2.4: Deep Dive - Format & Iteration
  // ==========================================================================
  {
    id: 'lesson-2-4',
    moduleId: 'module-2',
    title: 'Format and Iteration: Structure and Refinement',
    estimatedTime: 3,
    order: 4,
    xpReward: 25,
    content: [
      {
        type: 'heading',
        level: 2,
        value: 'Format: Specify the Output Structure',
      },
      {
        type: 'text',
        value: 'Format is about HOW the information is organized. The same content can be delivered as a paragraph, bullet points, a table, JSON, or code.',
      },
      {
        type: 'heading',
        level: 3,
        value: 'Common Format Options',
      },
      {
        type: 'list',
        items: [
          'Bullet points (for scannability)',
          'Numbered lists (for sequential steps)',
          'Tables (for comparisons)',
          'JSON/XML (for structured data)',
          'Markdown (for documentation)',
          'Paragraphs (for narrative)',
          'Code blocks (for technical output)',
        ],
      },
      {
        type: 'code',
        language: 'text',
        code: 'Example Format Specifications:\n\n"Format as a 3-column table with headers: Feature | Benefit | Use Case"\n\n"Return as valid JSON with keys: title, description, tags, priority"\n\n"Write as a numbered list with each item having a bold title and 2-sentence explanation"',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Template Tip',
        text: 'For consistent formatting, provide an empty template: "Use this format: ## [Title]\n\n**Problem:** [description]\n**Solution:** [description]\n**Next Steps:** [bullet points]"',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Iteration: Refinement Through Feedback',
      },
      {
        type: 'text',
        value: 'Perfect prompts on the first try are rare. Iteration is how you refine outputs to meet your exact needs.',
      },
      {
        type: 'heading',
        level: 3,
        value: 'The Iteration Process',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Start with a solid CCCEFI prompt',
          'Review the AI output',
          'Identify what\'s wrong (too long? wrong tone? missing info?)',
          'Add specific constraints or examples to address it',
          'Re-prompt with refinements',
        ],
      },
      {
        type: 'code',
        language: 'text',
        code: 'Example Iteration:\n\nPrompt 1: "Write a product description for our CRM software."\nResult: Generic, too technical\n\nPrompt 2: "Write a 150-word product description for our CRM software, targeting small business owners. Focus on ease of use and time savings, not features. Use a friendly, conversational tone."\nResult: Much better!\n\nPrompt 3 (if needed): "Same as above, but structure as: Hook (problem), Solution (our CRM), Benefit (what they gain), CTA (try free)."',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Iteration Shortcut',
        text: 'Instead of re-writing the whole prompt, use follow-ups: "Make it 50% shorter", "Change the tone to more professional", "Add 2 specific examples".',
      },
    ],
  },

  // ==========================================================================
  // LESSON 2.5: Prompt Surgery - Fixing Bad Prompts
  // ==========================================================================
  {
    id: 'lesson-2-5',
    moduleId: 'module-2',
    title: 'Prompt Surgery: Debugging Broken Prompts',
    estimatedTime: 4,
    order: 5,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'Let\'s practice fixing real-world bad prompts using the CCCEFI framework. Each example shows the problem, diagnosis, and fixed version.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Case 1: The Vague Request',
      },
      {
        type: 'code',
        language: 'text',
        code: '❌ Broken Prompt:\n"Help me with my presentation."\n\nDiagnosis:\n- No context (what presentation? for whom?)\n- No constraints (length? format?)\n- No clarity (what kind of help?)\n\n✅ Fixed Prompt:\n"I\'m preparing a 15-minute sales pitch for enterprise clients about our cybersecurity platform. Create an outline with 5 main sections: Problem, Solution, ROI, Case Study, and Call-to-Action. Include talking points (3-4 bullets) under each section."',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Case 2: The Everything-at-Once Prompt',
      },
      {
        type: 'code',
        language: 'text',
        code: '❌ Broken Prompt:\n"Write a business plan, marketing strategy, website copy, and social media posts for my startup."\n\nDiagnosis:\n- Too many tasks at once\n- Each needs different approaches\n- Will produce shallow results\n\n✅ Fixed Prompt (Split into separate prompts):\n\n"I\'m launching a meal-prep delivery service targeting busy professionals. Write a one-page executive summary for a business plan covering: target market (urban professionals 25-40), unique value prop (chef-quality meals under $10), revenue model (subscription), and first-year goals (500 subscribers)."',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Case 3: The Missing Examples Prompt',
      },
      {
        type: 'code',
        language: 'text',
        code: '❌ Broken Prompt:\n"Write in our brand voice."\n\nDiagnosis:\n- No examples of brand voice\n- AI has to guess\n- Inconsistent results\n\n✅ Fixed Prompt:\n"Write social media captions in our brand voice. Our voice is witty, concise, and data-driven. Examples:\n\nExample 1: \'Automation shouldn\'t feel like rocket science. Ours doesn\'t. Set it up in 60 seconds, save 10 hours a week. Math checks out.\'\n\nExample 2: \'Your dashboard shouldn\'t need a user manual. Ours doesn\'t. Built for humans, powered by AI, loved by 10,000+ teams.\'\n\nNow write 3 captions announcing our new mobile app launch."',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Case 4: The Constraint-Free Prompt',
      },
      {
        type: 'code',
        language: 'text',
        code: '❌ Broken Prompt:\n"Summarize this research paper."\n\nDiagnosis:\n- No length constraint (could be 10 words or 10 paragraphs)\n- No audience specified (experts? beginners?)\n- No format guidance\n\n✅ Fixed Prompt:\n"Summarize this neuroscience research paper for a general audience (no scientific background). Write 3 paragraphs: (1) What they studied, (2) Key findings in simple terms, (3) Why it matters for everyday life. Use analogies instead of jargon. 200 words max."',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Your Turn',
        text: 'When you encounter a failing prompt, ask: What\'s missing from CCCEFI? Context? Constraints? Examples? Format? Add what\'s missing and watch quality improve.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 2.6: Template Library & Case Study
  // ==========================================================================
  {
    id: 'lesson-2-6',
    moduleId: 'module-2',
    title: 'Prompt Templates & Real-World Case Study',
    estimatedTime: 3,
    order: 6,
    xpReward: 25,
    content: [
      {
        type: 'heading',
        level: 2,
        value: '10 Ready-to-Use Prompt Templates',
      },
      {
        type: 'text',
        value: 'These templates use the full CCCEFI framework. Replace [bracketed] sections with your specifics.',
      },
      {
        type: 'heading',
        level: 3,
        value: '1. Email Writing Template',
      },
      {
        type: 'code',
        language: 'text',
        code: 'I\'m a [your role] writing to [recipient type] about [subject]. The purpose is to [goal]. Write a [length] email with a [tone] tone. Structure: [greeting], [context paragraph], [main ask], [call-to-action], [closing].',
      },
      {
        type: 'heading',
        level: 3,
        value: '2. Content Creation Template',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Create a [type: blog post/article/social post] about [topic] for [audience]. Focus on [angle/unique perspective]. Use [tone] tone. Include [specific elements: stats, examples, actionable tips]. Format as [structure]. [Word count] words.',
      },
      {
        type: 'heading',
        level: 3,
        value: '3. Data Analysis Template',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Analyze this [data type] for [purpose]. I\'m looking for [specific insights]. Present findings as [format: table, bullets, narrative]. Prioritize [criteria]. Flag any [concerns/anomalies]. Recommend [number] action items.',
      },
      {
        type: 'heading',
        level: 3,
        value: '4. Creative Brief Template',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Generate [number] ideas for [creative output: campaign, tagline, product name]. Target audience: [demographic]. Brand personality: [adjectives]. Must convey: [key message]. Avoid: [constraints]. Present as [format].',
      },
      {
        type: 'heading',
        level: 3,
        value: '5. Meeting Prep Template',
      },
      {
        type: 'code',
        language: 'text',
        code: 'I\'m preparing for a [meeting type] with [attendees] about [topic]. Create an agenda with [number] sections. Include: [key discussion points]. Estimated time: [duration]. Add suggested talking points and anticipated questions.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Using Templates',
        text: 'Save these templates and fill in the brackets for each use case. Over time, customize them for your specific needs and industry.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Case Study: UN Intelligence Workflow Optimization',
      },
      {
        type: 'text',
        value: 'A UN peacekeeping intelligence officer managed 5 field offices, each submitting weekly crime analysis reports. Before CCCEFI:',
      },
      {
        type: 'list',
        items: [
          'Reports were inconsistent in format and depth',
          'Took 12+ hours per week to review and standardize',
          'Hard to compare trends across regions',
          'Officers struggled with writing clear analysis',
        ],
      },
      {
        type: 'text',
        value: 'Solution: Created a CCCEFI-based prompt template:',
      },
      {
        type: 'code',
        language: 'text',
        code: 'Context: You are analyzing crime data for [region] for week of [date].\n\nTask: Write a one-page BLUF (Bottom Line Up Front) intelligence report.\n\nConstraints:\n- Maximum 1 page\n- Use BLUF format (summary first, then details)\n- Professional military tone\n- Cite all sources\n- No speculation without flagging it\n\nFormat:\n## Summary (3-4 sentences)\n## Key Incidents (5 bullet points max)\n## Trends (2-3 patterns observed)\n## Recommendations (2-3 action items)\n\nData: [paste crime data]',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Results',
        text: 'After implementing this template: Reports became consistent across all 5 offices, review time dropped from 12 hours to 2 hours per week, trend analysis became 10x easier, and officer confidence in writing improved significantly.',
      },
      {
        type: 'text',
        value: 'Key Takeaway: One well-designed prompt template can transform an entire workflow.',
      },
    ],
  },
];
