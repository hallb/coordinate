# System Architecture

## System Context Diagram

Coordinate exists in the user's browser. It interacts with insurer portals only through the user's own authenticated sessions (via an optional browser extension in Phase 6). No backend server exists for MVP.

```mermaid
flowchart TB
    User["Insurance Manager"]
    Contributor["Contributor (Phase 4)"]

    Coordinate["Coordinate PWA\n(local-first, all data on-device)"]

    InsurerPortals["Insurer Portals (external)\nSun Life, Manulife, Blue Cross, etc."]
    HCSAPortals["HCSA/PHSP Portals (external)\nCoastal HSA, Benecaid, Olympia, etc."]
    CloudStorage["User Cloud Storage (external, optional)\nDropbox, iCloud, Google Drive"]

    User -->|"manages claims, configures plans"| Coordinate
    Contributor -->|"submits receipts, checks status"| Coordinate
    User -->|"submits claims, checks status\n(manual or via extension)"| InsurerPortals
    User -->|"submits HCSA claims"| HCSAPortals
    Coordinate -.->|"references supporting documents"| CloudStorage
```

### MVP boundaries

- Coordinate is a single-user, single-device PWA. No sync, no shared state.
- Insurer interaction is manual (guided by Coordinate). The browser extension is Phase 6.
- Contributor access (PER-002) is Phase 4.
- Cloud storage references are optional (NFR-051).

## Container Diagram

For MVP, there is a single deployable container: the PWA, served as static files.

```mermaid
flowchart TB
    User["User"]

    subgraph browser ["User's Browser"]
        PWA["Coordinate PWA\n(TypeScript, Vite)\nSingle-page app"]
        SW["Service Worker\nOffline caching"]
        Storage[("On-Device Storage\nIndexedDB / SQLite-WASM via OPFS\nExpenses, submissions, plans, balances")]
    end

    StaticHost["Static Host (external)\nGitHub Pages / Cloudflare Pages"]

    User --> PWA
    PWA --> Storage
    SW -.->|"caches assets, enables offline"| PWA
    StaticHost -->|"serves app bundle"| PWA
```

### Future containers (not in MVP)

- **Browser extension** (Phase 6): companion Chrome extension for insurer portal automation. Communicates with the PWA via messaging API.
- **Sync service** (Phase 4): lightweight relay or CRDT-based sync for multi-user/multi-device. Scope and technology TBD.

## Component Diagram

Internal structure of the PWA, following the onion architecture (ADR-001).

```mermaid
flowchart TB
    subgraph adaptersLayer ["Adapters"]
        UIComponents["UI Components"]
        StorageAdapter["Storage Adapter (IndexedDB / SQLite-WASM)"]
        DocRefAdapter["Document Reference Adapter"]
        NotificationAdapter["Notification Adapter (browser notifications)"]
    end

    subgraph applicationLayer ["Application"]
        SubmitExpense["SubmitExpenseUseCase"]
        RecordOutcome["RecordOutcomeUseCase"]
        GetRouting["GetRoutingRecommendationUseCase"]
        ConfigurePlan["ConfigurePlanUseCase"]
        TrackBalance["TrackBalanceUseCase"]
    end

    subgraph domainLayer ["Domain"]
        Expense["Expense"]
        Submission["Submission"]
        Plan["InsurancePlan"]
        Person["Person"]
        Household["Household"]
        RoutingEngine["RoutingEngine"]
        ClaimStateMachine["ClaimStateMachine"]
        BalanceTracker["BalanceTracker"]
        RepoPorts["Repository Ports"]
        ServicePorts["Service Ports"]
    end

    UIComponents --> SubmitExpense
    UIComponents --> RecordOutcome
    UIComponents --> GetRouting
    UIComponents --> ConfigurePlan
    UIComponents --> TrackBalance

    SubmitExpense --> Expense
    SubmitExpense --> ClaimStateMachine
    SubmitExpense --> RepoPorts
    RecordOutcome --> ClaimStateMachine
    RecordOutcome --> RoutingEngine
    RecordOutcome --> BalanceTracker
    RecordOutcome --> RepoPorts
    GetRouting --> RoutingEngine
    ConfigurePlan --> Plan
    ConfigurePlan --> RepoPorts
    TrackBalance --> BalanceTracker
    TrackBalance --> RepoPorts

    StorageAdapter -.->|implements| RepoPorts
    DocRefAdapter -.->|implements| ServicePorts
    NotificationAdapter -.->|implements| ServicePorts
```

## Data Flow

### Core claim lifecycle flow

```mermaid
sequenceDiagram
    actor User
    participant UI as UI Components
    participant UC as Use Cases
    participant SM as ClaimStateMachine
    participant RE as RoutingEngine
    participant BT as BalanceTracker
    participant Store as Storage Adapter

    User->>UI: Enter new expense
    UI->>UC: SubmitExpenseUseCase(expenseData)
    UC->>Store: persist expense
    UC->>RE: getNextPlan(expense, config, balances)
    RE-->>UC: recommended plan + explanation
    UC-->>UI: show routing recommendation

    User->>UI: Record submission to recommended plan
    UI->>UC: RecordSubmissionUseCase(expenseId, planId, submissionData)
    UC->>SM: transition(submitted)
    UC->>Store: persist submission

    User->>UI: Record adjudication outcome
    UI->>UC: RecordOutcomeUseCase(submissionId, outcome)
    UC->>SM: transition(paid_partial | paid_full | rejected_* | ...)
    UC->>BT: updateBalance(plan, category, person, amountPaid)
    UC->>Store: persist outcome + updated balances

    alt Remaining balance > 0 and plans available
        UC->>RE: getNextPlan(expense, config, updatedBalances)
        RE-->>UC: next plan + explanation
        UC-->>UI: show next routing recommendation
    else Balance = 0
        UC->>SM: transition(closed_zero)
        UC-->>UI: expense fully reimbursed
    else No plans remaining
        UC->>SM: transition(closed_oop)
        UC-->>UI: expense closed with out-of-pocket remainder
    end
```
