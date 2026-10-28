"use client";

import React from "react";
import { X, Sliders, Zap, Server, MessageSquareCode, ShieldCheck } from "lucide-react";
import { usePlaygroundStore } from "@/lib/store";

export function ParametersDrawer() {
  const { isSettingsOpen, setSettingsOpen, settings, updateSettings } = usePlaygroundStore();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#121215] p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-blue-400" />
            <h3 className="font-semibold text-base text-zinc-100">
              Model Parameters & System Prompt
            </h3>
          </div>
          <button
            onClick={() => setSettingsOpen(false)}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* System Prompt Input */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <MessageSquareCode className="h-3.5 w-3.5 text-zinc-400" />
            <span>System Prompt / Persona</span>
          </label>
          <textarea
            value={settings.systemPrompt}
            onChange={(e) => updateSettings({ systemPrompt: e.target.value })}
            rows={3}
            placeholder="e.g. You are an expert TypeScript engineer..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs leading-relaxed text-zinc-200 placeholder-zinc-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Sliders */}
        <div className="space-y-4 pt-1">
          {/* Temperature */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-300">Temperature</span>
              <span className="font-mono text-blue-400 font-semibold">{settings.temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={settings.temperature}
              onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
              className="w-full accent-blue-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>0.0 (Strict / Code)</span>
              <span>0.7 (Default)</span>
              <span>2.0 (Creative)</span>
            </div>
          </div>

          {/* Max Output Tokens */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-300">Max Output Tokens</span>
              <span className="font-mono text-blue-400 font-semibold">{settings.maxTokens}</span>
            </div>
            <input
              type="range"
              min="256"
              max="16384"
              step="256"
              value={settings.maxTokens}
              onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value, 10) })}
              className="w-full accent-blue-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>256</span>
              <span>4,096</span>
              <span>16,384</span>
            </div>
          </div>

          {/* Top P */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-300">Top P (Nucleus Sampling)</span>
              <span className="font-mono text-blue-400 font-semibold">{settings.topP}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.topP}
              onChange={(e) => updateSettings({ topP: parseFloat(e.target.value) })}
              className="w-full accent-blue-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
            />
          </div>
        </div>

        {/* Network Mode / Stateless Proxy Toggle */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <Zap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">
                  Stateless Edge Proxy (Recommended)
                </span>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Routes provider streaming calls through a stateless Next.js Edge proxy to prevent browser CORS blocks. Zero key logging or storage guaranteed.
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
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 pt-1 font-mono">
            <ShieldCheck className="h-3 w-3" />
            <span>Zero key logging • In-memory byte pass-through</span>
          </div>
        </div>

        {/* Custom Provider / Local Endpoint Configuration */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
            <Server className="h-4 w-4 text-purple-400" />
            <span>Custom / Local Endpoint (Ollama, vLLM, LM Studio)</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Base URL</label>
              <input
                type="text"
                value={settings.customBaseUrl}
                onChange={(e) => updateSettings({ customBaseUrl: e.target.value })}
                placeholder="http://localhost:11434/v1"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Model Name</label>
              <input
                type="text"
                value={settings.customModelName}
                onChange={(e) => updateSettings({ customModelName: e.target.value })}
                placeholder="llama3.3"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Done Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => setSettingsOpen(false)}
            className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-xs font-semibold text-white transition-colors shadow-md"
          >
            Apply &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
}
