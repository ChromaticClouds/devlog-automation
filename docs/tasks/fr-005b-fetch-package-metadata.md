# Task: Fetch Package Metadata

## Goal

Fetch and normalize root `package.json` metadata for a parsed public GitHub
repository when available.

## Scope

- Fetch root `package.json` through the shared GitHub client.
- Decode supported Base64 JSON content.
- Normalize useful npm-compatible package metadata into a project-owned type.
- Treat a missing root `package.json` as an optional empty result.
- Add focused unit tests with mocked GitHub responses.

## Files Likely to Change

- `lib/github/contents.ts`
- `lib/github/readme.ts`
- `lib/github/package-metadata.ts`
- `lib/github/package-metadata.test.ts`
- `docs/tasks/fr-005b-fetch-package-metadata.md`

## Acceptance Criteria

- A parsed repository can be used to request root `package.json`.
- Supported Base64 content is decoded and parsed as JSON.
- Nullable package name, version, description, package manager, engine
  constraints, script names, dependency names, and dev dependency names are
  normalized.
- Script and dependency names are deterministic and do not expose raw manifest
  values.
- A missing root `package.json` returns `null`.
- Non-not-found project-owned GitHub client errors remain intact.
- Unsupported encoding, invalid JSON, and malformed provider responses fail
  safely.
- Unit tests, lint, and build pass.

## Verification

```bash
pnpm test:unit
pnpm lint
pnpm build
```

## Suggested Branch

```text
feat/fetch-package-metadata
```

## Suggested Commit

```text
feat(github): fetch package metadata
```
