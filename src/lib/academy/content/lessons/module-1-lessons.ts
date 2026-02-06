/**
 * Module 1: Foundations of Prompt Engineering - Lesson Content
 * Duration: 15 minutes | 4 Lessons
 */

import type { Lesson } from '../../types';

export const module1Lessons: Lesson[] = [
  // ==========================================================================
  // LESSON 1.1: What is Prompt Engineering?
  // ==========================================================================
  {
    id: 'lesson-1-1',
    moduleId: 'module-1',
    title: 'What is Prompt Engineering?',
    estimatedTime: 3,
    order: 1,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Imagine you could hire the world\'s most knowledgeable assistant, but they only understand instructions exactly as you give them. That\'s working with AI.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Defining Prompt Engineering',
      },
      {
        type: 'text',
        value: 'Prompt engineering is the skill of communicating with AI systems to get reliable, high-quality results. It\'s not about coding—it\'s about clear thinking and precise communication.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Key Insight',
        text: 'AI models like GPT-4, Claude, and Gemini are trained on vast amounts of text. Your prompt is the interface that unlocks their capabilities. The better your prompt, the better the output.',
      },
      {
        type: 'heading',
        level: 3,
        value: 'The Taxi Analogy',
      },
      {
        type: 'text',
        value: 'Think of prompting like giving directions to a taxi driver:',
      },
      {
        type: 'list',
        items: [
          '❌ Bad: "Drive somewhere nice" → You might end up anywhere',
          '✅ Good: "123 Main Street, Downtown, near the fountain" → You get exactly where you want',
        ],
      },
      {
        type: 'text',
        value: 'The same principle applies to AI. Vague prompts get vague results. Specific prompts get specific, useful results.',
      },
      {
        type: 'heading',
        level: 3,
        value: 'Why This Skill Matters',
      },
      {
        type: 'list',
        items: [
          'LinkedIn ranks prompt engineering as the #1 most in-demand AI skill for 2024-2025',
          'The World Economic Forum identifies it as a critical workforce skill',
          'You don\'t need to know how to code—you need to think clearly and communicate precisely',
          'Works across all AI tools: ChatGPT, Claude, Gemini, Microsoft Copilot, and more',
        ],
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Real-World Impact',
        text: 'A UN intelligence officer reduced weekly briefing preparation from 10+ hours to 2 hours using systematic prompting techniques. Same quality, 80% less time.',
      },
      {
        type: 'heading',
        level: 3,
        value: 'Interactive: See It In Action',
      },
      {
        type: 'interactive',
        component: 'PromptQualitySlider',
        props: {
          initialPrompt: 'Write about marketing',
          stages: [
            { quality: 0, prompt: 'Write about marketing', description: 'Too vague—AI has no direction' },
            { quality: 25, prompt: 'Write about digital marketing', description: 'Better, but still unclear' },
            { quality: 50, prompt: 'Write about email marketing best practices', description: 'More specific, getting there' },
            { quality: 75, prompt: 'Write 5 email marketing best practices for B2B SaaS companies', description: 'Clear target and format' },
            { quality: 100, prompt: 'Write 5 email marketing best practices for B2B SaaS companies targeting CTOs, focusing on open rates and conversions. Format as bullet points with 1-2 sentence explanations.', description: 'Perfect—specific audience, goal, and format' },
          ],
        },
      },
      {
        type: 'text',
        value: 'Drag the slider to see how adding specificity transforms the same basic request into a production-ready prompt.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 1.2: The ROI of Good Prompting
  // ==========================================================================
  {
    id: 'lesson-1-2',
    moduleId: 'module-1',
    title: 'The ROI of Good Prompting',
    estimatedTime: 4,
    order: 2,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Time is money. Bad prompts waste both. Let\'s quantify exactly how much better prompting can save you.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Hidden Cost of Bad Prompts',
      },
      {
        type: 'text',
        value: 'The average knowledge worker uses AI 15+ times per day. But most prompts fail on the first try:',
      },
      {
        type: 'list',
        items: [
          '❌ Bad prompts require 2-3 follow-up attempts per task',
          '❌ Each iteration adds 3-5 minutes of wasted time',
          '❌ Result: 30-45 minutes wasted per day = 2.5-4 hours per week',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Reality Check',
        text: 'If you make $50,000/year, wasting 3 hours/week on bad prompts costs your company approximately $3,900 annually in lost productivity. For a team of 10, that\'s $39,000.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Good Prompting Advantage',
      },
      {
        type: 'text',
        value: 'Research shows systematic prompt engineering delivers:',
      },
      {
        type: 'list',
        items: [
          '✅ 80%+ first-attempt accuracy (vs. 30-40% for untrained users)',
          '✅ 50-70% reduction in revision cycles',
          '✅ 300-500% productivity gains in workflow optimization',
        ],
      },
      {
        type: 'heading',
        level: 3,
        value: 'Real-World Case Studies',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Marketing Team - Content Creation',
        text: 'A marketing team at a B2B SaaS company reduced blog post creation from 3 hours to 45 minutes by using structured prompts with examples. Same quality, 75% less time.',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Data Analyst - Report Generation',
        text: 'A data analyst reduced monthly report generation from 2 days to 2 hours using prompt chains and templates. This freed up 1.5 days per month for strategic analysis.',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'UN Intelligence Officer - Briefings',
        text: 'An intelligence officer standardized weekly crime analysis reports across 5 field offices using prompt templates. Saved 10+ hours per week while improving consistency.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Calculate Your ROI',
      },
      {
        type: 'text',
        value: 'Use this calculator to see your personal ROI from better prompting:',
      },
      {
        type: 'interactive',
        component: 'ROICalculator',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Pro Tip',
        text: 'Even a 20% time savings from better prompting can translate to 1-2 hours per week. That\'s 50-100 hours per year—more than a full work week you get back.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 1.3: The 5 Signs of a Bad Prompt
  // ==========================================================================
  {
    id: 'lesson-1-3',
    moduleId: 'module-1',
    title: 'The 5 Signs of a Bad Prompt',
    estimatedTime: 3,
    order: 3,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Before we learn what makes a great prompt, let\'s identify the red flags of bad ones. Recognizing these patterns will save you hours of frustration.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Sign #1: Vague Language',
      },
      {
        type: 'text',
        value: '❌ Bad: "Write something good about our product"',
      },
      {
        type: 'text',
        value: 'What\'s wrong: "Something" and "good" are subjective. The AI has no idea what format, length, audience, or tone you want.',
      },
      {
        type: 'text',
        value: '✅ Good: "Write a 150-word product description for our project management software, targeting small business owners, emphasizing time savings and ease of use."',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Sign #2: No Context',
      },
      {
        type: 'text',
        value: '❌ Bad: "Analyze this data"',
      },
      {
        type: 'text',
        value: 'What\'s wrong: The AI doesn\'t know who you are, what the data represents, or what insights you\'re looking for.',
      },
      {
        type: 'text',
        value: '✅ Good: "I\'m a marketing manager at an e-commerce company. Analyze this customer survey data (500 responses, Q4 2023) to identify the top 3 reasons customers abandon their shopping carts."',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Sign #3: No Format Specification',
      },
      {
        type: 'text',
        value: '❌ Bad: "Tell me about effective meeting practices"',
      },
      {
        type: 'text',
        value: 'What\'s wrong: You\'ll get a wall of text when you might want bullet points, a table, or a checklist.',
      },
      {
        type: 'text',
        value: '✅ Good: "List 5 effective meeting practices in a numbered format. For each practice, provide a 1-sentence description and a practical example."',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Sign #4: Too Many Requests at Once',
      },
      {
        type: 'text',
        value: '❌ Bad: "Write a business plan, design a logo, create a marketing strategy, and write website copy for my startup"',
      },
      {
        type: 'text',
        value: 'What\'s wrong: Cramming multiple complex tasks into one prompt leads to shallow, rushed output for each.',
      },
      {
        type: 'text',
        value: '✅ Good: Break it into separate prompts: "Write a one-page executive summary for a business plan for a [specific type] startup targeting [specific market]."',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Sign #5: No Examples',
      },
      {
        type: 'text',
        value: '❌ Bad: "Write in our company\'s voice"',
      },
      {
        type: 'text',
        value: 'What\'s wrong: AI can\'t read your mind about tone and style without examples.',
      },
      {
        type: 'text',
        value: '✅ Good: "Write in our company\'s voice. Here are 2 examples of our tone: [Example 1] [Example 2]. Now write a similar message about [topic]."',
      },
      {
        type: 'heading',
        level: 3,
        value: 'Interactive: Spot the Problem',
      },
      {
        type: 'interactive',
        component: 'SpotTheProblemGame',
        props: {
          prompts: [
            {
              text: 'Write me something',
              flaw: 'vague',
              explanation: 'This prompt lacks specificity about what to write, the format, length, tone, and purpose.',
            },
            {
              text: 'Summarize this article',
              flaw: 'no-context',
              explanation: 'Missing context about the audience, purpose of the summary, and desired length.',
            },
            {
              text: 'Create a presentation',
              flaw: 'no-format',
              explanation: 'No specification about number of slides, format, visual style, or content structure.',
            },
            {
              text: 'Build a complete marketing strategy, write all the copy, design the website, and create social media posts',
              flaw: 'too-many',
              explanation: 'Too many complex tasks crammed into one prompt. Each deserves its own detailed prompt.',
            },
            {
              text: 'Write like Steve Jobs',
              flaw: 'no-examples',
              explanation: 'No examples provided to show what "Steve Jobs style" means in this context.',
            },
          ],
        },
      },
      {
        type: 'text',
        value: 'Click on each prompt above to identify which of the 5 signs it exhibits. You\'ll get immediate feedback!',
      },
    ],
  },

  // ==========================================================================
  // LESSON 1.4: The CCCEFI Framework Preview
  // ==========================================================================
  {
    id: 'lesson-1-4',
    moduleId: 'module-1',
    title: 'The CCCEFI Framework Preview',
    estimatedTime: 5,
    order: 4,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Now that you know what NOT to do, let\'s learn the framework that consistently produces great prompts: CCCEFI.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Introducing CCCEFI',
      },
      {
        type: 'text',
        value: 'CCCEFI is a six-pillar framework for building effective prompts. Think of it as a checklist to ensure you\'ve covered all the bases.',
      },
      {
        type: 'heading',
        level: 3,
        value: 'C - Context',
      },
      {
        type: 'text',
        value: 'Give the AI background information about who you are, what you\'re trying to accomplish, and who the audience is.',
      },
      {
        type: 'text',
        value: 'Example: "I\'m a freelance graphic designer creating a portfolio website..."',
      },
      {
        type: 'heading',
        level: 3,
        value: 'C - Constraints',
      },
      {
        type: 'text',
        value: 'Set boundaries: length, tone, format, what to avoid, and any limitations.',
      },
      {
        type: 'text',
        value: 'Example: "Keep it under 200 words. Use a friendly, conversational tone. Avoid technical jargon."',
      },
      {
        type: 'heading',
        level: 3,
        value: 'C - Clarity',
      },
      {
        type: 'text',
        value: 'Be specific about what you want. Remove ambiguity.',
      },
      {
        type: 'text',
        value: 'Example: "Write a product description" vs. "Write a 150-word product description highlighting 3 key benefits"',
      },
      {
        type: 'heading',
        level: 3,
        value: 'E - Examples',
      },
      {
        type: 'text',
        value: 'Show the AI what good output looks like. This is called "few-shot learning."',
      },
      {
        type: 'text',
        value: 'Example: "Here\'s an example of our tone: [Example]. Now write something similar about [topic]."',
      },
      {
        type: 'heading',
        level: 3,
        value: 'F - Format',
      },
      {
        type: 'text',
        value: 'Specify the output structure: bullet points, table, JSON, paragraph, checklist, etc.',
      },
      {
        type: 'text',
        value: 'Example: "Format as a numbered list with each item having a title and 2-sentence description."',
      },
      {
        type: 'heading',
        level: 3,
        value: 'I - Instructions',
      },
      {
        type: 'text',
        value: 'The actual task you want completed. Be clear and direct.',
      },
      {
        type: 'text',
        value: 'Example: "Write a cold email to potential clients introducing our new service."',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'You Don\'t Always Need All 6',
        text: 'Not every prompt requires all six elements. Simple tasks might only need 2-3. Complex tasks benefit from all 6. Module 2 will teach you when to use which elements.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'CCCEFI in Action',
      },
      {
        type: 'text',
        value: 'Let\'s transform a bad prompt using CCCEFI:',
      },
      {
        type: 'code',
        language: 'text',
        code: '❌ Before: "Write an email"',
      },
      {
        type: 'code',
        language: 'text',
        code: `✅ After (CCCEFI):

[Context] I'm a project manager following up with a client about a delayed deliverable.

[Constraints] Keep it under 150 words. Professional but warm tone.

[Clarity] The deliverable is a website redesign mockup, delayed by 1 week due to feedback incorporation.

[Examples] Our standard tone: "We appreciate your patience as we refine these details to match your vision."

[Format] Standard email format with greeting, body (2-3 paragraphs), and closing.

[Instructions] Write a professional follow-up email explaining the delay, emphasizing we're incorporating their feedback to deliver a better result, and providing a new timeline.`,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Interactive: Build Your First CCCEFI Prompt',
      },
      {
        type: 'interactive',
        component: 'PromptBuilder',
        props: {
          scenario: 'You\'re a project manager who needs to send a status update email to your team about this week\'s sprint progress.',
        },
      },
      {
        type: 'text',
        value: 'Try building a prompt using the interactive tool above. Drag the CCCEFI elements into place and see how your prompt quality score improves!',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'What\'s Next?',
        text: 'This is just a preview. In Module 2, we\'ll do a deep dive into each CCCEFI element with exercises, templates, and real-world applications. For now, this foundation is enough to dramatically improve your prompts.',
      },
    ],
  },
];
