// glass/layout.js: habib-layout. One container card that packs groups of cards into columns (D79).
//   - It measures its OWN width (ResizeObserver). No screen media query and no HA visibility
//     condition decides the layout, so no width can render blank (I56).
//   - columns = min(max_columns, floor((width + gap) / (min_column + gap))); under compact_below
//     it shows one column and each group's compact_cards.
//   - Each group, in config order, goes into the column that is currently shortest (ties left).
//     DOM order always equals config order (keyboard, screen readers).
//   - Inside a group: optional label, then the cards on a 12-column grid from getGridOptions.
//   - It paints the wallpaper from the theme key habib-base (single-hex colour, D78).
// Config: groups[] { id, label, note, cards[], compact_cards[], with, column }, max_columns (4),
// min_column (320), max_column (500), compact_below (700), wallpaper (true), packing ("order" | "fluid").
//   packing: fluid (library v1 fluid rule, logic fluidPack): `with: <group id>` keeps a group directly
//   under another; `column: 1` pins left, `column: -1` pins right; the rest go tallest first into
//   the shortest column; columns are fixed once settled, so opening a section never moves another
//   section sideways. Phones (compact mode) always use config order.
//   compact_cards absent = the group shows `cards` on a phone too; compact_cards: [] = hidden on a
//   phone; cards: [] = hidden on wide screens.
const B = await import(new URL("./base.js", import.meta.url).href.split("?")[0] + new URL(import.meta.url).search);
const { G, adopt, paint, injectGlobals } = B;

const DEFAULTS = { max_columns: 4, min_column: 320, max_column: 500, compact_below: 700 };
const UNIT = 4; // px per packing row: placements snap to this grid

const CSS = `
  :host { position: relative; height: auto; min-height: calc(100vh - var(--top, 0px)); color: var(--g-text); font-family: var(--g-font); }
  /* Wallpaper: a viewport-tall layer that stays put while the page scrolls. All colours come
     from habib-base (set as --w-* by the card from the palette recipes). */
  .wall { position: sticky; top: 0; z-index: 0; height: 100vh; margin-top: calc(-1 * var(--top, 0px)); margin-bottom: calc(var(--top, 0px) - 100vh);
    overflow: hidden; pointer-events: none;
    background: radial-gradient(75% 75% at 50% 45%, transparent 55%, rgba(var(--g-dark), .45)),
      radial-gradient(55% 55% at 22% 18%, var(--w-glow-a), transparent),
      radial-gradient(50% 50% at 85% 12%, rgba(var(--g-warm), .2), transparent),
      radial-gradient(55% 55% at 60% 62%, var(--w-glow-b), transparent),
      linear-gradient(165deg, var(--w-sky-0), var(--w-sky-1) 45%, var(--w-sky-2)); }
  .wall svg { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: 26%; display: block; }
  .wall .canopy { fill: var(--w-canopy); } .wall .ground { fill: var(--w-ground); } .wall .stem { stroke: var(--w-stem); }
  .wall .la0 { stop-color: var(--w-leaf-a0); } .wall .la1 { stop-color: var(--w-leaf-a1); }
  .wall .lb0 { stop-color: var(--w-leaf-b0); } .wall .lb1 { stop-color: var(--w-leaf-b1); }
  .page { position: relative; z-index: 1; padding: var(--z-page-pad) var(--z-page-pad) 0; }
  .compact .page { padding: var(--z-page-pad-compact) var(--z-page-pad-compact) 0; }
  .grid { display: grid; grid-template-columns: repeat(var(--cols, 1), minmax(0, var(--max-col))); justify-content: center;
    column-gap: var(--z-gap-col); grid-auto-rows: var(--unit); visibility: hidden; }
  .ready .grid { visibility: visible; }
  .one .grid { display: flex; flex-direction: column; align-items: center; }
  .group { min-width: 0; align-self: start; }
  .one .group { width: 100%; max-width: var(--max-col); }
  .compact .group { max-width: none; }
  .group[hidden] { display: none; }
  /* The gap under a group is part of the group, so packing needs no separate gap value. */
  .gi { padding-bottom: var(--z-gap-group); }
  .compact .gi { padding-bottom: var(--z-gap-card); }
  .cards { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: var(--z-gap-card); }
  .cell { min-width: 0; grid-column: span var(--span, 12); }
  .cell.rows { height: calc(var(--rows) * var(--z-row) + (var(--rows) - 1) * var(--z-gap-card)); }
  .cell > * { display: block; }
  .cell.rows > * { height: 100%; }
  .err { padding: var(--s-12); border-radius: var(--r-chip); font: var(--t-label); color: rgb(var(--g-rose)); }
`;

const WALL = `<div class="wall" aria-hidden="true">
  <svg viewBox="0 760 1600 240" preserveAspectRatio="xMidYMax slice">
    <defs>
      <linearGradient id="leafA" x1="0" y1="0" x2="0" y2="1"><stop class="la0" offset="0"/><stop class="la1" offset="1"/></linearGradient>
      <linearGradient id="leafB" x1="0" y1="0" x2="0" y2="1"><stop class="lb0" offset="0"/><stop class="lb1" offset="1"/></linearGradient>
      <g id="sprig">
        <path class="stem" d="M0 0 C -2 -40 2 -80 0 -120" stroke-width="3" fill="none"/>
        <path fill="url(#leafA)" d="M0 -30 C -30 -40 -46 -62 -50 -80 C -26 -76 -8 -58 0 -30z"/>
        <path fill="url(#leafB)" d="M0 -55 C 28 -64 44 -86 48 -104 C 22 -100 6 -82 0 -55z"/>
        <path fill="url(#leafB)" d="M0 -85 C -22 -96 -32 -114 -32 -130 C -12 -124 -2 -108 0 -85z"/>
        <path fill="url(#leafA)" d="M0 -110 C 14 -120 20 -134 18 -148 C 4 -140 -2 -126 0 -110z"/>
      </g>
    </defs>
    <path class="canopy" d="M0 860 C 160 800 300 840 430 810 S 700 770 860 820 S 1160 790 1300 820 S 1520 800 1600 830 V1000 H0z"/>
    <g opacity="0.95">
      <use href="#sprig" transform="translate(70 1010) scale(1.15)"/><use href="#sprig" transform="translate(190 1020) scale(0.8) rotate(-8)"/>
      <use href="#sprig" transform="translate(330 1015) scale(1.0) rotate(6)"/><use href="#sprig" transform="translate(520 1025) scale(0.7)"/>
      <use href="#sprig" transform="translate(690 1012) scale(1.05) rotate(-4)"/><use href="#sprig" transform="translate(880 1020) scale(0.75) rotate(10)"/>
      <use href="#sprig" transform="translate(1040 1012) scale(1.2) rotate(-6)"/><use href="#sprig" transform="translate(1220 1022) scale(0.85) rotate(4)"/>
      <use href="#sprig" transform="translate(1380 1012) scale(1.1) rotate(-10)"/><use href="#sprig" transform="translate(1530 1020) scale(0.9) rotate(8)"/>
    </g>
    <path class="ground" d="M0 975 C 300 955 600 985 900 965 S 1400 975 1600 960 V1000 H0z"/>
  </svg></div>`;

export class HabibLayout extends HTMLElement {
  setConfig(config) {
    const groups = config && Array.isArray(config.groups) ? config.groups : [];
    if (!groups.length) throw new Error("Set groups, each with cards");
    groups.forEach((g, i) => {
      if (!g || (!Array.isArray(g.cards) && !Array.isArray(g.compact_cards))) throw new Error(`Group ${g && g.id ? g.id : i + 1} needs cards or compact_cards`);
    });
    this._config = config;
    this._opt = Object.fromEntries(Object.entries(DEFAULTS).map(([k, d]) => [k, Number(config[k]) > 0 ? Number(config[k]) : d]));
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      adopt(this.shadowRoot, CSS);
      // A child that changes size (fold, room opened) is re-packed by the ResizeObserver below.
      this._ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => this._layout()) : null;
    }
    injectGlobals();
    paint(this.shadowRoot, `${config.wallpaper === false ? "" : WALL}<div class="page"><div class="grid"></div></div>`);
    this._root = this.shadowRoot.querySelector(".page");
    this._grid = this.shadowRoot.querySelector(".grid");
    this.style.setProperty("--max-col", `${this._opt.max_column}px`);
    this.style.setProperty("--unit", `${UNIT}px`);
    if (this._ro) { this._ro.disconnect(); this._ro.observe(this._root); }
    this._mode = null;
    this._wallBase = null;
    this._groups = groups.map((g, i) => {
      const el = document.createElement("section");
      el.className = "group";
      el.dataset.id = g.id || `group-${i + 1}`;
      if (g.label) el.setAttribute("aria-label", g.label);
      const inner = document.createElement("div");
      inner.className = "gi";
      el.appendChild(inner);
      this._grid.appendChild(el);
      if (this._ro) this._ro.observe(inner);
      return { cfg: g, el, inner, sets: {} };
    });
    this._helpers = this._helpers || (typeof window.loadCardHelpers === "function" ? window.loadCardHelpers().catch(() => null) : Promise.resolve(null));
    this._helpers.then((h) => { this._h = h; this._layout(); });
  }
  set hass(h) {
    this._hass = h;
    for (const g of this._groups || []) for (const c of (g.sets[this._mode] || { cards: [] }).cards) c.hass = h;
    if (h && h.themes !== this._themes) { this._themes = h.themes; this._paintWall(); }
  }
  get hass() { return this._hass; }
  connectedCallback() { this._paintWall(); this._layout(); }

  // Wallpaper colours from the one theme key. Re-read when the theme changes.
  _paintWall() {
    if (!this.isConnected || !this._config || this._config.wallpaper === false) return;
    const base = getComputedStyle(this).getPropertyValue("--habib-base").trim() || G.PALETTE["default-base"];
    if (base === this._wallBase) return;
    this._wallBase = base;
    for (const [k, v] of Object.entries(G.derivePalette(base, "wall"))) this.style.setProperty(`--w-${k}`, v);
  }
  _card(cfg) {
    try {
      if (this._h) {
        const el = this._h.createCardElement(cfg);
        // HA asks for a rebuild when a card type is defined late or its config changes.
        el.addEventListener("ll-rebuild", (e) => { e.stopPropagation(); const n = this._card(cfg); if (this._hass) n.hass = this._hass; el.replaceWith(n); this._swap(el, n); }, { once: true });
        return el;
      }
      const el = document.createElement(String(cfg.type || "").replace(/^custom:/, ""));
      el.setConfig(cfg);
      return el;
    } catch (err) {
      const box = document.createElement("div");
      box.className = "err";
      box.textContent = `${cfg && cfg.type ? cfg.type : "card"}: ${err.message}`;
      return box;
    }
  }
  _swap(a, b) { for (const g of this._groups) for (const s of Object.values(g.sets)) { const i = s.cards.indexOf(a); if (i >= 0) s.cards[i] = b; } }
  // The cards of one group for one mode ("wide" or "compact"), built once and kept.
  _set(g, mode) {
    if (g.sets[mode]) return g.sets[mode];
    const own = mode === "compact" && Array.isArray(g.cfg.compact_cards);
    const list = own ? g.cfg.compact_cards : g.cfg.cards || [];
    const frag = document.createElement("div");
    const cards = [];
    if (list.length) {
      // Compact cards carry their own header (habib-room, hero), so the group label is for `cards`.
      if (g.cfg.label && !own) {
        const label = document.createElement("habib-label");
        label.setConfig({ type: "custom:habib-label", label: g.cfg.label, note: g.cfg.note });
        label.hass = this._hass || { states: {} };
        frag.appendChild(label);
      }
      const box = document.createElement("div");
      box.className = "cards";
      for (const cfg of list) {
        const el = this._card(cfg);
        const opt = { ...(typeof el.getGridOptions === "function" ? el.getGridOptions() : {}), ...(cfg.grid_options || {}) };
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.style.setProperty("--span", String(Math.min(12, Number(opt.columns) > 0 ? Number(opt.columns) : 12)));
        if (Number(opt.rows) > 0) { cell.classList.add("rows"); cell.style.setProperty("--rows", String(Number(opt.rows))); }
        cell.appendChild(el);
        box.appendChild(cell);
        cards.push(el);
      }
      frag.appendChild(box);
    }
    return (g.sets[mode] = { frag, cards, empty: !list.length });
  }
  _layout() {
    if (!this._groups || this._h === undefined || !this.isConnected) return;
    const top = Math.max(0, Math.round(this.getBoundingClientRect().top + window.scrollY));
    if (top !== this._top) { this._top = top; this.style.setProperty("--top", `${top}px`); }
    this._paintWall();
    const width = this.getBoundingClientRect().width;
    if (!(width > 0)) return;
    const mode = width < this._opt.compact_below ? "compact" : "wide";
    const cs = getComputedStyle(this._root);
    const inner = this._root.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const gap = parseFloat(getComputedStyle(this._grid).columnGap) || 0;
    const cols = G.columnCount(inner, { maxColumns: this._opt.max_columns, minColumn: this._opt.min_column, gap, compactBelow: 0 });
    const n = mode === "compact" ? 1 : cols;
    if (mode !== this._mode) {
      this._mode = mode;
      for (const g of this._groups) {
        const s = this._set(g, mode);
        g.inner.replaceChildren(s.frag);
        g.el.hidden = s.empty;
        if (this._hass) for (const c of s.cards) c.hass = this._hass;
      }
    }
    this._root.classList.toggle("compact", mode === "compact");
    this._root.classList.toggle("one", n === 1);
    this.style.setProperty("--cols", String(n));
    if (n === 1) {
      for (const g of this._groups) { g.el.style.gridColumn = ""; g.el.style.gridRow = ""; }
      this._placed = { cols: 1 };
    } else {
      // Heights in packing rows; hidden groups take no room.
      const heights = this._groups.map((g) => (g.el.hidden ? 0 : Math.ceil(g.inner.getBoundingClientRect().height / UNIT)));
      const packed = this._config.packing === "fluid" ? this._fluid(heights, n) : G.packGroups(heights, n, 0);
      this._groups.forEach((g, i) => {
        const p = packed.place[i];
        if (!p) return;
        g.el.style.gridColumn = String(p.col + 1);
        g.el.style.gridRow = `${p.top + 1} / span ${heights[i]}`;
      });
      this._placed = { cols: n, place: packed.place, heights, colHeights: packed.colHeights };
    }
    this._root.classList.add("ready");
  }
  // Fluid rule: assign columns fresh while the page settles (first 1.5 s after the column count
  // changes, while cards render), then keep the assignment and only restack the tops.
  _fluid(heights, n) {
    const ids = this._groups.map((g) => g.el.dataset.id);
    const meta = this._groups.map((g) => ({ with: g.cfg.with != null && ids.includes(String(g.cfg.with)) ? ids.indexOf(String(g.cfg.with)) : null,
      column: Number.isFinite(Number(g.cfg.column)) && g.cfg.column != null ? Number(g.cfg.column) : null }));
    const now = (typeof performance !== "undefined" ? performance : Date).now();
    const f = this._fluidState;
    if (!f || f.cols !== n) this._fluidState = { cols: n, until: now + B.TIME.settleMs, assign: null };
    const st = this._fluidState;
    const missing = st.assign && heights.some((h, i) => h > 0 && st.assign[i] == null);
    const keep = st.assign && now >= st.until && !missing;
    const out = G.fluidPack(heights, n, meta, keep ? st.assign : null);
    if (!keep) st.assign = out.assign;
    if (!keep && now < st.until) this._settle = this._settle || setTimeout(() => { this._settle = null; this._layout(); }, Math.max(0, st.until - now) + 50);
    return out;
  }
  getCardSize() { return 12; }
  getGridOptions() { return { columns: "full", rows: "auto" }; }
  static getStubConfig() { return { type: "custom:habib-layout", groups: [{ id: "home", label: "Home", cards: [] }] }; }
}
export const card = { tag: "habib-layout", cls: HabibLayout, name: "Habib layout (glass)", description: "Packs groups of cards into columns by its own width; phones get one column of compact cards. Paints the wallpaper from habib-base." };
