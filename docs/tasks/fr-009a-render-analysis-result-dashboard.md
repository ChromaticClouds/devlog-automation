# Task: Render Analysis Result Dashboard

## Goal

Render a validated analysis result in a reusable, presentational dashboard.

## Scope

- Accept typed repository identity and `AnalysisResult | null` props.
- Render repository identity, summary, result lists, and Markdown preview.
- Support full, sparse, and no-result presentation states.
- Add Storybook stories and focused interaction checks.

## Files Likely to Change

- `components/analysis/analysis-result-dashboard.tsx`
- `components/analysis/analysis-result-list.tsx`
- `stories/analysis/analysis-result-dashboard.fixture.ts`
- `stories/analysis/analysis-result-dashboard.stories.tsx`
- `.storybook/preview.tsx`
- `eslint.config.mjs`
- `docs/tasks/fr-009a-render-analysis-result-dashboard.md`

## Acceptance Criteria

- The dashboard accepts `GitHubRepository` and `AnalysisResult | null`.
- Repository identity and every analysis result section are visibly labeled.
- Empty list sections show a clear section-level message.
- A null result shows a clear no-result state.
- Markdown is rendered as plain preformatted text, never interpreted as HTML.
- The repository URL uses safe external-link attributes.
- Stories cover full success, sparse sections, and no-result states.
- Storybook interaction checks cover headings, link safety, and empty states.
- The component is responsive and adds no dependencies.
- Lint, build, and Storybook build pass.

## Verification

```bash
pnpm lint
pnpm build
pnpm build-storybook
pnpm exec vitest --run --project storybook
```

## Suggested Branch

```text
feat/fr-009a-render-analysis-result-dashboard
```

## Suggested Commit

```text
feat(ui): render analysis result dashboard
```
