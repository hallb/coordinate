# ADR-005: Browser Extension for Insurer Portal Automation

| Field | Value |
|-------|-------|
| Status | accepted |
| Date | 2026-03-15 |
| Deciders | Ben (PER-001 / STK-008) |

## Context

Insurer integration is delivered in three progressive tiers (FR-090 through FR-092):

1. **Guided manual submission** (FR-090, Phase 2): step-by-step instructions per insurer.
2. **Automated status retrieval** (FR-091, Phase 6): read claim status from insurer portals.
3. **Automated claim submission** (FR-092, Phase 6): submit claims via insurer portals.

Two hard constraints shape the integration approach:

- **CON-002**: Major Canadian insurers do not offer public APIs. Portal UIs change without notice.
- **CON-003**: Insurer portals require per-user authentication with SMS-based 2FA tied to the plan holder's device.

And a critical security requirement:

- **NFR-041**: Coordinate must never store, transmit, or log insurer portal credentials. Any automation must operate in a session controlled by the user.

These constraints rule out server-side scraping, headless browser automation from a backend, and any approach that routes credentials through Coordinate.

## Decision

Build a **companion Chrome extension** (Manifest V3) for insurer portal automation (Phases 2 and 6).

### Architecture

- **Content scripts** inject into insurer portal pages (matched by URL patterns per insurer). They read DOM state (claim status, EOB details, form fields) and can fill forms and trigger submissions.
- **Service worker** (background script) manages communication between content scripts and the Coordinate PWA. Handles message routing and keepalive pings (Chrome terminates idle service workers after 30 seconds).
- **Communication with PWA**: the extension and the Coordinate PWA communicate via `chrome.runtime.sendMessage` (if the PWA is an extension page), `postMessage` (if same origin), or a local WebSocket. The specific mechanism depends on the PWA's origin model and will be decided during implementation.

### Per-insurer adapters

Each insurer portal requires an adapter in the content script layer that knows:

- URL patterns for the portal's key pages (claim list, claim detail, submission form)
- DOM selectors for extracting claim status, amounts, dates, and EOB links
- Form field mappings for filling submission forms
- Event dispatch patterns for React/Vue-based portals (e.g., `dispatchEvent(new Event('input', {bubbles: true}))`)

These adapters are inherently fragile (CON-002) and must be treated as a maintenance surface — portal changes will break them.

### Credential handling

The extension never accesses, stores, or transmits credentials. It piggybacks on the user's existing authenticated session in their browser. The user logs in normally (including 2FA); the extension reads and interacts with the authenticated page state.

### Phase alignment

- **Phase 2**: the extension can optionally provide insurer-specific context (e.g., detect which portal page the user is on and surface relevant Coordinate guidance). This is lightweight and doesn't require DOM manipulation.
- **Phase 6**: full status retrieval and automated submission via content script DOM interaction.

### Domain integration

The core domain defines an `InsurerPortalAdapter` port (interface) in `src/domain/` with operations like:

- `getClaimStatus(submissionRef): ClaimStatusResult`
- `submitClaim(claimData): SubmissionResult`

The browser extension is one adapter implementation. The manual/guided workflow (FR-090) is another implementation that returns guidance text instead of performing actions.

## Consequences

### Positive

- Operates entirely in the user's authenticated browser session — satisfies NFR-041 without any credential handling.
- No server-side infrastructure needed for insurer interaction.
- The extension can be distributed via the Chrome Web Store or side-loaded.
- Per-insurer adapters can be developed incrementally — start with Ben's insurers (PER-001), add others as users require them.

### Negative

- Content script adapters are fragile. Insurer portal redesigns will break selectors. Requires ongoing maintenance per supported insurer.
- Chrome-only initially. Firefox and Safari extension APIs differ. Cross-browser support adds development effort.
- Manifest V3 service workers have lifecycle constraints (30-second idle timeout, no persistent background pages). Requires keepalive strategies for longer automation sequences.
- Sobia's 2FA problem (PER-001): automating interactions on Sobia's portals still requires Sobia's 2FA on her device. The extension cannot bypass this — it can only reduce the number of times portal access is needed by caching retrieved status locally.

### Neutral

- The extension is a separate artifact from the PWA — separate codebase, separate distribution, separate versioning. This adds project structure but keeps concerns cleanly separated.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Server-side scraping (Puppeteer/Playwright on a backend) | Requires routing insurer credentials through Coordinate's server — violates NFR-041. Cannot handle user-specific 2FA. |
| Native desktop automation (Selenium, AppleScript) | Requires a native application. Incompatible with the PWA deployment model (ADR-003). Platform-specific. |
| Insurer API integration | No public APIs exist for major Canadian insurers (CON-002). If APIs become available, they would be a preferred alternative — the `InsurerPortalAdapter` port supports swapping the implementation. |
| No automation (manual-only forever) | Viable for MVP and early phases, but manual submission and status checking is the core pain point the product addresses. Guided manual (FR-090) is the baseline; automation is the aspiration. |
