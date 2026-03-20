/**
 * Module 17: Email Management with AI
 * Duration: 25 minutes | 10 Lessons
 */

import type { Lesson } from '../../types';

export const module17Lessons: Lesson[] = [
  // ==========================================================================
  // LESSON 17.1: Introduction to AI Email Management
  // ==========================================================================
  {
    id: 'lesson-17-1',
    moduleId: 'module-17',
    title: 'Introduction to AI Email Management',
    estimatedTime: 2,
    order: 1,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Email overload is one of the biggest productivity killers in modern work. The average professional receives 120+ emails per day and spends 28% of their workweek reading and responding to them. What if an AI could triage your inbox, summarize important messages, draft replies, and learn from your email history to get smarter over time?',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Email Problem',
      },
      {
        type: 'text',
        value: 'Most email management fails because the solutions only address part of the problem. Filters can sort by sender but can\'t understand content. Auto-responders send generic replies. Inbox Zero requires constant manual effort. An AI-powered system addresses all three dimensions: understanding, prioritization, and response.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'What Makes This Different',
        text: 'This system goes beyond simple rules-based filtering. It reads email content with AI, classifies intent, generates summaries, stores emails in a vector database for semantic search, and drafts context-aware replies. It\'s like having a smart executive assistant for your inbox.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What We\'re Building',
      },
      {
        type: 'text',
        value: 'The email management system has 6 major capabilities, all running automatically:',
      },
      {
        type: 'list',
        items: [
          'Email Ingestion — IMAP trigger monitors your inbox for new emails every 5 minutes',
          'Content Processing — Converts HTML emails to clean markdown text',
          'Classification — AI categorizes emails: Urgent, Client, Support, Newsletter, Spam',
          'Summarization — Generates concise summaries of important emails',
          'Vector Storage — Stores email embeddings in Qdrant for semantic search',
          'Reply Drafting — AI Agent drafts contextual replies using email history for RAG-powered responses',
        ],
        ordered: true,
      },
      {
        type: 'code',
        language: 'text',
        code: `[Email Trigger: IMAP polling every 5 min]
         │
         ▼
[HTML to Markdown Converter]
         │
         ▼
[Text Classifier: Urgent/Client/Support/Newsletter/Spam]
         │
    ┌────┼────┐────────┐
    │    │    │        │
    ▼    ▼    ▼        ▼
 Urgent Client Support  Newsletter/Spam
    │    │    │        │
    │    │    │     [Archive/
    │    │    │      Delete]
    │    │    │
    └────┼────┘
         │
         ▼
[Summarization Chain: Email summary]
         │
    ┌────┴────┐
    │         │
    ▼         ▼
[Embeddings  [AI Agent:
 + Qdrant     Draft Reply]
 Storage]        │
                 ▼
            [Human Review
             or Auto-Send]`,
        caption: 'The complete AI email management architecture',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Learns Over Time',
        text: 'The vector database stores every processed email. As your email corpus grows, the AI\'s reply drafts improve because it has more context about your communication style, past decisions, and conversation history. The system literally gets smarter the more you use it.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 17.2: IMAP Email Trigger Configuration
  // ==========================================================================
  {
    id: 'lesson-17-2',
    moduleId: 'module-17',
    title: 'IMAP Email Trigger Configuration',
    estimatedTime: 2,
    order: 2,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'IMAP (Internet Message Access Protocol) is the standard protocol for reading emails from a server. Unlike POP3, IMAP keeps emails on the server and supports folder management — making it perfect for an automated email processing system that works alongside your normal email client.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Setting Up the Email Trigger',
      },
      {
        type: 'text',
        value: 'The Email Trigger node in n8n connects to your email server via IMAP and polls for new messages. Here\'s the configuration:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Email Trigger (IMAP) Configuration:
═══════════════════════════════════════════════════
Setting          │ Value
─────────────────┼─────────────────────────────────
Host             │ imap.gmail.com (for Gmail)
Port             │ 993
Security         │ SSL/TLS
User             │ your-email@gmail.com
Password         │ App-specific password
Mailbox          │ INBOX
Poll Interval    │ Every 5 minutes
Mark as Read     │ true
═══════════════════════════════════════════════════`,
        caption: 'IMAP configuration for Gmail — adapt host/port for other providers',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Gmail App Password Setup',
      },
      {
        type: 'text',
        value: 'Gmail requires an app-specific password when using IMAP with third-party applications. Regular passwords won\'t work with 2FA enabled:',
      },
      {
        type: 'list',
        items: [
          'Go to myaccount.google.com → Security → 2-Step Verification (must be enabled)',
          'Scroll to "App passwords" at the bottom',
          'Select "Mail" as the app and your device type',
          'Google generates a 16-character password — use this in n8n, not your regular password',
          'Each app password can be named and revoked individually for security',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'IMAP Must Be Enabled',
        text: 'In Gmail, IMAP access is disabled by default. Go to Gmail Settings → See all settings → Forwarding and POP/IMAP → Enable IMAP. Without this, the Email Trigger will fail to connect.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Other Email Providers',
      },
      {
        type: 'code',
        language: 'text',
        code: `Common IMAP Settings:
─────────────────────────────────────────────
Provider      │ Host                  │ Port
──────────────┼───────────────────────┼──────
Gmail         │ imap.gmail.com        │ 993
Outlook/365   │ outlook.office365.com │ 993
Yahoo         │ imap.mail.yahoo.com   │ 993
ProtonMail    │ 127.0.0.1 (bridge)    │ 1143
Custom        │ mail.yourdomain.com   │ 993
─────────────────────────────────────────────`,
        caption: 'IMAP server settings for popular email providers',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What the Trigger Returns',
      },
      {
        type: 'text',
        value: 'Each new email triggers the workflow with the following data:',
      },
      {
        type: 'list',
        items: [
          'from — Sender email address and display name',
          'to — Recipient email address(es)',
          'subject — Email subject line',
          'date — When the email was sent',
          'html — Full HTML body of the email',
          'text — Plain text version of the email body',
          'attachments — Binary data of any attached files',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Poll Interval Considerations',
        text: 'A 5-minute poll interval is a good balance between responsiveness and server load. For truly urgent emails, consider a 1-minute interval. For high-volume inboxes (100+ emails/day), 10-15 minutes reduces processing costs while still providing timely handling.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 17.3: HTML to Markdown Conversion
  // ==========================================================================
  {
    id: 'lesson-17-3',
    moduleId: 'module-17',
    title: 'HTML to Markdown Conversion',
    estimatedTime: 2,
    order: 3,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Most emails arrive as HTML — full of formatting tags, tracking pixels, styles, and layout code. Before the AI can analyze the content, we need to strip away the noise and extract clean, readable text. Converting HTML to Markdown preserves meaningful formatting (links, bold, lists) while removing the clutter.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Why Not Use Plain Text Directly?',
      },
      {
        type: 'text',
        value: 'Many emails include a plain text version, but it\'s often stripped of all formatting — including meaningful structure like bullet points, links, and emphasis. HTML to Markdown conversion is the sweet spot: clean enough for AI processing, structured enough to preserve intent.',
      },
      {
        type: 'code',
        language: 'text',
        code: `HTML Email (raw):
<html>
<head><style>body{font-family:Arial}</style></head>
<body>
<div style="max-width:600px;margin:0 auto">
  <img src="tracking-pixel.gif" width="1" height="1">
  <h2>Project Update</h2>
  <p>Hi Ahmed,</p>
  <p>Here's the <strong>weekly update</strong>:</p>
  <ul>
    <li>Backend API: <a href="...">95% complete</a></li>
    <li>Frontend: 80% complete</li>
  </ul>
  <p>Please review by <strong>Friday</strong>.</p>
  <div class="footer">Unsubscribe | Privacy</div>
</div>
</body></html>

─────────────────────────────────

Markdown Output (clean):
## Project Update

Hi Ahmed,

Here's the **weekly update**:

- Backend API: [95% complete](...)
- Frontend: 80% complete

Please review by **Friday**.`,
        caption: 'HTML to Markdown strips noise while preserving meaningful structure',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Markdown Converter Node',
      },
      {
        type: 'text',
        value: 'n8n provides an HTML to Markdown node (or you can use a Code node with a conversion library). Configure it to process the email body:',
      },
      {
        type: 'code',
        language: 'text',
        code: `HTML to Markdown Node Configuration:
─────────────────────────────────
Input Field:    {{ $json.html }}
Output Field:   markdownBody
Options:
  Remove images:        true  (strips tracking pixels)
  Remove style tags:    true
  Remove script tags:   true
  Preserve links:       true
  Preserve emphasis:    true
─────────────────────────────────`,
        caption: 'Convert HTML email body to clean Markdown text',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Signature Removal',
        text: 'Email signatures add noise to AI processing. Add a Code node after conversion to detect and remove common signature patterns: lines starting with "--", "Best regards", "Sent from my iPhone", etc. This keeps the AI focused on the actual message content.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Handling Different Email Formats',
      },
      {
        type: 'list',
        items: [
          'Rich HTML emails — Full conversion with formatting preservation',
          'Plain text emails — Pass through directly, no conversion needed',
          'Multipart emails — Use the HTML version if available, fall back to plain text',
          'Encrypted emails — Cannot be processed; flag for manual handling',
          'Forwarded emails — May contain nested HTML; extract only the latest message',
        ],
      },
    ],
  },

  // ==========================================================================
  // LESSON 17.4: Email Classification with AI
  // ==========================================================================
  {
    id: 'lesson-17-4',
    moduleId: 'module-17',
    title: 'Email Classification with AI',
    estimatedTime: 3,
    order: 4,
    xpReward: 30,
    content: [
      {
        type: 'text',
        value: 'Classification is the decision engine of the email management system. The AI reads each email and assigns it to one of five categories, determining how the email is processed. This goes far beyond simple keyword matching — the AI understands context, intent, and urgency.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Text Classifier Node',
      },
      {
        type: 'text',
        value: 'n8n\'s Text Classifier node is purpose-built for categorization tasks. You define categories with descriptions and optional examples, and the AI assigns each input to the best matching category:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Text Classifier Node Configuration:
═══════════════════════════════════════════════════

Categories:
─────────────────────────────────────────────────
1. URGENT
   Description: Time-sensitive emails requiring
   immediate action — deadlines, emergencies,
   escalations, production issues

2. CLIENT
   Description: Emails from clients or customers —
   project updates, requests, feedback, invoices

3. SUPPORT
   Description: Internal support requests, IT help,
   HR questions, team coordination

4. NEWSLETTER
   Description: Marketing emails, newsletters,
   product updates, promotional content

5. SPAM
   Description: Unsolicited commercial email, scams,
   phishing attempts, irrelevant promotions
═══════════════════════════════════════════════════

Input:  {{ $json.markdownBody }}
Output: { "category": "CLIENT", "confidence": 0.92 }`,
        caption: 'Text Classifier configuration with 5 categories and descriptions',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Adding Examples for Better Accuracy',
      },
      {
        type: 'text',
        value: 'The Text Classifier supports few-shot learning — providing examples dramatically improves classification accuracy:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Category: URGENT
Examples:
- "The production server is down, we need immediate action"
- "Client deadline moved to tomorrow, please prioritize"
- "Security breach detected in the payment system"

Category: CLIENT
Examples:
- "Hi, here's the updated project timeline for Q2"
- "Could you send the invoice for last month's work?"
- "Great work on the demo! Let's discuss next steps"

Category: NEWSLETTER
Examples:
- "This week in tech: AI developments you should know"
- "Your monthly product update from ServiceName"
- "New features available in your dashboard"`,
        caption: 'Few-shot examples help the classifier distinguish between similar categories',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Routing Based on Classification',
      },
      {
        type: 'text',
        value: 'After classification, a Switch node routes each email to the appropriate processing pipeline:',
      },
      {
        type: 'list',
        items: [
          'URGENT — Summarize immediately, send push notification, draft priority reply',
          'CLIENT — Summarize, store in vector DB, draft professional reply',
          'SUPPORT — Summarize, create ticket reference, draft helpful reply',
          'NEWSLETTER — Extract key points only, archive without notification',
          'SPAM — Mark as spam, delete, no further processing',
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Confidence Scores',
        text: 'The Text Classifier returns a confidence score (0-1) with each classification. Use this for edge cases: if confidence is below 0.7, route the email to a "needs manual review" queue rather than auto-processing it. This prevents misclassification of ambiguous emails.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Subject + Body Classification',
        text: 'For best results, concatenate the email subject and body before classification: "Subject: {subject}\\n\\nBody: {body}". The subject often contains critical classification signals that the body alone might not convey.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 17.5: Email Summarization Chains
  // ==========================================================================
  {
    id: 'lesson-17-5',
    moduleId: 'module-17',
    title: 'Email Summarization Chains',
    estimatedTime: 2,
    order: 5,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'After classification, important emails (Urgent, Client, Support) are summarized into concise, actionable briefs. Instead of reading a 500-word email, you get a 2-3 sentence summary with the key information, action items, and deadline extracted.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Summarization Chain',
      },
      {
        type: 'text',
        value: 'n8n\'s Summarization Chain node condenses the email content. The prompt is tailored for email-specific summarization:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Summarization Prompt:
─────────────────────────────────
Summarize this email in 2-3 sentences. Include:
1. Who it's from and what they want
2. Any deadlines or time-sensitive information
3. Required action items (if any)

Format:
FROM: [sender name/role]
SUMMARY: [2-3 sentence summary]
ACTION: [what needs to be done, or "None"]
DEADLINE: [date/time if mentioned, or "None"]

Email:
{{ markdownBody }}`,
        caption: 'Email summarization prompt extracting key information',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Example Summaries',
      },
      {
        type: 'code',
        language: 'text',
        code: `URGENT Email Summary:
─────────────────────────────────
FROM: Sarah (DevOps Lead)
SUMMARY: Production database is experiencing high latency,
  affecting 30% of users. The team has identified the root
  cause as a missing index but needs approval to run the
  migration during business hours.
ACTION: Approve database migration during business hours
DEADLINE: ASAP (service degradation ongoing)

─────────────────────────────────

CLIENT Email Summary:
─────────────────────────────────
FROM: Michael Chen (Acme Corp PM)
SUMMARY: Client requests a demo of the new dashboard
  features for their leadership team. They want to
  schedule it next week and need a feature list beforehand.
ACTION: Send feature list, schedule demo for next week
DEADLINE: Feature list by Wednesday, demo next week`,
        caption: 'Structured email summaries — key information at a glance',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Summary Distribution',
      },
      {
        type: 'list',
        items: [
          'Urgent emails — Push notification via Telegram/Slack with the summary immediately',
          'Client emails — Daily digest email at 9 AM with all client email summaries',
          'Support emails — Add to a task management system (Notion, Trello) as action items',
          'All summaries — Stored alongside the full email in the vector database for context',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Thread Summarization',
        text: 'For email threads (replies and forwards), consider summarizing the entire thread context rather than just the latest message. The AI can identify what\'s new in the latest reply versus what was already discussed, producing a more useful summary.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 17.6: Vector Storage for Email Search
  // ==========================================================================
  {
    id: 'lesson-17-6',
    moduleId: 'module-17',
    title: 'Vector Storage for Email Search',
    estimatedTime: 3,
    order: 6,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'Traditional email search is keyword-based — you have to know exactly what words to search for. Vector storage enables semantic search: find emails by meaning rather than exact words. "Find emails about the website redesign project" works even if no email contains that exact phrase.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What Are Vector Embeddings?',
      },
      {
        type: 'text',
        value: 'An embedding is a numerical representation of text that captures its meaning. Similar texts have similar embeddings, enabling "find me documents similar to this concept" queries. Here\'s how it works:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Text → Embedding Model → Vector (array of numbers)

Examples:
"Project deadline extended to Friday"
  → [0.23, -0.45, 0.12, 0.89, ...] (1536 numbers)

"The due date has been pushed back to end of week"
  → [0.21, -0.43, 0.14, 0.87, ...] (similar vector!)

"I like pizza for dinner"
  → [0.78, 0.12, -0.56, 0.03, ...] (very different vector)

The first two texts have similar vectors because they
mean the same thing, even though they use different words.`,
        caption: 'Embeddings capture semantic meaning — similar meanings produce similar vectors',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Setting Up Qdrant',
      },
      {
        type: 'text',
        value: 'Qdrant is an open-source vector database optimized for similarity search. It\'s fast, easy to deploy, and integrates natively with n8n:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Qdrant Setup Options:
─────────────────────────────────
1. Docker (recommended for self-hosted):
   docker run -p 6333:6333 qdrant/qdrant

2. Qdrant Cloud (managed, free tier available):
   cloud.qdrant.io → Create cluster → Get API key

3. In-memory (for testing only):
   Built into n8n's vector store nodes
─────────────────────────────────

n8n Qdrant Credential:
  URL:     http://localhost:6333 (or cloud URL)
  API Key: your-api-key (cloud only)`,
        caption: 'Qdrant deployment options — Docker for self-hosted, cloud for managed',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Storing Email Embeddings',
      },
      {
        type: 'text',
        value: 'Each processed email is converted to a vector and stored in Qdrant with metadata. The n8n workflow for this:',
      },
      {
        type: 'code',
        language: 'text',
        code: `[Processed Email (markdown + summary)]
         │
         ▼
[Embeddings Node: OpenAI text-embedding-3-small]
   Input: email subject + body + summary
   Output: 1536-dimensional vector
         │
         ▼
[Qdrant: Upsert Vector]
   Collection: "emails"
   Vector: embedding
   Payload (metadata):
   {
     "from": "michael@acme.com",
     "subject": "Dashboard Demo Request",
     "summary": "Client wants demo next week...",
     "category": "CLIENT",
     "date": "2026-03-21",
     "full_text": "Hi Ahmed, I'd like to schedule..."
   }`,
        caption: 'Store email embeddings with rich metadata for filtered search',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Collection Setup (One-Time)',
        text: 'You need to create the Qdrant collection once before storing data. Set the vector size to match your embedding model (1536 for OpenAI, 768 for many open-source models) and the distance metric to "Cosine". Run the collection creation as a separate one-time workflow.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Run Vector Setup Once',
        text: 'The Qdrant collection creation should only happen once. Do not include it in the main email processing workflow, or it will try to recreate the collection on every email. Create a separate "setup" workflow that you run once to initialize the database.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 17.7: Semantic Search with Qdrant
  // ==========================================================================
  {
    id: 'lesson-17-7',
    moduleId: 'module-17',
    title: 'Semantic Search with Qdrant',
    estimatedTime: 2,
    order: 7,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'Once your emails are stored as vectors in Qdrant, you can search them by meaning. This is the foundation of RAG (Retrieval-Augmented Generation) — when drafting a reply, the AI first searches for relevant past emails and uses them as context to write a more informed, consistent response.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'How Semantic Search Works',
      },
      {
        type: 'code',
        language: 'text',
        code: `Traditional Keyword Search:
Query: "website redesign"
Results: Only emails containing the words "website" AND "redesign"
Misses: "We need to revamp the company site" (same meaning, different words)

─────────────────────────────────

Semantic Vector Search:
Query: "website redesign"
  → Convert to embedding vector
  → Find nearest vectors in Qdrant
Results:
  1. "Dashboard Demo Request" (0.89 similarity)
     — About redesigning the client dashboard
  2. "Site Revamp Discussion" (0.85 similarity)
     — About overhauling the company website
  3. "New Homepage Mockups" (0.82 similarity)
     — Homepage design concepts`,
        caption: 'Semantic search finds related content regardless of exact wording',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Querying Qdrant from n8n',
      },
      {
        type: 'text',
        value: 'Use the Qdrant Vector Store node to search for relevant emails:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Qdrant Search Configuration:
─────────────────────────────────
Collection:  emails
Query:       {{ $json.incomingEmailText }}
Top K:       5 (return 5 most similar)
Score Threshold: 0.7 (minimum similarity)
Filter:      { "category": "CLIENT" }  (optional)
─────────────────────────────────

Returns:
[
  { score: 0.89, payload: { subject: "...", text: "..." } },
  { score: 0.85, payload: { subject: "...", text: "..." } },
  ...
]`,
        caption: 'Search for semantically similar emails with optional metadata filtering',
      },
      {
        type: 'heading',
        level: 2,
        value: 'RAG for Email Replies',
      },
      {
        type: 'text',
        value: 'RAG (Retrieval-Augmented Generation) uses search results to enhance AI responses. When drafting a reply, the system retrieves relevant past emails and includes them as context:',
      },
      {
        type: 'code',
        language: 'text',
        code: `[New email from client about "project timeline"]
         │
         ▼
[Qdrant Search: Find past emails about this project]
         │
         ▼
Returns 3 relevant past emails:
  - "Timeline agreed: Phase 1 by April, Phase 2 by June"
  - "Budget approved for $50K with 10% contingency"
  - "Team assigned: 2 devs, 1 designer, 1 PM"
         │
         ▼
[AI Agent: Draft reply WITH context from past emails]
   The AI now knows the agreed timeline, budget,
   and team — producing a much more informed reply.`,
        caption: 'RAG provides the AI with relevant historical context for better replies',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Metadata Filtering',
        text: 'Qdrant supports filtering search results by metadata. When replying to a client email, filter by the sender\'s email address to find only past emails from that same client. This focuses the context on the specific relationship and conversation history.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 17.8: AI-Powered Reply Drafting
  // ==========================================================================
  {
    id: 'lesson-17-8',
    moduleId: 'module-17',
    title: 'AI-Powered Reply Drafting',
    estimatedTime: 3,
    order: 8,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'The reply drafting system combines the incoming email, its classification, the AI summary, and relevant context from the vector database to generate a professional, contextually appropriate reply draft. The AI Agent has access to Gmail as a tool, enabling it to send or queue the reply.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Reply Drafting Agent',
      },
      {
        type: 'code',
        language: 'text',
        code: `AI Agent Configuration:
═══════════════════════════════════════════════════
Type:   Tools Agent
Model:  GPT-4o / Claude 3.5 Sonnet

System Prompt:
"You are an executive assistant drafting email replies.
You have access to the original email, its summary,
classification, and relevant past emails for context.

Guidelines:
- Match the tone and formality of the incoming email
- Reference specific details from past conversations
- Be concise but thorough
- Include next steps or action items
- Sign with the user's name and title
- For URGENT emails: acknowledge urgency, provide ETA
- For CLIENT emails: professional, relationship-focused
- For SUPPORT emails: helpful, solution-oriented"

Tools:
  - Gmail: Send email / Save as draft
  - Qdrant: Search for additional context
═══════════════════════════════════════════════════`,
        caption: 'Reply drafting agent configuration with context-aware instructions',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Constructing the Reply Context',
      },
      {
        type: 'text',
        value: 'The user message to the agent includes all available context, assembled from previous pipeline stages:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Agent User Message Template:
─────────────────────────────────
Draft a reply to this email.

INCOMING EMAIL:
From: {{ from }}
Subject: {{ subject }}
Classification: {{ category }}
Summary: {{ summary }}

Full Email:
{{ markdownBody }}

RELEVANT PAST EMAILS (for context):
{% for email in vectorSearchResults %}
- Subject: {{ email.subject }} ({{ email.date }})
  Summary: {{ email.summary }}
{% endfor %}

Draft a professional reply that addresses all points
raised in the email.
─────────────────────────────────`,
        caption: 'Assemble all context into a single prompt for the reply agent',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Reply Quality Optimization',
      },
      {
        type: 'list',
        items: [
          'Tone matching — The agent adjusts formality based on the incoming email\'s tone (casual internal email vs. formal client correspondence)',
          'Context awareness — Past emails provide relationship context, project details, and agreement history',
          'Action items — The reply explicitly addresses any questions or requests from the sender',
          'Signature — Include appropriate sign-off with name, title, and contact info',
          'Thread awareness — If it\'s a reply to a thread, reference previous messages appropriately',
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Save as Draft vs Auto-Send',
        text: 'By default, replies should be saved as Gmail drafts for human review — not sent automatically. This is a safety measure to catch any AI errors or inappropriate responses. Only auto-send for low-risk categories (e.g., auto-acknowledgments) where the confidence threshold is very high.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 17.9: Human-in-the-Loop Review System
  // ==========================================================================
  {
    id: 'lesson-17-9',
    moduleId: 'module-17',
    title: 'Human-in-the-Loop Review System',
    estimatedTime: 2,
    order: 9,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'Full automation is tempting, but email is high-stakes communication. A poorly worded reply to a client can damage relationships. A missed nuance in an internal email can cause confusion. The human-in-the-loop pattern lets the AI do the heavy lifting while keeping humans in control of final decisions.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Review Flow',
      },
      {
        type: 'code',
        language: 'text',
        code: `[AI Agent: Draft Reply]
         │
         ▼
   [Check Confidence + Classification]
         │
    ┌────┼────┐
    │         │
    ▼         ▼
High        Low Confidence
Confidence  or Sensitive
(>0.9)      Category
    │         │
    ▼         ▼
[Auto-send  [Save as Gmail Draft
 or auto-    + Notify for review]
 acknowledge]

Review Process:
1. AI saves draft to Gmail Drafts folder
2. Notification sent via Telegram/Slack
3. Human reviews, edits if needed
4. Human clicks Send in Gmail
5. (Optional) Feedback loop for AI improvement`,
        caption: 'Human-in-the-loop: auto-send only high-confidence, low-risk replies',
      },
      {
        type: 'heading',
        level: 2,
        value: 'When to Auto-Send vs. Queue for Review',
      },
      {
        type: 'list',
        items: [
          'Auto-send: Simple acknowledgments ("Thanks, I\'ll review this and get back to you")',
          'Auto-send: Newsletter unsubscribe confirmations',
          'Queue for review: Client replies — always need human tone check',
          'Queue for review: Urgent emails — high-stakes responses',
          'Queue for review: Any reply where AI confidence is below 0.9',
          'Queue for review: Emails involving financial amounts or legal terms',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'Notification Design',
      },
      {
        type: 'text',
        value: 'When a reply is queued for review, send a concise notification that helps the reviewer decide quickly:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Telegram Notification:
─────────────────────────────────
📧 Draft Reply Ready for Review

From: Michael Chen (Acme Corp)
Category: CLIENT
Subject: Dashboard Demo Request

AI Summary: Client requests demo of new features
for leadership team next week.

AI Draft Preview (first 100 chars):
"Hi Michael, Thanks for reaching out! I'd be happy
to schedule a demo for your leadership team..."

→ Review in Gmail Drafts
─────────────────────────────────`,
        caption: 'Concise notification with enough context to prioritize review',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Feedback Loop',
        text: 'Track which drafts are sent as-is vs. edited heavily. If the AI\'s drafts consistently need major edits for a specific email type, adjust the system prompt. If drafts for a particular client always need the same type of edit, add client-specific instructions to the prompt.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Never Auto-Send to New Contacts',
        text: 'If the sender is not in your vector database (first-time contact), always queue the reply for human review. The AI has no context about this relationship and is more likely to generate a generic or inappropriate response.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 17.10: Production Deployment & Confidence Thresholds
  // ==========================================================================
  {
    id: 'lesson-17-10',
    moduleId: 'module-17',
    title: 'Production Deployment & Confidence Thresholds',
    estimatedTime: 3,
    order: 10,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'Taking an email management system from development to production requires careful configuration of confidence thresholds, error handling, monitoring, and performance optimization. This lesson covers the operational considerations that make the difference between a demo and a reliable system.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Confidence Threshold Configuration',
      },
      {
        type: 'text',
        value: 'The confidence threshold is the minimum classification confidence score required before the system takes automated action. Setting it correctly is crucial:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Confidence Threshold Guidelines:
═══════════════════════════════════════════════════
Threshold │ Behavior          │ Use Case
──────────┼───────────────────┼────────────────────
  0.95    │ Very conservative │ New deployment,
          │ Most → manual     │ building trust
──────────┼───────────────────┼────────────────────
  0.90    │ Recommended       │ Production default
          │ Good auto/manual  │ after calibration
          │ balance           │
──────────┼───────────────────┼────────────────────
  0.80    │ More aggressive   │ High-volume inbox,
          │ Most auto-handled │ low-risk emails
──────────┼───────────────────┼────────────────────
  0.70    │ Aggressive        │ Only for non-
          │ Nearly all auto   │ critical categories
═══════════════════════════════════════════════════`,
        caption: 'Start conservative (0.95) and lower gradually as you build confidence in the system',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Production Checklist',
      },
      {
        type: 'list',
        items: [
          'IMAP poll interval — Set to 5 minutes for responsiveness without overwhelming the server',
          'Error trigger — Add an Error Workflow that catches any failures and sends you a notification',
          'Rate limiting — Respect OpenAI/Qdrant API rate limits; add delays between rapid processing',
          'Monitoring — Log every email processed with classification, confidence, and action taken',
          'Backup — Export Qdrant vectors periodically; keep a Google Sheets log as backup',
          'Cost tracking — Monitor AI API costs; estimate $0.01-0.05 per email for classification + summarization',
        ],
        ordered: true,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Performance Optimization',
      },
      {
        type: 'code',
        language: 'text',
        code: `Optimization Strategies:
─────────────────────────────────

1. Skip known senders:
   If sender is in "auto-archive" list → skip AI entirely

2. Batch processing:
   If poll returns 10+ emails → process in parallel
   (n8n supports concurrent execution)

3. Model selection by task:
   Classification:  GPT-4o-mini (fast, cheap)
   Summarization:   GPT-4o-mini (fast, cheap)
   Reply drafting:  GPT-4o (quality matters)
   Embeddings:      text-embedding-3-small

4. Caching:
   Cache classification for known newsletter senders
   Cache embeddings for frequently referenced emails`,
        caption: 'Use different models and strategies per task to optimize cost and speed',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Monitoring and Analytics',
      },
      {
        type: 'text',
        value: 'Track these metrics to ensure the system is performing well and improving over time:',
      },
      {
        type: 'list',
        items: [
          'Classification accuracy — How often does the human agree with the AI\'s category?',
          'Reply approval rate — What percentage of AI drafts are sent without edits?',
          'Processing time — Average seconds per email from trigger to draft/send',
          'Cost per email — Total API costs divided by emails processed',
          'False positive rate — How often does the system auto-send something that should have been reviewed?',
          'Volume trends — Emails processed per day/week with category breakdown',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Gradual Rollout',
        text: 'Don\'t switch your entire inbox to AI management at once. Start with one email category (e.g., newsletters only), verify it works well for 2 weeks, then add support emails, then client emails. Each category should be validated before adding the next.',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Congratulations!',
        text: 'You\'ve built a comprehensive AI email management system — from IMAP ingestion through classification, summarization, vector storage, semantic search, and RAG-powered reply drafting. This system saves hours of daily email time while ensuring important messages get prompt, contextual responses.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What\'s Next?',
      },
      {
        type: 'list',
        items: [
          'Multi-account support — Process emails from multiple accounts in a single pipeline',
          'Calendar integration — Automatically detect meeting requests and create calendar events',
          'Task extraction — Parse action items from emails and create tasks in your project management tool',
          'Sentiment analysis — Track sender sentiment over time to identify deteriorating relationships',
          'Email analytics dashboard — Build a Notion dashboard showing email volumes, categories, and response metrics',
        ],
      },
    ],
  },
];
