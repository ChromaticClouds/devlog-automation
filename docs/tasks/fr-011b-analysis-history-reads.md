# Task: FR-011b Add Analysis History Read Operations

## Goal

- Add project-owned read operations for stored analysis history.
- Provide the persistence boundary needed by future history list and detail API
  routes without implementing HTTP routes or UI.

## Scope

- Add an analysis history list read ordered by newest analysis first.
- Add an analysis detail read by id.
- Map stored repository identity and result data to the shapes in
  `docs/api-contract.md`.
- Validate stored JSON list fields before returning them as `string[]`.
- Convert query and malformed-storage failures into safe project-owned errors.
- Represent missing details with a project-owned not-found error.

## Files Likely to Change

- `lib/analysis/history.ts`
- `lib/analysis/history.test.ts`
- `docs/tasks/fr-011b-analysis-history-reads.md`

## Acceptance Criteria

- History items contain `id`, `repositoryName`, `repositoryUrl`, `summary`, and
  ISO `createdAt` values.
- History is queried in descending `createdAt` order.
- Detail reads return repository identity and the full validated result.
- Missing details throw `AnalysisNotFoundError`.
- Query failures and malformed JSON throw `AnalysisHistoryPersistenceError`
  without exposing raw database details.
- No HTTP routes, UI, migrations, or schema changes are introduced.

## Verification

```bash
pnpm test:unit
pnpm lint
pnpm build
git diff --check
```

## Suggested Branch

```text
feat/fr-011b-analysis-history-reads
```

## Suggested Commit

```text
feat(analysis): add history read operations
```
