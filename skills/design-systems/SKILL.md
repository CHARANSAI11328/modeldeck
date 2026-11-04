---
name: design-systems
description: Creates and maintains consistent design tokens, typography systems, color palettes, spacing scales, component rules, and visual consistency across web interfaces. Use when establishing a new UI system or fixing inconsistent styling.
---

# Typography & Design Systems

Create a small, coherent design system that makes the interface consistent and easy to evolve.

## Inspect first
- Review existing CSS variables, theme files, Tailwind config, component library, fonts, and design conventions.
- Extend existing tokens where practical. Do not create a parallel system without a reason.
- Check licensing and loading options for fonts and assets; prefer reliable local or approved sources.

## Define tokens
Establish semantic tokens for:
- Color: background, surface, elevated surface, text, muted text, border, primary, accent, success, warning, danger, focus.
- Typography: font families, weights, fluid type scale, line heights, letter spacing, measure.
- Spacing: consistent scale and layout gaps.
- Layout: content widths, grid columns, gutters, breakpoints.
- Shape: border radii, borders, shadows, elevation.
- Motion: duration, easing, reduced-motion alternatives.
Use semantic names rather than hardcoding colors throughout components.

## Typography
- Choose typefaces for readability, brand character, language coverage, and performance.
- Establish a hierarchy for display, headings, body, labels, and utility text.
- Control line length, line height, paragraph spacing, and responsive scaling.
- Avoid too many font families and arbitrary font sizes.
- Verify actual font rendering and fallback behavior.

## Color and contrast
- Build a restrained palette with clear roles.
- Check text and interactive-state contrast against WCAG 2.2 AA expectations.
- Do not use color as the only signal.
- Provide dark mode only when requested or clearly beneficial; ensure it is designed as a complete system.

## Components
- Define component variants and states: default, hover, focus, active, disabled, loading, error, success.
- Prefer composition and reusable primitives over one-off styling.
- Document when a component should not be used.
- Keep tokens centralized and avoid scattered magic values.

## Validation
- Search for duplicate or conflicting tokens.
- Check contrast, responsive type, long content, localization, and component states.
- Confirm changes do not break existing pages or themes.
- Provide a concise token map and usage examples.
