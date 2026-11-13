# ModelDeck visual system

ModelDeck keeps its warm obsidian and ember identity, with quieter surfaces and clear interaction hierarchy. The landing page uses an editorial split and an asymmetric feature layout; the workspace uses the same materials at a more compact scale.

## Palette and typography

- Canvas: `#100e0d`; panels: `#191614`; raised surfaces: `#241e19`.
- Primary text: `#f5eee7`; secondary text: `#b3a69b`.
- Primary action: soft ember `#ef9a71`, with dark text for contrast.
- Sage and lavender distinguish suggestion categories. Status always includes text.
- Geist for interface and display type; Geist Mono for small metadata.

Shared tokens and responsive components live in `src/app/premium.css`. The stylesheet follows legacy styles and scopes workspace refinements to `.app-shell`.

## Components

- Major cards have a subtle outer shell and a concentric inner surface.
- The home navigation is a floating pill. Primary calls to action use a nested circular arrow.
- The home preview is an explicitly labeled interactive example, not a live provider response.
- Playground suggestions populate the composer for editing. They never immediately send a request.
- Drafts are retained per conversation while the playground stays mounted. Missing credentials open the key vault without clearing the draft.
- Conversation history supports search. Destructive deletion of nonempty conversations asks for confirmation.
- Model selection, parameters, stop generation, copy, retry, and export remain available.
- Assistant Studio uses the same warm materials while preserving its configuration and preview workflow.

## Motion and accessibility

Use `cubic-bezier(.22,1,.36,1)` with transform and opacity. Landing sections reveal through IntersectionObserver. Reduced-motion preferences disable these transitions and reveals. Backdrop blur is restricted to overlays. Interactive controls have visible keyboard focus; dialogs retain focus and restore their trigger. Mobile navigation supports Escape and a keyboard loop.

## Responsive behavior and verification

Below 768px, the landing page and suggestion cards stack into one column. The sidebar becomes an overlay, and the composer remains available above the safe area. The key setup prompt precedes suggestions on phones.

Run `npm run build` for compilation and type validation. `scripts/verify-design.mjs` checks the local app with headless Edge at 1440, 768, 390, 375, and 320px, exercises UI interactions, and saves screenshots in `screenshots/`. Model responses in this check are simulated; it does not validate provider credentials or live inference. Set `MODELDECK_TEST_URL` to the preview server URL if it differs from `http://localhost:3101`.
