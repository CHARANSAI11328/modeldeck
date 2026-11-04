"use client";

import React from "react";
import { ProviderId } from "@/lib/types";
import { PROVIDERS } from "@/lib/providers";

interface ProviderMarkProps {
  providerId: ProviderId;
  modelId?: string;
  label?: string;
  className?: string;
}

export function ProviderMark({
  providerId,
  modelId,
  label,
  className = "h-4 w-4",
}: ProviderMarkProps) {
  const prov = PROVIDERS[providerId];
  const color = prov?.color || "#ff5722";
  const id = (modelId || "").toLowerCase();

  // Model-specific logos if available
  if (id.includes("claude") || id.startsWith("anthropic/")) {
    return <AnthropicIcon className={className} />;
  }
  if (id.includes("gemini") || id.startsWith("google/")) {
    return <GeminiIcon className={className} />;
  }
  if (id.includes("deepseek") || id.startsWith("~deepseek/")) {
    return <DeepSeekIcon className={className} />;
  }
  if (id.includes("mistral") || id.includes("codestral") || id.includes("pixtral")) {
    return <MistralIcon className={className} />;
  }
  if (id.includes("llama") || id.startsWith("meta-")) {
    return <MetaIcon className={className} />;
  }
  if (id.includes("qwen") || id.includes("alibaba")) {
    return <QwenIcon className={className} />;
  }
  if (id.includes("gpt") || id.startsWith("openai/") || id.startsWith("~openai/")) {
    return <OpenAIIcon className={className} />;
  }

  // Provider-level logos
  switch (providerId) {
    case "openai":
      return <OpenAIIcon className={className} />;
    case "anthropic":
      return <AnthropicIcon className={className} />;
    case "gemini":
      return <GeminiIcon className={className} />;
    case "deepseek":
      return <DeepSeekIcon className={className} />;
    case "groq":
      return <GroqIcon className={className} />;
    case "openrouter":
      return <OpenRouterIcon className={className} />;
    case "demonroute":
      return <DemonRouteIcon className={className} />;
    case "together":
      return <TogetherIcon className={className} />;
    case "mistral":
      return <MistralIcon className={className} />;
    case "custom-openai-compatible":
      return <OllamaIcon className={className} />;
    default:
      return (
        <span
          aria-label={label || providerId}
          className={`inline-grid place-items-center rounded shrink-0 font-bold text-[9px] text-white ${className}`}
          style={{ backgroundColor: color }}
        >
          {(label || providerId).slice(0, 1).toUpperCase()}
        </span>
      );
  }
}

// 1. OpenAI / ChatGPT Logo
export function OpenAIIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`shrink-0 text-[#10a37f] dark:text-[#10a37f] ${className}`} aria-hidden="true">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 8.766a4.48 4.48 0 0 1 2.34-1.974V12.4a.768.768 0 0 0 .388.677l5.835 3.37-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 8.766zm16.597 3.844l-5.843-3.37 2.02-1.167a.076.076 0 0 1 .071 0l4.83 2.79a4.494 4.494 0 0 1-.69 8.017v-5.593a.79.79 0 0 0-.388-.677zm2.01-4.043l-.141-.085-4.779-2.76a.776.776 0 0 0-.784 0l-5.843 3.37V6.76a.076.076 0 0 1 .033-.061L14.26 3.91a4.494 4.494 0 0 1 6.687 4.657zm-10.74 5.437l2.604-1.502 2.604 1.502v3.007l-2.604 1.503-2.604-1.503z" />
    </svg>
  );
}

// 2. Anthropic Claude Logo (Warm Terracotta Spark)
export function AnthropicIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`shrink-0 text-[#d97706] dark:text-[#f59e0b] ${className}`} aria-hidden="true">
      <path d="M13.827 3.518h3.842L24 20.482h-3.842l-1.564-3.666H9.406l-1.564 3.666H4L10.173 3.518h3.654zm-2.923 10.354h4.192l-2.096-4.912-2.096 4.912zM0 3.518h3.842l2.308 5.409-1.921 4.498L0 3.518z" />
    </svg>
  );
}

// 3. Google Gemini Logo (4-Point Diamond Sparkle)
export function GeminiIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`shrink-0 text-[#38bdf8] ${className}`} aria-hidden="true">
      <path
        d="M12 2C12 7.523 7.523 12 2 12C7.523 12 12 16.477 12 22C12 16.477 16.477 12 22 12C16.477 12 12 7.523 12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

// 4. DeepSeek Logo (Stylized Whale)
export function DeepSeekIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`shrink-0 text-[#3b82f6] ${className}`} aria-hidden="true">
      <path d="M12 3C6.48 3 2 7.03 2 12c0 2.87 1.5 5.42 3.83 7.03-.17.65-.56 1.83-1.42 2.89 1.56-.05 3.32-.61 4.51-1.63.98.24 2.01.37 3.08.37 5.52 0 10-4.03 10-9s-4.48-9-10-9zm1.5 13.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-5-3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm8 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  );
}

// 5. Groq Logo (Groq Speed Pulse)
export function GroqIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`shrink-0 text-[#f97316] ${className}`} aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" opacity="0.6" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" opacity="0.6" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

// 6. OpenRouter Logo (Interlocking Hexagon / Route)
export function OpenRouterIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 text-[#6366f1] ${className}`} aria-hidden="true">
      <path d="M16 3h5v5" />
      <path d="M8 21H3v-5" />
      <path d="M21 3l-7.5 7.5" />
      <path d="M3 21l7.5-7.5" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </svg>
  );
}

// 7. Demon Route Logo (Horned Flame Mark)
export function DemonRouteIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`shrink-0 text-[#dc2626] ${className}`} aria-hidden="true">
      <path d="M12 2C10.5 4.5 9 6.5 6 7c1.5 1.5 2.5 3.5 2 6-1-1.5-2-2-3-2 .5 3 2.5 5 4.5 6C8 18.5 7 19.5 5 20c3 1.5 6 1.5 7-1 1 2.5 4 2.5 7 1-2-.5-3-1.5-4.5-3 2-1 4-3 4.5-6-1 0-2 .5-3 2-.5-2.5.5-4.5 2-6-3-.5-4.5-2.5-6-5z" />
    </svg>
  );
}

// 8. Together AI Logo (Interlocking Nodes)
export function TogetherIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`shrink-0 text-[#3b82f6] ${className}`} aria-hidden="true">
      <circle cx="7" cy="7" r="4" />
      <circle cx="17" cy="7" r="4" opacity="0.8" />
      <circle cx="12" cy="17" r="4" opacity="0.9" />
    </svg>
  );
}

// 9. Mistral AI Logo (Iconic Orange Stepped Blocks)
export function MistralIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`shrink-0 text-[#f97316] ${className}`} aria-hidden="true">
      <rect x="2" y="3" width="4.5" height="4.5" />
      <rect x="17.5" y="3" width="4.5" height="4.5" />
      <rect x="2" y="9.5" width="4.5" height="4.5" />
      <rect x="7.5" y="9.5" width="9" height="4.5" />
      <rect x="17.5" y="9.5" width="4.5" height="4.5" />
      <rect x="2" y="16.5" width="4.5" height="4.5" />
      <rect x="17.5" y="16.5" width="4.5" height="4.5" />
    </svg>
  );
}

// 10. Meta / Llama Logo (Infinity Loop)
export function MetaIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`shrink-0 text-[#0284c7] ${className}`} aria-hidden="true">
      <path d="M12 10.15c-1.3-1.63-2.9-2.65-4.63-2.65C4.4 7.5 2 9.77 2 12.87c0 3.32 2.5 5.63 5.4 5.63 2.1 0 3.66-1.15 4.6-2.52.94 1.37 2.5 2.52 4.6 2.52 2.9 0 5.4-2.31 5.4-5.63 0-3.1-2.4-5.37-5.37-5.37-1.73 0-3.33 1.02-4.63 2.65zm-4.63 6.1c-1.7 0-3.17-1.38-3.17-3.38 0-1.9 1.4-3.12 3.14-3.12 1.3 0 2.5.87 3.4 2.16-1.02 1.54-2.14 4.34-3.37 4.34zm9.26 0c-1.23 0-2.35-2.8-3.37-4.34.9-1.29 2.1-2.16 3.4-2.16 1.74 0 3.14 1.22 3.14 3.12 0 2-1.47 3.38-3.17 3.38z" />
    </svg>
  );
}

// 11. Ollama Logo (Friendly Llama Silhouette)
export function OllamaIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`shrink-0 text-amber-100 dark:text-zinc-200 ${className}`} aria-hidden="true">
      <path d="M17 3h-2v3h-2V3h-2v5H9V5H7v5a3 3 0 0 0 3 3h1v3H9a2 2 0 0 0-2 2v3h2v-3h6v3h2v-4a2 2 0 0 0-2-2h-2v-3h1a3 3 0 0 0 3-3V3z" />
    </svg>
  );
}

// 12. Qwen Logo (Cloud / Diamond)
export function QwenIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`shrink-0 text-[#8b5cf6] ${className}`} aria-hidden="true">
      <path d="M12 2L2 9.5l4 12.5h12l4-12.5L12 2zm0 4.2l6.2 4.7-2.4 7.6H8.2L5.8 10.9 12 6.2z" />
    </svg>
  );
}
