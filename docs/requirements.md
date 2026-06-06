# Functional Requirements

## Project

DevLog Automator collects GitHub repository activity and generates reusable development logs, portfolio bullets, and next-task suggestions.

## Core Requirements

| ID | Requirement |
|---|---|
| FR-001 | Users can enter a GitHub repository URL. |
| FR-002 | The system validates and parses `owner/repo` from the URL. |
| FR-003 | The system fetches recent commits from GitHub. |
| FR-004 | The system fetches recent pull requests and issues. |
| FR-005 | The system fetches README and package metadata when available. |
| FR-006 | The system normalizes collected GitHub activity. |
| FR-007 | The system sends normalized activity to an LLM. |
| FR-008 | The system receives structured summary output. |
| FR-009 | The system renders the result dashboard. |
| FR-010 | Users can copy the result as Markdown. |
| FR-011 | The system stores analysis history. |
| FR-012 | Users can view previous analysis results. |
| FR-013 | The system provides manual automation test execution. |
| FR-014 | The system records automation logs. |

## UI States

Each major UI component should support:

- idle
- loading
- success
- empty
- error
- retry

## Out of Scope for MVP

- GitHub OAuth
- Private repository support
- Team account management
- Email sending
- Advanced analytics
