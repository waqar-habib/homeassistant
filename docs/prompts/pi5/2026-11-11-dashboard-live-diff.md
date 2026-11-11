# Prompt: Diff the live habib-home dashboard against Home v2

Target: pi5
Date: 2026-11-11
Tier: 0 (read-only checks) plus a Tier 1 docs commit
GREEN LIGHT: not needed (Tier 0 to 2)

```
Read HANDOFF.md. Stop and report on any error. No secrets in anything you write. Do not change any dashboard, resource or config.

1. git checkout main; git pull --rebase. Working tree must be clean.
2. With ha-mcp, read the live Lovelace config of dashboard habib-home (Nuvio layout/config). Save it, pretty-printed with sorted keys, to /tmp/live-habib-home.json.
3. Normalize dashboards/nuvio-layout-2026-11-11-home-v2.json the same way (sorted keys, pretty-printed) to /tmp/v2-sorted.json. If the two files have different shapes (Nuvio export wrapper vs raw config), unwrap to the comparable part and say what you unwrapped.
4. Run: diff -u /tmp/v2-sorted.json /tmp/live-habib-home.json. Also list Lovelace resources (id, url) and compare against HANDOFF.md (habib-cards.js ?v=1, id c62a8173054c4520be6ec44b5f9d5bbf). Also sha256 of www/habib/habib-cards.js on the Pi vs 5b13d2d8f0f57c09dbc15f425e0fb73d9f7cf01e179beb2209751b799cfe814e.
5. Save the live layout as dashboards/nuvio-layout-2026-11-11-live-owner-edit.json (same format as the other layout files). Write the unified diff to docs/sessions/2026-11-11-dashboard-live-diff.md with a short numbered summary: sections added, removed, changed (card, entity, order, option), grouped by view.
6. Commit as docs(session): live dashboard diff vs home-v2, push to main (pull --rebase first, never force-push). Reply with the short commit ID and the numbered summary only.
```
