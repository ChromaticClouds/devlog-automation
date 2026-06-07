# Task: Enter Repository URL

## Goal

Let users enter and validate a public GitHub repository URL through a reusable
presentational form before analysis container integration.

## Scope

- Add a focused client-side repository URL form.
- Reuse the existing GitHub repository URL parser for client-side validation.
- Submit only the canonical parsed repository URL.
- Show clear validation feedback for empty and invalid input.
- Support an externally controlled submitting state.
- Add Storybook states and focused interaction checks.

## Implementation Plan

1. Add a `RepositoryUrlForm` client component with:
   - `onSubmit(repoUrl)` callback;
   - externally controlled `isSubmitting` state;
   - an optional initial URL for deterministic stories.
2. Keep the text input locally controlled and validate it when the form is
   submitted.
3. Reject empty or invalid values with a visible, screen-reader-accessible
   field error.
4. Clear stale validation feedback when the user edits the input.
5. Use `parseGitHubRepositoryUrl` and call `onSubmit` with the canonical parsed
   `repository.url`.
6. Disable the input and submit button while `isSubmitting` is true and show a
   clear pending label.
7. Add Storybook stories and interaction checks for idle, empty validation,
   invalid URL, valid canonical submission, and submitting states.

## Files Likely to Change

- `components/repository/repository-url-form.tsx`
- `stories/repository/repository-url-form.stories.tsx`
- `docs/tasks/fr-001-enter-repository-url.md`

## Acceptance Criteria

- The form has an explicitly associated label, GitHub URL input, description,
  and submit button.
- Empty input and invalid GitHub repository URLs show a clear validation error.
- Invalid submission does not call `onSubmit`.
- Valid values accepted by `parseGitHubRepositoryUrl` call `onSubmit` once with
  the canonical repository URL.
- Trailing slash and `.git` input variants submit the normalized URL.
- Validation errors use accessible error semantics and mark the input invalid.
- Editing the input after invalid submission clears the stale validation error.
- The controlled submitting state disables repeated submission and communicates
  progress without starting an API request.
- Storybook covers idle, validation, valid submission, and submitting states.
- Storybook interaction tests do not make API or network requests.
- No API request, MSW handler, analysis container, result dashboard integration,
  landing page replacement, or persistence change is introduced.
- Lint, build, Storybook build, and Storybook interaction tests pass.

## Verification

```bash
pnpm lint
pnpm build
pnpm build-storybook
pnpm vitest run --project=storybook
git diff --check
```

## Suggested Branch

```text
feat/fr-001-enter-repository-url
```

## Suggested Commit

```text
feat(repository): add repository url form
```
