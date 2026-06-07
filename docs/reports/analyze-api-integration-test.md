# Analyze API Integration Test Report

## Summary

The real `POST /api/analyze` route was exercised against the local Next.js dev
server on June 7, 2026.

The successful request used the configured GitHub, Gemini, and PostgreSQL
integrations. Request validation cases were also sent directly to the running
route.

No environment values, credentials, provider responses, or raw internal errors
are included in this report.

## Environment

- Server: Next.js dev server at `http://localhost:3000`
- Endpoint: `POST /api/analyze`
- Repository: `https://github.com/ChromaticClouds/devlog-automation`
- Database: configured local PostgreSQL database
- External integrations: configured GitHub API and Gemini model

## Live HTTP Results

| Case | Expected | Observed | Result |
|---|---:|---:|---|
| Malformed JSON | `400` safe request message | `400` safe request message | Pass |
| Non-string `repoUrl` | `400` safe request message | `400` safe request message | Pass |
| Extra request field | `400` safe request message | `400` safe request message | Pass |
| Invalid repository URL | `400` safe URL message | `400` safe URL message | Pass |
| Valid public repository | `200` stored result | `200` stored result | Pass |

Observed safe error messages:

```json
{ "message": "Analyze request body is invalid." }
```

```json
{ "message": "GitHub repository URL is invalid." }
```

## Successful Response Checks

The successful response:

- returned `analysisId: 2`;
- returned the canonical repository owner, name, and URL;
- returned all validated result fields;
- completed GitHub collection, Gemini analysis, validation, and persistence;
- did not expose provider, model, Prisma, database, or stack-trace details.

The full generated analysis content is intentionally omitted from this report.

## Server Log Observations

The successful live request completed in approximately `10.6s`. Request
validation failures completed without server errors.

```text
POST /api/analyze 400
POST /api/analyze 400
POST /api/analyze 400
POST /api/analyze 400
POST /api/analyze 200 in 10.6s
```

The server error log was empty during the test run.

## Automated Verification

```text
pnpm exec tsc --noEmit  passed
pnpm test:unit          passed (128 tests)
pnpm lint               passed
pnpm build              passed
```

The production build recognized `/api/analyze` as a dynamic route.

## Coverage Boundaries

- `404`, `429`, and safe `500` mappings are covered by injected route unit
  tests rather than forcing live provider failures.
- Authentication, CORS, UI, MSW, history endpoints, and automation behavior are
  outside this task.
- This report records one local integration environment and is not a production
  load or security test.
