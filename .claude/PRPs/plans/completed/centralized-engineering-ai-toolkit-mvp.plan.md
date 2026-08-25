# Plan: Centralized Engineering AI Toolkit — MVP Slice (cc:code-review only)

## Summary
Build the first slice of the centralized `engineering-ai` toolkit in this repo: a real Claude Code plugin exposing one `cc:code-review` skill/command, backed by a layered rules system (common → frontend/backend → resolved) and a small Node CLI that resolves a target repo's config into a concatenated rule file. Cursor/Codex adapters, per-repository rule overrides, storybook rules, and versioning tooling are explicitly deferred.

## User Story
As an engineer working in any classcard repository (frontend or backend),
I want to run one `/cc:code-review` command that automatically applies common + frontend-or-backend engineering rules,
so that review standards stay consistent without copy-pasting rule files into every repo.

## Problem → Solution
Today: AI review rules would need to be duplicated per repo, or hand-copied, with no shared source of truth (PRD §2).
After this slice: one `engineering-ai` repo defines common + frontend + backend rules once; a target repo declares a tiny config file (`engineering-ai.config.yml`) naming which layers apply; `bin/resolve-rules.js` concatenates the right layers into `.claude/rules/engineering-ai/code-review.md` for the Claude Code plugin's `/cc:code-review` skill/command to use.

## Metadata
- **Complexity**: Medium (self-contained new repo, no external system integration, ~14 files)
- **Source PRD**: `centralized-engineering-ai-plugin-platform-prd.md`
- **PRD Phase**: N/A (PRD has no "Implementation Phases" section — treated as reference doc; scope narrowed from §11 MVP to "code review first" per PRD line 372, confirmed with user)
- **Estimated Files**: 14 create, 0 update (empty repo)

---

## UX Design

### Before
```
┌──────────────────────────────────────────----───┐
│ Engineer in classcard-staff-app runs a       │
│ generic /cc:code-review with no shared rules —  │
│ or copy-pastes rule text from another repo.  │
└─────────────────────────────────────────────┘
```

### After
```
┌─────────────────────────────────────────────┐
│ Repo has engineering-ai.config.yml:          │
│   type: frontend                             │
│   rules: [common, frontend/common]           │
│                                               │
│ `node bin/resolve-rules.js` (from toolkit,    │
│ or via installed plugin path) concatenates    │
│ common + frontend rules → one review-rules    │
│ file. /cc:code-review command in this plugin     │
│ loads it before reviewing.                    │
└─────────────────────────────────────────────┘
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Rule authoring | Per-repo, duplicated | One `rules/common/`, `rules/frontend/common/`, `rules/backend/common/` in this repo | PRD §5, §8.2 |
| Repo config | None | `engineering-ai.config.yml` declares `type` + `rules` list | PRD §12, verbatim shape |
| Review invocation | Ad hoc | `/cc:code-review` command (this plugin) reads resolved rules | PRD §7, §9 |

---

## Mandatory Reading

All reference files below live in the already-installed `ecc` plugin marketplace on this machine (`~/.claude/plugins/marketplaces/ecc/`) — read-only references for pattern-mirroring. Do **not** modify them; the new code goes in this repo's root.

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `~/.claude/plugins/marketplaces/ecc/.claude-plugin/plugin.json` | 1-22 | Exact shape of a working `plugin.json` manifest (name, version, description, `skills: ["./skills/"]`, `commands: ["./commands/"]`) |
| P0 | `~/.claude/plugins/marketplaces/ecc/commands/code-review.md` | 1-20 | Command file frontmatter shape: `description`, `argument-hint`, `$ARGUMENTS` usage |
| P0 | `~/.claude/plugins/cache/claude-plugins-official/superpowers/6.2.0/skills/requesting-code-review/SKILL.md` | 1-10 | SKILL.md frontmatter shape: `name`, `description` only (no extra keys needed for a plain skill) |
| P1 | `~/.claude/plugins/marketplaces/ecc/.claude/rules/node.md` | 1-15 | The exact "extends common rules" convention line and rule-file structure to mirror in `rules/frontend/common/` and `rules/backend/common/` |
| P1 | `~/.claude/plugins/marketplaces/ecc/scripts/lib/install-targets/claude-project.js` | 1-47 | CommonJS module style (`'use strict'` implied by no ESM, `path.join`, small pure functions) and the "namespace rules/skills under a subfolder" idea — informs `lib/rule-resolver.js` structure, NOT to be copied wholesale (that file is a full install-target adapter, out of scope here) |
| P2 | `~/.claude/plugins/marketplaces/ecc/tests/plugin-manifest.test.js` | 1-35 | Test file convention: `'use strict'`, `const assert = require('assert')`, plain functions, resolved paths via `path.resolve(__dirname, '..')` |
| P2 | `~/.claude/plugins/marketplaces/ecc/.claude/rules/node.md` | 15-40 | Stack conventions to reuse for this new repo: CommonJS only, no TypeScript, `const` over `let`, lowercase-hyphen filenames |

## External Documentation

No external research needed — feature uses only Node.js built-ins (`fs`, `path`, `assert`) plus one small, well-known dependency (`js-yaml`) for parsing the PRD's YAML config example (PRD §12). No API integration, no framework.

KEY_INSIGHT: Node has no built-in YAML parser; `js-yaml` is the de facto standard, zero-transitive-dependency-risk choice.
APPLIES_TO: `lib/rule-resolver.js` config parsing (Task 5).
GOTCHA: Keep it as the *only* runtime dependency — do not add a config/build framework for a 14-file repo.

---

## Patterns to Mirror

### PLUGIN_MANIFEST
// SOURCE: ~/.claude/plugins/marketplaces/ecc/.claude-plugin/plugin.json:1-22
```json
{
  "name": "ecc",
  "version": "2.0.0-rc.1",
  "description": "...",
  "author": { "name": "...", "url": "..." },
  "license": "MIT",
  "keywords": ["claude-code", "agents", "skills", "..."],
  "skills": ["./skills/"],
  "commands": ["./commands/"]
}
```

### COMMAND_FRONTMATTER
// SOURCE: ~/.claude/plugins/marketplaces/ecc/commands/code-review.md:1-11
```markdown
---
description: Code review — local uncommitted changes or GitHub PR (pass PR number/URL for PR mode)
argument-hint: [pr-number | pr-url | blank for local review]
---

# Code Review

**Input**: $ARGUMENTS
```

### SKILL_FRONTMATTER
// SOURCE: ~/.claude/plugins/cache/claude-plugins-official/superpowers/6.2.0/skills/requesting-code-review/SKILL.md:1-4
```markdown
---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements
---
```

### RULE_LAYERING_CONVENTION
// SOURCE: ~/.claude/plugins/marketplaces/ecc/.claude/rules/node.md:1-9
```markdown
# Node.js Rules for everything-claude-code

## Prompt Defense Baseline
...

> Project-specific rules for the ECC codebase. Extends common rules.

## Stack
...
```
Mirror the `> ... Extends common rules.` line verbatim (adapted per layer) at the top of every non-common rule file, so a reader knows this file layers onto another.

### CJS_MODULE_STYLE
// SOURCE: ~/.claude/plugins/marketplaces/ecc/scripts/lib/install-targets/claude-project.js:1-11
```javascript
'use strict';

const path = require('path');

function getClaudeManagedDestinationPath(adapter, sourceRelativePath, input) {
  // small, pure, single-purpose functions
}

module.exports = { /* ... */ };
```

### TEST_STRUCTURE
// SOURCE: ~/.claude/plugins/marketplaces/ecc/tests/plugin-manifest.test.js:1-24
```javascript
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const somePath = path.join(repoRoot, 'some-file.json');

// test functions run sequentially from tests/run-all.js, not a framework
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `.claude-plugin/plugin.json` | CREATE | Plugin manifest — makes this repo installable as a Claude Code plugin (PRD §8.4, §9) |
| `README.md` | CREATE | Repo entry point: what this is, how a repo onboards (PRD §13 "onboarded by adding a rule configuration") |
| `CLAUDE.md` | CREATE | Points Claude Code at `rules/` and explains the layering model, mirrors ecc's own `CLAUDE.md` role |
| `skills/code-review/SKILL.md` | CREATE | The one MVP skill (PRD §11, §8.1) |
| `commands/code-review.md` | CREATE | `/cc:code-review` entry point that resolves + applies layered rules, then reviews (PRD §7, §9) |
| `rules/common/code-review.md` | CREATE | Org-wide review standards, layer 1 (PRD §5, §8.2) |
| `rules/frontend/common/code-review.md` | CREATE | Frontend-specific additions, layer 2a (PRD §5) |
| `rules/backend/common/code-review.md` | CREATE | Backend-specific additions, layer 2b (PRD §5) |
| `lib/rule-resolver.js` | CREATE | Core logic: read config, resolve layer list → concatenated markdown (PRD §8.3, §12) |
| `bin/resolve-rules.js` | CREATE | Thin CLI wrapper around `lib/rule-resolver.js` |
| `examples/frontend.engineering-ai.config.yml` | CREATE | Worked example matching PRD §12 exactly (type: frontend) |
| `examples/backend.engineering-ai.config.yml` | CREATE | Worked example matching PRD §12 exactly (type: backend) |
| `tests/rule-resolver.test.js` | CREATE | Unit tests for `lib/rule-resolver.js` |
| `tests/run-all.js` | CREATE | Test aggregator, mirrors ecc's own `tests/run-all.js` entry point |
| `package.json` | CREATE | `name`, `version`, `js-yaml` dependency, `scripts.test` |
| `.gitignore` | CREATE | `node_modules/`, standard Node ignores |

## NOT Building
- Cursor adapter, Codex adapter (PRD §8.4) — deferred to a follow-up plan
- Per-repository rule directories (`rules/frontend/repository-a/`, etc.) and storybook rules (PRD §6) — deferred
- Automatic repository-*type* detection/inference — MVP requires the target repo's config file to explicitly declare `type`; no magic sniffing of package.json/framework
- Versioning/pinning tooling (`engineering-ai@v1` mechanism, PRD §8.5) — `package.json` version field exists but no publish/pin workflow yet
- Any additional skills beyond `/cc:code-review` (testing, security, debugging, refactoring — PRD §8.1) — future slices
- GitHub PR bot integration (PRD §15) — future
- Git repo init / commit — this plan only creates files; committing is a separate explicit user action per your global git-safety instructions

---

## Step-by-Step Tasks

### Task 1: Scaffold package.json and .gitignore
- **ACTION**: Create `package.json` and `.gitignore` at repo root.
- **IMPLEMENT**: `package.json` with `"name": "engineering-ai"`, `"version": "0.1.0"`, `"private": true`, `"license": "MIT"`, `"dependencies": {"js-yaml": "^4.1.0"}`, `"scripts": {"test": "node tests/run-all.js"}`.
- **MIRROR**: N/A (new file, no direct source pattern beyond standard npm shape)
- **IMPORTS**: N/A
- **GOTCHA**: Do not add TypeScript, build step, or bundler — plain CommonJS per `rules/node.md:15-40` convention captured above.
- **VALIDATE**: `node -e "JSON.parse(require('fs').readFileSync('package.json'))"` exits 0.

### Task 2: Write plugin.json
- **ACTION**: Create `.claude-plugin/plugin.json`.
- **IMPLEMENT**: Mirror PLUGIN_MANIFEST pattern with `name: "engineering-ai"`, `version: "0.1.0"`, `description: "Centralized engineering AI toolkit — shared skills and layered rules for Claude Code across classcard repositories"`, `skills: ["./skills/"]`, `commands: ["./commands/"]`. Omit `mcpServers` (none needed).
- **MIRROR**: PLUGIN_MANIFEST section above.
- **IMPORTS**: N/A
- **GOTCHA**: Path must be `.claude-plugin/plugin.json` (dot-prefixed dir), not `.claude/plugin.json` — Claude Code's plugin loader looks for the dot-prefixed dir at repo root.
- **VALIDATE**: `node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json'))"` exits 0.

### Task 3: Write common + frontend + backend rule files
- **ACTION**: Create `rules/common/code-review.md`, `rules/frontend/common/code-review.md`, `rules/backend/common/code-review.md`.
- **IMPLEMENT**: `rules/common/code-review.md` holds org-wide standards (e.g. no hardcoded secrets, no console.log left in, functions reviewed for size/complexity — reuse categories already visible in the ecc `code-review.md` command's checklist, Security/Quality/Best-Practices tiers, but written as *rules* not *process steps*). `rules/frontend/common/code-review.md` and `rules/backend/common/code-review.md` each open with a "Extends `rules/common/code-review.md`." line and add 3-5 stack-agnostic-but-tier-specific bullets (frontend: accessibility, component prop typing, no inline styles-as-strings; backend: input validation at boundaries, no blocking calls in request handlers, migration safety).
- **MIRROR**: RULE_LAYERING_CONVENTION section above.
- **IMPORTS**: N/A
- **GOTCHA**: Keep these generic/stack-agnostic — no repository-specific content (that's explicitly out of scope per NOT Building).
- **VALIDATE**: Manual read — each frontend/backend file's first non-heading line names the file it extends.

### Task 4: Write SKILL.md and command file
- **ACTION**: Create `skills/code-review/SKILL.md` and `commands/code-review.md`.
- **IMPLEMENT**: `SKILL.md` frontmatter: `name: code-review`, `description: "Layered engineering code review — resolves common + frontend/backend rules for the current repo before reviewing changes"`. Body: explain it expects a resolved rules file at `.claude/rules/engineering-ai/code-review.md` (produced by Task 6's CLI) and to read it before applying the review checklist. `commands/code-review.md` frontmatter: `description` + `argument-hint: [blank for local review]`; body invokes the skill and, if no resolved rules file exists yet, tells the user to run `node bin/resolve-rules.js` first (or run it automatically via Bash if `engineering-ai.config.yml` is present in the repo).
- **MIRROR**: SKILL_FRONTMATTER and COMMAND_FRONTMATTER sections above.
- **IMPORTS**: N/A
- **GOTCHA**: Don't duplicate the full review checklist logic from the `ecc` code-review command — this skill's job is *rule resolution + applying resolved rules*, not reinventing a generic reviewer. Keep it thin.
- **VALIDATE**: Manual read — frontmatter parses as valid YAML (no tabs, correct `---` fencing).

### Task 5: Implement lib/rule-resolver.js
- **ACTION**: Create `lib/rule-resolver.js`.
- **IMPLEMENT**: `module.exports = { resolveConfig, buildRuleDocument }`.
  - `resolveConfig(configPath)`: read file with `fs.readFileSync`, parse with `js-yaml`'s `yaml.load`, validate it has `project.type` (string) and `rules` (array of strings), throw `new Error(...)` with a clear message if either is missing.
  - `buildRuleDocument(repoRoot, ruleList)`: for each entry in `ruleList` (e.g. `"common"`, `"frontend/common"`), resolve to `path.join(repoRoot, 'rules', entry + '.md')` (entries map to `rules/<entry>/code-review.md` — decide and document the exact mapping: use `path.join(repoRoot, 'rules', entry, 'code-review.md')`), read each file, concatenate with a `\n\n---\n\n` separator and a `<!-- layer: {entry} -->` marker comment above each section, return the combined string.
- **MIRROR**: CJS_MODULE_STYLE section above — small pure functions, `'use strict'`, `path.join`.
- **IMPORTS**: `const fs = require('fs'); const path = require('path'); const yaml = require('js-yaml');`
- **GOTCHA**: Fail loudly (throw) on a missing rule file — do not silently skip a layer, since that would silently weaken review coverage.
- **VALIDATE**: `node -e "require('./lib/rule-resolver.js')"` exits 0 (loads without syntax errors).

### Task 6: Implement bin/resolve-rules.js CLI
- **ACTION**: Create `bin/resolve-rules.js`.
- **IMPLEMENT**: `#!/usr/bin/env node` shebang, `'use strict'`. Parse `process.argv` for `--config <path>` (default `./engineering-ai.config.yml` relative to `process.cwd()`) and `--out <path>` (default `.claude/rules/engineering-ai/code-review.md` relative to `process.cwd()`). Call `resolveConfig` then `buildRuleDocument`, `fs.mkdirSync(path.dirname(outPath), { recursive: true })`, write the result with `fs.writeFileSync`. Print the written path to stdout on success; on thrown error, print `error.message` to stderr and `process.exit(1)`.
- **MIRROR**: CJS_MODULE_STYLE section above.
- **IMPORTS**: `const path = require('path'); const fs = require('fs'); const { resolveConfig, buildRuleDocument } = require('../lib/rule-resolver');`
- **GOTCHA**: Resolve `repoRoot` for `buildRuleDocument` as *this toolkit's* root (`path.resolve(__dirname, '..')`), not the target repo's cwd — the rule *source files* always live in this repo; only the *config* and *output* paths are relative to the target repo.
- **VALIDATE**: `chmod +x bin/resolve-rules.js` then run against Task 7's example config (see Task 7 VALIDATE).

### Task 7: Write example configs
- **ACTION**: Create `examples/frontend.engineering-ai.config.yml` and `examples/backend.engineering-ai.config.yml`.
- **IMPLEMENT**: Exact shape from PRD §12:
```yaml
project:
  type: frontend
  name: example-frontend-repo

rules:
  - common
  - frontend/common
```
and the backend equivalent with `type: backend`, `rules: [common, backend/common]`.
- **MIRROR**: PRD §12 literal example (already codebase-external, this is the spec source, not a code pattern — cite PRD directly).
- **IMPORTS**: N/A
- **GOTCHA**: `rules` entries must exactly match the directory-mapping decided in Task 5 (`common` → `rules/common/code-review.md`, `frontend/common` → `rules/frontend/common/code-review.md`).
- **VALIDATE**: `node bin/resolve-rules.js --config examples/frontend.engineering-ai.config.yml --out /tmp/resolved-frontend.md && cat /tmp/resolved-frontend.md` shows both layers concatenated with the `<!-- layer: -->` markers.

### Task 8: Write tests
- **ACTION**: Create `tests/rule-resolver.test.js` and `tests/run-all.js`.
- **IMPLEMENT**: `rule-resolver.test.js` following TEST_STRUCTURE: `'use strict'`, `require('assert')`, tests as plain functions collected into an array or run top-to-bottom, covering: (1) `resolveConfig` on `examples/frontend.engineering-ai.config.yml` returns `{ project: { type: 'frontend', ... }, rules: ['common', 'frontend/common'] }`; (2) `resolveConfig` throws on a config missing `rules`; (3) `buildRuleDocument` output contains both layer markers in the correct order; (4) `buildRuleDocument` throws when a listed rule file doesn't exist on disk. `tests/run-all.js` requires and invokes each `*.test.js` file's exported run function (or simply `require`s them if they self-execute on load, matching ecc's pattern of self-executing top-level `assert` calls), reporting pass/fail count, exiting non-zero on any failure.
- **MIRROR**: TEST_STRUCTURE section above.
- **IMPORTS**: `const assert = require('assert'); const path = require('path'); const { resolveConfig, buildRuleDocument } = require('../lib/rule-resolver');`
- **GOTCHA**: Use a temp missing-file path (e.g. `path.join(__dirname, 'fixtures', 'does-not-exist.yml')`) for the negative test — don't rely on deleting a real file mid-test-run.
- **VALIDATE**: `npm test` (i.e. `node tests/run-all.js`) exits 0 with all 4+ assertions passing.

### Task 9: Write README.md and CLAUDE.md
- **ACTION**: Create `README.md` and `CLAUDE.md`.
- **IMPLEMENT**: `README.md` explains: what this repo is (PRD §1, §3), how a consuming repo onboards (drop an `engineering-ai.config.yml`, run `resolve-rules.js`, install this repo as a Claude Code plugin), current scope (code-review only) and explicit non-goals (link back to NOT Building list). `CLAUDE.md` is short — points at `rules/` for the layering model and `skills/code-review/SKILL.md` for the skill, mirrors ecc's own `CLAUDE.md` structural role (a map, not a rulebook).
- **MIRROR**: Structural role of `~/.claude/plugins/marketplaces/ecc/CLAUDE.md` (a short pointer/map file) — do not copy its content, it's ecc-specific.
- **IMPORTS**: N/A
- **GOTCHA**: Don't let README scope creep into documenting Cursor/Codex/versioning as if they exist — mark them "planned, not yet built."
- **VALIDATE**: Manual read-through against Acceptance Criteria below.

---

## Testing Strategy

### Unit Tests

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| resolveConfig valid | `examples/frontend.engineering-ai.config.yml` | Parsed object with `project.type === 'frontend'` and `rules` array | No |
| resolveConfig missing rules key | Fixture YAML with only `project:` | Throws Error | Yes |
| buildRuleDocument two layers | `['common', 'frontend/common']` | String containing both `<!-- layer: common -->` and `<!-- layer: frontend/common -->` in order | No |
| buildRuleDocument missing file | `['common', 'nonexistent/layer']` | Throws Error naming the missing file path | Yes (missing rule file) |

### Edge Cases Checklist
- [x] Empty input — covered by "missing rules key" test
- [ ] Maximum size input — N/A, rule files are small hand-authored markdown
- [x] Invalid types — config validation rejects non-array `rules`
- [ ] Concurrent access — N/A, single-shot CLI, no shared mutable state
- [ ] Network failure — N/A, no network calls
- [x] Permission denied — CLI's thrown-error-then-exit(1) path covers unreadable file paths generically (same code path as missing file)

---

## Validation Commands

### Static Analysis
```bash
node -e "JSON.parse(require('fs').readFileSync('package.json'))"
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json'))"
node -e "require('./lib/rule-resolver.js')"
node -e "require('./bin/resolve-rules.js')" 2>&1 | grep -v "Error: ENOENT" # confirms it loads; ENOENT expected with no config in repo root
```
EXPECT: Zero syntax/parse errors (the ENOENT grep line is expected noise from running the CLI with no default config present, not a failure)

### Unit Tests
```bash
npm install
npm test
```
EXPECT: All tests in `tests/run-all.js` pass, exit code 0

### Full Test Suite
Same as above — this is the entire test suite for this slice.

### Manual Validation
- [ ] `node bin/resolve-rules.js --config examples/frontend.engineering-ai.config.yml --out /tmp/frontend-resolved.md` succeeds, output file has 2 layer sections
- [ ] `node bin/resolve-rules.js --config examples/backend.engineering-ai.config.yml --out /tmp/backend-resolved.md` succeeds, output file has 2 layer sections
- [ ] `node bin/resolve-rules.js --config examples/does-not-exist.yml` exits 1 with a clear error message on stderr
- [ ] `.claude-plugin/plugin.json` + `skills/code-review/SKILL.md` + `commands/code-review.md` are structurally valid enough that, if this repo were added as a Claude Code plugin marketplace/local path, `/cc:code-review` would appear as an available command (verify by eye against the Mandatory Reading examples — no live plugin-install test required for this slice)

---

## Acceptance Criteria
- [ ] All 9 tasks completed
- [ ] All validation commands pass
- [ ] 4+ unit tests written and passing
- [ ] No JSON/YAML parse errors in any manifest or config file
- [ ] `rules/frontend/common/code-review.md` and `rules/backend/common/code-review.md` each declare they extend `rules/common/code-review.md`
- [ ] `bin/resolve-rules.js` produces a correctly-ordered, correctly-concatenated rule document for both example configs
- [ ] README explicitly lists current scope and defers Cursor/Codex/versioning/per-repo rules

## Completion Checklist
- [ ] Code follows discovered patterns (plugin.json shape, SKILL.md/command frontmatter, CJS module style, test structure)
- [ ] Error handling: `lib/rule-resolver.js` throws with clear messages, `bin/resolve-rules.js` catches and exits 1
- [ ] No hardcoded absolute paths (all paths relative via `path.join`/`__dirname`/`process.cwd()`)
- [ ] Tests follow the ecc test-file convention (`'use strict'`, `require('assert')`, `tests/run-all.js` aggregator)
- [ ] No unnecessary scope additions — Cursor/Codex adapters, repo-specific rules, versioning tooling untouched
- [ ] Self-contained — no questions needed during implementation (all mappings/decisions fixed in this plan)

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `js-yaml` dependency drift/version issues | Low | Low | Pin `^4.1.0`, single dependency, no transitive surface of concern |
| Rule-entry-to-filepath mapping (`"frontend/common"` → `rules/frontend/common/code-review.md`) feels implicit/magic | Medium | Low | Documented explicitly in Task 5/7 GOTCHA and in README; could be made explicit-per-entry in a future slice if it causes confusion |
| Command file (`commands/code-review.md`) auto-running `bin/resolve-rules.js` via Bash could surprise a user mid-review if they don't have a config file | Low | Low | Command instructs the model to check for `engineering-ai.config.yml` first and tell the user if it's missing, rather than silently doing nothing |

## Notes
- Real target repos exist on this machine's `~/.claude/projects/` history (classcard-storybook, classcard-staff-app, classcard-dashboard-classcard, classcard-ob, classcard-student-app) but per-repo rule directories are explicitly out of scope for this slice — `examples/*.config.yml` intentionally use generic names so this plan doesn't couple to repo-specific decisions that weren't part of the confirmed scope.
- Follow-up plans (not part of this one): Task "Cursor + Codex adapters", Task "Per-repo rule directories for the 5 classcard-* repos", Task "Versioning/pinning mechanism", Task "Additional skills (testing, security, debugging, refactoring)".
