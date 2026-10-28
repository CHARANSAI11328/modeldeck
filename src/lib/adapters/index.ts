import { ChatAdapter, ProviderConfig } from "../types";
import { OpenAIAdapter } from "./openai";
import { AnthropicAdapter } from "./anthropic";
import { GeminiAdapter } from "./gemini";

export function getAdapterForProvider(provider: ProviderConfig, customBaseUrl?: string): ChatAdapter {
  if (provider.id === "anthropic") {
    return new AnthropicAdapter(provider.baseUrl);
  }

  if (provider.id === "gemini") {
    return new GeminiAdapter(provider.baseUrl);
  }

  if (provider.id === "openrouter") {
    return new OpenAIAdapter(provider.baseUrl, {
      "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://playground.local",
      "X-Title": "Multi-Provider BYOK Playground",
    });
  }

  if (provider.id === "custom-openai-compatible") {
    const url = customBaseUrl?.trim() || provider.baseUrl;
    return new OpenAIAdapter(url);
  }

  // Default to standard OpenAI compatible protocol
  return new OpenAIAdapter(provider.baseUrl);
}
