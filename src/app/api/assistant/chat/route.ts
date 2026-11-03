import { NextRequest, NextResponse } from "next/server";
import { ChatRequestPayload } from "@/lib/assistantTypes";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), "data");
const VAULT_FILE = path.join(DATA_DIR, "vault.json");

// In-memory rate limiter: max 30 requests per 60 seconds per IP
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 30) {
    return false;
  }
  entry.count += 1;
  return true;
}

// Clean up stale rate limit entries periodically without blocking Node event loop
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 60000);
if (typeof cleanupInterval === "object" && "unref" in cleanupInterval) {
  cleanupInterval.unref();
}

// Read server keys
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

// Extract clean origin for CORS header (RFC 6454 scheme://host[:port] without paths)
function getCleanOrigin(req: NextRequest, fallbackOrigin?: string): string {
  const originHeader = req.headers.get("origin");
  if (originHeader && originHeader !== "null" && originHeader !== "*") {
    try {
      return new URL(originHeader).origin;
    } catch {
      return originHeader;
    }
  }
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin;
    } catch {
      // ignore
    }
  }
  if (fallbackOrigin && fallbackOrigin !== "null" && fallbackOrigin !== "*") {
    try {
      return new URL(fallbackOrigin).origin;
    } catch {
      // ignore
    }
  }
  return "*";
}

// CORS headers helper
function getCorsHeaders(origin: string = "*") {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Assistant-Id, X-Requested-With",
    "Access-Control-Max-Age": "86400",
  };
}

// Sanitize conversation messages: strip leading assistant greeting, ensure user initiates multiturn chat
function sanitizeConversation(messages: { role: string; content: string }[]): { role: "user" | "assistant"; content: string }[] {
  const sanitized: { role: "user" | "assistant"; content: string }[] = [];
  let userFound = false;

  for (const m of messages) {
    if (!m || !m.content) continue;
    if (m.role === "system") continue; // system persona handled separately

    if (!userFound) {
      if (m.role === "user") {
        userFound = true;
        sanitized.push({ role: "user", content: m.content });
      }
      // Leading assistant greeting is dropped from API payload because LLMs require user-first turns
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

export async function OPTIONS(req: NextRequest) {
  const origin = getCleanOrigin(req);
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

export async function POST(req: NextRequest) {
  let cleanOrigin = "*";

  try {
    // 1. Rate Limiting Check
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded (30 requests/minute). Please slow down." },
        { status: 429, headers: getCorsHeaders(cleanOrigin) }
      );
    }

    // 2. Parse Body
    const body: ChatRequestPayload = await req.json();
    const { messages, assistantConfig, hostOrigin } = body;

    cleanOrigin = getCleanOrigin(req, hostOrigin);
    const corsHeaders = getCorsHeaders(cleanOrigin);

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid messages payload: messages array required." },
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. Domain Whitelisting Validation
    const allowedDomains = assistantConfig?.allowedDomains;
    if (
      Array.isArray(allowedDomains) &&
      allowedDomains.length > 0 &&
      !allowedDomains.includes("*")
    ) {
      let candidateHost = "";
      if (cleanOrigin && cleanOrigin !== "*") {
        try {
          candidateHost = new URL(cleanOrigin).hostname.toLowerCase();
        } catch {
          // ignore
        }
      }
      if (!candidateHost && hostOrigin) {
        try {
          candidateHost = new URL(hostOrigin).hostname.toLowerCase();
        } catch {
          // ignore
        }
      }

      if (!candidateHost) {
        return NextResponse.json(
          {
            error: `Origin or host verification required when domain whitelisting is enforced. Allowed domains: ${allowedDomains.join(", ")}`,
          },
          { status: 403, headers: corsHeaders }
        );
      }

      const isWhitelisted = allowedDomains.some((d) => {
        const cleanDomain = d.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
        return (
          cleanDomain === "*" ||
          cleanDomain === "localhost" ||
          cleanDomain === "127.0.0.1" ||
          candidateHost === cleanDomain ||
          candidateHost.endsWith(`.${cleanDomain}`)
        );
      });

      if (!isWhitelisted) {
        return NextResponse.json(
          {
            error: `Domain '${candidateHost}' is not whitelisted for this assistant. Allowed: ${allowedDomains.join(", ")}`,
          },
          { status: 403, headers: corsHeaders }
        );
      }
    }

    // 4. Resolve Provider and Key
    const provider = assistantConfig?.provider || "groq";
    let model = assistantConfig?.model || "llama-3.3-70b-versatile";

    // Fallback model map for any legacy model strings
    if (provider === "groq" && (model.includes("gemini") || model.includes("gpt-4"))) {
      model = "llama-3.3-70b-versatile";
    }

    let apiKey = await getServerKey(provider);

    // Fallback: if selected provider key is missing, try groq, gemini, or openrouter
    let effectiveProvider = provider;
    if (!apiKey) {
      const groqKey = await getServerKey("groq");
      const geminiKey = await getServerKey("gemini");
      const openaiKey = await getServerKey("openai");
      const openrouterKey = await getServerKey("openrouter");

      if (groqKey) {
        effectiveProvider = "groq";
        apiKey = groqKey;
        model = "llama-3.3-70b-versatile";
      } else if (geminiKey) {
        effectiveProvider = "gemini";
        apiKey = geminiKey;
        model = "gemini-2.5-flash";
      } else if (openaiKey) {
        effectiveProvider = "openai";
        apiKey = openaiKey;
        model = "gpt-4o-mini";
      } else if (openrouterKey) {
        effectiveProvider = "openrouter";
        apiKey = openrouterKey;
        model = "meta-llama/llama-3.3-70b-instruct";
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "No API key configured on this ModelDeck server for " +
            provider +
            ". Please configure GROQ_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY in the Key Vault or server environment.",
        },
        { status: 503, headers: corsHeaders }
      );
    }

    // 5. Construct Prompts
    const systemPersona =
      assistantConfig?.persona ||
      `You are the personal portfolio AI assistant for ${assistantConfig?.name || "the website owner"}. Answer questions accurately, professionally, and politely.`;

    const conversationTurns = sanitizeConversation(messages);
    const fullMessages = [
      { role: "system", content: systemPersona },
      ...conversationTurns.map((m) => ({ role: m.role, content: m.content })),
    ];

    // 6. Connect to Provider API & Stream
    const encoder = new TextEncoder();

    if (effectiveProvider === "gemini") {
      // Gemini streaming endpoint (multiturn conversation MUST start with user turn)
      const contents = conversationTurns.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
      const geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPersona }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      });

      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        return NextResponse.json(
          { error: `Gemini API error: ${errText}` },
          { status: geminiRes.status, headers: corsHeaders }
        );
      }

      const stream = new ReadableStream({
        async start(controller) {
          const reader = geminiRes.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }
          const decoder = new TextDecoder();
          let buffer = "";

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const rawJson = line.slice(6).trim();
                  try {
                    const parsed = JSON.parse(rawJson);
                    const chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (chunk) {
                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
                      );
                    }
                  } catch {
                    // skip malformed chunk
                  }
                }
              }
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (err: unknown) {
            controller.error(err);
          }
        },
      });

      return new NextResponse(stream, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    // Default OpenAI-compatible streaming (Groq, OpenAI, DeepSeek, OpenRouter, Mistral)
    let upstreamBaseUrl = "https://api.groq.com/openai/v1/chat/completions";
    if (effectiveProvider === "openai") {
      upstreamBaseUrl = "https://api.openai.com/v1/chat/completions";
    } else if (effectiveProvider === "deepseek") {
      upstreamBaseUrl = "https://api.deepseek.com/chat/completions";
    } else if (effectiveProvider === "openrouter") {
      upstreamBaseUrl = "https://openrouter.ai/api/v1/chat/completions";
    } else if (effectiveProvider === "anthropic") {
      // Anthropic streaming (requires strict user-first turn and separate system prompt)
      const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: model || "claude-3-5-haiku-20241022",
          system: systemPersona,
          messages: conversationTurns.map((m) => ({ role: m.role, content: m.content })),
          max_tokens: 2048,
          stream: true,
        }),
      });

      if (!anthropicRes.ok) {
        const errText = await anthropicRes.text();
        return NextResponse.json(
          { error: `Anthropic API error: ${errText}` },
          { status: anthropicRes.status, headers: corsHeaders }
        );
      }

      const stream = new ReadableStream({
        async start(controller) {
          const reader = anthropicRes.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }
          const decoder = new TextDecoder();
          let buffer = "";

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const rawJson = line.slice(6).trim();
                  if (rawJson === "[DONE]") break;
                  try {
                    const parsed = JSON.parse(rawJson);
                    if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`)
                      );
                    }
                  } catch {
                    // ignore
                  }
                }
              }
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (err: unknown) {
            controller.error(err);
          }
        },
      });

      return new NextResponse(stream, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    // Groq / OpenAI / DeepSeek / OpenRouter streaming
    const upstreamRes = await fetch(upstreamBaseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: fullMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!upstreamRes.ok) {
      const errText = await upstreamRes.text();
      return NextResponse.json(
        { error: `Provider error (${upstreamRes.status}): ${errText}` },
        { status: upstreamRes.status, headers: corsHeaders }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstreamRes.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const rawJson = line.slice(6).trim();
                if (rawJson === "[DONE]") {
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                  continue;
                }
                try {
                  const parsed = JSON.parse(rawJson);
                  const chunk = parsed.choices?.[0]?.delta?.content;
                  if (chunk) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
                    );
                  }
                } catch {
                  // ignore
                }
              }
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err: unknown) {
          controller.error(err);
        }
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Chat stream failure";
    return NextResponse.json({ error: message }, { status: 500, headers: getCorsHeaders(cleanOrigin) });
  }
}
