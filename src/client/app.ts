// Shared client state and helpers used by every screen.

import { FACE_COUNT, INKS, type ChatMsg, type ClientMsg, type PlayerView, type View } from "../shared/protocol";
import type { Conn } from "./net";
import { $, randomId, store } from "./util";
import { randomFace } from "./avatar";

export interface Profile {
  name: string;
  color: number;
  face: number;
}

export interface Thumb {
  turn: number;
  word: string;
  by: string;
  name: string;
  color: number;
  url: string;
}

function loadIdentity() {
  const saved = store.get<{ pid: string; secret: string } | null>("db.id", null);
  if (saved && /^[A-Za-z0-9_-]{8,64}$/.test(saved.pid) && saved.secret?.length >= 16) return saved;
  const fresh = { pid: randomId(12), secret: randomId(24) };
  store.set("db.id", fresh);
  return fresh;
}

function loadProfile(): Profile {
  const p = store.get<Partial<Profile>>("db.profile", {});
  return {
    name: typeof p.name === "string" ? p.name.slice(0, 16) : "",
    color: typeof p.color === "number" && p.color >= 0 && p.color < INKS.length ? p.color : Math.floor(Math.random() * INKS.length),
    // Faces saved before the characters arrived map onto the 48 characters.
    face: typeof p.face === "number" && Number.isFinite(p.face) ? ((Math.floor(p.face) % FACE_COUNT) + FACE_COUNT) % FACE_COUNT : randomFace(),
  };
}

export const app = {
  identity: loadIdentity(),
  profile: loadProfile(),
  code: "",
  you: "",
  view: null as View | null,
  prev: null as View | null,
  conn: null as Conn | null,
  joined: false,
  /** The canvas snapshot after the latest welcome has arrived. */
  synced: false,
  chat: [] as ChatMsg[],
  gallery: new Map<number, Thumb>(),
  lastErr: "",
};

export function saveProfile() {
  store.set("db.profile", app.profile);
}

export function send(msg: ClientMsg): boolean {
  return app.conn?.send(msg) ?? false;
}

export function serverNow() {
  return app.conn ? app.conn.serverNow() : Date.now();
}

export function me(): PlayerView | undefined {
  return app.view?.players.find((p) => p.id === app.you);
}

export function player(id: string | null | undefined): PlayerView | undefined {
  return id ? app.view?.players.find((p) => p.id === id) : undefined;
}

export function isHost() {
  return !!app.view && app.view.host === app.you;
}

export function setYouColor(color: number) {
  document.documentElement.style.setProperty("--you", INKS[color] ?? INKS[0]);
}

export function inviteLink(code = app.code) {
  return `${location.origin}/r/${code}`;
}

export function toast(text: string, bad = false, ms = 2600) {
  const box = $("#toasts");
  const t = document.createElement("div");
  t.className = `toast${bad ? " bad" : ""}`;
  t.textContent = text;
  box.appendChild(t);
  while (box.children.length > 3) box.firstElementChild?.remove();
  setTimeout(() => t.remove(), ms);
}
