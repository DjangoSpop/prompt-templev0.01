/**
 * Module 15: Financial Tracker
 * Duration: 25 minutes | 10 Lessons
 */

import type { Lesson } from '../../types';

export const module15Lessons: Lesson[] = [
  // ==========================================================================
  // LESSON 15.1: Introduction to Financial Automation
  // ==========================================================================
  {
    id: 'lesson-15-1',
    moduleId: 'module-15',
    title: 'Introduction to Financial Automation',
    estimatedTime: 2,
    order: 1,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Tracking expenses is one of those tasks that everyone knows they should do, but few do consistently. Receipts pile up, transactions go unrecorded, and at the end of the month you\'re left guessing where your money went. What if you could simply snap a photo of any receipt and have AI handle everything else?',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Problem with Traditional Expense Tracking',
      },
      {
        type: 'text',
        value: 'Manual expense tracking fails for three reasons: it requires discipline (remembering to log every transaction), it requires time (typing amounts, categories, dates), and it requires consistency (using the same format every time). Most people start strong and abandon it within weeks.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'The Photo-First Approach',
        text: 'Instead of opening an app, finding the right category, and typing numbers, you simply photograph the receipt and send it to a Telegram bot. Gemini AI extracts every detail — amount, vendor, date, category — and saves it to your Notion database. Zero manual data entry.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What We\'re Building',
      },
      {
        type: 'text',
        value: 'This module covers two interconnected workflows that together create a complete financial tracking system:',
      },
      {
        type: 'list',
        items: [
          'Invoice Capture Pipeline — Send a receipt photo to Telegram → Gemini AI extracts transaction data → saves to Notion database',
          'Reporting Pipeline — Weekly schedule trigger → pull recent transactions from Notion → AI generates summary → QuickChart creates visual chart → sends report back to Telegram',
        ],
        ordered: true,
      },
      {
        type: 'code',
        language: 'text',
        code: `WORKFLOW 1: Invoice Capture
═══════════════════════════════════════
[Telegram Trigger: Photo received]
         │
         ▼
[Telegram: Get Image File]
         │
         ▼
[Gemini AI: Extract transaction data]
         │
         ▼
[Output Parser: Force valid JSON]
         │
         ▼
[Split Out: Handle multiple items]
         │
         ▼
[Notion: Save transaction record]


WORKFLOW 2: Weekly Report
═══════════════════════════════════════
[Schedule Trigger: Every Sunday 9 AM]
         │
         ▼
[Notion: Get recent transactions]
         │
         ▼
[AI: Summarize spending patterns]
         │
         ▼
[QuickChart: Generate pie/bar chart]
         │
         ▼
[Telegram: Send report + chart image]`,
        caption: 'Two workflows: real-time invoice capture and weekly financial reporting',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Works for Personal & Business',
        text: 'This system works equally well for personal expense tracking and small business bookkeeping. The category system and reporting can be customized for any use case — from tracking your coffee habit to managing vendor invoices.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 15.2: Telegram Bot Setup for Invoice Capture
  // ==========================================================================
  {
    id: 'lesson-15-2',
    moduleId: 'module-15',
    title: 'Telegram Bot Setup for Invoice Capture',
    estimatedTime: 3,
    order: 2,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'Telegram is the perfect interface for invoice capture — it\'s always on your phone, supports photo messages natively, and has one of the easiest bot APIs to work with. Creating a Telegram bot takes under 5 minutes and gives you a private, always-available expense capture channel.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Creating Your Telegram Bot',
      },
      {
        type: 'text',
        value: 'Telegram bots are created through BotFather, Telegram\'s official bot management tool. Follow these steps:',
      },
      {
        type: 'list',
        items: [
          'Open Telegram and search for @BotFather',
          'Send the command /newbot',
          'Choose a display name (e.g., "My Finance Tracker")',
          'Choose a username ending in "bot" (e.g., "my_finance_tracker_bot")',
          'BotFather returns your Bot Token — save this securely',
          'Send /setdescription to add a description for your bot',
        ],
        ordered: true,
      },
      {
        type: 'code',
        language: 'text',
        code: `BotFather Conversation:
─────────────────────────────────
You:       /newbot
BotFather: Choose a name for your bot.
You:       My Finance Tracker
BotFather: Choose a username for your bot.
You:       my_finance_tracker_bot
BotFather: Done! Your bot token is:
           7123456789:AAH...your-secret-token...xyz

           Keep this token secure! Anyone with it
           can control your bot.`,
        caption: 'Creating a Telegram bot through BotFather',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Connecting Telegram to n8n',
      },
      {
        type: 'text',
        value: 'In n8n, create a Telegram credential and set up the trigger node:',
      },
      {
        type: 'list',
        items: [
          'In n8n, go to Credentials → New → Telegram API',
          'Paste your Bot Token from BotFather',
          'Add a "Telegram Trigger" node to your workflow',
          'Set the trigger to fire on "message" events',
          'Filter for messages that contain a photo (photo messages have a "photo" array)',
        ],
        ordered: true,
      },
      {
        type: 'code',
        language: 'text',
        code: `Telegram Trigger Node Configuration:
─────────────────────────────────
Updates:   message
─────────────────────────────────

Incoming Message Data:
{
  "message": {
    "message_id": 42,
    "from": {
      "id": 123456789,
      "first_name": "Ahmed"
    },
    "chat": {
      "id": 123456789,
      "type": "private"
    },
    "photo": [
      { "file_id": "AgAC...", "width": 90, "height": 90 },
      { "file_id": "AgAC...", "width": 320, "height": 320 },
      { "file_id": "AgAC...", "width": 800, "height": 800 }
    ]
  }
}`,
        caption: 'Telegram sends multiple photo sizes — always use the last (largest) one',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Security: Restrict Access',
        text: 'Add an IF node after the trigger to check if the message sender\'s ID matches yours. This prevents unauthorized users from submitting receipts through your bot. Compare message.from.id against your known Telegram user ID.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Bot Token Security',
        text: 'Your Telegram bot token is like a password — never commit it to version control or share it publicly. In n8n, store it as a credential rather than hardcoding it in workflow expressions.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 15.3: Image Processing with Gemini AI
  // ==========================================================================
  {
    id: 'lesson-15-3',
    moduleId: 'module-15',
    title: 'Image Processing with Gemini AI',
    estimatedTime: 3,
    order: 3,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'Google\'s Gemini AI is a multimodal model — it can understand both text and images. This makes it perfect for reading receipts and invoices. You send it a photo, and it extracts structured data like amount, vendor, date, and category with remarkable accuracy.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Why Gemini for Receipt Processing?',
      },
      {
        type: 'text',
        value: 'While several AI models support image understanding, Gemini offers specific advantages for financial document processing:',
      },
      {
        type: 'list',
        items: [
          'Multimodal natively — Processes images and text in a single call, no separate OCR step needed',
          'Strong number recognition — Accurately reads amounts, dates, and receipt numbers even from poor-quality photos',
          'Contextual understanding — Recognizes vendor names, item categories, and receipt layouts from various formats',
          'Cost-effective — Gemini Flash is extremely affordable for image processing tasks',
          'Fast inference — Processes a receipt image in 2-5 seconds',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'Getting the Image from Telegram',
      },
      {
        type: 'text',
        value: 'Before sending to Gemini, you need to download the actual image file from Telegram. The trigger only provides a file_id, not the image data:',
      },
      {
        type: 'code',
        language: 'text',
        code: `[Telegram Trigger: Photo received]
         │
         ▼
[Telegram: Get File]
   file_id: {{ $json.message.photo.last().file_id }}
         │
         ▼
   Returns: Binary image data
         │
         ▼
[Gemini AI: Analyze image]`,
        caption: 'Download the highest resolution photo before sending to Gemini',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Gemini Extraction Prompt',
      },
      {
        type: 'text',
        value: 'The prompt instructs Gemini to extract specific financial data from the receipt image and return it as structured JSON:',
      },
      {
        type: 'code',
        language: 'text',
        code: `You are a financial data extraction assistant.
Analyze this receipt/invoice image and extract the
following information as a JSON object:

{
  "amount": <number - total amount paid>,
  "currency": "<3-letter currency code, e.g. USD, EUR, EGP>",
  "vendor_name": "<name of the store/vendor>",
  "date": "<date in YYYY-MM-DD format>",
  "category": "<one of: Food, Transport, Utilities, Shopping,
               Healthcare, Entertainment, Other>",
  "items": [
    { "name": "<item name>", "price": <item price> }
  ],
  "payment_method": "<Cash, Card, or Unknown>"
}

If any field cannot be determined from the image,
use null for that field. Always return valid JSON.`,
        caption: 'The extraction prompt defines the exact output structure Gemini should produce',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Handling Multiple Items',
        text: 'Some receipts contain multiple line items (grocery receipts, for example). The "items" array in the output captures individual items with their prices, while the "amount" field captures the total. This gives you both granular and summary-level data.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Photo Quality Tips',
        text: 'For best extraction accuracy: photograph the receipt in good lighting, ensure the entire receipt is visible, avoid shadows and glare, and hold the camera steady. Gemini handles imperfect photos well, but cleaner images give more accurate results.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 15.4: Structured Data Extraction from Invoices
  // ==========================================================================
  {
    id: 'lesson-15-4',
    moduleId: 'module-15',
    title: 'Structured Data Extraction from Invoices',
    estimatedTime: 2,
    order: 4,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Gemini returns its analysis as text containing JSON — but text is unreliable. It might include extra explanation, markdown formatting, or subtle JSON syntax errors. We need to ensure the output is always valid, parseable JSON that downstream nodes can work with.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Parsing Challenge',
      },
      {
        type: 'text',
        value: 'When you ask an AI to return JSON, it often wraps the response in markdown code blocks, adds explanatory text, or introduces subtle formatting issues:',
      },
      {
        type: 'code',
        language: 'text',
        code: `❌ Common AI Response (not clean JSON):

Here's the extracted data from your receipt:

\`\`\`json
{
  "amount": 45.99,
  "currency": "USD",
  "vendor_name": "Starbucks",
  "date": "2026-03-20",
  "category": "Food"
}
\`\`\`

The receipt appears to be from a Starbucks location...

─────────────────────────────────

✅ What we need (clean JSON only):

{
  "amount": 45.99,
  "currency": "USD",
  "vendor_name": "Starbucks",
  "date": "2026-03-20",
  "category": "Food"
}`,
        caption: 'AI often adds extra text around JSON — we need to extract just the JSON',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Cleaning the AI Response',
      },
      {
        type: 'text',
        value: 'Use a Code node to extract and parse the JSON from the AI\'s response. This handles common formatting issues:',
      },
      {
        type: 'code',
        language: 'javascript',
        code: `// Code node: Extract JSON from Gemini response
const aiResponse = $input.first().json.text;

// Try to extract JSON from markdown code blocks
let jsonString = aiResponse;

// Remove markdown code block if present
const jsonMatch = aiResponse.match(/\`\`\`(?:json)?\\s*([\\s\\S]*?)\`\`\`/);
if (jsonMatch) {
  jsonString = jsonMatch[1].trim();
}

// Parse the JSON
const parsed = JSON.parse(jsonString);

// Validate required fields
if (!parsed.amount || !parsed.vendor_name) {
  throw new Error('Missing required fields: amount or vendor_name');
}

return [{ json: parsed }];`,
        caption: 'Code node that safely extracts and validates JSON from the AI response',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Category Standardization',
        text: 'The prompt specifies 7 categories: Food, Transport, Utilities, Shopping, Healthcare, Entertainment, and Other. If Gemini returns a variant (e.g., "Groceries" instead of "Food"), add a mapping step to normalize categories. This ensures consistent data in your database.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Handling Extraction Errors',
      },
      {
        type: 'list',
        items: [
          'Unreadable receipt — Gemini returns null for unreadable fields. Send a Telegram message asking the user to re-send a clearer photo.',
          'Multiple receipts — If someone sends a photo with multiple receipts, the items array may contain mixed data. Consider adding a "one receipt per photo" instruction.',
          'Foreign currencies — The currency field handles international receipts. Ensure your Notion database supports multiple currencies.',
          'Missing date — If the date is not on the receipt, default to the current date (the date the photo was sent).',
        ],
      },
    ],
  },

  // ==========================================================================
  // LESSON 15.5: Output Parser for Reliable JSON
  // ==========================================================================
  {
    id: 'lesson-15-5',
    moduleId: 'module-15',
    title: 'Output Parser for Reliable JSON',
    estimatedTime: 2,
    order: 5,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'n8n provides a built-in "Structured Output Parser" node that forces AI responses into a valid JSON schema. This is more reliable than parsing text manually — the node uses function calling or structured outputs from the AI provider to guarantee valid JSON every time.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What is the Structured Output Parser?',
      },
      {
        type: 'text',
        value: 'The Structured Output Parser is an n8n node that sits between the AI model and your downstream nodes. It defines a JSON schema and forces the AI to conform to it. If the AI\'s response doesn\'t match the schema, the parser handles the error automatically.',
      },
      {
        type: 'code',
        language: 'text',
        code: `Without Output Parser:
[Gemini AI] → Text response → Manual parsing → Errors possible

With Output Parser:
[Gemini AI + Output Parser] → Guaranteed valid JSON → Reliable pipeline`,
        caption: 'The Output Parser eliminates JSON parsing errors from the pipeline',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Defining the Output Schema',
      },
      {
        type: 'text',
        value: 'Configure the Output Parser with a JSON schema that matches your expected transaction data:',
      },
      {
        type: 'code',
        language: 'json',
        code: `{
  "type": "object",
  "properties": {
    "amount": {
      "type": "number",
      "description": "Total amount paid"
    },
    "currency": {
      "type": "string",
      "description": "3-letter currency code (USD, EUR, EGP)"
    },
    "vendor_name": {
      "type": "string",
      "description": "Name of the store or vendor"
    },
    "date": {
      "type": "string",
      "description": "Transaction date in YYYY-MM-DD format"
    },
    "category": {
      "type": "string",
      "enum": ["Food", "Transport", "Utilities", "Shopping",
               "Healthcare", "Entertainment", "Other"],
      "description": "Spending category"
    },
    "payment_method": {
      "type": "string",
      "enum": ["Cash", "Card", "Unknown"],
      "description": "How the payment was made"
    }
  },
  "required": ["amount", "currency", "vendor_name",
               "date", "category"]
}`,
        caption: 'JSON Schema definition for the Output Parser — note the enum constraints on category',
      },
      {
        type: 'heading',
        level: 2,
        value: 'How It Works Under the Hood',
      },
      {
        type: 'list',
        items: [
          'The schema is sent to the AI provider as a function call definition or response format',
          'The AI provider forces the model to produce output matching the schema exactly',
          'Enum values constrain the category to your predefined list — no surprises',
          'Required fields are guaranteed to be present — the AI cannot omit them',
          'Type validation ensures amounts are numbers, dates are strings, etc.',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Using outputParserStructured',
        text: 'In n8n, the node is called "Structured Output Parser" or "outputParserStructured" in the node configuration. It attaches directly to the AI chain and modifies the prompt automatically to enforce the schema. No manual prompt engineering needed for format compliance.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Schema Complexity Limits',
        text: 'Keep your schema relatively simple — deeply nested objects or arrays of complex objects can reduce extraction accuracy. For receipt items, consider extracting them in a separate AI call if the primary extraction quality suffers.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 15.6: Storing Transactions in Notion Database
  // ==========================================================================
  {
    id: 'lesson-15-6',
    moduleId: 'module-15',
    title: 'Storing Transactions in Notion Database',
    estimatedTime: 2,
    order: 6,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'With clean, structured transaction data from the AI, the next step is storing it in a Notion database. Notion serves as your financial ledger — searchable, sortable, and filterable with powerful database views for analyzing spending patterns.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Transaction Database Schema',
      },
      {
        type: 'text',
        value: 'Create a Notion database with the following properties to store each transaction:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Expense Tracker Database Schema:
═══════════════════════════════════════════════════
Property        │ Type          │ Purpose
────────────────┼───────────────┼──────────────────
Transaction     │ Title         │ Vendor name
Amount          │ Number        │ Total amount paid
Currency        │ Select        │ USD, EUR, EGP, etc.
Category        │ Select        │ Food, Transport, etc.
Date            │ Date          │ Transaction date
Payment Method  │ Select        │ Cash, Card, Unknown
Receipt Image   │ Files & Media │ Original photo
Notes           │ Rich Text     │ Any extra details
Month           │ Formula       │ Auto-calculated from Date
Week Number     │ Formula       │ Auto-calculated from Date
═══════════════════════════════════════════════════`,
        caption: 'Notion database schema for expense tracking',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Saving Transactions with the Notion Node',
      },
      {
        type: 'text',
        value: 'Configure the Notion "Create Database Item" node to map the AI-extracted fields to your database properties:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Notion Create Database Item:
─────────────────────────────────
Database:  Expense Tracker
Properties:
  Transaction:    {{ $json.vendor_name }}
  Amount:         {{ $json.amount }}
  Currency:       {{ $json.currency }}
  Category:       {{ $json.category }}
  Date:           {{ $json.date }}
  Payment Method: {{ $json.payment_method }}
─────────────────────────────────`,
        caption: 'Map AI-extracted fields directly to Notion database properties',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Using the Split Out Node for Multiple Items',
      },
      {
        type: 'text',
        value: 'If a receipt contains multiple distinct transactions (rare but possible), the AI may return an array. The Split Out node converts an array into individual items, each processed separately:',
      },
      {
        type: 'code',
        language: 'text',
        code: `[AI Output: Array of transactions]
   {
     "transactions": [
       { "amount": 12.50, "vendor": "Shop A" },
       { "amount": 8.99,  "vendor": "Shop B" }
     ]
   }
         │
         ▼
[Split Out Node: field = "transactions"]
         │
    ┌────┴────┐
    ▼         ▼
 Item 1    Item 2
    │         │
    ▼         ▼
[Notion: Create entry for each]`,
        caption: 'Split Out converts an array into individual items for separate processing',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Confirmation Message',
        text: 'After saving to Notion, send a confirmation back to Telegram: "Saved: $45.99 at Starbucks (Food) on 2026-03-20". This gives the user immediate feedback that their receipt was processed correctly and lets them catch any AI mistakes.',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Notion Formulas for Reporting',
        text: 'Add formula properties to auto-calculate the month and week number from the Date field. This enables powerful filtering in Notion views — "Show me all Food expenses from March" becomes a single filter click.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 15.7: Building the Weekly Report Pipeline
  // ==========================================================================
  {
    id: 'lesson-15-7',
    moduleId: 'module-15',
    title: 'Building the Weekly Report Pipeline',
    estimatedTime: 3,
    order: 7,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'Capturing transactions is half the battle — the other half is understanding your spending patterns. The weekly report pipeline automatically queries your Notion database, analyzes spending trends, generates visual charts, and sends a comprehensive report to your Telegram.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Report Pipeline Architecture',
      },
      {
        type: 'code',
        language: 'text',
        code: `[Schedule Trigger: Every Sunday at 9:00 AM]
         │
         ▼
[Notion: Query transactions from last 7 days]
         │
         ▼
[Code Node: Aggregate spending by category]
         │
         ▼
[AI: Generate natural language summary]
         │
         ▼
[QuickChart: Generate pie chart image]
         │
         ▼
[Telegram: Send report text + chart image]`,
        caption: 'Weekly report pipeline — from data query to visual report delivery',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Querying Recent Transactions',
      },
      {
        type: 'text',
        value: 'The Notion node queries for all transactions within the reporting period. Use a date filter to get last week\'s data:',
      },
      {
        type: 'code',
        language: 'json',
        code: `{
  "filter": {
    "property": "Date",
    "date": {
      "past_week": {}
    }
  },
  "sorts": [
    {
      "property": "Date",
      "direction": "descending"
    }
  ]
}`,
        caption: 'Notion filter for transactions from the past 7 days',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Aggregating Spending Data',
      },
      {
        type: 'text',
        value: 'Use a Code node to process the raw transaction data into meaningful summaries:',
      },
      {
        type: 'code',
        language: 'javascript',
        code: `// Code node: Aggregate spending by category
const transactions = $input.all();

const byCategory = {};
let totalSpent = 0;

for (const item of transactions) {
  const { category, amount } = item.json;
  totalSpent += amount;

  if (!byCategory[category]) {
    byCategory[category] = { total: 0, count: 0 };
  }
  byCategory[category].total += amount;
  byCategory[category].count += 1;
}

// Sort categories by spending amount
const sorted = Object.entries(byCategory)
  .sort(([,a], [,b]) => b.total - a.total)
  .map(([cat, data]) => ({
    category: cat,
    total: data.total.toFixed(2),
    count: data.count,
    percentage: ((data.total / totalSpent) * 100).toFixed(1)
  }));

return [{
  json: {
    totalSpent: totalSpent.toFixed(2),
    transactionCount: transactions.length,
    categories: sorted,
    currency: transactions[0]?.json.currency || 'USD'
  }
}];`,
        caption: 'Aggregate transactions by category with totals and percentages',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Monthly Reports Too',
        text: 'Add a second Schedule Trigger for the first day of each month. Use Notion\'s "past_month" filter to generate monthly summaries. Compare month-over-month spending to identify trends and budget drift.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 15.8: Chart Generation with QuickChart.io
  // ==========================================================================
  {
    id: 'lesson-15-8',
    moduleId: 'module-15',
    title: 'Chart Generation with QuickChart.io',
    estimatedTime: 2,
    order: 8,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'A picture is worth a thousand spreadsheet cells. QuickChart.io is a free API that generates chart images from data — perfect for creating visual spending breakdowns to include in your Telegram report. No frontend code needed.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What is QuickChart.io?',
      },
      {
        type: 'text',
        value: 'QuickChart is an open-source API that generates Chart.js images via URL. You construct a URL with your chart configuration as a query parameter, and it returns a PNG image. It supports pie charts, bar charts, line charts, and many more.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Building the Chart URL',
      },
      {
        type: 'text',
        value: 'Use a Code node to construct the QuickChart URL from your aggregated spending data:',
      },
      {
        type: 'code',
        language: 'javascript',
        code: `// Code node: Generate QuickChart URL
const { categories, totalSpent, currency } = $input.first().json;

const labels = categories.map(c => c.category);
const data = categories.map(c => parseFloat(c.total));
const colors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
  '#9966FF', '#FF9F40', '#C9CBCF'
];

const chartConfig = {
  type: 'pie',
  data: {
    labels: labels,
    datasets: [{
      data: data,
      backgroundColor: colors.slice(0, labels.length)
    }]
  },
  options: {
    title: {
      display: true,
      text: \`Weekly Spending: \${currency} \${totalSpent}\`,
      fontSize: 18
    },
    plugins: {
      datalabels: {
        formatter: (value, ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b);
          const pct = ((value / total) * 100).toFixed(1);
          return \`\${pct}%\`;
        },
        color: '#fff',
        font: { size: 14 }
      }
    }
  }
};

const url = 'https://quickchart.io/chart?c='
  + encodeURIComponent(JSON.stringify(chartConfig))
  + '&w=600&h=400&bkg=white';

return [{ json: { chartUrl: url } }];`,
        caption: 'Generate a pie chart URL from spending data — QuickChart renders it as PNG',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Downloading the Chart Image',
      },
      {
        type: 'text',
        value: 'Use an HTTP Request node to download the chart image as binary data that Telegram can send:',
      },
      {
        type: 'code',
        language: 'text',
        code: `HTTP Request Node:
─────────────────────────────────
Method:          GET
URL:             {{ $json.chartUrl }}
Response Format: File
Output Property: chartImage
─────────────────────────────────`,
        caption: 'Download the rendered chart as a PNG image',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Chart Type Options',
        text: 'QuickChart supports many chart types: "pie" for category breakdown, "bar" for comparison across weeks, "line" for spending trends over time, and "doughnut" for a more modern pie chart look. Mix chart types in your weekly vs. monthly reports for variety.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Bar Chart for Comparison',
        text: 'For monthly reports, use a bar chart to compare spending by category across months. This makes it easy to spot trends like "Food spending increased 30% from February to March."',
      },
    ],
  },

  // ==========================================================================
  // LESSON 15.9: AI-Powered Financial Summaries
  // ==========================================================================
  {
    id: 'lesson-15-9',
    moduleId: 'module-15',
    title: 'AI-Powered Financial Summaries',
    estimatedTime: 2,
    order: 9,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'Numbers and charts tell part of the story, but a natural language summary makes the data actionable. The AI analyzes your spending patterns and provides insights, warnings, and suggestions — like a personal financial advisor that reviews your weekly spending.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Summarization Prompt',
      },
      {
        type: 'text',
        value: 'Feed the aggregated spending data to an AI model with a prompt that requests specific insights:',
      },
      {
        type: 'code',
        language: 'text',
        code: `You are a personal finance assistant. Analyze this
weekly spending summary and provide a brief, helpful report.

Data:
Total spent: {{ currency }} {{ totalSpent }}
Transaction count: {{ transactionCount }}

Breakdown by category:
{{ categories as formatted list }}

In your response, include:
1. A one-sentence spending overview
2. Your top spending category and whether it seems normal
3. Any notable patterns or concerns
4. One specific, actionable suggestion for next week

Keep the tone friendly and constructive. Use emojis
sparingly for readability. Maximum 200 words.`,
        caption: 'The summarization prompt produces actionable financial insights',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Example AI Summary Output',
      },
      {
        type: 'code',
        language: 'text',
        code: `📊 Weekly Spending Report (Mar 15-21)

You spent EGP 2,450 across 18 transactions this week.

Your biggest category was Food (42% - EGP 1,029), which
is slightly above your 4-week average of EGP 890. This
spike was driven by 3 restaurant visits.

Transport was your second-highest at EGP 520 (21%),
consistent with previous weeks.

Notable: You had 5 Shopping transactions totaling EGP 380.
These were all under EGP 100 each — small purchases that
add up quickly.

💡 Suggestion: Try meal-prepping on Sunday to reduce
restaurant spending next week. Your food budget would
drop by ~EGP 300 if you cook 3 of those meals at home.`,
        caption: 'AI-generated weekly financial summary with actionable advice',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Composing the Final Telegram Message',
      },
      {
        type: 'text',
        value: 'Combine the AI summary with the chart image into a single Telegram message:',
      },
      {
        type: 'list',
        items: [
          'Use the Telegram "Send Photo" operation to send the chart image',
          'Include the AI summary as the photo caption',
          'If the summary exceeds Telegram\'s 1024-character caption limit, send it as a separate text message after the image',
          'Use Telegram\'s markdown formatting for bold headers and bullet points',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Historical Comparison',
        text: 'For more powerful insights, include last week\'s or last month\'s data in the AI prompt. The model can then compare periods and highlight trends: "Your food spending is up 15% compared to last week" or "You\'ve reduced transport costs for 3 consecutive weeks."',
      },
    ],
  },

  // ==========================================================================
  // LESSON 15.10: Advanced: Multi-currency & Budget Alerts
  // ==========================================================================
  {
    id: 'lesson-15-10',
    moduleId: 'module-15',
    title: 'Advanced: Multi-currency & Budget Alerts',
    estimatedTime: 3,
    order: 10,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'The basic financial tracker captures and reports on expenses. In this final lesson, we\'ll add advanced features that transform it from a simple tracker into a proactive financial management tool — multi-currency support, budget alerts, and real-time spending limits.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Multi-Currency Support',
      },
      {
        type: 'text',
        value: 'If you deal with multiple currencies (traveling, international purchases), your tracker needs to normalize amounts for accurate reporting. Add a currency conversion step:',
      },
      {
        type: 'code',
        language: 'text',
        code: `[AI Extraction: amount=45, currency=EUR]
         │
         ▼
[HTTP Request: Exchange Rate API]
   GET https://api.exchangerate-api.com/v4/latest/EUR
         │
         ▼
[Code Node: Convert to base currency]
   // Convert EUR 45 to EGP at current rate
   const rate = $json.rates.EGP;  // e.g., 51.2
   const converted = 45 * rate;    // = 2,304 EGP
         │
         ▼
[Notion: Save both original and converted amounts]
   Amount (Original): 45 EUR
   Amount (EGP):      2,304 EGP`,
        caption: 'Convert foreign currencies to your base currency using live exchange rates',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Budget Alert System',
      },
      {
        type: 'text',
        value: 'Set spending limits per category and get alerted when you\'re approaching or exceeding them. This requires checking cumulative spending after each transaction:',
      },
      {
        type: 'code',
        language: 'javascript',
        code: `// Code node: Check budget limits after saving transaction
const category = $input.first().json.category;
const amount = $input.first().json.amount;

// Budget limits per category (monthly)
const budgets = {
  Food: 3000,
  Transport: 1500,
  Shopping: 2000,
  Entertainment: 1000,
  Utilities: 800,
  Healthcare: 500,
  Other: 1000
};

// Get current month's total for this category
// (passed from a Notion query node)
const monthlyTotal = $input.first().json.monthlyTotal;
const budget = budgets[category] || 1000;
const percentUsed = (monthlyTotal / budget) * 100;

let alert = null;

if (percentUsed >= 100) {
  alert = \`🚨 OVER BUDGET: \${category} spending is at \${percentUsed.toFixed(0)}% (\${monthlyTotal}/\${budget})\`;
} else if (percentUsed >= 80) {
  alert = \`⚠️ WARNING: \${category} spending is at \${percentUsed.toFixed(0)}% of budget (\${monthlyTotal}/\${budget})\`;
}

return [{ json: { alert, percentUsed, category } }];`,
        caption: 'Check spending against budget limits and generate alerts',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Real-Time Alerts via Telegram',
      },
      {
        type: 'text',
        value: 'When a budget threshold is crossed, send an immediate alert to your Telegram:',
      },
      {
        type: 'list',
        items: [
          '80% threshold — Yellow warning: "You\'ve used 80% of your Food budget this month"',
          '100% threshold — Red alert: "You\'ve exceeded your Shopping budget by 15%"',
          'Weekly pace check — "At your current pace, you\'ll exceed your Transport budget by March 28th"',
          'Unusual transaction — "This transaction (EGP 1,200 at Electronics Store) is larger than your typical Shopping purchase"',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'Extending the System',
      },
      {
        type: 'list',
        items: [
          'Recurring expenses — Detect and auto-categorize recurring transactions (monthly subscriptions)',
          'Tax categorization — Tag business expenses for tax deduction tracking',
          'Shared expenses — Split transactions between multiple people and track who owes what',
          'Goal tracking — Set savings goals and track progress ("You\'ve saved 65% of your vacation fund")',
          'Bank integration — Connect directly to bank APIs for automatic transaction import',
        ],
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Congratulations!',
        text: 'You\'ve built a complete AI-powered financial tracker — from snapping a receipt photo to getting weekly spending reports with charts and actionable insights. This system removes all friction from expense tracking, making financial awareness effortless.',
      },
    ],
  },
];
