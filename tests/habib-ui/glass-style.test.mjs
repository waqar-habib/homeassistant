// No hard-coded styling in a glass card (owner rule, D78 item 5): every colour, size, space,
// type size and duration comes from the tokens in www/habib/glass/base.js. The drawn art
// (art.js) may keep its illustration colours. This test fails when a literal slips into a card.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../www/habib/glass");
const EXEMPT = ["base.js", "art.js"]; // the token file and the illustrations
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".js") && !EXEMPT.includes(f));

// Only CSS and markup count: comments are dropped first.
const code = (f) => fs.readFileSync(path.join(dir, f), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const RULES = [
  ["hex colour", /(?<![\w(&"'])#[0-9a-fA-F]{3,8}\b/g],
  ["rgb()/hsl() with literal numbers", /\b(?:rgba?|hsla?)\(\s*\d/g],
  ["px length", /\b\d*\.?\d+px\b/g],
  ["em or rem length", /(?<![\w.-])\d*\.?\d+r?em\b/g],
  ["duration", /(?<![\w.-])\d*\.?\d+m?s\b(?=[\s;,)])/g],
  ["font shorthand with a literal size", /font:\s*\d/g],
];

test("the card set is split: base, art and one file per card", () => {
  for (const f of ["index.js", "hero.js", "prayer.js", "light.js", "climate.js", "security.js", "media.js", "todo.js", "label.js", "room.js", "dock.js", "button.js", "layout.js", "section.js", "accordion.js"]) assert.ok(files.includes(f), f);
});

for (const f of files) {
  test(`${f}: no literal colour, length or duration`, () => {
    const src = code(f);
    for (const [name, re] of RULES) {
      const hits = [...src.matchAll(re)].map((m) => m[0]).filter((h) => h !== "0px"); // zero is not a value
      assert.deepEqual(hits, [], `${name} in ${f}`);
    }
  });
  test(`${f}: no primitive is redefined`, () => {
    const src = code(f);
    // The shared primitives live in base.js only.
    for (const sel of [".glass.mini", ".chip {", ".chipbox {", ".pill {", ".rbtn {", ".well {", ".dot {", ".tap::after"]) assert.ok(!src.includes(sel), `${sel} redefined in ${f}`);
    assert.ok(!/all:\s*unset/.test(src) || f === "todo.js", `all: unset in ${f} would wipe the shared primitives`);
  });
}

test("every card adopts the shared sheet (no <style> text of its own)", () => {
  for (const f of files) assert.ok(!code(f).includes("<style"), f);
});
