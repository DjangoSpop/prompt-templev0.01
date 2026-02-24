import axios from 'axios';
import type {
  Assistant,
  Thread,
  Message,
  RunMessageRequest,
  RunMessageResponse,
  AskMeStartResponse,
  AskMeAnswerResponse,
  AskMeFinalizeResponse,
  AskMeSessionSummary,
} from '@/types/assistant';

const API_ORIGIN = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com';
const API_BASE = `${API_ORIGIN}/api/v2/ai`;

export const assistantClient = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — inject JWT Bearer token
assistantClient.interceptors.request.use((config) => {
  const token =
    (typeof window !== 'undefined' && localStorage.getItem('access_token')) ||
    (typeof window !== 'undefined' && sessionStorage.getItem('access_token')) ||
    null;
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
assistantClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      // Rate limit handling
      const retryAfter = error.response.headers['retry-after'];
      console.warn(`Rate limited. Retry after ${retryAfter}s`);
    }
    return Promise.reject(error);
  }
);

export const assistantApi = {
  // List all available assistants
  async getAssistants(): Promise<{ assistants: Assistant[]; default_assistant: string }> {
    const { data } = await assistantClient.get('/assistant/');
    return data;
  },

  // Get specific assistant
  async getAssistant(assistantId: string): Promise<Assistant> {
    const { data } = await assistantClient.get(`/assistant/${assistantId}/`);
    return data;
  },

  // Run a message (REST fallback)
  async runMessage(request: RunMessageRequest): Promise<RunMessageResponse> {
    const { data } = await assistantClient.post('/assistant/run/', request);
    return data;
  },

  // List threads for authenticated user
  async getThreads(assistantId?: string): Promise<Thread[]> {
    const params = assistantId ? { assistant_id: assistantId } : undefined;
    const { data } = await assistantClient.get('/assistant/threads/', { params });
    return data.threads || data;
  },

  // Get specific thread with messages
  async getThread(threadId: string): Promise<{ thread: Thread; messages: Message[] }> {
    const { data } = await assistantClient.get(`/assistant/threads/${threadId}/`);
    return data;
  },

  // Create new thread
  async createThread(assistantId: string, title?: string): Promise<Thread> {
    const { data } = await assistantClient.post('/assistant/threads/', {
      assistant_id: assistantId,
      title: title || 'New Conversation',
    });
    return data;
  },

  // Update thread
  async updateThread(threadId: string, updates: Partial<Thread>): Promise<Thread> {
    const { data } = await assistantClient.patch(`/assistant/threads/${threadId}/`, updates);
    return data;
  },

  // Delete thread
  async deleteThread(threadId: string): Promise<void> {
    await assistantClient.delete(`/assistant/threads/${threadId}/`);
  },

  // ─── AskMe Guided Prompt Builder ─────────────────────────────────────────

  // Step 1: Start a guided session with an initial request
  async startAskMe(request: string): Promise<AskMeStartResponse> {
    const { data } = await assistantClient.post('/askme/start/', { request });
    return data;
  },

  // Step 2: Answer a question; returns the next question or marks completion
  async answerAskMe(sessionId: string, answer: string): Promise<AskMeAnswerResponse> {
    const { data } = await assistantClient.post('/askme/answer/', {
      session_id: sessionId,
      answer,
    });
    return data;
  },

  // Step 3: Finalize the session — backend composes the final polished prompt
  async finalizeAskMe(sessionId: string): Promise<AskMeFinalizeResponse> {
    const { data } = await assistantClient.post('/askme/finalize/', {
      session_id: sessionId,
    });
    return data;
  },

  // List past AskMe sessions for the authenticated user
  async getAskMeSessions(): Promise<AskMeSessionSummary[]> {
    const { data } = await assistantClient.get('/askme/sessions/');
    return data.sessions ?? data;
  },

  // Get a single AskMe session
  async getAskMeSession(sessionId: string): Promise<AskMeSessionSummary> {
    const { data } = await assistantClient.get(`/askme/sessions/${sessionId}/`);
    return data;
  },

  // Delete an AskMe session
  async deleteAskMeSession(sessionId: string): Promise<void> {
    await assistantClient.delete(`/askme/sessions/${sessionId}/delete/`);
  },
};