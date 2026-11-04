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
  "#3b82f6", // Electric Blue
  "#8b5cf6", // Violet
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
    return `<div class="my-1.5 rounded-lg bg-black/60 p-2.5 font-mono text-[11px] text-zinc-300 border border-zinc-700/60 overflow-x-auto"><span class="text-[9px] uppercase tracking-wider text-muted-foreground block mb-1 font-semibold">${lang || "code"}</span><pre><code>${code.trim()}</code></pre></div>`;
  });
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="rounded bg-black/40 px-1 py-0.5 font-mono text-[11px] text-[#ff8a50] border border-border/60">$1</code>');
  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
  // Markdown links
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#ff5722] hover:underline font-semibold">$1 ↗</a>');
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
    model: "openai/gpt-oss-120b",
    allowedDomains: ["*"],
    websiteUrl: "https://github.com",
    createdAt: Date.now(),
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<"customize" | "embed" | "github-pr">("customize");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [mobileView, setMobileView] = useState<"configure" | "preview">("configure");

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
          pageContext: {
            url: assistant.websiteUrl || "https://my-portfolio.dev",
            title: scrapedData?.title || assistant.name,
            description: scrapedData?.description || "",
            headings: scrapedData?.projects?.map((p) => p.title) || [],
            bodySnippet: scrapedData?.extractedText || "",
          },
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
    <div className="flex flex-col h-full w-full bg-[#0c0807] text-[#faf5ef] transition-colors overflow-hidden select-none">
      {/* Studio Header Bar */}
      <header className="flex h-14 items-center justify-between border-b border-white/10 bg-[#140d0a]/80 px-3 sm:px-6 shrink-0 backdrop-blur-xl text-[#faf5ef] transition-colors z-20">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#ff5722] to-[#ea580c] shadow-md shadow-[#ff5722]/20 text-[#140a06] shrink-0">
            <Bot className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-bold text-xs sm:text-sm text-foreground tracking-tight truncate">Assistant Studio</span>
              <span className="hidden sm:inline-block rounded-full bg-[#ff5722]/10 border border-[#ff5722]/25 px-2 py-0.5 text-[10px] font-mono font-medium text-[#ff8a50] shrink-0">
                AI Agent Generator
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-normal hidden md:block truncate">
              Deploy a customized portfolio chatbot in under 60 seconds
            </p>
          </div>
        </div>

        {/* Studio Tabs & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Switcher (< lg screens): Editor vs Preview */}
          <div className="flex lg:hidden rounded-xl border border-white/10 bg-[#180f0b] p-0.5 text-xs shrink-0">
            <button
              onClick={() => setMobileView("configure")}
              className={`btn-tactile flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                mobileView === "configure"
                  ? "bg-[#ff5722] text-[#140a06] font-bold shadow-md shadow-[#ff5722]/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sliders className="h-3 w-3" />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setMobileView("preview")}
              className={`btn-tactile flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                mobileView === "preview"
                  ? "bg-[#ff5722] text-[#140a06] font-bold shadow-md shadow-[#ff5722]/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Smartphone className="h-3 w-3" />
              <span>Preview</span>
            </button>
          </div>

          {/* Desktop/Tablet Tabs */}
          <div className={`${mobileView === "preview" ? "hidden lg:flex" : "flex"} rounded-xl border border-white/10 bg-[#140d0a]/80 p-0.5 sm:p-1 text-xs shrink-0`}>
            <button
              onClick={() => setActiveTab("customize")}
              className={`btn-tactile flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-semibold text-[11px] sm:text-xs transition-all ${
                activeTab === "customize"
                  ? "bg-[#ff5722] text-[#140a06] font-bold shadow-lg shadow-[#ff5722]/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sliders className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
              <span>Configure</span>
            </button>
            <button
              onClick={() => setActiveTab("embed")}
              className={`btn-tactile flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-semibold text-[11px] sm:text-xs transition-all ${
                activeTab === "embed"
                  ? "bg-[#ff5722] text-[#140a06] font-bold shadow-lg shadow-[#ff5722]/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Code2 className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
              <span className="hidden sm:inline">Embed Script</span>
              <span className="sm:hidden">Embed</span>
            </button>
            <button
              onClick={() => setActiveTab("github-pr")}
              className={`btn-tactile flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-semibold text-[11px] sm:text-xs transition-all ${
                activeTab === "github-pr"
                  ? "bg-[#ff5722] text-[#140a06] font-bold shadow-lg shadow-[#ff5722]/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <GitPullRequest className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-emerald-500" />
              <span className="hidden sm:inline">1-Click PR</span>
              <span className="sm:hidden">PR</span>
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="btn-tactile rounded-xl p-1.5 sm:p-2 text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors ml-0.5"
              title="Close Studio"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Studio Body: Split View (Controls Left, Device Sandbox Right) */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Side: URL Extraction & Configuration Panel */}
        <div className={`w-full lg:w-[480px] xl:w-[520px] ${mobileView === "preview" ? "hidden lg:flex" : "flex"} flex-col border-r border-white/10 bg-[#0c0807]/60 overflow-y-auto p-3 sm:p-5 space-y-4`}>
          {/* Section 1: URL Analyzer & Persona Generator with Double-Bezel */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff5722]/10 text-[#ff8a50] border border-[#ff5722]/20">
                    <Globe className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold text-xs uppercase tracking-wider text-foreground">
                    Target Website / Portfolio
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">Auto-Synthesis</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://yourportfolio.dev or GitHub..."
                  className="flex-1 rounded-xl border border-white/10 bg-[#180f0b] text-[#faf5ef] px-3.5 py-2 text-xs placeholder:text-[#b8a79b] focus:outline-none focus:border-[#ff5722] transition-colors"
                />
                <button
                  onClick={() => handleScrape()}
                  disabled={isScraping || !urlInput.trim()}
                  className="btn-tactile flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#ff5722] to-[#ea580c] text-[#140a06] px-3.5 py-2 text-xs font-bold shadow-lg shadow-[#ff5722]/25 hover:scale-[1.01] transition-all disabled:opacity-50 shrink-0"
                >
                  {isScraping ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  )}
                  <span>{isScraping ? "Analyzing..." : "Synthesize AI"}</span>
                </button>
              </div>

              {/* Quick Demo Pre-fill Chips */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-muted-foreground">
                <span>Quick demo:</span>
                <button
                  onClick={() => {
                    setUrlInput("https://leerob.io");
                    handleScrape("https://leerob.io");
                  }}
                  className="hover:text-[#ff8a50] underline decoration-muted-foreground/40 underline-offset-2"
                >
                  leerob.io
                </button>
                <span>•</span>
                <button
                  onClick={() => {
                    setUrlInput("https://delba.dev");
                    handleScrape("https://delba.dev");
                  }}
                  className="hover:text-[#ff8a50] underline decoration-muted-foreground/40 underline-offset-2"
                >
                  delba.dev
                </button>
                <span>•</span>
                <button
                  onClick={() => {
                    setUrlInput("https://rauchg.com");
                    handleScrape("https://rauchg.com");
                  }}
                  className="hover:text-[#ff8a50] underline decoration-muted-foreground/40 underline-offset-2"
                >
                  rauchg.com
                </button>
              </div>

              {scrapeError && (
                <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-2.5 text-xs text-red-400 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{scrapeError}</span>
                </div>
              )}

              {/* Scraped Site Facts summary */}
              {scrapedData && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-500 text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Synthesized from {scrapedData.title}</span>
                  </div>
                  {scrapedData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {scrapedData.skills.map((s) => (
                        <span
                          key={s}
                          className="rounded-md bg-surface-2 border border-border px-1.5 py-0.5 text-[10px] font-mono text-foreground"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Tab Content */}
          {activeTab === "customize" && (
            <div className="space-y-4">
              {/* Identity & Greeting Card */}
              <div className="double-bezel">
                <div className="double-bezel-inner p-4 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-foreground">
                    <Bot className="h-3.5 w-3.5 text-[#ff5722]" />
                    <span>Persona &amp; Greeting</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">Assistant Name</label>
                      <input
                        type="text"
                        value={assistant.name}
                        onChange={(e) => setAssistant({ ...assistant, name: e.target.value })}
                        className="w-full rounded-xl border border-border bg-surface-2 text-foreground px-3 py-1.5 text-xs focus:outline-none focus:border-[#ff5722] transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">Sub-Title / Role</label>
                      <input
                        type="text"
                        value={assistant.title}
                        onChange={(e) => setAssistant({ ...assistant, title: e.target.value })}
                        className="w-full rounded-xl border border-border bg-surface-2 text-foreground px-3 py-1.5 text-xs focus:outline-none focus:border-[#ff5722] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">Welcome Greeting</label>
                    <textarea
                      rows={2}
                      value={assistant.greeting}
                      onChange={(e) => setAssistant({ ...assistant, greeting: e.target.value })}
                      className="w-full rounded-xl border border-border bg-surface-2 text-foreground p-2.5 text-xs focus:outline-none focus:border-[#ff5722] resize-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">
                      System Instructions (Knowledge Base &amp; Rules)
                    </label>
                    <textarea
                      rows={4}
                      value={assistant.persona}
                      onChange={(e) => setAssistant({ ...assistant, persona: e.target.value })}
                      className="w-full rounded-xl border border-border bg-surface-2 text-foreground p-2.5 text-xs font-mono focus:outline-none focus:border-[#ff5722] resize-y transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Suggested Questions */}
              <div className="double-bezel">
                <div className="double-bezel-inner p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-foreground">
                      Suggested Question Chips
                    </span>
                    <span className="text-[10px] text-muted-foreground">1-click prompts for visitors</span>
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
                          className="flex-1 rounded-xl border border-border bg-surface-2 text-foreground px-2.5 py-1 text-xs focus:outline-none focus:border-[#ff5722] transition-colors"
                        />
                        <button
                          onClick={() => {
                            const updated = assistant.suggestedQuestions.filter((_, i) => i !== idx);
                            setAssistant({ ...assistant, suggestedQuestions: updated });
                          }}
                          className="btn-tactile p-1 text-muted-foreground hover:text-red-500 transition-colors"
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
                        className="btn-tactile text-[11px] text-[#ff5722] hover:text-[#ff8a50] font-semibold pt-1 flex items-center gap-1"
                      >
                        + Add Question Chip
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Appearance & Color */}
              <div className="double-bezel">
                <div className="double-bezel-inner p-4 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-foreground">
                    <Palette className="h-3.5 w-3.5 text-[#ff7043]" />
                    <span>Branding &amp; Appearance</span>
                  </div>

                  {/* Avatar Picker */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">Avatar Icon</label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {PRESET_AVATARS.map((av) => (
                        <button
                          key={av}
                          onClick={() => setAssistant({ ...assistant, avatar: av })}
                          className={`btn-tactile h-8 w-8 rounded-xl flex items-center justify-center text-base transition-all ${
                            assistant.avatar === av
                              ? "bg-[#ff5722] scale-110 shadow-md ring-2 ring-[#ff8a50] text-[#140a06]"
                              : "bg-surface-2 border border-border hover:bg-surface-3"
                          }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brand Color Picker */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-medium text-muted-foreground">Theme Color</label>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setAssistant({ ...assistant, brandColor: c })}
                          style={{ backgroundColor: c }}
                          className={`btn-tactile h-7 w-7 rounded-full transition-transform ${
                            assistant.brandColor === c
                              ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-background shadow-lg"
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
                      className={`btn-tactile rounded-xl border p-2 text-xs font-semibold text-center transition-all ${
                        assistant.position === "bottom-right"
                          ? "border-[#ff5722] bg-[#ff5722]/15 text-[#ff8a50] shadow-sm"
                          : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Bottom Right (Default)
                    </button>
                    <button
                      onClick={() => setAssistant({ ...assistant, position: "bottom-left" })}
                      className={`btn-tactile rounded-xl border p-2 text-xs font-semibold text-center transition-all ${
                        assistant.position === "bottom-left"
                          ? "border-[#ff5722] bg-[#ff5722]/15 text-[#ff8a50] shadow-sm"
                          : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Bottom Left
                    </button>
                  </div>
                </div>
              </div>

              {/* Provider & Model Selection */}
              <div className="double-bezel">
                <div className="double-bezel-inner p-4 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-foreground">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    <span>AI Provider &amp; CORS Security</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">LLM Provider</label>
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
                                : "openai/gpt-oss-120b",
                          })
                        }
                        className="w-full rounded-xl border border-border bg-surface-2 text-foreground px-3 py-1.5 text-xs focus:outline-none focus:border-[#ff5722] transition-colors"
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
                      <label className="text-[11px] font-medium text-muted-foreground">Model Identifier</label>
                      <input
                        type="text"
                        value={assistant.model}
                        onChange={(e) => setAssistant({ ...assistant, model: e.target.value })}
                        className="w-full rounded-xl border border-border bg-surface-2 text-foreground px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#ff5722] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                        <Shield className="h-3 w-3 text-emerald-500" />
                        <span>Domain Whitelist</span>
                      </label>
                      <span className="text-[10px] text-muted-foreground font-mono">* allows all</span>
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
                      className="w-full rounded-xl border border-border bg-surface-2 text-foreground px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#ff5722] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Embed Script Hub */}
          {activeTab === "embed" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="double-bezel">
                <div className="double-bezel-inner p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-[#ff5722]" />
                      <span className="font-bold text-xs uppercase tracking-wider text-foreground">
                        1-Line Embed Code
                      </span>
                    </div>
                    <button
                      onClick={copySnippet}
                      className="btn-tactile flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#ff5722] to-[#ea580c] text-[#140a06] px-3 py-1 text-xs font-bold shadow-lg shadow-[#ff5722]/25 hover:scale-[1.01] transition-all"
                    >
                      {copiedSnippet ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedSnippet ? "Copied!" : "Copy Script"}</span>
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Paste this snippet before the closing <code className="text-[#ff5722] font-mono font-semibold">&lt;/body&gt;</code> tag of any web project. Zero npm dependencies, fully isolated Shadow DOM.
                  </p>

                  {/* Framework Selector Tabs */}
                  <div className="flex gap-1.5 border-b border-border pb-2 text-[11px]">
                    {(["html", "nextjs", "react", "astro"] as const).map((fw) => (
                      <button
                        key={fw}
                        onClick={() => setFrameworkTab(fw)}
                        className={`btn-tactile px-2.5 py-1 rounded-lg capitalize font-semibold transition-colors ${
                          frameworkTab === fw
                            ? "bg-[#ff5722] text-[#140a06] font-bold shadow-lg shadow-[#ff5722]/20"
                            : "bg-surface-2 text-muted-foreground hover:text-foreground"
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
                  <div className="relative rounded-xl border border-border bg-black/60 p-3 text-xs font-mono text-zinc-200 overflow-x-auto shadow-inner">
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
            </div>
          )}

          {/* Section: GitHub 1-Click PR */}
          {activeTab === "github-pr" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="double-bezel">
                <div className="double-bezel-inner p-4 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <GitPullRequest className="h-4 w-4 text-emerald-500" />
                    <span className="font-bold text-xs uppercase tracking-wider text-foreground">
                      Automated GitHub Pull Request
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Automatically fork/branch and open a PR with the chatbot embedded into your portfolio&apos;s <code className="text-emerald-500 font-mono font-semibold">index.html</code> or layout file!
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">GitHub Repository</label>
                    <input
                      type="text"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="e.g. username/my-portfolio or https://github.com/..."
                      className="w-full rounded-xl border border-border bg-surface-2 text-foreground px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-muted-foreground">GitHub Personal Access Token</label>
                      <a
                        href="https://github.com/settings/tokens/new?scopes=repo&description=ModelDeck+Assistant+Integration"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[#ff5722] hover:underline flex items-center gap-0.5"
                      >
                        <span>Create Token (repo scope) ↗</span>
                      </a>
                    </div>
                    <input
                      type="password"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxx..."
                      className="w-full rounded-xl border border-border bg-surface-2 text-foreground px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <button
                    onClick={handleCreatePr}
                    disabled={isCreatingPr || !githubToken.trim() || !repoUrl.trim()}
                    className="btn-tactile flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff5722] to-[#ea580c] text-[#140a06] py-2.5 px-4 text-xs font-bold shadow-lg shadow-[#ff5722]/25 hover:scale-[1.01] transition-all disabled:opacity-50"
                  >
                    {isCreatingPr ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <GitPullRequest className="h-4 w-4" />
                    )}
                    <span>{isCreatingPr ? "Creating Pull Request..." : "Open PR on GitHub 🚀"}</span>
                  </button>

                  {prResult?.error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-400 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <span>{prResult.error}</span>
                    </div>
                  )}

                  {prResult?.prUrl && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-xs text-emerald-400 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-500">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Pull Request Created Successfully!</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Branch <code className="font-mono text-foreground font-semibold">{prResult.branch}</code> created and PR opened.
                      </p>
                      <a
                        href={prResult.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-tactile inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                      >
                        <span>View Pull Request on GitHub</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Interactive Hardware Device Frame */}
        <div className={`${mobileView === "preview" ? "flex" : "hidden"} lg:flex flex-1 flex-col bg-[#0c0807]/80 relative overflow-hidden items-center justify-center p-3 sm:p-6`}>
          {/* Device Toggle & Sandbox Header */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-6 right-3 sm:right-6 flex items-center justify-between z-10 pointer-events-auto">
            <div className="flex items-center gap-2 bg-[#140d0a]/80 border border-white/10 rounded-2xl px-3 py-1.5 backdrop-blur-xl shadow-md">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-[#faf5ef]">Interactive Sandbox</span>
              <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">Real-Time Streaming</span>
            </div>

            <div className="flex items-center gap-1 bg-[#140d0a]/80 border border-white/10 rounded-2xl p-1 backdrop-blur-xl shadow-md">
              <button
                onClick={() => setPreviewDevice("desktop")}
                className={`btn-tactile p-1.5 rounded-lg transition-colors ${
                  previewDevice === "desktop"
                    ? "bg-[#ff5722] text-[#140a06] font-bold shadow-lg shadow-[#ff5722]/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Desktop View"
              >
                <Laptop className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPreviewDevice("mobile")}
                className={`btn-tactile p-1.5 rounded-lg transition-colors ${
                  previewDevice === "mobile"
                    ? "bg-[#ff5722] text-[#140a06] font-bold shadow-lg shadow-[#ff5722]/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Mobile View"
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Hardware Device Mockup Frame */}
          <div className="w-full flex items-center justify-center">
            <div
              className={`transition-all duration-300 flex flex-col rounded-2xl border border-amber-900/40 bg-[#1a100c] shadow-2xl overflow-hidden relative ${
                previewDevice === "desktop"
                  ? "w-full max-w-[840px] h-[520px] sm:h-[580px] max-h-[85vh]"
                  : "w-full max-w-[360px] h-[560px] sm:h-[640px] rounded-[36px] sm:rounded-[44px] border-[6px] sm:border-[8px] border-zinc-800 shadow-2xl max-h-[88vh]"
              }`}
            >
              {/* Browser Window Titlebar */}
              <div className="flex h-10 items-center justify-between border-b border-amber-900/40 bg-[#160e0a] px-3.5 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#ff5722]/80" />
                  <span className="h-3 w-3 rounded-full bg-[#ff8a50]/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-300/80" />
                </div>

                {/* URL Address Bar */}
                <div className="flex items-center gap-1.5 rounded-lg bg-surface-1 border border-border px-3 py-1 text-[11px] font-mono text-muted-foreground max-w-[340px] truncate shadow-inner">
                  <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="truncate">{assistant.websiteUrl || "https://my-portfolio.dev"}</span>
                </div>

                <div className="w-12" />
              </div>

              {/* Simulated Website Background Content */}
              <div className="flex-1 overflow-y-auto p-8 relative flex flex-col justify-center items-center text-center space-y-4 bg-gradient-to-b from-surface-1 to-surface-2/60">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs text-emerald-400 font-semibold">
                  <Sparkles className="h-3 w-3" />
                  <span>Live Interactive Preview</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground max-w-md">
                  {scrapedData?.title || assistant.name}
                </h1>
                <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                  {scrapedData?.description ||
                    "This is your live website canvas. Click the floating AI launcher bubble below to test your personalized assistant in real-time!"}
                </p>

                {scrapedData?.skills && scrapedData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-center max-w-md pt-2">
                    {scrapedData.skills.slice(0, 8).map((sk) => (
                      <span
                        key={sk}
                        className="rounded-lg bg-surface-2 border border-border px-2 py-0.5 text-[11px] font-mono text-foreground"
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
                  className={`absolute bottom-20 z-20 flex flex-col rounded-2xl border border-amber-900/40 bg-[#1a100c] shadow-2xl overflow-hidden transition-all duration-200 ${
                    assistant.position === "bottom-left" ? "left-3 sm:left-5" : "right-3 sm:right-5"
                  } ${
                    previewDevice === "desktop"
                      ? "w-[min(340px,calc(100%-1.5rem))] h-[440px]"
                      : "inset-x-2 bottom-0 h-[480px] rounded-b-none"
                  }`}
                >
                  {/* Chat Header */}
                  <div
                    className="flex items-center justify-between px-3.5 py-2.5 border-b border-border/80"
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
                        <div className="font-bold text-xs text-foreground">{assistant.title}</div>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Online</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setSandboxMessages([{ role: "assistant", content: assistant.greeting }])
                        }
                        className="btn-tactile p-1 text-muted-foreground hover:text-foreground transition-colors"
                        title="Clear preview chat"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setIsSandboxChatOpen(false)}
                        className="btn-tactile p-1 text-muted-foreground hover:text-foreground transition-colors"
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
                              ? "text-white font-medium"
                              : "bg-surface-2 text-foreground border border-border"
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
                            className="btn-tactile rounded-xl border border-white/10 bg-[#180f0b] hover:bg-[#281711] px-2.5 py-1 text-[11px] text-[#ff8a50] font-medium transition-colors text-left"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}

                    {isSandboxStreaming && (
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs py-1">
                        <span className="h-2 w-2 rounded-full bg-[#ff5722] animate-bounce" />
                        <span className="h-2 w-2 rounded-full bg-[#ff5722] animate-bounce [animation-delay:0.2s]" />
                        <span className="h-2 w-2 rounded-full bg-[#ff5722] animate-bounce [animation-delay:0.4s]" />
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Input Field */}
                  <div className="p-2 border-t border-border bg-surface-2/60 flex items-center gap-1.5">
                    <input
                      type="text"
                      value={sandboxInput}
                      onChange={(e) => setSandboxInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSandboxSend()}
                      placeholder="Ask a question..."
                      className="flex-1 rounded-xl border border-white/10 bg-[#180f0b] px-3 py-1.5 text-xs text-[#faf5ef] placeholder:text-[#b8a79b] focus:outline-none focus:border-[#ff5722] transition-colors"
                    />
                    <button
                      onClick={() => handleSandboxSend()}
                      disabled={isSandboxStreaming || !sandboxInput.trim()}
                      style={{ backgroundColor: assistant.brandColor }}
                      className="btn-tactile h-7 w-7 rounded-lg text-white flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-40"
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
                className={`btn-tactile absolute bottom-4 z-10 h-12 w-12 rounded-full flex items-center justify-center text-xl text-white shadow-xl hover:scale-110 active:scale-95 transition-all ${
                  assistant.position === "bottom-left" ? "left-4" : "right-4"
                }`}
              >
                {isSandboxChatOpen ? <X className="h-5 w-5" /> : assistant.avatar}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
