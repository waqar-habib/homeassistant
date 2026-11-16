# Session: garage arrival automation (2026-11-15, Pi 5)

1. Zones (D65): Home 100 m, Neighborhood 500 m, Leander 3000 m, Cedar Park 2700 m, Sasural 200 m. I27 closed by the owner (D68).
2. Two myQ garage doors found. Door B (shared home) disabled, Door A kept (D66, I50, backup `pre-garage-b-remove` 063301bc).
3. Garage arrival built in dry run (D68, I51): `packages/arrival_garage.yaml`, merge `3e35b28`. Backup `pre-arrival-garage` (232b3d34). `ha core check` clean, reload only. `zone.arrival_home` created in HA (not in git). Activity sensors for both phones enabled. Tested: templates, notify script. Garage never moved; live switch OFF.
4. Process notes: the first fast-forward merge failed because `main` had moved (docs from another session); a merge commit was used. The auto-mode classifier blocked the first combined push and merge command until the owner gave "GREEN LIGHT to merge".

Resume point: owner opens both companion apps (Activity sensors, Maham's location). Then dry run with 3 real arrivals each. The 804 lock is a separate later build and is not part of this.
