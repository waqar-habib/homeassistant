# Data cards

Layer: components · Status: Draft. Cards bound to one kind of data. All except Hero have a one-line summary, so they work inside an [Accordion](accordion.md).

## Hero

`custom:ui-hero` · clock (follows the card width), date, Hijri date (`hijri: false` hides), weather with feels-like, high, low, humidity; people avatars (`persons:`). `compact: true` = 130 px phone hero.

## Prayer times

`custom:ui-prayer` · five prayers plus sunrise, next prayer with countdown and progress, [Adhan badge](badge.md). After Isha: "All done today"; a missing sensor: "Times unavailable". Never changes the Adhan.

## Climate

`custom:ui-climate` · one dial per thermostat: current temperature, setpoint range arc, what it is doing. A tap opens the [climate drawer](drawer.md#climate-drawer-from-a-climate-dial). Summary "Downstairs 72° · Upstairs 71°" (heat/cool tint while running).

## Security

`custom:ui-security` · "All secure" shield plus one tile per door or garage. A tap opens Home Assistant's own dialog; the card never calls a lock or cover service ([Safety](../safety.md)).

## Media

`custom:ui-media` · player tabs per speaker, artwork, transport, volume (44 px hit area). Summary: now playing or "Nothing playing".

## List

`custom:ui-list` · a `todo` list: items with a colour stripe and check circle (44 px rows), add field. Summary: items left.

## Dock

`custom:ui-dock` · holds cards as 52 px [dock bars](bar.md), two per row (phone). A tap opens the card in place, or HA's dialog with `direct: true`.
