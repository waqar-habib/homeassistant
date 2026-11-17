#!/usr/bin/env python3
"""Single-hex colour for Habib Glass (D78 item 3).

Owner flow: one hex, one command, theme reload.
    python3 dashboards/habib-theme-build.py --base "#1b2a4a"
    then reload themes (Developer tools > YAML > Themes, or the frontend.reload_themes action).

What it does
  1. Clamps the base to the dark range the light text was designed for.
  2. Derives every Home Assistant chrome key that needs a literal value (sidebar, header, dialog,
     rgb-card-background-color and so on) from that one hex, with the SAME recipes the cards use
     (the PALETTE table in www/habib/habib-glass-logic.js; this script reads it, it has no copy).
  3. Computes the contrast of text and text-dim on the derived surfaces and REFUSES below 4.5:1.
  4. Rewrites themes/habib_glass/habib_glass.yaml (only the derived keys and habib-base) and prints
     the palette. --check prints and checks without writing.
The glass cards and the habib-layout wallpaper need nothing from this script except the key
habib-base: they derive their colours live in the browser.
"""
import argparse, json, math, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
LOGIC = ROOT / "www/habib/habib-glass-logic.js"
THEME = ROOT / "themes/habib_glass/habib_glass.yaml"
TEXT = (238, 244, 238)       # primary text; text-dim is the same colour at DIM opacity
DIM = 0.84
MIN_CONTRAST = 4.5

def palette():
    src = LOGIC.read_text()
    body = src.split("// PALETTE-BEGIN", 1)[1].split("// PALETTE-END", 1)[0]
    return json.loads(body[body.index("{"):body.rindex("}") + 1])

# ---- colour maths (OKLab, the space CSS color-mix(in oklab) uses) ----
def to_linear(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
def to_gamma(c):
    return 255 * (12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055)
def cbrt(x): return math.copysign(abs(x) ** (1 / 3), x)
def hex_to_rgb(h):
    m = re.fullmatch(r"#?([0-9a-fA-F]{6})", h.strip())
    if not m: raise SystemExit(f"Not a colour: {h!r}. Give six hex digits, for example #1c3226.")
    n = int(m.group(1), 16)
    return ((n >> 16) & 255, (n >> 8) & 255, n & 255)
def rgb_to_hex(rgb): return "#" + "".join(f"{max(0, min(255, round(v))):02x}" for v in rgb)
def to_lab(rgb):
    r, g, b = (to_linear(v) for v in rgb)
    l = cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
    m = cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
    s = cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
    return (0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
            1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
            0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s)
def to_rgb(lab):
    L, a, b = lab
    l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
    m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
    s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
    lin = (4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
           -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
           -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)
    return tuple(max(0, min(255, round(to_gamma(max(0.0, v))))) for v in lin)
def luminance(rgb): return sum(k * to_linear(v) for k, v in zip((0.2126, 0.7152, 0.0722), rgb))
def contrast(a, b):
    la, lb = luminance(a), luminance(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)
def blend(fg, bg, alpha): return tuple(f * alpha + g * (1 - alpha) for f, g in zip(fg, bg))

def apply(base, recipe):
    lab = to_lab(base)
    if recipe[0] == "lch":
        _, L, factor, *rest = recipe
        return to_rgb((L, lab[1] * factor, lab[2] * factor)), (rest[0] if rest else 1)
    name, pct, *rest = recipe
    other = to_lab((255, 255, 255) if name == "white" else (0, 0, 0))
    p = pct / 100
    return to_rgb(tuple(v * (1 - p) + o * p for v, o in zip(lab, other))), (rest[0] if rest else 1)

def clamp(base, lo, hi):
    lab = to_lab(base)
    L = min(hi, max(lo, lab[0]))
    if L == lab[0]: return base
    k = min(1, L / lab[0]) if lab[0] > 0 else 1
    return to_rgb((L, lab[1] * k, lab[2] * k))

def css(rgb, alpha, key=""):
    if key.startswith("rgb-"): return ", ".join(str(v) for v in rgb)
    return rgb_to_hex(rgb) if alpha >= 1 else f"rgba({rgb[0]}, {rgb[1]}, {rgb[2]}, {alpha:g})"

def main():
    ap = argparse.ArgumentParser(description="Derive the Habib Glass theme from one hex colour.")
    ap.add_argument("--base", required=True, help='background colour, for example "#1c3226"')
    ap.add_argument("--check", action="store_true", help="print and check only; do not write the theme")
    args = ap.parse_args()
    P = palette()
    asked = hex_to_rgb(args.base)
    base = clamp(asked, P["clamp"]["min-lightness"], P["clamp"]["max-lightness"])
    base_hex = rgb_to_hex(base)
    if base != asked:
        print(f"Note: {rgb_to_hex(asked)} is outside the dark range; using {base_hex} (same hue, clamped lightness).")
    opaque = lambda group, key: apply(base, P[group][key])[0]

    # Surfaces that carry text. The glass estimate is the worst case: the lightest wallpaper
    # (top sky plus the light glow) under the glass gradient's lightest stop and the shade veil.
    glow, glow_a = apply(base, P["wall"]["glow-a"])
    wall = blend(glow, opaque("wall", "sky-0"), glow_a)
    def glass(shade_key):
        shade, a = apply(base, P["css"][shade_key])
        return blend((255, 255, 255), blend(shade, wall, a), 0.13)
    page = opaque("css", "page")
    sheet, sheet_a = apply(base, P["css"]["sheet-a"])
    surfaces = {
        "page": page, "dialog": opaque("css", "dialog"), "sidebar": opaque("chrome", "sidebar-background-color"),
        "sheet (lightest)": blend(sheet, page, sheet_a), "glass card (lightest)": glass("shade"), "hero card (lightest)": glass("shade-hero"),
    }
    print(f"habib-base: {base_hex}")
    print("Contrast (text / text-dim), minimum allowed %.1f:" % MIN_CONTRAST)
    worst = 99
    for name, bg in surfaces.items():
        t, d = contrast(TEXT, bg), contrast(blend(TEXT, bg, DIM), bg)
        worst = min(worst, t, d)
        print(f"  {name:24s} {rgb_to_hex(bg)}   {t:5.2f} / {d:5.2f}")
    if worst < MIN_CONTRAST:
        raise SystemExit(f"REFUSED: with {base_hex} the text contrast falls to {worst:.2f}:1, below {MIN_CONTRAST}:1. "
                         "Choose a darker or less saturated colour. The theme file was not changed.")

    keys = {"habib-base": base_hex}
    for key, recipe in P["chrome"].items():
        rgb, a = apply(base, recipe)
        keys[key] = css(rgb, a, key)
    # The wallpaper file evergreen.svg has fixed colours, so it only fits the default base (it stays
    # as the fallback for the dashboards that are not on habib-layout). Any other base gets a plain
    # derived gradient there; habib-layout paints the full wallpaper itself.
    if base_hex == P["default-base"]:
        keys["lovelace-background"] = f"center / cover no-repeat fixed url('/local/habib/bg/evergreen.svg'), {css(page, 1)}"
    else:
        s0, s1, s2 = (css(opaque("wall", k), 1) for k in ("sky-0", "sky-1", "sky-2"))
        keys["lovelace-background"] = f"linear-gradient(165deg, {s0}, {s1} 45%, {s2}) fixed"
    print("Derived theme keys:")
    for k, v in keys.items(): print(f"  {k}: {v}")
    if args.check:
        print("Check only: theme file not written."); return

    lines, seen = THEME.read_text().splitlines(), set()
    for i, line in enumerate(lines):
        m = re.match(r"^(\s+)([A-Za-z0-9_-]+):\s", line)
        if m and m.group(2) in keys:
            lines[i] = f'{m.group(1)}{m.group(2)}: "{keys[m.group(2)]}"'
            seen.add(m.group(2))
    missing = [k for k in keys if k not in seen]
    if missing:
        at = next(i for i, l in enumerate(lines) if re.match(r"^\S.*:\s*$", l)) + 1   # right under "Habib Glass:"
        lines[at:at] = [f'  {k}: "{keys[k]}"' for k in missing]
    THEME.write_text("\n".join(lines) + "\n")
    print(f"Wrote {THEME.relative_to(ROOT)}. Now reload themes.")

if __name__ == "__main__":
    main()
