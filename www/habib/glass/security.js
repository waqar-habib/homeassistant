// glass/security.js: habib-security. Lock and garage status. NEVER calls a lock or cover service
// (D48, D60): status only, or a tap that opens Home Assistant's own dialog.
// kind: light (owner, 2026-11-19, Porch in the Home drawer): a light or switch item in the same row.
// A tap toggles it (lights are not under D48/D60); it never counts towards "All secure".
// Three or more items: the row stacks icon over name and state so all fit on a phone.
const B = await import(new URL("./base.js", import.meta.url).href.split("?")[0] + new URL(import.meta.url).search);
const { GlassCard, esc, moreInfo, haptic, usableState, switchLamps, ICONS } = B;

const OK_STATES = ["locked", "closed", "off"];
const kindOf = (it) => it.kind || (it.entity.startsWith("lock.") ? "lock" : it.entity.startsWith("cover.") ? "garage" : /^(light|switch)\./.test(it.entity) ? "light" : "door");
const iconOf = (kind, ok) => (kind === "light" ? ICONS.bulb : kind === "garage" ? (ok ? ICONS.garage : ICONS["garage-open"]) : kind === "door" ? ICONS.door : ok ? ICONS.lock : ICONS["lock-open"]);

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
    .lamp.is-on .ic, .lamp.is-on .st { color: rgb(var(--g-warm)); } .lamp.is-off .ic { color: var(--g-dim); }
    .items.three { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s-6); }
    .three .it { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto auto auto; justify-items: center; text-align: center;
      row-gap: var(--s-2); padding: var(--s-8) var(--s-4); }
    .three .ic { grid-row: auto; margin-bottom: var(--s-2); }
    .three .nm, .three .st { max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  `;
  _validate(c) {
    this._items = Array.isArray(c.items) ? c.items : [];
    if (!this._items.length) throw new Error("Set items");
  }
  _signature() { return this._sigOf(this._items.map((i) => i.entity)); }
  _setup() {
    this.shadowRoot.addEventListener("click", (e) => {
      const t = e.target.closest && e.target.closest("[data-entity]");
      if (t) { haptic(this); this._tap(t); }
    });
    this.shadowRoot.addEventListener("keydown", (e) => {
      const t = (e.key === "Enter" || e.key === " ") && e.target.closest && e.target.closest("[data-entity]");
      if (t) { e.preventDefault(); this._tap(t); }
    });
  }
  // A light item toggles; every other item opens HA's own dialog.
  _tap(t) {
    const id = t.getAttribute("data-entity");
    if (t.hasAttribute("data-toggle") && this._hass) {
      const s = this._st(id);
      if (!usableState(s)) { moreInfo(this, id); return; }
      this._begin(`l:${id}`, () => { const x = this._st(id); return x ? x.state : "-"; });
      switchLamps(this._hass, [id], s.state !== "on").catch(() => {});
      return;
    }
    moreInfo(this, id);
  }
  _read(it) {
    const s = this._st(it.entity);
    const st = s ? s.state : "missing";
    const kind = kindOf(it);
    const ok = kind === "light" || (it.ok_states || OK_STATES).includes(st);
    const dead = !usableState(s);
    const key = `l:${it.entity}`;
    const text = !s ? "Not found" : kind === "light" && this._pending(key) ? (st === "on" ? "Turning off" : "Turning on")
      : kind === "light" && this._noResponse(key) ? "No response"
      : dead ? "No response" : (it.states && it.states[st]) || st.charAt(0).toUpperCase() + st.slice(1).replace(/_/g, " ");
    return { s, ok, dead, text, kind, on: st === "on", name: it.name || (s && s.attributes.friendly_name) || it.entity };
  }
  _render() {
    let alerts = 0;
    const rows = this._items.map((it) => {
      const r = this._read(it);
      if (!r.ok && !r.dead) alerts++;
      // A tap opens HA's own dialog (owner, 2026-11-17: door and garage clickable on every dashboard).
      // tap: none makes an item status only. The card itself never calls a lock or cover service.
      const tag = it.tap === "none" ? "div" : "button";
      const lamp = r.kind === "light";
      const cls = lamp ? `lamp ${r.dead ? "is-dead" : r.on ? "is-on" : "is-off"}` : !r.s ? "is-missing" : r.dead ? "is-dead" : r.ok ? "ok" : "is-alert";
      const aria = lamp ? `aria-pressed="${r.on}" aria-label="${esc(r.name)}: ${esc(r.text)}, turn ${r.on ? "off" : "on"}" data-toggle` : `aria-label="${esc(r.name)}: ${esc(r.text)}, open controls"`;
      return `<${tag} class="it well ${tag === "button" ? "act press" : ""} ${cls}" ${tag === "button" ? `data-entity="${esc(it.entity)}" ${aria}` : ""}>
        <span class="ic">${iconOf(r.kind, r.ok)}</span><span class="nm">${esc(r.name)}</span><span class="st">${esc(r.text)}</span></${tag}>`;
    }).join("");
    this._paint(`<div class="glass ${alerts ? "alert" : ""}">
      <div class="head"><span class="shield">${alerts ? ICONS["shield-alert"] : ICONS.shield}</span>
        <div><div class="title">${alerts ? `${alerts} needs attention` : "All secure"}</div><div class="sub">${esc(this._config.subtitle || "Doors and garage")}</div></div>
        <span data-fold-slot></span></div>
      <div class="items ${this._items.length >= 3 ? "three" : ""}">${rows}</div>
    </div>`);
  }
  // Section summary line (owner, 2026-11-19: the Home line must fit a phone): "All secure" when
  // every door and garage is fine, else only the ones that need attention; a lit light adds "Porch on".
  _line() {
    const rs = this._items.map((it) => ({ it, r: this._read(it) }));
    const guards = rs.filter((x) => x.r.kind !== "light");
    const bad = guards.filter((x) => !x.r.ok || x.r.dead);
    const lit = rs.filter((x) => x.r.kind === "light" && x.r.on);
    const parts = [];
    if (guards.length) parts.push(bad.length ? bad.map((x) => `${esc(x.r.name)} <b class="${x.r.dead ? "tone-dim" : "tone-bad"}">${esc(x.r.text)}</b>`).join(" · ") : `<b class="tone-ok">All secure</b>`);
    for (const x of lit) parts.push(`${esc(x.r.name)} <b class="tone-warm">on</b>`);
    return parts.join(" · ");
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
