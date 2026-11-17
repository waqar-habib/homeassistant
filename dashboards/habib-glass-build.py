# Generates the habib-wh and habib-mkh glass configs (D70). Run: python3 dashboards/habib-glass-build.py (writes wh.json, mkh.json in the cwd).
import json
P = "sensor.living_room_adhan_"
hero = {"type": "custom:habib-hero", "weather": "weather.forecast_home", "sun": "sun.sun",
        "persons": [{"entity": "person.waqar_habib", "name": "Waqar"}, {"entity": "person.maham_habib", "name": "Maham"}]}
prayer = {"type": "custom:habib-prayer", "adhan": "input_boolean.adhan_enabled",
          "prayers": {"fajr": P+"fajr_prayer", "sunrise": P+"sunrise_time", "dhuhr": P+"dhuhr_prayer",
                      "asr": P+"asr_prayer", "maghrib": P+"maghrib_prayer", "isha": P+"isha_prayer"}}
lock = {"entity": "lock.living_room_front_door", "name": "Front door", "kind": "lock",
        "states": {"locked": "Locked", "unlocked": "Unlocked", "jammed": "Jammed"}}
garage = {"entity": "cover.general_garage_door_garage_door", "name": "Garage", "kind": "garage",
          "states": {"closed": "Closed", "open": "Open", "opening": "Opening", "closing": "Closing"}}
climate = {"type": "custom:habib-climate", "entities": [{"entity": "climate.downstairs", "name": "Downstairs"}, {"entity": "climate.upstairs", "name": "Upstairs"}]}
media = {"type": "custom:habib-media", "players": [{"entity": "media_player.living_room_living_room_homepod", "name": "Living Room"},
                                                   {"entity": "media_player.master_bedroom_homepod", "name": "Bedroom"}]}
todo = {"type": "custom:habib-todo", "entity": "todo.shopping_list", "title": "Shopping list"}
def L(name, ids, art, wide=False):
    c = {"type": "custom:habib-light", "name": name, "art": art, "entities": ids if isinstance(ids, list) else [ids]}
    if wide: c["size"] = "wide"
    return c
def label(t, note=None):
    c = {"type": "custom:habib-label", "label": t}
    if note: c["note"] = note
    return c
def sec(*cards): return {"type": "grid", "cards": list(cards)}
# Upstairs has 5 lamps: 3 lights and 2 on smart plugs (switch.*). Checked against HA areas 2026-11-16.
UP = ["light.game_room", "light.upstairs_guest", "switch.upstairs_guest_guest_nightstand", "light.study_lamp", "switch.study_study_floor_lamp"]
DOWN = ["light.buffet", "light.floor_lamp", "light.side_table", "light.console_lamp", "light.dresser", "light.mahams_lamp", "light.waqars_lamp"]
floors = sec(label("Floors", "Nursery not included"), L("Downstairs", DOWN, "group"), L("Upstairs", UP, "group"))
living = sec(label("Living Room"), L("Floor Lamp", "light.floor_lamp", "floor-lamp"), L("Buffet", "light.buffet", "table-lamp"),
             L("Side Table", "light.side_table", "table-lamp"), L("Console Lamp", "light.console_lamp", "desk-lamp"))
bedroom = sec(label("Bedroom"), L("Dresser", "light.dresser", "table-lamp", True),
              L("Maham's Lamp", "light.mahams_lamp", "table-lamp"), L("Waqar's Lamp", "light.waqars_lamp", "table-lamp"))
nursery = sec(label("Nursery"), L("Bookshelf", "light.bookshelf", "shelf", True),
              L("Changing Table", "light.changing_table", "nightlight"), L("Floor Lamp", "light.nursery_floor_lamp", "floor-lamp"))
upstairs = sec(label("Upstairs"), L("Game Room", "light.game_room", "pendant", True),
               L("Guest Room", "light.upstairs_guest", "pendant"), L("Guest Nightstand", "switch.upstairs_guest_guest_nightstand", "table-lamp"),
               L("Study Lamp", "light.study_lamp", "desk-lamp"), L("Study Floor Lamp", "switch.study_study_floor_lamp", "floor-lamp"))
outdoor = sec(label("Outdoor"), L("Porch", "light.smart_wi_fi_light_switch", "coach", True))
def view(sections, maxc):
    return {"views": [{"title": "Home", "path": "home", "type": "sections", "max_columns": maxc, "theme": "Habib Glass",
                       "dense_section_placement": True, "sections": sections}]}
# Habib WH is the owner's iPhone: the large cards fold to a 60px summary bar (collapsible, starts folded).
def fold(c): return {**c, "collapsible": True}
wh = view([sec(hero, fold(prayer)),
           sec(label("Home"), {"type": "custom:habib-security", "items": [lock, garage]}, fold(climate)),
           floors, living, bedroom, nursery, upstairs, outdoor,
           sec(label("Listen"), fold(media)), sec(label("Lists"), fold(todo))], 4)
# Habib MKH (owner, 2026-11-16): no prayer card (D71). Compact, one screen with no scroll on a 430x932 iPhone (D75):
# a 130px hero with no Hijri date or people, each room as small lamp chips that open into the full lamp cards,
# and a dock of folded cards (front door, climate, HomePods, list) two to a row. One section, because HA puts
# 24px between sections and 8px between cards inside a section. Nothing remembers an open state (remember: false).
def room(name, s, note=None):
    c = {"type": "custom:habib-room", "name": name, "remember": False, "lights": [x for x in s["cards"] if x["type"] == "custom:habib-light"]}
    if note: c["note"] = note
    return c
mkh_climate = {**climate, "entities": [{"entity": "climate.downstairs", "name": "Downstairs", "short": "Down"},
                                       {"entity": "climate.upstairs", "name": "Upstairs", "short": "Up"}]}
mkh_hero = {k: v for k, v in hero.items() if k != "persons"}
mkh_hero.update({"compact": True, "hijri": False})
# Responsive (owner, 2026-11-16): under 700 px wide (phones) the compact one-screen section shows;
# from 700 px (tablets, laptops) it hides and the expanded sections show, laid out like habib-wh.
PHONE = [{"condition": "screen", "media_query": "(max-width: 699px)"}]
WIDE = [{"condition": "screen", "media_query": "(min-width: 700px)"}]
def only(s, vis): return {**s, "visibility": vis}
# Front door and garage: one tap opens HA's own lock or garage dialog (direct); the dashboard never calls the service.
door_bar = {"type": "custom:habib-security", "items": [lock], "subtitle": "Front door", "direct": True}
garage_bar = {"type": "custom:habib-security", "items": [garage], "subtitle": "Garage", "direct": True}
compact = sec(mkh_hero, room("Floors", floors, "Nursery not included"), room("Bedroom", bedroom), room("Nursery", nursery),
              room("Living Room", living),
              {"type": "custom:habib-dock", "cards": [door_bar, garage_bar, mkh_climate, media]})
mkh_hero_full = {k: v for k, v in hero.items() if k != "persons"}
mkh_hero_full["hijri"] = False
tap = lambda it: {**it, "tap": "more-info"}
mkh = view([only(compact, PHONE),
            only(sec(mkh_hero_full), WIDE),
            only(sec(label("Home"), {"type": "custom:habib-security", "items": [tap(lock), tap(garage)]}, climate), WIDE),
            only(floors, WIDE), only(living, WIDE), only(bedroom, WIDE), only(nursery, WIDE), only(upstairs, WIDE),
            only(sec(label("Listen"), media), WIDE)], 4)
json.dump(wh, open("wh.json", "w"), indent=1); json.dump(mkh, open("mkh.json", "w"), indent=1)
ids = set()
def walk(o):
    if isinstance(o, dict): [walk(v) for v in o.values()]
    elif isinstance(o, list): [walk(v) for v in o]
    elif isinstance(o, str) and "." in o and o.split(".")[0] in ("light","switch","sensor","lock","cover","climate","media_player","todo","weather","sun","person","input_boolean"): ids.add(o)
walk(wh); walk(mkh); print(json.dumps(sorted(ids)))
