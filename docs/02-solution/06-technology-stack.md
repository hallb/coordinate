# Technology Stack

## Languages and Frameworks


| Technology   | Version | Purpose                                                                |
| ------------ | ------- | ---------------------------------------------------------------------- |
| TypeScript   | 5.x     | Primary language across all layers (ADR-004)                           |
| Vite         | 6.x     | Build tool and dev server for PWA                                      |
| UI framework | TBD     | Frontend component framework (React, Svelte, or Solid — to be decided) |
| Vitest       | 3.x     | Unit and integration test runner                                       |
| Stryker      | 8.x     | Mutation testing (`@stryker-mutator/vitest-runner`)                    |


### UI framework decision (pending)

The UI framework choice is deferred. Candidates:


| Framework          | Pros                                                       | Cons                                                    |
| ------------------ | ---------------------------------------------------------- | ------------------------------------------------------- |
| React              | Largest ecosystem, most hiring pool, extensive PWA tooling | Larger bundle, more boilerplate for simple UIs          |
| Svelte (SvelteKit) | Small bundle, less boilerplate, built-in reactivity        | Smaller ecosystem, fewer component libraries            |
| Solid              | React-like API with fine-grained reactivity, small bundle  | Smallest ecosystem of the three, less community support |


This will be captured in a separate ADR once evaluated.

## Infrastructure

MVP requires no server infrastructure. The PWA is served as static files.


| Component      | Technology                                | Notes                                  |
| -------------- | ----------------------------------------- | -------------------------------------- |
| Static hosting | GitHub Pages / Cloudflare Pages / Netlify | Free tier sufficient for MVP           |
| CI/CD          | GitHub Actions                            | Build, test, deploy pipeline (NFR-032) |
| Domain         | TBD                                       | Custom domain for the PWA              |


## Data Stores

All data is on-device per ADR-003 (local-first PWA).


| Store               | Technology                            | Purpose                                                  |
| ------------------- | ------------------------------------- | -------------------------------------------------------- |
| Structured data     | IndexedDB (via Dexie.js)              | Expenses, submissions, plans, balances, household config (ADR-009) |
| Asset caching       | Service Worker (Cache API)            | Offline app shell and static assets                      |
| Document references | Filesystem paths / cloud storage URLs | Supporting documents stored by reference (NFR-051)       |


### Storage technology (ADR-009)

Decided in [ADR-009](adr/009-storage-indexeddb-dexie.md): **IndexedDB via Dexie.js**. SQLite-WASM was rejected for MVP due to WASM bundle size, OPFS complexity, and weaker sync-path maturity.

## Third-Party Services

None for MVP. The product has zero runtime service dependencies.


| Service           | Phase   | Purpose                                       |
| ----------------- | ------- | --------------------------------------------- |
| (none for MVP)    | —       | —                                             |
| Sync relay (TBD)  | Phase 4 | Multi-user/multi-device sync                  |
| AI API (optional) | Future  | Document parsing, portal navigation (ADR-006) |


## Dev Tooling


| Tool                | Purpose                         |
| ------------------- | ------------------------------- |
| Vite                | Build, dev server, HMR          |
| Vitest              | Testing (unit, integration)     |
| ESLint              | Linting                         |
| Prettier            | Code formatting                 |
| TypeScript compiler | Type checking                   |
| Playwright          | E2E testing (browser)           |
| Stryker             | Mutation testing                |
| GitHub Actions      | CI/CD pipeline                  |
| axe / Lighthouse    | Accessibility testing (NFR-060) |
| Dexie.js            | IndexedDB wrapper, live queries, schema migrations (ADR-008, ADR-009) |
| Schema evolution    | Dexie built-in versioning (ADR-008 Path A)                       |


