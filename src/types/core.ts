/**
 * Core type definitions for Prompt Temple
 * Strict TypeScript types with comprehensive documentation
 */

// ============================================
// API Response Types
// ============================================

export interface APIResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  errors?: APIError[];
  meta?: ResponseMeta;
}

export interface APIError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

export interface ResponseMeta {
  timestamp: string;
  requestId: string;
  page?: number;
  pageSize?: number;
  total?: number;
}

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: UserRole;
  plan: UserPlan;
  credits: number;
  xp: number;
  streak: number;
  createdAt: string;
  lastActiveAt: string;
  preferences: UserPreferences;
}

export type UserRole = 'free' | 'pro' | 'enterprise' | 'admin';
export type UserPlan = 'free' | 'starter' | 'professional' | 'enterprise';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ar';
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisible: boolean;
    shareProgress: boolean;
  };
}

// ============================================
// Learning Module Types
// ============================================

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  summary: string;
  category: CourseCategory;
  difficulty: CourseDifficulty;
  estimatedHours: number;
  lessons: Lesson[];
  instructor: Instructor;
  thumbnail: string;
  tags: string[];
  prerequisites: string[];
  learningObjectives: string[];
  certificateAvailable: boolean;
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export type CourseCategory = 
  | 'prompt-engineering'
  | 'ai-fundamentals'
  | 'langchain'
  | 'rag-systems'
  | 'prompt-optimization'
  | 'advanced-techniques';

export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  slides: Slide[];
  quiz?: Quiz;
  resources: LessonResource[];
  isLocked: boolean;
  prerequisites: string[];
}

export interface Slide {
  id: string;
  lessonId: string;
  type: SlideType;
  order: number;
  title: string;
  content: string; // Markdown
  metadata: SlideMetadata;
}

export type SlideType = 
  | 'text'
  | 'image'
  | 'video'
  | 'interactive'
  | 'code'
  | 'quiz'
  | 'exercise';

export interface SlideMetadata {
  promptExample?: string;
  codeSnippet?: string;
  language?: string;
  expectedOutput?: string;
  hints?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  passingScore: number;
  timeLimit?: number; // seconds
  questions: QuizQuestion[];
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  type: QuizQuestionType;
  question: string;
  options: string[];
  correctAnswer: number | number[] | string;
  explanation: string;
  points: number;
  hints?: string[];
}

export type QuizQuestionType = 
  | 'multiple-choice'
  | 'multiple-select'
  | 'true-false'
  | 'text-input'
  | 'code-completion';

export interface LessonResource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'article' | 'code' | 'link';
  url: string;
  size?: number;
  duration?: number;
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  expertise: string[];
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

// ============================================
// User Progress Types
// ============================================

export interface UserCourseProgress {
  userId: string;
  courseId: string;
  enrolledAt: string;
  lastAccessedAt: string;
  completedLessons: string[];
  currentLessonId?: string;
  progress: number; // 0-100
  timeSpent: number; // minutes
  certificateEarned: boolean;
  certificateId?: string;
}

export interface UserLessonProgress {
  userId: string;
  lessonId: string;
  startedAt: string;
  completedAt?: string;
  completedSlides: string[];
  currentSlideId?: string;
  progress: number; // 0-100
  timeSpent: number; // minutes
  quizAttempts: QuizAttempt[];
  bestQuizScore?: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  startedAt: string;
  submittedAt: string;
  answers: Record<string, number | number[] | string>;
  score: number;
  passed: boolean;
  timeSpent: number; // seconds
}

// ============================================
// Prompt Optimization Types
// ============================================

export interface PromptOptimization {
  id: string;
  userId: string;
  original: string;
  revised: string;
  mode: OptimizationMode;
  critiques: Critique[];
  scoreBefore: number;
  scoreAfter: number;
  delta: number;
  processingTimeMs: number;
  citations: Citation[];
  metadata: OptimizationMetadata;
  createdAt: string;
}

export type OptimizationMode = 'fast' | 'deep' | 'creative' | 'precision';

export interface Critique {
  id: string;
  type: CritiqueType;
  severity: CritiqueSeverity;
  issue: string;
  fix: string;
  example?: string;
  lineNumber?: number;
  affectedText?: string;
}

export type CritiqueType = 
  | 'clarity'
  | 'specificity'
  | 'safety'
  | 'efficiency'
  | 'structure'
  | 'context'
  | 'constraints'
  | 'examples'
  | 'formatting';

export type CritiqueSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Citation {
  id: string;
  source: string;
  url?: string;
  relevance: number;
  excerpt: string;
}

export interface OptimizationMetadata {
  tokenCount: {
    before: number;
    after: number;
    saved: number;
  };
  modelUsed: string;
  temperature: number;
  ragDocsUsed: number;
  userFeedback?: 'accepted' | 'rejected' | 'modified';
  tags: string[];
}

// ============================================
// Template Types
// ============================================

export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  content: string;
  variables: TemplateVariable[];
  author: TemplateAuthor;
  isPublic: boolean;
  isPremium: boolean;
  price?: number;
  rating: number;
  usageCount: number;
  favorites: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'select' | 'multiline' | 'boolean';
  label: string;
  description?: string;
  defaultValue?: string | number | boolean;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface TemplateAuthor {
  id: string;
  name: string;
  avatar?: string;
  verified: boolean;
}

// ============================================
// Certificate Types
// ============================================

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  type: CertificateType;
  issuedAt: string;
  validUntil?: string;
  credentialUrl: string;
  nftTokenId?: string;
  blockchain?: 'polygon' | 'ethereum' | 'none';
  metadata: CertificateMetadata;
  verificationCode: string;
}

export type CertificateType = 'completion' | 'achievement' | 'mastery';

export interface CertificateMetadata {
  courseName: string;
  instructorName: string;
  completionDate: string;
  finalScore: number;
  hoursCompleted: number;
  skills: string[];
  achievements: string[];
}

// ============================================
// Referral Types
// ============================================

export interface Referral {
  id: string;
  referrerId: string;
  code: string;
  referredUsers: ReferredUser[];
  totalRewards: number;
  status: 'active' | 'paused' | 'expired';
  createdAt: string;
  expiresAt?: string;
}

export interface ReferredUser {
  id: string;
  email: string;
  claimedAt: string;
  rewardClaimed: boolean;
  rewardAmount: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  referralCount: number;
  totalRewards: number;
  xp: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: string;
}

// ============================================
// Analytics Types
// ============================================

export interface AnalyticsEvent {
  event: string;
  timestamp: string;
  userId?: string;
  sessionId: string;
  properties: Record<string, unknown>;
  context: EventContext;
}

export interface EventContext {
  page: string;
  referrer?: string;
  userAgent: string;
  locale: string;
  timezone: string;
  screenResolution: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

export interface NorthStarMetrics {
  wal: number; // Weekly Active Learners
  pqs: number; // Prompt Quality Score
  ccr: number; // Certificate Completion Rate
  vc: number; // Viral Coefficient
  period: {
    start: string;
    end: string;
  };
}

// ============================================
// Notification Types
// ============================================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
  expiresAt?: string;
}

export type NotificationType = 
  | 'course_completed'
  | 'certificate_earned'
  | 'referral_claimed'
  | 'achievement_unlocked'
  | 'system'
  | 'promotion'
  | 'reminder';

// ============================================
// Error Types
// ============================================

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, true, context);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401, true);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403, true);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404, true);
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super('Rate limit exceeded', 'RATE_LIMIT', 429, true, { retryAfter });
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed') {
    super(message, 'NETWORK_ERROR', 0, true);
  }
}

// ============================================
// Utility Types
// ============================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
  state: LoadingState;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
