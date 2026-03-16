/**
 * Certificate Service
 *
 * Handles certificate generation, verification, and sharing.
 * Currently uses localStorage; designed for easy backend migration.
 */

import {
  Certificate,
  CertificateGenerationInput,
  CertificateGenerationResult,
  CertificateDistinction,
  CertificateShareData,
  VerificationResult,
  ACADEMY_CONSTANTS,
} from './types';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://prompt-temple.com';
const STORAGE_KEY = 'promptcraft-certificates';

// ============================================================================
// ID & CODE GENERATION
// ============================================================================

function generateId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const segments = [8, 4, 4];
  return segments
    .map((len) =>
      Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    )
    .join('-');
}

function generateVerificationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  return `PT-${Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}-${Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}`;
}

function generateSlug(name: string): string {
  const sanitized = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${sanitized}-${suffix}`;
}

// ============================================================================
// DISTINCTION CALCULATION
// ============================================================================

export function calculateDistinction(averageScore: number): CertificateDistinction {
  if (averageScore >= 95) return 'summa';
  if (averageScore >= 90) return 'high_honors';
  if (averageScore >= 80) return 'honors';
  return 'standard';
}

export function getDistinctionLabel(distinction: CertificateDistinction | null): string {
  switch (distinction) {
    case 'summa':
      return 'Summa Cum Laude';
    case 'high_honors':
      return 'Magna Cum Laude';
    case 'honors':
      return 'Cum Laude';
    default:
      return '';
  }
}

// ============================================================================
// LOCAL STORAGE HELPERS
// ============================================================================

function getStoredCertificates(): Certificate[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function storeCertificate(cert: Certificate): void {
  if (typeof window === 'undefined') return;
  const certs = getStoredCertificates();
  const existing = certs.findIndex((c) => c.id === cert.id);
  if (existing >= 0) {
    certs[existing] = cert;
  } else {
    certs.push(cert);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(certs));
}

// ============================================================================
// CERTIFICATE GENERATION
// ============================================================================

export function generateCertificate(
  input: CertificateGenerationInput
): CertificateGenerationResult {
  const id = generateId();
  const slug = generateSlug(input.learnerName);
  const verificationCode = generateVerificationCode();
  const now = new Date().toISOString();
  const distinction = calculateDistinction(input.averageScore);

  const certificate: Certificate = {
    id,
    slug,
    userId: input.userId || null,
    learnerName: input.learnerName,
    learnerEmail: input.learnerEmail || null,
    courseId: input.courseId,
    courseTitle: ACADEMY_CONSTANTS.COURSE_TITLE,
    certificateTitle: 'Certificate of Completion',
    instructorName: ACADEMY_CONSTANTS.INSTRUCTOR_NAME,
    academyName: ACADEMY_CONSTANTS.ACADEMY_NAME,
    issueDate: now,
    completionDate: input.completionDate,
    verificationCode,
    status: 'active',
    score: input.averageScore,
    distinction,
    totalXP: input.totalXP,
    totalTimeSpent: input.totalTimeSpent,
    modulesCompleted: input.modulesCompleted,
    templateId: ACADEMY_CONSTANTS.DEFAULT_TEMPLATE_ID,
    createdAt: now,
    updatedAt: now,
  };

  storeCertificate(certificate);

  return {
    certificate,
    shareUrl: `${APP_URL}/academy/certificate/${slug}`,
    verificationUrl: `${APP_URL}/verify-certificate/${verificationCode}`,
  };
}

// ============================================================================
// CERTIFICATE LOOKUP
// ============================================================================

export function getCertificateBySlug(slug: string): Certificate | null {
  const certs = getStoredCertificates();
  return certs.find((c) => c.slug === slug) || null;
}

export function getCertificateByVerificationCode(code: string): Certificate | null {
  const certs = getStoredCertificates();
  return certs.find((c) => c.verificationCode === code) || null;
}

export function getCertificateById(id: string): Certificate | null {
  const certs = getStoredCertificates();
  return certs.find((c) => c.id === id) || null;
}

export function getUserCertificates(userId?: string): Certificate[] {
  const certs = getStoredCertificates();
  if (!userId) return certs;
  return certs.filter((c) => c.userId === userId);
}

// ============================================================================
// CERTIFICATE VERIFICATION
// ============================================================================

export function verifyCertificate(code: string): VerificationResult {
  const cert = getCertificateByVerificationCode(code);

  if (!cert) {
    return {
      status: 'invalid',
      certificate: null,
      message: 'No certificate found with this verification code.',
    };
  }

  if (cert.status === 'revoked') {
    return {
      status: 'revoked',
      certificate: cert,
      message: 'This certificate has been revoked.',
    };
  }

  if (cert.status === 'expired') {
    return {
      status: 'expired',
      certificate: cert,
      message: 'This certificate has expired.',
    };
  }

  return {
    status: 'valid',
    certificate: cert,
    message: 'This certificate is valid and authentic.',
  };
}

// ============================================================================
// SHARING UTILITIES
// ============================================================================

export function generateShareData(certificate: Certificate): CertificateShareData {
  const shareUrl = `${APP_URL}/academy/certificate/${certificate.slug}`;
  const verificationUrl = `${APP_URL}/verify-certificate/${certificate.verificationCode}`;
  const ogImageUrl = `${APP_URL}/api/og/certificate?name=${encodeURIComponent(certificate.learnerName)}&course=${encodeURIComponent(certificate.courseTitle)}&code=${encodeURIComponent(certificate.verificationCode)}`;

  const distinctionText = certificate.distinction && certificate.distinction !== 'standard'
    ? ` ${getDistinctionLabel(certificate.distinction)}`
    : '';

  const twitterText = [
    `I just completed the ${certificate.courseTitle} course at Prompt Temple Academy!${distinctionText}`,
    '',
    'Earn your own certificate and master prompt engineering.',
    '',
    shareUrl,
    '',
    '#PromptEngineering #AI #Certificate #PromptTemple',
  ].join('\n');

  const linkedinText = [
    `I'm proud to share that I've completed the ${certificate.courseTitle} course at Prompt Temple Academy!${distinctionText}`,
    '',
    `This comprehensive 6-module program covered everything from prompt fundamentals to production-ready AI workflows.`,
    '',
    `Ready to master prompt engineering? Start your journey:`,
    shareUrl,
  ].join('\n');

  const whatsappText = [
    `I just earned my ${certificate.courseTitle} certificate from Prompt Temple Academy!${distinctionText}`,
    '',
    `Check it out: ${shareUrl}`,
    '',
    `Start learning prompt engineering for free!`,
  ].join('\n');

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  const copyText = `I completed the ${certificate.courseTitle} at Prompt Temple Academy!${distinctionText} Verify: ${verificationUrl} | Start learning: ${shareUrl}`;

  return {
    shareUrl,
    verificationUrl,
    twitterText,
    linkedinText,
    whatsappText,
    facebookUrl,
    copyText,
    ogImageUrl,
  };
}

export function openTwitterShare(text: string): void {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'width=600,height=450,noopener');
}

export function openLinkedInShare(shareUrl: string): void {
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  window.open(url, '_blank', 'width=600,height=700,noopener');
}

export function openWhatsAppShare(text: string): void {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener');
}

export function openFacebookShare(facebookUrl: string): void {
  window.open(facebookUrl, '_blank', 'width=600,height=450,noopener');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  }
}

export async function triggerNativeShare(certificate: Certificate): Promise<boolean> {
  if (!navigator.share) return false;
  const shareData = generateShareData(certificate);
  try {
    await navigator.share({
      title: `${certificate.learnerName} - ${certificate.courseTitle} Certificate`,
      text: shareData.copyText,
      url: shareData.shareUrl,
    });
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// COMPLETION DETECTION
// ============================================================================

export interface CompletionCheckResult {
  isComplete: boolean;
  modulesCompleted: number;
  modulesRequired: number;
  allQuizzesPassed: boolean;
  averageScore: number;
  missingModules: string[];
}

export function checkCourseCompletion(
  completedModules: string[],
  moduleProgress: Record<string, { quizScore: number | null; completed: boolean }>
): CompletionCheckResult {
  const requiredModules = Array.from(
    { length: ACADEMY_CONSTANTS.TOTAL_MODULES },
    (_, i) => `module-${i + 1}`
  );

  const missingModules = requiredModules.filter((m) => !completedModules.includes(m));

  const scores = requiredModules
    .map((m) => moduleProgress[m]?.quizScore)
    .filter((s): s is number => s !== null && s !== undefined);

  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  const allQuizzesPassed = requiredModules.every((m) => {
    const progress = moduleProgress[m];
    return progress?.quizScore !== null && progress?.quizScore !== undefined
      && progress.quizScore >= ACADEMY_CONSTANTS.PASSING_SCORE;
  });

  return {
    isComplete: missingModules.length === 0 && allQuizzesPassed,
    modulesCompleted: completedModules.length,
    modulesRequired: ACADEMY_CONSTANTS.TOTAL_MODULES,
    allQuizzesPassed,
    averageScore,
    missingModules,
  };
}

// ============================================================================
// TIME FORMATTING
// ============================================================================

export function formatTimeSpent(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
