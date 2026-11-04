---
name: responsive-design
description: Designs, implements, and audits responsive interfaces across mobile, tablet, laptop, and large desktop viewports. Use when building a new interface or fixing layout, typography, navigation, and interaction behavior at different screen sizes.
---

# Responsive Design Specialist

Treat responsive design as a set of intentional layouts and interaction choices, not a final shrinking pass.

## Inspect
- Identify existing breakpoints, CSS strategy, content widths, grid rules, and navigation behavior.
- Review the target audience's likely devices and the project's supported browsers.
- Preserve existing conventions unless they are demonstrably inadequate.

## Design from content outward
1. Determine the minimum usable width for each content pattern.
2. Use fluid sizing and intrinsic layout where possible.
3. Define breakpoints when content needs them, not solely for named devices.
4. Recompose complex layouts on narrow screens; do not merely stack every card.
5. Ensure images, media, tables, charts, and code blocks have usable overflow behavior.
6. Prevent horizontal overflow, clipped controls, overlapping text, and tiny tap targets.
7. Adapt navigation, dialogs, menus, and forms for touch.
8. Keep primary content and actions easy to reach.

## Viewport checks
At minimum inspect:
- Narrow mobile: 320–360 CSS px where supported.
- Common mobile: 375–430 CSS px.
- Tablet: around 768 CSS px.
- Laptop: around 1280–1440 CSS px.
- Large desktop: around 1600–1920 CSS px.
These are test samples, not mandatory breakpoint values.

## Quality requirements
- Body text remains comfortably readable.
- Interactive targets are sufficiently large and spaced; aim for WCAG 2.2 target-size guidance where applicable.
- Focus indicators remain visible.
- Sticky elements do not cover content or keyboard focus.
- Landscape orientation and zoom do not break essential tasks.
- Use responsive images and avoid loading unnecessarily large assets on small devices.

## Verification
Use browser resizing or automation to inspect real rendered output at representative sizes. Check navigation, forms, modals, tables, image crops, typography, and horizontal overflow. Fix defects and recheck.
