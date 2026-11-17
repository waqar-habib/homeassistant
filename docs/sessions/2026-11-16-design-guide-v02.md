# 2026-11-16 Design guide audit and Draft v0.2 (Mac, D77)

## Request (owner)
`git pull; read docs/prompts/mac/2026-11-16-design-guide-resume.md (commit fe50465); run it`: run the read-only Chrome audit, then write Draft v0.2 of the design guide and tokens from the measurements, and ask about the light-mode path.

## Done (docs only, nothing in HA changed)
1. Pulled `main` to `fe50465`. Read HANDOFF, the v0.1 session note, the guide, the tokens file, D58, D77, I54, I55.
2. **Audit** in Chrome on the Mac against `https://ha.thehabibfam.cc` (owner already signed in; no password typed, no dashboard control clicked). Output `docs/design/audit-2026-11-16.md`, commit `542f3a2`.
   - Part A: read the Medium article "UI/UX Standards". 14 general standards, two numbers (4.5:1, 3:1), no contradiction with the guide, five topics the guide lacked.
   - Part B: habib-wh and habib-mkh at 430 x 932, 744 x 1133, 820 x 1180, 1024 x 1366, 1180 x 820, 960 x 540, 1280 x 720, 1440 x 900, 1512 x 982, 1728 x 1117, 1920 x 1080, 2560 x 1440, plus 698, 699 and 700 wide on habib-mkh.
   - Part C: computed styles of every text class and `.glass` at 430 and 1440 on both dashboards.
   - Part D: rendered control sizes; contrast from pixel samples of the screenshots.
   - Part E: theme and colour-scheme state read from the page.
3. **Draft v0.2** of `docs/design-guide.md` and `docs/design/habib-tokens.yaml`: estimates replaced by measured values, column rule and per-device table, corrected type roles, measured targets, five rules from the article, section 10 rewritten (15 gaps). Tokens file parses.
4. Issues: I54 and I55 updated; I56, I57, I58 added. Milestone M19 updated.

## Method note
The Mac screen is 1470 x 956 and Chrome was at 110% zoom, so the window only spans 551 to 1336 CSS px. Each dashboard was loaded in a same-origin frame set to the exact viewport size and scaled to fit; media queries follow the frame size. The frame lived in a scratch tab on `/manifest.json`; the tab was closed at the end. The HA sidebar stayed docked (the audit changed no setting).

## Findings
1. Contrast below AA: dim text 2.7 to 5.5 (typically 3.2 to 3.6), faint 1.9 to 3.0, primary text on the hero 4.4. The v0.1 fix (dim to 72%) only reaches 3.8.
2. Columns = min(4, floor((view width - 32) / 352)); view = viewport minus 256 px when the sidebar is docked. 1440 and 1512 give 3 columns with the sidebar, 4 without. Wall tablet with sidebar: 1, 2 or 4 columns at 2x, 1.5x, 1x.
3. habib-mkh shows no section between 699 and 700 px wide (I56).
4. Prayer fold bar prints "Times unavailable" after Isha while all six sensors are valid (I57).
5. Seven controls under 44 px: media volume 6, room header 22, three-dot 26, media tabs 28.5, lamp slider 34, avatars 39.8, media buttons 40. The fold bar is a whole-bar 60 px target.
6. Token mismatches: fold-bar value 17 px (guide said 15), fold-bar text 13 px (guide said 15), degree sign not dim, Hijri tracking 0.02em, slider value a white literal, dock bar padding.
7. habib-mkh dock bars wrap at 430; 200 px gap under the hero on wide habib-mkh; `nuvio.js`, Material You Utilities and Material Symbols still load (I58).
8. MKH compact at 430 x 932 ends at 740 px.

## Not done, and why
- Light-mode emulation: no DevTools rendering emulation in this session. Reported what the page state shows instead.
- Column counts with the sidebar hidden: derived from the rule (hiding the sidebar is an HA setting).
- Real iOS and tablet behaviour: Chrome cannot show it.
- Screenshots are not committed (public repo until D25; they show the owner's photo and home state). Eight were sent to the owner.
- No fix was applied. Every gap in guide section 10 needs the owner's go-ahead.

## Resume point
Owner answers: (1) keep v0.2 as measurements only and review it, or also start step 1 of the light-mode path (guide section 8); (2) which gaps in section 10 to fix first (suggested order: I56 blank band, I57 prayer wording, contrast). Then Draft v0.3 or the fix prompts for the Pi 5. v1.0 only on "GREEN LIGHT".
