import { z } from 'zod';

const envSchema = z.object({
  // API Configuration
  // Allow both full URLs and relative paths (e.g., /api/proxy for Next.js proxy)
  NEXT_PUBLIC_API_BASE_URL: z.string().refine(
    (val) => val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/'),
    { message: 'Must be a valid URL or relative path starting with /' }
  ).default('http://localhost:3000/api/proxy'),
  NEXT_PUBLIC_APP_NAME: z.string().default('PromptCraft'),
  NEXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_ENVIRONMENT: z.string().default('development'),
  
  // Authentication
  NEXTAUTH_URL: z.string().refine(
    (val) => val.startsWith('http://') || val.startsWith('https://'),
    { message: 'Must be a valid URL' }
  ).default('http://localhost:3000'),
  NEXTAUTH_SECRET: z.string().default('development-secret-key-change-in-production'),
  
  // Third-party Authentication
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  NEXT_PUBLIC_GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  
  // Database
  DATABASE_URL: z.string().optional(),
  
  // Redis
  REDIS_URL: z.string().optional(),
  
  // Analytics & Monitoring
  ANALYTICS_API_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  
  // Feature Flags
  ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('true'),
  ENABLE_TEAMS: z.string().transform(val => val === 'true').default('true'),
  ENABLE_BILLING: z.string().transform(val => val === 'true').default('true'),
  
  // Development flags
  NEXT_PUBLIC_DEV_MODE: z.string().transform(val => val === 'true').default('true'),
  NEXT_PUBLIC_MOCK_API: z.string().transform(val => val === 'true').default('false'),
  
  // CORS
  ALLOWED_ORIGINS: z.string().default('http://127.0.0.1:8000'),
});

export type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(): EnvConfig {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (typeof window !== 'undefined') {
      // On client side, use defaults for missing variables
      console.warn('Environment validation failed, using defaults:', error);
      return {
        NEXT_PUBLIC_API_BASE_URL: 'http://localhost:3000/api/proxy',
        NEXT_PUBLIC_APP_NAME: 'PromptCraft',
        NEXT_PUBLIC_APP_VERSION: '1.0.0',
        NODE_ENV: 'development' as const,
        NEXT_PUBLIC_APP_ENVIRONMENT: 'development',
        NEXTAUTH_URL: 'http://127.0.0.1:8000',
        NEXTAUTH_SECRET: 'development-secret-key-change-in-production',
        NEXT_PUBLIC_GOOGLE_CLIENT_ID: undefined,
        GOOGLE_CLIENT_SECRET: undefined,
        NEXT_PUBLIC_GITHUB_CLIENT_ID: undefined,
        GITHUB_CLIENT_SECRET: undefined,
        DATABASE_URL: undefined,
        REDIS_URL: undefined,
        ANALYTICS_API_KEY: undefined,
        SENTRY_DSN: undefined,
        ENABLE_ANALYTICS: true,
        ENABLE_TEAMS: true,
        ENABLE_BILLING: true,
        NEXT_PUBLIC_DEV_MODE: true,
        NEXT_PUBLIC_MOCK_API: true,
        ALLOWED_ORIGINS: 'http://127.0.0.1:8000',
      } as EnvConfig;
    }
    
    // On server side, fail fast
    console.error('Environment validation failed:', error);
    throw new Error('Invalid environment configuration');
  }
}

export const env = validateEnv();

// Helper functions
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isProduction = () => env.NODE_ENV === 'production';
export const isTest = () => env.NODE_ENV === 'test';

// API Configuration
export const apiConfig = {
  baseUrl: env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

// Feature flags
export const features = {
  analytics: env.ENABLE_ANALYTICS,
  teams: env.ENABLE_TEAMS,
  billing: env.ENABLE_BILLING,
  devMode: env.NEXT_PUBLIC_DEV_MODE,
  mockApi: env.NEXT_PUBLIC_MOCK_API,
} as const;