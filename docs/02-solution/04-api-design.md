# API and Interface Design

## No External API (MVP)

Coordinate MVP has no backend server and therefore no external HTTP API. The application runs entirely in the user's browser as a local-first PWA. All data is stored on-device in IndexedDB (via Dexie.js). There are no network calls originated by the app itself — the only external interactions are the user manually navigating to insurer portals in a separate browser tab.

The internal "interface boundary" is the **application use case layer**, consumed directly by UI components. This is documented below as a reference for implementers.

## Internal Use Case Interface

UI components call use cases through typed ports. Each use case is a single-responsibility command or query.

| Use Case | Type | Purpose |
|---|---|---|
| `SubmitExpenseUseCase` | Command | Create a new expense and get an initial routing recommendation |
| `RecordSubmissionUseCase` | Command | Record that an expense was submitted to a specific plan |
| `RecordOutcomeUseCase` | Command | Record an adjudication outcome; triggers balance update and next routing recommendation |
| `GetRoutingRecommendationUseCase` | Query | Return the recommended next plan for an expense, with explanation |
| `ConfigurePlanUseCase` | Command | Create or update a Coverage (plan), its members, benefit categories, and annual maxima |
| `TrackBalanceUseCase` | Query | Return current balance state for one or more plans |
| `GenerateReportUseCase` | Query | Produce a summary of expenses and reimbursements for a given period |
| `CheckAlertsUseCase` | Query | Evaluate balance thresholds and return any active alerts |

## Authentication and Authorization

No authentication is required for MVP — all data is scoped to the user's own device and browser origin. There is no server to authenticate against.

Phase 4 (Contributor access) and Phase 6 (browser extension) will introduce identity concerns; those will be documented when the relevant sync service and extension messaging API are designed.

## Error Handling

Use cases return typed result objects (success or typed error). There are no HTTP status codes. Errors fall into three categories:

- **Validation errors** — invariant violations in the domain (e.g. submitting to a plan with no remaining balance, recording an outcome for an unknown submission). Surfaced directly to the UI.
- **Storage errors** — IndexedDB failures (rare; typically quota exceeded). Treated as fatal for the operation; the UI prompts the user to free space.
- **Unexpected errors** — all others; logged and surfaced as a generic error message.

## Future Interfaces

| Phase | Interface | Notes |
|---|---|---|
| Phase 4 | Sync / relay service | Multi-user/multi-device. Technology TBD (CRDT-based or lightweight relay). Will require authentication. |
| Phase 6 | Browser extension messaging API | Chrome extension communicates with the PWA via the browser's extension messaging API to automate insurer portal interactions. |

## Versioning Strategy

Not applicable for MVP (no external API). When a sync service or extension API is introduced, versioning strategy will be defined at that time.
