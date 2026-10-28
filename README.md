# ⚡ ModelDeck — Multi-Provider BYOK AI Testing Playground

A production-quality AI model testing & benchmarking playground built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Zustand**, featuring a central multi-device synchronized **Bring-Your-Own-Key (BYOK)** vault, real-time SSE token streaming, thinking/reasoning traces, instant model search, mobile responsiveness, and zero-storage privacy.

Deploy with 1-click to **Vercel**, **Railway**, **Render**, or **Docker** and test frontier models (OpenAI, Anthropic Claude, Google Gemini, DeepSeek, Groq, OpenRouter, Mistral, Together AI, and local Ollama) in one unified interface.

---

## 🚀 Key Features

### 1. 45+ Frontier AI Models Across 9 Providers
- **OpenAI**: GPT-4o (Omni Flagship), GPT-4o Mini, o3-mini (STEM Reasoning), o1 (Full Reasoning), o1-mini, GPT-4.1 (Preview), GPT-4.1 Mini, GPT-4 Turbo, GPT-3.5 Turbo.
- **Anthropic Claude**: Claude 3.7 Sonnet (Hybrid Reasoning with expandable thinking traces), Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus, Claude 3 Haiku.
- **Google Gemini**: Gemini 2.5 Flash (Thinking), Gemini 2.5 Pro (2M context), Gemini 2.0 Flash, Gemini 2.0 Flash Lite, Gemini 2.0 Pro Experimental, Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini 1.5 Flash 8B.
- **DeepSeek**: DeepSeek-V3 (671B MoE Chat) & DeepSeek-R1 (Full Reasoning with chain-of-thought).
- **Groq (LPU Extreme Speed)**: Llama 3.3 70B (300+ tok/s), DeepSeek R1 Distill 70B, DeepSeek R1 Distill Qwen 32B, Llama 3.1 8B Instant (800+ tok/s), Mixtral 8x7B, Gemma 2 9B.
- **OpenRouter**: Access 300+ models with unified routing (Claude 3.7, DeepSeek R1, GPT-4.1, Gemini 2.5, Llama 3.3, Qwen 2.5 72B, and free-tier open models).
- **Together AI**: Llama 3.3 70B Turbo, DeepSeek R1 FP8, DeepSeek V3, Qwen 2.5 72B Turbo, Qwen 2.5 Coder 32B, Mixtral 8x22B.
- **Mistral AI**: Mistral Large 2 (Latest), Codestral (Coding Specialist 256k context), Mistral Small, Pixtral 12B (Vision).
- **Custom / Local**: Ollama (`http://localhost:11434/v1`), vLLM, LM Studio, Jan, or local GPU clusters.

---

## 🔗 Direct Links to Obtain API Keys

| Provider | Direct Link to Obtain API Key | Default Prefix | Free Tier & Credits Info |
|---|---|---|---|
| **OpenAI** | [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys) | `sk-` | Pay-as-you-go; promotional credits for new accounts |
| **Anthropic Claude** | [https://console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) | `sk-ant-` | Prepaid credits; phone-verified accounts typically receive $5 |
| **Google Gemini** | [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) | `AIzaSy` | **Generous Free Tier** available for Gemini 2.5 Flash & 2.0 Flash (up to 15 RPM) |
| **DeepSeek** | [https://platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys) | `sk-` | Ultra cost-effective FP8 inference; free starting credits |
| **Groq (LPU Speed)** | [https://console.groq.com/keys](https://console.groq.com/keys) | `gsk_` | **Generous Free Tier** for Llama 3.3 70B & DeepSeek R1 Distill (300–800+ tok/s) |
| **OpenRouter** | [https://openrouter.ai/keys](https://openrouter.ai/keys) | `sk-or-` | Access 300+ models with 1 key; includes free open-weight models (`:free`) |
| **Together AI** | [https://api.together.xyz/settings/api-keys](https://api.together.xyz/settings/api-keys) | `together-` | $5 in free credits for new developer signups |
| **Mistral AI** | [https://console.mistral.ai/api-keys/](https://console.mistral.ai/api-keys/) | N/A | Free experimentation tier for Codestral, Mistral Small & Large |
| **Custom / Local** | [https://github.com/ollama/ollama](https://github.com/ollama/ollama) | N/A | **100% Free & Private**, runs on local GPU/CPU (Ollama, vLLM) |

---

## 📱 Mobile-First & User-Friendly UX Upgrades

- **Instant Model Search & Filters**: Search across 45+ models by name, provider, or filter with one click by category (`Reasoning 🧠`, `Coding 💻`, `Fast ⚡`, or provider tabs).
- **Responsive Mobile Drawer**: Sidebar slides in smoothly with backdrop blur overlay and auto-closes on conversation selection.
- **Touch-Friendly Controls**: Touch targets comply with accessibility guidelines (min 44px on mobile) with safe-area spacing for virtual keyboards.
- **3-Step BYOK Onboarding**: Simple visual guide directly explains how to get a key, paste it into the vault, and start chatting.
- **Resilient Key Testing**: Uses verified test models and automatic CORS proxy failover so "Test Key" provides immediate latency and actionable status feedback.

---

## 🛡️ Security Guarantees

- **AES-GCM (256-Bit) + PBKDF2**: Encrypted locally in browser `localStorage`.
- **Zero Plaintext Storage**: API keys are never stored in plaintext.
- **In-Memory Scoped Execution**: Keys are decrypted into memory only during active execution.
- **Stateless Edge Proxy**: Zero-logging byte-level streaming pass-through preventing CORS blocks.
