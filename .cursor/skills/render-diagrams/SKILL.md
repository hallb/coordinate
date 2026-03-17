---
name: render-diagrams
description: Regenerate PlantUML diagram images embedded in a markdown file. Use when the user asks to render, regenerate, or update diagrams in a doc, OR automatically after any edit to a @startuml/@enduml block in a markdown file — do not wait to be asked.
---

# Render PlantUML Diagrams

PlantUML source is embedded inline in markdown files inside `<details>` blocks. Rendered PNGs live in a `diagrams/` subdirectory alongside each markdown file.

## Regenerate diagrams in one file

```sh
./script/render-diagrams docs/path/to/file.md
```

## Regenerate all diagrams

```sh
./script/render-diagrams
```

## When to run

Run after any edit to a `@startuml`/`@enduml` block in a markdown file. The script calls `script/bootstrap` automatically (installs `plantuml` via apt if missing).

## Output location

`@startuml diagrams/name` writes to `diagrams/name.png` in the same directory as the markdown file. The image tag in the markdown (`![alt](diagrams/name.png)`) will then resolve correctly.

## Previewing in Cursor

Use **Ctrl-Shift-V** (or right-click → Open Preview) to open the full VS Code markdown preview. This correctly renders local images and collapses `<details>` blocks. The inline toggle button in the editor toolbar does not work reliably for either of these.

## Committing

Generated PNGs must be committed alongside the markdown file so GitHub renders them inline.
