# classcard-dashboard Code Review Rules

Extends `rules/frontend/common/code-review.md` (which extends `rules/common/code-review.md`).

## Additional Rules

- Use the `tippy-tooltip` component for tooltips, not a hand-rolled hover element
- Use the `Slideover` component for any sidebar-style panel
- Use the `Modal` component for any dialog
- Use/try `AiAssistantButton` for AI-related dropdown options
- Use `Skeleton` for skeleton/loading-placeholder UI
- Any `c-stats` usage should use the `StatisticsLoader` component for its loading state — flag if a `c-stats` instance doesn't
