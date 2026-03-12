/**
 * Sharing System Type Definitions
 *
 * Core types for the sharing system including shareable artifacts,
 * share links, rewards, and analytics.
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Types of artifacts that can be shared
 */
export enum ShareableEntityType {
  PROMPT = 'prompt',
  OPTIMIZATION_RESULT = 'optimization_result',
  SMART_TEMPLATE_RESULT = 'smart_template_result',
  BROADCAST_RESULT = 'broadcast_result',
}

/**
 * Visibility levels for shared artifacts
 */
export enum ShareVisibility {
  PUBLIC = 'public',        // Visible to everyone, indexed by search
  PRIVATE = 'private',      // Only accessible via link, not indexed
  UNLISTED = 'unlisted',    // Accessible via link, but hidden from listings
}

/**
 * Conversion types for tracking
 */
export enum ConversionType {
  SIGNUP = 'signup',           // Visitor signs up for account
  REMIX = 'remix',             // Visitor remixes/copies the artifact
  TRY_IN_APP = 'try_in_app',   // Visitor clicks "try in app" CTA
  VIEW = 'view',               // Visitor views the page
}

/**
 * Reward types
 */
export enum RewardType {
  XP = 'xp',                   // Experience points
  CREDITS = 'credits',         // Credit rewards
  BADGE = 'badge',            // Achievement badge
}

// ============================================================================
// CORE ENTITIES
// ============================================================================

/**
 * Base shareable artifact interface
 */
export interface ShareableArtifact {
  id: string;
  slug: string; // Public URL identifier (e.g., 'abc123xyz')
  type: ShareableEntityType;
  ownerId: string;
  visibility: ShareVisibility;
  title: string;
  summary: string;
  previewPayload: {
    text: string;
    metadata: Record<string, unknown>;
  };
  ctaPayload: {
    action: 'try_in_app' | 'clone_prompt' | 'use_template' | 'run_broadcast';
    destination?: string;
  };
  rewardEligible: boolean;
  createdAt: string;
  expiresAt?: string; // Optional expiration
  isRevoked: boolean;
  analytics: {
    views: number;
    shares: number;
    conversions: number;
  };
}

// ============================================================================
// TYPE-SPECIFIC ARTIFACTS
// ============================================================================

/**
 * Shared prompt artifact
 */
export interface PromptArtifact extends ShareableArtifact {
  type: ShareableEntityType.PROMPT;
  previewPayload: {
    text: string;
    beforeScore?: number;
    afterScore?: number;
    improvements?: string[];
  };
}

/**
 * Shared optimization result artifact
 */
export interface OptimizationArtifact extends ShareableArtifact {
  type: ShareableEntityType.OPTIMIZATION_RESULT;
  previewPayload: {
    original: string;
    optimized: string;
    beforeScore: number;
    afterScore: number;
    wowScore: number;
    improvements: string[];
    mode: 'fast' | 'deep';
  };
}

/**
 * Shared smart template result artifact
 */
export interface SmartTemplateArtifact extends ShareableArtifact {
  type: ShareableEntityType.SMART_TEMPLATE_RESULT;
  previewPayload: {
    templateId: string;
    templateTitle: string;
    category: string;
    filledVariables: Record<string, string>;
    resultText: string;
    aiGenerated: boolean;
  };
}

/**
 * Provider result in a broadcast comparison
 */
export interface BroadcastProviderResult {
  id: string;
  name: string; // e.g., 'OpenAI', 'Anthropic'
  model: string; // e.g., 'GPT-4', 'Claude 3'
  result: string;
  score?: number; // Optional quality score
  latency?: number; // Response time in seconds
}

/**
 * Best provider information
 */
export interface BestProvider {
  id: string;
  name: string;
  model: string;
  reason: string; // Why this model was best
}

/**
 * Shared broadcast result artifact
 */
export interface BroadcastArtifact extends ShareableArtifact {
  type: ShareableEntityType.BROADCAST_RESULT;
  previewPayload: {
    prompt: string;
    providers: BroadcastProviderResult[];
    bestProvider: BestProvider;
    comparisonSummary: string;
    totalProviders: number;
  };
}

// ============================================================================
// SHARE LINKS
// ============================================================================

/**
 * Share link entity
 */
export interface ShareLink {
  id: string;
  slug: string;
  artifactId: string;
  artifactType: ShareableEntityType;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  visitCount: number;
  shareCount: number;
  conversionCount: number;
  rewardStatus: {
    claimed: boolean;
    claimedAt?: string;
    rewardType: RewardType;
    rewardAmount: number;
  };
  metadata: {
    source: string; // 'optimizer', 'broadcast', 'template', 'prompt_library'
    utmParams?: Record<string, string>;
  };
}

/**
 * User-facing share link (for management UI)
 */
export interface UserShareLink extends ShareLink {
  artifact: {
    type: ShareableEntityType;
    title: string;
    summary: string;
  };
  isRevoked: boolean;
}

// ============================================================================
// VISITS AND CONVERSIONS
// ============================================================================

/**
 * Share visit record
 */
export interface ShareVisit {
  id: string;
  shareLinkSlug: string;
  visitorIp?: string;
  visitorFingerprint?: string; // Hashed device fingerprint
  visitedAt: string;
  isUniqueVisitor: boolean;
  conversionEventId?: string;
}

/**
 * Share conversion record
 */
export interface ShareConversion {
  id: string;
  shareLinkSlug: string;
  visitorId?: string; // NULL if not signed up
  conversionType: ConversionType;
  convertedAt: string;
  visitorIp?: string;
  metadata: Record<string, unknown>;
}

// ============================================================================
// REWARDS
// ============================================================================

/**
 * Reward configuration
 */
export interface RewardConfig {
  shareCreated: {
    amount: number;
    dailyCap: number;
    description: string;
  };
  shareVisit: {
    amount: number;
    dailyCap: number;
    description: string;
  };
  shareConversion: {
    signup: { amount: number; description: string };
    remix: { amount: number; description: string };
    tryInApp: { amount: number; description: string };
    dailyCap: number;
  };
}

/**
 * Daily reward cap entry
 */
export interface DailyRewardCap {
  id: string;
  userId: string;
  rewardType: RewardType;
  date: string; // ISO date string (YYYY-MM-DD)
  count: number;
  totalAmount: number;
}

/**
 * Reward claim request
 */
export interface ClaimRewardRequest {
  shareId: string;
  shareSlug: string;
}

/**
 * Reward claim response
 */
export interface ClaimRewardResponse {
  success: boolean;
  reward?: {
    type: RewardType;
    amount: number;
    totalXp?: number;
    totalCredits?: number;
  };
  error?: string;
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Share analytics overview
 */
export interface ShareAnalyticsOverview {
  totalViews: number;
  uniqueVisitors: number;
  totalShares: number;
  totalConversions: number;
  conversionRate: number;
}

/**
 * Daily analytics breakdown
 */
export interface DailyAnalytics {
  date: string;
  views: number;
  shares: number;
  conversions: number;
}

/**
 * Source breakdown
 */
export interface SourceAnalytics {
  source: string; // 'twitter', 'linkedin', 'direct', etc.
  count: number;
  percentage: number;
}

/**
 * Conversion type breakdown
 */
export interface ConversionTypeAnalytics {
  type: ConversionType;
  count: number;
}

/**
 * Full share analytics
 */
export interface ShareAnalytics {
  shareId: string;
  shareSlug: string;
  overview: ShareAnalyticsOverview;
  breakdown: {
    byDay: DailyAnalytics[];
    bySource: SourceAnalytics[];
    byConversionType: ConversionTypeAnalytics[];
  };
  rewardStatus: {
    eligible: boolean;
    claimed: boolean;
    claimedAt?: string;
    rewardType: RewardType;
    rewardAmount: number;
  };
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Create share link request
 */
export interface CreateShareRequest {
  artifactId: string;
  artifactType: ShareableEntityType;
  expiresAt?: string; // ISO date string
  metadata?: Record<string, unknown>;
}

/**
 * Create share link response
 */
export interface CreateShareResponse {
  id: string;
  slug: string;
  shareUrl: string;
  artifact: ShareableArtifact;
  createdAt: string;
  expiresAt?: string;
  rewardEligible: boolean;
}

/**
 * Get public share response (no private data)
 */
export interface GetPublicShareResponse {
  id: string;
  slug: string;
  artifact: ShareableArtifact;
  createdAt: string;
  viewCount: number; // Public-facing count (can be rounded)
  isRevoked: boolean;
  isExpired: boolean;
}

/**
 * List user shares request params
 */
export interface ListSharesParams {
  limit?: number;
  offset?: number;
  artifactType?: ShareableEntityType;
}

/**
 * List user shares response
 */
export interface ListSharesResponse {
  results: UserShareLink[];
  count: number;
  next?: string;
  previous?: string;
}

/**
 * Revoke share link request
 */
export interface RevokeShareRequest {
  action: 'revoke';
  reason?: string;
}

/**
 * Revoke share link response
 */
export interface RevokeShareResponse {
  id: string;
  isRevoked: boolean;
  revokedAt: string;
}

/**
 * Delete share link response
 */
export interface DeleteShareResponse {
  success: true;
  message: string;
}

/**
 * Record visit request
 */
export interface RecordVisitRequest {
  visitorFingerprint?: string; // Optional hashed device fingerprint
  utmParams?: Record<string, string>;
  visitorIp?: string; // Sent by server
}

/**
 * Record visit response
 */
export interface RecordVisitResponse {
  visitId: string;
  isFirstVisit: boolean;
  viewCount: number;
}

/**
 * Record conversion request
 */
export interface RecordConversionRequest {
  slug: string; // Share link slug
  conversionType: ConversionType;
  visitorId?: string; // User ID if authenticated
  visitorFingerprint?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Record conversion response
 */
export interface RecordConversionResponse {
  conversionId: string;
  shareId: string;
  conversionCount: number;
  rewardEligible: boolean;
  reward?: {
    type: RewardType;
    amount: number;
  };
}

// ============================================================================
// ABUSE PREVENTION
// ============================================================================

/**
 * Abuse prevention rules
 */
export interface AbusePreventionRules {
  shareCreation: {
    maxPerDay: number;
    minInterval: number; // seconds
  };
  visitTracking: {
    rateLimitPerIp: number;
    rateLimitPerDevice: number;
    deduplicationWindow: string; // e.g., '1 hour'
  };
  conversionTracking: {
    rateLimitPerIp: number;
    cooldownPeriod: string;
    requireHumanActivity: boolean;
  };
  rewards: {
    maxDailyXP: number;
    maxDailyCredits: number;
    cooldownBetweenClaims: string;
    requireAuth: boolean;
  };
}

/**
 * Device fingerprint (hashed)
 */
export type DeviceFingerprint = string;

/**
 * IP address (IPv4 or IPv6)
 */
export type IpAddress = string;

// ============================================================================
// SHARING LEVELS (GAMIFICATION)
// ============================================================================

/**
 * Sharing level with benefits
 */
export interface SharingLevel {
  level: number;
  title: string;
  requiredXp: number;
  benefits: string[];
}

/**
 * Predefined sharing levels
 */
export const SHARING_LEVELS: SharingLevel[] = [
  { level: 1, title: 'Novice Sharer', requiredXp: 0, benefits: ['Share 1 artifact'] },
  { level: 2, title: 'Influencer', requiredXp: 100, benefits: ['Share 5 artifacts', 'Analytics access'] },
  { level: 3, title: 'Trendsetter', requiredXp: 500, benefits: ['Share 25 artifacts', 'Priority support'] },
  { level: 4, title: 'Viral Star', requiredXp: 2000, benefits: ['Share 100 artifacts', 'Custom badge', 'Beta features'] },
  { level: 5, title: 'Legend', requiredXp: 10000, benefits: ['Unlimited shares', 'Premium features'] },
];

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type guard to check if artifact is prompt
 */
export function isPromptArtifact(
  artifact: ShareableArtifact
): artifact is PromptArtifact {
  return artifact.type === ShareableEntityType.PROMPT;
}

/**
 * Type guard to check if artifact is optimization result
 */
export function isOptimizationArtifact(
  artifact: ShareableArtifact
): artifact is OptimizationArtifact {
  return artifact.type === ShareableEntityType.OPTIMIZATION_RESULT;
}

/**
 * Type guard to check if artifact is smart template result
 */
export function isSmartTemplateArtifact(
  artifact: ShareableArtifact
): artifact is SmartTemplateArtifact {
  return artifact.type === ShareableEntityType.SMART_TEMPLATE_RESULT;
}

/**
 * Type guard to check if artifact is broadcast result
 */
export function isBroadcastArtifact(
  artifact: ShareableArtifact
): artifact is BroadcastArtifact {
  return artifact.type === ShareableEntityType.BROADCAST_RESULT;
}

/**
 * Get artifact type label for display
 */
export function getArtifactTypeLabel(type: ShareableEntityType): string {
  const labels: Record<ShareableEntityType, string> = {
    [ShareableEntityType.PROMPT]: 'Prompt',
    [ShareableEntityType.OPTIMIZATION_RESULT]: 'Optimization Result',
    [ShareableEntityType.SMART_TEMPLATE_RESULT]: 'Smart Template',
    [ShareableEntityType.BROADCAST_RESULT]: 'AI Model Comparison',
  };
  return labels[type];
}

/**
 * Get artifact type icon
 */
export function getArtifactTypeIcon(type: ShareableEntityType): string {
  const icons: Record<ShareableEntityType, string> = {
    [ShareableEntityType.PROMPT]: '📝',
    [ShareableEntityType.OPTIMIZATION_RESULT]: '⚡',
    [ShareableEntityType.SMART_TEMPLATE_RESULT]: '🎯',
    [ShareableEntityType.BROADCAST_RESULT]: '🔄',
  };
  return icons[type];
}
