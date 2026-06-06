# Task: Copy Analysis Markdown

## Goal

Let users copy the validated analysis Markdown from the result dashboard with
clear success and failure feedback.

## Scope

- Add a small client-side Markdown copy action to the Markdown preview card.
- Keep `AnalysisResultDashboard` server-compatible by isolating Clipboard API
  access in a focused client component.
- Manage idle, copying, success, error, and retry states inside the copy action.
- Add deterministic Storybook interaction checks without using the real system
  clipboard.

## Implementation Plan

1. Add a `CopyMarkdownButton` client component that accepts the Markdown text
   and an optional injectable text writer.
2. Default the text writer to `navigator.clipboard.writeText`.
3. Disable repeated submissions while a copy operation is pending.
4. Show accessible success feedback after the Markdown is copied.
5. Show accessible failure feedback and allow a later click to retry.
6. Render the copy action through the Markdown card's existing `CardAction`
   slot.
7. Add focused Storybook stories for successful copy, pending copy, and failed
   copy with retry.
8. Extend the dashboard story to verify that the copy action is integrated only
   when a result exists.

## Files Likely to Change

- `components/analysis/copy-markdown-button.tsx`
- `components/analysis/analysis-result-dashboard.tsx`
- `stories/analysis/copy-markdown-button.stories.tsx`
- `stories/analysis/analysis-result-dashboard.stories.tsx`
- `docs/tasks/fr-010-copy-analysis-markdown.md`

## Acceptance Criteria

- A result dashboard displays a clearly labeled Markdown copy action.
- Activating the action writes the exact validated `result.markdown` string.
- Clipboard access is isolated in a client component; the dashboard itself does
  not require a `"use client"` directive.
- The action is disabled and shows a pending state while copying.
- A successful copy produces visible and screen-reader-accessible feedback.
- A failed copy produces visible and screen-reader-accessible feedback without
  exposing raw browser errors.
- Users can retry after a failed copy.
- A no-result dashboard does not display a copy action.
- Storybook interaction checks use an injected fake text writer and do not
  depend on operating-system clipboard permissions.
- No timer, toast dependency, clipboard fallback, API integration, or
  persistence change is introduced.
- Lint, build, Storybook build, and Storybook interaction tests pass.

## Verification

```bash
pnpm lint
pnpm build
pnpm build-storybook
pnpm exec vitest --run --project storybook
```

## Suggested Branch

```text
feat/fr-010-copy-analysis-markdown
```

## Suggested Commit

```text
feat(ui): add markdown copy action
```
