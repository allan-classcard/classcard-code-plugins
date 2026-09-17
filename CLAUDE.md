# CLAUDE.md

This repo is **Classcard Code Plugins**, the `cc` Claude Code plugin — see `README.md` for scope and onboarding.

- **rules/** — layered code-review rules. `common/` extends nothing; `frontend/common/` and `backend/common/` extend `common/`; `frontend/dashboard/` and `frontend/ob/` extend `frontend/common/`.
- **skills/code-review/SKILL.md** — the review skill; expects a resolved rules file at `.claude/rules/cc/code-review.md` in the target repo. Every rule is a required check — flag a rule's required pattern/component if it's absent from the diff, not just literal wrong code.
- **commands/code-review.md** — `/cc:code-review` entry point.
- **lib/rule-resolver.js**, **bin/resolve-rules.js** — the layer-resolution CLI; see README's Onboarding section.

Don't add content to `rules/` that isn't stack-verified — `rules/frontend/**` was written against real `classcard-dashboard`/`classcard-ob` code, not assumptions.
