"use client";

import React, { useState } from "react";
import { X, ExternalLink, KeyRound, Sparkles, ShieldCheck, ArrowRight, Search } from "lucide-react";
import { usePlaygroundStore } from "@/lib/store";
import { PROVIDER_LIST } from "@/lib/providers";
import { ProviderId } from "@/lib/types";

interface ProviderGuide {
  id: ProviderId;
  signupTip: string;
  freeTier: string;
}

const PROVIDER_GUIDES: Record<string, ProviderGuide> = {
  openai: {
    id: "openai",
    signupTip: "Go to OpenAI Platform > API Keys > Create new secret key. Requires adding payment card or promotional balance.",
    freeTier: "Pay-as-you-go. Some new accounts receive promotional starting balance.",
  },
  anthropic: {
    id: "anthropic",
    signupTip: "Visit Anthropic Console > Settings > API Keys > Create Key. Requires prepaid credits.",
    freeTier: "$5 free credit often provided upon initial phone verification.",
  },
  gemini: {
    id: "gemini",
    signupTip: "Visit Google AI Studio > Click 'Get API Key' > Create API key in new or existing GCP project.",
    freeTier: "Generous FREE tier available for Gemini 2.5 Flash, 2.0 Flash, and 1.5 Flash (up to 15 RPM).",
  },
  deepseek: {
    id: "deepseek",
    signupTip: "Visit DeepSeek Open Platform > API Keys > Create API Key. Extremely cost-effective FP8 inference.",
    freeTier: "Free starting balance for verified accounts; very low per-million token pricing.",
  },
  groq: {
    id: "groq",
    signupTip: "Visit GroqCloud Console > API Keys > Create API Key. Instant generation without credit card.",
    freeTier: "Generous FREE tier with high rate limits for Llama 3.3 70B and DeepSeek R1 Distill.",
  },
  openrouter: {
    id: "openrouter",
    signupTip: "Visit OpenRouter > Keys > Create Key. Single key accesses 300+ AI models across all providers.",
    freeTier: "Includes access to free-tier open models (:free suffix) with 0 balance.",
  },
  demonroute: {
    id: "demonroute",
    signupTip: "Visit demonroute.com, sign in, and create a key. Standard OpenAI-compatible Bearer key; one key reaches 1,300+ open-weight models.",
    freeTier: "Prepaid (crypto or card) with a hard stop at $0. Some models are free, e.g. Dolphin 3.0 8B and Hermes 3 8B.",
  },
  together: {
    id: "together",
    signupTip: "Visit Together AI Settings > API Keys > Generate Key. Dedicated clusters for open models.",
    freeTier: "$5 in free credits for new developer signups.",
  },
  mistral: {
    id: "mistral",
    signupTip: "Visit Mistral La Plateforme > API Keys > Create a new key. Top European frontier models.",
    freeTier: "Free experimentation tier with access to Mistral Small, Codestral, and Pixtral.",
  },
  "custom-openai-compatible": {
    id: "custom-openai-compatible",
    signupTip: "Run Ollama (`ollama run llama3.3`) or vLLM locally. Default endpoint is http://localhost:11434/v1.",
    freeTier: "100% Free and private, runs on your own GPU/CPU hardware.",
  },
};

export function ApiKeyDirectoryModal() {
  const {
    isApiDirectoryOpen,
    setApiDirectoryOpen,
    setKeyVaultOpen,
    keyStatusMap,
  } = usePlaygroundStore();

  const [search, setSearch] = useState("");

  if (!isApiDirectoryOpen) return null;

  const filteredProviders = PROVIDER_LIST.filter(
    (p) =>
      !search ||
      p.label.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl border border-zinc-800 bg-[#121215] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg text-zinc-100">
                AI Provider Directory & Official API Links
              </h3>
              <p className="text-xs text-zinc-400">
                Direct redirect links to generate API credentials for every supported AI model
              </p>
            </div>
          </div>

          <button
            onClick={() => setApiDirectoryOpen(false)}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Info Banner */}
        <div className="bg-zinc-900/60 border-b border-zinc-800/80 px-4 sm:px-6 py-2.5 space-y-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter providers (e.g. OpenAI, Anthropic, Gemini, Groq, Free)..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>
              Click <strong>&quot;Get API Key ↗&quot;</strong> on any provider to open their developer portal, copy your key, and paste it into the vault.
            </span>
          </div>
        </div>

        {/* Directory Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredProviders.map((provider) => {
              const guide = PROVIDER_GUIDES[provider.id];
              const isConfigured =
                keyStatusMap[provider.id] || provider.id === "custom-openai-compatible";

              return (
                <div
                  key={provider.id}
                  className="rounded-xl border border-zinc-800/90 bg-zinc-900/40 p-4 space-y-3 hover:border-zinc-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: provider.color }}
                        />
                        <span className="font-semibold text-sm text-zinc-100">
                          {provider.label}
                        </span>
                      </div>
                      {isConfigured && (
                        <span className="rounded-full bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                          Active ✓
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {guide?.signupTip || provider.description}
                    </p>

                    {guide?.freeTier && (
                      <div className="rounded-lg bg-zinc-950/80 p-2.5 border border-zinc-800/60 text-[11px] text-zinc-400">
                        <strong className="text-zinc-300">Tier / Credits:</strong> {guide.freeTier}
                      </div>
                    )}
                  </div>

                  {/* Actions: Direct link & Configure */}
                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
                    <a
                      href={provider.getKeyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 px-3 py-2 text-xs font-semibold text-blue-300 transition-colors"
                    >
                      <span>Get API Key</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <button
                      onClick={() => {
                        setApiDirectoryOpen(false);
                        setKeyVaultOpen(true, provider.id as ProviderId);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 hover:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 transition-colors"
                    >
                      <KeyRound className="h-3 w-3 text-amber-400" />
                      <span>Vault</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-zinc-800/80 px-4 sm:px-6 py-4 bg-zinc-950/60 text-xs">
          <span className="text-zinc-500 text-center sm:text-left">
            All API calls are authenticated directly using your personal keys via BYOK.
          </span>
          <button
            onClick={() => {
              setApiDirectoryOpen(false);
              setKeyVaultOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 font-semibold text-white shadow-md transition-colors shrink-0"
          >
            <span>Open Key Vault</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
