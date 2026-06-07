# Task: Implement Analysis History API Routes

## Goal

- Expose the completed FR-011b history read operations through API routes needed
  by FR-012.

## Scope

- Add `GET /api/analyses`.
- Add `GET /api/analyses/:id`.
- Validate detail ids as positive safe integers.
- Map missing details to `404` and persistence or unknown failures to safe `500`
  responses.
- Return unsupported methods as `405` with `Allow: GET`.
- Keep production Prisma dependencies lazy and route tests dependency-injected.

## Files Likely to Change

- `app/api/analyses/route.ts`
- `app/api/analyses/route.test.ts`
- `app/api/analyses/[id]/route.ts`
- `app/api/analyses/[id]/route.test.ts`
- `docs/api-contract.md`

## Acceptance Criteria

- History list responses return `{ items }` using the existing read operation.
- Detail responses return the existing `AnalysisDetail` shape.
- Invalid ids return `400` without querying persistence.
- Missing details return safe `404` responses.
- Persistence and unknown failures return safe `500` responses.
- Unsupported methods return `405` with `Allow: GET`.
- Tests do not use a live database or environment files.

## Verification

```bash
pnpm test:unit
pnpm exec tsc --noEmit
pnpm lint
pnpm build
git diff --check
```

## Suggested Branch

```text
feat/implement-analysis-history-routes
```

## Suggested Commit

```text
feat(api): implement analysis history routes
```
