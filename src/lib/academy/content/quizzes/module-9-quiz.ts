/**
 * Module 9: YouTube AI Summarization & Analysis — Quiz
 * 6 Questions | 70% Passing Score | 50 XP Reward
 */

import type { Quiz } from '../../types';

export const module9Quiz: Quiz = {
  id: 'quiz-module-9',
  moduleId: 'module-9',
  title: 'The YouTube AI Processing Trial',
  description: 'Test your knowledge of YouTube transcript processing, vector databases, and RAG pipelines.',
  passingScore: 70,
  xpReward: 50,
  questions: [
    {
      id: 'q-9-1',
      question: 'What is the purpose of the Text Splitter node in the YouTube processing pipeline?',
      type: 'multiple-choice',
      options: [
        'To split the video into multiple clips',
        'To break long transcripts into smaller chunks for AI processing',
        'To separate audio from video',
        'To split the transcript by speaker',
      ],
      correctAnswer: '1',
      explanation: 'The Recursive Character Text Splitter breaks long transcripts into manageable chunks (typically 1000 characters with 200-character overlap). This is necessary because AI models have context limits and produce better summaries when processing smaller, focused segments.',
      points: 15,
    },
    {
      id: 'q-9-2',
      question: 'Why is chunk overlap (200 characters) important when splitting transcripts?',
      type: 'multiple-choice',
      options: [
        'It makes the chunks easier to read',
        'It reduces the total number of chunks',
        'It preserves context at chunk boundaries so meaning isn\'t lost',
        'It is required by the YouTube API',
      ],
      correctAnswer: '2',
      explanation: 'Without overlap, context is lost at chunk boundaries — a sentence split across two chunks loses its meaning. The 200-character overlap ensures each chunk includes the end of the previous chunk, maintaining continuity for the AI summarizer.',
      points: 15,
    },
    {
      id: 'q-9-3',
      question: 'What is RAG (Retrieval Augmented Generation) and why is it used?',
      type: 'multiple-choice',
      options: [
        'A video compression technique for faster processing',
        'A method to generate random transcripts for testing',
        'A technique that retrieves relevant content from a database and feeds it to the AI for accurate answers',
        'A YouTube API feature for downloading high-quality videos',
      ],
      correctAnswer: '2',
      explanation: 'RAG retrieves relevant transcript chunks from the vector database (Qdrant) and provides them as context to the AI model. This ensures answers are grounded in actual video content rather than the AI\'s training data, dramatically reducing hallucinations.',
      points: 15,
    },
    {
      id: 'q-9-4',
      question: 'What does a vector database like Qdrant store, and how does it search?',
      type: 'multiple-choice',
      options: [
        'It stores video files and searches by filename',
        'It stores numerical vector embeddings and searches by semantic similarity',
        'It stores SQL tables and searches with queries',
        'It stores JSON documents and searches by key-value pairs',
      ],
      correctAnswer: '1',
      explanation: 'Qdrant stores data as high-dimensional numerical vectors (embeddings). When searching, it compares the query vector against stored vectors to find the most semantically similar content — enabling meaning-based search rather than exact keyword matching.',
      points: 15,
    },
    {
      id: 'q-9-5',
      question: 'In the AI Agent architecture, what determines which tool the agent uses?',
      type: 'multiple-choice',
      options: [
        'A random selection algorithm',
        'The user must specify the tool explicitly',
        'The AI analyzes the user\'s request and decides the most appropriate tool',
        'Tools are executed in a fixed sequential order',
      ],
      correctAnswer: '2',
      explanation: 'The AI Agent analyzes the user\'s natural language request and decides which tool to call. For example, "Summarize this video" triggers the process_video tool, while "What did they say about Python?" triggers the search_knowledge tool. This makes the workflow flexible and user-friendly.',
      points: 15,
    },
    {
      id: 'q-9-6',
      question: 'What is the map-reduce pattern used for in this pipeline?',
      type: 'multiple-choice',
      options: [
        'Mapping GPS coordinates to video locations',
        'Summarizing individual chunks (map) then synthesizing all summaries into a final analysis (reduce)',
        'Mapping video IDs to playlist positions',
        'Reducing video file size for storage',
      ],
      correctAnswer: '1',
      explanation: 'The map-reduce pattern first "maps" each transcript chunk to an individual summary, then "reduces" all summaries into a single comprehensive analysis. This two-pass approach produces much better results than trying to summarize the entire transcript at once.',
      points: 15,
    },
  ],
};
