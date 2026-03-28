"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CHROME_STORE_URL, detectExtension } from "@/lib/extension";
import { CheckCircle, Chrome, Zap, Globe, Send, Layers, ArrowRight } from "lucide-react";

const aiModels = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Perplexity",
  "Copilot",
  "Mistral",
  "Llama",
  "DeepSeek",
  "Grok",
  "Cohere",
  "Pi",
  "Jasper",
];

export default function DownloadHero() {
  const [installed, setInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    detectExtension().then(setInstalled);
  }, []);

  return (
    <section className="relative overflow-hidden py-24 px-4">
      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0 dark:block hidden"
        style={{
          background:
            "linear-gradient(180deg, #0E0F12 0%, #1a1530 50%, #0E0F12 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 dark:hidden"
        style={{
          background:
            "linear-gradient(180deg, #fdf8f0 0%, #f0e6d3 50%, #fdf8f0 100%)",
        }}
      />

      {/* Gold dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #d4af37 1px, transparent 0)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 px-4 py-2 dark:border-amber-400/15"
            style={{
              background:
                "linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(203,161,53,0.02) 100%)",
            }}
          >
            <Chrome className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-semibold tracking-wide text-stone-600 dark:text-amber-200/80">
              The Sacred Extension
            </span>
          </div>

          <h2
            className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-4xl md:text-5xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            One Prompt.{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, #ffe066 0%, #d4af37 40%, #CBA135 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Twelve Models.
            </span>
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-base text-stone-600 dark:text-stone-300 md:text-lg leading-relaxed">
            Install the Prompt Temple extension and unleash your prompts across every major AI platform — simultaneously.
            No tab switching. No copy-pasting. One click, twelve destinations.
          </p>
        </motion.div>

        {/* ── Main Content Grid ── */}
        <div className="grid gap-12 md:grid-cols-2 items-center">
          {/* Left: Visual — 1→12 Flow Diagram */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="relative rounded-2xl border border-amber-500/15 p-8 dark:border-amber-400/10"
              style={{
                background:
                  "linear-gradient(135deg, rgba(14,15,18,0.03) 0%, rgba(212,175,55,0.03) 100%)",
              }}
            >
              {/* Golden top gleam */}
              <div
                className="absolute left-4 right-4 top-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)",
                }}
              />

              {/* Source: Your Prompt */}
              <div className="mb-6 flex items-center gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, #d4af37 0%, #8B6914 100%)",
                    boxShadow: "0 0 20px rgba(212,175,55,0.3)",
                  }}
                >
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p
                    className="text-sm font-bold text-stone-800 dark:text-amber-100"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Your Prompt
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Crafted & optimized in the Temple
                  </p>
                </div>
              </div>

              {/* Arrow flow */}
              <div className="mb-6 flex items-center gap-2 pl-5">
                <div className="h-8 w-px bg-gradient-to-b from-amber-500/40 to-amber-500/10" />
                <Send className="h-4 w-4 text-amber-500 dark:text-amber-400 animate-pulse" />
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-300 tracking-wide">
                  SENT TO ALL AT ONCE
                </span>
              </div>

              {/* Destination: 12 Model Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {aiModels.map((model, i) => (
                  <motion.div
                    key={model}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                    className="group flex items-center justify-center rounded-lg border border-amber-500/10 px-2 py-2.5 text-center transition-all duration-200 hover:border-amber-400/30 hover:shadow-[0_0_12px_rgba(212,175,55,0.1)] dark:border-amber-400/8"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(212,175,55,0.04) 0%, transparent 100%)",
                    }}
                  >
                    <span className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                      {model}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Explanation + CTA */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {/* Feature cards */}
            <div className="space-y-4 mb-8">
              {[
                {
                  icon: <Layers className="h-5 w-5" />,
                  title: "One Prompt, Every Platform",
                  desc: "Write your prompt once in the Temple. Our extension injects it directly into ChatGPT, Claude, Gemini, and 9 more AI tools — all at the same time.",
                },
                {
                  icon: <Zap className="h-5 w-5" />,
                  title: "Instant Access Anywhere",
                  desc: "Open any AI website and your full prompt library appears. Search, select, and send — without ever leaving the page.",
                },
                {
                  icon: <Globe className="h-5 w-5" />,
                  title: "Compare Results Across Models",
                  desc: "See how different AI models respond to the same prompt. Find the best answer faster by comparing outputs side by side.",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="flex gap-4 rounded-xl border border-amber-500/10 p-4 transition-all duration-200 hover:border-amber-400/25 dark:border-amber-400/8"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(212,175,55,0.03) 0%, transparent 100%)",
                  }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-500/20 text-amber-600 dark:text-amber-400"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.02) 100%)",
                    }}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <h3
                      className="text-sm font-bold text-stone-800 dark:text-amber-100 mb-1"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {card.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                      {card.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Extension status */}
            {installed === true && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                <CheckCircle className="h-4 w-4" />
                Extension installed and active
              </div>
            )}

            {/* CTA */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {installed ? (
                <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg">
                  <CheckCircle className="h-4 w-4" />
                  Already Installed
                </span>
              ) : (
                <a
                  href={CHROME_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-[#0E0F12] shadow-lg transition-all duration-200 hover:shadow-[0_0_24px_rgba(212,175,55,0.4)] hover:scale-[1.02]"
                  style={{
                    background:
                      "linear-gradient(135deg, #ffe066 0%, #d4af37 50%, #CBA135 100%)",
                  }}
                >
                  <Chrome className="h-4 w-4" />
                  {installed === null
                    ? "Download for Chrome — Free"
                    : "Install from Chrome Web Store"}
                  <ArrowRight className="h-4 w-4" />
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
