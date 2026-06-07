# Task: Implement Analyze API Route

## Goal

Expose the completed repository analysis orchestration through the real
`POST /api/analyze` route with predictable request validation and safe HTTP
error responses.

## Scope

- Add the real App Router route handler for `POST /api/analyze`.
- Validate that the request body is a JSON object containing a string
  `repoUrl`.
- Call `orchestrateRepositoryAnalysis` exactly once for a valid request.
- Return the stored analysis result using the existing API contract shape.
- Map project-owned orchestration errors to HTTP status codes and safe messages.
- Convert malformed JSON and unexpected exceptions into predictable responses.
- Add focused route-handler unit tests using an injectable analysis function.
- Update `docs/api-contract.md` with the complete route error mapping.

## Implementation Plan

1. Add a focused request-body validator for `{ repoUrl: string }`.
2. Add a small handler factory or equivalent injectable boundary so tests can
   exercise HTTP behavior without live GitHub, Gemini, or database calls.
3. Export the production `POST` handler wired to
   `orchestrateRepositoryAnalysis`.
4. Return `200 OK` with `analysisId`, `repository`, and `result` after a
   successful analysis.
5. Map request and orchestration failures:
   - malformed JSON, invalid body, or `invalid_input` to `400 Bad Request`;
   - `not_found` to `404 Not Found`;
   - `rate_limited` to `429 Too Many Requests`;
   - `processing_error` and unexpected exceptions to
     `500 Internal Server Error`.
6. Return every error as `{ "message": "..." }`.
7. Ensure responses never expose raw request bodies, provider errors, model
   output, Prisma errors, database details, or stack traces.
8. Update the API contract with the added `404` and `429` response examples.

## Files Likely to Change

- `app/api/analyze/route.ts`
- `app/api/analyze/route.test.ts`
- `docs/api-contract.md`
- `docs/tasks/implement-analyze-api-route.md`

## Acceptance Criteria

- `POST /api/analyze` accepts a JSON body shaped as `{ "repoUrl": "string" }`.
- Malformed JSON, missing `repoUrl`, non-string `repoUrl`, extra request fields,
  and invalid repository URLs return `400`.
- Valid requests call `orchestrateRepositoryAnalysis` once with the submitted
  `repoUrl`.
- Successful analysis returns `200` and the existing `StoredAnalysisResult`
  shape without transformation or omitted repository fields.
- `RepositoryAnalysisError` categories map to `400`, `404`, `429`, or `500` as
  documented.
- Unexpected exceptions return the same safe `500` response as processing
  failures.
- Every error response contains only a human-readable `message`.
- No raw provider, model, persistence, request-body, or internal exception
  details are exposed.
- Tests use injected fakes and make no live GitHub, Gemini, or database calls.
- No CORS policy, authentication, UI, MSW, history read operation, schema,
  migration, or automation change is introduced.
- Unit tests, lint, and build pass.

## Verification

```bash
pnpm test:unit
pnpm lint
pnpm build
git diff --check
```

## Suggested Branch

```text
feat/implement-analyze-api-route
```

## Suggested Commit

```text
feat(api): implement analyze route
```
