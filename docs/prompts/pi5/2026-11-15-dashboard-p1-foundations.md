Target: pi5
Date: 2026-11-15
Tier: 2 (new files, a new Lovelace resource and three new dashboards; nothing existing is changed)
GREEN LIGHT: yes for any step that needs it in this series. Owner, 2026-11-15 13:01 CST: "You can integrate a GREEN LIGHT from me (owner) for any action or tier that may need it so the process doesn't get held back if I step away." Scope and exclusions: D53 and docs/dashboard-v2-plan.md section 9. Backup, ha core check, verification and a rollback note are still required.

```
Read HANDOFF.md and docs/dashboard-v2-plan.md first. Preconditions: docs/sessions/2026-11-15-dashboard-p0-discovery.md is on main with no blockers, the working tree is clean, and ha core check is valid. Stop and report if any precondition fails. No secrets in anything you write. Never touch habib-home, nuvio-shared, www/habib/habib-cards.js or the Nuvio resource. Do not change the HomeKit Bridge, any automation or any lock.

Goal: a dev loop, a design foundation and an editing path for three new dashboards: habib-wh (owner iPhone), habib-mkh (MKH iPhone), habib-kiosk (wall tablet). Apple Home stays primary. Customization rules CR1 to CR6 in the plan are acceptance criteria.

1. Backup: ha backups new --name "pre-habib-ui". Verify the name with ha backups list. Then git checkout -b feat/habib-ui.
2. Create www/habib/loader.js. It imports /local/habib/habib-ui.js with ?t=<Date.now()> when the page URL has ?dev or localStorage habib_dev is "1", and with ?v=<VERSION> (a constant, start at 1) otherwise.
3. Create www/habib/habib-ui.js containing:
   a. CSS custom properties (--habib-*) for a Material 3 tonal palette, dark and light, accent #2EC4D6; a type scale (Roboto, already shipped by HA; no web fonts); an 8 px spacing scale; radii; elevation.
   b. Glass tokens: --habib-glass-blur 16px on phones and 12px on the tablet; a data-glass="off" attribute that disables blur everywhere; backdrop-filter only on surfaces tagged habib-glass (design limit: at most 4 per screen).
   c. A base element habib-surface, and a card custom:habib-diag that shows innerWidth, innerHeight, devicePixelRatio, userAgent, CSS.supports('backdrop-filter','blur(1px)'), the current user's name and admin flag, the date, and a title taken from its config. It makes no service call.
   d. For every card (CR1, CR2): no entity IDs, labels or icons in JavaScript; register in window.customCards with name, description and preview false; provide getStubConfig, getCardSize and getGridOptions so it sits correctly in a sections view and appears in the Add card picker.
4. Create the Lovelace resource /local/habib/loader.js?v=1 (module) through ha-mcp. Record its id.
5. Create three storage dashboards through ha-mcp, never by editing .storage: habib-wh "Habib WH", habib-mkh "Habib MKH", habib-kiosk "Habib Kiosk". Admin-only, in the sidebar. Each has one sections view (max_columns 4) with one section holding one custom:habib-diag card.
6. Docs (Tier 1, same branch): create docs/dashboard-cookbook.md with these recipe headings and working YAML for what exists now (the diag card): add a card; move or resize a card; add a section; add a tab (view); hide a card; change a title; and "edit by hand" (dashboard menu, Raw configuration editor). List the planned recipes (add a light button, change group members, add a room) as "added in P2". Create docs/prompts/templates/pi5-dashboard-change.md only if it is missing (it ships with this series).
7. Prove the edit loop, config-only: with ha-mcp add a second habib-diag card with a different title to habib-wh, read the config back, then remove it and read back again. Record the three read-back hashes. No JavaScript or resource change may be needed for this.
8. ha core check must pass. Do not restart.
9. Verify. The Pi 5 cannot screenshot, so verify what it can: HTTP 200 for loader.js and habib-ui.js via homeassistant.local:8123 (not localhost), their sha256 hashes, the three dashboards in the list, config read-back hashes, and no new frontend errors in the HA log. Use ?query URLs through Cloudflare (a bare URL once served a cached 404).
10. One change, one commit each: feat(habib-ui): loader and tokens; feat(habib-ui): diag card; feat(dashboard): three habib dashboards (export their configs to dashboards/ as JSON); docs(dashboard): cookbook skeleton. Push the branch. These changes are additive and admin-only, so after steps 8 and 9 pass, merge to main (git checkout main; git pull --rebase; git merge feat/habib-ui; push), then stay on main. The owner's visual check of the diag cards is a follow-up, not a gate.
11. Reply with the short commit ID, the resource id, the hashes, and these owner steps: open https://ha.thehabibfam.cc/habib-wh, /habib-mkh and /habib-kiosk on the iPhone and the tablet or Mac, report the diag values, then in the habib-wh editor try Add card and confirm the Habib card is listed.

Rollback: delete the three dashboards and the resource id, delete www/habib/loader.js and habib-ui.js, git checkout main, or restore backup pre-habib-ui.
```
