// glass/climate.js: habib-climate / ui-climate. A dial per thermostat.
// A tap opens the climate drawer (controls: true, the ui-climate default; owner GREEN LIGHT climate
// controls 2026-11-17): mode and setpoints, sent through climate.set_hvac_mode and
// climate.set_temperature. habib-climate keeps controls: false (HA's own dialog) until cutover.
const B = await import(new URL("./base.js", import.meta.url).href.split("?")[0] + new URL(import.meta.url).search);
const { G, GlassCard, esc, moreInfo, haptic, openDrawer, ICONS, TIME, BP } = B;

const DRAWER = `
  .now { display: flex; align-items: baseline; gap: var(--s-10); margin-bottom: var(--s-6); }
  .now .cur { font: var(--t-metric-xl); letter-spacing: var(--ls-metric-xl); }
  .modes { display: flex; flex-wrap: wrap; gap: var(--s-8); }
  .mode { cursor: pointer; min-height: var(--z-touch); padding: 0 var(--s-16); border-radius: var(--r-pill); display: inline-grid; place-items: center;
    background: var(--g-raised); color: var(--g-dim); font: var(--t-label-b); }
  .mode.sel { background: var(--g-raised-hi); color: var(--g-text); box-shadow: inset 0 0 0 var(--g-hair) var(--g-line); }
  .mode:focus-visible, .step:focus-visible { box-shadow: var(--g-ring); }
  .sets { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: var(--s-12); }
  .set { min-width: 0; container-type: inline-size; border-radius: var(--r-panel); padding: var(--s-12) var(--s-14) var(--s-14); display: flex; flex-direction: column; align-items: center; gap: var(--s-8); }
  .set.heat { box-shadow: inset 0 0 0 var(--g-hair) var(--g-heat); } .set.cool { box-shadow: inset 0 0 0 var(--g-hair) var(--g-cool); }
  .set .eyebrow { color: var(--g-dim); }
  .set.heat .eyebrow { color: var(--g-heat); } .set.cool .eyebrow { color: var(--g-cool); }
  /* The stepper row always fits the box: two fixed buttons and a flexible value between them. */
  .ctl { width: 100%; display: grid; grid-template: "dn val up" auto / var(--z-stepper) minmax(0, 1fr) var(--z-stepper); align-items: center; gap: var(--s-6); }
  .ctl [data-dir="-1"] { grid-area: dn; } .ctl [data-dir="1"] { grid-area: up; } .ctl .val { grid-area: val; }
  /* A narrow box (phone): value on its own line, the two buttons under it. */
  @container (max-width: ${BP.stepperNarrow - 0.02}px) {
    .ctl { grid-template: "val val" auto "dn up" auto / 1fr 1fr; justify-items: center; row-gap: var(--s-8); } }
  .step { cursor: pointer; width: var(--z-stepper); height: var(--z-stepper); border-radius: var(--r-round); display: grid; place-items: center;
    background: var(--g-raised); color: var(--g-text); font: var(--t-title); }
  .step:active { transform: scale(var(--k-press-btn)); }
  .val { min-width: 0; text-align: center; white-space: nowrap; font: var(--t-metric-md); letter-spacing: var(--ls-metric-md); }
  .msg { min-height: var(--z-i-18); font: var(--t-caption); color: var(--g-dim); text-align: center; margin-top: var(--s-10); }
`;

const MODE = { heat_cool: "Auto", heat: "Heating", cool: "Cooling", off: "Off", auto: "Auto", dry: "Dry", fan_only: "Fan" };
const ACTION = { heating: "Heating now", cooling: "Cooling now", idle: "Idle", off: "Off" };

export class HabibClimate extends GlassCard {
  static css = `
    .glass { padding: var(--s-16); display: flex; flex-direction: column; gap: var(--s-10); }
    .grid { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: var(--s-10); flex: 1; }
    .t { position: relative; cursor: pointer; border-radius: var(--r-tile); padding: var(--s-10) var(--s-10) var(--s-12);
      display: flex; flex-direction: column; align-items: center; min-width: 0; }
    .dialbox { position: relative; width: 100%; max-width: var(--z-dial-max); aspect-ratio: 1; }
    .dial { width: 100%; height: 100%; display: block; }
    .dial .trk { stroke: var(--g-track); } .dial .pin { fill: var(--g-solid); stroke: var(--g-well-deep); }
    .dial .h { stop-color: var(--g-heat); } .dial .c { stop-color: var(--g-cool); }
    .mid { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; }
    .cur { font: var(--t-metric-lg); letter-spacing: var(--ls-metric-lg); }
    .range { font: var(--t-caption); color: var(--g-dim); margin-top: var(--s-4); }
    .foot { text-align: center; margin-top: calc(-1 * var(--s-6)); max-width: 100%; }
    .foot .title { font: var(--t-title-sm); letter-spacing: var(--ls-title-sm); }
  `;
  _validate(c) {
    this._items = Array.isArray(c.entities) ? c.entities.map((e) => (typeof e === "string" ? { entity: e } : e)) : [];
    if (!this._items.length) throw new Error("Set entities");
  }
  _signature() { return this._sigOf(this._items.map((i) => i.entity), ["current_temperature", "target_temp_low", "target_temp_high", "temperature", "hvac_action"]); }
  _setup() {
    this.shadowRoot.addEventListener("click", (e) => {
      const t = e.target.closest && e.target.closest("[data-entity]");
      if (!t) return;
      const id = t.getAttribute("data-entity");
      const it = this._items.find((i) => i.entity === id) || { entity: id };
      if (this._controls()) this._openDrawer(it); else moreInfo(this, id);
    });
  }
  _controls() { return (this._config.controls ?? this.constructor.defaultControls) === true; }
  set hass(h) { super.hass = h; if (this._drawer) this._drawer.update(); }
  get hass() { return this._hass; }

  // Climate drawer: current temperature, mode buttons, one stepper per setpoint.
  // Steps change the shown value at once and are sent 0.8 s after the last tap (one call per burst).
  _openDrawer(it) {
    const id = it.entity;
    const s0 = this._st(id);
    if (!s0 || !B.usableState(s0)) { moreInfo(this, id); return; }
    let local = null, timer = null, sentAt = 0, msg = "";
    const lim = () => { const a = this._st(id).attributes; return { step: a.target_temp_step || 1, min: a.min_temp ?? 50, max: a.max_temp ?? 90, gap: 3 }; };
    const shown = () => local || G.climateTargets(this._st(id).state, this._st(id).attributes);
    const draw = (root) => {
      const s = this._st(id); const a = s.attributes; const t = shown();
      const modes = (a.hvac_modes || []).map((m) => `<button class="mode ${s.state === m ? "sel" : ""}" data-mode="${esc(m)}" aria-pressed="${s.state === m}">${esc(MODE[m] || m)}</button>`).join("");
      const one = (which, label, v, tone) => `<div class="set well ${tone}"><span class="eyebrow">${label}</span>
          <div class="ctl"><button class="step" data-step="${which}" data-dir="-1" aria-label="${label} down">−</button>
          <span class="val num" aria-live="polite">${Math.round(v)}<span class="unit">°</span></span>
          <button class="step" data-step="${which}" data-dir="1" aria-label="${label} up">+</button></div></div>`;
      const sets = t.kind === "range" ? one("low", "Heat to", t.low, "heat") + one("high", "Cool to", t.high, "cool")
        : t.kind === "single" ? one("value", s.state === "cool" ? "Cool to" : "Heat to", t.value, s.state === "cool" ? "cool" : "heat") : "";
      const action = a.hvac_action ? ACTION[a.hvac_action] || a.hvac_action : MODE[s.state] || s.state;
      root.querySelector(".body").innerHTML = `
        <div class="now"><span class="cur num">${typeof a.current_temperature === "number" ? Math.round(a.current_temperature) : "–"}<span class="unit">°</span></span><span class="sub">${esc(action)}</span></div>
        <div class="drawer-label eyebrow">Mode</div><div class="modes">${modes}</div>
        ${sets ? `<div class="drawer-label eyebrow">Target</div><div class="sets" style="--n: ${t.kind === "range" ? 2 : 1}">${sets}</div>` : ""}
        <div class="msg" role="status">${esc(msg)}</div>`;
    };
    const send = () => {
      const data = G.targetData(local);
      if (!data) return;
      sentAt = Date.now(); msg = "Sending…"; this._drawer.update();
      this._hass.callService("climate", "set_temperature", data, { entity_id: id }).catch(() => { msg = "Not accepted"; local = null; this._drawer.update(); });
      this._later(() => { if (local && sentAt && Date.now() - sentAt >= TIME.noResponseMs) { msg = "No response"; local = null; this._drawer.update(); } }, TIME.noResponseMs);
    };
    const close = openDrawer(this, {
      title: it.name || s0.attributes.friendly_name || id, sub: "Climate", css: DRAWER, body: `<div class="body"></div>`,
      onLink: () => moreInfo(this, id),
      onMount: (root) => {
        draw(root);
        root.addEventListener("click", (e) => {
          const m = e.target.closest && e.target.closest("[data-mode]");
          if (m) {
            haptic(this); msg = "Sending…"; local = null; draw(root);
            this._hass.callService("climate", "set_hvac_mode", { hvac_mode: m.dataset.mode }, { entity_id: id }).catch(() => { msg = "Not accepted"; draw(root); });
            return;
          }
          const b = e.target.closest && e.target.closest("[data-step]");
          if (!b) return;
          haptic(this);
          local = G.stepTarget(shown(), b.dataset.step, Number(b.dataset.dir), lim());
          msg = ""; draw(root);
          clearTimeout(timer); timer = setTimeout(send, TIME.debounceMs);
        });
        this._drawer = {
          update: () => {
            // Drop the local value once Home Assistant reports it (or the mode changed).
            const real = G.climateTargets(this._st(id).state, this._st(id).attributes);
            if (local && JSON.stringify(real) === JSON.stringify(local)) { local = null; msg = ""; sentAt = 0; }
            if (msg === "Sending…" && !local && !sentAt) msg = "";
            if (root.isConnected || root.host.isConnected) draw(root);
          },
        };
        const obs = new MutationObserver(() => { if (!root.host.isConnected) { this._drawer = null; clearTimeout(timer); obs.disconnect(); } });
        obs.observe(document.body, { childList: true });
      },
    });
    return close;
  }
  _render() {
    const tiles = this._items.map((it) => {
      const s = this._st(it.entity);
      if (!s) return `<div class="t well is-missing"><div class="note-bad">Not found</div><div class="sub">${esc(it.name || it.entity)}</div></div>`;
      const a = s.attributes;
      const dead = !B.usableState(s);
      const cur = typeof a.current_temperature === "number" ? a.current_temperature : null;
      const lo = a.target_temp_low ?? (s.state === "heat" ? a.temperature : null);
      const hi = a.target_temp_high ?? (s.state === "cool" ? a.temperature : null);
      const min = a.min_temp ?? 50, max = a.max_temp ?? 90;
      const pos = (v) => Math.min(1, Math.max(0, (v - min) / (max - min)));
      // 240-degree arc.
      const R = 42, C = 2 * Math.PI * R, ARC = C * (240 / 360);
      const seg = (from, to) => `stroke-dasharray="${Math.max(0, (to - from) * ARC)} ${C}" stroke-dashoffset="${-from * ARC}"`;
      const mode = MODE[s.state] || s.state;
      const action = a.hvac_action ? ACTION[a.hvac_action] || a.hvac_action : "";
      const range = lo != null && hi != null ? `${Math.round(lo)}–${Math.round(hi)}°` : lo != null ? `${Math.round(lo)}°` : hi != null ? `${Math.round(hi)}°` : "";
      const curPos = cur != null ? pos(cur) : null;
      const ang = curPos != null ? (150 + 240 * curPos) * (Math.PI / 180) : 0;
      const name = it.name || a.friendly_name;
      return `<button class="t well act press ${dead ? "is-dead" : ""}" data-entity="${esc(it.entity)}" aria-label="${esc(name)}: ${dead ? "No response" : `${cur ?? "unknown"} degrees, ${esc(action || mode)}`}">
        <div class="dialbox"><svg viewBox="0 0 100 100" class="dial" aria-hidden="true">
          <defs><linearGradient id="rg" x1="0" x2="1"><stop class="h" offset="0"/><stop class="c" offset="1"/></linearGradient></defs>
          <g transform="rotate(150 50 50)" fill="none" stroke-width="7" stroke-linecap="round">
            <circle class="trk" cx="50" cy="50" r="${R}" stroke-dasharray="${ARC} ${C}"/>
            ${lo != null && hi != null ? `<circle stroke="url(#rg)" cx="50" cy="50" r="${R}" ${seg(pos(lo), pos(hi))}/>` : ""}
          </g>
          ${curPos != null ? `<circle class="pin" cx="${50 + R * Math.cos(ang)}" cy="${50 + R * Math.sin(ang)}" r="5.5"/>` : ""}
        </svg>
        <div class="mid"><div class="cur num">${cur != null ? Math.round(cur) : "–"}<span class="unit">°</span></div><div class="range num">${esc(range)}</div></div></div>
        <div class="foot"><div class="title">${esc(name)}</div><div class="sub">${dead ? "No response" : esc(action || mode)}</div></div>
      </button>`;
    }).join("");
    this._paint(`<div class="glass"><div class="hd"><div class="eyebrow">${esc(this._config.title || "Climate")}</div><span data-fold-slot></span></div>
      <div class="grid" style="--n: ${this._items.length}">${tiles}</div></div>`);
  }
  // Long form "Down 72° · Up 72°", short form "72° · 72°"; the bar picks by its own width.
  _summary() {
    const parts = this._items.map((it) => {
      const s = this._st(it.entity);
      const cur = s && typeof s.attributes.current_temperature === "number" ? `${Math.round(s.attributes.current_temperature)}°` : "–";
      const tone = s && s.attributes.hvac_action === "heating" ? "tone-heat" : s && s.attributes.hvac_action === "cooling" ? "tone-cool" : "";
      const value = `<b class="${tone}">${cur}</b>`;
      return { long: `${esc(it.short || it.name || (s && s.attributes.friendly_name) || it.entity)} ${value}`, short: value };
    });
    return { label: this._config.title || "Climate", html: parts.map((p) => p.long).join(" · "), short: parts.map((p) => p.short).join(" · "), icon: ICONS.thermometer };
  }
  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }
  static getStubConfig() { return { type: "custom:habib-climate", entities: [] }; }
  static defaultControls = false;
}
export const card = { tag: "habib-climate", cls: HabibClimate, name: "Habib climate (glass)", description: "Indoor temperature and setpoint range per thermostat. Tap opens Home Assistant's dialog." };
