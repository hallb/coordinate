---
name: mdp-issue-manager
description: Create and update Markdown Projects issues in ~/work/ai-coordinate/coordinate-planner. Use when creating issues, updating status, adding logs or checklists, or managing blocked-by/parent/relatedTo.
---

# MDP issue manager

Planning lives in **~/work/ai-coordinate/coordinate-planner**. Use `mdp` with `-p ~/work/ai-coordinate/coordinate-planner` (or `$MDP_PLANNER`). Ensure `$HOME/.bun/bin` is in PATH for `mdp`.

## Create issue

```bash
mdp issue create -p ~/work/ai-coordinate/coordinate-planner -t "Title" --type task|feature|bug|chore|spike \
  --milestone M-1 \
  -l documentation \
  --blocked-by ISS-1,ISS-2 \
  --parent ISS-1 \
  --checklist "Step one","Step two"
```

## Update issue

```bash
mdp issue update -p ~/work/ai-coordinate/coordinate-planner --id ISS-N \
  --status "To Do"|"In Progress"|"Done" \
  --assignee agent-1 \
  --add-checklist "New item" \
  --check "Done item" \
  --spent 2
```

## Log entry

```bash
mdp issue log add -p ~/work/ai-coordinate/coordinate-planner --id ISS-N -b "Progress note or decision"
```

## Batch create (JSON stdin)

```bash
echo '[
  {"title":"Task A","type":"task","milestone":"M-1"},
  {"title":"Task B","type":"task","milestone":"M-1","blockedBy":["ISS-1"]}
]' | mdp issue batch-create -p ~/work/ai-coordinate/coordinate-planner
```

## Batch update (JSON stdin)

```bash
echo '[{"id":"ISS-1","status":"Done"},{"id":"ISS-2","status":"In Progress"}]' | mdp issue batch-update -p ~/work/ai-coordinate/coordinate-planner
```

## List / get

```bash
mdp issue list -p ~/work/ai-coordinate/coordinate-planner
mdp issue get -p ~/work/ai-coordinate/coordinate-planner --id ISS-N
```

## Conventions

- Use structured titles: `requirements: <topic>` or `solution: <topic>`.
- Set `blockedBy` / `parent` when tasks depend on others; link to source docs in the issue body.
