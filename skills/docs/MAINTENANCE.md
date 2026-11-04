# Library Maintenance

## Versioning
Use semantic versions for the library:
- MAJOR: incompatible changes to orchestration or shared conventions.
- MINOR: new skills or substantial backward-compatible capability.
- PATCH: clarifications, fixes, and small improvements.

## Change process
1. Inspect current files and changelog.
2. Create a backup or version-control commit.
3. Explain the proposed change and affected skills.
4. Test triggers and workflow behavior.
5. Validate frontmatter and resource links.
6. Update registry and changelog.
7. Ask for approval before major behavior changes, deletion, renaming, or broad rewrites.

## Registry
See `SKILL-REGISTRY.md` for current skill inventory and intended triggers.

## Improvement loop
Capture real failure cases from projects, identify the responsible skill, create a reproducible test, make the smallest effective change, and compare behavior before/after. Do not change a skill based only on vague preference or a single unverified trend.
