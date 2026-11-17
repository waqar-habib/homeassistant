// glass/room.js: habib-room. A room as lamp chips (tap toggles); the header opens the full habib-light cards.
const B = await import(new URL("./base.js", import.meta.url).href.split("?")[0] + new URL(import.meta.url).search);
const A = await B.load("./art.js");
const { lampState } = await B.load("./light.js");
const { G, GlassCard, esc, rgbStr, switchLamps, haptic, CHEV } = B;

export class HabibRoom extends GlassCard {
  static css = `${A.LAMP_CSS}
    .glass { overflow: visible; padding: var(--s-6) var(--s-8) var(--s-8); display: flex; flex-direction: column; gap: var(--s-6); }
    /* The header is 22 px tall; its hit area is 44 px, reaching up over the card's top padding and the gap above. */
    .rh { position: relative; display: flex; align-items: center; gap: var(--s-8); min-height: var(--z-btn-xs); padding-left: var(--s-6); outline: none; border-radius: var(--r-small); }
    .rh[data-collapse] { cursor: pointer; -webkit-tap-highlight-color: transparent; }
    .rh[data-collapse]::after { content: ""; position: absolute; left: 0; right: 0; bottom: calc(-1 * var(--s-6)); height: var(--z-touch); }
    .h { font: var(--t-section-sm); letter-spacing: var(--ls-section-sm); text-transform: uppercase; white-space: nowrap; }
    .nt { flex: 1; min-width: 0; font: var(--t-caption); color: var(--g-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cnt { font: var(--t-caption); color: rgb(var(--g-warm)); white-space: nowrap; }
    .rh .fold { width: var(--z-btn-xs); height: var(--z-btn-xs); } .rh .fold svg { width: var(--z-i-13); height: var(--z-i-13); }
    .rh[data-collapse] .fold::after { content: none; }
    .chips { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: var(--s-6); position: relative; }
    .full { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--s-8); }
    .k { height: var(--z-lamp-open); min-width: 0; } .k.wide { grid-column: 1 / -1; height: var(--z-lamp-open-wide); }
  `;
  constructor() {
    super();
    this._alwaysFoldable = true;
    this._kids = null;
  }
  _validate(c) {
    const lights = Array.isArray(c.lights) ? c.lights : [];
    this._lights = lights.map((l) => ({ cfg: l, ids: (Array.isArray(l.entities) ? l.entities : l.entity ? [l.entity] : []).map(String) }));
    if (!this._lights.length || this._lights.some((l) => !l.ids.length)) throw new Error("Set lights, each with entities");
    this._allIds = [...new Set(this._lights.flatMap((l) => l.ids))];
    this._kids = null;
  }
  set hass(h) {
    super.hass = h;
    if (!this._collapsed && this._kids) for (const k of this._kids) k.hass = h;
  }
  get hass() { return this._hass; }
  _signature() {
    if (!this._collapsed) return "open";
    return this._sigOf(this._allIds, ["brightness", "rgb_color", "color_temp_kelvin", "color_mode"]);
  }
  _setup() {
    this.shadowRoot.addEventListener("click", (e) => {
      const b = e.target.closest && e.target.closest("[data-chip]");
      if (b) this._toggleChip(Number(b.dataset.chip));
    });
  }
  _toggleChip(i) {
    const l = this._lights[i];
    const usable = l && l.ids.filter((id) => B.usableState(this._st(id)));
    if (!usable || !usable.length || !this._hass) return;
    const anyOn = usable.some((id) => this._st(id).state === "on");
    haptic(this);
    this._begin(`c${i}`, () => l.ids.map((id) => { const s = this._st(id); return s ? s.state : "-"; }).join(","));
    switchLamps(this._hass, usable, !anyOn).catch(() => {});
  }
  _head(open) {
    const on = this._allIds.filter((id) => { const s = this._st(id); return s && s.state === "on"; }).length;
    const name = this._config.name || "";
    const note = `<span class="nt">${esc(this._config.note || "")}</span>`;
    return open
      ? `<div class="rh"><span class="h">${esc(name)}</span>${note}<span data-fold-slot></span></div>`
      : `<div class="rh" data-collapse role="button" tabindex="0" aria-expanded="false" aria-label="${esc(name)}${on ? `, ${on} on` : ""}, show all controls">
          <span class="h">${esc(name)}</span>${note}${on ? `<span class="cnt">${on} on</span>` : ""}<span class="fold">${CHEV(false)}</span></div>`;
  }
  _renderFolded() {
    const chips = this._lights.map((l, i) => {
      const glow = G.lightGlow(this._hass.states, l.ids);
      const s = lampState({ ids: l.ids, st: (id) => this._st(id), glow, pending: this._pending(`c${i}`), noResponse: this._noResponse(`c${i}`), short: true });
      const kind = l.cfg.art || (s.group ? "group" : "table-lamp");
      const groupLit = s.group ? Math.ceil((glow.on / Math.max(1, glow.total)) * 3) : 3;
      return `<div class="chipbox"><button class="chip press ${s.on ? "is-on" : ""} ${s.dead ? "is-dead" : ""}" data-chip="${i}" style="--c: ${rgbStr(G.glowRgb(glow.rgb))}"
          aria-pressed="${s.on}" aria-label="${esc(l.cfg.name || "Light")}: ${esc(s.text)}">
          <span class="ci">${A.lampSvg(kind, glow, groupLit, `r${i}`)}</span>
          <span class="cn">${esc(l.cfg.name || "")}</span><span class="cs">${esc(s.text)}</span></button></div>`;
    }).join("");
    // At most 4 chips in a row (design guide 6.2 rule 6).
    this._paint(`<div class="glass">${this._head(false)}<div class="chips" style="--n: ${Math.min(this._lights.length, 4)}">${chips}</div></div>`);
  }
  _render() {
    if (!this._kids) {
      this._kids = this._lights.map((l) => {
        const el = document.createElement("habib-light");
        el.setConfig({ ...l.cfg, type: "custom:habib-light" });
        return el;
      });
    }
    this._paint(`<div class="glass">${this._head(true)}<div class="full"></div></div>`);
    const full = this.shadowRoot.querySelector(".full");
    this._lights.forEach((l, i) => {
      const cell = document.createElement("div");
      cell.className = `k ${l.cfg.size === "wide" ? "wide" : ""}`;
      cell.appendChild(this._kids[i]);
      full.appendChild(cell);
      if (this._hass) this._kids[i].hass = this._hass;
    });
  }
  getCardSize() { return 2; }
  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }
  static getStubConfig() { return { type: "custom:habib-room", name: "Room", lights: [] }; }
}
export const card = { tag: "habib-room", cls: HabibRoom, name: "Habib room (glass)", description: "A room's lamps as small chips (tap toggles); the chevron opens the full lamp cards." };
