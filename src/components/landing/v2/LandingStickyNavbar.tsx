'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function LandingStickyNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-[70] border-b transition-all duration-300',
        scrolled
          ? 'border-stone-200/90 bg-sand-50/95 backdrop-blur-md shadow-sm'
          : 'border-transparent bg-sand-50/80 backdrop-blur-sm'
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:h-20 md:px-6">
        <Link href="/" className="relative flex items-center gap-2 text-stone-900">
          <span className="text-xl">🏛️</span>
          <span className="font-display text-lg font-bold md:text-xl">Prompt Temple</span>

          <div className="pointer-events-none absolute -right-4 -top-2 hidden md:block">
            {['*', '~', '+'].map((glyph, index) => (
              <motion.span
                key={glyph + index}
                className="absolute text-[10px] text-[#CBA135]/70"
                style={{ left: index * 12 }}
                animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.35 }}
              >
                {glyph}
              </motion.span>
            ))}
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-stone-700 md:flex">
          <Link href="#discover-section" className="hover:text-stone-900 transition-colors">Discover</Link>
          <Link href="#templates-section" className="hover:text-stone-900 transition-colors">Templates</Link>
          <Link href="/pricing" className="hover:text-stone-900 transition-colors">Pricing</Link>
          <Link href="/academy" className="hover:text-stone-900 transition-colors">Academy</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="hidden rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 md:inline-flex"
          >
            Log In
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex rounded-lg bg-[#CBA135] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b8922f] md:px-4"
          >
            Start Free →
          </Link>
        </div>
      </div>
    </header>
  );
}

export default LandingStickyNavbar;
