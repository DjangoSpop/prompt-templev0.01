/**
 * Module 13: WhatsApp AI Chatbot
 * Duration: 25 minutes | 10 Lessons
 */

import type { Lesson } from '../../types';

export const module13Lessons: Lesson[] = [
  // ==========================================================================
  // LESSON 13.1: Introduction to WhatsApp Automation
  // ==========================================================================
  {
    id: 'lesson-13-1',
    moduleId: 'module-13',
    title: 'Introduction to WhatsApp Automation',
    estimatedTime: 2,
    order: 1,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'WhatsApp is the world\'s most popular messaging platform with over 2 billion users. Building an AI chatbot for WhatsApp gives you access to the channel where people already spend most of their messaging time — no app downloads, no new interfaces, just natural conversation.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Why WhatsApp for AI Chatbots?',
      },
      {
        type: 'list',
        items: [
          'Ubiquity — 2+ billion active users worldwide. Your customers are already on WhatsApp.',
          'Rich media support — Text, voice, images, documents, video, and location sharing.',
          'Business API — Official API for business communication with templates, labels, and analytics.',
          'End-to-end encryption — Messages are secure by default, building user trust.',
          'No friction — Users don\'t need to download anything new or create new accounts.',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'What We\'re Building',
      },
      {
        type: 'text',
        value: 'This isn\'t a basic text-only chatbot. We\'re building a production-ready WhatsApp AI assistant that handles ALL message types:',
      },
      {
        type: 'code',
        language: 'text',
        code: `WhatsApp AI Chatbot — Message Type Support:
═══════════════════════════════════════════

📝 Text Messages
   → AI processes and responds with text

🎤 Voice Messages
   → Whisper transcribes → AI processes → Voice reply

📸 Images
   → GPT-4o Vision analyzes → AI describes/responds

📄 PDF Documents
   → Text extraction → AI processes content

Architecture:
─────────────────────────────────────────
[WhatsApp Trigger]
         │
         ▼
[Message Type Router (IF/Switch)]
   ┌─────┼─────┬──────┐
   │     │     │      │
  Text  Audio Image   PDF
   │     │     │      │
   ▼     ▼     ▼      ▼
[Direct] [Whisper] [Vision] [Extract]
[to AI]  [STT]    [Analyze] [Text]
   │     │     │      │
   └─────┴─────┴──────┘
         │
         ▼
[AI Agent with Memory]
         │
         ▼
[WhatsApp: Send Reply]`,
        caption: 'Multi-modal WhatsApp bot architecture handling text, voice, image, and PDF messages',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Real-World Use Cases',
        text: 'This architecture powers customer support bots (answer questions from text, voice, or document photos), document processing assistants (extract info from PDFs and images), voice-first interfaces for hands-free operation, and internal company knowledge bases accessible via WhatsApp.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Prerequisites',
      },
      {
        type: 'list',
        items: [
          'A Meta Developer account (developers.facebook.com)',
          'A WhatsApp Business Account',
          'An OpenAI API key (for GPT-4o-mini, Whisper, and GPT-4o Vision)',
          'An n8n instance with a public URL (for webhook delivery)',
          'A phone number to associate with your WhatsApp Business account',
        ],
      },
    ],
  },

  // ==========================================================================
  // LESSON 13.2: WhatsApp Business API Setup
  // ==========================================================================
  {
    id: 'lesson-13-2',
    moduleId: 'module-13',
    title: 'WhatsApp Business API Setup',
    estimatedTime: 3,
    order: 2,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'The WhatsApp Business API is the official way to build automated WhatsApp experiences. Unlike the regular WhatsApp app, the Business API supports webhooks, message templates, and programmatic sending — everything needed for a production chatbot.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Setting Up via Meta Developer Portal',
      },
      {
        type: 'list',
        items: [
          'Go to developers.facebook.com and create a Meta Developer account',
          'Create a new App — select "Business" as the app type',
          'Add the "WhatsApp" product to your app from the product catalog',
          'You\'ll receive a temporary phone number and access token for testing',
          'Configure a webhook URL pointing to your n8n instance',
          'Subscribe to the "messages" webhook field',
        ],
        ordered: true,
      },
      {
        type: 'code',
        language: 'text',
        code: `Meta Developer Portal Setup Steps:
═══════════════════════════════════

Step 1: Create App
  App Type: Business
  App Name: "My WhatsApp Bot"

Step 2: Add WhatsApp Product
  Dashboard → Add Products → WhatsApp → Set Up

Step 3: Get Credentials
  Temporary Access Token: EAABx...  (valid 24 hrs)
  Phone Number ID:        1234567890
  WhatsApp Business ID:   9876543210

Step 4: Configure Webhook
  Callback URL:  https://your-n8n.com/webhook/whatsapp
  Verify Token:  your-custom-verify-string
  Subscribe to:  messages

Step 5: Generate Permanent Token
  System Users → Generate Token → whatsapp_business_messaging`,
        caption: 'Step-by-step Meta Developer Portal configuration for WhatsApp API access',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Temporary vs. Permanent Access Tokens',
        text: 'The temporary access token expires after 24 hours — fine for testing but useless for production. Generate a permanent System User token from Business Settings → System Users. This token does not expire and is required for a production bot.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Webhook Verification',
      },
      {
        type: 'text',
        value: 'When you configure the webhook URL, Meta sends a verification request. Your n8n workflow must respond correctly:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Webhook Verification Flow:
─────────────────────────

Meta sends GET request:
  GET /webhook/whatsapp?
    hub.mode=subscribe&
    hub.verify_token=your-custom-verify-string&
    hub.challenge=1234567890

Your n8n must respond:
  Status: 200
  Body: 1234567890  (echo the challenge value)

After verification, Meta sends POST requests
for incoming messages to the same URL.`,
        caption: 'Meta verifies your webhook by sending a challenge that must be echoed back',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Connecting to n8n',
      },
      {
        type: 'list',
        items: [
          'In n8n, create a WhatsApp Business credential with your access token',
          'Add a "WhatsApp Trigger" node (or a generic Webhook node for custom handling)',
          'Set the webhook path to match what you configured in the Meta portal',
          'Test by sending a message from your personal WhatsApp to the bot number',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Testing with the Meta Test Number',
        text: 'During development, Meta provides a test phone number. You can send messages to it from your personal WhatsApp. Up to 5 test recipient numbers can be configured. This avoids the need for a dedicated business phone number during development.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 13.3: Message Type Detection and Routing
  // ==========================================================================
  {
    id: 'lesson-13-3',
    moduleId: 'module-13',
    title: 'Message Type Detection and Routing',
    estimatedTime: 3,
    order: 3,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'The most critical architectural decision in a multi-modal WhatsApp bot is routing. When a message arrives, the workflow must detect its type and send it down the correct processing branch. Text, voice, images, and documents each require completely different processing pipelines.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'WhatsApp Message Structure',
      },
      {
        type: 'text',
        value: 'Every WhatsApp webhook payload includes a "type" field that identifies the message type:',
      },
      {
        type: 'code',
        language: 'json',
        code: `// Text message payload
{
  "messaging_product": "whatsapp",
  "messages": [{
    "id": "wamid.abc123",
    "from": "1234567890",
    "timestamp": "1679000000",
    "type": "text",
    "text": { "body": "Hello, I need help" }
  }]
}

// Voice message payload
{
  "messages": [{
    "type": "audio",
    "audio": {
      "id": "media_id_123",
      "mime_type": "audio/ogg; codecs=opus"
    }
  }]
}

// Image message payload
{
  "messages": [{
    "type": "image",
    "image": {
      "id": "media_id_456",
      "mime_type": "image/jpeg",
      "caption": "What is this?"
    }
  }]
}

// Document message payload
{
  "messages": [{
    "type": "document",
    "document": {
      "id": "media_id_789",
      "mime_type": "application/pdf",
      "filename": "report.pdf"
    }
  }]
}`,
        caption: 'Different message types have different payload structures',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Building the Router',
      },
      {
        type: 'text',
        value: 'Use n8n\'s Switch node (or chained IF nodes) to route messages by type:',
      },
      {
        type: 'code',
        language: 'text',
        code: `[WhatsApp Trigger]
         │
         ▼
[Switch Node: Message Type]
  Routing Rules:
  ─────────────────────────
  Rule 1: {{ $json.type }} === "text"     → Output 1
  Rule 2: {{ $json.type }} === "audio"    → Output 2
  Rule 3: {{ $json.type }} === "image"    → Output 3
  Rule 4: {{ $json.type }} === "document" → Output 4
  Default: → Output 5 (unsupported type)

         ┌──────┬──────┬──────┬──────┐
         │      │      │      │      │
        Text  Audio  Image   Doc   Other
         │      │      │      │      │
         ▼      ▼      ▼      ▼      ▼
      [Direct] [STT] [Vision] [PDF] [Reply:
      [pass]   [→AI] [→AI]   [→AI] "Unsupported
         │      │      │      │    type"]
         └──────┴──────┴──────┘
                    │
                    ▼
              [AI Agent]`,
        caption: 'The Switch node routes each message type to its specialized processing branch',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Handle Unsupported Types Gracefully',
        text: 'WhatsApp supports many message types: text, image, audio, video, document, location, contacts, stickers. Your bot should handle the ones it supports and send a friendly "I can handle text, voice, images, and PDFs" message for anything else.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Extracting the Sender Information',
      },
      {
        type: 'text',
        value: 'Before routing, extract key metadata that all branches will need:',
      },
      {
        type: 'list',
        items: [
          'Phone number — {{ $json.messages[0].from }} — Used as user ID and reply target',
          'Message ID — {{ $json.messages[0].id }} — Used for message acknowledgment',
          'Timestamp — {{ $json.messages[0].timestamp }} — For logging and memory',
          'Message type — {{ $json.messages[0].type }} — The routing key',
          'Display name — {{ $json.contacts[0].profile.name }} — For personalized responses',
        ],
      },
    ],
  },

  // ==========================================================================
  // LESSON 13.4: Handling Text Messages with AI
  // ==========================================================================
  {
    id: 'lesson-13-4',
    moduleId: 'module-13',
    title: 'Handling Text Messages with AI',
    estimatedTime: 2,
    order: 4,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Text messages are the simplest message type to handle — the content is directly available as a string. The message body is passed straight to the AI Agent for processing and response generation.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Text Message Processing Flow',
      },
      {
        type: 'code',
        language: 'text',
        code: `Text Message Branch:
═══════════════════

[Switch: type === "text"]
         │
         ▼
[Set Node: Extract message]
  userMessage = {{ $json.messages[0].text.body }}
  userId = {{ $json.messages[0].from }}
  userName = {{ $json.contacts[0].profile.name }}
         │
         ▼
[AI Agent with Memory]
  Input: userMessage
  Session Key: userId
         │
         ▼
[WhatsApp: Send Text Reply]
  To: userId
  Body: {{ $json.output }}`,
        caption: 'Text messages flow directly from extraction to AI to reply',
      },
      {
        type: 'heading',
        level: 2,
        value: 'System Prompt for WhatsApp Context',
      },
      {
        type: 'text',
        value: 'The AI Agent\'s system prompt should account for WhatsApp\'s messaging context:',
      },
      {
        type: 'code',
        language: 'text',
        code: `WhatsApp Bot System Prompt:
─────────────────────────────────
You are a helpful AI assistant communicating via WhatsApp.

Important guidelines:
- Keep responses concise — WhatsApp is a chat platform,
  not an email client
- Use short paragraphs (1-2 sentences each)
- Use WhatsApp formatting: *bold*, _italic_, ~strikethrough~,
  \`\`\`code blocks\`\`\`
- Use bullet points with "• " for lists
- Maximum response length: 500 characters unless the user
  asks for detailed information
- Be conversational and friendly — match WhatsApp's casual tone
- If the user sends a greeting, respond briefly and ask
  how you can help

User's name: {{ $json.userName }}`,
        caption: 'System prompt optimized for WhatsApp\'s messaging format and culture',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'WhatsApp Formatting',
        text: 'WhatsApp supports basic formatting: *bold*, _italic_, ~strikethrough~, and ```code blocks```. Your AI should use these naturally in responses. Unlike Markdown, WhatsApp does NOT support headers, links, or images inline in text messages.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Handling Common Text Patterns',
      },
      {
        type: 'list',
        items: [
          'Greetings (hi, hello, hey) — Respond with a brief greeting and offer help',
          'Questions — Use the AI Agent\'s reasoning to provide helpful answers',
          'Commands (/help, /status) — Parse and route to specific handlers',
          'Follow-ups — Window Buffer Memory maintains conversation context',
          'Long messages — The AI summarizes and addresses key points',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Read Receipts',
        text: 'Mark messages as "read" immediately when received by calling the WhatsApp API with status: "read". This gives users feedback that their message was received while the AI processes the response.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 13.5: Voice Message Transcription with Whisper
  // ==========================================================================
  {
    id: 'lesson-13-5',
    moduleId: 'module-13',
    title: 'Voice Message Transcription with Whisper',
    estimatedTime: 3,
    order: 5,
    xpReward: 30,
    content: [
      {
        type: 'text',
        value: 'Voice messages are hugely popular on WhatsApp — many users prefer speaking over typing. To handle voice messages, we download the audio file, transcribe it using OpenAI\'s Whisper model, then send the transcription to the AI Agent as if it were a text message.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Voice Message Processing Pipeline',
      },
      {
        type: 'code',
        language: 'text',
        code: `Voice Message Branch:
═══════════════════════

[Switch: type === "audio"]
         │
         ▼
[HTTP Request: Download Audio]
  GET https://graph.facebook.com/v18.0/{{ mediaId }}
  Headers: Authorization: Bearer {{ accessToken }}
  → Returns: download URL
         │
         ▼
[HTTP Request: Download File]
  GET {{ downloadUrl }}
  Response Format: File (binary)
  → Returns: audio binary data (OGG/Opus format)
         │
         ▼
[OpenAI: Whisper Transcription]
  Model: whisper-1
  Input: audio binary
  Language: auto-detect (or specify)
  → Returns: { "text": "transcribed message" }
         │
         ▼
[AI Agent with Memory]
  Input: transcribed text
  Session Key: userId
         │
         ▼
[WhatsApp: Send Text Reply]
  (or optionally: Send Voice Reply)`,
        caption: 'Voice messages are downloaded, transcribed with Whisper, then processed as text',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Downloading WhatsApp Media',
      },
      {
        type: 'text',
        value: 'WhatsApp media download is a two-step process. First, get the download URL using the media ID, then download the actual file:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Step 1: Get Download URL
─────────────────────────
GET https://graph.facebook.com/v18.0/{media_id}
Authorization: Bearer {access_token}

Response:
{
  "url": "https://lookaside.fbsbx.com/whatsapp/...",
  "mime_type": "audio/ogg; codecs=opus",
  "sha256": "abc123...",
  "file_size": 15234,
  "id": "media_id_123"
}

Step 2: Download the File
─────────────────────────
GET {url from step 1}
Authorization: Bearer {access_token}

Response: Binary audio data`,
        caption: 'Two-step media download: get URL, then download the binary file',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Media URL Expiration',
        text: 'WhatsApp media download URLs are temporary — they expire after a few minutes. Always download the media immediately when the webhook fires. Never store the URL for later processing.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Whisper Transcription Configuration',
      },
      {
        type: 'code',
        language: 'text',
        code: `OpenAI Whisper Node Configuration:
─────────────────────────────────
Resource:   Audio
Operation:  Transcribe
Model:      whisper-1
Language:   (leave empty for auto-detect)
Input:      Binary data from HTTP download
Format:     json

Cost: ~$0.006 per minute of audio
Speed: ~1-3 seconds for typical voice messages`,
        caption: 'Whisper transcription settings — fast and cheap for voice message processing',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Optional: Voice Reply',
      },
      {
        type: 'text',
        value: 'For a fully voice-native experience, you can send the AI\'s response back as a voice message using text-to-speech:',
      },
      {
        type: 'list',
        items: [
          'Pass the AI response text to OpenAI TTS (Text-to-Speech) API',
          'Use the "tts-1" model with a natural voice (alloy, echo, fable, onyx, nova, or shimmer)',
          'Upload the generated audio to WhatsApp via the Media Upload API',
          'Send as an audio message instead of text',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Multilingual Support',
        text: 'Whisper supports 50+ languages with automatic detection. This means your WhatsApp bot can handle voice messages in any language without configuration changes. The AI Agent can even respond in the detected language for a seamless multilingual experience.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 13.6: Image Analysis with GPT-4 Vision
  // ==========================================================================
  {
    id: 'lesson-13-6',
    moduleId: 'module-13',
    title: 'Image Analysis with GPT-4 Vision',
    estimatedTime: 3,
    order: 6,
    xpReward: 30,
    content: [
      {
        type: 'text',
        value: 'When users send images to your WhatsApp bot, you can analyze them using GPT-4o\'s vision capabilities. This opens up powerful use cases: identifying objects, reading text from photos, analyzing screenshots, describing scenes, and answering questions about images.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Image Processing Pipeline',
      },
      {
        type: 'code',
        language: 'text',
        code: `Image Message Branch:
═══════════════════════

[Switch: type === "image"]
         │
         ▼
[HTTP Request: Get Media URL]
  GET /v18.0/{{ image.id }}
         │
         ▼
[HTTP Request: Download Image]
  Response Format: File (binary)
         │
         ▼
[Code Node: Base64 Encode]
  const base64 = $binary.data.toString('base64');
  const mimeType = $json.image.mime_type;
  return {
    imageData: \`data:\${mimeType};base64,\${base64}\`
  };
         │
         ▼
[OpenAI: GPT-4o Vision]
  Model: gpt-4o
  Messages: [
    { role: "user", content: [
      { type: "text", text: caption || "Describe this image" },
      { type: "image_url", url: base64Data }
    ]}
  ]
         │
         ▼
[AI Agent: Process vision output + conversation context]
         │
         ▼
[WhatsApp: Send Reply]`,
        caption: 'Images are downloaded, Base64-encoded, and analyzed by GPT-4o Vision',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Base64 Encoding for Vision API',
      },
      {
        type: 'text',
        value: 'GPT-4o Vision accepts images as Base64-encoded data URLs. The Code node converts the downloaded binary to this format:',
      },
      {
        type: 'code',
        language: 'javascript',
        code: `// n8n Code Node — Convert binary image to Base64
const binaryData = items[0].binary.data;
const base64String = Buffer.from(
  binaryData.data, 'base64'
).toString('base64');

const mimeType = binaryData.mimeType || 'image/jpeg';
const dataUrl = \`data:\${mimeType};base64,\${base64String}\`;

return [{
  json: {
    imageData: dataUrl,
    caption: $input.first().json.image?.caption ||
             'What is in this image?'
  }
}];`,
        caption: 'Converting the downloaded image binary to a Base64 data URL for the Vision API',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Vision API Configuration',
      },
      {
        type: 'code',
        language: 'json',
        code: `{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "The user sent this image via WhatsApp with the caption: '{{ caption }}'. Analyze the image and respond helpfully."
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "{{ imageData }}",
            "detail": "auto"
          }
        }
      ]
    }
  ],
  "max_tokens": 500
}`,
        caption: 'GPT-4o Vision API request with both text prompt and image data',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Image Captions',
        text: 'WhatsApp allows users to add captions to images. If a caption is present, use it as the prompt context: "The user sent this image with the caption: [caption]. Analyze accordingly." If no caption, default to a general analysis prompt.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Use Cases for Image Analysis',
      },
      {
        type: 'list',
        items: [
          'Product identification — "What is this product and where can I buy it?"',
          'Text extraction (OCR) — Reading text from photos of documents, receipts, or signs',
          'Technical support — Analyzing screenshots of error messages or UI issues',
          'Food & nutrition — Identifying dishes and estimating nutritional content',
          'Medical preliminary — Describing skin conditions or symptoms (with appropriate disclaimers)',
          'Homework help — Solving math problems or explaining diagrams from photos',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Vision API Costs',
        text: 'GPT-4o Vision is more expensive than text-only calls. Each image analysis costs roughly $0.01-0.03 depending on image size and detail level. Set the "detail" parameter to "low" for cost-sensitive applications or "high" for maximum accuracy.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 13.7: PDF Document Processing
  // ==========================================================================
  {
    id: 'lesson-13-7',
    moduleId: 'module-13',
    title: 'PDF Document Processing',
    estimatedTime: 2,
    order: 7,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'PDF processing transforms your WhatsApp bot from a simple chat assistant into a document analysis tool. Users can send contracts, reports, invoices, or any PDF, and the bot will extract the text and answer questions about the content.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'PDF Processing Pipeline',
      },
      {
        type: 'code',
        language: 'text',
        code: `PDF Document Branch:
═══════════════════════

[Switch: type === "document" AND mime_type contains "pdf"]
         │
         ▼
[HTTP Request: Get Media URL]
  GET /v18.0/{{ document.id }}
         │
         ▼
[HTTP Request: Download PDF]
  Response Format: File (binary)
         │
         ▼
[Extract from File Node]
  Operation: Extract Text from PDF
  Input: Binary PDF data
  → Output: { text: "full PDF content..." }
         │
         ▼
[AI Agent]
  Input: "The user sent a PDF titled '{{ filename }}'.
          Here is the extracted content:
          {{ extractedText }}

          Please summarize and answer any questions."
         │
         ▼
[WhatsApp: Send Reply]`,
        caption: 'PDFs are downloaded, text is extracted, then sent to the AI for analysis',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The extractFromFile Node',
      },
      {
        type: 'text',
        value: 'n8n\'s Extract from File node handles PDF text extraction natively:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Extract from File Node Configuration:
─────────────────────────────────
Operation:       Extract Text
Input Format:    PDF
Binary Property: data
Output:          Text content of the PDF

Supported formats:
  ✓ PDF (text-based)
  ✓ PDF (with OCR for scanned documents)
  ✓ DOCX, XLSX, PPTX
  ✓ CSV, TXT
  ✗ Password-protected PDFs`,
        caption: 'The Extract from File node supports multiple document formats',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Scanned PDFs',
        text: 'If the PDF contains scanned images rather than selectable text, the basic text extraction will return empty results. For scanned documents, route the PDF through GPT-4o Vision instead — convert each page to an image and use Vision to read the text.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Handling Large PDFs',
      },
      {
        type: 'text',
        value: 'Large PDFs can exceed the AI\'s context window. Handle this with chunking:',
      },
      {
        type: 'list',
        items: [
          'If extracted text is under 10,000 tokens — Send the full text to the AI',
          'If 10,000-50,000 tokens — Summarize in chunks, then send the summary',
          'If over 50,000 tokens — Extract only the first and last pages, plus a table of contents if available',
          'Always tell the user the document length and whether the full content was processed',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'Common PDF Use Cases',
      },
      {
        type: 'list',
        items: [
          'Contract review — "Summarize the key terms of this contract"',
          'Invoice processing — "Extract the total amount, date, and vendor from this invoice"',
          'Report analysis — "What are the main findings in this research report?"',
          'Resume screening — "Summarize this candidate\'s qualifications"',
          'Academic papers — "Explain the methodology section in simple terms"',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Document Memory',
        text: 'Store the extracted PDF text in the conversation\'s memory so users can ask follow-up questions about the document. "What did page 3 say about revenue?" should work even if the PDF was sent several messages ago.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 13.8: Building the AI Agent with Memory
  // ==========================================================================
  {
    id: 'lesson-13-8',
    moduleId: 'module-13',
    title: 'Building the AI Agent with Memory',
    estimatedTime: 3,
    order: 8,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'All message type branches converge at the AI Agent. Whether the input came from text, transcribed voice, image analysis, or PDF extraction, the agent processes it with full conversation context and generates an appropriate response.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Convergence Architecture',
      },
      {
        type: 'code',
        language: 'text',
        code: `All branches converge at the AI Agent:
═══════════════════════════════════════

Text ──→ "Hello, I need help with..." ──┐
                                          │
Voice ──→ [Whisper] → "Can you check..." ─┤
                                          │
Image ──→ [Vision] → "Image shows a..." ──┤
                                          │
PDF ──→ [Extract] → "Document contains..." ┘
                                          │
                                          ▼
                                   [Merge Node]
                                          │
                                          ▼
                                   [AI Agent]
                                    ├── Memory: Window Buffer
                                    ├── System Prompt
                                    └── Tools (optional)
                                          │
                                          ▼
                                   [WhatsApp Reply]`,
        caption: 'All processing branches merge before reaching the AI Agent',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Agent Configuration for WhatsApp',
      },
      {
        type: 'code',
        language: 'text',
        code: `AI Agent Node Configuration:
─────────────────────────────────
Agent Type:     Tools Agent
LLM:            GPT-4o-mini
Temperature:    0.7

System Prompt:
"You are a WhatsApp AI assistant. You help users with
questions, analyze images they send, process documents,
and handle voice messages.

Current context:
- Message type: {{ $json.messageType }}
- User name: {{ $json.userName }}
- User phone: {{ $json.userPhone }}

Guidelines:
- Keep responses under 500 characters for text queries
- For document analysis, provide structured summaries
- For image analysis, describe what you see clearly
- Use WhatsApp formatting: *bold*, _italic_
- Be helpful, concise, and conversational"

Memory:
  Type: Window Buffer
  Window Size: 15
  Session Key: {{ $json.userPhone }}`,
        caption: 'Agent configuration with WhatsApp-specific system prompt and phone-based sessions',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Message Type Context in Prompts',
      },
      {
        type: 'text',
        value: 'The agent should know what type of input it\'s processing. Include the message type in the user message:',
      },
      {
        type: 'list',
        items: [
          'Text: Pass the message directly — "Hello, I need help"',
          'Voice: Prefix with context — "[Voice message transcription]: Can you check the report?"',
          'Image: Include analysis — "[Image analysis]: The image shows a product label with... User caption: What ingredients are in this?"',
          'PDF: Include extraction — "[Document: report.pdf]: The document contains... User wants a summary."',
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Phone Number as Session Key',
        text: 'Unlike Telegram\'s chat ID, WhatsApp uses phone numbers as the unique identifier. Use the sender\'s phone number as the session key for Window Buffer Memory. This ensures each user gets isolated conversation history.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Handling Multi-Turn Conversations',
      },
      {
        type: 'text',
        value: 'The Window Buffer Memory enables natural follow-up conversations:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Multi-turn example:
─────────────────────
User: [sends PDF] "Here's the contract"
Bot:  "I've reviewed the contract. It's a 12-month
       service agreement with XYZ Corp for $50k/year.
       Key terms: 30-day notice period, quarterly
       payments. Want me to highlight anything specific?"

User: "What about the termination clause?"
Bot:  "The termination clause (Section 8.3) states:
       Either party can terminate with 30 days written
       notice. Early termination incurs a fee of 25%
       of remaining contract value."

User: "Is that standard?"
Bot:  "A 25% early termination fee is on the higher
       side. Industry standard is typically 10-15%.
       You might want to negotiate this down."`,
        caption: 'Memory enables natural follow-up questions about previously sent content',
      },
    ],
  },

  // ==========================================================================
  // LESSON 13.9: Sending Responses via WhatsApp API
  // ==========================================================================
  {
    id: 'lesson-13-9',
    moduleId: 'module-13',
    title: 'Sending Responses via WhatsApp API',
    estimatedTime: 2,
    order: 9,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'The final step in the pipeline is sending the AI\'s response back to the user via the WhatsApp Business API. WhatsApp supports various response formats — text, images, documents, audio, templates, and interactive messages.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Sending a Text Reply',
      },
      {
        type: 'code',
        language: 'text',
        code: `WhatsApp Send Message API:
─────────────────────────
POST https://graph.facebook.com/v18.0/{phone_number_id}/messages
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "{{ $json.userPhone }}",
  "type": "text",
  "text": {
    "preview_url": false,
    "body": "{{ $json.aiResponse }}"
  }
}`,
        caption: 'The basic WhatsApp text message API call',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Response Types',
      },
      {
        type: 'text',
        value: 'Depending on the context, your bot can send different response types:',
      },
      {
        type: 'list',
        items: [
          'Text — Standard text response for most conversations',
          'Reaction — React to the user\'s message with an emoji before responding (shows you\'re processing)',
          'Audio — Voice reply generated by TTS for voice message conversations',
          'Image — Send generated images or annotated screenshots',
          'Document — Return processed PDFs or generated reports',
          'Interactive (buttons) — Give users quick-reply options',
          'Interactive (list) — Present menu options for structured navigation',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'Sending a "Typing" Indicator',
      },
      {
        type: 'text',
        value: 'For a better user experience, mark messages as "read" and show a typing indicator while the AI processes:',
      },
      {
        type: 'code',
        language: 'json',
        code: `// Mark message as read
{
  "messaging_product": "whatsapp",
  "status": "read",
  "message_id": "{{ $json.messageId }}"
}

// Note: WhatsApp doesn't support a "typing" indicator
// via the API, but marking as "read" gives users
// feedback that their message was received.`,
        caption: 'Mark messages as read to give users immediate feedback',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Interactive Message Buttons',
      },
      {
        type: 'code',
        language: 'json',
        code: `// Interactive button message
{
  "messaging_product": "whatsapp",
  "to": "{{ userPhone }}",
  "type": "interactive",
  "interactive": {
    "type": "button",
    "body": {
      "text": "I found 3 results. Which one interests you?"
    },
    "action": {
      "buttons": [
        { "type": "reply", "reply": { "id": "opt1", "title": "Option A" } },
        { "type": "reply", "reply": { "id": "opt2", "title": "Option B" } },
        { "type": "reply", "reply": { "id": "opt3", "title": "Option C" } }
      ]
    }
  }
}`,
        caption: 'Interactive buttons provide quick-reply options for structured interactions',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Message Limits',
        text: 'WhatsApp Business API has messaging rules: you can only send messages within a 24-hour window after the user\'s last message. Outside this window, you must use pre-approved Message Templates. Design your bot to always respond within this window.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Long Response Handling',
        text: 'WhatsApp has a 4,096 character limit per message. If the AI generates a longer response (common for document analysis), split it into multiple messages. Send them with a small delay between each to maintain reading order.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 13.10: Production Configuration & Security
  // ==========================================================================
  {
    id: 'lesson-13-10',
    moduleId: 'module-13',
    title: 'Production Configuration & Security',
    estimatedTime: 3,
    order: 10,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'A WhatsApp bot handles sensitive user data — messages, voice recordings, documents, and images. Going to production requires careful attention to security, reliability, and compliance with WhatsApp\'s business policies.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Security Checklist',
      },
      {
        type: 'list',
        items: [
          'Webhook verification — Always validate the X-Hub-Signature-256 header on incoming webhooks to ensure requests come from Meta',
          'Token security — Store the WhatsApp access token as an encrypted n8n credential, never in workflow data',
          'Input validation — Sanitize all user input before processing. Reject payloads that don\'t match expected formats.',
          'Rate limiting — Limit requests per phone number to prevent abuse (e.g., max 20 messages/minute)',
          'Data privacy — Don\'t log message content in production. If logging is needed, anonymize phone numbers.',
          'HTTPS only — Your webhook endpoint must use HTTPS. Meta rejects HTTP webhook URLs.',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'Webhook Signature Verification',
      },
      {
        type: 'code',
        language: 'javascript',
        code: `// n8n Code Node — Verify webhook signature
const crypto = require('crypto');
const appSecret = $env.WHATSAPP_APP_SECRET;
const signature = $headers['x-hub-signature-256'];
const payload = JSON.stringify($json);

const expectedSignature = 'sha256=' +
  crypto.createHmac('sha256', appSecret)
    .update(payload)
    .digest('hex');

if (signature !== expectedSignature) {
  throw new Error('Invalid webhook signature');
}

return items; // Continue if valid`,
        caption: 'Verify every incoming webhook request to prevent unauthorized access',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Error Handling and Recovery',
      },
      {
        type: 'code',
        language: 'text',
        code: `Production Error Handling Flow:
═══════════════════════════════

[WhatsApp Trigger]
         │
         ▼
[Signature Verification]
  ├── Invalid → [Log + Drop]
  └── Valid ──→
         │
         ▼
[Try Block]
  ├── [Message Router]
  ├── [Processing Branches]
  ├── [AI Agent]
  └── [Send Reply]
         │
    ┌────┴────┐
  Success   Error
    │         │
    ▼         ▼
  [Done]   [Error Handler]
             ├── Log error with context
             ├── Send to user:
             │   "Sorry, I encountered an error
             │    processing your message. Please
             │    try again."
             └── Alert admin if error rate > threshold`,
        caption: 'Comprehensive error handling ensures the bot always responds, even when things fail',
      },
      {
        type: 'heading',
        level: 2,
        value: 'WhatsApp Business Policy Compliance',
      },
      {
        type: 'list',
        items: [
          '24-hour window — You can only message users within 24 hours of their last message. Use Message Templates for outbound.',
          'No spam — WhatsApp monitors message quality. High block/report rates can get your number banned.',
          'Opt-in required — Users must explicitly opt in to receive messages from your business.',
          'Business verification — For production volume, complete Meta\'s Business Verification process.',
          'Quality rating — Monitor your phone number\'s quality rating in the WhatsApp Business Manager.',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'Scaling for Production',
      },
      {
        type: 'list',
        items: [
          'Message queuing — Use n8n\'s queue mode to handle concurrent messages without dropping any',
          'Multiple workers — Scale n8n horizontally for high-volume bots (100+ concurrent users)',
          'Media caching — Cache frequently requested media to reduce API calls and latency',
          'Database memory — Replace in-memory Window Buffer with PostgreSQL for persistence',
          'Monitoring — Track response latency, error rates, and API costs with Grafana or similar',
        ],
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Congratulations!',
        text: 'You\'ve built a production-ready WhatsApp AI chatbot that handles text, voice, images, and documents. This is one of the most versatile AI automation patterns — the same multi-modal architecture can be adapted for any messaging platform.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What\'s Next?',
      },
      {
        type: 'list',
        items: [
          'Add video message support — Process short video clips with GPT-4o Vision',
          'Implement location handling — Accept location shares and provide location-based responses',
          'Build a CRM integration — Log conversations and customer data to HubSpot or Salesforce',
          'Create message templates — Design approved templates for proactive outreach beyond the 24-hour window',
          'Deploy multi-language support — Auto-detect language and respond in the user\'s preferred language',
        ],
      },
    ],
  },
];
