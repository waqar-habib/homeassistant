# Prompt: Parallel lane, Pi 5 (Claude Terminal)

Target: pi5
Date: 2026-10-30
Tier: 0 and 2 (Step 5 is Tier 3 and is gated)
GREEN LIGHT: not needed for Steps 1-4. None given for Step 5 or for any I18 change. Standing permissions: D33, D35.

Runs in parallel with `docs/prompts/networkpi/2026-10-30-parallel-networkpi.md` and `docs/prompts/mac/2026-10-30-parallel-mac.md`. Files do not overlap. Pi 5 owns live HA state and `packages/`, `dashboards/`. Pull with rebase before every push.

```
Read HANDOFF.md, docs/issues.md, and the Open list in docs/decisions.md. Then run this lane in order. Report each step in one short block (result, evidence, next). Do not stop between steps unless a step says STOP.

Step 1 (Tier 0) Baseline.
- git status and git branch. Expect main clean and feat/scenes present.
- ha core info (expect 2026.10.4), ha core check, ha backups list.
- Via ha-mcp confirm these exist and are reachable: automation.front_door_geofence_auto_lock_unlock, input_boolean.adhan_enabled (must be off), the 6 scene entities, dashboard nuvio-test.
- STOP and tell the owner if ha core check fails or input_boolean.adhan_enabled is on.

Step 2 (Tier 0, then Tier 1) I18 evidence. Read only.
- Read the automation config, its state (on/off), last_triggered, and the trace of its last run (2026-10-25).
- Do NOT edit, disable, delete or commit the automation. D35 excludes the front door lock. Only the owner decides. If the owner says "disable I18" in this session, turn it off with automation.turn_off, then verify state and record it.
- Append the findings (trigger entity, zone, conditions, what the trace did, whether it is still on) to the I18 row in docs/issues.md. Commit to main as docs(session): I18 evidence. Push.
- Open the reply with: "I18: front door geofence automation is <on/off>. Owner decision needed."

Step 3 (Tier 0) I20 Remote Control test on the Pi 5.
- Run claude doctor. Record the version and whether Remote Control is listed as available.
- If available, run: claude remote-control --name pi5. Tell the owner to open claude.ai/code on the iPhone and report whether the pi5 session appears and accepts a message. Note that the terminal must stay open.
- Record the result in docs/issues.md I20 and propose a decision D36 (do not write it into decisions.md as decided until the owner confirms).

Step 4 (Tier 2) M14 / I16 Rooms layout.
- Backup first: ha backups new --name "pre-rooms-layout".
- Find where the Laundry and General tiles come from (read only: areas, then Nuvio config). Report the source before changing it.
- Assign the Nest thermostats (climate.upstairs, climate.downstairs) to their areas through ha-mcp (registry change, not .storage edits). Never guess an entity ID; use docs/entities.md or ha-mcp.
- On nuvio-test only: smaller Rooms tiles, thermostats under their rooms. Use Nuvio edit-mode resize and Appearance, Rooms settings first.
- Export the layout JSON to dashboards/nuvio-test-<date>.json. Branch feat/rooms-layout, commit as feat(dashboard): rooms layout, do not merge. Verify the dashboard loads (ha-mcp) and tell the owner to look at it on the iPhone.
- Rollback: restore the dashboard from the backup or the previous JSON in dashboards/.

Step 5 (Tier 3, GATED) Do not start any of these without a GREEN LIGHT in this session:
a. Cloudflare Tunnel (docs/prompts/pi5/2026-10-24-cloudflare-tunnel.md). Needs the Mac lane's GREEN LIGHT request first.
b. Scenes merge to main (I19). Needs the owner's scene test results first. Then git merge --ff-only feat/scenes.
c. Adhan live test (I17, D34). Baby awake, owner in the room.
d. Geofencing (M16). Needs M15 (MKH person) and the owner-created zone. Not done yet.
e. HA backup location to the networkpi Samba share (M4). Needs networkpi lane Step 1 to pass first.

End: session protocol from CLAUDE.md (docs/sessions/2026-10-30-parallel-pi5.md, HANDOFF.md pi5 section only, issues, milestones). git pull --rebase, then push to main.
```
