# `ha backups list` result, 2026-11-15 (about 22:10 CST, 04:10 UTC 2026-11-16)

Run by the owner on the Pi 5 (HA terminal) and pasted to Claude Code, for Mac Claude to read. Condensed from the raw output: one row per backup, sorted by date. Sizes in MB. `days_until_stale: 30`. No secrets.

Location key: **local** = `.local` on the Pi 5 SD card. **nbk** = `networkpiBackups` (networkpi share). Full = add-ons, `homeassistant: true`, folders share, addons/local, ssl, media. Automatic = daily 03:00 CST (09:00 UTC), protected, in both locations.

| Date (UTC) | Name | Slug | Type | Location | Protected | MB |
|---|---|---|---|---|---|---|
| 2026-10-23 18:18 | Z-Wave JS 1.9.1 | 963cdd08 | partial, add-on only | local | yes | 1.08 |
| 2026-11-03 22:41 | pre-cloudflare-tunnel | fe78b1d3 | full | local | no | 303.42 |
| 2026-11-04 05:34 | `ha backups new --name "pre-i18-resolve"` (misnamed) | 01d19d96 | partial | local | yes | 303.21 |
| 2026-11-04 05:39 | pre-i18-delete | 781c2d05 | full | local | no | 303.88 |
| 2026-11-04 06:05 | pre-habib-redesign | a062666c | full | local | no | 303.97 |
| 2026-11-08 12:36 | Claude Terminal Pro 2.5.2 | 01e746c2 | partial, add-on only | local | yes | 256.27 |
| 2026-11-08 12:38 | Home Assistant MCP Server 9.1.0 | dee4825d | partial, add-on only | local | yes | 0.11 |
| 2026-11-09 04:52 | pre-backup-location | 744a21ce | full | local | no | 290.67 |
| 2026-11-09 05:08 | test-networkpi-location | 2c9d3f0d | full | nbk | no | 290.73 |
| 2026-11-09 06:59 | pre-dashboard-build | e91f5e77 | full | nbk | no | 291.43 |
| 2026-11-09 09:00 | Automatic backup 2026.11.0 | d24cc658 | partial, auto | local + nbk | yes | 291.19 |
| 2026-11-10 09:00 | Automatic backup 2026.11.0 | 95747403 | partial, auto | local + nbk | yes | 291.16 |
| 2026-11-11 09:00 | Automatic backup 2026.11.0 | 06aa8ab1 | partial, auto | local + nbk | yes | 291.29 |
| 2026-11-11 13:32 | pre-nuvio-extend | 82cc58de | partial (ssl + HA) | nbk | no | 13.66 |
| 2026-11-12 09:00 | Automatic backup 2026.11.1 | 6676a003 | partial, auto | local + nbk | yes | 291.96 |
| 2026-11-12 23:31 | pre-adhan-build | b7f421f8 | full | nbk | no | 294.14 |
| 2026-11-13 09:00 | Automatic backup 2026.11.1 | bf59c708 | partial, auto | local + nbk | yes | 294.11 |
| 2026-11-13 12:41 | pre-adhan-duration-fix | 08f6f42b | full | nbk | no | 294.90 |
| 2026-11-14 07:56 | Claude Terminal Pro 2.5.3 | ac0c306b | partial, add-on only | nbk | yes | 263.74 |
| 2026-11-14 09:00 | Automatic backup 2026.11.1 | 4f0390f7 | partial, auto | local + nbk | yes | 294.68 |
| 2026-11-14 23:47 | pre-evening-lights | fd9312bc | full | nbk | no | 296.00 |
| 2026-11-15 09:00 | Automatic backup 2026.11.1 | 2ce50165 | partial, auto | local + nbk | yes | 295.32 |
| 2026-11-15 19:41 | pre-habib-ui | 95d5149a | full | nbk | no | 293.06 |
| 2026-11-15 22:30 | pre-habib-components | 5bcc956c | full | nbk | no | 293.73 |
| 2026-11-15 23:37 | pre-evening-nursery-fix | 384f9774 | full | nbk | no | 295.66 |
| 2026-11-16 03:57 | pre-zones | 46dcdb50 | full | nbk | no | 300.46 |
| 2026-11-16 04:06 | pre-zones-v2 | a3bbb3d6 | full | nbk | no | 300.50 |

## Notes
1. 27 backups at the time of the listing (26 after `2c9d3f0d` was deleted, 60a5e9e). The two newest are the zone rollback points (D65 zone rebuild). `pre-zones-v2` holds the old Neighborhood 1000 m, Leander 2000 m, Sasural 600 m and Near Home 4828 m zones. Restoring is Tier 3 (GREEN LIGHT).
2. Seven daily automatic backups are listed (11-09 to 11-15), each in both locations, which matches the "keep 7" setting. This is more evidence for I24 (nightly copy to networkpi works). Disk-side check done (owner `sudo ls -la /srv/ha-backups`, after the deletion): 18 .tar files, all 7 automatic files present with sizes identical to HA's list, every nbk-only backup present, `2c9d3f0d.tar` gone, `daily/` and `weekly/` still empty. 5.1 GB used by the share.
3. Test file `test-networkpi-location` (`2c9d3f0d`) deleted 2026-11-15 (owner GREEN LIGHT). I24 and I25 are resolved. M4 remaining: weekly copy (M6) and pruning of manual backups (I49).
4. Backup `pre-i18-resolve` (`01d19d96`) keeps its misnamed title (known, D40).
5. Several full backups (`fe78b1d3`, `781c2d05`, `a062666c`, `744a21ce`) and the add-on backups exist only on the Pi 5 SD card (location local). Worth reviewing later, since SD space and writes matter (SSD upgrade planned). Deletion is Tier 3.
