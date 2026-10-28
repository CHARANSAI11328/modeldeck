"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Square, KeyRound, Sparkles } from "lucide-react";
import { usePlaygroundStore } from "@/lib/store";
import { getProvider, getModel } from "@/lib/providers";

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

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
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

  const charCount = input.length;
  const tokenEst = Math.round(charCount / 4);

  return (
    <div className="relative mx-auto w-full max-w-3xl px-3 sm:px-4 pb-3 sm:pb-4">
      {/* Missing Key Warning Pill (if not configured) */}
      {!hasKey && (
        <div className="mb-2 flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-950/30 px-3 py-1.5 text-xs text-amber-300 backdrop-blur-sm animate-in fade-in">
          <div className="flex items-center gap-2 truncate pr-2">
            <KeyRound className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="truncate">
              <strong>{provider.label}</strong> API key required to test.
            </span>
          </div>
          <button
            onClick={() => setKeyVaultOpen(true, providerId)}
            className="rounded-lg bg-amber-500/30 hover:bg-amber-500/40 px-2.5 py-1 text-amber-200 font-medium transition-colors shrink-0"
          >
            Enter Key ↗
          </button>
        </div>
      )}

      {/* Main Input Dock */}
      <div className="relative rounded-2xl border border-zinc-800 bg-[#121215]/95 p-2 shadow-2xl backdrop-blur-xl focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-blue-500/40 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${model.name} (${provider.shortLabel})...`}
          rows={1}
          className="w-full resize-none bg-transparent px-3 py-2 text-[14.5px] leading-relaxed text-zinc-100 placeholder-zinc-500 focus:outline-none max-h-48"
        />

        {/* Bottom controls bar inside the input dock */}
        <div className="flex items-center justify-between px-2 pt-1 border-t border-zinc-800/40 text-xs text-zinc-500">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="flex items-center gap-1 font-mono text-[11px] text-zinc-400 truncate">
              <Sparkles className="h-3 w-3 text-blue-400 shrink-0" />
              <span className="truncate">{model.name}</span>
            </span>
            {charCount > 0 && (
              <span className="hidden sm:inline font-mono text-[11px] text-zinc-500 shrink-0">
                • {charCount} chars (~{tokenEst} tok)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline text-[11px] text-zinc-500">
              {isStreaming ? "Stop stream" : "Enter to send • Shift+Enter newline"}
            </span>

            {/* Send or Stop Button */}
            {isStreaming ? (
              <button
                onClick={stopStreaming}
                className="flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-red-600 text-white shadow-md hover:bg-red-500 transition-colors"
                title="Stop generation"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </button>
            ) : (
              <button
                disabled={!input.trim()}
                onClick={handleSend}
                className="flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 transition-colors"
                title="Send message"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
