/**
 * Module 1: Foundations of Prompt Engineering - Quiz
 * 7 questions | Passing score: 70%
 */

import type { Quiz } from '../../types';

export const module1Quiz: Quiz = {
  id: 'quiz-module-1',
  moduleId: 'module-1',
  title: 'Foundations Quiz',
  description: 'Test your understanding of prompt engineering fundamentals',
  passingScore: 70,
  xpReward: 50,
  questions: [
    // Question 1
    {
      id: 'q-1-1',
      question: 'What is the primary goal of prompt engineering?',
      type: 'multiple-choice',
      options: [
        'Making AI write code for you',
        'Communicating effectively with AI to get reliable, high-quality results',
        'Training AI models from scratch',
        'Replacing human workers with automation',
      ],
      correctAnswer: '1', // Index of correct answer
      explanation: 'Prompt engineering is about communication, not coding or training. It\'s the skill of crafting instructions that help AI systems produce the results you need. Think of it like giving clear directions to a knowledgeable assistant.',
      points: 15,
    },

    // Question 2
    {
      id: 'q-1-2',
      question: 'A marketing manager asks AI: "Write me something." What is the main flaw in this prompt?',
      type: 'multiple-choice',
      options: [
        'It\'s too short',
        'It lacks specificity about what to write, the format, audience, and purpose',
        'It has incorrect grammar',
        'It doesn\'t say "please"',
      ],
      correctAnswer: '1',
      explanation: 'The prompt is far too vague. "Something" could be anything—an email, a blog post, social media copy, a report. The AI has no idea about format, length, tone, audience, or purpose. This violates the Clarity principle and will produce poor results.',
      points: 15,
    },

    // Question 3
    {
      id: 'q-1-3',
      question: 'According to research, what productivity improvement can systematic prompt engineering achieve?',
      type: 'multiple-choice',
      options: [
        '10-20% improvement',
        '50-100% improvement',
        '300-500% improvement in workflow optimization',
        '1000%+ improvement',
      ],
      correctAnswer: '2',
      explanation: 'Studies show that systematic prompt engineering can deliver 300-500% productivity gains when applied to workflows. This isn\'t an exaggeration—real teams have reduced tasks from hours to minutes by using structured prompts with clear context, examples, and formats.',
      points: 15,
    },

    // Question 4
    {
      id: 'q-1-4',
      question: 'In the CCCEFI framework, what does the first "C" (Context) represent?',
      type: 'multiple-choice',
      options: [
        'The cost of using AI',
        'Background information about who you are, your goal, and your audience',
        'The code needed to run the AI',
        'Creative writing techniques',
      ],
      correctAnswer: '1',
      explanation: 'Context (the first C in CCCEFI) provides background information to the AI. This includes your role, the situation, your goal, and who the audience is. For example: "I\'m a teacher creating a lesson plan for 5th graders" gives the AI crucial context to tailor its response.',
      points: 10,
    },

    // Question 5
    {
      id: 'q-1-5',
      question: 'Why are examples important in prompts?',
      type: 'multiple-choice',
      options: [
        'They make the prompt longer',
        'They help AI understand the specific style, tone, and format you want',
        'They are required by all AI systems',
        'They reduce the cost of API calls',
      ],
      correctAnswer: '1',
      explanation: 'Examples are powerful because they show (not just tell) the AI what you want. This is called "few-shot learning." For instance, if you want a specific writing style, showing 1-2 examples is far more effective than describing the style in words. The AI learns the pattern from your examples.',
      points: 15,
    },

    // Question 6
    {
      id: 'q-1-6',
      question: 'True or False: You need to know how to code to be an effective prompt engineer.',
      type: 'true-false',
      options: [
        'True',
        'False',
      ],
      correctAnswer: '1',
      explanation: 'FALSE. Prompt engineering is a communication skill, not a programming skill. You need clear thinking and the ability to articulate what you want—not coding knowledge. That\'s why professionals from marketing, legal, education, and other non-technical fields excel at it.',
      points: 10,
    },

    // Question 7
    {
      id: 'q-1-7',
      question: 'Which scenario would benefit MOST from few-shot prompting (providing examples)?',
      type: 'multiple-choice',
      options: [
        'Asking for a basic definition',
        'Getting AI to match your company\'s specific writing style and tone',
        'Asking a simple yes/no question',
        'Requesting a translation of a single word',
      ],
      correctAnswer: '1',
      explanation: 'Style-matching tasks benefit most from examples. Writing style is subjective and hard to describe in words. But if you show 2-3 examples of your company\'s tone (e.g., emails, blog posts), the AI can learn the pattern and replicate it. This is far more effective than saying "write in a professional but friendly tone."',
      points: 20,
    },
  ],
};
