// Local stand-in for Cloudflare: serves ./public and runs the same RoomCore in memory.
// Run: bun dev/server.ts   (PORT=8787, LAG=<ms> adds latency, FAST=1 shortens timers)

import { CODE_RE, TIMING, type Timing } from "../src/shared/protocol";
import { randomCode } from "../src/shared/rules";
import { RoomCore, type RoomIO, type StoredPhoto } from "../src/server/room";
import { wordsResponse } from "../src/server/words-api";
import { join, normalize } from "node:path";

const PORT = Number(process.env.PORT ?? 8787);
const LAG = Number(process.env.LAG ?? 0);
const FAST = process.env.FAST === "1";
const ROOT = join(import.meta.dir, "..", "public");

const timing: Timing = FAST
  ? { ...TIMING, chooseMs: 4000, roundBannerMs: 600, revealMs: 5000, drawerGraceMs: 3000, seatHoldGameMs: 20000, seatHoldLobbyMs: 20000, hostGraceMs: 8000, waitMs: 10000, emptyTtlMs: 60000, staleMs: 30000 }
  : TIMING;

type WS = import("bun").ServerWebSocket<{ code: string; cid: string }>;

interface DevRoom {
  core: RoomCore;
  sockets: Map<string, WS>;
  storage: Map<string, unknown>;
  timer: ReturnType<typeof setTimeout> | null;
}

const rooms = new Map<string, DevRoom>();
/** Players whose connection silently stops delivering anything (a "zombie" socket). */
const frozen = new Set<string>();
const later = (fn: () => void) => (LAG > 0 ? setTimeout(fn, LAG) : fn());
/** Delays an HTTP response by the simulated latency (both ways). */
const later2 = (res: Response) => (LAG > 0 ? new Promise<Response>((r) => setTimeout(() => r(res), LAG * 2)) : res);

function getRoom(code: string): DevRoom {
  let r = rooms.get(code);
  if (r) return r;
  const room: DevRoom = { core: null as unknown as RoomCore, sockets: new Map(), storage: new Map(), timer: null };
  const io: RoomIO = {
    send: (cid, data) => {
      const ws = room.sockets.get(cid);
      if (ws && frozen.has((ws.data as { pid?: string }).pid ?? "")) return;
      if (ws) later(() => { try { ws.send(data); } catch { /* closed */ } });
    },
    close: (cid, code, reason) => {
      const ws = room.sockets.get(cid);
      room.sockets.delete(cid);
      if (ws) later(() => { try { ws.close(code, reason); } catch { /* closed */ } });
      queueMicrotask(() => room.core.onClose(cid));
    },
    bind: () => {},
    schedule: (at) => {
      if (room.timer) clearTimeout(room.timer);
      room.timer = null;
      if (at !== null) room.timer = setTimeout(() => { room.timer = null; room.core.onAlarm(); }, Math.max(0, at - Date.now()) + 5);
    },
    save: (entries) => { for (const [k, v] of Object.entries(entries)) room.storage.set(k, structuredClone(v)); },
    remove: (keys) => { for (const k of keys) room.storage.delete(k); },
    sendGallery: (cid, turn) => {
      const e = room.storage.get(`gal:${turn}`);
      if (e) io.send(cid, JSON.stringify({ t: "drawing", ...(e as object) }));
    },
    destroy: () => {
      if (room.timer) clearTimeout(room.timer);
      rooms.delete(code);
    },
    now: () => Date.now(),
    random: () => Math.random(),
  };
  room.core = new RoomCore(io, timing);
  rooms.set(code, room);
  return room;
}

/** Simulates a Durable Object restart: rebuilds the core from saved storage, keeping sockets. */
function restartRoom(code: string) {
  const old = rooms.get(code);
  if (!old) return false;
  if (old.timer) clearTimeout(old.timer);
  rooms.delete(code);
  const fresh = getRoom(code);
  fresh.storage = old.storage;
  fresh.sockets = old.sockets;
  const photos = new Map<string, StoredPhoto>();
  for (const [k, v] of old.storage) if (k.startsWith("photo:")) photos.set(k.slice(6), v as StoredPhoto);
  fresh.core.restore(old.storage.get("state") as never, old.storage.get("canvas") as never, photos);
  for (const [cid, ws] of fresh.sockets) fresh.core.rebind(cid, (ws.data as { pid?: string }).pid ?? null);
  fresh.core.onAlarm();
  return true;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

const TYPES: Record<string, string> = {
  html: "text/html; charset=utf-8", js: "text/javascript", css: "text/css", svg: "image/svg+xml",
  png: "image/png", ico: "image/x-icon", json: "application/json", map: "application/json", webmanifest: "application/manifest+json",
};

async function serveStatic(path: string): Promise<Response> {
  const clean = normalize(path).replace(/^(\.\.[/\\])+/, "");
  let file = Bun.file(join(ROOT, clean === "/" ? "index.html" : clean));
  if (!(await file.exists())) file = Bun.file(join(ROOT, "index.html"));
  const ext = (file.name ?? "").split(".").pop() ?? "";
  return new Response(file, { headers: { "content-type": TYPES[ext] ?? "application/octet-stream", "cache-control": "no-store" } });
}

const server = Bun.serve<{ code: string; cid: string; pid?: string }, never>({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req, srv) {
    const url = new URL(req.url);
    const path = url.pathname;
    if (path === "/api/rooms" && req.method === "POST") {
      for (let i = 0; i < 6; i++) {
        const code = randomCode(Math.random);
        if (getRoom(code).core.claim(code)) return json({ code });
      }
      return json({ error: "busy" }, 503);
    }
    if (path === "/api/words") return later2(wordsResponse());
    const info = path.match(/^\/api\/rooms\/([A-Za-z0-9]{5})$/);
    if (info) {
      const code = info[1].toUpperCase();
      if (!CODE_RE.test(code) || !rooms.has(code)) return json({ exists: false, players: 0, max: 0, phase: null });
      return json(rooms.get(code)!.core.info());
    }
    const restart = path.match(/^\/__dev\/restart\/([A-Z0-9]{5})$/);
    if (restart) {
      // Simulates a deploy: the room reloads from storage and every socket drops.
      const r = rooms.get(restart[1]);
      const ok = restartRoom(restart[1]);
      if (ok && r) for (const ws of [...r.sockets.values()]) { try { ws.close(1012, "restart"); } catch { /* ignore */ } }
      return json({ ok });
    }
    const drop = path.match(/^\/__dev\/drop\/([A-Z0-9]{5})\/([A-Za-z0-9_-]+)$/);
    if (drop) {
      const r = rooms.get(drop[1]);
      let n = 0;
      for (const ws of r?.sockets.values() ?? []) if ((ws.data as { pid?: string }).pid === drop[2]) { ws.close(1011, "dev drop"); n++; }
      return json({ dropped: n });
    }
    const freeze = path.match(/^\/__dev\/freeze\/([A-Za-z0-9_-]+)\/(on|off)$/);
    if (freeze) {
      if (freeze[2] === "on") frozen.add(freeze[1]); else frozen.delete(freeze[1]);
      return json({ frozen: [...frozen] });
    }
    const ws = path.match(/^\/ws\/([A-Za-z0-9]{5})$/);
    if (ws) {
      const code = ws[1].toUpperCase();
      if (!CODE_RE.test(code)) return new Response("bad code", { status: 400 });
      const cid = crypto.randomUUID();
      if (srv.upgrade(req, { data: { code, cid } })) return undefined as unknown as Response;
      return new Response("upgrade failed", { status: 400 });
    }
    return serveStatic(path);
  },
  websocket: {
    open(ws) {
      const room = getRoom(ws.data.code);
      room.sockets.set(ws.data.cid, ws as WS);
      later(() => room.core.onOpen(ws.data.cid));
    },
    message(ws, msg) {
      const room = rooms.get(ws.data.code);
      if (!room) return;
      const text = typeof msg === "string" ? msg : null;
      if (frozen.has(ws.data.pid ?? "")) return;
      if (text && text.includes('"t":"hello"')) {
        try { ws.data.pid = JSON.parse(text).pid; } catch { /* ignore */ }
      }
      later(() => room.core.onMessage(ws.data.cid, text));
    },
    close(ws) {
      const room = rooms.get(ws.data.code);
      if (!room) return;
      if (room.sockets.get(ws.data.cid) === ws) room.sockets.delete(ws.data.cid);
      later(() => room.core.onClose(ws.data.cid));
    },
  },
});

console.log(`Doodle Battle dev server on http://localhost:${server.port}${LAG ? ` (lag ${LAG}ms)` : ""}${FAST ? " (fast timers)" : ""}`);
