"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  Sparkles,
  Play,
  RotateCcw,
  Check,
  Copy,
  ArrowRight,
  BrainCircuit,
  Cpu,
  Lock,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  OpenAIIcon,
  AnthropicIcon,
  GeminiIcon,
  GroqIcon,
  DeepSeekIcon,
} from "@/components/ui/ProviderMark";

interface ModelPresetResponse {
  modelId: string;
  modelName: string;
  provider: string;
  color: string;
  icon: React.ReactNode;
  speedTokPerSec: number;
  ttftMs: number;
  tokensTotal: number;
  thoughtTrace?: string;
  response: string;
}

interface PromptPreset {
  id: string;
  title: string;
  prompt: string;
  models: Record<string, ModelPresetResponse>;
}

const PLAYGROUND_PRESETS: PromptPreset[] = [
  {
    id: "redis-limiter",
    title: "Distributed Rate Limiter",
    prompt: "Write a high-concurrency Redis sliding window rate limiter in TypeScript with local fallback.",
    models: {
      "groq": {
        modelId: "groq-llama-33",
        modelName: "Llama 3.3 70B",
        provider: "Groq LPU",
        color: "#f97316",
        icon: <GroqIcon className="h-4 w-4 text-[#f97316]" />,
        speedTokPerSec: 512,
        ttftMs: 19,
        tokensTotal: 340,
        response: `export class SlidingWindowLimiter {
  constructor(
    private readonly redis: RedisClient,
    private readonly windowMs: number = 60_000,
    private readonly maxRequests: number = 100
  ) {}

  async check(key: string): Promise<{ allowed: boolean; remaining: number }> {
    const now = Date.now();
    const clearBefore = now - this.windowMs;
    const redisKey = \`rl:\${key}\`;

    try {
      const p = this.redis.multi();
      p.zremrangebyscore(redisKey, 0, clearBefore);
      p.zadd(redisKey, now, \`\${now}:\${Math.random().toString(36).slice(2, 7)}\`);
      p.zcard(redisKey);
      p.expire(redisKey, Math.ceil(this.windowMs / 1000));
      const res = await p.exec();
      const count = (res?.[2]?.[1] as number) || 0;
      return { allowed: count <= this.maxRequests, remaining: Math.max(0, this.maxRequests - count) };
    } catch {
      return { allowed: true, remaining: 1 }; // graceful degradation
    }
  }
}`,
      },
      "claude": {
        modelId: "claude-37",
        modelName: "Claude 3.7 Sonnet",
        provider: "Anthropic",
        color: "#d97706",
        icon: <AnthropicIcon className="h-4 w-4 text-[#d97706]" />,
        speedTokPerSec: 74,
        ttftMs: 175,
        tokensTotal: 385,
        thoughtTrace: "Analyzing concurrency race conditions: A multi/exec pipeline eliminates round trips. However, under high clock drift across app servers, epoch millisecond resolution needs jitter to prevent sorted-set collision.",
        response: `import type { Redis } from "ioredis";

export interface RateLimitResult {
  isAllowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

export class ProductionRateLimiter {
  constructor(
    private readonly redis: Redis,
    private readonly capacity = 100,
    private readonly intervalMs = 60_000
  ) {}

  async evaluate(identity: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.intervalMs;
    const key = \`ratelimit:\${identity}\`;

    const [_, __, currentCount] = (await this.redis
      .pipeline()
      .zremrangebyscore(key, 0, windowStart)
      .zadd(key, now, \`\${now}:\${crypto.randomUUID()}\`)
      .zcard(key)
      .pexpire(key, this.intervalMs)
      .exec()) as [null, number][];

    const total = currentCount?.[1] ?? 0;
    return {
      isAllowed: total <= this.capacity,
      limit: this.capacity,
      remaining: Math.max(0, this.capacity - total),
      resetMs: this.intervalMs
    };
  }
}`,
      },
      "deepseek": {
        modelId: "deepseek-r1",
        modelName: "DeepSeek R1",
        provider: "DeepSeek",
        color: "#3b82f6",
        icon: <DeepSeekIcon className="h-4 w-4 text-[#3b82f6]" />,
        speedTokPerSec: 46,
        ttftMs: 310,
        tokensTotal: 410,
        thoughtTrace: "First thought: standard token bucket vs sliding window log. Sliding log has exact precision O(N). To prevent memory exhaustion under DDoS, we should enforce a hard cap before zadd.",
        response: `// DeepSeek R1 Deliberation-Verified Implementation
export class MemorySafeSlidingWindow {
  private static readonly LUA_SCRIPT = \`
    local key = KEYS[1]
    local now = tonumber(ARGV[1])
    local window = tonumber(ARGV[2])
    local limit = tonumber(ARGV[3])
    local clearBefore = now - window
    
    redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)
    local current = redis.call('ZCARD', key)
    if current < limit then
      redis.call('ZADD', key, now, ARGV[4])
      redis.call('PEXPIRE', key, window)
      return {1, limit - current - 1}
    else
      return {0, 0}
    end
  \`;
  // Atomic single round-trip execution eliminates race conditions.
}`,
      },
    },
  },
  {
    id: "rag-eval",
    title: "RAG Chunking Architecture",
    prompt: "Compare hierarchical parent-document retrieval vs late chunking for production technical docs.",
    models: {
      "groq": {
        modelId: "groq-llama-33",
        modelName: "Llama 3.3 70B",
        provider: "Groq LPU",
        color: "#f97316",
        icon: <GroqIcon className="h-4 w-4 text-[#f97316]" />,
        speedTokPerSec: 495,
        ttftMs: 22,
        tokensTotal: 290,
        response: `### Summary Trade-offs
1. **Parent-Document Retrieval**: Best for hierarchical codebases (stores 100-token child vectors, returns 1000-token parent context).
2. **Late Chunking**: Computes token embeddings across the entire document prior to pooling, maintaining long-range semantic coherence.

**Verdict**: Use Late Chunking if you have long technical manuals; use Parent-Document if you need precise code line attribution.`,
      },
      "claude": {
        modelId: "claude-37",
        modelName: "Claude 3.7 Sonnet",
        provider: "Anthropic",
        color: "#d97706",
        icon: <AnthropicIcon className="h-4 w-4 text-[#d97706]" />,
        speedTokPerSec: 72,
        ttftMs: 190,
        tokensTotal: 340,
        thoughtTrace: "Evaluating attention preservation: Late chunking resolves the boundary clipping problem where sentences split across chunk windows lose relational grounding.",
        response: `### Architectural Decision Matrix

| Dimension | Hierarchical Parent-Doc | Late Chunking (Jina/ColBERT) |
| :--- | :--- | :--- |
| **Indexing Latency** | Low (independent chunks) | Medium (full doc attention pass) |
| **Contextual Loss** | Moderate at chunk edges | Near zero (global attention) |
| **Storage Footprint** | Dual index (child + parent) | Standard vector index |
| **Metadata Filtering** | Native per hierarchy | Inherited from parent |

**Recommendation**: For API documentation and monorepos, late chunking drastically reduces false-positive embedding collisions.`,
      },
      "deepseek": {
        modelId: "deepseek-r1",
        modelName: "DeepSeek R1",
        provider: "DeepSeek",
        color: "#3b82f6",
        icon: <DeepSeekIcon className="h-4 w-4 text-[#3b82f6]" />,
        speedTokPerSec: 48,
        ttftMs: 335,
        tokensTotal: 360,
        thoughtTrace: "Late chunking preserves cross-chunk references (e.g. variable declarations 40 lines earlier). The trade-off is computational overhead during re-indexing.",
        response: `### Deep Analysis
Late chunking shifts context awareness to embedding time rather than retrieval time. Because transformer self-attention runs over the full sequence first, tokens at the start of a chunk encode dependencies from previous chapters.

For mission-critical production systems:
1. Deploy **Late Chunking** for dense architecture documentation.
2. Pair with **BM25 hybrid sparse retrieval** for exact symbol lookups.`,
      },
    },
  },
];

export function InteractivePlaygroundSection() {
  const [selectedPreset, setSelectedPreset] = useState(PLAYGROUND_PRESETS[0]);
  const [activePrompt, setActivePrompt] = useState(PLAYGROUND_PRESETS[0].prompt);
  const [isRunning, setIsRunning] = useState(false);
  const [streamProgress, setStreamProgress] = useState(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({
    claude: true,
    deepseek: true,
  });

  const handleSelectPreset = (preset: PromptPreset) => {
    setSelectedPreset(preset);
    setActivePrompt(preset.prompt);
    triggerRunSimulation();
  };

  const triggerRunSimulation = () => {
    setIsRunning(true);
    setStreamProgress(0.1);

    const interval = setInterval(() => {
      setStreamProgress((prev) => {
        if (prev >= 1) {
          clearInterval(interval);
          setIsRunning(false);
          return 1;
        }
        return prev + 0.15;
      });
    }, 120);
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  const toggleThought = (key: string) => {
    setExpandedThoughts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section
      id="playground"
      className="relative py-24 sm:py-32 bg-[#0a0605] text-[#faf5ef] border-t border-white/[0.06] overflow-hidden"
    >
      {/* Background warm ambient spot */}
      <div
        className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 blur-[150px]"
        style={{
          background: "radial-gradient(circle, #ff5722 0%, rgba(10,6,5,0) 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        
        {/* Section Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c100b] border border-amber-900/50 text-[11px] font-mono font-semibold text-[#ff8a50]">
            <Layers className="h-3.5 w-3.5 text-[#ff5722]" />
            <span>02 / LIVE IN-PAGE PLAYGROUND</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#faf5ef]">
            Side-by-Side Inference. Zero Setup Required.
          </h2>
          <p className="text-sm sm:text-base text-[#ab9b8f]">
            Test prompts across multiple engines at once. Watch real-time token throughput, time-to-first-token (TTFT), and reasoning deliberation traces in real-time.
          </p>
        </div>

        {/* Prompt Selector Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-mono text-[#8f7f74] mr-2">PRESETS:</span>
          {PLAYGROUND_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all duration-200 ${
                selectedPreset.id === p.id
                  ? "bg-[#ff5722] text-[#140a06] border-[#ff5722] font-bold shadow-md shadow-[#ff5722]/30"
                  : "bg-[#160e0a] text-[#c2b2a5] border-white/10 hover:border-white/20 hover:text-white"
              }`}
            >
              {p.title}
            </button>
          ))}

          <Link
            href="/playground"
            className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold text-[#ff8a50] hover:text-[#ffa775] transition-colors"
          >
            <span>Open Full Deck Workspace</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Prompt Input Box */}
        <div className="relative rounded-2xl border border-white/15 bg-[#140c09] p-4 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 flex items-center gap-3 bg-[#1e130e] border border-white/10 rounded-xl px-4 py-3">
              <Sparkles className="h-4 w-4 text-[#ff5722] shrink-0" />
              <input
                type="text"
                value={activePrompt}
                onChange={(e) => setActivePrompt(e.target.value)}
                placeholder="Type any prompt to compare across models..."
                className="w-full bg-transparent text-sm text-[#faf5ef] placeholder-[#7d6e64] focus:outline-none"
              />
            </div>

            <button
              onClick={triggerRunSimulation}
              disabled={isRunning}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff5722] to-[#ea580c] hover:from-[#ff6b35] hover:to-[#f97316] px-6 py-3 text-xs font-bold text-[#140a06] shadow-lg shadow-[#ff5722]/25 transition-all duration-200 active:scale-95 disabled:opacity-60"
            >
              {isRunning ? (
                <>
                  <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                  <span>Streaming Tokens...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Run Comparison</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3-Column Comparative Output Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Object.entries(selectedPreset.models).map(([key, model]) => {
            const visibleLength = Math.floor(model.response.length * streamProgress);
            const displayedText = model.response.slice(0, visibleLength);

            return (
              <div
                key={key}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#140d0a]/80 backdrop-blur-xl shadow-xl overflow-hidden transition-all duration-200 hover:border-amber-700/50"
              >
                {/* Header with Provider Mark & Live Telemetry */}
                <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#1a100c] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-white/[0.04]">
                      {model.icon}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#faf5ef] block leading-tight">
                        {model.modelName}
                      </span>
                      <span className="text-[10px] font-mono text-[#8f7f74]">
                        {model.provider}
                      </span>
                    </div>
                  </div>

                  {/* Telemetry pill */}
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="text-[#ff7043] flex items-center gap-1 font-bold">
                      <Zap className="h-3 w-3" />
                      {model.speedTokPerSec} tok/s
                    </span>
                    <span className="text-[#7d6e64]">•</span>
                    <span className="text-[#a8998e]">{model.ttftMs}ms TTFT</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col space-y-4">
                  {/* Thought trace for reasoning models */}
                  {model.thoughtTrace && (
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.04] p-3 text-xs">
                      <button
                        onClick={() => toggleThought(key)}
                        className="flex items-center justify-between w-full text-blue-400 font-mono text-[11px] font-semibold"
                      >
                        <div className="flex items-center gap-1.5">
                          <BrainCircuit className="h-3.5 w-3.5" />
                          <span>Thinking Deliberation Trace</span>
                        </div>
                        {expandedThoughts[key] ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {expandedThoughts[key] && (
                        <p className="mt-2 text-[#9ab3d6] font-mono text-[10px] leading-relaxed italic border-t border-blue-500/10 pt-2">
                          {model.thoughtTrace}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Response Text / Code block */}
                  <div className="flex-1 font-mono text-xs text-[#ddd2c7] leading-relaxed whitespace-pre-wrap bg-[#0d0705] p-3.5 rounded-xl border border-white/[0.05] overflow-x-auto">
                    {displayedText}
                    {isRunning && <span className="inline-block w-1.5 h-3.5 bg-[#ff5722] ml-1 animate-pulse" />}
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="flex items-center justify-between border-t border-white/[0.06] bg-[#120a07] px-4 py-2.5 text-[11px] font-mono text-[#8f7f74]">
                  <span>{model.tokensTotal} tokens</span>

                  <button
                    onClick={() => copyToClipboard(model.response, key)}
                    className="inline-flex items-center gap-1 text-[#c2b2a5] hover:text-[#faf5ef] transition-colors"
                  >
                    {copiedKey === key ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

