#!/usr/bin/env python3
"""Ultra Home and Lights tabs (D87-D90, D92) on HA's Sections view.

v3 (2026-11-26, D92): Ultra out of the box. Every card uses Ultra's Liquid Glass theme as
shipped. No custom colours, fonts, backgrounds, borders, shadows, padding or margins: the
theme draws the glass panes and spacing. Only Ultra's own module options are used (text
size, weight, alignment, icons, templates, actions). Data colours are the only colours set:
colour swatches, and green/red/amber state icons.
One exception, functional: the drawer content ends with 84 px bottom padding so HA's bottom
tab bar does not cover "Open full controls".

Usage: python3 build_home_sections_test.py > uc-home-test.json
       python3 build_habib_home_uc_v2.py > habib-home-uc.json
"""
import json
import sys

THEME = "liquid_glass"
ON, OFF_C = "#F59E0B", ""            # state icon colour: amber when on, theme default when off
OK_C, ALERT_C = "#15803D", "#C2410C"  # secure / needs attention (same as the v1 Adhan chip)
_ids = {}


def nid(kind):
    _ids[kind] = _ids.get(kind, 0) + 1
    return f"{kind}-{_ids[kind]}"


def base(kind, **kw):
    m = {"id": nid(kind), "type": kind}
    m.update(kw)
    return m


def more_info(entity):
    return {"action": "more-info", "entity": entity}


def toggle(entity):
    return {"action": "toggle", "entity": entity}


def act(service, entity, **data):
    return {"action": "perform-action", "perform_action": service, "target": {"entity_id": entity}, "data": data}


def text(content=None, size=15, weight="400", align="left", template=None, tap=None, hold=None,
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


def tpl_text(template, **kw):
    return text(template=template, **kw)


def markdown(content):
    return base("markdown", markdown_content=content, enable_html=True, enable_tables=False,
                enable_code_highlighting=False, unified_template_mode=False, unified_template="")


def row(modules, align="justify", gap=8, tap=None):
    m = base("horizontal", alignment=align, vertical_alignment="center", gap=gap, gap_unit="px",
             wrap=False, modules=modules)
    if tap:
        m["tap_action"] = tap
    return m


def stack(modules, gap=4, align="left", tap=None):
    """A vertical block. Liquid Glass gives it its glass pane."""
    m = base("vertical", alignment=align, gap=gap, gap_unit="px", modules=modules)
    if tap:
        m["tap_action"] = tap
    return m


def grid(tiles, columns=2):
    return base("grid_layout", modules=tiles, column_mode="fixed", columns=columns, gap=10,
                item_alignment="stretch", mobile_breakpoint=0, mobile_columns=columns, item_spans={})


def ucard(name, modules):
    return {"type": "custom:ultra-card", "_config_version": 2, "card_name": name, "uc_theme": THEME,
            "layout": {"rows": [{"id": (rid := nid("row")), "columns": [{"id": f"{rid}-col", "modules": modules}]}]},
            "grid_options": {"columns": "full"}}


def title(label, right=None):
    mods = [text(label, 17, "600")]
    if right:
        mods.append(right)
    return row(mods)


def section(*cards):
    return {"type": "grid", "cards": list(cards)}


def drawer(label, modules, entity=None, icon="mdi:dots-horizontal"):
    tail = [text("Open full controls", 15, "600", "center", tap=more_info(entity))] if entity else []
    body = base("vertical", alignment="left", gap=12, gap_unit="px", modules=modules + tail,
                design={"padding_bottom": "84px"})  # clears HA's bottom tab bar (the one exception)
    return base("drawer", drawer_position="bottom", drawer_title="", show_close_button=True,
                close_on_overlay_click=True, trigger_style="icon", trigger_label=label, trigger_icon=icon,
                trigger_alignment="right", drawer_size="auto", modules=[body])


def drawer_head(name, sub_template):
    return stack([text(name, 20, "700"), tpl_text(sub_template, size=13)], gap=2)


def on_col(entity):
    return "{{ '%s' if is_state('%s','on') else '%s' }}" % (ON, entity, OFF_C)


# ---- Lights ------------------------------------------------------------------------------
WHITES = [("Candle", 2200, "#FF9329"), ("Warm", 2700, "#FFB060"), ("Neutral", 4000, "#FFE4CE"), ("Daylight", 6500, "#EBF0FF")]
COLOURS = [("Coral", [255, 120, 90]), ("Amber", [255, 190, 70]), ("Green", [120, 220, 140]),
           ("Blue", [90, 160, 255]), ("Violet", [190, 120, 255]), ("Pink", [255, 110, 190])]


def bar(entity, height=34):
    return base("slider_control", bars=[{
        "id": nid("bar"), "type": "brightness", "entity": entity, "min_value": 0, "max_value": 100, "step": 1,
        "show_icon": False, "show_name": False, "show_value": True, "show_bar_label": False}],
        orientation="horizontal", layout_mode="overlay", slider_height=height, dynamic_fill_color=True,
        show_icon=False, show_name=False, show_state=False, show_value=True, value_suffix="%",
        show_toggle=False, show_color_picker=False, haptic_feedback=True, show_bar_label=False)


def swatch(label, colour, tap):
    # Icon + label; the icon colour is the swatch colour (data, not styling).
    return text(label, 12, "500", "center", icon="mdi:circle", icon_color=colour, icon_size=32, tap=tap)


def light_drawer(entity, name, state_tpl):
    return drawer(name + " controls", [
        drawer_head(name, state_tpl),
        text("Brightness", 12, "600"), bar(entity, 48),
        text("White", 12, "600"),
        grid([swatch(n, c, act("light.turn_on", entity, color_temp_kelvin=k)) for n, k, c in WHITES], columns=4),
        text("Colour", 12, "600"),
        grid([swatch(n, "rgb(%d,%d,%d)" % tuple(c), act("light.turn_on", entity, rgb_color=c)) for n, c in COLOURS],
             columns=3),
    ], entity)


def pct(entity):
    return "((state_attr('%s','brightness') or 0) / 2.55) | round(0) | int ~ '%%'" % entity


def light_state(entity, members=None):
    if members:
        on = "(%s | select('is_state','on') | list | count)" % members
        return ("{{ (%s ~ ' of %d on · ' ~ %s) if is_state('%s','on') else 'All off' }}"
                % (on, members.count("'") // 2, pct(entity), entity))
    return "{{ %s if is_state('%s','on') else 'Off' }}" % (pct(entity), entity)


def light_tile(entity, name, members=None, icon="mdi:lightbulb", with_drawer=False, drawer_name=None):
    """Tap toggles, long press opens HA's dialog. Group tiles carry the room's one shared drawer,
    on its own line under the bar (an Ultra row splits its children 50/50)."""
    st = light_state(entity, members)
    mods = [text(name, 15, "600", icon=icon, icon_size=20, icon_color=on_col(entity),
                 tap=toggle(entity), hold=more_info(entity)),
            tpl_text(st, size=13, tap=toggle(entity), hold=more_info(entity)),
            bar(entity)]
    if with_drawer:
        mods.append(light_drawer(entity, drawer_name or name, st))
    return stack(mods, gap=6)


def plug_tile(entity, name, icon="mdi:floor-lamp"):
    return stack([text(name, 15, "600", icon=icon, icon_size=20, icon_color=on_col(entity), tap=toggle(entity)),
                  tpl_text("{{ 'On' if is_state('%s','on') else 'Off' }} · plug" % entity, size=13,
                           tap=toggle(entity))], gap=6, tap=toggle(entity))


def power(entities, group):
    tap = (toggle(group) if len(entities) == 1 else
           {"action": "perform-action", "perform_action": "homeassistant.toggle",
            "target": {"entity_id": entities}, "data": {}})
    return tpl_text("{{ 'On' if is_state('%s','on') else 'Off' }}" % group, size=13, weight="600", align="right",
                    icon="mdi:power", icon_size=20, icon_color=on_col(group), tap=tap)


def room(name, group, lights, plugs=(), icon="mdi:sofa"):
    mlist = "[" + ",".join("'%s'" % e for e, _ in lights) + "]"
    head = row([text(name, 17, "600", icon=icon, icon_size=20, icon_color=on_col(group)),
                power([group] + [e for e, _ in plugs], group)])
    tiles = [light_tile(e, n) for e, n in lights] + [plug_tile(e, n) for e, n in plugs]
    acc = base("accordion", title_mode="custom", title_text="%d lights" % (len(lights) + len(plugs)),
               icon="mdi:chevron-down", header_alignment="apart", icon_side="right", default_open=False,
               expand_direction="down", expand_style="push", open_mode="manual",
               modules=[light_tile(group, "All lights", mlist, "mdi:lamps", True, name), grid(tiles)])
    return ucard(name, [head, tpl_text(light_state(group, mlist), size=13), acc])


LIVING = [("light.floor_lamp", "Floor Lamp"), ("light.buffet", "Buffet"), ("light.side_table", "Side Table"),
          ("light.console_lamp", "Console Lamp")]
BEDROOM = [("light.dresser", "Dresser"), ("light.mahams_lamp", "Maham's Lamp"), ("light.waqars_lamp", "Waqar's Lamp")]
NURSERY = [("light.bookshelf", "Bookshelf"), ("light.changing_table", "Changing Table"),
           ("light.nursery_floor_lamp", "Floor Lamp")]
UPSTAIRS = [("light.game_room", "Game Room"), ("light.upstairs_guest", "Guest Room"), ("light.study_lamp", "Nightstand")]
UP_PLUGS = [("switch.study_study_floor_lamp", "Study Floor Lamp"), ("switch.upstairs_guest_guest_nightstand", "Guest Nightstand")]
DOWN_M = "['" + "','".join(e for e, _ in LIVING + BEDROOM) + "']"
UP_M = "['" + "','".join(e for e, _ in UPSTAIRS) + "']"

floors = ucard("Floors", [
    title("Floors", text("Nursery not included", 13, align="right")),
    grid([light_tile("light.downstairs_lights", "Downstairs", DOWN_M, "mdi:home-floor-1", True),
          light_tile("light.upstairs_lights", "Upstairs", UP_M, "mdi:home-floor-2", True)]),
])

OUT = "switch.outdoor_lights"
outdoor = ucard("Outdoor", [
    row([text("Outdoor", 17, "600", icon="mdi:outdoor-lamp", icon_size=20, icon_color=on_col(OUT)), power([OUT], OUT)]),
    text("Porch and driveway", 13),
])

lights_view = {
    "type": "sections", "title": "Lights", "path": "lights", "icon": "mdi:lightbulb-group",
    "max_columns": 3, "dense_section_placement": True,
    "sections": [section(floors, outdoor),
                 section(room("Living Room", "light.living_room_lights", LIVING)),
                 section(room("Bedroom", "light.bedroom_lights", BEDROOM, icon="mdi:bed")),
                 section(room("Nursery", "light.nursery_lights", NURSERY, icon="mdi:baby-carriage")),
                 section(room("Upstairs", "light.upstairs_lights", UPSTAIRS, UP_PLUGS, icon="mdi:stairs"))],
}


# ---- Home: Hero (Ultra clock + weather modules, as shipped) ---------------------------------
hero = ucard("Hero", [
    base("clock", time_format="12", show_seconds=False, show_ampm=True, show_date=True, date_style="long",
         alignment="left", time_size=52, date_size=15),
    base("weather", weather_entity="weather.forecast_home", show_current=True, show_condition_label=True,
         show_humidity=True, show_wind=True, show_forecast=True, forecast_type="daily", forecast_count=5,
         tap_action=more_info("weather.forecast_home")),
])


# ---- Home: Prayer (markdown: layout only, colours from the theme) ----------------------------
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
    "<div style=\"display:flex;flex-direction:column;gap:12px\">"
    "<div><div style=\"font-size:13px\">Next prayer{{ ' · tomorrow' if tmw }}</div>"
    "<div style=\"display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap\">"
    "<span style=\"display:inline-flex;align-items:baseline;gap:10px\"><span style=\"font-size:34px;font-weight:700\">{{ nx }}</span>"
    "<span style=\"font-size:22px;font-weight:600\">{{ tn | timestamp_custom('%-I:%M %p') }}</span></span>"
    "<span style=\"font-size:15px;font-weight:600\">{{ rel }}</span></div></div>"
    "<div style=\"display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;text-align:center\">"
    "{%- for p in P -%}{%- set x = ns.t[loop.index0] -%}{%- set nxt = loop.index0 == ns.i -%}"
    "<div style=\"{{ 'font-weight:700' if nxt else ('opacity:.5' if x < n else '') }}\">"
    "<div style=\"font-size:12px\">{{ p[0] }}</div>"
    "<div style=\"font-size:15px\">{{ x | timestamp_custom('%-I:%M') }}</div>"
    "{{ '<div style=\"font-size:10px\">●</div>' if nxt }}</div>"
    "{%- endfor -%}</div>"
    "<div style=\"font-size:12px\">Sunrise "
    "{{ as_timestamp(states('sensor.living_room_adhan_sunrise_time'), 0) | timestamp_custom('%-I:%M %p') }}</div>"
    "</div>{%- endif -%}"
)
ADHAN_CHIP = ("{{ {'content': 'Adhan paused' if is_state('switch.adhan_pause', 'on') else 'Adhan on', "
              "'icon': 'mdi:circle', 'icon_color': '" + ALERT_C + "' if is_state('switch.adhan_pause', 'on') else '"
              + OK_C + "'} | tojson }}")

prayer = ucard("Prayer", [
    title("Prayer", tpl_text(ADHAN_CHIP, size=13, weight="500", align="right", icon="mdi:circle",
                             tap=more_info("switch.adhan_pause"))),
    markdown(PRAYER_MD),
])


# ---- Home: security and quick switches -----------------------------------------------------
LOCK, GARAGE = "lock.living_room_front_door", "cover.general_garage_door_garage_door"
SECURE = "{{ 'All secure' if is_state('%s','locked') and is_state('%s','closed') else 'Check doors' }}" % (LOCK, GARAGE)
SECURE_COL = "{{ '%s' if is_state('%s','locked') and is_state('%s','closed') else '%s' }}" % (OK_C, LOCK, GARAGE, ALERT_C)


def item(name, state_tpl, icon, col_tpl, tap=None, extra=None):
    mods = [text(name, 15, "600", "center", icon=icon, icon_size=20, icon_color=col_tpl),
            tpl_text(state_tpl, size=13, align="center")]
    if extra:
        mods.append(extra)
    return stack(mods, gap=2, align="center", tap=tap)


lock_drawer = drawer("Front door controls", [
    drawer_head("Front door", "{{ states('%s') | capitalize }}" % LOCK),
    grid([text("Lock", 15, "600", "center", icon="mdi:lock", tap=act("lock.lock", LOCK)),
          text("Hold to unlock", 15, "600", "center", icon="mdi:lock-open-variant", icon_color=ALERT_C,
               hold=act("lock.unlock", LOCK))]),
    text("Unlock needs a long press so a stray tap cannot open the door.", 13),
], LOCK)

garage_drawer = drawer("Garage controls", [
    drawer_head("Garage", "{{ states('%s') | capitalize }}" % GARAGE),
    grid([text("Hold to open", 15, "600", "center", icon="mdi:garage-open-variant", icon_color=ALERT_C,
               hold=act("cover.open_cover", GARAGE)),
          text("Hold to close", 15, "600", "center", icon="mdi:garage-variant", hold=act("cover.close_cover", GARAGE))]),
    text("Both need a long press. Close only with a clear view of the door.", 13),
], GARAGE)


def switch_tile(entity, name, icon, tap, state_tpl=None):
    return stack([text(name, 15, "600", icon=icon, icon_size=20, icon_color=on_col(entity)),
                  tpl_text(state_tpl or "{{ states('%s') | capitalize }}" % entity, size=13)], gap=2, tap=tap)


home = ucard("Home", [
    title("Home"),
    tpl_text(SECURE, size=17, weight="600", icon="mdi:shield-check", icon_size=22, icon_color=SECURE_COL),
    grid([
        item("Front door", "{{ states('%s') | capitalize }}" % LOCK, "mdi:lock",
             "{{ '%s' if is_state('%s','locked') else '%s' }}" % (OK_C, LOCK, ALERT_C), extra=lock_drawer),
        item("Garage", "{{ states('%s') | capitalize }}" % GARAGE, "mdi:garage-variant",
             "{{ '%s' if is_state('%s','closed') else '%s' }}" % (OK_C, GARAGE, ALERT_C), extra=garage_drawer),
        item("Porch", "{{ states('%s') | capitalize }}" % OUT, "mdi:lightbulb", on_col(OUT), tap=toggle(OUT)),
    ], columns=3),
    grid([
        switch_tile("switch.skip_evening_lights_tonight", "Skip Evening Lights", "mdi:weather-night",
                    toggle("switch.skip_evening_lights_tonight")),
        switch_tile("switch.adhan_pause", "Pause Prayer", "mdi:pause", more_info("switch.adhan_pause")),
        switch_tile("switch.noor_s_bedtime", "Noor's Bedtime", "mdi:sleep", toggle("switch.noor_s_bedtime"),
                    "{{ 'Running' if is_state('switch.noor_s_bedtime','on') else 'Run' }}"),
    ]),
])


# ---- Home: Climate --------------------------------------------------------------------------
MODES = [("heat_cool", "Auto", "mdi:thermostat-auto"), ("heat", "Heat", "mdi:fire"),
         ("cool", "Cool", "mdi:snowflake"), ("off", "Off", "mdi:power")]


def climate_tile(entity, name):
    rng = ("{{ (state_attr('%s','target_temp_low') | int ~ '–' ~ state_attr('%s','target_temp_high') | int ~ '°') "
           "if state_attr('%s','target_temp_low') is not none else ((state_attr('%s','temperature') | int(0)) ~ '°') }}"
           % ((entity,) * 4))
    mode = "{{ {'heat_cool':'Auto','heat':'Heat','cool':'Cool','off':'Off'}.get(states('%s'), states('%s') | capitalize) }}" % (entity, entity)
    temp = "{{ state_attr('%s','current_temperature') | round(0) | int }}°" % entity
    chips = [text(lbl, 13, "600", "center", icon=ic, icon_size=18,
                  icon_color="{{ '%s' if is_state('%s','%s') else '' }}" % (ON, entity, m),
                  tap=act("climate.set_hvac_mode", entity, hvac_mode=m)) for m, lbl, ic in MODES]
    # Ultra's climate module is Pro (D86), so the drawer has mode buttons and the setpoints;
    # steppers wait for a step script on the Pi (I81).
    c_drawer = drawer(name + " thermostat", [
        drawer_head(name, "{{ state_attr('%s','current_temperature') | round(0) | int }}° now · " % entity + mode),
        text("Mode", 12, "600"), grid(chips, columns=4),
        text("Setpoints", 12, "600"),
        tpl_text("Heat to {{ state_attr('%s','target_temp_low') | int(0) }}° · Cool to "
                 "{{ state_attr('%s','target_temp_high') | int(0) }}°" % (entity, entity), size=17, weight="600"),
    ], entity, icon="mdi:tune-variant")
    return stack([tpl_text(temp, size=44, weight="300", align="center", tap=more_info(entity)),
                  tpl_text(rng, size=13, align="center"),
                  text(name, 17, "600", "center"),
                  tpl_text(mode, size=13, align="center"),
                  c_drawer], gap=2, align="center")


climate = ucard("Climate", [
    title("Climate"),
    grid([climate_tile("climate.downstairs", "Downstairs"), climate_tile("climate.upstairs", "Upstairs")]),
])


home_view = {"type": "sections", "title": "Home", "path": "home", "icon": "mdi:home",
             "max_columns": 3, "dense_section_placement": True,
             "sections": [section(hero), section(prayer), section(home), section(climate)]}

json.dump({"views": [home_view, lights_view]}, sys.stdout, separators=(",", ":"), ensure_ascii=False)
