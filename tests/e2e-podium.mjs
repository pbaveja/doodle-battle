// Five players finish a one-round game quickly; screenshots the podium on laptop and phone.
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
const require = createRequire(import.meta.url);
const { chromium, devices } = require(process.env.PW_PATH || "playwright");
const BASE = process.argv[2] || "http://localhost:8787";
const OUT = process.env.SHOTS || join(tmpdir(), "doodle-battle-shots");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
const names = ["Priya", "Rahul", "Meera", "Kabir", "Zoya"];
const ds = [];
for (let i = 0; i < 5; i++) {
  const opts = i === 4 ? { ...devices["iPhone 13"], colorScheme: "dark" } : { viewport: { width: 1280, height: 860 } };
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  ds.push({ page, name: names[i] });
}
const [host] = ds;
await host.page.goto(BASE);
await host.page.fill("#nameInput", host.name);
await host.page.click("#createBtn");
await host.page.waitForSelector("#lobby:not([hidden])");
const code = (await host.page.textContent("#lobbyCode")).trim();
for (const d of ds.slice(1)) {
  await d.page.goto(`${BASE}/r/${code}`);
  await d.page.fill("#nameInput", d.name);
  await d.page.click("#joinGo");
  await d.page.waitForSelector("#lobby:not([hidden])");
}
await host.page.click('#settings .stepper[data-key="rounds"] [data-d="-1"]');
await host.page.click('#settings .stepper[data-key="rounds"] [data-d="-1"]');
for (let i = 0; i < 3; i++) { await host.page.click('#settings .stepper[data-key="drawTime"] [data-d="-1"]'); await wait(120); }
await wait(300);
await ds[4].page.screenshot({ path: `${OUT}/10-lobby-guest-phone-dark.png`, fullPage: false });
await host.page.click("#startBtn");
let turn = 0;
for (let i = 0; i < 2000; i++) {
  if (await host.page.$("#over:not([hidden])")) break;
  for (const d of ds) {
    const c = await d.page.$(".choice");
    if (c) {
      await c.click().catch(() => {});
      await wait(250);
      const box = await d.page.locator("#board").boundingBox();
      if (box) {
        await d.page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
        await d.page.mouse.down();
        await d.page.mouse.move(box.x + box.width * (0.4 + turn * 0.08), box.y + box.height * 0.7, { steps: 8 });
        await d.page.mouse.up();
      }
      turn++;
      if (turn === 3) setTimeout(async () => {
        try {
          await host.page.waitForSelector(".leaderboard .mv", { timeout: 40000 });
          await host.page.screenshot({ path: `${OUT}/10b-leaderboard-turn3-laptop.png` });
          await ds[4].page.screenshot({ path: `${OUT}/10b-leaderboard-turn3-phone.png` });
        } catch { /* no movement this turn */ }
      }, 0);
      const w = (await d.page.textContent("#wordBox .theword").catch(() => "")).trim();
      // Guess in a different order each turn so scores spread out.
      const order = ds.filter((o) => o !== d).sort(() => Math.random() - 0.5);
      for (const [k, o] of order.entries()) {
        if (k === order.length - 1 && turn === 2) continue; // someone misses sometimes
        await o.page.fill("#chatInput", w);
        await o.page.press("#chatInput", "Enter");
        await wait(150 + k * 120);
      }
    }
  }
  await wait(200);
}
await host.page.waitForSelector("#over:not([hidden])", { timeout: 60000 });
await wait(2600);
await host.page.screenshot({ path: `${OUT}/11-podium-laptop.png` });
await ds[4].page.screenshot({ path: `${OUT}/11-podium-phone-dark.png` });
await host.page.evaluate(() => document.querySelector(".sketchbook").scrollIntoView());
await host.page.screenshot({ path: `${OUT}/12-sketchbook-laptop.png` });
console.log("results", await host.page.$$eval("#rankList li", (l) => l.map((x) => x.textContent.replace(/\s+/g, " ").trim())));
await browser.close();
