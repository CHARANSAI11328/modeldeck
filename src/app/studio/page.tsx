"use client";

import React from "react";
import { AssistantStudio } from "@/components/studio/AssistantStudio";
import Link from "next/link";
import { ArrowLeft, Sparkles, Home } from "lucide-react";

export default function StudioPage() {
  return (
    <div className="h-[100dvh] w-screen flex flex-col bg-[#0c0807] text-[#faf5ef] overflow-hidden relative">
      {/* Background ambient field & glow */}
      <div className="ambient-field" aria-hidden="true" />
      <div className="ambient-mesh-glow" aria-hidden="true" />
      <div className="site-noise" aria-hidden="true" />

      {/* Top Breadcrumb Header Bar */}
      <div className="h-11 px-4 sm:px-6 border-b border-amber-950/40 bg-[#0f0907]/90 backdrop-blur-xl text-[#c2b2a6] flex items-center justify-between text-xs z-20 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/playground"
            className="btn-tactile flex items-center gap-1.5 text-[#c2b2a6] hover:text-[#ff8a50] font-medium transition-colors"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#1a110d] border border-white/10">
              <ArrowLeft className="h-3.5 w-3.5" />
            </div>
            <span>Playground</span>
          </Link>

          <span className="text-border">/</span>

          <Link
            href="/"
            className="btn-tactile flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-3 w-3" />
            <span>Home</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-muted-foreground font-mono text-[11px] hidden sm:inline">ModelDeck Assistant Engine v2.0</span>
        </div>
      </div>

      {/* Studio Viewport */}
      <div className="flex-1 overflow-hidden relative z-10">
        <AssistantStudio />
      </div>
    </div>
  );
}
