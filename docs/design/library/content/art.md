# Art

Layer: content · Status: Draft · Source: `www/habib/glass/art.js` (the only file allowed literal illustration colours)

Inline SVG drawings, no image files.

| Set | Names (`art:` on a card) |
|---|---|
| Lamps | `table-lamp`, `floor-lamp`, `desk-lamp`, `pendant`, `group` (three pendants; lit count follows how many are on), `shelf`, `nightlight`, `coach` |
| Weather | chosen from the weather state (sun, moon, cloud, rain, snow, storm, fog, wind) |
| Prayer | fajr, sunrise, dhuhr, asr, maghrib, isha |
| Interface icons | `ICONS` in base.js: chevron, lock, garage, door, shield, thermometer, speaker, sun, plus, bulb, power, plug, scene, script, toggle, fan, moon, home, play, pause, next, prev, more |

A lit lamp glows in the light's own colour (`--c`) at its brightness (`--lv`). Off lamps are desaturated (`--k-off-art`).
