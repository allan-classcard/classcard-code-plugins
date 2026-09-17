# Classcard Code Plugins (`cc` plugin)

Centralized code-review toolkit for classcard repositories. One source of truth for code-review rules, consumable as a Claude Code plugin (`/cc:code-review`).

## Current Scope (MVP slice)

- One skill/command: `code-review`, plus a free-form "beyond the rules" pass for issues no rule covers
- Layered rules: `common` → `frontend/common` → `frontend/dashboard` / `frontend/ob` (backend: `common` → `backend/common`)
- Known repos (`dashboard`, `ob`) auto-detected from `package.json`'s `name`, or resolvable explicitly via `--repo`; other repos via an explicit `cc.config.yml`
- Claude Code adapter only

**Not yet built**: Cursor/Codex adapters, versioning/pinning tooling, additional skills beyond code-review.

## Installation

This repo is a Claude Code plugin (`.claude-plugin/plugin.json`, name `cc`) hosted at [`allan-classcard/classcard-code-plugins`](https://github.com/allan-classcard/classcard-code-plugins). Installing it registers the repo as a plugin marketplace, then installs the `cc` plugin from it.

### From GitHub (recommended)

In a Claude Code session, run:

```
/plugin marketplace add allan-classcard/classcard-code-plugins
/plugin install cc@classcard-code-plugins
```

### From a local clone (development)

```
/plugin marketplace add /absolute/path/to/classcard-code-plugins
/plugin install cc@classcard-code-plugins
```

Once installed, `/cc:code-review` is available in any project. It still needs a resolved rules file for the *current* repo — see Onboarding below.

### Updating

Claude Code checks the registered marketplace for updates; re-run `/plugin marketplace add` on the same source to refresh it, then reinstall if a newer version doesn't pick up automatically.

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

**Every rule is a required review check.** If the diff violates a rule, or omits a component/pattern a rule requires (e.g. a dialog built without `Modal`, a Storybook component missing `preferredColor`), that absence is flagged as a violation — not treated as a pass just because nothing "wrong" was typed. Beyond the rules, the review also surfaces genuine issues no rule covers, reported separately so they're never confused with a rule violation — see `skills/code-review/SKILL.md`'s "Beyond the Rules" section.

## Onboarding a Repository

**Known repos** (currently `dashboard`, `ob` — see `repos.json`) need no flags at all. Run this from the target repo's root:

```bash
node /path/to/classcard-code-plugins/bin/resolve-rules.js --out .claude/rules/cc/code-review.md
```

With no `--repo`/`--config`, it reads `package.json`'s `name` in the current directory and looks it up in `repos.json` (by key or alias, e.g. `classcard-ob` matches `ob`). To skip auto-detection, name the repo explicitly:

```bash
node /path/to/classcard-code-plugins/bin/resolve-rules.js --repo dashboard --out .claude/rules/cc/code-review.md
```

**Any other repo** needs an explicit `cc.config.yml` at its root:

```yaml
project:
  type: frontend
  name: your-repo-name

rules:
  - common
  - frontend/common
```

See `examples/*.cc.config.yml` for working examples. If a `cc.config.yml` is present, auto-detection falls back to it when the repo isn't in `repos.json`; or point at it explicitly:

```bash
node /path/to/classcard-code-plugins/bin/resolve-rules.js \
  --config ./cc.config.yml \
  --out .claude/rules/cc/code-review.md
```

`--repo` and `--config` are mutually exclusive — pass one, the other, or neither (auto-detect). If auto-detection can't match `package.json`'s name to a known repo and finds no `cc.config.yml`, it errors and tells you to pass one explicitly.

Either way, once `.claude/rules/cc/code-review.md` exists, `/cc:code-review` reads it before reviewing.

## Development

```bash
npm install
npm test
```
