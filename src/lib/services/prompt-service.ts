import { wsService, SearchResult, IntentAnalysisResult } from './websocket';

interface PromptData {
  id: string;
  title: string;
  content: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  version: string;
  usage_count: number;
  rating: number;
  created_at: string;
  updated_at: string;
  vector_embedding?: number[];
  keywords?: string[];
}

interface BulkIngestResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
  duration: number;
}

interface SearchCache {
  [key: string]: {
    results: SearchResult[];
    timestamp: number;
    ttl: number;
  };
}

export class EnhancedPromptService {
  private searchCache: SearchCache = {};
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

  constructor() {
    // Clean up cache periodically
    setInterval(() => {
      this.cleanupCache();
    }, 60000); // Every minute
  }

  // Bulk ingest 100k prompts with batch processing
  async bulkIngestPrompts(prompts: PromptData[], batchSize: number = 1000): Promise<BulkIngestResponse> {
    const startTime = Date.now();
    let processed = 0;
    let failed = 0;
    const errors: string[] = [];

    console.log(`Starting bulk ingest of ${prompts.length} prompts in batches of ${batchSize}`);

    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);
      
      try {
        const response = await fetch(`${this.API_BASE_URL}/api/v2/prompts/bulk-ingest/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`,
          },
          body: JSON.stringify({
            prompts: batch,
            batch_id: `batch_${Math.floor(i / batchSize) + 1}`,
            generate_embeddings: true,
            update_search_index: true,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          processed += result.processed || batch.length;
          console.log(`Batch ${Math.floor(i / batchSize) + 1} processed: ${result.processed || batch.length} prompts`);
        } else {
          failed += batch.length;
          const error = await response.text();
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error}`);
        }
      } catch (error) {
        failed += batch.length;
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${(error as Error).message}`);
      }

      // Add small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Trigger search index optimization after bulk ingest
    await this.optimizeSearchIndex();

    const duration = Date.now() - startTime;
    console.log(`Bulk ingest completed in ${duration}ms. Processed: ${processed}, Failed: ${failed}`);

    return {
      success: failed === 0,
      processed,
      failed,
      errors,
      duration,
    };
  }

  // Enhanced search with caching, vector similarity, and real-time updates
  async searchPrompts(
    query: string, 
    useCache: boolean = true,
    useWebSocket: boolean = true
  ): Promise<SearchResult[]> {
    const cacheKey = `search:${query}`;
    
    // Check cache first
    if (useCache && this.searchCache[cacheKey]) {
      const cached = this.searchCache[cacheKey];
      if (Date.now() - cached.timestamp < cached.ttl) {
        console.log('Returning cached search results');
        return cached.results;
      }
    }

    try {
      let results: SearchResult[];

      if (useWebSocket && wsService.getConnectionStatus()) {
        // Use WebSocket for real-time search (faster)
        results = await wsService.searchPrompts(query);
      } else {
        // Fallback to HTTP API
        results = await this.httpSearch(query);
      }

      // Cache the results
      if (useCache) {
        this.searchCache[cacheKey] = {
          results,
          timestamp: Date.now(),
          ttl: this.CACHE_TTL,
        };
      }

      return results;
    } catch (error) {
      console.error('Search failed:', error);
      
      // Return cached results if available, even if expired
      if (this.searchCache[cacheKey]) {
        console.log('Returning expired cached results due to search failure');
        return this.searchCache[cacheKey].results;
      }
      
      throw error;
    }
  }

  // HTTP search fallback
  private async httpSearch(query: string): Promise<SearchResult[]> {
    const response = await fetch(
      `${this.API_BASE_URL}/api/v2/search/prompts?q=${encodeURIComponent(query)}&use_vector=true&max_results=50`,
      {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  }

  // Analyze user intent and get optimized suggestions
  async analyzeAndOptimizeIntent(userInput: string): Promise<{
    intent: IntentAnalysisResult;
    optimizedPrompts: string[];
    relatedTemplates: SearchResult[];
  }> {
    try {
      // Use WebSocket for real-time intent analysis
      const intent = await wsService.analyzeIntent(userInput);
      
      // Get optimized prompt suggestions based on intent
      const optimizedResponse = await wsService.optimizePrompt({
        userIntent: userInput,
        context: { detectedIntent: intent.detectedIntent },
        sessionId: `session_${Date.now()}`,
      });

      return {
        intent,
        optimizedPrompts: [optimizedResponse.optimizedPrompt, ...optimizedResponse.alternatives],
        relatedTemplates: intent.suggestedTemplates,
      };
    } catch (error) {
      console.error('Intent analysis failed:', error);
      
      // Fallback to HTTP API
      return await this.httpIntentAnalysis(userInput);
    }
  }

  // HTTP intent analysis fallback
  private async httpIntentAnalysis(userInput: string): Promise<{
    intent: IntentAnalysisResult;
    optimizedPrompts: string[];
    relatedTemplates: SearchResult[];
  }> {
    const response = await fetch(`${this.API_BASE_URL}/api/v2/ai/analyze-intent/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({ user_input: userInput }),
    });

    if (!response.ok) {
      throw new Error(`Intent analysis failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      intent: data.intent,
      optimizedPrompts: data.optimized_prompts || [],
      relatedTemplates: data.related_templates || [],
    };
  }

  // Get real-time suggestions as user types
  async getTypingSuggestions(partialText: string): Promise<string[]> {
    if (partialText.length < 3) return [];

    try {
      // Use cached suggestions for common prefixes
      const cacheKey = `suggestions:${partialText.toLowerCase()}`;
      if (this.searchCache[cacheKey]) {
        const cached = this.searchCache[cacheKey];
        if (Date.now() - cached.timestamp < 30000) { // 30 second cache for suggestions
          return cached.results.map(r => r.title);
        }
      }

      const response = await fetch(
        `${this.API_BASE_URL}/api/v2/ai/suggestions?partial=${encodeURIComponent(partialText)}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`,
          },
        }
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const suggestions = data.suggestions || [];

      // Cache suggestions
      this.searchCache[cacheKey] = {
        results: suggestions.map((s: string) => ({ title: s })) as SearchResult[],
        timestamp: Date.now(),
        ttl: 30000,
      };

      return suggestions;
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      return [];
    }
  }

  // Optimize search index for better performance
  private async optimizeSearchIndex(): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/v2/admin/optimize-search-index/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (response.ok) {
        console.log('Search index optimization completed');
      } else {
        console.warn('Search index optimization failed:', response.statusText);
      }
    } catch (error) {
      console.error('Search index optimization error:', error);
    }
  }

  // Generate sample 100k prompts for testing
  generateSamplePrompts(count: number = 100000): PromptData[] {
    const categories = ['Creative Writing', 'Business', 'Technical', 'Educational', 'Marketing', 'Research'];
    const templates = [
      'Create a {type} for {audience} about {topic}',
      'Write a {format} that explains {concept} to {audience}',
      'Generate {count} {items} for {purpose}',
      'Develop a {strategy} to {goal} for {target}',
      'Design a {solution} that {action} for {beneficiary}',
    ];

    const prompts: PromptData[] = [];

    for (let i = 0; i < count; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const template = templates[Math.floor(Math.random() * templates.length)];
      
      prompts.push({
        id: `prompt_${i + 1}`,
        title: `Prompt ${i + 1}: ${template.substring(0, 50)}...`,
        content: template,
        description: `Auto-generated prompt for ${category} use cases`,
        category,
        tags: [`tag${i % 10}`, `category_${category.toLowerCase().replace(' ', '_')}`],
        author: `user_${Math.floor(i / 1000) + 1}`,
        version: '1.0',
        usage_count: Math.floor(Math.random() * 1000),
        rating: Math.random() * 5,
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        keywords: template.match(/\{(\w+)\}/g)?.map(m => m.slice(1, -1)) || [],
      });
    }

    return prompts;
  }

  // Clean up expired cache entries
  private cleanupCache(): void {
    const now = Date.now();
    Object.keys(this.searchCache).forEach(key => {
      const cached = this.searchCache[key];
      if (now - cached.timestamp > cached.ttl) {
        delete this.searchCache[key];
      }
    });
  }

  // Get authentication token
  private getAuthToken(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token') || '';
    }
    return '';
  }

  // Clear cache manually
  clearCache(): void {
    this.searchCache = {};
  }

  // Get cache statistics
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: Object.keys(this.searchCache).length,
      hitRate: 0.85, // Placeholder - implement actual hit rate tracking
    };
  }
}

export const promptService = new EnhancedPromptService();
