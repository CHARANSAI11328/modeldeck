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
import { ProviderMark } from "@/components/ui/ProviderMark";

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

  // Handle Escape key to close modal
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isKeyVaultOpen) {
        setKeyVaultOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isKeyVaultOpen, setKeyVaultOpen]);

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

    let discoveredModels: ReturnType<typeof syncModelsForProvider> extends Promise<infer U> ? U : never = [];
    try {
      discoveredModels = await syncModelsForProvider(providerId, rawKey || "", settings);
      if (discoveredModels.length > 0) {
        setDynamicModels(providerId, discoveredModels);
      }
    } catch {
      // ignore
    }

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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vault-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) setKeyVaultOpen(false);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="double-bezel relative w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-foreground">
        <div className="double-bezel-inner flex flex-col max-h-[92vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-border/80 px-4 sm:px-6 py-4 bg-surface-1">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff5722]/15 text-[#ff5722] border border-[#ff5722]/25 shrink-0">
                <KeyRound className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 id="vault-modal-title" className="font-bold text-base sm:text-lg text-foreground flex items-center gap-2 flex-wrap tracking-tight">
                  <span>BYOK Multi-Device Key Vault</span>
                  <span className="rounded-full bg-[#ff5722]/10 border border-[#ff5722]/20 px-2 py-0.5 text-[10px] font-mono font-medium text-[#ff5722] dark:text-[#ff8a50]">
                    AES-GCM Sync
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Credentials are encrypted in local memory and synced across devices on your private network.
                </p>
              </div>
            </div>

            <button
              onClick={() => setKeyVaultOpen(false)}
              aria-label="Close API Key Vault"
              className="btn-tactile rounded-xl p-2 text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors focus-visible:ring-2 focus-visible:ring-[#ff5722]"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Quick Info & Pre-loads */}
          <div className="bg-surface-2/60 border-b border-border/80 px-4 sm:px-6 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                Want to pre-fill tested keys for testing?
              </span>
              <button
                type="button"
                onClick={handleQuickLoadKeys}
                className="btn-tactile inline-flex items-center gap-1.5 rounded-xl bg-[#ff5722]/15 border border-[#ff5722]/30 px-3 py-1 text-xs font-semibold text-[#ff5722] dark:text-[#ff8a50] hover:bg-[#ff6d3d]/25 transition-all shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#ff5722]" />
                <span>Load Verified Groq &amp; Gemini Keys</span>
              </button>
            </div>
          </div>

          {/* Providers Key List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
            {PROVIDER_LIST.map((provider) => {
              const isFocused = focusedProviderForVault === provider.id;
              const currentVal = keysInput[provider.id] || "";
              const isVisible = showMaskMap[provider.id] || false;
              const test = testingStatus[provider.id];

              return (
                <div
                  key={provider.id}
                  className={`rounded-2xl border p-3.5 sm:p-4 transition-all ${
                    isFocused
                      ? "border-[#ff5722]/60 bg-[#ff5722]/[0.04] ring-1 ring-[#ff5722]/30"
                      : "border-border bg-surface-1 hover:border-zinc-700/60 shadow-sm"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      <ProviderMark providerId={provider.id as ProviderId} label={provider.shortLabel} className="h-5 w-5 shrink-0" />
                      <span className="font-bold text-sm text-foreground">
                        {provider.label}
                      </span>
                      {provider.keyPrefix && (
                        <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">
                          ({provider.keyPrefix}...)
                        </span>
                      )}
                    </div>

                    {/* Direct Link to Get API Key */}
                    <a
                      href={provider.getKeyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-tactile inline-flex items-center gap-1 text-xs font-semibold text-[#ff5722] hover:text-[#ff8a50] underline underline-offset-2 transition-colors py-0.5"
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
                        className="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-[#ff5722] focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowKey(provider.id)}
                        className="btn-tactile absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
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
                      className="btn-tactile h-9 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-2 hover:bg-surface-3 px-3.5 text-xs font-semibold text-foreground disabled:opacity-50 transition-colors shrink-0 shadow-sm"
                      title="Validate key and discover available models"
                    >
                      {test?.loading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#ff5722]" />
                          <span>Syncing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-[#ff5722]" />
                          <span>Test &amp; Sync</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Test Result Message Box */}
                  {test && !test.loading && (
                    <div
                      className={`mt-2.5 flex items-start gap-2.5 rounded-xl p-3 text-xs border ${
                        test.success
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300 font-mono"
                          : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-300"
                      }`}
                    >
                      {test.success ? (
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 space-y-1.5">
                        <div className="leading-relaxed">{test.message}</div>
                        {!test.success && (
                          <div className="pt-0.5">
                            <a
                              href={provider.getKeyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-tactile inline-flex items-center gap-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 px-2.5 py-1 text-[11px] font-semibold text-red-600 dark:text-red-200 transition-colors"
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-border/80 px-4 sm:px-6 py-4 bg-surface-2/40">
            <button
              onClick={handleClearAll}
              className="btn-tactile flex items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear Vault</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setKeyVaultOpen(false)}
                className="btn-tactile flex-1 sm:flex-none rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAll}
                disabled={isSaving}
                className="btn-tactile flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-[#ff5722] hover:bg-[#ff6d3d] px-5 py-2 text-xs font-bold text-white shadow-lg shadow-[#ff5722]/20 transition-all"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>{isSaving ? "Saving..." : "Save & Synchronize"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
