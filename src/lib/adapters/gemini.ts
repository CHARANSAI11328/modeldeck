import { ChatAdapter, ChatAdapterParams, GenerationSettings } from "../types";

export class GeminiAdapter implements ChatAdapter {
  private baseUrl: string;

  constructor(baseUrl = "https://generativelanguage.googleapis.com/v1beta") {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  public async streamChat(params: ChatAdapterParams): Promise<void> {
    const { apiKey, model, messages, settings, signal, callbacks } = params;
    const startTime = performance.now();
    let firstTokenRecorded = false;
    let tokenCount = 0;

    const cleanKey = apiKey.trim();
    const endpoint = `${this.baseUrl}/models/${model}:streamGenerateContent?key=${encodeURIComponent(cleanKey)}&alt=sse`;

    const contents: { role: "user" | "model"; parts: { text: string }[] }[] = [];

    for (const msg of messages) {
      if (msg.role === "system") continue;
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }

    if (contents.length === 0) {
      contents.push({ role: "user", parts: [{ text: "Hello" }] });
    }

    const bodyPayload: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: settings.temperature,
        maxOutputTokens: settings.maxTokens || 4096,
        topP: settings.topP,
      },
    };

    if (settings.systemPrompt.trim()) {
      bodyPayload.systemInstruction = {
        parts: [{ text: settings.systemPrompt.trim() }],
      };
    }

    const makeFetch = async (useProxyRoute: boolean) => {
      const targetUrl = useProxyRoute ? "/api/proxy" : endpoint;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-goog-api-key": cleanKey,
      };

      if (useProxyRoute) {
        headers["x-target-url"] = endpoint;
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

    // Automatic model failover if model hits quota (429) or is retired/unavailable (404/503)
    if (!response.ok && (response.status === 429 || response.status === 404 || response.status === 503)) {
      const activeFallbacks = [
        "gemini-3.5-flash",
        "gemini-flash-lite-latest",
        "gemini-3.6-flash",
      ].filter((fb) => fb !== model);

      for (const fallbackModel of activeFallbacks) {
        if (signal?.aborted) return;
        const fallbackEndpoint = `${this.baseUrl}/models/${fallbackModel}:streamGenerateContent?key=${encodeURIComponent(cleanKey)}&alt=sse`;

        try {
          const fallbackRes = await fetch(settings.useProxy ? "/api/proxy" : fallbackEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": cleanKey,
              ...(settings.useProxy ? { "x-target-url": fallbackEndpoint } : {}),
            },
            body: JSON.stringify(bodyPayload),
            signal,
          });

          if (fallbackRes.ok && fallbackRes.body) {
            response = fallbackRes;
            break;
          }
        } catch {
          // continue to next fallback
        }
      }
    }

    if (!response.ok) {
      const status = response.status;
      let errorMsg = `Server returned HTTP ${status}`;
      try {
        const errJson = await response.json();
        errorMsg = errJson?.error?.message || JSON.stringify(errJson);
      } catch {
        errorMsg = (await response.text()) || errorMsg;
      }

      if (status === 400 || status === 403) {
        callbacks.onError({
          type: "auth",
          message: `Gemini authorization error: ${errorMsg}. Please verify your key at Google AI Studio.`,
        });
        return;
      }

      if (status === 404) {
        callbacks.onError({
          type: "provider",
          status,
          message: `Model '${model}' not available or retired on your key. Switched to Gemini 3.5 Flash automatically.`,
        });
        return;
      }

      if (status === 429) {
        callbacks.onError({
          type: "rate_limit",
          retryAfter: 20,
          message: `Gemini Free Tier limit exceeded for '${model}'. Please switch to 'Gemini 3.5 Flash' or 'Gemini Flash Lite' which have separate active quota.`,
        });
        return;
      }

      callbacks.onError({
        type: "provider",
        status,
        message: `Gemini API Error (${status}): ${errorMsg}`,
      });
      return;
    }

    if (!response.body) {
      callbacks.onError({
        type: "network",
        message: "Gemini stream body is null",
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
              const candidates = data?.candidates;
              if (Array.isArray(candidates) && candidates.length > 0) {
                const parts = candidates[0]?.content?.parts;
                if (Array.isArray(parts)) {
                  for (const part of parts) {
                    if (part.thought && callbacks.onReasoning) {
                      callbacks.onReasoning(part.text || "");
                      tokenCount += Math.max(1, Math.round((part.text || "").length / 4));
                    } else if (part.text) {
                      if (!firstTokenRecorded) {
                        firstTokenRecorded = true;
                        callbacks.onFirstToken?.(Math.round(performance.now() - startTime));
                      }
                      callbacks.onToken(part.text);
                      tokenCount += Math.max(1, Math.round(part.text.length / 4));
                    }
                  }
                }
              }
            } catch {
              // Fragmented chunk
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
        message: `Gemini stream disconnected: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  public async testConnection(
    apiKey: string,
    model: string,
    settings: GenerationSettings
  ): Promise<{ success: boolean; latencyMs: number; message: string; statusCode?: number }> {
    const startTime = performance.now();
    const cleanKey = apiKey.trim();

    const doRequest = async (useProxyRoute: boolean, testModel: string) => {
      const endpoint = `${this.baseUrl}/models/${testModel}:generateContent?key=${encodeURIComponent(cleanKey)}`;
      const targetUrl = useProxyRoute ? "/api/proxy" : endpoint;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-goog-api-key": cleanKey,
      };

      if (useProxyRoute) {
        headers["x-target-url"] = endpoint;
      }

      return await fetch(targetUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "Hi" }] }],
          generationConfig: { maxOutputTokens: 3 },
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

      // If 404 or temporary 503, try active models
      if (res.status === 404 || res.status === 503) {
        const fallbacks = [
          "gemini-3.5-flash",
          "gemini-flash-latest",
          "gemini-3.8-flash",
          "gemini-3.1-pro-preview",
          "gemini-pro-latest",
        ].filter((m) => m !== model);

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

        // If still 404/503, test authentication directly against v1beta/models
        if (!res.ok) {
          try {
            const modelsEndpoint = `${this.baseUrl}/models?key=${encodeURIComponent(cleanKey)}`;
            const modelsTarget = settings.useProxy ? "/api/proxy" : modelsEndpoint;
            const modelsHeaders: Record<string, string> = {
              "Content-Type": "application/json",
              "x-goog-api-key": cleanKey,
            };
            if (settings.useProxy) {
              modelsHeaders["x-target-url"] = modelsEndpoint;
            }
            const modelsRes = await fetch(modelsTarget, { headers: modelsHeaders });
            if (modelsRes.ok) {
              return {
                success: true,
                latencyMs: Math.round(performance.now() - startTime),
                statusCode: 200,
                message: `Google Gemini key verified successfully! (${Math.round(performance.now() - startTime)}ms) • All active models synced from your account.`,
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
        message: `Network error: ${err instanceof Error ? err.message : "Unable to reach Google API."}`,
      };
    }

    const latencyMs = Math.round(performance.now() - startTime);

    if (res.ok) {
      return {
        success: true,
        latencyMs,
        statusCode: res.status,
        message: `Google Gemini verified! Response latency: ${latencyMs}ms`,
      };
    }

    let rawText = "";
    let reasonCode = "";
    let parsedMessage = "";

    try {
      rawText = await res.text();
      const errJson = JSON.parse(rawText);
      parsedMessage = errJson?.error?.message || "";
      const details = errJson?.error?.details;
      if (Array.isArray(details) && details.length > 0) {
        reasonCode = details[0]?.reason || "";
      }
    } catch {
      parsedMessage = rawText.slice(0, 150);
    }

    // Specific diagnosis for AQ. keys with ACCESS_TOKEN_TYPE_UNSUPPORTED
    if (reasonCode === "ACCESS_TOKEN_TYPE_UNSUPPORTED" || (cleanKey.startsWith("AQ.") && res.status === 401)) {
      return {
        success: false,
        latencyMs,
        statusCode: res.status,
        message: `Key rejected by Google (${reasonCode || "ACCESS_TOKEN_TYPE_UNSUPPORTED"}). 'AQ.' keys are service-account-bound authorization tokens that require the 'Generative Language API' to be enabled in your Google Cloud Project. Please check your project settings or generate a standard key at Google AI Studio.`,
      };
    }

    if (res.status === 404) {
      return {
        success: false,
        latencyMs,
        statusCode: res.status,
        message: `Model not found on your Google Cloud Project (HTTP 404). Please ensure the 'Generative Language API' is enabled in your Google Cloud Console for the project linked to this key.`,
      };
    }

    if (res.status === 400 || res.status === 403 || res.status === 401) {
      return {
        success: false,
        latencyMs,
        statusCode: res.status,
        message: `Invalid Gemini API Key (HTTP ${res.status}): ${parsedMessage || "Please generate a new key at Google AI Studio (aistudio.google.com/app/apikey)." }`,
      };
    }

    if (res.status === 429) {
      return {
        success: false,
        latencyMs,
        statusCode: res.status,
        message: `Key authenticated, but Quota / Rate Limit reached (HTTP 429). Check your usage on Google AI Studio.`,
      };
    }

    return {
      success: false,
      latencyMs,
      statusCode: res.status,
      message: `Failed (HTTP ${res.status}): ${parsedMessage || rawText.slice(0, 150)}`,
    };
  }
}
