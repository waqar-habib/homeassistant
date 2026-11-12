# Prompt: Build Adhan automation, toggle OFF (Pi 5, Claude Terminal)

Target: pi5
Date: 2026-11-12
Tier: 3 (config change: new helpers, package, automations)
GREEN LIGHT: setup with the toggle OFF was authorized by the owner on 2026-10-30 (D34). Specs confirmed by the owner on 2026-11-12 (D49, D50, `docs/adhan-spec.md`). This run **builds only**. It does not enable the toggle, does not play any audio, and does not merge to `main`. Enabling needs a separate GREEN LIGHT from the owner.

Milestone: M12. Issue: I17. Decisions: D29 (schedule), D34, D49, D50.
Spec: `docs/adhan-spec.md`. Read it first and follow it exactly.

## Hard rules

- No playback. Do not call `media_player.play_media`, `media_player.volume_set` or `media_player.media_stop`. Reads only.
- Do not set `input_boolean.adhan_enabled` to on. It must end OFF.
- Do not call any `lock.*` service. Do not touch `lock.living_room_front_door`, `switch.804_*`, or the front door automation (deleted under D40).
- Do not restart HA, the add-on or the Pi. Reload only. If a reload is not enough, stop and report.
- Do not merge to `main`. Work on branch `feat/adhan-automation`.
- Entity IDs come only from ha-mcp. Do not guess them.
- No secrets, tokens or passwords in any file or commit. Do not print `secrets.yaml`.

## Step 1: Pre-flight (read-only, ha-mcp)

1. Confirm these exist and record their IDs:
   - `media_player.living_room_living_room_homepod`
   - `media_player.master_bedroom_homepod`
   - `notify.waqars_iphone` and the `notify.send_message` action
   - the Islamic Prayer Times sensors for Fajr, Dhuhr, Asr, Maghrib and Isha (time-valued). Record the exact IDs
2. Confirm `input_boolean.adhan_enabled` and `input_number.adhan_saved_volume` do not exist yet. Create them in step 3.
3. Check `configuration.yaml` for `homeassistant: packages: !include_dir_named packages` (CLAUDE.md). If it is missing, add it as the one config change, validate with `ha core check`, and tell the owner.
4. Check whether a `packages/` folder exists. The Adhan package was removed on 2026-11-09 (`d6a1d09`), so expect it to be absent.

## Step 2: Backup and branch

1. `ha backups new --name "pre-adhan-build"`. Record the slug. Do not proceed without it.
2. `git checkout -b feat/adhan-automation` from `main`.

## Step 3: Write `packages/adhan.yaml`

Helpers:
- `input_boolean.adhan_enabled`: initial `off`. Name "Adhan enabled".
- `input_number.adhan_saved_volume`: min 0, max 1, step 0.01, initial 0. Mode slider. Name "Adhan saved volume".

Script `adhan_play` with fields `media_file` (`Adhan.mp3` or `Fajr.mp3`) and `speakers` (list of entity IDs), running the spec's playback sequence (`docs/adhan-spec.md`):
1. Stop unless `input_boolean.adhan_enabled` is on.
2. Read each speaker's `volume_level` as V0. Write the first speaker's V0 to `input_number.adhan_saved_volume`. Fail closed if any volume is unknown.
3. Set each speaker to 0.35. Read back. Fail closed if any is not 0.35 within 0.02.
4. `media_player.play_media` for each speaker, `media-source://media_source/local/<media_file>`, `media_content_type: music`, `wait: false`.
5. Wait for `playing` (30 s timeout), then for not `playing` (900 s timeout).
6. Restore each speaker to its V0. Read back. Retry once on mismatch. Clear `input_number.adhan_saved_volume` to 0.
7. On any failure after step 2: `media_player.media_stop` on each speaker, restore V0 if known, then `notify.send_message` with `entity_id: notify.waqars_iphone` and a short message.

Automations (mode `single`, enabled, each gated by `input_boolean.adhan_enabled` = on):
- Fajr: trigger at the Fajr sensor time. Call `adhan_play` with `Fajr.mp3` and `[media_player.living_room_living_room_homepod]`.
- Dhuhr, Asr, Maghrib, Isha: each triggers at its sensor time. Call `adhan_play` with `Adhan.mp3` and both HomePods.
- Each trigger has a condition: the prayer sensor is not `unknown` or `unavailable`.

Startup check (automation, trigger `homeassistant` start):
- If `input_number.adhan_saved_volume` is greater than 0, restore the Living Room and Bedroom HomePods to that value only if they are not playing. Read back and notify. Then set the helper to 0.
- Known limit: a stored 0 is treated as "nothing to restore". Note this in the commit message.

## Step 4: Validate and reload

1. `ha core check`. Must be clean. Stop and report any error.
2. Reload only: `input_boolean.reload`, `input_number.reload`, `script.reload`, `automation.reload`. Do not restart.
3. If a helper does not appear after reload, stop and report. Do not restart.

## Step 5: Verify (ha-mcp, read-only)

1. `input_boolean.adhan_enabled` exists and is `off`.
2. `input_number.adhan_saved_volume` exists and is 0.
3. The script and the five prayer automations exist and are loaded.
4. The startup automation exists and is loaded.
5. Check each automation's trigger entity matches the sensor IDs from step 1.
6. No media player was called. Record that the speaker volumes are unchanged from the read.

## Step 6: Commit and push the branch (not `main`)

1. `git add packages/adhan.yaml` (and `configuration.yaml` only if step 1.3 changed it). Also add `docs/adhan-spec.md` and the `docs/decisions.md` lines for D49 and D50 if they are not already on the branch.
2. Commit: `feat(adhan): build automation with toggle OFF (D49, D50)`. Push `feat/adhan-automation`.
3. Do not merge. The owner reviews the branch first.

## Records (Tier 1)

- `docs/sessions/2026-11-12-adhan-build.md`: pre-flight IDs, backup slug, reload results, verification results, commit SHA.
- `docs/issues.md` I17: "build on `feat/adhan-automation`, toggle OFF. Not merged. Supervised runs and enabling still pending."

## Output to the owner

Reply with: the commit SHA, the backup slug, the `ha core check` result, the verification table, and what remains (masjid timetable check, dry-run notice, supervised runs, enabling). Keep it short.
