<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Overview

DevLog Automator is a small work-automation tool that collects GitHub repository activity and converts it into reusable development logs, portfolio bullets, and next-task suggestions using an LLM.

The project is developed with a harness engineering approach:
- Keep work units small.
- Define contracts before implementation.
- Verify UI states with Storybook/MSW.
- Verify code changes before commit.
- Let agents work only inside clearly scoped tasks.

## Git conventions

### Branch names

- Use the format `<type>/<short-kebab-case-description>`.
- Keep names lowercase, concise, and descriptive.
- Use one of these branch types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `hotfix`.
- Include a lowercase issue identifier after the type when one exists, for example `feat/dev-123-daily-analysis`.
- Do not use personal names, vague descriptions, spaces, underscores, or uppercase letters.

Examples:

- `feat/daily-analysis-cron`
- `fix/dev-123-prisma-connection`
- `docs/git-conventions`

### Commit messages

- Follow Conventional Commits using the format `<type>(<optional-scope>): <summary>`.
- Use one of these commit types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `build`, `ci`, `perf`, `revert`.
- Write the summary in imperative mood, lowercase, without a trailing period.
- Keep the summary concise, preferably no longer than 72 characters.
- Keep each commit focused on one logical change.
- Add a body when the reason or impact is not clear from the summary.
- Mark breaking changes with `!` before the colon and explain them in a `BREAKING CHANGE:` footer.

Examples:

- `feat(cron): add daily repository analysis`
- `fix(prisma): handle database connection timeout`
- `docs: add git conventions`
- `feat(api)!: change analysis response schema`


## Tech Stack

- Next.js App Router
- TypeScript
- Route Handlers
- Prisma + PostgreSQL
- Gemini API
- TanStack Query
- Storybook
- MSW
- Vercel / Vercel Cron

## Working Rules

1. Work on one issue or task at a time.
2. Check existing files before creating new ones.
3. Prefer small, focused changes.
4. Do not rewrite unrelated files.
5. Do not introduce new libraries without explaining why.
6. Do not commit secrets, `.env` files, tokens, API keys, or local DB files.
7. When a user asks to execute a harness task, complete the full cycle by
   default: create or update the task branch, implement, verify, commit, push,
   and open a PR. Stop before commit, push, or PR only when verification fails,
   secrets or unsafe files would be included, destructive git operations are
   required, or the user explicitly asks to pause before those steps.
8. When a source file exceeds 200 lines, or a change would push it past 200
   lines, prefer splitting focused types, helpers, or tests into separate files.
   Keep an oversized file only when the split would reduce clarity, and explain
   the exception in the task or PR notes.

## Verification Commands

Run relevant checks before proposing a commit:

```bash
pnpm lint
pnpm build
pnpm build-storybook
```

If a command fails:
- Do not hide the failure.
- Explain the cause.
- Suggest the smallest next fix.

## UI Harness Rules

Components should be developed in this order:

1. Pure UI component
2. Storybook states
3. MSW API mock
4. Container integration
5. Real API connection

Required states:
- idle
- loading
- success
- empty
- error
- retry

## API Rules

Route Handlers must return predictable JSON shapes.

All error responses must use this format:

```json
{
  "message": "Error message"
}
```

- Return `400 Bad Request` for business failures caused by invalid input or an invalid requested action.
- Return `500 Internal Server Error` for business failures caused while processing the request, including provider and persistence failures.
- Use these status codes for non-business exceptions:
  - `401 Unauthorized`: authentication is missing or invalid.
  - `403 Forbidden`: authentication succeeded but access is not allowed.
  - `404 Not Found`: the requested resource does not exist.
  - `405 Method Not Allowed`: the HTTP method is unsupported.
  - `409 Conflict`: the request conflicts with the current resource state.
  - `429 Too Many Requests`: a rate limit has been exceeded.

Do not expose raw provider errors from GitHub, Gemini, Prisma, or Vercel.
