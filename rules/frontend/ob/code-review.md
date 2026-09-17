# classcard-ob Code Review Rules

@rules/frontend/common/code-review.md

**Flag any rule below — or any rule in the extended file above — that isn't met, including a required pattern/component that's simply absent from the diff.**

## Additional Rules

- All static/user-facing text goes through language localization (`@nuxtjs/i18n`) — no hardcoded strings
- `nuxt.config.js` must keep `ssr: true` — flag any change that disables or bypasses SSR
- Follow proper TypeScript conventions where TS is used: explicit `types`/`interfaces`, typed function arguments, discriminated unions for variant/state modeling instead of loose optional-field objects
- Storybook components must receive a `preferredColor` prop to support user/customization color preference — flag Storybook component usage that omits it

## SSR Safety (dependencies & imports)

`ssr: true` (above) is only safe if what gets imported is actually safe to run on the server. Check every new/changed dependency and import for SSR compatibility:

- Flag any reference to `window`, `document`, `navigator`, `localStorage`, `sessionStorage`, or other browser-only globals used at module scope, in `data()`, `created()`, `asyncData()`, `fetch()`, or a plugin without a `mode: 'client'` — these run on the server and will crash SSR. Browser-only access belongs in `mounted()`/`beforeMount()` or behind an explicit `if (process.client)` guard.
- Flag a new npm dependency that assumes a browser environment (reads `window`/`document` at import time, e.g. many DOM-measurement, canvas, or "vanilla JS widget" packages) unless it's loaded client-only — via a Nuxt plugin with `mode: 'client'`, a dynamic `import()` behind `process.client`, or wrapped in `<client-only>` in the template.
- Flag a new Nuxt module/plugin entry in `nuxt.config.js` that doesn't declare `mode: 'client'` when the module is browser-only.
- If a new dependency's SSR-safety isn't obvious from its usage in the diff, flag it explicitly for manual verification rather than assuming it's safe — don't let an untested import silently reach production and crash SSR.
- Prefer checking for an existing SSR-safe alternative already used elsewhere in the codebase before adding a new browser-only dependency.
