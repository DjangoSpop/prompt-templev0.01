/**
 * PromptCraft Academy - Type Definitions
 *
 * Core TypeScript interfaces for the 5-module interactive learning system
 */

// ============================================================================
// MODULE & LESSON TYPES
// ============================================================================

export interface Module {
  id: string;                    // 'module-1', 'module-2', etc.
  title: string;                 // 'Foundations of Prompt Engineering'
  shortTitle: string;            // 'Foundations'
  duration: number;              // Estimated time in minutes
  description: string;           // Brief module description
  objectives: string[];          // Learning objectives (3-5 items)
  badge: string;                 // Emoji badge (e.g., '🏛️')
  xpReward: number;              // XP awarded on completion
  order: number;                 // Display order (1-5)
  locked: boolean;               // Whether module requires unlock
  lessons: Lesson[];             // Array of lessons in this module
  quiz: Quiz;                    // Final quiz for this module
  prerequisites: string[];       // Module IDs required before this one
}

export interface Lesson {
  id: string;                    // 'lesson-1-1', 'lesson-1-2', etc.
  moduleId: string;              // Parent module ID
  title: string;                 // Lesson title
  content: LessonContent[];      // Array of content blocks
  estimatedTime: number;         // Time in minutes
  order: number;                 // Display order within module
  xpReward: number;              // XP for completing lesson
}

// ============================================================================
// LESSON CONTENT TYPES (Polymorphic Content Blocks)
// ============================================================================

export type LessonContent =
  | TextContent
  | HeadingContent
  | ListContent
  | CodeContent
  | CalloutContent
  | ImageContent
  | InteractiveContent
  | VideoContent;

export interface TextContent {
  type: 'text';
  value: string;                 // Plain text or markdown
}

export interface HeadingContent {
  type: 'heading';
  level: 2 | 3 | 4;              // h2, h3, or h4
  value: string;                 // Heading text
}

export interface ListContent {
  type: 'list';
  items: string[];               // List items
  ordered?: boolean;             // true = ordered (ol), false = unordered (ul)
}

export interface CodeContent {
  type: 'code';
  language: string;              // 'typescript', 'python', 'bash', etc.
  code: string;                  // Code content
  caption?: string;              // Optional caption below code
}

export interface CalloutContent {
  type: 'callout';
  variant: 'info' | 'warning' | 'success' | 'tip' | 'danger';
  text: string;                  // Callout content
  title?: string;                // Optional title
}

export interface ImageContent {
  type: 'image';
  src: string;                   // Image URL or path
  alt: string;                   // Alt text for accessibility
  caption?: string;              // Optional caption
  width?: number;                // Optional width
  height?: number;               // Optional height
}

export interface InteractiveContent {
  type: 'interactive';
  component: InteractiveComponentType;
  props?: Record<string, any>;   // Props to pass to component
}

export type InteractiveComponentType =
  | 'PromptBuilder'
  | 'BeforeAfterTransformer'
  | 'ROICalculator'
  | 'PromptQualitySlider'
  | 'SpotTheProblemGame';

export interface VideoContent {
  type: 'video';
  url: string;                   // Video URL (YouTube, Vimeo, etc.)
  thumbnail?: string;            // Optional thumbnail image
  duration?: number;             // Duration in seconds
}

// ============================================================================
// QUIZ TYPES
// ============================================================================

export interface Quiz {
  id: string;                    // 'quiz-module-1'
  moduleId: string;              // Parent module ID
  title: string;                 // Quiz title
  description: string;           // Brief description
  passingScore: number;          // Percentage required to pass (e.g., 70)
  questions: QuizQuestion[];     // Array of questions
  xpReward: number;              // XP for passing quiz
  timeLimit?: number;            // Optional time limit in seconds
}

export interface QuizQuestion {
  id: string;                    // 'q-1-1', 'q-1-2', etc.
  question: string;              // Question text
  type: QuizQuestionType;        // Question type
  options: string[];             // Answer options
  correctAnswer: string | string[];  // Correct answer(s) - index as string or array of indices
  explanation: string;           // Explanation shown after answering
  points: number;                // Points for correct answer
  hint?: string;                 // Optional hint
}

export type QuizQuestionType =
  | 'multiple-choice'            // Single correct answer
  | 'true-false'                 // True or false
  | 'multi-select'               // Multiple correct answers
  | 'drag-to-rank';              // Drag items to rank them

// ============================================================================
// PROMPT IQ TEST TYPES
// ============================================================================

export interface PromptIQTest {
  id: string;                    // 'prompt-iq-test'
  title: string;                 // 'Prompt IQ Test'
  description: string;           // Test description
  timeLimit: number;             // Time limit in seconds (e.g., 60)
  questions: QuizQuestion[];     // Array of questions
  scoreRanges: ScoreRange[];     // Score interpretation ranges
}

export interface ScoreRange {
  min: number;                   // Minimum percentage
  max: number;                   // Maximum percentage
  label: string;                 // 'Beginner', 'Intermediate', 'Expert'
  message: string;               // Personalized message for this range
  emoji: string;                 // Emoji representation
}

// ============================================================================
// PROGRESS & STATE TYPES
// ============================================================================

export interface AcademyProgress {
  // Module completion
  completedModules: string[];    // Array of completed module IDs

  // Per-module progress
  moduleProgress: Record<string, ModuleProgress>;

  // Unlock status
  unlockedModules: string[];     // Array of unlocked module IDs
  emailSubmitted: string | null; // Email if user unlocked via email

  // Prompt IQ Test
  promptIQScore: number | null;  // Score from IQ test (0-100)
  promptIQCompleted: boolean;    // Whether IQ test was completed

  // Interactive component states
  interactiveStates: Record<string, any>;

  // Certificate
  certificateGenerated: boolean;
  certificateId: string | null;

  // Metadata
  totalXPEarned: number;         // Total XP from academy
  totalTimeSpent: number;        // Total time in seconds
  startedAt: Date | null;        // When user started academy
  lastAccessed: Date | null;     // Last time user accessed academy
}

export interface ModuleProgress {
  lessonsCompleted: string[];    // Array of completed lesson IDs
  quizScore: number | null;      // Quiz score (0-100)
  quizAttempts: number;          // Number of quiz attempts
  timeSpent: number;             // Time spent on module in seconds
  lastAccessed: Date;            // Last access timestamp
  completed: boolean;            // Whether module is fully complete
  startedAt: Date;               // When user started this module
}

export interface QuizAttempt {
  attemptNumber: number;         // 1, 2, 3, etc.
  score: number;                 // Score achieved (0-100)
  answers: Record<string, string>;  // questionId -> answer
  timestamp: Date;               // When attempt was made
  passed: boolean;               // Whether user passed
  timeSpent: number;             // Time spent in seconds
}

// ============================================================================
// UNLOCK & CONVERSION TYPES
// ============================================================================

export interface UnlockStatus {
  unlocked: boolean;             // Whether module is unlocked
  reason: UnlockReason;          // Why it's unlocked (or not)
  message: string;               // User-facing message
}

export type UnlockReason =
  | 'free'                       // Module 1 is always free
  | 'extension'                  // Unlocked via extension install
  | 'email'                      // Unlocked via email submission
  | 'authenticated'              // Unlocked for logged-in users
  | 'locked';                    // Not unlocked

export interface EmailUnlockRequest {
  email: string;                 // User's email
  source: string;                // Where they unlocked from
  name?: string;                 // Optional user name
  moduleId?: string;             // Module they were trying to access
}

// ============================================================================
// CERTIFICATE TYPES
// ============================================================================

export interface Certificate {
  id: string;                    // Unique certificate ID
  userId?: string;               // User ID (if authenticated)
  name: string;                  // User's name on certificate
  email?: string;                // User's email
  completedAt: Date;             // Completion timestamp
  modules: string[];             // Completed module IDs
  totalXP: number;               // Total XP earned
  timeSpent: number;             // Total time in seconds
  imageUrl?: string;             // URL to certificate PNG
  pdfUrl?: string;               // URL to certificate PDF
  verificationUrl?: string;      // Public verification URL
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface AcademyAnalyticsEvent {
  event: AcademyEventType;
  userId?: string;               // Optional user ID
  properties: Record<string, any>;
  timestamp: Date;
}

export type AcademyEventType =
  // Landing & Discovery
  | 'academy_landing_viewed'
  | 'academy_iq_test_started'
  | 'academy_iq_test_completed'

  // Module Progress
  | 'academy_module_started'
  | 'academy_module_completed'
  | 'academy_lesson_viewed'
  | 'academy_lesson_completed'

  // Quiz Events
  | 'academy_quiz_started'
  | 'academy_quiz_question_answered'
  | 'academy_quiz_completed'

  // Interactive Components
  | 'academy_interactive_started'
  | 'academy_interactive_completed'

  // Conversion Events
  | 'academy_unlock_attempt'
  | 'academy_unlock_success'
  | 'academy_email_captured'
  | 'academy_extension_detected'

  // Engagement Events
  | 'academy_cta_clicked'
  | 'academy_shared'
  | 'academy_certificate_generated'
  | 'academy_certificate_downloaded';

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ProgressSaveResponse {
  success: boolean;
  message: string;
}

export interface ProgressLoadResponse {
  completedModules: string[];
  moduleProgress: Record<string, ModuleProgress>;
  totalXP: number;
  certificateGenerated: boolean;
}

export interface UnlockResponse {
  success: boolean;
  unlockedModules: string[];
  accessToken?: string;          // Optional JWT for future auth
  message: string;
}

export interface CertificateGenerationResponse {
  certificateId: string;
  certificateUrl: string;        // Public URL to view
  imageUrl: string;              // PNG download URL
  pdfUrl: string;                // PDF download URL
  verificationUrl: string;       // Public verification URL
}
