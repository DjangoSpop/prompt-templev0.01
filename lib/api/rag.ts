import { fetchJSON } from './client';
import { OptimizeRequest, OptimizeResponse } from './types';

export async function optimizePrompt(
  input: OptimizeRequest,
  token?: string
): Promise<OptimizeResponse> {
  return fetchJSON<OptimizeResponse>('/api/v1/ai-services/agent/optimize/', {
    method: 'POST',
    body: JSON.stringify(input),
    token,
  });
}

export async function getIndexStatus(token?: string) {
  return fetchJSON('/api/v1/ai-services/agent/stats/', {
    method: 'GET',
    token,
  });
}

export async function searchSimilar(
  query: string,
  limit = 5,
  token?: string
) {
  return fetchJSON('/api/v1/ai-services/search/', {
    method: 'POST',
    body: JSON.stringify({ query, limit }),
    token,
  });
}