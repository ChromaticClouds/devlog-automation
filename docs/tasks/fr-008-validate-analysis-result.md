# Task: Validate Structured Analysis Result

## Goal

Parse and validate raw Gemini JSON text into a bounded, project-owned analysis
result for later API and persistence layers.

## Scope

- Define the project-owned `AnalysisResult` type.
- Parse raw JSON without repairs or Markdown-fence handling.
- Strictly validate required fields and reject extra fields.
- Trim and deterministically cap accepted strings and collections.
- Convert all invalid model output into one safe validation error.

## Files Likely to Change

- `lib/analysis/result.ts`
- `lib/analysis/result.test.ts`
- `docs/tasks/fr-008-validate-analysis-result.md`

## Acceptance Criteria

- Valid raw JSON returns `summary`, `technicalHighlights`, `portfolioBullets`,
  `nextTasks`, `risks`, and `markdown`.
- Missing fields, extra fields, incorrect types, malformed JSON, code fences,
  and top-level non-object values are rejected.
- Scalar strings are trimmed, non-empty, and capped at:
  - `MAX_ANALYSIS_SUMMARY_LENGTH`: 2000
  - `MAX_ANALYSIS_MARKDOWN_LENGTH`: 10000
- String arrays contain trimmed non-empty values and are capped at:
  - `MAX_ANALYSIS_LIST_ITEMS`: 10
  - `MAX_ANALYSIS_LIST_ITEM_LENGTH`: 500
- Validation errors do not expose raw model output or parser details.
- The returned shape aligns with the API contract and Prisma persistence fields.
- Unit tests, lint, and build pass.

## Verification

```bash
pnpm test:unit
pnpm lint
pnpm build
```

## Suggested Branch

```text
feat/fr-008-validate-analysis-result
```

## Suggested Commit

```text
feat(analysis): validate structured analysis result
```
