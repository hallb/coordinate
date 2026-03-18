# Technology Stack

## Languages and Frameworks


| Technology   | Version | Purpose                                                                |
| ------------ | ------- | ---------------------------------------------------------------------- |
| TypeScript   | 5.x     | Primary language across all layers (ADR-004)                           |
| React        | 19.x    | UI framework                                                           |
| Ant Design   | 5.x     | Component library (Form, Steps, Table, Timeline, Drawer, Statistic)    |
| React Router | 7.x     | Client-side routing (`/claims`, `/plans`, `/settings`)                 |
| Vite         | 6.x     | Build tool and dev server for PWA                                      |
| Vitest       | 3.x     | Unit and integration test runner                                       |
| Stryker      | 8.x     | Mutation testing (`@stryker-mutator/vitest-runner`)                    |

React + Ant Design was selected for the fastest path to working MVP screens. AntD's built-in component set maps directly to the claim lifecycle UI — multi-step wizards, submission timelines, balance statistics, and coverage drawers. Custom design tokens in AntD 5 soften the default enterprise aesthetic. See [UI/UX](05-ui-ux.md) for the full technology direction rationale. A dedicated ADR will record the formal decision.

## Infrastructure

MVP requires no server infrastructure. The PWA is served as static files.


| Component      | Technology     | Notes                                  |
| -------------- | -------------- | -------------------------------------- |
| Static hosting | GitHub Pages   | Free tier sufficient for MVP           |
| CI/CD          | GitHub Actions | Build, test, deploy pipeline (NFR-032) |
| Domain         | TBD            | Custom domain for the PWA              |


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


