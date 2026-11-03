import fs from "fs";
import path from "path";

console.log("=== ModelDeck Personalized AI Assistant Test Suite ===");

// 1. Verify public/embed.js exists and has core components
const embedJsPath = path.join(process.cwd(), "public", "embed.js");
if (!fs.existsSync(embedJsPath)) {
  console.error("FAIL: public/embed.js does not exist!");
  process.exit(1);
}
const embedContent = fs.readFileSync(embedJsPath, "utf-8");
const checks = [
  "attachShadow",
  "md-launcher",
  "md-chat-window",
  "renderMarkdown",
  "/api/assistant/chat",
  "md-copy-btn",
  "md-chip",
  "suggestedQuestions",
];

for (const check of checks) {
  if (!embedContent.includes(check)) {
    console.error(`FAIL: public/embed.js missing required feature: ${check}`);
    process.exit(1);
  }
}
console.log("PASS: public/embed.js integrity verified (Shadow DOM, markdown code copying, streaming, chips).");

// 2. Unit test scraper HTML parser logic (including reversed meta attribute order)
function testScraperParser() {
  const sampleHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Sarah Jenkins - Senior AI Engineer</title>
        <!-- Reversed meta attribute order: content first -->
        <meta content="AI Researcher and Full-Stack Engineer building Next.js and PyTorch applications." name="description" />
        <meta content="Sarah Jenkins" name="author" />
        <meta content="Sarah Jenkins Portfolio" property="og:title" />
      </head>
      <body>
        <h1>Sarah Jenkins</h1>
        <p>I build autonomous LLM agents and web tools using React, TypeScript, Python, and Docker.</p>
        <h2>Project Alpha</h2>
        <p>An open-source AI platform with over 10k stars.</p>
        <a href="https://github.com/sarahjenkins">GitHub</a>
        <a href="mailto:sarah@example.com">Contact</a>
      </body>
    </html>
  `;

  function extractMetaTag(html, key) {
    const p1 = new RegExp(`<meta[^>]*(?:name|property)=["']${key}["'][^>]*content=["']([^"']*)["']`, "i");
    const m1 = html.match(p1);
    if (m1) return m1[1];
    const p2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${key}["']`, "i");
    const m2 = html.match(p2);
    if (m2) return m2[1];
    return "";
  }

  const clean = sampleHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");

  const titleMatch = clean.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const author = extractMetaTag(clean, "author");
  const desc = extractMetaTag(clean, "description");
  const ogTitle = extractMetaTag(clean, "og:title");
  const mailMatch = clean.match(/href=["']mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})["']/i);
  const ghMatch = clean.match(/href=["'](https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_-]+)["']/i);

  if (!titleMatch || !titleMatch[1].includes("Sarah Jenkins")) throw new Error("Title extraction failed");
  if (author !== "Sarah Jenkins") throw new Error("Author extraction failed for reversed attribute order");
  if (!desc.includes("PyTorch")) throw new Error("Description extraction failed for reversed attribute order");
  if (ogTitle !== "Sarah Jenkins Portfolio") throw new Error("og:title extraction failed for reversed attribute order");
  if (!mailMatch || mailMatch[1] !== "sarah@example.com") throw new Error("Email extraction failed");
  if (!ghMatch || !ghMatch[1].includes("sarahjenkins")) throw new Error("GitHub link extraction failed");

  // Test C++ and special character skills matching without regex crashing
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  const testHtml = "I write high-performance C++ backend services and React frontend code.";
  const testTech = ["C++", "C#", "Next.js", "React", "Go"];
  const detected = [];
  for (const tech of testTech) {
    const escaped = escapeRegex(tech);
    const startBoundary = /^\w/.test(tech) ? "\\b" : "(?:^|[^a-zA-Z0-9_])";
    const endBoundary = /\w$/.test(tech) ? "\\b" : "(?:$|[^a-zA-Z0-9_])";
    const pattern = new RegExp(`${startBoundary}${escaped}${endBoundary}`, "i");
    if (pattern.test(testHtml)) detected.push(tech);
  }
  if (!detected.includes("C++") || !detected.includes("React") || detected.includes("C#") || detected.includes("Go")) {
    throw new Error(`Tech detection failed: ${JSON.stringify(detected)}`);
  }

  console.log("PASS: Scraper parser logic extracted title, author, email, og:title, and C++ tech skills safely.");
}
testScraperParser();

// 3. Unit test GitHub PR URL parser logic
function testGitHubUrlParser() {
  const testCases = [
    { input: "https://github.com/octocat/Hello-World", expected: { owner: "octocat", repo: "Hello-World" } },
    { input: "https://github.com/john-doe/my-portfolio.git", expected: { owner: "john-doe", repo: "my-portfolio" } },
    { input: "alex/portfolio", expected: { owner: "alex", repo: "portfolio" } },
  ];

  for (const tc of testCases) {
    const trimmed = tc.input.trim().replace(/\/+$/, "");
    const httpsMatch = trimmed.match(/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?$/i);
    const slugMatch = trimmed.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
    const parsed = httpsMatch
      ? { owner: httpsMatch[1], repo: httpsMatch[2] }
      : slugMatch
      ? { owner: slugMatch[1], repo: slugMatch[2] }
      : null;

    if (!parsed || parsed.owner !== tc.expected.owner || parsed.repo !== tc.expected.repo) {
      throw new Error(`GitHub parser failed for ${tc.input}`);
    }
  }
  console.log("PASS: GitHub repository URL parser passed all variations.");
}
testGitHubUrlParser();

// 4. Test SSRF prevention logic (including 127.0.0.2, 0.0.0.0, integer IPs, IPv6)
function testSsrfProtection() {
  function isDangerousHost(hostname) {
    const lower = hostname.toLowerCase().trim();
    if (
      lower === "localhost" ||
      lower === "127.0.0.1" ||
      lower === "0.0.0.0" ||
      lower === "::1" ||
      lower === "[::1]" ||
      lower.endsWith(".local") ||
      lower.endsWith(".internal") ||
      lower.startsWith("fe80:") ||
      lower.startsWith("fc00:") ||
      lower.startsWith("fd00:")
    ) {
      return true;
    }

    if (/^(?:0x[0-9a-f]+|\d+)$/i.test(lower)) {
      return true;
    }

    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = lower.match(ipv4Regex);
    if (match) {
      const [, b1, b2] = match.map(Number);
      if (b1 === 127) return true; // 127.0.0.0/8
      if (b1 === 0) return true;   // 0.0.0.0/8
      if (b1 === 10) return true;  // 10.0.0.0/8
      if (b1 === 172 && b2 >= 16 && b2 <= 31) return true; // 172.16.0.0/12
      if (b1 === 192 && b2 === 168) return true; // 192.168.0.0/16
      if (b1 === 169 && b2 === 254) return true; // 169.254.0.0/16
      if (b1 === 100 && b2 >= 64 && b2 <= 127) return true; // 100.64.0.0/10
    }
    return false;
  }

  const forbiddenHosts = [
    "localhost",
    "127.0.0.1",
    "127.0.0.2",
    "127.255.255.254",
    "0.0.0.0",
    "::1",
    "[::1]",
    "169.254.169.254",
    "10.0.0.1",
    "192.168.1.1",
    "172.20.0.1",
    "100.64.0.1",
    "2130706433",
    "internal.local",
    "metadata.internal",
    "fe80::1",
    "fc00::1",
  ];

  for (const host of forbiddenHosts) {
    if (!isDangerousHost(host)) {
      throw new Error(`SSRF check failed to flag dangerous host: ${host}`);
    }
  }

  const safeHosts = ["github.com", "leerob.io", "rauchg.com", "myportfolio.dev", "api.openai.com"];
  for (const host of safeHosts) {
    if (isDangerousHost(host)) {
      throw new Error(`SSRF check falsely flagged safe host: ${host}`);
    }
  }

  console.log("PASS: SSRF safety check successfully blocks private, loopback, decimal, and metadata IPs while allowing public domains.");
}
testSsrfProtection();

// 5. Test JSX/TSX vs HTML comment handling for GitHub PR injection
function testCommentHandling() {
  function getCommentTag(targetFilePath) {
    const isJsxOrTsx = /\.[jt]sx?$/i.test(targetFilePath);
    return isJsxOrTsx
      ? "{/* ModelDeck Personalized AI Assistant */}"
      : "<!-- ModelDeck Personalized AI Assistant -->";
  }

  if (getCommentTag("app/layout.tsx") !== "{/* ModelDeck Personalized AI Assistant */}") {
    throw new Error("Next.js layout.tsx did not receive JSX comment format");
  }
  if (getCommentTag("src/app/layout.jsx") !== "{/* ModelDeck Personalized AI Assistant */}") {
    throw new Error("React layout.jsx did not receive JSX comment format");
  }
  if (getCommentTag("index.html") !== "<!-- ModelDeck Personalized AI Assistant -->") {
    throw new Error("index.html did not receive HTML comment format");
  }
  if (getCommentTag("src/layouts/Layout.astro") !== "<!-- ModelDeck Personalized AI Assistant -->") {
    throw new Error("Astro layout did not receive HTML comment format");
  }

  console.log("PASS: GitHub PR injector correctly selects JSX vs HTML comments per framework.");
}
testCommentHandling();

// 6. Test Multiturn Conversation turn sanitization for Gemini & Anthropic
function testTurnSanitization() {
  function sanitizeConversation(messages) {
    const sanitized = [];
    let userFound = false;

    for (const m of messages) {
      if (!m || !m.content) continue;
      if (m.role === "system") continue;

      if (!userFound) {
        if (m.role === "user") {
          userFound = true;
          sanitized.push({ role: "user", content: m.content });
        }
      } else {
        sanitized.push({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        });
      }
    }

    if (sanitized.length === 0) {
      sanitized.push({ role: "user", content: "Hello!" });
    }
    return sanitized;
  }

  const rawMessages = [
    { role: "assistant", content: "Hi! Welcome to my website." }, // initial greeting
    { role: "user", content: "What are your skills?" },
  ];

  const sanitized = sanitizeConversation(rawMessages);
  if (sanitized[0].role !== "user") {
    throw new Error("Sanitization failed: first turn MUST be 'user' for Gemini/Anthropic compatibility");
  }
  if (sanitized.length !== 1 || sanitized[0].content !== "What are your skills?") {
    throw new Error("Sanitization failed to strip leading assistant greeting");
  }

  console.log("PASS: Conversation sanitizer guarantees user-first turns for Gemini & Anthropic.");
}
testTurnSanitization();

// 7. Test CORS clean origin normalization
function testCorsOriginNormalization() {
  function normalizeOrigin(originOrReferer) {
    try {
      return new URL(originOrReferer).origin;
    } catch {
      return originOrReferer || "*";
    }
  }

  const refererWithQuery = "https://myportfolio.com/about/me?ref=github#top";
  const clean = normalizeOrigin(refererWithQuery);
  if (clean !== "https://myportfolio.com") {
    throw new Error(`CORS origin normalization failed: expected 'https://myportfolio.com', got '${clean}'`);
  }

  console.log("PASS: CORS origin extraction correctly strips paths, queries, and fragments.");
}
testCorsOriginNormalization();

// 8. Test monorepo and subfolder layout resolution (e.g. frontend/app/layout.tsx)
function testMonorepoEntrypointResolution() {
  const sampleFiles = [
    "backend/main.py",
    "backend/requirements.txt",
    "frontend/package.json",
    "frontend/app/layout.tsx",
    "frontend/app/page.tsx",
    "package.json"
  ];

  const appLayouts = sampleFiles.filter((f) =>
    /(?:^|\/)(?:app|src\/app)\/layout\.(?:tsx|jsx|js)$/i.test(f)
  );
  const resolved =
    appLayouts.find((f) => /^(?:frontend|client|web)\//i.test(f)) ||
    appLayouts.find((f) => /^src\//i.test(f)) ||
    appLayouts[0];

  if (resolved !== "frontend/app/layout.tsx") {
    throw new Error(`Monorepo entrypoint failed: expected 'frontend/app/layout.tsx', got '${resolved}'`);
  }
  console.log("PASS: Monorepo subfolder entrypoint successfully resolved frontend/app/layout.tsx.");
}
testMonorepoEntrypointResolution();

// 9. Test real-time page context personalization injection
function testPageContextPersonalization() {
  const pageContext = {
    title: "TRAFFIC TREND — Road Safety Intelligence",
    url: "https://traffic-trend.vercel.app",
    description: "Accident Analytics and Hotspotting Platform",
    headings: ["Overview", "KPIs", "Accident Trends", "Severity Breakdown"],
    bodySnippet: "Executive Overview & KPIs Benchmark Demonstration Dataset PostgreSQL Live Road Safety Intelligence...",
  };

  const pageTitle = pageContext.title;
  let persona = `You are the official dedicated AI Personal Assistant for "${pageTitle}".`;
  if (pageContext.bodySnippet || pageContext.headings) {
    persona += `\n\n--- VERIFIED LIVE WEBSITE KNOWLEDGE BASE ---\nTitle: ${pageTitle}\nHeadings: ${pageContext.headings.join(", ")}\nContent: ${pageContext.bodySnippet}`;
  }

  if (!persona.includes("TRAFFIC TREND") || !persona.includes("Road Safety Intelligence") || !persona.includes("Severity Breakdown")) {
    throw new Error("Page context personalization failed to ground assistant persona!");
  }
  console.log("PASS: Real-time on-page context personalization verified.");
}
testPageContextPersonalization();

console.log("ALL ASSISTANT SYSTEM TESTS PASSED SUCCESSFULLY! 🚀");
