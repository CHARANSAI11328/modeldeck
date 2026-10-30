export type ProviderId =
  | "openai"
  | "anthropic"
  | "gemini"
  | "deepseek"
  | "groq"
  | "openrouter"
  | "demonroute"
  | "together"
  | "mistral"
  | "custom-openai-compatible";

export type ProtocolType = "openai" | "anthropic" | "gemini";

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  contextWindow?: string;
  isReasoning?: boolean;
  recommended?: boolean;
  category?: "reasoning" | "coding" | "general" | "fast" | "free";
  isAccountModel?: boolean;
}

export interface ProviderConfig {
  id: ProviderId;
  label: string;
  shortLabel: string;
  protocol: ProtocolType;
  baseUrl: string;
  models: ModelInfo[];
  docsUrl: string;
  getKeyUrl: string;
  keyPrefix?: string;
  description: string;
  color: string;
  testModelId: string; // Universal model guaranteed to work for testing connection
}

export type MessageRole = "user" | "assistant" | "system";

export interface MessageStats {
  ttftMs?: number;
  totalMs?: number;
  tokenCount?: number;
  tokensPerSec?: number;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  reasoningContent?: string;
  isReasoningOpen?: boolean;
  timestamp: number;
  stats?: MessageStats;
  error?: AppError | null;
}

export interface ChatSession {
  id: string;
  title: string;
  providerId: ProviderId;
  modelId: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  systemPrompt?: string;
}

export type AppError =
  | { type: "auth"; message: string; provider?: ProviderId }
  | { type: "rate_limit"; message?: string; retryAfter?: number }
  | { type: "network"; message: string }
  | { type: "provider"; status: number; message: string }
  | { type: "aborted" };

export interface GenerationSettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  systemPrompt: string;
  useProxy: boolean;
  customBaseUrl: string;
  customModelName: string;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onReasoning?: (token: string) => void;
  onFirstToken?: (ttftMs: number) => void;
  onError: (error: AppError) => void;
  onDone: (stats: MessageStats) => void;
}

export interface ChatAdapterParams {
  apiKey: string;
  model: string;
  messages: { role: MessageRole; content: string }[];
  settings: GenerationSettings;
  signal?: AbortSignal;
  callbacks: StreamCallbacks;
}

export interface ChatAdapter {
  streamChat(params: ChatAdapterParams): Promise<void>;
  testConnection(
    apiKey: string,
    model: string,
    settings: GenerationSettings
  ): Promise<{ success: boolean; latencyMs: number; message: string; statusCode?: number }>;
}
