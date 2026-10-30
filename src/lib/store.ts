import { create } from "zustand";
import {
  ChatSession,
  ChatMessage,
  ProviderId,
  GenerationSettings,
  AppError,
  MessageStats,
} from "./types";
import { PROVIDERS, getProvider } from "./providers";
import { vault } from "./vault";
import { getAdapterForProvider } from "./adapters";

interface PlaygroundState {
  // Session management
  sessions: ChatSession[];
  currentSessionId: string;

  // Active streaming state
  isStreaming: boolean;
  streamingContent: string;
  streamingReasoning: string;
  streamingTtft: number | null;
  activeAbortController: AbortController | null;

  // Key configurations reactive flags
  keyStatusMap: Record<ProviderId, boolean>;

  // Current error
  error: AppError | null;

  // Settings
  settings: GenerationSettings;

  // UI state
  isKeyVaultOpen: boolean;
  isSettingsOpen: boolean;
  isApiDirectoryOpen: boolean;
  isSidebarOpen: boolean;
  focusedProviderForVault: ProviderId | null;

  // Actions
  createNewSession: (providerId?: ProviderId, modelId?: string) => string;
  switchSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  clearCurrentSession: () => void;
  setProviderAndModel: (providerId: ProviderId, modelId: string) => void;
  updateSettings: (newSettings: Partial<GenerationSettings>) => void;
  refreshKeyStatus: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  stopStreaming: () => void;
  dismissError: () => void;

  // UI toggles
  setKeyVaultOpen: (open: boolean, provider?: ProviderId) => void;
  setSettingsOpen: (open: boolean) => void;
  setApiDirectoryOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  exportCurrentSession: (format: "markdown" | "json") => void;
}

const DEFAULT_SETTINGS: GenerationSettings = {
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1.0,
  systemPrompt: "You are a helpful, precise, and capable AI assistant.",
  useProxy: true,
  customBaseUrl: "http://localhost:11434/v1",
  customModelName: "llama3.3",
};

const SESSIONS_STORAGE_KEY = "byok_chat_sessions_v1";
const SETTINGS_STORAGE_KEY = "byok_user_settings_v1";

const RETIRED_MODELS_MAP: Record<string, string> = {
  "deepseek/deepseek-r1": "deepseek/deepseek-v4.1-flash",
  "gemini-1.5-flash": "gemini-3.5-flash",
  "gemini-2.5-flash": "gemini-3.5-flash",
  "gemini-3.8-flash": "gemini-3.5-flash",
  "llama-3.3-70b-versatile": "openai/gpt-oss-120b",
  "llama-3.1-8b-instant": "openai/gpt-oss-20b",
  "google/gemini-2.5-flash": "google/gemini-3.8-flash",
  "google/gemini-2.5-pro": "google/gemini-4-argon",
};

function loadSavedSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (raw) {
      const parsed: ChatSession[] = JSON.parse(raw);
      let migrated = false;
      const sanitized = parsed.map((s) => {
        if (RETIRED_MODELS_MAP[s.modelId]) {
          migrated = true;
          return { ...s, modelId: RETIRED_MODELS_MAP[s.modelId] };
        }
        return s;
      });
      if (migrated) {
        saveSessions(sanitized);
      }
      return sanitized;
    }
  } catch {
    // ignore
  }
  return [];
}

function saveSessions(sessions: ChatSession[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // ignore
  }
}

function loadSavedSettings(): GenerationSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: GenerationSettings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

function createInitialSession(providerId: ProviderId = "groq"): ChatSession {
  const provider = getProvider(providerId);
  const modelId = provider.models[0]?.id || "openai/gpt-oss-120b";
  return {
    id: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: "New Testing Session",
    providerId,
    modelId,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export const usePlaygroundStore = create<PlaygroundState>((set, get) => {
  const initialSessions = typeof window !== "undefined" ? loadSavedSessions() : [];
  const baseSession = initialSessions.length > 0 ? initialSessions[0] : createInitialSession();
  const allSessions = initialSessions.length > 0 ? initialSessions : [baseSession];

  return {
    sessions: allSessions,
    currentSessionId: baseSession.id,

    isStreaming: false,
    streamingContent: "",
    streamingReasoning: "",
    streamingTtft: null,
    activeAbortController: null,

    keyStatusMap: {
      openai: false,
      anthropic: false,
      gemini: false,
      deepseek: false,
      groq: false,
      openrouter: false,
      demonroute: false,
      together: false,
      mistral: false,
      "custom-openai-compatible": true,
    },

    error: null,
    settings: DEFAULT_SETTINGS,

    isKeyVaultOpen: false,
    isSettingsOpen: false,
    isApiDirectoryOpen: false,
    isSidebarOpen: true,
    focusedProviderForVault: null,

    refreshKeyStatus: async () => {
      await vault.unlock();
      set({ keyStatusMap: vault.getConfiguredMap() });
    },

    createNewSession: (providerId = "openai", modelId) => {
      const provider = getProvider(providerId);
      const selectedModelId = modelId || provider.models[0]?.id || "gpt-4.1";
      const newSession: ChatSession = {
        id: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: "New Testing Session",
        providerId,
        modelId: selectedModelId,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      set((state) => {
        const nextSessions = [newSession, ...state.sessions];
        saveSessions(nextSessions);
        return {
          sessions: nextSessions,
          currentSessionId: newSession.id,
          error: null,
          streamingContent: "",
          streamingReasoning: "",
          isStreaming: false,
        };
      });

      return newSession.id;
    },

    switchSession: (sessionId: string) => {
      const { isStreaming, activeAbortController } = get();
      if (isStreaming && activeAbortController) {
        activeAbortController.abort();
      }
      set({
        currentSessionId: sessionId,
        error: null,
        isStreaming: false,
        streamingContent: "",
        streamingReasoning: "",
        activeAbortController: null,
      });
    },

    deleteSession: (sessionId: string) => {
      set((state) => {
        const filtered = state.sessions.filter((s) => s.id !== sessionId);
        let nextSessions = filtered;
        let nextCurrentId = state.currentSessionId;

        if (nextSessions.length === 0) {
          const fresh = createInitialSession();
          nextSessions = [fresh];
          nextCurrentId = fresh.id;
        } else if (state.currentSessionId === sessionId) {
          nextCurrentId = nextSessions[0].id;
        }

        saveSessions(nextSessions);
        return {
          sessions: nextSessions,
          currentSessionId: nextCurrentId,
          error: null,
        };
      });
    },

    clearCurrentSession: () => {
      const { currentSessionId, sessions, isStreaming, activeAbortController } = get();
      if (isStreaming && activeAbortController) {
        activeAbortController.abort();
      }
      const updated = sessions.map((s) =>
        s.id === currentSessionId ? { ...s, messages: [], updatedAt: Date.now() } : s
      );
      saveSessions(updated);
      set({
        sessions: updated,
        isStreaming: false,
        streamingContent: "",
        streamingReasoning: "",
        error: null,
      });
    },

    setProviderAndModel: (providerId: ProviderId, modelId: string) => {
      set((state) => {
        const updated = state.sessions.map((s) =>
          s.id === state.currentSessionId
            ? { ...s, providerId, modelId, updatedAt: Date.now() }
            : s
        );
        saveSessions(updated);
        return { sessions: updated };
      });
    },

    updateSettings: (newSettings: Partial<GenerationSettings>) => {
      set((state) => {
        const merged = { ...state.settings, ...newSettings };
        saveSettings(merged);
        return { settings: merged };
      });
    },

    sendMessage: async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const { currentSessionId, sessions, settings } = get();
      const currentSession = sessions.find((s) => s.id === currentSessionId);
      if (!currentSession) return;

      const providerConfig = getProvider(currentSession.providerId);

      // Check if API key is configured
      if (currentSession.providerId !== "custom-openai-compatible" && !vault.isConfigured(currentSession.providerId)) {
        set({
          error: {
            type: "auth",
            provider: currentSession.providerId,
            message: `Missing API Key for ${providerConfig.label}. Please add your API key in the BYOK Vault to start testing.`,
          },
          isKeyVaultOpen: true,
          focusedProviderForVault: currentSession.providerId,
        });
        return;
      }

      // Add user message
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}-user`,
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };

      const newMessages = [...currentSession.messages, userMsg];

      // Auto-update title if it's the first message
      let newTitle = currentSession.title;
      if (currentSession.messages.length === 0) {
        newTitle = trimmed.slice(0, 32) + (trimmed.length > 32 ? "..." : "");
      }

      const updatedSessions = sessions.map((s) =>
        s.id === currentSessionId
          ? { ...s, title: newTitle, messages: newMessages, updatedAt: Date.now() }
          : s
      );

      saveSessions(updatedSessions);

      const abortController = new AbortController();

      set({
        sessions: updatedSessions,
        isStreaming: true,
        streamingContent: "",
        streamingReasoning: "",
        streamingTtft: null,
        activeAbortController: abortController,
        error: null,
      });

      try {
        await vault.withKey(currentSession.providerId, async (apiKey) => {
          const adapter = getAdapterForProvider(providerConfig, settings.customBaseUrl);
          const rawModelId =
            currentSession.providerId === "custom-openai-compatible" && settings.customModelName.trim()
              ? settings.customModelName.trim()
              : currentSession.modelId;
          const modelToUse = RETIRED_MODELS_MAP[rawModelId] || rawModelId;

          if (RETIRED_MODELS_MAP[currentSession.modelId]) {
            set((state) => ({
              sessions: state.sessions.map((s) =>
                s.id === currentSessionId
                  ? { ...s, modelId: RETIRED_MODELS_MAP[s.modelId] }
                  : s
              ),
            }));
          }

          await adapter.streamChat({
            apiKey,
            model: modelToUse,
            messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
            settings,
            signal: abortController.signal,
            callbacks: {
              onFirstToken: (ttftMs) => {
                set({ streamingTtft: ttftMs });
              },
              onToken: (token) => {
                set((state) => ({
                  streamingContent: state.streamingContent + token,
                }));
              },
              onReasoning: (reasoningToken) => {
                set((state) => ({
                  streamingReasoning: state.streamingReasoning + reasoningToken,
                }));
              },
              onError: (err) => {
                const { streamingContent, streamingReasoning, streamingTtft } = get();

                // If some content was already streamed, persist it as partial assistant response
                if (streamingContent.trim() || streamingReasoning.trim()) {
                  const partialMsg: ChatMessage = {
                    id: `msg-${Date.now()}-assistant-partial`,
                    role: "assistant",
                    content: streamingContent + "\n\n*(Generation interrupted)*",
                    reasoningContent: streamingReasoning || undefined,
                    timestamp: Date.now(),
                    error: err,
                    stats: { ttftMs: streamingTtft || undefined },
                  };

                  set((state) => {
                    const finalized = state.sessions.map((s) =>
                      s.id === currentSessionId
                        ? { ...s, messages: [...s.messages, partialMsg], updatedAt: Date.now() }
                        : s
                    );
                    saveSessions(finalized);
                    return {
                      sessions: finalized,
                      isStreaming: false,
                      activeAbortController: null,
                      error: err,
                    };
                  });
                } else {
                  set({
                    isStreaming: false,
                    activeAbortController: null,
                    error: err,
                  });
                }
              },
              onDone: (stats: MessageStats) => {
                const { streamingContent, streamingReasoning, streamingTtft } = get();

                let finalContent = streamingContent;
                let finalReasoning = streamingReasoning;

                // Support parsing inline <think> tags (e.g. from DeepSeek R1 models)
                const thinkRegex = /<think>([\s\S]*?)<\/think>/i;
                const match = finalContent.match(thinkRegex);
                if (match) {
                  const extractedThink = match[1].trim();
                  if (!finalReasoning) {
                    finalReasoning = extractedThink;
                  }
                  finalContent = finalContent.replace(thinkRegex, "").trim();
                }

                const assistantMsg: ChatMessage = {
                  id: `msg-${Date.now()}-assistant`,
                  role: "assistant",
                  content: finalContent,
                  reasoningContent: finalReasoning || undefined,
                  timestamp: Date.now(),
                  stats: {
                    ...stats,
                    ttftMs: streamingTtft || undefined,
                  },
                };

                set((state) => {
                  const finalized = state.sessions.map((s) =>
                    s.id === currentSessionId
                      ? { ...s, messages: [...s.messages, assistantMsg], updatedAt: Date.now() }
                      : s
                  );
                  saveSessions(finalized);
                  return {
                    sessions: finalized,
                    isStreaming: false,
                    streamingContent: "",
                    streamingReasoning: "",
                    activeAbortController: null,
                  };
                });
              },
            },
          });
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        set({
          isStreaming: false,
          activeAbortController: null,
          error: { type: "network", message: errorMsg },
        });
      }
    },

    retryLastMessage: async () => {
      const { currentSessionId, sessions, sendMessage } = get();
      const current = sessions.find((s) => s.id === currentSessionId);
      if (!current || current.messages.length === 0) return;

      // Find last user message
      const lastUserIndex = current.messages.map((m) => m.role).lastIndexOf("user");
      if (lastUserIndex === -1) return;

      const lastUserMessage = current.messages[lastUserIndex].content;
      // Slice messages up to the user message
      const trimmedMessages = current.messages.slice(0, lastUserIndex);

      const updated = sessions.map((s) =>
        s.id === currentSessionId ? { ...s, messages: trimmedMessages, updatedAt: Date.now() } : s
      );
      saveSessions(updated);
      set({ sessions: updated, error: null });

      await sendMessage(lastUserMessage);
    },

    stopStreaming: () => {
      const { activeAbortController, streamingContent, streamingReasoning, currentSessionId, streamingTtft } = get();
      if (activeAbortController) {
        activeAbortController.abort();
      }

      if (streamingContent.trim() || streamingReasoning.trim()) {
        const partialMsg: ChatMessage = {
          id: `msg-${Date.now()}-assistant-stopped`,
          role: "assistant",
          content: streamingContent + "\n\n*(Stopped by user)*",
          reasoningContent: streamingReasoning || undefined,
          timestamp: Date.now(),
          stats: { ttftMs: streamingTtft || undefined },
        };

        set((state) => {
          const finalized = state.sessions.map((s) =>
            s.id === currentSessionId
              ? { ...s, messages: [...s.messages, partialMsg], updatedAt: Date.now() }
              : s
          );
          saveSessions(finalized);
          return {
            sessions: finalized,
            isStreaming: false,
            streamingContent: "",
            streamingReasoning: "",
            activeAbortController: null,
          };
        });
      } else {
        set({
          isStreaming: false,
          streamingContent: "",
          streamingReasoning: "",
          activeAbortController: null,
        });
      }
    },

    dismissError: () => set({ error: null }),

    setKeyVaultOpen: (open, provider) =>
      set({
        isKeyVaultOpen: open,
        focusedProviderForVault: provider || null,
      }),

    setSettingsOpen: (open) => set({ isSettingsOpen: open }),
    setApiDirectoryOpen: (open) => set({ isApiDirectoryOpen: open }),
    setSidebarOpen: (open) => set({ isSidebarOpen: open }),

    exportCurrentSession: (format: "markdown" | "json") => {
      const { currentSessionId, sessions } = get();
      const session = sessions.find((s) => s.id === currentSessionId);
      if (!session) return;

      let filename = `chat-${session.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}`;
      let blob: Blob;

      if (format === "json") {
        blob = new Blob([JSON.stringify(session, null, 2)], { type: "application/json" });
        filename += ".json";
      } else {
        let md = `# ${session.title}\n`;
        md += `**Provider:** ${session.providerId} | **Model:** ${session.modelId}\n`;
        md += `**Date:** ${new Date(session.createdAt).toLocaleString()}\n\n---\n\n`;

        for (const msg of session.messages) {
          md += `### ${msg.role === "user" ? "User" : "Assistant"}\n\n`;
          if (msg.reasoningContent) {
            md += `> **Reasoning Thought:**\n> ${msg.reasoningContent.split("\n").join("\n> ")}\n\n`;
          }
          md += `${msg.content}\n\n`;
          if (msg.stats) {
            md += `*Stats: TTFT ${msg.stats.ttftMs || 0}ms | Tokens ~${msg.stats.tokenCount || 0}*\n\n`;
          }
          md += `---\n\n`;
        }
        blob = new Blob([md], { type: "text/markdown" });
        filename += ".md";
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  };
});

if (typeof window !== "undefined") {
  vault.unlock().then(() => {
    usePlaygroundStore.getState().refreshKeyStatus();
  });
  vault.subscribeToVaultChanges(() => {
    usePlaygroundStore.getState().refreshKeyStatus();
  });
}

