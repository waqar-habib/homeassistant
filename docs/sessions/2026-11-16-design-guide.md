# 2026-11-16 Habib Glass design guide, Draft v0.1 (networkpi, D77)

## Request (owner)
A full design guide for the Home Assistant dashboards, written for AI tools: mobile first, responsive, reusable editable components, token optimisation, identical output across tools. Inputs: repo docs, live `habib-wh` and `habib-mkh`, two reference articles. Owner answers recorded as D77.

## Done (docs only, nothing in HA changed)
1. `git pull --rebase` (main at `544aa6c`). Read HANDOFF, the dashboard docs, D63 to D76, I45 to I53, the dashboard session notes, `habib-glass.js` (all 1,462 lines), `habib-glass-logic.js`, the theme, the generator and three mocks.
2. Live read through ha-mcp: habib-wh `95f4c477d92c3e07`, habib-mkh `c0d82737c4398684` (both match HANDOFF). Dashboards: nuvio-shared, habib-wh, habib-mkh, habib-kiosk, habib-lab. Resources: `nuvio.js`, `habib-cards.js?v=1`, `loader.js?v=10`. Themes: Habib Glass, Material You.
3. **Nuvio validated as phased out on both dashboards:** only `custom:habib-*` cards in native sections views. Leftovers: `nuvio-shared` dashboard and the `nuvio.js` resource. `CLAUDE.md` line "Dashboard: Nuvio" is stale (not edited; owner call).
4. Wrote `docs/design-guide.md` (Draft v0.1) and `docs/design/habib-tokens.yaml` (parses; dark values codified from source, light values proposed).
5. Wrote the Mac prompt `docs/prompts/mac/2026-11-16-design-guide-audit.md` (Tier 0, read only) for the browsing the owner asked for.

## Not done, and why
- **Browsing in Chrome at the target resolutions:** this session has no Chrome tools. Owner chose option A: the Mac session does it from the prompt above.
- **Reference "URL 1"** (Medium, UI/UX standards): the site answered HTTP 403 and a reader mirror was blocked by the session's permission rules. Not read. The guide attributes nothing to it; the Mac prompt reads it. "URL 2" (Figma, UI design principles) was read and is mapped in section 2 of the guide.
- **Light mode:** does not exist. The guide gives a three-step path and proposed light values; none is built.

## Findings worth the owner's attention
1. The cards hard-code colours in each shadow root, so a colour-scheme change today means a JavaScript deploy. Moving tokens into the theme (guide section 8) makes it a theme edit (I54).
2. Estimated contrast of dim text at 10 to 12 px is about 4:1 on the lightest glass; several controls are under 44 px (I55). Both are estimates from the source and need the Mac measurements.
3. Column counts are known only at 430, 1024 and 1440. The 1920x1080 tablet's layout depends on its pixel ratio (I5).

## Owner follow-up (same day)
1. Move the whole process to the Mac so Chrome is available for live testing.
2. Fix the stale Nuvio line in `CLAUDE.md`: done.
3. v0.2 scope (measurements only, or also step 1 of the light-mode path): TBD until the Mac session.

## Resume point
Mac session: `git pull; read docs/prompts/mac/2026-11-16-design-guide-resume.md; run it`. It runs the read-only audit, writes v0.2 from the measurements and asks the owner about the light-mode path. Nothing in HA may change before that answer. v1.0 only on "GREEN LIGHT".
