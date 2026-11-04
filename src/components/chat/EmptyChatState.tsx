"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Terminal,
  Code2,
  BrainCircuit,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  Zap,
  Lock,
  Bot,
  Cpu,
  Layers,
  Flame,
  Check,
} from "lucide-react";
import { ProviderId } from "@/lib/types";
import { getProvider, getModel } from "@/lib/providers";
import { usePlaygroundStore } from "@/lib/store";
import { ProviderMark } from "@/components/ui/ProviderMark";

interface EmptyChatStateProps {
  providerId: ProviderId;
  modelId: string;
}

export function EmptyChatState({ providerId, modelId }: EmptyChatStateProps) {
  const { sendMessage, setKeyVaultOpen, keyStatusMap } = usePlaygroundStore();
  const provider = getProvider(providerId);
  const model = getModel(providerId, modelId);
  const hasKey = keyStatusMap[providerId] || providerId === "custom-openai-compatible";

  return (
    <div className="flex flex-col items-center justify-center py-6 sm:py-12 px-3 sm:px-6 text-center max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Header Pill with Double-Bezel Refinement */}
      <div className="space-y-4 max-w-full">
        <div className="inline-flex max-w-full items-center justify-center p-1 rounded-full bg-white/[0.04] dark:bg-white/[0.03] border border-border/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-1 text-xs font-mono">
            <ProviderMark providerId={providerId} modelId={modelId} label={provider.shortLabel} className="h-4 w-4 shrink-0" />
            <span className="font-bold text-foreground">{provider.label}</span>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-primary font-semibold truncate max-w-[180px] sm:max-w-none">{model.name}</span>
            {model.isReasoning ? (
              <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[10px] font-sans font-medium text-purple-600 dark:text-purple-300">
                <BrainCircuit className="h-2.5 w-2.5" /> Reasoning
              </span>
            ) : (
              <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-sans font-medium text-blue-600 dark:text-blue-400">
                <Sparkles className="h-2.5 w-2.5" /> Frontier
              </span>
            )}
          </div>
        </div>

        {/* Hero Title with High-Contrast Variable Precision */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-gradient-aurora leading-[1.1] text-balance">
            Frontier AI Playground &amp; Studio
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal text-balance">
            Test multi-provider LLMs with real-time token telemetry and thinking traces, or build an interactive AI assistant for your personal portfolio.
          </p>
        </div>

        {/* Quick Launch Action Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button
            onClick={() =>
              sendMessage(
                "Write a production-ready TypeScript distributed rate limiter with Redis sliding window and graceful memory fallback."
              )
            }
            className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-1 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-blue-500/50 hover:bg-surface-2 transition-all shadow-sm"
          >
            <Zap className="h-3 w-3 text-amber-500" />
            <span>Distributed Rate Limiter</span>
          </button>

          <button
            onClick={() =>
              sendMessage(
                "Solve this logic problem step by step with full rationale: A farmer must cross a river with a wolf, goat, and cabbage. His boat can only hold him and one item. If left alone, the wolf eats the goat, or the goat eats the cabbage. What is the minimum sequence of crossings?"
              )
            }
            className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-1 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-indigo-500/50 hover:bg-surface-2 transition-all shadow-sm"
          >
            <BrainCircuit className="h-3 w-3 text-indigo-500" />
            <span>River Crossing Logic</span>
          </button>

          <Link
            href="/studio"
            className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs text-blue-600 dark:text-blue-300 hover:bg-blue-500/20 transition-all shadow-sm"
          >
            <Bot className="h-3 w-3 text-blue-500" />
            <span>Portfolio Assistant Studio</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/20 font-mono">NEW</span>
          </Link>
        </div>
      </div>

      {/* Asymmetric Bento Showcase Grid with Double-Bezel Craft */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-2">
        {/* Bento Card 1: Fast LPU Speedrun (Spans 2 columns on desktop) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() =>
            sendMessage(
              "Write a production-ready TypeScript distributed rate limiter with Redis sliding window and graceful memory fallback."
            )
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              sendMessage(
                "Write a production-ready TypeScript distributed rate limiter with Redis sliding window and graceful memory fallback."
              );
            }
          }}
          className="group md:col-span-2 double-bezel btn-tactile cursor-pointer"
        >
          <div className="double-bezel-inner p-5 sm:p-6 flex flex-col justify-between h-full group-hover:border-blue-500/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    <Zap className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-foreground tracking-tight">LPU Lightning Speedrun</h2>
                    <span className="text-[11px] text-muted-foreground font-mono">Ultra-low latency inference</span>
                  </div>
                </div>
                <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-[11px] font-mono font-semibold text-blue-600 dark:text-blue-400">
                  100+ tok/s
                </span>
              </div>

              <p className="text-xs text-muted-foreground mb-4 leading-relaxed max-w-xl">
                Benchmark streaming token velocity on dedicated LPUs with live Time-to-First-Token and instant token-per-second velocity measurements.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <span className="group-hover:translate-x-0.5 transition-transform">Run TypeScript Benchmark</span>
              <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Bento Card 2: Assistant Studio (Spans 1 column) */}
        <Link
          href="/studio"
          className="group double-bezel btn-tactile flex flex-col"
        >
          <div className="double-bezel-inner p-5 sm:p-6 flex flex-col justify-between h-full group-hover:border-purple-500/40 transition-colors bg-gradient-to-b from-purple-500/[0.04] to-transparent">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <span className="rounded-full bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400">
                  ASSISTANT STUDIO
                </span>
              </div>

              <h2 className="font-bold text-sm text-foreground mb-1 tracking-tight">Portfolio Chatbot</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Scrape your portfolio and synthesize an AI assistant with 1-click GitHub PR deployment.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/60 text-xs font-semibold text-purple-600 dark:text-purple-400 mt-4">
              <span className="group-hover:translate-x-0.5 transition-transform">Launch Studio</span>
              <div className="w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </Link>

        {/* Bento Card 3: Deep Reasoning Traces (Spans 1 column) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() =>
            sendMessage(
              "Solve this logic problem step by step with full rationale: A farmer must cross a river with a wolf, goat, and cabbage. His boat can only hold him and one item. If left alone, the wolf eats the goat, or the goat eats the cabbage. What is the minimum sequence of crossings?"
            )
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              sendMessage(
                "Solve this logic problem step by step with full rationale: A farmer must cross a river with a wolf, goat, and cabbage. His boat can only hold him and one item. If left alone, the wolf eats the goat, or the goat eats the cabbage. What is the minimum sequence of crossings?"
              );
            }
          }}
          className="group double-bezel btn-tactile cursor-pointer"
        >
          <div className="double-bezel-inner p-5 sm:p-6 flex flex-col justify-between h-full group-hover:border-indigo-500/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <BrainCircuit className="h-4.5 w-4.5" />
                </div>
                <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                  R1 / Thinking
                </span>
              </div>

              <h2 className="font-bold text-sm text-foreground mb-1 tracking-tight">Reasoning Traces</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Inspect raw chain-of-thought tokens, internal reasoning steps, and model deliberation trees.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/60 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-4">
              <span className="group-hover:translate-x-0.5 transition-transform">Solve Logic Riddle</span>
              <div className="w-7 h-7 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Bento Card 4: Zero-Trust Local BYOK Vault (Spans 2 columns on desktop) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setKeyVaultOpen(true, providerId)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setKeyVaultOpen(true, providerId);
            }
          }}
          className="group md:col-span-2 double-bezel btn-tactile cursor-pointer"
        >
          <div className="double-bezel-inner p-5 sm:p-6 flex flex-col justify-between h-full group-hover:border-emerald-500/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-foreground tracking-tight">Zero-Trust BYOK Vault</h2>
                    <span className="text-[11px] text-muted-foreground font-mono">Direct API Pricing • No Markup</span>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                  AES-GCM-256
                </span>
              </div>

              <p className="text-xs text-muted-foreground mb-4 leading-relaxed max-w-xl">
                Connect your own API credentials directly. Keys are encrypted with hardware-accelerated AES-GCM in local memory, synchronized across windows, and never stored on third-party servers.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="group-hover:translate-x-0.5 transition-transform">Configure BYOK Encryption Vault</span>
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <KeyRound className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
