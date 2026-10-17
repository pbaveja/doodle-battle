import { INKS, type Result, type View } from "../../shared/protocol";
import { app, isHost, send, toast } from "../app";
import { avatarHtml } from "../avatar";
import { thumbnail } from "../board";
import { confetti } from "../confetti";
import { sfx } from "../sound";
import { $, esc, twoTap } from "../util";

let celebrated = "";
let requested = new Set<number>();

export function initOver(onLeave: () => void) {
  $("#againBtn").addEventListener("click", () => {
    if (!send({ t: "lobby" })) toast("You're offline. Try again in a moment.", true);
  });
  twoTap($<HTMLButtonElement>("#overLeave"), "Tap again to leave", onLeave);
}

export function resetOver() {
  celebrated = "";
  requested = new Set();
}

/** Results don't carry photos; use the one the player has now, if they're still here. */
const withPhoto = (r: Result) => ({ ...r, photo: app.view?.players.find((p) => p.id === r.id)?.photo ?? 0 });

const CROWN_SVG = `<svg class="crownsvg" viewBox="0 0 84 44" aria-hidden="true"><path pathLength="1" d="M8 38 L4 10 L24 24 L42 4 L60 24 L80 10 L76 38 Z"/></svg>`;

export function renderOver(v: View) {
  const results = v.results ?? [];
  const top = results.filter((r) => r.rank === 1);
  const title = $("#overTitle");
  if (!results.length) title.textContent = "Game over";
  else if (top.length > 1) title.textContent = "It's a tie!";
  else title.textContent = top[0].id === v.you ? "You win!" : `${top[0].name} wins!`;

  const key = `${v.code}:${v.phaseStarted}`;
  const first = celebrated !== key;

  // Podium for 4+ players, a spotlight for smaller games.
  if (first) {
    $("#podium").innerHTML = results.length >= 4 ? podium(results) : spotlight(top);
  }

  $("#rankList").innerHTML = results
    .map(
      (r) => `<li class="${r.id === v.you ? "me" : ""}" style="--pc:${INKS[r.color]}"><span class="rn">${r.rank}</span>${avatarHtml(withPhoto(r), 32)}<span class="nm">${esc(r.name)}${r.id === v.you ? " (you)" : ""}</span><span class="sc">${r.score}</span></li>`,
    )
    .join("");

  const host = isHost();
  $("#againBtn").hidden = !host;
  const hostName = v.players.find((p) => p.id === v.host)?.name ?? "the host";
  $("#againHint").hidden = host;
  $("#againHint").textContent = `Waiting for ${hostName} to start a new game.`;

  renderGallery(v);

  if (first) {
    celebrated = key;
    const colors: string[] = (top.length ? top : results).map((r): string => INKS[r.color]).concat(["#e0a100", "#ffffff", "#2463e6", "#e0322b"]);
    if (results.length >= 4) sfx.drumroll(1.7);
    setTimeout(() => {
      sfx.fanfare();
      confetti(colors);
    }, results.length >= 4 ? 1900 : 500);
  }
}

function podium(results: Result[]): string {
  const ranks = [...new Set(results.map((r) => r.rank))].sort((a, b) => a - b).slice(0, 3);
  const groups = ranks.map((rk) => results.filter((r) => r.rank === rk));
  const order = [1, 0, 2]; // 2nd, 1st, 3rd
  const heights = ["150px", "112px", "84px"];
  const delays = ["1.1s", ".55s", "0s"];
  const ordinal = (n: number) => (n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`);
  return `<div class="podium">${order
    .map((i) => {
      const g = groups[i];
      if (!g) return `<div class="step-col"></div>`;
      const names = g.map((r) => esc(r.name)).join(" & ");
      return `<div class="step-col p${i + 1}" style="--d:${delays[i]};--h:${heights[i]}">
        <div class="step-who"><div class="step-faces">${g.slice(0, 3).map((r) => avatarHtml(withPhoto(r), i === 0 ? 64 : 52)).join("")}</div><span class="step-name">${names}</span></div>
        <div class="step-block"><span class="place">${ordinal(g[0].rank)}</span><span class="score">${g[0].score} pts</span></div>
      </div>`;
    })
    .join("")}</div>`;
}

function spotlight(top: Result[]): string {
  if (!top.length) return "";
  return `<div class="spotlight"><div class="spot-face">${CROWN_SVG}<div class="step-faces">${top.map((r) => avatarHtml(withPhoto(r), 110)).join("")}</div></div>
    <p class="spot-score">${top.length > 1 ? `${top.map((r) => esc(r.name)).join(" and ")} share the win with` : `${esc(top[0].name)} scored`} ${top[0].score} points</p></div>`;
}

export function renderGallery(v: View) {
  const thumbs = [...app.gallery.values()].sort((a, b) => a.turn - b.turn);
  for (let t = 0; t < v.turnsPlayed; t++) {
    if (!app.gallery.has(t) && !requested.has(t)) {
      requested.add(t);
      send({ t: "drawing", turn: t });
    }
  }
  const g = $("#gallery");
  if (!thumbs.length) {
    g.innerHTML = `<p class="emptygal">No drawings this time.</p>`;
    return;
  }
  g.innerHTML = thumbs
    .map((t) => {
      const file = `doodle-battle-${t.word.replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase()}.jpg`;
      return `<figure class="gcard"><div class="gframe">${t.url ? `<img src="${t.url}" alt="${esc(t.name)}'s drawing of ${esc(t.word)}" loading="lazy">` : `<span class="missing">Drawing unavailable</span>`}</div>
        <figcaption><div class="gw">${esc(t.word)}</div><div class="gm"><span style="--pc:${INKS[t.color]}">by <b style="color:var(--pc-text)">${esc(t.name)}</b></span>${t.url ? `<a class="gsave" href="${t.url}" download="${esc(file)}">Save</a>` : ""}</div></figcaption></figure>`;
    })
    .join("");
}

export function addDrawing(d: { turn: number; word: string; by: string; name: string; color: number; items: import("../../shared/protocol").Item[] }) {
  if (app.gallery.has(d.turn)) return;
  app.gallery.set(d.turn, { turn: d.turn, word: d.word, by: d.by, name: d.name, color: d.color, url: thumbnail(d.items, undefined, 900) });
  if (app.view?.phase === "over") renderGallery(app.view);
}
