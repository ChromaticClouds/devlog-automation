# Task: Add Analysis History MSW Contract Mocks

## Goal

- Add reusable MSW fixtures and handlers for the analysis history API contract.
- Prepare deterministic list and detail responses for upcoming FR-012
  containers and page stories.

## Scope

- Add populated, empty, and safe failure handlers for `GET /api/analyses`.
- Add success, invalid-id, missing, and safe failure handlers for
  `GET /api/analyses/:id`.
- Register successful list and detail handlers in the shared handler list.
- Verify handlers through real MSW request interception.

## Files Likely to Change

- `mocks/history.ts`
- `mocks/history.test.ts`
- `mocks/handlers.ts`
- `docs/tasks/add-history-msw-contract.md`

## Acceptance Criteria

- Fixtures use existing `AnalysisHistoryItem` and `AnalysisDetail` types.
- List and detail success responses match the API contract.
- Error handlers return only safe documented `{ message }` bodies.
- Detail dynamic-id behavior is explicit and deterministic.
- Detail handlers do not accidentally match the list route.
- Existing `/api/analyze` shared handler remains registered.
- No React, container, page, real route, persistence, or schema changes occur.

## Verification

```bash
pnpm test:unit
pnpm lint
pnpm build
pnpm build-storybook
pnpm vitest run --project=storybook
git diff --check
```

## Suggested Branch

```text
test/add-history-msw-contract
```

## Suggested Commit

```text
test(msw): add history api contract mocks
```
