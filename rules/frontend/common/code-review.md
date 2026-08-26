# Frontend Code Review Rules

@rules/common/code-review.md

Grounded in classcard's actual frontend stack (verified against `classcard-dashboard` and `classcard-ob`, both Nuxt 2 / Vue 2 SPA/SSR apps).

**Flag any rule below — or any rule in the extended file above — that isn't met, including a required pattern/component that's simply absent from the diff.**

## Stack

- Nuxt 2 (Vue 2 Options API) — no Vue 3/Composition API assumptions
- Shared UI kit: `classcard-ui` — prefer its components over hand-rolled equivalents
- Styling: Tailwind CSS (with `prettier-plugin-tailwindcss` — class order is autoformatted, don't hand-reorder)
- HTTP: `@nuxtjs/axios`, wrapped in per-resource modules under `api/*.js` (e.g. `api/rentals.js`) — new endpoints follow this module-per-resource shape, not ad hoc `axios.get()` calls scattered in components unless required
- i18n: `@nuxtjs/i18n` — OB has no hardcoded user-facing strings, always through translation keys
- Error tracking: `@nuxtjs/sentry` — don't swallow errors that Sentry should see
- Dates: `dayjs` (not `moment`, not raw `Date` math)

## Additional Rules

- Interactive elements have accessible names/roles (no icon-only buttons without `aria-label`)
- Component `props` declared with explicit `type` (and `required`/`default`) — no untyped prop objects
- No inline `style="..."` strings for anything beyond a one-off dynamic value; prefer Tailwind classes or scoped `<style>`
- Derived state computed via `computed`, not duplicated into `data()` and manually synced
- New API calls added as a method on the matching `api/<resource>.js` module (mirroring existing files like `api/rentals.js`), not inlined into a component
- User-facing strings go through `$t(...)` / `i18n`, not hardcoded English

## Vue Template Rules

- Never use `v-if` and `v-for` on the same element — filter/compute the list first, or wrap in a parent element/`<template>`
- Use `<template>` fragments (no wrapping `<div>`) when an element exists only to hold a `v-if`/`v-for` and carries no class/attrs
- Do not add a `key` directly to a `<template>` element — keys on `<template>` are ignored by Vue and can cause confusion; place the key on the real DOM or component element rendered by the template
- `v-for` key is a proper stable/unique id from the data, never the array index — index breaks reordering, insertion, and deletion

## Component Reuse & Structure

- Prefer/integrate Storybook components where one exists for the need; use `c-icons` over raw inline SVGs
- Reuse existing components rather than duplicating markup — build new components to be *extensible* (slots, props) rather than something callers modify/refactor after the fact
- Store new components in the folder structure matching their scope (shared/global vs. feature-local) — don't drop feature components into a shared folder or vice versa
- Never mutate a prop inside a child component — prop changes are handled by the parent (emit an event, don't reassign/mutate the prop value or its nested fields)
- Use mixins where the shared behavior fits an existing mixin's purpose, rather than re-implementing it inline
- Check `helper.js` for an existing utility before writing a new one — avoid duplicating logic that already exists there
- Check global Vuex store state before firing a new API call for data that may already be loaded — avoid redundant fetches
- API calls go through service/`api` modules — `this.$api.<resource>.<method>()` (or the local `api/<resource>.js` module) — not raw `this.$axios.<method>()` calls from a component, unless no service method exists yet
- Pass query params via axios's `params` config option, not string-interpolated into the URL — keeps call sites readable and avoids manual encoding bugs

## Code Style & Organization

- Follow DRY, KISS, YAGNI — don't duplicate logic, don't over-engineer, don't build for hypothetical future needs
- `camelCase` for variable names
- Use `const` for any variable that is never reassigned; reserve `let` for ones that are
- Split large functions into smaller, single-purpose functions
- Long-lived/shared literal values belong in a constants file; use enums only where the value set is genuinely a fixed enumeration, not for one-off config
- Remove dead code in any file you touch as part of the change, even if unrelated to the specific fix
- Names (variables, computed properties, watchers, methods) must be clear and self-describing; prefix event/action handler methods with `handle` (e.g. `handleSubmit`, `handleClose`)
- Prefer `computed` over `methods` for any derived/cacheable value — a `method` recomputes on every render, a `computed` caches until its dependencies change

## Comments

- Use multi-line comments where a comment is warranted; keep them short and add them only where genuinely needed
- Don't over-comment: a comment should explain *why* a non-obvious decision was made or *why* a code path is hard to follow — not restate what the code already says. Remove comments that don't meet that bar.

## Error Handling & Safety

- Use `try`/`catch`/`finally` appropriately — `finally` for cleanup that must run regardless of outcome, not as a default habit
- Sanitize any direct HTML rendering (`v-html`, innerHTML, etc.) through DOMPurify — never render unsanitized HTML
- Flag potential memory leaks (unremoved event listeners, intervals/timeouts not cleared on `beforeDestroy`/`destroyed`, subscriptions left open) and missing access-control checks on the change under review

## Assets & Performance

- Use `webp`/`avif` for new images; flag other raster formats (`.png`/`.jpg`) unless there's a stated reason (e.g. transparency requirements not met by the chosen format, or a third-party asset)
- Image filenames are lowercase, hyphen-separated (`kebab-case`)
- Animate via CSS `transform`, not `width`/`height`/layout properties — avoids layout thrashing
- Review whether the change touches anything `nuxt.config.js` already optimizes for (chunking, image domains, modules) and flag if the change works against that config

## Currency & Localization

- No hardcoded currency symbols/formats — route through the existing customization/localization mechanism for currency display

## Known Gaps (call out, don't silently assume coverage)

- No ESLint config found in either repo root — style consistency currently relies on Prettier + reviewer judgment. Flag obviously inconsistent formatting but don't invent lint rules that don't exist.
- No test framework dependency found in either repo — don't require new tests as a blocking rule here; note their absence as a MEDIUM suggestion, not a CRITICAL/HIGH finding.
