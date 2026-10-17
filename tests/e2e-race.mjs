// The race: the first correct guess snaps the clock to 30 seconds for everyone, and when every
// guesser has it the turn ends with the "Everyone got it!" stamp.
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
const require = createRequire(import.meta.url);
const { chromium, devices } = require(process.env.PW_PATH || "playwright");
const BASE = process.argv[2] || "http://localhost:8787";
const browser = await chromium.launch();
const results = [], errors = [];
const check = (n, ok, x = "") => results.push(`${ok ? "PASS" : "FAIL"} ${n}${x ? ` (${x})` : ""}`);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function dev(name, opts) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
  return { name, page };
}
const A = await dev("host", { viewport: { width: 1280, height: 800 } });
const B = await dev("guest1", devices["iPhone 13"]);
const C = await dev("guest2", { viewport: { width: 1024, height: 768 } });
await A.page.goto(BASE);
await A.page.fill("#nameInput", "Asha");
await A.page.click("#createBtn");
await A.page.waitForSelector("#lobby:not([hidden])");
const code = (await A.page.textContent("#lobbyCode")).trim();
for (const [d, n] of [[B, "Ben"], [C, "Chen"]]) {
  await d.page.goto(`${BASE}/r/${code}`);
  await d.page.fill("#nameInput", n);
  await d.page.click("#joinGo");
  await d.page.waitForSelector("#lobby:not([hidden])");
}
await A.page.click("#startBtn");
const all = [A, B, C];
let drawer;
for (let i = 0; i < 40 && !drawer; i++) {
  await wait(250);
  for (const d of all) if (await d.page.locator(".choice").count()) drawer = d;
}
await drawer.page.click(".choice >> nth=0");
await wait(500);
const word = await drawer.page.evaluate(() => window.doodle.app.view.word);
const guessers = all.filter((d) => d !== drawer);
const left = (d) => d.page.evaluate(() => Math.round((window.doodle.app.view.phaseEnds - Date.now()) / 1000));
check("draw time starts long", (await left(guessers[1])) > 60, String(await left(guessers[1])));
await guessers[0].page.fill("#chatInput", word);
await guessers[0].page.press("#chatInput", "Enter");
await wait(800);
const after = await left(guessers[1]);
check("first correct guess snaps everyone's clock to 30", after <= 30 && after >= 27, String(after));
check("clock shows it", Number(await guessers[1].page.textContent("#clockText")) <= 30);
check("chat announces it", (await guessers[1].page.textContent("#chatLog")).includes("got it first! 30 seconds left"));
await guessers[1].page.fill("#chatInput", word);
await guessers[1].page.press("#chatInput", "Enter");
await drawer.page.waitForSelector(".stamp.good", { timeout: 3000 }).catch(() => {});
check("everyone guessed: the turn ends with the stamp", (await drawer.page.locator(".stamp.good").count()) === 1 && /Everyone got it/.test(await drawer.page.textContent(".stamp.good")));
await wait(500);
await drawer.page.screenshot({ path: join(tmpdir(), "doodle-battle-race-stamp.png") });
await drawer.page.waitForSelector(".ocard.reveal", { timeout: 4000 }).catch(() => {});
check("then the leaderboard card", (await drawer.page.locator(".ocard.reveal").count()) === 1);
await browser.close();
for (const r of results) console.log(r);
if (errors.length) console.log("ERRORS:\n" + errors.join("\n"));
const failed = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed || errors.length ? 1 : 0);
