# 2026-11-16 Dashboard glass redesign (Pi 5, D70)

Owner request 00:30 CST: a 2026-looking dashboard modelled on a reference screenshot, GREEN LIGHT for themes, Marketplace, fonts and colours.

## Done
1. Session start: HANDOFF, decisions and the iteration 1 note read; live configs of habib-wh and habib-mkh matched the iteration 1 exports.
2. Reference analysed: wallpaper under translucent glass, drawn objects instead of icons, a type scale (huge thin clock, small-caps labels), information widgets, mixed card sizes, inline controls.
3. Backup `pre-dashboard-glass` (c769dd3d). Branch `feat/dashboard-glass`, merged to main (`c96568c`).
4. Built `www/habib/habib-glass.js` + `habib-glass-logic.js` (7 new node tests; 26 of 26 pass): habib-hero, habib-prayer, habib-light, habib-climate, habib-security, habib-media, habib-todo, habib-label. Loader v7 loads habib-ui.js and habib-glass.js; resource `/local/habib/loader.js?v=7`.
5. Fonts Outfit and Inter self-hosted (`www/habib/fonts`, SIL OFL). Wallpaper `www/habib/bg/evergreen.svg`. Theme `themes/habib_glass/habib_glass.yaml`, loaded with `frontend.reload_themes` (no restart).
6. Installed Chromium in the Claude Terminal container (persist-install) and rendered the real configs with mock states at 430x932 and 1440 wide. Fixed from the renders: wide cards overflowing, mid-word title breaks, clipped avatars, knob on lights that are off, cramped weather pills. Mocks: `docs/design/glass-wh-*-mock.png`.
7. `ha core check` clean. Both dashboards written (hashes in `docs/dashboard-config.md` section 12). Files served with HTTP 200; no habib errors in the system log.

## Not verified
- Not seen in a real HA frontend (screenshot engine disabled, no login from the Pi). Whether the view theme also recolours HA's top bar is unverified.
- Taps, slider drags, the colour sheet, media buttons and list add were exercised only in mock code paths, not against devices.
- Lamp art per light is guessed.

## Resume
Owner: on the iPhone, pull to refresh (or Settings, Companion app, Reset frontend cache), open Habib WH and Habib MKH, report what looks wrong. Rollback: re-apply the `-iter1` exports and set the loader resource to `?v=6`; restore `pre-dashboard-glass` only if config is damaged.
