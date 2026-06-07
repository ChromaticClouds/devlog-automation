# Task: Orchestrate Repository Analysis

## Goal

Connect the completed FR-002 through FR-011a building blocks into one
project-owned repository analysis use case for later API and automation entry
points.

## Scope

- Accept a raw GitHub repository URL as the orchestration input.
- Parse the canonical repository identity before provider work begins.
- Collect commits, pull requests, issues, README, and package metadata.
- Run independent GitHub collection operations concurrently.
- Normalize collected activity, request Gemini analysis, validate the result,
  and persist it.
- Return the project-owned stored analysis result.
- Translate lower-level failures into stable orchestration error categories.
- Add focused unit tests using injected dependencies without live GitHub,
  Gemini, or database calls.

## Implementation Plan

1. Add a focused repository analysis orchestration module.
2. Define a minimal injectable dependency boundary for parsing, collection,
   normalization, Gemini generation, result validation, and persistence.
3. Reject an invalid repository URL before calling any external dependency.
4. Use `Promise.all` to collect:
   - recent commits;
   - recent pull requests;
   - recent issues;
   - optional README;
   - optional package metadata.
5. Pass the complete collected shape to `normalizeGitHubActivity`.
6. Send normalized activity to Gemini and validate the returned raw text with
   `parseAnalysisResult`.
7. Persist the canonical repository and validated result with
   `storeAnalysisResult`.
8. Return the resulting `StoredAnalysisResult`.
9. Translate failures into project-owned orchestration categories:
   - `invalid_input`;
   - `not_found`;
   - `rate_limited`;
   - `processing_error`.
10. Preserve no raw GitHub, Gemini, validation, Prisma, database, or repository
    content in orchestration errors.

## Files Likely to Change

- `lib/analysis/orchestration.ts`
- `lib/analysis/orchestration.test.ts`
- `docs/tasks/orchestrate-repository-analysis.md`
- Optional: `lib/analysis/persistence.ts` only if a small reusable type export is
  required

## Acceptance Criteria

- The service accepts a raw repository URL and returns `StoredAnalysisResult`.
- Invalid repository URLs fail before GitHub, Gemini, or persistence
  dependencies are called.
- The canonical parsed repository identity is used by every later stage.
- All five independent GitHub collection operations are started concurrently.
- Missing README or package metadata remain valid `null` inputs.
- Collected activity is normalized before it is sent to Gemini.
- Raw Gemini text is validated before persistence.
- Only validated results are passed to persistence.
- GitHub or Gemini rate-limit failures become a stable `rate_limited`
  orchestration error.
- A missing repository becomes a stable `not_found` orchestration error.
- Provider, configuration, validation, and persistence failures become a stable
  `processing_error` orchestration error.
- Orchestration errors do not expose raw provider, model, database, or input
  details.
- Tests use injected fakes and make no live GitHub, Gemini, or database calls.
- No API route, HTTP status mapping, UI, history read operation, schema,
  migration, or automation logic is introduced.
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
feat/orchestrate-repository-analysis
```

## Suggested Commit

```text
feat(analysis): orchestrate repository analysis
```
