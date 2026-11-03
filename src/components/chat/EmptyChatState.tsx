"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Terminal,
  Code2,
  BrainCircuit,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  Zap,
  Lock,
  Bot,
  Cpu,
  Layers,
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
    <div className="flex flex-col items-center justify-center py-6 sm:py-10 px-3 sm:px-4 text-center max-w-3xl mx-auto space-y-7 animate-in fade-in duration-300">
      {/* Provider & Model Header Pill */}
      <div className="space-y-3 max-w-full">
        <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-1 border border-border text-xs font-mono shadow-sm">
          <ProviderMark providerId={providerId} modelId={modelId} label={provider.shortLabel} className="h-4 w-4 shrink-0" />
          <span className="font-bold text-foreground">{provider.label}</span>
          <span className="text-muted-foreground/60">/</span>
          <span className="text-primary font-semibold truncate max-w-[200px] sm:max-w-none">{model.name}</span>
          {model.isReasoning && (
            <span className="rounded-full bg-purple-500/15 border border-purple-500/30 px-2 py-0.2 text-[10px] font-sans font-medium text-purple-600 dark:text-purple-300">
              🧠 Reasoning
            </span>
          )}
        </div>

        {/* Hero Title with Gradient Text */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-gradient-aurora leading-tight">
          Frontier AI Playground &amp; Studio
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed font-normal">
          Test frontier LLMs with real-time token telemetry, or synthesize a personalized AI assistant for your personal website.
        </p>
      </div>

      {/* Interactive Bento Showcase Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left pt-2">
        {/* Bento Card 1: Fast LPU Speedrun (Spans 2 columns) */}
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
          className="group sm:col-span-2 relative rounded-2xl border border-border bg-gradient-to-br from-surface-1 to-surface-2 p-5 shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                <Zap className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm text-foreground">LPU Lightning Speedrun</span>
            </div>
            <span className="rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-mono font-medium text-blue-600 dark:text-blue-400">
              100+ tok/s
            </span>
          </div>

          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Test ultra-low latency token generation on dedicated LPUs with live Time-to-First-Token and token velocity metrics.
          </p>

          <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Test TypeScript System Benchmark →</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Bento Card 2: Assistant Studio (Spans 1 column) */}
        <Link
          href="/studio"
          className="group relative rounded-2xl border border-border bg-gradient-to-br from-purple-500/10 via-surface-1 to-surface-2 p-5 shadow-sm hover:shadow-xl hover:border-purple-500/50 transition-all overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                <Bot className="h-4 w-4" />
              </div>
              <span className="rounded-md bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[10px] font-mono font-semibold text-purple-600 dark:text-purple-400">
                NEW STUDIO
              </span>
            </div>

            <h3 className="font-bold text-sm text-foreground mb-1">Portfolio Chatbot</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Auto-synthesize an AI bot for your website with 1-click GitHub PR.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-semibold pt-4 group-hover:translate-x-0.5 transition-transform">
            <span>Open Studio 🚀</span>
            <ArrowRight className="h-3.5 w-3.5" />
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
          className="group relative rounded-2xl border border-border bg-gradient-to-br from-surface-1 to-surface-2 p-5 shadow-sm hover:shadow-xl hover:border-indigo-500/50 transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <BrainCircuit className="h-4 w-4" />
              </div>
              <span className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                R1 / Thinking
              </span>
            </div>

            <h3 className="font-bold text-sm text-foreground mb-1">Reasoning Traces</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Inspect raw chain-of-thought steps and internal model deliberations.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-semibold pt-4 group-hover:translate-x-0.5 transition-transform">
            <span>Solve Logic Riddle →</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Bento Card 4: Zero-Trust Local BYOK Vault (Spans 2 columns) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setKeyVaultOpen(true, providerId)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setKeyVaultOpen(true, providerId);
            }
          }}
          className="group sm:col-span-2 relative rounded-2xl border border-border bg-gradient-to-br from-surface-1 to-surface-2 p-5 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm text-foreground">Zero-Trust BYOK Vault</span>
            </div>
            <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
              AES-GCM-256
            </span>
          </div>

          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Direct provider pricing with zero subscription markup. All API credentials are encrypted with hardware AES-GCM in browser memory and never hit ModelDeck servers.
          </p>

          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Configure BYOK Encryption Vault ↗</span>
            <KeyRound className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
