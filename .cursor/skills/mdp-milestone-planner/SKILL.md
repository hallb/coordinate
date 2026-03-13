---
name: mdp-milestone-planner
description: Create and review Markdown Projects milestones in ~/work/ai-coordinate/coordinate-planner. Use when defining milestones, checking progress, or doing weekly/cadence planning.
---

# MDP milestone planner

Milestones live in **~/work/ai-coordinate/coordinate-planner**. Use `mdp` with `-p ~/work/ai-coordinate/coordinate-planner`. Ensure `$HOME/.bun/bin` is in PATH.

## Create milestone

```bash
mdp milestone create -p ~/work/ai-coordinate/coordinate-planner -t "Milestone title" \
  --due-date 2026-04-01 \
  --status Planning|Active|On Hold|Completed
```

## Progress and rollup

```bash
mdp milestone progress -p ~/work/ai-coordinate/coordinate-planner --id M-N
mdp milestone list -p ~/work/ai-coordinate/coordinate-planner
mdp milestone get -p ~/work/ai-coordinate/coordinate-planner --id M-N
```

## Update milestone

```bash
mdp milestone update -p ~/work/ai-coordinate/coordinate-planner --id M-N --status Active --due-date 2026-05-01
```

## Milestone log

```bash
mdp milestone log add -p ~/work/ai-coordinate/coordinate-planner --id M-N -b "Gate passed; scope frozen"
```

## Cadence checklist

- **Weekly**: Run `mdp milestone progress -p ~/work/ai-coordinate/coordinate-planner --id M-N` for active milestones; add log entries for risks or carry-over.
- **Gate completion**: Update milestone status to Completed when all linked issues are Done; add a log entry summarizing the gate.
- **New phase**: Create next milestone and move or create issues under it.

## Current milestone set (coordinate-planner)

- M-1 Problem & alignment baseline  
- M-2 User/scope freeze (MVP)  
- M-3 Risk-driven planning gate  
- M-4 Solution architecture baseline  
- M-5 Delivery readiness gate  
