"use client";

import React, { useEffect } from "react";
import { X, Sliders, Zap, Server, MessageSquareCode, ShieldCheck } from "lucide-react";
import { usePlaygroundStore } from "@/lib/store";

export function ParametersDrawer() {
  const { isSettingsOpen, setSettingsOpen, settings, updateSettings } = usePlaygroundStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSettingsOpen) {
        setSettingsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSettingsOpen, setSettingsOpen]);

  if (!isSettingsOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="parameters-drawer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) setSettingsOpen(false);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="double-bezel relative w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden text-foreground">
        <div className="double-bezel-inner p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/15 text-blue-500 border border-blue-500/20">
                <Sliders className="h-4 w-4" />
              </div>
              <h3 id="parameters-drawer-title" className="font-bold text-base text-foreground tracking-tight">
                Model Parameters &amp; System Persona
              </h3>
            </div>
            <button
              onClick={() => setSettingsOpen(false)}
              aria-label="Close parameters drawer"
              className="btn-tactile rounded-xl p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* System Prompt Input */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
              <MessageSquareCode className="h-3.5 w-3.5 text-blue-500" />
              <span>System Prompt Instructions</span>
            </label>
            <textarea
              value={settings.systemPrompt}
              onChange={(e) => updateSettings({ systemPrompt: e.target.value })}
              rows={3}
              placeholder="e.g. You are an expert TypeScript engineer..."
              className="w-full rounded-xl border border-border bg-surface-2 p-3 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Sliders */}
          <div className="space-y-4 pt-1">
            {/* Temperature */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Temperature</span>
                <span className="font-mono text-blue-500 font-bold tabular-nums">{settings.temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={settings.temperature}
                onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
                className="w-full accent-blue-600 bg-surface-2 rounded-lg h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>0.0 (Deterministic)</span>
                <span>0.7 (Default)</span>
                <span>2.0 (Creative)</span>
              </div>
            </div>

            {/* Max Output Tokens */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Max Output Tokens</span>
                <span className="font-mono text-blue-500 font-bold tabular-nums">{settings.maxTokens}</span>
              </div>
              <input
                type="range"
                min="256"
                max="16384"
                step="256"
                value={settings.maxTokens}
                onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value, 10) })}
                className="w-full accent-blue-600 bg-surface-2 rounded-lg h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>256</span>
                <span>4,096</span>
                <span>16,384</span>
              </div>
            </div>

            {/* Top P */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Top P (Nucleus Sampling)</span>
                <span className="font-mono text-blue-500 font-bold tabular-nums">{settings.topP}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.topP}
                onChange={(e) => updateSettings({ topP: parseFloat(e.target.value) })}
                className="w-full accent-blue-600 bg-surface-2 rounded-lg h-2 cursor-pointer"
              />
            </div>
          </div>

          {/* Network Mode / Stateless Proxy Toggle */}
          <div className="rounded-2xl border border-border bg-surface-2/60 p-4 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/20 shrink-0 mt-0.5">
                  <Zap className="h-3.5 w-3.5 fill-current" />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Stateless Edge Proxy
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    Routes streaming requests through a stateless Edge proxy to prevent browser CORS blocks. Zero key logging or storage.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.useProxy}
                onChange={(e) => updateSettings({ useProxy: e.target.checked })}
                className="h-5 w-5 rounded accent-blue-600 cursor-pointer shrink-0"
              />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 pt-1 font-mono font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Zero-knowledge byte pass-through</span>
            </div>
          </div>

          {/* Custom Provider / Local Endpoint Configuration */}
          <div className="rounded-2xl border border-border bg-surface-2/60 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Server className="h-4 w-4 text-purple-500" />
              <span>Local Endpoint (Ollama, vLLM, LM Studio)</span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Base URL</label>
                <input
                  type="text"
                  value={settings.customBaseUrl}
                  onChange={(e) => updateSettings({ customBaseUrl: e.target.value })}
                  placeholder="http://localhost:11434/v1"
                  className="w-full rounded-xl border border-border bg-surface-1 px-3 py-1.5 font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Model Identifier</label>
                <input
                  type="text"
                  value={settings.customModelName}
                  onChange={(e) => updateSettings({ customModelName: e.target.value })}
                  placeholder="llama3.3"
                  className="w-full rounded-xl border border-border bg-surface-1 px-3 py-1.5 font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Done Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setSettingsOpen(false)}
              className="btn-tactile w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-blue-500/20"
            >
              Apply &amp; Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
