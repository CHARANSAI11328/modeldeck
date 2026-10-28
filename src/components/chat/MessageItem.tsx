"use client";

import React, { useState } from "react";
import { Copy, Check, RefreshCw, Bot, User, Sparkles, AlertTriangle } from "lucide-react";
import { ChatMessage, ProviderId } from "@/lib/types";
import { getProvider, getModel } from "@/lib/providers";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ReasoningAccordion } from "./ReasoningAccordion";

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
    // User message bubble
    return (
      <div className="flex justify-end py-2">
        <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl bg-zinc-800/90 border border-zinc-700/60 px-4 py-3 text-zinc-100 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-1 text-[11px] text-zinc-400 font-medium">
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3 text-zinc-400" />
              <span>You</span>
            </div>
            <button
              onClick={copyContent}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
              title="Copy prompt"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
          <div className="whitespace-pre-wrap text-[14.5px] leading-relaxed select-text">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  // Assistant message turn
  return (
    <div className="flex gap-3 py-3 group">
      {/* Provider avatar */}
      <div
        className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border border-zinc-800 shadow-inner"
        style={{ backgroundColor: `${provider.color}15`, borderColor: `${provider.color}40` }}
      >
        {provider.id === "gemini" ? (
          <Sparkles className="h-4 w-4" style={{ color: provider.color }} />
        ) : (
          <Bot className="h-4 w-4" style={{ color: provider.color }} />
        )}
      </div>

      {/* Main message content container */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header with model badge and metrics */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-zinc-200">{provider.label}</span>
          <span className="rounded-full bg-zinc-800/90 border border-zinc-700/50 px-2 py-0.5 text-[11px] font-mono text-zinc-400">
            {model.name}
          </span>

          {/* Performance telemetry (TTFT & speed) */}
          {message.stats && (
            <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
              {message.stats.ttftMs !== undefined && (
                <span title="Time to First Token">TTFT: {message.stats.ttftMs}ms</span>
              )}
              {message.stats.tokensPerSec !== undefined && message.stats.tokensPerSec > 0 && (
                <span title="Generation speed">• {message.stats.tokensPerSec} tok/s</span>
              )}
              {message.stats.tokenCount !== undefined && (
                <span title="Approximate token count">• ~{message.stats.tokenCount} tokens</span>
              )}
            </div>
          )}

          {message.error && (
            <span className="flex items-center gap-1 text-[11px] text-red-400 bg-red-950/40 border border-red-900/50 px-2 py-0.5 rounded-full">
              <AlertTriangle className="h-3 w-3" />
              Interrupted
            </span>
          )}
        </div>

        {/* Thinking / Reasoning trace if present */}
        {message.reasoningContent && (
          <ReasoningAccordion reasoning={message.reasoningContent} isStreaming={isStreaming} />
        )}

        {/* Markdown Rendered Content */}
        <div className="text-zinc-200 selection:bg-blue-600/30 selection:text-white">
          <MarkdownRenderer content={message.content} isStreaming={isStreaming} />
        </div>

        {/* Turn actions (copy, retry) */}
        {!isStreaming && (
          <div className="flex items-center gap-2 pt-1 text-xs text-zinc-500 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={copyContent}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-zinc-800/70 hover:text-zinc-300 transition-colors"
              title="Copy response markdown"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-zinc-800/70 hover:text-zinc-300 transition-colors"
                title="Regenerate this response"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
