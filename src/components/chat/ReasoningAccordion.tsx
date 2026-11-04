"use client";

import React, { useState } from "react";
import { BrainCircuit, ChevronDown, ChevronRight, Copy, Check } from "lucide-react";

interface ReasoningAccordionProps {
  reasoning: string;
  isStreaming?: boolean;
}

export function ReasoningAccordion({
  reasoning,
  isStreaming = false,
}: ReasoningAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!reasoning) return null;

  const copyReasoning = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(reasoning);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="my-3 rounded-xl border border-amber-900/40 bg-[#180e0a]/90 overflow-hidden text-xs transition-all shadow-md">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer select-none bg-[#20130d]/80 hover:bg-[#281810] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ff5722]"
      >
        <div className="flex items-center gap-2 text-[#ff8a50] font-medium">
          <BrainCircuit className="h-3.5 w-3.5 text-[#ff5722] shrink-0" />
          <span className="font-semibold text-[#faf5ef]">
            {isStreaming ? "Thinking deliberation in progress..." : "Deliberation Trace"}
          </span>
          {isStreaming && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff5722] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff5722]"></span>
            </span>
          )}
          <span className="text-[11px] text-[#a8998e] font-mono">
            ({reasoning.length} chars)
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[#c2b2a6]">
          <button
            onClick={copyReasoning}
            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 hover:text-white transition-colors"
            title="Copy reasoning trace"
            aria-label="Copy reasoning content"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            <span className="text-[10px] font-mono">{copied ? "Copied" : "Copy"}</span>
          </button>
          <span className="p-0.5 text-[#ff8a50]">
            {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="p-3.5 border-t border-amber-950/40 font-mono text-[12px] leading-relaxed text-[#ddd0c6] whitespace-pre-wrap max-h-72 overflow-y-auto bg-[#0d0705]">
          {reasoning}
        </div>
      )}
    </div>
  );
}
