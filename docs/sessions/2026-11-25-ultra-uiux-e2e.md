# 2026-11-25 (evening, Mac): end-to-end UI/UX audit, Habib Home (Ultra) vs habib-wh-next

Prompt `docs/prompts/mac/2026-11-25-ultra-uiux-e2e.md` (owner GREEN LIGHT). Report `docs/design/audit-2026-11-25-ultra-vs-wh-next.md` (`e51625f`).

## Done
1. Parts A–E in Chrome: 6 viewports (window limits: min 455 CSS px wide, max 794 high), overlap/clip/error scan, console, glass and contrast sampling, tap targets, prayer times vs sensors, every allowed dialog, Skip and Study Lamp round trips on both dashboards, FreeSpace move/resize/undo, Ultra editor (Cancel), WH-next edit mode (Done), scorecard and top 10 defects.
2. Scorecard Ultra / WH-next: looks 3/4, readability 4/4, phone 3/4, desktop 3/4, function 2/4, speed 4/4, editability 4/1, safety 3/4.

## Problems
1. I79 (new, blocks cutover): HA cards inside Ultra Cards keep the state from first render; toggles one-way. Caused Skip Evening Lights to stay on 50 s (18:39:59–18:40:49) and the Study Lamp to stay off about 20 s; both restored.
2. Liquid Glass wallpaper lost after tab switches; hidden tabs keep a stale layout after a resize; Hero x Home 3 px overlap (I77).
3. Garage opened 18:48:49 and closed 18:54:49 outside HA (no service call, automation or user in the logbook). Test paused and reported; owner said continue.
4. Cmd+Z does not undo in FreeSpace (toolbar undo does). Touch-drag test not possible (no DevTools device mode from the extension).

## State at end (19:27 CST)
Both dashboard configs byte-identical to their pre-test copies (Ultra layout = seed file). Garage closed, front door locked, Skip off, Study Lamp on 255, Pause Prayer off, thermostats unchanged. Screenshots only in the Mac scratchpad.

## Resume point
Fix I79 first (swap one native tile grid for Ultra modules, retest state refresh), then defects 2–10 from the audit. Owner may do the drag fixes (defects 4, 10) by hand.
