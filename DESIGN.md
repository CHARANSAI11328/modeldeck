# DESIGN.md — AI Chatbot Testing Playground (Multi-Provider BYOK)

## 1. Executive Visual Theme
Dark-mode-first, developer-tool aesthetic. Clean, spacious, high-contrast, and distraction-free.
Inspired by modern developer platforms like Linear, Vercel Dashboard, Raycast, and the Mobbin-analyzed AI chat interfaces.

## 2. Mobbin References & Shipped UX Patterns
Researched shipped patterns from leading web AI chat implementations on Mobbin:

- **ChatGPT (Web)** — [https://mobbin.com/apps/chatgpt-web](https://mobbin.com/apps/chatgpt-web)
  - *Pattern Used*: Centered `max-w-3xl` message thread with floating bottom input bar, distinct subtle assistant background tint, quick action bar below assistant responses (Copy markdown, Re-generate, Feedback, Token count).
- **Claude (Web)** — [https://mobbin.com/apps/claude-web](https://mobbin.com/apps/claude-web)
  - *Pattern Used*: Top header model selector dropdown with status indicators and parameter badges, collapsible sidebar session history, expandable/collapsible thought & reasoning chain accordions.
- **Perplexity (Web)** — [https://mobbin.com/apps/perplexity-web](https://mobbin.com/apps/perplexity-web)
  - *Pattern Used*: Tabbed Settings Modal for API key configuration with real-time key validity check, prominent "Get API Key ↗" redirect links, actionable inline error banners with retry countdowns for rate limits (HTTP 429).
- **Linear App** — [https://mobbin.com/apps/linear](https://mobbin.com/apps/linear)
  - *Pattern Used*: Dark zinc color tokens, subtle 1px border dividers (`zinc-800`), keyboard shortcut pills (`⌘K`, `Enter`, `Shift+Enter`), high-density monospace badges.

## 3. Color Palette (CSS Variables & Tailwind)
- **Background Root**: `#09090B` (`zinc-950` / `--background`)
- **Surface / Card**: `#121215` (`zinc-900/80` / `--card`)
- **Surface Elevated / Popover**: `#18181B` (`zinc-900` / `--popover`)
- **Border Default**: `#27272A` (`zinc-800` / `--border`)
- **Border Hover / Focus**: `#3F3F46` (`zinc-700` / `--border-focus`)
- **Text Primary**: `#FAFAFA` (`zinc-50` / `--foreground`)
- **Text Muted**: `#A1A1AA` (`zinc-400` / `--muted-foreground`)
- **Text Subtle**: `#71717A` (`zinc-500`)
- **Primary / Accent**: `#3B82F6` (`blue-500` / `--primary`)
- **Primary Foreground**: `#FFFFFF`
- **Destructive**: `#EF4444` (`red-500` / `--destructive`)
- **Success**: `#22C55E` (`green-500` / `--success`)
- **Warning / Notice**: `#F59E0B` (`amber-500` / `--warning`)
- **Reasoning Accent**: `#8B5CF6` (`violet-500` / for thinking models like DeepSeek-R1, o1/o3/o4)

## 4. Typography
- **Primary Font**: `Inter`, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Monospace Font**: `JetBrains Mono`, Menlo, Monaco, Consolas, "Liberation Mono", monospace
- **Headings**: `tracking-tight font-semibold text-zinc-50`
- **Body**: `text-sm leading-relaxed text-zinc-200` (or `15px / 1.6` in reading view)
- **Code Blocks & Badges**: Monospace font with line numbers, syntax highlighting, and copy button

## 5. Spacing & Layout Architecture
- Standard Tailwind spacing scale only (`p-2`, `p-3`, `p-4`, `p-6`, `gap-3`, `gap-4`). No arbitrary magic numbers.
- **Root Grid**: Responsive split view:
  - Collapsible Sidebar (`w-64` / `260px`): Session history, provider list, quick BYOK status.
  - Central Main Chat: Fixed header (`h-14`), scrollable message container (`max-w-3xl mx-auto py-6 px-4`), sticky bottom input dock with auto-resizing textarea.
  - Parameter Inspector Drawer / Sheet (`w-80`): System prompt, temperature, max tokens, top-p, CORS proxy mode.
- **Message Gaps**: `space-y-6` between turns.
- **Message Bubbles**:
  - User turn: Right/Right-aligned or clean bubble (`bg-zinc-800/80 border border-zinc-700/60 rounded-2xl px-4 py-3 text-zinc-100`).
  - Assistant turn: Left-aligned clean layout with provider logo avatar, model badge, markdown rendered content, and bottom action bar.

## 6. Component Rules (shadcn/ui Primitives)
- Use standard shadcn/ui patterns:
  - Dialog / Sheet for API key vault & system settings
  - DropdownMenu for model switcher & session actions
  - Tooltip for icon buttons and shortcuts
  - ScrollArea for chat history and message stream
  - Button with variants: `default`, `outline`, `ghost`, `secondary`, `destructive`
  - Badge with provider brand colors and status indicators (active / missing key)
  - Textarea with auto-resize on input
  - Slider for temperature / max token adjustments
- All interactive elements must implement:
  - Focus rings: `focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none`
  - Hover transitions: `transition-colors duration-150`
  - Disabled states: `disabled:opacity-50 disabled:pointer-events-none`
- Dark mode is the default and only shipped theme.

## 7. Key Vault UX & Multi-Device Synchronized Vault Architecture
- **Central Multi-Device Synchronization**: API keys are securely persisted on the central backend vault (`/api/vault` backed by private `data/vault.json`), enabling instant availability across all browser windows, tabs, and connected network devices (e.g. phones, tablets, or other workstations on `http://<LAN-IP>:3000`).
- **Real-Time Cross-Window Sync**: Utilizes `BroadcastChannel("byok_cross_window_sync")` for instantaneous, zero-latency key synchronization across tabs and windows without requiring page refreshes.
- **Background Multi-Device Polling & Window Focus Sync**: Listens to `window.focus` events and runs an automatic 10-second background poll so changes made on one device are immediately reflected on other connected devices.
- **Client Fallback & In-Memory Decryption**: Retains encrypted local cache (`AES-GCM-256`) with ephemeral in-memory session execution.
- **Zero Third-Party Logging**: Proxy forwarding forwards keys in transit via HTTPS headers directly to upstream APIs, never logged to third parties.
- **Live Key Verification & Auto-Discovery**: "Test & Sync Key" tests the credential against the provider's active API, auto-discovers all active models, and selects the optimal model.

## 8. Error State UX
- **HTTP 401/403 (Invalid Auth)**: Specific alert badge with direct link to the provider console.
- **HTTP 429 (Rate Limit)**: Active countdown timer based on `Retry-After` header, with instant retry trigger.
- **Stream Interruption**: Preserve all tokens received up to the disconnect point, mark state as interrupted, offer "Continue Generation" or "Retry".
- **CORS Failure**: Guide user with 1-click fallback to the built-in stateless zero-logging proxy.
