"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  KeyRound,
  ShieldCheck,
  ExternalLink,
  ChevronLeft,
  BookOpen,
  X,
  Bot,
  Sparkles,
} from "lucide-react";
import { usePlaygroundStore } from "@/lib/store";
import { getProvider } from "@/lib/providers";
import { ProviderMark } from "@/components/ui/ProviderMark";

export function Sidebar() {
  const {
    sessions,
    currentSessionId,
    createNewSession,
    switchSession,
    deleteSession,
    isSidebarOpen,
    setSidebarOpen,
    setKeyVaultOpen,
    setApiDirectoryOpen,
  } = usePlaygroundStore();

  // On initial mobile load, default sidebar to closed so the chat is visible
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [setSidebarOpen]);

  if (!isSidebarOpen) return null;

  return (
    <>
      {/* Mobile Backdrop overlay */}
      <div
        onClick={() => setSidebarOpen(false)}
        className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
        aria-hidden="true"
      />

      <aside className="fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-[300px] flex-col border-r border-amber-950/40 bg-[#120a07]/90 backdrop-blur-xl md:static md:w-72 md:h-full md:z-auto md:shrink-0 shadow-2xl md:shadow-none transition-transform animate-in slide-in-from-left duration-200 ease-out">
        {/* Header with New Chat & Collapse */}
        <div className="flex h-14 items-center justify-between border-b border-border/80 px-4">
          <div className="flex items-center gap-2.5 font-semibold text-sm text-foreground tracking-tight">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff5722] to-[#ea580c] text-[#1a0a04] font-bold text-xs shadow-md shadow-[#ff5722]/20">
              MD
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-foreground leading-none">ModelDeck</span>
              <span className="text-[10px] text-muted-foreground font-mono tracking-tight leading-none mt-1">BYOK Playground</span>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="btn-tactile rounded-lg p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors"
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <ChevronLeft className="hidden md:block h-4 w-4" />
            <X className="md:hidden h-4 w-4" />
          </button>
        </div>

        {/* New Chat Button with Button-in-Button Trailing Island */}
        <div className="p-3">
          <button
            onClick={() => {
              createNewSession();
              if (typeof window !== "undefined" && window.innerWidth < 768) {
                setSidebarOpen(false);
              }
            }}
            className="btn-tactile group flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-[#ff5722] to-[#ea580c] hover:from-[#ff6b35] hover:to-[#f97316] py-2.5 px-3.5 text-xs font-bold text-[#1a0a04] shadow-lg shadow-[#ff5722]/25 transition-all"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>New Chat Session</span>
            </div>
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="h-2.5 w-2.5" />
            </div>
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>Sessions</span>
            <span className="font-mono tabular-nums text-[10px]">{sessions.length}</span>
          </div>

          {sessions.map((session) => {
            const isSelected = session.id === currentSessionId;
            const provider = getProvider(session.providerId);

            return (
              <div
                key={session.id}
                role="button"
                tabIndex={0}
                aria-label={`Select session: ${session.title}`}
                onClick={() => {
                  switchSession(session.id);
                  if (typeof window !== "undefined" && window.innerWidth < 768) {
                    setSidebarOpen(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    switchSession(session.id);
                    if (typeof window !== "undefined" && window.innerWidth < 768) {
                      setSidebarOpen(false);
                    }
                  }
                }}
                className={`btn-tactile group flex items-center justify-between rounded-xl px-2.5 py-2.5 text-xs cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ff5722] ${
                  isSelected
                    ? "bg-[#ff5722]/15 border-l-2 border-[#ff5722] text-[#faf5ef] font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-surface-2/70 hover:text-foreground border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <ProviderMark providerId={session.providerId} modelId={session.modelId} label={provider.shortLabel} className="h-4 w-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px]">{session.title}</p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">
                      {provider.shortLabel} • {session.modelId}
                    </p>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (sessions.length > 1) {
                      deleteSession(session.id);
                    }
                  }}
                  disabled={sessions.length <= 1}
                  className={`rounded-lg p-1 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors ${
                    sessions.length <= 1 ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100"
                  }`}
                  title="Delete chat session"
                  aria-label="Delete chat session"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer with Quick Actions */}
        <div className="p-3 border-t border-border/80 space-y-2 bg-surface-2/40">
          <Link
            href="/studio"
            className="btn-tactile flex items-center justify-between w-full px-3 py-2 rounded-xl border border-amber-900/40 bg-[#1c110d] text-xs font-semibold text-[#ff8a50] hover:bg-[#281711] transition-all shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-[#ff5722]" />
              <span>Assistant Studio</span>
            </div>
            <span className="rounded bg-[#ff5722]/15 px-1 py-0.2 text-[9px] font-mono">1-CLICK</span>
          </Link>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={() => setKeyVaultOpen(true)}
              className="btn-tactile flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-surface-1 text-xs text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-all"
            >
              <KeyRound className="h-3 w-3 text-amber-500" />
              <span className="text-[11px] font-medium">BYOK Vault</span>
            </button>

            <button
              onClick={() => setApiDirectoryOpen(true)}
              className="btn-tactile flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-surface-1 text-xs text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-all"
            >
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              <span className="text-[11px] font-medium">Keys Guide</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
