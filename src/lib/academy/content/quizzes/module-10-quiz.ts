/**
 * Module 10: Google Maps Lead Generation — Quiz
 * 6 Questions | 70% Passing Score | 50 XP Reward
 */

import type { Quiz } from '../../types';

export const module10Quiz: Quiz = {
  id: 'quiz-module-10',
  moduleId: 'module-10',
  title: 'The Lead Generation Trial',
  description: 'Test your knowledge of automated lead generation with Google Maps, web scraping, and email validation.',
  passingScore: 70,
  xpReward: 50,
  questions: [
    {
      id: 'q-10-1',
      question: 'What is the correct order of operations in the lead generation pipeline?',
      type: 'multiple-choice',
      options: [
        'Scrape emails → Search Google Maps → Save to Sheets',
        'Search Google Maps → Extract URLs → Scrape emails → Validate → Save to Sheets',
        'Save to Sheets → Search Google Maps → Scrape emails',
        'Extract URLs → Validate emails → Search Google Maps',
      ],
      correctAnswer: '1',
      explanation: 'The pipeline follows a logical sequence: search Google Maps for businesses, extract their website URLs, visit those websites to scrape emails, validate and deduplicate the emails, then save the clean leads to Google Sheets.',
      points: 15,
    },
    {
      id: 'q-10-2',
      question: 'Which regex pattern is used to extract email addresses from HTML?',
      type: 'multiple-choice',
      options: [
        '/[0-9]+@[a-z]+/',
        '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g',
        '/@[a-z]+\\.com/g',
        '/email=[a-z]+/g',
      ],
      correctAnswer: '1',
      explanation: 'The pattern /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g matches standard email formats: local part (letters, numbers, dots, special chars) + @ + domain + TLD (minimum 2 characters). The /g flag finds all matches, not just the first.',
      points: 15,
    },
    {
      id: 'q-10-3',
      question: 'Why should you add a Wait node between HTTP requests when scraping websites?',
      type: 'multiple-choice',
      options: [
        'To make the workflow look more professional',
        'To save on API costs',
        'To avoid being blocked by websites and respect rate limits',
        'Because n8n requires it for all HTTP nodes',
      ],
      correctAnswer: '2',
      explanation: 'Sending rapid requests to websites triggers anti-bot protections and can get your IP blocked. A 1-2 second delay between requests mimics human browsing speed, reduces server load, and is respectful to website owners.',
      points: 15,
    },
    {
      id: 'q-10-4',
      question: 'Which of these would be identified as a FALSE POSITIVE in email extraction?',
      type: 'multiple-choice',
      options: [
        'info@brightsmile.co.uk',
        'contact@lawfirm.com',
        'icon@2x.png',
        'hello@agency.io',
      ],
      correctAnswer: '2',
      explanation: 'icon@2x.png is a common image filename that matches the email regex pattern but is not a real email address. The validation step filters these out by checking for image file extensions (.png, .jpg, .gif, .svg, .webp) in the matched string.',
      points: 15,
    },
    {
      id: 'q-10-5',
      question: 'What additional website pages should you check beyond the homepage to find email addresses?',
      type: 'multiple-choice',
      options: [
        'Only the homepage is sufficient',
        '/blog, /news, /pricing',
        '/contact, /about, /imprint, /privacy-policy',
        '/sitemap.xml, /robots.txt',
      ],
      correctAnswer: '2',
      explanation: 'Contact pages, about pages, imprint/impressum pages, and privacy policies are the most likely locations for business email addresses. The homepage alone misses many leads because businesses often only display emails on dedicated contact pages.',
      points: 15,
    },
    {
      id: 'q-10-6',
      question: 'What is a key compliance requirement for using scraped emails in B2B outreach?',
      type: 'multiple-choice',
      options: [
        'You must pay a license fee to each business',
        'Emails must be encrypted before sending',
        'You must provide an unsubscribe option and clear sender identity',
        'You can only send emails on weekdays',
      ],
      correctAnswer: '2',
      explanation: 'Under CAN-SPAM, GDPR, and similar regulations, commercial emails must include a clear unsubscribe mechanism, accurate sender identity, physical address, and non-deceptive subject lines. This applies regardless of how the email addresses were obtained.',
      points: 15,
    },
  ],
};
