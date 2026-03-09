/**
 * Public Certificate Page
 *
 * Viewable by anyone with the slug URL.
 * Shows certificate visual, verification info, and CTAs to drive signups.
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Award,
  ArrowRight,
  GraduationCap,
  CheckCircle,
  Share2,
  BookOpen,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CertificateVisual } from '@/components/certificates/CertificateVisual';
import { CertificateShareModal } from '@/components/certificates/CertificateShareModal';
import {
  getCertificateBySlug,
  formatDate,
  getDistinctionLabel,
  formatTimeSpent,
} from '@/lib/certificates/certificateService';
import { Certificate } from '@/lib/certificates/types';

export default function CertificatePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (slug) {
      const cert = getCertificateBySlug(slug);
      setCertificate(cert);
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-obsidian-950 via-obsidian-900 to-obsidian-950">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="w-10 h-10 rounded-full border-2 border-royal-gold-500/40 border-t-royal-gold-500"
          />
          <p className="text-desert-sand-400">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-obsidian-950 via-obsidian-900 to-obsidian-950 px-4">
        <div className="text-center max-w-md">
          <Shield className="w-16 h-16 text-desert-sand-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-desert-sand-200 mb-2">
            Certificate Not Found
          </h1>
          <p className="text-desert-sand-400 mb-8">
            This certificate link may be invalid or has been removed.
          </p>
          <Link href="/academy">
            <Button className="bg-gradient-to-r from-royal-gold-500 to-royal-gold-600 hover:from-royal-gold-600 hover:to-royal-gold-700 text-obsidian-950">
              <BookOpen className="w-4 h-4 mr-2" />
              Explore Academy
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const distinction = getDistinctionLabel(certificate.distinction);

  return (
    <div className="min-h-screen bg-gradient-to-b from-obsidian-950 via-obsidian-900 to-obsidian-950">
      {/* Hero Header */}
      <div className="border-b border-royal-gold-500/20">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link
            href="/academy"
            className="flex items-center gap-2 text-royal-gold-400 hover:text-royal-gold-300 transition-colors"
          >
            <GraduationCap className="w-5 h-5" />
            <span className="font-semibold text-sm">Prompt Temple Academy</span>
          </Link>
          <Button
            onClick={() => setShowShareModal(true)}
            variant="outline"
            className="border-royal-gold-500/30 text-royal-gold-400 hover:bg-royal-gold-500/10"
            size="sm"
          >
            <Share2 className="w-4 h-4 mr-1.5" />
            Share
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Certificate Visual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <CertificateVisual certificate={certificate} />
        </motion.div>

        {/* Certificate Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          {/* Verification Badge */}
          <div className="flex items-center justify-center gap-2 mb-8 px-4 py-2 bg-nile-teal-500/10 border border-nile-teal-500/30 rounded-full mx-auto w-fit">
            <CheckCircle className="w-4 h-4 text-nile-teal-400" />
            <span className="text-sm text-nile-teal-400 font-medium">Verified Certificate</span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <DetailCard label="Learner" value={certificate.learnerName} />
            <DetailCard label="Course" value={certificate.courseTitle} />
            <DetailCard label="Issued" value={formatDate(certificate.issueDate)} />
            <DetailCard
              label="Verification"
              value={certificate.verificationCode}
              mono
            />
            {distinction && <DetailCard label="Distinction" value={distinction} />}
            {certificate.score !== null && (
              <DetailCard label="Average Score" value={`${certificate.score}%`} />
            )}
            <DetailCard label="XP Earned" value={`${certificate.totalXP.toLocaleString()} XP`} />
            <DetailCard label="Time Invested" value={formatTimeSpent(certificate.totalTimeSpent)} />
          </div>

          {/* CTA Section - Growth Loop */}
          <div className="bg-obsidian-800/60 border border-royal-gold-500/20 rounded-2xl p-6 sm:p-8 text-center">
            <Award className="w-10 h-10 text-royal-gold-400 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-royal-gold-400 mb-2">
              Earn Your Own Certificate
            </h2>
            <p className="text-desert-sand-300 mb-6 max-w-md mx-auto">
              Master prompt engineering with our free, interactive 6-module course.
              Join thousands of learners building AI skills.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/academy">
                <Button className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-royal-gold-500 to-royal-gold-600 hover:from-royal-gold-600 hover:to-royal-gold-700 text-obsidian-950 font-semibold rounded-xl">
                  Start Learning Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/academy">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto px-8 py-3 border-royal-gold-500/30 text-royal-gold-400 hover:bg-royal-gold-500/10 rounded-xl"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Explore Courses
                </Button>
              </Link>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="text-center mt-10 mb-6">
            <p className="text-xs text-desert-sand-500">
              Issued by <span className="text-royal-gold-400">Prompt Temple Academy</span> &mdash;
              The Premier Platform for Prompt Engineering Education
            </p>
          </div>
        </motion.div>
      </div>

      {/* Share Modal */}
      <CertificateShareModal
        certificate={certificate}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
}

// ============================================================================
// HELPER COMPONENT
// ============================================================================

function DetailCard({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="p-4 bg-obsidian-800/40 border border-royal-gold-500/10 rounded-xl">
      <p className="text-xs text-desert-sand-500 mb-1">{label}</p>
      <p className={`text-desert-sand-200 font-medium ${mono ? 'font-mono tracking-wider text-royal-gold-400' : ''}`}>
        {value}
      </p>
    </div>
  );
}
