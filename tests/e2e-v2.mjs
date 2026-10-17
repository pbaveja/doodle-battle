// New features: categories, nudges, leaderboard animation, end my turn, clear/undo, phone keyboard layout.
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium, devices } = require(process.env.PW_PATH || "playwright");
const BASE = process.argv[2] || "http://localhost:8787";
const OUT = process.env.SHOTS || join(tmpdir(), "doodle-battle-shots2");
mkdirSync(OUT, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
const errors = [], results = [];
const check = (n, ok, x = "") => results.push(`${ok ? "PASS" : "FAIL"} ${n}${x ? ` (${x})` : ""}`);
async function dev(name, opts) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error" && !/ERR_TUNNEL|fonts/.test(m.text())) errors.push(`${name}: ${m.text()}`); });
  return { name, ctx, page };
}
const A = await dev("laptop", { viewport: { width: 1440, height: 900 } });
const B = await dev("laptop2", { viewport: { width: 1280, height: 800 }, colorScheme: "dark" });
const C = await dev("ipad", { ...devices["iPad (gen 7) landscape"] });
const D = await dev("phone", { ...devices["iPhone 13"] });
const all = [A, B, C, D];
const shot = (d, n) => d.page.screenshot({ path: `${OUT}/${n}-${d.name}.png` });

await A.page.goto(BASE);
await A.page.fill("#nameInput", "Priya");
await A.page.click("#createBtn");
await A.page.waitForSelector("#lobby:not([hidden])");
const code = (await A.page.textContent("#lobbyCode")).trim();
for (const [d, n] of [[B, "Rahul"], [C, "Meera"], [D, "Kabir"]]) {
  await d.page.goto(`${BASE}/r/${code}`);
  await d.page.fill("#nameInput", n);
  await d.page.click("#joinGo");
  await d.page.waitForSelector("#lobby:not([hidden])");
}
await A.page.selectOption("#categorySel", "animals");
await A.page.click('#diffSeg [data-v="easy"]');
await A.page.click('#settings .stepper[data-key="rounds"] [data-d="-1"]');
await A.page.click('#settings .stepper[data-key="rounds"] [data-d="-1"]');
for (let i = 0; i < 3; i++) { await A.page.click('#settings .stepper[data-key="drawTime"] [data-d="-1"]'); await wait(100); }
await wait(300);
check("category syncs to guests", (await D.page.$eval("#categorySel", (s) => s.value)) === "animals");
await shot(A, "01-lobby");
await shot(D, "01-lobby");

await A.page.click("#startBtn");
let drawer = null;
for (let i = 0; i < 60 && !drawer; i++) { for (const d of all) if (await d.page.$(".choice")) drawer = d; if (!drawer) await wait(150); }
const metas = await drawer.page.$$eval(".choice .cmeta", (n) => n.map((x) => x.textContent));
check("choices show category and level", metas.every((m) => /Animals · Easy/.test(m)), metas.join(", "));
await shot(drawer, "02-choices");
await drawer.page.click(".choice >> nth=0");
await drawer.page.waitForSelector("#tools:not([hidden])");
const word = (await drawer.page.textContent("#wordBox .theword")).trim();
const guessers = all.filter((d) => d !== drawer);
console.log("drawer", drawer.name, "word", word);
await wait(300);
const chip = await guessers[0].page.textContent("#wordBox .catchip").catch(() => null);
check("guessers see the category chip", chip === "Animals", chip);

// Draw, clear, undo
const box = await drawer.page.locator("#board").boundingBox();
const P = (x, y) => [box.x + box.width * x, box.y + box.height * y];
const m = drawer.page.mouse;
await m.move(...P(0.3, 0.3)); await m.down(); await m.move(...P(0.7, 0.6), { steps: 10 }); await m.move(...P(0.4, 0.8), { steps: 10 }); await m.up();
const ink = (d) => d.page.evaluate(() => { const c = document.getElementById("board"); const x = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < x.length; i += 4 * 31) if (x[i] < 200) n++; return n; });
await wait(500);
const before = await ink(guessers[0]);
await drawer.page.click("#clearBtn");
await wait(500);
check("clear empties the canvas everywhere", (await ink(guessers[0])) === 0 && (await ink(drawer)) === 0);
await drawer.page.click("#undoBtn");
await wait(500);
check("undo brings the drawing back", (await ink(guessers[0])) === before, `${before}`);

for (const d of all) await shot(d, "03-drawing");

// Nudges
const g = guessers.find((d) => d === D) ?? guessers[0];
// One letter off for short words, two for 6-7 letters, three for longer: past a forgivable typo, inside "very close".
const subs = word.length <= 5 ? 1 : word.length <= 7 ? 2 : 3;
const chars = [...word];
for (let k = 0, i = chars.length - 1; k < subs && i >= 0; i--) {
  if (!/[a-z]/i.test(chars[i])) continue;
  const near0 = { q: "wa", z: "asx", p: "ol" };
  const pick = ["q", "z", "p"].find((c) => c !== chars[i].toLowerCase() && !near0[c].includes(chars[i].toLowerCase()));
  chars[i] = pick; k++;
}
const near = chars.join("");
await g.page.fill("#chatInput", near);
await g.page.press("#chatInput", "Enter");
await wait(300);
const nudges = await g.page.$$eval("#chatLog .cm.close, #chatLog .cm.warm", (n) => n.map((x) => x.textContent));
check("near miss gets a private nudge", nudges.length > 0, nudges.join(" | "));
const swapped = word.slice(0, 1) + word[2] + word[1] + word.slice(3);
await g.page.fill("#chatInput", swapped);
await g.page.press("#chatInput", "Enter");
await wait(400);
const you = await g.page.$$eval("#chatLog .cm.you", (n) => n.map((x) => x.textContent));
check("a typo counts as correct", you.some((t) => /close enough/.test(t)), you.join(" | "));
await shot(g, "04-nudges");

// Leaderboard after the turn
for (const o of guessers.filter((d) => d !== g).slice(0, 1)) { await o.page.fill("#chatInput", word); await o.page.press("#chatInput", "Enter"); await wait(300); }
await drawer.page.click("#menuBtn");
await drawer.page.waitForSelector("#menuSkip:not([hidden])");
await shot(drawer, "05-menu");
await drawer.page.click("#menuSkip");
await drawer.page.click("#menuSkip");
await A.page.waitForSelector(".leaderboard");
await wait(250);
for (const d of all) await shot(d, "06-reveal-early");
const reason = await A.page.textContent(".revealhead .lede");
check("end my turn shows in the reveal", /ended their turn/.test(reason), reason);
await wait(1800);
for (const d of all) await shot(d, "07-reveal-final");
const order = await A.page.$$eval(".leaderboard .lb .lbname", (n) => n.map((x) => x.firstChild.textContent));
const ranks = await A.page.$$eval(".leaderboard .lb .lbtotal", (n) => n.map((x) => Number(x.textContent)));
check("leaderboard ends sorted by score", ranks.every((v, i) => i === 0 || ranks[i - 1] >= v), `${order.join(",")} ${ranks.join(",")}`);

// Phone with the keyboard open: shrink the visible height, the canvas should keep its size
await A.page.waitForSelector(".choice, #overlay .ocard h2", { timeout: 10000 }).catch(() => {});
let phoneDrawer = !!(await D.page.$(".choice"));
await wait(500);
const sizeBefore = await D.page.$eval("#board", (c) => c.getBoundingClientRect().height);
await D.page.click("#chatInput").catch(() => {});
await D.page.setViewportSize({ width: 390, height: 470 });
await wait(400);
const sizeAfter = await D.page.$eval("#board", (c) => c.getBoundingClientRect().height);
const kb = await D.page.evaluate(() => document.body.classList.contains("kb"));
check("phone canvas stays big with the keyboard open (chat gets ~3 lines)", kb && sizeAfter >= sizeBefore * 0.85, `${Math.round(sizeBefore)} -> ${Math.round(sizeAfter)}, drawer: ${phoneDrawer}`);
await shot(D, "08-keyboard");
await D.page.setViewportSize({ width: 390, height: 664 });
await wait(400);
await shot(D, "09-after-keyboard");

console.log(results.join("\n"));
console.log(errors.length ? `ERRORS:\n${errors.join("\n")}` : "no page errors");
await browser.close();
