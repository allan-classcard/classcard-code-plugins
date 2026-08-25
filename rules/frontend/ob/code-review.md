# classcard-ob Code Review Rules

Extends `rules/frontend/common/code-review.md` (which extends `rules/common/code-review.md`).

## Additional Rules

- All static/user-facing text goes through language localization (`@nuxtjs/i18n`) — no hardcoded strings
- `nuxt.config.js` must keep `ssr: true` — flag any change that disables or bypasses SSR
- Follow proper TypeScript conventions where TS is used: explicit `types`/`interfaces`, typed function arguments, discriminated unions for variant/state modeling instead of loose optional-field objects
- Storybook components must receive a `preferredColor` prop to support user/customization color preference — flag Storybook component usage that omits it
