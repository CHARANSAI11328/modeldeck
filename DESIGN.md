# DESIGN.md — Vanguard AI Chatbot Playground & Studio Architecture

## 1. Visual Theme & Atmosphere
An elite, developer-first intelligence terminal combining Linear-grade precision engineering with vanguard Obsidian Glass depth.
The atmosphere is clinical yet luminous — an expansive dark obsidian canvas with ethereal ambient radial light fields, physical double-bezel machine enclosures, and spring-physics micro-interactions.

- **Design Variance:** `7` (Controlled asymmetric rhythm, non-templated bento layouts)
- **Motion Intensity:** `6` (Weighted spring-physics transitions, haptic active feedback, fluid entry reveals)
- **Visual Density:** `5` (Developer-balanced readability with monospace tabular telemetry)

---

## 2. Color Calibration & Semantic Roles
- **Canvas Obsidian** (`#08090D`) — Deepest root surface, OLED-optimized
- **Surface Elevation 1** (`#0E1117`) — Double-bezel inner cores, cards, decks, and active panels
- **Surface Elevation 2** (`#161922`) — Secondary containers, interactive badges, hover states
- **Surface Elevation 3** (`#212634`) — Dropdown list items, popover elements, focused inputs
- **Structural Hairline** (`#1F2430` / `rgba(255,255,255,0.08)`) — Outer bezels and section boundaries
- **Primary Accent: Cobalt Azure** (`#3B82F6` / `#2563EB`) — Singularity accent for active triggers, focus rings, and primary actions
- **Verified / Success** (`#10B981`) — Validated API credentials, live server health, ready status
- **Warning / Attention** (`#F59E0B`) — Missing API key notifications, rate limit guidance
- **Destructive** (`#EF4444`) — Clear session, delete history, disconnect keys
- **Thinking / Reasoning Accent** (`#8B5CF6`) — DeepSeek R1 and OpenAI thinking trace accordions

> **Calibration Rule:** A single accent color (`#3B82F6`) dominates the primary interactive surfaces. No oversaturated neon glows or arbitrary multi-color gradient clashes.

---

## 3. Typographic Architecture
- **Display Headlines:** `Geist Sans`, `font-black tracking-tight leading-[1.1]`, `text-balance`
- **Body & Prompts:** `Geist Sans`, `text-sm sm:text-base leading-relaxed text-foreground max-w-[65ch]`
- **Telemetry & Metadata:** `Geist Mono`, `font-mono tabular-nums text-[10px] to text-xs`
- **Code & Syntax:** `JetBrains Mono` / `Geist Mono`, line numbers, syntax tokens, copy buttons

---

## 4. Component Mastery & Mechanical Standards

### A. The "Double-Bezel" (Doppelrand) Architecture
Major cards, modals, and dock containers do not sit flatly on the canvas:
- **Outer Shell (`.double-bezel`):** Translucent shell with hairline boundary (`border border-white/[0.07]`), outer padding (`p-1` to `p-1.5`), outer corner radius (`rounded-2xl` / `rounded-3xl`), and ambient drop-shadow.
- **Inner Core (`.double-bezel-inner`):** Distinct surface fill (`bg-surface-1`), concentric inner radius (`rounded-[calc(1.125rem-4px)]`), and specular inner highlight (`shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]`).

### B. Nested CTA & "Island" Button Pattern
- Primary action buttons are tactile pills with button-in-button trailing icon circles.
- On hover, the nested circular wrapper shifts diagonally (`group-hover:translate-x-0.5 group-hover:-translate-y-0.5`), imparting physical mechanical tension.
- Active states enforce tactile feedback: `active:scale-[0.985] active:translate-y-[1px]`.

### C. Floating Command Dock (ChatInput)
- Raycast-style floating island positioned above the viewport safe area (`min-h-[100dvh]`).
- Quick prompt chips, monospace character counter with live estimated token calculation (`tabular-nums`), and keyboard shortcut hints (`⌘ Enter`).

### D. Executive Intelligence Deck (MessageItem)
- Assistant turns feature a live telemetry HUD: Time-to-First-Token (`ttftMs`), streaming velocity (`tokensPerSec`), and token count chips.
- Integrated collapsible thinking trace (`ReasoningAccordion`) for reasoning-capable models (DeepSeek-R1, o-series).

---

## 5. Layout Principles & Viewport Stability
- **Asymmetric Bento Showcase:** Breaks visual monotony with 2-column wide speedrun benchmarks, 1-column studio showcase cards, and staggered prompt triggers.
- **Strict Single-Column Collapse:** Below `768px`, all multi-column bento grids and split layouts collapse to clean single-column stacks (`grid-cols-1 w-full px-3 py-4`).
- **Viewport Stability:** All full-height sections declare `min-h-[100dvh]` rather than `h-screen` to prevent iOS Safari address bar layout jumping.

---

## 6. Motion & Performance Guardrails
- **GPU-Accelerated Properties:** Animations operate strictly on `transform` and `opacity`. Zero animation of `height`, `width`, `top`, or `left`.
- **Blur Performance:** `backdrop-blur` is restricted to fixed/sticky elements (navbar, command dock, modal backdrops). Never applied to scrolling message streams.
- **Spring Physics:** `transition-all duration-200 cubic-bezier(0.16, 1, 0.3, 1)`.

---

## 7. Anti-Pattern Bans (Strictly Enforced)
1. **NO** generic AI purple/neon button outer glows or gradient slop.
2. **NO** flat 3-column equal card layouts without variance.
3. **NO** pure black backgrounds (`#000000`).
4. **NO** generic circular spinners on primary actions; use layout-matching skeletons or pulse indicators.
5. **NO** desktop CTA text wrapping onto multiple lines.
6. **NO** multiple contradictory CTA intents in the same viewport.
