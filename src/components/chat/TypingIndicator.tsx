"use client";

import React, { useState, useEffect } from "react";
import { Square, Clock } from "lucide-react";
import { ProviderId } from "@/lib/types";
import { getProvider, getModel } from "@/lib/providers";
import { usePlaygroundStore } from "@/lib/store";
import { ProviderMark } from "@/components/ui/ProviderMark";

interface TypingIndicatorProps {
  providerId: ProviderId;
  modelId: string;
  hasReasoning?: boolean;
}

export function TypingIndicator({
  providerId,
  modelId,
  hasReasoning = false,
}: TypingIndicatorProps) {
  const { stopStreaming } = usePlaygroundStore();
  const provider = getProvider(providerId);
  const model = getModel(providerId, modelId);

  // Live timer showing elapsed seconds
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const interval = setInterval(() => {
      setElapsedSeconds(Math.round(((performance.now() - start) / 1000) * 10) / 10);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-3 py-3 animate-in fade-in duration-200">
      {/* Animated Provider Avatar */}
      <div className="relative shrink-0">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center border border-white/10 bg-[#160d09] shadow-sm relative z-10">
          <ProviderMark providerId={providerId} modelId={modelId} label={provider.shortLabel} className="h-4 w-4" />
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header with Provider, Model & Status */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-foreground">{provider.label}</span>
          <span className="rounded-full bg-surface-2 border border-border px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
            {model.name}
          </span>
          <div className="flex items-center gap-1.5 rounded-full bg-[#ff5722]/15 border border-[#ff5722]/30 px-2 py-0.5 text-[10px] font-mono text-[#ff8a50]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff5722] animate-pulse" />
            <span className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              {hasReasoning ? "Reasoning deliberation trace" : "Streaming response"} • {elapsedSeconds.toFixed(1)}s
            </span>
          </div>

          {/* Quick stop generation button */}
          <button
            onClick={stopStreaming}
            className="ml-auto inline-flex items-center gap-1 rounded-md bg-surface-2 border border-border hover:border-red-500/50 hover:bg-red-950/20 hover:text-red-300 px-2.5 py-0.5 text-[11px] text-muted-foreground transition-colors focus-visible:ring-1 focus-visible:ring-red-500"
            title="Stop generation"
            aria-label="Stop generation"
          >
            <Square className="h-2.5 w-2.5 fill-current text-red-400" />
            <span>Stop</span>
          </button>
        </div>

        {/* Texting Bouncing Dots + Skeleton */}
        <div className="rounded-xl bg-[#140d0a] border border-white/10 p-3.5 space-y-2.5 max-w-sm shadow-sm">
          {/* 3 Bouncing Texting Dots */}
          <div className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full animate-bounce [animation-delay:-0.32s]"
              style={{ backgroundColor: provider.color }}
            />
            <span
              className="h-2 w-2 rounded-full animate-bounce [animation-delay:-0.16s]"
              style={{ backgroundColor: `${provider.color}bb` }}
            />
            <span
              className="h-2 w-2 rounded-full animate-bounce"
              style={{ backgroundColor: `${provider.color}77` }}
            />
            <span className="text-xs text-muted-foreground font-medium ml-2">
              Streaming hardware tokens...
            </span>
          </div>

          {/* Skeleton lines */}
          <div className="space-y-1.5 pt-0.5">
            <div className="h-2 w-[80%] rounded bg-surface-2 animate-pulse" />
            <div className="h-2 w-[55%] rounded bg-surface-2 animate-pulse [animation-delay:150ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}
