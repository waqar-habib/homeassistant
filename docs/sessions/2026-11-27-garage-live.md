# Session 2026-11-27: garage arrival goes live (Pi 5)

1. **Report:** owner drove home, got the notice "Test: Garage Door would open now. Nothing was opened." and the door did not open.
2. **Cause:** `input_boolean.arrival_garage_live` was OFF (off since at least 2026-11-25, never turned on). The automation is built to dry-run while it is OFF (D68, D85: owner flips it). Not a defect in the automation.
3. **Trace** `4457d2307217cb4a1927b76b91613b35` (17:56:37 CST, Waqar entered Arrival Home): armed, `problems` empty (driving, GPS 4.9 m, 88 m from home, door closed, no fault, no vacation mode, no run in 30 min). Only the live check failed (`off`, wanted `on`). First real car test of I51 passed.
4. **Fix:** owner asked for the correction; Claude turned the switch ON at about 18:0x CST (Tier 3, owner GREEN LIGHT recorded in D85 handoff and this request). No config file changed. Door was already open (opened outside HA at 17:58), cooldown active, armed flag cleared, so nothing moved.
5. **Rollback:** turn `input_boolean.arrival_garage_live` OFF.
6. **Not verified:** a real automatic open (next arrival). Maham's phone delivery and Activity sensor still open (I74).
7. **Resume:** the Away Day / Away Night design review (`2026-11-26-away-lights-check.md`) is paused; owner answers still pending.
