"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Bot, Square } from "lucide-react";
import { ProviderId } from "@/lib/types";
import { getProvider, getModel } from "@/lib/providers";
import { usePlaygroundStore } from "@/lib/store";

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

  // Live timer showing elapsed seconds while waiting for the model
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const interval = setInterval(() => {
      setElapsedSeconds(Math.round(((performance.now() - start) / 1000) * 10) / 10);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-3 py-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Animated Glowing Avatar */}
      <div className="relative shrink-0">
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center border shadow-lg relative z-10 transition-all animate-pulse"
          style={{
            backgroundColor: `${provider.color}20`,
            borderColor: `${provider.color}60`,
            boxShadow: `0 0 15px ${provider.color}30`,
          }}
        >
          {provider.id === "gemini" ? (
            <Sparkles className="h-4 w-4 animate-spin [animation-duration:3s]" style={{ color: provider.color }} />
          ) : (
            <Bot className="h-4 w-4" style={{ color: provider.color }} />
          )}
        </div>
        {/* Soft breathing pulse effect behind avatar */}
        <span
          className="absolute inset-0 rounded-lg animate-ping opacity-25"
          style={{ backgroundColor: provider.color }}
        />
      </div>

      {/* Main Container */}
      <div className="flex-1 min-w-0 space-y-2.5">
        {/* Header with Provider, Model & Status */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-zinc-200">{provider.label}</span>
          <span className="rounded-full bg-zinc-800/90 border border-zinc-700/50 px-2 py-0.5 text-[11px] font-mono text-zinc-300">
            {model.name}
          </span>
          <div className="flex items-center gap-1.5 rounded-full bg-blue-950/40 border border-blue-800/40 px-2 py-0.5 text-[10px] font-mono text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
            <span>
              {hasReasoning ? "Reasoning deep thoughts..." : "Generating reply..."}{" "}
              ({elapsedSeconds.toFixed(1)}s)
            </span>
          </div>

          {/* Quick stop generation button */}
          <button
            onClick={stopStreaming}
            className="ml-auto inline-flex items-center gap-1 rounded-md bg-zinc-900 border border-zinc-700/80 hover:border-red-500/60 hover:bg-red-950/30 hover:text-red-300 px-2 py-0.5 text-[11px] text-zinc-400 transition-colors shadow-sm"
            title="Stop generation"
          >
            <Square className="h-2.5 w-2.5 fill-current text-red-400" />
            <span>Stop</span>
          </button>
        </div>

        {/* Texting Bouncing Dots + Shimmer Skeleton */}
        <div className="rounded-2xl rounded-tl-sm bg-zinc-900/70 border border-zinc-800/90 p-4 space-y-3 max-w-md shadow-md backdrop-blur-sm">
          {/* 3 Bouncing Texting Dots */}
          <div className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.32s]"
              style={{ backgroundColor: provider.color }}
            />
            <span
              className="h-2.5 w-2.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.16s]"
              style={{ backgroundColor: `${provider.color}cc` }}
            />
            <span
              className="h-2.5 w-2.5 rounded-full bg-blue-300 animate-bounce"
              style={{ backgroundColor: `${provider.color}88` }}
            />
            <span className="text-xs text-zinc-400 font-medium ml-2 tracking-wide">
              {provider.shortLabel} is composing a response...
            </span>
          </div>

          {/* Subtle text shimmer lines simulating incoming reply text */}
          <div className="space-y-2 pt-1">
            <div className="h-2.5 w-[85%] rounded-full bg-gradient-to-r from-zinc-800 via-zinc-700/70 to-zinc-800 animate-pulse" />
            <div className="h-2.5 w-[65%] rounded-full bg-gradient-to-r from-zinc-800 via-zinc-700/50 to-zinc-800 animate-pulse [animation-delay:200ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}
