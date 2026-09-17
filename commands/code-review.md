---
description: Layered code review using this toolkit's common + frontend/backend rules
argument-hint: [blank for local review]
---

# Code Review

**Input**: $ARGUMENTS

## Steps

1. Check for a resolved rules file at `.claude/rules/cc/code-review.md`.
   - Missing → run `node bin/resolve-rules.js --out .claude/rules/cc/code-review.md` (path to this toolkit) to generate it — it auto-detects the repo, or falls back to `cc.config.yml`.
   - Errors (no `repos.json` match, no `cc.config.yml`) → relay the error to the user and stop.
2. Use the `code-review` skill to apply the resolved rules to the current diff (`git diff --name-only HEAD`, or the PR/files named in `$ARGUMENTS`), then add any additional observations beyond the rules per the skill's "Beyond the Rules" section.
