/**
 * Module 16: HR Automation Pipeline with AI
 * Duration: 25 minutes | 10 Lessons
 */

import type { Lesson } from '../../types';

export const module16Lessons: Lesson[] = [
  // ==========================================================================
  // LESSON 16.1: Introduction to HR Pipeline Automation
  // ==========================================================================
  {
    id: 'lesson-16-1',
    moduleId: 'module-16',
    title: 'Introduction to HR Pipeline Automation',
    estimatedTime: 2,
    order: 1,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Hiring involves a long chain of repetitive tasks: collecting applications, reading CVs, extracting candidate information, evaluating qualifications, recording data, and storing documents. Each step requires time and attention — and each handoff between steps introduces delays and errors. In this module, you\'ll build an end-to-end pipeline that automates the entire flow.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The End-to-End Hiring Pipeline',
      },
      {
        type: 'text',
        value: 'Unlike the simpler screening workflow in Module 14, this pipeline covers the full candidate journey from initial application to structured evaluation. It uses multiple specialized AI nodes — information extractors, summarization chains, and expert evaluation agents — each handling a different part of the process.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Module 14 vs Module 16',
        text: 'Module 14 focused on screening CVs from a Google Drive folder with a single AI agent. This module starts earlier (web form intake) and goes deeper — using LangChain-based extraction and evaluation chains for more sophisticated, multi-stage analysis.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What We\'re Building',
      },
      {
        type: 'text',
        value: 'The pipeline has 7 major stages, each handled by a dedicated n8n node or chain:',
      },
      {
        type: 'list',
        items: [
          'Form Trigger — Candidate fills out an n8n-hosted application form with personal details and CV upload',
          'CV Text Extraction — Extract raw text from the uploaded PDF or DOCX file',
          'Information Extraction (Personal) — AI extracts structured personal data: name, email, phone, location',
          'Information Extraction (Qualifications) — AI extracts skills, experience, education, certifications',
          'Data Merge & Summarization — Combine extracted data and generate a concise CV summary',
          'HR Expert Evaluation — An AI "HR expert" evaluates fit score, strengths, concerns, and interview questions',
          'Data Storage — Save everything to Google Sheets and upload the CV to Google Drive',
        ],
        ordered: true,
      },
      {
        type: 'code',
        language: 'text',
        code: `[n8n Form Trigger: Application submitted]
         │
         ▼
[Extract Text from CV (PDF/DOCX)]
         │
    ┌────┴────┐
    ▼         ▼
[Extract    [Extract
 Personal    Qualifications]
 Data]
    │         │
    └────┬────┘
         ▼
   [Merge Extracted Data]
         │
         ▼
   [Summarization Chain: CV Summary]
         │
         ▼
   [HR Expert LLM: Evaluation + Score]
         │
         ▼
   [Structured Output Parser]
         │
    ┌────┴────┐
    ▼         ▼
[Google     [Google Drive:
 Sheets:     Upload CV]
 Save Data]`,
        caption: 'The complete HR automation pipeline — from form submission to structured evaluation',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'LangChain Integration',
        text: 'This workflow leverages n8n\'s LangChain integration — Information Extractor nodes, Summarization Chains, and Structured Output Parsers. These are purpose-built AI components that produce more reliable, structured results than raw LLM calls.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 16.2: Building Application Forms with n8n
  // ==========================================================================
  {
    id: 'lesson-16-2',
    moduleId: 'module-16',
    title: 'Building Application Forms with n8n',
    estimatedTime: 3,
    order: 2,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'n8n has a built-in Form Trigger node that creates web forms without any external tools. Candidates can access the form via a URL, fill in their details, upload their CV, and submit — all without you building a frontend application.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The n8n Form Trigger Node',
      },
      {
        type: 'text',
        value: 'The Form Trigger is one of n8n\'s most powerful features for intake workflows. It generates a clean, responsive web form that you can share with candidates. The form supports multiple field types:',
      },
      {
        type: 'list',
        items: [
          'Text — Single-line text input for name, email, phone number',
          'Textarea — Multi-line text for cover letters or additional notes',
          'File Upload — Binary file upload for CVs (supports PDF, DOCX, DOC)',
          'Dropdown — Select from predefined options (e.g., position applied for)',
          'Checkbox — Boolean fields (e.g., "I agree to data processing terms")',
          'Number — Numeric input for years of experience',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'Designing the Application Form',
      },
      {
        type: 'text',
        value: 'Configure the Form Trigger with the following fields to capture everything needed for the screening pipeline:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Form Trigger Configuration:
═══════════════════════════════════════════════════
Form Title:    "Job Application — {{ company_name }}"
Form Path:     /apply

Fields:
─────────────────────────────────────────────────
1. Full Name          │ Text      │ Required
2. Email Address      │ Text      │ Required
3. Phone Number       │ Text      │ Required
4. Position           │ Dropdown  │ Required
   Options: "Senior Developer", "Product Manager",
            "Data Analyst", "UX Designer"
5. Years Experience   │ Number    │ Required
6. Cover Letter       │ Textarea  │ Optional
7. Resume/CV          │ File      │ Required
   Accepted: .pdf, .docx, .doc
8. LinkedIn URL       │ Text      │ Optional
9. Consent            │ Checkbox  │ Required
   "I consent to my data being processed"
═══════════════════════════════════════════════════`,
        caption: 'Application form configuration — all fields the candidate fills out',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Accessing the Form',
      },
      {
        type: 'text',
        value: 'Once the workflow is active, the form is accessible at a URL like:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Form URL:
https://your-n8n-instance.com/form/apply

This URL can be:
- Embedded in your careers page via iframe
- Shared directly in job postings
- Linked from LinkedIn or other job boards
- Sent to candidates via email`,
        caption: 'The form URL is automatically generated when you activate the workflow',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Custom Styling',
        text: 'n8n\'s form trigger generates a clean, minimal form. For custom branding, you can embed the form in your own page using an iframe, or use an external form builder (Typeform, Google Forms) that sends data to an n8n webhook instead.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'File Size Limits',
        text: 'n8n has a default maximum payload size (usually 16MB). Most CVs are well under this limit, but if candidates upload portfolios or large attachments, consider setting a file size limit in your form instructions or using a dedicated file upload service.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 16.3: CV Text Extraction & Parsing
  // ==========================================================================
  {
    id: 'lesson-16-3',
    moduleId: 'module-16',
    title: 'CV Text Extraction & Parsing',
    estimatedTime: 2,
    order: 3,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'After the candidate submits the form, the uploaded CV arrives as binary data. Before any AI processing can happen, you need to extract the text content from the file. The quality of extraction directly impacts the quality of all downstream AI analysis.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Extraction Pipeline',
      },
      {
        type: 'text',
        value: 'The extraction process handles both PDF and DOCX formats using n8n\'s built-in "Extract from File" node:',
      },
      {
        type: 'code',
        language: 'text',
        code: `[Form Trigger: CV binary data received]
         │
         ▼
[Check MIME type of uploaded file]
   application/pdf → PDF extraction
   application/vnd.openxml... → DOCX extraction
         │
         ▼
[Extract from File Node]
   Input:  Binary data from form upload
   Output: Plain text string
         │
         ▼
[Set Node: Store extracted text as variable]
   {{ cvText }} = extracted text content`,
        caption: 'Extract text from the uploaded CV file',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Common CV Structures',
      },
      {
        type: 'text',
        value: 'Understanding how CVs are typically structured helps you verify extraction quality. Most CVs follow one of these patterns:',
      },
      {
        type: 'list',
        items: [
          'Chronological — Work experience listed from most recent to oldest, followed by education and skills',
          'Functional — Organized by skill categories with examples, followed by a brief work history',
          'Combination — Skills summary at top, followed by chronological experience',
          'Modern/Creative — Non-standard layouts with columns, sidebars, and graphic elements',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Graphic-Heavy CVs',
        text: 'Modern CV templates with columns, sidebars, icons, and infographics are the hardest to extract text from. The extraction may jumble text from different columns together. For these cases, consider using a multimodal AI (like Gemini) that can "read" the CV as an image rather than extracting text.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Post-Extraction Cleaning',
      },
      {
        type: 'text',
        value: 'Raw extracted text often contains artifacts that should be cleaned before AI processing:',
      },
      {
        type: 'code',
        language: 'javascript',
        code: `// Code node: Clean extracted CV text
let text = $input.first().json.extractedText;

// Remove excessive whitespace and blank lines
text = text.replace(/\\n{3,}/g, '\\n\\n');

// Remove common artifacts
text = text.replace(/\\f/g, '');  // Form feed characters
text = text.replace(/\\t+/g, ' '); // Multiple tabs to space

// Remove page numbers and headers/footers
text = text.replace(/^Page \\d+ of \\d+$/gm, '');

// Trim and normalize
text = text.trim();

return [{ json: { cleanedCvText: text } }];`,
        caption: 'Clean extraction artifacts for better AI processing',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Quality Check',
        text: 'Add a validation step after extraction: check the text length. A typical CV produces 500-3000 characters of text. If extraction returns less than 100 characters, the file may be a scanned image or corrupted. Flag these for manual review.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 16.4: Information Extraction with LangChain Nodes
  // ==========================================================================
  {
    id: 'lesson-16-4',
    moduleId: 'module-16',
    title: 'Information Extraction with LangChain Nodes',
    estimatedTime: 3,
    order: 4,
    xpReward: 30,
    content: [
      {
        type: 'text',
        value: 'n8n\'s Information Extractor node is a LangChain-powered component designed to pull structured data from unstructured text. Instead of writing complex prompts and parsing responses, you define a schema and the node handles extraction automatically.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What is the Information Extractor Node?',
      },
      {
        type: 'text',
        value: 'The Information Extractor is different from a regular AI/LLM node. It uses LangChain\'s extraction chain under the hood, which is specifically designed for pulling structured fields from unstructured documents. Think of it as a smart form-filler that reads a document and fills in predefined fields.',
      },
      {
        type: 'code',
        language: 'text',
        code: `Regular LLM Node:
─────────────────────────────────
Input:  "Extract the name from this CV..."
Output: "The candidate's name is John Doe."
        ↑ Text — you need to parse this

Information Extractor Node:
─────────────────────────────────
Input:  CV text + schema definition
Output: { "name": "John Doe", "email": "john@example.com" }
        ↑ Structured JSON — ready to use`,
        caption: 'Information Extractor produces structured data directly, not text to parse',
      },
      {
        type: 'heading',
        level: 2,
        value: 'How It Works Under the Hood',
      },
      {
        type: 'list',
        items: [
          'You define a schema — the fields you want to extract with their types and descriptions',
          'The node generates an optimized prompt that instructs the LLM to extract those specific fields',
          'The LLM response is parsed through function calling or structured output to guarantee valid JSON',
          'The output is a clean JSON object matching your schema — no manual parsing needed',
          'If a field cannot be found in the text, it returns null for that field',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'Why Two Extractors Instead of One?',
      },
      {
        type: 'text',
        value: 'Our pipeline uses two separate Information Extractor nodes — one for personal data and one for qualifications. This separation is intentional:',
      },
      {
        type: 'list',
        items: [
          'Focused extraction produces higher accuracy than trying to extract everything at once',
          'Each extractor can use a model optimized for its task (faster model for personal data, more capable model for qualifications)',
          'Parallel processing — both extractors can run simultaneously, cutting processing time in half',
          'Easier debugging — if qualification extraction fails, personal data is still available',
          'Schema complexity — splitting keeps each schema simple and well-defined',
        ],
      },
      {
        type: 'code',
        language: 'text',
        code: `[Cleaned CV Text]
         │
    ┌────┴────┐
    │         │
    ▼         ▼
[Extractor  [Extractor
 #1:         #2:
 Personal    Qualifications]
 Data]
    │         │
    ▼         ▼
{name,      {skills, experience,
 email,      education,
 phone,      certifications,
 location}   languages}`,
        caption: 'Parallel extraction — personal data and qualifications are extracted simultaneously',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'LangChain in n8n',
        text: 'n8n has deep LangChain integration. The Information Extractor, Summarization Chain, and Structured Output Parser nodes all use LangChain under the hood. You get the power of LangChain\'s extraction chains without writing Python code.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 16.5: Personal Data & Qualification Extraction
  // ==========================================================================
  {
    id: 'lesson-16-5',
    moduleId: 'module-16',
    title: 'Personal Data & Qualification Extraction',
    estimatedTime: 3,
    order: 5,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'Now let\'s configure both Information Extractor nodes with their specific schemas. The personal data extractor focuses on contact information and demographics, while the qualification extractor focuses on professional capabilities.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Personal Data Extractor Schema',
      },
      {
        type: 'code',
        language: 'json',
        code: `{
  "type": "object",
  "properties": {
    "full_name": {
      "type": "string",
      "description": "Candidate's full name"
    },
    "email": {
      "type": "string",
      "description": "Email address"
    },
    "phone": {
      "type": "string",
      "description": "Phone number with country code"
    },
    "location": {
      "type": "string",
      "description": "City and country of residence"
    },
    "linkedin_url": {
      "type": "string",
      "description": "LinkedIn profile URL if present"
    },
    "portfolio_url": {
      "type": "string",
      "description": "Portfolio or personal website URL"
    },
    "nationality": {
      "type": "string",
      "description": "Nationality if mentioned"
    }
  },
  "required": ["full_name"]
}`,
        caption: 'Schema for the personal data Information Extractor node',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Qualification Extractor Schema',
      },
      {
        type: 'code',
        language: 'json',
        code: `{
  "type": "object",
  "properties": {
    "skills": {
      "type": "array",
      "items": { "type": "string" },
      "description": "List of technical and professional skills"
    },
    "years_experience": {
      "type": "number",
      "description": "Total years of professional experience"
    },
    "education": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "degree": { "type": "string" },
          "institution": { "type": "string" },
          "year": { "type": "string" }
        }
      },
      "description": "Educational qualifications"
    },
    "work_history": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "title": { "type": "string" },
          "company": { "type": "string" },
          "duration": { "type": "string" },
          "highlights": {
            "type": "array",
            "items": { "type": "string" }
          }
        }
      },
      "description": "Work experience entries"
    },
    "certifications": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Professional certifications"
    },
    "languages": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Languages spoken with proficiency level"
    }
  }
}`,
        caption: 'Schema for the qualification Information Extractor node',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Example Extraction Output',
      },
      {
        type: 'code',
        language: 'json',
        code: `// Personal Data Output:
{
  "full_name": "Ahmed Hassan",
  "email": "ahmed.hassan@email.com",
  "phone": "+20-1234567890",
  "location": "Cairo, Egypt",
  "linkedin_url": "linkedin.com/in/ahmedhassan",
  "portfolio_url": null,
  "nationality": "Egyptian"
}

// Qualifications Output:
{
  "skills": ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL"],
  "years_experience": 6,
  "education": [
    {
      "degree": "BSc Computer Science",
      "institution": "Cairo University",
      "year": "2020"
    }
  ],
  "work_history": [
    {
      "title": "Senior Developer",
      "company": "TechCo",
      "duration": "2022-Present",
      "highlights": ["Led team of 5", "Built microservices platform"]
    }
  ],
  "certifications": ["AWS Solutions Architect"],
  "languages": ["Arabic (Native)", "English (Fluent)"]
}`,
        caption: 'Example structured output from both Information Extractors',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Schema Descriptions Matter',
        text: 'The "description" field in each schema property is not just documentation — the AI uses it to understand what to extract. Be specific: "Phone number with country code" produces better results than just "Phone".',
      },
    ],
  },

  // ==========================================================================
  // LESSON 16.6: AI-Powered CV Summarization
  // ==========================================================================
  {
    id: 'lesson-16-6',
    moduleId: 'module-16',
    title: 'AI-Powered CV Summarization',
    estimatedTime: 2,
    order: 6,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'After extracting structured data from the CV, the next step is generating a concise summary. This summary serves two purposes: it gives the HR team a quick overview of the candidate without reading the full CV, and it provides focused context for the HR Expert evaluation in the next stage.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Summarization Chain Node',
      },
      {
        type: 'text',
        value: 'n8n provides a Summarization Chain node that\'s purpose-built for condensing long documents into concise summaries. It uses LangChain\'s summarization strategies under the hood:',
      },
      {
        type: 'list',
        items: [
          'Stuff — Sends the entire document to the LLM in one call. Best for shorter CVs (under 4000 tokens).',
          'Map-Reduce — Splits the document into chunks, summarizes each chunk, then summarizes the summaries. Best for very long documents.',
          'Refine — Iteratively refines a summary by processing each chunk sequentially. Best for preserving detail.',
        ],
      },
      {
        type: 'code',
        language: 'text',
        code: `Summarization Chain Configuration:
─────────────────────────────────
Type:      Stuff (for typical CV length)
Model:     GPT-4o-mini (fast, cost-effective)
─────────────────────────────────

Input: Merged extracted data from both extractors

Prompt: "Summarize this candidate's qualifications
in 3-5 sentences. Focus on: key skills, years of
experience, most relevant roles, and educational
background. Be factual and concise."`,
        caption: 'Summarization Chain node configured for CV condensation',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Merging Extracted Data Before Summarization',
      },
      {
        type: 'text',
        value: 'Before summarizing, merge the outputs from both Information Extractors into a single context. Use the Merge node to combine personal data and qualifications:',
      },
      {
        type: 'code',
        language: 'text',
        code: `[Personal Data Extractor]    [Qualification Extractor]
              │                            │
              └──────────┬─────────────────┘
                         │
                    [Merge Node]
                    Mode: Combine
                         │
                         ▼
              ┌─────────────────────┐
              │ {                   │
              │   personal: {...},  │
              │   qualifications:   │
              │     {...}           │
              │ }                   │
              └─────────────────────┘
                         │
                         ▼
              [Summarization Chain]`,
        caption: 'Merge both extraction outputs before generating the summary',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Example Summary Output',
      },
      {
        type: 'code',
        language: 'text',
        code: `"Ahmed Hassan is a Senior Developer with 6 years of
experience specializing in React, Node.js, and TypeScript.
Currently leading a team of 5 at TechCo, he built a
microservices platform and holds an AWS Solutions Architect
certification. He graduated with a BSc in Computer Science
from Cairo University in 2020 and is fluent in Arabic and
English."`,
        caption: 'A concise, factual CV summary generated by the Summarization Chain',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Summary as Input for HR Expert',
        text: 'This summary becomes the primary input for the HR Expert evaluation in the next stage. A well-structured summary produces better evaluation quality than feeding the raw CV text directly — it eliminates noise and focuses the expert AI on relevant qualifications.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 16.7: HR Expert Evaluation System
  // ==========================================================================
  {
    id: 'lesson-16-7',
    moduleId: 'module-16',
    title: 'HR Expert Evaluation System',
    estimatedTime: 3,
    order: 7,
    xpReward: 30,
    content: [
      {
        type: 'text',
        value: 'The HR Expert is the most sophisticated AI component in the pipeline. It acts as a senior HR professional who reviews the candidate summary, evaluates fit for the position, identifies strengths and concerns, and recommends specific interview questions. This is where LLM reasoning truly shines.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The HR Expert System Prompt',
      },
      {
        type: 'text',
        value: 'The system prompt transforms the LLM into a domain expert. Every instruction is carefully designed to produce useful, actionable output:',
      },
      {
        type: 'code',
        language: 'text',
        code: `You are a senior HR professional with 15 years of
experience in technical recruitment. You are evaluating
a candidate for the position of {{ position }}.

Given the candidate's CV summary and extracted
qualifications, provide a thorough evaluation:

1. FIT SCORE (1-10): How well does this candidate
   match the position requirements?

2. STRENGTHS (3-5 bullet points): What makes this
   candidate stand out? Focus on skills and experience
   directly relevant to the role.

3. CONCERNS (2-4 bullet points): What gaps, risks,
   or areas need further exploration? Be specific.

4. INTERVIEW RECOMMENDATION: Should we interview
   this candidate? (Strongly Recommend / Recommend /
   Conditional / Not Recommended)

5. SUGGESTED INTERVIEW QUESTIONS (3-5): Specific
   questions to explore the identified concerns and
   validate strengths. Make them behavioral ("Tell me
   about a time when...").

Be objective and evidence-based. Reference specific
qualifications from the CV in your evaluation.`,
        caption: 'The HR Expert prompt — produces a comprehensive, actionable evaluation',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Example HR Expert Output',
      },
      {
        type: 'code',
        language: 'text',
        code: `FIT SCORE: 8/10

STRENGTHS:
• 6 years of hands-on experience with React and Node.js —
  exceeds the 5-year requirement
• AWS Solutions Architect certification demonstrates cloud
  proficiency
• Team leadership experience (led team of 5) aligns with
  the mentoring responsibility
• TypeScript expertise matches the tech stack requirement

CONCERNS:
• No visible Next.js experience — listed as preferred
  qualification
• Only one employer mentioned — limited perspective on
  different engineering cultures
• No mention of CI/CD experience — listed as preferred

INTERVIEW RECOMMENDATION: Strongly Recommend

SUGGESTED INTERVIEW QUESTIONS:
1. "Tell me about a time you had to migrate an existing
   React application to a new framework. How did you
   approach it?"
2. "Describe your experience setting up CI/CD pipelines.
   What tools did you use and what challenges did you face?"
3. "How do you approach mentoring junior developers? Give
   a specific example of how you helped someone grow."
4. "Tell me about the microservices platform you built at
   TechCo. What were the key architectural decisions?"`,
        caption: 'Structured HR Expert evaluation — actionable and evidence-based',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Customizing Per Position',
        text: 'Store position-specific evaluation criteria in a Google Sheet or Notion database. The workflow can look up the position from the form submission and inject the right criteria into the HR Expert prompt. This makes the system work for any role without modifying the workflow.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Model Quality Matters Here',
        text: 'The HR Expert evaluation requires strong reasoning capabilities. Use GPT-4o or Claude 3.5 Sonnet for this stage — the quality difference between these models and cheaper alternatives is most apparent in nuanced evaluation tasks. The cost per evaluation is $0.02-0.05.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 16.8: Structured Output Parsing
  // ==========================================================================
  {
    id: 'lesson-16-8',
    moduleId: 'module-16',
    title: 'Structured Output Parsing',
    estimatedTime: 2,
    order: 8,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'The HR Expert produces a text evaluation, but downstream nodes (Google Sheets, notifications) need structured data. The Structured Output Parser converts the evaluation into a clean JSON object with typed fields — score as a number, strengths as an array, recommendation as an enum.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Defining the Evaluation Schema',
      },
      {
        type: 'code',
        language: 'json',
        code: `{
  "type": "object",
  "properties": {
    "fit_score": {
      "type": "number",
      "description": "Candidate fit score from 1-10"
    },
    "strengths": {
      "type": "array",
      "items": { "type": "string" },
      "description": "List of candidate strengths"
    },
    "concerns": {
      "type": "array",
      "items": { "type": "string" },
      "description": "List of concerns or gaps"
    },
    "interview_recommendation": {
      "type": "string",
      "enum": ["Strongly Recommend", "Recommend",
               "Conditional", "Not Recommended"],
      "description": "Interview recommendation"
    },
    "suggested_questions": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Suggested interview questions"
    },
    "evaluation_summary": {
      "type": "string",
      "description": "2-3 sentence overall evaluation"
    }
  },
  "required": ["fit_score", "strengths", "concerns",
               "interview_recommendation"]
}`,
        caption: 'JSON Schema for the HR Expert evaluation output',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Integrating the Parser with the LLM',
      },
      {
        type: 'text',
        value: 'In n8n, the Structured Output Parser can be attached directly to the LLM chain. It modifies the prompt to include the schema and processes the response:',
      },
      {
        type: 'code',
        language: 'text',
        code: `[Summarization Chain: CV Summary]
         │
         ▼
┌─────────────────────────────────┐
│  HR Expert LLM Chain            │
│                                 │
│  LLM: GPT-4o / Claude 3.5      │
│  System: HR Expert prompt       │
│  User: CV Summary + Position    │
│                                 │
│  ┌───────────────────────┐      │
│  │ Structured Output     │      │
│  │ Parser (attached)     │      │
│  │ Schema: evaluation    │      │
│  └───────────────────────┘      │
└─────────────────────────────────┘
         │
         ▼
{
  "fit_score": 8,
  "strengths": ["6 years React/Node", ...],
  "concerns": ["No Next.js", ...],
  "interview_recommendation": "Strongly Recommend",
  "suggested_questions": ["Tell me about...", ...]
}`,
        caption: 'The Output Parser is attached to the LLM chain, ensuring structured output',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Parser vs Manual Parsing',
        text: 'Without the Structured Output Parser, you\'d need to write regex or string manipulation to extract the score, split strengths into an array, and validate the recommendation. The parser handles all of this automatically, with type safety and enum validation.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Error Handling',
      },
      {
        type: 'list',
        items: [
          'If the LLM fails to produce valid JSON, the parser retries with a correction prompt',
          'If a required field is missing, the parser instructs the LLM to provide it',
          'Enum validation catches invalid recommendation values (e.g., "Maybe") and re-prompts',
          'Type coercion handles edge cases like the LLM returning score as string "8" instead of number 8',
        ],
      },
    ],
  },

  // ==========================================================================
  // LESSON 16.9: Google Sheets & Drive Integration
  // ==========================================================================
  {
    id: 'lesson-16-9',
    moduleId: 'module-16',
    title: 'Google Sheets & Drive Integration',
    estimatedTime: 2,
    order: 9,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'The final data storage step saves everything to Google Sheets for tracking and uploads the original CV to Google Drive for easy access. This creates a comprehensive, shareable record of every candidate and their AI evaluation.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Google Sheets: Candidate Tracker',
      },
      {
        type: 'text',
        value: 'Create a Google Sheet with columns matching all extracted and evaluated data. The sheet becomes a lightweight ATS that HR teams can filter, sort, and share:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Google Sheet: "Candidate Pipeline"
═══════════════════════════════════════════════════════════
Column          │ Source              │ Example
────────────────┼─────────────────────┼────────────────────
Name            │ Personal Extractor  │ Ahmed Hassan
Email           │ Personal Extractor  │ ahmed@email.com
Phone           │ Personal Extractor  │ +20-1234567890
Position        │ Form Trigger        │ Senior Developer
Years Exp.      │ Qual. Extractor     │ 6
Key Skills      │ Qual. Extractor     │ React, Node, TS
Education       │ Qual. Extractor     │ BSc CS, Cairo Univ
Fit Score       │ HR Expert           │ 8
Recommendation  │ HR Expert           │ Strongly Recommend
Strengths       │ HR Expert           │ Strong tech match...
Concerns        │ HR Expert           │ No Next.js...
Questions       │ HR Expert           │ Tell me about...
CV Link         │ Google Drive        │ drive.google.com/...
Date Applied    │ Timestamp           │ 2026-03-21
Status          │ Manual              │ New
═══════════════════════════════════════════════════════════`,
        caption: 'Google Sheet structure — one row per candidate with all pipeline data',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Appending Data to Google Sheets',
      },
      {
        type: 'code',
        language: 'text',
        code: `Google Sheets Node Configuration:
─────────────────────────────────
Operation:    Append Row
Spreadsheet:  Candidate Pipeline
Sheet:        Sheet1
Mapping Mode: Map Each Column

Column Mappings:
  Name:           {{ $json.personal.full_name }}
  Email:          {{ $json.personal.email }}
  Fit Score:      {{ $json.evaluation.fit_score }}
  Recommendation: {{ $json.evaluation.interview_recommendation }}
  ...
─────────────────────────────────`,
        caption: 'Google Sheets node appends one row per candidate with mapped fields',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Uploading CV to Google Drive',
      },
      {
        type: 'text',
        value: 'Upload the original CV file to a Google Drive folder, organized by position and date:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Google Drive Node Configuration:
─────────────────────────────────
Operation:   Upload File
Parent Folder: HR Applications/{{ position }}
File Name:   {{ fit_score }}_{{ full_name }}_CV.pdf
Binary Data: data (from form upload)
─────────────────────────────────

Folder structure:
📁 HR Applications/
├── 📁 Senior Developer/
│   ├── 8_Ahmed_Hassan_CV.pdf
│   └── 6_Sara_Ali_CV.pdf
├── 📁 Product Manager/
└── 📁 Data Analyst/`,
        caption: 'Upload CV to a position-specific folder with score prefix for easy sorting',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Sheet Formatting Tips',
        text: 'Add conditional formatting to the Google Sheet: green for scores 8+, yellow for 5-7, red for below 5. Add data validation for the Status column with options like New, Contacted, Interviewed, Offered, Hired, Passed. This turns the sheet into a functional mini-ATS.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 16.10: Complete Pipeline Assembly & Testing
  // ==========================================================================
  {
    id: 'lesson-16-10',
    moduleId: 'module-16',
    title: 'Complete Pipeline Assembly & Testing',
    estimatedTime: 3,
    order: 10,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'You\'ve built all the individual components — now it\'s time to connect them into a complete, production-ready pipeline. This lesson covers assembling the full workflow, testing each stage, handling errors, and deploying for real use.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Complete Workflow',
      },
      {
        type: 'code',
        language: 'text',
        code: `COMPLETE HR AUTOMATION PIPELINE:
═══════════════════════════════════════════════════════

[1. Form Trigger] ──────────────────────────────────┐
   Fields: name, email, position, CV, cover letter   │
                                                      │
[2. Extract CV Text] ◄───────────────────────────────┘
   PDF/DOCX → plain text
         │
    ┌────┴────┐  (parallel execution)
    │         │
[3a. Extract  [3b. Extract
 Personal      Qualifications]
 Data]
    │         │
    └────┬────┘
         │
[4. Merge] ── Combine both extractions
         │
[5. Summarization Chain] ── 3-5 sentence summary
         │
[6. HR Expert LLM + Output Parser] ── Full evaluation
         │
    ┌────┴────┐  (parallel execution)
    │         │
[7a. Google  [7b. Google Drive:
 Sheets:       Upload CV file]
 Append row]    │
    │         │
    └────┬────┘
         │
[8. Confirmation Email] ── Notify HR manager`,
        caption: 'The fully assembled pipeline — 8 stages from intake to storage',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Testing Strategy',
      },
      {
        type: 'text',
        value: 'Test the pipeline systematically, one stage at a time, before testing the full flow:',
      },
      {
        type: 'list',
        items: [
          'Stage 1: Submit the form with a test CV and verify all fields are received correctly',
          'Stage 2: Check text extraction output — is the full CV text captured without artifacts?',
          'Stage 3: Verify both extractors produce complete, accurate structured data',
          'Stage 4: Confirm the merge combines data correctly without losing fields',
          'Stage 5: Read the summary — is it accurate, concise, and useful?',
          'Stage 6: Review the HR Expert evaluation — is the score reasonable? Are questions relevant?',
          'Stage 7: Check Google Sheets row and Drive file — all data saved correctly?',
          'Stage 8: Verify the notification email contains the right information',
        ],
        ordered: true,
      },
      {
        type: 'heading',
        level: 2,
        value: 'Error Handling',
      },
      {
        type: 'text',
        value: 'Add error handling at every critical stage to prevent pipeline failures:',
      },
      {
        type: 'list',
        items: [
          'CV extraction failure — Catch and send the raw binary to a manual review queue',
          'AI timeout — Set retry policies (3 retries, 30s delay) on all LLM nodes',
          'Google API errors — Handle rate limits and authentication failures gracefully',
          'Invalid form data — Validate required fields before processing starts',
          'Pipeline crash — Use n8n\'s Error Trigger to catch any unhandled errors and notify the team',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Test with Diverse CVs',
        text: 'Test with at least 10 different CVs: different formats (PDF, DOCX), different structures (chronological, functional), different lengths (1-page, 3-page), and different quality levels (well-formatted, plain text). This exposes edge cases before the pipeline goes live.',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Congratulations!',
        text: 'You\'ve built a sophisticated HR automation pipeline that takes candidates from application to structured evaluation. The combination of n8n forms, LangChain extraction, AI summarization, and expert evaluation creates a system that can process applications in seconds with consistent, actionable results.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What\'s Next?',
      },
      {
        type: 'list',
        items: [
          'Add interview scheduling — Automatically send Calendly links to recommended candidates',
          'Build a hiring dashboard — Visualize pipeline metrics with Notion or Sheets charts',
          'Implement feedback loops — Track hiring outcomes to improve AI evaluation accuracy',
          'Multi-language support — Add CV processing for non-English resumes',
        ],
      },
    ],
  },
];
