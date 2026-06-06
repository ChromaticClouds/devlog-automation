# Implementation Flow

## Purpose

This document defines the recommended implementation sequence for the MVP.

Functional requirement IDs remain stable for requirement traceability. They do
not always represent the safest implementation order because some user-facing
requirements depend on persistence, orchestration, API, and security work that
is not represented by a separate FR.

Each item in this flow must still be executed as a small task through the
workflow defined in `docs/harness-workflow.md`.

## Sequence Rules

- Keep the existing FR IDs and requirement definitions unchanged.
- Split a requirement into focused subtasks when UI, integration, and API work
  have different dependencies.
- Complete each technical gate before starting work that depends on it.
- Keep pure UI, Storybook, MSW, container, and real API work in the order
  defined by the UI harness rules in `AGENTS.md`.
- Keep mocks and real API responses aligned with `docs/api-contract.md`.

## MVP Implementation Sequence

### Phase 1: Analysis Building Blocks

These requirements establish the project-owned analysis pipeline components:

1. FR-002: Parse and validate a GitHub repository URL.
2. FR-003: Fetch recent commits.
3. FR-004: Fetch recent pull requests and issues.
4. FR-005: Fetch README and package metadata.
5. FR-006: Normalize collected GitHub activity.
6. FR-007: Send normalized activity to Gemini.
7. FR-008: Parse and validate the structured analysis result.

Completion condition:

- Each component has a project-owned input/output boundary.
- Provider failures are converted into project-owned errors.
- Focused unit tests pass.

### Phase 2: Result Presentation

1. FR-009a: Build the pure analysis result dashboard and Storybook states.
2. FR-010: Add Markdown copy behavior to the result presentation.

Completion condition:

- Full, sparse, and no-result states are covered.
- Markdown is rendered safely and can be copied.
- No real API dependency is required.

### Gate A: Database Readiness

Complete this gate before FR-011:

- Choose a PostgreSQL environment that supports Prisma migrations.
- Resolve the local Prisma migration connection failure.
- Create and verify the initial migration.
- Confirm Prisma Client can connect using the configured adapter.

Completion condition:

- A clean database can be created from committed migrations.
- Persistence tests can run against the selected test database strategy.

### Phase 3: Persistence and Analysis Execution

1. FR-011a: Upsert repository identity and store a validated analysis result in
   one persistence operation.
2. Technical task: Add an analysis orchestration service.
3. Technical task: Implement the real `POST /api/analyze` route.

The orchestration service connects the existing components in this order:

```text
parse repository URL
→ collect GitHub activity
→ normalize activity
→ request Gemini analysis
→ validate analysis result
→ persist repository and result
```

The API route must:

- Validate the request body.
- Call the orchestration service.
- Return the response defined in `docs/api-contract.md`.
- Map invalid input to `400`.
- Map provider and persistence processing failures to `500`.
- Map rate limits to `429`.
- Never expose raw provider or persistence errors.

Completion condition:

- A valid repository URL produces and stores one validated analysis result.
- The response includes `analysisId`, canonical repository identity, and the
  validated result.
- Failure responses follow the project error policy.

### Phase 4: User-Facing Analysis Flow

1. FR-001: Build the repository URL input and client-side validation.
2. FR-009b: Add the analysis container and connect it to the dashboard.
3. Technical task: Align MSW handlers with the real API contract.
4. Technical task: Connect the container to the real `POST /api/analyze` route.

Required states:

- idle
- loading
- success
- empty
- error
- retry

Completion condition:

- A user can enter a public GitHub repository URL and receive a rendered,
  persisted analysis result.
- MSW and real API responses use the same response shape.

### Phase 5: History

1. FR-011b: Add analysis history read operations.
2. FR-012: Add analysis history list and detail views.

Completion condition:

- Users can revisit stored analysis results.
- Missing analysis results return `404` using the project error shape.

### Gate B: Automation Security

Complete this gate before FR-013:

- Reject cron requests when `CRON_SECRET` is missing.
- Require an exact valid bearer token.
- Verify unauthorized requests return `401`.

Completion condition:

- A missing or invalid secret can never authorize an automation request.

### Phase 6: Automation and Logs

1. FR-013: Add manual automation test execution.
2. FR-014: Store and display automation execution logs.
3. Connect scheduled execution only after the manual flow is verified.

Completion condition:

- Manual and scheduled executions use the same analysis orchestration service.
- Every execution records a success or failure log without exposing raw
  provider errors.

## Cross-Cutting Corrections

Apply these corrections in the smallest relevant task:

| Correction | Required Before |
|---|---|
| Add `repository.url` to the `/api/analyze` MSW response | Phase 4 container integration |
| Use a working Storybook test command in task verification docs | Next Storybook task |
| Resolve and commit the initial Prisma migration | FR-011 persistence |
| Reject a missing `CRON_SECRET` | FR-013 automation |
| Revisit the pending Sonner/toast UI files only if integration testing or UX review requires toast-based feedback | Post-FR-010 UI integration |

## Issue Planning Rule

When selecting the next issue:

1. Find the next incomplete item in this document.
2. Confirm all preceding gates are complete.
3. Create one focused task document using `docs/task-template.md`.
4. Include the related FR ID in the task goal or scope.
5. Do not combine a technical gate, API integration, and UI integration into
   one issue unless they cannot be verified independently.
