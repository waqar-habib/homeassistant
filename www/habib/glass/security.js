// glass/security.js: habib-security. Lock and garage status. NEVER calls a service (D48, D60):
// status only, or a tap that opens Home Assistant's own dialog.
const B = await import(new URL("./base.js", import.meta.url).href.split("?")[0] + new URL(import.meta.url).search);
const { GlassCard, esc, moreInfo, haptic, usableState, ICONS } = B;

const OK_STATES = ["locked", "closed", "off"];
const kindOf = (it) => it.kind || (it.entity.startsWith("lock.") ? "lock" : it.entity.startsWith("cover.") ? "garage" : "door");
const iconOf = (kind, ok) => (kind === "garage" ? (ok ? ICONS.garage : ICONS["garage-open"]) : kind === "door" ? ICONS.door : ok ? ICONS.lock : ICONS["lock-open"]);

export class HabibSecurity extends GlassCard {
  static css = `
    .glass { padding: var(--s-16); display: flex; flex-direction: column; gap: var(--s-12); }
    .head { display: flex; align-items: center; gap: var(--s-12); }
    .head > div { flex: 1; min-width: 0; }
    .shield { --c: var(--g-mint); width: var(--z-shield); height: var(--z-shield); border-radius: var(--r-chip); display: grid; place-items: center; flex: none;
      background: linear-gradient(145deg, rgba(var(--c), .35), rgba(var(--c), .1)); color: rgb(var(--c)); box-shadow: var(--g-glow-shield) rgba(var(--c), .7); }
    .alert .shield { --c: var(--g-rose); }
    .shield svg { width: var(--z-i-24); height: var(--z-i-24); }
    .items { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, calc(var(--z-touch) * 3)), 1fr)); gap: var(--s-8); }
    .it { display: grid; grid-template-columns: auto minmax(0, 1fr); grid-template-rows: auto auto; column-gap: var(--s-10);
      padding: var(--s-10) var(--s-12); border-radius: var(--r-item); min-height: var(--z-touch); }
    button.it { cursor: pointer; }
    .ic { grid-row: span 2; width: var(--z-i-22); height: var(--z-i-22); align-self: center; color: var(--g-dim); } .ic svg { width: 100%; height: 100%; }
    .nm { font: var(--t-label-b); } .st { font: var(--t-sub); color: var(--g-dim); }
    .ok .ic { color: rgb(var(--g-mint)); } .is-alert .ic, .is-alert .st { color: rgb(var(--g-rose)); }
  `;
  _validate(c) {
    this._items = Array.isArray(c.items) ? c.items : [];
    if (!this._items.length) throw new Error("Set items");
  }
  _signature() { return this._sigOf(this._items.map((i) => i.entity)); }
  _setup() {
    this.shadowRoot.addEventListener("click", (e) => {
      const t = e.target.closest && e.target.closest("[data-entity]");
      if (t) { haptic(this); moreInfo(this, t.getAttribute("data-entity")); }
    });
    this.shadowRoot.addEventListener("keydown", (e) => {
      const t = (e.key === "Enter" || e.key === " ") && e.target.closest && e.target.closest("[data-entity]");
      if (t) { e.preventDefault(); moreInfo(this, t.getAttribute("data-entity")); }
    });
  }
  _read(it) {
    const s = this._st(it.entity);
    const st = s ? s.state : "missing";
    const ok = (it.ok_states || OK_STATES).includes(st);
    const dead = !usableState(s);
    const text = !s ? "Not found" : dead ? "No response" : (it.states && it.states[st]) || st.charAt(0).toUpperCase() + st.slice(1).replace(/_/g, " ");
    return { s, ok, dead, text, kind: kindOf(it), name: it.name || (s && s.attributes.friendly_name) || it.entity };
  }
  _render() {
    let alerts = 0;
    const rows = this._items.map((it) => {
      const r = this._read(it);
      if (!r.ok && !r.dead) alerts++;
      // Tapping opens HA's own dialog only when the item allows it (tap: more-info). Default: status only.
      const tag = it.tap === "more-info" ? "button" : "div";
      return `<${tag} class="it well ${tag === "button" ? "act" : ""} ${!r.s ? "is-missing" : r.dead ? "is-dead" : r.ok ? "ok" : "is-alert"}" ${tag === "button" ? `data-entity="${esc(it.entity)}" aria-label="${esc(r.name)}: ${esc(r.text)}, open controls"` : ""}>
        <span class="ic">${iconOf(r.kind, r.ok)}</span><span class="nm">${esc(r.name)}</span><span class="st">${esc(r.text)}</span></${tag}>`;
    }).join("");
    this._paint(`<div class="glass ${alerts ? "alert" : ""}">
      <div class="head"><span class="shield">${alerts ? ICONS["shield-alert"] : ICONS.shield}</span>
        <div><div class="title">${alerts ? `${alerts} needs attention` : "All secure"}</div><div class="sub">${esc(this._config.subtitle || "Doors and garage")}</div></div>
        <span data-fold-slot></span></div>
      <div class="items">${rows}</div>
    </div>`);
  }
  _summary() {
    const many = this._items.length > 1;
    const parts = this._items.map((it) => {
      const r = this._read(it);
      const value = `<b class="${r.dead ? "tone-dim" : r.ok ? "tone-ok" : "tone-bad"}">${esc(r.text)}</b>`;
      return { long: many ? `${esc(it.name || it.entity)} ${value}` : value, short: value };
    });
    const label = this._config.title || (many ? "Security" : this._items[0].name || "Security");
    const out = { label, html: parts.map((p) => p.long).join(" · "), short: parts.map((p) => p.short).join(" · ") };
    if (many) return out;
    const one = this._items[0];
    const r = this._read(one);
    return { ...out, icon: iconOf(r.kind, r.ok), tone: r.ok ? "ok" : r.dead ? "" : "bad", entity: one.entity };
  }
  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }
  static getStubConfig() { return { type: "custom:habib-security", items: [] }; }
}
export const card = { tag: "habib-security", cls: HabibSecurity, name: "Habib security (glass)", description: "Lock and garage status; a tap can open Home Assistant's own dialog. Never calls a service." };
