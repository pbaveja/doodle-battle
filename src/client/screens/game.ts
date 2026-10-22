import { INKS, PALETTE, PALETTE_NAMES, TIMING, type View } from "../../shared/protocol";
import { app, inviteLink, isHost, player, send, serverNow, toast } from "../app";
import { avatarHtml } from "../avatar";
import { Board, thumbnail, type Tool } from "../board";
import { focusChat, mountChat, setChatMode } from "../chat";
import {
  canFullscreen, initSmartboard, isFullscreen, isSmartboard, renderSmartboard, setSmartboard, toggleFullscreen,
} from "../smartboard";
import { buzz, sfx } from "../sound";
import { voiceMark } from "../voiceui";
import { $, $$, copyText, esc, plural, reducedMotion, twoTap } from "../util";

export let board: Board;

const PENCIL = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`;
const CHECK = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;
const MOON = `<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1Z"/></svg>`;
const CROWN = `<svg class="crown" viewBox="0 0 24 24" width="14" height="14" aria-label="Host"><path d="M3 18h18l-1.5-10-5 4L12 5l-2.5 7-5-4Z" fill="currentColor"/></svg>`;

const STAMP_MS = 1100;
const LEADERBOARD_DELAY = 1000;

let overlayKey = "";
let overlayTimer = 0;
let animTimer = 0;
let clockTimer = 0;
let lastTickSec = -1;
let warned = -1;
const plus = new Map<string, { pts: number; until: number }>();
let wakeLock: { release(): Promise<void> } | null = null;

export function initGame(onLeave: () => void) {
  board = new Board($<HTMLCanvasElement>("#board"), $("#cursor"));
  board.onSend = (v, ops) => send({ t: "draw", v, ops });
  board.onDesync = () => send({ t: "sync" });
  board.onFull = () => toast("This drawing is getting huge. Undo or clear to keep going.", true);
  board.onChange = syncToolState;
  initSmartboard(board, () => {
    syncBoardSwitches();
    if (app.view && inGame(app.view)) renderGame(app.view, null);
  });
  syncBoardSwitches();

  // Palette
  const pal = $("#palette");
  pal.innerHTML = PALETTE.map(
    (c, i) => `<button type="button" class="pen" style="--c:${c}" data-c="${i}" aria-label="${PALETTE_NAMES[i]}" title="${PALETTE_NAMES[i]}"></button>`,
  ).join("");
  pal.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>(".pen");
    if (!b) return;
    board.color = Number(b.dataset.c);
    if (board.tool === "eraser") board.tool = "brush";
    syncToolState();
  });
  for (const b of $$<HTMLButtonElement>("[data-tool]")) {
    b.addEventListener("click", () => {
      board.tool = b.dataset.tool as Tool;
      syncToolState();
    });
  }
  for (const b of $$<HTMLButtonElement>("[data-size]")) {
    b.addEventListener("click", () => {
      board.size = Number(b.dataset.size);
      if (board.tool === "fill") board.tool = "brush";
      syncToolState();
    });
  }
  $("#undoBtn").addEventListener("click", () => board.undo());
  // Clearing is undoable, so it takes one tap.
  $("#clearBtn").addEventListener("click", () => {
    if (board.isEmpty) return;
    board.clear();
    toast("Page cleared. Tap undo to bring it back.");
  });
  syncToolState();

  // Keyboard shortcuts for the drawer
  window.addEventListener("keydown", (e) => {
    if (!board.enabled) return;
    const t = e.target as HTMLElement;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;
    const k = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && k === "z") {
      e.preventDefault();
      board.undo();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (k === "b") board.tool = "brush";
    else if (k === "e") board.tool = "eraser";
    else if (k === "f") board.tool = "fill";
    else if (["1", "2", "3", "4"].includes(k)) board.size = Number(k) - 1;
    else if (k === "[") board.size = Math.max(0, board.size - 1);
    else if (k === "]") board.size = Math.min(3, board.size + 1);
    else return;
    syncToolState();
  });

  // Menu
  const menu = $("#menu");
  const menuBtn = $("#menuBtn");
  const closeMenu = () => {
    menu.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
  };
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
    menuBtn.setAttribute("aria-expanded", String(!menu.hidden));
    renderMenu();
  });
  document.addEventListener("click", (e) => {
    if (!menu.hidden && !menu.contains(e.target as Node)) closeMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
  $("#menuKick").addEventListener("click", onMenuKick);
  $("#menuInvite").addEventListener("click", async () => {
    const ok = await copyText(inviteLink());
    toast(ok ? "Invite link copied" : `Share this link: ${inviteLink()}`, !ok, ok ? 2600 : 6000);
    closeMenu();
  });
  $("#menuBoard").addEventListener("click", () => {
    setSmartboard(!isSmartboard());
    closeMenu();
  });
  $("#menuFull").addEventListener("click", () => {
    toggleFullscreen();
    closeMenu();
  });
  twoTap($<HTMLButtonElement>("#menuSkip"), "Tap again to end your turn", () => {
    if (!send({ t: "skip" })) toast("You're offline. Try again in a moment.", true);
    closeMenu();
  });
  twoTap($<HTMLButtonElement>("#menuEnd"), "Tap again to end the game", () => {
    send({ t: "end" });
    closeMenu();
  });
  twoTap($<HTMLButtonElement>("#menuLeave"), "Tap again to leave", () => {
    closeMenu();
    onLeave();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && app.view && inGame(app.view)) void requestWake();
  });
}

/** Every smartboard switch (home, lobby, game menu) shows the same state. */
function syncBoardSwitches() {
  for (const c of $$<HTMLInputElement>("[data-smartboard]")) c.checked = isSmartboard();
  $("#menuBoard").textContent = `Smartboard view: ${isSmartboard() ? "on" : "off"}`;
}

function renderMenu() {
  const v = app.view;
  $("#menuCode").textContent = app.code;
  syncBoardSwitches();
  const full = $("#menuFull");
  full.hidden = !canFullscreen();
  full.textContent = isFullscreen() ? "Exit full screen" : "Full screen";
  $("#menuEnd").hidden = !(v && isHost() && inGame(v));
  $("#menuSkip").hidden = !(v && v.drawer === v.you && (v.phase === "choosing" || v.phase === "drawing"));
  const kick = $("#menuKick");
  const others = v ? v.players.filter((p) => p.id !== v.you) : [];
  kick.hidden = !(v && isHost() && others.length);
  kick.innerHTML = kick.hidden
    ? ""
    : `<p class="menu-code">Remove a player</p>${others
        .map((p) => `<button type="button" class="menuitem" data-kick="${esc(p.id)}">${avatarHtml(p, 24)}<span>${esc(p.name)}</span></button>`)
        .join("")}`;
}

function onMenuKick(e: Event) {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-kick]");
  if (!b) return;
  e.stopPropagation();
  if (b.classList.contains("armed")) {
    send({ t: "kick", pid: b.dataset.kick! });
    $("#menu").hidden = true;
    return;
  }
  const label = b.innerHTML;
  b.classList.add("armed");
  b.textContent = "Tap again to remove";
  setTimeout(() => {
    if (!b.isConnected) return;
    b.classList.remove("armed");
    b.innerHTML = label;
  }, 2800);
}

function syncToolState() {
  for (const b of $$<HTMLButtonElement>("[data-tool]")) b.setAttribute("aria-pressed", String(b.dataset.tool === board.tool));
  for (const b of $$<HTMLButtonElement>("[data-size]")) b.setAttribute("aria-pressed", String(Number(b.dataset.size) === board.size && board.tool !== "fill"));
  for (const b of $$<HTMLButtonElement>(".pen")) b.setAttribute("aria-pressed", String(Number(b.dataset.c) === board.color && board.tool !== "eraser"));
  $<HTMLButtonElement>("#undoBtn").disabled = !board.canUndo;
  $<HTMLButtonElement>("#clearBtn").disabled = board.isEmpty;
  $("#paperWrap").classList.toggle("fill", board.tool === "fill");
  $("#tools").style.setProperty("--pen", board.tool === "eraser" ? "var(--muted)" : PALETTE[board.color]);
}

export function inGame(v: View) {
  return v.phase === "choosing" || v.phase === "drawing" || v.phase === "reveal" || v.phase === "waiting";
}

export async function requestWake() {
  try {
    const nav = navigator as Navigator & { wakeLock?: { request(t: "screen"): Promise<{ release(): Promise<void> }> } };
    if (nav.wakeLock && !wakeLock) {
      wakeLock = await nav.wakeLock.request("screen");
      (wakeLock as unknown as EventTarget).addEventListener?.("release", () => (wakeLock = null));
    }
  } catch {
    wakeLock = null;
  }
}

export function releaseWake() {
  try { void wakeLock?.release(); } catch { /* ignore */ }
  wakeLock = null;
}

export function showGame() {
  mountChat("#gameChat");
  void requestWake();
}

export function stopGameTimers() {
  renderSmartboard(null);
  clearInterval(clockTimer);
  clockTimer = 0;
  clearTimeout(overlayTimer);
  clearTimeout(animTimer);
  overlayKey = "";
}

/* ---------------- rendering ---------------- */

const shownLetters = (m: (string | null)[] | null) => (m ? m.filter((c) => c !== null && /[\p{L}\p{N}]/u.test(c)).length : 0);

export function renderGame(v: View, prev: View | null) {
  const you = v.you;
  const isDrawer = v.drawer === you;
  const guessed = v.guessed.includes(you);
  const online = !!app.conn?.live && app.synced;
  const drawing = v.phase === "drawing";

  $("#game").classList.toggle("is-drawer", isDrawer && (drawing || v.phase === "choosing"));
  $("#roundLabel").innerHTML = v.phase === "waiting" ? "Paused" : `Round ${v.round}<span class="of"> of ${v.rounds}</span>`;

  // Sounds and haptics on transitions
  if (prev) {
    const newTurn = prev.turn !== v.turn;
    if (newTurn && v.phase === "choosing") {
      if (v.firstInRound) sfx.roundStart();
      if (isDrawer) {
        setTimeout(sfx.yourTurn, v.firstInRound ? 500 : 0);
        buzz([30, 40, 30]);
      }
    }
    if (prev.phase === "drawing" && v.phase === "reveal") {
      if (v.reason === "time") sfx.timeUp();
      if (v.reason === "all") sfx.allGuessed();
      else if (v.guessed.length === 0 && v.reason !== "drawer_left") setTimeout(sfx.nobody, v.reason === "time" ? 650 : 0);
    }
    if (!newTurn && drawing && prev.phase === "drawing" && shownLetters(v.mask) > shownLetters(prev.mask)) sfx.hint();
    // The first correct guess snapped the clock down: whoosh, and shake the hourglass.
    if (!newTurn && drawing && prev.phase === "drawing" && v.phaseEnds && prev.phaseEnds && prev.phaseEnds - v.phaseEnds > 2000) {
      sfx.snap();
      const clock = $("#clock");
      clock.classList.remove("snapped");
      void clock.offsetWidth;
      clock.classList.add("snapped");
    }
    if (prev.players.length > v.players.length) sfx.leave();
    if (newTurn) plus.clear();
  }

  renderWord(v, isDrawer, guessed);
  renderPlayers(v);
  renderOverlay(v, isDrawer);
  renderAway(v, isDrawer, online);

  // Tools and board
  const canDraw = isDrawer && drawing;
  $("#tools").hidden = !canDraw;
  const enabled = canDraw && online;
  if (board.enabled && !enabled) board.cancelInput();
  board.enabled = enabled;
  $("#paperWrap").classList.toggle("drawing", enabled);
  syncToolState();
  if (!$("#menu").hidden) renderMenu();

  // Chat input
  if (!online) setChatMode({ placeholder: "Reconnecting…", disabled: true, cls: "" });
  else if (isDrawer && (drawing || v.phase === "choosing")) setChatMode({ placeholder: "You're drawing. Chat opens after your turn.", disabled: true, cls: "" });
  else if (drawing && guessed) setChatMode({ placeholder: "Chat with players who guessed", disabled: false, cls: "guessed" });
  else if (drawing) setChatMode({ placeholder: "Type your guess here", disabled: false, cls: "guess" });
  else setChatMode({ placeholder: "Say something", disabled: false, cls: "" });
  // On a smartboard the on-screen keys take the guesses (and a plugged-in keyboard's typing).
  if (drawing && !isDrawer && !guessed && prev?.phase !== "drawing" && !isSmartboard()) focusChat();
  renderSmartboard(v);

  maybeCapture(v);
  startClock();
}

const catChip = (c: string | null) => (c ? `<span class="catchip">${esc(c)}</span>` : "");

function renderWord(v: View, isDrawer: boolean, guessed: boolean) {
  const box = $("#wordBox");
  const drawerName = esc(player(v.drawer)?.name ?? "Someone");
  let html = "";
  let got = false;
  if (v.phase === "choosing") {
    html = isDrawer ? `<span class="say">Pick a word to draw</span>` : `<span class="say">${drawerName} is picking a word…</span>`;
  } else if (v.phase === "drawing") {
    if (isDrawer && v.word) html = `<span class="say">Draw</span><span class="theword">${esc(v.word)}</span>${catChip(v.category)}`;
    else if (guessed && v.word) {
      got = true;
      html = `<span class="say">You got it</span><span class="theword">${esc(v.word)}</span>`;
    } else if (v.mask) html = slotsHtml(v.mask) + catChip(v.category);
  } else if (v.phase === "reveal") {
    html = v.word ? `<span class="say">The word was</span><span class="theword">${esc(v.word)}</span>` : "";
  } else if (v.phase === "waiting") {
    html = `<span class="say">Waiting for more players</span>`;
  }
  box.classList.toggle("got", got);
  if (box.dataset.html !== html) {
    box.innerHTML = html;
    box.dataset.html = html;
  }
}

function slotsHtml(mask: (string | null)[]): string {
  const words: (string | null)[][] = [[]];
  for (const ch of mask) {
    if (ch === " ") words.push([]);
    else words[words.length - 1].push(ch);
  }
  const counts = words.map((w) => w.filter((c) => c === null || /[\p{L}\p{N}]/u.test(c)).length).filter((n) => n > 0);
  const slots = words
    .filter((w) => w.length)
    .map(
      (w) =>
        `<span class="slotword">${w
          .map((c) => (c === null ? `<span class="slot"></span>` : /[\p{L}\p{N}]/u.test(c) ? `<span class="slot shown">${esc(c)}</span>` : `<span class="slot sym">${esc(c)}</span>`))
          .join("")}</span>`,
    )
    .join("");
  const label = counts.join(" ");
  const spoken = counts.length > 1 ? `${counts.length} words: ${counts.join(", ")} letters` : `${counts[0] ?? 0} letters`;
  return `<span class="slots" role="img" aria-label="${esc(`Hidden word, ${spoken}`)}">${slots}<span class="lettercount" aria-hidden="true">${label}</span></span>`;
}

function rankMap(list: { id: string; score: number }[]) {
  const sorted = [...list].sort((a, b) => b.score - a.score);
  const ranks = new Map<string, number>();
  let rank = 0, last = Number.NaN;
  sorted.forEach((p, i) => {
    if (p.score !== last) rank = i + 1;
    last = p.score;
    ranks.set(p.id, rank);
  });
  return ranks;
}

/** Replace a list's contents and slide items that moved from their old place to their new one. */
function flipReplace(container: HTMLElement, html: string) {
  const before = new Map<string, DOMRect>();
  for (const el of Array.from(container.children) as HTMLElement[]) if (el.dataset.id) before.set(el.dataset.id, el.getBoundingClientRect());
  container.innerHTML = html;
  if (reducedMotion() || !before.size) return;
  for (const el of Array.from(container.children) as HTMLElement[]) {
    const old = el.dataset.id ? before.get(el.dataset.id) : undefined;
    if (!old) continue;
    const now = el.getBoundingClientRect();
    const dx = old.left - now.left, dy = old.top - now.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
    el.style.transition = "none";
    el.style.transform = `translate(${dx}px, ${dy}px)`;
    requestAnimationFrame(() => {
      el.style.transition = "transform .55s cubic-bezier(.2,.8,.2,1)";
      el.style.transform = "";
    });
  }
}

function renderPlayers(v: View) {
  const ranks = rankMap(v.players);
  const ranked = [...v.players].sort((a, b) => b.score - a.score);
  const now = Date.now();
  const html = ranked
    .map((p) => {
      const mine = p.id === v.you;
      const isDrawer = p.id === v.drawer && (v.phase === "drawing" || v.phase === "choosing");
      const got = v.guessed.includes(p.id) && (v.phase === "drawing" || v.phase === "reveal");
      const badge = p.away
        ? `<span class="badge off" title="${p.connected ? "Away" : "Reconnecting"}">${MOON}</span>`
        : isDrawer
          ? `<span class="badge drawing" title="Drawing">${PENCIL}</span>`
          : got
            ? `<span class="badge got" title="Guessed it">${CHECK}</span>`
            : "";
      const pl = plus.get(p.id);
      const plusHtml = pl && pl.until > now ? `<span class="plus" style="animation-delay:${-(1600 - (pl.until - now))}ms">+${pl.pts}</span>` : "";
      return `<li class="prow${mine ? " me" : ""}${p.away && !mine ? " off" : ""}${got ? " guessed" : ""}" data-id="${esc(p.id)}" style="--pc:${INKS[p.color]}">
        <span class="rank">${ranks.get(p.id)}</span>
        ${avatarHtml(p, 36)}
        <div style="min-width:0"><span class="pname"><span>${esc(p.name)}${mine ? " (you)" : ""}</span>${p.id === v.host ? CROWN : ""}${voiceMark(p)}</span><span class="pscore">${p.score} pts</span></div>
        ${badge}${plusHtml}
      </li>`;
    })
    .join("");
  const list = $("#gamePlayers");
  if (list.dataset.html === html) return;
  list.dataset.html = html;
  flipReplace(list, html);
}

export function scored(id: string, pts: number) {
  plus.set(id, { pts, until: Date.now() + 1600 });
  if (id === app.you) {
    sfx.correct();
    buzz(40);
  } else sfx.otherCorrect();
  if (app.view) renderPlayers(app.view);
}

function renderAway(v: View, isDrawer: boolean, online: boolean) {
  const chip = $("#awayChip");
  const d = player(v.drawer);
  if (!online && isDrawer && (v.phase === "drawing" || v.phase === "choosing")) {
    chip.hidden = false;
    chip.textContent = "Reconnecting… your drawing is saved";
  } else if (d && d.away && d.id !== v.you && (v.phase === "drawing" || v.phase === "choosing")) {
    chip.hidden = false;
    chip.textContent = `Waiting for ${d.name} to come back…`;
  } else chip.hidden = true;
}

const LEVEL_LABEL = { easy: "Easy", medium: "Medium", hard: "Hard", custom: "Your words" } as const;
/** The drawer's prize for each difficulty, matching DRAWER_LEVEL_BONUS in rules.ts. */
const LEVEL_PRIZE = { easy: "", medium: " ×1.25", hard: " ×1.5", custom: "" } as const;

function revealReason(v: View): string {
  const drawer = player(v.drawer);
  const name = esc(drawer?.name ?? "The drawer");
  switch (v.reason) {
    case "all": return "Everyone guessed it!";
    case "drawer_left": return `${name} left, so the turn ended early.`;
    case "ended": return "Everyone else left, so the turn ended.";
    case "skipped": return `${name} ended their turn.${v.guessed.length ? ` ${plural(v.guessed.length, "player")} got it.` : ""}`;
    default: return v.guessed.length === 0 ? "Nobody got it this time." : `${plural(v.guessed.length, "player")} got it.`;
  }
}

interface LbRow { id: string; name: string; face: number; color: number; photo: number; old: number; now: number; pts: number; drew: boolean; oldRank: number; newRank: number; oldPos: number; newPos: number }

function leaderboardRows(v: View): LbRow[] {
  const pts = new Map((v.turnScores ?? []).map((s) => [s.id, s.pts]));
  const rows = v.players.map((p) => {
    const gained = pts.get(p.id) ?? 0;
    return { id: p.id, name: p.name, face: p.face, color: p.color, photo: p.photo, old: p.score - gained, now: p.score, pts: gained, drew: p.id === v.drawer, oldRank: 0, newRank: 0, oldPos: 0, newPos: 0 };
  });
  // Positions in the list before and after. Ties keep this turn's scorers first, so nobody
  // "drops" just because the whole table started level.
  [...rows].sort((a, b) => b.old - a.old || b.pts - a.pts || a.name.localeCompare(b.name)).forEach((r, i) => (r.oldPos = i));
  [...rows].sort((a, b) => b.now - a.now || b.pts - a.pts || a.name.localeCompare(b.name)).forEach((r, i) => (r.newPos = i));
  const oldRanks = rankMap(rows.map((r) => ({ id: r.id, score: r.old })));
  const newRanks = rankMap(rows.map((r) => ({ id: r.id, score: r.now })));
  for (const r of rows) {
    r.oldRank = oldRanks.get(r.id)!;
    r.newRank = newRanks.get(r.id)!;
  }
  return rows;
}

function lbRow(r: LbRow, final: boolean, you: string): string {
  const rank = final ? r.newRank : r.oldRank;
  const move = r.oldPos - r.newPos;
  const mv = final && move !== 0 ? `<span class="mv ${move > 0 ? "up" : "down"}" aria-label="${move > 0 ? "up" : "down"} ${Math.abs(move)}">${Math.abs(move)}</span>` : "";
  return `<li class="lb${r.id === you ? " me" : ""}" data-id="${esc(r.id)}" style="--pc:${INKS[r.color]}">
    <span class="lbrank">${rank}</span>${avatarHtml(r, 28)}
    <span class="lbname">${esc(r.name)}${r.drew ? `<span class="tag2">drew</span>` : ""}</span>
    ${mv}<span class="lbpts${r.pts ? "" : " zero"}">+${r.pts}</span><span class="lbtotal" data-from="${r.old}" data-to="${r.now}">${final ? r.now : r.old}</span>
  </li>`;
}

/** Slide the leaderboard from the old order to the new one and count the totals up. */
function animateLeaderboard(list: HTMLElement, rows: LbRow[], you: string) {
  const items = new Map<string, HTMLElement>();
  for (const el of Array.from(list.children) as HTMLElement[]) items.set(el.dataset.id!, el);
  const first = new Map<string, number>();
  items.forEach((el, id) => first.set(id, el.getBoundingClientRect().top));
  const order = [...rows].sort((a, b) => a.newPos - b.newPos);
  for (const r of order) {
    const el = items.get(r.id);
    if (!el) continue;
    list.appendChild(el);
    el.querySelector(".lbrank")!.textContent = String(r.newRank);
    const move = r.oldPos - r.newPos;
    if (move !== 0 && !el.querySelector(".mv")) {
      el.querySelector(".lbpts")!.insertAdjacentHTML("beforebegin", `<span class="mv ${move > 0 ? "up" : "down"}" aria-label="${move > 0 ? "up" : "down"} ${Math.abs(move)}">${Math.abs(move)}</span>`);
    }
  }
  const moved = order.some((r) => r.oldPos !== r.newPos);
  items.forEach((el, id) => {
    const dy = (first.get(id) ?? 0) - el.getBoundingClientRect().top;
    if (Math.abs(dy) < 1) return;
    el.style.transition = "none";
    el.style.transform = `translateY(${dy}px)`;
    el.classList.add("moving");
    requestAnimationFrame(() => {
      el.style.transition = "transform .7s cubic-bezier(.2,.8,.2,1)";
      el.style.transform = "";
      setTimeout(() => el.classList.remove("moving"), 750);
    });
  });
  // Count the totals up
  const start = performance.now();
  const totals = Array.from(list.querySelectorAll<HTMLElement>(".lbtotal"));
  const step = (t: number) => {
    const k = Math.min(1, (t - start) / 700);
    const e = 1 - Math.pow(1 - k, 3);
    for (const el of totals) {
      const from = Number(el.dataset.from), to = Number(el.dataset.to);
      el.textContent = String(Math.round(from + (to - from) * e));
    }
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  if (moved) sfx.shuffle();
  const mine = rows.find((r) => r.id === you);
  if (mine && mine.newPos < mine.oldPos) setTimeout(sfx.rankUp, 250);
  else if (mine && mine.newPos > mine.oldPos) setTimeout(sfx.rankDown, 250);
}

function renderOverlay(v: View, isDrawer: boolean) {
  const ov = $("#overlay");
  const drawer = player(v.drawer);
  const sinceStart = serverNow() - (v.phaseStarted ?? 0);
  let key = `${v.phase}:${v.turn}`;
  let html = "";
  let clear = false;
  let next = 0;
  let leaderboard: { rows: LbRow[]; delay: number } | null = null;

  if (v.phase === "choosing") {
    const banner = v.firstInRound && sinceStart < TIMING.roundBannerMs;
    if (banner) {
      key += ":banner";
      clear = true;
      html = `<div class="stamp round">Round ${v.round}<small>of ${v.rounds}</small></div>`;
      next = TIMING.roundBannerMs - sinceStart + 20;
    } else if (isDrawer && v.choices) {
      key += `:pick:${v.choices.map((c) => c.word).join("|")}`;
      html = `<div class="ocard"><p class="eyebrow">Your turn</p><h2 class="h2">Pick a word to draw</h2>
        <div class="choices">${v.choices
          .map((c, i) => `<button type="button" class="choice" data-i="${i}"><span class="cw">${esc(c.word)}</span><span class="cmeta">${esc(c.category ?? "Your words")}${c.level !== "custom" ? ` · ${LEVEL_LABEL[c.level]}${LEVEL_PRIZE[c.level]}` : ""}</span></button>`)
          .join("")}</div>
        <p class="lede">If you don't pick, one is chosen for you.</p></div>`;
    } else {
      key += `:wait:${drawer?.id}:${drawer?.connected}`;
      html = `<div class="ocard">${drawer ? avatarHtml(drawer, 72) : ""}
        <h2 class="h2">${esc(drawer?.name ?? "Someone")} is picking a word</h2><p class="lede">Get ready to guess.</p></div>`;
    }
  } else if (v.phase === "reveal") {
    const stamped = v.reason === "time" || v.reason === "all";
    const stamp = stamped && sinceStart < STAMP_MS;
    if (stamp) {
      key += ":stamp";
      clear = true;
      html = v.reason === "all" ? `<div class="stamp good">Everyone got it!</div>` : `<div class="stamp">Time's up</div>`;
      next = STAMP_MS - sinceStart + 20;
    } else {
      key += ":card";
      const rows = leaderboardRows(v);
      const cardStart = stamped ? STAMP_MS : 0;
      const delay = cardStart + LEADERBOARD_DELAY - sinceStart;
      const final = delay <= 0;
      const ordered = [...rows].sort((a, b) => (final ? a.newPos - b.newPos : a.oldPos - b.oldPos));
      html = `<div class="ocard reveal">
        <div class="revealhead"><p class="eyebrow">The word was</p><p class="revealword">${esc(v.word ?? "")}</p><p class="lede">${revealReason(v)}</p></div>
        <ol class="leaderboard" aria-label="Leaderboard">${ordered.map((r) => lbRow(r, final, v.you)).join("")}</ol></div>`;
      if (!final) leaderboard = { rows, delay };
    }
  } else if (v.phase === "waiting") {
    const away = v.players.filter((p) => p.away && p.id !== v.you);
    key += `:waiting:${away.map((p) => p.id).join(",")}`;
    const who = away.length ? `Waiting for ${away.map((p) => esc(p.name)).join(", ")} to come back.` : "You need at least 2 players to keep going.";
    html = `<div class="ocard"><h2 class="h2">Game paused</h2>
      <p class="lede">${who} Back to the lobby in <b id="waitLeft">60</b> seconds.</p>
      <button type="button" class="btn primary" id="waitInvite">Copy invite link</button></div>`;
  } else {
    key = "none";
  }

  if (key === overlayKey) return;
  overlayKey = key;
  clearTimeout(overlayTimer);
  clearTimeout(animTimer);
  if (next > 0) overlayTimer = window.setTimeout(() => app.view && renderOverlay(app.view, app.view.drawer === app.you), next);
  if (!html) {
    ov.hidden = true;
    ov.innerHTML = "";
    return;
  }
  ov.hidden = false;
  ov.classList.toggle("clear", clear);
  ov.innerHTML = html;
  if (leaderboard) {
    const lb = leaderboard;
    animTimer = window.setTimeout(() => {
      const list = ov.querySelector<HTMLElement>(".leaderboard");
      if (list && overlayKey === key) animateLeaderboard(list, lb.rows, v.you);
    }, lb.delay);
  }
  ov.querySelectorAll<HTMLButtonElement>(".choice").forEach((b) =>
    b.addEventListener("click", () => {
      if (!send({ t: "choose", i: Number(b.dataset.i) })) toast("You're offline. Try again in a moment.", true);
      else sfx.pick();
    }),
  );
  ov.querySelector("#waitInvite")?.addEventListener("click", async () => {
    const ok = await copyText(inviteLink());
    toast(ok ? "Invite link copied" : `Share this link: ${inviteLink()}`, !ok);
  });
}

/* ---------------- clock ---------------- */

function startClock() {
  if (!clockTimer) clockTimer = window.setInterval(tickClock, 200);
  tickClock();
}

function tickClock() {
  const v = app.view;
  const clock = $("#clock");
  if (!v || !inGame(v)) return;
  const showClock = (v.phase === "choosing" || v.phase === "drawing") && v.phaseEnds;
  clock.style.visibility = showClock ? "visible" : "hidden";
  const now = serverNow();
  if (v.phase === "waiting" && v.phaseEnds) {
    const el = document.getElementById("waitLeft");
    if (el) el.textContent = String(Math.max(0, Math.ceil((v.phaseEnds - now) / 1000)));
  }
  if (!showClock || !v.phaseEnds) return;
  const drawing = v.phase === "drawing";
  const total = drawing ? v.settings.drawTime * 1000 : Math.max(1, v.phaseEnds - (v.phaseStarted ?? v.phaseEnds - 1));
  const rem = Math.max(0, v.phaseEnds - now);
  const sec = paintClock(rem, total, drawing);
  if (sec !== lastTickSec) {
    const fresh = lastTickSec !== -1;
    lastTickSec = sec;
    // Once someone has guessed, the race is on: a soft tick-tock every second from 30, then the
    // firmer ticks for the last 10. Players who already guessed hear it at half volume.
    const race = drawing && v.guessed.length > 0;
    const soft = v.guessed.includes(v.you);
    if (fresh && sec > 0) {
      if (drawing && sec <= 10) sfx.tick(sec <= 3, soft);
      else if (race && sec <= 30) sfx.tock(sec, soft);
      else if (v.phase === "choosing" && v.drawer === v.you && sec <= 5) sfx.tick(false);
    }
    // A bell when 30 seconds are left in longer turns (not during the race: the snap says it).
    if (drawing && !race && sec === 30 && total >= 59_000 && warned !== v.turn) {
      warned = v.turn;
      sfx.warn();
    }
  }
}

/** Draws the seconds and the hourglass sand. Returns the whole seconds left. */
export function paintClock(rem: number, total: number, live: boolean): number {
  const sec = Math.ceil(rem / 1000);
  $("#clockText").textContent = String(sec);
  const p = Math.min(1, Math.max(0, 1 - rem / Math.max(1, total)));
  $("#hgTop").setAttribute("y", String(8 + 12 * p));
  $("#hgTop").setAttribute("height", String(12 * (1 - p)));
  $("#hgBot").setAttribute("y", String(35 - 11 * p));
  $("#hgBot").setAttribute("height", String(11 * p));
  ($("#hgStream") as unknown as SVGElement).style.display = p > 0 && p < 1 ? "" : "none";
  const clock = $("#clock");
  clock.classList.toggle("low", live && rem <= 10_000 && rem > 0);
  clock.classList.toggle("urgent", live && rem <= 3_000 && rem > 0);
  return sec;
}

/* ---------------- sketchbook capture ---------------- */

export function maybeCapture(v: View) {
  if (v.phase !== "reveal" || !v.word || app.gallery.has(v.turn)) return;
  if (board.turn !== v.turn) return;
  board.drain();
  if (board.isEmpty) return;
  const d = player(v.drawer);
  app.gallery.set(v.turn, {
    turn: v.turn,
    word: v.word,
    by: v.drawer ?? "",
    name: d?.name ?? "",
    color: d?.color ?? 0,
    url: thumbnail(null, board.canvas, 900),
  });
}
