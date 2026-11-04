"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Bot, Sparkles, ShieldCheck, Zap, Lock, Terminal, Cpu } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
        {/* Eyebrow Micro-Pill */}
        <div className="inline-flex items-center gap-2 p-1 rounded-full bg-white/[0.04] dark:bg-white/[0.03] border border-border shadow-sm backdrop-blur-md animate-in fade-in duration-300">
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-1 text-xs font-mono">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-foreground">BYOK AI WORKSTATION</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="text-primary font-semibold">Zero Subscription Markup</span>
          </div>
        </div>

        {/* Hero Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-gradient-aurora leading-[1.06] text-balance">
            Test Frontier AI at Hardware Speed. Deploy Portfolios in Seconds.
          </h1>

          {/* Subtext (under 25 words per guidelines) */}
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal text-balance">
            Direct BYOK access to OpenAI, Claude 3.7, Gemini 2.5, DeepSeek R1 &amp; Groq with live token velocity telemetry and local AES-GCM encryption.
          </p>
        </div>

        {/* Primary & Secondary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/playground"
            className="btn-tactile group w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-blue-500/25 transition-all active:scale-[0.985]"
          >
            <span>Launch Playground</span>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform">
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            href="/studio"
            className="btn-tactile w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface-1 hover:bg-surface-2 px-6 py-4 text-sm font-bold text-foreground transition-all shadow-sm"
          >
            <Bot className="h-4 w-4 text-purple-500" />
            <span>Explore Assistant Studio</span>
            <span className="rounded bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.2 text-[10px] font-mono text-purple-600 dark:text-purple-400">
              1-CLICK
            </span>
          </Link>
        </div>

        {/* Feature Checkpoints */}
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 pt-4 text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Hardware AES-GCM-256 Vault</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span>Live tok/s &amp; TTFT Telemetry</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-blue-500" />
            <span>DeepSeek R1 Thinking Traces</span>
          </div>
        </div>
      </div>
    </section>
  );
}

