Target: mac
Date: 2026-11-15
Tier: 0 (read only: web pages in Chrome) plus a Tier 1 docs commit
GREEN LIGHT: not needed. Nothing is installed, signed in or changed.

Why: the cloud session could not render m3.material.io (JavaScript site, no browser available there). This run reads the real Material Design 3 pages through Claude in Chrome and writes a sourced reference the dashboard design work will use (I47, D63, D64).

```
You are the Mac Claude Code session. Use Claude in Chrome (the mcp__claude-in-chrome__ tools). Load them in one ToolSearch call as your instructions say, call tabs_context_mcp first, work in a new tab, and close the tab at the end. Avoid anything that opens a browser dialog. Do not sign in anywhere. If Claude in Chrome is not connected, say so in one sentence and stop. In every message to the owner write a step code only with its full phrase (D58).

Setup: in the homeassistant repo clone on this Mac run git checkout main && git pull --rebase. If there is no clone, run gh repo clone waqar-habib/homeassistant (the repo is public until D25). Read HANDOFF.md, docs/decisions.md D52, D58, D62, D63, D64 and docs/issues.md I47.

Read these pages (navigate from the site menu if a URL has moved) and record what each says:
1. https://m3.material.io/ (overview; also whether there is a section on Material 3 Expressive)
2. https://m3.material.io/styles/color/roles (every colour role; the surface container levels; which roles a selected or active component uses)
3. https://m3.material.io/foundations/interaction/states/state-layers (opacity values for hover, focus, pressed, dragged)
4. https://m3.material.io/styles/shape/overview-principles and the shape corner scale (corner radius values by size name)
5. https://m3.material.io/styles/typography/type-scale-tokens (the type scale: sizes, line heights, weights per role)
6. https://m3.material.io/styles/elevation/overview (levels and whether surface tint is still used)
7. https://m3.material.io/styles/motion/overview (easing curves and durations)
8. Component pages, under https://m3.material.io/components/: cards, switch, chips, buttons (toggle buttons), icon buttons, navigation bar, bottom sheets, dialogs, sliders. For each: the container, icon and text colour roles in the selected and unselected states, corner radius, minimum touch target, height, and state layer behaviour.
9. https://m3.material.io/styles/icons/overview (Material Symbols: whether Material Symbols is the recommended icon set, and any size or style guidance).
10. https://m3.material.io/theme-builder (what it exports for the web, for example CSS custom properties; do not change the seed colour or invent a palette).

Questions to answer from the pages, each with the page it came from:
 a. Which colour role does a selected (on) toggle use for its container and for its icon and text, for a card-like tile and for a switch?
 b. Does Material 3 define any frosted glass or blur surface? (yes or no, with the page)
 c. What corner radius does a card use, and what is the "large" and "extra large" step?
 d. What is the minimum touch target size?
 e. What do the pages say about density for wall-mounted or large screens, if anything?

Write docs/design/m3-reference.md: a numbered list of facts, each with its source URL and the date read. Paraphrase; use at most one short quote (under 15 words) per page. Put numeric values in a table (state layers, shape scale, type scale, elevation, motion). Mark anything you could not find as "not found on the page". Do not choose colours, do not write CSS and do not edit any dashboard file.

Then: git add docs/design/m3-reference.md, commit as docs(design): Material 3 reference read, git pull --rebase, push to main. Never force-push. Reply with the short commit ID and a five-line summary: the answers to a, b, c, d, e and anything you could not read.
```
