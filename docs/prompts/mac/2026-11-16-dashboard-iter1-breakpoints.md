# Prompt: dashboard iteration 1, breakpoint check in Chrome (read only)

Target: mac
Date: 2026-11-16
Tier: 0 (read only: look, measure, screenshot). Plus a Tier 1 docs commit.
GREEN LIGHT: not needed. Nothing is tapped, signed in or changed.

Runs after the Pi 5 prompt `docs/prompts/pi5/2026-11-16-dashboard-iter1-wh-mkh.md` reports done. Checks `habib-wh` and `habib-mkh` at phone and tablet widths.

```
You are the Mac Claude Code session. Use Claude in Chrome. Load the tools in one ToolSearch call (include resize_window, javascript_tool and read_console_messages), call tabs_context_mcp first, work in a new tab and close it at the end. Avoid anything that opens a browser dialog. If Home Assistant shows a login page, STOP and tell the owner: you never type a password or token. Use the HA address the owner is already signed in to (try https://ha.thehabibfam.cc, then http://192.168.1.36:8123). Step codes only with full phrases (D58).

Setup: git checkout main && git pull --rebase. Read docs/dashboard-config.md, docs/design/m3-components.md and docs/decisions.md D64 and D67. Hard rule: NEVER click, tap or press any control on the dashboards (lights are real, the Nursery may be asleep, the lock and thermostats are real). Look, scroll, measure and screenshot only.

For each dashboard (/habib-wh and /habib-mkh) and each viewport width: 360, 390, 430, 820 (iPad Air portrait), 1180 (iPad landscape), resize the window to that width at a realistic height (932 for phones, 1180 for 820, 820 for 1180), wait for the cards to render, then:
1. Screenshot the whole view (scroll through if it is taller; save to the scratchpad directory).
2. With javascript_tool (read only, no clicks) measure through the shadow DOM: horizontal overflow (document scrollWidth greater than clientWidth), the width and height of every habib tile and chip, any label whose text is clipped (scrollWidth greater than clientWidth), and the computed corner radius, gap and font size on a tile.
3. Pass criteria: no horizontal scroll; every tile and chip at least 48 CSS px in its touch height (tiles at least 64); two half-width tiles per row on a phone; no clipped names; tile radius 12px; no backdrop-filter on any habib element; MKH lights on one screen without scrolling at 430x932 (report how many px of scroll if not).
4. Read the browser console for habib, Lovelace or frontend errors (use a pattern filter).
5. Colours: report the computed background and text colour of one light tile in its on and off state and whether they come from --md-sys-color-* (print the variable values) so the owner can confirm the theme is being read. Do not judge taste.

Write docs/sessions/2026-11-16-dashboard-iter1-breakpoints.md: one table per dashboard (rows = widths, columns = pass or fail per criterion with the measured numbers), the issues found in order of severity, and a list of screenshots with file names. Say plainly that Chrome resizing does not reproduce iOS Safari (safe areas, the dynamic toolbar, touch, long-press behaviour), so the owner's iPhone check stays required.
Send the screenshots to the owner with SendUserFile. Commit docs(session): iteration 1 breakpoint check, git pull --rebase, push to main. Close the tab. Reply with the short commit ID and the failures only.
```
