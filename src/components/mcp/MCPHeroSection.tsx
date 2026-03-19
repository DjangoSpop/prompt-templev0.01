'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function MCPHeroSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E3A8A] via-[#1E3A8A]/90 to-[#0E1B2A] p-8 md:p-12 mb-8">
      {/* Subtle pyramid pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-8 w-0 h-0 border-l-[40px] border-r-[40px] border-b-[60px] border-l-transparent border-r-transparent border-b-[#C9A227]" />
        <div className="absolute bottom-4 left-12 w-0 h-0 border-l-[25px] border-r-[25px] border-b-[40px] border-l-transparent border-r-transparent border-b-[#C9A227]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-2xl"
      >
        <span className="inline-block rounded-full bg-[#C9A227]/20 px-3 py-1 text-xs font-medium text-[#C9A227] mb-4">
          The Agentic AI Era
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Master MCP & AI Agents
        </h1>
        <p className="text-base md:text-lg text-white/70 mb-6 max-w-xl">
          125+ professional prompt templates, 49 expert knowledge articles, and a
          free Academy course — everything you need to build with the Model Context Protocol.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/mcp/prompts"
            className="rounded-lg bg-[#C9A227] px-5 py-2.5 text-sm font-semibold text-[#0E1B2A] hover:bg-[#C9A227]/90 transition-colors"
          >
            Browse Prompts
          </Link>
          <Link
            href="/academy"
            className="rounded-lg border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Start Academy (Free)
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
