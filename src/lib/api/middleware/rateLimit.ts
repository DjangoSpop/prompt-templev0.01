import { NextRequest } from 'next/server';
import { logger } from '../logger';

interface RateLimitConfig {
  max: number;
  windowMs: number;
  keyGenerator?: (request: NextRequest) => string;
  skipSuccessful?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class MemoryRateLimitStore {
  private store = new Map<string, RateLimitRecord>();

  get(key: string): RateLimitRecord | undefined {
    const record = this.store.get(key);
    if (record && Date.now() > record.resetTime) {
      this.store.delete(key);
      return undefined;
    }
    return record;
  }

  set(key: string, record: RateLimitRecord): void {
    this.store.set(key, record);
  }

  increment(key: string, windowMs: number): RateLimitRecord {
    const now = Date.now();
    const resetTime = now + windowMs;
    
    const existing = this.get(key);
    if (existing) {
      existing.count++;
      return existing;
    }

    const newRecord = { count: 1, resetTime };
    this.set(key, newRecord);
    return newRecord;
  }

  // Cleanup expired records periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Global store instance
const rateLimitStore = new MemoryRateLimitStore();

// Cleanup every 5 minutes
setInterval(() => {
  rateLimitStore.cleanup();
}, 5 * 60 * 1000);

export interface RateLimitResult {
  success: boolean;
  totalHits: number;
  limit: number;
  remaining: number;
  resetTime: Date;
}

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const {
    max,
    windowMs,
    keyGenerator = defaultKeyGenerator,
  } = config;

  const key = keyGenerator(request);
  const record = rateLimitStore.increment(key, windowMs);

  const result: RateLimitResult = {
    success: record.count <= max,
    totalHits: record.count,
    limit: max,
    remaining: Math.max(0, max - record.count),
    resetTime: new Date(record.resetTime),
  };

  if (!result.success) {
    logger.warn('Rate limit exceeded', {
      key,
      totalHits: result.totalHits,
      limit: result.limit,
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent'),
      url: request.url,
    });
  }

  return result;
}

function defaultKeyGenerator(request: NextRequest): string {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `${ip}:${userAgent}`;
}

function getClientIP(request: NextRequest): string {
  // Check various headers for the real client IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || clientIP || 'unknown';
}

// Pre-configured rate limit functions
export const rateLimits = {
  strict: (request: NextRequest) => rateLimit(request, {
    max: 10,
    windowMs: 60 * 1000, // 1 minute
  }),

  moderate: (request: NextRequest) => rateLimit(request, {
    max: 50,
    windowMs: 60 * 1000, // 1 minute
  }),

  lenient: (request: NextRequest) => rateLimit(request, {
    max: 100,
    windowMs: 60 * 1000, // 1 minute
  }),

  authAttempts: (request: NextRequest) => rateLimit(request, {
    max: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyGenerator: (req) => `auth:${getClientIP(req)}`,
  }),

  apiCalls: (request: NextRequest) => rateLimit(request, {
    max: 1000,
    windowMs: 60 * 60 * 1000, // 1 hour
  }),
} as const;