"use client";

import React from "react";
import { AssistantStudio } from "@/components/studio/AssistantStudio";
import Link from "next/link";
import { ArrowLeft, Sparkles, Home, Zap, Bot, ShieldCheck } from "lucide-react";
import { KeyVaultModal } from "@/components/modals/KeyVaultModal";
import { ApiKeyDirectoryModal } from "@/components/modals/ApiKeyDirectoryModal";

export default function StudioPage() {
  return (
    <div className="app-shell deck-studio-app h-[100dvh] w-screen flex flex-col bg-[#100e0d] text-[#faf5ef] overflow-hidden relative selection:bg-[#ef9a71]/30 selection:text-white">
      {/* Background ambient field & glow */}
      <div className="ambient-field" aria-hidden="true" />
      <div className="ambient-mesh-glow" aria-hidden="true" />
      <div className="site-noise" aria-hidden="true" />

      {/* Top Executive Header & Suite Switcher */}
      <header className="h-14 px-3 sm:px-6 border-b border-amber-950/40 bg-[#0f0907]/90 backdrop-blur-xl text-[#c2b2a6] flex items-center justify-between text-xs z-30 shrink-0 shadow-sm">
        {/* Left: Brand & Home */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/"
            className="btn-tactile flex items-center gap-2 text-foreground font-bold hover:text-[#efb18d] transition-colors"
            title="ModelDeck Home"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-[#ef9a71] to-[#d88960] text-[#1a0a04] font-bold text-xs shadow-md shadow-[#ef9a71]/20">
              MD
            </div>
            <span className="font-bold tracking-tight text-foreground hidden sm:inline">ModelDeck</span>
          </Link>

          <span className="text-border/60 hidden sm:inline">/</span>

          <Link
            href="/"
            className="btn-tactile hidden sm:flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
        </div>

        {/* Center: Executive Product Suite Switcher */}
        <nav aria-label="Workspaces" className="flex items-center p-1 rounded-xl bg-[#140c09] border border-amber-900/50 shadow-inner">
          <Link
            href="/playground"
            className="btn-tactile group flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-[#b8a79b] hover:text-[#faf5ef] hover:bg-white/5 transition-all"
            title="Switch to Model Playground"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
            <span>Playground</span>
          </Link>
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#ef9a71] text-[#1a0a04] shadow-sm select-none"
          >
            <Bot className="h-3.5 w-3.5 fill-current" />
            <span>Assistant Studio</span>
            <span className="rounded bg-[#1a0a04]/20 px-1 py-0.2 text-[8px] font-mono font-black">
              ACTIVE
            </span>
          </div>
        </nav>

        {/* Right: Engine Status & Safe Vault Badge */}
        <div className="flex items-center gap-2">
          <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">
            <ShieldCheck className="h-3 w-3" />
            <span>Zero Server Key Storage</span>
          </div>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-muted-foreground font-mono text-[11px] hidden lg:inline">Assistant Engine v2.0</span>
        </div>
      </header>

      {/* Studio Viewport */}
      <div className="flex-1 overflow-hidden relative z-10">
        <AssistantStudio />
      </div>

      {/* Global Modals for Studio */}
      <KeyVaultModal />
      <ApiKeyDirectoryModal />
    </div>
  );
}
