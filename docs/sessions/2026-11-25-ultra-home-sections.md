# 2026-11-25 Ultra Home tab: wireframes, Sections test build (Mac)

## Done
1. Wireframes v0.1 (Home tab: Hero, Prayer, Climate at 430 / 820 / 1440) accepted by the owner without changes; Sections chosen for the Home tab (D87).
2. Wireframes v0.2 on the same canvas (artifact 3ib7jm5EkaxchB3fZXcSdS, private to the owner): Lights tab at 3 sizes, light card (icon, name, state, brightness slider, ••• colour), colour drawer, card surfaces A frosted vs B soft tint. Waiting for owner edits; not built.
3. Throwaway dashboard `uc-home-test` "UC Home test" (admin only, not in sidebar), one Sections view, 3 Ultra Cards (Liquid Glass):
   - Hero: Ultra clock + weather modules (5-day forecast in equal columns).
   - Prayer: Ultra markdown module (Jinja + HTML): next prayer, countdown, progress since last prayer, 5-prayer strip, Sunrise footnote; after Isha shows tomorrow's Fajr. Adhan chip (text module, template) opens HA's dialog for `switch.adhan_pause`.
   - Climate: one row per thermostat (name, Heat/Cool targets, current temperature); a tap opens HA's thermostat dialog. No setpoint controls on the card.
   Generator `dashboards/ultra/build_home_sections_test.py` on branch `feat/ultra-home-sections` (`65acf5f`).
4. Rendered by Claude: desktop (2 columns at 1309 CSS px), tablet 820 (2 columns), phone 430 (1 column). No truncation, no overlap.
5. I79 check: the Ultra-module cards update live (countdown went from 8 h 31 to 8 h 30 min without reload). The Adhan chip was not toggled (Pause Prayer is off-limits for tests).

## Problems
- Ultra icon module shows "Icons Need Entities" without an entity: icon moved onto the text module.
- Chrome window cannot be resized (full screen); phone and tablet rendered in a same-origin iframe of that width instead.
- Browser blocks fetches to a localhost helper (local network access); config pasted directly.

## Resume point
Owner: review `/uc-home-test` (Mac and iPhone), answer surfaces A or B, edit light wireframes. Claude next: apply answers, then move the 3 cards into `habib-home-uc` Home tab as a Sections view (Tier 2, back up the dashboard JSON first), then light cards after owner edits, then audit defects 2–10.
