# 2026-11-17 Pi 5: defect triage and design guide v0.4 draft (evening)

## Done
1. Recap of defects and the design guide for the owner.
2. Owner answers: I52 new screenshot (lamps red, 22:27 CST); I53 waits for an automation walkthrough; I59 close if tested; I58 explained; I46 tablet arrives about 2026-11-20; I54 to backlog.
3. I52: live read. Both lamps were on about 8 s (22:27:34 to 22:27:44). Cards send only `brightness_pct`. The recorder keeps no colour attributes. Cause still unproven.
4. Automation scan (read only, 12 automations): found I62, the arrival dry run fails every run on `notify.waqars_iphone` (not an action; the service is `notify.mobile_app_waqars_iphone`). Adhan Dhuhr, Asr and Isha are clean since the gate fix; `adhan_last_error` is empty.
5. Issues: I59 closed (staging Part 5 measurements), I54 backlog, I46, I52, I53 updated, I62 and I63 added.
6. Design guide Draft v0.4 written for owner review (one entry point, cleaned gap list: 7 open, 1 backlog, 11 closed). Not committed yet; the HTML version follows owner approval.

## Resume point
1. Owner reviews guide v0.4 in chat. On approval: build `docs/design-guide.html` from it, replace `docs/design-guide.md`, commit.
2. I52: owner says whether the lamps were physically red.
3. I63: automation walkthrough with the owner; I62 fix (two action names) is part of it.
