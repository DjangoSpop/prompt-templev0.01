/**
 * Module 6: The Pharaoh's Decree — Capstone Project
 * 5 lessons | ~30 minutes total
 *
 * The final ascension. Learners synthesize everything from Modules 1-5
 * to design, build, and defend a production-grade prompt workflow
 * for a real-world problem they face.
 */

import type { Lesson } from '../../types';

export const module6Lessons: Lesson[] = [
  // ============================================================
  // LESSON 6.1: The Pharaoh's Challenge
  // ============================================================
  {
    id: 'lesson-6-1',
    moduleId: 'module-6',
    title: 'The Pharaoh\'s Challenge: Your Final Ascension',
    estimatedTime: 5,
    xpReward: 30,
    content: [
      {
        type: 'text',
        value: 'You\'ve survived the Entrance Hall, mastered the Architect\'s Blueprint, stocked the Armory, convened the High Priest\'s Council, and unlocked God Mode. Now comes the final test: **The Pharaoh\'s Decree**.',
      },

      {
        type: 'heading',
        level: 2,
        value: 'What is the Capstone?',
      },

      {
        type: 'text',
        value: 'The Capstone is not another lesson. It\'s a **mission**. You will design a complete, production-grade prompt workflow that solves a real problem in YOUR life or work. No training wheels. No templates. Just you, your skills, and the entire AI pantheon at your command.',
      },

      {
        type: 'callout',
        variant: 'tip',
        title: '👑 The Pharaoh\'s Standard',
        text: 'A Pharaoh doesn\'t just use tools — they design systems. Your capstone must demonstrate mastery of structure (CCCEFI), type selection, multi-model strategy, and advanced techniques. Half-measures will not pass the weighing of the heart.',
      },

      {
        type: 'heading',
        level: 2,
        value: 'Capstone Requirements',
      },

      {
        type: 'text',
        value: 'Your workflow must meet **all** of the following criteria:',
      },

      {
        type: 'list',
        ordered: true,
        items: [
          '**3-Step Minimum Workflow:** Design at least 3 interconnected prompts that chain together (e.g., Research → Draft → Refine)',
          '**2+ Prompt Types:** Use at least two different prompt types from Module 3 (e.g., Role-Based + Analytical, or Creative + Chain-of-Thought)',
          '**System Prompt / Template:** Include a reusable system prompt or template with variables (e.g., {{audience}}, {{topic}}, {{tone}})',
          '**Feedback Loop:** Define how you verify quality — LLM-as-a-Judge, human review, A/B testing, or confidence scoring',
          '**Model Selection Rationale:** Justify which AI model(s) you\'d use and why (cost, quality, speed trade-offs)',
        ],
      },

      {
        type: 'heading',
        level: 2,
        value: 'Why This Matters',
      },

      {
        type: 'text',
        value: 'Theory without application is a tomb without treasure. The capstone forces you to synthesize every concept into a working system. Companies pay $200K+ for "AI Engineers" who can do exactly this — design prompt workflows that deliver consistent, high-quality results at scale.',
      },

      {
        type: 'callout',
        variant: 'info',
        text: '💡 McKinsey estimates that 75% of generative AI\'s value comes from just 4 business functions: customer operations, marketing, software engineering, and R&D. Your capstone should target one of these — or any domain where you see opportunity.',
      },

      {
        type: 'heading',
        level: 2,
        value: 'The Journey Map',
      },

      {
        type: 'text',
        value: 'Over the next 4 lessons, you\'ll build your capstone step by step:',
      },

      {
        type: 'list',
        ordered: true,
        items: [
          '**Lesson 6.2:** Choose your domain and define the problem (The Decree)',
          '**Lesson 6.3:** Architect the workflow — map the prompt chain (The Blueprint)',
          '**Lesson 6.4:** Build the prompts — write production-grade templates (The Construction)',
          '**Lesson 6.5:** Test, validate, and present your workflow (The Coronation)',
        ],
      },

      {
        type: 'callout',
        variant: 'success',
        title: '🏆 Completion Reward',
        text: 'Completing the capstone earns you the "Pharaoh" badge, 300 XP, and a shareable certificate of mastery. Your workflow will be added to the PromptCraft community gallery for peer review and upvotes.',
      },
    ],
    order: 1,
  },

  // ============================================================
  // LESSON 6.2: Defining Your Decree (Problem Selection)
  // ============================================================
  {
    id: 'lesson-6-2',
    moduleId: 'module-6',
    title: 'Defining Your Decree: Problem Selection',
    estimatedTime: 6,
    xpReward: 30,
    content: [
      {
        type: 'text',
        value: 'A Pharaoh\'s decree must be clear, actionable, and impactful. Before you write a single prompt, you need to define exactly what problem you\'re solving and for whom.',
      },

      {
        type: 'heading',
        level: 2,
        value: 'Step 1: Choose Your Domain',
      },

      {
        type: 'text',
        value: 'Pick a domain where you have real expertise or genuine need. The best capstones solve problems the builder actually faces:',
      },

      {
        type: 'list',
        ordered: false,
        items: [
          '📧 **Sales & Marketing:** Lead generation, content pipelines, competitor analysis',
          '⚖️ **Legal:** Contract review, case research, compliance checking',
          '💻 **Software Engineering:** Code review, documentation, bug triage',
          '📊 **Data & Analytics:** Report generation, trend analysis, data cleaning',
          '🎓 **Education:** Lesson planning, student feedback, quiz generation',
          '🏥 **Healthcare:** Patient note summarization, research synthesis, billing codes',
          '🎨 **Creative:** Content calendars, brand voice systems, multi-channel campaigns',
          '📋 **Operations:** Meeting summaries, SOP generation, process optimization',
        ],
      },

      {
        type: 'heading',
        level: 2,
        value: 'Step 2: The Problem Statement Formula',
      },

      {
        type: 'text',
        value: 'Use this template to crystallize your problem:',
      },

      {
        type: 'code',
        language: 'text',
        code: `THE PHARAOH'S DECREE

Domain: [Your chosen field]
Problem: [What specific task takes too long, costs too much, or produces inconsistent results?]
Current State: [How is this done today? How long does it take?]
Desired State: [What does "solved" look like? What metrics improve?]
Target User: [Who will use this workflow? What's their skill level?]
Success Metric: [How will you measure if the workflow works? e.g., "Reduces time from 4 hours to 30 minutes"]`,
        caption: 'The Pharaoh\'s Decree Template — your problem definition framework',
      },

      {
        type: 'heading',
        level: 2,
        value: 'Example Decrees',
      },

      {
        type: 'callout',
        variant: 'tip',
        title: 'Example 1: The Sales Accelerator',
        text: '**Domain:** B2B Sales\n**Problem:** SDRs spend 2 hours per prospect researching companies before outreach\n**Current State:** Manual LinkedIn + website + news scanning\n**Desired State:** Complete prospect brief in 5 minutes\n**Target User:** Sales Development Reps (non-technical)\n**Success Metric:** Research time drops from 120 min → 5 min per prospect',
      },

      {
        type: 'callout',
        variant: 'tip',
        title: 'Example 2: The Code Reviewer',
        text: '**Domain:** Software Engineering\n**Problem:** Code reviews take 45 min per PR and miss edge cases\n**Current State:** Senior devs manually review, inconsistent feedback quality\n**Desired State:** AI pre-reviews every PR with structured feedback before human review\n**Target User:** Engineering team (10 developers)\n**Success Metric:** Human review time drops 60%, edge case detection improves 40%',
      },

      {
        type: 'callout',
        variant: 'tip',
        title: 'Example 3: The Content Engine',
        text: '**Domain:** Content Marketing\n**Problem:** Creating consistent multi-channel content (blog, social, email) from one topic\n**Current State:** Writer creates each piece separately — 8 hours per topic\n**Desired State:** Generate all assets from one brief in 45 minutes\n**Target User:** Marketing team (3 writers)\n**Success Metric:** Content production cost drops 70%, brand voice consistency score > 90%',
      },

      {
        type: 'heading',
        level: 2,
        value: 'The Anti-Patterns (What NOT to Choose)',
      },

      {
        type: 'list',
        ordered: false,
        items: [
          '❌ **Too vague:** "Use AI to make my job easier" — What job? What task? What metric?',
          '❌ **Too simple:** "Summarize an article" — One prompt isn\'t a workflow',
          '❌ **Too theoretical:** "Build AGI" — This must be buildable TODAY with current tools',
          '❌ **No feedback loop:** "Generate content and ship it" — How do you know it\'s good?',
        ],
      },

      {
        type: 'heading',
        level: 2,
        value: 'Your Turn: Write Your Decree',
      },

      {
        type: 'text',
        value: 'Before moving to the next lesson, write your own Pharaoh\'s Decree using the template above. Be specific. Be measurable. A vague decree produces a vague workflow — and vague pharaohs get overthrown.',
      },

      {
        type: 'callout',
        variant: 'warning',
        text: '⚠️ **Checkpoint:** Don\'t proceed to Lesson 6.3 until you\'ve written your decree. Everything else builds on it. Skipping this step is like building a pyramid without a foundation — it will collapse.',
      },
    ],
    order: 2,
  },

  // ============================================================
  // LESSON 6.3: Architecting the Workflow (The Blueprint)
  // ============================================================
  {
    id: 'lesson-6-3',
    moduleId: 'module-6',
    title: 'Architecting the Workflow: The Sacred Blueprint',
    estimatedTime: 7,
    xpReward: 35,
    content: [
      {
        type: 'text',
        value: 'The Great Pyramid wasn\'t built by stacking random stones. It was designed by architects who mapped every layer, every corridor, every chamber before the first block was placed. Your prompt workflow deserves the same precision.',
      },

      {
        type: 'heading',
        level: 2,
        value: 'The Workflow Architecture Framework',
      },

      {
        type: 'text',
        value: 'Every production prompt workflow follows this pattern:',
      },

      {
        type: 'code',
        language: 'text',
        code: `┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   INPUT      │───→│   STEP 1    │───→│   STEP 2    │───→│   STEP 3    │
│  (Raw Data)  │    │  (Process)  │    │  (Refine)   │    │  (Output)   │
└─────────────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
                          │                  │                  │
                          ▼                  ▼                  ▼
                   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
                   │  Validate   │    │  Validate   │    │  QA Check   │
                   │  (Quality)  │    │  (Quality)  │    │  (Final)    │
                   └─────────────┘    └─────────────┘    └─────────────┘`,
        caption: 'The Sacred Blueprint — every step has a validation gate',
      },

      {
        type: 'heading',
        level: 2,
        value: 'Mapping Your Steps',
      },

      {
        type: 'text',
        value: 'For each step in your workflow, define:',
      },

      {
        type: 'list',
        ordered: true,
        items: [
          '**Input:** What data flows INTO this step? (User input? Output from previous step? External data?)',
          '**Prompt Type:** Which of the 8 prompt types from Module 3? (Role-Based? Analytical? Chain-of-Thought?)',
          '**Model Choice:** Which AI model and why? (GPT-4 for reasoning? Claude for long context? Haiku for speed?)',
          '**Output Format:** What shape does the output take? (JSON? Markdown? Table? Bullet points?)',
          '**Validation:** How do you check this step\'s output before passing it forward?',
        ],
      },

      {
        type: 'heading',
        level: 2,
        value: 'Example: Sales Prospecting Workflow',
      },

      {
        type: 'code',
        language: 'text',
        code: `WORKFLOW: "The Prospect Decoder"

STEP 1: Company Research (Analytical Prompt)
├── Input: Company name + website URL
├── Model: GPT-4 (needs strong reasoning)
├── Prompt Type: Analytical + Role-Based
├── Output: JSON { industry, size, pain_points[], recent_news[], tech_stack[] }
├── Validation: Check JSON is valid, all fields populated
└── Passes to: Step 2

STEP 2: Personalized Messaging (Creative + Role-Based)
├── Input: Step 1 JSON output + product info
├── Model: Claude 3.5 Sonnet (excellent writing quality)
├── Prompt Type: Role-Based ("Act as a top-performing SDR") + Creative
├── Output: 3 email variants (formal, casual, provocative)
├── Validation: LLM-as-Judge scores each variant (tone, personalization, CTA)
└── Passes to: Step 3

STEP 3: Objection Preparation (Chain-of-Thought)
├── Input: Step 1 pain points + product fit analysis
├── Model: GPT-4 (complex reasoning for objection handling)
├── Prompt Type: Chain-of-Thought + Few-Shot (example objections)
├── Output: Objection-response pairs with confidence scores
├── Validation: Human review for top 3 objections
└── Final Output: Complete prospect brief`,
        caption: 'A fully mapped 3-step workflow with validation at every gate',
      },

      {
        type: 'heading',
        level: 2,
        value: 'Design Patterns for Prompt Workflows',
      },

      {
        type: 'heading',
        level: 3,
        value: 'Pattern 1: The Pipeline (Sequential)',
      },

      {
        type: 'text',
        value: 'Step A → Step B → Step C. Each step depends on the previous. Best for linear transformations (raw data → analysis → report).',
      },

      {
        type: 'heading',
        level: 3,
        value: 'Pattern 2: The Fan-Out / Fan-In (Parallel)',
      },

      {
        type: 'text',
        value: 'One input fans out to multiple parallel prompts, then results merge. Best for getting multiple perspectives (Triangulation from Module 4).',
      },

      {
        type: 'code',
        language: 'text',
        code: `Input ──┬──→ Prompt A (GPT-4: Analysis) ──┐
        ├──→ Prompt B (Claude: Creative)   ──┼──→ Merge & Synthesize
        └──→ Prompt C (Gemini: Visual)     ──┘`,
      },

      {
        type: 'heading',
        level: 3,
        value: 'Pattern 3: The Loop (Iterative Refinement)',
      },

      {
        type: 'text',
        value: 'Generate → Evaluate → Refine → Evaluate → Refine... until quality threshold met. Best for creative work and complex reasoning.',
      },

      {
        type: 'code',
        language: 'text',
        code: `Generate Draft ──→ LLM Judge (Score 1-10) ──→ Score ≥ 8? ──→ YES: Output
                                                          │
                                                          NO
                                                          │
                                                          ▼
                                                    Refine with feedback
                                                          │
                                                          └──→ Back to Judge`,
      },

      {
        type: 'heading',
        level: 3,
        value: 'Pattern 4: The Guardian (Validation Gate)',
      },

      {
        type: 'text',
        value: 'A separate "guardian" prompt checks every output for safety, accuracy, or compliance before it reaches the user. Essential for healthcare, legal, and financial applications.',
      },

      {
        type: 'heading',
        level: 2,
        value: 'Your Turn: Draw Your Blueprint',
      },

      {
        type: 'text',
        value: 'Map your capstone workflow using the framework above. For each step, fill in: Input, Prompt Type, Model Choice, Output Format, and Validation method. Aim for 3-5 steps.',
      },

      {
        type: 'callout',
        variant: 'success',
        text: '✅ **Pro Tip:** Start with 3 steps. You can always add complexity later. A clean 3-step workflow beats a messy 7-step one every time. Remember: pyramids are elegant because of their simplicity.',
      },
    ],
    order: 3,
  },

  // ============================================================
  // LESSON 6.4: Building the Prompts (The Construction)
  // ============================================================
  {
    id: 'lesson-6-4',
    moduleId: 'module-6',
    title: 'Building the Prompts: The Construction Phase',
    estimatedTime: 7,
    xpReward: 35,
    content: [
      {
        type: 'text',
        value: 'The blueprint is drawn. Now we lay the stones. In this lesson, you\'ll write production-grade prompts for each step of your workflow using every technique you\'ve learned.',
      },

      {
        type: 'heading',
        level: 2,
        value: 'The Production Prompt Template',
      },

      {
        type: 'text',
        value: 'Every prompt in your workflow should follow this production-ready structure:',
      },

      {
        type: 'code',
        language: 'text',
        code: `# SYSTEM PROMPT (The Constitution)
You are {{role}}, an expert in {{domain}}.
Your communication style is {{tone}}.
You always {{positive_constraint}}.
You never {{negative_constraint}}.

# USER PROMPT (The Decree)
## Context
{{background_information}}
The target audience is {{audience}}.

## Task
{{specific_instruction_with_action_verb}}

## Constraints
- Maximum length: {{max_length}}
- Must include: {{required_elements}}
- Must NOT include: {{forbidden_elements}}
- Language: {{language}}

## Format
Output as: {{format_specification}}

## Examples (Few-Shot)
### Example Input:
{{example_input}}

### Example Output:
{{example_output}}

## Quality Criteria
The output will be evaluated on:
1. {{criterion_1}}
2. {{criterion_2}}
3. {{criterion_3}}`,
        caption: 'The Master Template — production-grade prompt with variables',
      },

      {
        type: 'heading',
        level: 2,
        value: 'Building a System Prompt',
      },

      {
        type: 'text',
        value: 'The **System Prompt** is the "constitution" of your workflow — it defines the AI\'s personality, boundaries, and operating rules. It\'s set once and applies to every interaction.',
      },

      {
        type: 'callout',
        variant: 'info',
        text: '💡 Think of the System Prompt as hiring an employee. The job description (system prompt) stays the same. The daily tasks (user prompts) change. A great job description means less micromanagement on every task.',
      },

      {
        type: 'code',
        language: 'text',
        code: `EXAMPLE SYSTEM PROMPT: "The Legal Eagle"

You are a senior contract attorney with 20 years of experience 
in technology licensing agreements.

RULES:
- Always cite specific clause numbers when referencing contracts
- Flag any clause that could expose the company to liability > $100K
- Use plain English summaries alongside legal terminology
- Never provide definitive legal advice — always frame as "analysis suggests"
- Output risk ratings as: 🟢 Low | 🟡 Medium | 🔴 High

FORMAT PREFERENCES:
- Use tables for clause comparisons
- Use bullet points for risk summaries
- Include a "TL;DR" section at the top of every analysis`,
        caption: 'A system prompt that turns any LLM into a specialized legal analyst',
      },

      {
        type: 'heading',
        level: 2,
        value: 'Writing Chained Prompts',
      },

      {
        type: 'text',
        value: 'When prompts chain together, the output of Step N becomes the input of Step N+1. Here\'s how to design clean handoffs:',
      },

      {
        type: 'list',
        ordered: true,
        items: [
          '**Structured Output:** Always request JSON or structured format from upstream prompts — it\'s easier to parse and inject into the next prompt',
          '**Explicit References:** In Step 2, say "Based on the following analysis: {{step_1_output}}" — don\'t assume the AI remembers',
          '**Scope Narrowing:** Each step should narrow the focus. Step 1 = broad research, Step 2 = specific analysis, Step 3 = targeted output',
          '**Error Handling:** Include "If the input is incomplete or unclear, respond with: { error: true, missing: [field_names] }" in every prompt',
        ],
      },

      {
        type: 'heading',
        level: 2,
        value: 'Full Example: Content Engine Workflow',
      },

      {
        type: 'code',
        language: 'text',
        code: `═══════════════════════════════════════════════════
STEP 1: Topic Researcher (Analytical + Role-Based)
Model: GPT-4 | Cost: ~$0.03 per run
═══════════════════════════════════════════════════

SYSTEM: You are a senior content strategist at a SaaS company.

USER: Research the topic "{{topic}}" for our {{audience}} audience.

Provide:
1. Top 5 questions our audience asks about this topic (from forums, Reddit, Quora)
2. Top 3 competing articles (title + key angle)
3. Our unique angle (what gap exists in current content?)
4. SEO keywords (5 primary, 10 long-tail)
5. Recommended content formats (blog, video, infographic, etc.)

Output as JSON.

═══════════════════════════════════════════════════
STEP 2: Draft Generator (Creative + Few-Shot)
Model: Claude 3.5 Sonnet | Cost: ~$0.02 per run
═══════════════════════════════════════════════════

SYSTEM: You are an award-winning content writer who combines 
depth with readability. You write at an 8th-grade reading level 
with expert-level insights.

USER: Using this research: {{step_1_output}}

Write a {{content_type}} with these specifications:
- Title: Hook-based, curiosity-driven
- Length: {{word_count}} words
- Structure: Problem → Agitation → Solution → CTA
- Tone: {{brand_tone}}
- Include: {{required_elements}}

═══════════════════════════════════════════════════
STEP 3: Quality Assurance (LLM-as-Judge)
Model: GPT-4 | Cost: ~$0.02 per run
═══════════════════════════════════════════════════

SYSTEM: You are a ruthless editor. Score content on a 1-10 scale.

USER: Evaluate this content against these criteria:

CONTENT: {{step_2_output}}

CRITERIA:
1. Brand voice consistency (does it match {{brand_tone}}?)
2. Factual accuracy (any claims that need sources?)
3. Readability (Flesch-Kincaid grade level ≤ 8?)
4. SEO optimization (does it include {{keywords}}?)
5. Call-to-action strength (clear, specific, compelling?)

If overall score < 7, provide specific revision instructions.
If score ≥ 7, output: { "status": "approved", "score": X }`,
        caption: 'A complete 3-step content workflow with cost estimates',
      },

      {
        type: 'heading',
        level: 2,
        value: 'Cost Estimation',
      },

      {
        type: 'text',
        value: 'Always estimate cost per workflow run. Here\'s a cheat sheet:',
      },

      {
        type: 'list',
        ordered: false,
        items: [
          '**GPT-4o:** ~$0.01-0.03 per prompt (best for reasoning)',
          '**Claude 3.5 Sonnet:** ~$0.01-0.02 per prompt (best for writing + long context)',
          '**GPT-4o mini / Claude Haiku:** ~$0.001-0.005 per prompt (best for simple tasks)',
          '**Gemini 1.5 Pro:** ~$0.01-0.03 per prompt (best for multimodal)',
          '**Open Source (Llama 3):** Free to run, but requires infrastructure',
        ],
      },

      {
        type: 'callout',
        variant: 'warning',
        text: '⚠️ **The 90/10 Rule:** 90% of your workflow steps can use cheap models. Only 10% (the hard reasoning or quality-critical steps) need GPT-4/Claude Opus. Design for this ratio — it can reduce costs by 80%.',
      },

      {
        type: 'heading',
        level: 2,
        value: 'Your Turn: Write Your Prompts',
      },

      {
        type: 'text',
        value: 'Write the full prompts for each step of your workflow. Use the production template. Include variables, constraints, format specifications, and examples. Test each prompt individually before chaining them together.',
      },
    ],
    order: 4,
  },

  // ============================================================
  // LESSON 6.5: Testing & The Coronation
  // ============================================================
  {
    id: 'lesson-6-5',
    moduleId: 'module-6',
    title: 'The Coronation: Testing, Validation & Presentation',
    estimatedTime: 5,
    xpReward: 30,
    content: [
      {
        type: 'text',
        value: 'The stones are laid. The prompts are written. But a pyramid isn\'t declared a wonder until it withstands the test of time. Let\'s validate your workflow and prepare for your coronation.',
      },

      {
        type: 'heading',
        level: 2,
        value: 'The 5-Point Validation Protocol',
      },

      {
        type: 'text',
        value: 'Before you declare your workflow complete, run it through these 5 tests:',
      },

      {
        type: 'list',
        ordered: true,
        items: [
          '**The Happy Path Test:** Run the workflow with ideal input. Does it produce the expected output? (If this fails, your prompts need work)',
          '**The Edge Case Test:** Run it with unusual, incomplete, or malformed input. Does it fail gracefully? (Add error handling if not)',
          '**The Consistency Test:** Run it 5 times with the same input. Are the outputs consistent enough? (If not, lower the temperature or add more constraints)',
          '**The Cost Test:** Calculate the total cost per run. Is it sustainable at scale? (If too expensive, swap expensive models for cheaper ones in non-critical steps)',
          '**The Human Test:** Show the output to someone in your target audience. Does it solve their problem? (If not, your decree needs refinement)',
        ],
      },

      {
        type: 'heading',
        level: 2,
        value: 'Building Your Quality Scorecard',
      },

      {
        type: 'text',
        value: 'Create a scorecard for your workflow\'s output:',
      },

      {
        type: 'code',
        language: 'text',
        code: `WORKFLOW QUALITY SCORECARD

Workflow Name: ____________________
Date Tested: ____________________
Test Runs: 5

┌──────────────────┬──────┬──────┬──────┬──────┬──────┬─────────┐
│ Criterion        │ Run 1│ Run 2│ Run 3│ Run 4│ Run 5│ Average │
├──────────────────┼──────┼──────┼──────┼──────┼──────┼─────────┤
│ Accuracy         │  /10 │  /10 │  /10 │  /10 │  /10 │     /10 │
│ Completeness     │  /10 │  /10 │  /10 │  /10 │  /10 │     /10 │
│ Format Quality   │  /10 │  /10 │  /10 │  /10 │  /10 │     /10 │
│ Brand/Tone Match │  /10 │  /10 │  /10 │  /10 │  /10 │     /10 │
│ Actionability    │  /10 │  /10 │  /10 │  /10 │  /10 │     /10 │
├──────────────────┼──────┼──────┼──────┼──────┼──────┼─────────┤
│ TOTAL            │  /50 │  /50 │  /50 │  /50 │  /50 │     /50 │
└──────────────────┴──────┴──────┴──────┴──────┴──────┴─────────┘

Target: Average ≥ 40/50 (80%)
Cost per run: $____
Time per run: ____ minutes
Time saved vs. manual: ____x`,
        caption: 'Your workflow quality scorecard — aim for 80%+ average',
      },

      {
        type: 'heading',
        level: 2,
        value: 'The A/B Testing Framework',
      },

      {
        type: 'text',
        value: 'Don\'t just test your workflow — test VARIANTS of it:',
      },

      {
        type: 'list',
        ordered: false,
        items: [
          '**Prompt A vs. Prompt B:** Test different instructions for the same step. Which produces better output?',
          '**Model A vs. Model B:** Does Claude write better than GPT for your specific use case?',
          '**Temperature 0.3 vs. 0.7:** Does lower temperature give more consistent results?',
          '**With examples vs. without:** Do few-shot examples improve quality enough to justify the extra tokens?',
        ],
      },

      {
        type: 'heading',
        level: 2,
        value: 'Presenting Your Workflow',
      },

      {
        type: 'text',
        value: 'Your capstone presentation should include:',
      },

      {
        type: 'list',
        ordered: true,
        items: [
          '**The Decree:** Your problem statement (from Lesson 6.2)',
          '**The Blueprint:** Visual workflow diagram (from Lesson 6.3)',
          '**The Prompts:** Full text of each prompt with variables highlighted (from Lesson 6.4)',
          '**The Evidence:** Quality scorecard showing 5 test runs (from this lesson)',
          '**The ROI:** Time/cost savings calculation ("Was 4 hours, now 20 minutes = 12x improvement")',
          '**The Iteration Plan:** What would you improve next? What did you learn?',
        ],
      },

      {
        type: 'heading',
        level: 2,
        value: 'The Pharaoh\'s Reflection',
      },

      {
        type: 'text',
        value: 'Before you submit, answer these reflection questions:',
      },

      {
        type: 'list',
        ordered: true,
        items: [
          'What was the hardest part of designing this workflow? Why?',
          'Which Module (1-5) concept was MOST useful in building your capstone?',
          'If you had to teach someone else to use your workflow, what would you tell them first?',
          'What would you change if you had access to unlimited AI credits?',
          'How will you use this workflow in your actual work starting tomorrow?',
        ],
      },

      {
        type: 'callout',
        variant: 'success',
        title: '👑 You Have Ascended',
        text: 'Completing this capstone means you\'ve done what 99% of AI users never do: you\'ve gone beyond prompting tricks to designing systems. You\'re not a tourist in the Temple anymore. You\'re the Pharaoh. Welcome to the throne.',
      },

      {
        type: 'heading',
        level: 2,
        value: 'What\'s Next?',
      },

      {
        type: 'list',
        ordered: false,
        items: [
          '🏆 Submit your capstone for peer review in the PromptCraft Gallery',
          '⭐ Upvote the best workflows from other Pharaohs',
          '📜 Download your "Prompt Engineering Mastery" certificate',
          '🔄 Iterate — the best workflows evolve. Come back and refine yours',
          '🌍 Share your certificate on LinkedIn (you earned it!)',
        ],
      },

      {
        type: 'callout',
        variant: 'info',
        text: '💡 "The secret of change is to focus all of your energy not on fighting the old, but on building the new." — The Temple of AI has taught you to build. Now go build something extraordinary.',
      },
    ],
    order: 5,
  },
];
