# Task: Parse GitHub Repository URL

## Goal

Validate a public GitHub repository URL and parse its `owner` and repository
name for later GitHub API requests.

## Scope

- Add a reusable GitHub repository URL parser.
- Normalize accepted URLs into a canonical HTTPS URL.
- Add focused unit tests.

## Files Likely to Change

- `lib/github/repository-url.ts`
- `lib/github/repository-url.test.ts`
- `vitest.unit.config.ts`
- `package.json`

## Acceptance Criteria

- A valid `https://github.com/{owner}/{repository}` URL returns `owner`, `name`,
  and canonical `url`.
- A trailing slash and `.git` suffix are accepted and normalized.
- Non-GitHub hosts, non-HTTPS URLs, extra paths, query strings, fragments, and
  invalid names are rejected.
- Unit tests, lint, and build pass.

## Verification

```bash
pnpm test:unit
pnpm lint
pnpm build
```

## Suggested Branch

```text
feat/parse-github-repository-url
```

## Suggested Commit

```text
feat(github): add repository url parser
```
