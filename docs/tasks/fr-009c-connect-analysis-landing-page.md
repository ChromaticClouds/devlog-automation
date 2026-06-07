# Task: Connect Analysis Flow To Landing Page

## Goal

- Replace the default Next.js starter landing page with the DevLog Automator MVP
  repository analysis entry point.
- Render the existing `AnalysisContainer` from `/` so users can submit a public
  GitHub repository URL and receive the persisted analysis response.

## Scope

- Replace the starter content in `app/page.tsx`.
- Keep `/` as a thin composition layer around product copy and
  `AnalysisContainer`.
- Preserve idle, loading, success, error, malformed response fallback, and retry
  behavior inside `AnalysisContainer`.
- Do not move API, validation, persistence, provider, history, cron, or
  automation logic into the page.

## Files Likely to Change

- `app/page.tsx`
- `docs/tasks/fr-009c-connect-analysis-landing-page.md`

## Acceptance Criteria

- Visiting `/` displays the DevLog Automator MVP entry point instead of the
  default Create Next App starter screen.
- The repository URL form is visible on the landing page.
- Valid submissions use `AnalysisContainer` and its default `/api/analyze`
  client boundary.
- Loading, success, API error, malformed response fallback, and retry behavior
  are not duplicated in `app/page.tsx`.
- The page does not call live GitHub, Gemini, PostgreSQL, or the API during
  build or static rendering.
- The page remains usable on desktop and narrow viewports.

## Verification

```bash
pnpm lint
pnpm build
git diff --check
```

## Suggested Branch

```text
feat/connect-analysis-landing-page
```

## Suggested Commit

```text
feat(app): connect analysis landing page
```
