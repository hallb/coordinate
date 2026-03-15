---
name: adr-author
description: Author Architecture Decision Records (ADRs) in docs/02-solution/adr/. Use when creating, updating, or reviewing ADRs, or when the user mentions architectural decisions, ADR, or decision records.
---

# ADR Author

ADRs live in **docs/02-solution/adr/**. Each ADR captures a single architectural decision with its context, rationale, and consequences.

## File conventions

- **Filename**: `NNN-title-slug.md` (e.g., `001-ports-and-adapters.md`). Zero-padded to three digits.
- **Index**: `docs/02-solution/adr/00-index.md` lists all ADRs. Update it whenever you create or change an ADR's status.
- **One decision per file.** If a decision supersedes another, link them.

## Template

```markdown
# ADR-NNN: Title

| Field | Value |
|-------|-------|
| Status | proposed \| accepted \| rejected \| deprecated \| superseded by [ADR-NNN](NNN-slug.md) |
| Date | YYYY-MM-DD |
| Deciders | who participated |

## Context

Why this decision is needed. Reference requirements (FR-NNN, NFR-NNN, CON-NNN, etc.) and constraints that shape the decision space.

## Decision

What we decided and why. Be specific — name technologies, patterns, or approaches.

## Consequences

### Positive

- What improves or becomes possible.

### Negative

- What becomes harder, what tradeoffs we accept.

### Neutral

- Observations that are neither good nor bad.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Option A | Reason |
| Option B | Reason |
```

## Traceability

Every ADR must reference the requirement IDs it addresses. Use the project's typed ID system (FR-NNN, NFR-NNN, CON-NNN, PER-NNN, ASM-NNN, etc.) — see the `doc-unique-identifiers` rule for the full list.

## Status transitions

- New ADRs start as **proposed**.
- Mark **accepted** once the decision is confirmed.
- Mark **rejected** if the option was seriously evaluated and deliberately declined. Use this when the decision is worth preserving for future reference (e.g., it may resurface, or the reasoning is non-obvious). Brief rejections are better captured in the "Alternatives Considered" table of an accepted ADR.
- Mark **deprecated** if a previously accepted decision is no longer relevant.
- Mark **superseded by [ADR-NNN]** when a newer ADR replaces a previously accepted one.

## Updating the index

After creating or changing an ADR, update `docs/02-solution/adr/00-index.md`:

```markdown
| NNN | [Title](NNN-slug.md) | Status | Date | Summary |
```
