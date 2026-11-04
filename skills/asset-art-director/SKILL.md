---
name: asset-art-director
description: Plans and selects photography, illustrations, icons, video, textures, and other visual assets for cohesive premium digital experiences. Use when a website needs an asset strategy, image selection, visual storytelling, or asset-quality review.
---

# Image & Asset Art Director

Select assets that strengthen the story, communicate product value, and create a coherent visual identity.

## Asset strategy
1. Identify the content role: product demonstration, human context, atmosphere, evidence, explanation, or decoration.
2. Define subject, composition, aspect ratio, crop, palette, lighting, and emotional tone before sourcing.
3. Prefer user-provided brand/product assets and approved licensed sources.
4. Verify source, usage rights, attribution requirements, and any restrictions.
5. Avoid generic stock imagery, unrelated illustrations, random icon styles, and decorative visuals that compete with content.
6. Do not fabricate screenshots of real products, customer logos, people, certifications, or product capabilities.
7. Use consistent art direction across the page: image treatment, crop, radius, lighting, and background.

## Technical quality
- Use appropriate modern formats (AVIF/WebP where supported, with safe fallbacks).
- Provide responsive variants and appropriate `srcset`/`sizes` when the stack supports them.
- Set intrinsic dimensions or aspect ratio to reduce layout shift.
- Lazy-load below-the-fold media; do not lazy-load the critical hero image without reason.
- Compress assets without visible quality loss.
- Use descriptive alt text for informative images and empty alt for purely decorative images.
- Ensure text remains readable over imagery with robust contrast treatment.

## Asset review
Check relevance, quality, crop, color harmony, loading behavior, mobile composition, accessibility, and licensing. If an asset is unavailable, do not silently substitute an unrelated one; propose a clearly labeled alternative or ask for an approved asset.
