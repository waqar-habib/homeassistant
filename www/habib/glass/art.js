// glass/art.js: the drawn illustrations (lamps, weather, prayer icons).
// Illustration colours are art, not interface tokens: they stay literal and live only in this
// file (ceramic, metal, wood, sun, cloud). A lamp's light colour is data from the entity.
// Interface colours, type and spacing never go here: see base.js.

const { G, rgbStr } = await import(new URL("./base.js", import.meta.url).href.split("?")[0] + new URL(import.meta.url).search);
export function weatherSvg(condition, night) {
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
  <svg class="wx" viewBox="0 0 110 100" aria-hidden="true">
    <defs>
      <radialGradient id="sunG" cx=".4" cy=".35"><stop offset="0" stop-color="#fff3c4"/><stop offset="1" stop-color="#ffb648"/></radialGradient>
      <radialGradient id="moonG" cx=".3" cy=".3"><stop offset="0" stop-color="#fffbe9"/><stop offset="1" stop-color="#d9d3bd"/></radialGradient>
      <linearGradient id="cloudG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfd9e3"/></linearGradient>
      <linearGradient id="cloudD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#aeb9c6"/><stop offset="1" stop-color="#6c7886"/></linearGradient>
    </defs>${sun}${moon}${cloud}${rain}${snow}${bolt}${fog}
  </svg>`;
}

export const WX_CSS = `
  .wx { overflow: visible; filter: var(--g-art-shadow); }
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

export function prayerIcon(key) {
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

export function lampArt(kind, on) {
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

// pfx makes the gradient ids unique when several lamps share one shadow root (habib-room chips).
export function lampSvg(kind, glow, groupLit, pfx) {
  const svg = lampSvgRaw(kind, glow, groupLit);
  return pfx ? svg.replace(/id="([A-Za-z0-9]+)"/g, `id="${pfx}$1"`).replace(/url\(#([A-Za-z0-9]+)\)/g, `url(#${pfx}$1)`) : svg;
}

function lampSvgRaw(kind, glow, groupLit) {
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

// Shared by every card that shows a lamp drawing.
export const LAMP_CSS = `
  .bloom { animation: breathe var(--m-breathe) ease-in-out infinite; transform-origin: 60px 50px; }
  @keyframes breathe { 50% { opacity: .82; } }
`;
