"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Globe,
  Bot,
  Sparkles,
  Send,
  Copy,
  Check,
  ExternalLink,
  GitPullRequest,
  Palette,
  Sliders,
  Code2,
  Laptop,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  ArrowRight,
  Shield,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";
import { AssistantConfig, ScrapedSiteData } from "@/lib/assistantTypes";
import { ProviderId } from "@/lib/types";
import { usePlaygroundStore } from "@/lib/store";

const PRESET_COLORS = [
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#f43f5e", // Rose
  "#06b6d4", // Cyan
  "#6366f1", // Indigo
  "#14b8a6", // Teal
];

const PRESET_AVATARS = ["🤖", "👨‍💻", "👩‍💻", "🚀", "⚡", "🧠", "💼", "🎓", "✨", "🔥"];

function renderSandboxMarkdown(raw: string): string {
  if (!raw) return "";
  let html = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<div class="my-1.5 rounded-lg bg-zinc-950 p-2 font-mono text-[11px] text-zinc-300 border border-zinc-700/60 overflow-x-auto"><span class="text-[9px] uppercase text-zinc-500 block mb-0.5 font-semibold">${lang || "code"}</span><pre><code>${code.trim()}</code></pre></div>`;
  });
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="rounded bg-zinc-950 px-1 py-0.5 font-mono text-[11px] text-blue-300 border border-zinc-700/50">$1</code>');
  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
  // Markdown links
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">$1 ↗</a>');
  // Bullet lists
  html = html.replace(/^\s*[-*]\s+(.*)$/gm, '<li class="ml-3 list-disc">$1</li>');
  // Line breaks
  html = html.replace(/\n/g, "<br/>");
  return html;
}

export function AssistantStudio({ onClose }: { onClose?: () => void }) {
  const { keyStatusMap } = usePlaygroundStore();

  // Scraper State
  const [urlInput, setUrlInput] = useState("https://github.com");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapedData, setScrapedData] = useState<ScrapedSiteData | null>(null);

  // Assistant Configuration
  const [assistant, setAssistant] = useState<AssistantConfig>({
    id: `asst-demo-${Date.now().toString(36)}`,
    name: "Alex's AI Assistant",
    title: "Portfolio Guide",
    greeting:
      "Hi there! 👋 I'm Alex's AI portfolio assistant. Ask me anything about my projects, technical skills, or experience!",
    persona: `You are the official AI representative for Alex's portfolio.
Represent Alex professionally, enthusiastically, and knowledgeably to recruiters, clients, and visitors.
Highlight key skills (Full-Stack Engineering, Next.js, TypeScript, Cloud, AI integration).
Keep responses clear, concise, and helpful with clean markdown formatting.`,
    suggestedQuestions: [
      "What are Alex's core skills?",
      "Tell me about Alex's top projects",
      "How can I contact Alex?",
    ],
    brandColor: "#3b82f6",
    avatar: "🤖",
    position: "bottom-right",
    provider: "groq",
    model: "llama-3.3-70b-versatile",
    allowedDomains: ["*"],
    websiteUrl: "https://github.com",
    createdAt: Date.now(),
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<"customize" | "embed" | "github-pr">("customize");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Live Sandbox Chat State
  const [sandboxMessages, setSandboxMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([
    {
      role: "assistant",
      content: assistant.greeting,
    },
  ]);
  const [sandboxInput, setSandboxInput] = useState("");
  const [isSandboxStreaming, setIsSandboxStreaming] = useState(false);
  const [isSandboxChatOpen, setIsSandboxChatOpen] = useState(true);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // GitHub Auto-PR State
  const [githubToken, setGithubToken] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [isCreatingPr, setIsCreatingPr] = useState(false);
  const [prResult, setPrResult] = useState<{ prUrl?: string; branch?: string; error?: string } | null>(
    null
  );

  // 1-Click Copy Snippet state
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [frameworkTab, setFrameworkTab] = useState<"html" | "nextjs" | "react" | "astro">("html");

  // Keep sandbox greeting synchronized if greeting changes
  useEffect(() => {
    setSandboxMessages((prev) => {
      if (prev.length <= 1) {
        return [{ role: "assistant", content: assistant.greeting }];
      }
      return prev;
    });
  }, [assistant.greeting]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sandboxMessages, isSandboxStreaming]);

  // Handler: Scrape & Synthesize
  const handleScrape = async (overrideUrl?: string) => {
    const targetUrl = (overrideUrl || urlInput).trim();
    if (!targetUrl) return;

    setIsScraping(true);
    setScrapeError(null);

    try {
      const res = await fetch("/api/assistant/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to analyze website");
      }

      setScrapedData(data.scrapedData);
      if (data.assistant) {
        setAssistant((prev) => ({
          ...prev,
          ...data.assistant,
          id: prev.id || data.assistant.id,
        }));
        setSandboxMessages([
          {
            role: "assistant",
            content: data.assistant.greeting,
          },
        ]);
      }

      // Celebrate synthesis!
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: unknown) {
      setScrapeError(err instanceof Error ? err.message : "Error analyzing site");
    } finally {
      setIsScraping(false);
    }
  };

  // Handler: Send Message in Live Sandbox Preview
  const handleSandboxSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || sandboxInput).trim();
    if (!textToSend || isSandboxStreaming) return;

    setSandboxInput("");

    const newMessages = [...sandboxMessages, { role: "user" as const, content: textToSend }];
    setSandboxMessages(newMessages);
    setIsSandboxStreaming(true);

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          assistantConfig: assistant,
          hostOrigin: window.location.origin,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Error ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      // Add placeholder assistant message
      setSandboxMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const raw = line.slice(6).trim();
              if (raw === "[DONE]") break;
              try {
                const parsed = JSON.parse(raw);
                if (parsed.text) {
                  accumulated += parsed.text;
                  setSandboxMessages((prev) => {
                    const next = [...prev];
                    next[next.length - 1] = { role: "assistant", content: accumulated };
                    return next;
                  });
                }
              } catch {
                // ignore
              }
            }
          }
        }
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Streaming error";
      setSandboxMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ *Error:* ${errMsg}` },
      ]);
    } finally {
      setIsSandboxStreaming(false);
    }
  };

  // Handler: 1-Click GitHub PR Creation
  const handleCreatePr = async () => {
    if (!githubToken.trim() || !repoUrl.trim()) return;

    setIsCreatingPr(true);
    setPrResult(null);

    const snippet = generateScriptSnippet();

    try {
      const res = await fetch("/api/assistant/github-pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubToken,
          repoUrl,
          scriptSnippet: snippet,
          assistantConfig: assistant,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "GitHub PR creation failed");
      }

      setPrResult({ prUrl: data.prUrl, branch: data.branch });
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: unknown) {
      setPrResult({ error: err instanceof Error ? err.message : "Failed to open PR" });
    } finally {
      setIsCreatingPr(false);
    }
  };

  // Generate the 1-Line Embed Code
  const generateScriptSnippet = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://modeldeck.dev";
    const suggestedStr = assistant.suggestedQuestions.join(",");

    return `<script defer src="${origin}/embed.js"
  data-assistant-id="${assistant.id}"
  data-api-url="${origin}"
  data-title="${assistant.title}"
  data-greeting="${assistant.greeting.replace(/"/g, "&quot;")}"
  data-avatar="${assistant.avatar}"
  data-color="${assistant.brandColor}"
  data-position="${assistant.position}"
  data-suggested="${suggestedStr.replace(/"/g, "&quot;")}"
  data-provider="${assistant.provider}"
  data-model="${assistant.model}"></script>`;
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(generateScriptSnippet());
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0b0c10] text-zinc-100 overflow-hidden select-none">
      {/* Studio Top Navigation Bar */}
      <header className="flex h-14 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-4 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-md">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-zinc-50">Assistant Studio</span>
              <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-mono text-blue-400">
                Open Source
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Personalized AI Assistants for your website or portfolio
            </p>
          </div>
        </div>

        {/* Tabs & Close button */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-zinc-900 border border-zinc-800 p-0.5 text-xs">
            <button
              onClick={() => setActiveTab("customize")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === "customize"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Configure</span>
            </button>
            <button
              onClick={() => setActiveTab("embed")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === "embed"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Embed Script</span>
            </button>
            <button
              onClick={() => setActiveTab("github-pr")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === "github-pr"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <GitPullRequest className="h-3.5 w-3.5 text-emerald-400" />
              <span>1-Click GitHub PR</span>
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors ml-2"
              title="Close Studio"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Studio Body: Split View (Config & Controls on Left, Live Sandbox on Right) */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Side: URL Extraction & Configuration Panel */}
        <div className="w-full lg:w-[480px] xl:w-[520px] flex flex-col border-r border-zinc-800/80 bg-zinc-950/40 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Section 1: URL Analyzer & Persona Generator */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 space-y-3.5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-400" />
                <span className="font-semibold text-xs uppercase tracking-wider text-zinc-300">
                  Target Website / Portfolio
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Auto-Persona Synthesis</span>
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://yourportfolio.dev or GitHub..."
                className="flex-1 rounded-xl border border-zinc-700/80 bg-zinc-900 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => handleScrape()}
                disabled={isScraping || !urlInput.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md transition-all disabled:opacity-50 shrink-0"
              >
                {isScraping ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                )}
                <span>{isScraping ? "Analyzing..." : "Generate AI"}</span>
              </button>
            </div>

            {/* Quick Demo Pre-fill Chips */}
            <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-zinc-400">
              <span className="text-zinc-500">Quick Test:</span>
              <button
                onClick={() => {
                  setUrlInput("https://leerob.io");
                  handleScrape("https://leerob.io");
                }}
                className="hover:text-blue-400 underline decoration-zinc-700 underline-offset-2"
              >
                leerob.io
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setUrlInput("https://delba.dev");
                  handleScrape("https://delba.dev");
                }}
                className="hover:text-blue-400 underline decoration-zinc-700 underline-offset-2"
              >
                delba.dev
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setUrlInput("https://rauchg.com");
                  handleScrape("https://rauchg.com");
                }}
                className="hover:text-blue-400 underline decoration-zinc-700 underline-offset-2"
              >
                rauchg.com
              </button>
            </div>

            {scrapeError && (
              <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-2.5 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <span>{scrapeError}</span>
              </div>
            )}

            {/* Scraped Site Facts summary */}
            {scrapedData && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-3 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-400 text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Synthesized from {scrapedData.title}</span>
                </div>
                {scrapedData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {scrapedData.skills.map((s) => (
                      <span
                        key={s}
                        className="rounded-md bg-zinc-800/80 border border-zinc-700 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Tab Content */}
          {activeTab === "customize" && (
            <div className="space-y-4">
              {/* Identity & Greeting */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider text-zinc-300">
                  <Bot className="h-3.5 w-3.5 text-blue-400" />
                  <span>Assistant Persona & Greeting</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">Assistant Name</label>
                    <input
                      type="text"
                      value={assistant.name}
                      onChange={(e) => setAssistant({ ...assistant, name: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">Sub-Title / Role</label>
                    <input
                      type="text"
                      value={assistant.title}
                      onChange={(e) => setAssistant({ ...assistant, title: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Welcome Greeting</label>
                  <textarea
                    rows={2}
                    value={assistant.greeting}
                    onChange={(e) => setAssistant({ ...assistant, greeting: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">
                    System Instructions (Knowledge Base & Rules)
                  </label>
                  <textarea
                    rows={4}
                    value={assistant.persona}
                    onChange={(e) => setAssistant({ ...assistant, persona: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-blue-500 resize-y"
                  />
                </div>
              </div>

              {/* Suggested Questions */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs uppercase tracking-wider text-zinc-300">
                    Suggested Question Chips
                  </span>
                  <span className="text-[10px] text-zinc-500">1-click prompts for visitors</span>
                </div>

                <div className="space-y-2">
                  {assistant.suggestedQuestions.map((q, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={q}
                        onChange={(e) => {
                          const updated = [...assistant.suggestedQuestions];
                          updated[idx] = e.target.value;
                          setAssistant({ ...assistant, suggestedQuestions: updated });
                        }}
                        className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => {
                          const updated = assistant.suggestedQuestions.filter((_, i) => i !== idx);
                          setAssistant({ ...assistant, suggestedQuestions: updated });
                        }}
                        className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Remove question"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {assistant.suggestedQuestions.length < 5 && (
                    <button
                      onClick={() =>
                        setAssistant({
                          ...assistant,
                          suggestedQuestions: [
                            ...assistant.suggestedQuestions,
                            "Can I download your resume?",
                          ],
                        })
                      }
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-medium pt-1"
                    >
                      + Add Question Chip
                    </button>
                  )}
                </div>
              </div>

              {/* Appearance & Color */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider text-zinc-300">
                  <Palette className="h-3.5 w-3.5 text-purple-400" />
                  <span>Branding & Appearance</span>
                </div>

                {/* Avatar Picker */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-zinc-400">Avatar Icon</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {PRESET_AVATARS.map((av) => (
                      <button
                        key={av}
                        onClick={() => setAssistant({ ...assistant, avatar: av })}
                        className={`h-8 w-8 rounded-lg flex items-center justify-center text-base transition-all ${
                          assistant.avatar === av
                            ? "bg-blue-600 scale-110 shadow-md ring-2 ring-blue-400"
                            : "bg-zinc-800 hover:bg-zinc-700"
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brand Color Picker */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] text-zinc-400">Theme Color</label>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setAssistant({ ...assistant, brandColor: c })}
                        style={{ backgroundColor: c }}
                        className={`h-7 w-7 rounded-full transition-transform ${
                          assistant.brandColor === c
                            ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-zinc-900 shadow-lg"
                            : "opacity-80 hover:opacity-100 hover:scale-110"
                        }`}
                      />
                    ))}
                    <input
                      type="color"
                      value={assistant.brandColor}
                      onChange={(e) => setAssistant({ ...assistant, brandColor: e.target.value })}
                      className="h-7 w-7 rounded-full cursor-pointer bg-transparent border-0"
                    />
                  </div>
                </div>

                {/* Position */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => setAssistant({ ...assistant, position: "bottom-right" })}
                    className={`rounded-xl border p-2 text-xs font-medium text-center transition-colors ${
                      assistant.position === "bottom-right"
                        ? "border-blue-500 bg-blue-600/20 text-blue-300"
                        : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Bottom Right (Standard)
                  </button>
                  <button
                    onClick={() => setAssistant({ ...assistant, position: "bottom-left" })}
                    className={`rounded-xl border p-2 text-xs font-medium text-center transition-colors ${
                      assistant.position === "bottom-left"
                        ? "border-blue-500 bg-blue-600/20 text-blue-300"
                        : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Bottom Left
                  </button>
                </div>
              </div>

              {/* Provider & Model Selection */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider text-zinc-300">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span>AI Provider & Security</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">LLM Provider</label>
                    <select
                      value={assistant.provider}
                      onChange={(e) =>
                        setAssistant({
                          ...assistant,
                          provider: e.target.value as ProviderId,
                          model:
                            e.target.value === "gemini"
                              ? "gemini-2.5-flash"
                              : e.target.value === "openai"
                              ? "gpt-4o-mini"
                              : "llama-3.3-70b-versatile",
                        })
                      }
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="groq">Groq (Ultra-Fast ⚡)</option>
                      <option value="gemini">Google Gemini (Flash 3.5)</option>
                      <option value="openai">OpenAI (GPT-4o mini)</option>
                      <option value="anthropic">Anthropic (Claude 3.5 Haiku)</option>
                      <option value="deepseek">DeepSeek (V3 / R1)</option>
                      <option value="openrouter">OpenRouter</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">Model</label>
                    <input
                      type="text"
                      value={assistant.model}
                      onChange={(e) => setAssistant({ ...assistant, model: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Shield className="h-3 w-3 text-emerald-400" />
                      <span>Domain Whitelist (CORS Protection)</span>
                    </label>
                    <span className="text-[10px] text-zinc-500 font-mono">* for all</span>
                  </div>
                  <input
                    type="text"
                    value={assistant.allowedDomains.join(", ")}
                    onChange={(e) =>
                      setAssistant({
                        ...assistant,
                        allowedDomains: e.target.value.split(",").map((d) => d.trim()).filter(Boolean),
                      })
                    }
                    placeholder="myportfolio.dev, localhost, *"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section: Embed Script Hub */}
          {activeTab === "embed" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-blue-400" />
                    <span className="font-semibold text-xs uppercase tracking-wider text-zinc-200">
                      1-Line Embed Code
                    </span>
                  </div>
                  <button
                    onClick={copySnippet}
                    className="flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1 text-xs font-semibold text-white shadow transition-all"
                  >
                    {copiedSnippet ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSnippet ? "Copied!" : "Copy Code"}</span>
                  </button>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  Simply paste this single line before the closing <code className="text-blue-300 font-mono">&lt;/body&gt;</code> tag of any website. Zero npm dependencies, 100% scoped Shadow DOM.
                </p>

                {/* Framework Selector Tabs */}
                <div className="flex gap-1.5 border-b border-zinc-800 pb-2 text-[11px]">
                  {(["html", "nextjs", "react", "astro"] as const).map((fw) => (
                    <button
                      key={fw}
                      onClick={() => setFrameworkTab(fw)}
                      className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                        frameworkTab === fw
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {fw === "html"
                        ? "Plain HTML"
                        : fw === "nextjs"
                        ? "Next.js"
                        : fw === "react"
                        ? "React / Vite"
                        : "Astro"}
                    </button>
                  ))}
                </div>

                {/* Code Preview */}
                <div className="relative rounded-xl border border-zinc-800 bg-[#0d0e12] p-3 text-xs font-mono text-zinc-300 overflow-x-auto">
                  <pre className="whitespace-pre-wrap break-all leading-relaxed">
                    {frameworkTab === "html" && generateScriptSnippet()}
                    {frameworkTab === "nextjs" &&
                      `// In app/layout.tsx:\nimport Script from 'next/script';\n\nexport default function RootLayout({ children }) {\n  return (\n    <html>\n      <body>\n        {children}\n        <Script\n          src="${typeof window !== "undefined" ? window.location.origin : ""}/embed.js"\n          strategy="lazyOnload"\n          data-assistant-id="${assistant.id}"\n          data-title="${assistant.title}"\n          data-color="${assistant.brandColor}"\n          data-avatar="${assistant.avatar}"\n        />\n      </body>\n    </html>\n  );\n}`}
                    {frameworkTab === "react" &&
                      `// In index.html before </body>:\n${generateScriptSnippet()}`}
                    {frameworkTab === "astro" &&
                      `--- \n// In src/layouts/Layout.astro:\n---\n<body>\n  <slot />\n  ${generateScriptSnippet()}\n</body>`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Section: GitHub 1-Click PR */}
          {activeTab === "github-pr" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 space-y-3.5">
                <div className="flex items-center gap-2">
                  <GitPullRequest className="h-4 w-4 text-emerald-400" />
                  <span className="font-semibold text-xs uppercase tracking-wider text-zinc-200">
                    Automated GitHub Pull Request
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Automatically fork/branch and open a PR with the chatbot embedded into your website&apos;s <code className="text-emerald-300 font-mono">index.html</code> or layout file!
                </p>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-zinc-400">GitHub Repository</label>
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="e.g. username/my-portfolio or https://github.com/..."
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-zinc-400">GitHub Personal Access Token</label>
                    <a
                      href="https://github.com/settings/tokens/new?scopes=repo&description=ModelDeck+Assistant+Integration"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5"
                    >
                      <span>Create Token (repo scope) ↗</span>
                    </a>
                  </div>
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx..."
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <button
                  onClick={handleCreatePr}
                  disabled={isCreatingPr || !githubToken.trim() || !repoUrl.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 px-4 text-xs font-semibold text-white shadow-md transition-all disabled:opacity-50"
                >
                  {isCreatingPr ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <GitPullRequest className="h-4 w-4" />
                  )}
                  <span>{isCreatingPr ? "Creating Pull Request..." : "Open PR on GitHub 🚀"}</span>
                </button>

                {prResult?.error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-300 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{prResult.error}</span>
                  </div>
                )}

                {prResult?.prUrl && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-xs text-emerald-300 space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Pull Request Created Successfully!</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Branch <code className="font-mono text-zinc-300">{prResult.branch}</code> created and PR opened.
                    </p>
                    <a
                      href={prResult.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                    >
                      <span>View Pull Request on GitHub</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Magic Live Sandbox Preview */}
        <div className="hidden lg:flex flex-1 flex-col bg-[#07080a] relative overflow-hidden items-center justify-center p-6">
          {/* Device Toggle & Sandbox Header */}
          <div className="absolute top-4 left-6 right-6 flex items-center justify-between z-10 pointer-events-auto">
            <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-1.5 backdrop-blur-md shadow-md">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-zinc-200">Magic Live Sandbox</span>
              <span className="text-[10px] text-zinc-500 font-mono">Live LLM Streaming</span>
            </div>

            <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 rounded-xl p-1 backdrop-blur-md shadow-md">
              <button
                onClick={() => setPreviewDevice("desktop")}
                className={`p-1.5 rounded-lg transition-colors ${
                  previewDevice === "desktop"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
                title="Desktop View"
              >
                <Laptop className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setPreviewDevice("mobile")}
                className={`p-1.5 rounded-lg transition-colors ${
                  previewDevice === "mobile"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
                title="Mobile View"
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Browser / Device Frame Mockup */}
          <div
            className={`transition-all duration-300 flex flex-col rounded-2xl border border-zinc-800 bg-[#121318] shadow-2xl overflow-hidden relative ${
              previewDevice === "desktop"
                ? "w-full max-w-[820px] h-[580px]"
                : "w-[360px] h-[640px] rounded-[36px] border-[6px] border-zinc-800"
            }`}
          >
            {/* Browser Top Window Bar */}
            <div className="flex h-9 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
              </div>

              {/* URL Address Bar */}
              <div className="flex items-center gap-1.5 rounded-md bg-zinc-900/80 border border-zinc-800 px-2.5 py-0.5 text-[11px] font-mono text-zinc-400 max-w-[320px] truncate">
                <Globe className="h-3 w-3 text-zinc-500 shrink-0" />
                <span className="truncate">{assistant.websiteUrl || "https://my-portfolio.dev"}</span>
              </div>

              <div className="w-12" />
            </div>

            {/* Simulated Website Background Content */}
            <div className="flex-1 overflow-y-auto p-8 relative flex flex-col justify-center items-center text-center space-y-4 bg-gradient-to-b from-[#121318] to-[#0c0d11]">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs text-blue-400">
                <Sparkles className="h-3 w-3" />
                <span>Live Interactive Preview</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white max-w-md">
                {scrapedData?.title || assistant.name}
              </h1>
              <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                {scrapedData?.description ||
                  "This is your website. Click the interactive AI widget in the corner to chat with your synthesized personal assistant!"}
              </p>

              {scrapedData?.skills && scrapedData.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-center max-w-md pt-2">
                  {scrapedData.skills.slice(0, 8).map((sk) => (
                    <span
                      key={sk}
                      className="rounded-lg bg-zinc-800/60 border border-zinc-700/60 px-2 py-0.5 text-[11px] font-mono text-zinc-300"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Live Interactive Assistant Widget Mounted Inside Sandbox */}
            {isSandboxChatOpen && (
              <div
                className={`absolute bottom-20 z-20 flex flex-col rounded-2xl border border-zinc-700/80 bg-[#16181f] shadow-2xl overflow-hidden transition-all duration-200 ${
                  assistant.position === "bottom-left" ? "left-5" : "right-5"
                } ${
                  previewDevice === "desktop"
                    ? "w-[340px] h-[440px]"
                    : "inset-x-2 bottom-0 h-[480px] rounded-b-none"
                }`}
              >
                {/* Chat Header */}
                <div
                  className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-800/80"
                  style={{ backgroundColor: `${assistant.brandColor}15` }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-sm shadow-sm"
                      style={{ backgroundColor: assistant.brandColor }}
                    >
                      {assistant.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-zinc-100">{assistant.title}</div>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Online</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setSandboxMessages([{ role: "assistant", content: assistant.greeting }])
                      }
                      className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
                      title="Clear preview chat"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setIsSandboxChatOpen(false)}
                      className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
                      title="Minimize widget"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
                  {sandboxMessages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`rounded-2xl px-3 py-2 max-w-[85%] leading-relaxed ${
                          m.role === "user"
                            ? "text-white"
                            : "bg-zinc-800/90 text-zinc-200 border border-zinc-700/60"
                        }`}
                        style={{
                          backgroundColor: m.role === "user" ? assistant.brandColor : undefined,
                        }}
                      >
                        {m.role === "user" ? (
                          m.content
                        ) : (
                          <div
                            dangerouslySetInnerHTML={{ __html: renderSandboxMarkdown(m.content) }}
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Suggested chips if only 1 message */}
                  {sandboxMessages.length === 1 && assistant.suggestedQuestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {assistant.suggestedQuestions.map((chip, i) => (
                        <button
                          key={i}
                          onClick={() => handleSandboxSend(chip)}
                          className="rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 px-2.5 py-1 text-[11px] text-blue-300 transition-colors text-left"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}

                  {isSandboxStreaming && (
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs py-1">
                      <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" />
                      <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Input Field */}
                <div className="p-2 border-t border-zinc-800 bg-zinc-900/60 flex items-center gap-1.5">
                  <input
                    type="text"
                    value={sandboxInput}
                    onChange={(e) => setSandboxInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSandboxSend()}
                    placeholder="Ask a question..."
                    className="flex-1 rounded-xl border border-zinc-700/80 bg-zinc-800/80 px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleSandboxSend()}
                    disabled={isSandboxStreaming || !sandboxInput.trim()}
                    style={{ backgroundColor: assistant.brandColor }}
                    className="h-7 w-7 rounded-lg text-white flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-40"
                  >
                    <Send className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Launcher Bubble */}
            <button
              onClick={() => setIsSandboxChatOpen(!isSandboxChatOpen)}
              style={{ backgroundColor: assistant.brandColor }}
              className={`absolute bottom-4 z-10 h-12 w-12 rounded-full flex items-center justify-center text-xl text-white shadow-xl hover:scale-110 active:scale-95 transition-all ${
                assistant.position === "bottom-left" ? "left-4" : "right-4"
              }`}
            >
              {isSandboxChatOpen ? <X className="h-5 w-5" /> : assistant.avatar}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
