# Task: Align Analyze MSW Contract

## Goal

Align the Storybook/MSW `/api/analyze` mock with the real API contract before
building the analysis container.

## Scope

- Update the `/api/analyze` MSW success response to match
  `docs/api-contract.md`.
- Include the canonical `repository.url` field in mocked success responses.
- Add reusable mock response fixtures for success and documented error cases.
- Provide deterministic MSW handlers that future container stories can reuse.
- Keep this task limited to mocked API behavior and contract fixtures.

## Implementation Plan

1. Extract the `/api/analyze` mock response data into a focused fixture/helper.
2. Ensure the default success response includes:
   - `analysisId`;
   - `repository.owner`;
   - `repository.name`;
   - `repository.url`;
   - every validated `result` field.
3. Add reusable mocked error responses for:
   - `400 Bad Request`;
   - `404 Not Found`;
   - `429 Too Many Requests`;
   - `500 Internal Server Error`.
4. Keep all mocked error bodies shaped as `{ "message": "..." }`.
5. Make the default global handler return the success fixture.
6. Expose named handler helpers or fixtures that future FR-009b stories can use
   for loading, success, error, and retry states.
7. Add focused tests or Storybook interaction coverage where practical to verify
   the response shape does not drift from the API contract.

## Files Likely to Change

- `mocks/handlers.ts`
- `mocks/analyze.ts`
- Optional: `mocks/analyze.test.ts`
- `docs/tasks/align-analyze-msw-contract.md`

## Acceptance Criteria

- The default `POST /api/analyze` MSW handler returns a success body matching the
  documented API response shape.
- The mocked success response includes `repository.url`.
- Mocked analysis `result` includes `summary`, `technicalHighlights`,
  `portfolioBullets`, `nextTasks`, `risks`, and `markdown`.
- Reusable mock data or handler helpers exist for `400`, `404`, `429`, and `500`
  responses.
- Every mocked error response uses only `{ "message": "..." }`.
- The mock layer does not expose provider, model, Prisma, or database details.
- Future Storybook stories can import a success handler and each error handler
  without rewriting response bodies.
- No React component, page integration, real API route, persistence, schema,
  migration, history, or automation logic is introduced.
- Unit tests, lint, build, Storybook build, and Storybook interaction tests pass
  when relevant.

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
test/align-analyze-msw-contract
```

## Suggested Commit

```text
test(msw): align analyze api contract
```
