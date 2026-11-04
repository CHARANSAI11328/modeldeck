"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Bot, ShieldCheck } from "lucide-react";

export function LandingCta() {
  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="double-bezel">
          <div className="double-bezel-inner p-8 sm:p-14 text-center space-y-7 bg-gradient-to-br from-blue-600/10 via-surface-1 to-indigo-600/10 relative overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>COMMENCE INFERENCE</span>
            </div>

            <div className="space-y-3 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground text-balance">
                Ready to Experience Frontier AI Without the Subscription Tax?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto text-balance">
                Launch the playground in one click. Connect your personal keys or test open-weights on Groq and Gemini instantly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/playground"
                className="btn-tactile group w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-blue-500/25 transition-all"
              >
                <span>Launch Playground Now</span>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>

              <Link
                href="/studio"
                className="btn-tactile w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface-2 hover:bg-surface-3 px-6 py-4 text-sm font-bold text-foreground transition-all"
              >
                <Bot className="h-4 w-4 text-purple-500" />
                <span>Build Assistant</span>
              </Link>
            </div>

            <div className="pt-2 text-xs font-mono text-muted-foreground flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>100% Free &amp; Open Source • Zero Key Logging Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

