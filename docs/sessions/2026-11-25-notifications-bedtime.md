# 2026-11-25 (evening, Pi 5): notifications, Noor's bedtime, drag-and-drop research

Owner GREEN LIGHT for all steps (2026-11-25 ~16:40 CST, D85). Merge `88d0b31` (commit `3c74a00`). Backup `pre-notifications` (c7e292b4).

## 1. Owner answers to plan v0.1
1. Garage and 804 notices to both phones; lights and all other failures to Waqar only.
2. Sunrise outdoor-off: quiet notice.
3. Skipped garage arrivals (walking, not driving): silent, trace only.
4. Dry-run notices: plain English with a "Test:" prefix.
5. Adhan: Waqar only, success quiet, failure urgent. Nothing to Maham.
6. Bedtime never touches the Hatch; Changing Table 7% red, other Nursery lights off.
7. Apple Home switch for bedtime: yes. 8. Buttons on habib-mkh-next and habib-wh-next, no notice on press. 9. No light test (dim by design).

## 2. Built
1. `packages/notifications.yaml`: `script.notify_household` (fields message, title, to both/waqar/maham, level quiet/normal/urgent, group). Uses `notify.mobile_app_*` because `notify.send_message` cannot carry iOS options. quiet = passive, normal = active, urgent = time-sensitive.
2. Evening lights: skip notice (quiet), "Evening lights are on." (quiet) after a 30 s check, urgent list of lamps that did not turn on. The skip check moved from conditions to actions.
3. Evening Away: "Nobody is home. 4 lamps are on until H:MM PM." and "Away lamps are off." (quiet).
4. Outdoor: "Porch and driveway lights are on/off." (quiet) at sunset and sunrise; urgent if a switch did not follow within 30 s; restart resync silent unless it fails.
5. Garage: "Garage Door is opening now." (sent once the door moves), "Garage Door failed to open, check logs." (urgent), still open after 15 min, "Test: Garage Door would open now." in dry run, safety blocks in plain words; not driving = silent. `cover.open_cover` now has `continue_on_error` so a command error reaches the 2 min failure notice.
6. 804: title "804", failure "804 failed to unlock, check the door." (urgent), dry run "Test: ...", plain problem words; `lock.unlock` has `continue_on_error` for the same reason.
7. Adhan: new optional field `prayer` on `script.adhan_play`, passed by all five automations. "Maghrib adhan played in the Living Room and Bedroom." (quiet), "<Prayer> adhan failed: <reason>. Check the HomePods." (urgent), startup restore notices reworded.
8. `packages/nursery_bedtime.yaml`: `script.nursery_bedtime`: Changing Table `brightness_pct 7`, `hs_color [0,100]` in one call, then every Nursery light off except the Changing Table; Hatch entities removed by integration (`ha_hatch`). Targets today: `light.nursery_floor_lamp`, `light.bookshelf`.
9. Template switch helper "Noor's Bedtime" (`switch.noor_s_bedtime`, UI helper, entry `01M8AE5PXE715FBPVSJGM3G1E3`): on runs the script, state follows the script, so it returns to off. HomeKit Bridge entry reloaded (switch domain is bridged).
10. Dashboards: `custom:ui-button` "Noor's Bedtime" (`script.nursery_bedtime`, icon moon) after Pause Prayer in the Home section and first in the Nursery section, on habib-mkh-next and habib-wh-next (wide and compact). Written via ha-mcp, write verified, not seen rendered.

## 3. Verified live (sunset 2026-11-25 17:30 CST)
1. Outdoor sunset run: notice "Porch and driveway lights are on." sent (passive) to Waqar.
2. Evening run: all lamps on, "Evening lights are on." sent (passive) after the 30 s check.
3. Maghrib: played, volume restored, "Maghrib adhan played in the Living Room and Bedroom." sent (passive).
4. No errors in any notify step. Delivery to the phone itself is for the owner to confirm.

## 4. Not done
1. **Manual test notice blocked:** running `script.notify_household` from ha-mcp was denied by the Claude Code permission classifier. Not worked around. The sunset runs served as the test for Waqar's phone. Maham's phone has not received a notice from the new script yet; first one is the next garage or 804 event.
2. **Garage live switch left OFF** (`input_boolean.arrival_garage_live`). Reasons: delivery to Maham's phone through the new script is unconfirmed, the car test (I51, Activity = Automotive) is still pending, and Maham's Activity sensor is `unavailable` (I74). GREEN LIGHT stands; owner flips it, or tells Claude "go".
3. Bedtime not run physically (owner: no test). Siri phrase test and room assignment in Apple Home are owner steps.

## 5. Drag-and-drop dashboard research (owner question, answered in chat)
Recommendation: make the `ui-*` library native Sections components (grid sizing, visual editor, picker group) so the built-in HA editor gives drag, drop and resize; pilot Drag & Drop Card (Prosono, MIT, 246 stars, Lovelace storage mode) on a throwaway dashboard; skip Ultra Card (paid cloud tier, own module system) and both Dashboard Studio repos (0 stars). Cause found: the D79 container card `ui-page` hides individual cards from HA's editor. Waiting on three owner decisions (see HANDOFF).

## 6. Rollback
`git revert -m 1 88d0b31`, reload scripts and automations; delete the "Noor's Bedtime" template helper; remove the four `ui-button` cards with entity `script.nursery_bedtime` from habib-mkh-next and habib-wh-next. Full: backup `pre-notifications` (c7e292b4).

## 7. Resume point
Owner confirms the three quiet notices on the iPhone and their look; Maham's phone check; garage live switch; Siri test of "Noor's Bedtime"; answers on the dashboard direction. Claude next: sunrise 2026-11-26 outdoor-off notice; Fajr notice.

## 8. Owner confirmation (2026-11-25 ~17:52 CST)
1. Notices work as expected: lock-screen screenshot shows "Evening lights are on.", "Porch and driveway lights are on." (stacked under Lights) and "Maghrib adhan played in the Living Room and Bedroom." (Adhan), silent, in Notification Center. Screenshot not stored (public repo, family photo).
2. "Noor's Bedtime" works through "Hey Siri".
3. Still open: garage drive test (I51) and Maham's phone (I74, she is away). Garage live switch stays OFF until then.

