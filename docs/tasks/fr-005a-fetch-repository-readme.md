# Task: Fetch Repository README

## Goal

Fetch and normalize the default README for a parsed public GitHub repository.

## Scope

- Fetch the default README through the shared GitHub client.
- Decode supported Base64 README content into plain text.
- Normalize the response into a project-owned README type.
- Treat a missing default README as an optional empty result.
- Add focused unit tests with mocked GitHub responses.

## Files Likely to Change

- `lib/github/readme.ts`
- `lib/github/readme.test.ts`
- `docs/tasks/fr-005a-fetch-repository-readme.md`

## Acceptance Criteria

- A parsed repository can be used to request its default README.
- Path, decoded plain-text content, and browser URL are normalized.
- GitHub-inserted whitespace in Base64 content is handled safely.
- A missing default README returns `null`.
- Non-not-found project-owned GitHub client errors remain intact.
- Unsupported encodings and malformed provider responses fail safely.
- Raw provider responses and credentials are not exposed.
- Unit tests, lint, and build pass.

## Verification

```bash
pnpm test:unit
pnpm lint
pnpm build
```

## Suggested Branch

```text
feat/fetch-repository-readme
```

## Suggested Commit

```text
feat(github): fetch repository readme
```
