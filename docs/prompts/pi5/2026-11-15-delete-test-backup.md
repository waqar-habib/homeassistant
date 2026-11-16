# Prompt: delete test backup 2c9d3f0d

Target: pi5
Date: 2026-11-15
Tier: 3
GREEN LIGHT: yes (2026-11-15, owner: "GREEN LIGHT delete 2c9d3f0d"). Covers only this one backup.

Removes the test backup `test-networkpi-location` (slug `2c9d3f0d`, 290.73 MB, location `networkpiBackups` only). It was created 2026-11-09 to test the share. Nightly runs 11-09 to 11-15 have proven the share works.

```
Read HANDOFF.md and docs/issues.md (I24, I49). Do exactly this, nothing else.

1. Run `ha backups list`. Confirm slug 2c9d3f0d exists, its name is test-networkpi-location, and its only location is networkpiBackups. If the name, slug or location differs, STOP and report.
2. Run `ha backups remove 2c9d3f0d`. Do not remove any other backup. Do not touch pre-* backups, automatic backups or add-on backups.
3. Run `ha backups list` again. Confirm 2c9d3f0d is gone and the count dropped by exactly one. Confirm the 7 automatic backups and pre-zones-v2 (a3bbb3d6) are still listed.
4. Record in docs/sessions/2026-11-15-delete-test-backup.md and add one line to I24 in docs/issues.md. Commit as docs(session): deleted test backup 2c9d3f0d, git pull --rebase, push to main.

Rollback: none needed (test data only). The 7 nightly backups are the recovery points.
```
