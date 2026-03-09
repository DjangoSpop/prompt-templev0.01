/**
 * CourseCompletionScreen
 *
 * Shown when learner completes all 6 modules. Prompts name entry,
 * generates certificate, and shows celebration + share options.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Award,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CertificateVisual } from './CertificateVisual';
import { CertificateShareModal } from './CertificateShareModal';
import { useAcademyStore, selectAverageQuizScore } from '@/lib/stores/academyStore';
import {
  generateCertificate,
  getDistinctionLabel,
  formatTimeSpent,
} from '@/lib/certificates/certificateService';
import { Certificate, ACADEMY_CONSTANTS } from '@/lib/certificates/types';

interface CourseCompletionScreenProps {
  onContinue?: () => void;
}

export function CourseCompletionScreen({ onContinue }: CourseCompletionScreenProps) {
  const router = useRouter();
  const [step, setStep] = useState<'name' | 'generating' | 'complete'>('name');
  const [learnerName, setLearnerName] = useState('');
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const {
    completedModules,
    totalXPEarned,
    totalTimeSpent,
    emailSubmitted,
    certificateGenerated,
    certificateId: existingCertId,
    generateCertificate: storeCertificate,
  } = useAcademyStore();
  const averageScore = useAcademyStore(selectAverageQuizScore);

  // Celebration confetti on mount
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ['#C5A55A', '#F5D77E', '#2DD4A8', '#E6C229', '#D4AF37'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  // If certificate already exists, load it
  useEffect(() => {
    if (certificateGenerated && existingCertId) {
      const { getCertificateById } = require('@/lib/certificates/certificateService');
      const existing = getCertificateById(existingCertId);
      if (existing) {
        setCertificate(existing);
        setStep('complete');
      }
    }
  }, [certificateGenerated, existingCertId]);

  const handleGenerateCertificate = () => {
    if (!learnerName.trim()) return;

    setStep('generating');

    // Small delay for dramatic effect
    setTimeout(() => {
      const result = generateCertificate({
        learnerName: learnerName.trim(),
        learnerEmail: emailSubmitted || undefined,
        courseId: ACADEMY_CONSTANTS.COURSE_ID,
        modulesCompleted: completedModules,
        averageScore,
        totalXP: totalXPEarned,
        totalTimeSpent,
        completionDate: new Date().toISOString(),
      });

      setCertificate(result.certificate);
      storeCertificate(result.certificate.id);
      setStep('complete');

      // Victory confetti
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.4 },
        colors: ['#C5A55A', '#F5D77E', '#2DD4A8'],
      });
    }, 1500);
  };

  // Step 1: Name Entry
  if (step === 'name') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-obsidian-950 via-obsidian-900 to-obsidian-950 px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full text-center"
        >
          {/* Celebration Header */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-royal-gold-500 to-royal-gold-600 mb-6"
          >
            <GraduationCap className="w-10 h-10 text-obsidian-950" />
          </motion.div>

          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-royal-gold-300 via-royal-gold-400 to-royal-gold-300 bg-clip-text text-transparent mb-3">
            Congratulations!
          </h1>
          <p className="text-desert-sand-200 text-lg mb-2">
            You have completed all 6 modules of
          </p>
          <p className="text-nile-teal-400 font-semibold text-xl mb-8">
            {ACADEMY_CONSTANTS.COURSE_TITLE}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-obsidian-800/60 rounded-xl border border-royal-gold-500/20">
              <p className="text-2xl font-bold text-royal-gold-400">{averageScore}%</p>
              <p className="text-xs text-desert-sand-400">Avg Score</p>
            </div>
            <div className="p-4 bg-obsidian-800/60 rounded-xl border border-nile-teal-500/20">
              <p className="text-2xl font-bold text-nile-teal-400">{totalXPEarned.toLocaleString()}</p>
              <p className="text-xs text-desert-sand-400">Total XP</p>
            </div>
            <div className="p-4 bg-obsidian-800/60 rounded-xl border border-lapis-blue-500/20">
              <p className="text-2xl font-bold text-lapis-blue-400">{formatTimeSpent(totalTimeSpent)}</p>
              <p className="text-xs text-desert-sand-400">Time Spent</p>
            </div>
          </div>

          {/* Name Input */}
          <div className="bg-obsidian-800/60 rounded-xl border border-royal-gold-500/20 p-6 mb-6">
            <label htmlFor="learnerName" className="block text-sm text-desert-sand-300 mb-2 text-left">
              Enter your full name for the certificate
            </label>
            <input
              id="learnerName"
              type="text"
              value={learnerName}
              onChange={(e) => setLearnerName(e.target.value)}
              placeholder="e.g. Ahmed El Bahi"
              className="w-full px-4 py-3 bg-obsidian-900 border border-royal-gold-500/30 focus:border-royal-gold-500 rounded-lg text-desert-sand-100 placeholder:text-desert-sand-500 outline-none transition-colors"
              maxLength={60}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerateCertificate();
              }}
            />
          </div>

          <Button
            onClick={handleGenerateCertificate}
            disabled={!learnerName.trim()}
            className="w-full py-4 bg-gradient-to-r from-royal-gold-500 to-royal-gold-600 hover:from-royal-gold-600 hover:to-royal-gold-700 text-obsidian-950 font-semibold text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Award className="w-5 h-5 mr-2" />
            Generate My Certificate
          </Button>
        </motion.div>
      </div>
    );
  }

  // Step 2: Generating Animation
  if (step === 'generating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-obsidian-950 via-obsidian-900 to-obsidian-950 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-royal-gold-500/40 border-t-royal-gold-500 mb-6"
          />
          <p className="text-royal-gold-400 font-semibold text-lg">
            Crafting your certificate...
          </p>
          <p className="text-desert-sand-400 text-sm mt-2">
            Applying the Pharaoh&apos;s seal
          </p>
        </motion.div>
      </div>
    );
  }

  // Step 3: Certificate Ready
  if (!certificate) return null;

  const distinction = getDistinctionLabel(certificate.distinction);

  return (
    <div className="min-h-screen bg-gradient-to-b from-obsidian-950 via-obsidian-900 to-obsidian-950 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-royal-gold-400" />
            <span className="text-sm font-semibold text-royal-gold-400 tracking-widest uppercase">
              Certificate Earned
            </span>
            <Sparkles className="w-5 h-5 text-royal-gold-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-desert-sand-100 mb-2">
            Your Certificate is Ready
          </h1>
          {distinction && (
            <p className="text-royal-gold-400 font-serif">
              Awarded {distinction}
            </p>
          )}
        </motion.div>

        {/* Certificate */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="mb-8"
        >
          <CertificateVisual certificate={certificate} />
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Button
            onClick={() => setShowShareModal(true)}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-royal-gold-500 to-royal-gold-600 hover:from-royal-gold-600 hover:to-royal-gold-700 text-obsidian-950 font-semibold rounded-xl"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Certificate
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push(`/academy/certificate/${certificate.slug}`)}
            className="w-full sm:w-auto px-8 py-3 border-royal-gold-500/30 text-royal-gold-400 hover:bg-royal-gold-500/10 rounded-xl"
          >
            View Full Certificate
          </Button>

          {onContinue && (
            <Button
              variant="outline"
              onClick={onContinue}
              className="w-full sm:w-auto px-8 py-3 border-nile-teal-500/30 text-nile-teal-400 hover:bg-nile-teal-500/10 rounded-xl"
            >
              Continue Learning
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </motion.div>

        {/* Verification Info */}
        <div className="text-center text-sm text-desert-sand-500">
          <p>
            Verification Code:{' '}
            <span className="font-mono text-royal-gold-400">{certificate.verificationCode}</span>
          </p>
        </div>
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
