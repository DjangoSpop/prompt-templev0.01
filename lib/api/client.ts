import { ApiResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.prompt-temple.com';

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
