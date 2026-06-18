# Task: Prevent Sample-Wide Analysis Claims

Goal:
- Prevent Gemini analysis from turning recently collected sample counts into
  repository-wide or lifetime maintenance claims.

Scope:
- Clarify that normalized activity stats are based on collected samples.
- Include collection limits and sampled item counts in prompt-facing activity.
- Update Gemini instructions so counts must be qualified as sampled, recent, or
  collected data.
- Add focused tests for sampled pull request counts with zero merged items.
- Split sample and stats helpers out of the pre-existing oversized activity
  normalizer file while leaving unrelated normalizers in place.

Out of scope:
- GitHub provider fetching changes.
- Persistence schema or migration changes.
- API route, UI, or dashboard rendering changes.

Acceptance Criteria:
- Normalized stats keep existing count fields while adding explicit sample
  metadata.
- Sample metadata states that counts are not repository-wide or lifetime
  totals.
- Gemini prompt/system instructions prohibit repository-wide or lifetime
  inferences from sampled activity.
- Tests cover zero merged pull requests in a sampled set without implying a
  repository-wide merged count.

Verification:
- `pnpm test:unit`
- `pnpm exec tsc --noEmit`
- `pnpm lint`
- `pnpm build`
- `git diff --check`

Commit:
- `fix(analysis): scope activity stats to sampled data`
