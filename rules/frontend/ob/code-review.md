# classcard-ob Code Review Rules

@rules/frontend/common/code-review.md

**Flag any rule below — or any rule in the extended file above — that isn't met, including a required pattern/component that's simply absent from the diff.**

## Additional Rules

- All static/user-facing text goes through language localization (`@nuxtjs/i18n`) — no hardcoded strings
- `nuxt.config.js` must keep `ssr: true` — flag any change that disables or bypasses SSR
- Follow proper TypeScript conventions where TS is used: explicit `types`/`interfaces`, typed function arguments, discriminated unions for variant/state modeling instead of loose optional-field objects
- Storybook components must receive a `preferredColor` prop to support user/customization color preference — flag Storybook component usage that omits it
