"use client";

import React from "react";
import Link from "next/link";
import { Bot, Sparkles, ArrowRight, Check, Code2, GitPullRequest } from "lucide-react";

export function StudioSpotlight() {
  return (
    <section id="studio" className="py-16 sm:py-24 border-t border-border/80 bg-surface-1/40 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left Text Explanation */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-mono font-semibold text-purple-600 dark:text-purple-400">
              <Bot className="h-3.5 w-3.5" />
              <span>ASSISTANT STUDIO SPOTLIGHT</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
              An AI Agent That Knows Your Projects Inside Out.
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Don&apos;t just send recruiters a static PDF. Deploy a personalized, interactive chatbot that talks about your architecture decisions, tech stacks, and career highlights.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm font-medium text-foreground">
              <li className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span>Automated portfolio URL scraping &amp; skill synthesis</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span>Custom brand colors, preset avatars, and suggested question chips</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span>1-Click automated GitHub Pull Request deployment</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span>Zero npm dependencies — 100% scoped Shadow DOM script</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                href="/studio"
                className="btn-tactile group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-xl shadow-purple-500/20 transition-all"
              >
                <span>Launch Assistant Studio</span>
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            </div>
          </div>

          {/* Right Hardware Frame Preview */}
          <div className="double-bezel">
            <div className="double-bezel-inner overflow-hidden shadow-2xl">
              {/* Device Frame Window Title */}
              <div className="flex items-center justify-between border-b border-border bg-surface-2/90 px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                  <span className="text-xs font-mono text-muted-foreground ml-2">portfolio-preview.dev</span>
                </div>
                <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-500 font-semibold">
                  Live Widget
                </span>
              </div>

              {/* Simulated Embedded Widget View */}
              <div className="p-6 sm:p-8 space-y-6 bg-gradient-to-b from-surface-1 to-surface-2/50 min-h-[360px] relative">
                <div className="space-y-2 text-center max-w-sm mx-auto pt-4">
                  <div className="inline-flex items-center gap-1 text-[11px] font-mono text-blue-500 font-semibold">
                    <Sparkles className="h-3 w-3" />
                    <span>YOUR PORTFOLIO SITE</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    Senior Full-Stack Engineer
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Building distributed web applications with Next.js, TypeScript, and AI integrations.
                  </p>
                </div>

                {/* Simulated Floating Chatbot Widget on bottom right */}
                <div className="absolute bottom-6 right-6 w-72 rounded-2xl border border-border bg-surface-1 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-blue-600 text-white">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-white/20 flex items-center justify-center text-xs">
                        🤖
                      </div>
                      <div className="font-bold text-xs">Alex&apos;s Assistant</div>
                    </div>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                  </div>

                  <div className="p-3 space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-surface-2 border border-border text-foreground leading-relaxed text-[11px]">
                      Hi there! I can answer questions about Alex&apos;s Next.js projects and background.
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-mono">
                        Tell me about Alex&apos;s skills
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
