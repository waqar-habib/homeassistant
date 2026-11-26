// Habib dashboards: measured UI/UX check (2026-11-26, after owner review of the Ultra Home tab).
// Runs in the HA frontend (same origin). Usage from the page console or javascript_tool:
//   const src = await fetch(RAW_URL).then(r => r.text()); const run = new Function(src + "; return uiuxRun;")();
//   await run({ widths: [430, 820, 1440], paths: ["/uc-home-test/home", "/uc-home-test/lights"] })
// Each path is loaded in a same-origin iframe of that width; every card is measured.
// Rules (fail = defect, warn = review):
//  R1 overlap      two text boxes in a card overlap by > 1 px                                   fail
//  R2 cramped      a heading (>= 17 px, weight >= 600) has < 6 px to the next text below it      fail
//                  any two stacked texts of different size with < 2 px between them             fail
//  R3 inset        content closer than 12 px to the card edge, or outside the card               fail
//  R4 left edge    left-aligned texts in a card start at more than 2 different x (±2 px)          warn
//  R5 proportion   texts on one line differ in size by > 1.5x; any text > 2.6x the card's body    fail
//  R6 truncation   text clipped (scrollWidth > clientWidth + 1)                                   fail
//  R7 target       a tappable element smaller than 40 x 40 px (44 preferred)                      fail
//  R8 repeat       the same control in sibling tiles sits at a different offset (±3 px)           fail
//  R9 demarcation  sibling tiles in a grid/row with no visible edge (background, border, shadow)  fail
//  R10 scale       more than 6 distinct font sizes in one card                                    warn
function uiuxRun(opts) {
  const widths = opts.widths || [430, 820, 1440];
  const paths = opts.paths;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  function deepAll(root, acc = []) {
    for (const e of root.querySelectorAll("*")) {
      acc.push(e);
      if (e.shadowRoot) deepAll(e.shadowRoot, acc);
    }
    return acc;
  }
  const visible = (e, win) => {
    const r = e.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const cs = win.getComputedStyle(e);
    return cs.visibility !== "hidden" && cs.display !== "none" && +cs.opacity > 0.05;
  };
  const ownText = (e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim();
  const hasEdge = (e, win) => {
    const cs = win.getComputedStyle(e);
    const bg = cs.backgroundColor, bi = cs.backgroundImage;
    return (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) || (bi && bi !== "none") ||
      parseFloat(cs.borderTopWidth) > 0 || (cs.boxShadow && cs.boxShadow !== "none");
  };

  function checkCard(card, win, ctx) {
    const out = [];
    const cr = card.getBoundingClientRect();
    const name = card.config?.card_name || card.config?.type || card.tagName.toLowerCase();
    const els = deepAll(card.shadowRoot || card).filter((e) => visible(e, win));
    const inDrawer = (e) => { let n = e; while (n) { if (n.className && /drawer-(panel|content|overlay)/.test(String(n.className))) return true; n = n.parentNode || n.host; } return false; };
    const texts = els.filter((e) => ownText(e) && !inDrawer(e)).map((e) => {
      const cs = win.getComputedStyle(e);
      // measure the text itself, not the box
      const rng = e.ownerDocument.createRange(); rng.selectNodeContents(e);
      const rr = [...rng.getClientRects()].filter((q) => q.width > 0);
      const r = rr.length ? rr.reduce((a, q) => ({ left: Math.min(a.left, q.left), top: Math.min(a.top, q.top), right: Math.max(a.right, q.right), bottom: Math.max(a.bottom, q.bottom) }), { left: 1e9, top: 1e9, right: -1e9, bottom: -1e9 }) : e.getBoundingClientRect();
      return { e, t: ownText(e).slice(0, 24), fs: parseFloat(cs.fontSize), fw: +cs.fontWeight || 400, align: cs.textAlign, r };
    });
    const tag = (rule, sev, msg) => out.push({ ctx, card: name, rule, sev, msg });

    // R1, R2
    for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i], b = texts[j];
      if (a.e.contains(b.e) || b.e.contains(a.e)) continue;
      const ox = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const oy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (ox > 1 && oy > 1) tag("R1 overlap", "fail", `"${a.t}" x "${b.t}"`);
      if (ox > 4) {
        const [up, dn] = a.r.top <= b.r.top ? [a, b] : [b, a];
        const gap = dn.r.top - up.r.bottom;
        if (gap >= -1 && gap < 40) {
          // only the nearest text below counts
          const nearer = texts.some((c) => c !== up && c !== dn && c.r.top >= up.r.bottom - 1 && c.r.bottom <= dn.r.top + 1 &&
            Math.min(c.r.right, up.r.right) - Math.max(c.r.left, up.r.left) > 4);
          if (!nearer) {
            if (up.fs >= 17 && up.fw >= 600 && gap < 6) tag("R2 cramped", "fail", `heading "${up.t}" ${gap.toFixed(0)} px above "${dn.t}"`);
            else if (Math.abs(up.fs - dn.fs) > 1 && gap < 2) tag("R2 cramped", "fail", `"${up.t}" ${gap.toFixed(0)} px above "${dn.t}"`);
          }
        }
      }
    }
    // R3
    for (const x of texts) {
      const L = x.r.left - cr.left, R = cr.right - x.r.right, T = x.r.top - cr.top, B = cr.bottom - x.r.bottom;
      const m = Math.min(L, R, T, B);
      if (m < 0) tag("R3 inset", "fail", `"${x.t}" outside the card by ${(-m).toFixed(0)} px`);
      else if (m < 12) tag("R3 inset", "fail", `"${x.t}" ${m.toFixed(0)} px from the card edge`);
    }
    // R4
    const lefts = [...new Set(texts.filter((x) => x.align === "left" || x.align === "start").map((x) => Math.round((x.r.left - cr.left) / 3)))];
    if (lefts.length > 3) tag("R4 left edge", "warn", `${lefts.length} left edges`);
    // R5
    const sizes = texts.map((x) => x.fs).sort((p, q) => p - q);
    const body = sizes[Math.floor(sizes.length / 2)] || 14;
    for (const x of texts) if (x.fs > body * 2.6 && !/clock|hero/i.test(name)) tag("R5 proportion", "fail", `"${x.t}" ${x.fs}px vs body ${body}px`);
    for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i], b = texts[j];
      const sameLine = Math.abs((a.r.top + a.r.bottom) / 2 - (b.r.top + b.r.bottom) / 2) < Math.min(a.fs, b.fs) * 0.6;
      const near = Math.max(a.r.left, b.r.left) - Math.min(a.r.right, b.r.right) < 40;
      if (sameLine && near && Math.max(a.fs, b.fs) / Math.min(a.fs, b.fs) > 1.5) tag("R5 proportion", "fail", `"${a.t}" ${a.fs}px beside "${b.t}" ${b.fs}px`);
    }
    // R6
    for (const x of texts) if (x.e.scrollWidth > x.e.clientWidth + 1 && win.getComputedStyle(x.e).overflow !== "visible") tag("R6 truncation", "fail", `"${x.t}" clipped`);
    // R7
    const taps = els.filter((e) => win.getComputedStyle(e).cursor === "pointer" && !inDrawer(e));
    const topTaps = taps.filter((e) => !taps.some((p) => p !== e && p.contains(e)));
    for (const e of topTaps) {
      const r = e.getBoundingClientRect();
      if (r.width < 40 || r.height < 40) tag("R7 target", "fail", `${(ownText(e) || e.className || e.tagName).toString().slice(0, 24)} ${r.width.toFixed(0)}x${r.height.toFixed(0)}`);
    }
    // R8: same control (e.g. drawer trigger) in sibling tiles
    const triggers = els.filter((e) => /drawer-trigger|uc-drawer-trigger/.test(String(e.className)) && !inDrawer(e));
    const groups = new Map();
    for (const t of triggers) {
      let tile = t; for (let k = 0; k < 8 && tile && !/grid-layout-item|child-module-preview/.test(String(tile.className)); k++) tile = tile.parentNode || tile.host;
      const parent = tile?.parentNode; if (!parent) continue;
      if (!groups.has(parent)) groups.set(parent, []);
      const tr = t.getBoundingClientRect(), pr = tile.getBoundingClientRect();
      groups.get(parent).push({ dx: pr.right - tr.right, dy: pr.bottom - tr.bottom });
    }
    for (const g of groups.values()) if (g.length > 1) {
      const dx = Math.max(...g.map((q) => q.dx)) - Math.min(...g.map((q) => q.dx));
      const dy = Math.max(...g.map((q) => q.dy)) - Math.min(...g.map((q) => q.dy));
      if (dx > 3 || dy > 3) tag("R8 repeat", "fail", `drawer buttons offset differs by ${dx.toFixed(0)}/${dy.toFixed(0)} px`);
    }
    // R9: tiles in a grid
    for (const g of els.filter((e) => /grid-layout-preview/.test(String(e.className)))) {
      const items = [...g.children].filter((c) => visible(c, win));
      if (items.length < 2) continue;
      const edged = items.filter((c) => [c, ...deepAll(c).slice(0, 6)].some((x) => hasEdge(x, win) && Math.abs(x.getBoundingClientRect().width - c.getBoundingClientRect().width) < 4));
      if (edged.length < items.length) tag("R9 demarcation", "fail", `${items.length - edged.length} of ${items.length} grid tiles without a visible edge`);
    }
    // R10
    const distinct = [...new Set(sizes)];
    if (distinct.length > 6) tag("R10 scale", "warn", `${distinct.length} font sizes: ${distinct.join(",")}`);
    return out;
  }

  async function runOne(width, path) {
    const f = document.createElement("iframe");
    f.style.cssText = `position:fixed;left:0;top:0;width:${width}px;height:2400px;border:0;opacity:0;pointer-events:none;z-index:-1`;
    f.src = path;
    document.body.appendChild(f);
    await new Promise((r) => (f.onload = r));
    await wait(6000);
    const win = f.contentWindow, doc = f.contentDocument;
    const cards = deepAll(doc).filter((e) => e.tagName && /^(ULTRA-CARD|HUI-HEADING-CARD)$/.test(e.tagName) && visible(e, win));
    let res = [];
    for (const c of cards) res = res.concat(checkCard(c, win, `${width}${path}`));
    f.remove();
    return { ctx: `${width}${path}`, cards: cards.length, res };
  }

  return (async () => {
    const all = [];
    for (const p of paths) for (const w of widths) all.push(await runOne(w, p));
    const flat = all.flatMap((a) => a.res);
    const fails = flat.filter((x) => x.sev === "fail"), warns = flat.filter((x) => x.sev === "warn");
    return { pass: fails.length === 0, fails: fails.length, warns: warns.length,
      runs: all.map((a) => `${a.ctx}: ${a.cards} cards, ${a.res.filter((x) => x.sev === "fail").length} fail`),
      findings: flat.map((x) => `${x.sev.toUpperCase()} ${x.ctx} [${x.card}] ${x.rule}: ${x.msg}`) };
  })();
}
