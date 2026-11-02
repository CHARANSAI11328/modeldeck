"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, BrainCircuit, Copy, Check, Sparkles } from "lucide-react";

interface ReasoningAccordionProps {
  reasoning: string;
  isStreaming?: boolean;
}

export function ReasoningAccordion({ reasoning, isStreaming }: ReasoningAccordionProps) {
  // If streaming, open by default so user can observe reasoning tokens live
  const [isOpen, setIsOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isStreaming) {
      setIsOpen(true);
    }
  }, [isStreaming]);

  if (!reasoning || !reasoning.trim()) return null;

  const copyReasoning = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(reasoning);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="my-2.5 rounded-lg border border-purple-900/30 bg-purple-950/10 overflow-hidden text-xs transition-all shadow-sm">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="flex items-center justify-between px-3 py-2 cursor-pointer select-none bg-purple-950/20 hover:bg-purple-900/25 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500"
      >
        <div className="flex items-center gap-2 text-purple-300 font-medium">
          <BrainCircuit className="h-3.5 w-3.5 text-purple-400 shrink-0" />
          <span className="font-medium text-purple-200">
            {isStreaming ? "Thinking in progress..." : "Reasoning Trace"}
          </span>
          {isStreaming && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
          )}
          <span className="text-[11px] text-purple-400/70 font-mono">
            ({reasoning.length} chars)
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-purple-300/80">
          <button
            onClick={copyReasoning}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-purple-900/40 hover:text-purple-100 transition-colors"
            title="Copy reasoning trace"
            aria-label="Copy reasoning content"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            <span className="text-[10px] font-sans font-medium">{copied ? "Copied" : "Copy"}</span>
          </button>
          <span className="p-0.5 text-purple-400">
            {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="p-3 border-t border-purple-900/20 font-mono text-[12px] leading-relaxed text-purple-200/90 whitespace-pre-wrap max-h-72 overflow-y-auto bg-black/40">
          {reasoning}
        </div>
      )}
    </div>
  );
}
