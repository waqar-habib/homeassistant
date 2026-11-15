Target: pi5
Date: 2026-11-15
Tier: 0 (read only, plus a Tier 1 docs commit). No install, no restart, no configuration change.
GREEN LIGHT: not needed for read-only checks. Any install needs a separate owner decision after the report (D63).

Context: the owner proposes the Material You Theme and Material You Utilities (https://github.com/Nerwyn/material-you-theme, https://github.com/Nerwyn/material-you-utilities, Apache-2.0) to supply a real Material Design 3 palette and component styling instead of hand-written CSS. This run answers whether that is safe and installable here. Both repos' READMEs say HACS is the install route.

```
Read HANDOFF.md, docs/decisions.md D52, D53, D62, D63 and docs/issues.md I47. git checkout main; git pull --rebase. Read only. Never print or write secrets. In every message to the owner write a step code only with its full phrase (D58).

1. Environment (Tier 0). Report: Home Assistant version; whether HACS is installed (custom_components/hacs present, or an integration entry) and whether the owner can use it; the exact `frontend:` block in configuration.yaml (extra_module_url, themes, any panel_custom); the themes directory and how themes are included; which themes exist now; whether `frontend.reload_themes` is available. Do not edit anything.
2. Source review. Clone both repos into the scratchpad directory, not into /config. Record the commit hash and date of each, the latest tag or release (the Utilities README page showed none), and the minimum Home Assistant version in hacs.json if present. Report: total size in bytes of every JS file the Utilities module would load; every outbound URL or host in the code (fonts, images, analytics); any use of eval or Function(); which Home Assistant components it patches and whether it reaches into other elements' shadow roots; whether the module activates only when a Material You theme is selected in the user's profile or for every user and browser loaded through extra_module_url; what it does if an HA release changes a component.
3. Icons. Report whether either repo provides or loads Material Symbols (a font or SVGs), how, and how large. Report that Home Assistant's built-in icon set is mdi: and that our cards take an `icon: mdi:...` option today.
4. Token bridge. List the CSS custom properties the theme defines (--md-sys-color-*, shape, state, typescale) and the exact names for the surface container levels, primary, primary-container, secondary-container, on-* and outline. Say which of them are set on :root (visible to our shadow-DOM cards) and which only inside the theme's own components.
5. Write docs/sessions/2026-11-15-material-you-evaluation.md with the findings as numbered facts, and a best, base and worst case for installing (1) the theme only with a static palette and no restart, (2) the theme plus Utilities, (3) neither. Commit docs(session): material you evaluation (Tier 1), push to main. Stop. Reply with the short commit ID and the five facts that decide the choice. Do not install anything.
```
