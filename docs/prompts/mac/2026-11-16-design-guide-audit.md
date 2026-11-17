# Prompt: design guide audit in Chrome (read only)

Target: mac
Date: 2026-11-16
Tier: 0 (read only: look, measure, screenshot). Plus a Tier 1 docs commit.
GREEN LIGHT: not needed. Nothing is tapped, signed in or changed.

Measures the live `habib-wh` and `habib-mkh` dashboards against `docs/design-guide.md` (Draft v0.1) and `docs/design/habib-tokens.yaml`, at the owner's target devices, and reads the one reference article the networkpi session could not open.

```
You are the Mac Claude Code session. Use Claude in Chrome. Load the tools in one ToolSearch call (include resize_window, javascript_tool and read_console_messages), call tabs_context_mcp first, work in a new tab and close it at the end. Avoid anything that opens a browser dialog. If Home Assistant shows a login page, STOP and tell the owner: you never type a password or token. Use the HA address the owner is already signed in to (try https://ha.thehabibfam.cc, then http://192.168.1.36:8123). Step codes only with full phrases (D58).

Setup: git checkout main && git pull --rebase. Read docs/design-guide.md and docs/design/habib-tokens.yaml fully. Hard rule: NEVER click, tap or press any control on the dashboards (lamps, lock, garage and thermostats are real; the Nursery may be asleep). Look, scroll, measure and screenshot only.

Part A, reference article. Open https://medium.com/@chathuswijekoonuom/ui-ux-standards-ddb4ad898ccc in the tab and read it fully. List every concrete standard it gives (type sizes, spacing grid, contrast, target sizes, breakpoints, component rules). For each, say whether docs/design-guide.md already covers it, contradicts it, or is silent. Quote nothing longer than one sentence.

Part B, viewports. For /habib-wh and /habib-mkh, at each of: 430x932 (iPhone 15 Plus), 744x1133, 820x1180, 1024x1366, 1180x820, 960x540 and 1280x720 (the 1920x1080 tablet at 2x and 1.5x), 1440x900, 1512x982, 1728x1117, 1920x1080, 2560x1440. If the window cannot go as narrow or as wide as asked, say which sizes were not reached and use the nearest. At each size:
1. Screenshot the whole view (scroll if taller; save to the scratchpad directory).
2. With javascript_tool (read only, through the shadow DOM) record: number of section columns; horizontal overflow; which habib-mkh sections are visible (compact or expanded); any text whose scrollWidth exceeds clientWidth or that breaks mid-word; on habib-mkh at 430x932, the bottom edge of the last card in px.
3. Read the console for habib, Lovelace or frontend errors.

Part C, tokens. At 430x932 and 1440x900 only, read the computed style of one instance of each: .glass, .title, .eyebrow, .sub, the hero clock, a section label, a lamp state line, a room chip name and state, a fold bar label and value. Record font-family (and whether "Habib Display" and "Habib Text" actually loaded: document.fonts.check), font-size, font-weight, line-height, letter-spacing, color, border-radius, backdrop-filter. Compare each with habib-tokens.yaml and list every mismatch with both values.

Part D, sizes and contrast. Measure the rendered width and height of: fold button, the three-dot button, slider, media buttons, lamp chip, dock bar, security item. For text-dim and text-faint at their smallest size, estimate the contrast against the pixels behind them (sample the screenshot at the lightest and darkest card on screen) and report the ratio range.

Part E, light and dark. Report what the dashboards do when Chrome emulates prefers-color-scheme light (DevTools rendering emulation through javascript_tool is fine; do not change the HA profile). Expected today: no change. Say what you see.

Write docs/design/audit-2026-11-16.md: Part A table; one table per dashboard (rows = viewports, columns = columns, overflow, clipped text, errors); the token mismatch list; the size and contrast table; and a short list "changes the guide needs", most important first, each as a proposed edit to docs/design-guide.md or habib-tokens.yaml. Do not edit the guide or the tokens file yourself. Say plainly that Chrome resizing does not reproduce iOS Safari (safe areas, dynamic toolbar, touch), so the owner's iPhone and iPad checks stay required.
Send the screenshots to the owner with SendUserFile. Commit docs(design): design guide audit, git pull --rebase, push to main. Close the tab. Reply with the short commit ID and the mismatches only.
```
