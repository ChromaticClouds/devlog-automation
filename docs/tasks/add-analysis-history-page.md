# Task: Add Analysis History Page

## Goal

- Add the production `/analyses` page for FR-012 using
  `AnalysisHistoryContainer`.
- Give users a visible path from the landing page to previous analysis results.

## Scope

- Add `app/analyses/page.tsx` as a thin page composition layer.
- Render `AnalysisHistoryContainer` without server-side history fetching.
- Hide history detail CTAs on the production page until
  `app/analyses/[id]/page.tsx` exists.
- Add an accessible landing page link to `/analyses`.
- Update stale app metadata from Create Next App wording.
- Keep build-time rendering quiet; live history work remains in the client
  container after mount.

## Files Likely to Change

- `app/analyses/page.tsx`
- `app/page.tsx`
- `app/layout.tsx`
- `components/analysis/analysis-history-container.tsx`
- `components/analysis/analysis-history-list.tsx`
- `docs/tasks/add-analysis-history-page.md`

## Acceptance Criteria

- Visiting `/analyses` renders a production history page.
- The page itself does not import Prisma or call `GET /api/analyses`.
- The landing page links to `/analyses`.
- Non-empty history cards do not link to `/analyses/{id}` until a production
  detail page exists.
- The existing repository analysis flow on `/` remains intact.
- No detail page, API route, persistence, schema, migration, or automation
  changes are introduced.

## Verification

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
pnpm build-storybook
pnpm vitest run --project=storybook
git diff --check
```

## Suggested Branch

```text
feat/add-analysis-history-page
```

## Suggested Commit

```text
feat(history): add analysis history page
```
