"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Sparkles,
  Sliders,
  Send,
  Code2,
  Check,
  Copy,
  ArrowRight,
  Shield,
  Cpu,
  Layers,
} from "lucide-react";

interface PersonaPreset {
  id: string;
  title: string;
  roleTag: string;
  temperature: number;
  systemPrompt: string;
  sampleQuestion: string;
  sampleAnswer: string;
}

const PERSONA_PRESETS: PersonaPreset[] = [
  {
    id: "architect",
    title: "Staff Systems Architect",
    roleTag: "High Concurrency & Distributed Systems",
    temperature: 0.2,
    systemPrompt:
      "You are a Staff Distributed Systems Architect. Evaluate trade-offs using rigorous engineering heuristics: latency, network partitioning (CAP), and idempotency. Be concise, direct, and provide concrete failure modes.",
    sampleQuestion: "How should we structure event deduplication in a high-throughput payment webhook pipeline?",
    sampleAnswer:
      "Deploy a 2-stage verification: First, evaluate an idempotent Redis SETNX key (`lock:event:{id}`, TTL 120s). Second, write to an append-only PostgreSQL outbox table with an explicit UNIQUE constraint on `event_id`. This prevents double-capture even during worker node partition.",
  },
  {
    id: "security",
    title: "Security & Penetration Auditor",
    roleTag: "Zero-Trust & Cryptographic Hardening",
    temperature: 0.1,
    systemPrompt:
      "You are a Principal Security Engineer. Audit APIs, JWT workflows, and cloud policies for race conditions, SSRF, and authorization bypasses (BOLA/IDOR).",
    sampleQuestion: "Is passing encrypted API keys via local storage vulnerable to XSS extraction?",
    sampleAnswer:
      "Yes. If an XSS payload executes, it accesses `window.crypto.subtle` and local storage in the same origin. Hardening: Store keys in Web Worker isolated memory or use ephemeral signed session tokens with `HttpOnly`, `SameSite=Strict` cookies.",
  },
  {
    id: "product",
    title: "Product Growth Strategist",
    roleTag: "Retention, Onboarding & UX Velocity",
    temperature: 0.7,
    systemPrompt:
      "You are a Senior Product Strategist. Focus on time-to-value (TTV), frictionless user activation, and developer viral loops.",
    sampleQuestion: "How do we reduce onboarding drop-off for a developer tool requiring API keys?",
    sampleAnswer:
      "Provide a zero-friction 'Guest Sandbox' with pre-loaded mock credits or a free Groq/Google AI Studio key generator directly in the UI. Let them run their first comparative prompt before requesting their personal API key.",
  },
];

export function StudioForgeSection() {
  const [selectedPersona, setSelectedPersona] = useState<PersonaPreset>(PERSONA_PRESETS[0]);
  const [temperature, setTemperature] = useState(PERSONA_PRESETS[0].temperature);
  const [chatInput, setChatInput] = useState(PERSONA_PRESETS[0].sampleQuestion);
  const [chatMessages, setChatMessages] = useState<
    { sender: "user" | "bot"; text: string }[]
  >([
    { sender: "user", text: PERSONA_PRESETS[0].sampleQuestion },
    { sender: "bot", text: PERSONA_PRESETS[0].sampleAnswer },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const handleSelectPersona = (p: PersonaPreset) => {
    setSelectedPersona(p);
    setTemperature(p.temperature);
    setChatMessages([
      { sender: "user", text: p.sampleQuestion },
      { sender: "bot", text: p.sampleAnswer },
    ]);
    setChatInput(p.sampleQuestion);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || isTyping) return;

    const userText = chatInput;
    setChatInput("");
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setIsTyping(true);

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `[${selectedPersona.title} Perspective · Temp ${temperature}]\n\nDirect response: When scaling ${userText.slice(0, 30)}..., prioritize decoupling asynchronous processing from synchronous request-response loops. Ensure strict telemetry tracing on all edge boundaries.`,
        },
      ]);
      setIsTyping(false);
    }, 700);
  };

  const copyEmbedSnippet = async () => {
    const snippet = `<script src="https://cdn.modeldeck.dev/agent-embed.js" data-agent="${selectedPersona.id}" defer></script>`;
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    } catch {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    }
  };

  return (
    <section
      id="studio"
      className="relative py-24 sm:py-32 bg-[#0c0807] text-[#faf5ef] border-t border-white/[0.06]"
    >
      {/* Background warm ambient spot */}
      <div
        className="absolute top-1/3 left-1/3 w-[550px] h-[550px] rounded-full pointer-events-none opacity-20 blur-[140px]"
        style={{
          background: "radial-gradient(circle, #ea580c 0%, rgba(12,8,7,0) 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.08] pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c100b] border border-amber-900/50 text-[11px] font-mono font-semibold text-[#ff8a50]">
              <Bot className="h-3.5 w-3.5 text-[#ff5722]" />
              <span>03 / ASSISTANT STUDIO &amp; PERSONA FORGE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#faf5ef]">
              Forge Specialized Agents. Embed Anywhere.
            </h2>
            <p className="text-sm sm:text-base text-[#ab9b8f]">
              Craft custom personas, tune inference parameters, and preview conversational behavior directly on this page before 1-click deployment.
            </p>
          </div>

          <Link
            href="/studio"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#160e0a] hover:bg-[#20140e] px-5 py-2.5 text-xs font-bold text-[#faf5ef] transition-all hover:border-[#ff5722]"
          >
            <span>Open Full Studio Workspace</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#ff5722]" />
          </Link>
        </div>

        {/* Studio Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Persona Configuration Controls */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Persona Switcher Chips */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-[#8f7f74] uppercase tracking-wider block">
                Select Persona Blueprint
              </label>
              <div className="grid grid-cols-1 gap-2">
                {PERSONA_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPersona(p)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200 ${
                      selectedPersona.id === p.id
                        ? "bg-[#1f120c] border-[#ff5722] text-[#faf5ef] shadow-lg shadow-[#ff5722]/15"
                        : "bg-[#140d0a]/70 border-white/[0.08] text-[#c2b2a5] hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs block">{p.title}</span>
                      <span className="text-[10px] font-mono text-[#8f7f74]">
                        {p.roleTag}
                      </span>
                    </div>
                    {selectedPersona.id === p.id && (
                      <span className="flex h-2 w-2 rounded-full bg-[#ff5722]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Temperature Slider */}
            <div className="rounded-xl border border-white/[0.08] bg-[#140d0a]/70 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#c2b2a5] flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-[#ff7043]" />
                  Temperature Dial
                </span>
                <span className="text-[#ff8a50] font-bold">{temperature.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-[#ff5722] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#7d6e64]">
                <span>Deterministic (0.0)</span>
                <span>Creative (1.0)</span>
              </div>
            </div>

            {/* System Instruction Box */}
            <div className="rounded-xl border border-white/[0.08] bg-[#140d0a]/70 p-4 space-y-2">
              <label className="text-xs font-mono font-semibold text-[#8f7f74] uppercase tracking-wider block">
                System Prompt Instructions
              </label>
              <textarea
                rows={4}
                readOnly
                value={selectedPersona.systemPrompt}
                className="w-full rounded-lg bg-[#0d0705] border border-white/[0.06] p-3 text-xs font-mono text-[#ddd2c7] leading-relaxed resize-none focus:outline-none"
              />
            </div>

            {/* 1-Click Embed Snippet */}
            <div className="rounded-xl border border-amber-900/40 bg-[#1a100c]/80 p-4 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#faf5ef] block">
                  Embeddable Shadow-DOM Script
                </span>
                <span className="text-[10px] font-mono text-[#8f7f74]">
                  Zero npm dependencies · &lt;12KB
                </span>
              </div>

              <button
                onClick={copyEmbedSnippet}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#ff5722] hover:text-[#140a06] text-xs font-mono text-[#faf5ef] transition-colors"
              >
                {copiedEmbed ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Script</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Right Column: Live Interactive Chat Simulator */}
          <div className="lg:col-span-7 flex flex-col h-[520px] rounded-2xl border border-white/15 bg-[#140c09] shadow-2xl overflow-hidden backdrop-blur-xl">
            
            {/* Chat Device Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#1a100c] px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff5722] to-[#ea580c] text-white shadow-md">
                  <Bot className="h-4 w-4" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-[#1a100c]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#faf5ef] block leading-tight">
                    {selectedPersona.title}
                  </span>
                  <span className="text-[10px] font-mono text-[#8f7f74]">
                    Live Interactive Preview
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                ACTIVE WEBSOCKET
              </span>
            </div>

            {/* Chat Message Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#ff5722] text-[#140a06] font-medium"
                        : "bg-[#1c120e] text-[#ddd2c7] border border-white/[0.06] font-mono whitespace-pre-wrap"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-[#1c120e] border border-white/[0.06] p-3 text-xs text-[#8f7f74] font-mono flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#ff5722] animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-[#ff5722] animate-bounce [animation-delay:0.2s]" />
                    <span className="h-2 w-2 rounded-full bg-[#ff5722] animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="border-t border-white/[0.08] bg-[#180f0b] p-3">
              <div className="flex items-center gap-2 bg-[#0e0705] border border-white/10 rounded-xl px-4 py-2.5">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask this agent anything to test persona depth..."
                  className="w-full bg-transparent text-xs text-[#faf5ef] placeholder-[#6e6056] focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  className="p-1.5 rounded-lg bg-[#ff5722] text-[#140a06] hover:bg-[#ff6d3d] transition-colors disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

