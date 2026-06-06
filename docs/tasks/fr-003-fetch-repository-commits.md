# Task: Fetch Recent Repository Commits

## Goal

Fetch and normalize recent commits for a parsed public GitHub repository.

## Scope

- Add a reusable GitHub request helper with safe project-owned errors.
- Fetch recent commits with a validated explicit or default result limit.
- Normalize GitHub responses into a project-owned commit type.
- Add focused unit tests with mocked HTTP responses.

## Files Likely to Change

- `config/index.ts`
- `lib/github/client.ts`
- `lib/github/commits.ts`
- `lib/github/commits.test.ts`

## Acceptance Criteria

- A parsed repository can be used to request recent commits.
- The result limit is validated and sent as `per_page`.
- Commit SHA, message, author name, committed date, and URL are normalized.
- Empty responses return an empty array.
- Not found, rate limit, and unexpected provider failures use safe project-owned
  errors.
- Credentials and raw provider errors are not exposed.
- Unit tests, lint, and build pass.

## Verification

```bash
pnpm test:unit
pnpm lint
pnpm build
```

## Suggested Branch

```text
feat/fetch-repository-commits
```

## Suggested Commit

```text
feat(github): fetch recent repository commits
```
