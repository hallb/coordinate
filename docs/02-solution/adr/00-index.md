# Architecture Decision Records

This directory captures significant architectural decisions for Coordinate. Each ADR records the context, decision, consequences, and alternatives for a single decision.

For authoring guidance, see the [ADR Author skill](../../../.cursor/skills/adr-author/SKILL.md).

## ADR Register

| # | Decision | Status | Date | Summary |
|---|----------|--------|------|---------|
| 001 | [Onion / Ports-and-Adapters Architecture](001-ports-and-adapters.md) | accepted | 2026-03-15 | Core domain has zero external dependencies; adapters implement domain-defined ports |
| 002 | [Claim Lifecycle as Domain State Machine](002-claim-lifecycle-state-machine.md) | accepted | 2026-03-15 | Pure domain state machine for claim states; no external workflow engine |
| 003 | [Local-First PWA Deployment Model](003-local-first-pwa.md) | accepted | 2026-03-15 | Data on-device, app served as static files, sync deferred to Phase 4 |
| 004 | [TypeScript as Primary Language](004-typescript-primary-language.md) | accepted | 2026-03-15 | TypeScript for core domain, PWA frontend, and browser extension |
| 005 | [Browser Extension for Insurer Portal Automation](005-browser-extension-insurer-automation.md) | accepted | 2026-03-15 | Chrome extension piggybacks on user session; Phase 6 implementation |
| 006 | [AI as Optional Adapter](006-ai-optional-adapter.md) | accepted | 2026-03-15 | AI behind domain port interfaces; not in core, not in MVP |
| 007 | [CLI Dropped; PWA Sole Entry Point](007-cli-dropped.md) | accepted | 2026-03-17 | CLI removed; PWA-only architecture; separate data store deemed unacceptable |
| 008 | [Schema Evolution for Local Storage](008-schema-evolution.md) | accepted | 2026-03-17 | Flyway-style versioned migrations; Dexie built-in or custom runner per storage path |
