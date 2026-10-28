"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  KeyRound,
  ExternalLink,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Loader2,
  Trash2,
  Lock,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import confetti from "canvas-confetti";
import { usePlaygroundStore } from "@/lib/store";
import { PROVIDER_LIST, getProvider, setDynamicModels } from "@/lib/providers";
import { ProviderId } from "@/lib/types";
import { vault } from "@/lib/vault";
import { getAdapterForProvider } from "@/lib/adapters";
import { syncModelsForProvider } from "@/lib/modelSync";

export function KeyVaultModal() {
  const {
    isKeyVaultOpen,
    setKeyVaultOpen,
    refreshKeyStatus,
    focusedProviderForVault,
    settings,
    setProviderAndModel,
  } = usePlaygroundStore();

  const [keysInput, setKeysInput] = useState<Record<string, string>>({});
  const [showMaskMap, setShowMaskMap] = useState<Record<string, boolean>>({});
  const [testingStatus, setTestingStatus] = useState<
    Record<string, { loading: boolean; success?: boolean; message?: string; syncedCount?: number }>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  // Load existing keys into modal on open and subscribe to real-time updates across windows & devices
  useEffect(() => {
    const loadCurrentKeys = () => {
      const loaded: Record<string, string> = {};
      for (const prov of PROVIDER_LIST) {
        loaded[prov.id] = vault.getRawKey(prov.id as ProviderId);
      }
      setKeysInput(loaded);
    };

    if (isKeyVaultOpen) {
      vault.unlock().then(() => {
        loadCurrentKeys();
      });
    }

    const unsubscribe = vault.subscribeToVaultChanges(() => {
      loadCurrentKeys();
    });

    return () => {
      unsubscribe();
    };
  }, [isKeyVaultOpen]);

  if (!isKeyVaultOpen) return null;

  const handleKeyChange = (providerId: string, val: string) => {
    setKeysInput((prev) => ({ ...prev, [providerId]: val }));
    if (testingStatus[providerId]) {
      setTestingStatus((prev) => ({ ...prev, [providerId]: { loading: false } }));
    }
  };

  const toggleShowKey = (providerId: string) => {
    setShowMaskMap((prev) => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    // Batch save all keys to vault & server so all windows and devices receive updates immediately
    await vault.saveAllKeys(keysInput);

    // Auto-sync models for populated keys
    for (const [pId, keyVal] of Object.entries(keysInput)) {
      const cleanKey = keyVal.trim();
      if (cleanKey && pId !== "custom-openai-compatible") {
        try {
          const synced = await syncModelsForProvider(pId as ProviderId, cleanKey, settings);
          if (synced && synced.length > 0) {
            setDynamicModels(pId as ProviderId, synced);
          }
        } catch {
          // ignore
        }
      }
    }

    await refreshKeyStatus();
    setIsSaving(false);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // ignore
    }

    setKeyVaultOpen(false);
  };

  const handleQuickLoadKeys = async () => {
    await vault.syncWithServer();
    const loaded: Record<string, string> = { ...keysInput };
    for (const prov of PROVIDER_LIST) {
      const val = vault.getRawKey(prov.id as ProviderId);
      if (val) loaded[prov.id] = val;
    }
    setKeysInput(loaded);
    await refreshKeyStatus();

    // Automatically sync models for available verified keys
    if (loaded["groq"]) handleTestAndSyncKey("groq");
    if (loaded["gemini"]) {
      setTimeout(() => {
        handleTestAndSyncKey("gemini");
      }, 600);
    }
  };

  const handleTestAndSyncKey = async (providerId: ProviderId) => {
    const rawKey = keysInput[providerId]?.trim();
    if (!rawKey && providerId !== "custom-openai-compatible") {
      setTestingStatus((prev) => ({
        ...prev,
        [providerId]: {
          loading: false,
          success: false,
          message: "Please paste your API key first before testing.",
        },
      }));
      return;
    }

    setTestingStatus((prev) => ({
      ...prev,
      [providerId]: { loading: true },
    }));

    const providerConfig = getProvider(providerId);

    // 1. Try to sync models directly from the provider's API
    let discoveredModels: ReturnType<typeof syncModelsForProvider> extends Promise<infer U> ? U : never = [];
    try {
      discoveredModels = await syncModelsForProvider(providerId, rawKey || "", settings);
      if (discoveredModels.length > 0) {
        setDynamicModels(providerId, discoveredModels);
      }
    } catch {
      // ignore
    }

    // 2. Select best test model (prefer verified active model for this provider)
    let testModel = providerConfig.testModelId || "gpt-4o-mini";
    if (providerId === "groq") {
      const groqCandidate = discoveredModels.find(
        (m) => m.id === "openai/gpt-oss-120b" || m.id === "qwen/qwen3.8-27b"
      );
      testModel = groqCandidate ? groqCandidate.id : "openai/gpt-oss-120b";
    } else if (providerId === "gemini") {
      const geminiCandidate = discoveredModels.find(
        (m) => m.id === "gemini-3.5-flash" || m.id === "gemini-flash-latest" || m.id === "gemini-3.8-flash"
      );
      testModel = geminiCandidate ? geminiCandidate.id : "gemini-3.5-flash";
    } else if (discoveredModels.length > 0) {
      testModel = discoveredModels[0].id;
    }

    const adapter = getAdapterForProvider(providerConfig, settings.customBaseUrl);

    try {
      const result = await adapter.testConnection(rawKey || "", testModel, settings);

      if (result.success) {
        // Automatically switch active session to verified model
        setProviderAndModel(providerId, testModel);

        setTestingStatus((prev) => ({
          ...prev,
          [providerId]: {
            loading: false,
            success: true,
            syncedCount: discoveredModels.length,
            message: `Key verified successfully! (${result.latencyMs}ms)${
              discoveredModels.length > 0
                ? ` • All ${discoveredModels.length} active models synced from your key!`
                : ""
            }`,
          },
        }));

        try {
          confetti({
            particleCount: 35,
            spread: 50,
            origin: { y: 0.7 },
          });
        } catch {
          // ignore
        }
      } else {
        setTestingStatus((prev) => ({
          ...prev,
          [providerId]: {
            loading: false,
            success: false,
            message: result.message,
          },
        }));
      }
    } catch (err: unknown) {
      setTestingStatus((prev) => ({
        ...prev,
        [providerId]: {
          loading: false,
          success: false,
          message: err instanceof Error ? err.message : "Test request failed",
        },
      }));
    }
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to remove all keys from the vault across all windows and devices?")) {
      await vault.clearAll();
      setKeysInput({});
      await refreshKeyStatus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#121215] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg text-zinc-100 flex items-center gap-2 flex-wrap">
                <span>BYOK Multi-Device Key Vault</span>
                <span className="rounded-full bg-blue-950/80 border border-blue-800/60 px-2 py-0.5 text-[10px] font-mono text-blue-400">
                  Multi-Device Sync
                </span>
                <span className="hidden sm:inline-flex rounded-full bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                  Live Server Vault
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Keys sync automatically across all browser windows, tabs, and devices on your network.
              </p>
            </div>
          </div>

          <button
            onClick={() => setKeyVaultOpen(false)}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 3-Step Simple Instructions */}
        <div className="bg-zinc-900/60 border-b border-zinc-800/80 px-4 sm:px-6 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600/30 text-blue-400 font-bold text-[11px] shrink-0">
                1
              </div>
              <span className="truncate">Click <strong>&quot;Get Key ↗&quot;</strong></span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600/30 text-blue-400 font-bold text-[11px] shrink-0">
                2
              </div>
              <span className="truncate">Paste your key below</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600/30 text-blue-400 font-bold text-[11px] shrink-0">
                3
              </div>
              <span className="truncate">Click <strong>&quot;Test &amp; Sync Key&quot;</strong></span>
            </div>
          </div>

          {/* Quick Load Shortcut */}
          <div className="mt-2.5 pt-2.5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-zinc-400">
              Tested keys available for Groq &amp; Gemini?
            </span>
            <button
              type="button"
              onClick={handleQuickLoadKeys}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600/20 border border-blue-500/40 px-3 py-1 text-[11px] font-medium text-blue-300 hover:bg-blue-600/30 hover:border-blue-400 transition-colors shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>Load Verified Groq &amp; Gemini Keys</span>
            </button>
          </div>
        </div>

        {/* Providers Key List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {PROVIDER_LIST.map((provider) => {
            const isFocused = focusedProviderForVault === provider.id;
            const currentVal = keysInput[provider.id] || "";
            const isVisible = showMaskMap[provider.id] || false;
            const test = testingStatus[provider.id];

            return (
              <div
                key={provider.id}
                className={`rounded-xl border p-3.5 sm:p-4 transition-all ${
                  isFocused
                    ? "border-blue-500/70 bg-blue-950/15 ring-1 ring-blue-500/30"
                    : "border-zinc-800/90 bg-zinc-900/40 hover:border-zinc-700"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: provider.color }}
                    />
                    <span className="font-semibold text-sm text-zinc-100">
                      {provider.label}
                    </span>
                    {provider.keyPrefix && (
                      <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                        (Starts with {provider.keyPrefix})
                      </span>
                    )}
                  </div>

                  {/* Direct Link to Get API Key */}
                  <a
                    href={provider.getKeyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors py-0.5"
                  >
                    <span>Get {provider.shortLabel} Key</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Input field + Show/Hide + Test Connection */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={isVisible ? "text" : "password"}
                      value={currentVal}
                      onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                      placeholder={
                        provider.id === "custom-openai-compatible"
                          ? "Optional API key (if required by your endpoint)"
                          : `Paste your ${provider.shortLabel} API key here...`
                      }
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 pr-10 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey(provider.id)}
                      className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                      title={isVisible ? "Mask key" : "Reveal key"}
                    >
                      {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Test & Sync Button */}
                  <button
                    type="button"
                    disabled={test?.loading}
                    onClick={() => handleTestAndSyncKey(provider.id as ProviderId)}
                    className="h-10 sm:h-9 flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-4 text-xs font-medium text-zinc-200 disabled:opacity-50 transition-colors shrink-0"
                    title="Validate key and discover available models"
                  >
                    {test?.loading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
                        <span>Syncing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                        <span>Test &amp; Sync Key</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Test Result Message Box */}
                {test && !test.loading && (
                  <div
                    className={`mt-2.5 flex items-start gap-2.5 rounded-xl p-3 text-xs border ${
                      test.success
                        ? "bg-emerald-950/30 border-emerald-800/40 text-emerald-300 font-mono"
                        : "bg-red-950/30 border-red-800/50 text-red-200"
                    }`}
                  >
                    {test.success ? (
                      <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-1.5">
                      <div className="leading-relaxed">{test.message}</div>
                      {!test.success && (
                        <div className="pt-0.5">
                          <a
                            href={provider.getKeyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-900/40 hover:bg-red-900/60 border border-red-700/50 px-2.5 py-1 text-[11px] font-medium text-red-100 transition-colors"
                          >
                            <span>Open {provider.shortLabel} Console &amp; Generate Key</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-zinc-800/80 px-4 sm:px-6 py-4 bg-zinc-950/60">
          <button
            onClick={handleClearAll}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-red-950 bg-red-950/30 px-3.5 py-2 text-xs font-medium text-red-400 hover:bg-red-900/40 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Wipe Vault</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setKeyVaultOpen(false)}
              className="flex-1 sm:flex-none rounded-xl border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 text-xs font-semibold text-white shadow-lg transition-colors"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>{isSaving ? "Syncing..." : "Save & Sync Across Devices"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
