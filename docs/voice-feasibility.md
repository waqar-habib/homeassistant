# Voice control feasibility

Goal: Home Assistant as the single controller for Apple Home, Aidot, Tapo and Google Home devices, with natural-language voice that stays simple for MKH and guests. Test before building (D21).

## Inputs
- Device inventory without typing it by hand: (1) run setup.md step 1.6 so Claude writes `docs/entities.md` from HA; (2) export the router client list from the My Spectrum app (scroll the full Services list); (3) compare. Devices on the router but not in HA are the onboarding gaps. Apple-only accessories need a short manual list from the Home app.
- How each Apple Home device reaches HA today (I7)

## Starting inventory (expected HA path, to verify in F4)

| Device | Expected path |
|---|---|
| Google Nest Thermostat (2) | HA Nest integration, which uses Google's Device Access API. A one-time registration fee applies (verify) |
| Rain Bird Sprinkler | HA Rain Bird integration |
| LG Washer, Dryer, Refrigerator | HA LG ThinQ integration (cloud) |
| Chamberlain myQ garage opener | No HA support. Needs a local controller (ratgdo or Meross). Opener model needed |
| Amazon Ring | HA Ring integration (cloud, Ring login with 2FA). Ring has no local stream |
| Brother Printer | HA IPP or Brother integration |
| Aidot and Tapo bulbs | Aidot and TP-Link integrations |
| Linkind plugs | Matter, paired to Apple Home. Add to HA through Matter multi-admin |

## Tests

| ID | Test | Pass criteria |
|---|---|---|
| F4 | **Coverage.** For each device, check whether HA controls it locally through a supported integration | On/off and state work. Gaps listed per device |
| F1 | **HomeKit Bridge back into Apple Home.** Expose one light and one thermostat through an include filter, pair the bridge in Apple Home, issue 10 "Hey Siri" commands on a HomePod and an iPhone | At least 9 of 10 correct, under 3 s, state mirrors both ways |
| F2 | **Assist with Claude as the conversation agent** on the phone (Companion app). 20 phrases, including ambiguous ones such as "make it warmer in here" and "turn off everything upstairs" | At least 18 of 20 correct, under 4 s. Record cost per command against the API cap |
| F3 | **Voice hardware.** HA Voice Preview Edition or an ESP32-S3 satellite, with wake word, speech-to-text and text-to-speech running on the Pi 5 | Wake word at least 9 of 10 at 3 m, under 3 s end to end, Pi 5 CPU stays under 70% |

## Constraints
- HomePods cannot act as HA voice satellites. They can only be controlled through Apple Home, so F1 is the path for "Hey Siri" on HomePods.
- Never bridge an entity that originates from Apple Home back into Apple Home. That duplicates or loops devices (I7).
- Buy no voice hardware until F4 and F1 pass.

## Decision rule
- F4 and F1 pass: HA is the controller and Apple Home stays the front end for MKH, guests and Siri. MKH changes nothing she does today. This is the recommended default.
- F2 and F3 are optional add-ons for richer natural language.
- F1 fails: fall back to Siri Shortcuts and the Companion app for the iPhone, and revisit the plan.
