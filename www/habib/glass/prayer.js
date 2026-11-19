// glass/prayer.js: habib-prayer. Five prayers, the next one with countdown, Adhan status (shown, never changed).
const B = await import(new URL("./base.js", import.meta.url).href.split("?")[0] + new URL(import.meta.url).search);
const A = await B.load("./art.js");
const { G, GlassCard, esc } = B;

const PRAYER_NAMES = { fajr: "Fajr", sunrise: "Sunrise", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha" };
// Wording when there is no next prayer (I57).
const STATUS_TEXT = { done: "All done today", unavailable: "Times unavailable" };

export class HabibPrayer extends GlassCard {
  static css = `
    .glass { padding: var(--s-18) var(--s-18) var(--s-14); display: flex; flex-direction: column; gap: var(--s-12); }
    .right { display: flex; align-items: center; gap: var(--s-8); }
    .label { font: var(--t-section); letter-spacing: var(--ls-section); text-transform: uppercase; }
    .next { border-radius: var(--r-panel); padding: var(--s-12) var(--s-14); background: linear-gradient(135deg, rgba(var(--g-warm), .22), var(--g-raised-lo));
      border: var(--g-hair) solid rgba(var(--g-warm), .28); }
    .hrow { display: flex; justify-content: space-between; align-items: baseline; }
    .nx { font: var(--t-label); color: var(--g-dim); } .nx b { color: rgb(var(--g-warm)); font-weight: 600; }
    .cd { font: var(--t-metric-sm); letter-spacing: var(--ls-metric-sm); }
    .bar { height: var(--z-progress-lg); border-radius: var(--r-bar); background: var(--g-track); margin-top: var(--s-10); overflow: hidden; }
    .bar span { display: block; height: 100%; border-radius: var(--r-bar); background: linear-gradient(90deg, rgba(var(--g-warm), .55), rgb(var(--g-warm)));
      box-shadow: var(--g-glow-bar) rgba(var(--g-warm), .8); }
    .list { display: flex; flex-direction: column; gap: var(--s-2); }
    .row { display: grid; grid-template-columns: var(--z-i-26) 1fr auto; align-items: center; gap: var(--s-10); padding: var(--s-6) var(--s-10); border-radius: var(--r-control); }
    .ic { width: var(--z-i-20); height: var(--z-i-20); color: var(--g-dim); } .ic svg { width: 100%; height: 100%; }
    .nm { font: var(--t-body); }
    .tm { font: var(--t-title-alt); }
    .tm small { font: var(--t-micro); color: var(--g-dim); margin-left: var(--s-2); }
    .row.minor { opacity: var(--k-minor); } .row.minor .nm, .row.minor .tm { font: var(--t-label); }
    .row.passed { opacity: var(--k-passed); }
    .row.next { background: var(--g-track); box-shadow: inset 0 0 0 var(--g-hair) rgba(var(--g-warm), .35); }
    .row.next .ic { color: rgb(var(--g-warm)); }
  `;
  _validate(c) {
    if (!c.prayers || typeof c.prayers !== "object") throw new Error("Set prayers: { fajr: sensor..., ... }");
    this._keys = G.PRAYERS.filter((k) => c.prayers[k]);
  }
  _signature() {
    const c = this._config;
    return this._sigOf([...this._keys.map((k) => c.prayers[k]), c.adhan, c.adhan_error, ...(c.adhan_automations || [])].filter(Boolean)) + "#" + Math.floor(Date.now() / 30000);
  }
  _connected() { this._tick(); }
  _tick() { this._later(() => { this._maybeRender(false); this._tick(); }, 30000); }
  _plan() {
    const times = {};
    for (const k of this._keys) {
      const s = this._st(this._config.prayers[k]);
      times[k] = s && !["unknown", "unavailable"].includes(s.state) ? new Date(s.state) : null;
    }
    return G.prayerPlan(times, new Date(), (a, b) => a.toDateString() === b.toDateString());
  }
  _summary() {
    const plan = this._plan();
    const status = G.prayerStatus(plan);
    if (status !== "next") return { label: "Prayer", html: esc(STATUS_TEXT[status]) };
    const n = plan.next;
    const t = plan.nextAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const left = esc(G.formatCountdown(plan.msLeft));
    return { label: "Prayer", progress: plan.progress,
      html: `<b>${PRAYER_NAMES[n.key]}</b> ${esc(t)} · <span class="tone-warm">${left}</span>`,
      short: `<b>${PRAYER_NAMES[n.key]}</b> · <span class="tone-warm">${left}</span>` };
  }
  _render() {
    const plan = this._plan();
    const status = G.prayerStatus(plan);
    const fmt = (d) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const rows = plan.rows.map((r) => {
      const t = r.at ? fmt(r.at) : "–";
      const [hm, ap] = t.split(/\s(?=[AP]M$)/i);
      return `<div class="row ${r.next ? "next" : ""} ${r.passed ? "passed" : ""} ${r.key === "sunrise" ? "minor" : ""}">
          <span class="ic">${A.prayerIcon(r.key)}</span><span class="nm">${PRAYER_NAMES[r.key]}</span>
          <span class="tm num">${esc(hm)}${ap ? `<small>${esc(ap)}</small>` : ""}</span></div>`;
    }).join("");
    const next = plan.next;
    this._paint(`<div class="glass">
        <div class="hd"><span class="label">Prayer Times</span>
          <span class="right" data-fold-slot>${this._badge()}</span></div>
        ${next ? `<div class="next"><div class="hrow"><span class="nx">Next · <b>${PRAYER_NAMES[next.key]}</b></span>
          <span class="cd num">${esc(G.formatCountdown(plan.msLeft))}</span></div>
          <div class="bar"><span style="width:${Math.round(plan.progress * 100)}%"></span></div></div>`
          : `<div class="sub">${esc(STATUS_TEXT[status])}</div>`}
        <div class="list">${rows}</div>
      </div>`);
  }
  // Adhan badge: on, off or error (logic G.adhanStatus). Shown, never changed.
  _badge() {
    const c = this._config;
    if (!c.adhan) return "";
    const st = (id) => { const s = this._st(id); return s ? s.state : null; };
    const status = G.adhanStatus({ gate: st(c.adhan), error: c.adhan_error ? st(c.adhan_error) : null, automations: (c.adhan_automations || []).map(st) });
    const text = { on: "Adhan on", off: "Adhan off", error: "Adhan error" }[status];
    const why = status === "error" && c.adhan_error ? st(c.adhan_error) : "";
    return `<span class="badge badge-${status}" role="status"${why ? ` title="${esc(why)}"` : ""}><i class="dot"></i>${text}</span>`;
  }
  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }
  static getStubConfig() { return { type: "custom:habib-prayer", prayers: {} }; }
}
export const card = { tag: "habib-prayer", cls: HabibPrayer, name: "Habib prayer times (glass)", description: "Five prayers, next prayer countdown and progress, Adhan status (read only)." };
