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
  Gauge,
  Radio,
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
    <div className="flex flex-col items-center justify-center py-6 sm:py-10 px-3 sm:px-6 text-center max-w-4xl mx-auto space-y-7 animate-in fade-in duration-300">
      
      {/* 1. TOP HARDWARE HUD STATUS BAR */}
      <div className="inline-flex max-w-full items-center justify-center p-1 rounded-full bg-[#180e0a]/90 border border-amber-900/40 shadow-xl shadow-black/40 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-center gap-2 px-3 py-1 rounded-full bg-[#20130d] text-xs font-mono">
          <ProviderMark providerId={providerId} modelId={modelId} label={provider.shortLabel} className="h-4 w-4 shrink-0" />
          <span className="font-bold text-[#faf5ef]">{provider.label}</span>
          <span className="text-amber-800">•</span>
          <span className="text-[#ff8a50] font-semibold truncate max-w-[180px] sm:max-w-none">{model.name}</span>
          {model.isReasoning ? (
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-[#ff5722]/15 border border-[#ff5722]/30 px-2 py-0.5 text-[10px] font-mono font-medium text-[#ff8a50]">
              <BrainCircuit className="h-2.5 w-2.5" /> Deliberation Trace
            </span>
          ) : (
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 text-[10px] font-mono font-medium text-amber-400">
              <Zap className="h-2.5 w-2.5" /> Frontier Engine
            </span>
          )}
        </div>
      </div>

      {/* 2. FLIGHT DECK HEADLINE */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#faf5ef] leading-[1.08] text-balance">
          ModelDeck Flight Control
        </h1>
        <p className="text-sm sm:text-base text-[#b8a79a] max-w-2xl mx-auto leading-relaxed font-normal text-balance">
          Direct hardware inference engine. Zero middleman telemetry. Dispatch an evaluation mission below or type your custom instruction.
        </p>
      </div>

      {/* 3. LIVE TELEMETRY CHIPS */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs font-mono">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#160d09] border border-amber-900/30 text-[#a8998e]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>AES-GCM-256 Vault Online</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#160d09] border border-amber-900/30 text-[#a8998e]">
          <Gauge className="h-3 w-3 text-[#ff7043]" />
          <span>Realtime tok/s Benchmarking</span>
        </div>
        <Link
          href="/studio"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff5722]/15 border border-[#ff5722]/30 text-[#ff8a50] hover:bg-[#ff5722]/25 transition-colors"
        >
          <Bot className="h-3 w-3 text-[#ff5722]" />
          <span>Assistant Studio Active</span>
        </Link>
      </div>

      {/* 4. TACTICAL MISSION LAUNCH CARDS (3 INTERACTIVE TEST MISSIONS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-2 text-left">
        
        {/* Mission 1: Concurrency Rate Limiter */}
        <div
          onClick={() =>
            sendMessage(
              "Write a production-ready TypeScript distributed sliding window rate limiter with Redis multi pipeline and memory fallback."
            )
          }
          className="group cursor-pointer rounded-2xl border border-white/10 bg-[#140d0a]/80 p-5 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-[#ff5722]/60 hover:bg-[#1a110c] hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/70 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff5722]/15 text-[#ff5722] border border-[#ff5722]/25">
                <Zap className="h-4 w-4" />
              </div>
              <span className="rounded-full bg-[#ff5722]/10 border border-[#ff5722]/20 px-2 py-0.5 text-[10px] font-mono text-[#ff8a50] font-semibold">
                High Speed
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#faf5ef] group-hover:text-[#ff8a50] transition-colors">
                Redis Rate Limiter
              </h3>
              <p className="text-xs text-[#a8998e] leading-relaxed mt-1 line-clamp-2">
                Evaluate high-concurrency sliding window logic across models.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.06] text-xs font-semibold text-[#ff8a50]">
            <span>Dispatch Test</span>
            <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#ff5722] group-hover:text-[#140a06] transition-all">
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>

        {/* Mission 2: Deliberation Trace & Logic Riddle */}
        <div
          onClick={() =>
            sendMessage(
              "Solve this logic problem step by step with full rationale: A farmer must cross a river with a wolf, goat, and cabbage. His boat can only hold him and one item. If left alone, the wolf eats the goat, or the goat eats the cabbage. What is the minimum sequence of crossings?"
            )
          }
          className="group cursor-pointer rounded-2xl border border-white/10 bg-[#140d0a]/80 p-5 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-[#f59e0b]/60 hover:bg-[#1a110c] hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/70 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25">
                <BrainCircuit className="h-4 w-4" />
              </div>
              <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-mono text-amber-400 font-semibold">
                Deliberation
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#faf5ef] group-hover:text-amber-400 transition-colors">
                River Crossing Logic
              </h3>
              <p className="text-xs text-[#a8998e] leading-relaxed mt-1 line-clamp-2">
                Benchmark reasoning chain-of-thought on complex state constraints.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.06] text-xs font-semibold text-amber-400">
            <span>Dispatch Test</span>
            <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-[#140a06] transition-all">
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>

        {/* Mission 3: Zero-Trust Security Audit */}
        <div
          onClick={() =>
            sendMessage(
              "Audit an OAuth2 / JWT authentication refresh-token workflow for race conditions, token replay attacks, and clock drift. Provide concrete architectural remediation."
            )
          }
          className="group cursor-pointer rounded-2xl border border-white/10 bg-[#140d0a]/80 p-5 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-[#ea580c]/60 hover:bg-[#1a110c] hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/70 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600/15 text-[#ff7043] border border-orange-600/25">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="rounded-full bg-orange-600/10 border border-orange-600/20 px-2 py-0.5 text-[10px] font-mono text-[#ff8a50] font-semibold">
                Security Audit
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#faf5ef] group-hover:text-[#ff7043] transition-colors">
                JWT Replay Hardening
              </h3>
              <p className="text-xs text-[#a8998e] leading-relaxed mt-1 line-clamp-2">
                Evaluate zero-trust cryptographic hardening recommendations.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.06] text-xs font-semibold text-[#ff7043]">
            <span>Dispatch Test</span>
            <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#ff7043] group-hover:text-[#140a06] transition-all">
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>

      </div>

      {/* 5. VAULT STATUS FOOTER NOTICE */}
      {!hasKey && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-amber-900/40 bg-[#180e0a]/90 backdrop-blur-md text-xs font-mono text-[#c2b2a6]">
          <KeyRound className="h-4 w-4 text-[#ff5722] shrink-0" />
          <span>
            {provider.label} key not detected in your browser vault.
          </span>
          <button
            onClick={() => setKeyVaultOpen(true, providerId)}
            className="ml-auto inline-flex items-center gap-1 font-bold text-[#ff8a50] hover:text-[#ffaa7d] underline underline-offset-4"
          >
            <span>Add Key</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}

    </div>
  );
}
