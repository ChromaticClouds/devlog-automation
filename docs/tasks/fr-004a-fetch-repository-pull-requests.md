# Task: Fetch Recent Repository Pull Requests

## Goal

Fetch and normalize recent pull requests for a parsed public GitHub repository.

## Scope

- Fetch open and closed pull requests through the shared GitHub client.
- Order results by most recently updated.
- Validate an explicit or default result limit.
- Normalize GitHub responses into a project-owned pull request type.
- Add focused unit tests with mocked GitHub responses.

## Files Likely to Change

- `lib/github/pull-requests.ts`
- `lib/github/pull-requests.test.ts`
- `docs/tasks/fr-004a-fetch-repository-pull-requests.md`

## Acceptance Criteria

- A parsed repository can be used to request recent pull requests.
- Requests include `state=all`, `sort=updated`, `direction=desc`, and `per_page`.
- Number, title, state, nullable author login, timestamps, merged date, and URL
  are normalized.
- Open, closed-unmerged, and merged pull requests can be distinguished.
- Empty responses return an empty array.
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
feat/fetch-repository-pull-requests
```

## Suggested Commit

```text
feat(github): fetch recent pull requests
```
