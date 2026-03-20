'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { Menu, X, Download, ArrowRight, Compass, BookOpen, GraduationCap, CreditCard, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Eyehorus from '@/components/pharaonic/Eyehorus';
import { ThemeToggle } from '@/components/ThemeToggle';

// ── Nav links ──

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How It Works', icon: Compass },
  { href: '/templates', label: 'Discover', icon: BookOpen },
  { href: '/pricing', label: 'Pricing', icon: CreditCard },
  { href: '/academy', label: 'Academy', icon: GraduationCap },
];

// ── Mobile Menu ──

function MobileMenu({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            className="fixed right-0 top-0 z-[90] flex h-full w-full max-w-sm flex-col bg-white dark:bg-stone-950 shadow-2xl md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 px-6 py-4">
              <div className="flex items-center gap-3">
                <Eyehorus
                  size={32}
                  variant="hero"
                  glow
                  glowIntensity="medium"
                  animated
                  speedMultiplier={2}
                  showLabel={false}
                />
                <span
                  className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 bg-clip-text text-lg font-bold tracking-tight text-transparent"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Prompt Temple
                </span>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-stone-500 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <nav className="space-y-1">
                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-stone-700 dark:text-stone-300 transition-colors hover:bg-stone-50 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-white"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-800">
                        <Icon className="h-4 w-4 text-stone-500 dark:text-stone-400" />
                      </div>
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Extension link */}
              <div className="mt-6 border-t border-stone-100 dark:border-stone-800 pt-6">
                <Link
                  href="/download"
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl border border-stone-200 dark:border-stone-700 px-4 py-3 text-sm font-medium text-stone-600 dark:text-stone-400 transition-colors hover:border-amber-300 hover:bg-amber-50 dark:hover:border-amber-700 dark:hover:bg-amber-900/20"
                >
                  <Download className="h-4 w-4" />
                  Get Chrome Extension
                </Link>
              </div>

              {/* Theme toggle */}
              <div className="mt-4 flex items-center justify-between rounded-xl bg-stone-50 dark:bg-stone-900 px-4 py-3">
                <span className="text-sm text-stone-600 dark:text-stone-400">Theme</span>
                <ThemeToggle />
              </div>
            </div>

            {/* Footer CTAs */}
            <div className="border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 px-6 py-5">
              <Link
                href="/auth/register"
                onClick={onClose}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-500 hover:to-yellow-400 hover:shadow-amber-500/40"
              >
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/login"
                onClick={onClose}
                className="flex w-full items-center justify-center rounded-xl border border-stone-300 dark:border-stone-700 px-6 py-3 text-sm font-medium text-stone-700 dark:text-stone-300 transition-colors hover:bg-white dark:hover:bg-stone-800"
              >
                Log In
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Main Navbar ──

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { scrollY } = useScroll();
  const navScale = useSpring(
    useTransform(scrollY, [0, 120], [1, 0.98]),
    { stiffness: 300, damping: 30 }
  );
  const navOpacity = useTransform(scrollY, [0, 60], [1, 0.98]);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <>
      <motion.header
        className="pointer-events-none fixed inset-x-0 top-0 z-[70] px-3 pt-3 sm:px-5"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
      >
        <div className="pointer-events-auto mx-auto max-w-6xl">
          <motion.nav
            style={{ scale: navScale, opacity: navOpacity }}
            className={cn(
              'relative flex items-center justify-between rounded-2xl border px-3 py-2 transition-all duration-300 md:px-5 md:py-2.5',
              scrolled
                ? 'border-stone-200/70 bg-white/92 shadow-[0_8px_32px_rgb(0,0,0,0.06)] backdrop-blur-2xl dark:border-stone-700/50 dark:bg-stone-950/92 dark:shadow-[0_8px_32px_rgb(0,0,0,0.3)]'
                : 'border-stone-200/40 bg-white/75 shadow-lg shadow-stone-900/5 backdrop-blur-xl dark:border-stone-700/30 dark:bg-stone-950/75 dark:shadow-lg dark:shadow-black/20'
            )}
          >
            {/* ── Logo: Eye of Horus + Brand ── */}
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="relative flex items-center justify-center" style={{ filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.4))' }}>
                <Eyehorus
                  size={38}
                  variant="hero"
                  glow
                  glowIntensity="medium"
                  animated
                  speedMultiplier={2}
                  showLabel={false}
                />
              </div>
              <div className="hidden sm:block">
                <h1
                  className="bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-700 bg-clip-text text-lg font-bold tracking-tight text-transparent dark:from-amber-400 dark:via-yellow-400 dark:to-amber-400"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Prompt Temple
                </h1>
                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-stone-400 dark:text-stone-500">
                  AI Prompt Platform
                </p>
              </div>
            </Link>

            {/* ── Desktop Nav Links ── */}
            <div className="hidden items-center gap-0.5 md:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-3.5 py-2 text-[13px] font-medium text-stone-600 transition-all duration-200 hover:bg-stone-100/80 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/60 dark:hover:text-stone-100"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-1.5 md:gap-2.5">
              {/* Theme toggle — desktop */}
              <div className="hidden md:block">
                <ThemeToggle />
              </div>

              {/* Divider — desktop */}
              <div className="hidden h-5 w-px bg-stone-200 dark:bg-stone-700 md:block" />

              {/* Log In */}
              <Link
                href="/auth/login"
                className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:text-amber-700 dark:text-stone-400 dark:hover:text-amber-400 sm:block"
              >
                Log In
              </Link>

              {/* Primary CTA */}
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-600 to-yellow-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all duration-300 hover:scale-[1.03] hover:from-amber-500 hover:to-yellow-400 hover:shadow-[0_0_28px_rgba(245,158,11,0.4)] dark:from-amber-500 dark:to-yellow-500 dark:shadow-[0_0_20px_rgba(245,158,11,0.15)] md:px-5"
              >
                <span className="hidden sm:inline">Start Free</span>
                <span className="sm:hidden">Start</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-full p-2 text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </motion.nav>
        </div>
      </motion.header>

      {/* Mobile menu drawer */}
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

export default LandingNavbar;
