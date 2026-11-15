Target: pi5
Type: reusable template (not a one-off prompt). Copy the block, fill CHANGE and DASHBOARD, and give it to Claude on the Pi 5, or type the short form at the bottom.
Tier: 2 (config-only change to a habib-* dashboard)
GREEN LIGHT: standing (D53) for habib-* dashboard edits. Never covers lock, unlock or garage service calls, Adhan, the D42 automations or the HomeKit Bridge.

```
Read HANDOFF.md, docs/dashboard-v2-plan.md, docs/dashboard-cookbook.md and docs/dashboard-config.md. Make this dashboard change: CHANGE (plain language, for example "add the Porch light as a button under Downstairs on habib-wh") on DASHBOARD (habib-wh, habib-mkh or habib-kiosk).

1. Config-only (CR4): edit the dashboard YAML through ha-mcp. Do not edit JavaScript, bump the resource version or touch .storage. If the change cannot be done in YAML with the existing cards, stop and say which card needs code; a code change follows CR6 (bump VERSION, ?dev loop, owner visual check) and is a separate commit.
2. Entity IDs come from docs/dashboard-config.md or ha-mcp, never guessed (rule 9). If a new entity is used, add it to docs/dashboard-config.md. Never bind any service to a lock or garage entity. Never include the 804 lock.
3. Before the change, export the current dashboard config to dashboards/<dashboard>-<YYYY-MM-DD>-pre-<slug>.json. Apply the change. Read the config back, check every entity ID exists with its live state, and look for new frontend errors in the HA log.
4. Export the result to dashboards/<dashboard>-<YYYY-MM-DD>-<slug>.json. Commit as feat(dashboard): <summary> on branch feat/dashboard-<slug>, then git checkout main; git pull --rebase; merge; push. Never force-push.
5. Reply with the short commit ID, what changed in one line, and "refresh the dashboard to see it". Rollback: re-apply the -pre- JSON through ha-mcp.
```

Short form for the owner: "Pi 5: dashboard change, habib-wh, <what you want>" (Claude reads this template first).
