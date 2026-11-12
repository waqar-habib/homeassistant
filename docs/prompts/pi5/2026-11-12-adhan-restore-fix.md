# Prompt: Adhan restore fix, per-speaker saved volumes (Pi 5, Claude Terminal)

Target: pi5
Date: 2026-11-12
Tier: 3 (edits a live, enabled automation package)
GREEN LIGHT: the owner asked for this fix on 2026-11-12 ("Go ahead and write a fix ... I will run it on Pi5"). The owner runs it. The edit is limited to the scope below. Re-enabling the toggle needs the owner's GREEN LIGHT in chat. Dry-run steps that switch the toggle on need the owner's GREEN LIGHT in chat as well.

Milestone: M12. Issue: I17. Decisions: D34, D49, D50, D51.
Current package: `packages/adhan.yaml` on `main` at `137e025` (feature commit `6818808`).

## Why

1. **Bug (found on review).** The startup check `adhan_startup_restore` sets **both** HomePods to the single saved value. That value is the Living Room's starting volume. After a restart, the Bedroom is set to the Living Room's volume (for example 0.55), not its own (0.592).
2. **Known gap.** The Bedroom's starting volume is held only in script memory. A restart during playback cannot restore it.

Fix: give each speaker its own saved-volume helper. The script saves each speaker's V0 to its own helper. The startup check restores each speaker from its own helper. The success path clears both helpers. The failure path leaves them set, so the startup check can recover.

## Hard rules

- Edit only `packages/adhan.yaml`. Do not change the prayer automations (`adhan_fajr`, `adhan_dhuhr`, `adhan_asr`, `adhan_maghrib`, `adhan_isha`) or their triggers.
- Do not play audio except in the dry run in step 5, and only with the owner's GREEN LIGHT in chat.
- Do not call any `lock.*` service. Do not touch `switch.804_*`.
- Do not restart HA, the add-on or the Pi. Reload only.
- Do not delete `input_number.adhan_saved_volume`. Leave it defined and unused. Retire it in a later step.
- Entity IDs come from ha-mcp. No secrets in any file.

## Step 0: Pre-flight (read-only, ha-mcp)

1. Read `input_boolean.adhan_enabled`. Record it as `TOGGLE_BEFORE`.
2. Read `media_player.living_room_living_room_homepod` and `media_player.master_bedroom_homepod`. Record `state` and `volume_level`. If either is `playing`, stop and tell the owner.
3. Record the current states of `input_number.adhan_saved_volume` (expected 0).

## Step 1: Switch the gate OFF for the edit

1. Set `input_boolean.adhan_enabled` to **off** (ha-mcp, `input_boolean.turn_off`). This stops any prayer run during the edit.
2. Tell the owner: "Toggle is OFF for the edit. I will leave it OFF until you say GREEN LIGHT in chat." Do not turn it back on yourself.
3. If `TOGGLE_BEFORE` was on and tonight's Isha (18:44) is still ahead, tell the owner this means Isha will not play unless they choose to turn it back on. The owner decides.

## Step 2: Back up

`ha backups new --name "pre-adhan-restore-fix"`. Record the slug. Do not edit without it.

## Step 3: Edit `packages/adhan.yaml`

Make these exact changes.

**3a. Header comment.** Replace the "Known limit" line with:
`# Each speaker has its own saved-volume helper (D51). A stored 0 means nothing to restore.`

**3b. Helpers.** Under `input_number:`, keep `adhan_saved_volume` as it is. Add:

```yaml
  adhan_saved_volume_living_room:
    name: Adhan saved volume Living Room
    icon: mdi:volume-medium
    min: 0
    max: 1
    step: 0.01
    mode: slider
    initial: 0
  adhan_saved_volume_bedroom:
    name: Adhan saved volume Bedroom
    icon: mdi:volume-medium
    min: 0
    max: 1
    step: 0.01
    mode: slider
    initial: 0
```

**3c. Script variables.** Under `adhan_play` `variables:`, add this line after `fail_reason: ""`:

```yaml
      speaker_helpers: "{{ {'media_player.living_room_living_room_homepod': 'input_number.adhan_saved_volume_living_room', 'media_player.master_bedroom_homepod': 'input_number.adhan_saved_volume_bedroom'} }}"
```

**3d. Save step.** Replace the whole step "Save the first speaker's V0 for restart recovery" with:

```yaml
      - alias: Save each speaker's own V0 for restart recovery
        if:
          - condition: template
            value_template: "{{ fail_reason == '' }}"
        then:
          - repeat:
              for_each: "{{ range(speakers | length) | list }}"
              sequence:
                - action: input_number.set_value
                  target:
                    entity_id: "{{ speaker_helpers[speakers[repeat.item]] }}"
                  data:
                    value: "{{ v0_list[repeat.item] }}"
```

**3e. Success step.** In the step "8. Outcome", inside the success `sequence:`, replace the single `input_number.set_value` (which targets `input_number.adhan_saved_volume`) with:

```yaml
              - repeat:
                  for_each: "{{ speakers }}"
                  sequence:
                    - action: input_number.set_value
                      target:
                        entity_id: "{{ speaker_helpers[repeat.item] }}"
                      data:
                        value: 0
```

The failure branch (`default:`) must not clear the helpers. Leave it as it is.

**3f. Startup automation.** Replace the whole `adhan_startup_restore` automation (from `- id: adhan_startup_restore` to the end of the file) with:

```yaml
  # Startup check (D51): restore each speaker from its own saved helper, if set.
  - id: adhan_startup_restore
    alias: "Adhan: restore stuck volume on start"
    mode: single
    triggers:
      - trigger: homeassistant
        event: start
    conditions:
      - condition: or
        conditions:
          - condition: numeric_state
            entity_id: input_number.adhan_saved_volume_living_room
            above: 0
          - condition: numeric_state
            entity_id: input_number.adhan_saved_volume_bedroom
            above: 0
    actions:
      - repeat:
          for_each:
            - entity: media_player.living_room_living_room_homepod
              helper: input_number.adhan_saved_volume_living_room
            - entity: media_player.master_bedroom_homepod
              helper: input_number.adhan_saved_volume_bedroom
          sequence:
            - if:
                - condition: template
                  value_template: "{{ states(repeat.item.helper) | float(0) > 0 and not is_state(repeat.item.entity, 'playing') }}"
              then:
                - action: media_player.volume_set
                  target:
                    entity_id: "{{ repeat.item.entity }}"
                  data:
                    volume_level: "{{ states(repeat.item.helper) | float(0) }}"
      - wait_template: >-
          {% set ns = namespace(ok=true) %}{% for e, h in [('media_player.living_room_living_room_homepod','input_number.adhan_saved_volume_living_room'),('media_player.master_bedroom_homepod','input_number.adhan_saved_volume_bedroom')] %}{% if states(h) | float(0) > 0 and not is_state(e, 'playing') and (state_attr(e, 'volume_level') | float(-1) - states(h) | float(0)) | abs > 0.02 %}{% set ns.ok = false %}{% endif %}{% endfor %}{{ ns.ok }}
        timeout: "00:00:15"
      - if:
          - condition: template
            value_template: >-
              {% set ns = namespace(ok=true) %}{% for e, h in [('media_player.living_room_living_room_homepod','input_number.adhan_saved_volume_living_room'),('media_player.master_bedroom_homepod','input_number.adhan_saved_volume_bedroom')] %}{% if states(h) | float(0) > 0 and not is_state(e, 'playing') and (state_attr(e, 'volume_level') | float(-1) - states(h) | float(0)) | abs > 0.02 %}{% set ns.ok = false %}{% endif %}{% endfor %}{{ not ns.ok }}
        then:
          - action: notify.send_message
            target:
              entity_id: notify.waqars_iphone
            data:
              message: "Adhan startup: stored volumes restored on the HomePods."
        else:
          - action: notify.send_message
            target:
              entity_id: notify.waqars_iphone
            data:
              message: "Adhan startup: volume restore did not read back on one or more HomePods. Check them."
      - repeat:
          for_each:
            - input_number.adhan_saved_volume_living_room
            - input_number.adhan_saved_volume_bedroom
          sequence:
            - action: input_number.set_value
              target:
                entity_id: "{{ repeat.item }}"
              data:
                value: 0
```

Note: the startup automation now sends the success or the error notice to the phone, and it clears both helpers after the check.

## Step 4: Validate and reload

1. `ha core check`. Must be clean. If it fails, stop and report. Do not reload.
2. Reload only: `input_number.reload`, `script.reload`, `automation.reload`. Do not restart.
3. Confirm with ha-mcp:
   - `input_number.adhan_saved_volume_living_room` and `input_number.adhan_saved_volume_bedroom` exist, state 0.
   - `input_number.adhan_saved_volume` exists, state 0, unused.
   - `script.adhan_play` exists.
   - All five prayer automations and `adhan_startup_restore` are loaded.
   - `input_boolean.adhan_enabled` is still OFF.

## Step 5: Dry run of the failure path (owner GREEN LIGHT required)

Only with the owner's GREEN LIGHT in chat. The owner says "safe to play" if audio could play. This dry run plays nothing.

1. Set `input_boolean.adhan_enabled` to on for about one second, then off.
2. Call `script.adhan_play` with `media_file: Fajr.mp3` and `speakers: [media_player.dryrun_no_such_speaker]`.
3. Check the trace: the gate passes, "volume unreadable" fails, and the failure notice is sent to `notify.waqars_iphone`.
4. Confirm the toggle is OFF. Confirm both new helpers are still 0. Confirm both HomePod volumes are unchanged.

## Not tested here (owner decides)

- The startup restore. It can only be tested after a restart, and a restart is Tier 3. Leave it untested until the owner chooses a restart.
- A live success run. The supervised runs of `Adhan.mp3` and `Fajr.mp3` (D49 spec item 9) are still needed after this fix.

## Step 6: Records and commit

1. Write `docs/sessions/2026-11-12-adhan-restore-fix.md`: the backup slug, the toggle state before and after, the `ha core check` result, the reload results, the verification table, the dry-run result, and the untested items above.
2. Update `docs/issues.md` I17: "restore fix (D51) applied: per-speaker helpers. Startup restore and live runs still untested."
3. Commit `fix(adhan): per-speaker saved-volume helpers for restore (D51)` and push to `main`.
4. Do not turn the toggle back on. The owner says GREEN LIGHT in chat to do that.

## Output to the owner

Reply with: the commit SHA, the backup slug, the `ha core check` result, the verification table, the dry-run result (if run), the toggle state (OFF), and the untested items. Keep it short.
