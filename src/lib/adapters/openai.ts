import { ChatAdapter, ChatAdapterParams, GenerationSettings } from "../types";

export class OpenAIAdapter implements ChatAdapter {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl = "https://api.openai.com/v1", defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.defaultHeaders = defaultHeaders;
  }

  public async streamChat(params: ChatAdapterParams): Promise<void> {
    const { apiKey, model, messages, settings, signal, callbacks } = params;
    const startTime = performance.now();
    let firstTokenRecorded = false;
    let tokenCount = 0;

    const endpoint = `${this.baseUrl}/chat/completions`;
    const cleanKey = apiKey.trim();

    const payloadMessages = [...messages];
    if (settings.systemPrompt.trim()) {
      payloadMessages.unshift({
        role: "system",
        content: settings.systemPrompt.trim(),
      });
    }

    const bodyPayload: Record<string, unknown> = {
      model,
      messages: payloadMessages,
      stream: true,
      temperature: settings.temperature,
      max_tokens: settings.maxTokens,
      top_p: settings.topP,
    };

    const makeFetch = async (useProxyRoute: boolean) => {
      const targetUrl = useProxyRoute ? "/api/proxy" : endpoint;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...this.defaultHeaders,
      };

      if (useProxyRoute) {
        headers["x-target-url"] = endpoint;
        if (cleanKey) headers["authorization"] = `Bearer ${cleanKey}`;
      } else {
        if (cleanKey) headers["authorization"] = `Bearer ${cleanKey}`;
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
          // CORS or direct network error: auto-fallback to stateless proxy
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
        message: `Connection failed: ${err instanceof Error ? err.message : String(err)}. Please check your internet connection or API endpoint.`,
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
          message: `Authentication failed: ${errorMsg}. Please check that your key is valid and has active credits.`,
        });
        return;
      }

      if (status === 429) {
        const retryAfterHeader = response.headers.get("retry-after");
        const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 10;
        callbacks.onError({
          type: "rate_limit",
          retryAfter: isNaN(retryAfter) ? 10 : retryAfter,
          message: `Rate limit or quota exceeded: ${errorMsg}.`,
        });
        return;
      }

      callbacks.onError({
        type: "provider",
        status,
        message: `API Error (${status}): ${errorMsg}`,
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

          if (trimmed === "data: [DONE]") break;

          if (trimmed.startsWith("data: ")) {
            const jsonStr = trimmed.slice(6);
            try {
              const data = JSON.parse(jsonStr);
              const choice = data?.choices?.[0];
              const delta = choice?.delta;

              if (delta) {
                if (!firstTokenRecorded) {
                  firstTokenRecorded = true;
                  callbacks.onFirstToken?.(Math.round(performance.now() - startTime));
                }

                const reasoningText = delta.reasoning_content || delta.reasoning;
                if (reasoningText && callbacks.onReasoning) {
                  callbacks.onReasoning(reasoningText);
                  tokenCount++;
                }

                if (delta.content) {
                  callbacks.onToken(delta.content);
                  tokenCount += Math.max(1, Math.round(delta.content.length / 4));
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
        message: `Stream interrupted: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  public async testConnection(
    apiKey: string,
    model: string,
    settings: GenerationSettings
  ): Promise<{ success: boolean; latencyMs: number; message: string; statusCode?: number }> {
    const startTime = performance.now();
    const endpoint = `${this.baseUrl}/chat/completions`;
    const cleanKey = apiKey.trim();

    const doRequest = async (useProxyRoute: boolean, testModel: string) => {
      const targetUrl = useProxyRoute ? "/api/proxy" : endpoint;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...this.defaultHeaders,
      };

      if (useProxyRoute) {
        headers["x-target-url"] = endpoint;
        if (cleanKey) headers["authorization"] = `Bearer ${cleanKey}`;
      } else {
        if (cleanKey) headers["authorization"] = `Bearer ${cleanKey}`;
      }

      return await fetch(targetUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: testModel,
          messages: [{ role: "user", content: "Hi" }],
          max_tokens: 3,
        }),
      });
    };

    let res: Response;
    try {
      // Prefer proxy for bulletproof cross-origin reliability, or auto-fallback
      if (settings.useProxy) {
        res = await doRequest(true, model);
      } else {
        try {
          res = await doRequest(false, model);
        } catch {
          // Auto-fallback on CORS/network failure
          res = await doRequest(true, model);
        }
      }

      // If model not found (404), try provider-specific fallbacks or /models check
      if (res.status === 404) {
        const fallbacks = [
          "openai/gpt-oss-120b",
          "qwen/qwen3.8-27b",
          "openai/gpt-oss-20b",
          "allam-2-7b",
          "gpt-4o-mini",
          "deepseek-chat",
        ].filter((f) => f !== model);

        for (const fb of fallbacks) {
          try {
            const retryRes = await doRequest(true, fb);
            if (retryRes.ok) {
              res = retryRes;
              break;
            }
          } catch {
            // continue
          }
        }

        // If still 404, verify key validity via GET /models
        if (res.status === 404) {
          try {
            const modelsEndpoint = `${this.baseUrl}/models`;
            const modelsTarget = settings.useProxy ? "/api/proxy" : modelsEndpoint;
            const modelsHeaders: Record<string, string> = {
              "Content-Type": "application/json",
            };
            if (settings.useProxy) {
              modelsHeaders["x-target-url"] = modelsEndpoint;
            }
            if (cleanKey) {
              modelsHeaders["authorization"] = `Bearer ${cleanKey}`;
            }
            const modelsRes = await fetch(modelsTarget, { headers: modelsHeaders });
            if (modelsRes.ok) {
              return {
                success: true,
                latencyMs: Math.round(performance.now() - startTime),
                statusCode: 200,
                message: `API Key authenticated successfully! (${Math.round(performance.now() - startTime)}ms) • All active models on your account synced.`,
              };
            }
          } catch {
            // continue
          }
        }
      }
    } catch (err: unknown) {
      return {
        success: false,
        latencyMs: Math.round(performance.now() - startTime),
        message: `Network error: ${err instanceof Error ? err.message : "Unable to reach endpoint"}.`,
      };
    }

    const latencyMs = Math.round(performance.now() - startTime);

    if (res.ok) {
      return {
        success: true,
        latencyMs,
        statusCode: res.status,
        message: `Verified successfully! Round-trip latency: ${latencyMs}ms`,
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
        message: `Invalid API key (HTTP ${res.status}): ${parsedError || "Please check your key and make sure it has not expired."}`,
      };
    }

    if (res.status === 429) {
      return {
        success: false,
        latencyMs,
        statusCode: res.status,
        message: `Key valid, but Rate Limit / Zero Balance (HTTP 429): ${parsedError || "Check your credit balance."}`,
      };
    }

    return {
      success: false,
      latencyMs,
      statusCode: res.status,
      message: `Failed (HTTP ${res.status}): ${parsedError || "Unexpected provider response."}`,
    };
  }
}
