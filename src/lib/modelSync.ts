import { ProviderId, ModelInfo, GenerationSettings } from "./types";
import { getProvider } from "./providers";

interface RawGroqModel {
  id: string;
  owned_by?: string;
  active?: boolean;
}

interface RawGeminiModel {
  name: string;
  displayName?: string;
  description?: string;
  supportedGenerationMethods?: string[];
  inputTokenLimit?: number;
}

/**
 * Dynamically queries the provider's /models API using the user's personal API key
 * to discover all models actually available and enabled on their specific account.
 */
export async function syncModelsForProvider(
  providerId: ProviderId,
  apiKey: string,
  settings: GenerationSettings
): Promise<ModelInfo[]> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) return [];

  const provider = getProvider(providerId);

  // 1. Google Gemini Models Sync
  if (providerId === "gemini") {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(cleanKey)}`;
    const targetUrl = settings.useProxy ? "/api/proxy" : endpoint;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-goog-api-key": cleanKey,
    };
    if (settings.useProxy) {
      headers["x-target-url"] = endpoint;
    }

    try {
      const res = await fetch(targetUrl, { headers });
      if (!res.ok) return [];

      const data = await res.json();
      const rawModels: RawGeminiModel[] = data?.models || [];

      // Filter only generative chat/text models (exclude embeddings, tts-only, vision-only, etc.)
      const validModels = rawModels.filter((m) => {
        const methods = m.supportedGenerationMethods || [];
        const name = m.name.toLowerCase();
        return (
          methods.includes("generateContent") &&
          !name.includes("embedding") &&
          !name.includes("aqa") &&
          !name.includes("robotics") &&
          !name.includes("clip")
        );
      });

      const priorityOrder = [
        "gemini-3.5-flash",
        "gemini-flash-lite-latest",
        "gemini-3.6-flash",
        "gemini-flash-latest",
        "gemini-3.8-flash",
        "gemini-3.1-pro-preview",
        "gemini-pro-latest",
      ];

      const mapped = validModels.map((m) => {
        const cleanId = m.name.replace(/^models\//, "");
        const isReasoning =
          cleanId.includes("pro") ||
          cleanId.includes("flash") ||
          cleanId.includes("argon") ||
          cleanId.includes("thinking") ||
          cleanId.includes("deep-research");

        let displayName = m.displayName || cleanId;
        if (cleanId === "gemini-3.5-flash") displayName = "Gemini 3.5 Flash (Recommended)";
        if (cleanId === "gemini-flash-lite-latest") displayName = "Gemini Flash Lite (Ultra Speed)";
        if (cleanId === "gemini-3.6-flash") displayName = "Gemini 3.6 Flash";
        if (cleanId === "gemini-3.8-flash") displayName = "Gemini 3.8 Flash (Preview)";
        if (cleanId === "gemini-flash-latest") displayName = "Gemini Flash (Latest Stable)";
        if (cleanId === "gemini-3.1-pro-preview") displayName = "Gemini 3.1 Pro Preview";
        if (cleanId === "gemini-pro-latest") displayName = "Gemini Pro (Latest Stable)";

        return {
          id: cleanId,
          name: displayName,
          description: m.description || `Google Gemini model (${cleanId}) active on your key.`,
          contextWindow: m.inputTokenLimit ? `${m.inputTokenLimit.toLocaleString()} tokens` : "1,048,576 tokens",
          isReasoning,
          recommended:
            cleanId === "gemini-3.5-flash" ||
            cleanId === "gemini-flash-lite-latest" ||
            cleanId === "gemini-3.6-flash",
          category: (cleanId.includes("flash")
            ? "fast"
            : cleanId.includes("pro")
            ? "reasoning"
            : "general") as ModelInfo["category"],
          isAccountModel: true,
        };
      });

      return mapped.sort((a, b) => {
        const aIndex = priorityOrder.indexOf(a.id);
        const bIndex = priorityOrder.indexOf(b.id);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.name.localeCompare(b.name);
      });
    } catch {
      return [];
    }
  }

  // 2. Groq Models Sync
  if (providerId === "groq") {
    const endpoint = "https://api.groq.com/openai/v1/models";
    const targetUrl = settings.useProxy ? "/api/proxy" : endpoint;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cleanKey}`,
    };
    if (settings.useProxy) {
      headers["x-target-url"] = endpoint;
    }

    try {
      const res = await fetch(targetUrl, { headers });
      if (!res.ok) return [];

      const data = await res.json();
      const rawModels: RawGroqModel[] = data?.data || [];

      // Filter text chat models (exclude whisper audio and prompt guards)
      const chatModels = rawModels.filter((m) => {
        const id = m.id.toLowerCase();
        return (
          !id.includes("whisper") &&
          !id.includes("prompt-guard") &&
          !id.includes("orpheus")
        );
      });

      return chatModels.map((m) => {
        const id = m.id;
        const isReasoning = id.includes("qwen") || id.includes("r1") || id.includes("oss-120b");

        let friendlyName = id;
        if (id === "openai/gpt-oss-120b") friendlyName = "GPT-OSS 120B (Groq LPU)";
        else if (id === "qwen/qwen3.8-27b") friendlyName = "Qwen 3.8 27B (Groq LPU)";
        else if (id === "openai/gpt-oss-20b") friendlyName = "GPT-OSS 20B (Groq LPU)";
        else if (id === "allam-2-7b") friendlyName = "Allam 2 7B (Groq LPU)";
        else if (id === "openai/gpt-oss-safeguard-20b") friendlyName = "GPT-OSS Safeguard 20B";

        return {
          id,
          name: friendlyName,
          description: `High-speed inference on Groq LPU hardware (${id}).`,
          contextWindow: "128,000 tokens",
          isReasoning,
          recommended: id.includes("oss-120b") || id.includes("qwen3.8-27b") || id.includes("llama-3.3"),
          category: id.includes("fast") || id.includes("20b") ? "fast" : isReasoning ? "reasoning" : "general",
          isAccountModel: true,
        };
      });
    } catch {
      return [];
    }
  }

  // 3. OpenAI / OpenRouter / Mistral / Together Generic Model Sync
  const baseModelsEndpoint = `${provider.baseUrl}/models`;
  const targetUrl = settings.useProxy ? "/api/proxy" : baseModelsEndpoint;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cleanKey}`,
  };
  if (settings.useProxy) {
    headers["x-target-url"] = baseModelsEndpoint;
  }

  try {
    const res = await fetch(targetUrl, { headers });
    if (!res.ok) return [];

    const data = await res.json();
    const rawList = data?.data || data?.models || [];
    if (!Array.isArray(rawList)) return [];

    if (providerId === "openrouter") {
      const existingIds = new Set(provider.models.map((m) => m.id));
      const additional = rawList
        .filter(
          (m: { id?: string }) =>
            m.id &&
            !existingIds.has(m.id) &&
            !m.id.includes("embed") &&
            !m.id.includes("moderation")
        )
        .slice(0, 30)
        .map(
          (m: {
            id?: string;
            name?: string;
            description?: string;
            context_length?: number;
          }) => ({
            id: m.id!,
            name: m.name || m.id!,
            description:
              m.description?.slice(0, 140) || `OpenRouter model (${m.id})`,
            contextWindow: m.context_length
              ? `${m.context_length.toLocaleString()} tokens`
              : "128,000 tokens",
            category: "general" as const,
            isAccountModel: true,
          })
        );
      return [...provider.models, ...additional];
    }

    return rawList
      .filter((m: { id?: string; name?: string }) => {
        const id = (m.id || m.name || "").toLowerCase();
        return (
          !id.includes("dall-e") &&
          !id.includes("tts") &&
          !id.includes("whisper") &&
          !id.includes("embed") &&
          !id.includes("moderation")
        );
      })
      .slice(0, 40) // top 40 models
      .map((m: { id?: string; name?: string }) => {
        const id = m.id || m.name || "";
        return {
          id,
          name: id,
          description: `${provider.label} model (${id}) synced from your account.`,
          category: "general" as const,
          isAccountModel: true,
        };
      });
  } catch {
    return [];
  }
}
