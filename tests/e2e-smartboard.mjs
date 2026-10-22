// Smartboard view: two classrooms on 1920x1080 touch panels. The drawer draws on the corner pad,
// the guessers type on the on-screen keys, and the pad can be moved.
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH || "playwright");
const BASE = process.argv[2] || "http://localhost:8787";
const OUT = process.env.SHOTS || join(tmpdir(), "doodle-battle-smartboard");
mkdirSync(OUT, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const errors = [], results = [];
const check = (n, ok, x = "") => results.push(`${ok ? "PASS" : "FAIL"} ${n}${x ? ` (${x})` : ""}`);
async function dev(name) {
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, hasTouch: true });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error" && !/ERR_TUNNEL|fonts/.test(m.text())) errors.push(`${name}: ${m.text()}`); });
  return { name, page };
}
const shot = (d, n) => d.page.screenshot({ path: `${OUT}/${n}-${d.name}.png` });
const rect = (page, sel) => page.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, vw: innerWidth, vh: innerHeight }; });
/** Dark pixels around a point of a canvas, given as a share of its size. */
const inkAt = (page, sel, fx, fy) => page.$eval(sel, (cv, [fx, fy]) => {
  const d = cv.getContext("2d").getImageData(Math.round(cv.width * fx) - 3, Math.round(cv.height * fy) - 3, 7, 7).data;
  let dark = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i] < 200) dark++;
  return dark;
}, [fx, fy]);

const A = await dev("8A"), B = await dev("8B");
await A.page.goto(`${BASE}/?students=1&board=1`);
check("?board=1 turns the smartboard view on", await A.page.isChecked("#home [data-smartboard]"));
await A.page.fill("#nameInput", "8A");
await A.page.click("#createBtn");
await A.page.waitForSelector("#lobby:not([hidden])");
const code = (await A.page.textContent("#lobbyCode")).trim();
await B.page.goto(`${BASE}/r/${code}`);
await B.page.fill("#nameInput", "8B");
await B.page.click("#joinGo");
await B.page.waitForSelector("#lobby:not([hidden])");
check("the switch is off on a board that hasn't turned it on", !(await B.page.isChecked(".topbar [data-smartboard]")));
await B.page.check(".topbar [data-smartboard]");
check("the lobby switch turns it on", await B.page.evaluate(() => document.documentElement.classList.contains("smartboard")));

await A.page.click("#startBtn");
let drawer = null;
for (let i = 0; i < 80 && !drawer; i++) { for (const d of [A, B]) if (await d.page.$(".choice")) drawer = d; if (!drawer) await wait(150); }
const guesser = drawer === A ? B : A;
await shot(drawer, "01-choose");
await drawer.page.click(".choice >> nth=0");
await drawer.page.waitForSelector("#pad:not([hidden])");
const word = (await drawer.page.textContent("#padWord")).trim();
console.log("drawer", drawer.name, "word", word);

const pad = await rect(drawer.page, "#pad");
check("the pad starts in the bottom-left corner, clear of the edges", pad.x === 48 && Math.abs(pad.y + pad.h - (pad.vh - 48)) < 3, JSON.stringify(pad));
check("the tools move into the pad", await drawer.page.$eval("#tools", (t) => !!t.closest("#pad")));

const c = await rect(drawer.page, "#padCanvas");
await drawer.page.mouse.move(c.x + c.w * 0.2, c.y + c.h * 0.3);
await drawer.page.mouse.down();
for (let i = 0; i <= 20; i++) await drawer.page.mouse.move(c.x + c.w * (0.2 + i * 0.03), c.y + c.h * (0.3 + i * 0.02));
await drawer.page.mouse.up();
const big = await rect(drawer.page, "#board");
await drawer.page.touchscreen.tap(big.x + big.w * 0.85, big.y + big.h * 0.12);
await wait(1200);
check("a stroke on the pad shows on the big canvas", (await inkAt(drawer.page, "#board", 0.5, 0.5)) > 0);
check("the pad mirrors it", (await inkAt(drawer.page, "#padCanvas", 0.5, 0.5)) > 0);
check("a touch on the big canvas draws nothing", (await inkAt(drawer.page, "#board", 0.85, 0.12)) === 0);
check("the other classroom sees the stroke", (await inkAt(guesser.page, "#board", 0.5, 0.5)) > 0);
await shot(drawer, "02-drawer");

check("guessers get the on-screen keys", await guesser.page.isVisible("#kbd"));
check("the chat box is hidden while the keys are up", !(await guesser.page.isVisible("#chatInput")));
for (const k of "ZZ") await guesser.page.tap(`.key[data-k="${k}"]`);
check("typed letters fill the slots", (await guesser.page.$$eval(".kslot.filled", (s) => s.length)) === 2);
await guesser.page.tap('.key[data-k="back"]');
check("the back key removes one", (await guesser.page.$$eval(".kslot.filled", (s) => s.length)) === 1);
await guesser.page.tap('.key[data-k="clear"]');
check("clear empties the answer", (await guesser.page.$$eval(".kslot.filled", (s) => s.length)) === 0);
// A keyboard plugged into the panel types into the keys too.
for (const ch of Array.from(word).filter((x) => /[\p{L}\p{N}]/u.test(x))) await guesser.page.keyboard.press(ch);
check("a plugged-in keyboard types into the slots", (await guesser.page.$$eval(".kslot.filled", (s) => s.length)) === Array.from(word).filter((x) => /[\p{L}\p{N}]/u.test(x)).length);
await shot(guesser, "03-typed");

// Move the pad before the turn ends: drag it right and let go near the edge, so it snaps to the corner.
const g = await rect(drawer.page, "#padGrip");
await drawer.page.mouse.move(g.x + 30, g.y + g.h / 2);
await drawer.page.mouse.down();
await drawer.page.mouse.move(g.x + 30 + 900, g.y + g.h / 2 - 40, { steps: 8 });
await drawer.page.mouse.up();
const moved = await rect(drawer.page, "#pad");
check("dragging near the right edge snaps the pad to the bottom-right corner", Math.abs(moved.x + moved.w - (moved.vw - 48)) < 3 && Math.abs(moved.y + moved.h - (moved.vh - 48)) < 3, JSON.stringify(moved));
await drawer.page.click('[data-pad-size="1"]');
const bigger = await rect(drawer.page, "#pad");
check("the + button makes the pad bigger and keeps it in the corner", bigger.w > moved.w && Math.abs(bigger.x + bigger.w - (bigger.vw - 48)) < 3);

await guesser.page.tap('.key[data-k="guess"]');
await wait(1500);
check("the guess counts", (await guesser.page.textContent("#chatLog")).includes("You guessed it"));
check("the keys go away after guessing", !(await guesser.page.isVisible("#kbd")));
check("the pad goes away when the turn ends", !(await drawer.page.isVisible("#pad")));

// The next turn: the other classroom draws, and the pad keeps its new place.
let next = null;
for (let i = 0; i < 100 && !next; i++) { if (await guesser.page.$(".choice")) next = guesser; else await wait(150); }
await guesser.page.click(".choice >> nth=0");
await guesser.page.waitForSelector("#pad:not([hidden])");
check("the pad shows for the new drawer", await guesser.page.isVisible("#pad"));
check("the old drawer gets the keys", await drawer.page.isVisible("#kbd"));
await shot(drawer, "04-keys");
await drawer.page.reload();
await drawer.page.waitForSelector("#game:not([hidden])");
check("the smartboard view survives a reload", await drawer.page.evaluate(() => document.documentElement.classList.contains("smartboard")));

console.log(results.join("\n"));
console.log(errors.length ? `ERRORS:\n${errors.join("\n")}` : "no page errors");
await browser.close();
