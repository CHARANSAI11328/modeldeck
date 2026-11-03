"use client";

import React, { useState } from "react";
import { Copy, Check, RefreshCw, User, AlertTriangle, Sparkles, Zap, Cpu } from "lucide-react";
import { ChatMessage, ProviderId } from "@/lib/types";
import { getProvider, getModel } from "@/lib/providers";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ReasoningAccordion } from "./ReasoningAccordion";
import { ProviderMark } from "@/components/ui/ProviderMark";

interface MessageItemProps {
  message: ChatMessage;
  providerId: ProviderId;
  modelId: string;
  isStreaming?: boolean;
  onRetry?: () => void;
}

export function MessageItem({
  message,
  providerId,
  modelId,
  isStreaming,
  onRetry,
}: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const provider = getProvider(providerId);
  const model = getModel(providerId, modelId);

  const isAssistant = message.role === "assistant";

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (!isAssistant) {
    // User prompt turn: Creative Studio Prompt Card
    return (
      <div className="flex justify-end py-2 sm:py-3">
        <div className="prompt-card w-full max-w-2xl overflow-hidden p-4 sm:p-5">
          {/* Subtle gradient left rail */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-600 via-indigo-500 to-purple-600" />

          {/* Prompt Header */}
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm">
                <User className="h-3.5 w-3.5" />
              </div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400">
                You
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                Prompt
              </span>
            </div>

            <button
              onClick={copyContent}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-surface-2 px-2 py-1"
              title="Copy prompt text"
              aria-label="Copy prompt text"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500 font-medium">Copied</span>
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

  // Assistant message turn: Executive Intelligence Deck
  return (
    <div className={`response-deck my-3 p-4 sm:p-6 overflow-hidden ${isStreaming ? "streaming-deck" : ""}`}>
      {/* Top HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 mb-3.5 border-b border-border/80">
        <div className="flex flex-wrap items-center gap-2">
          {/* Provider Mark Badge */}
          <div className="flex items-center gap-2 rounded-lg bg-surface-2 border border-border px-2.5 py-1 shadow-sm">
            <ProviderMark providerId={providerId} modelId={modelId} label={provider.shortLabel} className="h-4 w-4 shrink-0" />
            <span className="font-bold text-xs text-foreground tracking-tight">{provider.label}</span>
          </div>

          {/* Model Identifier Chip */}
          <span className="rounded-lg bg-primary/10 border border-primary/25 px-2.5 py-1 text-xs font-mono font-semibold text-primary">
            {model.name}
          </span>

          {/* Real-time Telemetry Pills */}
          {message.stats && (
            <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
              {message.stats.ttftMs !== undefined && (
                <span className="flex items-center gap-1 rounded bg-surface-2 px-1.5 py-0.5 border border-border" title="Time to First Token">
                  <Zap className="h-3 w-3 text-amber-500" />
                  <span>{message.stats.ttftMs}ms</span>
                </span>
              )}
              {message.stats.tokensPerSec !== undefined && message.stats.tokensPerSec > 0 && (
                <span className="flex items-center gap-1 rounded bg-surface-2 px-1.5 py-0.5 border border-border" title="Streaming Speed">
                  <Cpu className="h-3 w-3 text-blue-500" />
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
            <span className="flex items-center gap-1 text-[11px] text-red-500 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-md font-medium">
              <AlertTriangle className="h-3 w-3" />
              Interrupted
            </span>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
              title="Regenerate this response"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Retry</span>
            </button>
          )}

          <button
            onClick={copyContent}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
            title="Copy entire response"
            aria-label="Copy entire response"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Reasoning Trace if present */}
      {message.reasoningContent && (
        <div className="mb-4">
          <ReasoningAccordion reasoning={message.reasoningContent} isStreaming={isStreaming} />
        </div>
      )}

      {/* Streaming Initial Waiting State */}
      {isStreaming && !message.content.trim() && (
        <div className="flex items-center gap-2.5 py-3 px-2 text-xs text-muted-foreground animate-in fade-in">
          <div className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full animate-bounce [animation-delay:-0.32s]"
              style={{ backgroundColor: provider.color }}
            />
            <span
              className="h-2.5 w-2.5 rounded-full animate-bounce [animation-delay:-0.16s]"
              style={{ backgroundColor: `${provider.color}cc` }}
            />
            <span
              className="h-2.5 w-2.5 rounded-full animate-bounce"
              style={{ backgroundColor: `${provider.color}88` }}
            />
          </div>
          <span className="font-mono text-[12px] font-medium text-foreground">
            Synthesizing intelligence tokens...
          </span>
        </div>
      )}

      {/* Markdown Rendered Output */}
      {message.content.trim() ? (
        <div className="text-foreground leading-relaxed">
          <MarkdownRenderer content={message.content} isStreaming={isStreaming} />
        </div>
      ) : null}
    </div>
  );
}
