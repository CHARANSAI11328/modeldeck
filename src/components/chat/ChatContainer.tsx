"use client";

import React, { useEffect, useRef } from "react";
import { usePlaygroundStore } from "@/lib/store";
import { MessageItem } from "./MessageItem";
import { EmptyChatState } from "./EmptyChatState";
import { ErrorBanner } from "./ErrorBanner";
import { TypingIndicator } from "./TypingIndicator";
import { ChatMessage } from "@/lib/types";

export function ChatContainer() {
  const {
    currentSessionId,
    sessions,
    isStreaming,
    streamingContent,
    streamingReasoning,
    streamingTtft,
    error,
    dismissError,
    retryLastMessage,
  } = usePlaygroundStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentSession = sessions.find((s) => s.id === currentSessionId);

  const messages = currentSession?.messages || [];
  const providerId = currentSession?.providerId || "groq";
  const modelId = currentSession?.modelId || "openai/gpt-oss-120b";

  // Auto-scroll to bottom on streaming content or new messages
  useEffect(() => {
    if (messages.length === 0 && !isStreaming) return;
    messagesEndRef.current?.scrollIntoView({ behavior: isStreaming ? "auto" : "smooth" });
  }, [messages.length, streamingContent, streamingReasoning, isStreaming]);

  // Construct active streaming dummy message
  const activeStreamingMessage: ChatMessage | null =
    isStreaming && (streamingContent || streamingReasoning)
      ? {
          id: "active-streaming-msg",
          role: "assistant",
          content: streamingContent,
          reasoningContent: streamingReasoning || undefined,
          timestamp: Date.now(),
          stats: {
            ttftMs: streamingTtft || undefined,
          },
        }
      : null;

  return (
    <div className="deck-chat-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 sm:px-4 py-4 sm:py-6 scroll-smooth" aria-label="Conversation">
      <div className="mx-auto max-w-3xl space-y-4">
        {/* Error Banner if error is active */}
        {error && (
          <ErrorBanner
            error={error}
            onDismiss={dismissError}
            onRetry={retryLastMessage}
            currentProviderId={providerId}
          />
        )}

        {/* Empty state when no messages */}
        {messages.length === 0 && !isStreaming && (
          <EmptyChatState providerId={providerId} modelId={modelId} />
        )}

        {/* History Message list */}
        {messages.map((msg, index) => (
          <MessageItem
            key={msg.id || index}
            message={msg}
            providerId={providerId}
            modelId={modelId}
            onRetry={
              index === messages.length - 1 && msg.role === "assistant"
                ? retryLastMessage
                : undefined
            }
          />
        ))}

        {/* Active streaming message in flight */}
        {activeStreamingMessage && (
          <MessageItem
            message={activeStreamingMessage}
            providerId={providerId}
            modelId={modelId}
            isStreaming={true}
          />
        )}

        {/* Texting animation when waiting for first token or when reply is delayed */}
        {isStreaming && !activeStreamingMessage && (
          <TypingIndicator providerId={providerId} modelId={modelId} />
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>
    </div>
  );
}
