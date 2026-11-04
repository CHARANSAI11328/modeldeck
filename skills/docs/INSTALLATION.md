# Installation Guide

## Native locations
Antigravity supports:
- Global skills: `%USERPROFILE%\.gemini\config\skills\<skill-folder>\SKILL.md`
- Workspace skills: `<workspace-root>\.agents\skills\<skill-folder>\SKILL.md`

The archive itself is deliberately portable and named `skills/`; it is not automatically an active Antigravity directory until installed.

## Windows global installation
Run `Install-Skills.ps1` and select Global. It copies each skill folder into your user-level skills directory.

## Workspace installation
Open the target project folder in Antigravity, then run the installer from the extracted package and select Workspace. Alternatively, copy the skill folders into `<project-root>\.agents\skills\`.

## Verify
1. Check that each installed skill has `SKILL.md` directly inside its own folder.
2. Open Antigravity's Customizations/Skills view and confirm the skills appear.
3. Start a new conversation or refresh/restart if newly installed skills are not listed.
4. Try a manual invocation such as `/creative-director`.
5. Ask for a short design task and confirm that the relevant skills are discovered and followed.

## Existing skill conflicts
The installer does not overwrite same-named folders. If a conflict is reported:
- Back up the existing skill.
- Compare its instructions with the packaged version.
- Merge intentionally, or rename one of the skills.
- Do not blindly overwrite a skill that may contain custom work.

## Uninstall
Remove only the skill folders installed from this package. Do not delete the entire global skills directory because it may contain unrelated skills.
