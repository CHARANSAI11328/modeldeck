---
name: creative-orchestrator
description: Coordinates the creative design skills for website, landing-page, product, and interface projects. Use when planning a new digital experience, selecting multiple design skills, or coordinating design-to-build-to-QA work.
---

# Creative Orchestrator

Coordinate the design skills as a coherent team. You own sequencing, scope, handoffs, and conflict resolution; specialist skills own their domains.

## Activation
Use for multi-stage website, landing page, SaaS interface, product UI, brand-led web experience, or major redesign work. For a narrow task, activate only the relevant specialist instead of invoking the entire pipeline.

## First inspect
1. Read the user's brief, existing repository instructions, package manifests, routes, components, design tokens, and current implementation.
2. Determine whether this is a new build, redesign, extension, bug fix, or visual-only change.
3. Preserve the existing stack and working behavior unless the user explicitly authorizes a migration.
4. Identify audience, business goal, primary conversion, content, brand constraints, accessibility needs, and delivery constraints. Ask only for missing information that blocks sound decisions; otherwise state reasonable assumptions.

## Skill selection
- Creative direction / brand concept: `creative-director`
- Research and reference analysis: `visual-research`
- User flows, information architecture, usability: `ui-ux-master`
- Landing-page structure and conversion: `landing-page-architect`
- Tokens, typography, component consistency: `design-systems`
- Image and asset strategy: `asset-art-director`
- Motion and interaction: `motion-interaction`
- Responsive behavior: `responsive-design`
- Anti-template originality review: `anti-generic-design`
- Accessibility: `accessibility-usability`
- Design fidelity during implementation: `design-to-code`
- Final browser and visual verification: `visual-qa`
- Skill creation / maintenance: `skill-architect`

Skills are discovered through their descriptions. Do not claim a skill was activated or read if the environment did not expose it. When a critical skill is unavailable, apply its documented principles only if they are available in context and disclose the limitation.

## Default workflow
### Phase 1 — Discover
- Classify project type, audience, user intent, brand maturity, content readiness, and technical constraints.
- Inspect existing code and assets before proposing architecture.
- Identify primary user journey and success action.
- Establish what is in scope and what must remain unchanged.

### Phase 2 — Research and direction
- Use `visual-research` when reference research is useful or requested.
- Build a concise creative brief: positioning, personality, visual concept, layout principle, typography direction, palette logic, imagery, motion intensity, and anti-patterns to avoid.
- Use references as evidence and inspiration, not templates to clone.
- Choose an appropriate premium intensity. Do not default to maximal animation, dark mode, gradients, glassmorphism, or 3D.

### Phase 3 — Experience architecture
- Define sitemap/sections, content hierarchy, navigation, key user flows, CTA strategy, and responsive behavior.
- Create a small design system before scaling components.
- Confirm the hero communicates what the product/business is, who it serves, and what action to take.

### Phase 4 — Implementation
- Use the project's existing framework, package manager, conventions, and dependencies.
- Implement complete sections and meaningful states; avoid fake buttons, dead links, empty forms, fabricated testimonials, and placeholder metrics.
- Keep content, components, tokens, and interaction logic maintainable.
- Add motion only when it supports comprehension, hierarchy, feedback, or brand expression.

### Phase 5 — Verification
- Invoke `design-to-code`, `responsive-design`, `accessibility-usability`, and `visual-qa` as relevant.
- Run the available development server and inspect actual rendered pages at representative viewport sizes.
- Test navigation, forms, menus, links, keyboard behavior, reduced motion, and error/empty states.
- Fix the highest-impact defects and re-inspect.
- Report what was actually tested and what remains unverified.

## Conflict resolution
1. User's explicit requirements and safety constraints.
2. Existing project architecture and documented constraints.
3. Accessibility, security, correctness, and real functionality.
4. Project-specific brand/design system.
5. Specialist recommendations.
6. General visual trends and personal preference.

When two skills overlap, assign one owner and ask the other to provide a review, not duplicate implementation. Prefer the simplest solution that meets the brief.

## Premium quality bar
Premium means intentional, distinctive, coherent, polished, and usable—not merely decorative. Favor strong hierarchy, purposeful whitespace, refined typography, disciplined color, excellent imagery, responsive composition, and restrained interaction. Avoid generic AI-template patterns.

## Completion report
Summarize: design direction, skills actually used, key implementation decisions, routes/components changed, verification performed, known limitations, and next highest-value improvements.
