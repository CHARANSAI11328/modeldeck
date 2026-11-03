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

      <aside className="fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-[300px] flex-col border-r border-border bg-surface-1 md:static md:w-72 md:h-full md:z-auto md:shrink-0 shadow-2xl md:shadow-none transition-transform animate-in slide-in-from-left duration-200 ease-out">
        {/* Header with New Chat & Collapse */}
        <div className="flex h-14 items-center justify-between border-b border-border px-3.5">
          <div className="flex items-center gap-2.5 font-semibold text-sm text-foreground tracking-tight">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs shadow-md">
              MD
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-foreground leading-none">ModelDeck</span>
              <span className="text-[10px] text-muted-foreground font-mono tracking-tight leading-none mt-1">BYOK Playground</span>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors"
            title="Close sidebar"
          >
            <ChevronLeft className="hidden md:block h-4 w-4" />
            <X className="md:hidden h-4 w-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              createNewSession();
              // On mobile, close sidebar after starting new chat
              if (typeof window !== "undefined" && window.innerWidth < 768) {
                setSidebarOpen(false);
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 px-3 text-xs font-semibold text-white shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat Session</span>
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground0">
            History ({sessions.length})
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
                className={`group flex items-center justify-between rounded-lg px-2.5 py-2.5 text-xs cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 ${
                  isSelected
                    ? "bg-surface-2 text-foreground font-medium border border-border shadow-sm"
                    : "text-muted-foreground hover:bg-surface-2/60 hover:text-foreground border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <ProviderMark providerId={session.providerId} modelId={session.modelId} label={provider.shortLabel} className="h-4 w-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px]">{session.title}</p>
                    <p className="text-[10px] text-foreground0 font-mono truncate">
                      {provider.shortLabel} • {session.modelId}
                    </p>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className="opacity-70 sm:opacity-0 group-hover:opacity-100 p-1 text-foreground0 hover:text-red-400 transition-all rounded ml-1"
                  title="Delete session"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Directory & Security Footer */}
        <div className="p-3 border-t border-border space-y-2">
          <Link
            href="/studio"
            className="flex w-full items-center justify-between rounded-lg border border-blue-500/30 bg-blue-950/20 hover:bg-blue-900/30 p-2.5 text-xs text-blue-300 transition-colors focus-visible:ring-1 focus-visible:ring-blue-500 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-blue-400" />
              <div className="flex flex-col text-left">
                <span className="font-semibold text-[12px] leading-tight text-foreground">Assistant Studio</span>
                <span className="text-[10px] text-blue-300/80 leading-tight">Embed Chatbot on Your Site</span>
              </div>
            </div>
            <span className="rounded bg-blue-500/20 border border-blue-400/30 px-1.5 py-0.5 text-[9px] font-mono text-blue-300">
              NEW
            </span>
          </Link>

          <button
            onClick={() => setApiDirectoryOpen(true)}
            aria-label="Open API Keys Directory"
            className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-1 hover:bg-surface-2 p-2.5 text-xs text-foreground transition-colors focus-visible:ring-1 focus-visible:ring-blue-500"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-blue-400" />
              <span>Get API Keys Directory</span>
            </div>
            <ExternalLink className="h-3 w-3 text-foreground0" />
          </button>

          {/* BYOK Security Status Footer */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Open Local BYOK Key Vault"
            onClick={() => setKeyVaultOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setKeyVaultOpen(true);
              }
            }}
            className="flex items-center justify-between rounded-lg border border-border bg-surface-1/50 p-2.5 text-xs cursor-pointer hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
          >
            <div className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <div>
                <div className="font-medium text-[11px] text-foreground">Local BYOK Vault</div>
                <div className="text-[10px] text-foreground0 font-mono">AES-GCM-256 Protected</div>
              </div>
            </div>
            <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
      </aside>
    </>
  );
}
