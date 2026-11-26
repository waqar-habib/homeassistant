#!/usr/bin/env python3
"""Generate the MVP Ultra Card dashboard `habib-home-uc` (D86, docs/ultra-card-plan.md).

Owner rules: Liquid Glass as shipped, FreeSpace views (Phone stacks in reading
order, Laptop/Tablet scale the Desktop layout), lock and garage open HA's own
dialog only (no direct lock or cover action anywhere), no Pro modules.
This file seeds the dashboard once. After that the owner edits it in the UI;
re-running would overwrite those edits.
Usage: python3 build_habib_home_uc.py > habib-home-uc.json
"""
import json
import sys

THEME = "liquid_glass"
_ids = {}


def nid(kind):
    _ids[kind] = _ids.get(kind, 0) + 1
    return f"{kind}-{_ids[kind]}"


def native(card_config, name):
    """Ultra Card native_card module wrapping a built-in HA card."""
    return {
        "id": nid("native-card"),
        "type": "native_card",
        "name": name,
        "card_type": f"hui-{card_config['type']}-card",
        "card_config": card_config,
        "display_conditions": [],
    }


def clock():
    return {
        "id": nid("clock"), "type": "clock", "time_format": "12", "show_seconds": False,
        "show_ampm": True, "show_date": True, "date_style": "long", "timezone": "",
        "alignment": "center", "time_size": 48, "date_size": 16, "time_color": "",
        "date_color": "", "time_weight": "bold", "tap_action": {"action": "nothing"},
        "hold_action": {"action": "nothing"}, "double_tap_action": {"action": "nothing"},
        "display_mode": "always", "display_conditions": [],
    }


def weather(entity):
    return {
        "id": nid("weather"), "type": "weather", "weather_entity": entity, "name": "",
        "show_current": True, "show_condition_label": True, "show_humidity": True,
        "show_wind": True, "show_wind_direction": True, "show_forecast": True,
        "forecast_type": "daily", "forecast_count": 5, "icon_color": "", "temp_color": "",
        "text_color": "", "secondary_text_color": "", "card_background_color": "",
        "tap_action": {"action": "more-info"}, "hold_action": {"action": "nothing"},
        "double_tap_action": {"action": "nothing"}, "display_mode": "always",
        "display_conditions": [],
    }


def ucard(name, rows, x, y, w, h):
    """An Ultra Card (one module column per row) placed on the Desktop artboard."""
    return {
        "type": "custom:ultra-card",
        "_config_version": 2,
        "card_name": name,
        "uc_theme": THEME,
        "layout": {"rows": [
            {"id": (rid := nid("row")), "columns": [{"id": f"{rid}-col", "modules": mods}]}
            for mods in rows
        ]},
        "view_layout": {"desktop": {"x": x, "y": y, "w": w, "h": h, "r": 0, "z": 1, "auto_h": True}},
    }


def heading(text):
    return native({"type": "heading", "heading": text, "heading_style": "title"}, text)


def tile(entity, name=None, dim=False, tap=None, safe=False):
    c = {"type": "tile", "entity": entity}
    if name:
        c["name"] = name
    if dim:
        c["features"] = [{"type": "light-brightness"}]
        c["features_position"] = "bottom"
    if tap:
        c["tap_action"] = {"action": tap}
    if safe:
        # Lock and garage: every tap opens HA's own dialog (D48, D60). The tile icon
        # would otherwise toggle the lock or the door in one tap.
        c["tap_action"] = {"action": "more-info"}
        c["icon_tap_action"] = {"action": "more-info"}
        c["hold_action"] = {"action": "more-info"}
    return c


def grid(cards, columns=2):
    return {"type": "grid", "columns": columns, "square": False, "cards": cards}


PRAYER_MD = """{%- set rows = [('Fajr','sensor.living_room_adhan_fajr_prayer'),('Sunrise','sensor.living_room_adhan_sunrise_time'),('Dhuhr','sensor.living_room_adhan_dhuhr_prayer'),('Asr','sensor.living_room_adhan_asr_prayer'),('Maghrib','sensor.living_room_adhan_maghrib_prayer'),('Isha','sensor.living_room_adhan_isha_prayer')] -%}
{%- set ns = namespace(next='') -%}
{%- for n, e in rows if n != 'Sunrise' and ns.next == '' and as_timestamp(states(e), 0) > as_timestamp(now()) -%}{%- set ns.next = n -%}{%- endfor -%}
{%- if ns.next == '' and states('sensor.living_room_adhan_isha_prayer') not in ['unknown', 'unavailable'] -%}All done today{%- endif %}
| | |
|:--|--:|
{%- for n, e in rows %}
| {{ '**' ~ n ~ '**' if n == ns.next else n }} | {{ '**' if n == ns.next }}{{ as_timestamp(states(e), 0) | timestamp_custom('%-I:%M %p') if states(e) not in ['unknown', 'unavailable'] else '–' }}{{ '**' if n == ns.next }} |
{%- endfor %}"""

L, R, W = 16, 608, 576  # two Desktop columns on the 1200 px artboard

home = [
    ucard("Hero", [[clock()], [weather("weather.forecast_home")]], L, 16, W, 300),
    ucard("Prayer", [[heading("Prayer times")], [native({"type": "markdown", "content": PRAYER_MD}, "Prayer times")]], R, 16, W, 300),
    ucard("Home", [[heading("Home")], [native(grid([
        tile("lock.living_room_front_door", "Front door", safe=True),
        tile("cover.general_garage_door_garage_door", "Garage", safe=True),
        tile("switch.skip_evening_lights_tonight", "Skip Evening Lights", tap="toggle"),
        tile("switch.adhan_pause", "Pause Prayer", tap="toggle"),
        tile("script.nursery_bedtime", "Noor's Bedtime", tap="toggle"),
    ]), "Home controls")]], L, 340, W, 300),
    ucard("Climate", [[heading("Climate")], [native(grid([
        {"type": "thermostat", "entity": "climate.downstairs", "name": "Downstairs"},
        {"type": "thermostat", "entity": "climate.upstairs", "name": "Upstairs"},
    ]), "Thermostats")]], R, 340, W, 420),
    ucard("Outdoor", [[heading("Outdoor")], [native(grid([
        tile("switch.outdoor_porch", "Porch"),
        tile("switch.outdoor_driveway", "Driveway"),
    ]), "Outdoor lights")]], L, 664, W, 160),
]


def room(name, tiles, x, y, h):
    return ucard(name, [[heading(name)], [native(grid(tiles), f"{name} lights")]], x, y, W, h)


lights = [
    room("Living Room", [tile("light.floor_lamp", "Floor Lamp", dim=True), tile("light.buffet", "Buffet", dim=True),
                         tile("light.side_table", "Side Table", dim=True), tile("light.console_lamp", "Console Lamp", dim=True)], L, 16, 300),
    room("Bedroom", [tile("light.dresser", "Dresser", dim=True), tile("light.mahams_lamp", "Maham's Lamp", dim=True),
                     tile("light.waqars_lamp", "Waqar's Lamp", dim=True)], R, 16, 300),
    room("Upstairs", [tile("light.game_room", "Game Room", dim=True), tile("light.upstairs_guest", "Guest Room", dim=True),
                      tile("switch.upstairs_guest_guest_nightstand", "Guest Nightstand"), tile("light.study_lamp", "Study Lamp", dim=True),
                      tile("switch.study_study_floor_lamp", "Study Floor Lamp")], L, 340, 420),
    room("Nursery", [tile("script.nursery_bedtime", "Noor's Bedtime", tap="toggle"), tile("light.bookshelf", "Bookshelf", dim=True),
                     tile("light.changing_table", "Changing Table", dim=True), tile("light.nursery_floor_lamp", "Floor Lamp", dim=True)], R, 340, 300),
]

media = [
    ucard("Living Room HomePod", [[native({"type": "media-control", "entity": "media_player.living_room_living_room_homepod"}, "Living Room HomePod")]], L, 16, W, 220),
    ucard("Bedroom HomePod", [[native({"type": "media-control", "entity": "media_player.master_bedroom_homepod"}, "Bedroom HomePod")]], R, 16, W, 220),
]

FREESPACE = {
    "canvas_widths": {"desktop": 1200, "laptop": 1100, "tablet": 768, "phone": 390},
    "min_height": 800, "grid": 8, "narrow": "stack", "fit": "width",
}


def view(title, path, icon, cards):
    return {"type": "custom:ultra-freespace-view", "title": title, "path": path, "icon": icon,
            "freespace": FREESPACE, "cards": cards}


config = {"views": [
    view("Home", "home", "mdi:home", home),
    view("Lights", "lights", "mdi:lightbulb-group", lights),
    view("Media", "media", "mdi:speaker", media),
]}

json.dump(config, sys.stdout, indent=1, ensure_ascii=False)
