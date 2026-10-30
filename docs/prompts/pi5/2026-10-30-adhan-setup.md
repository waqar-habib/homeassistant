# Prompt: Adhan setup, shipped switched off (Pi 5, Claude Terminal)

Target: pi5
Date: 2026-10-30
Tier: 3 (adhan automations)
GREEN LIGHT: partial, setup only. Owner, 2026-10-30: "You can set up the Adhan automations, but we can test it later so baby does not wake if HA messes up the automation like previous attempts." This covers installing the integration and writing and loading the package with the toggle OFF. It does **not** cover enabling the toggle, playing any audio, calling the script, or a live test. Those need a separate GREEN LIGHT.

Milestone: M12. Decisions: D28, D29, D34.

## Owner steps (manual, in the HA UI)

1. Settings, Devices and services, Add integration, "Islamic Prayer Times". Accept the home location from HA.
2. Open the integration's Configure options. Set calculation method **ISNA** and Asr **standard / Shafi**. If the only Asr choices are standard and Hanafi, choose standard (D4, D28). Note there is no Hanbali option.
3. Have today's masjid timetable ready (the five prayer times) so Claude can compare.
4. Do not toggle anything named "Adhan" and do not play any file.

## Design (what the package does)

| Item | Setting | Source |
|---|---|---|
| Prayer method | ISNA, standard Asr | D28 |
| Fajr | `Fajr.mp3` on `media_player.living_room_living_room_homepod` only | D29 |
| Dhuhr, Asr, Maghrib, Isha | `Adhan.mp3` on both `media_player.living_room_living_room_homepod` and `media_player.master_bedroom_homepod` | D29 |
| Volume | 20% (0.2) until a live test | D29 |
| Files | `/media/Adhan.mp3`, `/media/Fajr.mp3`, played as `media-source://media_source/local/<file>` | D29 |
| Master switch | `input_boolean.adhan_enabled`, created OFF. Stays OFF in this prompt | D34 |
| Failure | notify `notify.waqars_iphone`. If the previous volume is unknown or the volume cannot be set to 20%, **do not play** (fail closed) | D34 |
| Restore | after playback, set the speaker back to its previous volume | CLAUDE.md |

## Assumptions and risks

| # | Item | Risk |
|---|---|---|
| 1 | Past attempts failed, cause not recorded | The cause is probably playback to the HomePods through the Apple TV integration. This prompt writes the package but cannot prove playback. The live test is the proof |
| 2 | HomePod entities may not expose `volume_level` or support volume set while idle | If so, the fail-closed rule means the Adhan would never play. Step 5 checks this read-only and stops for a decision instead of guessing |
| 3 | HA restarts or crashes mid-playback | Volume may not be restored. Scripts have no "finally". Logged as a known gap |
| 4 | Integration times differ from the masjid timetable | Wrong prayer times. Compare in step 4. Do not adjust offsets without the owner |
| 5 | A mistake that leaves the toggle ON | A real Adhan could play in the house. The toggle is created OFF and step 7 verifies it |
| 6 | Template `time` trigger uses sensor entity IDs | If an ID is wrong the automation never fires. Step 6 reads the real IDs |

Outcomes:
- **Best:** integration set up, times within 2 minutes of the masjid, package loaded with the toggle OFF, HomePods report `volume_level`, nothing played.
- **Base:** times differ slightly or the volume attribute is missing. Stop at that step, record it, and decide with the owner.
- **Worst:** `ha core check` fails or the toggle is somehow ON. Switch it OFF first, then revert the branch and reload. No audio has been played in any case.

Rollback: set `input_boolean.adhan_enabled` OFF (or delete the package on the branch and reload automations, scripts and input booleans). The `pre-adhan` backup is the last resort.

## Prompt body

```
Resume from HANDOFF.md. Task: set up the Adhan (docs/prompts/pi5/2026-10-30-adhan-setup.md).
Tier 3. The GREEN LIGHT in that file's header is PARTIAL: setup only, shipped switched off.
If the header does not contain that quoted owner message, stop and report.

HARD RULES for this run:
- Do NOT call media_player.play_media, media_player.volume_set, script.adhan_play,
  script.adhan_play_one, or any media_player action. Do NOT turn input_boolean.adhan_enabled on.
  Read-only state and attribute reads only.
- No restarts. No changes outside packages/adhan.yaml and the prayer integration options.
- Never read or print secrets.yaml. Never edit .storage/.
- If any step fails or surprises you, stop and report; do not improvise.

1. Pre-checks (Tier 0):
   - git pull; confirm the prompt file is at HEAD.
   - ha core info and ha core check. Core running, no errors.
   - Run claude mcp list. If ha-mcp is not connected, say so; steps 5 to 7 need entity states,
     so ask the owner to read them from Developer Tools, States instead and continue.

2. Back up first: ha backups new --name "pre-adhan". Confirm it exists.

3. Owner sets up the Islamic Prayer Times integration (owner steps 1 and 2 above). Wait for
   "done". Do not configure it yourself. Do not touch credentials.

4. Verify times against the masjid:
   - Read the five prayer sensors' states (read-only).
   - Ask the owner for today's masjid times and compare. Within 2 minutes: continue.
     More than 2 minutes on any prayer: stop and report the table. Do not change offsets.

5. Read-only checks:
   a. Exact entity IDs of the Fajr, Dhuhr, Asr, Maghrib and Isha timestamp sensors.
      Never guess them (rule 9).
   b. ls /media and confirm Adhan.mp3 and Fajr.mp3 exist with exactly that spelling and case.
   c. For media_player.living_room_living_room_homepod and media_player.master_bedroom_homepod:
      read the state and attributes only. Report whether volume_level is present and whether
      supported_features includes volume set. Do not set anything.
      If either is missing: stop and report. The script below depends on both.
   d. Confirm notify.waqars_iphone exists (docs/entities.md).

6. Branch and write packages/adhan.yaml:
   git switch -c feat/adhan
   Use this draft. Replace <FAJR>, <DHUHR>, <ASR>, <MAGHRIB>, <ISHA> with the real sensor IDs
   from 5a. Adjust syntax only if ha core check requires it, and report any change.

   input_boolean:
     adhan_enabled:
       name: Adhan enabled
       icon: mdi:mosque

   script:
     adhan_play:
       alias: Adhan play
       mode: queued
       max: 3
       fields:
         track:
           description: adhan or fajr
         speakers:
           description: list of media_player entity IDs
       sequence:
         - repeat:
             for_each: "{{ speakers }}"
             sequence:
               - action: script.turn_on
                 target:
                   entity_id: script.adhan_play_one
                 data:
                   variables:
                     speaker: "{{ repeat.item }}"
                     track: "{{ track }}"

     adhan_play_one:
       alias: Adhan play one speaker
       mode: parallel
       max: 4
       sequence:
         - variables:
             target_volume: 0.2
             file: >-
               {{ 'media-source://media_source/local/Fajr.mp3' if track == 'fajr'
                  else 'media-source://media_source/local/Adhan.mp3' }}
             prev: "{{ state_attr(speaker, 'volume_level') }}"
         - if:
             - condition: template
               value_template: "{{ prev is none }}"
           then:
             - action: notify.send_message
               target:
                 entity_id: notify.waqars_iphone
               data:
                 message: "Adhan not played: previous volume of {{ speaker }} unknown"
             - stop: "previous volume unknown"
               error: true
         - action: media_player.volume_set
           target:
             entity_id: "{{ speaker }}"
           data:
             volume_level: "{{ target_volume }}"
           continue_on_error: true
         - delay: "00:00:02"
         - if:
             - condition: template
               value_template: >-
                 {{ (state_attr(speaker, 'volume_level') | float(-1) - target_volume) | abs > 0.02 }}
           then:
             - action: notify.send_message
               target:
                 entity_id: notify.waqars_iphone
               data:
                 message: "Adhan not played: could not set volume on {{ speaker }}"
             - stop: "volume not set"
               error: true
         - action: media_player.play_media
           target:
             entity_id: "{{ speaker }}"
           data:
             media_content_id: "{{ file }}"
             media_content_type: music
           continue_on_error: true
         - wait_template: "{{ is_state(speaker, 'playing') }}"
           timeout: "00:00:30"
           continue_on_timeout: true
         - if:
             - condition: template
               value_template: "{{ not is_state(speaker, 'playing') }}"
           then:
             - action: media_player.volume_set
               target:
                 entity_id: "{{ speaker }}"
               data:
                 volume_level: "{{ prev }}"
             - action: notify.send_message
               target:
                 entity_id: notify.waqars_iphone
               data:
                 message: "Adhan did not start on {{ speaker }}; volume restored"
             - stop: "playback did not start"
               error: true
         - wait_template: "{{ not is_state(speaker, 'playing') }}"
           timeout: "00:10:00"
           continue_on_timeout: true
         - action: media_player.volume_set
           target:
             entity_id: "{{ speaker }}"
           data:
             volume_level: "{{ prev }}"

   automation:
     - id: adhan_prayer_times
       alias: Adhan prayer times
       mode: queued
       triggers:
         - trigger: time
           at: sensor.<FAJR>
           id: fajr
         - trigger: time
           at: sensor.<DHUHR>
           id: dhuhr
         - trigger: time
           at: sensor.<ASR>
           id: asr
         - trigger: time
           at: sensor.<MAGHRIB>
           id: maghrib
         - trigger: time
           at: sensor.<ISHA>
           id: isha
       conditions:
         - condition: state
           entity_id: input_boolean.adhan_enabled
           state: "on"
       actions:
         - choose:
             - conditions:
                 - condition: trigger
                   id: fajr
               sequence:
                 - action: script.adhan_play
                   data:
                     track: fajr
                     speakers:
                       - media_player.living_room_living_room_homepod
           default:
             - action: script.adhan_play
               data:
                 track: adhan
                 speakers:
                   - media_player.living_room_living_room_homepod
                   - media_player.master_bedroom_homepod

7. Validate and load:
   - ha core check. Never reload on a failed check.
   - Reload without a restart: input_boolean, script, automation. With ha-mcp tools, call the
     reload services. Otherwise the owner runs them in Developer Tools, YAML.
   - Verify and report:
     a. input_boolean.adhan_enabled exists and its state is OFF. If it is ON, set it OFF
        (this is the only allowed write) and report it.
     b. script.adhan_play, script.adhan_play_one and automation.adhan_prayer_times exist.
     c. The automation's next trigger times match the prayer sensors (read-only).
     d. Nothing played: no media_player state changed, no notifications sent.
   - Do not run the script, do not toggle the helper, do not trigger the automation.

8. Record (Tier 1) and merge:
   - Commit the package on the branch as feat(adhan): ... (one change, one commit).
   - After the owner confirms steps 4 and 7, merge feat/adhan into main (fast-forward) and push.
   - docs/issues.md: new item "Adhan installed but untested. Live test needs a separate GREEN
     LIGHT at a time when the baby is awake." Add any volume or timing finding.
   - docs/milestones.md: M12 status "Installed, switched off, untested".
   - docs/decisions.md: do not change D28 to D34 unless a finding requires it.
   - docs/sessions/2026-10-30-adhan-setup.md and HANDOFF.md with the exact resume point.
   - Commit as docs(session): ... to main. git pull --rebase first. Never force-push.

Report back: backup slug, the five prayer sensor IDs, the times table versus the masjid,
whether each HomePod exposes volume_level and volume set, the toggle state, and the resume point.
Notify the owner when done.
```

## Later: live test (not part of this prompt)

Needs its own GREEN LIGHT, with the baby awake and you in the room. Outline: set both HomePods to a known volume, call `script.adhan_play_one` on one speaker with a short clip, confirm volume goes to 20% and back, then test Fajr on the Living Room HomePod, then switch the toggle ON.
