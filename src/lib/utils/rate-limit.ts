interface RateLimitOptions {
  interval: number;
  uniqueTokenPerInterval: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

interface TokenData {
  count: number;
  resetTime: number;
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new Map<string, TokenData>();

  // Clean up expired entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of tokenCache.entries()) {
      if (now > data.resetTime) {
        tokenCache.delete(key);
      }
    }
  }, options.interval);

  return {
    check: (limit: number, token: string): Promise<RateLimitResult> =>
      new Promise((resolve, reject) => {
        const now = Date.now();
        const resetTime = now + options.interval;

        let tokenData = tokenCache.get(token);

        if (!tokenData || now > tokenData.resetTime) {
          tokenData = { count: 0, resetTime };
          tokenCache.set(token, tokenData);
        }

        tokenData.count += 1;

        const currentUsage = tokenData.count;
        const isRateLimited = currentUsage > limit;

        const result: RateLimitResult = {
          success: !isRateLimited,
          limit,
          remaining: Math.max(0, limit - currentUsage),
          reset: tokenData.resetTime,
        };

        if (isRateLimited) {
          reject(result);
        } else {
          resolve(result);
        }
      }),
  };
}