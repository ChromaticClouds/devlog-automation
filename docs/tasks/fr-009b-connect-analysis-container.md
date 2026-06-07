# Task: Connect Analysis Container

## Goal

Connect the repository URL form, `/api/analyze` MSW contract, and analysis
result dashboard into a reusable client-side analysis container with Storybook
state coverage.

## Scope

- Add an `AnalysisContainer` client component.
- Render `RepositoryUrlForm` for user input.
- Call an injectable `analyzeRepository(repoUrl)` function from the container.
- Use the real `/api/analyze` response shape for container state.
- Render `AnalysisResultDashboard` after a successful analysis.
- Show idle, loading, success, error, empty, and retry states in Storybook.
- Use existing MSW analyze handlers for deterministic API-driven stories.

## Implementation Plan

1. Add a focused `AnalysisContainer` client component.
2. Define a small project-owned client response type or reuse
   `StoredAnalysisResult` where appropriate.
3. Default the container's analyze function to `fetch("/api/analyze")`.
4. Validate the fetch response shape enough to avoid rendering malformed data.
5. Convert non-OK responses into a safe user-facing message from `{ message }`.
6. Keep `RepositoryUrlForm` responsible for client URL validation.
7. Keep `AnalysisResultDashboard` responsible for result presentation and
   Markdown copy behavior.
8. Store the last submitted repository URL so retry can re-run the same request.
9. Add Storybook stories using MSW for:
   - idle;
   - loading;
   - success;
   - empty/no result before submission;
   - validation error from the form;
   - API `400`;
   - API `404`;
   - API `429`;
   - API `500`;
   - retry after failure.
10. Keep this task Storybook-first and avoid production page integration.

## Files Likely to Change

- `components/analysis/analysis-container.tsx`
- `stories/analysis/analysis-container.stories.tsx`
- `docs/tasks/fr-009b-connect-analysis-container.md`
- Optional: `lib/analysis/client.ts` if a small fetch/response helper improves
  testability

## Acceptance Criteria

- The container starts in an idle/empty state with the repository URL form.
- Submitting a valid canonical repository URL triggers exactly one analysis
  request.
- The container shows a loading state while the request is pending.
- A successful response renders `AnalysisResultDashboard` with
  `analysisId`, `repository`, and `result` from the API response.
- The dashboard receives `repository.url` and keeps safe external-link behavior.
- API error responses show a safe user-facing message without raw provider,
  model, Prisma, database, or stack details.
- Retry is available after API failure and reuses the last submitted URL.
- Form validation errors do not start an API request.
- Malformed successful responses fail safely instead of rendering partial data.
- Stories cover idle, loading, success, form validation, API errors, and retry.
- Stories use MSW handlers from `mocks/analyze.ts` instead of duplicating
  response bodies.
- No landing page replacement, authentication, CORS, schema, migration, history
  read operation, automation logic, or server route change is introduced.
- Lint, build, Storybook build, and Storybook interaction tests pass.

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
feat/fr-009b-connect-analysis-container
```

## Suggested Commit

```text
feat(analysis): connect analysis container
```
