"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  BrainCircuit,
  Zap,
  Bot,
  Lock,
  ArrowRight,
  GitPullRequest,
  Cpu,
  Layers,
  Sparkles,
  KeyRound,
} from "lucide-react";

export function BentoFeatures() {
  return (
    <section id="features" className="py-16 sm:py-24 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">
            <Layers className="h-3.5 w-3.5" />
            <span>CORE ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            Built for Developers Who Value Speed &amp; Privacy
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Everything you need to test frontier reasoning models and deploy personalized assistants without cloud subscription lock-in.
          </p>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          {/* Bento Card 1: Zero-Trust Local BYOK Vault (Spans 2 columns on desktop) */}
          <div className="double-bezel md:col-span-2 group">
            <div className="double-bezel-inner p-6 sm:p-8 flex flex-col justify-between h-full bg-gradient-to-br from-emerald-500/[0.03] via-surface-1 to-surface-1 hover:border-emerald-500/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight">
                        Zero-Trust Hardware BYOK Vault
                      </h3>
                      <span className="text-xs text-muted-foreground font-mono">
                        Hardware AES-GCM-256 In-Memory Encryption
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 text-xs font-mono font-semibold text-emerald-500">
                    Zero Server Storage
                  </span>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mb-4">
                  Bring your own API credentials directly. All keys are encrypted in your local browser runtime and forwarded via ephemeral HTTPS headers with zero database persistence. Real-time broadcast sync across tabs and local devices.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono pt-2">
                  <div className="p-2 rounded-lg bg-surface-2 border border-border">
                    <span className="text-muted-foreground block text-[10px]">ENCRYPTION</span>
                    <strong className="text-foreground">AES-GCM-256</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-2 border border-border">
                    <span className="text-muted-foreground block text-[10px]">CROSS-TAB SYNC</span>
                    <strong className="text-emerald-500">Zero-Latency</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-2 border border-border col-span-2 sm:col-span-1">
                    <span className="text-muted-foreground block text-[10px]">MARKUP</span>
                    <strong className="text-blue-500">$0.00 / Free</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border/80 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-6">
                <span>Configure Keys in Playground</span>
                <Link
                  href="/playground"
                  className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Deliberation Trace Visualizer (Spans 1 column) */}
          <div className="double-bezel group">
            <div className="double-bezel-inner p-6 flex flex-col justify-between h-full bg-gradient-to-b from-purple-500/[0.04] to-surface-1 hover:border-purple-500/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-500 border border-purple-500/25">
                    <BrainCircuit className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-purple-500/10 border border-purple-500/25 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400">
                    REASONING
                  </span>
                </div>

                <h3 className="font-bold text-base text-foreground mb-1.5 tracking-tight">
                  Chain-of-Thought Visualizer
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Real-time inspectable thinking traces for DeepSeek R1 and OpenAI reasoning models. Observe model deliberations before the final answer is drafted.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/80 text-xs font-bold text-purple-600 dark:text-purple-400 mt-4">
                <span>Inspect Traces</span>
                <Link
                  href="/playground"
                  className="w-8 h-8 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Bento Card 3: Live Velocity & TTFT (Spans 1 column) */}
          <div className="double-bezel group">
            <div className="double-bezel-inner p-6 flex flex-col justify-between h-full bg-gradient-to-b from-amber-500/[0.04] to-surface-1 hover:border-amber-500/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/25">
                    <Zap className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                    TELEMETRY
                  </span>
                </div>

                <h3 className="font-bold text-base text-foreground mb-1.5 tracking-tight">
                  Live Token Velocity Metrics
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Benchmark Time-to-First-Token (TTFT) in milliseconds and generation velocity in tokens per second across LPUs and GPUs in real time.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/80 text-xs font-bold text-amber-600 dark:text-amber-400 mt-4">
                <span>Test Groq &amp; Gemini</span>
                <Link
                  href="/playground"
                  className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Bento Card 4: Assistant Studio (Spans 2 columns on desktop) */}
          <div className="double-bezel md:col-span-2 group">
            <div className="double-bezel-inner p-6 sm:p-8 flex flex-col justify-between h-full bg-gradient-to-br from-blue-500/[0.03] via-surface-1 to-surface-1 hover:border-blue-500/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-500 border border-blue-500/25">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight">
                        Assistant Studio &amp; 1-Click GitHub PR
                      </h3>
                      <span className="text-xs text-muted-foreground font-mono">
                        Instant Website AI Representative
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-blue-500/10 border border-blue-500/25 px-2.5 py-1 text-xs font-mono font-semibold text-blue-500">
                    60-Second Setup
                  </span>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mb-4">
                  Scrape your portfolio or project URL. The synthesizer auto-extracts your skills and projects, builds an interactive chat persona, and opens a GitHub PR with the embed code automatically.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-md bg-surface-2 border border-border text-foreground">
                    ⚡ Zero npm dependencies
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-surface-2 border border-border text-foreground">
                    🔒 Shadow DOM isolated
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-surface-2 border border-border text-foreground">
                    🚀 Next.js, HTML, React, Astro
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border/80 text-xs font-bold text-blue-600 dark:text-blue-400 mt-6">
                <span>Synthesize Your Website Assistant</span>
                <Link
                  href="/studio"
                  className="w-8 h-8 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

