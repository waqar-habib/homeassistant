// glass/base.js: the one place where Habib Glass styling values live.
//   1. TOKENS   every colour, type size, space, radius, size and duration, as CSS variables.
//   2. PRIMS    the shared primitives (surface, well, chip, bar, pill, round button, status dot,
//               focus ring, hit area, the six state looks).
//   3. SHEET    1 + 2 as ONE constructable stylesheet that every card adopts (adoptedStyleSheets).
//   4. GlassCard, the base class, plus small helpers and the interface icon set.
// Rule (tests/habib-ui/glass-style.test.mjs enforces it): a card file holds no literal colour,
// px, em or duration. A card that needs a new value adds a token HERE first.
// Values mirror docs/design/habib-tokens.yaml.

const search = new URL(import.meta.url).search;
export const load = (file) => import(new URL(file, import.meta.url).href.split("?")[0] + search);
export const G = await load("../habib-glass-logic.js");

// ---- 1. Tokens ---------------------------------------------------------------------------

const FONT = {
  display: `"Habib Display", Outfit, "Habib Text", system-ui, sans-serif`,
  text: `"Habib Text", Inter, system-ui, -apple-system, "Segoe UI", sans-serif`,
};

// [family, weight, size, line-height, tracking em]. size: px number or CSS. line: px number,
// unitless string, or null for normal. Every size and line scales with --g-u.
const TYPE = {
  clock: ["display", 200, "clamp(64px, 26cqi, 104px)", ".92", -0.04], // follows the card width (cqi), not the screen
  "clock-sm": ["display", 200, 54, ".95", -0.04],
  "clock-md": ["display", 200, "clamp(52px, 18cqi, 74px)", ".92", -0.04], // dense hero (2026-11-19)
  "ampm-md": ["display", 300, 17, "1", 0.02],
  "metric-xl": ["display", 200, 56, "1", -0.04],
  "metric-lg": ["display", 200, 40, "1", -0.03],
  "metric-md": ["display", 200, 36, "1", -0.04],
  "metric-sm": ["display", 300, 30, "1", -0.02],
  headline: ["display", 700, 22, 26, -0.01],
  ampm: ["display", 300, 20, "1", 0.02],
  "ampm-sm": ["display", 300, 15, "1", 0.02],
  "title-lg": ["display", 600, 18, 22, 0],
  title: ["display", 600, 17, 22, -0.01],
  "title-alt": ["display", 500, 17, 22, 0],
  "bar-value": ["display", 600, 17, null, 0],
  "title-sm": ["display", 600, 15, 20, -0.01],
  "title-xs": ["display", 600, 13, 16, 0],
  "date-sm": ["display", 500, 13, 17, 0],
  section: ["display", 600, 13, 16, 0.22],
  "section-sm": ["display", 600, 12, 14, 0.2],
  body: ["text", 500, 15, null, 0],
  "body-sm": ["text", 500, 14, null, 0],
  "body-sm-b": ["text", 600, 14, null, 0],
  label: ["text", 500, 13, 16, 0],
  "label-b": ["text", 600, 13, 16, 0],
  sub: ["text", 500, 12, 16, 0],
  state: ["text", 600, 12, 16, 0],
  eyebrow: ["text", 600, 11, 14, 0.14],
  caption: ["text", 600, 11, 13, 0],
  pill: ["text", 500, 11, "1", 0],
  "pill-sm": ["text", 500, 10, "1", 0],
  micro: ["text", 600, 10, 12, 0],
  "micro-caps": ["text", 600, 10, 12, 0.12],
};

const SPACE = [2, 4, 6, 8, 10, 12, 14, 16, 18, 22, 24];

const RADIUS = { card: 26, sheet: 30, tile: 20, panel: 18, item: 16, chip: 14, control: 12, small: 8, bar: 3 };

// Fixed sizes (px, scaled by --g-u).
const SIZE = {
  touch: 44, row: 56, bar: 60, "bar-stack": 52, "bar-icon": 44, "hero-min": 260, "hero-compact": 130,
  "lamp-min": 232, "lamp-stage": 110, "lamp-art": 150, "lamp-open": 248, "lamp-open-wide": 184,
  "chip-min": 46, "chip-art": 32, "tile-min": 64, slider: 34, knob: 4, "knob-inset": 7,
  avatar: 38, "avatar-dot": 11, shield: 44, "media-art": 112, "dial-max": 132, "sheet-max": 560,
  btn: 40, "btn-lg": 52, "btn-sm": 30, "btn-xs": 24, more: 26, plus: 46, check: 20, thumb: 20,
  dot: 7, "dot-sm": 6, "handle-w": 38, "handle-h": 5, track: 6, progress: 3, "progress-lg": 5, stripe: 4,
  wx: 78, "wx-md": 52, "wx-sm": 46, "label-pad": 14,
  "i-13": 13, "i-14": 14, "i-16": 16, "i-18": 18, "i-20": 20, "i-22": 22, "i-24": 24, "i-26": 26,
  // habib-layout
  "page-pad": 16, "page-pad-compact": 8, "gap-col": 32, "gap-group": 24, "gap-card": 8, "header": 56,
  // library v1 (2026-11-17): heading gap, large card, section, drawer steppers
  "label-gap": 10, "card-lg-art": 56, "card-lg-min": 120, "section-pad": 10, "stepper": 44, "setpoint": 72,
};

// Container-query breakpoints of the chip primitive (px of the chip's own box). @container
// conditions cannot read variables, so they are constants here and nowhere else.
export const BP = { chipWide: 150, chipNarrow: 100, stepperNarrow: 210 };

// Timings used by JavaScript (the CSS durations are tokens below).
export const TIME = { pendingMs: 2500, noResponseMs: 4000, debounceMs: 800, settleMs: 1500 };

const u = (n) => `calc(${n}px * var(--g-u))`;
const fontToken = ([fam, weight, size, line]) =>
  `${weight} ${typeof size === "number" ? u(size) : size}/${line === null ? "normal" : typeof line === "number" ? u(line) : line} var(--g-${fam === "display" ? "display" : "font"})`;

// Colours that follow habib-base. Fallback literals are today's values (browsers without color-mix).
const BASE_FALLBACK = {
  page: "#12221a", "page-deep": "#0f1c15", dialog: "#1c3126", "sheet-a": "rgba(58,84,68,.88)", "sheet-b": "rgba(24,38,30,.94)",
  "surface-solid": "rgba(30,48,38,.92)", scrim: "rgba(4,10,7,.45)", rim: "#23382c", ink: "#16241b",
  shade: "rgba(11,20,15,.45)", "shade-hero": "rgba(11,20,15,.58)",
};

const TOKENS = `
  :host {
    --g-u: var(--habib-scale, 1);
    --g-base: var(--habib-base, ${G.PALETTE["default-base"]});
    --g-text-rgb: 238, 244, 238;
    --g-text: rgb(var(--g-text-rgb)); --g-dim: rgba(var(--g-text-rgb), .84); --g-faint: rgba(var(--g-text-rgb), .38);
    --g-warm: 255, 201, 120; --g-mint: 159, 214, 181; --g-rose: 255, 138, 128;
    --g-heat: #ffb36b; --g-cool: #8fc9ff;
    --g-lite: 255, 255, 255; --g-dark: 0, 0, 0;
    --g-solid: rgb(var(--g-lite));
    ${Object.entries(BASE_FALLBACK).map(([k, v]) => `--g-${k}: ${v};`).join(" ")}
    --g-surface: linear-gradient(160deg, rgba(var(--g-lite), .13), rgba(var(--g-lite), .04) 55%, rgba(var(--g-lite), .07));
    --g-sheet: linear-gradient(170deg, var(--g-sheet-a), var(--g-sheet-b));
    --g-border: rgba(var(--g-lite), .14);
    --g-well: rgba(var(--g-dark), .14); --g-well-deep: rgba(var(--g-dark), .22); --g-well-border: rgba(var(--g-lite), .08);
    --g-raised-lo: rgba(var(--g-lite), .07); --g-raised: rgba(var(--g-lite), .10); --g-raised-hi: rgba(var(--g-lite), .18);
    --g-track: rgba(var(--g-lite), .12); --g-line: rgba(var(--g-lite), .25); --g-idle: rgba(var(--g-lite), .35);
    --g-hair: 1px; --g-edge: 2px;
    --g-elev: inset 0 1px 0 rgba(var(--g-lite), .18), 0 18px 40px -18px rgba(var(--g-dark), .55);
    /* Lit shadows: shape here, colour (the lamp's own --c) at the place of use. */
    --g-elev-on-top: inset 0 1px 0 rgba(var(--g-lite), .22); --g-elev-on-shape: 0 18px 46px -16px;
    --g-elev-chip-shape: 0 8px 22px -12px; --g-glow-fill: 0 0 18px; --g-glow-swatch: 0 6px 18px -4px; --g-glow-shield: 0 0 24px -6px;
    --g-elev-float: 0 14px 30px -10px rgba(var(--g-dark), .7);
    --g-elev-solid: 0 8px 22px -6px rgba(var(--g-lite), .5);
    --g-elev-thumb: 0 2px 8px rgba(var(--g-dark), .4);
    --g-glow-dot: 0 0 10px;
    --g-glow-bar: 0 0 12px;
    --g-text-shadow: 0 1px 12px rgba(var(--g-dark), .4);
    --g-art-shadow: drop-shadow(0 10px 18px rgba(var(--g-dark), .25));
    --g-ring: 0 0 0 2px rgba(var(--g-warm), .8);
    --g-blur: blur(22px) saturate(150%); --g-blur-sheet: blur(30px) saturate(160%);
    --g-font: ${FONT.text}; --g-display: ${FONT.display};
    ${Object.entries(TYPE).map(([k, t]) => `--t-${k}: ${fontToken(t)}; --ls-${k}: ${t[4]}em;`).join("\n    ")}
    --ls-hijri: .02em;
    ${SPACE.map((n) => `--s-${n}: ${u(n)};`).join(" ")}
    ${Object.entries(RADIUS).map(([k, n]) => `--r-${k}: ${u(n)};`).join(" ")} --r-pill: 999px; --r-round: 50%;
    ${Object.entries(SIZE).map(([k, n]) => `--z-${k}: ${u(n)};`).join(" ")}
    --m-press: .18s cubic-bezier(.3, 1.6, .4, 1); --m-fast: .2s; --m-state: .4s; --m-chip: .3s;
    --m-sheet: .32s cubic-bezier(.2, 1.2, .3, 1); --m-breathe: 5s; --m-record: 3.2s;
    --k-press: .97; --k-press-btn: .92; --k-press-sw: .9; --k-dead: .5; --k-away: saturate(.25) brightness(.85); --k-minor: .62; --k-passed: .5;
    --k-off-art: saturate(.6) brightness(.9);
    /* Data palettes (identical for any base): hero daypart tints, list bars, record. */
    --g-tint-dawn: radial-gradient(120% 80% at 10% 0%, rgba(255,170,120,.30), transparent 60%);
    --g-tint-day: radial-gradient(120% 80% at 90% 0%, rgba(255,230,160,.22), transparent 60%);
    --g-tint-dusk: radial-gradient(120% 80% at 90% 0%, rgba(255,128,96,.28), transparent 60%), radial-gradient(90% 60% at 0% 100%, rgba(140,90,200,.20), transparent 70%);
    --g-tint-night: radial-gradient(120% 80% at 80% 0%, rgba(120,150,255,.18), transparent 60%);
    --g-list-0: 120, 170, 255; --g-list-1: 255, 120, 170; --g-list-2: 255, 196, 90; --g-list-3: 120, 220, 150; --g-list-4: 190, 140, 255;
    --g-list-title: linear-gradient(90deg, #c9d8ff, #f3c8ff);
    --g-list-add: linear-gradient(145deg, #8d9dff, #c58cff); --g-list-add-glow: 0 8px 22px -8px rgba(170,140,255,.9);
    --g-vinyl: radial-gradient(circle, #f0a64a 0 15%, #1a1a1a 15.5% 17%, #111 17.5%), repeating-radial-gradient(circle, rgba(var(--g-lite), .06) 0 1px, transparent 1px 4px);
    --g-vinyl-shine: conic-gradient(from 30deg, transparent 0 20%, rgba(var(--g-lite), .12) 25%, transparent 32% 70%, rgba(var(--g-lite), .08) 75%, transparent 82%);
    --g-dial: linear-gradient(90deg, var(--g-heat), var(--g-cool));
    --c: var(--g-warm);
  }
  @supports (color: color-mix(in oklab, red, blue)) {
    :host { ${Object.entries(G.PALETTE.css).map(([k, r]) => `--g-${k}: ${G.cssRecipe(r)};`).join(" ")} }
  }
`;

// ---- 2. Primitives -----------------------------------------------------------------------

// Tile look of the chip primitive: bigger icon and title. Used by .chip.tile and, from
// BP.chipWide upward, by .chip.auto (habib-button size: auto).
const TILE = `min-height: var(--z-tile-min); padding: var(--s-8) var(--s-12);
  grid-template: "ic nm" auto "ic st" auto / auto minmax(0, 1fr); column-gap: var(--s-10); justify-items: start; text-align: left;`;
const tileParts = (p) => `${p} .ci { height: var(--z-i-26); } ${p} .cn { font: var(--t-title-sm); letter-spacing: var(--ls-title-sm); align-self: end; }
  ${p} .cs { font: var(--t-sub); align-self: start; }`;

const PRIMS = `
  :host { display: block; height: 100%; }
  * { box-sizing: border-box; }
  /* Every button starts bare; a card styles it only through classes. */
  button { all: unset; box-sizing: border-box; cursor: pointer; }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }

  /* Surface: every card. The shade layer under the glass keeps text at 4.5:1 (I55). */
  .glass { position: relative; height: 100%; overflow: hidden; border-radius: var(--r-card);
    color: var(--g-text); font-family: var(--g-font); -webkit-font-smoothing: antialiased;
    background: var(--g-surface), linear-gradient(var(--g-shade), var(--g-shade));
    border: var(--g-hair) solid var(--g-border); box-shadow: var(--g-elev);
    -webkit-backdrop-filter: var(--g-blur); backdrop-filter: var(--g-blur); }
  .glass.deep { background: var(--g-surface), linear-gradient(var(--g-shade-hero), var(--g-shade-hero)); }
  @media (prefers-reduced-transparency: reduce) {
    .glass, .glass.deep { -webkit-backdrop-filter: none; backdrop-filter: none; background: var(--g-surface-solid); } }

  /* Type roles shared by several cards. */
  .eyebrow { font: var(--t-eyebrow); letter-spacing: var(--ls-eyebrow); text-transform: uppercase; color: var(--g-dim); }
  .title { font: var(--t-title); letter-spacing: var(--ls-title); overflow-wrap: normal; word-break: normal; hyphens: manual; }
  .sub { font: var(--t-sub); color: var(--g-dim); }
  .num { font-variant-numeric: tabular-nums; }
  .unit { font-size: .5em; vertical-align: .92em; margin-left: .06em; }
  .hd { display: flex; align-items: center; justify-content: space-between; min-height: var(--z-btn-sm); }

  /* Press feedback, hover (pointer devices only), focus ring. */
  .press { transition: transform var(--m-press); }
  .press:active { transform: scale(var(--k-press)); }
  :focus-visible { outline: none; box-shadow: var(--g-ring); }
  @media (hover: hover) {
    .raised:hover, .rbtn:hover, .pill.act:hover { background: var(--g-raised-hi); }
    .well.act:hover, .chip:hover { background-color: var(--g-raised-lo); } }

  /* Hit area: a control smaller than the touch minimum keeps its look and gets an invisible
     44 px target centred on it. A control that is already larger is not changed. */
  .tap { position: relative; }
  .tap::after { content: ""; position: absolute; inset: min(0px, calc(50% - var(--z-touch) / 2)); }

  /* Well: an inset tile inside a surface. */
  .well { background: var(--g-well); border: var(--g-hair) solid var(--g-well-border); }

  /* Pill and round button (raised fill). */
  .pill { font: var(--t-pill); padding: var(--s-4) var(--s-8); border-radius: var(--r-pill); background: var(--g-track);
    border: var(--g-hair) solid var(--g-track); color: var(--g-dim); white-space: nowrap; }
  .pill.sm { font: var(--t-pill-sm); padding: var(--s-2) var(--s-6); }
  .rbtn, .fold { all: unset; box-sizing: border-box; cursor: pointer; width: var(--z-btn-sm); height: var(--z-btn-sm); border-radius: var(--r-round);
    display: grid; place-items: center; flex: none; background: var(--g-raised); color: var(--g-dim); position: relative; }
  .rbtn::after, .fold::after { content: ""; position: absolute; inset: min(0px, calc(50% - var(--z-touch) / 2)); }
  .rbtn svg, .fold svg { width: var(--z-i-16); height: var(--z-i-16); }
  .rbtn:focus-visible, .fold:focus-visible { box-shadow: var(--g-ring); }
  .fold.abs { position: absolute; top: var(--s-12); right: var(--s-12); z-index: 2; }
  .fold.go svg { transform: rotate(-90deg); }

  /* Status dot. Colour = state (--c), glow when active. */
  .dot { display: inline-block; width: var(--z-dot); height: var(--z-dot); border-radius: var(--r-round); background: var(--g-idle); flex: none; }
  .dot.on { background: rgb(var(--c)); box-shadow: var(--g-glow-dot) rgb(var(--c)); }
  .dot.ok { --c: var(--g-mint); } .dot.sm { width: var(--z-dot-sm); height: var(--z-dot-sm); }

  /* The six state looks (design guide section 4). Text always says the state as well. */
  .is-off .art { filter: var(--k-off-art); }
  .is-dead { opacity: var(--k-dead); cursor: default; }
  .is-missing { opacity: var(--k-dead); }
  .note-bad { font: var(--t-caption); color: rgb(var(--g-rose)); }
  .is-alert { border-color: rgba(var(--g-rose), .4); }
  .tone-ok { color: rgb(var(--g-mint)); } .tone-bad { color: rgb(var(--g-rose)); } .tone-warm { color: rgb(var(--g-warm)); } .tone-dim { color: var(--g-dim); }

  /* Bar: a folded card. The whole bar is the button. .stack = half-width dock bar. */
  /* .glass.mini outranks a card's own .glass rule, so a folded card always gets the bar layout. */
  .glass.mini { cursor: pointer; display: flex; flex-direction: row; align-items: center; gap: var(--s-12); padding: 0 var(--s-12) 0 var(--s-18);
    height: var(--z-bar); min-height: 0; outline: none; }
  .mini .ml { font: var(--t-eyebrow); letter-spacing: var(--ls-eyebrow); text-transform: uppercase; color: var(--g-dim); flex: none; }
  .mini .mv { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: right;
    font: var(--t-label); color: var(--g-dim); font-variant-numeric: tabular-nums; }
  .mini .mv b { font: var(--t-bar-value); color: var(--g-text); }
  .mini .mv b.tone-ok { color: rgb(var(--g-mint)); } .mini .mv b.tone-bad { color: rgb(var(--g-rose)); } .mini .mv b.tone-dim { color: var(--g-dim); }
  .mini .mv b.tone-heat { color: var(--g-heat); } .mini .mv b.tone-cool { color: var(--g-cool); }
  .mini .mv .sh { display: none; }
  .mini.short .mv .lg { display: none; } .mini.short .mv .sh { display: inline; }
  .mini .mv .dot { margin-right: var(--s-6); vertical-align: .12em; }
  .mini .pb { position: absolute; left: var(--s-18); right: var(--s-18); bottom: 0; height: var(--z-progress);
    border-radius: var(--r-bar) var(--r-bar) 0 0; background: var(--g-raised); overflow: hidden; }
  .mini .pb span { display: block; height: 100%; background: rgb(var(--g-warm)); box-shadow: var(--g-glow-bar) rgba(var(--g-warm), .8); }
  .mini:focus-visible { box-shadow: var(--g-ring); }
  .glass.mini.stack { display: grid; grid-template-columns: var(--z-bar-icon) minmax(0, 1fr) auto; gap: 0 var(--s-2);
    padding: 0 var(--s-6) 0 0; height: var(--z-bar-stack); }
  .mini.stack .mi { display: flex; justify-content: center; align-items: center; color: var(--g-dim); }
  .mini.stack .mi svg { width: var(--z-i-26); height: var(--z-i-26); }
  .mini.stack.ok .mi { color: rgb(var(--g-mint)); } .mini.stack.bad .mi { color: rgb(var(--g-rose)); }
  .mini.stack .tx { min-width: 0; display: flex; flex-direction: column; gap: var(--s-2); }
  .mini.stack .ml { font: var(--t-micro-caps); letter-spacing: var(--ls-micro-caps); }
  .mini.stack .mv { text-align: left; }
  .mini.stack .mv b { font: var(--t-title-sm); letter-spacing: var(--ls-title-sm); }
  .mini.stack .fold { width: var(--z-btn-xs); height: var(--z-btn-xs); }

  /* Chip: a small toggle. It sizes itself from its OWN width (container query on .chipbox),
     never from the screen. Three layouts: wide = icon, name left, state right on one line;
     middle = icon left, name (2 lines max) over state; narrow = icon above, text centred. */
  .chipbox { container-type: inline-size; min-width: 0; display: grid; }
  .chip { all: unset; box-sizing: border-box; position: relative; cursor: pointer; min-width: 0; min-height: var(--z-chip-min);
    border-radius: var(--r-chip); padding: var(--s-4) var(--s-6); display: grid; align-items: center; justify-items: start;
    grid-template: "ic nm" auto "ic st" auto / auto minmax(0, 1fr); column-gap: var(--s-6); row-gap: var(--s-2);
    background: var(--g-well); border: var(--g-hair) solid var(--g-well-border); color: var(--g-text); font-family: var(--g-font);
    -webkit-tap-highlight-color: transparent; user-select: none; -webkit-user-select: none;
    transition: border-color var(--m-chip), box-shadow var(--m-chip), background var(--m-chip); }
  .chip.is-on { background: linear-gradient(180deg, rgba(var(--c), .24), rgba(var(--g-lite), .05)); border-color: rgba(var(--c), .5);
    box-shadow: var(--g-elev-chip-shape) rgba(var(--c), .9); }
  .chip:focus-visible { box-shadow: var(--g-ring); }
  .chip .ci { grid-area: ic; height: var(--z-chip-art); display: flex; align-items: center; justify-content: center; color: var(--g-dim); }
  .chip .ci svg { height: 100%; width: auto; max-width: 100%; overflow: visible; }
  .chip.is-on .ci { color: rgb(var(--c)); }
  .chip:not(.is-on) .ci .art { filter: var(--k-off-art); }
  .chip .cn { grid-area: nm; align-self: end; min-width: 0; max-width: 100%; font: var(--t-caption); overflow-wrap: normal; word-break: normal; hyphens: manual;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .chip .cn.tight { font: var(--t-micro); }
  .chip .cs { grid-area: st; align-self: start; min-width: 0; max-width: 100%; font: var(--t-micro); color: var(--g-dim); font-variant-numeric: tabular-nums;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .chip.is-on .cs { color: var(--g-text); }
  .chip.tile { ${TILE} } ${tileParts(".chip.tile")}
  @container (min-width: ${BP.chipWide}px) {
    .chip { grid-template: "ic nm st" auto / auto minmax(0, 1fr) auto; padding: var(--s-4) var(--s-10) var(--s-4) var(--s-8); column-gap: var(--s-8); }
    .chip .cn { align-self: center; font: var(--t-label-b); }
    .chip .cn.tight { font: var(--t-caption); }
    .chip .cs { align-self: center; font: var(--t-state); }
    .chip.auto { ${TILE} } ${tileParts(".chip.auto")}
  }
  @container (max-width: ${BP.chipNarrow - 0.02}px) {
    .chip, .chip.tile { grid-template: "ic" auto "nm" auto "st" auto / minmax(0, 1fr); justify-items: center; text-align: center;
      padding: var(--s-6) var(--s-4); row-gap: var(--s-2); }
    .chip .cn, .chip .cs { align-self: center; }
  }

  /* Badge: a small status pill. Text always names the state; colour only repeats it.
     .badge-on (mint), .badge-off (dim), .badge-error (rose). */
  .badge { font: var(--t-caption); padding: var(--s-6) var(--s-10); border-radius: var(--r-pill); display: inline-flex; gap: var(--s-6); align-items: center;
    background: var(--g-raised); color: var(--g-dim); white-space: nowrap; }
  .badge .dot { --c: var(--g-mint); }
  .badge-on { color: rgb(var(--g-mint)); } .badge-on .dot { background: rgb(var(--c)); box-shadow: var(--g-glow-dot) rgb(var(--c)); }
  .badge-error { color: rgb(var(--g-rose)); background: rgba(var(--g-rose), .14); } .badge-error .dot { --c: var(--g-rose); background: rgb(var(--c)); }

  /* Heading: the small-caps label of a section or group. */
  .heading { font: var(--t-section); letter-spacing: var(--ls-section); text-transform: uppercase; white-space: nowrap; }
`;

// Drawer: the pull-up panel for detail controls (shade picker, climate). It lives in <body>
// (outside the themed view), so the theme keys are carried over with carryTheme().
export const DRAWER_CSS = `
  .scrim { position: fixed; inset: 0; z-index: 9999; background: var(--g-scrim); display: flex; align-items: flex-end; justify-content: center;
    animation: fade var(--m-fast) ease; }
  .drawer { width: 100%; max-width: var(--z-sheet-max); max-height: 92vh; overflow-y: auto; padding: var(--s-10) var(--s-22) calc(var(--s-24) + env(safe-area-inset-bottom, 0px));
    border-radius: var(--r-sheet) var(--r-sheet) 0 0; color: var(--g-text); font-family: var(--g-font);
    background: var(--g-sheet); border: var(--g-hair) solid var(--g-border);
    -webkit-backdrop-filter: var(--g-blur-sheet); backdrop-filter: var(--g-blur-sheet); animation: up var(--m-sheet); }
  .drawer-handle { width: var(--z-handle-w); height: var(--z-handle-h); border-radius: var(--r-bar); background: var(--g-idle); margin: 0 auto var(--s-16); }
  .drawer-header { display: flex; justify-content: space-between; align-items: center; gap: var(--s-12); margin-bottom: var(--s-14); }
  .drawer-done { cursor: pointer; min-height: var(--z-touch); box-sizing: border-box; display: grid; place-items: center; padding: 0 var(--s-16);
    border-radius: var(--r-pill); background: var(--g-raised-hi); font: var(--t-body-sm-b); }
  .drawer-link { cursor: pointer; min-height: var(--z-touch); display: grid; place-items: center; font: var(--t-label); color: var(--g-dim); margin-top: var(--s-12); width: 100%; }
  .drawer-done:focus-visible, .drawer-link:focus-visible { box-shadow: var(--g-ring); }
  .drawer-label { margin: var(--s-18) 0 var(--s-10); }
  @keyframes up { from { transform: translateY(100%); } } @keyframes fade { from { opacity: 0; } }
`;

// ---- 3. The shared sheet -----------------------------------------------------------------

const CAN_ADOPT = (() => {
  try { return "adoptedStyleSheets" in Document.prototype && "replaceSync" in CSSStyleSheet.prototype && !!new CSSStyleSheet(); } catch (e) { return false; }
})();
export const SHARED_CSS = TOKENS + PRIMS;
export const SHEET = CAN_ADOPT ? new CSSStyleSheet() : null;
if (SHEET) SHEET.replaceSync(SHARED_CSS);

const sheetCache = new Map();
function sheetFor(css) {
  let s = sheetCache.get(css);
  if (!s) { s = new CSSStyleSheet(); s.replaceSync(css); sheetCache.set(css, s); }
  return s;
}
// Give a shadow root the shared sheet plus the card's own (static) CSS. Old browsers without
// constructable stylesheets get the same text in <style> tags (see paint()).
export function adopt(root, css = "") {
  root._css = css;
  if (CAN_ADOPT) root.adoptedStyleSheets = css ? [SHEET, sheetFor(css)] : [SHEET];
}
export function paint(root, html) {
  root.innerHTML = CAN_ADOPT ? html : `<style>${SHARED_CSS}${root._css || ""}</style>${html}`;
}

// ---- Fonts (must live in the document, not a shadow root) ---------------------------------

const FONT_ID = "habib-glass-fonts";
export function injectGlobals() {
  if (document.getElementById(FONT_ID)) return;
  const base = new URL("../fonts/", import.meta.url).href.split("?")[0];
  const style = document.createElement("style");
  style.id = FONT_ID;
  style.textContent = `
    @font-face { font-family: "Habib Display"; src: url("${base}Outfit.woff2") format("woff2"); font-weight: 100 900; font-display: swap; }
    @font-face { font-family: "Habib Text"; src: url("${base}Inter.woff2") format("woff2"); font-weight: 100 900; font-display: swap; }`;
  document.head.appendChild(style);
}

// ---- Helpers -----------------------------------------------------------------------------

export const esc = (v) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const rgbStr = (a) => `${a[0]}, ${a[1]}, ${a[2]}`;
export const usableState = (s) => !!s && !["unavailable", "unknown"].includes(s.state);

// Interface icons: inline SVG, 24 viewBox, 1.8 stroke, currentColor. Named, so YAML can pick one.
const LINE = `fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`;
const svg = (body, attrs = LINE) => `<svg viewBox="0 0 24 24" ${attrs} aria-hidden="true">${body}</svg>`;
export const ICONS = {
  "chevron-down": svg(`<path d="M6 9l6 6 6-6"/>`, LINE.replace("1.8", "2.2")),
  "chevron-up": svg(`<path d="M6 15l6-6 6 6"/>`, LINE.replace("1.8", "2.2")),
  lock: svg(`<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><circle cx="12" cy="15.5" r="1.3" fill="currentColor"/>`),
  "lock-open": svg(`<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 7.6-1.8"/><circle cx="12" cy="15.5" r="1.3" fill="currentColor"/>`),
  garage: svg(`<path d="M3 10 12 4l9 6v10H3z"/><path d="M6.5 20v-8h11v8M6.5 14.5h11M6.5 17h11"/>`),
  "garage-open": svg(`<path d="M3 10 12 4l9 6v10H3z"/><path d="M6.5 20v-8h11v8M6.5 14.5h11"/>`),
  door: svg(`<path d="M6 21V4h12v17M3 21h18"/><circle cx="14.5" cy="12.5" r="1" fill="currentColor"/>`),
  shield: svg(`<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6z"/><path d="m8.5 12 2.4 2.4 4.6-4.8"/>`),
  "shield-alert": svg(`<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6z"/><path d="M12 8v5M12 16v.5"/>`),
  thermometer: svg(`<path d="M10 4a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z"/><path d="M12 9v6.5"/>`),
  speaker: svg(`<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>`),
  sun: svg(`<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>`, LINE.replace("1.8", "2")),
  plus: svg(`<path d="M12 5v14M5 12h14"/>`, LINE.replace("1.8", "2.4")),
  bulb: svg(`<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>`),
  power: svg(`<path d="M12 3v8"/><path d="M6.6 6.6a7.5 7.5 0 1 0 10.8 0"/>`),
  plug: svg(`<path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0zM12 16v5"/>`),
  scene: svg(`<path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4z"/><path d="M18 15l.8 2 2 .7-2 .7-.8 2-.8-2-2-.7 2-.7z"/>`),
  script: svg(`<path d="M8 4h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="m10.5 9 4 3-4 3z"/>`),
  toggle: svg(`<rect x="3" y="7" width="18" height="10" rx="5"/><circle cx="16" cy="12" r="2.6"/>`),
  fan: svg(`<circle cx="12" cy="12" r="1.6"/><path d="M12 10.4C12 6 13 3.5 15.5 4.5S16 9 13.4 11.2M13.6 12c4.4 0 6.9 1 5.9 3.5s-4.5.5-6.7-2.1M12 13.6c0 4.4-1 6.9-3.5 5.9S8 15 10.6 12.8M10.4 12C6 12 3.5 11 4.5 8.5S9 8 11.2 10.6"/>`),
  moon: svg(`<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>`),
  home: svg(`<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>`),
  play: svg(`<path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/>`, `fill="currentColor"`),
  pause: svg(`<rect x="6.5" y="5" width="4" height="14" rx="1.3"/><rect x="13.5" y="5" width="4" height="14" rx="1.3"/>`, `fill="currentColor"`),
  next: svg(`<path d="M5 6.3v11.4a.8.8 0 0 0 1.2.7l8.6-5.7a.8.8 0 0 0 0-1.4L6.2 5.6A.8.8 0 0 0 5 6.3z"/><rect x="16.5" y="5.5" width="2.5" height="13" rx="1"/>`, `fill="currentColor"`),
  prev: svg(`<path d="M19 6.3v11.4a.8.8 0 0 1-1.2.7l-8.6-5.7a.8.8 0 0 1 0-1.4l8.6-5.7a.8.8 0 0 1 1.2.7z"/><rect x="5" y="5.5" width="2.5" height="13" rx="1"/>`, `fill="currentColor"`),
  more: svg(`<circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>`, `fill="currentColor"`),
};
export const CHEV = (up) => ICONS[up ? "chevron-up" : "chevron-down"];

export function registerCard(type, name, description) {
  window.customCards = window.customCards || [];
  if (!window.customCards.some((c) => c.type === type)) window.customCards.push({ type, name, description, preview: false });
}
export function moreInfo(el, entityId) {
  el.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
}
export function haptic(el) {
  el.dispatchEvent(new CustomEvent("haptic", { detail: "light", bubbles: true, composed: true }));
}
// Turn a set of lamps on or off. Groups can mix lights and smart-plug switches, so each
// domain gets its own call (light.turn_on would skip the switch.* lamps).
export function switchLamps(hass, ids, on) {
  return Promise.all(Object.entries(G.byDomain(ids)).map(([d, list]) =>
    hass.callService(d === "switch" ? "switch" : "light", on ? "turn_on" : "turn_off", {}, { entity_id: list })));
}
// A name is never broken inside a word. If its longest word still overflows the box, step the
// type down one role (class "tight"); re-checked whenever the box changes size.
export function fitText(root, selector) {
  for (const el of root.querySelectorAll(selector)) {
    el.classList.remove("tight");
    if (el.scrollWidth > el.clientWidth + 0.5) el.classList.add("tight");
  }
}
// Theme keys a floating layer (the colour sheet lives in <body>, outside the themed view) must carry over.
const THEME_VARS = ["--habib-base", "--habib-scale"];
export function carryTheme(from, to) {
  const cs = getComputedStyle(from);
  for (const k of THEME_VARS) { const v = cs.getPropertyValue(k).trim(); if (v) to.style.setProperty(k, v); }
}

// Open a drawer. opts: { title, sub, body (HTML), css (extra CSS), link (text of the bottom
// link, or null), onLink(), onMount(root, close) }. Returns close(). Escape and a tap on the
// scrim close it.
export function openDrawer(from, { title = "", sub = "", body = "", css = "", link = "Open full controls", onLink = null, onMount = null } = {}) {
  const host = document.createElement("div");
  carryTheme(from, host);
  const root = host.attachShadow({ mode: "open" });
  adopt(root, DRAWER_CSS + css);
  paint(root, `<div class="scrim"><div class="drawer" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="drawer-handle"></div>
    <div class="drawer-header"><span><span class="title">${esc(title)}</span>${sub ? `<span class="sub" style="display:block">${esc(sub)}</span>` : ""}</span>
      <button class="drawer-done">Done</button></div>
    ${body}
    ${link && onLink ? `<button class="drawer-link">${esc(link)}</button>` : ""}
  </div></div>`);
  const close = () => { host.remove(); document.removeEventListener("keydown", onKey, true); };
  const onKey = (e) => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", onKey, true);
  root.querySelector(".scrim").addEventListener("click", (e) => { if (e.target.classList.contains("scrim")) close(); });
  root.querySelector(".drawer-done").addEventListener("click", close);
  const l = root.querySelector(".drawer-link");
  if (l) l.addEventListener("click", () => { close(); onLink(); });
  document.body.appendChild(host);
  if (onMount) onMount(root, close);
  return close;
}

// ---- 4. Base card ------------------------------------------------------------------------

export class GlassCard extends HTMLElement {
  constructor() {
    super();
    this._timers = new Set();
    this._sig = null;
    this._pend = new Map();
    this._nores = new Set();
  }
  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("Invalid configuration");
    this._config = config;
    this._validate(config);
    // Opt-in fold (collapsible: true). Starts folded unless collapsed: false. The viewer's
    // last choice is remembered per dashboard in localStorage (a convenience only).
    // remember: false starts folded on every load.
    this._collapsible = config.collapsible === true || this._alwaysFoldable === true;
    this._remember = config.remember !== false;
    if (this._collapsible) {
      this._foldKey = `habib_fold:${location.pathname}:${config.type}:${config.title || config.name || ""}`;
      let saved = null;
      if (this._remember) { try { saved = localStorage.getItem(this._foldKey); } catch (e) { saved = null; } }
      this._collapsed = saved === null ? config.collapsed !== false : saved === "1";
    } else {
      this._collapsed = false;
    }
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      adopt(this.shadowRoot, this.constructor.css || "");
      const toggle = (e) => {
        const t = e.target.closest && e.target.closest("[data-collapse]");
        if (!t || !this._collapsible) return false;
        haptic(this);
        this._collapsed = !this._collapsed;
        if (this._remember) { try { localStorage.setItem(this._foldKey, this._collapsed ? "1" : "0"); } catch (err) { /* private mode */ } }
        this._maybeRender(true);
        // A parent (habib-dock, habib-layout) reacts to the new size.
        this.dispatchEvent(new CustomEvent("habib-fold", { detail: { collapsed: this._collapsed }, bubbles: true, composed: true }));
        const next = this.shadowRoot.querySelector("[data-collapse]");
        if (next && e.type === "keydown") next.focus();
        return true;
      };
      this.shadowRoot.addEventListener("click", toggle);
      this.shadowRoot.addEventListener("keydown", (e) => {
        if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches("[data-collapse]")) { e.preventDefault(); toggle(e); }
      });
      // Text fitting follows the card's own width.
      if (typeof ResizeObserver !== "undefined") {
        this._ro = new ResizeObserver(() => this._fit());
        this._ro.observe(this);
      }
      this._setup();
    }
    this._sig = null;
    if (this._hass) this._maybeRender(true);
  }
  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) this._onFirstHass();
    this._maybeRender(false);
  }
  get hass() { return this._hass; }
  connectedCallback() {
    injectGlobals();
    this._connected();
    if (this._hass) this._maybeRender(true);
  }
  disconnectedCallback() {
    for (const t of this._timers) clearTimeout(t);
    this._timers.clear();
    this._pend.clear();
    this._nores.clear();
    this._disconnected();
  }
  _maybeRender(force) {
    if (!this._config || !this.shadowRoot || this._hold) return;
    const sig = this._signature() + (this._collapsible ? `|fold${this._collapsed ? 1 : 0}` : "") + this._feedbackSig();
    if (!force && sig === this._sig) return;
    this._sig = sig;
    if (this._collapsed) this._renderFolded();
    else { this._render(); if (this._collapsible) this._addFoldButton(); }
    this._fit();
  }
  _paint(html) { paint(this.shadowRoot, html); }
  // After every render and every resize: bars pick their long or short value, names step down.
  _fit() {
    const root = this.shadowRoot;
    if (!root) return;
    const bar = root.querySelector(".mini");
    if (bar) {
      bar.classList.remove("short");
      const mv = bar.querySelector(".mv");
      if (mv && mv.scrollWidth > mv.clientWidth + 0.5) bar.classList.add("short");
    }
    fitText(root, ".chip .cn");
  }
  // Folded: one glass bar with a label, a one-line value and a chevron. The value has a long
  // and a short form (summary.short); the bar shows the long one when it fits its own width.
  // fold_layout: stack is the half-width dock bar: icon column, label over value.
  // direct: true (single entity) opens HA's own dialog for that entity instead of unfolding.
  _renderFolded() {
    const s = this._summary();
    const stack = this._config.fold_layout === "stack";
    const direct = this._config.direct === true && s.entity;
    const long = G.plainText(s.html);
    const name = `${s.label}: ${long}`;
    const act = direct ? `data-entity="${esc(s.entity)}" aria-label="${esc(name)}, open controls"` : `data-collapse aria-expanded="false" aria-label="${esc(name)}, show"`;
    const tail = `<span class="fold ${direct ? "go" : ""}">${CHEV(false)}</span>`;
    const value = `<span class="mv"><span class="lg">${s.html}</span><span class="sh">${s.short || s.html}</span></span>`;
    this._paint(`<div class="glass mini press ${stack ? "stack" : ""} ${s.tone || ""}" ${act} role="button" tabindex="0">
        ${stack ? `<span class="mi">${s.icon || ""}</span><span class="tx"><span class="ml">${esc(s.label)}</span>${value}</span>${tail}`
          : `<span class="ml">${esc(s.label)}</span>${value}${tail}`}
        ${s.progress != null ? `<div class="pb"><span style="width:${Math.round(s.progress * 100)}%"></span></div>` : ""}
      </div>`);
  }
  // Expanded: put the fold button in the card's [data-fold-slot] if it has one, else top right.
  _addFoldButton() {
    const b = document.createElement("button");
    b.className = "fold";
    b.setAttribute("data-collapse", "");
    b.setAttribute("aria-expanded", "true");
    b.setAttribute("aria-label", "Fold card");
    b.innerHTML = CHEV(true);
    const slot = this.shadowRoot.querySelector("[data-fold-slot]");
    if (slot) slot.appendChild(b);
    else { b.classList.add("abs"); const g = this.shadowRoot.querySelector(".glass"); if (g) g.appendChild(b); }
  }
  _summary() { return { label: this._config.title || "", html: "" }; }

  // Feedback (design guide rule 9). _begin(key, snapshot) marks a control pending. When the
  // snapshot changes the control is done. If it has not changed after the pending window the
  // control shows the real state again and says "No response" for a moment.
  _begin(key, snapshot) {
    const p = { before: snapshot(), snapshot };
    this._pend.set(key, p);
    this._nores.delete(key);
    this._later(() => {
      if (this._pend.get(key) !== p) return;
      this._pend.delete(key);
      if (p.snapshot() === p.before) {
        this._nores.add(key);
        this._later(() => { if (this._nores.delete(key)) this._maybeRender(true); }, TIME.noResponseMs);
      }
      this._maybeRender(true);
    }, TIME.pendingMs);
    this._maybeRender(true);
  }
  _pending(key) {
    const p = this._pend.get(key);
    if (p && p.snapshot() !== p.before) { this._pend.delete(key); return false; }
    return !!p;
  }
  _noResponse(key) { return this._nores.has(key); }
  _feedbackSig() { return this._pend.size || this._nores.size ? `|p${[...this._pend.keys()].join(",")}|n${[...this._nores].join(",")}` : ""; }

  _later(fn, ms) {
    const id = setTimeout(() => { this._timers.delete(id); fn(); }, ms);
    this._timers.add(id);
    return id;
  }
  _st(id) { return (this._hass && this._hass.states[id]) || null; }
  _sigOf(ids, attrs = []) {
    return ids.map((id) => {
      const s = this._st(id);
      return s ? [id, s.state, ...attrs.map((a) => JSON.stringify(s.attributes[a]))].join("|") : `${id}|-`;
    }).join("§");
  }
  _validate() {}
  _setup() {}
  _connected() {}
  _disconnected() {}
  _onFirstHass() {}
  getCardSize() { return 3; }
}
