# Creative Intelligence Skills Library

A reusable premium design and creative-engineering skill library for Google Antigravity.

## What's included
- 12 focused design skills.
- `skill-architect`: creates, validates, tests, versions, and improves skills.
- `creative-orchestrator`: coordinates relevant specialists across a project.
- Research, benchmark, installation, and maintenance documentation.
- A Windows PowerShell installer and a portable validation script.

## Compatibility
Skills use the native Agent Skills folder format: one folder per skill with a `SKILL.md` file at its root and YAML frontmatter containing `name` and `description`.

Official Antigravity skill locations:
- Global: `%USERPROFILE%\.gemini\config\skills\<skill-name>\SKILL.md`
- Workspace: `<project-root>\.agents\skills\<skill-name>\SKILL.md`

## Install on Windows
1. Extract the ZIP.
2. Open the extracted `skills` folder.
3. Right-click `Install-Skills.ps1` and choose **Run with PowerShell**, or open PowerShell in this folder and run:
   `.\Install-Skills.ps1`
4. Choose global installation for all workspaces, workspace installation for one project, or both.
5. Restart Antigravity or refresh its skill/customizations view if needed.
6. Test manual invocation using `/creative-orchestrator`, `/creative-director`, or `/skill-architect`.

The installer copies skill folders only. It does not modify existing skills with the same names. It skips conflicts and reports them. Review and merge any conflicts manually.

## Use in projects
- For a new website or major redesign, ask Antigravity to use the Creative Orchestrator and relevant specialist skills.
- For a focused task, invoke the relevant skill directly (for example `/motion-interaction`).
- Workspace-specific skills can extend or override global guidance for a particular project. Keep project brand rules in the project repository.

## Important limits
- Skills are instruction packages, not independent background agents.
- Automatic activation depends on Antigravity's skill discovery and relevance matching.
- Continuous research means research during relevant tasks or scheduled/explicit research sessions; it does not mean the skills monitor the web continuously in the background.
- Browser inspection, screenshot capture, accessibility audits, and performance tests require the corresponding tools to be available and actually run.
- No skill can guarantee an award-winning result. Use the benchmark process to evaluate real outputs.

## Package layout
- `skill-architect/` — meta-skill for skill engineering.
- `creative-orchestrator/` — coordinator.
- 12 specialist skill folders.
- `docs/` — installation, research, benchmark and maintenance guidance.
- `benchmark-lab/` — project briefs and scoring resources.
- `scripts/` — installer and validator.

## License and usage
These are original instruction files prepared for this library. Third-party tools, fonts, frameworks, assets, and reference sites retain their own licenses and terms. Verify current documentation and licensing before adopting any dependency or asset.
