/**
 * Module 8: LinkedIn Posts Automation with AI
 * Duration: 25 minutes | 10 Lessons
 */

import type { Lesson } from '../../types';

export const module8Lessons: Lesson[] = [
  // ==========================================================================
  // LESSON 8.1: Introduction to LinkedIn Automation
  // ==========================================================================
  {
    id: 'lesson-8-1',
    moduleId: 'module-8',
    title: 'Introduction to LinkedIn Automation',
    estimatedTime: 2,
    order: 1,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Consistent LinkedIn posting is one of the most effective ways to build professional authority — but it\'s also one of the most time-consuming. What if you could write your posts once in a content calendar and have them automatically formatted, optimized, and published on schedule?',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Why Automate LinkedIn Publishing?',
      },
      {
        type: 'text',
        value: 'The LinkedIn algorithm rewards consistency. Posting 3-5 times per week generates significantly more engagement than sporadic activity. But maintaining that cadence manually is exhausting — you have to remember to post, format the content correctly, attach images, and add the right hashtags every single time.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'The ROI of Automation',
        text: 'A typical LinkedIn post takes 15-20 minutes to write, format, and publish manually. With automation, batch-writing 5 posts in Notion takes ~30 minutes, and they publish automatically all week. That\'s saving 45-70 minutes per week — over 40 hours per year.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What We\'re Building',
      },
      {
        type: 'text',
        value: 'In this module, you\'ll build a complete automated LinkedIn publishing pipeline using n8n. Here\'s the 6-step workflow:',
      },
      {
        type: 'list',
        items: [
          'Schedule Trigger — Runs every day at a set time (e.g., 10 AM)',
          'Notion Query — Reads your content calendar for posts scheduled "today"',
          'Content Aggregation — Combines all text and image blocks from the post',
          'Image Fetching — Downloads the attached image via HTTP Request',
          'AI Reformatting — OpenAI rewrites the content in professional LinkedIn tone',
          'Publish & Update — Posts to LinkedIn, then marks the Notion entry as "Done"',
        ],
        ordered: true,
      },
      {
        type: 'code',
        language: 'text',
        code: `[Schedule Trigger: Daily at 10 AM]
         │
         ▼
[Notion: Query entries for today's date]
         │
         ▼
[Notion: Get all content blocks from post]
         │
         ▼
[Aggregate: Combine all text + image blocks]
         │
         ▼
[HTTP Request: Fetch attached image]
         │
         ▼
[OpenAI: Reformat post text for LinkedIn]
         │
         ▼
[Merge: Combine reformatted text + image]
         │
         ▼
[LinkedIn: Post with image]
         │
         ▼
[Notion: Set status to "Done"]`,
        caption: 'The complete LinkedIn automation workflow architecture',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'No Coding Required',
        text: 'This entire workflow is built visually in n8n — no code needed. You\'ll connect pre-built nodes with drag-and-drop, configure settings through forms, and test each step interactively.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 8.2: Setting Up Your Notion Content Calendar
  // ==========================================================================
  {
    id: 'lesson-8-2',
    moduleId: 'module-8',
    title: 'Setting Up Your Notion Content Calendar',
    estimatedTime: 3,
    order: 2,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'Before building the automation, you need a structured content calendar in Notion. This serves as your single source of truth — write posts there, and the workflow handles everything else.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Creating the Content Calendar Database',
      },
      {
        type: 'text',
        value: 'Create a new Notion database with the following 6 properties. Each property type is important — n8n will use these to filter and process your posts:',
      },
      {
        type: 'list',
        items: [
          'Title (Title) — The post headline. This is used internally for organization; the AI will generate the actual LinkedIn hook.',
          'Body (Long Text) — The raw post content. Write naturally — the AI will reformat it for LinkedIn\'s style.',
          'Publish Date (Date) — The scheduled date for publishing. The workflow filters for entries where this equals "today".',
          'Platform (Multi-select) — Target platforms: LinkedIn, Twitter, Instagram, etc. Enables future multi-platform extension.',
          'Status (Select) — Draft → Scheduled → Done. The workflow only picks up "Scheduled" posts and sets them to "Done" after publishing.',
          'Image (Files & Media) — Attach an image to accompany the post. LinkedIn posts with images get 2x more engagement.',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Why Notion?',
        text: 'Notion is ideal as a content management system because it has a powerful API, supports rich content blocks, and provides a visual interface that non-technical team members can use. Your marketing team writes in Notion, and n8n handles the rest.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Sample Content Calendar Entries',
      },
      {
        type: 'code',
        language: 'text',
        code: `┌──────────────────────┬─────────────┬───────────┬──────────┐
│ Title                │ Publish Date│ Platform  │ Status   │
├──────────────────────┼─────────────┼───────────┼──────────┤
│ AI in Hiring 2026    │ 2026-03-20  │ LinkedIn  │ Scheduled│
│ n8n vs Zapier        │ 2026-03-21  │ LinkedIn  │ Draft    │
│ Remote Work Tips     │ 2026-03-22  │ LinkedIn  │ Scheduled│
│ MCP Explained        │ 2026-03-23  │ LinkedIn, │ Scheduled│
│                      │             │ Twitter   │          │
└──────────────────────┴─────────────┴───────────┴──────────┘`,
        caption: 'Example Notion content calendar — only "Scheduled" posts with today\'s date will be picked up',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Connecting Notion to n8n',
      },
      {
        type: 'text',
        value: 'To connect Notion to n8n, you\'ll need a Notion integration token:',
      },
      {
        type: 'list',
        items: [
          'Go to notion.so/my-integrations and create a new integration',
          'Copy the Internal Integration Token',
          'In your Notion database, click "..." → "Add connections" and select your integration',
          'In n8n, add the token as a Notion credential',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Don\'t Forget Permissions',
        text: 'Your Notion integration must be explicitly connected to the content calendar database. Without this step, n8n will return empty results even with valid credentials.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 8.3: Understanding n8n Schedule Triggers
  // ==========================================================================
  {
    id: 'lesson-8-3',
    moduleId: 'module-8',
    title: 'Understanding n8n Schedule Triggers',
    estimatedTime: 2,
    order: 3,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'The Schedule Trigger is the heartbeat of your LinkedIn automation. It fires at a specific time every day, kicking off the entire workflow without any manual intervention.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'How the Schedule Trigger Works',
      },
      {
        type: 'text',
        value: 'In n8n, the Schedule Trigger node uses cron expressions under the hood. You can configure it through a visual interface or write the cron expression directly:',
      },
      {
        type: 'code',
        language: 'text',
        code: `# Cron Expression Format
# ┌────── minute (0-59)
# │ ┌──── hour (0-23)
# │ │ ┌── day of month (1-31)
# │ │ │ ┌ month (1-12)
# │ │ │ │ ┌ day of week (0-6, Sun=0)
# │ │ │ │ │
  0 10 * * *    ← Every day at 10:00 AM
  0 9  * * 1-5  ← Weekdays at 9:00 AM
  0 8,17 * * *  ← Twice daily at 8 AM and 5 PM`,
        caption: 'Common cron expressions for LinkedIn posting schedules',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Optimal Posting Times',
        text: 'LinkedIn engagement peaks between 8-10 AM and 5-6 PM on weekdays (in your audience\'s timezone). Schedule your trigger accordingly. Tuesday through Thursday tend to perform best.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Configuring the Schedule Trigger in n8n',
      },
      {
        type: 'list',
        items: [
          'Add a "Schedule Trigger" node to your workflow canvas',
          'Set the trigger interval to "Every Day"',
          'Set the hour to 10 (or your preferred posting time)',
          'Set the minute to 0',
          'Choose your timezone — this is critical for global audiences',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Timezone Matters',
        text: 'n8n uses the server\'s timezone by default. If your n8n instance runs on a cloud server in US-East but your audience is in Europe, the trigger will fire at the wrong time. Always set the timezone explicitly in the Schedule Trigger node.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Testing Without Waiting',
      },
      {
        type: 'text',
        value: 'You don\'t have to wait for the schedule to test your workflow. Click "Test workflow" in n8n to run the trigger immediately with a simulated timestamp. This lets you develop and debug the full pipeline without waiting for the next scheduled run.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 8.4: Querying Notion from n8n
  // ==========================================================================
  {
    id: 'lesson-8-4',
    moduleId: 'module-8',
    title: 'Querying Notion from n8n',
    estimatedTime: 3,
    order: 4,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'After the Schedule Trigger fires, the next step is querying your Notion content calendar to find posts scheduled for today. This is where the Notion node\'s filtering capability comes in.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Notion Database Query',
      },
      {
        type: 'text',
        value: 'n8n\'s Notion node supports the full Notion API filter syntax. You need a compound filter that matches two conditions: the post is scheduled for today AND its status is "Scheduled" (not "Draft" or "Done").',
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
      },
      {
        "property": "Platform",
        "multi_select": {
          "contains": "LinkedIn"
        }
      }
    ]
  }
}`,
        caption: 'Notion API filter — finds posts scheduled for today on the LinkedIn platform',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Understanding the Filter Logic',
      },
      {
        type: 'list',
        items: [
          'Publish Date equals today — Uses n8n\'s $now expression to get today\'s date dynamically',
          'Status equals "Scheduled" — Ensures we only pick up posts ready for publishing, not drafts',
          'Platform contains "LinkedIn" — Filters for posts targeting LinkedIn specifically',
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Expression Syntax',
        text: 'The expression {{ $now.format(\'yyyy-MM-dd\') }} is n8n\'s built-in date formatting. It resolves to the current date in ISO format (e.g., "2026-03-20"). This ensures the filter always queries for today\'s posts regardless of when the workflow runs.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Fetching Content Blocks',
      },
      {
        type: 'text',
        value: 'After querying the database, you get page metadata — but not the actual content. Notion stores content as separate "blocks" (paragraphs, headings, images). You need a second Notion node to retrieve all blocks for each matched page:',
      },
      {
        type: 'code',
        language: 'text',
        code: `[Notion: Get Database Items]  →  Returns page IDs + metadata
         │
         ▼
[Notion: Get Block Children]  →  Returns all content blocks
                                  (text, images, etc.)`,
        caption: 'Two-step Notion query: first get pages, then get their content blocks',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'API Rate Limits',
        text: 'The Notion API has a rate limit of 3 requests per second. If you have many posts scheduled for the same day, add a "Wait" node between iterations or use n8n\'s built-in rate limiting to avoid 429 errors.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 8.5: Aggregating Content Blocks
  // ==========================================================================
  {
    id: 'lesson-8-5',
    moduleId: 'module-8',
    title: 'Aggregating Content Blocks',
    estimatedTime: 2,
    order: 5,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Notion returns content as individual blocks — each paragraph, heading, and image is a separate item in the output. Before we can send this to OpenAI, we need to combine everything into a single text string.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Why Aggregation is Necessary',
      },
      {
        type: 'text',
        value: 'When you fetch block children from a Notion page, n8n receives an array of items. A typical post with 3 paragraphs and 1 image would produce 4 separate items:',
      },
      {
        type: 'code',
        language: 'json',
        code: `[
  { "type": "paragraph", "text": "AI is transforming hiring..." },
  { "type": "paragraph", "text": "In 2026, 73% of companies..." },
  { "type": "paragraph", "text": "Here's what you need to know..." },
  { "type": "image", "url": "https://notion.so/image123.png" }
]`,
        caption: 'Notion returns content blocks as separate items',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Using the Aggregate Node',
      },
      {
        type: 'text',
        value: 'The Aggregate node combines multiple items into a single item. Configure it to:',
      },
      {
        type: 'list',
        items: [
          'Aggregate all text blocks into a single "rawContent" string by joining paragraph texts with newlines',
          'Extract the first image URL into a separate "imageUrl" field',
          'Preserve any metadata (title, publish date) from the parent page',
        ],
        ordered: true,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Block Types to Handle',
      },
      {
        type: 'list',
        items: [
          'paragraph — The main content text. Join all paragraphs with double newlines.',
          'heading_1 / heading_2 / heading_3 — Section headers. Include as bold text in the aggregated output.',
          'bulleted_list_item — List items. Convert to "• item" format.',
          'image — Extract the URL. Only the first image is typically used for LinkedIn posts.',
          'callout — Treat as a blockquote or highlight in the aggregated text.',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Code Node Alternative',
        text: 'For more control over aggregation, you can use n8n\'s Code node with a JavaScript function. This lets you handle edge cases like nested blocks, rich text formatting, and multiple images.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 8.6: Fetching Attached Images
  // ==========================================================================
  {
    id: 'lesson-8-6',
    moduleId: 'module-8',
    title: 'Fetching Attached Images',
    estimatedTime: 2,
    order: 6,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'LinkedIn posts with images generate significantly more engagement than text-only posts. In this step, we\'ll download the attached image from Notion so it can be uploaded alongside the post.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The HTTP Request Node',
      },
      {
        type: 'text',
        value: 'The HTTP Request node in n8n can download files from any URL. We\'ll use it to fetch the image attached to the Notion page:',
      },
      {
        type: 'code',
        language: 'text',
        code: `HTTP Request Node Configuration:
─────────────────────────────────
Method:          GET
URL:             {{ $json.imageUrl }}
Response Format: File
Output Property: data
───────────────────────────────── `,
        caption: 'Configure the HTTP Request node to download the image as binary data',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Handling Posts Without Images',
      },
      {
        type: 'text',
        value: 'Not every post will have an attached image. You need to handle this gracefully with an IF node:',
      },
      {
        type: 'code',
        language: 'text',
        code: `[Aggregate Node]
       │
       ▼
   [IF Node]
   ┌───┴───┐
   │       │
Has Image  No Image
   │       │
   ▼       ▼
[HTTP      [Continue
Request]   without
   │       image]
   ▼       │
[Merge] ◄──┘`,
        caption: 'Branch the workflow based on whether an image is attached',
      },
      {
        type: 'list',
        items: [
          'Check if the imageUrl field exists and is not empty',
          'If an image exists, download it via HTTP Request',
          'If no image, continue the workflow — LinkedIn supports text-only posts',
          'Use a Merge node to rejoin both branches before the next step',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Notion Image URLs Expire',
        text: 'Notion\'s signed image URLs expire after 1 hour. If your workflow has delays or retries, the image URL may become invalid. Always fetch the image immediately after querying Notion — don\'t store the URL for later use.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Image Size Optimization',
        text: 'LinkedIn recommends images at 1200×627 pixels for link posts and 1080×1080 for organic posts. Consider adding an image resize step using a Code node or an external service like Cloudinary.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 8.7: AI-Powered Content Reformatting
  // ==========================================================================
  {
    id: 'lesson-8-7',
    moduleId: 'module-8',
    title: 'AI-Powered Content Reformatting',
    estimatedTime: 3,
    order: 7,
    xpReward: 30,
    content: [
      {
        type: 'text',
        value: 'This is where the magic happens. Instead of carefully formatting every post by hand, you feed your raw content to OpenAI and get back a perfectly formatted LinkedIn post — complete with hooks, structure, and hashtags.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The OpenAI Reformat Prompt',
      },
      {
        type: 'text',
        value: 'The prompt below instructs OpenAI to transform raw content into an engaging LinkedIn post. Every instruction is deliberate:',
      },
      {
        type: 'code',
        language: 'text',
        code: `You are a professional LinkedIn content writer.
Format the following raw content into an engaging LinkedIn post:
- Start with a hook (bold first line)
- Use short paragraphs (max 3 lines each)
- Add 3-5 relevant hashtags at the end
- End with a question to drive engagement
- Maximum 1,300 characters

Content: {raw_content}`,
        caption: 'The OpenAI prompt that transforms raw notes into polished LinkedIn posts',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Why Each Instruction Matters',
      },
      {
        type: 'list',
        items: [
          'Bold first line (hook) — LinkedIn truncates posts after 3 lines. The hook must grab attention immediately to earn the "see more" click.',
          'Short paragraphs — LinkedIn\'s mobile app makes long paragraphs feel like walls of text. 1-3 lines per paragraph is optimal.',
          'Hashtags at the end — 3-5 relevant hashtags increase discoverability without cluttering the post.',
          'Question at the end — Questions drive comments, and comments are the #1 signal LinkedIn\'s algorithm uses to boost reach.',
          '1,300 character limit — LinkedIn allows 3,000 characters, but engagement drops sharply after 1,300. Concise posts perform better.',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'Configuring the OpenAI Node in n8n',
      },
      {
        type: 'code',
        language: 'text',
        code: `OpenAI Node Configuration:
─────────────────────────────────
Resource:    Chat Completion
Model:       gpt-4o-mini (fast + cheap)
Temperature: 0.7 (creative but not wild)
Max Tokens:  500
System Msg:  "You are a professional LinkedIn
              content writer."
User Msg:    "Format this into a LinkedIn post:
              {{ $json.rawContent }}"
─────────────────────────────────`,
        caption: 'OpenAI node settings optimized for LinkedIn content generation',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Adjusting Tone Per Audience',
        text: 'Want a more casual tone for a startup audience? Add "Use a conversational, friendly tone" to the prompt. Targeting executives? Add "Use a professional, data-driven tone." The prompt is your control lever.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Cost Estimate',
        text: 'Using gpt-4o-mini, each LinkedIn post reformat costs approximately $0.001-0.003. Even posting daily, the monthly cost is under $0.10. This makes AI reformatting essentially free for content automation.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 8.8: Merging Text and Images
  // ==========================================================================
  {
    id: 'lesson-8-8',
    moduleId: 'module-8',
    title: 'Merging Text and Images',
    estimatedTime: 2,
    order: 8,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'At this point in the workflow, you have two pieces of data flowing through separate branches: the AI-reformatted post text and the downloaded image. The Merge node brings them together into a single item for the LinkedIn API.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Merge Node',
      },
      {
        type: 'text',
        value: 'n8n\'s Merge node combines data from two or more inputs. For our workflow, we use "Combine" mode to merge the text output from OpenAI with the binary image data:',
      },
      {
        type: 'code',
        language: 'text',
        code: `[OpenAI: Reformatted text]    [HTTP Request: Image data]
              │                            │
              └──────────┬─────────────────┘
                         │
                    [Merge Node]
                    Mode: Combine
                    Combination: Merge by Position
                         │
                         ▼
              ┌─────────────────────┐
              │ {                   │
              │   text: "Bold hook  │
              │     ...",           │
              │   binary: {         │
              │     data: <image>   │
              │   }                 │
              │ }                   │
              └─────────────────────┘`,
        caption: 'The Merge node combines text and image into a single payload',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Merge Modes in n8n',
      },
      {
        type: 'list',
        items: [
          'Combine > Merge by Position — Matches items by their index. Best when both branches produce the same number of items (our case).',
          'Combine > Merge by Fields — Matches items by a shared field value. Useful for complex multi-item workflows.',
          'Combine > Multiplex — Creates all possible combinations. Not needed here.',
          'Append — Simply adds items from both branches into one list. Not what we want.',
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Order Matters',
        text: 'The Merge node\'s first input is called "Input 1" and the second is "Input 2". When merging by position, both inputs must have the same number of items. Connect the text branch to Input 1 and the image branch to Input 2 for clean data structure.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Handling the No-Image Path',
      },
      {
        type: 'text',
        value: 'Remember the IF node from the previous lesson? When a post has no image, you need to handle the merge differently. Use a second Merge node in "Append" mode to rejoin the image and no-image paths before sending to LinkedIn.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 8.9: Posting to LinkedIn via API
  // ==========================================================================
  {
    id: 'lesson-8-9',
    moduleId: 'module-8',
    title: 'Posting to LinkedIn via API',
    estimatedTime: 3,
    order: 9,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'Everything comes together here — the reformatted text and the image are combined into a LinkedIn API call that publishes your post. n8n has a native LinkedIn node that simplifies this process.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'LinkedIn API Authentication',
      },
      {
        type: 'text',
        value: 'LinkedIn uses OAuth 2.0 for API access. You\'ll need to set up credentials in n8n:',
      },
      {
        type: 'list',
        items: [
          'Go to linkedin.com/developers and create a new app',
          'Request the "Share on LinkedIn" and "Sign in with LinkedIn" products',
          'Note your Client ID and Client Secret',
          'In n8n, create a LinkedIn OAuth2 credential with these values',
          'Complete the OAuth flow — n8n will handle token refresh automatically',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'LinkedIn API Access',
        text: 'LinkedIn\'s API requires app verification for production use. During development, you can post to your own profile. For posting to company pages, you\'ll need additional permissions (w_organization_social).',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The LinkedIn Post API Payload',
      },
      {
        type: 'code',
        language: 'json',
        code: `{
  "author": "urn:li:person:YOUR_PERSON_ID",
  "lifecycleState": "PUBLISHED",
  "specificContent": {
    "com.linkedin.ugc.ShareContent": {
      "shareCommentary": {
        "text": "{{ $json.reformattedText }}"
      },
      "shareMediaCategory": "IMAGE",
      "media": [
        {
          "status": "READY",
          "description": {
            "text": "Post image"
          },
          "media": "{{ $json.uploadedImageUrn }}"
        }
      ]
    }
  },
  "visibility": {
    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
  }
}`,
        caption: 'LinkedIn UGC (User Generated Content) API payload structure',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Image Upload Flow',
      },
      {
        type: 'text',
        value: 'LinkedIn requires a two-step process for posting with images:',
      },
      {
        type: 'list',
        items: [
          'Register an upload — Call the API to get an upload URL and asset URN',
          'Upload the image binary — PUT the image data to the upload URL',
          'Create the post — Reference the asset URN in your post payload',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Simplify with n8n\'s LinkedIn Node',
        text: 'n8n\'s native LinkedIn node handles the image upload flow automatically. Instead of managing the 3-step API process manually, you just connect the binary image data and the node does the rest.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Rate Limits and Compliance',
      },
      {
        type: 'list',
        items: [
          'LinkedIn allows 100 API calls per day per member for posting',
          'Posts must comply with LinkedIn\'s Professional Community Policies',
          'Automated posts should not appear spammy — the AI reformatting helps maintain quality',
          'Consider adding a human review step for sensitive content',
        ],
      },
    ],
  },

  // ==========================================================================
  // LESSON 8.10: Multi-Platform Extension & Best Practices
  // ==========================================================================
  {
    id: 'lesson-8-10',
    moduleId: 'module-8',
    title: 'Multi-Platform Extension & Best Practices',
    estimatedTime: 3,
    order: 10,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'You\'ve built a complete LinkedIn automation pipeline. But why stop at one platform? The architecture you\'ve created is designed to extend to Twitter/X, Instagram, Facebook, and more — all from the same Notion content calendar.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Extending to Multi-Platform Publishing',
      },
      {
        type: 'text',
        value: 'The key insight is to add platform-specific branches after the AI reformatting step. Each platform gets its own reformatting prompt and API node:',
      },
      {
        type: 'code',
        language: 'text',
        code: `                    [Notion Query + Aggregate]
                              │
                              ▼
                    [OpenAI: Base Reformat]
                              │
                    ┌─────────┼──────────┐
                    │         │          │
                    ▼         ▼          ▼
            [LinkedIn     [Twitter    [Instagram
             Prompt]       Prompt]     Prompt]
                │             │          │
                ▼             ▼          ▼
            [LinkedIn     [Twitter    [Instagram
             Post]         Post]       Post]
                │             │          │
                └─────────┬───┘──────────┘
                          │
                    [Notion: Set "Done"]`,
        caption: 'Multi-platform architecture — each platform gets its own AI prompt and publishing node',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Platform-Specific Prompts',
      },
      {
        type: 'list',
        items: [
          'LinkedIn: Professional tone, 1,300 chars, hooks + hashtags + engagement question',
          'Twitter/X: Concise, 280 chars, punchy one-liner + 1-2 hashtags. Consider thread format for longer content.',
          'Instagram: Visual-first, conversational tone, 2,200 chars max, 20-30 hashtags in first comment',
          'Facebook: Casual, storytelling format, longer form allowed, 1-2 relevant hashtags',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'Production Best Practices',
      },
      {
        type: 'list',
        items: [
          'Error handling — Add error trigger nodes to catch failures. Send yourself a Slack/email notification when a post fails.',
          'Retry logic — Use n8n\'s retry on fail setting (3 retries with 60s delay) for transient API errors.',
          'Logging — Log every successful post to a separate Notion database or Google Sheet for analytics.',
          'Human-in-the-loop — For sensitive topics, save to Gmail Drafts instead of auto-posting. Review and approve manually.',
          'Content quality gate — Add a "confidence threshold" — only auto-post if AI rates the content quality above 0.9.',
          'Duplicate prevention — Check if a post with the same title was already published today before posting.',
        ],
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Congratulations!',
        text: 'You\'ve built a production-ready LinkedIn automation pipeline. From a simple Notion entry to a polished, AI-formatted post published on schedule — this workflow saves hours every week and ensures consistent professional presence.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What\'s Next?',
      },
      {
        type: 'list',
        items: [
          'Add analytics tracking — Monitor post performance and feed data back into your content strategy',
          'Build a content suggestion engine — Use AI to analyze top-performing posts and suggest topics',
          'Implement A/B testing — Post variations and track which hooks and formats drive the most engagement',
          'Scale to team use — Let multiple team members contribute to the content calendar with approval workflows',
        ],
      },
    ],
  },
];
