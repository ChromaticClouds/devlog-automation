# Task: Fetch Recent Repository Issues

## Goal

Fetch and normalize recent issues for a parsed public GitHub repository.

## Scope

- Fetch open and closed repository items through the shared GitHub client.
- Order results by most recently updated.
- Exclude Pull Requests returned by GitHub's repository issues endpoint.
- Validate an explicit or default API result limit.
- Normalize GitHub responses into a project-owned issue type.
- Add focused unit tests with mocked GitHub responses.

## Files Likely to Change

- `lib/github/issues.ts`
- `lib/github/issues.test.ts`
- `docs/tasks/fr-004b-fetch-repository-issues.md`

## Acceptance Criteria

- A parsed repository can be used to request recent repository issues.
- Requests include `state=all`, `sort=updated`, `direction=desc`, and `per_page`.
- Items containing the GitHub `pull_request` marker are excluded.
- Number, title, state, nullable author login, label names, timestamps, nullable
  closed date, and URL are normalized.
- Deleted users and labels without a usable name are handled safely.
- Empty and Pull-Request-only responses return an empty array.
- Filtering Pull Requests may return fewer Issues than the API result limit.
- Invalid limits and malformed provider responses fail safely.
- Existing project-owned GitHub client errors remain intact.
- Unit tests, lint, and build pass.

## Verification

```bash
pnpm test:unit
pnpm lint
pnpm build
```

## Suggested Branch

```text
feat/fetch-repository-issues
```

## Suggested Commit

```text
feat(github): fetch recent repository issues
```
