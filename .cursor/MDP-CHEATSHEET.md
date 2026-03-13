# MDP daily cheat sheet

Planning board: **~/work/ai-coordinate/coordinate-planner**. Use `mdp` with `-p ~/work/ai-coordinate/coordinate-planner`. Ensure `$HOME/.bun/bin` is in PATH.

| Action | Command |
|--------|--------|
| List projects | `mdp project list` |
| List issues | `mdp issue list -p ~/work/ai-coordinate/coordinate-planner` |
| Create issue | `mdp issue create -p ~/work/ai-coordinate/coordinate-planner -t "Title" --type task --milestone M-1` |
| Start work | `mdp issue update -p ~/work/ai-coordinate/coordinate-planner --id ISS-N --status "In Progress"` |
| Log progress | `mdp issue log add -p ~/work/ai-coordinate/coordinate-planner --id ISS-N -b "What you did"` |
| Complete issue | `mdp issue update -p ~/work/ai-coordinate/coordinate-planner --id ISS-N --status "Done"` |
| Milestone progress | `mdp milestone progress -p ~/work/ai-coordinate/coordinate-planner --id M-N` |
| Project stats | `mdp project stats -p ~/work/ai-coordinate/coordinate-planner` |

**Conventions**: Use titles like `requirements: …` or `solution: …`; link to docs in issue body; set `--blocked-by` / `--parent` when tasks depend on others.
