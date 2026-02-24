'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  avatar: string; // initials fallback
  avatarColor: string;
  quote: string;
  beforeScore: number;
  afterScore: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Sarah L.',
    role: 'Head of Marketing',
    company: 'TechFlow',
    avatar: 'SL',
    avatarColor: '#A78BFA',
    quote: '"My campaign brief prompts went from getting mediocre responses to generating full-blown strategy documents. The difference is night and day. PromptTemple is now mandatory in our team workflow."',
    beforeScore: 2.3,
    afterScore: 9.1,
  },
  {
    name: 'Marcus O.',
    role: 'Senior Engineer',
    company: 'Stripe',
    avatar: 'MO',
    avatarColor: '#60A5FA',
    quote: '"I was skeptical — how much could prompt quality matter? Turns out, A LOT. My debugging prompts now get pinpoint solutions instead of vague hints. Cut my resolution time by 40%."',
    beforeScore: 3.1,
    afterScore: 9.4,
  },
  {
    name: 'Priya N.',
    role: 'Data Scientist',
    company: 'Airbnb',
    avatar: 'PN',
    avatarColor: '#F5C518',
    quote: '"The analysis prompts this generates are structured better than what most senior analysts write manually. It adds confidence intervals, edge case considerations — things I\'d forget under deadline pressure."',
    beforeScore: 4.0,
    afterScore: 9.6,
  },
  {
    name: 'James K.',
    role: 'Founder & CEO',
    company: 'LaunchOS',
    avatar: 'JK',
    avatarColor: '#10B981',
    quote: '"Built our entire AI workflow around PromptTemple. Our customer research prompts are so much sharper now. It\'s like having a prompt engineer on staff without the salary."',
    beforeScore: 2.8,
    afterScore: 9.2,
  },
  {
    name: 'Lisa M.',
    role: 'Content Director',
    company: 'Notion',
    avatar: 'LM',
    avatarColor: '#FB923C',
    quote: '"We optimized 50 content creation prompts in one afternoon. The improvement tags alone taught me more about prompt engineering than months of reading blog posts."',
    beforeScore: 3.5,
    afterScore: 8.9,
  },
];

export function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDir(1);
      setIndex(i => (i + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  function go(next: number) {
    setDir(next > index ? 1 : -1);
    setIndex(((next % TESTIMONIALS.length) + TESTIMONIALS.length) % TESTIMONIALS.length);
  }

  const t = TESTIMONIALS[index];

  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2
            className="text-3xl md:text-4xl font-bold text-[#F0E6D3] mb-2"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            From the Temple Archive
          </h2>
          <p className="text-[#9CA3AF] text-sm">What our scholars say</p>
        </motion.div>

        <div className="relative">
          {/* Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              custom={dir}
              initial={{ opacity: 0, x: dir * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -60 }}
              transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
              className="rounded-2xl p-8"
              style={{
                background: 'rgba(13,13,13,0.7)',
                border: '1px solid rgba(245,197,24,0.12)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#F5C518] text-[#F5C518]" />
                ))}
              </div>

              <blockquote className="text-[#E5E7EB] text-lg leading-relaxed mb-6 italic">
                {t.quote}
              </blockquote>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: `${t.avatarColor}30`, border: `2px solid ${t.avatarColor}50` }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#F0E6D3]">{t.name}</p>
                    <p className="text-xs text-[#6B7280]">{t.role} · {t.company}</p>
                  </div>
                </div>

                {/* Score change */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#EF4444] font-bold">{t.beforeScore}/10</span>
                  <span className="text-[#6B7280]">→</span>
                  <span style={{ color: t.avatarColor }} className="font-bold">{t.afterScore}/10</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => go(index - 1)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B7280] hover:text-[#F5C518] transition-colors border border-[rgba(255,255,255,0.08)] hover:border-[rgba(245,197,24,0.3)]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    background: i === index ? '#F5C518' : 'rgba(245,197,24,0.25)',
                    transform: i === index ? 'scale(1.25)' : 'scale(1)',
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => go(index + 1)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B7280] hover:text-[#F5C518] transition-colors border border-[rgba(255,255,255,0.08)] hover:border-[rgba(245,197,24,0.3)]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
