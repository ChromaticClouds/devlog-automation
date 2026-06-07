# Task: Prepare Prisma Migration Readiness

## Goal

Make the current Prisma schema usable for FR-011 persistence work by choosing a
working PostgreSQL migration path, committing the initial migration, and
verifying Prisma Client generation.

## Scope

- Use the existing `prisma/schema.prisma` models as the intended MVP schema.
- Confirm the local PostgreSQL strategy for `DATABASE_URL` and
  `SHADOW_DATABASE_URL`.
- Avoid the known local Prisma dev database path that closes connections during
  `prisma migrate dev`.
- Create the initial Prisma migration under `prisma/migrations`.
- Verify that a clean database can be created from the committed migration.
- Verify that Prisma Client generation still targets `app/generated/prisma`.
- Document any required local database setup that is not safe to encode in
  committed environment files.

## Files Likely to Change

- `prisma/migrations/**`
- `prisma.config.ts`
- `prisma/schema.prisma`
- `docs/tasks/gate-a-prisma-migration-readiness.md`
- Optional: `docs/implementation-flow.md`
- Optional: `.env.example` if the project adds a committed environment template

## Acceptance Criteria

- The project has a committed initial migration matching the current
  `Repository`, `AnalysisResult`, and `AutomationLog` models.
- `pnpm db:migrate` succeeds against the selected local PostgreSQL strategy.
- `pnpm db:generate` succeeds after migration.
- The migration flow does not require committing `.env`, secrets, local database
  files, or provider-specific credentials.
- The task notes how `DATABASE_URL` and `SHADOW_DATABASE_URL` should be
  configured locally.
- The generated Prisma Client output remains compatible with existing imports
  from `app/generated/prisma/client`.
- No FR-011 persistence service, API route, UI integration, or automation logic
  is introduced.
- Lint and build still pass after the migration files are added.

## Local PostgreSQL Setup

Use two local PostgreSQL databases for migration verification:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/devlog_automator"
SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/devlog_automator_shadow"
```

The shadow database must be separate from the main database because Prisma uses
it to validate migration history during `prisma migrate dev`.

Keep these values in local environment files only. Do not commit `.env`,
database files, tokens, or provider credentials.

Avoid the local Prisma dev database path for this gate because it has previously
closed connections during `prisma migrate dev`; use a regular PostgreSQL
instance that accepts stable local connections instead.

## Verification

```bash
pnpm db:migrate
pnpm db:generate
pnpm lint
pnpm build
```

## Suggested Branch

```text
chore/prisma-migration-readiness
```

## Suggested Commit

```text
chore(prisma): prepare migration readiness
```
