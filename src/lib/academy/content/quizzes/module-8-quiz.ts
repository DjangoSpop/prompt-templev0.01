/**
 * Module 8: LinkedIn Posts Automation with AI — Quiz
 * 6 Questions | 70% Passing Score | 50 XP Reward
 */

import type { Quiz } from '../../types';

export const module8Quiz: Quiz = {
  id: 'quiz-module-8',
  moduleId: 'module-8',
  title: 'The LinkedIn Automation Trial',
  description: 'Test your knowledge of automated LinkedIn publishing with n8n, Notion, and AI.',
  passingScore: 70,
  xpReward: 50,
  questions: [
    {
      id: 'q-8-1',
      question: 'What node triggers the LinkedIn automation workflow to run daily at a specific time?',
      type: 'multiple-choice',
      options: [
        'Webhook Trigger',
        'Schedule Trigger',
        'Manual Trigger',
        'Cron Node',
      ],
      correctAnswer: '1',
      explanation: 'The Schedule Trigger node fires at a configured time using cron expressions. It runs automatically without any external input, making it perfect for daily publishing schedules.',
      points: 15,
    },
    {
      id: 'q-8-2',
      question: 'Which Notion database properties are essential for the content calendar to work with the automation?',
      type: 'multiple-choice',
      options: [
        'Title, Body, and Tags',
        'Title, Body, Publish Date, Platform, Status, and Image',
        'Title, Category, and Priority',
        'Title, Author, and Deadline',
      ],
      correctAnswer: '1',
      explanation: 'The automation requires 6 specific properties: Title (headline), Body (content), Publish Date (scheduling), Platform (targeting), Status (workflow state: Draft/Scheduled/Done), and Image (media attachment).',
      points: 15,
    },
    {
      id: 'q-8-3',
      question: 'What does the OpenAI reformat prompt instruct the AI to do with the raw content?',
      type: 'multiple-choice',
      options: [
        'Translate it to multiple languages',
        'Start with a hook, use short paragraphs, add hashtags, end with a question, max 1,300 characters',
        'Summarize it into a single sentence',
        'Add emojis and capitalize all words',
      ],
      correctAnswer: '1',
      explanation: 'The prompt instructs OpenAI to create an engaging LinkedIn post: bold hook first line, short paragraphs (max 3 lines), 3-5 hashtags, an engagement question at the end, and a 1,300 character limit for optimal performance.',
      points: 15,
    },
    {
      id: 'q-8-4',
      question: 'Why is the Aggregate node necessary in this workflow?',
      type: 'multiple-choice',
      options: [
        'To compress images for faster upload',
        'To sort posts by date',
        'Because Notion returns content as separate blocks that must be combined into a single text',
        'To count the number of scheduled posts',
      ],
      correctAnswer: '2',
      explanation: 'Notion stores content as individual blocks (paragraphs, headings, images). The Aggregate node combines these separate items into a single text string and extracts the image URL, creating the unified payload needed for AI processing.',
      points: 15,
    },
    {
      id: 'q-8-5',
      question: 'How do you extend the workflow to publish on multiple platforms simultaneously?',
      type: 'multiple-choice',
      options: [
        'Send the same formatted text to all platforms',
        'Add parallel platform-specific reformatting prompts and API nodes after the base AI reformat step',
        'Create completely separate workflows for each platform',
        'Use a single API node that supports all platforms',
      ],
      correctAnswer: '1',
      explanation: 'The best approach is to add parallel branches after the AI reformatting step. Each platform gets its own reformatting prompt (optimized for that platform\'s style and limits) and its own API node. This ensures content is tailored while reusing the shared pipeline.',
      points: 15,
    },
    {
      id: 'q-8-6',
      question: 'What does the final Notion Update node do after a post is successfully published?',
      type: 'multiple-choice',
      options: [
        'Deletes the entry from the database',
        'Archives the page to a different database',
        'Sets the Status property to "Done"',
        'Adds a comment with the post URL',
      ],
      correctAnswer: '2',
      explanation: 'The final step sets the post\'s Status from "Scheduled" to "Done". This prevents the post from being picked up again on the next workflow run and provides a clear visual indicator in the Notion calendar that the post has been published.',
      points: 15,
    },
  ],
};
