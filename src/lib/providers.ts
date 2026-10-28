import { ProviderConfig, ProviderId, ModelInfo } from "./types";

export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  groq: {
    id: "groq",
    label: "Groq (LPU Speed)",
    shortLabel: "Groq",
    protocol: "openai",
    baseUrl: "https://api.groq.com/openai/v1",
    getKeyUrl: "https://console.groq.com/keys",
    docsUrl: "https://console.groq.com/docs/openai",
    keyPrefix: "gsk_",
    color: "#F55036",
    description: "Ultra-fast inference on Language Processing Units (LPUs) reaching 300-800+ tokens/second.",
    testModelId: "openai/gpt-oss-120b",
    models: [
      {
        id: "openai/gpt-oss-120b",
        name: "GPT-OSS 120B (Groq LPU)",
        description: "OpenAI's flagship 120B open-weights model streaming at extreme LPU speed on Groq.",
        contextWindow: "128,000 tokens",
        recommended: true,
        category: "reasoning",
        isReasoning: true,
      },
      {
        id: "qwen/qwen3.8-27b",
        name: "Qwen 3.8 27B (Groq LPU)",
        description: "State-of-the-art reasoning and coding model running at extreme speeds on LPUs.",
        contextWindow: "128,000 tokens",
        recommended: true,
        category: "coding",
        isReasoning: true,
      },
      {
        id: "openai/gpt-oss-20b",
        name: "GPT-OSS 20B (Groq LPU)",
        description: "Lightweight, ultra low-latency MoE model for rapid turnaround tasks.",
        contextWindow: "128,000 tokens",
        category: "fast",
      },
      {
        id: "allam-2-7b",
        name: "Allam 2 7B (Groq LPU)",
        description: "Fast, versatile bilingual instruction-tuned model running near-instantaneously.",
        contextWindow: "32,768 tokens",
        category: "fast",
      },
      {
        id: "openai/gpt-oss-safeguard-20b",
        name: "GPT-OSS Safeguard 20B",
        description: "Safety moderation and reasoning checkpoint on Groq hardware.",
        contextWindow: "128,000 tokens",
        category: "general",
      },
    ],
  },

  gemini: {
    id: "gemini",
    label: "Google Gemini",
    shortLabel: "Gemini",
    protocol: "gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    getKeyUrl: "https://aistudio.google.com/app/apikey",
    docsUrl: "https://ai.google.dev/gemini-api/docs",
    keyPrefix: "AIzaSy or AQ.",
    color: "#4285F4",
    description: "Google's multimodal frontier models with native thinking modes and up to 2M context windows.",
    testModelId: "gemini-3.8-flash",
    models: [
      {
        id: "gemini-3.8-flash",
        name: "Gemini 3.8 Flash (Flagship)",
        description: "Google's active frontier flash model with ultra-fast latency and built-in thinking tokens.",
        contextWindow: "1,048,576 tokens",
        isReasoning: true,
        recommended: true,
        category: "reasoning",
      },
      {
        id: "gemini-flash-latest",
        name: "Gemini Flash (Latest Stable)",
        description: "Automatically routes to Google's latest recommended high-speed Flash checkpoint.",
        contextWindow: "1,048,576 tokens",
        recommended: true,
        category: "fast",
      },
      {
        id: "gemini-3.5-flash",
        name: "Gemini 3.5 Flash",
        description: "High-throughput multimodal reasoning model with 1M context window.",
        contextWindow: "1,048,576 tokens",
        isReasoning: true,
        category: "fast",
      },
      {
        id: "gemini-3.7-flash",
        name: "Gemini 3.7 Flash",
        description: "Advanced coding and STEM problem solving with multi-step reasoning capabilities.",
        contextWindow: "1,048,576 tokens",
        isReasoning: true,
        category: "reasoning",
      },
      {
        id: "gemini-3.1-pro-preview",
        name: "Gemini 3.1 Pro Preview",
        description: "Frontier multimodal intelligence with 2M token context for long document analysis.",
        contextWindow: "2,097,152 tokens",
        isReasoning: true,
        recommended: true,
        category: "reasoning",
      },
      {
        id: "gemini-pro-latest",
        name: "Gemini Pro (Latest Stable)",
        description: "Automatically routes to Google's latest Pro tier reasoning model.",
        contextWindow: "2,097,152 tokens",
        category: "general",
      },
      {
        id: "gemini-2.5-flash-lite",
        name: "Gemini 2.5 Flash Lite",
        description: "Optimized for maximum efficiency, low cost, and fast output generation.",
        contextWindow: "1,048,576 tokens",
        category: "fast",
      },
    ],
  },

  openai: {
    id: "openai",
    label: "OpenAI",
    shortLabel: "OpenAI",
    protocol: "openai",
    baseUrl: "https://api.openai.com/v1",
    getKeyUrl: "https://platform.openai.com/api-keys",
    docsUrl: "https://platform.openai.com/docs/api-reference",
    keyPrefix: "sk-",
    color: "#10A37F",
    description: "Industry standard models including GPT-4o, GPT-4.1, and o-series reasoning models.",
    testModelId: "gpt-4o-mini",
    models: [
      {
        id: "gpt-4o",
        name: "GPT-4o (Omni Flagship)",
        description: "High-speed multimodal flagship for deep coding, vision, and data reasoning.",
        contextWindow: "128,000 tokens",
        recommended: true,
        category: "general",
      },
      {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        description: "Fast, cost-efficient omni model for rapid everyday tasks.",
        contextWindow: "128,000 tokens",
        recommended: true,
        category: "fast",
      },
      {
        id: "o3-mini",
        name: "o3-mini (STEM Reasoning)",
        description: "Cost-effective STEM, science, and coding model with explicit reasoning.",
        contextWindow: "200,000 tokens",
        isReasoning: true,
        recommended: true,
        category: "reasoning",
      },
      {
        id: "o1",
        name: "o1 (Full Reasoning)",
        description: "Deep thinking model designed to solve complex programming & logic challenges.",
        contextWindow: "200,000 tokens",
        isReasoning: true,
        category: "reasoning",
      },
      {
        id: "o1-mini",
        name: "o1-mini",
        description: "Lightweight, faster reasoning model tailored for math and code generation.",
        contextWindow: "128,000 tokens",
        isReasoning: true,
        category: "reasoning",
      },
      {
        id: "gpt-4.1",
        name: "GPT-4.1 (Preview)",
        description: "Frontier reasoning model with 1M token context capability.",
        contextWindow: "1,048,576 tokens",
        category: "general",
      },
      {
        id: "gpt-4.1-mini",
        name: "GPT-4.1 Mini",
        description: "High-intelligence lightweight model optimized for low latency.",
        contextWindow: "1,048,576 tokens",
        category: "fast",
      },
      {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        description: "Enhanced vision and text analysis with 128k context window.",
        contextWindow: "128,000 tokens",
        category: "general",
      },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        description: "Legacy high-speed model for lightweight conversational testing.",
        contextWindow: "16,385 tokens",
        category: "fast",
      },
    ],
  },

  anthropic: {
    id: "anthropic",
    label: "Anthropic Claude",
    shortLabel: "Claude",
    protocol: "anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    getKeyUrl: "https://console.anthropic.com/settings/keys",
    docsUrl: "https://docs.anthropic.com/en/api/getting-started",
    keyPrefix: "sk-ant-",
    color: "#D97706",
    description: "Claude models known for deep analysis, nuanced coding, and hybrid thinking capabilities.",
    testModelId: "claude-3-5-haiku-20241022",
    models: [
      {
        id: "claude-3-7-sonnet-20250219",
        name: "Claude 3.7 Sonnet (Hybrid)",
        description: "Most intelligent model to date, featuring customizable thinking and coding capabilities.",
        contextWindow: "200,000 tokens",
        isReasoning: true,
        recommended: true,
        category: "reasoning",
      },
      {
        id: "claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet",
        description: "Benchmark-topping model for programming, system design, and document processing.",
        contextWindow: "200,000 tokens",
        recommended: true,
        category: "coding",
      },
      {
        id: "claude-3-5-haiku-20241022",
        name: "Claude 3.5 Haiku",
        description: "Lightning-fast execution matching previous generation flagship performance.",
        contextWindow: "200,000 tokens",
        recommended: true,
        category: "fast",
      },
      {
        id: "claude-3-opus-20240229",
        name: "Claude 3 Opus",
        description: "Deep qualitative analysis, writing, and intricate domain synthesis.",
        contextWindow: "200,000 tokens",
        category: "general",
      },
      {
        id: "claude-3-haiku-20240307",
        name: "Claude 3 Haiku",
        description: "Fastest previous-gen Claude model for high-frequency queries.",
        contextWindow: "200,000 tokens",
        category: "fast",
      },
    ],
  },

  deepseek: {
    id: "deepseek",
    label: "DeepSeek",
    shortLabel: "DeepSeek",
    protocol: "openai",
    baseUrl: "https://api.deepseek.com/v1",
    getKeyUrl: "https://platform.deepseek.com/api_keys",
    docsUrl: "https://api-docs.deepseek.com/",
    keyPrefix: "sk-",
    color: "#0066FF",
    description: "DeepSeek V3 and DeepSeek R1 open-weights frontier models with explicit thinking tokens.",
    testModelId: "deepseek-chat",
    models: [
      {
        id: "deepseek-chat",
        name: "DeepSeek-V3 (Chat)",
        description: "General MoE 671B model with state-of-the-art coding and dialogue performance.",
        contextWindow: "64,000 tokens",
        recommended: true,
        category: "general",
      },
      {
        id: "deepseek-reasoner",
        name: "DeepSeek-R1 (Reasoner)",
        description: "Frontier reasoning model with exposed chain-of-thought thinking tokens before answer.",
        contextWindow: "64,000 tokens",
        isReasoning: true,
        recommended: true,
        category: "reasoning",
      },
    ],
  },

  openrouter: {
    id: "openrouter",
    label: "OpenRouter",
    shortLabel: "OpenRouter",
    protocol: "openai",
    baseUrl: "https://openrouter.ai/api/v1",
    getKeyUrl: "https://openrouter.ai/keys",
    docsUrl: "https://openrouter.ai/docs",
    keyPrefix: "sk-or-",
    color: "#6366F1",
    description: "Unified aggregator providing access to 300+ models with automatic fallback and routing.",
    testModelId: "openai/gpt-6-sol",
    models: [
      {
        id: "openai/gpt-6-sol-pro",
        name: "OpenAI: GPT-6 Sol Pro",
        description: "GPT-6 Sol Pro is served with reasoning.mode set to pro for higher-quality responses on complex, multi-step tasks.",
        contextWindow: "1,050,000 tokens",
        isReasoning: true,
        recommended: true,
        category: "reasoning",
      },
      {
        id: "openai/gpt-6-sol",
        name: "OpenAI: GPT-6 Sol",
        description: "High-end model in OpenAI's GPT-6 series, positioned below flagship Astra with strong reasoning and coding.",
        contextWindow: "1,050,000 tokens",
        recommended: true,
        category: "general",
      },
      {
        id: "openai/gpt-6-luna:batch",
        name: "OpenAI: GPT-6 Luna (batch)",
        description: "Fast, cost-efficient model in OpenAI's GPT-6 series with 1M+ context window for rapid processing.",
        contextWindow: "1,050,000 tokens",
        category: "fast",
      },
      {
        id: "openai/gpt-6-sol-pro:batch",
        name: "OpenAI: GPT-6 Sol Pro (batch)",
        description: "Batch inference endpoint for GPT-6 Sol Pro with extended reasoning capabilities.",
        contextWindow: "1,050,000 tokens",
        isReasoning: true,
        category: "reasoning",
      },
      {
        id: "openai/gpt-6-sol:batch",
        name: "OpenAI: GPT-6 Sol (batch)",
        description: "Batch inference endpoint for GPT-6 Sol offering cost-efficient frontier intelligence.",
        contextWindow: "1,050,000 tokens",
        category: "general",
      },
      {
        id: "anthropic/claude-opus-5.5",
        name: "Anthropic: Claude Opus 5.5",
        description: "Anthropic's flagship model for demanding reasoning, coding, and long-horizon agentic work.",
        contextWindow: "1,000,000 tokens",
        isReasoning: true,
        recommended: true,
        category: "reasoning",
      },
      {
        id: "anthropic/claude-opus-5.5:batch",
        name: "Anthropic: Claude Opus 5.5 (batch)",
        description: "Batch processing endpoint for Claude Opus 5.5 with 1M context window.",
        contextWindow: "1,000,000 tokens",
        isReasoning: true,
        category: "reasoning",
      },
      {
        id: "nvidia/switchyard",
        name: "NVIDIA: Switchyard",
        description: "NVIDIA's intelligent model routing system that switches between multiple models to optimize latency and cost.",
        contextWindow: "1,000,000 tokens",
        category: "general",
      },
      {
        id: "xiaomi/mimo-v2.6-pro-ultraspeed",
        name: "Xiaomi: MiMo-V2.6-Pro-UltraSpeed",
        description: "Fast speed edition of Xiaomi's flagship foundation model built from the 1T MiMo-V2.6 architecture.",
        contextWindow: "1,048,576 tokens",
        category: "fast",
      },
      {
        id: "xiaomi/mimo-v2.6-flash",
        name: "Xiaomi: MiMo-V2.6-Flash",
        description: "Open-source foundation model developed by Xiaomi built on MoE architecture with 309B parameters.",
        contextWindow: "1,050,000 tokens",
        category: "fast",
      },
      {
        id: "xiaomi/mimo-v2.6-pro",
        name: "Xiaomi: MiMo-V2.6-Pro",
        description: "Flagship foundation model developed by Xiaomi built at a scale of over 1T parameters for frontier tasks.",
        contextWindow: "1,050,000 tokens",
        isReasoning: true,
        category: "reasoning",
      },
      {
        id: "x-ai/grok-4.7",
        name: "SpaceXAI: Grok 4.7",
        description: "SpaceXAI's flagship model for coding, agentic tasks, and knowledge work with 500k context window.",
        contextWindow: "500,000 tokens",
        isReasoning: true,
        recommended: true,
        category: "reasoning",
      },
      {
        id: "qwen/qwen3.8-omni-flash",
        name: "Qwen: Qwen3.8 Omni Flash",
        description: "Omni-modal reasoning model from Alibaba built around agentic capabilities and fast execution.",
        contextWindow: "1,000,000 tokens",
        category: "coding",
      },
      {
        id: "prism-ml/ternary-bonsai-2-27b",
        name: "PrismML: Ternary Bonsai 2 27B",
        description: "27B-parameter reasoning model from PrismML supporting coding, mathematics, and tool calling.",
        contextWindow: "262,144 tokens",
        category: "general",
      },
      {
        id: "z-ai/glm-5.3-flashx",
        name: "Z.ai: GLM 5.3 FlashX",
        description: "High-speed variant of GLM-5.3 delivering inference speeds of up to 200 tokens/second.",
        contextWindow: "1,048,576 tokens",
        category: "fast",
      },
      {
        id: "~deepseek/deepseek-pro-latest",
        name: "DeepSeek: DeepSeek Pro Latest",
        description: "Automatically routes to the latest active flagship checkpoint in the DeepSeek Pro family.",
        contextWindow: "1,048,576 tokens",
        isReasoning: true,
        recommended: true,
        category: "reasoning",
      },
      {
        id: "~deepseek/deepseek-flash-latest",
        name: "DeepSeek: DeepSeek Flash Latest",
        description: "Automatically routes to the latest active high-speed checkpoint in the DeepSeek Flash family.",
        contextWindow: "1,048,576 tokens",
        category: "fast",
      },
      {
        id: "inference-net/schematron-v2-turbo",
        name: "Inference.net: Schematron V2 Turbo",
        description: "3B-parameter HTML-to-JSON extraction model prioritizing throughput for high-volume structured scraping.",
        contextWindow: "128,000 tokens",
        category: "coding",
      },
      {
        id: "inference-net/schematron-v2-small",
        name: "Inference.net: Schematron V2 Small",
        description: "Extraction model prioritizing quality and schema validation for complex data scraping.",
        contextWindow: "128,000 tokens",
        category: "coding",
      },
      {
        id: "~openai/gpt-astra-latest",
        name: "OpenAI: GPT Astra Latest",
        description: "Automatically routes to the latest frontier checkpoint in OpenAI's GPT Astra family.",
        contextWindow: "1,050,000 tokens",
        isReasoning: true,
        recommended: true,
        category: "reasoning",
      },
      {
        id: "~openai/gpt-sol-latest",
        name: "OpenAI: GPT Sol Latest",
        description: "Automatically routes to the latest checkpoint in OpenAI's GPT Sol family.",
        contextWindow: "1,050,000 tokens",
        category: "general",
      },
      {
        id: "~openai/gpt-terra-latest",
        name: "OpenAI: GPT Terra Latest",
        description: "Automatically routes to the latest checkpoint in OpenAI's GPT Terra family.",
        contextWindow: "1,050,000 tokens",
        category: "general",
      },
      {
        id: "~openai/gpt-luna-latest",
        name: "OpenAI: GPT Luna Latest",
        description: "Automatically routes to the latest high-throughput checkpoint in OpenAI's GPT Luna family.",
        contextWindow: "1,050,000 tokens",
        category: "fast",
      },
      {
        id: "sakana/fugu-ultra-v2",
        name: "Sakana: Fugu Ultra v2",
        description: "Learned multi-agent orchestration architecture from Sakana AI delivering top-tier performance.",
        contextWindow: "1,000,000 tokens",
        isReasoning: true,
        category: "reasoning",
      },
      {
        id: "sakana/fugu-max",
        name: "Sakana: Fugu Max",
        description: "Cost-performance model in Sakana AI's Fugu family with multi-agent coordination.",
        contextWindow: "1,000,000 tokens",
        category: "general",
      },
      {
        id: "inclusionai/ling-3.0-flash-vl",
        name: "inclusionAI: Ling 3.0 Flash VL",
        description: "124B total / 5.5B active MoE vision-language model with fast execution speeds.",
        contextWindow: "131,072 tokens",
        category: "fast",
      },
    ],
  },

  together: {
    id: "together",
    label: "Together AI",
    shortLabel: "Together",
    protocol: "openai",
    baseUrl: "https://api.together.xyz/v1",
    getKeyUrl: "https://api.together.xyz/settings/api-keys",
    docsUrl: "https://docs.together.ai/docs/quickstart",
    keyPrefix: "together-",
    color: "#0EA5E9",
    description: "High-performance inference platform for open source and fine-tuned models.",
    testModelId: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    models: [
      {
        id: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        name: "Llama 3.3 70B Turbo",
        description: "Together's dedicated Turbo inference cluster for Llama 3.3.",
        contextWindow: "128,000 tokens",
        recommended: true,
        category: "general",
      },
      {
        id: "deepseek-ai/DeepSeek-R1",
        name: "DeepSeek R1 (Together)",
        description: "Uncapped reasoning on high-spec FP8 hardware cluster.",
        contextWindow: "64,000 tokens",
        isReasoning: true,
        recommended: true,
        category: "reasoning",
      },
      {
        id: "deepseek-ai/DeepSeek-V3",
        name: "DeepSeek V3 (Together)",
        description: "Full DeepSeek-V3 671B model deployed on Turbo cluster.",
        contextWindow: "64,000 tokens",
        category: "general",
      },
      {
        id: "Qwen/Qwen2.5-72B-Instruct-Turbo",
        name: "Qwen 2.5 72B Turbo",
        description: "Alibaba's world-class bilingual reasoning and code model.",
        contextWindow: "32,768 tokens",
        category: "coding",
      },
      {
        id: "Qwen/Qwen2.5-Coder-32B-Instruct",
        name: "Qwen 2.5 Coder 32B",
        description: "Specialized model for software development, debugging, and code generation.",
        contextWindow: "32,768 tokens",
        category: "coding",
      },
      {
        id: "mistralai/Mixtral-8x22B-Instruct-v0.1",
        name: "Mixtral 8x22B Instruct",
        description: "Large Mixture-of-Experts with 65k context window on Together.",
        contextWindow: "65,536 tokens",
        category: "general",
      },
    ],
  },

  mistral: {
    id: "mistral",
    label: "Mistral AI",
    shortLabel: "Mistral",
    protocol: "openai",
    baseUrl: "https://api.mistral.ai/v1",
    getKeyUrl: "https://console.mistral.ai/api-keys/",
    docsUrl: "https://docs.mistral.ai/api/",
    color: "#FF7000",
    description: "Europe's leading AI lab providing Mistral Large, Codestral, and Pixtral vision models.",
    testModelId: "mistral-small-latest",
    models: [
      {
        id: "mistral-large-latest",
        name: "Mistral Large 2 (Latest)",
        description: "Flagship top-tier reasoning model for complex multilingual tasks and reasoning.",
        contextWindow: "128,000 tokens",
        recommended: true,
        category: "general",
      },
      {
        id: "codestral-latest",
        name: "Codestral (Coding Specialist)",
        description: "Cutting-edge generative model explicitly trained on 80+ programming languages.",
        contextWindow: "256,000 tokens",
        recommended: true,
        category: "coding",
      },
      {
        id: "mistral-small-latest",
        name: "Mistral Small (Latest)",
        description: "Cost-effective, low-latency model for rapid workflows and summarizing.",
        contextWindow: "128,000 tokens",
        category: "fast",
      },
      {
        id: "pixtral-12b",
        name: "Pixtral 12B (Vision)",
        description: "Multimodal frontier model capable of understanding images, diagrams, and documents.",
        contextWindow: "128,000 tokens",
        category: "general",
      },
    ],
  },

  "custom-openai-compatible": {
    id: "custom-openai-compatible",
    label: "Custom / Local (OpenAI Compatible)",
    shortLabel: "Custom / Local",
    protocol: "openai",
    baseUrl: "http://localhost:11434/v1",
    getKeyUrl: "https://github.com/ollama/ollama",
    docsUrl: "https://github.com/ollama/ollama/blob/main/docs/openai.md",
    color: "#A855F7",
    description: "Connect to Ollama, vLLM, LM Studio, Jan, or any custom reverse proxy endpoint.",
    testModelId: "llama3.3",
    models: [
      {
        id: "llama3.3",
        name: "Local Model (Default)",
        description: "Model hosted on your local Ollama or server instance.",
        contextWindow: "Configurable",
        recommended: true,
        category: "general",
      },
      {
        id: "deepseek-r1:latest",
        name: "Local DeepSeek R1",
        description: "Locally quantized DeepSeek R1 instance.",
        contextWindow: "Configurable",
        isReasoning: true,
        category: "reasoning",
      },
      {
        id: "qwen2.5-coder:latest",
        name: "Local Qwen 2.5 Coder",
        description: "Locally hosted coding assistant model.",
        contextWindow: "Configurable",
        category: "coding",
      },
    ],
  },
};

const DYNAMIC_MODELS_STORAGE_KEY = "byok_dynamic_models_v2";

function loadSavedDynamicModels(): Partial<Record<ProviderId, ModelInfo[]>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DYNAMIC_MODELS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

// In-memory + persisted dynamic models cache
const dynamicModelsMap: Partial<Record<ProviderId, ModelInfo[]>> = loadSavedDynamicModels();
const listeners = new Set<() => void>();

export function subscribeToDynamicModels(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setDynamicModels(providerId: ProviderId, models: ModelInfo[]) {
  if (models && models.length > 0) {
    dynamicModelsMap[providerId] = models;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(DYNAMIC_MODELS_STORAGE_KEY, JSON.stringify(dynamicModelsMap));
      } catch {
        // ignore
      }
    }
    listeners.forEach((fn) => fn());
  }
}

export function getProvider(id: ProviderId): ProviderConfig {
  const base = PROVIDERS[id] || PROVIDERS.openai;
  const dynamic = dynamicModelsMap[id];
  if (dynamic && dynamic.length > 0) {
    return {
      ...base,
      models: dynamic,
    };
  }
  return base;
}

export function getAllProviders(): ProviderConfig[] {
  return (Object.keys(PROVIDERS) as ProviderId[]).map((id) => getProvider(id));
}

export const PROVIDER_LIST = getAllProviders();

export function getModel(providerId: ProviderId, modelId: string): ModelInfo {
  const provider = getProvider(providerId);
  const found = provider.models.find((m) => m.id === modelId);
  if (found) return found;
  return (
    provider.models[0] || {
      id: modelId,
      name: modelId,
      description: "Selected model",
      category: "general",
    }
  );
}

