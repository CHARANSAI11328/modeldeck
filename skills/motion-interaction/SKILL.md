---
name: motion-interaction
description: Designs and implements purposeful web motion, transitions, micro-interactions, scroll effects, and animation systems. Use when a website needs refined interactions, animated storytelling, or motion polish.
---

# Motion & Interaction Designer

Use motion to clarify state, guide attention, provide feedback, and express brand character. Motion must never obstruct comprehension or usability.

## Choose the lightest effective technique
- CSS transitions/animations for simple hover, focus, and state changes.
- Web Animations API or framework-native animation for moderate UI transitions.
- Framer Motion (Motion) when already compatible with a React project and orchestration/layout animation is valuable.
- GSAP for complex timelines, scroll-driven sequences, or precise choreography when justified.
- Lenis or another smooth-scroll tool only when it improves the experience and does not undermine native scrolling/accessibility.
- Three.js/WebGL only for a clearly valuable 3D experience and when device/performance budgets permit it.

Verify current APIs and package names from official documentation before adding or upgrading dependencies.

## Motion design process
1. Identify the user purpose and motion opportunity.
2. Define trigger, duration, easing, distance, sequencing, and exit behavior.
3. Establish a small motion language; avoid unrelated animation styles.
4. Keep essential content visible and usable without animation.
5. Respect `prefers-reduced-motion`; provide a meaningful reduced-motion experience.
6. Avoid flashing, rapid parallax, forced scroll hijacking, excessive cursor effects, and motion that causes layout shift.
7. Ensure touch devices have equivalent functionality without hover.

## Performance
- Prefer transform and opacity for frequent animations.
- Avoid animating expensive layout properties unless necessary.
- Avoid excessive simultaneous animated elements and large continuously running effects.
- Pause or simplify off-screen effects where appropriate.
- Test on mobile and lower-powered devices.
- Avoid adding multiple animation libraries for overlapping needs.

## Interaction polish
Design clear hover, focus, pressed, selected, loading, success, and error states. Ensure interactions work with mouse, keyboard, and touch.

## Verification
Inspect actual browser behavior, reduced-motion mode, keyboard focus, touch interactions, and performance. Report any motion not tested.
