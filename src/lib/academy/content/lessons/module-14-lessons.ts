/**
 * Module 14: CV / Resume AI Screening & Tracker
 * Duration: 25 minutes | 10 Lessons
 */

import type { Lesson } from '../../types';

export const module14Lessons: Lesson[] = [
  // ==========================================================================
  // LESSON 14.1: Introduction to AI-Powered Resume Screening
  // ==========================================================================
  {
    id: 'lesson-14-1',
    moduleId: 'module-14',
    title: 'Introduction to AI-Powered Resume Screening',
    estimatedTime: 2,
    order: 1,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Hiring is one of the most time-intensive processes in any organization. A single job posting can attract hundreds of resumes, and manually reviewing each one takes 6-8 minutes on average. What if you could have an AI agent screen every resume the moment it arrives — scoring candidates, organizing files, and sending notifications automatically?',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Problem with Manual Resume Screening',
      },
      {
        type: 'text',
        value: 'HR teams face a crushing volume problem. Studies show that the average corporate job posting receives 250+ applications. Recruiters spend roughly 23 hours screening resumes for a single hire. This leads to inconsistent evaluations, unconscious bias from fatigue, and qualified candidates slipping through the cracks simply because their resume was reviewed at the end of a long day.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'The Cost of Manual Screening',
        text: 'At an average recruiter salary, screening 250 resumes at 6 minutes each costs approximately $500-800 per job posting in labor alone. With AI automation, that drops to near zero — the AI processes each resume in seconds, 24/7, with consistent evaluation criteria.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What We\'re Building',
      },
      {
        type: 'text',
        value: 'In this module, you\'ll build a fully automated HR screening pipeline using n8n. The system watches a Google Drive folder for new CVs, reads and analyzes each one using AI, scores the candidate against the job description, and takes action based on the score:',
      },
      {
        type: 'list',
        items: [
          'Google Drive Trigger — Detects when a new CV is uploaded to the intake folder',
          'Download & Extract — Downloads the resume file and extracts text from PDF or DOCX',
          'Job Description Fetch — Reads the current job description from a Google Doc',
          'AI Screening Agent — Scores the candidate 1-10 and classifies as Accept, KIV, or Reject',
          'Folder Organization — Moves the CV to the appropriate folder (Accept/KIV/Reject)',
          'Email Notification — Sends a detailed screening report to the hiring manager',
        ],
        ordered: true,
      },
      {
        type: 'code',
        language: 'text',
        code: `[Google Drive Trigger: New file in "Resumes/Inbox"]
         │
         ▼
[Google Drive: Download Resume File]
         │
         ▼
[Extract Text from PDF/DOCX]
         │
         ▼
[Google Docs: Get Job Description]
         │
         ▼
[AI Agent: Score & Classify Candidate]
         │
    ┌────┼────┐
    │    │    │
    ▼    ▼    ▼
 Accept  KIV  Reject
 (8-10) (5-7) (1-4)
    │    │    │
    ▼    ▼    ▼
[Move CV to appropriate folder]
         │
         ▼
[Gmail: Send screening report]`,
        caption: 'The complete CV screening automation architecture',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Consistent & Fair Evaluation',
        text: 'Unlike human reviewers who may become fatigued or biased, the AI agent evaluates every resume against the same criteria with the same attention. The job description serves as the single source of truth, and the scoring rubric is applied uniformly to all candidates.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 14.2: Google Drive Trigger & File Detection
  // ==========================================================================
  {
    id: 'lesson-14-2',
    moduleId: 'module-14',
    title: 'Google Drive Trigger & File Detection',
    estimatedTime: 2,
    order: 2,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'The first step in our screening pipeline is detecting when a new resume arrives. Google Drive Trigger watches a specific folder and fires the workflow whenever a new file is uploaded — whether it\'s dropped in manually, shared via a link, or uploaded through a form.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Setting Up the Google Drive Folder Structure',
      },
      {
        type: 'text',
        value: 'Before configuring the trigger, create a well-organized folder structure in Google Drive. This structure is critical because the AI will move CVs between folders based on screening results:',
      },
      {
        type: 'code',
        language: 'text',
        code: `📁 HR Screening/
├── 📁 Inbox/          ← New CVs land here (trigger watches this)
├── 📁 Accept/         ← Score 8-10: Strong candidates
├── 📁 KIV/            ← Score 5-7: Keep In View for later
├── 📁 Reject/         ← Score 1-4: Not a match
└── 📄 Job Description  ← Google Doc with current requirements`,
        caption: 'Google Drive folder structure for the screening pipeline',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Configuring the Google Drive Trigger',
      },
      {
        type: 'text',
        value: 'The Google Drive Trigger node in n8n polls for changes at a configurable interval. Here\'s how to set it up:',
      },
      {
        type: 'list',
        items: [
          'Add a "Google Drive Trigger" node to your workflow canvas',
          'Set the Trigger Event to "File Created"',
          'Select the "Inbox" folder as the Watch Folder',
          'Set the Poll Time to every 1-5 minutes depending on your urgency needs',
          'Enable "Include File Content" if available, otherwise use a separate Download node',
        ],
        ordered: true,
      },
      {
        type: 'code',
        language: 'text',
        code: `Google Drive Trigger Configuration:
─────────────────────────────────
Event:         File Created
Folder:        HR Screening/Inbox
Poll Times:    Every 2 minutes
File Types:    All (PDF, DOCX, DOC)
─────────────────────────────────

Output Data:
{
  "id": "1a2b3c4d...",
  "name": "John_Doe_Resume.pdf",
  "mimeType": "application/pdf",
  "createdTime": "2026-03-21T10:30:00Z",
  "size": "245760"
}`,
        caption: 'The trigger outputs file metadata — you still need to download the actual file content',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Polling vs. Webhooks',
        text: 'The Google Drive Trigger uses polling, not real-time webhooks. This means there\'s a small delay (up to your poll interval) between when a file is uploaded and when the workflow runs. For most HR use cases, a 2-5 minute delay is perfectly acceptable.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Google Drive Authentication',
      },
      {
        type: 'text',
        value: 'To connect n8n to Google Drive, you\'ll need to set up OAuth2 credentials:',
      },
      {
        type: 'list',
        items: [
          'Go to the Google Cloud Console and create a new project',
          'Enable the Google Drive API and Google Docs API',
          'Create OAuth2 credentials (Web Application type)',
          'Add the n8n callback URL as an authorized redirect URI',
          'In n8n, create Google Drive credentials and complete the OAuth flow',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Service Account Alternative',
        text: 'For production deployments, consider using a Google Service Account instead of OAuth2. Service accounts don\'t require user interaction for authentication and never expire. Share the target Drive folder with the service account email address.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 14.3: Extracting Text from PDF and DOCX Files
  // ==========================================================================
  {
    id: 'lesson-14-3',
    moduleId: 'module-14',
    title: 'Extracting Text from PDF and DOCX Files',
    estimatedTime: 3,
    order: 3,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'Once the resume file is downloaded, you need to extract its text content so the AI can read and analyze it. Resumes typically come in two formats: PDF and DOCX. Each requires a different extraction approach in n8n.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Why Text Extraction Matters',
      },
      {
        type: 'text',
        value: 'The AI model can\'t directly read binary PDF or DOCX files. It needs plain text as input. The quality of text extraction directly impacts the AI\'s ability to accurately score the candidate — poor extraction means missed qualifications, garbled text, and unreliable scores.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Handling Multiple File Formats',
      },
      {
        type: 'text',
        value: 'Since resumes come in different formats, you need a branching strategy. Use a Switch node to route each file to the appropriate extraction method:',
      },
      {
        type: 'code',
        language: 'text',
        code: `[Google Drive: Download File]
         │
         ▼
   [Switch Node: Check mimeType]
   ┌─────────┼─────────┐
   │         │         │
   ▼         ▼         ▼
  PDF      DOCX      Other
   │         │         │
   ▼         ▼         ▼
[Extract  [Extract  [Error:
 PDF       DOCX     Unsupported
 Text]     Text]    Format]
   │         │
   └────┬────┘
        ▼
  [Merged Text Output]`,
        caption: 'Route files to the correct extraction method based on MIME type',
      },
      {
        type: 'heading',
        level: 2,
        value: 'PDF Text Extraction',
      },
      {
        type: 'text',
        value: 'For PDF files, n8n provides the "Extract from File" node which handles PDF text extraction natively. Configure it as follows:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Extract from File Node (PDF):
─────────────────────────────────
Operation:     Extract From PDF
Input Binary:  data (from Google Drive download)
Output Field:  extractedText
─────────────────────────────────

The node extracts all text content from every page
of the PDF and outputs it as a single string.`,
        caption: 'n8n\'s built-in PDF extraction node configuration',
      },
      {
        type: 'heading',
        level: 2,
        value: 'DOCX Text Extraction',
      },
      {
        type: 'text',
        value: 'For DOCX files, the process is similar. The Extract from File node also supports Word documents:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Extract from File Node (DOCX):
─────────────────────────────────
Operation:     Extract From DOCX
Input Binary:  data (from Google Drive download)
Output Field:  extractedText
─────────────────────────────────

DOCX extraction preserves paragraph structure,
headings, and bullet points as plain text.`,
        caption: 'DOCX extraction preserves document structure better than PDF extraction',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Scanned PDFs Are Different',
        text: 'If a resume is a scanned image saved as PDF (no selectable text), standard PDF extraction will return empty or garbled output. For these cases, you\'d need OCR (Optical Character Recognition) via a service like Google Vision API or Textract. Most modern resumes are text-based PDFs, but plan for edge cases.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Testing Extraction Quality',
        text: 'After extracting text, add a temporary "Set" node to inspect the output. Look for complete content — all sections of the resume should be present. Common issues include missing headers, garbled special characters, and lost formatting that can confuse the AI.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 14.4: Dynamic Job Description Management
  // ==========================================================================
  {
    id: 'lesson-14-4',
    moduleId: 'module-14',
    title: 'Dynamic Job Description Management',
    estimatedTime: 2,
    order: 4,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'The AI needs context to evaluate a resume — it must know what the job requires. Instead of hardcoding job requirements into the workflow, we store the job description in a Google Doc that can be updated at any time without touching the automation.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Why Use a Google Doc for Job Descriptions?',
      },
      {
        type: 'text',
        value: 'Storing the job description externally provides several critical advantages over embedding it in the workflow:',
      },
      {
        type: 'list',
        items: [
          'Non-technical HR staff can update requirements without accessing n8n',
          'Changes take effect immediately — no workflow redeployment needed',
          'Version history in Google Docs tracks all changes to requirements',
          'Multiple stakeholders can collaborate on the job description',
          'The same workflow can serve different positions by pointing to different docs',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'Structuring the Job Description Document',
      },
      {
        type: 'text',
        value: 'The AI performs best when the job description is well-structured. Use a consistent format that the AI can parse reliably:',
      },
      {
        type: 'code',
        language: 'text',
        code: `# Senior Full-Stack Developer

## Required Qualifications
- 5+ years experience with React and Node.js
- Strong understanding of TypeScript
- Experience with cloud services (AWS or GCP)
- Database design (PostgreSQL, MongoDB)
- REST API design and implementation

## Preferred Qualifications
- Experience with Next.js or similar frameworks
- Familiarity with CI/CD pipelines
- Open source contributions
- Team leadership experience

## Responsibilities
- Lead development of customer-facing web application
- Mentor junior developers
- Participate in architecture decisions
- Code review and quality assurance

## Scoring Guidelines
- ACCEPT (8-10): Meets all required + 2+ preferred
- KIV (5-7): Meets most required qualifications
- REJECT (1-4): Missing critical required qualifications`,
        caption: 'A well-structured Google Doc job description with explicit scoring guidelines',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Fetching the Job Description in n8n',
      },
      {
        type: 'text',
        value: 'Use the Google Docs node to read the job description content at runtime:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Google Docs Node Configuration:
─────────────────────────────────
Operation:    Get Document Content
Document ID:  1a2b3c... (from the Google Doc URL)
Output:       Plain text content of the document
─────────────────────────────────

The Document ID is the long string in the Google Doc URL:
docs.google.com/document/d/{DOCUMENT_ID}/edit`,
        caption: 'The Google Docs node reads the full document content as plain text',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Multi-Position Support',
        text: 'To screen for multiple positions simultaneously, create a separate Google Doc for each job description and store the Document IDs in a spreadsheet. Use the filename convention (e.g., "John_Doe_SeniorDev.pdf") or a separate intake form to determine which job description to load.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Caching for Performance',
        text: 'If you\'re processing many resumes for the same position, consider caching the job description. Use a Code node to store it in a workflow static variable so you only fetch the Google Doc once per batch rather than once per resume.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 14.5: The AI Screening Agent & Decision Logic
  // ==========================================================================
  {
    id: 'lesson-14-5',
    moduleId: 'module-14',
    title: 'The AI Screening Agent & Decision Logic',
    estimatedTime: 3,
    order: 5,
    xpReward: 30,
    content: [
      {
        type: 'text',
        value: 'This is the heart of the automation — the AI Agent that reads both the resume and the job description, evaluates the candidate\'s fit, and produces a structured screening decision. In n8n, we use the AI Agent node with attached tools for taking actions like sending emails and moving files.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The AI Agent Architecture',
      },
      {
        type: 'text',
        value: 'Unlike a simple LLM call, an AI Agent in n8n can use tools — it can take actions based on its reasoning. Our screening agent has access to three tools: Gmail (notifications), Google Drive (file organization), and a scoring output tool.',
      },
      {
        type: 'code',
        language: 'text',
        code: `┌─────────────────────────────────────┐
│          AI Agent Node              │
│                                     │
│  System Prompt: HR Screening Expert │
│  Input: Resume Text + Job Desc      │
│                                     │
│  Tools:                             │
│  ├── Gmail: Send notification       │
│  ├── GDrive: Move file to folder    │
│  └── Output: Structured score       │
│                                     │
│  Output: Score, Classification,     │
│          Summary, Recommendation    │
└─────────────────────────────────────┘`,
        caption: 'The AI Agent node with attached tools for autonomous screening actions',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The System Prompt',
      },
      {
        type: 'text',
        value: 'The system prompt is the most critical component. It defines how the AI evaluates candidates. Here\'s the carefully crafted prompt:',
      },
      {
        type: 'code',
        language: 'text',
        code: `You are an expert HR screening assistant. Your task is to
evaluate a candidate's resume against the provided job
description.

EVALUATION PROCESS:
1. Read the job description carefully
2. Analyze the resume for relevant qualifications
3. Compare the candidate's experience to requirements
4. Rate the candidate on a scale of 1-10

SCORING RUBRIC:
- 8-10 (ACCEPT): Meets all required qualifications and
  demonstrates strong relevant experience. Move CV to
  Accept folder and send enthusiastic notification.
- 5-7 (KIV - Keep In View): Meets some requirements
  but has gaps. Promising but not an immediate fit.
  Move CV to KIV folder and send review notification.
- 1-4 (REJECT): Does not meet critical requirements.
  Move CV to Reject folder and send polite notification.

OUTPUT FORMAT:
- Score: [1-10]
- Classification: [ACCEPT/KIV/REJECT]
- Key Strengths: [bullet points]
- Concerns: [bullet points]
- Summary: [2-3 sentence evaluation]
- Recommendation: [specific next steps]

Be fair, objective, and focus only on job-relevant
qualifications. Do not discriminate based on name,
age, gender, or other protected characteristics.`,
        caption: 'The AI Agent system prompt — defines evaluation criteria and output format',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Configuring the Agent Node',
      },
      {
        type: 'list',
        items: [
          'Add an "AI Agent" node and select "Tools Agent" as the agent type',
          'Set the system prompt as shown above',
          'Connect the user message with both resume text and job description using an expression',
          'Attach Gmail, Google Drive, and Structured Output tools',
          'Set the model to GPT-4o or Claude for best reasoning quality',
          'Set temperature to 0.3 for consistent, focused evaluations',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Model Choice Matters',
        text: 'For resume screening, use the most capable model you can afford (GPT-4o, Claude 3.5 Sonnet). Cheaper models like GPT-3.5 may miss subtle qualifications or produce inconsistent scores. The cost per resume is still only $0.01-0.05 — far less than human screening time.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Ethical Considerations',
        text: 'AI screening should augment human decision-making, not replace it entirely. Always have a human review Accept candidates before scheduling interviews. The AI handles volume; humans handle nuance and final judgment.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 14.6: Folder Organization (Accept/KIV/Reject)
  // ==========================================================================
  {
    id: 'lesson-14-6',
    moduleId: 'module-14',
    title: 'Folder Organization (Accept/KIV/Reject)',
    estimatedTime: 2,
    order: 6,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'After the AI agent scores a candidate, the resume file needs to be physically moved from the Inbox to the appropriate folder. This creates a visual, organized filing system that the entire HR team can browse without touching the automation.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Three-Folder Classification System',
      },
      {
        type: 'text',
        value: 'The classification follows a widely-used HR triage model. Each category triggers a different action and represents a different level of candidate fit:',
      },
      {
        type: 'list',
        items: [
          'ACCEPT (Score 8-10) — Strong candidates who meet or exceed all requirements. These CVs are moved to the Accept folder for immediate review and interview scheduling.',
          'KIV / Keep In View (Score 5-7) — Promising candidates who may not be a perfect fit right now but could be valuable for future openings or with additional experience. CVs are moved to the KIV folder for periodic review.',
          'REJECT (Score 1-4) — Candidates who clearly don\'t meet the core requirements. CVs are moved to the Reject folder. A polite notification is still sent to maintain candidate experience.',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'Implementing the File Move in n8n',
      },
      {
        type: 'text',
        value: 'The Google Drive "Move File" operation relocates the resume to the correct folder. The AI Agent handles this via its Google Drive tool, but you can also implement it with a Switch node for more control:',
      },
      {
        type: 'code',
        language: 'text',
        code: `[AI Agent Output: classification = "ACCEPT" | "KIV" | "REJECT"]
         │
         ▼
   [Switch Node: Check classification]
   ┌─────────┼──────────┐
   │         │          │
   ▼         ▼          ▼
ACCEPT      KIV       REJECT
   │         │          │
   ▼         ▼          ▼
[GDrive:  [GDrive:   [GDrive:
 Move to   Move to    Move to
 Accept/]  KIV/]      Reject/]

Google Drive Move File Configuration:
─────────────────────────────────
Operation:   Move File
File ID:     {{ $json.fileId }}
Target:      {{ $json.targetFolderId }}
─────────────────────────────────`,
        caption: 'Route the CV to the correct folder based on the AI classification',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Folder ID Mapping',
      },
      {
        type: 'text',
        value: 'You\'ll need the Google Drive folder IDs for each destination. Find these by navigating to each folder in Google Drive — the folder ID is the last part of the URL:',
      },
      {
        type: 'code',
        language: 'text',
        code: `// Folder ID mapping (store in workflow variables)
const folders = {
  ACCEPT: "1ABC...xyz",  // drive.google.com/drive/folders/1ABC...xyz
  KIV:    "2DEF...uvw",  // drive.google.com/drive/folders/2DEF...uvw
  REJECT: "3GHI...rst",  // drive.google.com/drive/folders/3GHI...rst
};`,
        caption: 'Store folder IDs as workflow static variables for easy configuration',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'File Renaming Convention',
        text: 'Consider renaming files when moving them to include the score. For example: "John_Doe_Resume.pdf" becomes "8.5_ACCEPT_John_Doe_Resume.pdf". This makes it easy to sort and prioritize within each folder without opening the files.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 14.7: Email Notification System
  // ==========================================================================
  {
    id: 'lesson-14-7',
    moduleId: 'module-14',
    title: 'Email Notification System',
    estimatedTime: 2,
    order: 7,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'The final step in the screening pipeline is notifying the hiring manager about each screened candidate. The email includes the AI\'s evaluation, score, key strengths and concerns, and a direct link to the resume in Google Drive.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Crafting the Notification Email',
      },
      {
        type: 'text',
        value: 'The notification email should be concise but informative. Different classifications warrant different email templates and urgency levels:',
      },
      {
        type: 'code',
        language: 'text',
        code: `ACCEPT Notification Template:
═══════════════════════════════════════
Subject: ✅ Strong Candidate: {{ candidateName }} ({{ score }}/10)

Hi {{ hiringManager }},

A strong candidate has been identified for {{ position }}.

📊 Score: {{ score }}/10 — ACCEPT
📄 Resume: {{ driveLink }}

Key Strengths:
{{ strengths }}

Summary:
{{ summary }}

Recommended Next Steps:
{{ recommendation }}

This candidate's CV has been moved to the Accept folder.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KIV Notification Template:
═══════════════════════════════════════
Subject: 🟡 Review Needed: {{ candidateName }} ({{ score }}/10)

REJECT Notification Template:
═══════════════════════════════════════
Subject: ❌ Not a Match: {{ candidateName }} ({{ score }}/10)`,
        caption: 'Different email templates for each classification level',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Configuring Gmail in n8n',
      },
      {
        type: 'text',
        value: 'The Gmail node sends the notification email. Since the AI Agent has Gmail as a tool, it can compose and send emails autonomously. However, for more control over formatting, you can also send emails as a separate workflow step:',
      },
      {
        type: 'list',
        items: [
          'Use the Gmail node with "Send Email" operation',
          'Set the recipient to the hiring manager\'s email address',
          'Use HTML format for rich formatting with colors and tables',
          'Include a direct link to the resume in Google Drive',
          'Set appropriate priority: high for Accept, normal for KIV, low for Reject',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Batch Notifications',
        text: 'If you receive many resumes at once, consider batching notifications. Instead of one email per resume, collect all screenings over a time period and send a single digest email. Use n8n\'s "Wait" and "Aggregate" nodes to implement this pattern.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Notification Channels Beyond Email',
      },
      {
        type: 'text',
        value: 'Email is just one notification channel. Depending on your team\'s workflow, consider adding:',
      },
      {
        type: 'list',
        items: [
          'Slack notification to an #hr-screening channel for real-time alerts',
          'Microsoft Teams message to the hiring manager',
          'Notion database entry for a visual screening dashboard',
          'Google Sheets row for tracking and analytics',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Email Sending Limits',
        text: 'Gmail has a daily sending limit of 500 emails for personal accounts and 2,000 for Google Workspace. If you\'re screening high volumes, use a dedicated email service like SendGrid or set up throttling in your workflow.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 14.8: Candidate Scoring & Rating Framework
  // ==========================================================================
  {
    id: 'lesson-14-8',
    moduleId: 'module-14',
    title: 'Candidate Scoring & Rating Framework',
    estimatedTime: 3,
    order: 8,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'A reliable scoring framework is what separates a useful screening tool from a random number generator. In this lesson, we\'ll dive deeper into designing a scoring rubric that produces consistent, defensible, and useful candidate ratings.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The 1-10 Scoring Rubric',
      },
      {
        type: 'text',
        value: 'Each score range maps to specific, measurable criteria. The more explicit your rubric, the more consistent the AI\'s evaluations will be:',
      },
      {
        type: 'code',
        language: 'text',
        code: `SCORING RUBRIC:
═══════════════════════════════════════════════════════
Score │ Label    │ Criteria
──────┼──────────┼─────────────────────────────────────
 9-10 │ ACCEPT★  │ Exceeds all required qualifications
      │          │ + 3+ preferred + leadership signals
──────┼──────────┼─────────────────────────────────────
  8   │ ACCEPT   │ Meets all required qualifications
      │          │ + 2+ preferred qualifications
──────┼──────────┼─────────────────────────────────────
  7   │ KIV+     │ Meets most required qualifications
      │          │ + 1-2 preferred + growth potential
──────┼──────────┼─────────────────────────────────────
 5-6  │ KIV      │ Meets some required qualifications
      │          │ + relevant adjacent experience
──────┼──────────┼─────────────────────────────────────
 3-4  │ REJECT   │ Missing multiple critical requirements
      │          │ + limited relevant experience
──────┼──────────┼─────────────────────────────────────
 1-2  │ REJECT★  │ No relevant qualifications
      │          │ + wrong field entirely
═══════════════════════════════════════════════════════`,
        caption: 'Detailed scoring rubric with specific criteria for each range',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Multi-Dimension Scoring',
      },
      {
        type: 'text',
        value: 'For more nuanced evaluation, break the overall score into dimensions. Each dimension is scored independently and the final score is a weighted average:',
      },
      {
        type: 'list',
        items: [
          'Technical Skills (40%) — Direct match with required technical qualifications',
          'Experience Level (25%) — Years and depth of relevant experience',
          'Education (15%) — Degree relevance and academic achievements',
          'Soft Skills/Culture (10%) — Leadership, communication, collaboration indicators',
          'Bonus Factors (10%) — Certifications, open source, publications, unique strengths',
        ],
      },
      {
        type: 'code',
        language: 'text',
        code: `Enhanced AI Prompt Addition:

Evaluate the candidate across these dimensions:
1. Technical Skills (weight: 40%): Rate 1-10
2. Experience Level (weight: 25%): Rate 1-10
3. Education (weight: 15%): Rate 1-10
4. Soft Skills (weight: 10%): Rate 1-10
5. Bonus Factors (weight: 10%): Rate 1-10

Final Score = (Tech × 0.4) + (Exp × 0.25) +
              (Edu × 0.15) + (Soft × 0.1) +
              (Bonus × 0.1)`,
        caption: 'Multi-dimension scoring prompt for more nuanced evaluations',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Calibration is Key',
        text: 'Run the AI on 10-20 previously-screened resumes and compare its scores to human evaluators. Adjust the rubric and prompt until the AI\'s scores consistently align with human judgment. This calibration step is essential before going live.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Handling Edge Cases',
      },
      {
        type: 'list',
        items: [
          'Overqualified candidates — Should score high but flag that the role may be too junior',
          'Career changers — May lack direct experience but have transferable skills; adjust KIV threshold',
          'Incomplete resumes — If critical sections are missing, score lower and note the gaps',
          'Multiple positions applied — Cross-reference with other active job descriptions',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Avoid Bias in Scoring',
        text: 'Regularly audit AI screening decisions for patterns of bias. Check if scores correlate with names, schools, or other non-qualification factors. The rubric should focus exclusively on skills, experience, and qualifications relevant to the job.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 14.9: Building a Candidate Tracking Database
  // ==========================================================================
  {
    id: 'lesson-14-9',
    moduleId: 'module-14',
    title: 'Building a Candidate Tracking Database',
    estimatedTime: 3,
    order: 9,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'Moving files into folders is good for organization, but for a complete screening pipeline, you need a structured database that tracks every candidate\'s status, score, and progression through the hiring funnel. This is your lightweight Applicant Tracking System (ATS).',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Notion as a Candidate Database',
      },
      {
        type: 'text',
        value: 'Notion provides an excellent lightweight ATS. Create a database with the following properties to track every screened candidate:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Candidate Tracking Database Schema:
═══════════════════════════════════════════════════
Property        │ Type          │ Purpose
────────────────┼───────────────┼──────────────────
Candidate Name  │ Title         │ Full name
Position        │ Select        │ Job applied for
Score           │ Number        │ AI score (1-10)
Classification  │ Select        │ Accept/KIV/Reject
Key Strengths   │ Rich Text     │ AI-identified pros
Concerns        │ Rich Text     │ AI-identified gaps
AI Summary      │ Rich Text     │ Full evaluation
Resume Link     │ URL           │ Google Drive link
Screened Date   │ Date          │ When AI processed
Status          │ Select        │ Screened/Interviewed
                │               │ /Offered/Hired/Passed
Recruiter Notes │ Rich Text     │ Human follow-up notes
Interview Date  │ Date          │ Scheduled interview
═══════════════════════════════════════════════════`,
        caption: 'Notion database schema for candidate tracking',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Saving Screening Results to Notion',
      },
      {
        type: 'text',
        value: 'After the AI Agent completes its evaluation, add a Notion "Create Database Item" node to save the structured results:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Notion Create Database Item:
─────────────────────────────────
Database:  Candidate Tracking
Properties:
  Title:          {{ $json.candidateName }}
  Position:       {{ $json.position }}
  Score:          {{ $json.score }}
  Classification: {{ $json.classification }}
  Key Strengths:  {{ $json.strengths }}
  Concerns:       {{ $json.concerns }}
  AI Summary:     {{ $json.summary }}
  Resume Link:    {{ $json.driveLink }}
  Screened Date:  {{ $now }}
  Status:         "Screened"
─────────────────────────────────`,
        caption: 'Automatically populate the Notion database with AI screening results',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Google Sheets Alternative',
      },
      {
        type: 'text',
        value: 'If your team prefers Google Sheets, you can use the Google Sheets node instead. This is simpler to set up and easier for teams already using the Google ecosystem:',
      },
      {
        type: 'list',
        items: [
          'Create a Google Sheet with column headers matching the database schema',
          'Use the "Append Row" operation to add each screening result',
          'Enable filters and conditional formatting for visual status tracking',
          'Use Google Sheets formulas for statistics (average scores, acceptance rate)',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Dashboard Views',
        text: 'In Notion, create multiple database views: a Board view grouped by Classification for quick triage, a Table view sorted by Score for ranking, and a Calendar view by Interview Date for scheduling. Each view gives your HR team a different lens into the candidate pool.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Data Retention & Privacy',
        text: 'Candidate data is subject to privacy regulations like GDPR. Implement a retention policy — automatically archive or delete candidate records after a defined period (typically 6-12 months). Add a "Retention Date" property and a separate cleanup workflow.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 14.10: Scaling with Webhooks & ATS Integration
  // ==========================================================================
  {
    id: 'lesson-14-10',
    moduleId: 'module-14',
    title: 'Scaling with Webhooks & ATS Integration',
    estimatedTime: 3,
    order: 10,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'The Google Drive trigger approach works well for small to medium volumes. But as your hiring scales, you\'ll want a more robust intake system — webhooks for real-time processing, integration with professional ATS platforms, and automated interview scheduling.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Webhook-Based Intake Form',
      },
      {
        type: 'text',
        value: 'Replace the Google Drive trigger with a webhook that accepts resume submissions from a web form. This gives you real-time processing (no polling delay) and the ability to collect additional candidate information:',
      },
      {
        type: 'code',
        language: 'text',
        code: `[Webhook: POST /api/apply]
         │
         ▼
   Receives:
   {
     "name": "Jane Smith",
     "email": "jane@example.com",
     "position": "Senior Developer",
     "resume": <binary file>,
     "coverLetter": "I am excited...",
     "linkedinUrl": "linkedin.com/in/janesmith"
   }
         │
         ▼
[Same screening pipeline as before]`,
        caption: 'Webhook intake replaces Google Drive trigger for real-time processing',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Integrating with Professional ATS Platforms',
      },
      {
        type: 'text',
        value: 'For organizations using professional Applicant Tracking Systems, n8n can integrate as an AI screening layer. Common integration patterns include:',
      },
      {
        type: 'list',
        items: [
          'Greenhouse — Use the Greenhouse API to pull new applications and push screening scores',
          'Lever — Webhook notifications when candidates apply, API calls to add evaluation notes',
          'Workday — REST API integration for enterprise-grade HR workflows',
          'BambooHR — Pull applicant data and push screening results via API',
          'Custom ATS — Use HTTP Request nodes with any REST API',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'Automated Interview Scheduling',
      },
      {
        type: 'text',
        value: 'For accepted candidates, automate the next step — scheduling a screening call. Integrate with Calendly to let candidates self-schedule:',
      },
      {
        type: 'code',
        language: 'text',
        code: `[AI Agent: Classification = ACCEPT]
         │
         ▼
[Gmail: Send acceptance email with Calendly link]
         │
   "Congratulations! Based on our initial review,
    we'd like to schedule a call.

    📅 Book a time: {{ calendlyLink }}"
         │
         ▼
[Calendly Webhook: Meeting booked]
         │
         ▼
[Notion: Update candidate status to "Interview Scheduled"]
[Google Calendar: Sync interview details]`,
        caption: 'Automated interview scheduling for accepted candidates',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Scaling Architecture',
      },
      {
        type: 'list',
        items: [
          'Queue system — For high volumes, use a message queue (Redis, RabbitMQ) between intake and processing to handle bursts',
          'Parallel processing — Configure n8n to process multiple resumes simultaneously',
          'Rate limiting — Respect API limits for Google Drive, Gmail, and AI providers',
          'Error recovery — Implement dead letter queues for failed screenings with manual retry',
          'Analytics — Track acceptance rates, processing times, and AI accuracy over time',
        ],
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Congratulations!',
        text: 'You\'ve built a complete AI-powered resume screening pipeline — from file detection through AI evaluation to organized output and notifications. This system can process hundreds of resumes with consistent quality, freeing your HR team to focus on what they do best: connecting with candidates.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What\'s Next?',
      },
      {
        type: 'list',
        items: [
          'Add a candidate feedback loop — Track which AI-accepted candidates actually perform well after hiring to improve the scoring model',
          'Build a talent pool — Automatically tag and store KIV candidates for future positions',
          'Implement diversity analytics — Monitor screening outcomes for fairness and inclusion',
          'Create a hiring manager dashboard — Real-time Notion or Sheets dashboard with pipeline metrics',
        ],
      },
    ],
  },
];
