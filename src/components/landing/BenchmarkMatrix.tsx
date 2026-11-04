"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, Check, ArrowRight, ExternalLink } from "lucide-react";

interface BenchmarkRow {
  model: string;
  provider: string;
  category: string;
  speed: string;
  ttft: string;
  context: string;
  pricePer1M: string;
  tier: string;
}

const BENCHMARKS: BenchmarkRow[] = [
  {
    model: "Llama 3.3 70B Versatile",
    provider: "Groq LPU",
    category: "Fastest Open-Weights",
    speed: "128 tok/s",
    ttft: "18ms",
    context: "128k",
    pricePer1M: "$0.59 (or Free tier)",
    tier: "Fast / Coding",
  },
  {
    model: "Gemini 2.5 Flash",
    provider: "Google AI Studio",
    category: "High-Volume Frontier",
    speed: "95 tok/s",
    ttft: "120ms",
    context: "1M tokens",
    pricePer1M: "15 RPM Free Tier",
    tier: "Reasoning / Fast",
  },
  {
    model: "DeepSeek R1 (Thinking)",
    provider: "DeepSeek Direct",
    category: "Math & Logic Deliberation",
    speed: "46 tok/s",
    ttft: "340ms",
    context: "64k tokens",
    pricePer1M: "$0.55 / 1M in",
    tier: "Reasoning",
  },
  {
    model: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    category: "Elite Coding & System Design",
    speed: "72 tok/s",
    ttft: "190ms",
    context: "200k tokens",
    pricePer1M: "$3.00 / 1M in",
    tier: "Coding / General",
  },
  {
    model: "GPT-4o mini",
    provider: "OpenAI",
    category: "General Intelligence",
    speed: "84 tok/s",
    ttft: "160ms",
    context: "128k tokens",
    pricePer1M: "$0.15 / 1M in",
    tier: "General",
  },
];

export function BenchmarkMatrix() {
  const [filter, setFilter] = useState<string>("all");

  const filtered = BENCHMARKS.filter(
    (b) => filter === "all" || b.tier.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <section id="benchmarks" className="py-16 sm:py-24 border-t border-border/80 bg-surface-1/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">
              <Zap className="h-3.5 w-3.5" />
              <span>PERFORMANCE MATRIX</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
              Frontier Velocity &amp; Direct Provider Costs
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Pay strictly for the tokens you generate directly to upstream providers. Zero $20/month subscription seat fees.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-surface-2 border border-border p-1 rounded-xl text-xs shrink-0 overflow-x-auto no-scrollbar">
            {["all", "coding", "reasoning", "fast"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`btn-tactile px-3 py-1.5 rounded-lg capitalize font-semibold transition-all ${
                  filter === f
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "all" ? "All Models" : f}
              </button>
            ))}
          </div>
        </div>

        {/* Double-Bezel Table Container */}
        <div className="double-bezel overflow-x-auto">
          <div className="double-bezel-inner overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-2/90 border-b border-border/80 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Model &amp; Tier</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Velocity</th>
                  <th className="py-3 px-4">TTFT</th>
                  <th className="py-3 px-4">Context</th>
                  <th className="py-3 px-4">Direct Upstream Rate</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((row) => (
                  <tr key={row.model} className="hover:bg-surface-2/60 transition-colors">
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-bold text-sm text-foreground">{row.model}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{row.category}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      {row.provider}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-500 font-bold tabular-nums">
                      {row.speed}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums text-foreground">
                      {row.ttft}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground tabular-nums">
                      {row.context}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-blue-600 dark:text-blue-300 font-semibold">
                        {row.pricePer1M}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href="/playground"
                        className="btn-tactile inline-flex items-center gap-1 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border px-2.5 py-1 text-[11px] font-bold text-foreground transition-colors"
                      >
                        <span>Test</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

