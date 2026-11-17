// glass/light.js: habib-light. A drawn lamp that glows in the light's own colour.
// Tap toggles, the slider dims, the three dots open the colour sheet.
const B = await import(new URL("./base.js", import.meta.url).href.split("?")[0] + new URL(import.meta.url).search);
const A = await B.load("./art.js");
const { G, GlassCard, esc, rgbStr, usableState, switchLamps, haptic, moreInfo, openDrawer, ICONS } = B;

const SWATCHES = [
  { k: 2200, label: "Candle" }, { k: 2700, label: "Warm" }, { k: 4000, label: "Neutral" }, { k: 6000, label: "Daylight" },
  { rgb: [255, 120, 90], label: "Coral" }, { rgb: [255, 190, 70], label: "Amber" }, { rgb: [120, 220, 140], label: "Green" },
  { rgb: [90, 160, 255], label: "Blue" }, { rgb: [190, 120, 255], label: "Violet" }, { rgb: [255, 110, 190], label: "Pink" },
];

// What the state line says. Shared with habib-room chips so both use the same words.
export function lampState({ ids, st, glow, pending, noResponse, short }) {
  const live = ids.filter((id) => st(id));
  const usable = live.filter((id) => usableState(st(id)));
  const group = ids.length > 1;
  const on = glow.on > 0;
  const dim = usable.some((id) => { const m = st(id).attributes.supported_color_modes || []; return m.length && !(m.length === 1 && m[0] === "onoff"); });
  const text = !live.length ? "Not found" : !usable.length || noResponse ? "No response" : pending ? "…"
    : group ? (on ? `${glow.on} of ${glow.total}${short ? "" : " on"}` : short ? "Off" : "All off") : on ? (dim ? `${glow.pct}%` : "On") : "Off";
  return { text, on, dim, dead: !usable.length, missing: ids.filter((id) => !st(id)), usable, group };
}

// Swatch grid inside the shared drawer (base.js openDrawer).
const SWATCH_CSS = `
  .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--s-12); }
  .sw { aspect-ratio: 1; min-width: var(--z-touch); border-radius: var(--r-round); cursor: pointer;
    background: radial-gradient(circle at 35% 30%, var(--g-solid), rgb(var(--c)) 60%);
    box-shadow: var(--g-glow-swatch) rgba(var(--c), .8), inset 0 0 0 var(--g-hair) var(--g-idle); transition: transform var(--m-fast); }
  .sw:active { transform: scale(var(--k-press-sw)); }
  .sw:focus-visible { box-shadow: var(--g-ring); }
`;

export class HabibLight extends GlassCard {
  static css = `${A.LAMP_CSS}
    .glass { display: flex; flex-direction: column; padding: var(--s-14) var(--s-14) var(--s-12); cursor: pointer; min-height: var(--z-lamp-min);
      -webkit-tap-highlight-color: transparent; user-select: none; -webkit-user-select: none; transition: box-shadow var(--m-state), border-color var(--m-state); }
    .glass.is-on { border-color: rgba(var(--c), .45); box-shadow: var(--g-elev-on-top), var(--g-elev-on-shape) rgba(var(--c), .55); }
    .glass.is-on::before { content: ""; position: absolute; inset: 0; pointer-events: none;
      background: radial-gradient(90% 60% at 50% 38%, rgba(var(--c), calc(.22 * var(--lv, 1))), transparent 70%); }
    .head { position: relative; display: flex; flex-direction: column; gap: var(--s-2); z-index: 1; }
    .state { font: var(--t-state); color: var(--g-dim); display: flex; align-items: center; gap: var(--s-6); }
    .is-on .state { color: var(--g-text); }
    .stage { position: relative; flex: 1; min-height: var(--z-lamp-stage); display: flex; justify-content: center; align-items: flex-end; margin: var(--s-4) 0 var(--s-10); }
    .art { height: 100%; max-height: var(--z-lamp-art); width: auto; max-width: 100%; overflow: visible; transition: filter var(--m-state); }
    /* The slider's hit area is 44 px tall; the visible track stays 34 px. */
    .slider { position: relative; height: var(--z-slider); touch-action: pan-y; cursor: ew-resize; z-index: 1; }
    .slider::before { content: ""; position: absolute; inset: min(0px, calc(50% - var(--z-touch) / 2)) 0; }
    .track { position: absolute; inset: 0; border-radius: var(--r-control); background: var(--g-well-deep); border: var(--g-hair) solid var(--g-raised); overflow: hidden; }
    .fill { position: absolute; inset: 0 auto 0 0; border-radius: var(--r-control); background: var(--g-well-border); }
    /* The glow ramps over the whole track (not the fill), so the value on the left always sits on a dark part. */
    .is-on .fill { background: linear-gradient(90deg, rgba(var(--c), .12), rgba(var(--c), .16) 50%, rgba(var(--c), .9)) left / calc(10000% / var(--p, 100)) 100% no-repeat;
      box-shadow: var(--g-glow-fill) rgba(var(--c), .5); }
    .knob { position: absolute; top: var(--z-knob-inset); bottom: var(--z-knob-inset); width: var(--z-knob); border-radius: var(--r-bar); background: var(--g-solid);
      margin-left: calc(-1 * var(--s-10)); opacity: .9; }
    .pct { position: absolute; left: var(--s-12); top: 0; bottom: 0; display: flex; align-items: center; gap: var(--s-6);
      font: var(--t-state); color: var(--g-text); pointer-events: none; }
    .pct svg { width: var(--z-i-14); height: var(--z-i-14); }
    .more { position: absolute; right: var(--s-8); top: 0; bottom: 0; display: flex; align-items: center; }
    .dots { position: relative; width: var(--z-more); height: var(--z-more); border-radius: var(--r-small); display: grid; place-items: center; cursor: pointer; color: var(--g-text); }
    .dots svg { width: var(--z-i-16); height: var(--z-i-16); }
    .dots:active { background: var(--g-raised-hi); }
    .dots:focus-visible { box-shadow: var(--g-ring); }
    .glass.wide { min-height: 0; padding: var(--s-14) var(--s-16); }
    .wide .body { display: grid; grid-template-columns: 40% 1fr; gap: var(--s-14); flex: 1; min-height: 0; }
    .wide .stage { min-height: 0; height: 100%; margin: 0; }
    .wide .right { display: flex; flex-direction: column; justify-content: space-between; gap: var(--s-10); min-width: 0; }
    /* Large card (layout: row): art beside the title and state, control pill below. */
    .glass.lg { min-height: var(--z-card-lg-min); padding: var(--s-12) var(--s-12) var(--s-10); gap: var(--s-8); }
    .lg .top { display: grid; grid-template-columns: var(--z-card-lg-art) minmax(0, 1fr); gap: var(--s-12); align-items: center; flex: 1; }
    .lg .stage { height: var(--z-card-lg-art); min-height: 0; margin: 0; align-items: center; }
    .lg .head { min-width: 0; }
    .lg .title { font: var(--t-title-sm); letter-spacing: var(--ls-title-sm); }
    .glass.lg.is-on::before { background: radial-gradient(60% 90% at 14% 40%, rgba(var(--c), calc(.24 * var(--lv, 1))), transparent 70%); }
    /* Control pill (variant: control): the pill alone, for a switch or light without art. */
    .glass.ctl { min-height: 0; padding: var(--s-8); flex-direction: row; align-items: center; gap: var(--s-10); }
    .ctl .ctl-name { font: var(--t-label-b); padding-left: var(--s-6); flex: none; max-width: 40%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ctl .slider, .ctl .sw-pill { flex: 1; min-width: 0; }
    .sw-pill { position: relative; height: var(--z-slider); border-radius: var(--r-control); background: var(--g-well-deep); border: var(--g-hair) solid var(--g-raised);
      display: flex; align-items: center; padding: 0 var(--s-12); gap: var(--s-6); font: var(--t-state); }
    .is-on .sw-pill { background: rgba(var(--c), .22); border-color: rgba(var(--c), .5); }
    .sw-pill svg { width: var(--z-i-14); height: var(--z-i-14); }
  `;
  _validate(c) {
    const ids = Array.isArray(c.entities) ? c.entities : c.entity ? [c.entity] : [];
    if (!ids.length) throw new Error("Set entities");
    this._ids = ids.map(String);
    this._wide = c.size === "wide";
    // layout: "row" = Large card (art beside the text). variant: "control" = Control pill only.
    this._row = (c.layout || this.constructor.defaultLayout) === "row";
    this._ctl = c.variant === "control";
  }
  _signature() { return this._sigOf(this._ids, ["brightness", "rgb_color", "color_temp_kelvin", "color_mode"]); }
  _snap() { return this._ids.map((id) => { const s = this._st(id); return s ? s.state : "-"; }).join(","); }
  _usable() { return this._ids.filter((id) => usableState(this._st(id))); }
  _dimmable() {
    return this._usable().filter((id) => { const m = this._st(id).attributes.supported_color_modes || []; return m.length && !(m.length === 1 && m[0] === "onoff"); });
  }
  _colorable() {
    return this._usable().filter((id) => (this._st(id).attributes.supported_color_modes || []).some((m) => ["hs", "rgb", "rgbw", "rgbww", "xy"].includes(m)));
  }
  _render() {
    const cfg = this._config;
    const glow = G.lightGlow(this._hass.states, this._ids);
    const s = lampState({ ids: this._ids, st: (id) => this._st(id), glow, pending: this._pending("t"), noResponse: this._noResponse("t") });
    const kind = cfg.art || (s.group ? "group" : "table-lamp");
    const groupLit = s.group ? Math.ceil((glow.on / Math.max(1, glow.total)) * 3) : 3;
    const art = `<div class="stage">${A.lampSvg(kind, glow, groupLit)}</div>`;
    const head = `<div class="head"><div class="title">${esc(cfg.name || "")}</div>
      <span class="state"><i class="dot ${s.on ? "on" : ""}"></i>${esc(s.text)}${cfg.room ? ` · ${esc(cfg.room)}` : ""}</span>
      ${s.missing.length && s.missing.length < this._ids.length ? `<div class="note-bad">Missing: ${esc(s.missing.join(", "))}</div>` : ""}</div>`;
    // The control pill: a brightness slider for a dimmable light, an on/off pill otherwise. The
    // three dots appear when there is something more to set (colour), or always on a Large card.
    const slider = s.dim ? this._sliderHtml(glow) : (this._row || this._ctl) ? this._switchPill(s) : "";
    const kind2 = this._ctl ? "ctl" : this._row ? "lg" : this._wide ? "wide" : "";
    const body = this._ctl ? `<span class="ctl-name">${esc(cfg.name || "")}</span>${slider}`
      : this._row ? `<div class="top">${art}${head}</div>${slider}`
      : this._wide ? `<div class="body">${art}<div class="right">${head}${slider}</div></div>` : `${head}${art}${slider}`;
    this._paint(`<div class="glass press ${s.on ? "is-on" : "is-off"} ${s.dead ? "is-dead" : ""} ${kind2}" role="button" tabindex="0"
        style="--c: ${rgbStr(G.glowRgb(glow.rgb))}; --lv: ${glow.level}" aria-pressed="${s.on}" aria-label="${esc(cfg.name || "Light")}: ${esc(s.text)}">
        ${body}
      </div>`);
  }
  _switchPill(s) {
    return `<div class="sw-pill">${ICONS.power}<span>${esc(s.on ? "On" : s.text === "No response" ? "No response" : "Off")}</span></div>`;
  }
  _sliderHtml(glow) {
    const pct = glow.on ? glow.pct : 0;
    return `<div class="slider" data-slider aria-label="Brightness" role="slider" tabindex="0" aria-valuemin="1" aria-valuemax="100" aria-valuenow="${pct}">
      <div class="track"><div class="fill" style="width:${Math.max(pct, 0)}%; --p: ${Math.max(pct, 1)}"></div><div class="knob" style="left:${Math.max(pct, 6)}%;${glow.on ? "" : "opacity:0"}"></div>
        <div class="pct">${ICONS.sun}<span data-pct>${glow.on ? `${pct}%` : "Off"}</span></div></div>
      <div class="more"><button class="dots tap" data-more aria-label="Colour and details" type="button">${ICONS.more}</button></div>
    </div>`;
  }
  _setup() {
    const root = this.shadowRoot;
    root.addEventListener("click", (e) => {
      if (this._dragged) { this._dragged = false; return; }
      const path = e.composedPath();
      if (path.some((n) => n.hasAttribute && n.hasAttribute("data-more"))) { this._openSheet(); return; }
      if (path.some((n) => n.hasAttribute && n.hasAttribute("data-slider"))) return;
      this._toggle();
    });
    root.addEventListener("keydown", (e) => {
      const slider = e.target.closest && e.target.closest("[data-slider]");
      if (e.target.closest && e.target.closest("[data-more]")) return; // the button handles its own Enter and Space
      if (slider && !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
      if (slider) {
        e.preventDefault();
        const now = Number(slider.getAttribute("aria-valuenow")) || 0;
        this._setBrightness(Math.min(100, Math.max(1, now + (e.key === "ArrowLeft" || e.key === "ArrowDown" ? -10 : 10))));
        return;
      }
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); this._toggle(); }
    });
    root.addEventListener("pointerdown", (e) => {
      const slider = e.target.closest && e.target.closest("[data-slider]");
      if (!slider || (e.target.closest && e.target.closest("[data-more]"))) return;
      // A page scroll that starts on the slider must not change brightness: the slider allows
      // vertical panning (touch-action: pan-y), a vertical gesture is ignored, and the browser's
      // pointercancel (it took over the scroll) sends nothing.
      e.stopPropagation();
      this._hold = true;
      this._dragged = false;
      const startX = e.clientX, startY = e.clientY;
      const rect = slider.getBoundingClientRect();
      const fill = slider.querySelector(".fill");
      const knob = slider.querySelector(".knob");
      const label = slider.querySelector("[data-pct]");
      let pct = null;
      let mode = "wait"; // wait -> drag (horizontal) or scroll (vertical)
      const set = (x) => {
        pct = Math.round(Math.min(100, Math.max(1, ((x - rect.left) / rect.width) * 100)));
        fill.style.width = `${pct}%`;
        fill.style.setProperty("--p", String(pct));
        knob.style.left = `${Math.max(pct, 6)}%`;
        knob.style.opacity = "";
        label.textContent = `${pct}%`;
      };
      const move = (ev) => {
        const dx = Math.abs(ev.clientX - startX), dy = Math.abs(ev.clientY - startY);
        if (mode === "wait" && (dx > 6 || dy > 6)) {
          mode = dx > dy ? "drag" : "scroll";
          if (mode === "drag") { try { slider.setPointerCapture(ev.pointerId); } catch (err) { /* released */ } }
        }
        if (mode === "drag") { this._dragged = true; set(ev.clientX); }
      };
      const up = (ev) => {
        slider.removeEventListener("pointermove", move);
        slider.removeEventListener("pointerup", up);
        slider.removeEventListener("pointercancel", up);
        this._hold = false;
        this._dragged = true;
        this._later(() => { this._dragged = false; }, 50);
        // Send only a horizontal drag, or a tap (no movement) that sets the level where tapped.
        if (ev.type === "pointerup" && mode !== "scroll") { set(ev.clientX); this._setBrightness(pct); }
        else this._maybeRender(true);
      };
      slider.addEventListener("pointermove", move);
      slider.addEventListener("pointerup", up);
      slider.addEventListener("pointercancel", up);
    });
  }
  _toggle() {
    const usable = this._usable();
    if (!usable.length || !this._hass) return;
    const anyOn = usable.some((id) => this._st(id).state === "on");
    haptic(this);
    this._begin("t", () => this._snap());
    switchLamps(this._hass, usable, !anyOn).catch(() => {});
  }
  _setBrightness(pct) {
    const ids = this._dimmable();
    if (!ids.length || !this._hass) return;
    haptic(this);
    this._hass.callService("light", "turn_on", { brightness_pct: pct }, { entity_id: ids }).catch(() => this._maybeRender(true));
  }
  _openSheet() {
    const colorIds = this._colorable();
    const ids = this._dimmable();
    const list = SWATCHES.filter((sw) => sw.k || colorIds.length);
    if (!list.length || !ids.length) { moreInfo(this, this._ids[0]); return; }
    const sw = list.map((x, i) => `<button class="sw" data-i="${i}" style="--c: ${rgbStr(x.k ? G.kelvinToRgb(x.k) : x.rgb)}" aria-label="${esc(x.label)}"></button>`).join("");
    openDrawer(this, {
      title: this._config.name || "Light",
      sub: this._usable().map((id) => G.colorLabel(this._st(id).attributes)).find(Boolean) || "",
      css: SWATCH_CSS,
      body: `<div class="drawer-label eyebrow">${colorIds.length ? "White and colour" : "White"}</div><div class="grid">${sw}</div>`,
      onLink: () => moreInfo(this, this._ids[0]),
      onMount: (root) => root.querySelectorAll(".sw").forEach((b) => b.addEventListener("click", () => {
        const x = list[Number(b.dataset.i)];
        haptic(this);
        if (x.k) {
          const temps = ids.filter((id) => (this._st(id).attributes.supported_color_modes || []).includes("color_temp"));
          if (temps.length) this._hass.callService("light", "turn_on", { color_temp_kelvin: x.k }, { entity_id: temps });
        } else {
          this._hass.callService("light", "turn_on", { rgb_color: x.rgb }, { entity_id: colorIds });
        }
      })),
    });
  }
  getCardSize() { return 4; }
  getGridOptions() {
    if (this._ctl) return { columns: 12, rows: 1, min_columns: 6 };
    if (this._row) return { columns: this._wide ? 12 : 6, rows: 2, min_columns: 6, min_rows: 2 };
    return this._wide ? { columns: 12, rows: 3, min_columns: 6, min_rows: 3 } : { columns: 6, rows: 4, min_columns: 4, min_rows: 3 };
  }
  static getStubConfig(hass, entities) {
    const first = (entities || []).find((e) => e.startsWith("light."));
    return { type: "custom:habib-light", name: "Lamp", art: "table-lamp", entities: first ? [first] : [] };
  }
}
export const card = { tag: "habib-light", cls: HabibLight, name: "Habib lamp (glass)", description: "A drawn lamp that glows in the light's colour. Tap toggles, slider sets brightness, ••• opens colours." };
