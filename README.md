# Classcard Code Plugins (`cc` plugin)

Centralized code-review toolkit for classcard repositories. One source of truth for code-review rules, consumable as a Claude Code plugin (`/cc:code-review`).

## Current Scope (MVP slice)

- One skill/command: `code-review`
- Layered rules: `common` → `frontend/common` → `frontend/dashboard` / `frontend/ob` (backend: `common` → `backend/common`)
- Claude Code adapter only

**Not yet built**: Cursor/Codex adapters, automatic repo-type detection, versioning/pinning tooling, additional skills beyond code-review.

## How Rules Are Layered

```
rules/common/code-review.md
    ↑
rules/frontend/common/code-review.md   (extends common)
    ↑
rules/frontend/dashboard/code-review.md  (extends frontend/common — classcard-dashboard only)
rules/frontend/ob/code-review.md         (extends frontend/common — classcard-ob only)

rules/backend/common/code-review.md    (extends common)
```

`rules/frontend/common/`, `rules/frontend/dashboard/`, and `rules/frontend/ob/` are grounded in classcard's actual Nuxt 2 / Vue 2 stack and repo-specific conventions (`classcard-dashboard`, `classcard-ob`). `rules/backend/common/code-review.md` is currently generic/stack-agnostic — no backend repo has been inspected yet.

**Every rule is a required review check.** If the diff violates a rule, or omits a component/pattern a rule requires (e.g. a dialog built without `Modal`, a Storybook component missing `preferredColor`), that absence is flagged as a violation — not treated as a pass just because nothing "wrong" was typed.

## Onboarding a Repository

1. Add `cc.config.yml` to the target repo's root:

```yaml
project:
  type: frontend
  name: your-repo-name

rules:
  - common
  - frontend/common
```

See `examples/*.cc.config.yml` for working examples, including the real `dashboard.cc.config.yml` and `ob.cc.config.yml`.

2. Resolve the layered rules into that repo's `.claude/rules/cc/code-review.md`:

```bash
node /path/to/classcard-code-plugins/bin/resolve-rules.js \
  --config ./cc.config.yml \
  --out .claude/rules/cc/code-review.md
```

3. Install this repo as a Claude Code plugin. `/cc:code-review` will then read the resolved rules before reviewing.

## Development

```bash
npm install
npm test
```
