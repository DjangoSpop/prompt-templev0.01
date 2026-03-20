# 🚀 The Complete Professional n8n Automation Course
### Master Workflow Automation — From Fundamentals to Enterprise-Grade AI Pipelines

> **Based on 2,000+ real-world n8n workflows. Curated, analyzed, and structured for professional practitioners.**

---

## Table of Contents

1. [What is n8n? The Platform Overview](#1-what-is-n8n)
2. [Core Concepts You Must Know](#2-core-concepts)
3. [n8n Architecture & Node Types](#3-architecture--node-types)
4. [Triggers — Starting a Workflow](#4-triggers)
5. [Module 1 — AI Agent Chatbot with Long-Term Memory (Telegram)](#module-1-ai-agent-chatbot-with-long-term-memory)
6. [Module 2 — Social Media Publishing Factory (All Platforms)](#module-2-social-media-publishing-factory)
7. [Module 3 — WhatsApp AI Chatbot (Text, Voice, Images & PDFs)](#module-3-whatsapp-ai-chatbot)
8. [Module 4 — CV / Resume AI Screening & Tracker System](#module-4-cv--resume-ai-screening--tracker)
9. [Module 5 — Financial Tracker: Telegram → Notion with AI Reports](#module-5-financial-tracker)
10. [Module 6 — HR Automation Pipeline with AI](#module-6-hr-automation-pipeline)
11. [Module 7 — Effortless Email Management with AI](#module-7-email-management-with-ai)
12. [Module 8 — LinkedIn Posts Automation with AI](#module-8-linkedin-posts-automation)
13. [Module 9 — YouTube AI Summarization & Analysis](#module-9-youtube-ai-summarization--analysis)
14. [Module 10 — Google Maps Email Scraper & Lead Generation](#module-10-google-maps-lead-generation)
15. [Recurring Task Automation Strategies](#recurring-task-automation-strategies)
16. [Automating Without n8n — Python & Desktop Automation](#automating-without-n8n)
17. [Human–Computer Interaction Automation](#humancomputer-interaction-automation)
18. [Best Practices & Production Patterns](#best-practices--production-patterns)
19. [Quick Reference: Node Cheat Sheet](#quick-reference-node-cheat-sheet)

---

## 1. What is n8n?

**n8n** (pronounced "nodemation") is a source-available, self-hostable workflow automation platform. It lets you connect apps, APIs, databases, and AI models using a visual node-based editor — with no limits on custom code when you need it.

**Why professionals choose n8n over Zapier or Make:**
- Self-hosted = full data ownership and privacy
- Supports JavaScript/Python code nodes inline
- Native LangChain/AI agent support built in
- Can be run on your own server, Docker, or cloud (n8n Cloud)
- Unlimited workflows on self-hosted (no per-task pricing)
- REST API, webhooks, and CLI available

**Installation options:**

```bash
# Docker (recommended for production)
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n

# npm (for local development)
npm install n8n -g
n8n start
```

Access the editor at: `http://localhost:5678`

---

## 2. Core Concepts

### Workflow
A **workflow** is a sequence of connected nodes that automates a task. Workflows are stored as JSON and can be imported/exported.

### Node
A **node** is a single unit of work — fetching data, transforming it, sending it somewhere, or making a decision. Every node has:
- **Inputs** — data coming in (JSON)
- **Outputs** — data going out (JSON)
- **Parameters** — configuration fields

### Connection
An **arrow** between two nodes. Data (items) flow along connections. Multiple items can flow simultaneously.

### Execution
When a workflow runs, it creates an **execution**. You can view every execution's input/output for debugging.

### Credentials
Stored, encrypted authentication details (API keys, OAuth tokens). Created once, reused across workflows.

### Expression
Dynamic values using the syntax `{{ $json.fieldName }}` or `{{ $node["NodeName"].json.value }}`. Expressions use JavaScript.

---

## 3. Architecture & Node Types

```
┌─────────────────────────────────────────────────────────────────┐
│                         n8n WORKFLOW                            │
│                                                                 │
│  [TRIGGER NODE] ──► [TRANSFORM] ──► [CONDITION] ──► [ACTION]  │
│       │                                   │                     │
│  Starts the flow               Branches the flow                │
└─────────────────────────────────────────────────────────────────┘
```

### Node Categories

| Category | Examples | Purpose |
|---|---|---|
| **Trigger Nodes** | Webhook, Schedule, Gmail Trigger, Telegram Trigger | Start a workflow |
| **Action Nodes** | HTTP Request, Gmail, Slack, Notion | Do something |
| **Transform Nodes** | Set, Code, Merge, Split, Aggregate | Shape data |
| **Logic Nodes** | IF, Switch, Filter, Wait | Control flow |
| **AI Nodes** | AI Agent, LLM Chain, Vector Store, Embeddings | Intelligence |
| **Storage Nodes** | Google Sheets, Airtable, Postgres, MongoDB | Persist data |

### The Data Structure
All data in n8n is an **array of items**. Each item has a `json` property:

```json
[
  { "json": { "name": "Django", "email": "behodjango@gmail.com" } },
  { "json": { "name": "Alice", "email": "alice@example.com" } }
]
```

Nodes process every item in the array by default.

---

## 4. Triggers

Triggers are the entry points of every workflow. Choosing the right trigger is critical.

### Schedule Trigger
```
Runs at a defined interval or cron expression.
Use for: daily reports, weekly digests, cleanup tasks.

Example: "0 9 * * 1-5" → Every weekday at 9:00 AM
```

### Webhook Trigger
```
Exposes a URL. Any HTTP POST/GET to that URL starts the workflow.
Use for: receiving data from external apps, form submissions, payment events.

URL format: https://your-n8n.com/webhook/[unique-id]
```

### App-Specific Triggers
```
Gmail Trigger   → new email received
Telegram Trigger → new message
WhatsApp Trigger → incoming WhatsApp message
Google Drive Trigger → file created/modified
```

### Chat Trigger (AI)
```
Used with LangChain AI agents.
Opens a built-in chat interface or connects to external chat apps.
```

---

## Module 1: AI Agent Chatbot with Long-Term Memory

**Workflow name:** `🤖🧠 AI Agent Chatbot + LONG TERM Memory + Note Storage + Telegram`

### What It Does
This workflow creates a persistent AI assistant that:
- Accepts messages via Telegram or the built-in chat interface
- Maintains **short-term memory** (recent conversation window)
- Automatically saves **long-term memories** to Google Docs
- Retrieves relevant long-term memories before each response
- Supports multiple LLMs (GPT-4o-mini, DeepSeek-V3)
- Can save and retrieve user notes independently

### Architecture Diagram
```
[Chat Trigger / Telegram]
         │
         ▼
[Retrieve Long-Term Memories] ──► Google Docs
         │
         ▼
   [AI Tools Agent] ◄──── [GPT-4o-mini / DeepSeek]
         │    │
         │    ├──► [Window Buffer Memory] (short-term)
         │    ├──► [Save Long-Term Memories] → Google Docs
         │    └──► [Save/Retrieve Notes] → Google Docs
         │
         ▼
[Chat Response / Telegram Response]
```

### Key Nodes Explained

**AI Tools Agent**
The brain. Receives the message, has access to tools (Google Docs for memory), decides what to do, and generates a response. Uses the ReAct framework internally.

**Window Buffer Memory**
Keeps the last N messages in memory. Lightweight, fast, no external storage needed. Configured with `windowSize: 10` to remember the last 10 messages.

**Save Long-Term Memories (Google Docs Tool)**
When the agent decides something is worth remembering long-term (a user preference, important fact), it calls this tool, which appends the memory to a Google Doc.

**Retrieve Long-Term Memories**
Before each conversation turn, the workflow fetches the memory Google Doc and injects it into the agent's context.

### How to Set It Up

1. Create credentials: OpenAI API key, Google Docs OAuth, Telegram Bot Token
2. Create two Google Docs: one for memories, one for notes
3. Import the workflow JSON
4. Configure node credentials
5. Set your Telegram bot webhook to point to the n8n webhook URL
6. Activate the workflow

### Professional Use Cases
- Personal AI assistant for daily operations
- Customer support agent with memory per user
- Internal knowledge base chatbot
- Sales assistant that remembers client preferences

### Automating Without n8n (Python Equivalent)
```python
import openai
from datetime import datetime

class MemoryAgent:
    def __init__(self):
        self.client = openai.OpenAI()
        self.short_term = []  # recent messages
        self.long_term_file = "long_term_memory.txt"

    def load_long_term(self):
        try:
            with open(self.long_term_file) as f:
                return f.read()
        except FileNotFoundError:
            return ""

    def save_memory(self, memory: str):
        with open(self.long_term_file, "a") as f:
            f.write(f"\n[{datetime.now()}] {memory}")

    def chat(self, user_message: str) -> str:
        long_term = self.load_long_term()
        system = f"You are a helpful assistant.\n\nLong-term memories:\n{long_term}"

        self.short_term.append({"role": "user", "content": user_message})
        messages = [{"role": "system", "content": system}] + self.short_term[-10:]

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )

        reply = response.choices[0].message.content
        self.short_term.append({"role": "assistant", "content": reply})
        return reply
```

---

## Module 2: Social Media Publishing Factory

**Workflow name:** `✨🩷 Automated Social Media Content Publishing Factory + System Prompt Composition`

### What It Does
A central orchestrator that takes one piece of content and simultaneously publishes it — adapted — to multiple platforms:
- X (Twitter)
- Instagram
- Facebook
- LinkedIn
- Short-form video (YouTube Shorts, Reels)

### Architecture Diagram
```
[Chat Trigger: "Write about AI trends"]
         │
         ▼
   [AI Orchestrator Agent] ◄── [Window Buffer Memory]
    │    │    │    │    │
    ▼    ▼    ▼    ▼    ▼
  [X] [IG] [FB] [LI] [YT Short]
   (Sub-workflows per platform)
```

### How Sub-Workflows Work
Each platform is a **separate child workflow** called via the `toolWorkflow` node. This keeps the main workflow clean and lets you edit each platform independently.

**Platform-specific adaptations:**
- **X/Twitter**: Max 280 chars, hashtags, casual tone
- **LinkedIn**: Professional tone, 1200–1500 chars, insight-focused
- **Instagram**: Emoji-rich, hashtag block at end, engaging CTA
- **Facebook**: Conversational, can be longer, link preview friendly

### Key Technical Pattern: Tool Workflows
```
Main Workflow
│
├── toolWorkflow("X-Twitter") → triggers child workflow
│        └── Uses platform-specific system prompt
│        └── Returns formatted post text
│
├── toolWorkflow("LinkedIn")  → triggers child workflow
│        └── Uses professional system prompt
│        └── Returns post with formatting
```

### How to Configure

1. Create separate child workflows for each platform with their own system prompts
2. In the main workflow, each `toolWorkflow` node references a child workflow by ID
3. Set up credentials for each social platform
4. Test with a manual chat trigger first
5. Switch to a Schedule Trigger for automated daily/weekly posting

### Recurring Task Automation

Use a **Schedule Trigger** + **Notion database** as your content calendar:

```
[Schedule: Every day at 10 AM]
         │
         ▼
[Notion: Get today's scheduled posts]
         │
         ▼
[Social Media Factory Workflow]
         │
         ▼
[Mark Notion entry as "Published"]
```

---

## Module 3: WhatsApp AI Chatbot

**Workflow name:** `AI-Powered WhatsApp Chatbot for Text, Voice, Images & PDFs`

### What It Does
A production-ready WhatsApp bot that handles ALL message types:
- **Text messages** → AI response
- **Voice messages** → Transcribed (Whisper) → AI response → Voice reply
- **Images** → Analyzed with GPT-4 Vision → AI response
- **PDF files** → Text extracted → AI response

### Architecture Diagram
```
[WhatsApp Trigger]
         │
         ▼
[Message Type Router]
   │     │     │     │
   ▼     ▼     ▼     ▼
[Text] [Audio] [Image] [PDF]
         │       │      │
    [Transcribe][Analyze][Extract]
         │       │      │
         └───────┴──────┘
                 │
                 ▼
           [AI Agent]
           [Memory]
                 │
                 ▼
      [WhatsApp: Send Reply]
```

### Node-by-Node Breakdown

**WhatsApp Trigger**
Listens for incoming WhatsApp messages via the WhatsApp Business API (Meta Developer Portal).

**Message Router (IF/Switch nodes)**
Checks `message.type` field:
- `text` → goes to text branch
- `audio` → downloads audio, transcribes
- `image` → downloads image, sends to vision model
- `document` (PDF) → downloads, extracts text

**Download + Transcribe (Audio)**
```javascript
// HTTP Request downloads the voice file
// OpenAI Whisper transcribes it
// Result: plain text of what was said
```

**Analyze Image (GPT-4 Vision)**
```javascript
// Base64 encodes the image
// Sends to gpt-4o with prompt: "Describe this image and answer any questions"
// Returns: text description
```

**Extract from File (PDF)**
Uses the built-in `extractFromFile` node. Pulls all text from the PDF automatically.

**AI Agent**
All message types converge here with a unified text representation. The agent responds intelligently.

**WhatsApp: Send Reply**
Sends the AI's response back to the same WhatsApp conversation.

### Production Configuration

1. Set up Meta Developer account + WhatsApp Business API
2. Configure webhook: `POST https://your-n8n.com/webhook/whatsapp`
3. Add WhatsApp credentials in n8n (access token, phone number ID)
4. Add OpenAI credentials
5. Test with your own WhatsApp number first
6. Deploy to production server

### Why This Matters Professionally
WhatsApp has 2+ billion users. Having an AI that handles voice/image/PDF on WhatsApp enables:
- Customer support bots
- Document processing services
- Voice-first interfaces for mobile users

---

## Module 4: CV / Resume AI Screening & Tracker

**Workflow name:** `AI Agent - CV Resume - Automated Screening, Sorting, Rating and Tracker System`

### What It Does
Fully automated HR screening pipeline:
1. Candidate uploads CV to Google Drive folder
2. Workflow automatically triggers
3. AI reads the CV and the job description
4. Scores and rates the candidate
5. Moves CV to "Accept", "Reject", or "KIV" (Keep In View) folder
6. Sends email notification to recruiter

### Architecture Diagram
```
[Google Drive Trigger: New file in /CVs folder]
         │
         ▼
[Download Resume File]
         │
         ▼
[Extract Text from PDF/DOCX]
         │
         ▼
[Google Docs: Get Job Description]
         │
         ▼
     [AI Agent]
     Uses tools:
      ├── [Gmail: Send Notification]
      ├── [GDrive: Move to Accept Folder]
      ├── [GDrive: Move to KIV Folder]
      └── [GDrive: Move to Reject Folder]
```

### The AI Agent's Decision Logic

The AI Agent is given a **system prompt** like:
```
You are an HR screening assistant. You will:
1. Read the job description
2. Read the candidate's CV
3. Rate the candidate from 1-10
4. Classify as: ACCEPT (8-10), KIV (5-7), REJECT (1-4)
5. Call the appropriate tool to move the file
6. Send a notification email with your assessment
```

### Setting Up the Job Description
Store your job description in a Google Doc. The workflow fetches it dynamically — so updating the doc immediately changes screening criteria without touching the workflow.

### How to Scale This
- Create a **webhook-based intake form** instead of Google Drive for direct applications
- Add a **Notion database** to track all candidates with scores
- Add **Calendly integration** to auto-book interviews for accepted candidates
- Connect to your **ATS (Applicant Tracking System)** via API

---

## Module 5: Financial Tracker

**Workflow name:** `N8N Financial Tracker Telegram Invoices to Notion with AI Summaries & Reports`

### What It Does
Personal/business finance automation:
1. Send invoice photo to Telegram
2. Gemini AI extracts transaction data (amount, vendor, date, category)
3. Data is saved to a Notion database
4. Every week/month, AI generates a summary report with charts
5. Chart image is sent back to Telegram

### Architecture Diagram
```
[Telegram Trigger: Photo received]
         │
         ▼
[Get Image Info / editImage]
         │
         ▼
[Gemini AI: Extract Transaction Data]
  Output: { amount, vendor, date, category }
         │
         ▼
[Parse to Structured Object]
         │
         ▼
[Split Out: individual transactions]
         │
         ▼
[Notion: Save to Finance Database]
         │    ┌──────────────────────────────┐
         │    │  [Schedule Trigger: Weekly]  │
         │    │           │                  │
         │    │  [Notion: Get Recent Data]   │
         │    │           │                  │
         │    │  [Summarize Transactions]    │
         │    │           │                  │
         │    │  [QuickChart: Generate Chart]│
         │    │           │                  │
         │    │  [Telegram: Send Report]     │
         └────┴──────────────────────────────┘
```

### The AI Extraction Prompt
```
Analyze this invoice/receipt image. Extract:
- amount (number only)
- currency (string)
- vendor_name (string)
- date (YYYY-MM-DD)
- category: one of [Food, Transport, Utilities, Shopping, Healthcare, Entertainment, Other]

Return as valid JSON only.
```

### Structured Output Parser
The `outputParserStructured` node forces the LLM to return valid JSON matching your schema. This prevents hallucinations from breaking your database.

```json
{
  "amount": "number",
  "currency": "string",
  "vendor_name": "string",
  "date": "string",
  "category": "string"
}
```

### The Reporting Pipeline
The **Schedule Trigger** runs separately from the invoice intake. Every Monday morning:
1. Fetch all transactions from the past 7 days from Notion
2. Summarize (sum by category, total spend, biggest expense)
3. Generate a bar chart with QuickChart.io
4. Send the chart image + AI summary to Telegram

---

## Module 6: HR Automation Pipeline with AI

**Workflow name:** `HR-focused automation pipeline with AI`

### What It Does
End-to-end hiring pipeline from form submission to candidate profile:
1. Candidate fills out an n8n form (no external tool needed)
2. CV is extracted and parsed
3. AI extracts structured personal data and qualifications
4. AI summarizes the CV
5. HR expert AI evaluates the candidate
6. All data saved to Google Sheets
7. CV uploaded to Google Drive

### Architecture Diagram
```
[Form Trigger: Candidate applies]
         │
         ├──► [Extract CV Text]
         │              │
         │    [Information Extractor: Personal Data]
         │    [Information Extractor: Qualifications]
         │              │
         │         [Merge Data]
         │              │
         │    [Summarization Chain: CV Summary]
         │              │
         │    [HR Expert LLM: Evaluate candidate]
         │              │
         │    [Structured Output Parser]
         │              │
         ├──► [Google Sheets: Save candidate record]
         └──► [Google Drive: Upload CV file]
```

### The Information Extractor Node
This is a powerful LangChain node that pulls structured fields from unstructured text:

```
Input:  "John Smith, 28, has a BSc in Computer Science from MIT..."
Output: { name: "John Smith", age: 28, degree: "BSc CS", university: "MIT" }
```

You define the fields you want, and it extracts them using AI.

### The HR Expert Prompt
```
You are an experienced HR manager. Given this candidate profile:
{candidate_data}

Evaluate against our requirements:
{profile_wanted}

Provide:
1. Overall fit score (1-10)
2. Top 3 strengths
3. Top 2 concerns
4. Interview recommendation (yes/no)
5. Suggested interview questions
```

### Form Trigger Configuration
n8n's built-in **Form Trigger** creates a public web form instantly. No need for Typeform or Google Forms:
```
Fields you can add:
- Text input (name, email)
- File upload (CV/resume)
- Dropdown (role applied for)
- Checkbox (terms acceptance)
```

---

## Module 7: Email Management with AI

**Workflow name:** `Effortless Email Management with AI`

### What It Does
Intelligent email processing pipeline:
1. Reads incoming emails via IMAP
2. Classifies emails (urgent, spam, newsletter, client, support)
3. Summarizes email content
4. Drafts an AI reply
5. Stores emails in a vector database for semantic search
6. Sends the drafted reply (or queues for human review)

### Architecture Diagram
```
[Email Trigger (IMAP)]
         │
         ▼
[Markdown Converter: clean HTML]
         │
         ▼
[Text Classifier: categorize email]
    urgent / newsletter / client / spam
         │
         ▼ (not spam)
[Email Summarization Chain]
         │
         ├──► [Embeddings + Qdrant Vector Store: index for search]
         │
         ▼
[AI Agent: Draft reply]
         │
         ▼
[Gmail: Send reply / queue for review]
```

### Text Classifier Node
One of n8n's most useful nodes. You give it categories and examples:

```
Categories:
- "urgent": Contains deadlines, emergencies, ASAP
- "client": From a known client domain, business matter
- "newsletter": Marketing, unsubscribe link present
- "spam": Suspicious, unknown sender, no personal content
```

The AI assigns the category and you route accordingly.

### Vector Store Integration (Qdrant)
All processed emails are embedded and stored in **Qdrant** (a vector database). This enables:
- Semantic email search later
- "Find all emails about the project X"
- RAG (Retrieval Augmented Generation) for smarter replies

### Professional Configuration Tips
- Run the vector store setup workflow **once** to initialize the collection
- Set IMAP trigger to poll every 5 minutes (not real-time, but sufficient)
- Add a human-in-the-loop step: save draft to Gmail Drafts instead of sending
- Add a "confidence threshold" — only auto-send if AI confidence > 0.9

---

## Module 8: LinkedIn Posts Automation with AI

**Workflow name:** `Automate LinkedIn Posts with AI`

### What It Does
Scheduled LinkedIn publishing from a Notion content calendar:
1. Runs every day at a scheduled time
2. Reads Notion database for posts scheduled "today"
3. Reformats text with OpenAI for professional tone
4. Fetches the attached image
5. Posts to LinkedIn
6. Marks the Notion entry as "Done"

### Architecture Diagram
```
[Schedule Trigger: Daily at 10 AM]
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
[Notion: Set status to "Done"]
```

### The Notion Content Calendar Setup
Create a Notion database with these properties:
- `Title` — Post headline
- `Body` — Post content (long text)
- `Publish Date` — Date property
- `Platform` — Multi-select (LinkedIn, Twitter, etc.)
- `Status` — Select (Draft, Scheduled, Done)
- `Image` — Files & Media

### The OpenAI Reformat Prompt
```
You are a professional LinkedIn content writer.
Format the following raw content into an engaging LinkedIn post:
- Start with a hook (bold first line)
- Use short paragraphs (max 3 lines each)
- Add 3-5 relevant hashtags at the end
- End with a question to drive engagement
- Maximum 1,300 characters

Content: {raw_content}
```

### Extending to Multi-Platform
Add more platform nodes in parallel after the AI reformatting step. Each platform gets its own reformatting prompt and API node.

---

## Module 9: YouTube AI Summarization & Analysis

**Workflow name:** `⚡AI-Powered YouTube Playlist & Video Summarization and Analysis v2`

### What It Does
Processes YouTube playlists and individual videos:
1. Fetches YouTube transcript
2. Splits transcript into chunks
3. Summarizes each chunk with Gemini AI
4. Combines summaries into a final analysis
5. Stores in a vector database (Qdrant)
6. Enables Q&A chatbot over the video content

### Architecture Diagram
```
[Chat Trigger: "Summarize playlist X"]
         │
         ▼
[Handle Queries Agent] ◄── [Gemini Chat Model]
         │
         │  (Tool call: process video)
         ▼
[YouTube API: Get transcript]
         │
         ▼
[Text Splitter: Recursive Character (1000 tokens)]
         │
         ▼
[Summarize & Analyze each chunk] ◄── [Gemini]
         │
         ▼
[Aggregate: Concatenate all summaries]
         │
         ▼
[Final Summary + Analysis] ◄── [Gemini]
         │
         ├──► [Qdrant Vector Store: index chunks]
         │
         ▼
[Return to user via chat]
```

### Text Splitter Configuration
The **Recursive Character Text Splitter** is crucial for processing long videos:
```
Chunk size: 1000 characters
Chunk overlap: 200 characters  ← prevents losing context at boundaries
Separators: ["\n\n", "\n", " "]
```

### RAG (Retrieval Augmented Generation) Setup
Once videos are indexed in Qdrant, users can ask questions:
```
User: "What did the speaker say about Python in video 3?"

Flow:
1. Embed the question
2. Search Qdrant for similar chunks
3. Retrieve top 5 most relevant chunks
4. Feed chunks + question to Gemini
5. Return precise answer with source reference
```

### Professional Use Cases
- Building a knowledge base from a YouTube course
- Competitive intelligence (summarize competitor video content)
- Research assistant for educational channels
- Automated meeting/webinar transcription and Q&A

---

## Module 10: Google Maps Lead Generation

**Workflow name:** `Google Maps Email Scraper Template`

### What It Does
Lead generation automation:
1. Takes a list of search queries (e.g., "dental clinic London")
2. Searches Google Maps for each query
3. Extracts website URLs from results
4. Visits each website and scrapes email addresses
5. Deduplicates and validates emails
6. Saves to Google Sheets

### Architecture Diagram
```
[Execute Workflow Trigger]
         │
         ▼
[Split in Batches: Loop over queries]
         │
         ▼
[HTTP Request: Google Maps API search]
         │
         ▼
[Code Node: Extract URLs from results]
         │
         ▼
[Filter: Remove irrelevant URLs]
         │
         ▼
[Remove Duplicates: URL dedup]
         │
         ▼
[Split in Batches: Loop over URLs]
         │
         ▼
[HTTP Request: Fetch webpage]
         │
         ▼
[Code Node: Regex email extraction]
         │
         ▼
[Aggregate: Collect all emails]
         │
         ▼
[Remove Duplicates: Email dedup]
         │
         ▼
[Filter: Remove invalid emails]
         │
         ▼
[Google Sheets: Save leads]
```

### The Email Extraction Code Node
```javascript
// Extract emails from HTML using regex
const html = $input.first().json.html || '';
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const emails = html.match(emailRegex) || [];

return emails.map(email => ({ json: { email } }));
```

### Rate Limiting Best Practices
- Add a **Wait node** (1-2 seconds) between requests to avoid being blocked
- Use the `splitInBatches` node with batch size of 5-10 to process in groups
- Add error handling with **try/catch** in Code nodes

---

## Recurring Task Automation Strategies

### Pattern 1: Daily Reports
```
[Schedule: Every day at 8 AM]
    → Fetch data from multiple sources
    → Aggregate and analyze with AI
    → Send summary to Slack/Email/Telegram
```

### Pattern 2: Monitor & Alert
```
[Schedule: Every 15 minutes]
    → Check a metric (API health, stock price, website uptime)
    → IF value out of range
    → Send alert to PagerDuty / Slack / SMS
```

### Pattern 3: Queue-Based Processing
```
[Webhook: Receive incoming request]
    → Add to processing queue (Airtable/Sheets)
[Schedule: Every 5 minutes]
    → Process next batch from queue
    → Update queue status
```

### Pattern 4: Event-Driven Pipeline
```
[Google Drive Trigger: New file]
    → Process the file immediately
    → No polling, near-real-time response
```

### Pattern 5: Human-in-the-Loop
```
[Automated step 1]
[Automated step 2]
[Wait node: pause until webhook received]
    ← Human reviews and approves via email link
[Automated step 3]
```

---

## Automating Without n8n

When you need automation without a dedicated tool, Python is the answer.

### Scheduling Without n8n

**Linux/Mac (cron):**
```bash
# Run every day at 9 AM
0 9 * * * /usr/bin/python3 /path/to/script.py

# Run every 30 minutes
*/30 * * * * /usr/bin/python3 /path/to/script.py
```

**Windows (Task Scheduler via PowerShell):**
```powershell
$action = New-ScheduledTaskAction -Execute 'python' -Argument 'C:\scripts\daily_report.py'
$trigger = New-ScheduledTaskTrigger -Daily -At 9:00AM
Register-ScheduledTask -TaskName "DailyReport" -Action $action -Trigger $trigger
```

**Python APScheduler (in-process scheduling):**
```python
from apscheduler.schedulers.blocking import BlockingScheduler

scheduler = BlockingScheduler()

@scheduler.scheduled_job('cron', hour=9, minute=0)
def daily_report():
    print("Running daily report...")
    # your code here

@scheduler.scheduled_job('interval', minutes=30)
def health_check():
    print("Checking health...")

scheduler.start()
```

### Webhooks Without n8n (Flask)
```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def handle_webhook():
    data = request.json
    # process data here
    print(f"Received: {data}")
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(port=5000)
```

### HTTP Requests Without n8n (httpx)
```python
import httpx
import asyncio

async def fetch_and_process():
    async with httpx.AsyncClient() as client:
        # Fetch data
        response = await client.get('https://api.example.com/data')
        data = response.json()

        # Post to Slack
        await client.post(
            'https://hooks.slack.com/your-webhook-url',
            json={"text": f"Data: {data}"}
        )

asyncio.run(fetch_and_process())
```

---

## Human–Computer Interaction Automation

When you need to automate interactions with software that has no API, use **desktop automation**.

### Tool 1: PyAutoGUI — Mouse & Keyboard Control
```python
import pyautogui
import time

# Move mouse to coordinates
pyautogui.moveTo(100, 200, duration=0.5)

# Click
pyautogui.click(100, 200)

# Type text
pyautogui.typewrite('Hello World', interval=0.05)

# Press keyboard shortcuts
pyautogui.hotkey('ctrl', 'c')  # Copy
pyautogui.hotkey('alt', 'tab') # Switch window

# Take screenshot
screenshot = pyautogui.screenshot()
screenshot.save('screen.png')

# Find element on screen by image
location = pyautogui.locateOnScreen('button.png')
if location:
    pyautogui.click(location)
```

### Tool 2: Selenium — Web Browser Automation
```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()
driver.get('https://example.com/login')

# Find elements and interact
email = driver.find_element(By.ID, 'email')
email.send_keys('user@example.com')

password = driver.find_element(By.ID, 'password')
password.send_keys('password123')

# Wait for element to appear
WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.ID, 'submit-btn'))
).click()

# Extract data
data = driver.find_element(By.CLASS_NAME, 'result').text
print(data)

driver.quit()
```

### Tool 3: Playwright — Modern Browser Automation (Faster & More Reliable)
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    page.goto('https://example.com')

    # Wait for specific element
    page.wait_for_selector('#content')

    # Screenshot
    page.screenshot(path='result.png')

    # Extract text
    text = page.inner_text('h1')

    # Fill form
    page.fill('#email', 'user@example.com')
    page.click('#submit')

    browser.close()
```

### Tool 4: Computer Vision for UI Automation (OpenCV + PyAutoGUI)
```python
import cv2
import numpy as np
import pyautogui

def find_and_click(template_path: str, confidence: float = 0.8):
    """Find a UI element by image and click it."""
    screenshot = pyautogui.screenshot()
    screenshot = cv2.cvtColor(np.array(screenshot), cv2.COLOR_RGB2BGR)
    template = cv2.imread(template_path)

    result = cv2.matchTemplate(screenshot, template, cv2.TM_CCOEFF_NORMED)
    _, max_val, _, max_loc = cv2.minMaxLoc(result)

    if max_val >= confidence:
        h, w = template.shape[:2]
        center = (max_loc[0] + w // 2, max_loc[1] + h // 2)
        pyautogui.click(center)
        return True
    return False

# Usage
find_and_click('save_button.png')
```

### Tool 5: AI-Powered Screen Interaction (GPT-4 Vision + PyAutoGUI)
```python
import openai
import pyautogui
import base64
from io import BytesIO

client = openai.OpenAI()

def ai_guided_action(task: str) -> str:
    """Use GPT-4 Vision to understand the screen and decide what to do."""
    # Capture screen
    screenshot = pyautogui.screenshot()
    buffer = BytesIO()
    screenshot.save(buffer, format='PNG')
    img_base64 = base64.b64encode(buffer.getvalue()).decode()

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/png;base64,{img_base64}"}
                },
                {
                    "type": "text",
                    "text": f"Task: {task}\nLook at this screenshot. What coordinates should I click to accomplish this task? Return JSON: {{x: number, y: number, action: string}}"
                }
            ]
        }]
    )
    return response.choices[0].message.content

# Usage
result = ai_guided_action("Click the Submit button")
# Parse result and execute action
```

### Building a Full RPA (Robotic Process Automation) Agent
```python
import pyautogui
import time
from openai import OpenAI

class RPAAgent:
    """AI-powered RPA agent that sees the screen and takes actions."""

    def __init__(self):
        self.client = OpenAI()
        self.actions_log = []

    def capture_screen(self) -> str:
        import base64
        from io import BytesIO
        img = pyautogui.screenshot()
        buf = BytesIO()
        img.save(buf, format='PNG')
        return base64.b64encode(buf.getvalue()).decode()

    def execute_action(self, action: dict):
        action_type = action.get('type')
        if action_type == 'click':
            pyautogui.click(action['x'], action['y'])
        elif action_type == 'type':
            pyautogui.typewrite(action['text'], interval=0.05)
        elif action_type == 'hotkey':
            pyautogui.hotkey(*action['keys'])
        elif action_type == 'wait':
            time.sleep(action.get('seconds', 1))
        self.actions_log.append(action)

    def run_task(self, task: str, max_steps: int = 20):
        for step in range(max_steps):
            screen = self.capture_screen()

            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[{
                    "role": "user",
                    "content": [
                        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{screen}"}},
                        {"type": "text", "text": f"""
Task: {task}
Steps taken so far: {len(self.actions_log)}

Analyze the screenshot. Either:
1. Return the next action as JSON: {{"type": "click", "x": 100, "y": 200}}
2. Return {{"type": "type", "text": "hello"}}
3. Return {{"type": "done", "message": "Task completed"}}
                        """}
                    ]
                }]
            )

            import json
            action_str = response.choices[0].message.content
            action = json.loads(action_str)

            if action.get('type') == 'done':
                print(f"Task completed: {action.get('message')}")
                break

            self.execute_action(action)
            time.sleep(0.5)  # Brief pause between actions
```

---

## Best Practices & Production Patterns

### 1. Error Handling
Always add error handling to production workflows:

```
[Your Main Node]
    ├── Success → [Continue]
    └── Error → [Error Handler]
                    │
                    ├── [Send Slack Alert: "Workflow failed"]
                    ├── [Log to Google Sheets]
                    └── [Retry after wait]
```

In n8n, enable **"Continue on Error"** on non-critical nodes and use the `Error Trigger` node to catch workflow-level failures.

### 2. Test Before Production
- Use **Manual Trigger** during development
- Use **Pin Data** to freeze test data at a node
- Switch to Schedule/Webhook trigger only when tested

### 3. Credential Security
- Never hardcode API keys in expressions
- Always use n8n Credentials (encrypted at rest)
- Use environment variables for self-hosted deployments

### 4. Workflow Organization
```
Naming convention: [Category] - [Action] - [Destination]
Examples:
  - "HR - Screen CV - Google Drive + Sheets"
  - "Marketing - Daily LinkedIn Post - LinkedIn"
  - "Finance - Weekly Report - Telegram"

Tag workflows:
  - production
  - development
  - deprecated
```

### 5. Monitoring
- Enable execution logs (keep last 1000 executions)
- Set up the `Error Trigger` workflow to notify on failures
- Use the n8n API to pull execution metrics

### 6. Version Control
Export workflow JSON files to a Git repository:
```bash
# Export workflow via API
curl -X GET https://your-n8n.com/api/v1/workflows/123 \
  -H "X-N8N-API-KEY: your_key" \
  > workflow_123.json

git add workflow_123.json
git commit -m "Update LinkedIn automation workflow"
```

---

## Quick Reference: Node Cheat Sheet

| Node | Use Case | Key Parameters |
|---|---|---|
| `Schedule Trigger` | Run on a timer | Cron expression |
| `Webhook` | Receive HTTP | Path, Method, Response |
| `HTTP Request` | Call any API | URL, Method, Headers, Body |
| `IF` | Branch based on condition | Condition, Value1, Operator |
| `Switch` | Multiple branches | Routing rules |
| `Set` | Create/rename fields | Field name, Value |
| `Code` | Custom JavaScript | JS code |
| `Merge` | Combine two branches | Mode: merge/combine/append |
| `Split In Batches` | Loop processing | Batch size |
| `Wait` | Pause workflow | Wait time |
| `AI Agent` | LLM with tools | System prompt, Tools |
| `LLM Chain` | Simple LLM call | Prompt, Model |
| `Text Classifier` | Categorize text | Categories |
| `Information Extractor` | Pull structured data | Schema |
| `Vector Store` | Semantic search | Collection, Embeddings |
| `Memory Buffer Window` | Short-term chat memory | Window size |

### Common Expressions

```javascript
// Get a field from current item
{{ $json.email }}

// Get output from a specific node
{{ $node["NodeName"].json.fieldName }}

// Current date/time
{{ $now.toISO() }}

// Format date
{{ $now.format('YYYY-MM-DD') }}

// Access item index in batch
{{ $itemIndex }}

// Total item count
{{ $items().length }}

// Conditional expression
{{ $json.status === 'active' ? 'Yes' : 'No' }}
```

---

## Conclusion

You now have a complete professional foundation in n8n automation. The 10 modules above represent the most impactful categories of automation:

- **AI Agents** — Build intelligent assistants with memory
- **Content Publishing** — Automate social media at scale
- **Communication Bots** — WhatsApp, Telegram, Discord
- **HR & Recruiting** — End-to-end hiring pipelines
- **Finance Tracking** — Invoice processing and reporting
- **Email Intelligence** — Smart inbox management
- **Lead Generation** — Scalable data collection
- **Analytics** — Automated reporting

Combined with the Python automation techniques and human-computer interaction tools, you can automate virtually any workflow — with or without n8n.

---

*Course Version: 1.0 | Based on 2,053 real-world n8n workflow templates | March 2026*
