# Infrastructure and Deployment

Coordinate MVP is a local-first PWA served as static files. There is no backend server, no database server, and no runtime infrastructure to manage. This document describes the deployment model, CI/CD pipeline, and observability posture for MVP.

## Environment Strategy

MVP has two environments:

| Environment | Purpose | How it runs |
|-------------|---------|-------------|
| Development | Local development and debugging | `vite dev` on the developer's machine. Hot module replacement (HMR) enabled. Uses the same IndexedDB instance as the local browser profile. |
| Production  | Live application served to users | Static files deployed to GitHub Pages. Service worker provides offline support and asset caching. |

**No staging environment for MVP.** A single maintainer (CON-004) deploying a purely client-side application does not need a dedicated staging gate. GitHub Pages does not natively support per-PR preview deployments; manual verification is performed by building locally (`vite build && vite preview`) before merging to the deploy branch.

**Future**: A staging environment becomes relevant when a sync service (Phase 4) introduces server-side state that warrants pre-production validation.

## Deployment Model

### Static file deployment

The Vite build produces a `dist/` directory containing HTML, JavaScript, CSS, and a service worker manifest. This directory is deployed to **GitHub Pages** as a static site. No containers, serverless functions, or VMs are involved.

| Component | Technology | Notes |
|-----------|-----------|-------|
| Build tool | Vite 6.x | Produces optimized static bundle in `dist/` |
| Static host | GitHub Pages | Free tier. Serves over HTTPS with GitHub's TLS certificate. |
| Custom domain | TBD | GitHub Pages supports custom domains with automatic HTTPS via Let's Encrypt. |

### Service worker

`vite-plugin-pwa` (backed by Workbox) generates a precaching service worker that enables offline use:

- **Precache strategy**: The app shell (HTML, JS, CSS) is precached on install. All assets are versioned by content hash.
- **Update strategy**: Stale-while-revalidate for the app shell. When a new version is available, the service worker is updated in the background. The user sees the new version on the next navigation (no forced reload).
- **Offline support**: All local operations (expense entry, routing, balance queries) work offline because data is in IndexedDB and the app shell is cached. The offline indicator in the UI surfaces when `navigator.onLine === false`.

### Deploy trigger

Deployment to GitHub Pages is triggered automatically by the CI/CD pipeline on successful merge to the `main` branch. There is no manual deployment step (NFR-032).

## CI/CD Pipeline

GitHub Actions runs on every push to `main` and on every pull request targeting `main`.

### Pipeline stages

```
push / PR → Install → Lint & Type-check → Unit + Integration Tests → E2E Tests → Build → Deploy (main only)
```

| Stage | Command | Runs on | Notes |
|-------|---------|---------|-------|
| Install | `npm ci` | All triggers | Locked dependencies only |
| Lint & Type-check | `eslint . && tsc --noEmit` | All triggers | Catches style and type errors before tests run |
| Unit + Integration tests | `vitest run` | All triggers | Domain logic, use case orchestration, Dexie integration via `fake-indexeddb` |
| E2E tests | `npx playwright test` | All triggers | Chromium via Playwright. Includes `@axe-core/playwright` accessibility checks (NFR-060). |
| Build | `vite build` | All triggers | Produces `dist/` with service worker manifest |
| Deploy | GitHub Pages deploy action | `main` only | Pushes `dist/` to the `gh-pages` branch or uses the Pages deploy action |

### Mutation testing

Stryker (`stryker run`) is run as a **separate scheduled job** (e.g., nightly or weekly) rather than on every push. Mutation testing is computationally expensive and its value is in trend monitoring, not gating individual commits.

### Lighthouse CI

Lighthouse CI runs against the built application (`vite preview`) as a post-build step:

- **Performance score**: >= 90
- **Accessibility score**: >= 90 (NFR-060)
- **Best practices score**: >= 90

Scores below the threshold fail the pipeline.

## Infrastructure as Code

Not applicable for MVP. GitHub Pages is configured via the repository's Settings tab or a minimal workflow file. No Terraform, Pulumi, CDK, or equivalent tooling is needed for static file hosting.

**Future**: If a sync service (Phase 4) introduces server-side infrastructure, IaC becomes relevant and the tooling choice will be made at that time.

## Observability

### MVP observability posture

There is no server to monitor. Observability for a local-first PWA focuses on build-time quality gates and opt-in client-side error reporting.

| Signal | Mechanism | Notes |
|--------|-----------|-------|
| Build health | GitHub Actions status checks | Pipeline pass/fail visible on every PR and merge |
| Performance regression | Lighthouse CI in pipeline | Performance budget enforced on every build |
| Accessibility regression | `@axe-core/playwright` + Lighthouse CI | WCAG 2.1 AA violations fail the pipeline (NFR-060) |
| Runtime errors | React error boundary | Catches unhandled rendering errors, displays fallback UI |
| Client-side error reporting | Sentry (optional, opt-in) | Requires explicit user consent (NFR-001). No PII in reports. Stack traces and browser metadata only. |
| Service worker status | `vite-plugin-pwa` registration callbacks | Logs SW lifecycle events (install, activate, update) to console |

### Future (Phase 4+)

When a sync service exists, server-side observability is required (NFR-031):

- Structured logging (JSON format) for all sync operations.
- Health check endpoint for uptime monitoring.
- Error tracking for sync failures and conflict resolution.
- Dashboarding for sync latency and active connection count.
