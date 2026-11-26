#!/usr/bin/env python3
"""Test dashboard `uc-home-test` for the Ultra rebuild (D87-D90): Home and Lights tabs on
HA's Sections view, built from Ultra Card modules.

v2 (2026-11-26, owner review of the iPhone render):
  1. Habib Glass look instead of Ultra's Liquid Glass: the view uses the "Habib Glass" theme
     (evergreen wallpaper), cards use uc_theme "none" and the Habib Glass surface tokens, so
     every card is a light tint of the page and not a pale panel on it.
  2. Nesting as habib-wh-next: card padding 12, inner wells inset 12, one well level only.
  3. Type scale from docs/design/habib-tokens.yaml: big numbers thin (Habib Display 200),
     names bold (600), state lines dim (500), section labels spaced capitals.
  4. Lights: all rooms, Upstairs plugs, Outdoor, a power button per room, bigger colour dots,
     lean per-light drawers. Home: security card with themed lock and garage drawers
     (unlock and open need a long press), themed thermostat drawer.

Tokens: www/habib/glass/base.js (TOKENS) and docs/design/habib-tokens.yaml. Values here are
copies; change them there first.
Usage: python3 build_home_sections_test.py > uc-home-test.json
"""
import json
import sys

# ---- Tokens (habib-tokens.yaml, color.dark, type, radius, space) --------------------------
FD = "'Habib Display',Outfit,sans-serif"  # display (fonts are declared globally by www/habib)
FT = "'Habib Text',Inter,sans-serif"       # text; the Habib Glass theme already sets it, so text styles omit it
TEXT, DIM, FAINT = "#eef4ee", "rgba(238,244,238,.84)", "rgba(238,244,238,.5)"
WARM, MINT, ROSE = "#ffc978", "#9fd6b5", "#ff8a80"
HEAT, COOL = "#ffb36b", "#8fc9ff"
SURFACE = "linear-gradient(160deg, rgba(255,255,255,.13), rgba(255,255,255,.04) 55%, rgba(255,255,255,.07))"
BORDER = "rgba(255,255,255,.14)"
WELL, WELL_BORDER = "rgba(0,0,0,.14)", "rgba(255,255,255,.08)"
RAISED, TRACK = "rgba(255,255,255,.10)", "rgba(255,255,255,.12)"
SHEET = "#1c3126"  # color.dark.dialog; the drawer panel is outside the card, so it must be solid
PAD = 12           # card padding = inner inset (habib-wh-next: 12 px steps)
GAP = 10           # gap.tile-grid

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


def pad(v, h=None):
    h = v if h is None else h
    return {"padding_top": f"{v}px", "padding_bottom": f"{v}px", "padding_left": f"{h}px", "padding_right": f"{h}px"}


# Ultra puts no pane on a block without a theme, but zero the shadow anyway (numbers, not "0px").
# Ultra gives blocks default padding; zero it so the 12 px steps come only from PAD and the wells.
FLAT = {"padding_top": "0px", "padding_bottom": "0px", "padding_left": "0px", "padding_right": "0px",
        "margin_top": "0px", "margin_bottom": "0px"}

# Type styles: (family, weight, size, letter spacing, transform)
TYPE = {
    "metric-xl": (FD, "200", 56, "-0.04em", None),
    "metric-lg": (FD, "200", 44, "-0.03em", None),
    "metric-sm": (FD, "300", 30, "-0.02em", None),
    "title-lg": (FD, "600", 18, None, None),
    "title": (FD, "600", 17, "-0.01em", None),
    "title-sm": (FD, "600", 15, "-0.01em", None),
    "section": (FD, "600", 13, "0.22em", "uppercase"),
    "eyebrow": (FT, "600", 12, "0.14em", "uppercase"),
    "body": (FT, "500", 15, None, None),
    "label": (FT, "500", 13, None, None),
    "state": (FT, "600", 12, None, None),
}


def ts(style, color=TEXT, **extra):
    fam, w, size, ls, tr = TYPE[style]
    d = {"font_weight": w}
    if fam == FD:
        d["font_family"] = fam
    if color != TEXT:  # TEXT is the theme's primary-text-color
        d["color"] = color
    if ls:
        d["letter_spacing"] = ls
    if tr:
        d["text_transform"] = tr
    d.update(extra)
    return size, w, d


def text(content=None, style="body", color=TEXT, template=None, tap=None, hold=None, icon="", icon_color="",
         icon_size=None, align="left", **design):
    size, w, d = ts(style, color, **design)
    d["text_align"] = align
    m = base("text", text=content or " ", text_size=size, design=d)
    if icon:
        m.update(icon=icon, icon_color=icon_color, icon_position="before")
    if template:
        m.update(unified_template_mode=True, unified_template=template)
    if tap:
        m["tap_action"] = tap
    if hold:
        m["hold_action"] = hold
    if icon_size:
        m["icon_size"] = icon_size
    return m


def markdown(content, tap=None):
    m = base("markdown", markdown_content=content, enable_html=True, enable_tables=False,
             enable_code_highlighting=False, unified_template_mode=False, unified_template="")
    if tap:
        m["tap_action"] = tap
    return m


def row(modules, align="justify", tap=None, gap=8, valign="center", **design):
    m = base("horizontal", alignment=align, vertical_alignment=valign, gap=gap, gap_unit="px",
             wrap=False, modules=modules, design={**FLAT, **design})
    if tap:
        m["tap_action"] = tap
    return m


def stack(modules, gap=4, align="left", tap=None, **design):
    m = base("vertical", alignment=align, gap=gap, gap_unit="px", modules=modules, design={**FLAT, **design})
    if tap:
        m["tap_action"] = tap
    return m


def well(modules, gap=6, radius=20, tap=None, p=(12, 14), **design):
    """Inset tile inside a card: color.dark.well, one level deep only."""
    return stack(modules, gap=gap, tap=tap, background_color=WELL, border_radius=f"{radius}px",
                 border_style="solid", border_width="1px", border_color=WELL_BORDER, **pad(*p), **design)


def grid(tiles, columns=2):
    return base("grid_layout", modules=tiles, column_mode="fixed", columns=columns, gap=GAP,
                item_alignment="stretch", mobile_breakpoint=0, mobile_columns=columns, item_spans={}, design=dict(FLAT))


def ucard(name, modules):
    return {
        "type": "custom:ultra-card",
        "_config_version": 2,
        "card_name": name,
        "uc_theme": "none",
        "card_background": SURFACE,
        "card_border_radius": 26,
        "card_border_color": BORDER,
        "card_border_width": 1,
        "card_padding": PAD,
        "card_shadow_enabled": True,
        "card_shadow_color": "rgba(0,0,0,0.45)",
        "card_shadow_horizontal": 0, "card_shadow_vertical": 18, "card_shadow_blur": 40, "card_shadow_spread": -18,
        "layout": {"rows": [{"id": (rid := nid("row")), "gap": GAP,
                             "columns": [{"id": f"{rid}-col", "modules": modules}]}]},
        "grid_options": {"columns": "full"},
    }


def heading(label, right=None):
    """Section label as habib-wh-next: spaced capitals, optional dim value on the right."""
    mods = [text(label, "section", padding_left="4px")]
    if right:
        mods.append(right)
    return row(mods, padding_top="4px", padding_bottom="2px")


def section(*cards):
    return {"type": "grid", "cards": list(cards)}


# ---- Drawer (bottom sheet) ---------------------------------------------------------------
def drawer(label, modules, entity=None, icon="mdi:dots-horizontal"):
    tail = [text("Open full controls", "body", TEXT, tap=more_info(entity), align="center",
                 padding_top="10px")] if entity else []
    # 84 px bottom padding clears HA's bottom tab bar.
    return base("drawer", drawer_position="bottom", drawer_title="", show_close_button=True,
                close_on_overlay_click=True, trigger_style="icon", trigger_label=label,
                trigger_icon=icon, trigger_alignment="right", trigger_icon_size=18, trigger_color=TEXT,
                trigger_icon_background="circle", trigger_icon_background_color=RAISED,
                drawer_size="auto", drawer_background=SHEET,
                modules=[stack(modules + tail, gap=12, padding_bottom="84px")])


def drawer_head(title, sub_template):
    return stack([text(title, "title-lg"), text(template=sub_template, style="label", color=DIM)], gap=2)


# ---- Lights ------------------------------------------------------------------------------
WHITES = [("Candle", 2200, "#FF9329"), ("Warm", 2700, "#FFB060"), ("Neutral", 4000, "#FFE4CE"), ("Daylight", 6500, "#EBF0FF")]
COLOURS = [("Coral", "255,120,90"), ("Amber", "255,190,70"), ("Green", "120,220,140"),
           ("Blue", "90,160,255"), ("Violet", "190,120,255"), ("Pink", "255,110,190")]


def bar(entity, height=34):
    return base("slider_control", bars=[{
        "id": nid("bar"), "type": "brightness", "entity": entity, "min_value": 0, "max_value": 100, "step": 1,
        "slider_style": "flat", "show_icon": False, "show_name": False, "show_value": True, "show_bar_label": False,
        "icon_position": "left", "name_position": "left", "value_position": "left", "invert_direction": False}],
        orientation="horizontal", layout_mode="overlay", slider_style="flat", slider_height=height,
        slider_radius="round", border_radius=height // 2, slider_track_color=TRACK,
        dynamic_fill_color=True, show_icon=False, show_name=False, show_state=False, show_value=True,
        value_size=13, value_suffix="%", show_toggle=False, show_color_picker=False, haptic_feedback=True,
        show_bar_label=False, value_color=TEXT,
        # Ultra hard-codes padding: 16px on the slider; negative margins cancel it.
        design={"padding_top": "0px", "padding_bottom": "0px", "padding_left": "0px", "padding_right": "0px",
                # content-box: 16 px padding each side; the bar itself is 100% of its row
                "margin_top": "-12px", "margin_bottom": "-12px", "margin_left": "-16px",
                "margin_right": "-16px", "width": "100%"})


def swatch(label, colour, tap):
    # A 40 px disc (empty block with a background) over its label; the ● glyph rendered at ~20 px.
    return stack([stack([], width="40px", height="40px", min_height="40px", background_color=colour,
                        border_radius="50%", border_style="solid", border_width="1px", border_color=BORDER),
                  text(label, "state", DIM, align="center", white_space="nowrap")],
                 gap=6, align="center", tap=tap)


def light_drawer(entity, title, state_tpl, colour=True):
    body = [drawer_head(title, state_tpl),
            text("Brightness", "eyebrow", DIM), bar(entity, 48)]
    if colour:
        body += [text("White", "eyebrow", DIM),
                 row([swatch(n, c, act("light.turn_on", entity, color_temp_kelvin=k)) for n, k, c in WHITES]),
                 text("Colour", "eyebrow", DIM),
                 row([swatch(n, f"rgb({c})", act("light.turn_on", entity, rgb_color=[int(x) for x in c.split(",")]))
                      for n, c in COLOURS])]
    return drawer(title + " controls", body, entity)


def pct(entity):
    return "((state_attr('%s','brightness') or 0) / 2.55) | round(0) | int ~ '%%'" % entity


def light_state(entity, members=None):
    if members:
        on = "(%s | select('is_state','on') | list | count)" % members
        return ("{{ (%s ~ ' of %d on · ' ~ %s) if is_state('%s','on') else 'All off' }}"
                % (on, members.count("'") // 2, pct(entity), entity))
    return "{{ %s if is_state('%s','on') else 'Off' }}" % (pct(entity), entity)


def icon_col(entity):
    return "{{ '%s' if is_state('%s','on') else '%s' }}" % (WARM, entity, DIM)


def light_tile(entity, name, members=None, icon="mdi:lightbulb-outline", with_drawer=False):
    """One light or a group. Tap toggles, long press opens HA's dialog. Only group tiles (a floor or a
    room's "All lights") carry the themed drawer: one shared drawer per room keeps the config small."""
    st = light_state(entity, members)
    hold = more_info(entity)
    mods = [
        text(name, "title-sm", icon=icon, icon_size=20, icon_color=icon_col(entity), tap=toggle(entity), hold=hold,
             white_space="nowrap", overflow="hidden", text_overflow="ellipsis",
             padding_right="40px" if with_drawer else "0px"),
        text(template=st, style="label", color=DIM, tap=toggle(entity), hold=hold),
        row([bar(entity)], gap=0, padding_top="4px"),
    ]
    if with_drawer:  # a row splits its children 50/50 in Ultra, so the ••• sits in the tile's corner instead
        d = light_drawer(entity, name, st)
        d["design"] = {"position": "absolute", "top": "8px", "right": "8px", "z_index": "2"}
        mods.append(d)
    return well(mods, position="relative")


def plug_tile(entity, name, icon="mdi:floor-lamp-outline"):
    return well([
        text(name, "title-sm", icon=icon, icon_size=20, icon_color=icon_col(entity), tap=toggle(entity),
             white_space="nowrap"),
        text(template="{{ 'On' if is_state('%s','on') else 'Off' }} · plug" % entity, style="label", color=DIM,
             tap=toggle(entity)),
    ], tap=toggle(entity))


def power(entities, group):
    tap = (toggle(group) if len(entities) == 1 else
           {"action": "perform-action", "perform_action": "homeassistant.toggle",
            "target": {"entity_id": entities}, "data": {}})
    # Pill: power icon + On/Off (Ultra shows its editor placeholder for an empty text).
    return text(template="{{ 'On' if is_state('%s','on') else 'Off' }}" % group, style="state", icon="mdi:power",
                icon_size=18, icon_color=icon_col(group), tap=tap, align="center", background_color=RAISED,
                border_radius="999px", white_space="nowrap", width="fit-content", margin_left="auto", **pad(10, 14))


def room(name, group, members, lights, plugs=(), icon="mdi:sofa-outline"):
    mlist = "[" + ",".join("'%s'" % e for e, _ in lights) + "]"
    st = light_state(group, mlist)
    head = row([stack([text(name, "title", icon=icon, icon_size=20, icon_color=icon_col(group)),
                       text(template=st, style="label", color=DIM)], gap=2),
                power([group] + [e for e, _ in plugs], group)], padding_left="4px")
    tiles = [light_tile(e, n) for e, n in lights] + [plug_tile(e, n) for e, n in plugs]
    acc = base("accordion", title_mode="custom", title_text="%d lights" % (len(lights) + len(plugs)), icon="mdi:chevron-down",
               header_alignment="apart", icon_side="right", default_open=False, expand_direction="down",
               expand_style="push", open_mode="manual",
               design={**FLAT, "border_style": "none", "border_width": "0px", "background_color": "transparent",
                       "font_family": FT, "font_weight": "600", "color": DIM},
               modules=[stack([light_tile(group, "All lights", mlist, "mdi:lamps-outline", True), grid(tiles)], gap=GAP)])
    return ucard(name, [head, acc])


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
    heading("Floors", text("Nursery not included", "label", DIM, align="right")),
    grid([light_tile("light.downstairs_lights", "Downstairs", DOWN_M, "mdi:home-floor-1", True),
          light_tile("light.upstairs_lights", "Upstairs", UP_M, "mdi:home-floor-2", True)]),
])

OUT = "switch.outdoor_lights"
outdoor = ucard("Outdoor", [
    row([stack([text("Outdoor", "title", icon="mdi:outdoor-lamp", icon_size=20, icon_color=icon_col(OUT)),
                text(template="{{ 'Porch and driveway on' if is_state('%s','on') else 'Porch and driveway off' }}" % OUT,
                     style="label", color=DIM)], gap=2),
         power([OUT], OUT)], padding_left="4px"),
])

lights_view = {
    "type": "sections", "title": "Lights", "path": "lights", "icon": "mdi:lightbulb-group", "theme": "Habib Glass",
    "max_columns": 3, "dense_section_placement": True,
    "sections": [section(floors, outdoor),
                 section(room("Living Room", "light.living_room_lights", None, LIVING)),
                 section(room("Bedroom", "light.bedroom_lights", None, BEDROOM, icon="mdi:bed-outline")),
                 section(room("Nursery", "light.nursery_lights", None, NURSERY, icon="mdi:baby-carriage")),
                 section(room("Upstairs", "light.upstairs_lights", None, UPSTAIRS, UP_PLUGS, icon="mdi:stairs"))],
}


# ---- Home: Hero ---------------------------------------------------------------------------
HERO_MD = (
    "<div style=\"display:flex;align-items:flex-end;justify-content:space-between;gap:12px;color:%s\">"
    "<div><div style=\"font-family:%s;font-weight:200;font-size:64px;line-height:.92;letter-spacing:-.04em;"
    "font-variant-numeric:tabular-nums\">{{ now().strftime('%%-I:%%M') }}"
    "<span style=\"font-weight:300;font-size:20px;letter-spacing:.02em;color:%s;margin-left:6px\">{{ now().strftime('%%p') }}</span></div>"
    "<div style=\"font-family:%s;font-weight:500;font-size:17px;margin-top:10px\">{{ now().strftime('%%A, %%B %%-d') }}</div></div>"
    "<div style=\"text-align:right\"><div style=\"font-family:%s;font-weight:200;font-size:44px;line-height:1;letter-spacing:-.03em\">"
    "{{ state_attr('weather.forecast_home','temperature') | round(0) | int }}<span style=\"font-size:22px;vertical-align:top\">°</span></div>"
    "<div style=\"font-family:%s;font-weight:500;font-size:13px;color:%s;margin-top:6px\">"
    "{{ states('weather.forecast_home') | replace('-', ' ') | replace('partlycloudy', 'partly cloudy') | replace('clear night', 'clear') | capitalize }}"
    "</div></div></div>"
) % (TEXT, FD, DIM, FD, FD, FT, DIM)

hero = ucard("Hero", [
    markdown(HERO_MD),
    base("weather", weather_entity="weather.forecast_home", name="", show_current=False, show_condition_label=False,
         show_humidity=False, show_wind=False, show_wind_direction=False, show_forecast=True, forecast_type="daily",
         forecast_count=5, icon_color=TEXT, temp_color=TEXT, text_color=DIM, secondary_text_color=FAINT,
         card_background_color=WELL, tap_action=more_info("weather.forecast_home"), design={**FLAT}),
])


# ---- Home: Prayer -------------------------------------------------------------------------
PRAYER = [("Fajr", "fajr"), ("Dhuhr", "dhuhr"), ("Asr", "asr"), ("Maghrib", "maghrib"), ("Isha", "isha")]
P_LIST = "[" + ",".join(f"['{n}','sensor.living_room_adhan_{k}_prayer']" for n, k in PRAYER) + "]"
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
    "{%- set pct = (((n - tp) / (tn - tp)) * 100) | round(0) | int -%}"
    f"<div style=\"display:flex;flex-direction:column;gap:12px;color:{TEXT};font-family:{FT}\">"
    # next-prayer panel: name bold, time thin and large, countdown medium-thin
    f"<div style=\"background:{WELL};border:1px solid {WELL_BORDER};border-radius:18px;padding:14px 16px\">"
    f"<div style=\"font-weight:600;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:{DIM}\">"
    "Next prayer{{ ' · tomorrow' if tmw }}</div>"
    "<div style=\"display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-top:6px\">"
    f"<div><div style=\"font-family:{FD};font-weight:600;font-size:22px;line-height:1.1;color:{WARM}\">{{{{ nx }}}}</div>"
    f"<div style=\"font-family:{FD};font-weight:200;font-size:44px;line-height:1;letter-spacing:-.03em;font-variant-numeric:tabular-nums\">"
    "{{ tn | timestamp_custom('%-I:%M') }}"
    f"<span style=\"font-weight:300;font-size:17px;letter-spacing:.02em;color:{DIM};margin-left:4px\">{{{{ tn | timestamp_custom('%p') }}}}</span></div></div>"
    f"<div style=\"text-align:right\"><div style=\"font-weight:500;font-size:12px;color:{DIM}\">in</div>"
    f"<div style=\"font-family:{FD};font-weight:300;font-size:30px;line-height:1;letter-spacing:-.02em;font-variant-numeric:tabular-nums\">"
    "{{ (m // 60 ~ ':' ~ '%02d' % (m % 60)) if m >= 60 else m ~ ' min' }}</div></div></div>"
    f"<div style=\"margin-top:12px;height:4px;border-radius:2px;background:{TRACK};overflow:hidden\">"
    f"<div style=\"height:4px;width:{{{{ pct }}}}%;border-radius:2px;background:{WARM}\"></div></div></div>"
    # five prayers: name bold small, time medium; next in warm, past dim
    "<div style=\"display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px\">"
    "{%- for p in P -%}{%- set x = ns.t[loop.index0] -%}"
    "{%- set st = 'next' if loop.index0 == ns.i else ('past' if x < n else 'later') -%}"
    "<div style=\"padding:8px 0;border-radius:14px;text-align:center;border:1px solid "
    "{{ 'rgba(255,201,120,.5);background:rgba(255,201,120,.2);color:" + WARM + "' if st == 'next' "
    "else ('transparent;opacity:.5' if st == 'past' else '" + WELL_BORDER + ";background:" + WELL + "') }}\">"
    "<div style=\"font-weight:600;font-size:12px\">{{ p[0] }}</div>"
    f"<div style=\"font-family:{FD};font-weight:500;font-size:16px;margin-top:2px;font-variant-numeric:tabular-nums\">"
    "{{ x | timestamp_custom('%-I:%M') }}</div></div>"
    "{%- endfor -%}</div>"
    f"<div style=\"font-weight:500;font-size:12px;color:{DIM};padding-left:4px\">"
    "Sunrise {{ as_timestamp(states('sensor.living_room_adhan_sunrise_time'), 0) | timestamp_custom('%-I:%M %p') }}</div>"
    "</div>{%- endif -%}"
)
ADHAN_CHIP = ("{{ {'content': 'Adhan paused' if is_state('switch.adhan_pause', 'on') else 'Adhan on', "
              "'icon': 'mdi:circle', 'icon_color': '" + ROSE + "' if is_state('switch.adhan_pause', 'on') else '" + MINT + "'} | tojson }}")

prayer = ucard("Prayer", [
    heading("Prayer", text(template=ADHAN_CHIP, style="state", align="right", tap=more_info("switch.adhan_pause"),
                           icon="mdi:circle", icon_size=10, width="fit-content", max_width="130px", margin_left="auto",
                           white_space="nowrap", background_color=RAISED, border_radius="999px", **pad(6, 12))),
    markdown(PRAYER_MD),
])


# ---- Home: security (lock, garage, porch) and quick switches ------------------------------
LOCK, GARAGE = "lock.living_room_front_door", "cover.general_garage_door_garage_door"
SECURE = ("{{ 'All secure' if is_state('%s','locked') and is_state('%s','closed') else 'Check doors' }}" % (LOCK, GARAGE))
SECURE_COL = ("{{ '%s' if is_state('%s','locked') and is_state('%s','closed') else '%s' }}" % (MINT, LOCK, GARAGE, ROSE))


def item(name, state_tpl, icon, col_tpl, tap=None, extra=None):
    mods = [text(name, "title-sm", align="center", white_space="nowrap", icon=icon, icon_size=18, icon_color=col_tpl),
            text(template=state_tpl, style="label", color=DIM, align="center")]
    if extra:
        mods.append(extra)
    return well(mods, gap=2, radius=16, tap=tap, p=(12, 8), align_items="center")


def big_button(label, tap=None, hold=None, color=TEXT, bg=RAISED):
    return text(label, "title-sm", color, align="center", tap=tap, hold=hold, background_color=bg,
                border_radius="14px", **pad(13, 12))


lock_drawer = drawer("Front door controls", [
    drawer_head("Front door", "{{ states('%s') | capitalize }} · {{ state_attr('%s','battery_level') or '' }}" % (LOCK, LOCK)),
    row([big_button("Lock", tap=act("lock.lock", LOCK)),
         big_button("Hold to unlock", hold=act("lock.unlock", LOCK), color=ROSE)], gap=GAP),
    text("Unlock needs a long press so a stray tap cannot open the door.", "label", DIM),
], LOCK)

garage_drawer = drawer("Garage controls", [
    drawer_head("Garage", "{{ states('%s') | capitalize }}" % GARAGE),
    row([big_button("Hold to open", hold=act("cover.open_cover", GARAGE), color=ROSE),
         big_button("Hold to close", hold=act("cover.close_cover", GARAGE))], gap=GAP),
    text("Both need a long press. Close only with a clear view of the door.", "label", DIM),
], GARAGE)


def lock_state():
    return "{{ states('%s') | capitalize }}" % LOCK


home = ucard("Home", [
    heading("Home"),
    well([stack([text(template=SECURE, style="title", icon="mdi:shield-check-outline", icon_size=22,
                      icon_color=SECURE_COL),
                 text("Doors and garage", "label", DIM, padding_left="30px")], gap=0),
          grid([
              item("Front door", lock_state(), "mdi:lock-outline",
                   "{{ '%s' if is_state('%s','locked') else '%s' }}" % (MINT, LOCK, ROSE), extra=lock_drawer),
              item("Garage", "{{ states('%s') | capitalize }}" % GARAGE, "mdi:garage-variant",
                   "{{ '%s' if is_state('%s','closed') else '%s' }}" % (MINT, GARAGE, ROSE), extra=garage_drawer),
              item("Porch", "{{ states('%s') | capitalize }}" % OUT, "mdi:lightbulb-outline", icon_col(OUT),
                   tap=toggle(OUT)),
          ], columns=3)], gap=12, radius=22, p=(12, 12)),
    grid([
        well([text("Skip Evening Lights", "title-sm", icon="mdi:weather-night", icon_size=20,
                   icon_color=icon_col("switch.skip_evening_lights_tonight")),
              text(template="{{ states('switch.skip_evening_lights_tonight') | capitalize }}", style="label", color=DIM)],
             gap=2, tap=toggle("switch.skip_evening_lights_tonight")),
        well([text("Pause Prayer", "title-sm", icon="mdi:pause", icon_size=20, icon_color=icon_col("switch.adhan_pause")),
              text(template="{{ states('switch.adhan_pause') | capitalize }}", style="label", color=DIM)],
             gap=2, tap=more_info("switch.adhan_pause")),
        well([text("Noor's Bedtime", "title-sm", icon="mdi:sleep", icon_size=20, icon_color=icon_col("switch.noor_s_bedtime")),
              text("Run", "label", DIM)], gap=2, tap=toggle("switch.noor_s_bedtime")),
    ]),
])


# ---- Home: Climate --------------------------------------------------------------------------
def climate_tile(entity, name):
    rng = ("{{ (state_attr('%s','target_temp_low') | int ~ '–' ~ state_attr('%s','target_temp_high') | int ~ '°') "
           "if state_attr('%s','target_temp_low') is not none else ((state_attr('%s','temperature') | int(0)) ~ '°') }}"
           % ((entity,) * 4))
    mode = ("{{ {'heat_cool':'Auto','heat':'Heat','cool':'Cool','off':'Off'}.get(states('%s'), states('%s') | capitalize) }}"
            "{{ ' · heating' if state_attr('%s','hvac_action') == 'heating' else (' · cooling' if state_attr('%s','hvac_action') == 'cooling' else '') }}"
            % ((entity,) * 4))
    temp_md = (f"<div style=\"text-align:center;color:{TEXT}\">"
               f"<div style=\"font-family:{FD};font-weight:200;font-size:56px;line-height:1;letter-spacing:-.04em;font-variant-numeric:tabular-nums\">"
               "{{ state_attr('%s','current_temperature') | round(0) | int }}"
               "<span style=\"font-size:28px;vertical-align:top;margin-left:2px\">°</span></div>"
               f"<div style=\"font-family:{FT};font-weight:600;font-size:12px;margin-top:6px;color:{DIM}\">" % entity
               + rng + "</div></div>")
    c_drawer = drawer(name + " thermostat", [
        drawer_head(name, "{{ state_attr('%s','current_temperature') | round(0) | int }}° now · " % entity + mode),
        base("climate", entity=entity, design={**FLAT}),
    ], entity, icon="mdi:tune-variant")
    return well([
        markdown(temp_md, tap=more_info(entity)),
        row([stack([text(name, "title", white_space="nowrap"),
                    text(template=mode, style="label", color=DIM)], gap=0),
             c_drawer], padding_top="6px"),
    ], gap=4, p=(16, 14))


climate = ucard("Climate", [
    heading("Climate"),
    grid([climate_tile("climate.downstairs", "Downstairs"), climate_tile("climate.upstairs", "Upstairs")]),
])


home_view = {"type": "sections", "title": "Home", "path": "home", "icon": "mdi:home", "theme": "Habib Glass",
             "max_columns": 3, "dense_section_placement": True,
             "sections": [section(hero), section(prayer), section(home), section(climate)]}

json.dump({"views": [home_view, lights_view]}, sys.stdout, separators=(",", ":"), ensure_ascii=False)
