/**
 * Module 9: YouTube AI Summarization & Analysis
 * Duration: 25 minutes | 10 Lessons
 */

import type { Lesson } from '../../types';

export const module9Lessons: Lesson[] = [
  // ==========================================================================
  // LESSON 9.1: Introduction to YouTube AI Processing
  // ==========================================================================
  {
    id: 'lesson-9-1',
    moduleId: 'module-9',
    title: 'Introduction to YouTube AI Processing',
    estimatedTime: 2,
    order: 1,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'YouTube is the world\'s second-largest search engine, with over 500 hours of video uploaded every minute. The knowledge locked inside these videos is enormous — but watching hours of content to extract key insights is impractical. What if AI could do it for you?',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What We\'re Building',
      },
      {
        type: 'text',
        value: 'In this module, you\'ll build an AI-powered YouTube processing pipeline that can summarize entire playlists, analyze content, and even answer questions about the videos — all without watching a single second.',
      },
      {
        type: 'list',
        items: [
          'Fetch YouTube transcripts automatically via API',
          'Split long transcripts into processable chunks',
          'Summarize each chunk with Gemini AI',
          'Combine summaries into a final comprehensive analysis',
          'Store content in a vector database (Qdrant) for RAG',
          'Enable a Q&A chatbot over the video content',
        ],
        ordered: true,
      },
      {
        type: 'code',
        language: 'text',
        code: `[Chat Trigger: "Summarize playlist X"]
         │
         ▼
[Handle Queries Agent] ◄── [Gemini Chat Model]
         │
         │  (Tool call: process video)
         ▼
[YouTube API: Get transcript]
         │
         ▼
[Text Splitter: Recursive Character (1000 tokens)]
         │
         ▼
[Summarize & Analyze each chunk] ◄── [Gemini]
         │
         ▼
[Aggregate: Concatenate all summaries]
         │
         ▼
[Final Summary + Analysis] ◄── [Gemini]
         │
         ├──► [Qdrant Vector Store: index chunks]
         │
         ▼
[Return to user via chat]`,
        caption: 'The complete YouTube AI processing pipeline architecture',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Real-World Applications',
        text: 'This workflow powers knowledge bases from online courses, competitive intelligence (analyzing competitor content), research assistants for educational channels, and automated meeting/webinar transcription with Q&A capabilities.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 9.2: Fetching YouTube Transcripts
  // ==========================================================================
  {
    id: 'lesson-9-2',
    moduleId: 'module-9',
    title: 'Fetching YouTube Transcripts',
    estimatedTime: 3,
    order: 2,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'The foundation of the entire pipeline is the transcript. YouTube auto-generates captions for most videos, and these transcripts are accessible via the YouTube Data API. In n8n, you can fetch them with an HTTP Request node or a dedicated YouTube node.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'How YouTube Transcripts Work',
      },
      {
        type: 'text',
        value: 'YouTube transcripts come in two flavors:',
      },
      {
        type: 'list',
        items: [
          'Auto-generated captions — YouTube\'s speech-to-text creates these automatically. Accuracy varies (85-95%) but works for most content.',
          'Manual/uploaded captions — Created by the content creator. Higher accuracy but not always available.',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'Fetching Transcripts in n8n',
      },
      {
        type: 'code',
        language: 'text',
        code: `HTTP Request Node Configuration:
─────────────────────────────────
Method:  GET
URL:     https://www.youtube.com/api/timedtext
Query Parameters:
  v:     {{ $json.videoId }}
  lang:  en
  fmt:   json3
─────────────────────────────────

Alternative: YouTube Transcript API
─────────────────────────────────
npm package: youtube-transcript
Endpoint: /api/transcript?videoId=xxx
Returns: Array of { text, start, duration }`,
        caption: 'Two approaches to fetching YouTube transcripts',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Handling Playlists',
        text: 'For processing entire playlists, first use the YouTube Data API to get all video IDs in the playlist, then loop through each video to fetch its transcript. Use n8n\'s "Split in Batches" node to process videos sequentially and avoid rate limits.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Transcript Output Format',
      },
      {
        type: 'code',
        language: 'json',
        code: `[
  { "text": "Welcome to this tutorial", "start": 0.0, "duration": 2.5 },
  { "text": "on building AI agents", "start": 2.5, "duration": 2.1 },
  { "text": "with n8n workflow automation", "start": 4.6, "duration": 3.0 },
  ...
]`,
        caption: 'Raw transcript data includes timestamps — useful for creating chapter markers',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Not All Videos Have Transcripts',
        text: 'Some videos have captions disabled by the creator. Always add an IF node to check if the transcript was successfully fetched before proceeding. Log failures so you know which videos were skipped.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 9.3: Text Splitting for Long Transcripts
  // ==========================================================================
  {
    id: 'lesson-9-3',
    moduleId: 'module-9',
    title: 'Text Splitting for Long Transcripts',
    estimatedTime: 2,
    order: 3,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'A typical 30-minute YouTube video produces 5,000-8,000 words of transcript text. AI models have context limits, and even when they don\'t, processing the entire transcript at once leads to poor summaries. The solution: split the text into manageable chunks.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Recursive Character Text Splitter',
      },
      {
        type: 'text',
        value: 'n8n includes a built-in Text Splitter node based on LangChain. The "Recursive Character" strategy is the gold standard for transcript processing:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Text Splitter Configuration:
─────────────────────────────────
Type:          Recursive Character
Chunk Size:    1000 characters
Chunk Overlap: 200 characters
Separators:    ["\\n\\n", "\\n", " "]
─────────────────────────────────

How it works:
1. Try to split on "\\n\\n" (paragraph breaks) first
2. If chunks are still too large, split on "\\n" (line breaks)
3. Last resort: split on spaces
4. Each chunk overlaps the previous by 200 chars`,
        caption: 'Recursive Character Text Splitter — preserves context at boundaries',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Why Chunk Overlap Matters',
      },
      {
        type: 'text',
        value: 'The 200-character overlap is critical. Without it, you lose context at chunk boundaries:',
      },
      {
        type: 'list',
        items: [
          'Without overlap: Chunk 1 ends with "The key advantage of this approach is..." and Chunk 2 starts with "...significant cost reduction." — the AI loses the connection.',
          'With overlap: Chunk 2 starts with "...The key advantage of this approach is significant cost reduction." — context is preserved across boundaries.',
        ],
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Chunk Size Trade-offs',
        text: 'Smaller chunks (500 chars) = more precise summaries but more API calls. Larger chunks (2000 chars) = fewer API calls but may miss details. 1000 characters is a well-tested sweet spot for video transcripts.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Output After Splitting',
      },
      {
        type: 'text',
        value: 'A 30-minute video transcript (~6000 chars) with 1000-char chunks and 200-char overlap produces approximately 7-8 chunks. Each chunk becomes an individual n8n item that flows to the next node for summarization.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 9.4: Chunk Summarization with Gemini AI
  // ==========================================================================
  {
    id: 'lesson-9-4',
    moduleId: 'module-9',
    title: 'Chunk Summarization with Gemini AI',
    estimatedTime: 3,
    order: 4,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'Now that the transcript is split into chunks, each chunk gets individually summarized by Gemini AI. This "map" step is the first half of the map-reduce pattern — summarize each piece, then combine the summaries.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Why Gemini for Summarization?',
      },
      {
        type: 'list',
        items: [
          'Gemini 1.5 Flash is extremely fast and cheap — ideal for processing multiple chunks',
          'Native support in n8n via the Google AI node',
          'Strong at extracting key points from conversational/spoken text',
          'Handles multiple languages well for international content',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Summarization Prompt',
      },
      {
        type: 'code',
        language: 'text',
        code: `System: You are an expert content analyst. Your task is to
summarize video transcript chunks accurately and concisely.

User: Summarize the following transcript chunk. Extract:
1. Main topic discussed
2. Key points (bullet list)
3. Any actionable advice or quotes
4. Technical terms or tools mentioned

Keep your summary under 200 words.

Transcript chunk:
{{ $json.text }}`,
        caption: 'Chunk summarization prompt — structured output for consistent results',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Configuring the Gemini Node',
      },
      {
        type: 'code',
        language: 'text',
        code: `Google Gemini Node Configuration:
─────────────────────────────────
Model:       gemini-1.5-flash
Temperature: 0.3 (factual, not creative)
Max Tokens:  300
─────────────────────────────────

Cost estimate:
  8 chunks × ~1000 input tokens × $0.075/1M = ~$0.0006
  Total for a 30-min video: less than $0.001`,
        caption: 'Gemini Flash is extremely cost-effective for batch summarization',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Preserving Chunk Order',
        text: 'Add a chunk index to each item before summarization (using a Code node or Set node). This ensures summaries can be reassembled in the correct order even if some chunks process faster than others.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 9.5: Aggregating Summaries into Final Analysis
  // ==========================================================================
  {
    id: 'lesson-9-5',
    moduleId: 'module-9',
    title: 'Aggregating Summaries into Final Analysis',
    estimatedTime: 2,
    order: 5,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'You now have 7-8 individual chunk summaries. The "reduce" step combines them into a single comprehensive analysis of the entire video. This two-pass approach (summarize chunks, then synthesize) produces much better results than trying to summarize the full transcript at once.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Aggregate Node',
      },
      {
        type: 'text',
        value: 'Use n8n\'s Aggregate node to concatenate all chunk summaries into a single text block:',
      },
      {
        type: 'code',
        language: 'text',
        code: `Aggregate Node Configuration:
─────────────────────────────────
Mode:         Aggregate All Items
Field to Aggregate: summary
Output Field: allSummaries
Separator:    "\\n\\n---\\n\\n"
─────────────────────────────────

Result:
"Chunk 1 Summary: The speaker introduces...
---
Chunk 2 Summary: Moving on to the technical...
---
Chunk 3 Summary: The key takeaway is..."`,
        caption: 'Aggregate all chunk summaries with separators for the final AI pass',
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Final Analysis Prompt',
      },
      {
        type: 'code',
        language: 'text',
        code: `System: You are an expert content analyst creating
comprehensive video summaries.

User: Based on the following chunk summaries of a YouTube
video, create a final comprehensive analysis:

1. **Executive Summary** (2-3 sentences)
2. **Key Topics Covered** (numbered list)
3. **Main Takeaways** (bullet points)
4. **Tools & Technologies Mentioned**
5. **Actionable Steps** (what the viewer should do)
6. **Notable Quotes** (if any)

Chunk summaries:
{{ $json.allSummaries }}`,
        caption: 'The final analysis prompt produces a structured, actionable summary',
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Map-Reduce Pattern',
        text: 'This summarize-then-synthesize approach is the classic "map-reduce" pattern used by LangChain and other AI frameworks. It scales to any transcript length — a 3-hour lecture gets the same quality summary as a 10-minute tutorial.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 9.6: Vector Storage with Qdrant
  // ==========================================================================
  {
    id: 'lesson-9-6',
    moduleId: 'module-9',
    title: 'Vector Storage with Qdrant',
    estimatedTime: 3,
    order: 6,
    xpReward: 30,
    content: [
      {
        type: 'text',
        value: 'Summaries are great, but what if you want to ask specific questions about the video content? That\'s where vector databases come in. By storing transcript chunks as embeddings in Qdrant, you enable semantic search — finding relevant passages based on meaning, not just keywords.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What is a Vector Database?',
      },
      {
        type: 'text',
        value: 'A vector database stores data as high-dimensional numerical vectors (embeddings). When you search, it finds the vectors most similar to your query — enabling "find passages that talk about X" even if they don\'t contain the exact word X.',
      },
      {
        type: 'list',
        items: [
          'Traditional search: "Python tutorial" only matches text containing those exact words',
          'Vector search: "Python tutorial" also matches "coding lesson in Python", "learning to program", etc.',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'Setting Up Qdrant',
      },
      {
        type: 'code',
        language: 'bash',
        code: `# Run Qdrant locally with Docker
docker run -p 6333:6333 qdrant/qdrant

# Qdrant dashboard available at:
# http://localhost:6333/dashboard`,
        caption: 'Qdrant is self-hostable and runs easily in Docker',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Indexing Chunks in n8n',
      },
      {
        type: 'code',
        language: 'text',
        code: `Qdrant Vector Store Node Configuration:
─────────────────────────────────
Operation:     Insert
Collection:    youtube-transcripts
Embedding Model: text-embedding-3-small (OpenAI)
Document:      {{ $json.chunkText }}
Metadata:
  videoId:     {{ $json.videoId }}
  videoTitle:  {{ $json.videoTitle }}
  chunkIndex:  {{ $json.chunkIndex }}
  timestamp:   {{ $json.startTime }}
─────────────────────────────────`,
        caption: 'Store each chunk with metadata for precise source tracking',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Metadata is Key',
        text: 'Always store metadata alongside the vector: video ID, title, chunk index, and timestamp. When the Q&A chatbot retrieves a relevant chunk, the metadata tells the user exactly which video and timestamp the information came from.',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Embedding Costs',
        text: 'OpenAI\'s text-embedding-3-small costs $0.02 per 1M tokens. A 30-minute video produces ~8 chunks of ~1000 chars each ≈ 2000 tokens total. Cost per video: ~$0.00004. Even processing 1000 videos costs under $0.05.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 9.7: Building the RAG Q&A Pipeline
  // ==========================================================================
  {
    id: 'lesson-9-7',
    moduleId: 'module-9',
    title: 'Building the RAG Q&A Pipeline',
    estimatedTime: 3,
    order: 7,
    xpReward: 30,
    content: [
      {
        type: 'text',
        value: 'RAG (Retrieval Augmented Generation) is the technique that makes your chatbot accurate. Instead of relying on the AI\'s training data, it retrieves relevant transcript chunks from Qdrant and feeds them as context — so every answer is grounded in the actual video content.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'How RAG Works',
      },
      {
        type: 'code',
        language: 'text',
        code: `User: "What did the speaker say about Python in video 3?"

RAG Pipeline:
─────────────────────────────────
Step 1: Embed the question
   → Convert to vector using same embedding model

Step 2: Search Qdrant for similar chunks
   → Filter: videoId = "video-3"
   → Find top 5 most semantically similar chunks

Step 3: Retrieve chunk text + metadata
   → "In this section, we'll use Python to..."
   → "The Python script handles data parsing..."
   → (3 more relevant chunks)

Step 4: Feed chunks + question to Gemini
   → "Based on these transcript excerpts,
      answer the user's question..."

Step 5: Return precise answer with source
   → "The speaker discussed Python in the context
      of data parsing (at 12:34) and API
      integration (at 23:15)..."
─────────────────────────────────`,
        caption: 'RAG retrieves actual video content before generating an answer',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Configuring RAG in n8n',
      },
      {
        type: 'list',
        items: [
          'Chat Trigger — Accepts user questions via a chat interface',
          'Embedding Node — Converts the question to a vector',
          'Qdrant Search — Finds the top 5 most similar chunks',
          'Gemini Node — Generates an answer using the retrieved chunks as context',
          'The system prompt instructs Gemini to ONLY answer based on the provided context',
        ],
        ordered: true,
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Why Top 5 Chunks?',
        text: 'Retrieving 5 chunks balances precision and recall. Too few chunks (1-2) might miss relevant information. Too many (10+) adds noise and increases token costs. 5 is the empirically validated sweet spot for most use cases.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Preventing Hallucination',
      },
      {
        type: 'code',
        language: 'text',
        code: `System prompt for the answer generation step:

"You are a helpful assistant that answers questions
about YouTube video content. IMPORTANT RULES:
1. ONLY use information from the provided transcript chunks
2. If the answer is not in the chunks, say 'I couldn't
   find this information in the video content'
3. Always cite which video and approximate timestamp
4. Never make up information not in the transcripts"`,
        caption: 'Grounding instructions prevent the AI from hallucinating answers',
      },
    ],
  },

  // ==========================================================================
  // LESSON 9.8: The AI Agent Architecture
  // ==========================================================================
  {
    id: 'lesson-9-8',
    moduleId: 'module-9',
    title: 'The AI Agent Architecture',
    estimatedTime: 3,
    order: 8,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'The full workflow uses an AI Agent node as the orchestrator. Instead of hardcoding the pipeline, the agent decides when to process a new video, when to search existing data, and how to respond to the user.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Agent vs. Static Workflow',
      },
      {
        type: 'list',
        items: [
          'Static workflow: Every message triggers the same fixed sequence of nodes. Works for simple automation.',
          'Agent workflow: The AI decides which tools to use based on the user\'s request. Can handle "summarize this video" AND "what did they say about X?" with the same workflow.',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'The Handle Queries Agent',
      },
      {
        type: 'code',
        language: 'text',
        code: `Agent Node Configuration:
─────────────────────────────────
Model:     Gemini Pro (for reasoning)
Tools:
  1. process_video
     - Input: YouTube video URL or ID
     - Action: Fetch transcript → split → summarize → store
     - Returns: Summary of the video

  2. search_knowledge
     - Input: User question + optional video filter
     - Action: Embed → search Qdrant → generate answer
     - Returns: Answer with sources

  3. list_videos
     - Input: none
     - Action: Query Qdrant for all indexed video titles
     - Returns: List of processed videos
─────────────────────────────────`,
        caption: 'The agent has three tools and chooses which to use based on the user\'s intent',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Example Agent Interactions',
      },
      {
        type: 'code',
        language: 'text',
        code: `User: "Summarize this video: https://youtube.com/watch?v=abc123"
Agent thinks: New video URL → use process_video tool
→ Fetches transcript, processes, stores, returns summary

User: "What tools were mentioned across all videos?"
Agent thinks: Question about content → use search_knowledge tool
→ Searches Qdrant, finds relevant chunks, generates answer

User: "Which videos have I processed?"
Agent thinks: Metadata query → use list_videos tool
→ Returns list of indexed videos`,
        caption: 'The agent routes requests to the right tool automatically',
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'The Power of Agent Architecture',
        text: 'With the agent approach, you build one workflow that handles unlimited use cases. Users interact naturally via chat, and the AI figures out the right action. No need for separate workflows for each task.',
      },
    ],
  },

  // ==========================================================================
  // LESSON 9.9: Processing Playlists at Scale
  // ==========================================================================
  {
    id: 'lesson-9-9',
    moduleId: 'module-9',
    title: 'Processing Playlists at Scale',
    estimatedTime: 2,
    order: 9,
    xpReward: 20,
    content: [
      {
        type: 'text',
        value: 'Processing a single video is straightforward. But what about a 50-video playlist for an entire online course? You need batch processing with rate limiting, error handling, and progress tracking.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Fetching Playlist Videos',
      },
      {
        type: 'code',
        language: 'text',
        code: `YouTube Data API: Playlist Items
─────────────────────────────────
GET /youtube/v3/playlistItems
Parameters:
  playlistId: PLxxxxxx
  part: snippet
  maxResults: 50

Returns: Array of video IDs + titles + positions`,
        caption: 'The YouTube Data API returns all videos in a playlist',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Batch Processing Pattern',
      },
      {
        type: 'code',
        language: 'text',
        code: `[Get Playlist Videos]
         │
         ▼
[Split in Batches: 3 videos at a time]
         │
         ▼
[Process Video Sub-workflow]
  ├─ Fetch transcript
  ├─ Split into chunks
  ├─ Summarize each chunk
  ├─ Aggregate summaries
  ├─ Store in Qdrant
  └─ Return summary
         │
         ▼
[Wait: 2 seconds between batches]
         │
         ▼
[Loop back for next batch]
         │
         ▼
[Final: Aggregate all video summaries]
         │
         ▼
[Create playlist-level analysis]`,
        caption: 'Batch processing with rate limiting prevents API throttling',
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'API Quotas',
        text: 'The YouTube Data API has a daily quota of 10,000 units. Each playlist items request costs 1 unit, and each transcript fetch costs ~1 unit. A 50-video playlist uses ~100 units. Monitor your quota in the Google Cloud Console.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Error Recovery',
      },
      {
        type: 'list',
        items: [
          'Some videos may not have transcripts — log them and continue',
          'API rate limits may cause temporary failures — add retry logic with exponential backoff',
          'Store processed video IDs to avoid reprocessing on workflow restart',
          'Use n8n\'s error trigger to send notifications when videos fail',
        ],
      },
    ],
  },

  // ==========================================================================
  // LESSON 9.10: Professional Use Cases & Optimization
  // ==========================================================================
  {
    id: 'lesson-9-10',
    moduleId: 'module-9',
    title: 'Professional Use Cases & Optimization',
    estimatedTime: 2,
    order: 10,
    xpReward: 25,
    content: [
      {
        type: 'text',
        value: 'You\'ve built a powerful YouTube AI processing pipeline. Let\'s explore the professional applications that make this workflow genuinely valuable, and how to optimize it for production use.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'Professional Use Cases',
      },
      {
        type: 'list',
        items: [
          'Knowledge Base from Courses — Process an entire Udemy/Coursera playlist and create a searchable knowledge base. Students can ask "How do I set up Docker networking?" and get precise answers with video timestamps.',
          'Competitive Intelligence — Summarize competitor YouTube channels to track their messaging, product announcements, and strategy without watching hundreds of hours.',
          'Research Assistant — Academics can process conference talks and lecture series, then query across all content for specific topics or citations.',
          'Meeting & Webinar Archive — Record meetings to YouTube (unlisted), process transcripts, and create a searchable archive of all company discussions.',
          'Content Repurposing — Automatically generate blog posts, social media content, and newsletter material from video transcripts.',
        ],
      },
      {
        type: 'heading',
        level: 2,
        value: 'Performance Optimization Tips',
      },
      {
        type: 'list',
        items: [
          'Use Gemini Flash for chunk summarization (fast + cheap) and Gemini Pro for final analysis (higher quality)',
          'Cache transcripts locally to avoid re-fetching on workflow retries',
          'Use smaller embedding models (text-embedding-3-small) for cost efficiency — quality difference is minimal for transcript search',
          'Set up collection-level filters in Qdrant for multi-channel knowledge bases',
          'Implement incremental processing — only process new videos added since the last run',
        ],
      },
      {
        type: 'callout',
        variant: 'success',
        title: 'Congratulations!',
        text: 'You\'ve mastered YouTube AI processing — from transcript fetching to vector storage to RAG-powered Q&A. This pipeline can process any amount of video content and make it instantly searchable and queryable.',
      },
      {
        type: 'heading',
        level: 2,
        value: 'What\'s Next?',
      },
      {
        type: 'list',
        items: [
          'Add multilingual support — Translate transcripts before processing for global content',
          'Build a dashboard — Track processed videos, storage usage, and query analytics',
          'Implement auto-discovery — Monitor YouTube channels and automatically process new uploads',
          'Add sentiment analysis — Track tone and sentiment across videos over time',
        ],
      },
    ],
  },
];
