#!/usr/bin/env python3
"""Throwaway test dashboard for the Home tab rebuild (D87): Hero, Prayer, Climate
as Ultra Cards on HA's Sections view, after wireframes v0.1
(canvas artifact 3ib7jm5EkaxchB3fZXcSdS).

Rules kept: Liquid Glass as shipped (D86), no Pro modules, climate rows open HA's
own thermostat dialog (no setpoint controls on the card face), the Adhan chip
opens HA's dialog for switch.adhan_pause (no direct toggle).
Usage: python3 build_home_sections_test.py > /tmp/uc-home-test.json
"""
import json
import sys

THEME = "liquid_glass"
_ids = {}


def nid(kind):
    _ids[kind] = _ids.get(kind, 0) + 1
    return f"{kind}-{_ids[kind]}"


def base(kind, **kw):
    m = {"id": nid(kind), "type": kind, "tap_action": {"action": "nothing"},
         "hold_action": {"action": "nothing"}, "double_tap_action": {"action": "nothing"},
         "display_mode": "always", "display_conditions": []}
    m.update(kw)
    return m


def more_info(entity):
    return {"action": "more-info", "entity": entity}


def text(content=None, template=None, size=16, weight="400", align="left", tap=None, icon="", design=None, icon_color="", icon_size=None):
    m = base("text", text=content or "", icon=icon, icon_color=icon_color, icon_position="before",
             unified_template_mode=bool(template), unified_template=template or "",
             rich_text_content="", enable_hover_effect=False, text_size=size,
             design={"text_align": align, "font_weight": weight, **(design or {})})
    if tap:
        m["tap_action"] = tap
    if icon_size:
        m["icon_size"] = icon_size
    return m


def markdown(content):
    return base("markdown", markdown_content=content, enable_html=True, enable_tables=False,
                enable_code_highlighting=False, unified_template_mode=False, unified_template="")


def row(modules, align="justify", tap=None, gap=8, design=None):
    m = base("horizontal", alignment=align, vertical_alignment="center", gap=gap, gap_unit="px",
             wrap=False, modules=modules, design=design or {})
    if tap:
        m["tap_action"] = tap
    return m


def ucard(name, modules):
    return {
        "type": "custom:ultra-card",
        "_config_version": 2,
        "card_name": name,
        "uc_theme": THEME,
        "layout": {"rows": [{"id": (rid := nid("row")), "columns": [{"id": f"{rid}-col", "modules": modules}]}]},
        "grid_options": {"columns": "full"},
    }


# ---- Prayer -------------------------------------------------------------------------
PRAYER = [("Fajr", "fajr"), ("Dhuhr", "dhuhr"), ("Asr", "asr"), ("Maghrib", "maghrib"), ("Isha", "isha")]
P_LIST = "[" + ",".join(f"['{n}','sensor.living_room_adhan_{k}_prayer']" for n, k in PRAYER) + "]"
SUB = "opacity:.72"
PRAYER_MD = (
    "{%- set P = " + P_LIST + " -%}"
    "{%- set ns = namespace(t=[], i=-1) -%}"
    "{%- for p in P -%}{%- set ns.t = ns.t + [as_timestamp(states(p[1]), 0)] -%}{%- endfor -%}"
    "{%- set n = as_timestamp(now()) -%}"
    "{%- for x in ns.t -%}{%- if ns.i < 0 and x > n -%}{%- set ns.i = loop.index0 -%}{%- endif -%}{%- endfor -%}"
    "{%- if ns.t[4] == 0 -%}<div>Prayer times unavailable</div>{%- else -%}"
    "{%- if ns.i < 0 -%}{%- set nx, tn, pv, tp, tmw = 'Fajr', ns.t[0] + 86400, 'Isha', ns.t[4], true -%}"
    "{%- elif ns.i == 0 -%}{%- set nx, tn, pv, tp, tmw = 'Fajr', ns.t[0], 'Isha', ns.t[4] - 86400, false -%}"
    "{%- else -%}{%- set nx, tn, pv, tp, tmw = P[ns.i][0], ns.t[ns.i], P[ns.i - 1][0], ns.t[ns.i - 1], false -%}{%- endif -%}"
    "{%- set m = ((tn - n) / 60) | round(0, 'ceil') | int -%}"
    "{%- set rel = 'in ' ~ ((m // 60) ~ ' h ' if m >= 60 else '') ~ (m % 60) ~ ' min' -%}"
    "{%- set pct = (((n - tp) / (tn - tp)) * 100) | round(0) | int -%}"
    "{%- set paused = is_state('switch.adhan_pause', 'on') -%}"
    "<div style=\"display:flex;flex-direction:column;gap:14px;text-align:left\">"
    "<div>"
    f"<div style=\"font-size:13px;font-weight:500;{SUB}\">Next prayer{{{{ ' · tomorrow' if tmw }}}}</div>"
    "<div style=\"display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap\">"
    "<span><span style=\"font-size:34px;font-weight:700;line-height:1.15\">{{ nx }}</span> "
    "<span style=\"font-size:22px;font-weight:600\">{{ tn | timestamp_custom('%-I:%M') }}"
    "<span style=\"font-size:14px\"> {{ tn | timestamp_custom('%p') }}</span></span></span>"
    "<span style=\"font-size:15px;font-weight:600\">{{ rel }}</span></div>"
    "<div style=\"margin-top:8px;height:6px;border-radius:3px;background:rgba(127,127,127,.28);overflow:hidden\">"
    "<div style=\"height:6px;width:{{ pct }}%;border-radius:3px;background:var(--primary-text-color)\"></div></div>"
    f"<div style=\"display:flex;justify-content:space-between;font-size:12px;margin-top:3px;{SUB}\">"
    "<span>{{ pv }} {{ tp | timestamp_custom('%-I:%M %p') }}</span><span>{{ nx }} {{ tn | timestamp_custom('%-I:%M %p') }}</span></div>"
    "</div>"
    "<div style=\"display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px\">"
    "{%- for p in P -%}{%- set x = ns.t[loop.index0] -%}"
    "{%- set st = 'next' if loop.index0 == ns.i else ('past' if x < n else 'later') -%}"
    "<div style=\"padding:8px 0;border-radius:14px;text-align:center;"
    "{{ 'background:var(--primary-text-color);color:var(--primary-background-color)' if st == 'next' "
    "else ('opacity:.6' if st == 'past' else 'background:rgba(255,255,255,.35)') }}\">"
    "<div style=\"font-size:12px;font-weight:600\">{{ p[0] }}</div>"
    "<div style=\"font-size:15px;font-weight:600;margin-top:2px\">{{ x | timestamp_custom('%-I:%M') }}</div></div>"
    "{%- endfor -%}</div>"
    f"<div style=\"font-size:12px;{SUB}\">"
    "{{ \"Today's prayers complete · \" if ns.i < 0 }}{{ 'Adhan paused · ' if paused }}"
    "Sunrise {{ as_timestamp(states('sensor.living_room_adhan_sunrise_time'), 0) | timestamp_custom('%-I:%M %p') }}</div>"
    "</div>{%- endif -%}"
)
ADHAN_CHIP = ("{{ {'content': 'Adhan paused' if is_state('switch.adhan_pause', 'on') else 'Adhan on', "
              "'icon': 'mdi:circle', 'icon_color': '#C2410C' if is_state('switch.adhan_pause', 'on') else '#15803D'} | tojson }}")

prayer = ucard("Prayer", [
    row([text("Prayer", size=17, weight="600"),
         text(template=ADHAN_CHIP, size=13, weight="500", align="right", tap=more_info("switch.adhan_pause"), icon="mdi:circle",
              design={"max_width": "150px", "background_color": "rgba(255,255,255,0.45)", "border_radius": "15px",
                      "padding_top": "6px", "padding_bottom": "6px", "padding_left": "12px", "padding_right": "12px"})]),
    markdown(PRAYER_MD),
])


# ---- Climate ------------------------------------------------------------------------
def zone(entity, name):
    sub = ("{{ 'Heat ' ~ state_attr('%s', 'target_temp_low') | int ~ '° · Cool ' ~ state_attr('%s', 'target_temp_high') | int ~ '°' "
           "if state_attr('%s', 'target_temp_low') is not none else (state_attr('%s', 'temperature') | int(0)) ~ '° · ' ~ states('%s') | capitalize }}"
           % ((entity,) * 5))
    temp = "{{ state_attr('%s', 'current_temperature') | round(0) | int }}°" % entity
    # Ultra's icon module needs an entity, so the thermometer sits on the name text instead.
    return row([
        base("vertical", alignment="left", gap=2, gap_unit="px", modules=[
            text(name, size=16, weight="600", icon="mdi:thermometer", icon_size=20, icon_color="var(--secondary-text-color)"),
            text(template=sub, size=13, design={"color": "var(--secondary-text-color)"}),
        ]),
        text(template=temp, size=30, weight="600", align="right", design={"white_space": "nowrap"}),
    ], align="justify", tap=more_info(entity), gap=12,
        design={"background_color": "rgba(255,255,255,0.35)", "border_radius": "20px",
                "padding_top": "12px", "padding_bottom": "12px", "padding_left": "14px", "padding_right": "10px"})


climate = ucard("Climate", [
    row([text("Climate", size=17, weight="600"), text("Heat/Cool", size=13, align="right",
                                                     design={"color": "var(--secondary-text-color)"})]),
    zone("climate.downstairs", "Downstairs"),
    zone("climate.upstairs", "Upstairs"),
])


# ---- Hero ---------------------------------------------------------------------------
hero = ucard("Hero", [
    base("clock", time_format="12", show_seconds=False, show_ampm=True, show_date=True, date_style="long",
         timezone="", alignment="left", time_size=52, date_size=15, time_color="", date_color="", time_weight="bold"),
    base("weather", weather_entity="weather.forecast_home", name="", show_current=True, show_condition_label=True,
         show_humidity=True, show_wind=True, show_wind_direction=True, show_forecast=True, forecast_type="daily",
         forecast_count=5, icon_color="", temp_color="", text_color="", secondary_text_color="",
         card_background_color="", tap_action={"action": "more-info", "entity": "weather.forecast_home"}),
])


def section(card):
    return {"type": "grid", "cards": [card]}


config = {"views": [{
    "type": "sections", "title": "Home", "path": "home", "icon": "mdi:home", "max_columns": 3,
    "dense_section_placement": True,
    "sections": [section(hero), section(prayer), section(climate)],
}]}

json.dump(config, sys.stdout, indent=1, ensure_ascii=False)
