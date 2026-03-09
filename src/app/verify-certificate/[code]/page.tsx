/**
 * Certificate Verification Page
 *
 * Public route for verifying certificate authenticity.
 * Also works as an acquisition funnel with CTAs.
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  GraduationCap,
  ArrowRight,
  BookOpen,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CertificateVisual } from '@/components/certificates/CertificateVisual';
import {
  verifyCertificate,
  formatDate,
  getDistinctionLabel,
} from '@/lib/certificates/certificateService';
import type { VerificationResult, VerificationStatus } from '@/lib/certificates/types';

export default function VerifyCertificatePage() {
  const params = useParams();
  const code = params.code as string;
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (code) {
      // Simulated network delay for realism
      const timer = setTimeout(() => {
        const verification = verifyCertificate(code);
        setResult(verification);
        setLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-obsidian-950 via-obsidian-900 to-obsidian-950">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="w-12 h-12 rounded-full border-2 border-royal-gold-500/40 border-t-royal-gold-500 mx-auto mb-4"
          />
          <p className="text-royal-gold-400 font-semibold">Verifying certificate...</p>
          <p className="text-desert-sand-500 text-sm mt-1 font-mono">{code}</p>
        </motion.div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-obsidian-950 via-obsidian-900 to-obsidian-950">
      {/* Header */}
      <div className="border-b border-royal-gold-500/20">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link
            href="/academy"
            className="flex items-center gap-2 text-royal-gold-400 hover:text-royal-gold-300 transition-colors"
          >
            <GraduationCap className="w-5 h-5" />
            <span className="font-semibold text-sm">Prompt Temple Academy</span>
          </Link>
          <span className="text-sm text-desert-sand-500">Certificate Verification</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 sm:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' }}
            className="text-center mb-8"
          >
            <StatusBadge status={result.status} />
          </motion.div>

          {/* Verification Code Display */}
          <div className="text-center mb-8">
            <p className="text-sm text-desert-sand-500 mb-1">Verification Code</p>
            <p className="font-mono text-lg text-royal-gold-400 tracking-wider">{code}</p>
          </div>

          {/* Result Content */}
          {result.status === 'valid' && result.certificate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Certificate Preview */}
              <div className="mb-8">
                <CertificateVisual certificate={result.certificate} compact />
              </div>

              {/* Details */}
              <div className="bg-obsidian-800/40 border border-nile-teal-500/20 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-nile-teal-400 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Certificate Details
                </h3>
                <dl className="space-y-3 text-sm">
                  <DetailRow label="Recipient" value={result.certificate.learnerName} />
                  <DetailRow label="Course" value={result.certificate.courseTitle} />
                  <DetailRow label="Issued" value={formatDate(result.certificate.issueDate)} />
                  {result.certificate.distinction && result.certificate.distinction !== 'standard' && (
                    <DetailRow label="Distinction" value={getDistinctionLabel(result.certificate.distinction)} />
                  )}
                  <DetailRow label="Status" value="Active & Verified" highlight />
                </dl>
              </div>
            </motion.div>
          )}

          {/* Invalid / Revoked States */}
          {result.status !== 'valid' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-obsidian-800/40 border border-red-500/20 rounded-xl p-6 mb-8 text-center"
            >
              <p className="text-desert-sand-300">{result.message}</p>
              <p className="text-sm text-desert-sand-500 mt-2">
                If you believe this is an error, please contact support.
              </p>
            </motion.div>
          )}

          {/* CTA Section */}
          <div className="bg-obsidian-800/60 border border-royal-gold-500/20 rounded-2xl p-6 sm:p-8 text-center">
            <Award className="w-10 h-10 text-royal-gold-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-royal-gold-400 mb-2">
              Get Certified in Prompt Engineering
            </h2>
            <p className="text-desert-sand-300 mb-6 max-w-md mx-auto text-sm">
              Complete our 6-module interactive course and earn your own
              professionally verified certificate.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/academy">
                <Button className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-royal-gold-500 to-royal-gold-600 hover:from-royal-gold-600 hover:to-royal-gold-700 text-obsidian-950 font-semibold rounded-xl">
                  Start Your Course
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/academy">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto px-8 py-3 border-royal-gold-500/30 text-royal-gold-400 hover:bg-royal-gold-500/10 rounded-xl"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Courses
                </Button>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-xs text-desert-sand-500">
              Verified by <span className="text-royal-gold-400">Prompt Temple Academy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STATUS BADGE
// ============================================================================

function StatusBadge({ status }: { status: VerificationStatus }) {
  const configs: Record<VerificationStatus, { icon: typeof CheckCircle; label: string; color: string; bgColor: string; borderColor: string }> = {
    valid: {
      icon: CheckCircle,
      label: 'Certificate Verified',
      color: 'text-nile-teal-400',
      bgColor: 'bg-nile-teal-500/10',
      borderColor: 'border-nile-teal-500/30',
    },
    invalid: {
      icon: XCircle,
      label: 'Certificate Not Found',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
    revoked: {
      icon: AlertTriangle,
      label: 'Certificate Revoked',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
    },
    expired: {
      icon: Shield,
      label: 'Certificate Expired',
      color: 'text-desert-sand-400',
      bgColor: 'bg-desert-sand-500/10',
      borderColor: 'border-desert-sand-500/30',
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-3 px-6 py-3 ${config.bgColor} border ${config.borderColor} rounded-full`}>
      <Icon className={`w-6 h-6 ${config.color}`} />
      <span className={`font-semibold ${config.color}`}>{config.label}</span>
    </div>
  );
}

// ============================================================================
// DETAIL ROW
// ============================================================================

function DetailRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-desert-sand-500">{label}</dt>
      <dd className={highlight ? 'text-nile-teal-400 font-medium' : 'text-desert-sand-200 font-medium'}>
        {value}
      </dd>
    </div>
  );
}
