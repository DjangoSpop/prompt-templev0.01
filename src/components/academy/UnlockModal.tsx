/**
 * UnlockModal Component
 *
 * Modal for unlocking modules via Chrome extension or email
 */

'use client';

import { useState } from 'react';
import { Module } from '@/lib/academy/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Chrome, Mail, CheckCircle, Sparkles } from 'lucide-react';
import { useAcademyStore } from '@/lib/stores/academyStore';
import { motion, AnimatePresence } from 'framer-motion';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: Module;
}

export function UnlockModal({ isOpen, onClose, module }: UnlockModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unlockMethod, setUnlockMethod] = useState<'extension' | 'email' | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const { unlockModules } = useAcademyStore();

  const handleExtensionUnlock = () => {
    // Check if extension is installed
    const extensionInstalled = typeof window !== 'undefined' && (window as any).__PROMPTTEMPLE_EXTENSION__;

    if (extensionInstalled) {
      unlockModules('extension');
      setIsUnlocked(true);
      setTimeout(() => {
        onClose();
        window.location.reload(); // Refresh to show unlocked modules
      }, 2000);
    } else {
      // Redirect to Chrome Web Store
      window.open('https://chrome.google.com/webstore', '_blank');
    }
  };

  const handleEmailUnlock = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Call API to save email and send welcome email
      // const response = await fetch('/api/academy/unlock', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, moduleId: module.id }),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      unlockModules('email', email);
      setIsUnlocked(true);

      setTimeout(() => {
        onClose();
        window.location.reload(); // Refresh to show unlocked modules
      }, 2000);
    } catch (error) {
      console.error('Error unlocking modules:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-obsidian-900 border-royal-gold-500/30">
        <AnimatePresence mode="wait">
          {!isUnlocked ? (
            <motion.div
              key="unlock-options"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-royal-gold-900/30 rounded-lg">
                    <Lock className="w-6 h-6 text-royal-gold-400" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl text-royal-gold-400">
                      Unlock All Modules
                    </DialogTitle>
                    <DialogDescription className="text-desert-sand-300">
                      Access all 6 modules and advanced features
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-6 space-y-6">
                {/* Module Preview */}
                <div className="p-4 bg-obsidian-800/50 border border-royal-gold-500/20 rounded-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{module.badge}</span>
                    <div>
                      <h4 className="font-semibold text-royal-gold-400">{module.title}</h4>
                      <p className="text-sm text-desert-sand-300 mt-1">{module.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2 text-desert-sand-400">
                      <CheckCircle className="w-4 h-4 text-nile-teal-400" />
                      <span>{module.lessons.length} interactive lessons</span>
                    </div>
                    <div className="flex items-center gap-2 text-desert-sand-400">
                      <CheckCircle className="w-4 h-4 text-nile-teal-400" />
                      <span>Hands-on exercises</span>
                    </div>
                    <div className="flex items-center gap-2 text-desert-sand-400">
                      <CheckCircle className="w-4 h-4 text-nile-teal-400" />
                      <span>Quiz with instant feedback</span>
                    </div>
                    <div className="flex items-center gap-2 text-desert-sand-400">
                      <CheckCircle className="w-4 h-4 text-nile-teal-400" />
                      <span>+{module.xpReward} XP reward</span>
                    </div>
                  </div>
                </div>

                {/* Unlock Options */}
                <div className="space-y-4">
                  <p className="text-sm text-desert-sand-300 font-medium">
                    Choose your unlock method:
                  </p>

                  {/* Option 1: Chrome Extension (Primary) */}
                  <button
                    onClick={() => setUnlockMethod('extension')}
                    className="w-full p-6 bg-gradient-to-br from-royal-gold-900/30 to-royal-gold-900/10 border-2 border-royal-gold-500/50 hover:border-royal-gold-500 rounded-lg transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-royal-gold-500/20 rounded-lg group-hover:bg-royal-gold-500/30 transition-colors">
                        <Chrome className="w-6 h-6 text-royal-gold-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-royal-gold-300">
                            Install PromptCraft Extension
                          </h4>
                          <span className="px-2 py-0.5 bg-nile-teal-500 text-white text-xs rounded-full">
                            Recommended
                          </span>
                        </div>
                        <p className="text-sm text-desert-sand-300 mb-2">
                          Get instant access + use prompting features in every AI chat
                        </p>
                        <div className="flex items-center gap-4 text-xs text-desert-sand-400">
                          <span>✓ All modules unlocked</span>
                          <span>✓ 200+ templates</span>
                          <span>✓ Real-time quality scoring</span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {unlockMethod === 'extension' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pl-4"
                    >
                      <Button
                        onClick={handleExtensionUnlock}
                        className="w-full bg-gradient-to-r from-royal-gold-500 to-royal-gold-600 hover:from-royal-gold-600 hover:to-royal-gold-700 text-obsidian-950 font-semibold"
                      >
                        <Chrome className="w-4 h-4 mr-2" />
                        Install Free Extension
                      </Button>
                      <p className="text-xs text-center text-desert-sand-400 mt-2">
                        Free • 30 seconds • Works with Chrome, Edge, Brave
                      </p>
                    </motion.div>
                  )}

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-desert-sand-700" />
                    <span className="text-xs text-desert-sand-400">OR</span>
                    <div className="flex-1 h-px bg-desert-sand-700" />
                  </div>

                  {/* Option 2: Email (Secondary) */}
                  <button
                    onClick={() => setUnlockMethod('email')}
                    className="w-full p-6 bg-obsidian-800/50 border-2 border-desert-sand-700/30 hover:border-desert-sand-700/50 rounded-lg transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-lapis-blue-900/30 rounded-lg group-hover:bg-lapis-blue-900/40 transition-colors">
                        <Mail className="w-6 h-6 text-lapis-blue-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold text-lapis-blue-300 mb-1">
                          Unlock with Email
                        </h4>
                        <p className="text-sm text-desert-sand-300">
                          Get instant access without installing anything
                        </p>
                      </div>
                    </div>
                  </button>

                  {unlockMethod === 'email' && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      onSubmit={handleEmailUnlock}
                      className="pl-4 space-y-3"
                    >
                      <div>
                        <Label htmlFor="email" className="text-sm text-desert-sand-300">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                        variant="outline"
                      >
                        {isSubmitting ? 'Unlocking...' : 'Unlock All Modules'}
                      </Button>
                      <p className="text-xs text-center text-desert-sand-400">
                        We'll email you updates and learning tips. Unsubscribe anytime.
                      </p>
                    </motion.form>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="unlocked"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-nile-teal-500 to-nile-teal-600 mb-6"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>

              <h3 className="text-2xl font-bold text-nile-teal-400 mb-2">
                All Modules Unlocked!
              </h3>
              <p className="text-desert-sand-300 mb-4">
                Redirecting you to continue learning...
              </p>

              <div className="flex items-center justify-center gap-2 text-sm text-desert-sand-400">
                <Sparkles className="w-4 h-4 text-royal-gold-400 animate-pulse" />
                <span>Happy learning!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
