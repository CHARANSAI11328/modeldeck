"use client";

import React from "react";
import Link from "next/link";
import { KeyRound, Play, GitPullRequest, ArrowRight } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Add Keys or Use Free Tier",
      desc: "Paste your API keys for OpenAI, Claude, DeepSeek, or Groq. Or immediately test free tiers on Groq and Google Gemini without entering a card.",
      icon: KeyRound,
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      num: "02",
      title: "Benchmark & Inspect Traces",
      desc: "Execute high-concurrency prompts across multiple providers with real-time token telemetry, millisecond TTFT measurements, and inspectable thinking traces.",
      icon: Play,
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      num: "03",
      title: "Synthesize Portfolio AI",
      desc: "Open Assistant Studio, input your portfolio URL, customize your persona, and open a 1-click GitHub Pull Request to embed the widget on your live site.",
      icon: GitPullRequest,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <section className="py-16 sm:py-24 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">
            <span>DEVELOPER WORKFLOW</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            Up and Running in 3 Steps
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Zero account creation, zero database tracking, and zero friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.num} className="double-bezel">
                <div className="double-bezel-inner p-6 sm:p-7 space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-3xl font-black text-muted-foreground/40">
                        {s.num}
                      </span>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${s.bg} ${s.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <h3 className="font-bold text-lg text-foreground tracking-tight">
                      {s.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {s.desc}
                    </p>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] font-mono text-muted-foreground font-semibold">
                      STEP {s.num} COMPLETE
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

