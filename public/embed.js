(function () {
  "use strict";

  if (window.__ModelDeckAssistantLoaded) return;
  window.__ModelDeckAssistantLoaded = true;

  // Locate the current script tag and extract data attributes
  const currentScript =
    document.currentScript ||
    document.querySelector("script[data-assistant-id]") ||
    document.querySelector("script[src*='embed.js']");

  const scriptSrc = currentScript ? currentScript.getAttribute("src") || "" : "";
  let defaultApiUrl = "";
  try {
    if (scriptSrc) {
      const u = new URL(scriptSrc, window.location.href);
      defaultApiUrl = u.origin;
    } else {
      defaultApiUrl = window.location.origin;
    }
  } catch {
    defaultApiUrl = window.location.origin;
  }

  const rawSuggested = currentScript?.getAttribute("data-suggested") || "";
  const initialSuggested = rawSuggested
    ? rawSuggested.split(",").map((s) => s.trim()).filter(Boolean)
    : ["What projects have you built?", "What is your tech stack?", "How can I contact you?"];

  const config = {
    id: currentScript?.getAttribute("data-assistant-id") || "default-assistant",
    apiUrl: (currentScript?.getAttribute("data-api-url") || defaultApiUrl).replace(/\/+$/, ""),
    title: currentScript?.getAttribute("data-title") || "AI Assistant",
    greeting:
      currentScript?.getAttribute("data-greeting") ||
      "Hi there! 👋 I'm your interactive AI portfolio assistant. Ask me anything about my projects, skills, or background!",
    avatar: currentScript?.getAttribute("data-avatar") || "🤖",
    brandColor: currentScript?.getAttribute("data-color") || "#3b82f6",
    position: currentScript?.getAttribute("data-position") || "bottom-right",
    persona: currentScript?.getAttribute("data-persona") || "",
    provider: currentScript?.getAttribute("data-provider") || "groq",
    model: currentScript?.getAttribute("data-model") || "llama-3.3-70b-versatile",
    suggestedQuestions: initialSuggested,
  };

  const STORAGE_KEY = `modeldeck_assistant_session_${config.id}`;

  // Extract real-time live page context from the current website DOM
  function getLivePageContext() {
    try {
      const title = document.title || "";
      const descMeta =
        document.querySelector('meta[name="description"]') ||
        document.querySelector('meta[property="og:description"]');
      const description = descMeta ? descMeta.getAttribute("content") || "" : "";

      // Extract headings from the page
      const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
        .map((h) => (h.innerText || "").trim())
        .filter((t) => t.length > 2 && t.length < 90)
        .slice(0, 15);

      // Extract visible text content, stripping out script/style/assistant DOM
      let bodySnippet = "";
      if (document.body) {
        const clone = document.body.cloneNode(true);
        clone
          .querySelectorAll("script, style, svg, noscript, [id^='modeldeck-assistant']")
          .forEach((el) => el.remove());
        bodySnippet = (clone.innerText || "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 4500);
      }

      return {
        url: window.location.href,
        hostname: window.location.hostname,
        pathname: window.location.pathname,
        title,
        description,
        headings,
        bodySnippet,
      };
    } catch {
      return null;
    }
  }

  // Helper: safe markdown renderer with strict XSS escaping
  function escapeHtml(text) {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderMarkdown(raw) {
    if (!raw) return "";

    const codeBlocks = [];
    const inlineCodes = [];

    // 1. Stash fenced code blocks
    let text = raw.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, function (_, lang, code) {
      const idx = codeBlocks.length;
      const codeId = "code-" + Math.random().toString(36).slice(2, 9);
      const escapedCode = escapeHtml(code.trim());
      const langLabel = escapeHtml(lang ? lang.toUpperCase() : "CODE");
      codeBlocks.push(`<div class="md-codeblock">
        <div class="md-code-header">
          <span class="md-code-lang">${langLabel}</span>
          <button class="md-copy-btn" data-code-id="${codeId}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>Copy</span>
          </button>
        </div>
        <pre><code id="${codeId}">${escapedCode}</code></pre>
      </div>`);
      return `__MD_CODE_BLOCK_${idx}__`;
    });

    // 2. Stash inline code
    text = text.replace(/`([^`\n]+)`/g, function (_, code) {
      const idx = inlineCodes.length;
      inlineCodes.push(`<code class="md-inline-code">${escapeHtml(code)}</code>`);
      return `__MD_INLINE_CODE_${idx}__`;
    });

    // 3. Escape all remaining text to prevent HTML injection & tag parsing errors
    let html = escapeHtml(text);

    // 4. Safe links [title](https://...)
    html = html.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      function (_, title, url) {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="md-link">${title} ↗</a>`;
      }
    );

    // 5. Bold, italic, strikethrough
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    html = html.replace(/~~([^~]+)~~/g, "<del>$1</del>");

    // 6. Bullet lists
    html = html.replace(/^\s*[-*]\s+(.*)$/gm, '<li class="md-bullet">$1</li>');
    html = html.replace(/(<li class="md-bullet">.*<\/li>\s*)+/g, '<ul class="md-list">$&</ul>');

    // 7. Numbered lists
    html = html.replace(/^\s*\d+\.\s+(.*)$/gm, '<li class="md-num">$1</li>');
    html = html.replace(/(<li class="md-num">.*<\/li>\s*)+/g, '<ol class="md-num-list">$&</ol>');

    // 8. Line breaks
    html = html.replace(/\n\n+/g, "<br/><br/>");
    html = html.replace(/\n/g, "<br/>");

    // 9. Restore code blocks & inline codes
    html = html.replace(/__MD_CODE_BLOCK_(\d+)__/g, function (_, idx) {
      return codeBlocks[Number(idx)] || "";
    });
    html = html.replace(/__MD_INLINE_CODE_(\d+)__/g, function (_, idx) {
      return inlineCodes[Number(idx)] || "";
    });

    return html;
  }

  // Load and save session
  function loadHistory() {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [
      {
        role: "assistant",
        content: config.greeting,
        timestamp: Date.now(),
      },
    ];
  }

  function saveHistory(messages) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }

  // Mount Host & Shadow DOM
  const host = document.createElement("div");
  host.id = "modeldeck-assistant-root";
  host.style.position = "fixed";
  host.style.zIndex = "2147483647";
  if (config.position === "bottom-left") {
    host.style.bottom = "20px";
    host.style.left = "20px";
  } else {
    host.style.bottom = "20px";
    host.style.right = "20px";
  }
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  // CSS Styles
  const styles = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    :host {
      --brand: ${config.brandColor};
      --brand-hover: ${config.brandColor}dd;
      --bg-dark: #0f1115;
      --bg-surface: #181b21;
      --bg-card: #20242c;
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
      --border-color: #2e3440;
      --code-bg: #111317;
      --chip-bg: #1d212a;
      --chip-text: #93c5fd;
      --chip-border: #2e3440;
    }

    :host(.theme-light) {
      --bg-dark: #ffffff;
      --bg-surface: #f8fafc;
      --bg-card: #ffffff;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border-color: #e2e8f0;
      --code-bg: #f8fafc;
      --chip-bg: #f1f5f9;
      --chip-text: #2563eb;
      --chip-border: #cbd5e1;
    }

    /* Launcher Bubble */
    .md-launcher {
      position: relative;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--brand);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      user-select: none;
    }
    .md-launcher:hover {
      transform: scale(1.08);
      box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.5);
    }
    .md-launcher:active {
      transform: scale(0.95);
    }
    .md-launcher-icon {
      font-size: 28px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
    }
    .md-pulse-ring {
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px solid var(--brand);
      opacity: 0.6;
      animation: md-pulse 2.5s infinite;
      pointer-events: none;
    }
    @keyframes md-pulse {
      0% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.2); opacity: 0; }
      100% { transform: scale(1.2); opacity: 0; }
    }

    /* Tooltip / Greeting preview */
    .md-launcher-tooltip {
      position: absolute;
      bottom: 72px;
      right: 0;
      width: 250px;
      background: #181b21;
      color: #fff;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 12px;
      line-height: 1.4;
      border: 1px solid #2e3440;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      gap: 10px;
      animation: md-fade-in 0.3s ease;
      cursor: pointer;
    }
    .md-launcher-tooltip::after {
      content: "";
      position: absolute;
      bottom: -6px;
      right: 24px;
      width: 12px;
      height: 12px;
      background: #181b21;
      border-right: 1px solid #2e3440;
      border-bottom: 1px solid #2e3440;
      transform: rotate(45deg);
    }

    /* Chat Container Window */
    .md-chat-window {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 380px;
      height: 580px;
      max-height: calc(100vh - 110px);
      background: var(--bg-dark);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px) scale(0.96);
      pointer-events: none;
      transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .md-chat-window.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    /* Mobile Drawer */
    @media (max-width: 640px) {
      .md-chat-window {
        bottom: 0 !important;
        right: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 85vh !important;
        max-height: 85vh !important;
        border-radius: 24px 24px 0 0 !important;
        border-bottom: none !important;
      }
      .md-launcher-tooltip {
        display: none !important;
      }
    }

    /* Header */
    .md-header {
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .md-header-profile {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }
    .md-avatar {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: var(--brand);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .md-profile-meta {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .md-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .md-status {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      color: #10b981;
      font-weight: 500;
    }
    .md-status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
    }
    .md-header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .md-btn-icon {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .md-btn-icon:hover {
      background: var(--border-color);
      color: var(--text-main);
    }

    /* Messages Area */
    .md-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
    }
    .md-messages::-webkit-scrollbar {
      width: 6px;
    }
    .md-messages::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 3px;
    }

    /* Message Bubbles */
    .md-bubble-row {
      display: flex;
      width: 100%;
    }
    .md-bubble-row.user {
      justify-content: flex-end;
    }
    .md-bubble-row.assistant {
      justify-content: flex-start;
    }

    .md-bubble {
      max-width: 84%;
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 13.5px;
      line-height: 1.5;
      word-break: break-word;
    }
    .md-bubble-row.user .md-bubble {
      background: var(--brand);
      color: #ffffff;
      border-bottom-right-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .md-bubble-row.assistant .md-bubble {
      background: var(--bg-card);
      color: var(--text-main);
      border: 1px solid var(--border-color);
      border-bottom-left-radius: 4px;
    }

    /* Suggested Chips */
    .md-chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 4px;
      margin-bottom: 8px;
    }
    .md-chip {
      background: var(--chip-bg);
      border: 1px solid var(--chip-border);
      color: var(--chip-text);
      border-radius: 12px;
      padding: 6px 10px;
      font-size: 11.5px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }
    .md-chip:hover {
      background: #252b36;
      border-color: #3b82f6;
      color: #ffffff;
      transform: translateY(-1px);
    }

    /* Markdown styling inside assistant bubble */
    .md-bubble strong { font-weight: 600; color: #fff; }
    .md-bubble em { font-style: italic; }
    .md-inline-code {
      background: #12141a;
      border: 1px solid #2b313d;
      padding: 2px 5px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      color: #93c5fd;
    }
    .md-codeblock {
      margin: 8px 0;
      border-radius: 8px;
      background: #111317;
      border: 1px solid #2b313d;
      overflow: hidden;
    }
    .md-code-header {
      background: #181b22;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 8px;
      font-size: 10px;
      color: #9ca3af;
      border-bottom: 1px solid #2b313d;
    }
    .md-copy-btn {
      background: transparent;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .md-copy-btn:hover {
      background: #282e3b;
      color: #fff;
    }
    .md-codeblock pre {
      padding: 10px;
      overflow-x: auto;
      font-family: monospace;
      font-size: 12px;
      color: #e5e7eb;
      line-height: 1.4;
    }
    .md-link {
      color: #60a5fa;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .md-list, .md-num-list {
      padding-left: 18px;
      margin: 6px 0;
    }

    /* Typing indicator */
    .md-typing {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 6px;
    }
    .md-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--text-muted);
      animation: md-bounce 1.4s infinite ease-in-out both;
    }
    .md-dot:nth-child(1) { animation-delay: -0.32s; }
    .md-dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes md-bounce {
      0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* Input Area */
    .md-input-area {
      background: var(--bg-surface);
      border-top: 1px solid var(--border-color);
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .md-input-box {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      background: var(--bg-dark);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 6px 10px;
      transition: border-color 0.2s;
    }
    .md-input-box:focus-within {
      border-color: var(--brand);
      box-shadow: 0 0 0 1px var(--brand);
    }
    .md-textarea {
      flex: 1;
      background: transparent;
      border: none;
      color: var(--text-main);
      font-size: 13px;
      line-height: 1.4;
      resize: none;
      max-height: 100px;
      outline: none;
      padding: 4px 0;
    }
    .md-textarea::placeholder {
      color: #6b7280;
    }
    .md-send-btn {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: var(--brand);
      border: none;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .md-send-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .md-send-btn:not(:disabled):hover {
      background: var(--brand-hover);
      transform: translateY(-1px);
    }

    /* Footer Branding */
    .md-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      font-size: 10px;
      color: #6b7280;
    }
    .md-footer a {
      color: #9ca3af;
      text-decoration: none;
      font-weight: 500;
    }
    .md-footer a:hover {
      color: #d1d5db;
    }
  `;

  // HTML Structure
  shadow.innerHTML = `
    <style>${styles}</style>

    <!-- Launcher Tooltip / Welcome greeting -->
    <div class="md-launcher-tooltip" id="mdLauncherTooltip">
      <div style="font-size: 18px;">${config.avatar}</div>
      <div>
        <div style="font-weight: 600; color: #fff;">${config.title}</div>
        <div style="color: #9ca3af; font-size: 11px;">Ask me anything! Click to chat.</div>
      </div>
    </div>

    <!-- Floating Launcher Bubble -->
    <div class="md-launcher" id="mdLauncher" aria-label="Open AI Assistant" role="button" tabIndex="0">
      <div class="md-pulse-ring"></div>
      <div class="md-launcher-icon" id="mdLauncherIcon">${config.avatar}</div>
    </div>

    <!-- Chat Modal Window -->
    <div class="md-chat-window" id="mdChatWindow">
      <!-- Header -->
      <div class="md-header">
        <div class="md-header-profile">
          <div class="md-avatar">${config.avatar}</div>
          <div class="md-profile-meta">
            <span class="md-title">${config.title}</span>
            <span class="md-status"><span class="md-status-dot"></span> Online</span>
          </div>
        </div>
        <div class="md-header-actions">
          <button class="md-btn-icon" id="mdThemeBtn" title="Toggle Light / Dark mode">
            <svg id="mdThemeIconSun" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            <svg id="mdThemeIconMoon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          </button>
          <button class="md-btn-icon" id="mdClearBtn" title="Clear Chat History">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
          </button>
          <button class="md-btn-icon" id="mdCloseBtn" title="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <!-- Messages List -->
      <div class="md-messages" id="mdMessages"></div>

      <!-- Input Area -->
      <div class="md-input-area">
        <div class="md-input-box">
          <textarea
            class="md-textarea"
            id="mdInput"
            rows="1"
            placeholder="Ask anything about projects, skills, contact..."
          ></textarea>
          <button class="md-send-btn" id="mdSendBtn" title="Send Message">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
        <div class="md-footer">
          <span>Powered by</span>
          <a href="${config.apiUrl || "https://github.com"}" target="_blank" rel="noopener noreferrer">ModelDeck AI</a>
        </div>
      </div>
    </div>
  `;

  // DOM Elements
  const launcher = shadow.getElementById("mdLauncher");
  const launcherIcon = shadow.getElementById("mdLauncherIcon");
  const launcherTooltip = shadow.getElementById("mdLauncherTooltip");
  const chatWindow = shadow.getElementById("mdChatWindow");
  const closeBtn = shadow.getElementById("mdCloseBtn");
  const clearBtn = shadow.getElementById("mdClearBtn");
  const themeBtn = shadow.getElementById("mdThemeBtn");
  const themeSun = shadow.getElementById("mdThemeIconSun");
  const themeMoon = shadow.getElementById("mdThemeIconMoon");

  function getStoredOrHostTheme() {
    try {
      const saved = sessionStorage.getItem("modeldeck_theme_" + config.id);
      if (saved === "light" || saved === "dark") return saved;
      if (document.body) {
        const bodyBg = window.getComputedStyle(document.body).backgroundColor;
        if (bodyBg && bodyBg !== "transparent" && bodyBg !== "rgba(0, 0, 0, 0)") {
          const rgb = bodyBg.match(/\d+/g);
          if (rgb && rgb.length >= 3) {
            const brightness = (Number(rgb[0]) * 299 + Number(rgb[1]) * 587 + Number(rgb[2]) * 114) / 1000;
            return brightness > 140 ? "light" : "dark";
          }
        }
      }
      return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    } catch {
      return "dark";
    }
  }

  function applyWidgetTheme(theme) {
    if (theme === "light") {
      host.classList.add("theme-light");
      if (themeSun) themeSun.style.display = "none";
      if (themeMoon) themeMoon.style.display = "block";
    } else {
      host.classList.remove("theme-light");
      if (themeSun) themeSun.style.display = "block";
      if (themeMoon) themeMoon.style.display = "none";
    }
    try {
      sessionStorage.setItem("modeldeck_theme_" + config.id, theme);
    } catch {}
  }

  let currentWidgetTheme = getStoredOrHostTheme();
  applyWidgetTheme(currentWidgetTheme);

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      currentWidgetTheme = currentWidgetTheme === "light" ? "dark" : "light";
      applyWidgetTheme(currentWidgetTheme);
    });
  }
  const messagesContainer = shadow.getElementById("mdMessages");
  const textarea = shadow.getElementById("mdInput");
  const sendBtn = shadow.getElementById("mdSendBtn");

  let isOpen = false;
  let isGenerating = false;
  let messages = loadHistory();

  function toggleChat(force) {
    isOpen = typeof force === "boolean" ? force : !isOpen;
    if (isOpen) {
      chatWindow.classList.add("open");
      launcherIcon.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      if (launcherTooltip) launcherTooltip.style.display = "none";
      setTimeout(() => textarea.focus(), 150);
      scrollToBottom();
    } else {
      chatWindow.classList.remove("open");
      launcherIcon.innerHTML = config.avatar;
    }
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function renderMessages() {
    messagesContainer.innerHTML = "";

    messages.forEach((msg, idx) => {
      const row = document.createElement("div");
      row.className = `md-bubble-row ${msg.role}`;

      const bubble = document.createElement("div");
      bubble.className = "md-bubble";

      if (msg.role === "assistant") {
        bubble.innerHTML = renderMarkdown(msg.content);
      } else {
        bubble.textContent = msg.content;
      }

      row.appendChild(bubble);
      messagesContainer.appendChild(row);

      // Show suggested questions after initial greeting if there's only 1 message
      if (idx === 0 && messages.length === 1 && config.suggestedQuestions.length > 0) {
        const chipsContainer = document.createElement("div");
        chipsContainer.className = "md-chips-container";

        config.suggestedQuestions.forEach((q) => {
          const chip = document.createElement("button");
          chip.className = "md-chip";
          chip.textContent = q;
          chip.addEventListener("click", () => {
            chipsContainer.remove();
            sendMessage(q);
          });
          chipsContainer.appendChild(chip);
        });

        messagesContainer.appendChild(chipsContainer);
      }
    });

    // Attach copy button listeners
    shadow.querySelectorAll(".md-copy-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-code-id");
        const codeEl = shadow.getElementById(targetId);
        if (codeEl) {
          navigator.clipboard.writeText(codeEl.textContent || "");
          const originalText = btn.innerHTML;
          btn.innerHTML = `<span>✓ Copied!</span>`;
          setTimeout(() => {
            btn.innerHTML = originalText;
          }, 2000);
        }
      });
    });

    scrollToBottom();
  }

  async function sendMessage(text) {
    const trimmed = (text || textarea.value).trim();
    if (!trimmed || isGenerating) return;

    textarea.value = "";
    textarea.style.height = "auto";

    // Append user message
    messages.push({ role: "user", content: trimmed, timestamp: Date.now() });
    renderMessages();
    saveHistory(messages);

    // Append temporary assistant typing bubble
    isGenerating = true;
    sendBtn.disabled = true;

    const typingRow = document.createElement("div");
    typingRow.className = "md-bubble-row assistant";
    typingRow.id = "mdTypingBubble";
    typingRow.innerHTML = `
      <div class="md-bubble">
        <div class="md-typing">
          <div class="md-dot"></div>
          <div class="md-dot"></div>
          <div class="md-dot"></div>
        </div>
      </div>
    `;
    messagesContainer.appendChild(typingRow);
    scrollToBottom();

    // Stream from public chat API
    let assistantReply = "";
    try {
      const endpoint = `${config.apiUrl}/api/assistant/chat`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Assistant-Id": config.id,
        },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          assistantConfig: config,
          hostOrigin: window.location.origin,
          pageContext: getLivePageContext(),
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Replace typing row with live assistant bubble
      typingRow.remove();

      const liveRow = document.createElement("div");
      liveRow.className = "md-bubble-row assistant";
      const liveBubble = document.createElement("div");
      liveBubble.className = "md-bubble";
      liveRow.appendChild(liveBubble);
      messagesContainer.appendChild(liveRow);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const rawData = line.slice(6).trim();
              if (rawData === "[DONE]") break;
              try {
                const parsed = JSON.parse(rawData);
                if (parsed.text) {
                  assistantReply += parsed.text;
                  liveBubble.innerHTML = renderMarkdown(assistantReply);
                  scrollToBottom();
                }
              } catch {
                // ignore
              }
            }
          }
        }
      }

      messages.push({
        role: "assistant",
        content: assistantReply || "I am here to help! Ask me anything.",
        timestamp: Date.now(),
      });
      saveHistory(messages);
      renderMessages();
    } catch (err) {
      typingRow?.remove();
      const errorMsg = err instanceof Error ? err.message : "Something went wrong.";
      messages.push({
        role: "assistant",
        content: `⚠️ *Error:* ${errorMsg}\n\nPlease try again in a moment.`,
        timestamp: Date.now(),
      });
      saveHistory(messages);
      renderMessages();
    } finally {
      isGenerating = false;
      sendBtn.disabled = false;
    }
  }

  // Event Listeners
  launcher.addEventListener("click", () => toggleChat());
  launcherTooltip?.addEventListener("click", () => toggleChat(true));
  closeBtn.addEventListener("click", () => toggleChat(false));

  clearBtn.addEventListener("click", () => {
    if (confirm("Clear conversation history?")) {
      messages = [
        {
          role: "assistant",
          content: config.greeting,
          timestamp: Date.now(),
        },
      ];
      saveHistory(messages);
      renderMessages();
    }
  });

  sendBtn.addEventListener("click", () => sendMessage());

  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  textarea.addEventListener("input", () => {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + "px";
  });

  // Global API
  window.ModelDeckAssistant = {
    open: () => toggleChat(true),
    close: () => toggleChat(false),
    toggle: () => toggleChat(),
    sendMessage: (text) => sendMessage(text),
    config,
  };

  // Initial render
  renderMessages();
})();
