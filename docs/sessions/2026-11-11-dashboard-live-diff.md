# Session 2026-11-11: live dashboard diff vs Home v2 (Pi 5 prompt 503df1a)

Target: pi5. Tier 0 (read-only) plus Tier 1 docs commit. No dashboard, resource or config was changed.

## Source and method
- **Live layout source:** ha-mcp was not connected in this session (ECONNREFUSED at start, and its tools were not loaded), so the live config was read from `.storage/lovelace.nuvio_shared` (read-only). The `habib-home` storage entry holds only `strategy: custom:nuvio`, so the Nuvio shared layout is the closest readable source. **Not verified against ha-mcp.** Re-run the check through ha-mcp to confirm.
- **Unwrapping:** the v2 file is a Nuvio export wrapper (`format`, `schema`, `nuvio`, `exported`, `include`, `data`). The comparable part is `data`. The live file's `data` is used as-is, and it also carries `v` and `ts` (both are metadata).
- Temp files were written to the scratchpad, not `/tmp`.
- Normalized files (sorted keys, indent 2): `v2-sorted.json` and `live-habib-home.json` in the scratchpad.

## Lovelace resources
| id | url | status |
|---|---|---|
| c62a8173054c4520be6ec44b5f9d5bbf | /local/habib/habib-cards.js?v=1 | matches HANDOFF |
| ed2efd9c61854c4787531cc32b60aca3 | /local/community/nuvio/nuvio.js?v=14169677322310 | unchanged |
| fa37af526a82431d8b985df45fd9dfe7 | /local/community/glass-cards/glass-cards.js?v=143578041411012 | unchanged |

`www/habib/habib-cards.js` sha256 = `5b13d2d8f0f57c09dbc15f425e0fb73d9f7cf01e179beb2209751b799cfe814e`. **Matches** the expected value.

## Summary of differences (live vs home-v2)
1. **Added, view `dashboard` (Home):** a second `habib-lock-chip` row, "Garage Door" (`cover.general_garage_door_garage_door`), placed after the Front Door chip. Kind `c:hacard:mwcikzx3`. HANDOFF says the garage door stays in the backlog, so this is an owner edit.
2. **Added, section `rooms`:** room order list `game_room, laundry, living_room, master, nursery, small_guest, big_guest, formal_living, kitchen, _none`. v2 has no `rooms` section. This matches the Rooms optimization next item (I34 `_none`).
3. **Added, top level:** `app.accent` = `#2EC4D6`.
4. **Added, metadata `wiz`:** `hiddenRooms: [general]`, `views: [dashboard, rooms, multimedia, family, mapa]`, `hints: {power: 0, scenes: 0}`, `lang: en`, `lp: 1`, timestamps. Not a layout change.
5. **Changed, metadata:** `v: 1` and `ts` are present in live, not in the v2 export.
6. **Unchanged:** `dashboard` order/hidden entries for the existing cards (Front Door, Scenes, thermostats, prayer card). No removed sections.

## Unified diff
The full unified diff is in the block below. The live layout is saved as `dashboards/nuvio-layout-2026-11-11-live-owner-edit.json`.

```diff
--- v2-sorted.json
+++ live-habib-home.json
@@ -1,4 +1,7 @@
 {
+  "app": {
+    "accent": "#2EC4D6"
+  },
   "s": {
     "dashboard": {
       "added": [],
@@ -160,6 +163,29 @@
               "src": "type: custom:habib-lock-chip\nentity: lock.living_room_front_door\nname: Front Door"
             }
           }
+        },
+        {
+          "c": "nuvio-stack-card",
+          "cfg": {
+            "cards": [
+              {
+                "entity": "cover.general_garage_door_garage_door",
+                "name": "Garage Door",
+                "type": "custom:habib-lock-chip"
+              }
+            ],
+            "direction": "vertical",
+            "divider": false,
+            "glass": false,
+            "src": "type: custom:habib-lock-chip\nentity: cover.general_garage_door_garage_door\nname: Garage Door"
+          },
+          "comp": "hacard",
+          "e": "c:hacard:mwcikzx3",
+          "v": {
+            "o": {
+              "src": "type: custom:habib-lock-chip\nentity: cover.general_garage_door_garage_door\nname: Garage Door"
+            }
+          }
         }
       ],
       "conf": {},
@@ -177,8 +203,50 @@
         "c:ac:hh0003": "s",
         "c:actions:hh0004": "l",
         "c:hacard:hh0005": "l",
-        "c:hacard:hh0006": "l"
+        "c:hacard:hh0006": "l",
+        "c:hacard:mwcikzx3": "m"
       }
+    },
+    "rooms": {
+      "added": [],
+      "conf": {},
+      "hidden": [],
+      "names": {},
+      "order": [
+        "game_room",
+        "laundry",
+        "living_room",
+        "master",
+        "nursery",
+        "small_guest",
+        "big_guest",
+        "formal_living",
+        "kitchen",
+        "_none"
+      ],
+      "size": {}
     }
+  },
+  "ts": 1794425457724,
+  "v": 1,
+  "wiz": {
+    "custom": [],
+    "hiddenRooms": [
+      "general"
+    ],
+    "hints": {
+      "power": 0,
+      "scenes": 0
+    },
+    "lang": "en",
+    "lp": 1,
+    "ts": 1793337538785,
+    "views": [
+      "dashboard",
+      "rooms",
+      "multimedia",
+      "family",
+      "mapa"
+    ]
   }
 }
\ No newline at end of file
```
