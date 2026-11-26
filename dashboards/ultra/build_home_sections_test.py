#!/usr/bin/env python3
"""Ultra Home and Lights tabs (D87-D90, D92) on HA's Sections view.

v4 (2026-11-26, owner review: margins, proportions, demarcation). Ultra Liquid Glass as shipped.
Structure instead of styling:
  - every tile is its own Ultra card in HA's section grid (6 of 12 columns = half width), so the
    theme's card glass and HA's 8 px grid gap separate tiles; no card nests another box;
  - each section starts with HA's own heading card; room power and Adhan state are heading badges;
  - one type scale: 12 caption, 13 state, 15 tile name, 17 card name, 22 headline, 32 metric
    (Ultra's clock module keeps its own sizes);
  - a tile is: name (with icon) / value / footer row [state, •••] so every ••• sits in the same place.
No custom colours, fonts, backgrounds, borders, padding or margins. Data colours only (swatches,
state icons). One functional exception: 84 px bottom padding in drawers clears HA's tab bar.
Checked with docs/design/tests/uiux-check.js at 430, 820 and 1440.
Usage: python3 build_home_sections_test.py > uc-home-test.json
"""
import json
import sys

THEME = "liquid_glass"
ON = "#F59E0B"
OK_C, ALERT_C = "#15803D", "#C2410C"
CAPTION, STATE, NAME, TITLE, HEADLINE, METRIC = 12, 13, 15, 17, 22, 32
_ids = {}


def nid(kind):
    _ids[kind] = _ids.get(kind, 0) + 1
    return f"{kind}-{_ids[kind]}"


def base(kind, **kw):
    m = {"id": nid(kind), "type": kind}
    m.update(kw)
    return m


def more_info(e):
    return {"action": "more-info", "entity": e}


def toggle(e):
    return {"action": "toggle", "entity": e}


def act(service, entity, **data):
    return {"action": "perform-action", "perform_action": service, "target": {"entity_id": entity}, "data": data}


def text(content=None, size=STATE, weight="400", align="left", template=None, tap=None, hold=None,
         icon="", icon_color="", icon_size=None):
    m = base("text", text=content or "", text_size=size, design={"text_align": align, "font_weight": weight})
    if icon:
        m.update(icon=icon, icon_color=icon_color, icon_position="before")
        if icon_size:
            m["icon_size"] = icon_size
    if template:
        m.update(unified_template_mode=True, unified_template=template)
    if tap:
        m["tap_action"] = tap
    if hold:
        m["hold_action"] = hold
    return m


def tpl(template, **kw):
    return text(template=template, **kw)


def row(modules, align="justify", gap=8):
    return base("horizontal", alignment=align, vertical_alignment="center", gap=gap, gap_unit="px",
                wrap=False, modules=modules)


def stack(modules, gap=6, align="left", tap=None, hold=None):
    m = base("vertical", alignment=align, gap=gap, gap_unit="px", modules=modules)
    if tap:
        m["tap_action"] = tap
    if hold:
        m["hold_action"] = hold
    return m


def ucard(name, modules, cols=12):
    return {"type": "custom:ultra-card", "_config_version": 2, "card_name": name, "uc_theme": THEME,
            "layout": {"rows": [{"id": (rid := nid("row")), "columns": [{"id": f"{rid}-col", "modules": modules}]}]},
            "grid_options": {"columns": cols}}


def heading(title, badges=None, style="title"):
    c = {"type": "heading", "heading": title, "heading_style": style}
    if badges:
        c["badges"] = badges
    return c


def badge(entity, tap, icon=None):
    b = {"type": "entity", "entity": entity, "show_state": True, "show_icon": True, "color": "amber",
         "state_content": "state", "tap_action": tap}
    if icon:
        b["icon"] = icon
    return b


def section(*cards):
    return {"type": "grid", "cards": list(cards)}


def drawer(label, modules, entity=None, icon="mdi:dots-horizontal"):
    tail = [text("Open full controls", NAME, "600", "center", tap=more_info(entity))] if entity else []
    body = base("vertical", alignment="left", gap=12, gap_unit="px", modules=modules + tail,
                design={"padding_bottom": "84px"})  # clears HA's bottom tab bar (the one exception)
    return base("drawer", drawer_position="bottom", drawer_title="", show_close_button=True,
                close_on_overlay_click=True, trigger_style="icon", trigger_label=label, trigger_icon=icon,
                trigger_alignment="right", drawer_size="auto", modules=[body])


def drawer_head(name, sub):
    return stack([text(name, HEADLINE, "700"), tpl(sub, size=STATE)], gap=4)


def on_col(e):
    return "{{ '%s' if is_state('%s','on') else '' }}" % (ON, e)


def tile(name, icon, icon_col, value=None, state=None, ctrl=None, tap=None, hold=None, cols=6):
    """name / value / footer [state, ctrl]. The footer is a 50/50 row, so ctrl sits at the same
    place in every tile."""
    mods = [text(name, NAME, "600", icon=icon, icon_size=20, icon_color=icon_col)]
    if value:
        mods.append(value)
    if state or ctrl:
        mods.append(row([tpl(state, size=STATE) if state else text(" ", STATE), ctrl] if ctrl else [tpl(state, size=STATE)]))
    return ucard(name, [stack(mods, gap=8, tap=tap, hold=hold)], cols)


# ---- Lights ------------------------------------------------------------------------------
WHITES = [("Candle", 2200, "#FF9329"), ("Warm", 2700, "#FFB060"), ("Neutral", 4000, "#FFE4CE"), ("Daylight", 6500, "#EBF0FF")]
COLOURS = [("Coral", [255, 120, 90]), ("Amber", [255, 190, 70]), ("Green", [120, 220, 140]),
           ("Blue", [90, 160, 255]), ("Violet", [190, 120, 255]), ("Pink", [255, 110, 190])]


def bar(entity, height=34):
    return base("slider_control", bars=[{
        "id": nid("bar"), "type": "brightness", "entity": entity, "min_value": 0, "max_value": 100, "step": 1,
        "show_icon": False, "show_name": False, "show_value": True, "show_bar_label": False}],
        orientation="horizontal", layout_mode="overlay", slider_style="flat", slider_height=height,
        dynamic_fill_color=True, show_icon=False, show_name=False, show_state=False, show_value=True,
        value_suffix="%", show_toggle=False, show_color_picker=False, haptic_feedback=True, show_bar_label=False)


def grid(mods, columns):
    return base("grid_layout", modules=mods, column_mode="fixed", columns=columns, gap=12,
                item_alignment="stretch", mobile_breakpoint=0, mobile_columns=columns, item_spans={})


def swatch(label, colour, tap):
    return text(label, CAPTION, "500", "center", icon="mdi:circle", icon_color=colour, icon_size=32, tap=tap)


def light_drawer(entity, name, st):
    return drawer(name + " controls", [
        drawer_head(name, st),
        text("Brightness", CAPTION, "600"), bar(entity, 48),
        text("White", CAPTION, "600"),
        grid([swatch(n, c, act("light.turn_on", entity, color_temp_kelvin=k)) for n, k, c in WHITES], 4),
        text("Colour", CAPTION, "600"),
        grid([swatch(n, "rgb(%d,%d,%d)" % tuple(c), act("light.turn_on", entity, rgb_color=c)) for n, c in COLOURS], 3),
    ], entity)


def pct(e):
    return "((state_attr('%s','brightness') or 0) / 2.55) | round(0) | int ~ '%%'" % e


def light_state(e, members=None):
    if members:
        on = "(%s | select('is_state','on') | list | count)" % members
        return "{{ (%s ~ ' of %d on') if is_state('%s','on') else 'All off' }}" % (on, members.count("'") // 2, e)
    return "{{ 'On' if is_state('%s','on') else 'Off' }}" % e


def light_tile(e, name, members=None, icon="mdi:lightbulb", drawer_name=None, cols=6):
    st = light_state(e, members)
    ctrl = light_drawer(e, drawer_name or name, st) if (members or drawer_name) else None
    return tile(name, icon, on_col(e), value=bar(e), state=st, ctrl=ctrl, tap=None, cols=cols)


def plug_tile(e, name, icon="mdi:floor-lamp"):
    return tile(name, icon, on_col(e), state="{{ 'On' if is_state('%s','on') else 'Off' }}" % e, tap=toggle(e))


def room(name, group, lights, plugs=()):
    mlist = "[" + ",".join("'%s'" % e for e, _ in lights) + "]"
    tap = toggle(group) if not plugs else {
        "action": "perform-action", "perform_action": "homeassistant.toggle",
        "target": {"entity_id": [group] + [e for e, _ in plugs]}, "data": {}}
    cards = [heading(name, [badge(group, tap, "mdi:power")]),
             light_tile(group, "All lights", mlist, "mdi:lamps", drawer_name=name, cols=12)]
    cards += [light_tile(e, n) for e, n in lights] + [plug_tile(e, n) for e, n in plugs]
    return section(*cards)


LIVING = [("light.floor_lamp", "Floor Lamp"), ("light.buffet", "Buffet"), ("light.side_table", "Side Table"),
          ("light.console_lamp", "Console Lamp")]
BEDROOM = [("light.dresser", "Dresser"), ("light.mahams_lamp", "Maham's Lamp"), ("light.waqars_lamp", "Waqar's Lamp")]
NURSERY = [("light.bookshelf", "Bookshelf"), ("light.changing_table", "Changing Table"),
           ("light.nursery_floor_lamp", "Floor Lamp")]
UPSTAIRS = [("light.game_room", "Game Room"), ("light.upstairs_guest", "Guest Room"), ("light.study_lamp", "Nightstand")]
UP_PLUGS = [("switch.study_study_floor_lamp", "Study Floor Lamp"), ("switch.upstairs_guest_guest_nightstand", "Guest Nightstand")]
DOWN_M = "['" + "','".join(e for e, _ in LIVING + BEDROOM) + "']"
UP_M = "['" + "','".join(e for e, _ in UPSTAIRS) + "']"
OUT = "switch.outdoor_lights"

lights_view = {
    "type": "sections", "title": "Lights", "path": "lights", "icon": "mdi:lightbulb-group",
    "max_columns": 3, "dense_section_placement": True,
    "sections": [
        section(heading("Floors"), heading("Nursery not included", style="subtitle"),
                light_tile("light.downstairs_lights", "Downstairs", DOWN_M, "mdi:home-floor-1"),
                light_tile("light.upstairs_lights", "Upstairs", UP_M, "mdi:home-floor-2"),
                tile("Outdoor", "mdi:outdoor-lamp", on_col(OUT),
                     state="{{ 'On' if is_state('%s','on') else 'Off' }} · porch and driveway" % OUT,
                     tap=toggle(OUT), cols=12)),
        room("Living Room", "light.living_room_lights", LIVING),
        room("Bedroom", "light.bedroom_lights", BEDROOM),
        room("Nursery", "light.nursery_lights", NURSERY),
        room("Upstairs", "light.upstairs_lights", UPSTAIRS, UP_PLUGS),
    ],
}


# ---- Home ------------------------------------------------------------------------------------
hero = ucard("Hero", [
    base("clock", time_format="12", show_seconds=False, show_ampm=True, show_date=True, date_style="long",
         alignment="left"),
    base("weather", weather_entity="weather.forecast_home", show_current=True, show_condition_label=True,
         show_humidity=True, show_wind=True, show_forecast=True, forecast_type="daily", forecast_count=5,
         tap_action=more_info("weather.forecast_home")),
])

PRAYER = [("Fajr", "fajr"), ("Dhuhr", "dhuhr"), ("Asr", "asr"), ("Maghrib", "maghrib"), ("Isha", "isha")]
P_LIST = "[" + ",".join(f"['{n}','sensor.living_room_adhan_{k}_prayer']" for n, k in PRAYER) + "]"
PRAYER_MD = (
    "{%- set P = " + P_LIST + " -%}"
    "{%- set ns = namespace(t=[], i=-1) -%}"
    "{%- for p in P -%}{%- set ns.t = ns.t + [as_timestamp(states(p[1]), 0)] -%}{%- endfor -%}"
    "{%- set n = as_timestamp(now()) -%}"
    "{%- for x in ns.t -%}{%- if ns.i < 0 and x > n -%}{%- set ns.i = loop.index0 -%}{%- endif -%}{%- endfor -%}"
    "{%- if ns.t[4] == 0 -%}<div>Prayer times unavailable</div>{%- else -%}"
    "{%- if ns.i < 0 -%}{%- set nx, tn, tmw = 'Fajr', ns.t[0] + 86400, true -%}"
    "{%- else -%}{%- set nx, tn, tmw = P[ns.i][0], ns.t[ns.i], false -%}{%- endif -%}"
    "{%- set m = ((tn - n) / 60) | round(0, 'ceil') | int -%}"
    "{%- set rel = 'in ' ~ ((m // 60) ~ ' h ' if m >= 60 else '') ~ (m % 60) ~ ' min' -%}"
    "<div style=\"display:flex;flex-direction:column;gap:16px\">"
    "<div style=\"display:flex;flex-direction:column;gap:4px\">"
    "<div style=\"font-size:13px\">Next prayer{{ ' · tomorrow' if tmw }}</div>"
    "<div style=\"display:flex;align-items:baseline;justify-content:space-between;gap:12px\">"
    "<span style=\"font-size:22px;font-weight:700\">{{ nx }} "
    "<span style=\"font-weight:400\">{{ tn | timestamp_custom('%-I:%M %p') }}</span></span>"
    "<span style=\"font-size:15px;font-weight:600;white-space:nowrap\">{{ rel }}</span></div></div>"
    "<div style=\"display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;text-align:center\">"
    "{%- for p in P -%}{%- set x = ns.t[loop.index0] -%}{%- set nxt = loop.index0 == ns.i -%}"
    "<div style=\"display:flex;flex-direction:column;gap:2px;{{ 'font-weight:700' if nxt else ('opacity:.5' if x < n else '') }}\">"
    "<span style=\"font-size:12px\">{{ p[0] }}</span>"
    "<span style=\"font-size:15px\">{{ x | timestamp_custom('%-I:%M') }}</span></div>"
    "{%- endfor -%}</div>"
    "<div style=\"font-size:12px\">Sunrise "
    "{{ as_timestamp(states('sensor.living_room_adhan_sunrise_time'), 0) | timestamp_custom('%-I:%M %p') }}</div>"
    "</div>{%- endif -%}"
)
prayer = ucard("Prayer", [base("markdown", markdown_content=PRAYER_MD, enable_html=True, enable_tables=False,
                               enable_code_highlighting=False, unified_template_mode=False, unified_template="")])
adhan_badge = {"type": "entity", "entity": "switch.adhan_pause", "name": "Pause", "show_state": True,
               "show_icon": True, "icon": "mdi:pause", "color": "deep-orange", "state_content": ["name", "state"],
               "tap_action": more_info("switch.adhan_pause")}

LOCK, GARAGE = "lock.living_room_front_door", "cover.general_garage_door_garage_door"
lock_drawer = drawer("Front door controls", [
    base("lock", entity=LOCK, name="Front door", require_confirmation=True)], LOCK)
garage_drawer = drawer("Garage controls", [
    base("cover", entity=GARAGE, name="Garage")], GARAGE)


def cap(e):
    return "{{ states('%s') | capitalize }}" % e


home_cards = [
    heading("Home"),
    tile("Front door", "mdi:lock", "{{ '%s' if is_state('%s','locked') else '%s' }}" % (OK_C, LOCK, ALERT_C),
         state=cap(LOCK), ctrl=lock_drawer),
    tile("Garage", "mdi:garage-variant", "{{ '%s' if is_state('%s','closed') else '%s' }}" % (OK_C, GARAGE, ALERT_C),
         state=cap(GARAGE), ctrl=garage_drawer),
    tile("Porch", "mdi:lightbulb", on_col(OUT), state=cap(OUT), tap=toggle(OUT)),
    tile("Skip Evening Lights", "mdi:weather-night", on_col("switch.skip_evening_lights_tonight"),
         state=cap("switch.skip_evening_lights_tonight"), tap=toggle("switch.skip_evening_lights_tonight")),
    tile("Pause Prayer", "mdi:pause", on_col("switch.adhan_pause"), state=cap("switch.adhan_pause"),
         tap=more_info("switch.adhan_pause")),
    tile("Noor's Bedtime", "mdi:sleep", on_col("switch.noor_s_bedtime"),
         state="{{ 'Running' if is_state('switch.noor_s_bedtime','on') else 'Tap to run' }}",
         tap=toggle("switch.noor_s_bedtime")),
]

MODES = [("heat_cool", "Auto", "mdi:thermostat-auto"), ("heat", "Heat", "mdi:fire"),
         ("cool", "Cool", "mdi:snowflake"), ("off", "Off", "mdi:power")]


def climate_tile(e, name):
    rng = ("{{ (state_attr('%s','target_temp_low') | int ~ '–' ~ state_attr('%s','target_temp_high') | int ~ '°') "
           "if state_attr('%s','target_temp_low') is not none else ((state_attr('%s','temperature') | int(0)) ~ '°') }}"
           % ((e,) * 4))
    mode = "{{ {'heat_cool':'Auto','heat':'Heat','cool':'Cool','off':'Off'}.get(states('%s'), states('%s') | capitalize) }}" % (e, e)
    chips = [text(lbl, STATE, "600", "center", icon=ic, icon_size=18,
                  icon_color="{{ '%s' if is_state('%s','%s') else '' }}" % (ON, e, m),
                  tap=act("climate.set_hvac_mode", e, hvac_mode=m)) for m, lbl, ic in MODES]
    c_drawer = drawer(name + " thermostat", [
        drawer_head(name, "{{ state_attr('%s','current_temperature') | round(0) | int }}° now · " % e + mode),
        text("Mode", CAPTION, "600"), grid(chips, 4),
        text("Setpoints", CAPTION, "600"),
        tpl("Heat to {{ state_attr('%s','target_temp_low') | int(0) }}° · Cool to "
            "{{ state_attr('%s','target_temp_high') | int(0) }}°" % (e, e), size=TITLE, weight="600"),
    ], e, icon="mdi:tune-variant")
    value = stack([tpl("{{ state_attr('%s','current_temperature') | round(0) | int }}°" % e, size=METRIC, weight="300",
                       tap=more_info(e)),
                   tpl("Set " + rng, size=STATE)], gap=2)
    return tile(name, "mdi:thermostat", "", value=value, state=mode, ctrl=c_drawer)


home_view = {"type": "sections", "title": "Home", "path": "home", "icon": "mdi:home",
             "max_columns": 3, "dense_section_placement": True,
             "sections": [section(hero),
                          section(heading("Prayer", [adhan_badge]), prayer),
                          section(*home_cards),
                          section(heading("Climate"), climate_tile("climate.downstairs", "Downstairs"),
                                  climate_tile("climate.upstairs", "Upstairs"))]}

json.dump({"views": [home_view, lights_view]}, sys.stdout, separators=(",", ":"), ensure_ascii=False)
