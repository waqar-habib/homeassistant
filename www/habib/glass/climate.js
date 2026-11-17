// glass/climate.js: habib-climate. A dial per thermostat. A tap opens HA's own dialog; no setpoint call from here.
const B = await import(new URL("./base.js", import.meta.url).href.split("?")[0] + new URL(import.meta.url).search);
const { GlassCard, esc, moreInfo, ICONS } = B;

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
      if (t) moreInfo(this, t.getAttribute("data-entity"));
    });
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
}
export const card = { tag: "habib-climate", cls: HabibClimate, name: "Habib climate (glass)", description: "Indoor temperature and setpoint range per thermostat. Tap opens Home Assistant's dialog." };
