# Task: Normalize GitHub Activity

## Goal

Normalize collected GitHub activity into one stable analysis input shape for
later Gemini processing.

## Scope

- Define project-owned normalized activity input and output types.
- Combine repository identity, commits, pull requests, issues, README, and
  package metadata.
- Derive compact activity statistics for prompt construction.
- Trim and cap prompt-facing text and collections.
- Add focused unit tests with plain in-memory fixtures.

## Files Likely to Change

- `lib/analysis/activity.ts`
- `lib/analysis/activity.test.ts`
- `docs/tasks/fr-006-normalize-github-activity.md`

## Acceptance Criteria

- Parsed repository identity and collected GitHub entities can be normalized.
- Output includes repository metadata, bounded summaries, optional README
  excerpt, optional package metadata, and aggregate counts.
- Pull Request open, closed, and merged counts are deterministic.
- Issue open and closed counts are deterministic.
- README content is truncated to `MAX_README_EXCERPT_LENGTH`.
- Commit messages and titles are trimmed and empty entries are omitted safely.
- Provider-specific raw response shapes do not leak.
- Missing README and package metadata are represented as `null`.
- Unit tests, lint, and build pass.

## Verification

```bash
pnpm test:unit
pnpm lint
pnpm build
```

## Suggested Branch

```text
feat/normalize-github-activity
```

## Suggested Commit

```text
feat(analysis): normalize github activity
```
