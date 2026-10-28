"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  KeyRound,
  Sliders,
  Download,
  Trash2,
  Menu,
  ChevronDown,
  ExternalLink,
  Check,
  Zap,
  Search,
  Sparkles,
  Cpu,
  Code,
  Bolt,
  X,
} from "lucide-react";
import { usePlaygroundStore } from "@/lib/store";
import {
  getAllProviders,
  getProvider,
  getModel,
  subscribeToDynamicModels,
} from "@/lib/providers";
import { ProviderId, ModelInfo } from "@/lib/types";

export function Navbar() {
  const {
    currentSessionId,
    sessions,
    setProviderAndModel,
    clearCurrentSession,
    exportCurrentSession,
    keyStatusMap,
    setKeyVaultOpen,
    setSettingsOpen,
    setApiDirectoryOpen,
    isSidebarOpen,
    setSidebarOpen,
    settings,
  } = usePlaygroundStore();

  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [syncedVersion, setSyncedVersion] = useState(0);
  const selectorRef = useRef<HTMLDivElement>(null);

  // Subscribe to dynamic model updates
  useEffect(() => {
    return subscribeToDynamicModels(() => {
      setSyncedVersion((v) => v + 1);
    });
  }, []);

  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const providerId = currentSession?.providerId || "groq";
  const modelId = currentSession?.modelId || "openai/gpt-oss-120b";

  const provider = getProvider(providerId);
  const model = getModel(providerId, modelId);
  const hasKey = keyStatusMap[providerId] || providerId === "custom-openai-compatible";

  // Count configured keys
  const configuredKeysCount = Object.entries(keyStatusMap).filter(
    ([k, v]) => v && k !== "custom-openai-compatible"
  ).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsModelSelectorOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter models dynamically based on all providers (including synced models)
  const filteredProviders = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const all = getAllProviders();

    return all
      .map((prov) => {
        const matchingModels = prov.models.filter((m) => {
          const matchesQuery =
            !query ||
            m.name.toLowerCase().includes(query) ||
            m.id.toLowerCase().includes(query) ||
            m.description.toLowerCase().includes(query) ||
            prov.label.toLowerCase().includes(query);

          const matchesCategory =
            selectedCategory === "all" ||
            (selectedCategory === "reasoning" && m.isReasoning) ||
            (selectedCategory === "coding" && m.category === "coding") ||
            (selectedCategory === "fast" && m.category === "fast") ||
            selectedCategory === prov.id;

          return matchesQuery && matchesCategory;
        });

        return {
          ...prov,
          models: matchingModels,
        };
      })
      .filter((prov) => prov.models.length > 0);
  }, [searchQuery, selectedCategory, syncedVersion]);

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-zinc-800/80 bg-zinc-950/85 px-3 sm:px-4 backdrop-blur-md">
      {/* Left side: Hamburger toggle + Model selector */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-200 transition-colors shrink-0"
          title="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Model Selector Dropdown */}
        <div className="relative min-w-0" ref={selectorRef}>
          <button
            onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
            className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700 transition-all shadow-sm max-w-[200px] sm:max-w-[320px] truncate"
          >
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: provider.color }}
            />
            <span className="font-semibold text-zinc-100 shrink-0">{provider.shortLabel}</span>
            <span className="text-zinc-500 font-normal shrink-0">/</span>
            <span className="font-mono text-zinc-300 truncate">
              {model.name}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400 shrink-0 ml-0.5" />
          </button>

          {/* Model Selector Popover Menu */}
          {isModelSelectorOpen && (
            <div className="fixed sm:absolute left-2 right-2 sm:left-0 sm:right-auto top-16 sm:top-auto sm:mt-2 w-auto sm:w-[420px] rounded-2xl border border-zinc-800 bg-[#121215] shadow-2xl backdrop-blur-2xl z-50 max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header & Search */}
              <div className="p-3 border-b border-zinc-800/80 space-y-2.5 bg-zinc-950/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                    <span>Select Model</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsModelSelectorOpen(false);
                        setApiDirectoryOpen(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[11px] transition-colors"
                    >
                      <span>Get Keys ↗</span>
                    </button>
                    <button
                      onClick={() => setIsModelSelectorOpen(false)}
                      className="text-zinc-400 hover:text-zinc-200 sm:hidden p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 40+ models (e.g. R1, Claude, Flash, Groq)..."
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-2 text-zinc-500 hover:text-zinc-300"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-[11px]">
                  {[
                    { id: "all", label: "All" },
                    { id: "reasoning", label: "Reasoning 🧠" },
                    { id: "coding", label: "Coding 💻" },
                    { id: "fast", label: "Fast ⚡" },
                    { id: "openai", label: "OpenAI" },
                    { id: "anthropic", label: "Claude" },
                    { id: "gemini", label: "Gemini" },
                    { id: "deepseek", label: "DeepSeek" },
                    { id: "groq", label: "Groq" },
                    { id: "openrouter", label: "OpenRouter" },
                    { id: "together", label: "Together" },
                    { id: "mistral", label: "Mistral" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedCategory(tab.id)}
                      className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                        selectedCategory === tab.id
                          ? "bg-blue-600 text-white font-medium shadow-sm"
                          : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtered Models List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-3">
                {filteredProviders.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500">
                    No models match &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  filteredProviders.map((prov) => {
                    const provKeyActive =
                      keyStatusMap[prov.id] || prov.id === "custom-openai-compatible";

                    return (
                      <div key={prov.id} className="space-y-1">
                        <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: prov.color }}
                            />
                            <span>{prov.label}</span>
                          </div>
                          {provKeyActive ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-zinc-400 font-mono">
                                {prov.models.length} models
                              </span>
                              <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                                <Check className="h-2.5 w-2.5" /> Ready
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsModelSelectorOpen(false);
                                setKeyVaultOpen(true, prov.id);
                              }}
                              className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
                            >
                              <span>Enter Key</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-1">
                          {prov.models.map((m: ModelInfo) => {
                            const isSelected =
                              prov.id === providerId && m.id === modelId;

                            return (
                              <button
                                key={m.id}
                                onClick={() => {
                                  setProviderAndModel(prov.id as ProviderId, m.id);
                                  setIsModelSelectorOpen(false);
                                }}
                                className={`flex items-start justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-colors ${
                                  isSelected
                                    ? "bg-blue-600/20 border border-blue-500/40 text-blue-200"
                                    : "hover:bg-zinc-800/60 text-zinc-300 border border-transparent"
                                }`}
                              >
                                <div className="space-y-0.5 min-w-0 pr-2">
                                  <div className="flex items-center gap-1.5 font-medium flex-wrap">
                                    <span className="text-zinc-100">{m.name}</span>
                                    {m.isAccountModel && (
                                      <span className="rounded bg-blue-950/80 border border-blue-800/60 px-1 py-0.2 text-[9px] font-mono text-blue-300 flex items-center gap-0.5">
                                        <Sparkles className="h-2.5 w-2.5" /> Key Verified
                                      </span>
                                    )}
                                    {m.isReasoning && (
                                      <span className="rounded bg-purple-950/80 border border-purple-800/60 px-1 py-0.2 text-[9px] font-mono text-purple-300 flex items-center gap-0.5">
                                        <Cpu className="h-2.5 w-2.5" /> Thinking
                                      </span>
                                    )}
                                    {m.category === "coding" && (
                                      <span className="rounded bg-emerald-950/80 border border-emerald-800/60 px-1 py-0.2 text-[9px] font-mono text-emerald-300 flex items-center gap-0.5">
                                        <Code className="h-2.5 w-2.5" /> Code
                                      </span>
                                    )}
                                    {m.category === "fast" && (
                                      <span className="rounded bg-amber-950/80 border border-amber-800/60 px-1 py-0.2 text-[9px] font-mono text-amber-300 flex items-center gap-0.5">
                                        <Bolt className="h-2.5 w-2.5" /> Fast
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-zinc-400 line-clamp-1">
                                    {m.description}
                                  </p>
                                </div>
                                {isSelected && (
                                  <Check className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Proxy Active Indicator */}
        {settings.useProxy && (
          <span
            title="Stateless Proxy mode active for CORS resilience"
            className="hidden lg:inline-flex items-center gap-1 rounded-full bg-blue-950/60 border border-blue-800/40 px-2 py-0.5 text-[10px] font-mono text-blue-400"
          >
            <Zap className="h-2.5 w-2.5 fill-current" />
            Proxy On
          </span>
        )}

        {/* API Keys Vault Trigger */}
        <button
          onClick={() => setKeyVaultOpen(true)}
          className={`flex items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-all shadow-sm ${
            hasKey
              ? "border-zinc-800 bg-zinc-900/80 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700"
              : "border-amber-500/50 bg-amber-950/30 text-amber-300 hover:bg-amber-950/50 animate-pulse"
          }`}
          title="BYOK Vault - Manage encrypted API keys"
        >
          <KeyRound className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="hidden sm:inline">Keys</span>
          <span className="rounded-full bg-zinc-800 px-1.5 py-0.2 text-[10px] font-mono text-zinc-300">
            {configuredKeysCount}/8
          </span>
        </button>

        {/* Parameters & Prompt Trigger */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 transition-colors"
          title="Model Parameters & System Prompt"
        >
          <Sliders className="h-3.5 w-3.5" />
        </button>

        {/* Export Chat */}
        <button
          onClick={() => exportCurrentSession("markdown")}
          className="hidden md:flex rounded-xl border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 transition-colors"
          title="Export chat as Markdown"
        >
          <Download className="h-3.5 w-3.5" />
        </button>

        {/* Clear Chat */}
        <button
          onClick={() => {
            if (confirm("Clear all messages in the current session?")) {
              clearCurrentSession();
            }
          }}
          className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-400 hover:text-red-400 hover:bg-red-950/30 hover:border-red-900/40 transition-colors"
          title="Clear current session messages"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
