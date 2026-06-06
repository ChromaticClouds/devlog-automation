# Harness Workflow

## Purpose

This document defines how DevLog Automator is built using harness engineering.

The goal is not only to build an AI-powered tool, but also to create a controlled workflow where AI agents can safely implement, verify, and document small pieces of functionality.

## Workflow

```text
issue
→ branch
→ plan
→ implement
→ verify
→ commit
→ PR
→ review
→ merge
```

## Task Unit

Each task should have:

- Goal
- Scope
- Files likely to change
- Acceptance criteria
- Verification command
- Suggested commit message

Suggested branches and commits must follow the Git conventions in `AGENTS.md`.

## Example Task

```md
## Task: Add repository URL form

Goal:
- Let users input a GitHub repository URL.

Scope:
- Repository URL input
- Client-side validation
- Submit event callback

Acceptance Criteria:
- Empty input shows an error.
- Invalid GitHub URL shows an error.
- Valid URL calls `onSubmit`.

Verification:
- Storybook states exist.
- `pnpm lint` passes.

Commit:
- feat(repository): add repository url form
```

## Agent Boundaries

Agents may:
- Add or edit files related to the current task.
- Add Storybook stories for new UI states.
- Add MSW handlers for API-driven states.
- Update docs when behavior changes.

Agents must not:
- Change unrelated architecture.
- Add dependencies without approval.
- Modify environment variables directly.
- Commit or push without permission.
- Remove existing tests or stories to make checks pass.

## Verification Loop

Use the smallest relevant verification set:

```bash
pnpm lint
pnpm build
pnpm build-storybook
```

For UI-only tasks, Storybook coverage is required before real API integration.
