# Task: Send Activity to Gemini

## Goal

Send normalized GitHub activity to Gemini through a small, testable analysis
request boundary and return the raw text response.

## Scope

- Build a deterministic prompt from `NormalizedGitHubActivity`.
- Request the intended analysis JSON fields without parsing the response.
- Use a minimal injectable Gemini client boundary.
- Select the configured Gemini model with a safe default.
- Convert missing configuration and provider failures into project-owned errors.

## Files Likely to Change

- `config/index.ts`
- `lib/gemini.ts`
- `lib/analysis/gemini.ts`
- `lib/analysis/gemini.test.ts`
- `lib/analysis/gemini.fixture.ts`
- `docs/tasks/fr-007-send-activity-to-gemini.md`

## Acceptance Criteria

- The request accepts `NormalizedGitHubActivity` and returns raw Gemini text.
- The prompt includes repository identity, stats, bounded activity, README, and
  package metadata.
- Repository activity is marked as untrusted data and isolated from system
  instructions.
- The prompt requests JSON fields named `summary`, `technicalHighlights`,
  `portfolioBullets`, `nextTasks`, `risks`, and `markdown`.
- The request enforces an `application/json` response with a response schema.
- The configured model is used, with `gemini-2.5-flash` as a safe default.
- Missing `GEMINI_API_KEY` throws a project-owned configuration error.
- Provider failures throw a project-owned provider error without raw details.
- Gemini rate-limit failures throw a project-owned rate-limit error.
- Tests use an injected fake client and do not call the network.
- Response parsing and validation remain owned by FR-008.
- Unit tests, lint, and build pass.

## Verification

```bash
pnpm test:unit
pnpm lint
pnpm build
```

## Suggested Branch

```text
feat/fr-007-send-normalized-activity-to-gemini
```

## Suggested Commit

```text
feat(analysis): send activity to gemini
```
