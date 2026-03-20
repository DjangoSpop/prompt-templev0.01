/**
 * Module 13: WhatsApp AI Chatbot — Quiz
 * 6 Questions | 70% Passing Score | 50 XP Reward
 */

import type { Quiz } from '../../types';

export const module13Quiz: Quiz = {
  id: 'quiz-module-13',
  moduleId: 'module-13',
  title: 'The WhatsApp Bot Trial',
  description: 'Test your knowledge of building a multi-modal WhatsApp AI chatbot that handles text, voice, images, and documents.',
  passingScore: 70,
  xpReward: 50,
  questions: [
    {
      id: 'q-13-1',
      question: 'What node is used to route incoming WhatsApp messages to the correct processing branch based on message type?',
      type: 'multiple-choice',
      options: [
        'Merge Node',
        'Switch Node (or IF Node) checking the message type field',
        'Webhook Response Node',
        'Code Node with manual parsing',
      ],
      correctAnswer: '1',
      explanation: 'The Switch node (or chained IF nodes) examines the "type" field in the WhatsApp webhook payload (text, audio, image, document) and routes each message to its specialized processing branch — text goes directly to AI, audio goes to Whisper, images go to Vision, and documents go to text extraction.',
      points: 15,
    },
    {
      id: 'q-13-2',
      question: 'How are voice messages processed in the WhatsApp bot pipeline?',
      type: 'multiple-choice',
      options: [
        'The audio is sent directly to GPT-4 for analysis',
        'The audio is downloaded via HTTP, transcribed using OpenAI Whisper, then the text is sent to the AI Agent',
        'Voice messages are converted to text using WhatsApp\'s built-in transcription',
        'The bot sends a reply asking the user to type their message instead',
      ],
      correctAnswer: '1',
      explanation: 'Voice messages follow a three-step pipeline: (1) Download the audio file from WhatsApp\'s media endpoint via HTTP Request, (2) Send the binary audio to OpenAI\'s Whisper model for transcription, (3) Pass the transcribed text to the AI Agent as if it were a regular text message.',
      points: 15,
    },
    {
      id: 'q-13-3',
      question: 'What must you do with an image before sending it to GPT-4o Vision for analysis?',
      type: 'multiple-choice',
      options: [
        'Compress it to under 100KB',
        'Convert it to PNG format',
        'Download it and encode it as Base64 data URL',
        'Upload it to Google Drive first',
      ],
      correctAnswer: '2',
      explanation: 'GPT-4o Vision accepts images as Base64-encoded data URLs. The pipeline downloads the image binary from WhatsApp\'s media endpoint, then uses a Code node to convert it to a Base64 data URL format (data:image/jpeg;base64,...) that the Vision API can process.',
      points: 20,
    },
    {
      id: 'q-13-4',
      question: 'What is the 24-hour messaging window rule in the WhatsApp Business API?',
      type: 'multiple-choice',
      options: [
        'The bot can only operate for 24 hours before needing a restart',
        'Messages are automatically deleted after 24 hours',
        'You can only send messages to a user within 24 hours of their last message; outside this window, you must use pre-approved Message Templates',
        'The API key expires every 24 hours',
      ],
      correctAnswer: '2',
      explanation: 'WhatsApp\'s Business API enforces a 24-hour messaging window: you can freely respond to users within 24 hours of their last message. After 24 hours, you can only initiate conversation using pre-approved Message Templates. This prevents spam and protects users.',
      points: 15,
    },
    {
      id: 'q-13-5',
      question: 'Which n8n node extracts text content from PDF documents sent via WhatsApp?',
      type: 'multiple-choice',
      options: [
        'OpenAI Node with PDF mode',
        'HTTP Request Node',
        'Extract from File Node',
        'Code Node with manual PDF parsing',
      ],
      correctAnswer: '2',
      explanation: 'n8n\'s Extract from File node natively handles PDF text extraction. It takes the binary PDF data (downloaded from WhatsApp\'s media endpoint) and outputs the text content as a string, which is then passed to the AI Agent for analysis and response.',
      points: 15,
    },
    {
      id: 'q-13-6',
      question: 'How should webhook requests from WhatsApp be verified for security in production?',
      type: 'multiple-choice',
      options: [
        'Check the sender\'s IP address against Meta\'s IP range',
        'Validate the X-Hub-Signature-256 header using HMAC-SHA256 with your app secret',
        'Verify the request contains a valid WhatsApp phone number',
        'No verification is needed — WhatsApp handles security automatically',
      ],
      correctAnswer: '1',
      explanation: 'Every webhook request from Meta includes an X-Hub-Signature-256 header containing an HMAC-SHA256 signature of the payload, signed with your app secret. Your workflow should verify this signature before processing to ensure the request genuinely came from Meta and wasn\'t forged by an attacker.',
      points: 20,
    },
  ],
};
