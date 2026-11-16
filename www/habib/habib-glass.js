// habib-glass: the "2026" card set for the Habib dashboards (D70).
// Glass panels over an ambient wallpaper, drawn lamps that glow in their real colour,
// a big clock and weather hero, prayer countdown, media and tasks.
// Rules kept from habib-ui: no entity IDs in JavaScript (CR1), every card registers in
// window.customCards (CR2), sizes via getGridOptions (CR3), render only when the states a
// card uses change (I44). Version lives in loader.js (CR6).
// Safety rules kept: lock and garage are status only (D48, D60); climate opens HA's own
// dialog (no setpoint calls here); Adhan helpers are shown, never changed (D34).

const search = new URL(import.meta.url).search;
const G = await import(new URL("./habib-glass-logic.js", import.meta.url).href.split("?")[0] + search);

// ---- Fonts and global tokens (fonts must live in the document, not a shadow root) ------

const FONT_ID = "habib-glass-fonts";
function injectGlobals() {
  if (document.getElementById(FONT_ID)) return;
  const base = new URL("./fonts/", import.meta.url).href.split("?")[0];
  const style = document.createElement("style");
  style.id = FONT_ID;
  style.textContent = `
    @font-face { font-family: "Habib Display"; src: url("${base}Outfit.woff2") format("woff2");
                 font-weight: 100 900; font-display: swap; }
    @font-face { font-family: "Habib Text"; src: url("${base}Inter.woff2") format("woff2");
                 font-weight: 100 900; font-display: swap; }`;
  document.head.appendChild(style);
}

const esc = (v) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const rgbStr = (a) => `${a[0]}, ${a[1]}, ${a[2]}`;

// Shared glass surface. Blur drops out where the device asks for less transparency.
const GLASS = `
  :host { display: block; height: 100%;
    --g-text: #eef4ee; --g-dim: rgba(238,244,238,.62); --g-faint: rgba(238,244,238,.38);
    --g-warm: 255, 201, 120; --g-mint: 159, 214, 181; --g-rose: 255, 138, 128;
    --g-font: "Habib Text", Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
    --g-display: "Habib Display", Outfit, "Habib Text", system-ui, sans-serif;
    --g-radius: 26px; }
  * { box-sizing: border-box; }
  .glass { position: relative; height: 100%; overflow: hidden; border-radius: var(--g-radius);
    color: var(--g-text); font-family: var(--g-font); -webkit-font-smoothing: antialiased;
    background: linear-gradient(160deg, rgba(255,255,255,.13), rgba(255,255,255,.04) 55%, rgba(255,255,255,.07));
    border: 1px solid rgba(255,255,255,.14);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.18), 0 18px 40px -18px rgba(0,0,0,.55);
    -webkit-backdrop-filter: blur(22px) saturate(150%); backdrop-filter: blur(22px) saturate(150%); }
  @media (prefers-reduced-transparency: reduce) {
    .glass { -webkit-backdrop-filter: none; backdrop-filter: none; background: rgba(30,48,38,.92); } }
  .eyebrow { font: 600 11px/14px var(--g-font); letter-spacing: .14em; text-transform: uppercase; color: var(--g-dim); }
  .title { font: 600 17px/22px var(--g-display); letter-spacing: -.01em; }
  .sub { font: 500 12px/16px var(--g-font); color: var(--g-dim); }
  button { font: inherit; color: inherit; }
  .press { transition: transform .18s cubic-bezier(.3,1.6,.4,1); }
  .press:active { transform: scale(.97); }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
`;

function registerCard(type, name, description) {
  window.customCards = window.customCards || [];
  if (!window.customCards.some((c) => c.type === type)) window.customCards.push({ type, name, description, preview: false });
}

function define(tag, cls) {
  if (!customElements.get(tag)) customElements.define(tag, cls);
}

function moreInfo(el, entityId) {
  el.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
}

function haptic(el) {
  el.dispatchEvent(new CustomEvent("haptic", { detail: "light", bubbles: true, composed: true }));
}

// ---- Base card ------------------------------------------------------------------------

class GlassCard extends HTMLElement {
  constructor() {
    super();
    this._timers = new Set();
    this._sig = null;
  }
  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("Invalid configuration");
    this._config = config;
    this._validate(config);
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
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
    this._disconnected();
  }
  _maybeRender(force) {
    if (!this._config || !this.shadowRoot || this._hold) return;
    const sig = this._signature();
    if (!force && sig === this._sig) return;
    this._sig = sig;
    this._render();
  }
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

// ---- Weather illustration --------------------------------------------------------------

function weatherSvg(condition, night, size = 96) {
  const L = G.weatherLayers(condition, night);
  const sun = L.orb === "sun" ? `
    <g class="sun"><circle cx="40" cy="38" r="15" fill="url(#sunG)"/>
      <g class="rays" stroke="#ffd98a" stroke-width="3" stroke-linecap="round" opacity=".85">
        ${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<line x1="40" y1="14" x2="40" y2="8" transform="rotate(${a} 40 38)"/>`).join("")}
      </g></g>` : "";
  const moon = L.orb === "moon" ? `
    <path d="M52 24a17 17 0 1 0 6 26 14 14 0 1 1-6-26z" fill="url(#moonG)"/>` : "";
  const cloudFill = L.dark ? "url(#cloudD)" : "url(#cloudG)";
  const cloud = L.cloud ? `
    <g class="cloud"><path d="M30 74h46a16 16 0 0 0 0-32 22 22 0 0 0-41-6A17 17 0 0 0 30 74z" fill="${cloudFill}"/>
      <path d="M30 74h46a16 16 0 0 0 9-3" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.2"/></g>` : "";
  const rain = L.rain ? `<g class="rain" stroke="#9fd0ff" stroke-width="2.4" stroke-linecap="round">
      <line x1="40" y1="80" x2="37" y2="88"/><line x1="54" y1="80" x2="51" y2="88"/><line x1="68" y1="80" x2="65" y2="88"/></g>` : "";
  const snow = L.snow ? `<g class="snow" fill="#fff"><circle cx="42" cy="84" r="2.4"/><circle cx="56" cy="88" r="2.4"/><circle cx="70" cy="84" r="2.4"/></g>` : "";
  const bolt = L.bolt ? `<path class="bolt" d="M58 70l-9 14h8l-4 12 12-17h-8l5-9z" fill="#ffd45e"/>` : "";
  const fog = L.fog ? `<g stroke="rgba(255,255,255,.6)" stroke-width="3" stroke-linecap="round"><line x1="24" y1="84" x2="80" y2="84"/><line x1="32" y1="92" x2="88" y2="92"/></g>` : "";
  return `
  <svg class="wx" viewBox="0 0 110 100" width="${size}" height="${size * 0.9}" aria-hidden="true">
    <defs>
      <radialGradient id="sunG" cx=".4" cy=".35"><stop offset="0" stop-color="#fff3c4"/><stop offset="1" stop-color="#ffb648"/></radialGradient>
      <radialGradient id="moonG" cx=".3" cy=".3"><stop offset="0" stop-color="#fffbe9"/><stop offset="1" stop-color="#d9d3bd"/></radialGradient>
      <linearGradient id="cloudG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfd9e3"/></linearGradient>
      <linearGradient id="cloudD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#aeb9c6"/><stop offset="1" stop-color="#6c7886"/></linearGradient>
    </defs>${sun}${moon}${cloud}${rain}${snow}${bolt}${fog}
  </svg>`;
}

const WX_CSS = `
  .wx { overflow: visible; filter: drop-shadow(0 10px 18px rgba(0,0,0,.25)); }
  .wx .rays { transform-origin: 40px 38px; animation: spin 40s linear infinite; }
  .wx .cloud { animation: drift 7s ease-in-out infinite alternate; }
  .wx .rain line { animation: fall 1.1s linear infinite; }
  .wx .rain line:nth-child(2) { animation-delay: .35s; } .wx .rain line:nth-child(3) { animation-delay: .7s; }
  .wx .bolt { animation: flash 3.2s infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes drift { from { transform: translateX(-2px); } to { transform: translateX(4px); } }
  @keyframes fall { 0% { transform: translateY(-4px); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(8px); opacity: 0; } }
  @keyframes flash { 0%, 86%, 100% { opacity: 1; } 90% { opacity: .2; } 94% { opacity: 1; } }
`;

// ---- A. habib-hero: clock, date, weather, people ---------------------------------------

class HabibHero extends GlassCard {
  _validate(c) {
    this._persons = Array.isArray(c.persons) ? c.persons : [];
  }
  _signature() {
    const now = new Date();
    return [this._sigOf([this._config.weather, this._config.sun].filter(Boolean), ["temperature", "apparent_temperature", "humidity"]),
      this._sigOf(this._persons.map((p) => p.entity)), now.getHours(), now.getMinutes(),
      JSON.stringify(this._forecast || null)].join("#");
  }
  _connected() {
    this._tick();
    this._subscribe();
  }
  _disconnected() {
    if (this._unsub) { this._unsub.then((u) => u && u()).catch(() => {}); this._unsub = null; }
  }
  _onFirstHass() { this._subscribe(); }
  _tick() {
    const ms = 60000 - (Date.now() % 60000) + 50;
    this._later(() => { this._maybeRender(false); this._tick(); }, ms);
  }
  _subscribe() {
    if (this._unsub || !this._hass || !this.isConnected || !this._config.weather || !this._hass.connection) return;
    try {
      this._unsub = this._hass.connection.subscribeMessage(
        (msg) => { this._forecast = (msg.forecast || [])[0] || null; this._maybeRender(false); },
        { type: "weather/subscribe_forecast", forecast_type: "daily", entity_id: this._config.weather }
      ).catch(() => null);
    } catch (e) { this._unsub = null; }
  }
  _render() {
    const now = new Date();
    const w = this._st(this._config.weather);
    const sun = this._config.sun ? this._st(this._config.sun) : null;
    const night = sun ? sun.state === "below_horizon" : now.getHours() < 6 || now.getHours() >= 18;
    const part = G.daypart(now.getHours());
    const hm = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const [clock, ampm] = hm.split(/\s(?=[AP]M$)/i);
    const date = now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });
    let hijri = "";
    try { hijri = now.toLocaleDateString("en-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { hijri = ""; }
    const unit = (w && w.attributes.temperature_unit) || "°";
    const temp = w && typeof w.attributes.temperature === "number" ? Math.round(w.attributes.temperature) : "–";
    const feels = w && typeof w.attributes.apparent_temperature === "number" ? Math.round(w.attributes.apparent_temperature) : null;
    const f = this._forecast;
    const pills = [
      feels !== null ? `Feels ${feels}°` : "",
      f && typeof f.temperature === "number" ? `H ${Math.round(f.temperature)}°` : "",
      f && typeof f.templow === "number" ? `L ${Math.round(f.templow)}°` : "",
      w && typeof w.attributes.humidity === "number" ? `${Math.round(w.attributes.humidity)}% RH` : "",
    ].filter(Boolean).map((t) => `<span class="pill">${esc(t)}</span>`).join("");
    const people = this._persons.map((p) => {
      const s = this._st(p.entity);
      const home = s && s.state === "home";
      const pic = s && s.attributes.entity_picture;
      const where = !s ? "?" : home ? "Home" : s.state === "not_home" ? "Away" : s.state;
      const initials = esc((p.name || (s && s.attributes.friendly_name) || "?").trim().charAt(0));
      return `<button class="who ${home ? "home" : "away"}" data-entity="${esc(p.entity)}" title="${esc(p.name || "")}: ${esc(where)}">
        ${pic ? `<img src="${esc(this._hass.hassUrl ? this._hass.hassUrl(pic) : pic)}" alt="">` : `<span>${initials}</span>`}
        <i></i></button>`;
    }).join("");
    this.shadowRoot.innerHTML = `
      <style>${GLASS}${WX_CSS}
        .glass { padding: 22px 22px 20px; display: flex; flex-direction: column; gap: 14px; min-height: 260px; }
        .tint { position: absolute; inset: 0; pointer-events: none; opacity: .9; }
        .dawn .tint { background: radial-gradient(120% 80% at 10% 0%, rgba(255,170,120,.30), transparent 60%); }
        .day .tint { background: radial-gradient(120% 80% at 90% 0%, rgba(255,230,160,.22), transparent 60%); }
        .dusk .tint { background: radial-gradient(120% 80% at 90% 0%, rgba(255,128,96,.28), transparent 60%), radial-gradient(90% 60% at 0% 100%, rgba(140,90,200,.20), transparent 70%); }
        .night .tint { background: radial-gradient(120% 80% at 80% 0%, rgba(120,150,255,.18), transparent 60%); }
        .top { position: relative; } .top > div { width: 100%; }
        .dl { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
        .clock { font: 200 clamp(64px, 19vw, 104px)/.92 var(--g-display); letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
        .ampm { font: 300 20px/1 var(--g-display); color: var(--g-dim); margin-left: 6px; letter-spacing: .02em; }
        .date { font: 500 17px/22px var(--g-display); margin-top: 8px; }
        .hijri { font: 500 12px/16px var(--g-font); color: var(--g-dim); margin-top: 2px; letter-spacing: .02em; }
        .people { display: flex; gap: 6px; }
        .who { all: unset; position: relative; width: 38px; height: 38px; border-radius: 50%; cursor: pointer;
          display: grid; place-items: center; font: 600 15px var(--g-display);
          background: linear-gradient(145deg, rgba(255,255,255,.28), rgba(255,255,255,.08)); border: 1px solid rgba(255,255,255,.25); }
        .who img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
        .who i { position: absolute; right: -1px; bottom: -1px; width: 11px; height: 11px; border-radius: 50%;
          border: 2px solid #23382c; background: rgb(var(--g-mint)); }
        .who.away { opacity: .6; } .who.away i { background: rgba(255,255,255,.4); }
        .wxrow { position: relative; display: flex; align-items: center; gap: 10px; margin-top: auto; cursor: pointer; }
        .wx { flex: none; }
        .temp { font: 200 56px/1 var(--g-display); letter-spacing: -.04em; }
        .temp sup { font-size: 28px; vertical-align: 26px; margin-left: 2px; }
        .cond { display: flex; flex-direction: column; gap: 6px; min-width: 0; flex: 1; }
        .cname { font: 600 18px/22px var(--g-display); }
        .pills { display: flex; flex-wrap: wrap; gap: 5px; }
        .pill { font: 500 11px/1 var(--g-font); padding: 5px 8px; border-radius: 999px; background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.12); color: var(--g-dim); white-space: nowrap; }
      </style>
      <div class="glass ${part}">
        <div class="tint"></div>
        <div class="top">
          <div>
            <div class="clock">${esc(clock)}${ampm ? `<span class="ampm">${esc(ampm)}</span>` : ""}</div>
            <div class="date">${esc(date)}</div>
            <div class="dl"><div>${hijri ? `<div class="hijri">${esc(hijri)}</div>` : ""}</div><div class="people">${people}</div></div>
          </div>
        </div>
        <div class="wxrow" ${w ? `data-entity="${esc(this._config.weather)}"` : ""}>
          ${weatherSvg(w ? w.state : "cloudy", night, 78)}
          <div class="temp">${esc(temp)}<sup>°</sup></div>
          <div class="cond"><div class="cname">${esc(w ? G.WEATHER_LABELS[w.state] || w.state : "No weather")}</div>
            <div class="pills">${pills}</div></div>
        </div>
      </div>`;
    void unit;
  }
  _setup() {
    this.shadowRoot.addEventListener("click", (e) => {
      const t = e.target.closest && e.target.closest("[data-entity]");
      if (t) moreInfo(this, t.getAttribute("data-entity"));
    });
  }
  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }
  static getStubConfig() { return { type: "custom:habib-hero", weather: "", sun: "sun.sun", persons: [] }; }
}

// ---- B. habib-prayer: five prayers, next one with countdown ----------------------------

const PRAYER_NAMES = { fajr: "Fajr", sunrise: "Sunrise", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha" };

function prayerIcon(key) {
  const s = `fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`;
  const horizon = `<line x1="3" y1="19" x2="21" y2="19"/>`;
  switch (key) {
    case "fajr": return `<svg viewBox="0 0 24 24" ${s}>${horizon}<path d="M7 19a5 5 0 0 1 10 0"/><path d="M12 6v4M9.5 8.5 12 6l2.5 2.5"/></svg>`;
    case "sunrise": return `<svg viewBox="0 0 24 24" ${s}>${horizon}<path d="M6 19a6 6 0 0 1 12 0"/><path d="M12 4v3M4.2 10.2l2 1.4M19.8 10.2l-2 1.4"/></svg>`;
    case "dhuhr": return `<svg viewBox="0 0 24 24" ${s}><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>`;
    case "asr": return `<svg viewBox="0 0 24 24" ${s}><circle cx="10" cy="10" r="3.6"/><path d="M10 3v1.6M3 10h1.6M5 5l1.1 1.1M15 5l-1.1 1.1"/><path d="M9 19h9a3.2 3.2 0 0 0 0-6.4 4.6 4.6 0 0 0-8.6 1.4A2.6 2.6 0 0 0 9 19z"/></svg>`;
    case "maghrib": return `<svg viewBox="0 0 24 24" ${s}>${horizon}<path d="M7 19a5 5 0 0 1 10 0"/><path d="M12 5v4M9.5 6.5 12 9l2.5-2.5"/></svg>`;
    default: return `<svg viewBox="0 0 24 24" ${s}><path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/><path d="M17 3.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z"/></svg>`;
  }
}

class HabibPrayer extends GlassCard {
  _validate(c) {
    if (!c.prayers || typeof c.prayers !== "object") throw new Error("Set prayers: { fajr: sensor..., ... }");
    this._keys = G.PRAYERS.filter((k) => c.prayers[k]);
  }
  _signature() {
    return this._sigOf([...this._keys.map((k) => this._config.prayers[k]), this._config.adhan].filter(Boolean)) + "#" + Math.floor(Date.now() / 30000);
  }
  _connected() { this._tick(); }
  _tick() { this._later(() => { this._maybeRender(false); this._tick(); }, 30000); }
  _render() {
    const now = new Date();
    const times = {};
    for (const k of this._keys) {
      const s = this._st(this._config.prayers[k]);
      times[k] = s && !["unknown", "unavailable"].includes(s.state) ? new Date(s.state) : null;
    }
    const sameDay = (a, b) => a.toDateString() === b.toDateString();
    const plan = G.prayerPlan(times, now, sameDay);
    const adhan = this._config.adhan ? this._st(this._config.adhan) : null;
    const fmt = (d) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const rows = plan.rows.map((r) => {
      const t = r.at ? fmt(r.at) : "–";
      const [hm, ap] = t.split(/\s(?=[AP]M$)/i);
      return `<div class="row ${r.next ? "next" : ""} ${r.passed ? "passed" : ""} ${r.key === "sunrise" ? "minor" : ""}">
          <span class="ic">${prayerIcon(r.key)}</span>
          <span class="nm">${PRAYER_NAMES[r.key]}</span>
          <span class="tm">${esc(hm)}${ap ? `<small>${esc(ap)}</small>` : ""}</span>
        </div>`;
    }).join("");
    const next = plan.next;
    this.shadowRoot.innerHTML = `
      <style>${GLASS}
        .glass { padding: 18px 18px 14px; display: flex; flex-direction: column; gap: 12px; }
        .head { display: flex; align-items: center; justify-content: space-between; }
        .label { font: 600 13px/16px "Habib Display", serif; letter-spacing: .22em; text-transform: uppercase; }
        .adhan { font: 600 11px/1 var(--g-font); padding: 6px 9px; border-radius: 999px; display: flex; gap: 6px; align-items: center;
          background: rgba(255,255,255,.10); color: var(--g-dim); }
        .adhan i { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,.35); }
        .adhan.on { color: rgb(var(--g-mint)); } .adhan.on i { background: rgb(var(--g-mint)); box-shadow: 0 0 10px rgb(var(--g-mint)); }
        .hero { border-radius: 18px; padding: 12px 14px; background: linear-gradient(135deg, rgba(var(--g-warm), .22), rgba(255,255,255,.06));
          border: 1px solid rgba(var(--g-warm), .28); }
        .hrow { display: flex; justify-content: space-between; align-items: baseline; }
        .nx { font: 500 13px var(--g-font); color: var(--g-dim); } .nx b { color: rgb(var(--g-warm)); font-weight: 600; }
        .cd { font: 300 30px/1 var(--g-display); letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
        .bar { height: 5px; border-radius: 3px; background: rgba(255,255,255,.12); margin-top: 10px; overflow: hidden; }
        .bar span { display: block; height: 100%; border-radius: 3px; background: linear-gradient(90deg, rgba(var(--g-warm), .55), rgb(var(--g-warm)));
          box-shadow: 0 0 12px rgba(var(--g-warm), .8); }
        .list { display: flex; flex-direction: column; gap: 2px; }
        .row { display: grid; grid-template-columns: 26px 1fr auto; align-items: center; gap: 10px; padding: 7px 10px; border-radius: 12px; }
        .ic { width: 20px; height: 20px; color: var(--g-dim); } .ic svg { width: 20px; height: 20px; }
        .nm { font: 500 15px var(--g-font); }
        .tm { font: 500 17px var(--g-display); font-variant-numeric: tabular-nums; }
        .tm small { font: 500 10px var(--g-font); color: var(--g-dim); margin-left: 3px; }
        .row.minor { opacity: .55; } .row.minor .nm, .row.minor .tm { font-size: 13px; }
        .row.passed { opacity: .42; }
        .row.next { background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(var(--g-warm), .35); }
        .row.next .ic { color: rgb(var(--g-warm)); }
      </style>
      <div class="glass">
        <div class="head"><span class="label">Prayer Times</span>
          ${adhan ? `<span class="adhan ${adhan.state === "on" ? "on" : ""}"><i></i>Adhan ${adhan.state === "on" ? "on" : "off"}</span>` : ""}</div>
        ${next ? `<div class="hero"><div class="hrow"><span class="nx">Next · <b>${PRAYER_NAMES[next.key]}</b></span>
          <span class="cd">${esc(G.formatCountdown(plan.msLeft))}</span></div>
          <div class="bar"><span style="width:${Math.round(plan.progress * 100)}%"></span></div></div>` : ""}
        <div class="list">${rows}</div>
      </div>`;
  }
  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }
  static getStubConfig() { return { type: "custom:habib-prayer", prayers: {} }; }
}

// ---- C. habib-light: a drawn lamp that glows in the light's own colour ----------------

function lampArt(kind, on) {
  const glow = on ? `<ellipse class="bloom" cx="60" cy="50" rx="58" ry="52" fill="url(#bloom)"/>` : "";
  const shadeFill = on ? "url(#lit)" : "url(#unlit)";
  const metal = "url(#metal)";
  switch (kind) {
    case "floor-lamp":
      return `${glow}<path class="cone" d="M44 38 L22 150 H98 L76 38z" fill="url(#cone)"/>
        <path d="M40 14h40l10 26H30z" fill="${shadeFill}"/><path d="M40 14h40l10 26H30z" fill="none" stroke="rgba(255,255,255,.25)"/>
        <rect x="58" y="40" width="4" height="98" rx="2" fill="${metal}"/><ellipse cx="60" cy="140" rx="20" ry="5" fill="${metal}"/>`;
    case "desk-lamp":
      return `${glow}<path class="cone" d="M66 46 L40 136 H112 L84 46z" fill="url(#cone)"/>
        <path d="M34 136 L46 92 L70 58" fill="none" stroke="${metal}" stroke-width="5" stroke-linecap="round"/>
        <path d="M60 50 l26 -14 l12 18 l-28 10z" fill="${shadeFill}"/><circle cx="46" cy="92" r="4" fill="#cfd6d0"/>
        <ellipse cx="38" cy="138" rx="22" ry="5" fill="${metal}"/>`;
    case "pendant":
      return `${glow}<path class="cone" d="M46 62 L18 150 H102 L74 62z" fill="url(#cone)"/>
        <line x1="60" y1="0" x2="60" y2="30" stroke="rgba(255,255,255,.5)" stroke-width="1.5"/>
        <path d="M30 62 a30 30 0 0 1 60 0z" fill="${shadeFill}"/><rect x="55" y="26" width="10" height="8" rx="2" fill="${metal}"/>
        <ellipse cx="60" cy="63" rx="9" ry="4" fill="${on ? "#fffbe8" : "#77807a"}"/>`;
    case "shelf":
      return `${glow}<rect x="20" y="16" width="80" height="124" rx="4" fill="url(#wood)"/>
        <rect x="26" y="22" width="68" height="34" fill="rgba(0,0,0,.25)"/><rect x="26" y="62" width="68" height="34" fill="rgba(0,0,0,.25)"/><rect x="26" y="102" width="68" height="32" fill="rgba(0,0,0,.25)"/>
        <rect x="26" y="22" width="68" height="3" fill="${on ? "url(#strip)" : "rgba(255,255,255,.15)"}"/>
        <rect x="26" y="62" width="68" height="3" fill="${on ? "url(#strip)" : "rgba(255,255,255,.15)"}"/>
        <g fill-opacity=".95">${[[30, "#c9785b"], [38, "#e2c590"], [45, "#7b9c84"], [53, "#d8d2c4"], [62, "#9a6f5a"]].map(([x, c], i) => `<rect x="${x}" y="${32 + (i % 2) * 3}" width="${i === 3 ? 9 : 7}" height="${24 - (i % 2) * 3}" rx="1" fill="${c}"/>`).join("")}
          ${[[34, "#e0b07c"], [42, "#6f8fa8"], [50, "#cfa7a0"], [74, "#e2c590"], [82, "#7b9c84"]].map(([x, c], i) => `<rect x="${x}" y="${70 + (i % 2) * 4}" width="7" height="${26 - (i % 2) * 4}" rx="1" fill="${c}"/>`).join("")}
          <circle cx="80" cy="118" r="9" fill="#7b9c84"/><rect x="34" y="112" width="26" height="22" rx="3" fill="#d8d2c4"/></g>
        ${on ? `<rect x="26" y="25" width="68" height="31" fill="url(#wash)"/><rect x="26" y="65" width="68" height="31" fill="url(#wash)"/>` : ""}`;
    case "nightlight":
      return `${glow}<ellipse cx="60" cy="136" rx="30" ry="6" fill="rgba(0,0,0,.3)"/>
        <path d="M30 132 a30 34 0 0 1 60 0z" fill="${shadeFill}"/><path d="M30 132 a30 34 0 0 1 60 0" fill="none" stroke="rgba(255,255,255,.35)"/>
        <rect x="28" y="130" width="64" height="8" rx="4" fill="url(#wood)"/>`;
    case "coach":
      return `${glow}<rect x="22" y="40" width="10" height="70" rx="3" fill="${metal}"/><path d="M32 60h14" stroke="${metal}" stroke-width="4"/>
        <path d="M46 44h40l-6 -12h-28z" fill="#2c3330"/><rect x="50" y="44" width="32" height="54" rx="3" fill="${shadeFill}"/>
        <path d="M50 44v54M66 44v54M82 44v54" stroke="#2c3330" stroke-width="3"/><path d="M46 98h40l-4 8h-32z" fill="#2c3330"/>`;
    case "group":
      return `${glow}${[30, 60, 90].map((x, i) => `
        <line x1="${x}" y1="0" x2="${x}" y2="${36 + (i % 2) * 18}" stroke="rgba(255,255,255,.45)" stroke-width="1.3"/>
        <path d="M${x - 14} ${56 + (i % 2) * 18} a14 14 0 0 1 28 0z" fill="url(#${on ? `g${i}` : "unlit"})"/>
        <ellipse cx="${x}" cy="${57 + (i % 2) * 18}" rx="5" ry="2.4" fill="url(#${on ? `g${i}` : "unlit"})"/>`).join("")}`;
    default: // table-lamp
      return `${glow}<path class="cone" d="M42 64 L20 146 H100 L78 64z" fill="url(#cone)"/>
        <path d="M42 22h36l14 42H28z" fill="${shadeFill}"/><path d="M42 22h36l14 42H28z" fill="none" stroke="rgba(255,255,255,.25)"/>
        <path d="M54 64h12l4 46a10 10 0 0 1-20 0z" fill="url(#ceramic)"/><ellipse cx="60" cy="122" rx="22" ry="6" fill="url(#ceramic)"/>`;
  }
}

function lampSvg(kind, glow, groupLit) {
  const on = glow.on > 0;
  const c = rgbStr(G.glowRgb(glow.rgb));
  const a = glow.level;
  const stops = (i) => {
    const lit = on && i < groupLit;
    return lit ? `<stop offset="0" stop-color="#fffdf2"/><stop offset="1" stop-color="rgb(${c})"/>` : `<stop offset="0" stop-color="#5d665f"/><stop offset="1" stop-color="#3b433e"/>`;
  };
  return `<svg class="art" viewBox="0 0 120 150" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
    <defs>
      <radialGradient id="bloom" cx=".5" cy=".42" r=".5"><stop offset="0" stop-color="rgb(${c})" stop-opacity="${0.75 * a}"/><stop offset="1" stop-color="rgb(${c})" stop-opacity="0"/></radialGradient>
      <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(${c})" stop-opacity="${on ? 0.42 * a : 0}"/><stop offset="1" stop-color="rgb(${c})" stop-opacity="0"/></linearGradient>
      <linearGradient id="lit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="rgb(${c})"/></linearGradient>
      <linearGradient id="unlit" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6f7a73"/><stop offset="1" stop-color="#3c4540"/></linearGradient>
      <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6d746f"/><stop offset=".5" stop-color="#d4dad5"/><stop offset="1" stop-color="#5d635f"/></linearGradient>
      <linearGradient id="ceramic" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b9b2a5"/><stop offset=".45" stop-color="#f1ece2"/><stop offset="1" stop-color="#9c9588"/></linearGradient>
      <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a77b58"/><stop offset="1" stop-color="#6e4b33"/></linearGradient>
      <linearGradient id="strip" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgb(${c})" stop-opacity=".6"/><stop offset=".5" stop-color="#fffbe8"/><stop offset="1" stop-color="rgb(${c})" stop-opacity=".6"/></linearGradient>
      <linearGradient id="wash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(${c})" stop-opacity="${0.45 * a}"/><stop offset="1" stop-color="rgb(${c})" stop-opacity="0"/></linearGradient>
      <linearGradient id="g0" x1="0" y1="0" x2="0" y2="1">${stops(0)}</linearGradient>
      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">${stops(1)}</linearGradient>
      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">${stops(2)}</linearGradient>
    </defs>${lampArt(kind, on)}</svg>`;
}

const SWATCHES = [
  { k: 2200, label: "Candle" }, { k: 2700, label: "Warm" }, { k: 4000, label: "Neutral" }, { k: 6000, label: "Daylight" },
  { rgb: [255, 120, 90] }, { rgb: [255, 190, 70] }, { rgb: [120, 220, 140] }, { rgb: [90, 160, 255] }, { rgb: [190, 120, 255] }, { rgb: [255, 110, 190] },
];

class HabibLight extends GlassCard {
  _validate(c) {
    const ids = Array.isArray(c.entities) ? c.entities : c.entity ? [c.entity] : [];
    if (!ids.length) throw new Error("Set entities");
    this._ids = ids.map(String);
    this._wide = c.size === "wide";
  }
  _signature() {
    return this._sigOf(this._ids, ["brightness", "rgb_color", "color_temp_kelvin", "color_mode"]) + `|${this._pending ? 1 : 0}`;
  }
  _usable() { return this._ids.filter((id) => { const s = this._st(id); return s && !["unavailable", "unknown"].includes(s.state); }); }
  _dimmable() {
    return this._usable().filter((id) => { const m = this._st(id).attributes.supported_color_modes || []; return m.length && !(m.length === 1 && m[0] === "onoff"); });
  }
  _colorable() {
    return this._usable().filter((id) => (this._st(id).attributes.supported_color_modes || []).some((m) => ["hs", "rgb", "rgbw", "rgbww", "xy"].includes(m)));
  }
  _render() {
    const cfg = this._config;
    const glow = G.lightGlow(this._hass.states, this._ids);
    const usable = this._usable();
    const missing = this._ids.filter((id) => !this._st(id));
    const dead = !usable.length;
    const on = glow.on > 0;
    const group = this._ids.length > 1;
    const kind = cfg.art || (group ? "group" : "table-lamp");
    const groupLit = group ? Math.ceil((glow.on / Math.max(1, glow.total)) * 3) : 3;
    const state = missing.length === this._ids.length ? "Not found" : dead ? "No response" : this._pending ? "…" :
      group ? (on ? `${glow.on} of ${glow.total} on` : "All off") : on ? (this._dimmable().length ? `${glow.pct}%` : "On") : "Off";
    const dim = this._dimmable().length > 0;
    const c = rgbStr(G.glowRgb(glow.rgb));
    this.shadowRoot.innerHTML = `
      <style>${GLASS}
        .glass { display: flex; flex-direction: column; padding: 14px 14px 12px; cursor: pointer; min-height: 232px;
          -webkit-tap-highlight-color: transparent; user-select: none; -webkit-user-select: none; transition: box-shadow .4s, border-color .4s; }
        .glass.on { border-color: rgba(${c}, .45);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.22), 0 18px 46px -16px rgba(${c}, .55); }
        .glass.on::before { content: ""; position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(90% 60% at 50% 38%, rgba(${c}, ${0.22 * glow.level}), transparent 70%); }
        .glass.dead { opacity: .5; cursor: default; }
        .head { position: relative; display: flex; flex-direction: column; gap: 3px; z-index: 1; }
        .title { overflow-wrap: normal; word-break: normal; hyphens: auto; }
        .state { font: 600 12px/16px var(--g-font); color: var(--g-dim); display: flex; align-items: center; gap: 6px; }
        .state i { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,.3); }
        .on .state { color: rgba(${c}, 1); filter: brightness(1.25); }
        .on .state i { background: rgb(${c}); box-shadow: 0 0 10px rgb(${c}); }
        .stage { position: relative; flex: 1; min-height: 110px; display: flex; justify-content: center; align-items: flex-end; margin: 4px 0 10px; }
        .art { height: 100%; max-height: 150px; width: auto; max-width: 100%; overflow: visible; transition: filter .4s; }
        .glass:not(.on) .art { filter: saturate(.6) brightness(.9); }
        .bloom { animation: breathe 5s ease-in-out infinite; transform-origin: 60px 50px; }
        @keyframes breathe { 50% { opacity: .82; } }
        .slider { position: relative; height: 34px; border-radius: 12px; background: rgba(0,0,0,.22);
          border: 1px solid rgba(255,255,255,.10); overflow: hidden; touch-action: none; cursor: ew-resize; z-index: 1; }
        .fill { position: absolute; inset: 0 auto 0 0; border-radius: 12px;
          background: linear-gradient(90deg, rgba(${c}, .35), rgba(${c}, .9)); box-shadow: 0 0 18px rgba(${c}, .5); }
        .glass:not(.on) .fill { background: rgba(255,255,255,.08); box-shadow: none; }
        .knob { position: absolute; top: 7px; bottom: 7px; width: 4px; border-radius: 2px; background: #fff; margin-left: -10px; opacity: .9; }
        .pct { position: absolute; left: 12px; top: 0; bottom: 0; display: flex; align-items: center; gap: 6px;
          font: 600 12px var(--g-font); color: rgba(255,255,255,.9); pointer-events: none; }
        .pct svg { width: 14px; height: 14px; }
        .more { position: absolute; right: 8px; top: 0; bottom: 0; display: flex; align-items: center; }
        .dots { all: unset; width: 26px; height: 26px; border-radius: 8px; display: grid; place-items: center; cursor: pointer; color: rgba(255,255,255,.85); }
        .dots:active { background: rgba(255,255,255,.15); }
        .glass.wide { min-height: 0; padding: 14px 16px; }
        .wide .body { display: grid; grid-template-columns: 40% 1fr; gap: 14px; flex: 1; min-height: 0; }
        .wide .stage { min-height: 0; height: 100%; }
        .wide .art { max-height: 150px; }
        .wide .stage { margin: 0; }
        .wide .right { display: flex; flex-direction: column; justify-content: space-between; gap: 10px; }
        .err { font: 500 11px var(--g-font); color: rgb(var(--g-rose)); margin-top: 4px; }
      </style>
      <div class="glass press ${on ? "on" : ""} ${dead ? "dead" : ""} ${this._wide ? "wide" : ""}" role="button" tabindex="0"
        aria-pressed="${on}" aria-label="${esc(cfg.name || "Light")}: ${esc(state)}">
        ${this._wide ? `<div class="body"><div class="stage">${lampSvg(kind, glow, groupLit)}</div><div class="right">${this._headHtml(cfg, state, missing)}${dim ? this._sliderHtml(glow) : ""}</div></div>`
          : `${this._headHtml(cfg, state, missing)}<div class="stage">${lampSvg(kind, glow, groupLit)}</div>${dim ? this._sliderHtml(glow) : ""}`}
      </div>`;
  }
  _headHtml(cfg, state, missing) {
    return `<div class="head"><div class="title">${esc(cfg.name || "")}</div>
      <span class="state"><i></i>${esc(state)}${cfg.room ? ` · ${esc(cfg.room)}` : ""}</span>
      ${missing.length && missing.length < this._ids.length ? `<div class="err">Missing: ${esc(missing.join(", "))}</div>` : ""}</div>`;
  }
  _sliderHtml(glow) {
    const pct = glow.on ? glow.pct : 0;
    return `<div class="slider" data-slider aria-label="Brightness" role="slider" aria-valuemin="1" aria-valuemax="100" aria-valuenow="${pct}">
      <div class="fill" style="width:${Math.max(pct, 0)}%"></div><div class="knob" style="left:${Math.max(pct, 6)}%;${glow.on ? "" : "opacity:0"}"></div>
      <div class="pct"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
        <span data-pct>${glow.on ? `${pct}%` : "Off"}</span></div>
      <div class="more"><button class="dots" data-more aria-label="Colour and details" type="button">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></button></div>
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
    root.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); this._toggle(); } });
    root.addEventListener("pointerdown", (e) => {
      const slider = e.target.closest && e.target.closest("[data-slider]");
      if (!slider || (e.target.closest && e.target.closest("[data-more]"))) return;
      e.stopPropagation();
      slider.setPointerCapture(e.pointerId);
      this._hold = true;
      this._dragged = false;
      const startX = e.clientX;
      const rect = slider.getBoundingClientRect();
      const fill = slider.querySelector(".fill");
      const knob = slider.querySelector(".knob");
      const label = slider.querySelector("[data-pct]");
      let pct = null;
      const set = (x) => {
        pct = Math.round(Math.min(100, Math.max(1, ((x - rect.left) / rect.width) * 100)));
        fill.style.width = `${pct}%`;
        knob.style.left = `${Math.max(pct, 6)}%`;
        knob.style.opacity = ".9";
        label.textContent = `${pct}%`;
      };
      const move = (ev) => { if (Math.abs(ev.clientX - startX) > 3) this._dragged = true; set(ev.clientX); };
      const up = (ev) => {
        slider.removeEventListener("pointermove", move);
        slider.removeEventListener("pointerup", up);
        slider.removeEventListener("pointercancel", up);
        if (ev.type === "pointerup") set(ev.clientX);
        this._dragged = true;
        this._hold = false;
        if (pct !== null) this._setBrightness(pct);
        this._later(() => { this._dragged = false; }, 50);
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
    this._pending = true;
    this._maybeRender(true);
    this._later(() => { this._pending = false; this._maybeRender(true); }, 2500);
    this._hass.callService("light", anyOn ? "turn_off" : "turn_on", {}, { entity_id: usable })
      .catch(() => {}).finally(() => { this._pending = false; this._maybeRender(true); });
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
    const host = document.createElement("div");
    const root = host.attachShadow({ mode: "open" });
    const sw = SWATCHES.filter((s) => s.k || colorIds.length).map((s, i) => {
      const rgb = s.k ? G.kelvinToRgb(s.k) : s.rgb;
      return `<button class="sw" data-i="${i}" style="--c: ${rgbStr(rgb)}" aria-label="${esc(s.label || `Colour ${i}`)}"></button>`;
    }).join("");
    root.innerHTML = `<style>${GLASS}
      .scrim { position: fixed; inset: 0; z-index: 9999; background: rgba(4,10,7,.45); display: flex; align-items: flex-end; justify-content: center;
        animation: fade .2s ease; }
      .sheet { width: 100%; max-width: 560px; padding: 10px 22px calc(26px + env(safe-area-inset-bottom, 0px));
        border-radius: 30px 30px 0 0; color: var(--g-text); font-family: var(--g-font);
        background: linear-gradient(170deg, rgba(58,84,68,.88), rgba(24,38,30,.94)); border: 1px solid rgba(255,255,255,.14);
        -webkit-backdrop-filter: blur(30px) saturate(160%); backdrop-filter: blur(30px) saturate(160%);
        animation: up .32s cubic-bezier(.2,1.2,.3,1); }
      .handle { width: 38px; height: 5px; border-radius: 3px; background: rgba(255,255,255,.35); margin: 0 auto 16px; }
      .row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
      .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
      .sw { all: unset; aspect-ratio: 1; border-radius: 50%; cursor: pointer; background: radial-gradient(circle at 35% 30%, #fff, rgb(var(--c)) 60%);
        box-shadow: 0 6px 18px -4px rgba(var(--c), .8), inset 0 0 0 1px rgba(255,255,255,.4); transition: transform .15s; }
      .sw:active { transform: scale(.9); }
      .lab { font: 600 11px var(--g-font); letter-spacing: .14em; text-transform: uppercase; color: var(--g-dim); margin: 18px 0 10px; }
      .done { all: unset; cursor: pointer; padding: 10px 16px; border-radius: 999px; background: rgba(255,255,255,.14); font: 600 14px var(--g-font); }
      .info { all: unset; cursor: pointer; font: 500 13px var(--g-font); color: var(--g-dim); margin-top: 18px; display: block; text-align: center; }
      @keyframes up { from { transform: translateY(100%); } } @keyframes fade { from { opacity: 0; } }
    </style>
    <div class="scrim"><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(this._config.name || "Light")}">
      <div class="handle"></div>
      <div class="row"><span class="title">${esc(this._config.name || "Light")}</span><button class="done">Done</button></div>
      <div class="lab">${colorIds.length ? "White and colour" : "White"}</div>
      <div class="grid">${sw}</div>
      <button class="info">Open full controls</button>
    </div></div>`;
    const close = () => { host.remove(); document.removeEventListener("keydown", onKey, true); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey, true);
    root.querySelector(".scrim").addEventListener("click", (e) => { if (e.target.classList.contains("scrim")) close(); });
    root.querySelector(".done").addEventListener("click", close);
    root.querySelector(".info").addEventListener("click", () => { close(); moreInfo(this, this._ids[0]); });
    const list = SWATCHES.filter((s) => s.k || colorIds.length);
    root.querySelectorAll(".sw").forEach((b) => b.addEventListener("click", () => {
      const s = list[Number(b.dataset.i)];
      haptic(this);
      if (s.k) {
        const temps = ids.filter((id) => (this._st(id).attributes.supported_color_modes || []).includes("color_temp"));
        if (temps.length) this._hass.callService("light", "turn_on", { color_temp_kelvin: s.k }, { entity_id: temps });
      } else {
        this._hass.callService("light", "turn_on", { rgb_color: s.rgb }, { entity_id: colorIds });
      }
    }));
    document.body.appendChild(host);
  }
  getCardSize() { return 4; }
  getGridOptions() {
    return this._wide ? { columns: 12, rows: 3, min_columns: 6, min_rows: 3 } : { columns: 6, rows: 4, min_columns: 4, min_rows: 3 };
  }
  static getStubConfig(hass, entities) {
    const first = (entities || []).find((e) => e.startsWith("light."));
    return { type: "custom:habib-light", name: "Lamp", art: "table-lamp", entities: first ? [first] : [] };
  }
}

// ---- D. habib-climate: indoor temperatures with a range arc (opens HA's dialog) --------

class HabibClimate extends GlassCard {
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
      if (!s) return `<div class="t"><div class="sub">Not found</div></div>`;
      const a = s.attributes;
      const cur = typeof a.current_temperature === "number" ? a.current_temperature : null;
      const lo = a.target_temp_low ?? (s.state === "heat" ? a.temperature : null);
      const hi = a.target_temp_high ?? (s.state === "cool" ? a.temperature : null);
      const min = a.min_temp ?? 50, max = a.max_temp ?? 90;
      const pos = (v) => Math.min(1, Math.max(0, (v - min) / (max - min)));
      // 240-degree arc.
      const R = 42, C = 2 * Math.PI * R, ARC = C * (240 / 360);
      const seg = (from, to) => `stroke-dasharray="${Math.max(0, (to - from) * ARC)} ${C}" stroke-dashoffset="${-from * ARC}"`;
      const mode = { heat_cool: "Auto", heat: "Heating", cool: "Cooling", off: "Off", auto: "Auto", dry: "Dry", fan_only: "Fan" }[s.state] || s.state;
      const action = a.hvac_action ? { heating: "Heating now", cooling: "Cooling now", idle: "Idle", off: "Off" }[a.hvac_action] || a.hvac_action : "";
      const range = lo != null && hi != null ? `${Math.round(lo)}–${Math.round(hi)}°` : lo != null ? `${Math.round(lo)}°` : hi != null ? `${Math.round(hi)}°` : "";
      const curPos = cur != null ? pos(cur) : null;
      const ang = curPos != null ? (150 + 240 * curPos) * (Math.PI / 180) : 0;
      return `<button class="t press" data-entity="${esc(it.entity)}" aria-label="${esc(it.name || a.friendly_name)} ${cur ?? ""} degrees">
        <svg viewBox="0 0 100 100" class="dial" aria-hidden="true">
          <defs><linearGradient id="rg" x1="0" x2="1"><stop offset="0" stop-color="#ffb36b"/><stop offset="1" stop-color="#8fc9ff"/></linearGradient></defs>
          <g transform="rotate(150 50 50)">
            <circle cx="50" cy="50" r="${R}" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="7" stroke-linecap="round" stroke-dasharray="${ARC} ${C}"/>
            ${lo != null && hi != null ? `<circle cx="50" cy="50" r="${R}" fill="none" stroke="url(#rg)" stroke-width="7" stroke-linecap="round" ${seg(pos(lo), pos(hi))}/>` : ""}
          </g>
          ${curPos != null ? `<circle cx="${50 + R * Math.cos(ang)}" cy="${50 + R * Math.sin(ang)}" r="5.5" fill="#fff" stroke="rgba(0,0,0,.25)"/>` : ""}
        </svg>
        <div class="mid"><div class="cur">${cur != null ? Math.round(cur) : "–"}<sup>°</sup></div><div class="rng">${esc(range)}</div></div>
        <div class="foot"><div class="title">${esc(it.name || a.friendly_name)}</div><div class="sub">${esc(action || mode)}</div></div>
      </button>`;
    }).join("");
    this.shadowRoot.innerHTML = `<style>${GLASS}
      .glass { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
      .grid { display: grid; grid-template-columns: repeat(${this._items.length}, 1fr); gap: 10px; flex: 1; }
      .t { all: unset; position: relative; cursor: pointer; border-radius: 20px; padding: 10px 10px 12px; background: rgba(0,0,0,.14);
        border: 1px solid rgba(255,255,255,.08); display: flex; flex-direction: column; align-items: center; }
      .dial { width: 100%; max-width: 132px; aspect-ratio: 1; }
      .mid { position: absolute; top: 10px; left: 0; right: 0; aspect-ratio: auto; height: min(132px, calc(100% - 60px)); display: flex; flex-direction: column;
        align-items: center; justify-content: center; pointer-events: none; }
      .cur { font: 200 40px/1 var(--g-display); letter-spacing: -.03em; } .cur sup { font-size: 18px; vertical-align: 18px; }
      .rng { font: 600 11px var(--g-font); color: var(--g-dim); margin-top: 4px; }
      .foot { text-align: center; margin-top: -6px; } .title { font-size: 15px; }
    </style>
    <div class="glass"><div class="eyebrow">Climate</div><div class="grid">${tiles}</div></div>`;
  }
  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }
  static getStubConfig() { return { type: "custom:habib-climate", entities: [] }; }
}

// ---- E. habib-security: lock and garage status (never calls a service, D48 and D60) ----

function secIcon(kind, ok) {
  const s = `fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`;
  if (kind === "garage") {
    return ok ? `<svg viewBox="0 0 24 24" ${s}><path d="M3 10 12 4l9 6v10H3z"/><path d="M6.5 20v-8h11v8M6.5 14.5h11M6.5 17h11"/></svg>`
      : `<svg viewBox="0 0 24 24" ${s}><path d="M3 10 12 4l9 6v10H3z"/><path d="M6.5 20v-8h11v8M6.5 14.5h11"/></svg>`;
  }
  if (kind === "door") return `<svg viewBox="0 0 24 24" ${s}><path d="M6 21V4h12v17M3 21h18"/><circle cx="14.5" cy="12.5" r="1" fill="currentColor"/></svg>`;
  return ok ? `<svg viewBox="0 0 24 24" ${s}><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><circle cx="12" cy="15.5" r="1.3" fill="currentColor"/></svg>`
    : `<svg viewBox="0 0 24 24" ${s}><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 7.6-1.8"/><circle cx="12" cy="15.5" r="1.3" fill="currentColor"/></svg>`;
}

class HabibSecurity extends GlassCard {
  _validate(c) {
    this._items = Array.isArray(c.items) ? c.items : [];
    if (!this._items.length) throw new Error("Set items");
  }
  _signature() { return this._sigOf(this._items.map((i) => i.entity)); }
  _setup() {
    this.shadowRoot.addEventListener("click", (e) => {
      const t = e.target.closest && e.target.closest("[data-entity]");
      if (t) moreInfo(this, t.getAttribute("data-entity"));
    });
  }
  _render() {
    let alerts = 0;
    const rows = this._items.map((it) => {
      const s = this._st(it.entity);
      const st = s ? s.state : "missing";
      const okStates = it.ok_states || ["locked", "closed", "off"];
      const ok = okStates.includes(st);
      const dead = !s || ["unavailable", "unknown"].includes(st);
      if (!ok && !dead) alerts++;
      const text = !s ? "Not found" : dead ? "No response" : (it.states && it.states[st]) || st.charAt(0).toUpperCase() + st.slice(1).replace(/_/g, " ");
      const kind = it.kind || (it.entity.startsWith("lock.") ? "lock" : it.entity.startsWith("cover.") ? "garage" : "door");
      // Tapping opens HA's own dialog only when the item allows it (tap: more-info). Default: status only.
      const tag = it.tap === "more-info" ? "button" : "div";
      return `<${tag} class="it ${dead ? "dead" : ok ? "ok" : "warn"}" ${tag === "button" ? `data-entity="${esc(it.entity)}"` : ""}>
        <span class="ic">${secIcon(kind, ok)}</span><span class="nm">${esc(it.name || (s && s.attributes.friendly_name) || it.entity)}</span>
        <span class="st">${esc(text)}</span></${tag}>`;
    }).join("");
    this.shadowRoot.innerHTML = `<style>${GLASS}
      .glass { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
      .head { display: flex; align-items: center; gap: 12px; }
      .shield { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; flex: none;
        background: linear-gradient(145deg, rgba(var(--g-mint), .35), rgba(var(--g-mint), .1)); color: rgb(var(--g-mint)); box-shadow: 0 0 24px -6px rgba(var(--g-mint), .7); }
      .alert .shield { background: linear-gradient(145deg, rgba(var(--g-rose), .45), rgba(var(--g-rose), .12)); color: rgb(var(--g-rose)); box-shadow: 0 0 24px -4px rgba(var(--g-rose), .8); }
      .shield svg { width: 24px; height: 24px; }
      .items { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; }
      .it { all: unset; display: grid; grid-template-columns: 22px 1fr; grid-template-rows: auto auto; column-gap: 10px; padding: 10px 12px;
        border-radius: 16px; background: rgba(0,0,0,.14); border: 1px solid rgba(255,255,255,.07); }
      button.it { cursor: pointer; }
      .ic { grid-row: span 2; width: 22px; height: 22px; align-self: center; } .ic svg { width: 22px; height: 22px; }
      .nm { font: 600 13px var(--g-font); } .st { font: 500 12px var(--g-font); color: var(--g-dim); }
      .ok .ic { color: rgb(var(--g-mint)); } .warn .ic, .warn .st { color: rgb(var(--g-rose)); } .warn { border-color: rgba(var(--g-rose), .4); }
      .dead { opacity: .5; }
    </style>
    <div class="glass ${alerts ? "alert" : ""}">
      <div class="head"><span class="shield"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6z"/>${alerts ? `<path d="M12 8v5M12 16v.5" stroke-linecap="round"/>` : `<path d="m8.5 12 2.4 2.4 4.6-4.8" stroke-linecap="round"/>`}</svg></span>
        <div><div class="title">${alerts ? `${alerts} needs attention` : "All secure"}</div><div class="sub">${esc(this._config.subtitle || "Doors and garage")}</div></div></div>
      <div class="items">${rows}</div>
    </div>`;
  }
  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }
  static getStubConfig() { return { type: "custom:habib-security", items: [] }; }
}

// ---- F. habib-media: HomePods with album art or a spinning record ----------------------

const ICON = {
  play: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="5" width="4" height="14" rx="1.3"/><rect x="13.5" y="5" width="4" height="14" rx="1.3"/></svg>`,
  next: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 6.3v11.4a.8.8 0 0 0 1.2.7l8.6-5.7a.8.8 0 0 0 0-1.4L6.2 5.6A.8.8 0 0 0 5 6.3z"/><rect x="16.5" y="5.5" width="2.5" height="13" rx="1"/></svg>`,
  prev: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.3v11.4a.8.8 0 0 1-1.2.7l-8.6-5.7a.8.8 0 0 1 0-1.4l8.6-5.7a.8.8 0 0 1 1.2.7z"/><rect x="5" y="5.5" width="2.5" height="13" rx="1"/></svg>`,
  vol: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>`,
};

class HabibMedia extends GlassCard {
  _validate(c) {
    this._players = (Array.isArray(c.players) ? c.players : []).map((p) => (typeof p === "string" ? { entity: p } : p));
    if (!this._players.length) throw new Error("Set players");
    this._sel = this._sel && this._players.some((p) => p.entity === this._sel) ? this._sel : null;
  }
  _active() {
    if (this._sel) return this._sel;
    const playing = this._players.find((p) => { const s = this._st(p.entity); return s && s.state === "playing"; });
    return (playing || this._players[0]).entity;
  }
  _signature() {
    return this._sigOf(this._players.map((p) => p.entity), ["media_title", "media_artist", "entity_picture", "volume_level", "is_volume_muted"]) + `|${this._sel}`;
  }
  _setup() {
    const root = this.shadowRoot;
    root.addEventListener("click", (e) => {
      const b = e.target.closest && e.target.closest("[data-act],[data-pick]");
      if (!b || !this._hass) return;
      if (b.dataset.pick) { this._sel = b.dataset.pick; this._maybeRender(true); return; }
      const id = this._active();
      haptic(this);
      const svc = { play: "media_play_pause", next: "media_next_track", prev: "media_previous_track" }[b.dataset.act];
      if (svc) this._hass.callService("media_player", svc, {}, { entity_id: id }).catch(() => {});
    });
    root.addEventListener("change", (e) => {
      if (e.target.matches && e.target.matches("input[type=range]") && this._hass) {
        this._hass.callService("media_player", "volume_set", { volume_level: Number(e.target.value) / 100 }, { entity_id: this._active() }).catch(() => {});
      }
    });
    root.addEventListener("pointerdown", (e) => { if (e.target.matches && e.target.matches("input[type=range]")) this._hold = true; });
    root.addEventListener("pointerup", () => { if (this._hold) { this._hold = false; this._later(() => this._maybeRender(true), 400); } });
  }
  _render() {
    const id = this._active();
    const s = this._st(id);
    const a = (s && s.attributes) || {};
    const playing = s && s.state === "playing";
    const dead = !s || ["unavailable", "unknown"].includes(s.state);
    const pic = a.entity_picture ? (this._hass.hassUrl ? this._hass.hassUrl(a.entity_picture) : a.entity_picture) : null;
    const title = dead ? "Unavailable" : a.media_title || (s.state === "off" ? "Off" : "Nothing playing");
    const artist = !dead && a.media_title ? a.media_artist || a.app_name || "" : "";
    const vol = typeof a.volume_level === "number" ? Math.round(a.volume_level * 100) : 0;
    const tabs = this._players.length > 1 ? `<div class="tabs">${this._players.map((p) => {
      const ps = this._st(p.entity);
      return `<button class="tab ${p.entity === id ? "sel" : ""}" data-pick="${esc(p.entity)}">${ps && ps.state === "playing" ? "<i></i>" : ""}${esc(p.name || (ps && ps.attributes.friendly_name) || p.entity)}</button>`;
    }).join("")}</div>` : "";
    this.shadowRoot.innerHTML = `<style>${GLASS}
      .glass { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
      .tabs { display: flex; gap: 6px; flex-wrap: wrap; }
      .tab { all: unset; cursor: pointer; font: 600 12px var(--g-font); padding: 7px 11px; border-radius: 999px; color: var(--g-dim);
        background: rgba(255,255,255,.07); display: flex; align-items: center; gap: 6px; }
      .tab.sel { background: rgba(255,255,255,.18); color: var(--g-text); }
      .tab i { width: 6px; height: 6px; border-radius: 50%; background: rgb(var(--g-mint)); box-shadow: 0 0 8px rgb(var(--g-mint)); }
      .main { display: grid; grid-template-columns: 112px 1fr; gap: 16px; align-items: center; }
      .disc { position: relative; width: 112px; height: 112px; }
      .vinyl { width: 112px; height: 112px; border-radius: 50%;
        background: radial-gradient(circle, #f0a64a 0 15%, #1a1a1a 15.5% 17%, #111 17.5%),
          repeating-radial-gradient(circle, rgba(255,255,255,.06) 0 1px, transparent 1px 4px);
        background-blend-mode: normal; box-shadow: 0 14px 30px -10px rgba(0,0,0,.7), inset 0 0 0 1px rgba(255,255,255,.08); }
      .vinyl::after { content: ""; position: absolute; inset: 0; border-radius: 50%;
        background: conic-gradient(from 30deg, transparent 0 20%, rgba(255,255,255,.12) 25%, transparent 32% 70%, rgba(255,255,255,.08) 75%, transparent 82%); }
      .art { width: 112px; height: 112px; border-radius: 18px; object-fit: cover; box-shadow: 0 14px 30px -10px rgba(0,0,0,.7); }
      .spin { animation: spin 3.2s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
      .meta { min-width: 0; }
      .mt { font: 600 18px/23px var(--g-display); overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
      .ma { font: 500 13px var(--g-font); color: var(--g-dim); margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .ctl { display: flex; align-items: center; gap: 10px; margin-top: 12px; }
      .b { all: unset; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; background: rgba(255,255,255,.10); }
      .b svg { width: 18px; height: 18px; }
      .b.big { width: 52px; height: 52px; background: #fff; color: #18241d; box-shadow: 0 8px 22px -6px rgba(255,255,255,.5); }
      .b.big svg { width: 22px; height: 22px; }
      .b:active { transform: scale(.92); }
      .vol { display: flex; align-items: center; gap: 10px; color: var(--g-dim); }
      .vol svg { width: 18px; height: 18px; flex: none; }
      input[type=range] { -webkit-appearance: none; appearance: none; flex: 1; height: 6px; border-radius: 3px; outline: none;
        background: linear-gradient(90deg, #fff ${vol}%, rgba(255,255,255,.16) ${vol}%); }
      input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,.4); }
      input[type=range]::-moz-range-thumb { width: 20px; height: 20px; border: 0; border-radius: 50%; background: #fff; }
      .dead { opacity: .5; pointer-events: none; }
    </style>
    <div class="glass">
      <div class="eyebrow">Now playing</div>
      ${tabs}
      <div class="main ${dead ? "dead" : ""}">
        <div class="disc">${pic ? `<img class="art" src="${esc(pic)}" alt="">` : `<div class="vinyl ${playing ? "spin" : ""}"></div>`}</div>
        <div class="meta"><div class="mt">${esc(title)}</div>${artist ? `<div class="ma">${esc(artist)}</div>` : ""}
          <div class="ctl"><button class="b" data-act="prev" aria-label="Previous">${ICON.prev}</button>
            <button class="b big" data-act="play" aria-label="${playing ? "Pause" : "Play"}">${playing ? ICON.pause : ICON.play}</button>
            <button class="b" data-act="next" aria-label="Next">${ICON.next}</button></div></div>
      </div>
      <div class="vol ${dead ? "dead" : ""}">${ICON.vol}<input type="range" min="0" max="100" step="1" value="${vol}" aria-label="Volume"></div>
    </div>`;
  }
  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }
  static getStubConfig() { return { type: "custom:habib-media", players: [] }; }
}

// ---- G. habib-todo: the shopping list with colour bars and quick add -------------------

const BAR_COLORS = ["120, 170, 255", "255, 120, 170", "255, 196, 90", "120, 220, 150", "190, 140, 255"];

class HabibTodo extends GlassCard {
  _validate(c) { if (!c.entity) throw new Error("Set entity"); this._items = this._items || []; }
  _signature() { return this._sigOf([this._config.entity]) + "#" + JSON.stringify(this._items.map((i) => [i.uid, i.status, i.summary])); }
  _onFirstHass() { this._subscribe(); }
  _connected() { this._subscribe(); }
  _disconnected() { if (this._unsub) { this._unsub.then((u) => u && u()).catch(() => {}); this._unsub = null; } }
  _subscribe() {
    if (this._unsub || !this._hass || !this.isConnected || !this._hass.connection) return;
    try {
      this._unsub = this._hass.connection.subscribeMessage(
        (msg) => { this._items = msg.items || []; this._maybeRender(false); },
        { type: "todo/item/subscribe", entity_id: this._config.entity }
      ).catch(() => null);
    } catch (e) { this._unsub = null; }
  }
  _setup() {
    const root = this.shadowRoot;
    root.addEventListener("click", (e) => {
      const done = e.target.closest && e.target.closest("[data-done]");
      if (done && this._hass) {
        haptic(this);
        done.classList.add("ticking");
        this._hass.callService("todo", "update_item", { item: done.dataset.done, status: "completed" }, { entity_id: this._config.entity }).catch(() => {});
        return;
      }
      if (e.target.closest && e.target.closest("[data-add]")) this._add();
      if (e.target.closest && e.target.closest("[data-open]")) moreInfo(this, this._config.entity);
    });
    root.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.matches("input")) this._add(); });
    root.addEventListener("focusin", () => { this._hold = true; });
    root.addEventListener("focusout", () => { this._hold = false; this._later(() => this._maybeRender(false), 50); });
  }
  _add() {
    const input = this.shadowRoot.querySelector("input");
    const text = input && input.value.trim();
    if (!text || !this._hass) return;
    haptic(this);
    input.value = "";
    this._hass.callService("todo", "add_item", { item: text }, { entity_id: this._config.entity }).catch(() => { input.value = text; });
  }
  _render() {
    const open = this._items.filter((i) => i.status === "needs_action");
    const max = this._config.max_items || 6;
    const s = this._st(this._config.entity);
    const rows = open.slice(0, max).map((it, i) => `
      <div class="it" style="--c: ${BAR_COLORS[i % BAR_COLORS.length]}"><button class="ck" data-done="${esc(it.uid)}" aria-label="Done: ${esc(it.summary)}"></button>
        <span class="tx">${esc(it.summary)}</span></div>`).join("");
    this.shadowRoot.innerHTML = `<style>${GLASS}
      .glass { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
      .head { display: flex; justify-content: space-between; align-items: flex-start; }
      .big { font: 700 22px/26px var(--g-display); letter-spacing: -.01em;
        background: linear-gradient(90deg, #c9d8ff, #f3c8ff); -webkit-background-clip: text; background-clip: text; color: transparent; }
      .open { all: unset; cursor: pointer; font: 600 12px var(--g-font); color: var(--g-dim); padding: 6px 10px; border-radius: 999px; background: rgba(255,255,255,.08); }
      .list { display: flex; flex-direction: column; gap: 7px; }
      .it { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 14px; position: relative; overflow: hidden;
        background: linear-gradient(90deg, rgba(var(--c), .20), rgba(255,255,255,.05) 60%); border: 1px solid rgba(var(--c), .25); }
      .it::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: rgb(var(--c)); }
      .ck { all: unset; cursor: pointer; width: 20px; height: 20px; border-radius: 50%; border: 2px solid rgba(var(--c), .9); flex: none; transition: background .2s; }
      .ck.ticking { background: rgb(var(--c)); }
      .tx { font: 500 15px var(--g-font); overflow-wrap: anywhere; }
      .empty { font: 500 13px var(--g-font); color: var(--g-dim); padding: 8px 2px; }
      .add { display: flex; gap: 8px; margin-top: auto; padding-top: 4px; }
      input { all: unset; flex: 1; min-width: 0; padding: 12px 14px; border-radius: 14px; background: rgba(0,0,0,.2); border: 1px solid rgba(255,255,255,.1);
        font: 500 14px var(--g-font); color: var(--g-text); }
      input::placeholder { color: var(--g-faint); }
      .plus { all: unset; cursor: pointer; width: 46px; border-radius: 14px; display: grid; place-items: center; color: #fff;
        background: linear-gradient(145deg, #8d9dff, #c58cff); box-shadow: 0 8px 22px -8px rgba(170,140,255,.9); }
      .plus svg { width: 20px; height: 20px; }
    </style>
    <div class="glass">
      <div class="head"><div><div class="big">${esc(this._config.title || (s && s.attributes.friendly_name) || "List")}</div>
        <div class="sub">${open.length ? `${open.length} item${open.length === 1 ? "" : "s"}` : "All done"}</div></div>
        <button class="open" data-open>Open</button></div>
      <div class="list">${rows || `<div class="empty">Nothing on the list. Add something below.</div>`}
        ${open.length > max ? `<div class="sub">+${open.length - max} more</div>` : ""}</div>
      <div class="add"><input type="text" placeholder="Add an item…" enterkeyhint="done" aria-label="New item">
        <button class="plus" data-add aria-label="Add"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button></div>
    </div>`;
  }
  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }
  static getStubConfig() { return { type: "custom:habib-todo", entity: "todo.shopping_list" }; }
}

// ---- H. habib-label: small-caps section label that sits on the wallpaper ---------------

class HabibLabel extends GlassCard {
  _signature() { return "static"; }
  _render() {
    this.shadowRoot.innerHTML = `<style>${GLASS}
      .l { display: flex; align-items: baseline; justify-content: space-between; padding: 14px 6px 0; color: var(--g-text); font-family: var(--g-font); }
      .h { font: 600 13px/16px var(--g-display); letter-spacing: .22em; text-transform: uppercase; text-shadow: 0 1px 12px rgba(0,0,0,.4); }
      .s { font: 500 12px var(--g-font); color: var(--g-dim); }
    </style><div class="l"><span class="h">${esc(this._config.label || "")}</span>${this._config.note ? `<span class="s">${esc(this._config.note)}</span>` : ""}</div>`;
  }
  getGridOptions() { return { columns: 12, rows: 1 }; }
  static getStubConfig() { return { type: "custom:habib-label", label: "Living Room" }; }
}

define("habib-hero", HabibHero);
define("habib-prayer", HabibPrayer);
define("habib-light", HabibLight);
define("habib-climate", HabibClimate);
define("habib-security", HabibSecurity);
define("habib-media", HabibMedia);
define("habib-todo", HabibTodo);
define("habib-label", HabibLabel);

registerCard("habib-hero", "Habib hero (glass)", "Clock, Hijri date, weather with forecast high and low, people at home.");
registerCard("habib-prayer", "Habib prayer times (glass)", "Five prayers, next prayer countdown and progress, Adhan status (read only).");
registerCard("habib-light", "Habib lamp (glass)", "A drawn lamp that glows in the light's colour. Tap toggles, slider sets brightness, ••• opens colours.");
registerCard("habib-climate", "Habib climate (glass)", "Indoor temperature and setpoint range per thermostat. Tap opens Home Assistant's dialog.");
registerCard("habib-security", "Habib security (glass)", "Lock and garage status. Never calls a service.");
registerCard("habib-media", "Habib media (glass)", "Speakers with album art or a spinning record, transport and volume.");
registerCard("habib-todo", "Habib list (glass)", "A to-do list with quick add and tap to complete.");
registerCard("habib-label", "Habib section label (glass)", "Small-caps label for a section.");
injectGlobals();
