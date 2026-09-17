---
name: code-review
description: Layered engineering code review — resolves common + frontend/backend rules for the current repo before reviewing changes
---

# Code Review

Applies this toolkit's layered rules (common + frontend-or-backend) to a code review, rather than a generic ad hoc checklist.

## Before Reviewing

1. Look for a resolved rules file at `.claude/rules/cc/code-review.md` in the current repo.
2. If missing, run `node bin/resolve-rules.js --out .claude/rules/cc/code-review.md` (from this toolkit) with no other flags — it auto-detects the repo from `package.json`'s `name` against `repos.json`, falling back to `cc.config.yml` if present. Pass `--repo <name>` to name it explicitly instead.
3. If that command errors (no registry match and no `cc.config.yml`), relay its error to the user and stop — do not guess which rule layers apply.

## Reviewing

Read the resolved rules file in full, then review the diff against every rule it contains — not a generic checklist. Each `<!-- layer: NAME -->` marker in the resolved file shows which layer a rule came from; cite the layer when reporting a violation (e.g. "frontend/common: ...").

A rule can be violated two ways: the diff does something the rule forbids, or the diff omits something the rule requires (a component, a config value, a pattern). Both count as violations — flag a rule's required pattern being absent from the diff exactly like you'd flag code that actively breaks the rule.

## Beyond the Rules

The resolved rules file is not the entire review. After going through it rule-by-rule, separately look at the diff for anything genuinely wrong or worth raising that no rule covers — a real bug, an edge case, a naming/logic issue specific to this change, anything a competent reviewer would flag on its own merits.

- Report these under a clearly separate heading, e.g. **Additional observations (not rule-based)** — never blend them into the rule-violation list.
- Don't restate or rephrase something already reported as a rule violation here — if a rule already covers it, it belongs in the rule-violation section once, not both.
- If nothing beyond the rules stands out, say so briefly rather than inventing filler comments — this section exists for genuine findings, not to pad the review.
