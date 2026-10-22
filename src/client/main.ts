// Doodle Battle client entry: routing, joining rooms, the connection lifecycle and screen switching.

import { CLOSE, CODE_RE, PROTOCOL, type RoomInfo, type ServerMsg, type View } from "../shared/protocol";
import { app, inviteLink, me, send, setYouColor, toast } from "./app";
import { addChat, initChat, resetChat } from "./chat";
import { Conn } from "./net";
import { focusName, initProfile, mountProfile, profileName, renderProfile } from "./profile";
import { initGame, board, inGame, maybeCapture, releaseWake, renderGame, scored, showGame, stopGameTimers } from "./screens/game";
import { initLobby, renderLobby, showLobby } from "./screens/lobby";
import { addDrawing, initOver, renderOver, resetOver } from "./screens/over";
import { initPractice, leavePractice, showPracticeSetup } from "./screens/practice";
import { initCamera } from "./camera";
import { APP_NAME, applyEdition, EDITION_QS } from "./edition";
import { clearRoomPhotos, putPhoto, restoreMyPhoto } from "./photos";
import { commitPhoto, notePhoto, resetPhotoSync, syncPhoto } from "./roomphoto";
import { sfx, sound, unlock } from "./sound";
import { onRtc, resetVoice, syncVoice, voice, voiceWelcome } from "./voice";
import { initVoiceUi, mountVoice, renderVoice } from "./voiceui";
import { $, $$, store } from "./util";

type ScreenId = "home" | "join" | "notice" | "connecting" | "lobby" | "game" | "over" | "practice" | "practiceDone";
let current: ScreenId | null = null;
let bannerTimer = 0;
let okTimer = 0;
let wasDown = false;
let lastJoinAttempt = 0;

/* ---------------- viewport (keeps the layout above the phone keyboard) ---------------- */

function trackViewport() {
  const vv = window.visualViewport;
  const root = document.documentElement.style;
  // Ask the screen, not the window: on Android the keyboard shrinks the window, which would
  // otherwise look like the phone turning sideways.
  const landscape = () => {
    const type = screen.orientation?.type;
    if (type) return type.startsWith("landscape");
    const legacy = (window as unknown as { orientation?: number }).orientation;
    if (typeof legacy === "number") return Math.abs(legacy) === 90;
    return window.innerWidth > window.innerHeight;
  };
  let orient = landscape();
  // The tallest the page has been in this orientation. The keyboard shrinks the visual viewport,
  // not this, so the canvas can keep its size while the chat makes room.
  let stable = window.innerHeight;
  const set = () => {
    const h = vv ? vv.height : window.innerHeight;
    if (landscape() !== orient) {
      orient = landscape();
      stable = window.innerHeight;
    }
    stable = Math.max(stable, window.innerHeight);
    root.setProperty("--app-h", `${Math.round(h)}px`);
    root.setProperty("--stable-h", `${Math.round(stable)}px`);
    root.setProperty("--vv-top", `${Math.round(vv ? vv.offsetTop : 0)}px`);
    document.body.classList.toggle("kb", h < stable - 140);
    document.body.classList.toggle("landscape", orient);
  };
  set();
  vv?.addEventListener("resize", set);
  vv?.addEventListener("scroll", set);
  window.addEventListener("resize", set);
  window.addEventListener("orientationchange", () => setTimeout(set, 250));
  // iOS sometimes leaves the page scrolled after the keyboard closes.
  document.addEventListener("focusout", () => setTimeout(() => { if (!vv || vv.offsetTop === 0) window.scrollTo(0, 0); set(); }, 60));
}

/* ---------------- screens ---------------- */

function show(id: ScreenId) {
  if (current === id) return;
  current = id;
  for (const s of $$(".screen")) s.hidden = s.id !== id;
  const scr = $(`#${id}`);
  scr.scrollTop = 0;
  const f = scr.querySelector<HTMLElement>("[data-focus]");
  if (f && !matchMedia("(pointer: coarse)").matches) f.focus({ preventScroll: true });
  if (id === "lobby" || id === "game" || id === "over") mountVoice(`#${id}Voice`);
  if (id !== "game") {
    stopGameTimers();
    releaseWake();
  }
}

function navigate(path: string, replace = false) {
  if (location.pathname === path) return route();
  if (replace) history.replaceState(null, "", path);
  else history.pushState(null, "", path);
  route();
}

function route() {
  const m = location.pathname.match(/^\/r\/([A-Za-z0-9]{5})\/?$/);
  if (m) {
    const code = m[1].toUpperCase();
    if (code === app.code && app.conn && app.conn.status !== "closed" && app.conn.status !== "stopped") return;
    leavePractice();
    disconnect();
    openRoom(code);
  } else if (/^\/practice\/?$/.test(location.pathname)) {
    disconnect();
    showPracticeSetup();
  } else {
    leavePractice();
    disconnect();
    showHome();
  }
}

function disconnect(sendLeave = false) {
  if (!app.conn) return;
  if (sendLeave) send({ t: "leave" });
  app.conn.stop(sendLeave ? CLOSE.LEFT : 1000);
  app.conn = null;
  app.joined = false;
  app.view = app.prev = null;
  app.code = "";
  app.gallery.clear();
  clearRoomPhotos();
  resetVoice();
  renderVoice();
  resetOver();
  hideBanner();
  setYouColor(app.profile.color);
}

/* ---------------- home & join ---------------- */

function showHome() {
  document.title = APP_NAME;
  mountProfile("#homeProfile", () => ($("#createErr").hidden = true));
  show("home");
}

async function createRoom() {
  const name = profileName();
  const err = $("#createErr");
  if (!name) {
    err.textContent = "Add your name first.";
    err.hidden = false;
    focusName();
    return;
  }
  const btn = $<HTMLButtonElement>("#createBtn");
  btn.disabled = true;
  btn.textContent = "Creating…";
  err.hidden = true;
  try {
    const res = await fetchWithTimeout(`/api/rooms${EDITION_QS}`, { method: "POST" }, 8000);
    const data = (await res.json().catch(() => ({}))) as { code?: string; error?: string };
    if (!res.ok || !data.code) throw new Error(data.error || "Couldn't create a room right now. Try again.");
    store.set("db.seat", { code: data.code, at: Date.now() });
    navigate(`/r/${data.code}`);
  } catch (e) {
    err.textContent = e instanceof Error && e.name !== "AbortError" && !/fetch|network/i.test(e.message)
      ? e.message
      : "Couldn't reach Doodle Battle. Check your connection and try again.";
    err.hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = "Create a room";
  }
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, ms = 8000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctl.signal, cache: "no-store" });
  } finally {
    clearTimeout(t);
  }
}

async function roomInfo(code: string): Promise<RoomInfo | null> {
  try {
    const res = await fetchWithTimeout(`/api/rooms/${code}`, {}, 7000);
    if (!res.ok) return null;
    return (await res.json()) as RoomInfo;
  } catch {
    return null;
  }
}

async function joinByCode(e: Event) {
  e.preventDefault();
  const input = $<HTMLInputElement>("#codeInput");
  const err = $("#joinErr");
  const code = input.value.trim().toUpperCase();
  err.hidden = true;
  if (!CODE_RE.test(code)) {
    err.textContent = "Room codes are 5 letters and numbers, like K7PXM.";
    err.hidden = false;
    return;
  }
  const name = profileName();
  if (!name) {
    err.textContent = "Add your name first.";
    err.hidden = false;
    focusName();
    return;
  }
  const btn = $<HTMLButtonElement>("#joinBtn");
  btn.disabled = true;
  const info = await roomInfo(code);
  btn.disabled = false;
  if (!info) {
    err.textContent = "Couldn't reach Doodle Battle. Check your connection and try again.";
    err.hidden = false;
    return;
  }
  if (!info.exists) {
    err.textContent = `There's no room called ${code}. Check the code with your friend.`;
    err.hidden = false;
    return;
  }
  if (info.players >= info.max) {
    err.textContent = `Room ${code} is full (${info.players} of ${info.max}).`;
    err.hidden = false;
    return;
  }
  store.set("db.seat", { code, at: Date.now() });
  navigate(`/r/${code}`);
}

function openRoom(code: string) {
  app.code = code;
  document.title = `Room ${code} · ${APP_NAME}`;
  if (!CODE_RE.test(code)) {
    notice("That link doesn't look right", "Room codes are 5 letters and numbers. Check the link, or create a new room.", "home");
    return;
  }
  const seat = store.get<{ code: string; at: number } | null>("db.seat", null);
  if (seat && seat.code === code && Date.now() - seat.at < 6 * 3600_000 && profileName()) {
    connect(code);
    return;
  }
  showJoin(code);
}

function showJoin(code: string, error = "") {
  $("#joinCode").textContent = code;
  const info = $("#joinInfo");
  info.textContent = "Checking the room…";
  const err = $("#joinGoErr");
  err.textContent = error;
  err.hidden = !error;
  mountProfile("#joinProfile", () => ($("#joinGoErr").hidden = true));
  show("join");
  void roomInfo(code).then((r) => {
    if (app.code !== code || current !== "join") return;
    if (!r) info.textContent = "Couldn't check the room. You can still try to join.";
    else if (!r.exists) notice("Room not found", `There's no room called ${code}. It may have ended, or the code is wrong.`, "home");
    else if (r.players >= r.max) info.textContent = `This room is full (${r.players} of ${r.max}).`;
    else if (r.phase === "lobby") info.textContent = r.players ? `${r.players} ${r.players === 1 ? "player" : "players"} waiting in the lobby` : "Nobody's here yet. You'll be the host.";
    else if (r.phase === "over") info.textContent = `${r.players} players just finished a game`;
    else info.textContent = `A game is on with ${r.players} players. You can jump right in.`;
  });
}

function joinFromLink() {
  const name = profileName();
  const err = $("#joinGoErr");
  if (!name) {
    err.textContent = "Add your name first.";
    err.hidden = false;
    focusName();
    return;
  }
  unlock();
  store.set("db.seat", { code: app.code, at: Date.now() });
  connect(app.code);
}

function notice(title: string, text: string, ...buttons: ("home" | "create" | "reload" | "here" | "retry")[]) {
  $("#noticeTitle").textContent = title;
  $("#noticeText").textContent = text;
  const actions = $("#noticeActions");
  actions.innerHTML = "";
  const add = (label: string, cls: string, fn: () => void) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `btn ${cls}`;
    b.textContent = label;
    b.addEventListener("click", fn);
    actions.appendChild(b);
  };
  for (const kind of buttons) {
    if (kind === "home") add("Go to home", buttons.length > 1 ? "secondary" : "primary", () => navigate("/"));
    if (kind === "create") add("Create a new room", "primary", () => { navigate("/"); void createRoom(); });
    if (kind === "reload") add("Reload the page", "primary", () => location.reload());
    if (kind === "here") add("Play here instead", "primary", () => { const c = app.code; disconnect(); app.code = c; connect(c); });
    if (kind === "retry") add("Try again", "primary", () => { const c = app.code; disconnect(); app.code = c; connect(c); });
  }
  show("notice");
}

/* ---------------- connection ---------------- */

function wsUrl(code: string) {
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${location.host}/ws/${code}`;
}

function connect(code: string) {
  app.code = code;
  app.lastErr = "";
  lastJoinAttempt = Date.now();
  $("#connectingText").textContent = `Joining room ${code}…`;
  show("connecting");
  const conn = new Conn(wsUrl(code));
  app.conn = conn;
  conn.onOpen = () => {
    conn.send({
      t: "hello",
      v: PROTOCOL,
      pid: app.identity.pid,
      secret: app.identity.secret,
      name: profileName(),
      color: app.profile.color,
      face: app.profile.face,
    });
  };
  conn.onMessage = onMessage;
  conn.onStatus = () => onStatus(conn);
  conn.start();
}

function onMessage(m: ServerMsg) {
  switch (m.t) {
    case "welcome":
      app.you = m.you;
      app.joined = true;
      app.synced = false;
      app.conn?.markReady();
      resetPhotoSync();
      voiceWelcome();
      if (document.visibilityState === "hidden") send({ t: "away" });
      store.set("db.seat", { code: m.code, at: Date.now() });
      break;
    case "state":
      onState(m.s);
      break;
    case "canvas": {
      const first = !app.synced;
      board.load(m.turn, m.v, m.items);
      app.synced = true;
      if (app.view) {
        maybeCapture(app.view);
        if (first && current === "game") renderGame(app.view, null);
      }
      break;
    }
    case "draw":
      board.remote(m.v, m.ops);
      break;
    case "chat":
      addChat(m.m);
      if (m.m.k === "close") sfx.veryClose();
      else if (m.m.k === "warm") sfx.warm();
      break;
    case "chatlog":
      resetChat(m.list);
      break;
    case "scored":
      scored(m.id, m.pts);
      break;
    case "drawing":
      addDrawing(m);
      break;
    case "rtc":
      onRtc(m.from, m.d);
      break;
    case "photo":
      notePhoto(m.id, m.v, m.data);
      if (putPhoto(m.id, m.v, m.data) && app.view && app.view.players.some((p) => p.id === m.id && p.photo === m.v)) rerender();
      break;
    case "err":
      app.lastErr = m.msg;
      if (!["name_taken", "bad_name", "kicked", "replaced", "not_found", "room_full", "bad_hello"].includes(m.code)) toast(m.msg, true);
      break;
  }
}

function onState(v: View) {
  const prev = app.view;
  app.prev = prev;
  app.view = v;
  app.conn?.hintServerTime(v.now);
  const mine = v.players.find((p) => p.id === v.you);
  if (mine) setYouColor(mine.color);
  // A new game started: clear the old sketchbook.
  if (prev && (v.phase === "lobby" || v.turnsPlayed < prev.turnsPlayed)) {
    app.gallery.clear();
    resetOver();
  }
  if (prev && prev.players.length < v.players.length && v.phase === "lobby") sfx.join();

  if (v.phase === "lobby") {
    if (current !== "lobby") {
      showLobby();
      show("lobby");
    }
    renderLobby(v);
  } else if (v.phase === "over") {
    if (current !== "over") show("over");
    renderOver(v);
  } else {
    if (current !== "game") {
      showGame();
      show("game");
    }
    renderGame(v, prev && inGame(prev) ? prev : null);
  }
  syncSoundButtons();
  syncPhoto();
  syncVoice();
  renderVoice();
  // The host turned photos on or off: the look picker shows or hides the camera.
  if (prev && prev.settings.photos !== v.settings.photos) renderProfile();
}

/** Redraw the current room screen (a player's photo arrived). */
function rerender() {
  const v = app.view;
  if (!v) return;
  if (current === "lobby") renderLobby(v);
  else if (current === "over") renderOver(v);
  else if (current === "game") renderGame(v, null);
}

function onStatus(conn: Conn) {
  if (conn !== app.conn) return;
  if (conn.status === "closed") {
    onFatalClose(conn.closeCode);
    return;
  }
  // Re-render so inputs lock or unlock with the connection.
  if (app.view && current === "game") renderGame(app.view, null);
  if (!app.joined) {
    if (conn.status === "retrying") {
      const secs = Math.round((Date.now() - lastJoinAttempt) / 1000);
      $("#connectingText").textContent =
        conn.offline ? "You're offline. We'll join as soon as you're back online." :
        secs > 12 ? `Still trying to reach room ${app.code}. Check your connection.` : `Joining room ${app.code}…`;
    }
    return;
  }
  renderBanner(conn);
}


function renderBanner(conn: Conn) {
  const bar = $("#netbar");
  if (conn.live) {
    clearTimeout(bannerTimer);
    bannerTimer = 0;
    if (wasDown && !bar.hidden) {
      bar.classList.add("ok");
      $("#netText").textContent = "Back online";
      clearTimeout(okTimer);
      okTimer = window.setTimeout(hideBanner, 1600);
    } else hideBanner();
    wasDown = false;
    return;
  }
  wasDown = true;
  const update = () => {
    bar.classList.remove("ok");
    const down = conn.downSince ? Date.now() - conn.downSince : 0;
    $("#netText").textContent = conn.offline
      ? "You're offline"
      : down > 30_000
        ? "Still reconnecting. Check your connection."
        : `Reconnecting…${conn.attempt > 1 ? ` (try ${conn.attempt})` : ""}`;
    bar.hidden = false;
  };
  // Wait a moment before showing it (most drops recover instantly), but don't let quick retries
  // keep pushing that moment back. Offline is certain, so it shows straight away.
  if (!bar.hidden || conn.offline) {
    clearTimeout(bannerTimer);
    bannerTimer = 0;
    update();
  } else if (!bannerTimer) {
    bannerTimer = window.setTimeout(() => {
      bannerTimer = 0;
      if (app.conn === conn && !conn.live) update();
    }, 900);
  }
}

function hideBanner() {
  clearTimeout(bannerTimer);
  bannerTimer = 0;
  const bar = $("#netbar");
  bar.hidden = true;
  bar.classList.remove("ok");
}

function onFatalClose(code: number) {
  const roomCode = app.code;
  const msg = app.lastErr;
  hideBanner();
  if (code === CLOSE.NAME_TAKEN) {
    disconnect();
    app.code = roomCode;
    store.del("db.seat");
    showJoin(roomCode, msg || "That name is taken in this room. Pick another.");
    focusName();
    return;
  }
  disconnect();
  app.code = roomCode;
  if (code === CLOSE.NOT_FOUND) {
    store.del("db.seat");
    notice("Room not found", msg || `Room ${roomCode} doesn't exist any more. It may have ended.`, "create", "home");
  } else if (code === CLOSE.FULL) {
    store.del("db.seat");
    notice("This room is full", msg || "Ask the host to raise the player limit, or create your own room.", "retry", "home");
  } else if (code === CLOSE.KICKED) {
    store.del("db.seat");
    notice("You were removed", "The host removed you from this room.", "home");
  } else if (code === CLOSE.REPLACED) {
    notice("Opened in another tab", "You're playing this game in another tab or window.", "here", "home");
  } else if (code === CLOSE.BAD_HELLO) {
    notice("Please reload", msg || "Doodle Battle was updated. Reload the page to keep playing.", "reload", "home");
  } else if (code === CLOSE.LEFT) {
    navigate("/");
  } else {
    notice("Disconnected", msg || "The room closed the connection.", "retry", "home");
  }
}

function leaveRoom() {
  store.del("db.seat");
  disconnect(true);
  navigate("/");
}

/* ---------------- sound buttons ---------------- */

const SPK_ON = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
const SPK_OFF = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m16 9 5 6M21 9l-5 6"/></svg>';

function syncSoundButtons() {
  for (const b of $$<HTMLButtonElement>("[data-sound]")) {
    b.innerHTML = sound.on ? SPK_ON : SPK_OFF;
    b.setAttribute("aria-label", sound.on ? "Sound on" : "Sound off");
    b.setAttribute("aria-pressed", String(sound.on));
  }
  $("#menuSound").textContent = sound.on ? "Sound: on" : "Sound: off";
}

function toggleSound() {
  sound.set(!sound.on);
  syncSoundButtons();
  if (sound.on) sfx.join();
}

/* ---------------- boot ---------------- */

function boot() {
  applyEdition();
  trackViewport();
  initProfile();
  initChat();
  initLobby(leaveRoom);
  initGame(leaveRoom);
  initOver(leaveRoom);
  initPractice({ show, navigate });
  initCamera();
  initVoiceUi();
  // Bring back this visit's photo; if the room reconnected first, send it now.
  void restoreMyPhoto().then(() => {
    renderProfile();
    if (app.joined) commitPhoto();
  });
  syncSoundButtons();

  $("#createBtn").addEventListener("click", () => {
    unlock();
    void createRoom();
  });
  $("#joinForm").addEventListener("submit", (e) => {
    unlock();
    void joinByCode(e);
  });
  const codeIn = $<HTMLInputElement>("#codeInput");
  codeIn.addEventListener("input", () => {
    codeIn.value = codeIn.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5);
    $("#joinErr").hidden = true;
  });
  $("#joinGo").addEventListener("click", joinFromLink);
  $<HTMLInputElement>("#nameInput").addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    if (current === "join") joinFromLink();
    else if (current === "home") {
      unlock();
      void createRoom();
    }
  });
  $("#connectingCancel").addEventListener("click", () => {
    store.del("db.seat");
    disconnect();
    navigate("/");
  });
  $("#netRetry").addEventListener("click", () => app.conn?.retryNow());
  for (const b of $$("[data-sound]")) b.addEventListener("click", toggleSound);
  $("#menuSound").addEventListener("click", toggleSound);
  document.addEventListener("click", (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[data-nav]");
    if (a) {
      e.preventDefault();
      navigate(a.getAttribute("href") ?? "/");
    }
    const leave = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[data-leave]");
    if (leave) {
      e.preventDefault();
      leaveRoom();
    }
  });
  // Any first interaction unlocks audio on iOS.
  window.addEventListener("pointerdown", () => unlock(), { once: true });
  window.addEventListener("popstate", route);
  // Tell the room when this page goes to the background, so the seat and host role are kept
  // instead of looking like someone left.
  const reportPresence = () => {
    if (!app.conn?.live) return;
    send({ t: document.visibilityState === "hidden" ? "away" : "back" });
  };
  document.addEventListener("visibilitychange", reportPresence);
  window.addEventListener("pagehide", () => app.conn?.live && send({ t: "away" }));
  window.addEventListener("pageshow", reportPresence);
  window.addEventListener("beforeunload", () => {
    // Closing the tab keeps your seat for a minute, so a refresh doesn't cost you anything.
    app.conn?.stop(1001);
  });

  renderProfile();
  route();
}

// Expose a few helpers for debugging in the console.
(window as unknown as { doodle: unknown }).doodle = { app, inviteLink, me, voice };
void toast;

boot();
