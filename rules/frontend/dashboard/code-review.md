# classcard-dashboard Code Review Rules

@rules/frontend/common/code-review.md

**Flag any rule below — or any rule in the extended file above — that isn't met, including a required pattern/component that's simply absent from the diff.**

## Additional Rules

- Use the `tippy-tooltip` component for tooltips, not a hand-rolled hover element
- Use the `Slideover` component for any sidebar-style panel with appropriate variant
- Use the `Modal` component for any dialog
- Use/try `AiAssistantButton` for AI-related dropdown options
- Use `Skeleton` for skeleton/loading-placeholder UI
- Any `c-stats` usage should use the `StatisticsLoader` component for its loading state — flag if a `c-stats` instance doesn't
