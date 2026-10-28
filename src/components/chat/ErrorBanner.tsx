"use client";

import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Clock,
  ShieldAlert,
  WifiOff,
  RefreshCw,
  X,
  ExternalLink,
  Zap,
  Sparkles,
  ArrowRight,
  Cpu,
} from "lucide-react";
import { AppError, ProviderId } from "@/lib/types";
import { getProvider } from "@/lib/providers";
import { usePlaygroundStore } from "@/lib/store";

interface ErrorBannerProps {
  error: AppError;
  onDismiss: () => void;
  onRetry: () => void;
  currentProviderId: ProviderId;
}

export function ErrorBanner({
  error,
  onDismiss,
  onRetry,
  currentProviderId,
}: ErrorBannerProps) {
  const {
    setKeyVaultOpen,
    settings,
    updateSettings,
    setProviderAndModel,
    retryLastMessage,
    keyStatusMap,
    sessions,
    currentSessionId,
  } = usePlaygroundStore();

  const provider = getProvider(currentProviderId);
  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const currentModelId = currentSession?.modelId || "";

  // Rate limit countdown state
  const initialCountdown = error.type === "rate_limit" ? error.retryAfter || 10 : 0;
  const [countdown, setCountdown] = useState(initialCountdown);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  if (error.type === "aborted") return null;

  // Check if error is a 404 / discontinued model error
  const isModelUnavailable =
    error.type === "provider" &&
    (error.status === 404 ||
      error.message?.toLowerCase().includes("no longer available") ||
      error.message?.toLowerCase().includes("not found") ||
      error.message?.toLowerCase().includes("does not exist") ||
      error.message?.toLowerCase().includes("no provider serves this model"));

  // Find the best working alternative model on the same provider
  const replacementModel =
    provider.models.find((m) => m.id !== currentModelId) || provider.models[0];

  // Check if user has other verified providers active (e.g. Groq, Gemini)
  const otherVerifiedProviders = (Object.keys(keyStatusMap) as ProviderId[])
    .filter(
      (pId) =>
        keyStatusMap[pId] &&
        pId !== currentProviderId &&
        pId !== "custom-openai-compatible"
    )
    .map((pId) => getProvider(pId));

  const handleSwitchAndResend = async (
    targetProviderId: ProviderId,
    targetModelId: string
  ) => {
    setIsSwitching(true);
    setProviderAndModel(targetProviderId, targetModelId);
    onDismiss();
    setTimeout(() => {
      retryLastMessage();
      setIsSwitching(false);
    }, 100);
  };

  return (
    <div className="mx-auto my-3 max-w-3xl rounded-2xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-200 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-red-400 shrink-0">
          {error.type === "auth" && <ShieldAlert className="h-5 w-5" />}
          {error.type === "rate_limit" && <Clock className="h-5 w-5 text-amber-400" />}
          {error.type === "network" && <WifiOff className="h-5 w-5" />}
          {error.type === "provider" && <AlertCircle className="h-5 w-5" />}
        </div>

        <div className="flex-1 space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-red-100 flex items-center gap-2">
              {error.type === "auth" && "Authentication / API Key Error"}
              {error.type === "rate_limit" && "Rate Limit Exceeded (HTTP 429)"}
              {error.type === "network" && "Network / Connectivity Failure"}
              {error.type === "provider" &&
                (isModelUnavailable
                  ? `Model Discontinued / Not Found (HTTP 404)`
                  : `Provider Error (HTTP ${error.status})`)}
            </h4>
            <button
              onClick={onDismiss}
              className="text-red-400/70 hover:text-red-200 transition-colors p-1 rounded-lg hover:bg-red-900/30"
              title="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-red-200/90 leading-relaxed text-[13px]">
            {error.type === "auth" && error.message}
            {error.type === "rate_limit" &&
              (error.message ||
                `Too many requests sent to ${provider.label}. Please wait before making another call.`)}
            {error.type === "network" && error.message}
            {error.type === "provider" && error.message}
          </p>

          {/* Special Recovery Suggestions for Discontinued Model */}
          {isModelUnavailable && (
            <div className="rounded-xl bg-black/40 border border-red-500/20 p-3 space-y-2 mt-2">
              <div className="text-xs text-zinc-300 font-medium flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                <span>Recommended 1-Click Recovery:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Switch to active model on current provider */}
                {replacementModel && replacementModel.id !== currentModelId && (
                  <button
                    disabled={isSwitching}
                    onClick={() =>
                      handleSwitchAndResend(currentProviderId, replacementModel.id)
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-3 py-1.5 text-xs font-semibold text-white transition-all shadow-md"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>Switch to {replacementModel.name} &amp; Resend</span>
                  </button>
                )}

                {/* 2. Switch to other verified providers (Groq or Gemini) */}
                {otherVerifiedProviders.map((otherProv) => {
                  const targetModel =
                    otherProv.models[0]?.id || otherProv.testModelId;
                  return (
                    <button
                      key={otherProv.id}
                      disabled={isSwitching}
                      onClick={() =>
                        handleSwitchAndResend(otherProv.id, targetModel)
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 px-3 py-1.5 text-xs font-medium text-emerald-200 transition-all"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: otherProv.color }}
                      />
                      <span>Switch to {otherProv.shortLabel} (Key Verified) &amp; Send</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Standard Action buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {error.type === "auth" && (
              <>
                <button
                  onClick={() => setKeyVaultOpen(true, currentProviderId)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-900/60 hover:bg-red-800/80 px-3 py-1.5 text-xs font-medium text-white transition-colors"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Configure {provider.label} Key
                </button>
                <a
                  href={provider.getKeyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-950/40 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Get API Key at {provider.label} Console
                </a>
              </>
            )}

            {error.type === "rate_limit" && (
              <button
                disabled={countdown > 0}
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600/70 hover:bg-amber-600 disabled:opacity-50 px-3 py-1.5 text-xs font-medium text-white transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${countdown > 0 ? "animate-spin" : ""}`} />
                {countdown > 0 ? `Retry available in ${countdown}s` : "Retry Request Now"}
              </button>
            )}

            {error.type === "network" && (
              <>
                <button
                  onClick={() => {
                    updateSettings({ useProxy: !settings.useProxy });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition-colors"
                >
                  <Zap className="h-3.5 w-3.5" />
                  {settings.useProxy
                    ? "Disable Proxy (Use Direct Browser)"
                    : "Enable Stateless Proxy (Bypass CORS)"}
                </button>
                <button
                  onClick={onRetry}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-950/40 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </button>
              </>
            )}

            {error.type === "provider" && !isModelUnavailable && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-900/60 hover:bg-red-800/80 px-3 py-1.5 text-xs font-medium text-white transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
