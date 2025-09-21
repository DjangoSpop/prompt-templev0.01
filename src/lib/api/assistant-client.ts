import axios from 'axios';
import type {
  Assistant,
  Thread,
  Message,
  RunMessageRequest,
  RunMessageResponse,
} from '@/types/assistant';

const API_BASE = process.env.NEXT_PUBLIC_AI_API_BASE || '/api/v2/ai';

export const assistantClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for CSRF tokens
assistantClient.interceptors.request.use((config) => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
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
};