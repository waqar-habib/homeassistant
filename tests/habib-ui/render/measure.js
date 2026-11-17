// Runs inside the page (injected by render.mjs). Measures what the acceptance criteria ask for.
// Everything is read from the rendered DOM; nothing is assumed from the source.
(async () => {
  const roots = [];
  const walk = (root) => { roots.push(root); for (const el of root.querySelectorAll("*")) if (el.shadowRoot) walk(el.shadowRoot); };
  walk(document);
  const habibRoots = roots.filter((r) => r.host && /^habib-/i.test(r.host.localName));
  const all = (sel) => habibRoots.flatMap((r) => [...r.querySelectorAll(sel)]);
  const hostOf = (el) => { const r = el.getRootNode(); return r.host ? r.host.localName : "document"; };
  const visible = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none"; };
  const page = (r) => ({ x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height });
  const out = { width: innerWidth, height: innerHeight, pageHeight: document.documentElement.scrollHeight,
    hScroll: document.documentElement.scrollWidth > innerWidth + 0.5, cards: {} };

  // ---- text: broken words, clipped text, and the data for contrast sampling
  const texts = [], broken = [], clipped = [];
  const opacityOf = (el) => { let o = 1; for (let n = el; n; n = n.parentElement || (n.getRootNode().host || null)) o *= parseFloat(getComputedStyle(n).opacity || "1"); return o; };
  for (const root of habibRoots) {
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = tw.nextNode(); node; node = tw.nextNode()) {
      const el = node.parentElement;
      if (!el || !node.nodeValue.trim() || el.closest("style, svg") || !visible(el)) continue;
      const cs = getComputedStyle(el);
      const range = document.createRange();
      range.selectNodeContents(node);
      const rects = [...range.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5);
      if (!rects.length) continue;
      const m = /rgba?\(([^)]+)\)/.exec(cs.color);
      const col = m ? m[1].split(/[ ,/]+/).filter(Boolean).map(Number) : [0, 0, 0, 1];
      texts.push({ card: hostOf(el), cls: el.className || el.localName, text: node.nodeValue.trim().slice(0, 40), color: col.slice(0, 3), alpha: (col[3] ?? 1) * opacityOf(el),
        gradientText: cs.webkitBackgroundClip === "text" || cs.backgroundClip === "text", size: parseFloat(cs.fontSize), weight: Number(cs.fontWeight) || 400,
        rects: rects.map(page), lit: !!el.closest(".is-on"), bar: !!el.closest(".mini"), stack: !!el.closest(".mini.stack") });
      // a word must sit on one line
      const re = /[^\s]+/g; let w;
      while ((w = re.exec(node.nodeValue))) {
        const r2 = document.createRange(); r2.setStart(node, w.index); r2.setEnd(node, w.index + w[0].length);
        const tops = new Set([...r2.getClientRects()].filter((r) => r.width > 0.5).map((r) => Math.round(r.top)));
        if (tops.size > 1) broken.push({ card: hostOf(el), word: w[0] });
      }
      // text must not be cut by its own box
      if (el.scrollWidth > el.clientWidth + 1 && ["hidden", "clip"].includes(cs.overflowX)) clipped.push({ card: hostOf(el), cls: String(el.className), text: node.nodeValue.trim().slice(0, 40), need: el.scrollWidth, have: el.clientWidth });
      else if (el.scrollHeight > el.clientHeight + 1 && ["hidden", "clip"].includes(cs.overflowY)) clipped.push({ card: hostOf(el), cls: String(el.className), text: node.nodeValue.trim().slice(0, 40), needH: el.scrollHeight, haveH: el.clientHeight });
    }
  }
  Object.assign(out, { texts, broken, clipped });

  // ---- bars: height and one line
  out.bars = all(".mini").filter(visible).map((b) => {
    const mv = b.querySelector(".mv"); const r = b.getBoundingClientRect();
    const tr = document.createRange(); tr.selectNodeContents(mv);
    // lines = runs of text boxes that do not overlap vertically
    let lines = 0, edge = -Infinity;
    for (const x of [...tr.getClientRects()].filter((x) => x.width > 0.5).sort((a, b) => a.top - b.top)) { if (x.top >= edge - 2) lines++; edge = Math.max(edge, x.bottom); }
    return { card: hostOf(b), stack: b.classList.contains("stack"), short: b.classList.contains("short"), h: +r.height.toFixed(1), w: +r.width.toFixed(1),
      label: b.querySelector(".ml").textContent, value: [...mv.children].filter(visible).map((c) => c.textContent).join(""), lines, fits: mv.scrollWidth <= mv.clientWidth + 0.5, aria: b.getAttribute("aria-label") };
  });

  // ---- chips: unused width on either side at 150 px and wider
  out.chips = all(".chip").filter(visible).map((c) => {
    const r = c.getBoundingClientRect();
    const xs = [];
    for (const part of c.querySelectorAll(".ci > *, .cn, .cs")) {
      if (part.matches(".cn, .cs")) { const tr = document.createRange(); tr.selectNodeContents(part); for (const x of tr.getClientRects()) if (x.width > 0.5) xs.push([x.left, x.right]); }
      else { const x = part.getBoundingClientRect(); xs.push([x.left, x.right]); }
    }
    return { card: hostOf(c), name: c.querySelector(".cn").textContent, w: +r.width.toFixed(1), h: +r.height.toFixed(1),
      left: +(Math.min(...xs.map((x) => x[0])) - r.left).toFixed(1), right: +(r.right - Math.max(...xs.map((x) => x[1]))).toFixed(1),
      nameSize: parseFloat(getComputedStyle(c.querySelector(".cn")).fontSize) };
  });

  // ---- layout: columns, blank space between groups, ragged bottom
  const layout = roots.map((r) => r.host).find((h) => h && h.localName === "habib-layout");
  if (layout) {
    const groups = [...layout.shadowRoot.querySelectorAll(".group")].filter((g) => !g.hidden).map((g) => ({ id: g.dataset.id, ...page(g.getBoundingClientRect()) }));
    const colsX = [...new Set(groups.map((g) => Math.round(g.x)))].sort((a, b) => a - b);
    let excess = 0, area = 0; const bottoms = [];
    for (const x of colsX) {
      const col = groups.filter((g) => Math.round(g.x) === x).sort((a, b) => a.y - b.y);
      for (let i = 1; i < col.length; i++) excess += Math.max(0, col[i].y - (col[i - 1].y + col[i - 1].h)) * col[i].w;
      for (const g of col) area += g.w * g.h;
      bottoms.push(col[col.length - 1].y + col[col.length - 1].h);
    }
    const top = Math.min(...groups.map((g) => g.y)), tallest = Math.max(...bottoms);
    out.layout = { columns: colsX.length, mode: layout._mode, groups: groups.map((g) => ({ id: g.id, col: colsX.indexOf(Math.round(g.x)), y: Math.round(g.y), h: Math.round(g.h), w: Math.round(g.w) })),
      blankBetweenPct: +(100 * excess / area).toFixed(2), raggedBottomPct: +(100 * bottoms.reduce((s, b) => s + (tallest - b), 0) / (colsX.length * (tallest - top))).toFixed(1),
      columnHeights: bottoms.map((b) => Math.round(b - top)) };
  }

  // ---- where the content ends
  out.contentBottom = Math.round(Math.max(0, ...all(".glass").filter(visible).map((g) => page(g.getBoundingClientRect())).map((r) => r.y + r.h)));

  // ---- hit areas, measured by hit-testing (pseudo-elements count, covered parts do not)
  const deepHit = (x, y) => { let el = document.elementFromPoint(x, y); while (el && el.shadowRoot) { const n = el.shadowRoot.elementFromPoint(x, y); if (!n || n === el) break; el = n; } return el; };
  const header = document.getElementById("header"); if (header) header.style.display = "none";
  const controls = [...new Set(all("button, [role=button], [role=slider], [role=tab], input, [data-collapse], [data-entity], [data-chip], [data-act]"))]
    .filter((c) => visible(c) && !c.closest(".is-dead, .is-missing") && getComputedStyle(c).pointerEvents !== "none");
  out.hits = [];
  for (const c of controls) {
    c.scrollIntoView({ block: "center" });
    const r = c.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const mine = (x, y) => { const el = deepHit(x, y); return !!el && (el === c || c.contains(el)); };
    if (!mine(cx, cy)) { out.hits.push({ card: hostOf(c), what: c.className || c.localName, w: 0, h: 0, covered: true }); continue; }
    const run = (dx, dy) => { let n = 0; while (n < 80 && mine(cx + dx * (n + 1), cy + dy * (n + 1))) n++; return n; };
    out.hits.push({ card: hostOf(c), what: String(c.className || c.localName).split(" ").slice(0, 2).join("."), label: c.getAttribute("aria-label") || c.textContent.trim().slice(0, 24),
      w: run(-1, 0) + run(1, 0) + 1, h: run(0, -1) + run(0, 1) + 1, box: [+r.width.toFixed(1), +r.height.toFixed(1)] });
  }
  if (header) header.style.display = "";
  scrollTo(0, 0);
  return out;
})()
