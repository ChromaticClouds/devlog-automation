# Task: Add Analysis History Detail Flow

## Goal

- Complete the FR-012 revisit flow from history list cards to a stored analysis
  detail page.
- Connect `GET /api/analyses/:id` through a client boundary, reusable detail
  container, Storybook states, and production `/analyses/[id]` page.

## Scope

- Add a client-side detail API boundary with strict response validation.
- Preserve documented `400`, `404`, and `500` API messages.
- Normalize malformed success bodies, malformed JSON, rejected fetches, and
  unknown failures to a safe fallback message.
- Add `AnalysisHistoryDetailContainer` for loading, success, error, malformed,
  and retry states.
- Reuse `AnalysisResultDashboard` for success rendering.
- Add Storybook stories using `mocks/history.ts` detail handlers.
- Add `app/analyses/[id]/page.tsx` as a thin page shell.
- Re-enable history card links from `/analyses` to `/analyses/:id`.

## Files Likely to Change

- `components/analysis/analysis-history-detail-client.ts`
- `components/analysis/analysis-history-detail-client.test.ts`
- `components/analysis/analysis-history-detail-container.tsx`
- `stories/analysis/analysis-history-detail-container.stories.tsx`
- `mocks/history.ts`
- `mocks/history.test.ts`
- `app/analyses/[id]/page.tsx`
- `app/analyses/page.tsx`
- `docs/tasks/add-analysis-history-detail-flow.md`

## Acceptance Criteria

- `/analyses` renders accessible detail links for non-empty history cards.
- `/analyses/42` renders a detail page shell and loads data after mount.
- Valid detail responses render `AnalysisResultDashboard`.
- Loading, safe error, not-found, malformed, and retry-to-success states are
  covered by Storybook interaction assertions.
- The detail validator accepts only the documented `AnalysisDetail` shape.
- No persistence, Prisma schema, migration, provider, orchestration, or
  automation behavior changes are introduced.

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
feat/add-analysis-history-detail-flow
```

## Suggested Commit

```text
feat(history): add analysis history detail flow
```
