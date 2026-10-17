// Photos on this device.
//  - Your own photo for this visit: the cropped camera frame and the chosen look, kept in
//    sessionStorage, so it survives a refresh but is gone when the tab closes.
//  - Other players' photos in the current room, by player id and version, as short blob: URLs
//    (so re-rendering a list doesn't paste big data URLs into the page).

import { INKS } from "../shared/protocol";
import { BASE, encode, renderLook, type Look } from "./looks";

const KEY = "db.photo";

/* ---------------- room photos ---------------- */

const room = new Map<string, { v: number; url: string }>();

function toUrl(data: string): string {
  try {
    const comma = data.indexOf(",");
    const mime = data.slice(5, data.indexOf(";"));
    const bin = atob(data.slice(comma + 1));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes], { type: mime }));
  } catch {
    return data;
  }
}

const revoke = (url: string) => {
  if (url.startsWith("blob:")) URL.revokeObjectURL(url);
};

/** Store a player's photo. Returns true if it's new. */
export function putPhoto(id: string, v: number, data: string): boolean {
  const old = room.get(id);
  if (old && old.v === v) return false;
  if (old) revoke(old.url);
  room.set(id, { v, url: toUrl(data) });
  return true;
}

export function photoUrl(id: string, v: number): string | null {
  const p = room.get(id);
  return p && p.v === v ? p.url : null;
}

export function clearRoomPhotos() {
  for (const p of room.values()) revoke(p.url);
  room.clear();
}

/* ---------------- your photo (this visit only) ---------------- */

interface Mine {
  base: HTMLCanvasElement;
  look: Look;
  use: boolean;
  /** The finished picture for one colour (Ink depends on it). */
  out: { color: number; data: string; url: string } | null;
}

let mine: Mine | null = null;

function session(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function persist() {
  const s = session();
  if (!s) return;
  try {
    if (!mine) s.removeItem(KEY);
    else s.setItem(KEY, JSON.stringify({ base: mine.base.toDataURL("image/jpeg", 0.88), look: mine.look, use: mine.use }));
  } catch {
    /* storage full or blocked: the photo still works until the page reloads */
  }
}

/** Bring back this visit's photo after a refresh. */
export async function restoreMyPhoto(): Promise<void> {
  const raw = session()?.getItem(KEY);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw) as { base: string; look: Look; use: boolean };
    const img = new Image();
    img.src = saved.base;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = c.height = BASE;
    c.getContext("2d")!.drawImage(img, 0, 0, BASE, BASE);
    mine = { base: c, look: saved.look, use: saved.use !== false, out: null };
  } catch {
    session()?.removeItem(KEY);
  }
}

export function setMyPhoto(base: HTMLCanvasElement, look: Look) {
  if (mine?.out) revoke(mine.out.url);
  mine = { base, look, use: true, out: null };
  persist();
}

export function useMyPhoto(use: boolean) {
  if (!mine || mine.use === use) return;
  mine.use = use;
  persist();
}

export function hasMyPhoto() {
  return !!mine;
}

/** Your photo is on (taken this visit and chosen over a character). */
export function usingMyPhoto() {
  return !!mine && mine.use;
}

/** Your finished photo for a colour, as a data URL to send and a URL to show. */
export function myPhoto(color: number): { data: string; url: string } | null {
  if (!mine) return null;
  const key = mine.look === "ink" ? color : -1;
  if (!mine.out || mine.out.color !== key) {
    if (mine.out) revoke(mine.out.url);
    const data = encode(renderLook(mine.base, mine.look, INKS[color] ?? INKS[0]));
    mine.out = { color: key, data, url: toUrl(data) };
  }
  return { data: mine.out.data, url: mine.out.url };
}
