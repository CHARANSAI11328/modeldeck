import { ChatAdapter, ChatAdapterParams, GenerationSettings } from "../types";

export class AnthropicAdapter implements ChatAdapter {
  private baseUrl: string;

  constructor(baseUrl = "https://api.anthropic.com/v1") {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  public async streamChat(params: ChatAdapterParams): Promise<void> {
    const { apiKey, model, messages, settings, signal, callbacks } = params;
    const startTime = performance.now();
    let firstTokenRecorded = false;
    let tokenCount = 0;

    const endpoint = `${this.baseUrl}/messages`;
    const cleanKey = apiKey.trim();

    let systemPrompt = settings.systemPrompt.trim();
    const formattedMessages: { role: "user" | "assistant"; content: string }[] = [];

    for (const msg of messages) {
      if (msg.role === "system") {
        systemPrompt = systemPrompt ? `${systemPrompt}\n\n${msg.content}` : msg.content;
      } else {
        formattedMessages.push({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        });
      }
    }

    if (formattedMessages.length === 0) {
      formattedMessages.push({ role: "user", content: "Hello" });
    }

    const bodyPayload: Record<string, unknown> = {
      model,
      messages: formattedMessages,
      max_tokens: Math.min(settings.maxTokens || 4096, 8192),
      stream: true,
      temperature: settings.temperature,
    };

    if (systemPrompt) {
      bodyPayload.system = systemPrompt;
    }

    const makeFetch = async (useProxyRoute: boolean) => {
      const targetUrl = useProxyRoute ? "/api/proxy" : endpoint;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      };

      if (useProxyRoute) {
        headers["x-target-url"] = endpoint;
        if (cleanKey) headers["x-api-key"] = cleanKey;
      } else {
        if (cleanKey) headers["x-api-key"] = cleanKey;
      }

      return await fetch(targetUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(bodyPayload),
        signal,
      });
    };

    let response: Response;
    try {
      if (settings.useProxy) {
        response = await makeFetch(true);
      } else {
        try {
          response = await makeFetch(false);
        } catch (directErr) {
          if (signal?.aborted) throw directErr;
          // Auto-fallback on browser CORS
          response = await makeFetch(true);
        }
      }
    } catch (err: unknown) {
      if (signal?.aborted) {
        callbacks.onError({ type: "aborted" });
        return;
      }
      callbacks.onError({
        type: "network",
        message: `Connection failed: ${err instanceof Error ? err.message : String(err)}.`,
      });
      return;
    }

    if (!response.ok) {
      const status = response.status;
      let errorMsg = `Server returned HTTP ${status}`;
      try {
        const errorJson = await response.json();
        errorMsg = errorJson?.error?.message || errorJson?.message || JSON.stringify(errorJson);
      } catch {
        errorMsg = (await response.text()) || errorMsg;
      }

      if (status === 401 || status === 403) {
        callbacks.onError({
          type: "auth",
          message: `Anthropic authentication failed: ${errorMsg}. Please check that your key is valid and has active balance.`,
        });
        return;
      }

      if (status === 429) {
        const retryAfterHeader = response.headers.get("retry-after");
        const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 15;
        callbacks.onError({
          type: "rate_limit",
          retryAfter: isNaN(retryAfter) ? 15 : retryAfter,
          message: `Anthropic rate limit or quota exceeded: ${errorMsg}.`,
        });
        return;
      }

      callbacks.onError({
        type: "provider",
        status,
        message: `Anthropic API error (${status}): ${errorMsg}`,
      });
      return;
    }

    if (!response.body) {
      callbacks.onError({
        type: "network",
        message: "Response stream is empty",
      });
      return;
    }

    const reader = response.body.getReader();
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
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(":")) continue;

          if (trimmed.startsWith("data: ")) {
            const jsonStr = trimmed.slice(6);
            try {
              const data = JSON.parse(jsonStr);

              if (data.type === "content_block_delta") {
                if (!firstTokenRecorded) {
                  firstTokenRecorded = true;
                  callbacks.onFirstToken?.(Math.round(performance.now() - startTime));
                }

                if (data.delta?.type === "text_delta" && data.delta?.text) {
                  callbacks.onToken(data.delta.text);
                  tokenCount += Math.max(1, Math.round(data.delta.text.length / 4));
                } else if (data.delta?.type === "thinking_delta" && data.delta?.thinking) {
                  if (callbacks.onReasoning) {
                    callbacks.onReasoning(data.delta.thinking);
                    tokenCount++;
                  }
                }
              }
            } catch {
              // Ignore fragmented chunks
            }
          }
        }
      }

      const totalMs = Math.round(performance.now() - startTime);
      const tokensPerSec = totalMs > 0 ? Math.round((tokenCount / (totalMs / 1000)) * 10) / 10 : 0;

      callbacks.onDone({
        totalMs,
        tokenCount,
        tokensPerSec,
      });
    } catch (err: unknown) {
      if (signal?.aborted) {
        callbacks.onError({ type: "aborted" });
        return;
      }
      callbacks.onError({
        type: "network",
        message: `Stream disconnected: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  public async testConnection(
    apiKey: string,
    model: string,
    settings: GenerationSettings
  ): Promise<{ success: boolean; latencyMs: number; message: string; statusCode?: number }> {
    const startTime = performance.now();
    const endpoint = `${this.baseUrl}/messages`;
    const cleanKey = apiKey.trim();

    const doRequest = async (useProxyRoute: boolean, testModel: string) => {
      const targetUrl = useProxyRoute ? "/api/proxy" : endpoint;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      };

      if (useProxyRoute) {
        headers["x-target-url"] = endpoint;
        if (cleanKey) headers["x-api-key"] = cleanKey;
      } else {
        if (cleanKey) headers["x-api-key"] = cleanKey;
      }

      return await fetch(targetUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: testModel,
          messages: [{ role: "user", content: "Hi" }],
          max_tokens: 5,
        }),
      });
    };

    let res: Response;
    try {
      if (settings.useProxy) {
        res = await doRequest(true, model);
      } else {
        try {
          res = await doRequest(false, model);
        } catch {
          res = await doRequest(true, model);
        }
      }

      // If 404, fallback to haiku
      if (res.status === 404 && model !== "claude-3-5-haiku-20241022") {
        try {
          res = await doRequest(true, "claude-3-5-haiku-20241022");
        } catch {
          // ignore
        }
      }
    } catch (err: unknown) {
      return {
        success: false,
        latencyMs: Math.round(performance.now() - startTime),
        message: `Network error: ${err instanceof Error ? err.message : "Unable to reach Anthropic."}`,
      };
    }

    const latencyMs = Math.round(performance.now() - startTime);

    if (res.ok) {
      return {
        success: true,
        latencyMs,
        statusCode: res.status,
        message: `Claude connection verified! Response latency: ${latencyMs}ms`,
      };
    }

    let parsedError = "";
    try {
      const errJson = await res.json();
      parsedError = errJson?.error?.message || errJson?.message || "";
    } catch {
      parsedError = (await res.text()).slice(0, 150);
    }

    if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        latencyMs,
        statusCode: res.status,
        message: `Invalid Anthropic key (HTTP ${res.status}): ${parsedError || "Check that your sk-ant- key is active."}`,
      };
    }

    if (res.status === 429) {
      return {
        success: false,
        latencyMs,
        statusCode: res.status,
        message: `Key valid, but Anthropic Rate Limit / Zero Balance (HTTP 429): ${parsedError}`,
      };
    }

    return {
      success: false,
      latencyMs,
      statusCode: res.status,
      message: `Failed (HTTP ${res.status}): ${parsedError}`,
    };
  }
}
