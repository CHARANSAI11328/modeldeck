"use client";

import React, { useState } from "react";
import {
  OpenAIIcon,
  AnthropicIcon,
  GeminiIcon,
  GroqIcon,
  DeepSeekIcon,
  QwenIcon,
  OpenRouterIcon,
  OllamaIcon,
  MistralIcon,
} from "@/components/ui/ProviderMark";
import { Zap, ArrowRight, Sparkles, Cpu, Clock, ShieldCheck, Database } from "lucide-react";

interface EngineCard {
  id: string;
  name: string;
  provider: string;
  category: "reasoning" | "speed" | "context" | "local" | "general";
  tag: string;
  speed: string;
  ttft: string;
  context: string;
  cost: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
}

const ENGINES_DATA: EngineCard[] = [
  {
    id: "openai-gpt5",
    name: "GPT-5 Frontier",
    provider: "OpenAI",
    category: "reasoning",
    tag: "Frontier General",
    speed: "78 tok/s",
    ttft: "140ms",
    context: "128k tokens",
    cost: "$2.50 / 1M tokens",
    description: "Multimodal frontier intelligence with world-class planning and synthesis.",
    icon: <OpenAIIcon className="h-5 w-5" />,
    accent: "#10a37f",
  },
  {
    id: "anthropic-claude-37",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    category: "reasoning",
    tag: "Hybrid Reasoning",
    speed: "72 tok/s",
    ttft: "180ms",
    context: "200k tokens",
    cost: "$3.00 / 1M tokens",
    description: "Configurable reasoning trace length with unprecedented code generation reliability.",
    icon: <AnthropicIcon className="h-5 w-5" />,
    accent: "#d97706",
  },
  {
    id: "gemini-25-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    category: "speed",
    tag: "1M Context Champion",
    speed: "115 tok/s",
    ttft: "110ms",
    context: "1,048,576 tokens",
    cost: "15 RPM Free / $0.075",
    description: "Extreme throughput native multimodal model handling massive codebases and audio.",
    icon: <GeminiIcon className="h-5 w-5" />,
    accent: "#38bdf8",
  },
  {
    id: "groq-llama-33",
    name: "Llama 3.3 70B",
    provider: "Groq LPU",
    category: "speed",
    tag: "Hardware Speed",
    speed: "520 tok/s",
    ttft: "18ms",
    context: "128k tokens",
    cost: "Free Tier / $0.59",
    description: "Near-instantaneous token generation powered by Groq Language Processing Units.",
    icon: <GroqIcon className="h-5 w-5" />,
    accent: "#f97316",
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    category: "reasoning",
    tag: "Open Weights Deliberation",
    speed: "45 tok/s",
    ttft: "320ms",
    context: "64k tokens",
    cost: "$0.55 / 1M tokens",
    description: "Reinforcement-learning trained reasoning model with transparent chain-of-thought.",
    icon: <DeepSeekIcon className="h-5 w-5" />,
    accent: "#3b82f6",
  },
  {
    id: "qwen-25-coder",
    name: "Qwen 2.5 Coder 32B",
    provider: "Alibaba Cloud",
    category: "general",
    tag: "Coding Specialist",
    speed: "68 tok/s",
    ttft: "190ms",
    context: "128k tokens",
    cost: "$0.40 / 1M tokens",
    description: "Exceptional code synthesis and repository-scale refactoring intelligence.",
    icon: <QwenIcon className="h-5 w-5" />,
    accent: "#8b5cf6",
  },
  {
    id: "openrouter-unified",
    name: "OpenRouter Unified",
    provider: "OpenRouter",
    category: "general",
    tag: "Universal Gateway",
    speed: "Auto-routed",
    ttft: "Optimal",
    context: "Varies (up to 2M)",
    cost: "Zero Markup",
    description: "One unified interface to 400+ models with automated fallback redundancy.",
    icon: <OpenRouterIcon className="h-5 w-5" />,
    accent: "#6366f1",
  },
  {
    id: "ollama-local",
    name: "Ollama Private Vault",
    provider: "Local Hardware",
    category: "local",
    tag: "100% Offline GPU",
    speed: "Hardware Bound",
    ttft: "<5ms Local",
    context: "System VRAM",
    cost: "$0.00 (Self Hosted)",
    description: "Run Llama, DeepSeek, and Mistral on your local workstation with zero telemetry.",
    icon: <OllamaIcon className="h-5 w-5" />,
    accent: "#f59e0b",
  },
  {
    id: "mistral-large-2",
    name: "Mistral Large 2",
    provider: "Mistral AI",
    category: "general",
    tag: "European Frontier",
    speed: "64 tok/s",
    ttft: "170ms",
    context: "128k tokens",
    cost: "$2.00 / 1M tokens",
    description: "Top-tier multilingual fluency and reasoning with strict EU compliance standards.",
    icon: <MistralIcon className="h-5 w-5" />,
    accent: "#ea580c",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Engines" },
  { id: "reasoning", label: "Reasoning & Thinking" },
  { id: "speed", label: "Extreme Speed (>100 tok/s)" },
  { id: "local", label: "Local & Offline" },
  { id: "general", label: "Coding & General" },
];

export function EnginesSection() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered = ENGINES_DATA.filter((engine) =>
    activeCategory === "all" ? true : engine.category === activeCategory
  );

  const handleTestInPlayground = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("playground");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="engines"
      className="relative py-24 sm:py-32 bg-[#0c0807] text-[#faf5ef] border-t border-white/[0.06]"
    >
      {/* Ambient background glow */}
      <div
        className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none opacity-20 blur-[140px]"
        style={{
          background: "radial-gradient(circle, #ff5722 0%, rgba(12,8,7,0) 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.08] pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1f120c] border border-amber-900/50 text-[11px] font-mono font-semibold text-[#ff8a50]">
              <Cpu className="h-3.5 w-3.5 text-[#ff5722]" />
              <span>01 / THE MODEL ROSTER</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#faf5ef]">
              Every Frontier Model. One Unified Roster.
            </h2>
            <p className="text-sm sm:text-base text-[#ab9b8f]">
              Direct BYOK connections to official provider APIs. No proxy middleman markup, no retention logs, and instant hardware telemetry.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                  activeCategory === cat.id
                    ? "bg-[#ff5722] text-[#140a06] font-bold shadow-md shadow-[#ff5722]/30"
                    : "bg-[#180f0b] text-[#b8a79a] hover:text-[#faf5ef] border border-white/[0.07]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Engine Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((engine) => (
            <div
              key={engine.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#140d0a]/70 p-6 backdrop-blur-xl transition-all duration-300 hover:border-amber-700/50 hover:bg-[#1a110c] hover:shadow-2xl hover:shadow-black/60 hover:-translate-y-1"
            >
              {/* Card Top: Logo, Name, Badge */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 p-2.5 backdrop-blur-md shadow-md"
                    style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                  >
                    {engine.icon}
                  </div>
                  <span
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      borderColor: `${engine.accent}40`,
                      color: engine.accent,
                      backgroundColor: `${engine.accent}15`,
                    }}
                  >
                    {engine.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#faf5ef] group-hover:text-[#ff8a50] transition-colors">
                    {engine.name}
                  </h3>
                  <p className="text-xs text-[#8f8075] font-mono mt-0.5">
                    {engine.provider}
                  </p>
                </div>

                <p className="text-xs text-[#c4b5a8] leading-relaxed line-clamp-2">
                  {engine.description}
                </p>
              </div>

              {/* Card Bottom: Specs & Action */}
              <div className="pt-6 mt-6 border-t border-white/[0.06] space-y-4">
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#a6968a]">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-[#ff7043]" />
                    <span>{engine.speed}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-[#ff8a50]" />
                    <span>{engine.ttft}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Database className="h-3 w-3 text-amber-400" />
                    <span>{engine.context}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    <span>{engine.cost}</span>
                  </div>
                </div>

                <a
                  href="#playground"
                  onClick={handleTestInPlayground}
                  className="w-full inline-flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-[#faf5ef] hover:bg-[#ff5722] hover:text-[#140a06] hover:border-transparent transition-all duration-200"
                >
                  <span>Test in Playground</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

