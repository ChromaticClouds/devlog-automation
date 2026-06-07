# Task: Store Analysis Result

## Goal

Persist a canonical GitHub repository identity and one validated analysis result
atomically for later orchestration, API, and history work.

## Scope

- Define a project-owned persistence input and returned stored-result shape.
- Accept only `GitHubRepository` and validated `AnalysisResult` values.
- Upsert repository identity by its canonical URL.
- Store the analysis result in the same Prisma transaction.
- Return the created analysis ID with the repository identity and result.
- Convert persistence failures into one safe project-owned error.
- Add focused unit tests using an injectable minimal Prisma transaction
  boundary.

## Implementation Plan

1. Add a focused analysis persistence module.
2. Define input and output types that do not expose Prisma model types to later
   orchestration or API layers.
3. Use one interactive Prisma transaction to:
   - upsert `Repository` by `url`;
   - refresh `owner` and `name` when the URL already exists;
   - create one related `AnalysisResult`.
4. Persist validated list fields as Prisma JSON values without changing their
   content.
5. Return `analysisId`, the canonical repository identity, and the validated
   result.
6. Wrap transaction failures in `AnalysisPersistenceError` without exposing raw
   Prisma or database details.
7. Test the transaction calls, returned shape, repository upsert behavior, JSON
   fields, and safe failure boundary with injected fakes.

## Files Likely to Change

- `lib/analysis/persistence.ts`
- `lib/analysis/persistence.test.ts`
- `docs/tasks/fr-011a-store-analysis-result.md`
- Optional: `lib/prisma.ts` only if a small exported client type boundary is
  required

## Acceptance Criteria

- The service accepts a `GitHubRepository` and validated `AnalysisResult`.
- Repository identity is upserted using the canonical `repository.url`.
- Existing repository rows have `owner` and `name` refreshed without creating a
  duplicate row for the same URL.
- Repository upsert and analysis creation run inside one Prisma transaction.
- The analysis row references the upserted repository ID.
- `technicalHighlights`, `portfolioBullets`, `nextTasks`, and `risks` are stored
  as JSON values without mutation.
- The returned project-owned shape contains `analysisId`, `repository`, and
  `result` for later API orchestration.
- Persistence failures throw `AnalysisPersistenceError` with a stable safe
  message and no raw Prisma, database, or input details.
- Tests use injected fakes and do not require a live database.
- No schema, migration, history read operation, analysis orchestration, API
  route, UI, or automation change is introduced.
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
feat/fr-011a-store-analysis-result
```

## Suggested Commit

```text
feat(persistence): store analysis result
```
