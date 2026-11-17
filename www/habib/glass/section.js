// glass/section.js: ui-section. Layout component: an outlined, collapsible container that holds
// any cards on a 12-column grid (library v1, 2026-11-17).
//   Open:      header (heading, note, "n on", chevron) over the child cards.
//   Collapsed: collapsed_view "none" (default) = the header alone with a summary;
//              collapsed_view "compact" = the header plus a Compact card (chip) per light child.
// Config: title, note, cards[], collapsed (false = starts open), collapsed_view, remember (true),
// collapsible (true; false = always open, no chevron).
// A section may hold sections one level deep (e.g. "Lights" holding one collapsed section per
// room); its summary then counts the lights of the sections inside it.
// The summary counts lights that are on; a section without lights joins its children's own
// one-line summaries (the same text their accordion bar shows).
const B = await import(new URL("./base.js", import.meta.url).href.split("?")[0] + new URL(import.meta.url).search);
const A = await B.load("./art.js");
const { lampState } = await B.load("./light.js");
const { G, GlassCard, esc, rgbStr, switchLamps, haptic, CHEV, usableState } = B;

const LIGHT_TYPES = ["custom:ui-card", "custom:habib-light"];
const idsOf = (c) => (Array.isArray(c.entities) ? c.entities : c.entity ? [c.entity] : []).map(String);

export class UiSection extends GlassCard {
  static css = `${A.LAMP_CSS}
    :host { height: auto; }
    .glass { overflow: visible; height: auto; padding: var(--z-section-pad); display: flex; flex-direction: column; gap: var(--z-section-pad); }
    .section-header { position: relative; display: flex; align-items: center; gap: var(--s-8); min-height: var(--z-btn-sm); padding-left: var(--s-6);
      border-radius: var(--r-small); outline: none; cursor: pointer; -webkit-tap-highlight-color: transparent; }
    .section-header::after { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: var(--z-touch); transform: translateY(-50%); }
    .section-header:focus-visible { box-shadow: var(--g-ring); }
    .section-header.fixed { cursor: default; } .section-header.fixed::after { content: none; }
    .heading { font: var(--t-section-sm); letter-spacing: var(--ls-section-sm); }
    .section-note { flex: 1; min-width: 0; font: var(--t-caption); color: var(--g-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .section-sum { font: var(--t-caption); color: var(--g-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60%; }
    .section-sum.on { color: rgb(var(--g-warm)); }
    .section-header .fold { width: var(--z-btn-xs); height: var(--z-btn-xs); } .section-header .fold svg { width: var(--z-i-13); height: var(--z-i-13); }
    .section-header .fold::after { content: none; }
    .section-body { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: var(--z-gap-card); }
    .cell { min-width: 0; grid-column: span var(--span, 12); }
    .cell.rows { height: calc(var(--rows) * var(--z-row) + (var(--rows) - 1) * var(--z-gap-card)); }
    .cell > * { display: block; height: 100%; }
    .chips { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: var(--s-6); }
    .err { font: var(--t-label); color: rgb(var(--g-rose)); }
  `;
  constructor() { super(); this._alwaysFoldable = true; this._kids = null; }
  setConfig(config) {
    // A section starts open unless collapsed: true (the base class starts folded).
    // collapsible: false = always open: no toggle, no chevron, nothing remembered.
    this._fixed = !!config && config.collapsible === false;
    this._alwaysFoldable = !this._fixed;
    super.setConfig({ ...config, collapsible: !this._fixed, collapsed: !this._fixed && config && config.collapsed === true });
  }
  _validate(c) {
    if (!Array.isArray(c.cards) || !c.cards.length) throw new Error("Set cards");
    this._lights = c.cards.filter((k) => LIGHT_TYPES.includes(k.type) && idsOf(k).length && k.variant !== "control")
      .map((k) => ({ cfg: k, ids: idsOf(k) }));
    // Lights of nested sections count in the summary (no chips for them).
    const nested = c.cards.filter((k) => k.type === "custom:ui-section" && Array.isArray(k.cards))
      .flatMap((k) => k.cards.filter((x) => LIGHT_TYPES.includes(x.type)).flatMap(idsOf));
    this._allIds = [...new Set([...this._lights.flatMap((l) => l.ids), ...nested])];
    this._compact = c.collapsed_view === "compact";
    this._kids = null;
  }
  set hass(h) {
    super.hass = h;
    if (this._kids) for (const k of this._kids) if (k.el.setConfig) k.el.hass = h;
  }
  get hass() { return this._hass; }
  // One line for a parent section or an accordion bar: "2 on", "All off", or the children's summaries.
  _summary() { const s = this._summaryText(); return { label: this._config.title || "", html: esc(s.text) }; }
  _signature() {
    const kidsSig = this._kids && !this._lights.length ? this._kids.map((k) => (k.el._summary ? G.plainText(k.el._summary().html) : "")).join("|") : "";
    return (this._collapsed ? "c" : "o") + this._sigOf(this._allIds, this._collapsed ? ["brightness", "rgb_color", "color_temp_kelvin", "color_mode"] : []) + kidsSig;
  }
  _setup() {
    this.shadowRoot.addEventListener("click", (e) => {
      const b = e.target.closest && e.target.closest("[data-chip]");
      if (b) this._toggleChip(Number(b.dataset.chip));
    });
  }
  _makeKids() {
    if (this._kids) return;
    this._kids = this._config.cards.map((cfg) => {
      let el;
      try {
        const tag = String(cfg.type || "").replace(/^custom:/, "");
        if (!String(cfg.type || "").startsWith("custom:")) throw new Error("only custom cards");
        el = document.createElement(tag);
        el.setConfig(cfg);
      } catch (err) {
        el = document.createElement("div");
        el.className = "err";
        el.textContent = `${cfg && cfg.type ? cfg.type : "card"}: ${err.message}`;
      }
      return { cfg, el };
    });
  }
  _summaryText() {
    if (this._allIds.length) {
      const on = this._allIds.filter((id) => { const s = this._st(id); return s && s.state === "on"; }).length;
      return { text: on ? `${on} on` : "All off", on: on > 0 };
    }
    this._makeKids();
    const parts = this._kids.map((k) => (typeof k.el._summary === "function" && k.el._hass ? G.plainText(k.el._summary().html) : "")).filter(Boolean);
    return { text: parts.join(" · "), on: false };
  }
  _head() {
    const name = this._config.title || this._config.name || "";
    const sum = this._summaryText();
    const open = !this._collapsed;
    const toggle = this._fixed ? `role="heading" aria-level="2"` : `data-collapse role="button" tabindex="0" aria-expanded="${open}" aria-label="${esc(name)}${sum.text ? `, ${esc(sum.text)}` : ""}, ${open ? "collapse" : "expand"}"`;
    return `<div class="section-header ${this._fixed ? "fixed" : ""}" ${toggle}>
      <span class="heading">${esc(name)}</span><span class="section-note">${esc(this._config.note || "")}</span>
      ${sum.text && (this._collapsed || this._allIds.length) ? `<span class="section-sum ${sum.on ? "on" : ""}">${esc(sum.text)}</span>` : ""}
      ${this._fixed ? "" : `<span class="fold">${CHEV(open)}</span>`}</div>`;
  }
  _toggleChip(i) {
    const l = this._lights[i];
    const usable = l && l.ids.filter((id) => usableState(this._st(id)));
    if (!usable || !usable.length || !this._hass) return;
    const anyOn = usable.some((id) => this._st(id).state === "on");
    haptic(this);
    this._begin(`c${i}`, () => l.ids.map((id) => { const s = this._st(id); return s ? s.state : "-"; }).join(","));
    switchLamps(this._hass, usable, !anyOn).catch(() => {});
  }
  _chips() {
    return this._lights.map((l, i) => {
      const glow = G.lightGlow(this._hass.states, l.ids);
      const s = lampState({ ids: l.ids, st: (id) => this._st(id), glow, pending: this._pending(`c${i}`), noResponse: this._noResponse(`c${i}`), short: true });
      const kind = l.cfg.art || (s.group ? "group" : "table-lamp");
      const groupLit = s.group ? Math.ceil((glow.on / Math.max(1, glow.total)) * 3) : 3;
      return `<div class="chipbox"><button class="chip press ${s.on ? "is-on" : ""} ${s.dead ? "is-dead" : ""}" data-chip="${i}" style="--c: ${rgbStr(G.glowRgb(glow.rgb))}"
          aria-pressed="${s.on}" aria-label="${esc(l.cfg.name || "Light")}: ${esc(s.text)}">
          <span class="ci">${A.lampSvg(kind, glow, groupLit, `s${i}`)}</span>
          <span class="cn">${esc(l.cfg.name || "")}</span><span class="cs">${esc(s.text)}</span></button></div>`;
    }).join("");
  }
  _renderFolded() {
    const chips = this._compact && this._lights.length ? `<div class="chips" style="--n: ${Math.min(this._lights.length, 4)}">${this._chips()}</div>` : "";
    this._paint(`<div class="glass">${this._head()}${chips}</div>`);
  }
  _render() {
    this._makeKids();
    this._paint(`<div class="glass">${this._head()}<div class="section-body"></div></div>`);
    const body = this.shadowRoot.querySelector(".section-body");
    for (const k of this._kids) {
      const opt = { ...(typeof k.el.getGridOptions === "function" ? k.el.getGridOptions() : {}), ...(k.cfg.grid_options || {}) };
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.style.setProperty("--span", String(Math.min(12, Number(opt.columns) > 0 ? Number(opt.columns) : 12)));
      if (Number(opt.rows) > 0) { cell.classList.add("rows"); cell.style.setProperty("--rows", String(Number(opt.rows))); }
      cell.appendChild(k.el);
      body.appendChild(cell);
      if (this._hass && k.el.setConfig) k.el.hass = this._hass;
    }
  }
  // The section draws its own chevron in the header; no extra fold button.
  _addFoldButton() {}
  getCardSize() { return 4; }
  getGridOptions() { return { columns: 12, rows: "auto" }; }
  static getStubConfig() { return { type: "custom:ui-section", title: "Section", cards: [] }; }
}
export const card = { tag: "ui-section", cls: UiSection, name: "Section", description: "Outlined, collapsible container for cards. Collapsed: header with a summary, or Compact cards." };
