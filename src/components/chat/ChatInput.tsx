"use client";
import React, { useState, useRef, useEffect } from "react";
import { DeckIcon } from "@/components/ui/DeckIcon";
import { usePlaygroundStore } from "@/lib/store";
import { getProvider, getModel } from "@/lib/providers";
import { ProviderMark } from "@/components/ui/ProviderMark";
import { PROMPT_EVENT } from "./EmptyChatState";

export function ChatInput() {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const drafts = useRef<Record<string, string>>({});
  const {
    currentSessionId,
    sessions,
    isStreaming,
    keyStatusMap,
    sendMessage,
    stopStreaming,
    setKeyVaultOpen,
    setSettingsOpen,
  } = usePlaygroundStore();
  const previousSession = useRef(currentSessionId);
  const session = sessions.find((s) => s.id === currentSessionId);
  const providerId = session?.providerId || "groq";
  const modelId = session?.modelId || "openai/gpt-oss-120b";
  const provider = getProvider(providerId);
  const model = getModel(providerId, modelId);
  const hasKey =
    keyStatusMap[providerId] || providerId === "custom-openai-compatible";
  useEffect(() => {
    setInput(drafts.current[currentSessionId || ""] || "");
    previousSession.current = currentSessionId;
  }, [currentSessionId]);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
    drafts.current[previousSession.current || ""] = input;
  }, [input]);
  useEffect(() => {
    const fill = (event: Event) => {
      setInput((event as CustomEvent<string>).detail);
      textareaRef.current?.focus();
    };
    window.addEventListener(PROMPT_EVENT, fill);
    return () => window.removeEventListener(PROMPT_EVENT, fill);
  }, []);
  const send = () => {
    if (!input.trim() || isStreaming) return;
    if (!hasKey) {
      setKeyVaultOpen(true, providerId);
      return;
    }
    void sendMessage(input.trim());
    setInput("");
  };
  return (
    <div className="deck-composer-area">
      <div className="deck-composer-wrap">
        <div className="deck-bezel deck-composer">
          <div className="deck-core">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={`Message ${model.name}…`}
              aria-label={`Message ${model.name}`}
              rows={2}
            />
            <div className="deck-composer-tools">
              <button
                className="deck-composer-model"
                onClick={() =>
                  (
                    document.querySelector(
                      "[data-model-trigger]",
                    ) as HTMLButtonElement | null
                  )?.click()
                }
                aria-label="Change model"
              >
                <ProviderMark
                  providerId={providerId}
                  modelId={modelId}
                  className="h-4 w-4"
                />
                <span>{model.name}</span>
                <DeckIcon name="chevron" width={12} height={12} />
              </button>
              <div>
                <button
                  className="deck-icon-button"
                  title="Model settings"
                  aria-label="Model settings"
                  onClick={() => setSettingsOpen(true)}
                >
                  <DeckIcon name="layers" />
                </button>
                {isStreaming ? (
                  <button
                    className="deck-send deck-stop"
                    onClick={stopStreaming}
                    aria-label="Stop generation"
                  >
                    <DeckIcon name="stop" />
                  </button>
                ) : (
                  <button
                    className="deck-send"
                    disabled={!input.trim()}
                    onClick={send}
                    aria-label={
                      hasKey ? "Send message" : "Connect key to send message"
                    }
                    title={
                      hasKey
                        ? "Send message"
                        : `Connect ${provider.shortLabel} key; your draft will be kept`
                    }
                  >
                    <DeckIcon name="up" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="deck-composer-hint">
          <span>AI can make mistakes. Check important details.</span>
          <span>
            Enter to send <i>·</i> Shift + Enter for a new line
          </span>
        </div>
      </div>
    </div>
  );
}
