"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
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
  Bot,
} from "lucide-react";
import { usePlaygroundStore } from "@/lib/store";
import {
  getAllProviders,
  getProvider,
  getModel,
  subscribeToDynamicModels,
} from "@/lib/providers";
import { ProviderId, ModelInfo } from "@/lib/types";
import { Tooltip } from "@/components/ui/Tooltip";
import { ProviderMark } from "@/components/ui/ProviderMark";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

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

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsModelSelectorOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsModelSelectorOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
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
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border/80 bg-background/80 px-3 sm:px-5 backdrop-blur-xl text-foreground transition-colors shadow-sm">
      {/* Left side: Hamburger toggle + Model selector */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="btn-tactile rounded-lg p-2 text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-blue-500"
          title="Toggle sidebar"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Model Selector Trigger */}
        <div className="relative min-w-0" ref={selectorRef}>
          <button
            data-model-trigger
            role="combobox"
            aria-expanded={isModelSelectorOpen}
            aria-haspopup="listbox"
            aria-label="Select AI provider and model"
            onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
            className="btn-tactile flex items-center gap-1.5 sm:gap-2 rounded-xl border border-border bg-surface-1/90 hover:bg-surface-2 hover:border-zinc-700/80 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-foreground transition-all shadow-sm max-w-[150px] sm:max-w-[320px] truncate focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <ProviderMark providerId={providerId} modelId={modelId} label={provider.shortLabel} className="h-4 w-4 shrink-0" />
            <span className="font-bold text-foreground shrink-0">{provider.shortLabel}</span>
            <span className="text-muted-foreground/60 font-normal shrink-0">/</span>
            <span className="font-mono text-zinc-300 dark:text-zinc-200 truncate">
              {model.name}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-0.5" />
          </button>

          {/* Model Selector Popover Menu */}
          {isModelSelectorOpen && (
            <div className="fixed sm:absolute left-2 right-2 sm:left-0 sm:right-auto top-16 sm:top-auto sm:mt-2 w-auto sm:w-[440px] double-bezel z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="double-bezel-inner max-h-[80vh] flex flex-col overflow-hidden text-foreground">
                {/* Header & Search */}
                <div className="p-3.5 border-b border-border space-y-2.5 bg-surface-2/70">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                      <span>Select AI Model</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsModelSelectorOpen(false);
                          setApiDirectoryOpen(true);
                        }}
                        className="btn-tactile text-blue-500 hover:text-blue-400 font-semibold flex items-center gap-1 text-[11px] transition-colors"
                      >
                        <span>Get Keys ↗</span>
                      </button>
                      <button
                        onClick={() => setIsModelSelectorOpen(false)}
                        className="text-muted-foreground hover:text-foreground sm:hidden p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search 40+ models (e.g. R1, Claude, Flash, Groq)..."
                      className="w-full rounded-xl border border-border bg-surface-1 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 transition-colors"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
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
                      { id: "demonroute", label: "Demon Route" },
                      { id: "together", label: "Together" },
                      { id: "mistral", label: "Mistral" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedCategory(tab.id)}
                        className={`btn-tactile px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                          selectedCategory === tab.id
                            ? "bg-blue-600 text-white font-semibold shadow-sm"
                            : "bg-surface-1 border border-border text-foreground hover:bg-surface-3 font-medium"
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
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      No models match &quot;{searchQuery}&quot;
                    </div>
                  ) : (
                    filteredProviders.map((prov) => {
                      const provKeyActive =
                        keyStatusMap[prov.id] || prov.id === "custom-openai-compatible";

                      return (
                        <div key={prov.id} className="space-y-1">
                          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-foreground uppercase tracking-wider">
                            <div className="flex items-center gap-1.5">
                              <ProviderMark providerId={prov.id as ProviderId} label={prov.shortLabel} className="h-3.5 w-3.5" />
                              <span>{prov.label}</span>
                            </div>
                            {provKeyActive ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  {prov.models.length} models
                                </span>
                                <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
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
                                className="btn-tactile text-[10px] text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-0.5"
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
                                  className={`btn-tactile flex items-start justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-colors ${
                                    isSelected
                                      ? "bg-blue-600/15 border border-blue-500/40 text-blue-600 dark:text-blue-300"
                                      : "hover:bg-surface-2 text-foreground border border-transparent"
                                  }`}
                                >
                                  <div className="space-y-0.5 min-w-0 pr-2">
                                    <div className="flex items-center gap-1.5 font-medium flex-wrap">
                                      <ProviderMark providerId={prov.id as ProviderId} modelId={m.id} label={m.name} className="h-3.5 w-3.5 shrink-0" />
                                      <span className="text-foreground font-semibold">{m.name}</span>
                                      {m.isAccountModel && (
                                        <span className="rounded bg-blue-500/15 border border-blue-500/30 px-1 py-0.2 text-[9px] font-mono text-blue-600 dark:text-blue-300 flex items-center gap-0.5">
                                          <Sparkles className="h-2.5 w-2.5" /> Key Verified
                                        </span>
                                      )}
                                      {m.isReasoning && (
                                        <span className="rounded bg-purple-500/15 border border-purple-500/30 px-1 py-0.2 text-[9px] font-mono text-purple-600 dark:text-purple-300 flex items-center gap-0.5">
                                          <Cpu className="h-2.5 w-2.5" /> Thinking
                                        </span>
                                      )}
                                      {m.category === "coding" && (
                                        <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-1 py-0.2 text-[9px] font-mono text-emerald-600 dark:text-emerald-300 flex items-center gap-0.5">
                                          <Code className="h-2.5 w-2.5" /> Code
                                        </span>
                                      )}
                                      {m.category === "fast" && (
                                        <span className="rounded bg-amber-500/15 border border-amber-500/30 px-1 py-0.2 text-[9px] font-mono text-amber-600 dark:text-amber-300 flex items-center gap-0.5">
                                          <Bolt className="h-2.5 w-2.5" /> Fast
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                                      {m.description}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <Check className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
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
            </div>
          )}
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Proxy Active Indicator */}
        {settings.useProxy && (
          <Tooltip
            side="bottom"
            content={
              <div className="space-y-1 text-left">
                <div className="font-semibold text-foreground flex items-center gap-1">
                  <Zap className="h-3 w-3 text-blue-500 fill-current" />
                  <span>Stateless Edge Proxy</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Active for CORS resilience. Requests route via stateless Next.js edge proxy with zero key storage or logging.
                </p>
              </div>
            }
          >
            <span
              tabIndex={0}
              role="status"
              aria-label="Stateless Edge Proxy Active"
              className="hidden lg:inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-mono text-blue-500 cursor-help"
            >
              <Zap className="h-2.5 w-2.5 fill-current" />
              Proxy On
            </span>
          </Tooltip>
        )}

        <ThemeToggle />

        {/* Assistant Studio Trigger */}
        <Link
          href="/studio"
          className="btn-tactile flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-300 hover:bg-blue-500/20 hover:border-blue-400 transition-all shadow-sm"
          title="Create & Embed Personalized AI Chatbot for your website"
          aria-label="Assistant Studio"
        >
          <Bot className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          <span className="hidden sm:inline">Assistant Studio</span>
          <span className="rounded bg-blue-500/20 px-1 py-0.2 text-[9px] font-mono text-blue-600 dark:text-blue-300">
            NEW
          </span>
        </Link>

        {/* API Keys Vault Trigger */}
        <Tooltip
          side="bottom"
          content={
            <div className="space-y-1 text-left">
              <div className="font-semibold text-foreground flex items-center gap-1">
                <KeyRound className="h-3 w-3 text-amber-500" />
                <span>BYOK Vault</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                {configuredKeysCount} of 8 provider keys configured. Keys are encrypted with AES-GCM-256 in local storage.
              </p>
            </div>
          }
        >
          <button
            onClick={() => setKeyVaultOpen(true)}
            aria-label={`BYOK Key Vault: ${configuredKeysCount} of 8 keys configured`}
            className={`btn-tactile flex items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all shadow-sm ${
              hasKey
                ? "border-border bg-surface-1 text-foreground hover:bg-surface-2"
                : "border-amber-500/50 bg-amber-500/15 text-amber-600 dark:text-amber-300 hover:bg-amber-500/25"
            }`}
          >
            <KeyRound className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="hidden sm:inline">Keys</span>
            <span className="rounded-md bg-surface-2 border border-border px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-foreground">
              {configuredKeysCount}/8
            </span>
          </button>
        </Tooltip>

        {/* Parameters & Prompt Trigger */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="btn-tactile rounded-xl border border-border bg-surface-1 p-2 text-foreground hover:bg-surface-2 transition-colors shadow-sm"
          title="Model Parameters & System Prompt"
          aria-label="Parameters and system prompt"
        >
          <Sliders className="h-3.5 w-3.5" />
        </button>

        {/* Export Chat */}
        <button
          onClick={() => exportCurrentSession("markdown")}
          className="btn-tactile hidden md:flex rounded-xl border border-border bg-surface-1 p-2 text-foreground hover:bg-surface-2 transition-colors shadow-sm"
          title="Export chat as Markdown"
          aria-label="Export chat"
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
          className="btn-tactile rounded-xl border border-border bg-surface-1 p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors shadow-sm"
          title="Clear current session messages"
          aria-label="Clear chat session"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
