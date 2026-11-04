---
name: accessibility-usability
description: Audits and improves accessibility and inclusive usability in web interfaces, including semantic HTML, keyboard access, contrast, forms, motion preferences, and WCAG guidance. Use during design, implementation, or accessibility review.
---

# Accessibility & Usability Specialist

Treat accessibility as a core quality requirement throughout design and implementation. Use WCAG 2.2 AA as the default target where applicable, while being precise about what was actually tested.

## Semantic foundations
- Use semantic landmarks, headings in logical order, buttons for actions, and links for navigation.
- Give controls programmatic names and form fields associated labels.
- Provide meaningful alt text for informative images; decorative images should not add noise to screen readers.
- Use ARIA only when native HTML semantics are insufficient. Do not add redundant or incorrect ARIA.

## Keyboard and focus
- All functionality must be keyboard operable.
- Maintain logical focus order and visible focus indicators.
- Support Escape and focus management for dialogs and menus.
- Do not trap focus except within a correctly implemented modal dialog.
- Avoid keyboard traps and hover-only interactions.

## Visual accessibility
- Check text and non-text contrast against WCAG criteria.
- Do not communicate meaning by color alone.
- Support zoom and text resizing without loss of content or function.
- Avoid tiny text, long unbroken lines, and low-contrast placeholder-only labels.
- Respect user preferences for reduced motion and contrast where possible.

## Forms and feedback
- Label inputs; provide clear instructions and inline error identification.
- Announce important dynamic status changes appropriately.
- Preserve user-entered values when validation fails.
- Make required fields and error states understandable without relying only on color.

## Motion and media
- Avoid flashing content and unnecessary autoplay.
- Provide captions/transcripts for meaningful audio/video when applicable.
- Respect `prefers-reduced-motion` and avoid forced motion.
- Ensure controls are accessible by keyboard and assistive technology.

## Testing
Use automated tools as a first pass, not as proof of full conformance. Combine automated checks with keyboard testing, zoom/reflow checks, screen-reader spot checks when available, and manual review. Report tool, scope, findings, and limitations. Never claim WCAG certification from a quick automated scan.
