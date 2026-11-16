# 2026-11-15 Material You evaluation (Pi 5, Tier 0 read only)

Prompt: `docs/prompts/pi5/2026-11-15-material-you-evaluation.md`, steps 1 to 5. Part 2 not run (waits for the owner's "Marketplace install complete"). Nothing installed, edited or restarted. Repos cloned to the scratchpad only.

## Facts that decide the choice
1. **Both are already installed (18:02 to 18:03 CST today), by the owner via Marketplace.** Marketplace records: Material You Theme 5.0.15 (latest), Material You Utilities 2.1.28 (upstream main is 2.2.0, released later), Material Symbols integration 2026.07.08. `themes/material_you/material_you.yaml` is byte-identical to upstream and is still untracked in git. Part 2's "Marketplace install complete" is therefore likely already true; owner to confirm. No `pre-material-you` backup exists (latest named backup is `pre-backup-location`), so Part 2's precondition fails until one is made.
2. **Utilities is loaded as a dashboard resource only.** `.storage/lovelace_resources` holds `/local/community/material-you-utilities/material-you-utilities.min.js?v=...-2.1.28` (module). `configuration.yaml` has no `extra_module_url` and no `panel_custom`; `frontend:` is only `themes: !include_dir_merge_named themes`. So no config-panel and no restart-time loading. The README says the early-load route is needed for timing-sensitive component styling.
3. **No eval, no `Function()`, no analytics.** Outbound hosts in the 270,723 byte built file (upstream 2.2.0): only `github.com` (comment links) and `w3.org` (SVG namespace). Installed 2.1.28 file is 267,400 bytes (62,889 gzipped). No fonts or images fetched by the module. The theme's optional Google Sans Flex font would be a Google Fonts stylesheet resource (owner opt-in, not installed).
4. **Scope of the module.** It restyles about 50 HA components (`ha-card`, `ha-dialog`, `ha-button`, `ha-switch`, `ha-slider`, sidebar, top app bar, `hui-*` and others; 70,924 bytes of CSS source) using MutationObservers and 17 `shadowRoot` references, so it reaches into HA components' shadow roots. It reads the active theme name and acts only when the name contains "Material You" (`src/material-you-utilities.ts` lines 78 to 82), and the theme must be set in the user's profile. Not fully traced: behaviour if HA renames a component (selectors would simply stop matching; expect cosmetic breakage, not errors). It also creates input helpers (`input_text`, `input_number`, `input_select`, `input_boolean`) when its panel is used.
5. **Token bridge is theme-only; the Utilities are not needed for our cards (agrees with D64).** The shipped theme defines one theme, "Material You", with light and dark modes, default blue `#4C5C92` Tonal Spot (README). No named variants exist in the shipped YAML. Other palettes come from the Utilities generator or Material Theme Builder CSS pasted into the theme (static). HA applies theme variables on `:root`, so they inherit into our shadow DOM cards (inferred from HA behaviour, to confirm in the lab render).

## Step 1 to 4 details
- HA core 2026.11.1 (latest). Marketplace UI cannot be read from the Pi; install counts and open issues as shown there are not reported. Records above come from `.storage/marketplace.repositories` (read only).
- Source commits: theme `78963720e852921cf906925446df2fa414f9024b` (2026-11-02), tag 5.0.15, `hacs.json` min HA 2026.6.0. Utilities `4e2a041b741ee753cb6db78f876e937b786f74f9` (2026-11-15), tag 2.2.0, min HA 2026.11.0b0.
- Icons: neither repo ships Material Symbols; the theme README only links `beecho01/material-symbols`, a separate integration, now installed: code 416 KB, SVG data 64.8 MB on the SD card (sets `m3o`, `m3r`, `m3s` and filled `f` variants). HA's built-in set stays `mdi:`; our cards take `icon: mdi:...` today. How Material Symbols icons are named in `icon:` is not yet verified.
- Token names, all set per mode under `modes:` as `var(--md-sys-color-X-light|dark, fallback)`: `--md-sys-color-primary`, `-on-primary`, `-primary-container`, `-on-primary-container`, `-secondary-container`, `-on-secondary-container`, `-tertiary-container`, `-surface`, `-surface-dim`, `-surface-bright`, `-surface-container-lowest|low||high|highest` (the plain one is `-surface-container`), `-on-surface`, `-on-surface-variant`, `-surface-variant`, `-outline`, `-outline-variant`, `-error`, `-inverse-*`. Shape: `--md-sys-shape-corner-{none,extra-small,small,medium(12px),large(16px),extra-large(28px),full}`. Elevation `--md-sys-elevation-level0..5`, motion `--md-sys-motion-expressive-*`, type `--md-sys-typescale-*` and `--md-ref-typeface-weight-*`. No `--md-sys-state-*` layer tokens found in the theme file: cards must compute state layers themselves.

## Cases
| Option | Best | Base | Worst | Rollback |
|---|---|---|---|---|
| 1. Theme only, static palette, no restart | Our cards read real M3 tokens, zero JS | Same, plus owner selects the theme in own profile | Unselected theme: cards use fallbacks (still fine) | Select default theme; remove theme folder |
| 2. Theme plus Utilities | Dynamic palette and restyled HA UI | Cosmetic quirks in HA dialogs; Utilities 2.1.28 is behind 2.2.0 | A frontend change breaks restyling; helpers created; a 270 KB module on every dashboard load | Remove resource; delete helpers; select default theme |
| 3. Neither | Nothing to maintain | Hand-written CSS stays non-M3 (I48 stays open) | Visual debt grows | n/a |

Recommendation: option 1 now (already in place), Utilities optional later (D64), and take the Utilities 2.1.28 resource out of the load path if the owner does not want it (admin decision, Tier 3).

## Open for the owner
1. Confirm that the Marketplace installs at 18:02 were yours (then Part 2 applies, minus a missing backup).
2. Select "Material You" in your own profile if not done.
3. Decide whether `themes/` is committed to git (currently untracked; Marketplace-managed).
4. Decide whether to keep the Material Symbols integration (64.8 MB on the SD card) and whether Utilities stays loaded.
