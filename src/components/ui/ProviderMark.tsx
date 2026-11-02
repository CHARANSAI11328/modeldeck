"use client";

import { useState } from "react";
import { ProviderId } from "@/lib/types";

const PROVIDER_SLUG: Record<ProviderId, string> = {
  openai: "openai", anthropic: "anthropic", gemini: "googlegemini", deepseek: "deepseek", groq: "groq", openrouter: "openrouter", together: "together", mistral: "mistral", demonroute: "openai", "custom-openai-compatible": "ollama",
};

function slugForModel(providerId: ProviderId, modelId?: string) {
  const id = modelId?.toLowerCase() ?? "";
  if (id.includes("claude") || id.startsWith("anthropic/")) return "anthropic";
  if (id.includes("gemini") || id.startsWith("google/")) return "googlegemini";
  if (id.includes("deepseek") || id.startsWith("~deepseek/")) return "deepseek";
  if (id.includes("mistral") || id.includes("codestral") || id.includes("pixtral")) return "mistral";
  if (id.includes("llama") || id.startsWith("meta-")) return "meta";
  if (id.includes("qwen")) return "alibabacloud";
  if (id.includes("grok") || id.startsWith("x-ai/")) return "x";
  if (id.includes("nvidia")) return "nvidia";
  if (id.includes("xiaomi")) return "xiaomi";
  if (id.includes("gpt") || id.startsWith("openai/") || id.startsWith("~openai/")) return "openai";
  return PROVIDER_SLUG[providerId];
}

export function ProviderMark({ providerId, modelId, label, className = "h-4 w-4" }: { providerId: ProviderId; modelId?: string; label: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const slug = slugForModel(providerId, modelId);
  if (failed) return <span aria-label={label} className={`inline-grid place-items-center rounded-md bg-zinc-700 text-[8px] font-semibold text-zinc-100 ${className}`}>{label.slice(0, 1)}</span>;
  return <img className={`provider-mark ${className}`} src={`https://cdn.simpleicons.org/${slug}/f4f4f5`} alt={`${label} logo`} onError={() => setFailed(true)} />;
}
