"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Terminal,
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  Copy,
  ExternalLink,
} from "lucide-react";
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

interface OrbitalEngine {
  id: string;
  name: string;
  badge: string;
  spec: string;
  color: string;
  icon: React.ReactNode;
  angleDeg: number;
  ring: 1 | 2 | 3;
}

const ORBITAL_ENGINES: OrbitalEngine[] = [
  {
    id: "openai",
    name: "ChatGPT / GPT-5",
    badge: "OpenAI",
    spec: "128k ctx · Frontier Reasoning",
    color: "#10a37f",
    icon: <OpenAIIcon className="h-6 w-6 text-[#10a37f]" />,
    angleDeg: 330,
    ring: 2,
  },
  {
    id: "anthropic",
    name: "Claude 3.7 Sonnet",
    badge: "Anthropic",
    spec: "200k ctx · Hybrid Reasoning",
    color: "#d97706",
    icon: <AnthropicIcon className="h-6 w-6 text-[#d97706]" />,
    angleDeg: 45,
    ring: 2,
  },
  {
    id: "gemini",
    name: "Gemini 2.5 Flash",
    badge: "Google",
    spec: "1M ctx · 95 tok/s Multimodal",
    color: "#38bdf8",
    icon: <GeminiIcon className="h-6 w-6 text-[#38bdf8]" />,
    angleDeg: 120,
    ring: 2,
  },
  {
    id: "groq",
    name: "Groq LPU Llama 3.3",
    badge: "Groq",
    spec: "500+ tok/s · Hardware Speed",
    color: "#f97316",
    icon: <GroqIcon className="h-6 w-6 text-[#f97316]" />,
    angleDeg: 215,
    ring: 2,
  },
  {
    id: "deepseek",
    name: "DeepSeek R1",
    badge: "DeepSeek",
    spec: "Open Weights · Deliberation Trace",
    color: "#3b82f6",
    icon: <DeepSeekIcon className="h-6 w-6 text-[#3b82f6]" />,
    angleDeg: 0,
    ring: 3,
  },
  {
    id: "qwen",
    name: "Qwen 2.5 Coder",
    badge: "Alibaba",
    spec: "128k ctx · Elite Syntax",
    color: "#8b5cf6",
    icon: <QwenIcon className="h-6 w-6 text-[#8b5cf6]" />,
    angleDeg: 80,
    ring: 3,
  },
  {
    id: "openrouter",
    name: "OpenRouter Unified",
    badge: "Router",
    spec: "400+ Models · Zero Fallbacks",
    color: "#6366f1",
    icon: <OpenRouterIcon className="h-6 w-6 text-[#6366f1]" />,
    angleDeg: 165,
    ring: 3,
  },
  {
    id: "ollama",
    name: "Ollama Local Engine",
    badge: "Local / Offline",
    spec: "Private GPU · Zero Cloud Telemetry",
    color: "#f59e0b",
    icon: <OllamaIcon className="h-6 w-6 text-[#f59e0b]" />,
    angleDeg: 250,
    ring: 3,
  },
  {
    id: "mistral",
    name: "Mistral Large 2",
    badge: "Mistral",
    spec: "128k ctx · Native Multilingual",
    color: "#ea580c",
    icon: <MistralIcon className="h-6 w-6 text-[#ea580c]" />,
    angleDeg: 290,
    ring: 1,
  },
];

export function LandingHero() {
  const [copied, setCopied] = useState(false);
  const [hoveredEngine, setHoveredEngine] = useState<OrbitalEngine | null>(null);

  const copyQuickCurl = async () => {
    try {
      await navigator.clipboard.writeText(
        'curl -X POST https://api.modeldeck.dev/v1/eval -d \'{"models":["gpt-5","claude-3.7-sonnet","gemini-2.5-flash"]}\''
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const scrollToPlayground = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("playground");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-20 overflow-hidden bg-[#0c0807] text-[#faf5ef]"
    >
      {/* 1. WARM AMBER AMBIENT RADIAL LIGHTING (EXACT THEME MATCH) */}
      <div
        className="absolute top-1/4 right-[10%] w-[680px] h-[680px] rounded-full pointer-events-none opacity-40 blur-[130px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 87, 34, 0.45) 0%, rgba(234, 88, 12, 0.25) 45%, rgba(12, 8, 7, 0) 75%)",
        }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-[450px] h-[450px] rounded-full pointer-events-none opacity-20 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 112, 67, 0.4) 0%, rgba(12, 8, 7, 0) 70%)",
        }}
      />

      {/* 2. FLOATING TRANSLUCENT 3D AMBER CRYSTAL / LIGHTNING BOLTS (CRAFTED FROM REFERENCE) */}
      {/* Top Right Floating Crystal Prism */}
      <div
        className="absolute top-12 right-6 md:right-16 w-32 md:w-48 h-36 md:h-52 pointer-events-none select-none z-10 opacity-75 animate-pulse"
        style={{ animationDuration: "6s" }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 160 180" fill="none" className="w-full h-full drop-shadow-[0_20px_35px_rgba(255,87,34,0.35)]">
          <defs>
            <linearGradient id="crystalTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff8a50" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ff5722" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#bf360c" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="crystalReflect" x1="30%" y1="0%" x2="70%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M95 10L145 75L90 165L65 110L20 85L95 10Z"
            fill="url(#crystalTop)"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.5"
          />
          <path
            d="M95 10L145 75L105 85L95 10Z"
            fill="url(#crystalReflect)"
          />
        </svg>
      </div>

      {/* Bottom Left Floating Crystal Shard */}
      <div
        className="absolute bottom-6 left-4 md:left-12 w-28 md:w-40 h-32 md:h-44 pointer-events-none select-none z-10 opacity-60"
        aria-hidden="true"
      >
        <svg viewBox="0 0 140 160" fill="none" className="w-full h-full drop-shadow-[0_20px_30px_rgba(255,87,34,0.25)]">
          <path
            d="M40 140L10 80L60 20L85 65L120 90L40 140Z"
            fill="url(#crystalTop)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1.2"
          />
          <path
            d="M40 140L60 20L75 70L40 140Z"
            fill="url(#crystalReflect)"
          />
        </svg>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: HERO TEXT & FROSTED GLASS TESTIMONIAL CARD  */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 space-y-7 text-left">
            
            {/* Eyebrow: "Hey I am ModelDeck" */}
            <div className="inline-flex items-center gap-2">
              <span className="text-sm md:text-base font-medium text-[#c9b9ad] tracking-wide">
                Hey I am
              </span>
              <span className="text-sm md:text-base font-bold text-[#ff5722] tracking-wide">
                ModelDeck
              </span>
            </div>

            {/* Huge Headline: "Frontier AI Deck" (Exact Reference Typography) */}
            <div className="space-y-2">
              <h1 className="text-5xl sm:text-7xl lg:text-[5.4rem] font-bold tracking-tight text-[#faf5ef] leading-[1.02] text-balance">
                Frontier AI Deck
              </h1>
            </div>

            {/* Punchy Subtitle */}
            <p className="text-base sm:text-lg text-[#b8a79b] leading-relaxed max-w-xl font-normal text-balance">
              Route, benchmark, and orchestrate all frontier models with direct hardware speed and zero middleman telemetry.
            </p>

            {/* CTAs: Warm Solid Orange Pill Button + Rounded Frosted Square Button */}
            <div className="flex items-center gap-4 pt-1">
              {/* Primary Solid Orange Pill CTA (like "Hire Me" in reference) */}
              <a
                href="#playground"
                onClick={scrollToPlayground}
                className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#ff5722] hover:bg-[#ff6d3d] px-8 py-3.5 text-sm font-bold text-[#1a0a04] shadow-xl shadow-[#ff5722]/30 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              >
                <span>Launch Playground</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>

              {/* Secondary Frosted Glass Icon Button (like envelope in reference) */}
              <button
                onClick={copyQuickCurl}
                title="Copy quick evaluation command"
                aria-label="Copy evaluation command"
                className="inline-flex items-center justify-center h-12 w-12 rounded-2xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-[#faf5ef] transition-all duration-200 backdrop-blur-md shadow-md active:scale-95"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-emerald-400" />
                ) : (
                  <Terminal className="h-5 w-5 text-[#ff7043]" />
                )}
              </button>

              {copied && (
                <span className="text-xs font-mono text-emerald-400 animate-in fade-in duration-200">
                  curl command copied!
                </span>
              )}
            </div>

            {/* Subtle Hairline Divider (Matching Reference) */}
            <div className="w-full max-w-md h-px bg-gradient-to-r from-white/15 via-white/5 to-transparent pt-1" />

            {/* FROSTED GLASS TESTIMONIAL CARD (EXACT REPLICA FROM REFERENCE) */}
            <div className="relative max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl shadow-2xl shadow-black/60 transition-transform duration-300 hover:scale-[1.01]">
              {/* Warm Quote Mark Icon */}
              <div className="text-3xl font-serif text-[#ff5722] leading-none select-none mb-2 font-bold">
                “
              </div>

              {/* Quote Body */}
              <p className="text-xs sm:text-sm text-[#ddd0c6] leading-relaxed font-normal mb-4">
                ModelDeck replaced 5 different SaaS subscriptions. Testing prompts across GPT-5, Claude 3.7, and Gemini in real-time gives us immediate engineering clarity.
              </p>

              {/* Author & Verification Info */}
              <div className="flex items-center gap-3 pt-1 border-t border-white/[0.08]">
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ff5722] to-[#b43403] text-white font-bold text-xs shadow-md">
                  <span>ER</span>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#120a07]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#faf5ef]">
                    Dr. Elena Rostova
                  </span>
                  <span className="text-[11px] text-[#9e8f84] font-medium">
                    VP of AI Infrastructure · Synthetix
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: THE CONCENTRIC ORBITAL AI REACTOR           */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 flex items-center justify-center relative min-h-[460px] sm:min-h-[540px]">
            
            {/* The Concentric Circular Orbital Rings */}
            <div className="relative w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] md:w-[500px] md:h-[500px] flex items-center justify-center">
              
              {/* Outer Ring 3 (500px diameter) */}
              <div className="absolute inset-0 rounded-full border border-white/[0.07] animate-spin" style={{ animationDuration: "80s" }}>
                <div className="absolute top-1/2 left-0 w-1.5 h-1.5 rounded-full bg-[#ff5722]/40" />
                <div className="absolute top-0 left-1/2 w-1.5 h-1.5 rounded-full bg-[#ff5722]/40" />
              </div>

              {/* Middle Ring 2 (380px diameter) */}
              <div className="absolute inset-8 sm:inset-10 rounded-full border border-[#ff5722]/20 animate-spin" style={{ animationDuration: "50s", animationDirection: "reverse" }}>
                <div className="absolute bottom-6 right-10 w-2 h-2 rounded-full bg-[#ff5722]/60 blur-[1px]" />
              </div>

              {/* Inner Ring 1 (250px diameter) */}
              <div className="absolute inset-20 sm:inset-24 rounded-full border border-white/[0.09]" />

              {/* CENTRAL NEURAL CORE (Glowing 3D ModelDeck Reactor Sphere) */}
              <div className="relative z-20 flex flex-col items-center justify-center w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br from-[#2a1710] via-[#1a0e0a] to-[#0c0807] border border-[#ff5722]/40 shadow-[0_0_80px_rgba(255,87,34,0.45)] group cursor-pointer transition-transform duration-300 hover:scale-105">
                {/* Internal Pulsing Aura */}
                <div className="absolute inset-2 rounded-full bg-radial from-[#ff5722]/25 to-transparent animate-pulse" />

                {/* Central Brand Emblem */}
                <div className="relative z-10 flex flex-col items-center text-center p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff5722] to-[#ea580c] shadow-lg shadow-[#ff5722]/40 mb-2">
                    <Sparkles className="h-5 w-5 text-white animate-spin" style={{ animationDuration: "12s" }} />
                  </div>
                  <span className="text-xs font-black tracking-wider text-[#faf5ef] uppercase">
                    MODELDECK
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-mono font-semibold text-[#ff8a50] tracking-tight">
                      9 ENGINES ONLINE
                    </span>
                  </div>
                </div>
              </div>

              {/* FLOATING OFFICIAL AI PROVIDER BADGES ALONG THE ORBITAL PATHS */}
              {ORBITAL_ENGINES.map((engine) => {
                // Calculate position on ring
                const rad = (engine.angleDeg * Math.PI) / 180;
                // Distances depending on ring tier
                const radiusPx = engine.ring === 1 ? 100 : engine.ring === 2 ? 165 : 220;
                // Coordinates offset from center (in percentage for responsiveness)
                const x = Math.cos(rad) * radiusPx;
                const y = Math.sin(rad) * radiusPx;

                return (
                  <div
                    key={engine.id}
                    onMouseEnter={() => setHoveredEngine(engine)}
                    onMouseLeave={() => setHoveredEngine(null)}
                    className="absolute z-30 transition-all duration-300 hover:scale-125 hover:z-40"
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                  >
                    {/* 3D Frosted Glass Squircle Badge */}
                    <div
                      className="group relative flex h-13 w-13 sm:h-15 sm:w-15 items-center justify-center rounded-2xl border p-2.5 backdrop-blur-xl shadow-xl transition-all duration-300 cursor-pointer"
                      style={{
                        backgroundColor: "rgba(24, 14, 10, 0.85)",
                        borderColor: hoveredEngine?.id === engine.id ? engine.color : "rgba(255, 255, 255, 0.15)",
                        boxShadow:
                          hoveredEngine?.id === engine.id
                            ? `0 12px 30px -4px ${engine.color}66, 0 0 20px ${engine.color}40`
                            : "0 10px 25px -5px rgba(0,0,0,0.6)",
                      }}
                    >
                      {/* Icon */}
                      {engine.icon}

                      {/* Small Live Status Dot */}
                      <span
                        className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-[#0c0807]"
                        style={{ backgroundColor: engine.color }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Interactive Telemetry Tooltip for Hovered Engine */}
              {hoveredEngine && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-40 bg-[#1e110c]/95 border border-[#ff5722]/30 px-4 py-2 rounded-xl backdrop-blur-xl shadow-2xl text-center pointer-events-none animate-in fade-in zoom-in-95 duration-200 whitespace-nowrap">
                  <div className="flex items-center gap-2 justify-center">
                    <span className="font-bold text-xs text-[#faf5ef]">
                      {hoveredEngine.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-[#ff8a50]">
                      {hoveredEngine.badge}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#a8998e] block mt-0.5">
                    {hoveredEngine.spec}
                  </span>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
