---
name: code-review
description: Layered engineering code review — resolves common + frontend/backend rules for the current repo before reviewing changes
---

# Code Review

Applies this toolkit's layered rules (common + frontend-or-backend) to a code review, rather than a generic ad hoc checklist.

## Before Reviewing

1. Look for a resolved rules file at `.claude/rules/cc/code-review.md` in the current repo.
2. If missing but `cc.config.yml` exists at repo root, run `node bin/resolve-rules.js` (from this toolkit) to generate it.
3. If neither exists, tell the user no `cc.config.yml` was found and stop — do not guess which rule layers apply.

## Reviewing

Read the resolved rules file in full, then review the diff against every rule it contains — not a generic checklist. Each `<!-- layer: NAME -->` marker in the resolved file shows which layer a rule came from; cite the layer when reporting a violation (e.g. "frontend/common: ...").

A rule can be violated two ways: the diff does something the rule forbids, or the diff omits something the rule requires (a component, a config value, a pattern). Both count as violations — flag a rule's required pattern being absent from the diff exactly like you'd flag code that actively breaks the rule.
