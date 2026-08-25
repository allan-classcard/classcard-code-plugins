# Common Code Review Rules

Org-wide standards. Every layer (frontend, backend) extends this file.

**Every rule below, and every rule in a layer that extends this file, is a required review check.** If a rule requires a specific pattern, component, config value, or convention and the diff simply doesn't use it, that absence is itself a violation — flag it, don't silently pass because nothing "obviously wrong" was written. Cite the layer and rule when flagging (e.g. "frontend/dashboard: uses a custom tooltip instead of `tippy-tooltip`").

## Security (CRITICAL)

- No hardcoded credentials, API keys, tokens, or secrets in source
- No SQL/command injection vectors — all external input parameterized or sanitized
- No path traversal risk from user-controlled file paths
- Dependencies free of known critical vulnerabilities

## Code Quality (HIGH)

- Functions kept under ~50 lines; extract helpers past that
- Files kept under ~800 lines; split by responsibility past that
- Nesting depth under 4 levels
- Errors are caught and propagated, never silently swallowed
- No `console.log`/debug prints left in committed code
- No `TODO`/`FIXME` merged without a linked follow-up

## Best Practices (MEDIUM)

- Prefer immutable data patterns over in-place mutation
- New logic has at least one test covering its primary path
- Public functions/exports document non-obvious behavior, not restate the obvious
