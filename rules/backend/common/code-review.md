# Backend Code Review Rules

@rules/common/code-review.md

**Flag any rule below — or any rule in the extended file above — that isn't met, including a required pattern/component that's simply absent from the diff.**

## Additional Rules

- All external input (request body/query/params) validated at the boundary before use
- No blocking/synchronous I/O in request-handling code paths
- Database migrations are additive/backward-compatible or explicitly flagged as breaking
- Errors returned to clients never leak stack traces, internal paths, or raw DB errors
- Authorization checked on every mutating endpoint, not just authentication
