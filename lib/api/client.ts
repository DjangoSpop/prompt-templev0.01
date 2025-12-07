import { ApiResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/proxy';

interface RequestOptions extends RequestInit {
  token?: string;
}

export async function fetchJSON<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;
  
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  // Build a mutable headers object and safely merge any provided HeadersInit
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (fetchOptions.headers) {
    const incoming = fetchOptions.headers as HeadersInit;
    if (incoming instanceof Headers) {
      incoming.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(incoming)) {
      for (const [key, value] of incoming) {
        headers[key] = value;
      }
    } else {
      Object.assign(headers, incoming);
    }
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Request failed: ${response.status}`);
  }
  
  return response.json();
}

export async function* streamSSE(
  endpoint: string,
  body: any,
  token?: string
): AsyncGenerator<any, void, unknown> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    throw new Error(`SSE request failed: ${response.status}`);
  }
  
  if (!response.body) {
    throw new Error('No response body');
  }
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            return;
          }
          
          try {
            yield JSON.parse(data);
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// Enhanced API functions for Proactive AI Co-Pilot
export async function analyzeContext(
  request: import('./types').ContextAnalysisRequest,
  token?: string
): Promise<import('./types').ContextAnalysisResponse> {
  return fetchJSON<import('./types').ContextAnalysisResponse>(
    '/api/v2/ai/context/analyze',
    {
      method: 'POST',
      body: JSON.stringify(request),
      token,
    }
  );
}

export async function getSessionInsights(
  sessionId: string,
  request: Partial<import('./types').SessionInsightsRequest> = {},
  token?: string
): Promise<import('./types').SessionInsightsResponse> {
  const params = new URLSearchParams({
    session_id: sessionId,
    ...Object.entries(request).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>)
  });

  return fetchJSON<import('./types').SessionInsightsResponse>(
    `/api/v2/ai/session/${sessionId}/insights?${params}`,
    { method: 'GET', token }
  );
}

export async function generateWorkflow(
  request: import('./types').WorkflowGenerationRequest,
  token?: string
): Promise<import('./types').WorkflowGenerationResponse> {
  return fetchJSON<import('./types').WorkflowGenerationResponse>(
    '/api/v2/ai/workflow/generate',
    {
      method: 'POST',
      body: JSON.stringify(request),
      token,
    }
  );
}

export async function trackAnalyticsEvent(
  event: import('./types').AnalyticsEvent,
  token?: string
): Promise<void> {
  return fetchJSON<void>(
    '/api/v2/analytics/track',
    {
      method: 'POST',
      body: JSON.stringify(event),
      token,
    }
  );
}

// Social Authentication API functions
export async function getSocialProviders(): Promise<import('./types').SocialProvidersResponse> {
  return fetchJSON<import('./types').SocialProvidersResponse>('/api/v2/auth/social/providers/');
}

export async function initiateSocialAuth(
  request: import('./types').SocialAuthInitiateRequest
): Promise<import('./types').SocialAuthInitiateResponse> {
  // Backend initiate endpoint is GET, not POST
  return fetchJSON<import('./types').SocialAuthInitiateResponse>(
    `/api/v2/auth/social/${request.provider}/initiate/`,
    {
      method: 'GET',
    }
  );
}

export async function completeSocialAuth(
  request: import('./types').SocialAuthCallbackRequest
): Promise<import('./types').SocialAuthCallbackResponse> {
  return fetchJSON<import('./types').SocialAuthCallbackResponse>(
    '/api/v2/auth/social/callback/',
    {
      method: 'POST',
      body: JSON.stringify(request),
    }
  );
}

export async function linkSocialAccount(
  request: import('./types').SocialLinkRequest,
  token: string
): Promise<import('./types').SocialLinkResponse> {
  return fetchJSON<import('./types').SocialLinkResponse>(
    '/api/v2/auth/social/link/',
    {
      method: 'POST',
      body: JSON.stringify(request),
      token,
    }
  );
}

export async function unlinkSocialAccount(
  request: import('./types').SocialUnlinkRequest,
  token: string
): Promise<import('./types').SocialUnlinkResponse> {
  return fetchJSON<import('./types').SocialUnlinkResponse>(
    '/api/v2/auth/social/unlink/',
    {
      method: 'POST',
      body: JSON.stringify(request),
      token,
    }
  );
}

// Social Auth utility class for handling OAuth flow
export class SocialAuthManager {
  private providers: Map<string, import('./types').SocialProvider> = new Map();
  private currentState: string | null = null;

  async getAvailableProviders(): Promise<import('./types').SocialProvider[]> {
    const response = await getSocialProviders();
    response.providers.forEach(provider => {
      this.providers.set(provider.id, provider);
    });
    return response.providers.filter(p => p.is_enabled);
  }

  async initiateFlow(provider: 'google' | 'github', redirectUri?: string): Promise<string> {
    const response = await initiateSocialAuth({
      provider,
      redirect_uri: redirectUri,
    });

    this.currentState = response.state;

    // Store state in localStorage for validation
    if (typeof window !== 'undefined') {
      localStorage.setItem('social_auth_state', response.state);
      localStorage.setItem('social_auth_provider', provider);
    }

    return response.authorization_url;
  }

  async handleCallback(
    code: string,
    state: string,
    provider?: string
  ): Promise<import('./types').SocialAuthCallbackResponse> {
    // Validate state parameter
    if (typeof window !== 'undefined') {
      const storedState = localStorage.getItem('social_auth_state');
      const storedProvider = localStorage.getItem('social_auth_provider');

      if (!storedState || storedState !== state) {
        throw new Error('Invalid state parameter - possible CSRF attack');
      }

      if (provider && provider !== storedProvider) {
        throw new Error('Provider mismatch');
      }

      // Clean up stored values
      localStorage.removeItem('social_auth_state');
      localStorage.removeItem('social_auth_provider');
    }

    const response = await completeSocialAuth({
      provider: (provider || 'google') as 'google' | 'github',
      code,
      state,
    });

    return response;
  }

  redirectToProvider(provider: 'google' | 'github', redirectUri?: string): void {
    this.initiateFlow(provider, redirectUri).then(authUrl => {
      if (typeof window !== 'undefined') {
        window.location.href = authUrl;
      }
    });
  }

  getProviderInfo(providerId: string): import('./types').SocialProvider | undefined {
    return this.providers.get(providerId);
  }
}

// Real-time context analysis with debouncing support
export class ContextAnalyzer {
  private debounceTimeout?: NodeJS.Timeout;
  private cache = new Map<string, import('./types').ContextAnalysisResponse>();
  private readonly debounceMs: number;

  constructor(debounceMs = 300) {
    this.debounceMs = debounceMs;
  }

  async analyzeWithDebounce(
    text: string,
    context?: import('./types').ContextAnalysisRequest['context'],
    token?: string
  ): Promise<import('./types').ContextAnalysisResponse | null> {
    return new Promise((resolve) => {
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }

      // Check cache first
      const cacheKey = `${text}-${JSON.stringify(context || {})}`;
      const cached = this.cache.get(cacheKey);
      if (cached && text.length > 10) {
        resolve(cached);
        return;
      }

      this.debounceTimeout = setTimeout(async () => {
        try {
          const response = await analyzeContext({ text, context }, token);
          this.cache.set(cacheKey, response);

          // Limit cache size
          if (this.cache.size > 50) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
          }

          resolve(response);
        } catch (error) {
          console.error('Context analysis failed:', error);
          resolve(null);
        }
      }, this.debounceMs);
    });
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export class WebSocketClient {
  private ws?: WebSocket;
  private url: string;
  private reconnectTimeout?: NodeJS.Timeout;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  constructor(endpoint: string) {
    const wsBase = API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    this.url = `${wsBase}${endpoint}`;
  }
  
  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = token ? `${this.url}?token=${token}` : this.url;
      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        resolve();
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const handler = this.messageHandlers.get(data.type);
          if (handler) {
            handler(data);
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.reconnect(token);
      };
    });
  }
  
  private reconnect(token?: string): void {
    this.reconnectTimeout = setTimeout(() => {
      console.log('Attempting to reconnect WebSocket...');
      this.connect(token);
    }, 5000);
  }
  
  on(event: string, handler: (data: any) => void): void {
    this.messageHandlers.set(event, handler);
  }
  
  off(event: string): void {
    this.messageHandlers.delete(event);
  }
  
  send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
  
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.ws?.close();
  }
}
