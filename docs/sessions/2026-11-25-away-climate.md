# 2026-11-25 Away climate (Pi 5)

1. **Request (owner, GREEN LIGHT):** both thermostats stay in heat/cool when either or both people are away; never return to cool-only on arrival; away range 68/78.
2. **Finding:** no thermostat automation existed in HA (D32 Away AC and Cool Down were never built). Both Nests were already in `heat_cool` (upstairs 68/78, downstairs 70/74).
3. **Built:** `packages/away_climate.yaml`, automation `away_climate_heat_cool_68_78`. Trigger: either person not `home` for 10 min. Action: both climates to `heat_cool`, low 68, high 78 (skips a thermostat that is `off`), quiet notice to Waqar. Nothing on return. Backup `pre-away-climate` (e028dd1e).
4. **Not done:** setpoints are not restored on return (not requested). Any Apple Home automation that sets cool on arrival would still override this; the owner should check Apple Home.
5. **Not tested live:** a manual run would change downstairs from 70/74 to 68/78 while both are home. First real departure is the test; read the trace.
6. Rollback: `git revert -m 1 <merge>` and reload automations.
