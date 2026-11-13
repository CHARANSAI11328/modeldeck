"use client";
import React, { useState } from "react";
import { ChatMessage, ProviderId } from "@/lib/types";
import { getProvider, getModel } from "@/lib/providers";
import { ProviderMark } from "@/components/ui/ProviderMark";
import { DeckIcon } from "@/components/ui/DeckIcon";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ReasoningAccordion } from "./ReasoningAccordion";

interface MessageItemProps {
  message: ChatMessage;
  providerId?: ProviderId;
  modelId?: string;
  onRetry?: () => void;
  isStreaming?: boolean;
}
export function MessageItem({
  message,
  providerId = "openai",
  modelId = "gpt-4o",
  onRetry,
  isStreaming = false,
}: MessageItemProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const assistant = message.role === "assistant";
  const provider = getProvider(providerId);
  const model = getModel(providerId, modelId);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    window.setTimeout(() => setCopyState("idle"), 2200);
  };
  return (
    <article
      className={`deck-message-shell deck-bezel ${assistant ? "is-assistant" : "is-user"}`}
      aria-label={assistant ? `${model.name} response` : "Your message"}
    >
      <div
        className={`deck-core deck-message ${assistant ? "response-deck" : "prompt-card"} ${isStreaming ? "streaming-deck" : ""}`}
      >
        <header className="deck-message-head">
          <div>
            {assistant ? (
              <ProviderMark
                providerId={providerId}
                modelId={modelId}
                label={provider.shortLabel}
                className="h-5 w-5"
              />
            ) : (
              <span className="deck-user-avatar">Y</span>
            )}
            <strong>{assistant ? model.name : "You"}</strong>
            {isStreaming && (
              <span className="deck-response-status" role="status">
                Writing…
              </span>
            )}
            {message.error && (
              <span className="deck-response-error">Response interrupted</span>
            )}
          </div>
          <button
            className="deck-message-action"
            onClick={copy}
            aria-label={assistant ? "Copy response" : "Copy prompt text"}
            title={assistant ? "Copy response" : "Copy prompt text"}
          >
            <DeckIcon
              name={copyState === "copied" ? "check" : "copy"}
              width={15}
            />
            <span aria-live="polite">
              {copyState === "copied"
                ? "Copied"
                : copyState === "failed"
                  ? "Couldn’t copy"
                  : "Copy"}
            </span>
          </button>
        </header>
        {assistant && message.reasoningContent && (
          <ReasoningAccordion
            reasoning={message.reasoningContent}
            isStreaming={isStreaming && !message.content}
          />
        )}
        <div className="deck-message-body">
          {assistant ? (
            <MarkdownRenderer
              content={message.content}
              isStreaming={isStreaming}
            />
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
        {assistant && (
          <footer className="deck-message-foot">
            <div>
              {message.stats?.ttftMs !== undefined && (
                <span title="Time until the first token">
                  {message.stats.ttftMs} ms to first token
                </span>
              )}
              {!!message.stats?.tokensPerSec && (
                <span>{message.stats.tokensPerSec} tokens/s</span>
              )}
              {message.stats?.tokenCount !== undefined && (
                <span>~{message.stats.tokenCount} tokens</span>
              )}
            </div>
            {onRetry && (
              <button
                className="deck-message-action"
                onClick={onRetry}
                aria-label="Regenerate response"
              >
                <DeckIcon name="retry" width={14} />
                Try again
              </button>
            )}
          </footer>
        )}
      </div>
    </article>
  );
}
