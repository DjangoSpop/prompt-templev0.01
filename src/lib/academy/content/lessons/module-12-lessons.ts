/**
 * Module 12: Social Media Publishing Factory
 * Duration: 25 minutes | 10 Lessons
 */

import type { Lesson } from '../../types';

export const module12Lessons: Lesson[] = [
  // ==========================================================================
  // LESSON 12.1: Introduction to Multi-Platform Publishing
  // ==========================================================================
  {
    id: 'lesson-12-1',
    moduleId: 'module-12',
    title: 'Introduction to Multi-Platform Publishing',
    estimatedTime: 2,
    order: 1,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Creating content for one platform is manageable. Creating adapted versions for five platforms — X, Instagram, Facebook, LinkedIn, and YouTube Shorts — is a full-time job. Unless you automate it. In this module, you\'ll build a content publishing factory that takes a single piece of content and automatically adapts and publishes it everywhere.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Multi-Platform Challenge',
      },
      {
        type: 'text',
        value: 'Every social media platform has its own rules, culture, and audience expectations. What works on LinkedIn will fail on X. What performs on Instagram looks wrong on Facebook. The challenge is not just publishing — it\'s adapting.',
      },
      {
        type: 'list',
        items: [
          'X/Twitter — 280 characters, punchy, casual tone, 1-2 hashtags',
          'LinkedIn — 1,200-1,500 characters, professional tone, thought leadership format',
          'Instagram — Visual-first, emoji-rich captions, hashtag block of 20-30 tags',
          'Facebook — Conversational, longer form, storytelling, community-oriented',
          'YouTube Shorts — Script format, hook in first 3 seconds, call-to-action',
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'The 1-to-5 Content Multiplier',
        text: 'A single blog post or content idea can generate 5+ platform-specific posts. This is the content multiplier effect — write once, publish everywhere in the right format. Our factory automates this entire process.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Architecture Overview',
      },
      {
        type: 'text',
        value: 'The publishing factory uses an orchestrator-worker pattern. A central AI agent receives the content and delegates to platform-specific sub-workflows:',
      },
      {
        type: 'code',
        language: 'text',
        code: `[Chat Trigger / Schedule Trigger]
              │
              ▼
[AI Orchestrator Agent]
  ├── Window Buffer Memory
  ├── Tool: publish_to_x (sub-workflow)
  ├── Tool: publish_to_linkedin (sub-workflow)
  ├── Tool: publish_to_instagram (sub-workflow)
  ├── Tool: publish_to_facebook (sub-workflow)
  └── Tool: publish_to_youtube (sub-workflow)
              │
              ▼
[Notion: Update Content Calendar Status]`,
        caption: 'The orchestrator agent delegates to platform-specific sub-workflows via toolWorkflow nodes',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Key Concepts',
      },
      {
        type: 'list',
        items: [
          'Orchestrator Agent — The central AI that understands your content and decides how to adapt it per platform',
          'toolWorkflow nodes — n8n nodes that reference child workflows by ID, letting the agent call them as tools',
          'Sub-workflows — Separate n8n workflows for each platform that handle formatting and API calls',
          'Content Calendar — A Notion database that serves as the single source of truth for all content',
        ],
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Time Savings',
        text: 'Manually adapting and publishing to 5 platforms takes 45-60 minutes per piece of content. This factory reduces it to writing one post in Notion (~5 minutes) and letting the automation handle the rest. For daily posting, that\'s saving 5+ hours per week.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 12.2: Content Adaptation Strategy Per Platform
  // ==========================================================================
  {
    id: 'lesson-12-2',
    moduleId: 'module-12',
    title: 'Content Adaptation Strategy Per Platform',
    estimatedTime: 3,
    order: 2,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'Content adaptation is not just about truncating text to fit character limits. Each platform has a distinct culture, audience behavior, and content format. Understanding these differences is what makes the AI prompts effective.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Platform-Specific Formatting Rules',
      },
      {
        type: 'code',
        language: 'text',
        code: `Platform Comparison Matrix:
═══════════════════════════════════════════════════════════
Platform    │ Max Length │ Tone        │ Hashtags │ Media
────────────┼───────────┼─────────────┼──────────┼────────
X/Twitter   │ 280 chars │ Casual,     │ 1-2      │ Optional
            │           │ punchy      │          │ image
────────────┼───────────┼─────────────┼──────────┼────────
LinkedIn    │ 3,000     │ Professional│ 3-5      │ Image
            │ (aim for  │ thought     │ inline   │ recommended
            │ 1,200-    │ leadership  │          │
            │ 1,500)    │             │          │
────────────┼───────────┼─────────────┼──────────┼────────
Instagram   │ 2,200     │ Casual,     │ 20-30    │ Required
            │ chars     │ emoji-rich  │ (block)  │ (square)
────────────┼───────────┼─────────────┼──────────┼────────
Facebook    │ 63,206    │ Conversatio-│ 1-3      │ Optional
            │ (aim for  │ nal, story- │          │
            │ 500-800)  │ telling     │          │
────────────┼───────────┼─────────────┼──────────┼────────
YouTube     │ 100 chars │ Energetic,  │ 3-5 in   │ Video
Shorts      │ title     │ hook-first  │ desc.    │ required
═══════════════════════════════════════════════════════════`,
        caption: 'Each platform demands different content length, tone, hashtag strategy, and media',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Adaptation Prompt Template',
      },
      {
        type: 'text',
        value: 'Each platform sub-workflow uses a carefully crafted prompt that tells the AI exactly how to adapt the content:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Base Prompt Template:
─────────────────────────────────
You are a social media content expert specializing
in {platform}.

Adapt the following content for {platform}:
- Tone: {tone_description}
- Length: {max_characters} characters maximum
- Hashtags: {hashtag_strategy}
- Format: {format_requirements}
- Audience: {audience_description}

Original content:
{content}

Rules:
1. Never just truncate — rewrite for the platform
2. Preserve the core message and key insights
3. Match the platform's native content style
4. Include a clear call-to-action`,
        caption: 'The template used for each platform — variables are filled per-platform',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Adaptation vs. Repurposing',
        text: 'Adaptation means reshaping content for a different context while preserving the message. Repurposing is creating entirely new content from the same idea. Our factory does adaptation — the AI takes your specific points and reformats them, not generate new ideas.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Content Types That Work Cross-Platform',
      },
      {
        type: 'list',
        items: [
          'How-to guides — Adapt from detailed steps (LinkedIn) to quick tips (X) to visual steps (Instagram)',
          'Industry insights — Professional analysis (LinkedIn) to hot take (X) to infographic caption (Instagram)',
          'Case studies — Full story (LinkedIn/Facebook) to result highlight (X) to before/after (Instagram)',
          'Opinions — Thought leadership (LinkedIn) to debate starter (X) to community question (Facebook)',
          'Announcements — Press release style (LinkedIn) to excitement (X/Instagram) to story (Facebook)',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Platform-Native Content Always Wins',
        text: 'Users can spot cross-posted content instantly. A LinkedIn post copy-pasted to X feels wrong. The AI adaptation must make each version feel like it was written natively for that platform. This is why each sub-workflow has its own specialized prompt.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 12.3: The Orchestrator Agent Architecture
  // ==========================================================================
  {
    id: 'lesson-12-3',
    moduleId: 'module-12',
    title: 'The Orchestrator Agent Architecture',
    estimatedTime: 3,
    order: 3,
    xpReward: 30,
    content: [
      {
        type: 'text',
        value: 'The orchestrator agent is the brain of the publishing factory. It receives content, understands what platforms to target, and delegates the actual publishing to specialized sub-workflows. This separation of concerns keeps the system modular and maintainable.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Why Use an Orchestrator Pattern?',
      },
      {
        type: 'list',
        items: [
          'Modularity — Each platform is an independent sub-workflow. Add or remove platforms without affecting others.',
          'Intelligence — The AI agent decides which platforms to publish to based on content type and instructions.',
          'Error isolation — If the Instagram publish fails, LinkedIn still succeeds. Failures don\'t cascade.',
          'Reusability — Sub-workflows can be used by other workflows or triggered independently.',
          'Testability — Test each platform sub-workflow in isolation before connecting to the orchestrator.',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'The toolWorkflow Pattern',
      },
      {
        type: 'text',
        value: 'In n8n, the orchestrator calls sub-workflows using toolWorkflow nodes. Each toolWorkflow references a child workflow by its workflow ID:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Orchestrator Agent Tools Configuration:
═══════════════════════════════════════

Tool 1: publish_to_x
  Type: toolWorkflow
  Workflow ID: "wf_x_publisher_abc123"
  Description: "Adapts content for X/Twitter (280 chars,
               casual tone) and publishes it."

Tool 2: publish_to_linkedin
  Type: toolWorkflow
  Workflow ID: "wf_linkedin_publisher_def456"
  Description: "Adapts content for LinkedIn (professional
               tone, 1200-1500 chars) and publishes it."

Tool 3: publish_to_instagram
  Type: toolWorkflow
  Workflow ID: "wf_instagram_publisher_ghi789"
  Description: "Adapts content for Instagram (emoji-rich,
               hashtag block) and publishes it."

Tool 4: publish_to_facebook
  Type: toolWorkflow
  Workflow ID: "wf_facebook_publisher_jkl012"
  Description: "Adapts content for Facebook (conversational,
               storytelling) and publishes it."

Tool 5: publish_to_youtube_shorts
  Type: toolWorkflow
  Workflow ID: "wf_youtube_publisher_mno345"
  Description: "Creates a YouTube Shorts script from the
               content with hook and CTA."`,
        caption: 'Each tool is a reference to an independent sub-workflow by ID',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'How toolWorkflow Nodes Work',
        text: 'When the agent decides to call a tool (e.g., publish_to_linkedin), n8n triggers the referenced child workflow, passes the content as input, waits for it to complete, and returns the result to the agent. The agent can then decide to call the next tool or provide a summary.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Orchestrator System Prompt',
      },
      {
        type: 'code',
        language: 'text',
        code: `System Prompt for Orchestrator Agent:
─────────────────────────────────────
You are a social media publishing orchestrator. When given
content to publish, you will:

1. Analyze the content to understand its core message
2. Call the appropriate publishing tools for each requested
   platform
3. Pass the original content to each tool — the sub-workflow
   handles the adaptation
4. Report back which platforms were published to and any
   errors

If the user doesn't specify platforms, publish to all:
X, LinkedIn, Instagram, Facebook, and YouTube Shorts.

If a platform publish fails, continue with the others and
report the failure at the end.`,
        caption: 'The orchestrator prompt defines the agent\'s decision-making behavior',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Execution Flow',
      },
      {
        type: 'code',
        language: 'text',
        code: `Agent receives: "Publish this about AI trends"
         │
Thought: "User wants to publish to all platforms.
          I'll call each publishing tool."
         │
Action:  publish_to_x("AI trends content...")
  → Result: "Published to X. Link: x.com/..."
         │
Action:  publish_to_linkedin("AI trends content...")
  → Result: "Published to LinkedIn. Link: linkedin.com/..."
         │
Action:  publish_to_instagram("AI trends content...")
  → Result: "Published to Instagram."
         │
Action:  publish_to_facebook("AI trends content...")
  → Result: "Published to Facebook."
         │
Final:   "Published to all 4 platforms successfully!
          - X: x.com/status/123
          - LinkedIn: linkedin.com/post/456
          - Instagram: Posted
          - Facebook: facebook.com/post/789"`,
        caption: 'The agent calls each tool sequentially and reports results',
      },
    ],
  },

  // ==========================================================================
  // LESSON 12.4: Building Platform Sub-Workflows
  // ==========================================================================
  {
    id: 'lesson-12-4',
    moduleId: 'module-12',
    title: 'Building Platform Sub-Workflows',
    estimatedTime: 3,
    order: 4,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'Each platform sub-workflow is an independent n8n workflow that handles content adaptation and publishing for a single platform. The sub-workflow receives raw content from the orchestrator, adapts it using AI, and publishes it via the platform\'s API.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Sub-Workflow Structure',
      },
      {
        type: 'text',
        value: 'Every sub-workflow follows the same 4-step pattern:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Generic Sub-Workflow Template:
═══════════════════════════════

[Execute Workflow Trigger]  ← Receives content from orchestrator
         │
         ▼
[OpenAI: Adapt Content]    ← Platform-specific AI prompt
         │
         ▼
[Platform API: Publish]     ← X API / LinkedIn API / etc.
         │
         ▼
[Return Result]             ← Send status back to orchestrator
  {
    "success": true,
    "platform": "linkedin",
    "postUrl": "https://linkedin.com/post/123",
    "adaptedContent": "The adapted text..."
  }`,
        caption: 'All sub-workflows follow this 4-step pattern — only the AI prompt and API node change',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Creating a Sub-Workflow in n8n',
      },
      {
        type: 'list',
        items: [
          'Create a new workflow in n8n',
          'Add an "Execute Workflow Trigger" node as the first node — this receives input from the orchestrator',
          'Add an OpenAI node with the platform-specific adaptation prompt',
          'Add the platform\'s API node (e.g., LinkedIn, HTTP Request for X)',
          'Add a "Return" node to send results back to the orchestrator',
          'Note the workflow ID from the URL — you\'ll need this for the toolWorkflow reference',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Workflow ID Reference',
        text: 'The toolWorkflow node in the orchestrator references child workflows by their workflow ID. If you recreate or duplicate a sub-workflow, the ID changes and the reference breaks. Always update the toolWorkflow reference when changing sub-workflows.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Input/Output Contract',
      },
      {
        type: 'text',
        value: 'Define a clear data contract between the orchestrator and sub-workflows:',
      },
      {
        type: 'code',
        language: 'json',
        code: `// Input from orchestrator
{
  "content": "Original content text to be adapted",
  "title": "Content title/headline",
  "imageUrl": "https://example.com/image.jpg",
  "contentType": "insight",
  "targetAudience": "tech professionals"
}

// Output back to orchestrator
{
  "success": true,
  "platform": "x",
  "postId": "1234567890",
  "postUrl": "https://x.com/user/status/1234567890",
  "adaptedContent": "Adapted text that was published",
  "error": null
}`,
        caption: 'Consistent input/output format across all sub-workflows',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Error Handling in Sub-Workflows',
      },
      {
        type: 'list',
        items: [
          'Wrap the API call in a try/catch pattern',
          'On failure, return success: false with the error message',
          'Never let a sub-workflow crash — always return a structured response',
          'The orchestrator will report failures to the user and continue with other platforms',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Test Each Sub-Workflow Independently',
        text: 'Before connecting to the orchestrator, test each sub-workflow by running it manually with sample content. Verify the AI adaptation quality, API authentication, and response format. This modular approach makes debugging much easier.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 12.5: X/Twitter Content Formatting (280 chars)
  // ==========================================================================
  {
    id: 'lesson-12-5',
    moduleId: 'module-12',
    title: 'X/Twitter Content Formatting (280 chars)',
    estimatedTime: 2,
    order: 5,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'X (formerly Twitter) is the most constrained platform in our factory — 280 characters forces extreme conciseness. The AI must distill your content down to its most impactful essence while maintaining the core message and driving engagement.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The X Adaptation Prompt',
      },
      {
        type: 'code',
        language: 'text',
        code: `X/Twitter Adaptation Prompt:
─────────────────────────────────
You are an expert X/Twitter content creator.

Adapt the following content into a tweet:
- MAXIMUM 280 characters (strict limit)
- Use a casual, direct tone
- Start with a bold statement or hot take
- Include 1-2 relevant hashtags (counted in character limit)
- End with engagement bait: question, controversial take,
  or "thread 👇" if content warrants expansion
- Use line breaks for readability
- Emojis are welcome but not required

Original content:
{{ $json.content }}

Output ONLY the tweet text. Nothing else.`,
        caption: 'The prompt forces extreme conciseness while preserving the core message',
      },
      {
        type: 'heading',
        level: 2,
        value: 'X API Integration',
      },
      {
        type: 'text',
        value: 'X\'s API v2 requires OAuth 2.0 authentication. Configure it in n8n:',
      },
      {
        type: 'list',
        items: [
          'Create a project and app at developer.x.com',
          'Set up OAuth 2.0 with read and write permissions',
          'In n8n, add X (Twitter) OAuth2 credentials',
          'Use the HTTP Request node to POST to https://api.x.com/2/tweets',
        ],
        ordered: true,
      },
      {
        type: 'code',
        language: 'json',
        code: `// X API v2 — Create Tweet
// POST https://api.x.com/2/tweets
{
  "text": "{{ $json.adaptedContent }}"
}

// Response
{
  "data": {
    "id": "1234567890",
    "text": "AI is eating the content world..."
  }
}`,
        caption: 'The X API v2 tweet creation endpoint — simple and clean',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Thread Strategy for Long Content',
      },
      {
        type: 'text',
        value: 'When content is too rich for a single tweet, the AI can create a thread:',
      },
      {
        type: 'list',
        items: [
          'First tweet is the hook — grabs attention and ends with "🧵👇"',
          'Middle tweets expand on key points — one idea per tweet',
          'Last tweet has the call-to-action and summary',
          'Thread tweets are posted as replies to the previous tweet using the reply_to parameter',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Character Counting',
        text: 'URLs in tweets always count as 23 characters regardless of actual length (t.co shortening). Hashtags count toward the 280 limit. Emojis count as 2 characters each. Factor these into the AI prompt for accurate character management.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 12.6: LinkedIn Professional Content Generation
  // ==========================================================================
  {
    id: 'lesson-12-6',
    moduleId: 'module-12',
    title: 'LinkedIn Professional Content Generation',
    estimatedTime: 3,
    order: 6,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'LinkedIn is the professional content powerhouse. Posts here are longer, more structured, and aim to establish thought leadership. The AI adaptation for LinkedIn needs to strike the perfect balance between informative and engaging.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The LinkedIn Adaptation Prompt',
      },
      {
        type: 'code',
        language: 'text',
        code: `LinkedIn Adaptation Prompt:
─────────────────────────────────
You are a LinkedIn thought leadership content writer.

Adapt the following content for LinkedIn:
- Length: 1,200-1,500 characters (optimal engagement zone)
- Start with a bold hook that earns the "see more" click
- Use short paragraphs (1-3 lines max)
- Include relevant data points or statistics if present
- Add 3-5 relevant hashtags at the end
- End with an engagement question
- Professional but approachable tone
- Use line breaks generously for readability
- NO emojis in the main text (optional in hook only)

Structure:
1. Hook (1 bold line)
2. Context (2-3 short paragraphs)
3. Key insight or takeaway
4. Engagement question
5. Hashtags

Original content:
{{ $json.content }}`,
        caption: 'LinkedIn prompt focuses on thought leadership format with a strong hook',
      },
      {
        type: 'heading',
        level: 2,
        value: 'LinkedIn Post Anatomy',
      },
      {
        type: 'code',
        language: 'text',
        code: `Example Adapted LinkedIn Post:
═══════════════════════════════

AI won't replace marketers. But marketers who use AI
will replace those who don't.

Here's what I learned after automating our content
pipeline with n8n:

We went from 3 posts/week to 5 posts/day across
4 platforms. Same team. Same budget.

The secret wasn't working harder — it was building
an AI orchestrator that adapts one piece of content
for every platform automatically.

The result?
→ 340% increase in total impressions
→ 42% more engagement per post
→ 15 hours saved per week

The tools exist. The question is whether you'll
use them before your competitors do.

What's the biggest bottleneck in your content
workflow?

#ContentMarketing #AIAutomation #n8n
#SocialMediaStrategy #MarTech`,
        caption: 'A well-structured LinkedIn post: hook → context → data → question → hashtags',
      },
      {
        type: 'heading',
        level: 2,
        value: 'LinkedIn API Configuration',
      },
      {
        type: 'text',
        value: 'The LinkedIn sub-workflow uses n8n\'s native LinkedIn node or the REST API:',
      },
      {
        type: 'list',
        items: [
          'Create a LinkedIn Developer App at linkedin.com/developers',
          'Request "Share on LinkedIn" product access',
          'Configure OAuth2 credentials in n8n',
          'The LinkedIn node handles image upload, text posting, and company page posting',
          'For advanced features, use HTTP Request with the LinkedIn Marketing API',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Optimal Posting Times',
        text: 'LinkedIn engagement peaks Tuesday through Thursday, 8-10 AM and 5-6 PM in your audience\'s timezone. The orchestrator can be triggered by a Schedule Trigger aligned with these windows for maximum impact.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 12.7: Instagram & Facebook Content Adaptation
  // ==========================================================================
  {
    id: 'lesson-12-7',
    moduleId: 'module-12',
    title: 'Instagram & Facebook Content Adaptation',
    estimatedTime: 3,
    order: 7,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'Instagram and Facebook are both Meta platforms but serve very different content cultures. Instagram is visual-first with emoji-heavy captions, while Facebook is conversational and community-driven. Let\'s build sub-workflows for both.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Instagram Adaptation Prompt',
      },
      {
        type: 'code',
        language: 'text',
        code: `Instagram Adaptation Prompt:
─────────────────────────────────
You are an Instagram content creator.

Adapt the following content for an Instagram caption:
- Casual, engaging, and emoji-rich tone 🎯
- Start with a hook that stops the scroll
- Use short paragraphs with emoji bullets
- Maximum 2,200 characters for the caption
- End with a call-to-action (save, share, comment)
- Add a hashtag block at the very end (20-30 relevant
  hashtags separated by spaces)
- Use "." on separate lines to create visual breaks

Format:
[Hook line with emoji]

[2-3 short paragraphs with emoji bullets]

[Call-to-action]

.
.
.

#hashtag1 #hashtag2 #hashtag3 ... (20-30 total)

Original content:
{{ $json.content }}`,
        caption: 'Instagram prompt emphasizes visual formatting, emojis, and a hashtag block',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Facebook Adaptation Prompt',
      },
      {
        type: 'code',
        language: 'text',
        code: `Facebook Adaptation Prompt:
─────────────────────────────────
You are a Facebook community content creator.

Adapt the following content for Facebook:
- Conversational, warm, storytelling tone
- Write as if talking to a friend over coffee
- 500-800 characters (concise but not terse)
- Start with a relatable statement or question
- Use 1-3 paragraphs, each 2-4 sentences
- Include 1-3 relevant hashtags inline (not a block)
- End with a question that invites discussion
- Encourage sharing: "Tag someone who needs this"
- NO emoji blocks — use sparingly if at all

Original content:
{{ $json.content }}`,
        caption: 'Facebook prompt focuses on storytelling and community engagement',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Meta Graph API Integration',
      },
      {
        type: 'text',
        value: 'Both Instagram and Facebook use the Meta Graph API for publishing:',
      },
      {
        type: 'list',
        items: [
          'Create a Meta Developer App at developers.facebook.com',
          'Add the Instagram Graph API and Facebook Pages API products',
          'Generate a long-lived access token (60-day expiration)',
          'For Instagram: POST to /{ig-user-id}/media then /{ig-user-id}/media_publish',
          'For Facebook: POST to /{page-id}/feed with message and optional link/image',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Instagram Requires an Image',
        text: 'Unlike other platforms, Instagram posts MUST include an image or video. Your sub-workflow needs to either use an image from the content or generate one (using AI image generation or a template). Text-only posts are not supported on Instagram.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Facebook-Specific Features',
      },
      {
        type: 'list',
        items: [
          'Link previews — Facebook auto-generates previews for URLs in posts. Include relevant links.',
          'Tagging — Use @mentions for company pages or people (requires their permission).',
          'Scheduling — The Facebook API supports scheduled posts natively. Pass a scheduled_publish_time parameter.',
          'Groups — With additional permissions, publish to Facebook Groups for community engagement.',
        ],
      },
    ],
  },

  // ==========================================================================
  // LESSON 12.8: Notion Content Calendar Integration
  // ==========================================================================
  {
    id: 'lesson-12-8',
    moduleId: 'module-12',
    title: 'Notion Content Calendar Integration',
    estimatedTime: 2,
    order: 8,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'The Notion content calendar is the single source of truth for your publishing factory. It\'s where you plan, write, and track content across all platforms. The orchestrator reads from it and updates it as posts are published.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Content Calendar Database Schema',
      },
      {
        type: 'code',
        language: 'text',
        code: `Notion Content Calendar Properties:
═══════════════════════════════════════
Property        │ Type         │ Purpose
────────────────┼──────────────┼──────────────────────
Title           │ Title        │ Content headline
Body            │ Long Text    │ Raw content to adapt
Publish Date    │ Date         │ Scheduled publish date
Platforms       │ Multi-select │ X, LinkedIn, Instagram,
                │              │ Facebook, YouTube
Status          │ Select       │ Draft / Scheduled /
                │              │ Publishing / Done / Failed
Image           │ Files        │ Attached media
Content Type    │ Select       │ Insight, How-to, Case
                │              │ Study, Announcement
Target Audience │ Text         │ Who this content is for
Results         │ Long Text    │ Post URLs and metrics
────────────────┴──────────────┴──────────────────────`,
        caption: 'Extended content calendar schema with platform targeting and tracking',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Querying Scheduled Content',
      },
      {
        type: 'text',
        value: 'The orchestrator queries Notion for posts that are ready to publish:',
      },
      {
        type: 'code',
        language: 'json',
        code: `{
  "filter": {
    "and": [
      {
        "property": "Publish Date",
        "date": {
          "equals": "{{ $now.format('yyyy-MM-dd') }}"
        }
      },
      {
        "property": "Status",
        "select": {
          "equals": "Scheduled"
        }
      }
    ]
  },
  "sorts": [
    {
      "property": "Publish Date",
      "direction": "ascending"
    }
  ]
}`,
        caption: 'Notion query to find today\'s scheduled posts',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Updating Status After Publishing',
      },
      {
        type: 'text',
        value: 'After the orchestrator publishes to all platforms, update the Notion entry:',
      },
      {
        type: 'list',
        items: [
          'Set Status to "Done" (or "Partially Failed" if some platforms failed)',
          'Append post URLs to the Results property for reference',
          'Add the adapted content versions as page content blocks',
          'Log the timestamp of publishing',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Batch Writing Workflow',
        text: 'The ideal content workflow is: spend 1-2 hours on Monday writing 5-7 content pieces in Notion. Set their publish dates throughout the week. The factory handles everything else automatically. This batching approach is far more efficient than daily writing.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Notion as a Team Collaboration Hub',
        text: 'Multiple team members can contribute to the content calendar. Writers create drafts, editors review and change status to "Scheduled," and the factory publishes automatically. The entire process is visible and auditable in Notion.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 12.9: Schedule Trigger for Automated Publishing
  // ==========================================================================
  {
    id: 'lesson-12-9',
    moduleId: 'module-12',
    title: 'Schedule Trigger for Automated Publishing',
    estimatedTime: 2,
    order: 9,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'The publishing factory can be triggered manually via chat or automatically on a schedule. For a truly hands-off operation, the Schedule Trigger fires at optimal posting times and processes all scheduled content for the day.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Optimal Publishing Schedule',
      },
      {
        type: 'code',
        language: 'text',
        code: `Recommended Multi-Platform Schedule:
═══════════════════════════════════════
Time     │ Platform  │ Why
─────────┼───────────┼──────────────────────────
8:00 AM  │ LinkedIn  │ Morning commute / desk time
9:00 AM  │ X/Twitter │ Morning news browsing
12:00 PM │ Facebook  │ Lunch break scrolling
5:00 PM  │ Instagram │ After-work browsing
6:00 PM  │ YouTube   │ Evening content consumption
─────────┴───────────┴──────────────────────────

Cron Expressions:
  LinkedIn:  0 8 * * 1-5   (weekdays at 8 AM)
  X:         0 9 * * *     (daily at 9 AM)
  Facebook:  0 12 * * *    (daily at noon)
  Instagram: 0 17 * * *    (daily at 5 PM)
  YouTube:   0 18 * * *    (daily at 6 PM)`,
        caption: 'Stagger publishing times to match each platform\'s peak engagement window',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Two Scheduling Approaches',
      },
      {
        type: 'list',
        items: [
          'Single trigger, all platforms — One Schedule Trigger fires daily, processes all content for all platforms. Simple but posts at the same time everywhere.',
          'Per-platform triggers — Separate Schedule Triggers for each platform at their optimal time. More complex but maximizes engagement.',
        ],
      },
      {
        type: 'text',
        value: 'For the per-platform approach, each trigger queries Notion for posts targeting that specific platform:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Per-Platform Trigger Architecture:
═══════════════════════════════════

[Schedule: 8 AM weekdays]
         │
         ▼
[Notion Query: LinkedIn posts for today]
         │
         ▼
[LinkedIn Sub-Workflow]


[Schedule: 9 AM daily]
         │
         ▼
[Notion Query: X posts for today]
         │
         ▼
[X Sub-Workflow]

... (repeated for each platform)`,
        caption: 'Separate triggers per platform for optimal timing',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Timezone Handling',
        text: 'If your audience spans multiple timezones, consider the primary audience\'s timezone for each platform. LinkedIn might target US business hours while Instagram might target EU evening hours. Set each Schedule Trigger\'s timezone explicitly.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Manual Override via Chat',
      },
      {
        type: 'text',
        value: 'The Chat Trigger provides a manual override for the automated schedule. You can message the orchestrator to publish immediately, skip a platform, or publish unscheduled content:',
      },
      {
        type: 'list',
        items: [
          '"Publish the AI trends post to LinkedIn only" — Selective platform publishing',
          '"Skip Instagram today" — Platform-specific override',
          '"Publish this right now to all platforms: [content]" — Ad-hoc publishing',
          '"What\'s scheduled for today?" — Query the content calendar',
        ],
      },
    ],
  },

  // ==========================================================================
  // LESSON 12.10: Analytics and Optimization
  // ==========================================================================
  {
    id: 'lesson-12-10',
    moduleId: 'module-12',
    title: 'Analytics and Optimization',
    estimatedTime: 2,
    order: 10,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'Publishing is only half the story. To continuously improve your content strategy, you need to track performance metrics across platforms and use that data to optimize future content. Let\'s build the analytics layer.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Metrics to Track Per Platform',
      },
      {
        type: 'list',
        items: [
          'X — Impressions, likes, retweets, replies, profile visits, link clicks',
          'LinkedIn — Impressions, reactions, comments, shares, click-through rate',
          'Instagram — Reach, likes, comments, saves, shares, profile visits',
          'Facebook — Reach, reactions, comments, shares, link clicks',
          'YouTube — Views, watch time, likes, comments, subscriber change',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'Automated Analytics Collection',
      },
      {
        type: 'code',
        language: 'text',
        code: `Analytics Workflow:
═══════════════════

[Schedule: Daily at 11 PM]
         │
         ▼
[Notion: Get posts published in last 24h]
         │
         ▼
[Loop: For each published post]
  ├── [X API: Get tweet metrics]
  ├── [LinkedIn API: Get post analytics]
  ├── [Meta API: Get IG/FB insights]
  └── [YouTube API: Get video stats]
         │
         ▼
[Google Sheets: Append metrics row]
         │
         ▼
[Notion: Update Results property]`,
        caption: 'Nightly analytics collection workflow that pulls metrics from all platforms',
      },
      {
        type: 'heading',
        level: 2,
        value: 'AI-Powered Content Optimization',
      },
      {
        type: 'text',
        value: 'Use the collected analytics to improve future content with AI analysis:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Weekly Optimization Prompt:
─────────────────────────────────
Analyze the following social media performance data
from the past week:

{{ $json.weeklyMetrics }}

Identify:
1. Top 3 performing posts and what made them work
2. Bottom 3 performing posts and what went wrong
3. Best performing content type per platform
4. Optimal posting time patterns
5. Hashtag effectiveness

Provide 5 specific, actionable recommendations
for next week's content strategy.`,
        caption: 'Weekly AI analysis of content performance to inform strategy',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'The Feedback Loop',
        text: 'The ultimate goal is a self-improving content machine: publish → measure → analyze → optimize → publish better content. Each week, the AI gets better data about what works and can provide increasingly specific recommendations.',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Congratulations!',
        text: 'You\'ve built a complete social media publishing factory. From a single content entry in Notion, your system adapts and publishes to 5 platforms, tracks performance, and generates optimization insights. This is professional-grade social media automation.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What\'s Next?',
      },
      {
        type: 'list',
        items: [
          'Add AI image generation — Auto-create platform-specific visuals for each post',
          'Build a content idea generator — Use trending topics and past performance to suggest new content',
          'Implement A/B testing — Test different hooks and formats, let data pick the winner',
          'Add approval workflows — Route content through team review before publishing',
        ],
      },
    ],
  },
];
