import { NextRequest, NextResponse } from "next/server";
import { AssistantConfig, ScrapedSiteData, ScrapeResponse } from "@/lib/assistantTypes";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), "data");
const VAULT_FILE = path.join(DATA_DIR, "vault.json");

// Helper to check for private or dangerous IP addresses (SSRF prevention)
function isDangerousHost(hostname: string): boolean {
  const lower = hostname.toLowerCase().trim();
  if (
    lower === "localhost" ||
    lower === "127.0.0.1" ||
    lower === "0.0.0.0" ||
    lower === "::1" ||
    lower === "[::1]" ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal") ||
    lower.startsWith("fe80:") || // IPv6 Link-local
    lower.startsWith("fc00:") || // IPv6 Unique Local
    lower.startsWith("fd00:")
  ) {
    return true;
  }

  // Check decimal or hex single-number IP representation (e.g. 2130706433 or 0x7f000001 for 127.0.0.1)
  if (/^(?:0x[0-9a-f]+|\d+)$/i.test(lower)) {
    return true;
  }

  // Check IPv4 private and loopback ranges
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = lower.match(ipv4Regex);
  if (match) {
    const [, b1, b2] = match.map(Number);
    if (b1 === 127) return true; // 127.0.0.0/8 (Loopback: 127.0.0.1 to 127.255.255.254)
    if (b1 === 0) return true;   // 0.0.0.0/8 (Current network)
    if (b1 === 10) return true;  // 10.0.0.0/8 (Private)
    if (b1 === 172 && b2 >= 16 && b2 <= 31) return true; // 172.16.0.0/12 (Private)
    if (b1 === 192 && b2 === 168) return true; // 192.168.0.0/16 (Private)
    if (b1 === 169 && b2 === 254) return true; // 169.254.0.0/16 (Cloud metadata)
    if (b1 === 100 && b2 >= 64 && b2 <= 127) return true; // 100.64.0.0/10 (Carrier-grade NAT)
  }
  return false;
}

// Read keys from vault or environment
async function getServerKey(provider: string): Promise<string> {
  const envKey =
    process.env[`${provider.toUpperCase()}_API_KEY`] ||
    process.env[`NEXT_PUBLIC_${provider.toUpperCase()}_API_KEY`];
  if (envKey && envKey.trim()) return envKey.trim();

  try {
    const content = await fs.readFile(VAULT_FILE, "utf-8");
    const vaultData = JSON.parse(content);
    if (vaultData[provider] && typeof vaultData[provider] === "string") {
      return vaultData[provider].trim();
    }
  } catch {
    // vault file doesn't exist
  }
  return "";
}

// Safe regex escaper to prevent ReDoS and invalid pattern syntax
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Robust meta attribute parser regardless of property/name/content order
function extractMetaTag(html: string, key: string): string {
  const safeKey = escapeRegex(key);
  const p1 = new RegExp(`<meta[^>]*(?:name|property)=["']${safeKey}["'][^>]*content=["']([^"']*)["']`, "i");
  const m1 = html.match(p1);
  if (m1) return m1[1];

  const p2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${safeKey}["']`, "i");
  const m2 = html.match(p2);
  if (m2) return m2[1];

  return "";
}

// Extract content from HTML
function extractHtmlDetails(html: string, targetUrl: string): ScrapedSiteData {
  const cleanHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");

  // Title
  const ogTitle = extractMetaTag(cleanHtml, "og:title") || extractMetaTag(cleanHtml, "twitter:title");
  const titleMatch = cleanHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const rawTitle = (ogTitle || titleMatch?.[1] || "Portfolio").replace(/<[^>]+>/g, "").trim();

  // Description
  const description = (
    extractMetaTag(cleanHtml, "description") ||
    extractMetaTag(cleanHtml, "og:description") ||
    extractMetaTag(cleanHtml, "twitter:description")
  ).replace(/<[^>]+>/g, "").trim();

  // Author
  let author = (
    extractMetaTag(cleanHtml, "author") ||
    extractMetaTag(cleanHtml, "profile:username") ||
    extractMetaTag(cleanHtml, "twitter:creator")
  ).replace(/<[^>]+>/g, "").replace(/^@/, "").trim();

  // If author is missing, guess from title (e.g. "Alex Doe - Software Engineer")
  if (!author && rawTitle) {
    const parts = rawTitle.split(/[-|–—:]/);
    if (parts.length > 0 && parts[0].trim().split(" ").length <= 4) {
      author = parts[0].trim();
    }
  }

  // Guess from domain name if still missing
  if (!author) {
    try {
      const u = new URL(targetUrl);
      const hostParts = u.hostname.replace(/^www\./, "").split(".")[0];
      if (hostParts && hostParts.length > 2) {
        author = hostParts.charAt(0).toUpperCase() + hostParts.slice(1);
      }
    } catch {
      // ignore
    }
  }

  if (!author) {
    author = "Creator";
  }

  // Detected links
  const detectedLinks: ScrapedSiteData["detectedLinks"] = {};

  const ghMatch = cleanHtml.match(/href=["'](https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_-]+)["']/i);
  if (ghMatch) detectedLinks.github = ghMatch[1];

  const liMatch = cleanHtml.match(/href=["'](https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+)["']/i);
  if (liMatch) detectedLinks.linkedin = liMatch[1];

  const twMatch = cleanHtml.match(/href=["'](https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[a-zA-Z0-9_]+)["']/i);
  if (twMatch) detectedLinks.twitter = twMatch[1];

  const mailMatch = cleanHtml.match(/href=["']mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})["']/i);
  if (mailMatch) detectedLinks.email = mailMatch[1];

  // Tech skills detection
  const commonTech = [
    "React", "Next.js", "TypeScript", "JavaScript", "Python", "Node.js", "Express",
    "Go", "Rust", "Java", "C++", "Tailwind CSS", "Docker", "Kubernetes", "AWS", "GCP",
    "Azure", "PostgreSQL", "MongoDB", "MySQL", "Redis", "GraphQL", "REST API",
    "Machine Learning", "AI", "PyTorch", "TensorFlow", "FastAPI", "Django", "Flask",
    "Vue.js", "Svelte", "Angular", "HTML5", "CSS3", "Git", "GitHub Actions", "CI/CD"
  ];

  const skills: string[] = [];
  for (const tech of commonTech) {
    const escaped = escapeRegex(tech);
    const startBoundary = /^\w/.test(tech) ? "\\b" : "(?:^|[^a-zA-Z0-9_])";
    const endBoundary = /\w$/.test(tech) ? "\\b" : "(?:$|[^a-zA-Z0-9_])";
    try {
      const pattern = new RegExp(`${startBoundary}${escaped}${endBoundary}`, "i");
      if (pattern.test(cleanHtml)) {
        skills.push(tech);
      }
    } catch {
      // Fallback safe string match if regex fails
      if (cleanHtml.toLowerCase().includes(tech.toLowerCase())) {
        skills.push(tech);
      }
    }
  }

  // Extract clean text paragraphs & headings
  const textMatches: string[] = [];
  const headingAndParaRegex = /<(h[1-4]|p|li)[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = headingAndParaRegex.exec(cleanHtml)) !== null) {
    const text = match[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (text.length > 20 && !text.includes("cookie") && !text.includes("privacy policy")) {
      textMatches.push(text);
    }
  }

  const extractedText = textMatches.slice(0, 30).join("\n");

  // Detect simple projects
  const projects: ScrapedSiteData["projects"] = [];
  const headingRegex = /<h[2-3][^>]*>([\s\S]*?)<\/h[2-3]>/gi;
  let hMatch;
  while ((hMatch = headingRegex.exec(cleanHtml)) !== null) {
    const hText = hMatch[1].replace(/<[^>]+>/g, "").trim();
    if (hText.length > 3 && hText.length < 50 && !hText.toLowerCase().includes("about") && !hText.toLowerCase().includes("contact") && !hText.toLowerCase().includes("experience")) {
      projects.push({
        title: hText,
        description: `Project featured on ${author}'s portfolio.`,
      });
      if (projects.length >= 4) break;
    }
  }

  return {
    url: targetUrl,
    title: rawTitle,
    description: description || `Portfolio and personal website of ${author}.`,
    author,
    extractedText: extractedText || description || `Portfolio website of ${author}`,
    detectedLinks,
    skills: skills.slice(0, 15),
    projects,
  };
}

// Fallback rule-based persona synthesizer if LLM keys are not available
function synthesizeHeuristicPersona(data: ScrapedSiteData): AssistantConfig {
  const authorName = data.author || "the site owner";
  const skillsList = data.skills.length > 0 ? data.skills.join(", ") : "Modern software development, web & full-stack technologies";

  const contactDetails: string[] = [];
  if (data.detectedLinks.email) contactDetails.push(`Email: ${data.detectedLinks.email}`);
  if (data.detectedLinks.github) contactDetails.push(`GitHub: ${data.detectedLinks.github}`);
  if (data.detectedLinks.linkedin) contactDetails.push(`LinkedIn: ${data.detectedLinks.linkedin}`);
  if (data.detectedLinks.twitter) contactDetails.push(`X/Twitter: ${data.detectedLinks.twitter}`);
  const contactStr = contactDetails.length > 0 ? contactDetails.join(", ") : "through the contact links on this website";

  const systemPersona = `You are the official AI Personal Assistant for ${authorName}'s website and portfolio.
Your role: Represent ${authorName} professionally, warmly, and knowledgeably to visitors, recruiters, hiring managers, and collaborators.

Here is the verified background from ${authorName}'s portfolio:
- Website: ${data.url}
- Title / Summary: ${data.title} - ${data.description}
- Key Skills & Technologies: ${skillsList}
- Contact channels: ${contactStr}

Guidelines:
1. Speak in first/third person representation: "Welcome! I'm ${authorName}'s personal AI assistant. ${authorName} specializes in ${skillsList.slice(0, 50)}..."
2. Answer questions accurately based on the facts provided above. If asked about something not in ${authorName}'s portfolio, politely offer ${contactStr} so they can connect directly.
3. Be friendly, concise, and recruiter-focused. Highlight strengths and invite them to collaborate or schedule a conversation.
4. Format responses cleanly with bullet points and markdown when helpful.`;

  const suggestedQuestions = [
    `What are ${authorName}'s main skills?`,
    `What projects have you worked on?`,
    `How can I get in touch with ${authorName}?`,
  ];

  return {
    id: `asst-${Date.now().toString(36)}`,
    name: `${authorName}'s AI Assistant`,
    title: `${authorName} • AI Guide`,
    greeting: `Hi! 👋 I'm ${authorName}'s AI Assistant. Ask me anything about ${authorName}'s projects, technical skills, or experience!`,
    persona: systemPersona,
    suggestedQuestions,
    brandColor: "#3b82f6",
    avatar: "🤖",
    position: "bottom-right",
    provider: "groq",
    model: "openai/gpt-oss-120b",
    allowedDomains: ["*"],
    websiteUrl: data.url,
    createdAt: Date.now(),
  };
}

// Call LLM for high-precision persona synthesis
async function synthesizeWithLLM(
  data: ScrapedSiteData,
  providerKey: { provider: string; key: string }
): Promise<AssistantConfig> {
  const prompt = `You are an expert AI persona architect. You are analyzing a portfolio / personal website to construct an elite, highly personalized interactive AI assistant widget for the site.

Here is the scraped content:
URL: ${data.url}
Detected Title: ${data.title}
Author/Name: ${data.author}
Description: ${data.description}
Skills: ${data.skills.join(", ")}
Links: ${JSON.stringify(data.detectedLinks)}
Content Excerpt:
${data.extractedText.slice(0, 2500)}

Generate a valid JSON object matching this exact format:
{
  "name": "${data.author}'s AI Assistant",
  "title": "${data.author} • Portfolio Guide",
  "greeting": "A welcoming, high-energy, concise 1-2 sentence greeting introducing the assistant and offering help to visitors/recruiters.",
  "persona": "A comprehensive, high-precision system prompt instructing the AI how to act as ${data.author}'s personal representative, citing their actual projects, skills, and contact info accurately.",
  "suggestedQuestions": ["3 to 4 specific, hyper-relevant questions tailored to this website/person"],
  "brandColor": "#3b82f6",
  "avatar": "🤖"
}
Output ONLY the JSON object. Do not include markdown codeblocks or other commentary.`;

  try {
    let rawText = "";

    if (providerKey.provider === "groq") {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${providerKey.key}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      });
      if (res.ok) {
        const json = await res.json();
        rawText = json.choices?.[0]?.message?.content || "";
      }
    } else if (providerKey.provider === "gemini") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${providerKey.key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );
      if (res.ok) {
        const json = await res.json();
        rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
    } else if (providerKey.provider === "openai" || providerKey.provider === "deepseek" || providerKey.provider === "openrouter") {
      const endpoint =
        providerKey.provider === "deepseek"
          ? "https://api.deepseek.com/chat/completions"
          : providerKey.provider === "openrouter"
          ? "https://openrouter.ai/api/v1/chat/completions"
          : "https://api.openai.com/v1/chat/completions";
      const model =
        providerKey.provider === "deepseek"
          ? "deepseek-chat"
          : providerKey.provider === "openrouter"
          ? "meta-llama/llama-3.3-70b-instruct"
          : "gpt-4o-mini";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${providerKey.key}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      });
      if (res.ok) {
        const json = await res.json();
        rawText = json.choices?.[0]?.message?.content || "";
      }
    } else if (providerKey.provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": providerKey.key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-20241022",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1500,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        rawText = json.content?.[0]?.text || "";
      }
    }

    if (rawText) {
      // Clean up potential markdown wrapper
      const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      return {
        id: `asst-${Date.now().toString(36)}`,
        name: parsed.name || `${data.author}'s AI Assistant`,
        title: parsed.title || `${data.author} • AI Guide`,
        greeting: parsed.greeting || `Hi! I'm ${data.author}'s AI Assistant. Ask me anything about my projects and skills!`,
        persona: parsed.persona || synthesizeHeuristicPersona(data).persona,
        suggestedQuestions: Array.isArray(parsed.suggestedQuestions) && parsed.suggestedQuestions.length > 0
          ? parsed.suggestedQuestions.slice(0, 4)
          : [`What are ${data.author}'s skills?`, "Tell me about your projects", "How can I contact you?"],
        brandColor: parsed.brandColor || "#3b82f6",
        avatar: parsed.avatar || "🤖",
        position: "bottom-right",
        provider: providerKey.provider as any,
        model: providerKey.provider === "groq" ? "openai/gpt-oss-120b" : providerKey.provider === "gemini" ? "gemini-2.5-flash" : "gpt-4o-mini",
        allowedDomains: ["*"],
        websiteUrl: data.url,
        createdAt: Date.now(),
      };
    }
  } catch (err) {
    console.warn("LLM Persona Synthesis fallback to heuristics:", err);
  }

  return synthesizeHeuristicPersona(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let urlString = (body.url || "").trim();

    if (!urlString) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid website URL to scrape." },
        { status: 400 }
      );
    }

    // Auto prepend https:// if missing
    if (!urlString.startsWith("http://") && !urlString.startsWith("https://")) {
      urlString = `https://${urlString}`;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(urlString);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid URL format." },
        { status: 400 }
      );
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return NextResponse.json(
        { success: false, error: "Only HTTP and HTTPS URLs are supported." },
        { status: 400 }
      );
    }

    if (isDangerousHost(parsedUrl.hostname)) {
      return NextResponse.json(
        { success: false, error: "Localhost and private internal IP addresses are prohibited." },
        { status: 400 }
      );
    }

    // Fetch the target website with a 10s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let html = "";
    try {
      const response = await fetch(urlString, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 ModelDeckBot/1.0",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          {
            success: false,
            error: `Failed to fetch website (${response.status} ${response.statusText}). Please check the URL.`,
          },
          { status: 400 }
        );
      }

      html = await response.text();
    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === "AbortError";
      return NextResponse.json(
        {
          success: false,
          error: isAbort
            ? "Website connection timed out after 10 seconds."
            : "Could not connect to the website. Verify the domain exists and is accessible.",
        },
        { status: 400 }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    // Extract structured website data
    const scrapedData = extractHtmlDetails(html, urlString);

    // Check available server keys for persona synthesis
    const groqKey = await getServerKey("groq");
    const geminiKey = await getServerKey("gemini");
    const openaiKey = await getServerKey("openai");
    const deepseekKey = await getServerKey("deepseek");
    const openrouterKey = await getServerKey("openrouter");
    const anthropicKey = await getServerKey("anthropic");

    let assistant: AssistantConfig;
    if (groqKey) {
      assistant = await synthesizeWithLLM(scrapedData, { provider: "groq", key: groqKey });
    } else if (geminiKey) {
      assistant = await synthesizeWithLLM(scrapedData, { provider: "gemini", key: geminiKey });
    } else if (openaiKey) {
      assistant = await synthesizeWithLLM(scrapedData, { provider: "openai", key: openaiKey });
    } else if (deepseekKey) {
      assistant = await synthesizeWithLLM(scrapedData, { provider: "deepseek", key: deepseekKey });
    } else if (openrouterKey) {
      assistant = await synthesizeWithLLM(scrapedData, { provider: "openrouter", key: openrouterKey });
    } else if (anthropicKey) {
      assistant = await synthesizeWithLLM(scrapedData, { provider: "anthropic", key: anthropicKey });
    } else {
      assistant = synthesizeHeuristicPersona(scrapedData);
    }

    const resPayload: ScrapeResponse = {
      success: true,
      scrapedData,
      assistant,
    };

    return NextResponse.json(resPayload);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Scraper failure";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
