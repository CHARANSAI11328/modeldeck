"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Brain, Copy, Check } from "lucide-react";

interface ReasoningAccordionProps {
  reasoning: string;
  isStreaming?: boolean;
}

export function ReasoningAccordion({ reasoning, isStreaming }: ReasoningAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!reasoning.trim()) return null;

  const copyReasoning = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(reasoning);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="my-2.5 rounded-lg border border-purple-900/40 bg-purple-950/15 overflow-hidden text-xs transition-colors">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-3 py-2 cursor-pointer select-none bg-purple-950/25 hover:bg-purple-900/30 transition-colors"
      >
        <div className="flex items-center gap-2 text-purple-300 font-medium">
          <Brain className="h-3.5 w-3.5 text-purple-400" />
          <span>Thinking Process</span>
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

        <div className="flex items-center gap-1.5 text-purple-300/70">
          <button
            onClick={copyReasoning}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-purple-900/40 hover:text-purple-200 transition-colors"
            title="Copy thinking trace"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
          {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-3 border-t border-purple-900/30 font-mono text-[12px] leading-relaxed text-purple-200/90 whitespace-pre-wrap max-h-80 overflow-y-auto bg-black/30">
          {reasoning}
        </div>
      )}
    </div>
  );
}
