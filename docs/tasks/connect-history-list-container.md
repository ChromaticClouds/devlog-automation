# Task: Connect Analysis History List Container

## Goal

- Connect the pure history list UI to `GET /api/analyses` through a reusable
  client-side container.

## Scope

- Add a strict injectable history-list client boundary.
- Load history on mount and map request state into `AnalysisHistoryList`.
- Preserve safe API messages and use a fallback for malformed responses.
- Retry the same request through the existing presentational action.
- Add Storybook container states using existing history MSW handlers.

## Files Likely to Change

- `components/analysis/analysis-history-container.tsx`
- `components/analysis/analysis-history-client.ts`
- `components/analysis/analysis-history-container.test.ts`
- `stories/analysis/analysis-history-container.stories.tsx`
- `docs/tasks/connect-history-list-container.md`

## Acceptance Criteria

- Initial state is accessible loading.
- Populated and empty responses render existing list states.
- Safe API failures render their message and expose retry.
- Malformed responses and unknown failures use a safe fallback.
- Retry can transition from error to success.
- Successful responses accept only contract-aligned history items.
- No production page, detail flow, route, persistence, or schema changes occur.

## Verification

```bash
pnpm test:unit
pnpm exec tsc --noEmit
pnpm lint
pnpm build
pnpm build-storybook
pnpm vitest run --project=storybook
git diff --check
```

## Suggested Branch

```text
feat/connect-history-list-container
```

## Suggested Commit

```text
feat(history): connect history list container
```
