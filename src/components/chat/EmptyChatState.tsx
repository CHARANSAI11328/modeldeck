"use client";

import React from "react";
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
  Layers,
} from "lucide-react";
import { ProviderId } from "@/lib/types";
import { getProvider, getModel } from "@/lib/providers";
import { usePlaygroundStore } from "@/lib/store";

interface EmptyChatStateProps {
  providerId: ProviderId;
  modelId: string;
}

export function EmptyChatState({ providerId, modelId }: EmptyChatStateProps) {
  const { sendMessage, setKeyVaultOpen, keyStatusMap } = usePlaygroundStore();
  const provider = getProvider(providerId);
  const model = getModel(providerId, modelId);
  const hasKey = keyStatusMap[providerId] || providerId === "custom-openai-compatible";

  const starterPrompts = [
    {
      title: "Full-Stack TypeScript",
      prompt: "Write a high-performance TypeScript WebSocket worker with exponential backoff and connection pooling.",
      icon: Code2,
    },
    {
      title: "Reasoning & Logic",
      prompt: "Solve this riddle step by step: A farmer needs to take a wolf, goat, and cabbage across a river...",
      icon: BrainCircuit,
    },
    {
      title: "System Architecture",
      prompt: "Draft an architecture specification for an ultra-low latency real-time streaming AI pipeline.",
      icon: Terminal,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-6 sm:py-10 px-3 sm:px-4 text-center max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Provider & Model Header Badge */}
      <div className="space-y-3 max-w-full">
        <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 border border-border text-xs font-mono text-zinc-300 shadow-sm">
          <span
            className="h-2 w-2 rounded-full shrink-0 animate-pulse-subtle"
            style={{ backgroundColor: provider.color }}
          />
          <span className="font-semibold text-foreground">{provider.label}</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-300 font-medium truncate max-w-[180px] sm:max-w-none">{model.name}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          ModelDeck Playground
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          {model.description}
        </p>

        {model.contextWindow && (
          <div className="flex items-center justify-center gap-2 pt-0.5 text-[11px] text-zinc-500 font-mono">
            <span>Context: {model.contextWindow}</span>
            {model.isReasoning && (
              <>
                <span className="text-zinc-700">•</span>
                <span className="text-purple-400 font-medium flex items-center gap-1">
                  <BrainCircuit className="h-3 w-3" />
                  Reasoning Traces
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* 3-Step Quick Setup Card */}
      {!hasKey ? (
        <div className="w-full rounded-xl border border-border bg-surface-1 p-4 sm:p-5 text-left shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">
                  Quick Setup: 3 Easy Steps to Test {provider.shortLabel}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Bring your own API key to test frontier models at direct provider rates.
                </p>
              </div>
            </div>
            <button
              onClick={() => setKeyVaultOpen(true, providerId)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium text-xs px-3.5 py-1.5 transition-colors shadow-sm shrink-0"
            >
              <span>Setup Key</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Step 1 */}
            <div className="group rounded-lg border border-border/80 bg-surface-2 p-3.5 flex flex-col justify-between space-y-2 hover:border-zinc-700 transition-colors">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-500/10 text-blue-400 font-mono font-semibold text-[11px] border border-blue-500/20">
                    1
                  </span>
                  <KeyRound className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                </div>
                <h4 className="font-medium text-xs text-foreground">Get API Key</h4>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Create or copy your key from the official {provider.shortLabel} developer console.
                </p>
              </div>
              <a
                href={provider.getKeyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 pt-1 transition-colors"
              >
                <span>Console link</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Step 2 */}
            <div className="group rounded-lg border border-border/80 bg-surface-2 p-3.5 flex flex-col justify-between space-y-2 hover:border-zinc-700 transition-colors">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-500/10 text-blue-400 font-mono font-semibold text-[11px] border border-blue-500/20">
                    2
                  </span>
                  <Lock className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                </div>
                <h4 className="font-medium text-xs text-foreground">Paste into Vault</h4>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Encrypted at rest in browser memory with AES-GCM-256. Never stored on our servers.
                </p>
              </div>
              <button
                onClick={() => setKeyVaultOpen(true, providerId)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 pt-1 transition-colors"
              >
                <span>Open Vault</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* Step 3 */}
            <div className="group rounded-lg border border-border/80 bg-surface-2 p-3.5 flex flex-col justify-between space-y-2 hover:border-zinc-700 transition-colors">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-500/10 text-blue-400 font-mono font-semibold text-[11px] border border-blue-500/20">
                    3
                  </span>
                  <Zap className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                </div>
                <h4 className="font-medium text-xs text-foreground">Test &amp; Stream</h4>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Verify key connectivity and stream tokens with live TTFT and speed metrics.
                </p>
              </div>
              <span className="text-[11px] text-emerald-400/90 font-medium pt-1 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Zero markup
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 shadow-sm text-center">
          <Zap className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>{provider.label} Key Ready</span>
        </div>
      )}

      {/* Security Assurance Badge */}
      <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-1 border border-border/80 text-[11px] text-zinc-400 shadow-sm text-center">
        <ShieldCheck className="h-3.5 w-3.5 text-blue-400 shrink-0" />
        <span>Client-Side BYOK Security • AES-GCM-256 Encrypted</span>
      </div>

      {/* Starter Prompts */}
      <div className="w-full space-y-2.5 text-left pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-blue-400" />
            Quick Test Prompts
          </span>
          <span className="text-[11px] text-zinc-500 font-mono">1-click test</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {starterPrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => sendMessage(item.prompt)}
                className="group flex flex-col justify-between p-3.5 rounded-lg border border-border bg-surface-1 hover:bg-surface-2 hover:border-zinc-700 text-left transition-all"
              >
                <div className="flex items-center gap-2 mb-2 text-zinc-300 group-hover:text-blue-400 text-xs font-medium">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.title}</span>
                </div>
                <p className="text-[12px] text-muted-foreground group-hover:text-zinc-300 leading-snug line-clamp-2 transition-colors">
                  {item.prompt}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
