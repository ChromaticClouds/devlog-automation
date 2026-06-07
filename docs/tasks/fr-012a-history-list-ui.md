# Task: FR-012a Add Analysis History List UI

## Goal

- Build a pure presentational history list for discovering previous analyses.
- Establish Storybook state coverage before adding MSW, container, page, or
  real API integration.

## Scope

- Render existing `AnalysisHistoryItem` data.
- Support loading, success, empty, error, and retry states through props.
- Display repository name, summary, human-readable creation time, and an
  accessible detail link.
- Keep retry and navigation dependencies injected or derived without fetching.

## Files Likely to Change

- `components/analysis/analysis-history-list.tsx`
- `stories/analysis/analysis-history-list.fixture.ts`
- `stories/analysis/analysis-history-list.stories.tsx`
- `docs/tasks/fr-012a-history-list-ui.md`

## Acceptance Criteria

- Success renders multiple responsive history cards and detail links.
- Long names and summaries wrap safely.
- Loading exposes an accessible status.
- Empty clearly explains that no previous analyses exist.
- Error displays a safe message.
- Retry invokes an injected callback and performs no fetch.
- Storybook covers all required states without live services.

## Verification

```bash
pnpm lint
pnpm build
pnpm build-storybook
pnpm vitest run --project=storybook
git diff --check
```

## Suggested Branch

```text
feat/fr-012a-history-list-ui
```

## Suggested Commit

```text
feat(history): add analysis history list UI
```
