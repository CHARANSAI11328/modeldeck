"use client";

import React from "react";
import {
  Plus,
  Trash2,
  KeyRound,
  ShieldCheck,
  ExternalLink,
  ChevronLeft,
  BookOpen,
  X,
} from "lucide-react";
import { usePlaygroundStore } from "@/lib/store";
import { getProvider } from "@/lib/providers";

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

  if (!isSidebarOpen) return null;

  return (
    <>
      {/* Mobile Backdrop overlay */}
      <div
        onClick={() => setSidebarOpen(false)}
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden animate-in fade-in"
      />

      <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-800 bg-[#0c0d0f] md:static md:z-auto shadow-2xl transition-all animate-in slide-in-from-left duration-200">
        {/* Header with New Chat & Collapse */}
        <div className="flex h-14 items-center justify-between border-b border-zinc-800 px-3.5">
          <div className="flex items-center gap-2 font-semibold text-sm text-zinc-100 tracking-tight">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shadow-md">
              AI
            </div>
            <span>Testing Playground</span>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
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
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            History ({sessions.length})
          </div>

          {sessions.map((session) => {
            const isSelected = session.id === currentSessionId;
            const provider = getProvider(session.providerId);

            return (
              <div
                key={session.id}
                onClick={() => {
                  switchSession(session.id);
                  if (typeof window !== "undefined" && window.innerWidth < 768) {
                    setSidebarOpen(false);
                  }
                }}
                className={`group flex items-center justify-between rounded-xl px-2.5 py-2.5 text-xs cursor-pointer transition-all ${
                  isSelected
                    ? "bg-zinc-800/90 text-zinc-100 font-medium border border-zinc-700/60 shadow-sm"
                    : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: provider.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px]">{session.title}</p>
                    <p className="text-[10px] text-zinc-500 font-mono truncate">
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
                  className="opacity-70 sm:opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition-all rounded ml-1"
                  title="Delete session"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Directory & Security Footer */}
        <div className="p-3 border-t border-zinc-800/80 space-y-2">
          <button
            onClick={() => setApiDirectoryOpen(true)}
            className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/60 p-2.5 text-xs text-zinc-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-blue-400" />
              <span>Get API Keys Directory</span>
            </div>
            <ExternalLink className="h-3 w-3 text-zinc-500" />
          </button>

          {/* BYOK Security Status Footer */}
          <div
            onClick={() => setKeyVaultOpen(true)}
            className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-2.5 text-xs cursor-pointer hover:bg-zinc-900/60 transition-colors"
          >
            <div className="flex items-center gap-2 text-zinc-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <div>
                <div className="font-medium text-[11px] text-zinc-200">Local BYOK Vault</div>
                <div className="text-[10px] text-zinc-500 font-mono">AES-GCM-256 Protected</div>
              </div>
            </div>
            <KeyRound className="h-3.5 w-3.5 text-zinc-400" />
          </div>
        </div>
      </aside>
    </>
  );
}
