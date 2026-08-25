# Backend Code Review Rules

Extends `rules/common/code-review.md`.

## Additional Rules

- All external input (request body/query/params) validated at the boundary before use
- No blocking/synchronous I/O in request-handling code paths
- Database migrations are additive/backward-compatible or explicitly flagged as breaking
- Errors returned to clients never leak stack traces, internal paths, or raw DB errors
- Authorization checked on every mutating endpoint, not just authentication
