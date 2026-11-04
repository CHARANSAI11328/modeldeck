"use client";

import React from "react";
import { AssistantStudio } from "@/components/studio/AssistantStudio";
import Link from "next/link";
import { ArrowLeft, Sparkles, Home } from "lucide-react";

export default function StudioPage() {
  return (
    <div className="h-[100dvh] w-screen flex flex-col bg-background text-foreground overflow-hidden relative">
      {/* Background ambient field & glow */}
      <div className="ambient-field" aria-hidden="true" />
      <div className="ambient-mesh-glow" aria-hidden="true" />

      {/* Top Breadcrumb Header Bar */}
      <div className="h-11 px-4 sm:px-6 border-b border-border/80 bg-background/80 backdrop-blur-xl flex items-center justify-between text-xs z-20 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/playground"
            className="btn-tactile flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface-2 border border-border">
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
          <span className="text-muted-foreground font-mono text-[11px]">ModelDeck Assistant Engine v2.0</span>
        </div>
      </div>

      {/* Studio Viewport */}
      <div className="flex-1 overflow-hidden relative z-10">
        <AssistantStudio />
      </div>
    </div>
  );
}
