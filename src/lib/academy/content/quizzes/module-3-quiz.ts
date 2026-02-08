/**
 * Module 3: Prompt Typology & Use Cases - Quiz
 * 7 questions | Passing score: 70%
 */

import type { Quiz } from '../../types';

export const module3Quiz: Quiz = {
  id: 'quiz-module-3',
  moduleId: 'module-3',
  title: 'Prompt Typology Mastery Quiz',
  description: 'Test your understanding of prompt types and when to use each',
  passingScore: 70,
  xpReward: 60,
  questions: [
    // Question 1
    {
      id: 'q-3-1',
      question: 'Which prompt type is BEST for improving accuracy on math and logic problems?',
      type: 'multiple-choice',
      options: [
        'Few-shot prompts',
        'Chain-of-thought prompts',
        'Creative prompts',
        'Zero-shot instructional prompts',
      ],
      correctAnswer: '1',
      explanation: 'Chain-of-thought prompts explicitly ask the AI to show reasoning step-by-step (e.g., "Let\'s think step by step"). This improves accuracy on math and logic tasks by 20-30% because it forces the AI to work through the problem methodically rather than jumping to conclusions.',
      points: 15,
    },

    // Question 2
    {
      id: 'q-3-2',
      question: 'You want the AI to match your company\'s specific brand voice. Which prompt type should you use?',
      type: 'multiple-choice',
      options: [
        'Zero-shot instructional',
        'Chain-of-thought',
        'Few-shot (provide examples)',
        'Constrained output',
      ],
      correctAnswer: '2',
      explanation: 'Few-shot prompts are perfect for style matching. Provide 2-3 examples of your brand voice, then ask the AI to create similar content. The AI learns the pattern from your examples—much more effective than trying to describe your voice in words.',
      points: 15,
    },

    // Question 3
    {
      id: 'q-3-3',
      question: 'What is the primary benefit of prompt chaining over a single complex prompt?',
      type: 'multiple-choice',
      options: [
        'It\'s faster to execute',
        'Each step can use the optimal prompt type and is easier to debug',
        'It uses less tokens',
        'It always produces better results',
      ],
      correctAnswer: '1',
      explanation: 'Prompt chaining breaks complex tasks into steps. Benefits: (1) Each step can use the best prompt type for that task, (2) Easier to debug (identify which step failed), (3) Better quality control (review each stage). It\'s not always faster or cheaper, but it\'s more reliable for complex workflows.',
      points: 15,
    },

    // Question 4
    {
      id: 'q-3-4',
      question: 'A lawyer needs to extract specific clauses from a 50-page contract. What\'s the best prompt type?',
      type: 'multiple-choice',
      options: [
        'Creative prompt',
        'Conversational prompt',
        'Role-based + Constrained output',
        'Zero-shot instructional',
      ],
      correctAnswer: '2',
      explanation: 'Combine Role-based ("Act as a corporate attorney") + Constrained output (specify exact format and which clauses to extract). Role-based taps into legal expertise, while constrained output ensures consistent, structured results perfect for review.',
      points: 15,
    },

    // Question 5
    {
      id: 'q-3-5',
      question: 'Which combination is most effective for comprehensive business analysis?',
      type: 'multiple-choice',
      options: [
        'Creative + Zero-shot',
        'Few-shot + Conversational',
        'Chain-of-thought + Constrained output',
        'Role-based + Few-shot',
      ],
      correctAnswer: '2',
      explanation: 'Chain-of-thought ensures step-by-step reasoning (crucial for analysis), while Constrained output formats results consistently. Example: "Analyze this problem step by step, then format as: Problem Statement | Root Causes | Solutions | Next Steps." This combines deep thinking with reliable structure.',
      points: 15,
    },

    // Question 6
    {
      id: 'q-3-6',
      question: 'True or False: Zero-shot prompts (no examples) work well for common, well-understood tasks like definitions or simple translations.',
      type: 'true-false',
      options: [
        'True',
        'False',
      ],
      correctAnswer: '0',
      explanation: 'TRUE! Zero-shot prompts rely on the AI\'s training. For common tasks like "What is photosynthesis?" or "Translate \'hello\' to French", no examples are needed—the AI already knows these patterns. Save few-shot for specialized or nuanced tasks.',
      points: 10,
    },

    // Question 7
    {
      id: 'q-3-7',
      question: 'What\'s the "Devil\'s Advocate Pattern" mentioned in the advanced combinations lesson?',
      type: 'multiple-choice',
      options: [
        'Always use creative prompts',
        'Ask for the opposing view after getting one perspective',
        'Use multiple AI models simultaneously',
        'Chain at least 5 prompts together',
      ],
      correctAnswer: '1',
      explanation: 'The Devil\'s Advocate Pattern means asking for opposing viewpoints. After one perspective, prompt: "Now argue the opposite position." This reveals blind spots and ensures balanced analysis. It\'s a form of multi-perspective analysis using role-based prompts.',
      points: 15,
    },
  ],
};
