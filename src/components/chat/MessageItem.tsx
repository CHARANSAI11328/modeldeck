"use client";

import React, { useState } from "react";
import {
  User,
  Copy,
  Check,
  Zap,
  Cpu,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { ChatMessage, ProviderId } from "@/lib/types";
import { getProvider, getModel } from "@/lib/providers";
import { ProviderMark } from "@/components/ui/ProviderMark";
import { MarkdownRenderer } from "@/components/chat/MarkdownRenderer";
import { ReasoningAccordion } from "@/components/chat/ReasoningAccordion";

interface MessageItemProps {
  message: ChatMessage;
  providerId?: ProviderId;
  modelId?: string;
  onRetry?: () => void;
  isStreaming?: boolean;
}

export function MessageItem({
  message,
  providerId: propProviderId,
  modelId: propModelId,
  onRetry,
  isStreaming = false,
}: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === "assistant";
  const providerId = (propProviderId || "openai") as ProviderId;
  const modelId = propModelId || "gpt-4o";

  const provider = getProvider(providerId);
  const model = getModel(providerId, modelId);

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (!isAssistant) {
    // User prompt turn: Refined Double-Bezel Prompt Card
    return (
      <div className="flex justify-end py-2 sm:py-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="prompt-card w-full max-w-2xl overflow-hidden p-4 sm:p-5 relative bg-[#140d0a] border border-white/10 rounded-2xl shadow-xl">
          {/* Warm ember left rail */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#ff5722] via-[#ea580c] to-[#f59e0b]" />

          {/* Prompt Header */}
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-[#ff5722] to-[#ea580c] text-white shadow-sm shadow-[#ff5722]/30">
                <User className="h-3.5 w-3.5" />
              </div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#ff8a50]">
                You
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                Prompt
              </span>
            </div>

            <button
              onClick={copyContent}
              className="btn-tactile flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-surface-2 px-2.5 py-1"
              title="Copy prompt text"
              aria-label="Copy prompt text"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Prompt Body */}
          <div className="whitespace-pre-wrap text-[15px] font-medium leading-relaxed select-text text-foreground pl-1">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  // Assistant message turn: Executive Intelligence Deck with Double-Bezel
  return (
    <div className={`response-deck my-3 p-4 sm:p-6 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 bg-[#140d0a] border border-white/10 rounded-2xl shadow-xl ${isStreaming ? "streaming-deck" : ""}`}>
      {/* Top HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 mb-3.5 border-b border-border/80">
        <div className="flex flex-wrap items-center gap-2">
          {/* Provider Mark Badge */}
          <div className="flex items-center gap-2 rounded-xl bg-surface-2 border border-border px-2.5 py-1 shadow-sm">
            <ProviderMark providerId={providerId} modelId={modelId} label={provider.shortLabel} className="h-4 w-4 shrink-0" />
            <span className="font-bold text-xs text-foreground tracking-tight">{provider.label}</span>
          </div>

          {/* Model Identifier Chip */}
          <span className="rounded-xl bg-[#ff5722]/15 border border-[#ff5722]/30 px-2.5 py-1 text-xs font-mono font-semibold text-[#ff8a50]">
            {model.name}
          </span>

          {/* Real-time Telemetry Pills */}
          {message.stats && (
            <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums text-muted-foreground">
              {message.stats.ttftMs !== undefined && (
                <span className="flex items-center gap-1 rounded-lg bg-surface-2 px-2 py-0.5 border border-border" title="Time to First Token">
                  <Zap className="h-3 w-3 text-amber-500" />
                  <span>{message.stats.ttftMs}ms</span>
                </span>
              )}
              {message.stats.tokensPerSec !== undefined && message.stats.tokensPerSec > 0 && (
                <span className="flex items-center gap-1 rounded-lg bg-surface-2 px-2 py-0.5 border border-border text-[#ff8a50]" title="Streaming Speed">
                  <Cpu className="h-3 w-3 text-[#ff7043]" />
                  <span>{message.stats.tokensPerSec} tok/s</span>
                </span>
              )}
              {message.stats.tokenCount !== undefined && (
                <span className="hidden sm:inline text-muted-foreground">
                  ~{message.stats.tokenCount} tok
                </span>
              )}
            </div>
          )}

          {message.error && (
            <span className="flex items-center gap-1 text-[11px] text-red-500 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-lg font-semibold">
              <AlertTriangle className="h-3 w-3" />
              Interrupted
            </span>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1.5">
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn-tactile flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors border border-transparent hover:border-border"
              title="Regenerate this response"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-medium">Retry</span>
            </button>
          )}

          <button
            onClick={copyContent}
            className="btn-tactile flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors border border-transparent hover:border-border"
            title="Copy response markdown"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span className="hidden sm:inline font-medium">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Reasoning Deliberation Trace (if available) */}
      {message.reasoningContent && (
        <ReasoningAccordion
          reasoning={message.reasoningContent}
          isStreaming={isStreaming && !message.content}
        />
      )}

      {/* Assistant Completion Content with Markdown Rendering */}
      <div className="text-[15px] leading-relaxed text-foreground select-text min-h-[1.5rem] prose-pre:my-2">
        <MarkdownRenderer
          content={message.content}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}
