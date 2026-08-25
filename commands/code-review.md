---
description: Layered code review using this toolkit's common + frontend/backend rules
argument-hint: [blank for local review]
---

# Code Review

**Input**: $ARGUMENTS

## Steps

1. Check the current repo root for `cc.config.yml`.
   - Missing → tell the user this repo has no `cc.config.yml` yet and stop.
2. Check for a resolved rules file at `.claude/rules/cc/code-review.md`.
   - Missing → run `node bin/resolve-rules.js` (path to this toolkit) to generate it.
3. Use the `code-review` skill to apply the resolved rules to the current diff (`git diff --name-only HEAD`, or the PR/files named in `$ARGUMENTS`).
