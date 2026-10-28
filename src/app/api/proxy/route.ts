import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // Edge runtime for ultra-low latency streaming without server state

/**
 * STATELESS ZERO-LOGGING PROXY
 *
 * Strictly forwards user requests to provider endpoints when the user's browser
 * encounters CORS restrictions with direct browser-to-provider connections.
 *
 * Guarantees:
 * - NO API key persistence or disk storage
 * - NO console logging of headers or request bodies
 * - NO analytics tracking of credentials
 * - Pure pass-through stream pipeline
 */

async function handleProxy(req: NextRequest, method: "GET" | "POST") {
  try {
    const targetUrl = req.headers.get("x-target-url");
    if (!targetUrl) {
      return NextResponse.json(
        { error: "Missing required x-target-url header" },
        { status: 400 }
      );
    }

    // Validate that the URL is a legitimate HTTPS API endpoint or local server
    try {
      const parsed = new URL(targetUrl);
      if (
        parsed.protocol !== "https:" &&
        parsed.hostname !== "localhost" &&
        parsed.hostname !== "127.0.0.1"
      ) {
        return NextResponse.json(
          { error: "Target URL must be https or localhost" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid target URL format" },
        { status: 400 }
      );
    }

    // Build upstream headers (forwarding only essential API auth headers)
    const upstreamHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const authHeader = req.headers.get("authorization");
    if (authHeader) upstreamHeaders["authorization"] = authHeader;

    const xApiKey = req.headers.get("x-api-key");
    if (xApiKey) upstreamHeaders["x-api-key"] = xApiKey;

    const anthropicVersion = req.headers.get("anthropic-version");
    if (anthropicVersion) upstreamHeaders["anthropic-version"] = anthropicVersion;

    const openRouterHttpReferer = req.headers.get("http-referer");
    if (openRouterHttpReferer) upstreamHeaders["HTTP-Referer"] = openRouterHttpReferer;

    const openRouterXTitle = req.headers.get("x-title");
    if (openRouterXTitle) upstreamHeaders["X-Title"] = openRouterXTitle;

    const xGoogApiKey = req.headers.get("x-goog-api-key");
    if (xGoogApiKey) upstreamHeaders["x-goog-api-key"] = xGoogApiKey;

    const fetchOptions: RequestInit = {
      method,
      headers: upstreamHeaders,
    };

    if (method === "POST") {
      fetchOptions.body = await req.text();
    }

    const upstreamResponse = await fetch(targetUrl, fetchOptions);

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      const retryAfter = upstreamResponse.headers.get("retry-after");
      const respHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (retryAfter) respHeaders["retry-after"] = retryAfter;

      return new NextResponse(errorText, {
        status: upstreamResponse.status,
        headers: respHeaders,
      });
    }

    // Stream the body directly back to the client
    const headers = new Headers();
    headers.set("Content-Type", upstreamResponse.headers.get("content-type") || "text/event-stream");
    headers.set("Cache-Control", "no-cache, no-transform");
    headers.set("Connection", "keep-alive");

    return new NextResponse(upstreamResponse.body, {
      status: 200,
      headers,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Proxy gateway failure";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function GET(req: NextRequest) {
  return handleProxy(req, "GET");
}

export async function POST(req: NextRequest) {
  return handleProxy(req, "POST");
}
