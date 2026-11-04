"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Square, KeyRound, Sparkles, Zap, BrainCircuit, Code2, CornerDownLeft } from "lucide-react";
import { usePlaygroundStore } from "@/lib/store";
import { getProvider, getModel } from "@/lib/providers";
import { ProviderMark } from "@/components/ui/ProviderMark";

export function ChatInput() {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    currentSessionId,
    sessions,
    isStreaming,
    keyStatusMap,
    sendMessage,
    stopStreaming,
    setKeyVaultOpen,
  } = usePlaygroundStore();

  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const providerId = currentSession?.providerId || "openai";
  const modelId = currentSession?.modelId || "gpt-4o";
  const provider = getProvider(providerId);
  const model = getModel(providerId, modelId);

  const hasKey = keyStatusMap[providerId] || providerId === "custom-openai-compatible";

  // Auto-resize textarea height smoothly
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (isStreaming) {
      stopStreaming();
      return;
    }

    if (!input.trim()) return;

    const toSend = input;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    sendMessage(toSend);
  };

  const insertPromptTag = (tag: string) => {
    setInput((prev) => (prev ? `${prev} ${tag}` : tag));
    textareaRef.current?.focus();
  };

  const charCount = input.length;
  const tokenEst = Math.round(charCount / 4);

  return (
    <div className="sticky bottom-0 z-20 w-full shrink-0 bg-background/80 backdrop-blur-xl pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] border-t border-border/60">
      <div className="relative mx-auto w-full max-w-3xl px-3 sm:px-4 space-y-2">
        {/* Missing Key Warning Pill */}
        {!hasKey && (
          <div className="flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs text-amber-600 dark:text-amber-300 backdrop-blur-md animate-in fade-in shadow-sm">
            <div className="flex items-center gap-2 truncate pr-2">
              <KeyRound className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="truncate">
                <strong className="font-semibold">{provider.shortLabel}</strong> API key required to stream.
              </span>
            </div>
            <button
              onClick={() => setKeyVaultOpen(true, providerId)}
              className="btn-tactile rounded-lg bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1 text-amber-700 dark:text-amber-200 font-semibold text-xs transition-colors shrink-0"
            >
              Enter Key ↗
            </button>
          </div>
        )}

        {/* Double-Bezel Raycast-Style Floating Command Dock */}
        <div className="rounded-2xl border border-white/10 bg-[#140d0a] shadow-xl shadow-black/40">
          <div className="p-2.5 transition-all focus-within:border-[#ff5722]/60 focus-within:ring-1 focus-within:ring-[#ff5722]/30">
            {/* Quick Capability Tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 px-1">
              <button
                onClick={() => insertPromptTag("Benchmark this with detailed speed analysis and step-by-step breakdown:")}
                className="btn-tactile inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 hover:bg-surface-3 border border-border text-[11px] text-muted-foreground hover:text-foreground font-medium transition-all shrink-0"
              >
                <Zap className="h-3 w-3 text-amber-500" />
                <span>Speed Benchmark</span>
              </button>
              <button
                onClick={() => insertPromptTag("Analyze this step by step, showing all reasoning and tradeoffs:")}
                className="btn-tactile inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 hover:bg-surface-3 border border-border text-[11px] text-muted-foreground hover:text-foreground font-medium transition-all shrink-0"
              >
                <BrainCircuit className="h-3 w-3 text-indigo-500" />
                <span>Deep Reason</span>
              </button>
              <button
                onClick={() => insertPromptTag("Write production-grade, cleanly typed TypeScript code for:")}
                className="btn-tactile inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 hover:bg-surface-3 border border-border text-[11px] text-muted-foreground hover:text-foreground font-medium transition-all shrink-0"
              >
                <Code2 className="h-3 w-3 text-[#ff5722]" />
                <span>TypeScript</span>
              </button>
            </div>

            {/* Text Input Area */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${model.name} (${provider.shortLabel}) anything...`}
              aria-label={`Message ${model.name}`}
              rows={1}
              className="w-full resize-none bg-transparent px-3 py-2 text-base sm:text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none max-h-48"
            />

            {/* Bottom Dock Controls Bar */}
            <div className="flex items-center justify-between px-2 pt-2 border-t border-border/60 text-xs">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground truncate">
                  <ProviderMark providerId={providerId} modelId={modelId} label={provider.shortLabel} className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-semibold text-foreground truncate">{model.name}</span>
                </span>
                {charCount > 0 && (
                  <span className="hidden sm:inline font-mono tabular-nums text-[11px] text-muted-foreground shrink-0">
                    • {charCount} chars (~{tokenEst} tok)
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono text-muted-foreground/70 bg-surface-2 px-1.5 py-0.5 rounded border border-border">
                  <CornerDownLeft className="h-2.5 w-2.5" /> Enter
                </span>

                {isStreaming ? (
                  <button
                    onClick={stopStreaming}
                    className="btn-tactile flex items-center gap-1.5 rounded-full bg-red-500/15 border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/25 transition-all shadow-sm"
                    title="Stop generation"
                    aria-label="Stop generation"
                  >
                    <Square className="h-3 w-3 fill-current" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    aria-label="Send message"
                    className={`btn-tactile group flex items-center justify-center h-8 w-8 rounded-full transition-all shadow-sm ${
                      input.trim()
                        ? "bg-gradient-to-r from-[#ff5722] to-[#ea580c] text-[#140a06] hover:from-[#ff6b35] hover:to-[#f97316] active:scale-95 shadow-[#ff5722]/25"
                        : "bg-surface-2 text-muted-foreground/50 cursor-not-allowed border border-border"
                    }`}
                  >
                    <ArrowUp className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
