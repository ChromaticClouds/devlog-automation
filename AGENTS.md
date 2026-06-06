<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Git conventions

### Branch names

- Use the format `<type>/<short-kebab-case-description>`.
- Keep names lowercase, concise, and descriptive.
- Use one of these branch types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `hotfix`.
- Include an issue identifier after the type when one exists, for example `feat/DEV-123-daily-analysis`.
- Do not use personal names, vague descriptions, spaces, underscores, or uppercase letters.

Examples:

- `feat/daily-analysis-cron`
- `fix/DEV-123-prisma-connection`
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
