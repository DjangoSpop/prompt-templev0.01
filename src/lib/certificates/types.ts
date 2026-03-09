/**
 * Certificate System - Type Definitions
 *
 * Complete data model for certificate issuance, verification, and sharing.
 */

// ============================================================================
// CERTIFICATE CORE TYPES
// ============================================================================

export interface Certificate {
  id: string;
  slug: string;
  userId: string | null;
  learnerName: string;
  learnerEmail: string | null;
  courseId: string;
  courseTitle: string;
  certificateTitle: string;
  instructorName: string;
  academyName: string;
  issueDate: string; // ISO date
  completionDate: string; // ISO date
  verificationCode: string;
  status: CertificateStatus;
  score: number | null;
  distinction: CertificateDistinction | null;
  totalXP: number;
  totalTimeSpent: number; // seconds
  modulesCompleted: string[];
  templateId: string;
  createdAt: string;
  updatedAt: string;
}

export type CertificateStatus = 'active' | 'revoked' | 'expired';

export type CertificateDistinction =
  | 'standard'    // < 80% average
  | 'honors'      // 80-89% average
  | 'high_honors' // 90-94% average
  | 'summa'       // 95%+ average
  ;

// ============================================================================
// CERTIFICATE GENERATION
// ============================================================================

export interface CertificateGenerationInput {
  learnerName: string;
  learnerEmail?: string;
  userId?: string;
  courseId: string;
  modulesCompleted: string[];
  averageScore: number;
  totalXP: number;
  totalTimeSpent: number;
  completionDate: string;
}

export interface CertificateGenerationResult {
  certificate: Certificate;
  shareUrl: string;
  verificationUrl: string;
}

// ============================================================================
// CERTIFICATE VERIFICATION
// ============================================================================

export type VerificationStatus = 'valid' | 'invalid' | 'revoked' | 'expired';

export interface VerificationResult {
  status: VerificationStatus;
  certificate: Certificate | null;
  message: string;
}

// ============================================================================
// CERTIFICATE SHARING
// ============================================================================

export interface CertificateShareData {
  shareUrl: string;
  verificationUrl: string;
  twitterText: string;
  linkedinText: string;
  whatsappText: string;
  facebookUrl: string;
  copyText: string;
  ogImageUrl: string;
}

// ============================================================================
// CERTIFICATE TEMPLATE
// ============================================================================

export interface CertificateTemplate {
  id: string;
  name: string;
  borderStyle: 'pharaonic' | 'modern' | 'classic';
  accentColor: string;
  sealType: 'ankh' | 'eye_of_horus' | 'scarab';
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const ACADEMY_CONSTANTS = {
  COURSE_ID: 'promptcraft-mastery',
  COURSE_TITLE: 'Prompt Engineering Mastery',
  INSTRUCTOR_NAME: 'Prompt Temple Academy',
  ACADEMY_NAME: 'Prompt Temple Academy',
  TOTAL_MODULES: 6,
  PASSING_SCORE: 70,
  DEFAULT_TEMPLATE_ID: 'pharaonic-gold',
} as const;
