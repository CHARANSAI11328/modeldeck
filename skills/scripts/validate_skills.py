#!/usr/bin/env python3
"""Basic structural validator for Antigravity Agent Skills in this package."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
errors = []
checked = 0

for skill_dir in sorted(p for p in ROOT.iterdir() if p.is_dir()):
    skill_file = skill_dir / "SKILL.md"
    if not skill_file.exists():
        continue
    checked += 1
    text = skill_file.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        errors.append(f"{skill_dir.name}: missing YAML frontmatter opening delimiter")
        continue
    parts = text.split("---", 2)
    if len(parts) < 3:
        errors.append(f"{skill_dir.name}: malformed YAML frontmatter delimiters")
        continue
    frontmatter = parts[1]
    name = re.search(r"(?m)^name:\s*([a-z0-9-]+)\s*$", frontmatter)
    description = re.search(r"(?m)^description:\s*(.+)$", frontmatter)
    if not name:
        errors.append(f"{skill_dir.name}: missing/invalid name")
    elif name.group(1) != skill_dir.name:
        errors.append(f"{skill_dir.name}: name does not match folder ({name.group(1)})")
    if not description or len(description.group(1).strip()) < 30:
        errors.append(f"{skill_dir.name}: missing or too-short description")
    if len(parts[2].strip()) < 500:
        errors.append(f"{skill_dir.name}: body appears too short")

print(f"Checked {checked} skill folders.")
if errors:
    print("FAIL")
    for error in errors:
        print(" - " + error)
    sys.exit(1)
print("PASS: basic structure and required frontmatter look valid.")
print("Note: this is a structural check, not a runtime Antigravity invocation test.")
