/**
 * Module 12: Social Media Publishing Factory — Quiz
 * 6 Questions | 70% Passing Score | 50 XP Reward
 */

import type { Quiz } from '../../types';

export const module12Quiz: Quiz = {
  id: 'quiz-module-12',
  moduleId: 'module-12',
  title: 'The Publishing Factory Trial',
  description: 'Test your knowledge of multi-platform social media publishing automation with AI orchestration.',
  passingScore: 70,
  xpReward: 50,
  questions: [
    {
      id: 'q-12-1',
      question: 'What is the role of the orchestrator agent in the publishing factory?',
      type: 'multiple-choice',
      options: [
        'It directly posts content to all platforms using a single API call',
        'It receives content, understands the target platforms, and delegates to platform-specific sub-workflows',
        'It only handles scheduling and timing of posts',
        'It generates original content ideas from scratch',
      ],
      correctAnswer: '1',
      explanation: 'The orchestrator agent acts as the central brain — it receives content, analyzes which platforms to target, then calls specialized sub-workflows (via toolWorkflow nodes) for each platform. Each sub-workflow handles its own content adaptation and API publishing.',
      points: 15,
    },
    {
      id: 'q-12-2',
      question: 'Why should content be adapted differently for each platform rather than cross-posted?',
      type: 'multiple-choice',
      options: [
        'Because each platform has a different API endpoint',
        'Because each platform has distinct character limits, tone expectations, hashtag strategies, and audience behaviors',
        'Because cross-posting is technically impossible',
        'Because it costs less to post adapted content',
      ],
      correctAnswer: '1',
      explanation: 'Each platform has its own culture and requirements: X needs 280-char punchy posts, LinkedIn expects professional thought leadership at 1,200-1,500 chars, Instagram requires emoji-rich captions with hashtag blocks, and Facebook favors conversational storytelling. Cross-posted content feels inauthentic and underperforms.',
      points: 15,
    },
    {
      id: 'q-12-3',
      question: 'How do toolWorkflow nodes connect the orchestrator to sub-workflows in n8n?',
      type: 'multiple-choice',
      options: [
        'They copy the sub-workflow code into the orchestrator',
        'They reference child workflows by their workflow ID, allowing the agent to call them as tools',
        'They use webhooks to communicate between workflows',
        'They merge all sub-workflows into a single large workflow',
      ],
      correctAnswer: '1',
      explanation: 'toolWorkflow nodes reference child workflows by their unique workflow ID. When the agent decides to call a tool (e.g., publish_to_linkedin), n8n triggers the referenced workflow, passes the content as input, waits for completion, and returns the result to the agent.',
      points: 20,
    },
    {
      id: 'q-12-4',
      question: 'What is the recommended character length for optimal LinkedIn post engagement?',
      type: 'multiple-choice',
      options: [
        '280 characters (same as X/Twitter)',
        '1,200-1,500 characters',
        'As long as possible — LinkedIn allows 3,000 characters',
        '500 characters or less',
      ],
      correctAnswer: '1',
      explanation: 'While LinkedIn allows up to 3,000 characters, engagement data shows that posts in the 1,200-1,500 character range perform best. This provides enough space for a hook, context, key insights, and an engagement question without losing reader attention.',
      points: 15,
    },
    {
      id: 'q-12-5',
      question: 'What unique requirement does Instagram have compared to other platforms in the factory?',
      type: 'multiple-choice',
      options: [
        'Instagram requires OAuth 3.0 authentication',
        'Instagram posts MUST include an image or video — text-only posts are not supported',
        'Instagram only allows 140 characters',
        'Instagram does not support hashtags',
      ],
      correctAnswer: '1',
      explanation: 'Unlike X, LinkedIn, and Facebook which all support text-only posts, Instagram requires every post to include an image or video. The sub-workflow must either use an image from the content source or generate one using AI image generation or a template.',
      points: 15,
    },
    {
      id: 'q-12-6',
      question: 'What is the purpose of staggering publishing times across platforms?',
      type: 'multiple-choice',
      options: [
        'To avoid API rate limits from posting simultaneously',
        'To match each platform\'s peak engagement window for maximum reach',
        'Because n8n can only run one workflow at a time',
        'To give the AI more time to adapt content',
      ],
      correctAnswer: '1',
      explanation: 'Each platform has different peak engagement windows: LinkedIn peaks during morning business hours, X during morning news browsing, Facebook during lunch breaks, and Instagram during after-work hours. Publishing at each platform\'s optimal time maximizes visibility and engagement.',
      points: 20,
    },
  ],
};
