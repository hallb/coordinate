# ADR-006: AI as Optional Adapter

| Field | Value |
|-------|-------|
| Status | accepted |
| Date | 2026-03-15 |
| Deciders | Ben (PER-001 / STK-008) |

## Context

Several areas of Coordinate could benefit from AI capabilities:

- **Document parsing**: extracting structured data from receipts, EOBs, and provider invoices (FR-002, FR-061). These documents have inconsistent formats across providers and insurers.
- **Portal navigation**: interpreting unfamiliar or changed insurer portal layouts for automated interaction (ADR-005, CON-002).
- **Smart suggestions**: predicting likely expense values based on history (FR-003).

However, runtime AI use raises significant concerns:

- **Privacy** (NFR-001 through NFR-007): sending health and financial documents to cloud AI services exposes the most sensitive data in the system. This directly conflicts with the local-first privacy model (ADR-003).
- **Cost** (CON-004): per-request AI API costs add up. For a founder-funded product targeting near-zero operational cost, this is a material concern.
- **Determinism** (NFR-008): the no-overclaim invariant and COB routing rules must be deterministic. AI-generated outputs in these paths would introduce non-deterministic behavior into safety-critical logic.
- **Reliability**: AI outputs require validation. For structured data extraction, an incorrect parse could lead to wrong routing or missed claims.

## Decision

AI is an **optional adapter behind domain port interfaces**. The core domain never depends on AI.

### Principles

1. **Core domain is AI-free.** The routing engine, claim state machine, balance tracker, and all business rule enforcement use deterministic logic only. No LLM calls in the domain or application layers.

2. **AI capabilities are expressed as ports.** The domain defines interfaces for capabilities that could be AI-powered:
   - `DocumentParser`: extract structured data (provider, date, amount, category) from a document image or PDF.
   - `PortalPageInterpreter`: identify form fields and data elements on an unfamiliar portal page.
   - `SuggestionEngine`: predict likely field values for expense entry.

3. **MVP implementations are manual.** For MVP, the `DocumentParser` port has a no-op implementation — the user enters data manually. The port exists so AI can be plugged in later without changing the domain or application layers.

4. **Prefer local/on-device AI.** When AI adapters are implemented, prefer on-device models (e.g., browser-native ML, ONNX runtime in WASM, or local LLM via Ollama) to preserve the local-first privacy model. Cloud AI is acceptable only with explicit user consent and data minimization (send only the specific document, not the full dataset).

5. **AI at build time is unconstrained.** Using AI as a developer tool — to generate insurer-specific portal adapters, analyze EOB formats, write test fixtures, or draft submission guidance content — has no runtime cost or privacy impact and is encouraged.

### Validation requirement

Any AI-generated structured output (e.g., parsed receipt data) must be presented to the user for confirmation before it enters the domain. AI outputs are suggestions, never authoritative data.

## Consequences

### Positive

- The product works without any AI dependency — no API keys, no cloud services, no per-request costs for the core workflow.
- Privacy is preserved: no health or financial data is sent to external AI services unless the user explicitly opts in.
- The no-overclaim invariant (NFR-008) and COB routing remain deterministic and auditable.
- AI capabilities can be added incrementally as the technology matures (especially on-device models) without architectural changes.

### Negative

- MVP requires manual data entry for all expenses. If this proves too burdensome (ASM-003), AI-powered document parsing may need to be prioritized earlier than planned.
- On-device AI models may not match cloud model quality for document parsing. Users may need to correct AI suggestions frequently, reducing the benefit.

### Neutral

- This decision can be revisited per-capability. If a specific AI integration (e.g., receipt OCR) proves high-value and low-risk, it can be added as an adapter without changing this ADR's core principle of AI-as-optional-adapter.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| AI-first architecture (LLM orchestrates the workflow) | Makes the entire system non-deterministic. Introduces cloud API dependency and cost into every interaction. Safety-critical logic (overclaim prevention, COB routing) must be deterministic. |
| Cloud AI for document parsing from day one | Conflicts with local-first privacy model (ADR-003). Adds cost. Receipt entry is manageable manually for MVP scale (single household, tens of expenses per month). |
| No AI consideration at all | Leaves no architectural seam for future AI integration. Better to define the ports now (zero implementation cost) so AI adapters can be plugged in cleanly later. |
