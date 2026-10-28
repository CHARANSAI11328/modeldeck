"use client";

import React from "react";
import { Sparkles, Terminal, Code, Cpu, ExternalLink, ShieldCheck, KeyRound, ArrowRight, Zap } from "lucide-react";
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
      title: "Full-Stack Coding",
      prompt: "Write a high-performance TypeScript WebSocket worker with exponential backoff and connection pooling.",
      icon: Code,
    },
    {
      title: "Reasoning & Logic",
      prompt: "Solve this riddle step by step: A farmer needs to take a wolf, goat, and cabbage across a river...",
      icon: Cpu,
    },
    {
      title: "System Architecture",
      prompt: "Draft an architecture specification for an ultra-low latency real-time streaming AI pipeline.",
      icon: Terminal,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-2 sm:px-4 text-center max-w-xl mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Brand Icon Badge */}
      <div
        className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center border shadow-xl transition-transform hover:scale-105"
        style={{
          backgroundColor: `${provider.color}15`,
          borderColor: `${provider.color}40`,
        }}
      >
        <Sparkles className="h-7 w-7 sm:h-8 sm:w-8" style={{ color: provider.color }} />
      </div>

      {/* Model Title & Description */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: provider.color }}></span>
          <span className="font-semibold">{provider.label}</span>
          <span className="text-zinc-500">•</span>
          <span>{model.name}</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
          AI Testing Playground
        </h2>

        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
          {model.description}
        </p>

        {model.contextWindow && (
          <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-zinc-500 font-mono">
            <span>Context Window: {model.contextWindow}</span>
            {model.isReasoning && (
              <>
                <span>•</span>
                <span className="text-purple-400 font-medium">Chain-of-Thought Supported</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Simple 3-Step Guide when key is missing */}
      {!hasKey ? (
        <div className="w-full rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-left shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs sm:text-sm">
            <KeyRound className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Quick Setup: 3 Easy Steps to Test {provider.label}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="rounded-xl bg-black/40 border border-amber-500/20 p-2.5 space-y-1">
              <div className="font-medium text-amber-200 flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-black font-bold text-[10px]">1</span>
                <span>Get API Key</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight">
                Click below to open {provider.shortLabel} developer console.
              </p>
              <a
                href={provider.getKeyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-100 underline underline-offset-2 pt-1"
              >
                <span>Get Key ↗</span>
              </a>
            </div>

            <div className="rounded-xl bg-black/40 border border-amber-500/20 p-2.5 space-y-1">
              <div className="font-medium text-amber-200 flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-black font-bold text-[10px]">2</span>
                <span>Paste in Vault</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight">
                Protected locally in browser with AES-GCM-256 encryption.
              </p>
              <button
                onClick={() => setKeyVaultOpen(true, providerId)}
                className="inline-flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-100 underline underline-offset-2 pt-1"
              >
                <span>Open Vault ↗</span>
              </button>
            </div>

            <div className="rounded-xl bg-black/40 border border-amber-500/20 p-2.5 space-y-1">
              <div className="font-medium text-amber-200 flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-black font-bold text-[10px]">3</span>
                <span>Test &amp; Chat</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight">
                Click &quot;Test Key&quot; to verify and start streaming responses!
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => setKeyVaultOpen(true, providerId)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-4 py-2 transition-colors shadow-md"
            >
              <span>Setup API Key Now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300">
          <Zap className="h-3.5 w-3.5 text-emerald-400" />
          <span>{provider.label} Key Ready • Send a prompt or choose a starter below</span>
        </div>
      )}

      {/* Security Assurance Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-400">
        <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
        <span>100% BYOK Security: Encrypted at rest (AES-GCM + PBKDF2), zero-storage backend</span>
      </div>

      {/* Starter Prompts */}
      <div className="w-full space-y-2 text-left pt-1">
        <span className="text-xs font-semibold text-zinc-400 px-1">
          Quick test prompts:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {starterPrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => sendMessage(item.prompt)}
                className="group flex flex-col justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-zinc-700 text-left transition-all"
              >
                <div className="flex items-center gap-2 mb-2 text-zinc-300 group-hover:text-blue-400 text-xs font-medium">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.title}</span>
                </div>
                <p className="text-[12px] text-zinc-400 leading-snug line-clamp-2">
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
