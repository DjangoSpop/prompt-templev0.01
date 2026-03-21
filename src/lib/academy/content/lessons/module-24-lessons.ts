/**
 * Module 24: Career Skills for the Agentic Era
 * Duration: 25 minutes | 3 Lessons
 */

import type { Lesson } from '../../types';

export const module24Lessons: Lesson[] = [
  // ==========================================================================
  // LESSON 24.1: Jobs That AI Changes
  // ==========================================================================
  {
    id: 'lesson-24-1',
    moduleId: 'module-24',
    title: 'Jobs That AI Changes',
    estimatedTime: 8,
    order: 1,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Let us start with the most important truth about AI and jobs: AI does not replace people — it replaces tasks. Every job is a bundle of tasks, and AI will handle some of those tasks while creating demand for new ones. The people who thrive will be those who understand which tasks AI excels at and focus their energy on the tasks that remain uniquely human.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Augmented vs. Automated: A Critical Distinction',
      },
      {
        type: 'text',
        value: 'Think of your job as a pie chart of different activities. AI will automate some slices entirely — the repetitive, data-heavy, pattern-matching tasks. But it will augment other slices — making you faster and better at creative, strategic, and interpersonal work. The question is not "Will AI take my job?" but "Which parts of my job will AI handle, and what will I do with the freed-up time?"',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'The 70/30 Rule',
        text: 'Research from multiple consulting firms suggests that roughly 70% of tasks in most knowledge-work jobs could be partially automated by AI. But only about 5-10% of entire jobs will be fully automated. The remaining 90-95% will be transformed — same job title, very different day-to-day work.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Roles Most Augmented by AI',
      },
      {
        type: 'text',
        value: 'These roles will not disappear — they will become supercharged. Professionals in these fields who adopt AI will dramatically outperform those who do not:',
      },
      {
        type: 'list',
        items: [
          'Marketing and Content — AI handles first drafts, data analysis, A/B test variations, and personalization. Humans focus on strategy, brand voice, and creative direction.',
          'Software Development — AI writes boilerplate code, fixes bugs, writes tests, and generates documentation. Developers focus on architecture, complex problem-solving, and user experience.',
          'Legal — AI reviews contracts, researches case law, and summarizes depositions. Lawyers focus on strategy, negotiation, and courtroom advocacy.',
          'Finance and Accounting — AI processes invoices, reconciles accounts, generates reports, and detects anomalies. Professionals focus on strategic planning, client relationships, and judgment calls.',
          'Healthcare — AI analyzes medical images, summarizes patient histories, and suggests treatment options. Doctors focus on diagnosis confirmation, patient communication, and complex cases.',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Roles Most Disrupted by AI',
      },
      {
        type: 'text',
        value: 'Some roles face more significant transformation because their core tasks overlap heavily with what AI does well:',
      },
      {
        type: 'list',
        items: [
          'Data entry and processing — Highly automatable. But transforms into data quality management and exception handling.',
          'Basic customer support (Tier 1) — AI agents can handle common questions and simple issues. Human agents focus on complex, emotional, or escalated cases.',
          'Translation (basic) — AI handles straightforward translation. Human translators focus on nuanced, creative, or culturally sensitive content.',
          'Report generation — AI can produce standard reports from data. Analysts focus on interpreting results and recommending actions.',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Brand New Roles Emerging',
      },
      {
        type: 'text',
        value: 'Every major technology shift creates entirely new roles that did not exist before. The AI era is no different:',
      },
      {
        type: 'list',
        items: [
          'Prompt Engineer — Designs and optimizes the instructions given to AI models. Think of it as being a translator between human intent and AI capability.',
          'AI Operations Specialist — Manages AI systems in production: monitoring performance, handling failures, optimizing costs, and ensuring reliability.',
          'Agent Designer — Architects AI agent workflows: deciding which tasks to automate, how agents should interact, what guardrails to set, and how humans stay in the loop.',
          'AI Ethics Officer — Ensures AI systems are fair, transparent, and aligned with company values and regulations.',
          'AI Trainer / Fine-Tuning Specialist — Prepares data and trains models for specific business use cases.',
        ],
        ordered: false,
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'The Opportunity',
        text: 'Right now, there are far more AI-related job openings than qualified candidates. The skills gap is enormous. By learning about AI now — even at a non-technical level — you are positioning yourself ahead of 90% of the workforce.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Key Takeaway',
        text: 'AI changes tasks, not just jobs. Most roles will be augmented, making AI-savvy professionals more productive than ever. Meanwhile, entirely new career paths are emerging. The best strategy is not to compete with AI but to become the person who knows how to work with it.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 24.2: Skills to Build Now
  // ==========================================================================
  {
    id: 'lesson-24-2',
    moduleId: 'module-24',
    title: 'Skills to Build Now',
    estimatedTime: 8,
    order: 2,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'The skills that made you successful in the pre-AI era are still valuable — but they are no longer sufficient. The professionals who will thrive in the agentic era are those who combine their existing domain expertise with a new layer of AI literacy. The good news? These skills are learnable by anyone, regardless of technical background.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Skill 1: Prompt Literacy',
      },
      {
        type: 'text',
        value: 'Prompt literacy is the ability to communicate effectively with AI. It is not about memorizing magic formulas — it is about understanding how to give clear, specific instructions that get the results you want. Think of it as learning a new type of professional communication, like learning to write effective emails or give good presentations.',
      },
      {
        type: 'list',
        items: [
          'Be specific about what you want — "Write a 200-word product description for enterprise buyers" beats "Write about our product"',
          'Provide context — Tell the AI who the audience is, what tone to use, and what format you need',
          'Iterate and refine — Treat AI interaction as a conversation, not a one-shot command',
          'Use examples — Show the AI what "good" looks like by including sample outputs in your prompt',
        ],
        ordered: false,
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Prompt Literacy Is the New Computer Literacy',
        text: 'In the 1990s, "knowing how to use a computer" became a baseline job requirement. In the 2010s, it was "knowing how to use the internet and software tools." In the 2025+ era, prompt literacy will be just as fundamental. It will not be listed on job postings because it will be assumed.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Skill 2: Automation Thinking',
      },
      {
        type: 'text',
        value: 'Automation thinking is the ability to look at any process and identify which parts can be automated, which should remain manual, and how to connect them. It is a mindset shift from "How do I do this task?" to "How can I design a system that does this task?"',
      },
      {
        type: 'list',
        items: [
          'Map your recurring tasks — What do you do every day, week, or month that follows the same pattern?',
          'Identify the trigger — What event kicks off the process? A new email? A calendar event? A form submission?',
          'Spot the decision points — Where does the process require judgment? These are the points where a human stays in the loop.',
          'Think in workflows — Every business process is a sequence of steps. Visualize them as a flowchart.',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Skill 3: Data Literacy',
      },
      {
        type: 'text',
        value: 'You do not need to become a data scientist, but you do need to understand the basics of working with data. AI is powered by data, and the quality of your AI results depends directly on the quality of your data. Data literacy means understanding how to interpret data, spot bad data, and structure information so AI can work with it effectively.',
      },
      {
        type: 'list',
        items: [
          'Understand basic data formats — CSV, JSON, spreadsheets, databases. Know when to use which.',
          'Ask the right questions — "What does this data tell us?" is more important than "How do I run a query?"',
          'Spot bad data — Missing values, duplicates, outdated entries, and inconsistencies will break AI workflows.',
          'Think about structure — Well-organized data produces dramatically better AI results than messy data.',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Skill 4: AI Ethics and Critical Thinking',
      },
      {
        type: 'text',
        value: 'As AI becomes more powerful, the ability to think critically about its outputs becomes more valuable. AI can be confidently wrong. It can reflect biases in its training data. It can produce plausible-sounding but factually incorrect information. The skill of knowing when to trust AI and when to verify is irreplaceable.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'The Verification Imperative',
        text: 'Never publish, send, or act on AI-generated content without human review — especially for high-stakes decisions. AI is a powerful first draft generator, not a substitute for expertise and judgment. The professional who blindly trusts AI output is more dangerous than the one who does not use AI at all.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Skill 5: Staying Current',
      },
      {
        type: 'text',
        value: 'The AI field moves faster than any technology in history. A skill that was cutting-edge six months ago may be outdated today. Building a habit of continuous learning is not optional — it is a survival skill.',
      },
      {
        type: 'list',
        items: [
          'Follow key sources — Newsletters like The Rundown AI, Ben\'s Bites, or Superhuman give you daily updates in 5 minutes',
          'Experiment regularly — Set aside 30 minutes a week to try a new AI tool or technique',
          'Join communities — AI-focused communities on Discord, Reddit, and LinkedIn are where practitioners share real-world insights',
          'Teach others — Nothing solidifies your understanding like explaining AI concepts to colleagues',
        ],
        ordered: false,
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Key Takeaway',
        text: 'The five essential skills for the agentic era are: prompt literacy, automation thinking, data literacy, AI ethics, and staying current. None of these require a computer science degree. All of them are learnable through practice and curiosity.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 24.3: Your AI Action Plan
  // ==========================================================================
  {
    id: 'lesson-24-3',
    moduleId: 'module-24',
    title: 'Your AI Action Plan',
    estimatedTime: 9,
    order: 3,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Knowledge without action is just entertainment. You have learned about AI agents, the tool ecosystem, and the skills you need. Now it is time to turn that knowledge into a concrete plan. This lesson gives you a practical, week-by-week roadmap to start building your AI capabilities today — regardless of your current technical level.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Step 1: Audit Your Current Workflow (This Week)',
      },
      {
        type: 'text',
        value: 'Before you can improve your workflow with AI, you need to understand your workflow. Spend one day tracking every task you do and how long it takes. Be honest and specific.',
      },
      {
        type: 'list',
        items: [
          'List every recurring task you do daily, weekly, and monthly',
          'Estimate how much time each task takes',
          'Rate each task: Is it creative/strategic (hard to automate) or repetitive/procedural (easy to automate)?',
          'Identify your top 3 time-wasters — tasks that take disproportionate time relative to their value',
          'Star any task where you think "there must be a better way to do this"',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'The 80/20 Rule of Automation',
        text: 'Typically, 20% of your tasks consume 80% of your time. Start by automating the most time-consuming repetitive tasks. Even automating just one task can save hours per week.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Step 2: Start Using AI Daily (Weeks 1-2)',
      },
      {
        type: 'text',
        value: 'The fastest way to build AI skills is to use AI every single day. Make it a habit by integrating it into tasks you already do:',
      },
      {
        type: 'list',
        items: [
          'Use Claude or ChatGPT to draft emails, summarize documents, or brainstorm ideas',
          'Before starting any writing task, ask AI for an outline or first draft',
          'When you encounter data, ask AI to help you analyze it or find patterns',
          'Use AI to prepare for meetings: summarize background materials, generate discussion questions',
          'Ask AI to explain concepts you encounter in your work that you do not fully understand',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Step 3: Build Your First Automation (Weeks 2-4)',
      },
      {
        type: 'text',
        value: 'Pick one of your identified time-wasters and automate it. Start simple — your first automation does not need to be complex. Here are beginner-friendly ideas:',
      },
      {
        type: 'list',
        items: [
          'Email sorting and summarization — Set up an automation that classifies incoming emails and sends you a daily digest of the important ones',
          'Meeting notes — Connect your calendar to an AI that generates post-meeting summaries and action items',
          'Social media monitoring — Create an automation that tracks mentions of your brand or industry keywords and sends you a weekly report',
          'Report generation — Automate a regular report you create by connecting data sources to an AI formatter',
        ],
        ordered: false,
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Start with n8n Templates',
        text: 'n8n has a template library with hundreds of pre-built workflows. Instead of building from scratch, find a template close to what you need and customize it. This is the fastest path from zero to a working automation.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Step 4: Build Your AI Portfolio (Months 1-3)',
      },
      {
        type: 'text',
        value: 'Just like a design portfolio or a writing portfolio, an AI portfolio showcases your ability to work with AI tools. This is becoming a differentiator in hiring decisions and promotion conversations.',
      },
      {
        type: 'list',
        items: [
          'Document your automations — Write brief case studies: what problem you solved, which tools you used, and what results you achieved',
          'Track metrics — "This automation saves me 3 hours per week" or "This workflow reduced response time by 60%"',
          'Share your work — Post about your AI experiments on LinkedIn. The AI community rewards sharing generously.',
          'Get certified — Complete courses (like this one!) and earn certifications that demonstrate your AI competency',
          'Build a personal AI toolkit — Curate the set of AI tools, prompts, and workflows that make you most effective',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Step 5: Network in AI Communities (Ongoing)',
      },
      {
        type: 'text',
        value: 'The AI landscape changes so fast that no course or book can keep you fully current. Communities are where real-time knowledge lives:',
      },
      {
        type: 'list',
        items: [
          'Join the n8n community forum — Thousands of automation practitioners sharing workflows and helping each other',
          'Follow AI leaders on LinkedIn and Twitter/X — Ethan Mollick, Simon Willison, Andrej Karpathy, and others share invaluable insights',
          'Attend AI meetups and conferences — Both virtual and in-person events are exploding in number',
          'Find an AI buddy — Partner with someone who is also learning. Accountability and shared discovery accelerate progress.',
          'Contribute, do not just consume — Answer questions, share your experiments, write about what you learned. Active participation creates opportunities.',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Your 90-Day Milestone',
      },
      {
        type: 'text',
        value: 'If you follow this plan, in 90 days you will have: daily AI usage habits, at least one working automation that saves you real time, a documented portfolio of AI projects, and a network of people who share your interest in AI. That puts you ahead of the vast majority of professionals.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Key Takeaway',
        text: 'The best time to start was yesterday. The second best time is today. Do not wait for AI to become "easier" or "more mature" — the people building skills now will be the leaders and experts that everyone turns to in 12 months. Start small, stay consistent, and keep learning.',
      },
    ],
  },
];
