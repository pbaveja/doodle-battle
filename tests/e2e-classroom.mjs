// Classroom battle: two classes on smartboards, and a phone paired with class 8A's seat that starts
// the game, draws on 8A's turn and guesses on 8B's.
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium, devices } = require(process.env.PW_PATH || "playwright");
const BASE = process.argv[2] || "http://localhost:8787";
const OUT = process.env.SHOTS || join(tmpdir(), "doodle-battle-classroom");
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
  return { name, page };
}
const shot = (d, n) => d.page.screenshot({ path: `${OUT}/${n}-${d.name}.png` });
const board = { viewport: { width: 1920, height: 1080 }, hasTouch: true };
const A = await dev("8A", board), B = await dev("8B", board), P = await dev("phone", { ...devices["iPhone 13"] });
const inkAt = (page, fx, fy) => page.$eval("#board", (cv, [fx, fy]) => {
  const d = cv.getContext("2d").getImageData(Math.round(cv.width * fx) - 4, Math.round(cv.height * fy) - 4, 9, 9).data;
  let dark = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i] < 200) dark++;
  return dark;
}, [fx, fy]);

await A.page.goto(`${BASE}/?students=1&board=1`);
await A.page.fill("#nameInput", "8A");
await A.page.click("#createBtn");
await A.page.waitForSelector("#lobby:not([hidden])");
const code = (await A.page.textContent("#lobbyCode")).trim();
check("pairing is off until classroom battle is on", !(await A.page.isVisible("#pairBtn")));
await A.page.check("#classroomOn");
await A.page.waitForSelector("#pairBtn:not([hidden])");
check("classroom battle says Classes", (await A.page.textContent("#playersTitle")) === "Classes");
await B.page.goto(`${BASE}/r/${code}?board=1`);
await B.page.fill("#nameInput", "8B");
await B.page.click("#joinGo");
await B.page.waitForSelector("#lobby:not([hidden])");

await A.page.click("#pairBtn");
await A.page.waitForSelector("#pairQr svg");
const link = await A.page.inputValue("#pairLink");
check("the pairing link carries a code", /\/r\/[A-Z0-9]{5}\?pair=[A-Za-z0-9_-]{12,}$/.test(link), link);
await shot(A, "01-pair");

// The phone scans the code: no name to enter, it joins as 8A.
await P.page.goto(link);
await P.page.waitForSelector("#lobby:not([hidden])");
check("the phone joins as 8A", (await P.page.textContent("#phoneNote")).includes("8A"));
check("no third player", (await B.page.$$eval("#lobbyPlayers .prow", (r) => r.length)) === 2);
await A.page.waitForFunction(() => document.querySelector("#pairStatus").textContent.includes("1 phone"));
check("the board sees the phone paired", true);
check("8B sees 8A's phone icon", (await B.page.$$eval("#lobbyPlayers .phoneicon", (r) => r.length)) === 1);
check("the phone can't edit 8A's name or look", !(await P.page.isVisible("#meEdit")));
await A.page.click("#pairClose");
await shot(P, "02-phone-lobby");

// 8A is the host, so their phone can start the game.
await P.page.click("#startBtn");
await A.page.waitForSelector("#game:not([hidden])");
const seen = new Set();
for (let turn = 0; turn < 2; turn++) {
  let drawer = null;
  for (let i = 0; i < 100 && !drawer; i++) {
    if (await P.page.$(".choice")) drawer = "8A";
    else if (await B.page.$(".choice")) drawer = "8B";
    else await wait(150);
  }
  seen.add(drawer);
  if (drawer === "8A") {
    check("the phone sees 8A's word choices", true);
    await P.page.click(".choice >> nth=0");
    await P.page.waitForSelector("#tools:not([hidden])");
    const r = await P.page.$eval("#board", (e) => { const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });
    await P.page.touchscreen.tap(r.x + r.w / 2, r.y + r.h / 2); // a dot
    await P.page.mouse.move(r.x + r.w * 0.3, r.y + r.h * 0.4);
    await P.page.mouse.down();
    for (let i = 0; i <= 15; i++) await P.page.mouse.move(r.x + r.w * (0.3 + i * 0.026), r.y + r.h * 0.4);
    await P.page.mouse.up();
    await wait(1400);
    check("8A's phone draws: 8B's board shows it", (await inkAt(B.page, 0.5, 0.4)) > 0);
    check("8A's phone draws: 8A's own board shows it too", (await inkAt(A.page, 0.5, 0.4)) > 0);
    await shot(A, "03-drawn-from-phone");
    await P.page.click("#menuBtn");
    await P.page.click("#menuSkip");
    await P.page.click("#menuSkip");
  } else {
    await B.page.click(".choice >> nth=0");
    await B.page.waitForSelector("#pad:not([hidden])");
    const word = (await B.page.textContent("#padWord")).trim();
    check("8A's board shows the keys while the phone can type too", await A.page.isVisible("#kbd"));
    await P.page.fill("#chatInput", word);
    await P.page.press("#chatInput", "Enter");
    await wait(1200);
    check("8A's phone guesses for the class", (await A.page.textContent("#chatLog")).includes("You guessed it"));
  }
  await wait(2500);
}
check("both classes drew", seen.size === 2, [...seen].join(","));

// A new code unpairs the phone.
await A.page.click("#menuBtn");
await A.page.click("#menuPair");
await A.page.waitForSelector("#pairSheet:not([hidden])");
await A.page.click("#pairReset");
await A.page.click("#pairReset");
await P.page.waitForSelector("#notice:not([hidden])", { timeout: 5000 }).catch(() => {});
check("a new code unpairs the phone", (await P.page.textContent("#noticeTitle").catch(() => "")).includes("unpaired"));
await P.page.goto(link);
await P.page.waitForSelector("#notice:not([hidden])", { timeout: 6000 }).catch(() => {});
check("the old link stops working", (await P.page.textContent("#noticeTitle").catch(() => "")).includes("Pairing didn't work"));

console.log(results.join("\n"));
console.log(errors.length ? `ERRORS:\n${errors.join("\n")}` : "no page errors");
await browser.close();
