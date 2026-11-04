"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  BrainCircuit,
  Cpu,
  Sparkles,
  ArrowRight,
  Play,
  RotateCcw,
  Check,
  Code2,
  Lock,
} from "lucide-react";

interface DemoPreset {
  id: string;
  name: string;
  provider: string;
  category: string;
  badge: string;
  badgeColor: string;
  ttft: number;
  speed: number;
  userPrompt: string;
  thought?: string;
  response: string;
}

const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "groq-speed",
    name: "Llama 3.3 70B Versatile",
    provider: "Groq LPU",
    category: "Lightning Inference",
    badge: "128 tok/s",
    badgeColor: "text-amber-500 bg-amber-500/10 border-amber-500/25",
    ttft: 18,
    speed: 128,
    userPrompt: "Write a high-concurrency Redis sliding window rate limiter in TypeScript with memory fallback.",
    response: `\`\`\`typescript
export class DistributedRateLimiter {
  constructor(
    private readonly redis: RedisClient,
    private readonly windowMs: number = 60_000,
    private readonly maxRequests: number = 100
  ) {}

  async checkLimit(clientIp: string): Promise<{ allowed: boolean; remaining: number }> {
    const now = Date.now();
    const clearBefore = now - this.windowMs;
    const key = \`rate_limit:\${clientIp}\`;

    try {
      const pipeline = this.redis.multi();
      pipeline.zremrangebyscore(key, 0, clearBefore);
      pipeline.zadd(key, now, \`\${now}:\${Math.random()}\`);
      pipeline.zcard(key);
      pipeline.expire(key, Math.ceil(this.windowMs / 1000));

      const results = await pipeline.exec();
      const count = results?.[2]?.[1] as number || 0;
      return {
        allowed: count <= this.maxRequests,
        remaining: Math.max(0, this.maxRequests - count)
      };
    } catch {
      return this.memoryFallback(clientIp, now);
    }
  }
}
\`\`\``,
  },
  {
    id: "deepseek-reason",
    name: "DeepSeek R1 Thinking",
    provider: "DeepSeek",
    category: "Deliberation Trace",
    badge: "64k Reasoning",
    badgeColor: "text-purple-500 bg-purple-500/10 border-purple-500/25",
    ttft: 340,
    speed: 46,
    userPrompt: "Solve: A farmer must cross a river with a wolf, goat, and cabbage. What is the optimal sequence?",
    thought: `Analyzing boundary states:
1. (Wolf + Goat) unsupervised -> Wolf consumes Goat.
2. (Goat + Cabbage) unsupervised -> Goat consumes Cabbage.
3. Solution path: Must carry the Goat first, isolating Wolf and Cabbage.
4. On return 1: Farmer comes back empty.
5. Cross 2: Take Wolf over, but cannot leave Wolf and Goat together.
6. Swap move: Bring Goat BACK to initial bank, leave it, take Cabbage over.
7. Cross 3: Take Cabbage over to Wolf bank.
8. Final: Return empty, retrieve Goat. Minimum crossings = 7.`,
    response: `The minimum sequence requires **7 one-way crossings**:

1. **Farmer takes Goat across** *(Wolf & Cabbage remain safe on initial bank)*
2. **Farmer returns alone**
3. **Farmer takes Wolf across**
4. **Farmer brings Goat back** *(Crucial swap move: prevents Wolf eating Goat)*
5. **Farmer takes Cabbage across** *(Wolf & Cabbage safely left together)*
6. **Farmer returns alone**
7. **Farmer takes Goat across**

All items arrive safely without any predation event.`,
  },
  {
    id: "claude-arch",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    category: "Full Architecture",
    badge: "Frontier Logic",
    badgeColor: "text-blue-500 bg-blue-500/10 border-blue-500/25",
    ttft: 180,
    speed: 72,
    userPrompt: "Design a zero-downtime database migration architecture for multi-tenant Postgres.",
    response: `### Dual-Write Expand-and-Contract Migration Architecture

\`\`\`
[Clients] ---> [API Gateway / Service Layer]
                     |
       +-------------+-------------+
       | (Reads)                   | (Dual Writes via Outbox)
       v                           v
 [Legacy Schema]            [Target Schema]
       ^                           |
       |----- (Backfill Worker) ---+
\`\`\`

1. **Phase 1: Expand (Additive Schema DDL)**: Add nullable columns or new tables with zero locks using \`CONCURRENTLY\`.
2. **Phase 2: Dual-Writing**: Application writes synchronously to both tables or pushes changes to a transactional outbox.
3. **Phase 3: Asynchronous Backfill**: Background worker streams historical records with watermark checkpointing.
4. **Phase 4: Contract**: Switch primary read traffic to new schema, remove legacy columns. Zero client disruption.`,
  },
];

export function LiveTerminalDemo() {
  const [activeTab, setActiveTab] = useState(DEMO_PRESETS[0].id);
  const [streamIndex, setStreamIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [reasoningExpanded, setReasoningExpanded] = useState(true);

  const preset = DEMO_PRESETS.find((p) => p.id === activeTab) || DEMO_PRESETS[0];

  // Simulated live typing stream effect
  useEffect(() => {
    setStreamIndex(preset.response.length);
  }, [activeTab]);

  const handleSimulate = () => {
    setIsSimulating(true);
    setStreamIndex(0);
    let current = 0;
    const fullText = preset.response;
    const interval = setInterval(() => {
      current += 15;
      if (current >= fullText.length) {
        setStreamIndex(fullText.length);
        setIsSimulating(false);
        clearInterval(interval);
      } else {
        setStreamIndex(current);
      }
    }, 25);
  };

  return (
    <section id="interactive-demo" className="py-12 sm:py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">
            <Zap className="h-3.5 w-3.5" />
            <span>INTERACTIVE TERMINAL PREVIEW</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
            Experience Real-Time Velocity &amp; Thinking
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Switch models below to simulate live token generation, raw deliberation chains, and millisecond latency telemetry.
          </p>
        </div>

        {/* Double-Bezel Interactive Terminal Container */}
        <div className="double-bezel">
          <div className="double-bezel-inner overflow-hidden shadow-2xl">
            {/* Terminal Window Header Bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-border/80 bg-surface-2/90 px-4 py-3 gap-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="text-xs font-mono font-bold text-foreground ml-2">modeldeck-telemetry://live</span>
              </div>

              {/* Model Switcher Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {DEMO_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveTab(p.id)}
                    className={`btn-tactile px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                      activeTab === p.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-surface-1 border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Telemetry HUD Bar */}
            <div className="bg-surface-1 border-b border-border/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-md border font-semibold ${preset.badgeColor}`}>
                  {preset.badge}
                </span>
                <span className="text-muted-foreground">
                  TTFT: <strong className="text-foreground">{preset.ttft}ms</strong>
                </span>
                <span className="text-muted-foreground">
                  Velocity: <strong className="text-blue-500">{preset.speed} tok/s</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSimulate}
                  disabled={isSimulating}
                  className="btn-tactile flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-2 border border-border text-foreground hover:bg-surface-3 transition-colors text-[11px] font-semibold"
                >
                  <RotateCcw className={`h-3 w-3 ${isSimulating ? "animate-spin" : ""}`} />
                  <span>Re-stream</span>
                </button>

                <Link
                  href="/playground"
                  className="btn-tactile flex items-center gap-1 px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-colors text-[11px] font-bold"
                >
                  <span>Open in Playground</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Prompt & Output Display Area */}
            <div className="p-5 sm:p-7 space-y-5 bg-surface-1/50 min-h-[380px]">
              {/* User Prompt */}
              <div className="flex items-start gap-3 bg-surface-2/60 border border-border rounded-xl p-3.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shrink-0 mt-0.5">
                  U
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-blue-500">
                    User Query
                  </span>
                  <p className="text-sm font-medium text-foreground">{preset.userPrompt}</p>
                </div>
              </div>

              {/* Reasoning Accordion (if DeepSeek R1) */}
              {preset.thought && (
                <div className="rounded-xl border border-purple-500/30 bg-purple-950/15 overflow-hidden text-xs">
                  <button
                    onClick={() => setReasoningExpanded(!reasoningExpanded)}
                    className="w-full flex items-center justify-between px-3.5 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="h-4 w-4" />
                      <span>DeepSeek R1 Internal Reasoning Trace</span>
                      <span className="text-[10px] font-mono text-purple-400">({preset.thought.length} chars)</span>
                    </div>
                    <span className="text-xs">{reasoningExpanded ? "▲ Hide" : "▼ Expand"}</span>
                  </button>

                  {reasoningExpanded && (
                    <div className="p-3.5 font-mono text-xs text-purple-700 dark:text-purple-200/90 whitespace-pre-wrap leading-relaxed border-t border-purple-500/20 bg-black/40">
                      {preset.thought}
                    </div>
                  )}
                </div>
              )}

              {/* Streaming Output */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-muted-foreground">
                  <Cpu className="h-4 w-4 text-blue-500" />
                  <span>{preset.name} Response</span>
                  {isSimulating && (
                    <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                  )}
                </div>

                <div className="p-4 rounded-xl bg-surface-2/40 border border-border font-mono text-xs sm:text-[13px] leading-relaxed text-foreground overflow-x-auto whitespace-pre-wrap">
                  {preset.response.slice(0, streamIndex)}
                  {isSimulating && <span className="streaming-cursor" />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

