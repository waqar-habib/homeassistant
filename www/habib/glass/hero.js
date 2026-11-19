// glass/hero.js: habib-hero. Clock, date, Hijri date, weather, people. compact: true is the 130 px phone hero;
// dense: true keeps every element of the full hero at about 75% of its height.
const B = await import(new URL("./base.js", import.meta.url).href.split("?")[0] + new URL(import.meta.url).search);
const A = await B.load("./art.js");
const { G, GlassCard, esc, moreInfo } = B;

export class HabibHero extends GlassCard {
  static css = `${A.WX_CSS}
    .glass { container-type: inline-size; padding: var(--s-22) var(--s-22) var(--s-18); display: flex; flex-direction: column; gap: var(--s-14); min-height: var(--z-hero-min); }
    .tint { position: absolute; inset: 0; pointer-events: none; opacity: .9; }
    .dawn .tint { background: var(--g-tint-dawn); } .day .tint { background: var(--g-tint-day); }
    .dusk .tint { background: var(--g-tint-dusk); } .night .tint { background: var(--g-tint-night); }
    .top { position: relative; }
    .dl { display: flex; justify-content: space-between; align-items: center; gap: var(--s-10); }
    .clock { font: var(--t-clock); letter-spacing: var(--ls-clock); white-space: nowrap; }
    .ampm { font: var(--t-ampm); letter-spacing: var(--ls-ampm); color: var(--g-dim); margin-left: var(--s-6); }
    .date { font: var(--t-title-alt); margin-top: var(--s-8); }
    .hijri { font: var(--t-sub); letter-spacing: var(--ls-hijri); color: var(--g-dim); margin-top: var(--s-2); }
    .people { display: flex; gap: var(--s-6); }
    .who { position: relative; width: var(--z-avatar); height: var(--z-avatar); border-radius: var(--r-round); cursor: pointer;
      display: grid; place-items: center; font: var(--t-title-sm);
      background: linear-gradient(145deg, var(--g-line), var(--g-well-border)); border: var(--g-hair) solid var(--g-line); }
    .who img { width: 100%; height: 100%; border-radius: var(--r-round); object-fit: cover; }
    .who i { position: absolute; right: 0; bottom: 0; width: var(--z-avatar-dot); height: var(--z-avatar-dot); border-radius: var(--r-round);
      border: var(--g-edge) solid var(--g-rim); background: rgb(var(--g-mint)); }
    .who.away { filter: var(--k-away); } .who.away i { background: var(--g-idle); }
    .wxrow { position: relative; display: flex; align-items: center; gap: var(--s-10); margin-top: auto; cursor: pointer; }
    .wx { flex: none; width: var(--z-wx); height: auto; }
    .temp { font: var(--t-metric-xl); letter-spacing: var(--ls-metric-xl); }
    .cond { display: flex; flex-direction: column; gap: var(--s-6); min-width: 0; flex: 1; }
    .cname { font: var(--t-title-lg); }
    .pills { display: flex; flex-wrap: wrap; gap: var(--s-4); }
    /* dense (owner, 2026-11-19): every element of the full hero, about 25% less height. Date and
       Hijri sit beside the people; smaller clock and temperature. */
    .glass.dense { padding: var(--s-14) var(--s-18) var(--s-12); gap: var(--s-8); min-height: 0; }
    .dense .clock { font: var(--t-clock-md); letter-spacing: var(--ls-clock-md); }
    .dense .ampm { font: var(--t-ampm-md); letter-spacing: var(--ls-ampm-md); }
    .dense .date { margin-top: 0; }
    .dense .dl { margin-top: var(--s-6); align-items: flex-end; }
    .dense .wxrow { gap: var(--s-8); }
    .dense .wx { width: var(--z-wx-md); }
    .dense .temp { font: var(--t-metric-lg); letter-spacing: var(--ls-metric-lg); }
    .dense .cond { gap: var(--s-4); }
    /* compact */
    .glass.compact { height: var(--z-hero-compact); min-height: 0; padding: var(--s-14) var(--s-16); flex-direction: row; align-items: center; justify-content: space-between; gap: var(--s-10); }
    .compact .left { position: relative; flex: none; min-width: 0; }
    .compact .clock { font: var(--t-clock-sm); letter-spacing: var(--ls-clock-sm); }
    .compact .ampm { font: var(--t-ampm-sm); margin-left: var(--s-4); }
    .compact .date { font: var(--t-date-sm); margin-top: var(--s-6); white-space: nowrap; }
    .compact .wxc { position: relative; flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: flex-end; gap: var(--s-4); cursor: pointer; }
    .compact .wtop { display: flex; align-items: center; gap: var(--s-4); }
    .compact .wx { width: var(--z-wx-sm); }
    .compact .temp { font: var(--t-metric-md); letter-spacing: var(--ls-metric-md); }
    .compact .cname { font: var(--t-title-xs); text-align: right; }
    .compact .pills { justify-content: flex-end; gap: var(--s-2); }
  `;
  _validate(c) { this._persons = Array.isArray(c.persons) ? c.persons : []; }
  _signature() {
    const now = new Date();
    return [this._sigOf([this._config.weather, this._config.sun].filter(Boolean), ["temperature", "apparent_temperature", "humidity"]),
      this._sigOf(this._persons.map((p) => p.entity)), now.getHours(), now.getMinutes(),
      JSON.stringify(this._forecast || null)].join("#");
  }
  _connected() { this._tick(); this._subscribe(); }
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
    const compact = this._config.compact === true;
    const w = this._st(this._config.weather);
    const sun = this._config.sun ? this._st(this._config.sun) : null;
    const night = sun ? sun.state === "below_horizon" : now.getHours() < 6 || now.getHours() >= 18;
    const part = G.daypart(now.getHours());
    const hm = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const [clock, ampm] = hm.split(/\s(?=[AP]M$)/i);
    const date = now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });
    let hijri = "";
    if (this._config.hijri !== false && !compact) {
      try { hijri = now.toLocaleDateString("en-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { hijri = ""; }
    }
    const temp = w && typeof w.attributes.temperature === "number" ? Math.round(w.attributes.temperature) : "–";
    const feels = w && typeof w.attributes.apparent_temperature === "number" ? Math.round(w.attributes.apparent_temperature) : null;
    const f = this._forecast;
    const pills = [
      feels !== null ? `Feels ${feels}°` : "",
      f && typeof f.temperature === "number" ? `H ${Math.round(f.temperature)}°` : "",
      f && typeof f.templow === "number" ? `L ${Math.round(f.templow)}°` : "",
      w && typeof w.attributes.humidity === "number" ? `${Math.round(w.attributes.humidity)}% RH` : "",
    ].filter(Boolean).map((t) => `<span class="pill ${compact ? "sm" : ""}">${esc(t)}</span>`).join("");
    const cname = esc(w ? G.WEATHER_LABELS[w.state] || w.state : "No weather");
    const clockHtml = `<div class="clock num">${esc(clock)}${ampm ? `<span class="ampm">${esc(ampm)}</span>` : ""}</div>`;
    const tempHtml = `<div class="temp">${esc(temp)}<span class="unit">°</span></div>`;
    const wxAttr = w ? `data-entity="${esc(this._config.weather)}" role="button" tabindex="0" aria-label="Weather: ${cname}, ${esc(temp)} degrees"` : "";
    if (compact) {
      // Half the height: clock and date left, the same weather right in smaller type. No people row.
      this._paint(`<div class="glass deep compact ${part}"><div class="tint"></div>
        <div class="left">${clockHtml}<div class="date">${esc(date)}</div></div>
        <div class="wxc" ${wxAttr}>
          <div class="wtop">${A.weatherSvg(w ? w.state : "cloudy", night)}${tempHtml}</div>
          <div class="cname">${cname}</div><div class="pills">${pills}</div>
        </div></div>`);
      return;
    }
    const people = this._persons.map((p) => {
      const s = this._st(p.entity);
      const home = s && s.state === "home";
      const pic = s && s.attributes.entity_picture;
      const where = !s ? "Not found" : home ? "Home" : s.state === "not_home" ? "Away" : s.state;
      const initials = esc((p.name || (s && s.attributes.friendly_name) || "?").trim().charAt(0));
      return `<button class="who tap ${home ? "home" : "away"}" data-entity="${esc(p.entity)}" aria-label="${esc(p.name || "")}: ${esc(where)}">
        ${pic ? `<img src="${esc(this._hass.hassUrl ? this._hass.hassUrl(pic) : pic)}" alt="">` : `<span>${initials}</span>`}<i></i></button>`;
    }).join("");
    const dense = this._config.dense === true;
    const dateHtml = `<div class="date">${esc(date)}</div>`;
    const hijriHtml = hijri ? `<div class="hijri">${esc(hijri)}</div>` : "";
    this._paint(`<div class="glass deep ${dense ? "dense" : ""} ${part}"><div class="tint"></div>
        <div class="top">${clockHtml}${dense ? "" : dateHtml}
          <div class="dl"><div>${dense ? dateHtml : ""}${hijriHtml}</div><div class="people">${people}</div></div>
        </div>
        <div class="wxrow" ${wxAttr}>
          ${A.weatherSvg(w ? w.state : "cloudy", night)}${tempHtml}
          <div class="cond"><div class="cname">${cname}</div><div class="pills">${pills}</div></div>
        </div></div>`);
  }
  _setup() {
    const open = (e) => { const t = e.target.closest && e.target.closest("[data-entity]"); if (t) moreInfo(this, t.getAttribute("data-entity")); return !!t; };
    this.shadowRoot.addEventListener("click", open);
    this.shadowRoot.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && open(e)) e.preventDefault(); });
  }
  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }
  static getStubConfig() { return { type: "custom:habib-hero", weather: "", sun: "sun.sun", persons: [] }; }
}
export const card = { tag: "habib-hero", cls: HabibHero, name: "Habib hero (glass)", description: "Clock, Hijri date, weather with forecast high and low, people at home." };
