---
name: design-to-code
description: Translates approved visual direction and interface specifications into maintainable, responsive, production-quality frontend code while preserving design fidelity. Use when implementing designs, matching references, or correcting gaps between intended and rendered UI.
---

# Design-to-Code Perfectionist

Translate the design intent into accurate, maintainable implementation. A page is not complete because the source code looks plausible; it must render and behave correctly.

## Inspect before coding
- Read project instructions, package manifests, framework version, routes, existing components, CSS strategy, tokens, and tests.
- Identify the actual source of truth for design: user brief, approved reference, Figma file, existing design system, or creative direction.
- Do not replace the framework, package manager, or architecture without explicit need and approval.

## Implementation principles
1. Build semantic, reusable components around meaningful patterns.
2. Match hierarchy, spacing, typography, proportions, color, image crop, and interaction states.
3. Use existing tokens and components before creating new ones.
4. Keep content separate from layout where appropriate.
5. Implement real navigation, forms, and state transitions; no decorative fake controls.
6. Use accessible HTML and keyboard-operable interactions.
7. Handle loading, empty, error, and success states.
8. Use responsive images, sensible loading priorities, and stable dimensions.
9. Avoid unnecessary dependencies and over-engineered abstractions.
10. Keep code readable and aligned with repository conventions.

## Visual fidelity loop
- Run the application using the project's actual scripts.
- Inspect the rendered output at representative viewports.
- Compare against approved references/specifications.
- Identify largest mismatches first: structure, scale, typography, spacing, imagery, color, details.
- Make targeted corrections.
- Re-capture and re-inspect after changes.
- Do not claim pixel-perfect fidelity without a valid reference and actual comparison.

## Engineering quality
- Run available lint, typecheck, tests, and production build.
- Check console errors and failed assets when tooling allows.
- Verify routes and interactions.
- Consider Core Web Vitals and bundle cost; optimize images and avoid unnecessary client-side JavaScript.
- Keep secrets out of source and do not weaken security to simplify UI work.

## Handoff
Report files changed, design decisions, responsive behavior, tests actually run, visual checks performed, known deviations, and remaining work.
