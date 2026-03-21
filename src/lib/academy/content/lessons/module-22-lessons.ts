/**
 * Module 22: Understanding AI Agents — The Big Picture
 * Duration: 30 minutes | 4 Lessons
 */

import type { Lesson } from '../../types';

export const module22Lessons: Lesson[] = [
  // ==========================================================================
  // LESSON 22.1: What Are AI Agents?
  // ==========================================================================
  {
    id: 'lesson-22-1',
    moduleId: 'module-22',
    title: 'What Are AI Agents?',
    estimatedTime: 7,
    order: 1,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'You have probably used a chatbot before — you type a question, it types back an answer. AI agents are something fundamentally different. An agent does not just talk to you; it takes action on your behalf. Think of the difference between asking a friend for restaurant recommendations versus hiring a personal assistant who books the table, orders your favorite dish, and sends you the confirmation.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Chatbots vs. AI Agents: The Key Difference',
      },
      {
        type: 'text',
        value: 'A chatbot is reactive — it waits for your input and responds. An AI agent is proactive — it can plan a sequence of steps, use tools, make decisions, and complete tasks end-to-end. When you ask ChatGPT to "write me an email," that is a chatbot interaction. When you tell an agent "monitor my inbox, summarize important messages every morning, and draft replies to urgent ones," that is an agent interaction.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'The Restaurant Analogy',
        text: 'A chatbot is like a menu — it shows you options and you pick one. An AI agent is like a waiter who knows your preferences, suggests dishes based on what is fresh today, places your order, and checks back to make sure everything is right. The waiter takes initiative; the menu just sits there.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What Makes Something an "Agent"?',
      },
      {
        type: 'text',
        value: 'There are four characteristics that separate an AI agent from a simple chatbot:',
      },
      {
        type: 'list',
        items: [
          'Autonomy — It can work without you hovering over every step. You give it a goal, not a script.',
          'Tool Use — It can interact with external systems: browse the web, read files, send emails, query databases.',
          'Planning — It breaks down complex tasks into smaller steps and figures out the right order.',
          'Memory — It remembers context from previous interactions and learns from what worked.',
        ],
        ordered: true,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Real-World Examples of AI Agents Today',
      },
      {
        type: 'text',
        value: 'AI agents are not science fiction. They are already being used in businesses right now:',
      },
      {
        type: 'list',
        items: [
          'Customer support agents that resolve tickets by looking up order history, processing refunds, and sending confirmation emails — without a human in the loop',
          'Research agents that search dozens of sources, cross-reference information, and produce comprehensive reports',
          'Coding agents that read your codebase, write new features, run tests, and fix bugs',
          'Personal productivity agents that manage your calendar, summarize meetings, and prepare daily briefings',
        ],
        ordered: false,
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Why This Matters for You',
        text: 'You do not need to be a programmer to benefit from AI agents. Understanding what they can do — and what they cannot — is the most important career skill of the next decade. This course gives you that understanding.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Trust Spectrum',
      },
      {
        type: 'text',
        value: 'Not all agents have the same level of independence. Think of it as a spectrum: on one end, you have a "copilot" that suggests actions for you to approve. On the other end, you have a fully autonomous agent that handles everything. Most real-world deployments today sit somewhere in the middle — agents that do the work but check in with a human for important decisions. This is called "human-in-the-loop" and it is the sweet spot for most organizations right now.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Key Takeaway',
        text: 'An AI agent is an AI system that can plan, use tools, and take actions to accomplish goals — not just answer questions. The shift from chatbots to agents is the defining technology trend of 2025-2026.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 22.2: The AI Landscape Mapped
  // ==========================================================================
  {
    id: 'lesson-22-2',
    moduleId: 'module-22',
    title: 'The AI Landscape Mapped',
    estimatedTime: 8,
    order: 2,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'The AI industry can feel overwhelming — new companies, new models, and new products launch every week. But the landscape is actually dominated by a handful of major players, each with a distinct philosophy and set of strengths. Understanding who is who will help you make better decisions about which tools to use and which trends to follow.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Anthropic — The Safety-First Lab',
      },
      {
        type: 'text',
        value: 'Anthropic builds Claude, the AI assistant you may already be familiar with. Founded by former OpenAI researchers, Anthropic focuses heavily on AI safety and reliability. Their models are known for being thoughtful, nuanced, and less likely to produce harmful or inaccurate content. Claude is particularly strong at long documents, careful analysis, and following complex instructions.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Anthropic\'s Superpower',
        text: 'Claude has some of the largest context windows in the industry — meaning it can process extremely long documents (entire books, full codebases) in a single conversation. This makes it ideal for research, legal review, and any task requiring deep analysis of large amounts of text.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'OpenAI — The Household Name',
      },
      {
        type: 'text',
        value: 'OpenAI created ChatGPT, which brought AI into the mainstream in late 2022. They build the GPT series of models and offer them through ChatGPT (consumer product) and an API (for developers). OpenAI has the largest user base and the most brand recognition. Their models are versatile generalists — good at everything from creative writing to code generation to image creation with DALL-E.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Google — The Data Giant',
      },
      {
        type: 'text',
        value: 'Google builds the Gemini family of models (formerly called Bard). Google\'s unique advantage is integration with their massive ecosystem — Search, Gmail, Docs, YouTube, Maps, and Android. Gemini can pull information from Google Search in real-time and is deeply integrated into Google Workspace. Their models also excel at multimodal tasks — understanding images, video, and audio alongside text.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Microsoft — The Enterprise Powerhouse',
      },
      {
        type: 'text',
        value: 'Microsoft does not build its own frontier AI models — instead, they have a deep partnership with OpenAI and build products on top of GPT models. Microsoft Copilot is embedded across Office 365 (Word, Excel, PowerPoint, Teams, Outlook), GitHub, and Azure. Their strategy is clear: make AI available everywhere people already work. If your company uses Microsoft products, Copilot is likely your first point of contact with AI.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Meta — The Open-Source Champion',
      },
      {
        type: 'text',
        value: 'Meta (Facebook\'s parent company) takes a radically different approach: they give their AI models away for free. Their Llama series of models are open-source, meaning anyone can download, modify, and run them. This has created a massive ecosystem of community-built tools and specialized models. While Llama is not as polished for consumer use as ChatGPT or Claude, it is the foundation of countless business applications where companies want full control over their AI.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Open-Source vs. Proprietary: Why It Matters',
        text: 'Open-source models (like Llama) give you full control and privacy — data never leaves your servers. Proprietary models (like GPT, Claude, Gemini) are typically more capable but require sending data to the provider\'s servers. For sensitive industries like healthcare and finance, this distinction is critical.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Quick Comparison at a Glance',
      },
      {
        type: 'list',
        items: [
          'Anthropic (Claude) — Best for: safety-critical applications, long document analysis, careful reasoning',
          'OpenAI (GPT/ChatGPT) — Best for: general-purpose AI, creative tasks, largest ecosystem of plugins and integrations',
          'Google (Gemini) — Best for: multimodal tasks, real-time information, Google Workspace integration',
          'Microsoft (Copilot) — Best for: enterprise productivity, Office 365 integration, business workflows',
          'Meta (Llama) — Best for: self-hosted solutions, privacy-first applications, custom model development',
        ],
        ordered: false,
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Key Takeaway',
        text: 'There is no single "best" AI company. Each has a different philosophy and strength. The smartest approach is to understand what each offers and pick the right tool for each job — just like you might use Google for search, Apple for your phone, and Microsoft for work documents.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 22.3: Key Concepts Simplified
  // ==========================================================================
  {
    id: 'lesson-22-3',
    moduleId: 'module-22',
    title: 'Key Concepts Simplified',
    estimatedTime: 8,
    order: 3,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'AI conversations are full of jargon that can make the technology feel inaccessible. But every one of these concepts has a simple, intuitive explanation. Let us walk through the most important terms you will encounter, using everyday analogies that make them click.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Large Language Models (LLMs)',
      },
      {
        type: 'text',
        value: 'An LLM is the "brain" behind AI assistants like ChatGPT, Claude, and Gemini. It is a massive pattern-matching system that has read enormous amounts of text from the internet — books, articles, websites, code — and learned the patterns of human language. When you ask it a question, it is not looking up an answer in a database. It is predicting, word by word, what the most helpful response would be based on everything it has learned.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'The Library Analogy',
        text: 'Imagine someone who has read every book in the world\'s largest library. They did not memorize every fact, but they deeply understand how ideas connect, how language works, and how to explain things clearly. That is essentially what an LLM is — a system with incredibly broad knowledge and strong language skills, but not a perfect fact database.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Tokens — How AI Reads Text',
      },
      {
        type: 'text',
        value: 'AI models do not read words the way you do. They break text into smaller pieces called "tokens." A token is roughly 3/4 of a word in English. The word "hamburger" might be split into "ham," "bur," and "ger" — three tokens. Why does this matter? Because AI services charge by the token, and every model has a maximum number of tokens it can handle at once.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Context Window — The AI\'s Working Memory',
      },
      {
        type: 'text',
        value: 'The context window is the total amount of text an AI can "see" at one time — your question, the conversation history, and any documents you have shared. Think of it as the AI\'s desk space. A small context window is like working on a tiny desk — you can only spread out a few papers. A large context window is like having an entire conference table where you can lay out hundreds of documents simultaneously.',
      },
      {
        type: 'list',
        items: [
          'GPT-4 Turbo: ~128,000 tokens (roughly a 300-page book)',
          'Claude: up to 1,000,000 tokens (roughly 5-7 full-length novels)',
          'Gemini 1.5 Pro: up to 2,000,000 tokens (an entire codebase or document library)',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Fine-Tuning — Teaching AI New Tricks',
      },
      {
        type: 'text',
        value: 'Fine-tuning is like taking a generally educated person and giving them specialized training. The base model knows a lot about everything, but fine-tuning makes it an expert in a specific area. A hospital might fine-tune a model on medical records so it understands clinical terminology. A law firm might fine-tune one on case law. The model keeps its general abilities but gains deep expertise in the new domain.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'RAG — Giving AI Access to Your Data',
      },
      {
        type: 'text',
        value: 'RAG stands for Retrieval-Augmented Generation, but the concept is simple: instead of the AI relying only on what it learned during training, you let it search through your own documents before answering. It is like the difference between asking someone a question from memory versus letting them check the relevant files first. RAG dramatically reduces inaccurate answers because the AI cites real documents rather than generating from memory.',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'RAG in Everyday Terms',
        text: 'Imagine asking a new employee a question about company policy. Without RAG, they guess based on general knowledge. With RAG, they first look up the employee handbook, find the relevant section, and then give you an answer based on what the handbook actually says. Much more reliable.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Embeddings — How AI Understands Meaning',
      },
      {
        type: 'text',
        value: 'Embeddings are how AI converts text into numbers that represent meaning. The sentence "I love pizza" and "Pizza is my favorite food" would have very similar embeddings because they mean nearly the same thing, even though they use different words. This is what powers semantic search — finding information by meaning rather than exact keyword matches.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Key Takeaway',
        text: 'You do not need to understand the math behind these concepts. What matters is understanding what each one enables: LLMs give AI language skills, tokens determine cost, context windows set limits, fine-tuning adds expertise, RAG connects AI to your data, and embeddings let AI understand meaning.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 22.4: The Agentic Era — What Is Changing
  // ==========================================================================
  {
    id: 'lesson-22-4',
    moduleId: 'module-22',
    title: 'The Agentic Era — What Is Changing',
    estimatedTime: 7,
    order: 4,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'We are living through a fundamental shift in how AI works. From 2022 to 2024, the AI story was about chatbots — you type, AI responds. Starting in 2025, the story is about agents — AI systems that do not just talk but act. This is not a small upgrade. It is a change in kind, like going from reading a cookbook to hiring a chef.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Three Waves of AI',
      },
      {
        type: 'list',
        items: [
          'Wave 1 (2022-2023): Chat — AI as a conversation partner. You ask questions, it provides answers. Think early ChatGPT.',
          'Wave 2 (2024): Copilots — AI embedded in your tools. It suggests code as you type, drafts emails as you write, summarizes meetings as they happen. Think GitHub Copilot and Microsoft 365 Copilot.',
          'Wave 3 (2025-2026): Agents — AI that operates independently. You define a goal, the agent figures out the steps, uses tools, and delivers results. Think of a digital employee that works around the clock.',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Why 2025 Is the Tipping Point',
        text: 'Several breakthroughs converged: models became reliable enough to trust with multi-step tasks, tool-use capabilities matured, costs dropped dramatically, and standards like MCP (Model Context Protocol) made it easy to connect AI to real-world systems. The infrastructure for agents is finally ready.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What Agents Can Do Now That Chatbots Cannot',
      },
      {
        type: 'text',
        value: 'The gap between chatbots and agents is enormous. Here are concrete examples of what agents enable:',
      },
      {
        type: 'list',
        items: [
          'Multi-step workflows: "Research 10 competitors, analyze their pricing pages, and create a comparison spreadsheet" — the agent handles all steps',
          'Persistent monitoring: "Watch our support inbox and escalate any message mentioning data loss to the on-call engineer" — the agent runs continuously',
          'Cross-system coordination: "When a new customer signs up in Stripe, create their account in our app, send a welcome email, and notify the sales team in Slack" — the agent connects multiple tools',
          'Self-correction: When an agent encounters an error, it can try a different approach instead of just failing. A chatbot would simply tell you it cannot do it.',
        ],
        ordered: false,
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Compounding Effect',
      },
      {
        type: 'text',
        value: 'The most profound change is not what any single agent can do — it is what happens when agents work together. Imagine an agent that monitors industry news, another that analyzes market trends, and a third that generates strategy recommendations. Chained together, they create an always-on intelligence system that no team of humans could replicate at the same speed and cost.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'The Responsibility Factor',
        text: 'More capability means more responsibility. As agents take on consequential actions — sending emails, moving money, modifying data — the stakes go up. Understanding how to set guardrails, approval workflows, and monitoring is just as important as understanding what agents can do.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What This Means for You',
      },
      {
        type: 'text',
        value: 'Whether you are a manager, a marketer, a designer, or an operations specialist — agents will change how your job works within the next 12-18 months. The people who understand this shift early will have a massive advantage. They will be the ones designing agent workflows, setting up automation systems, and leading their organizations into this new era.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Key Takeaway',
        text: 'We are moving from "AI as a tool you use" to "AI as a colleague that works alongside you." The agentic era is not coming — it is here. The question is not whether your industry will be affected, but how quickly you will adapt.',
      },
    ],
  },
];
