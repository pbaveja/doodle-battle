// Cloudflare entry point: routes HTTP requests and hosts one Durable Object per room.

import { CLOSE, CODE_RE, HEARTBEAT } from "../shared/protocol";
import { randomCode } from "../shared/rules";
import { parseEdition } from "../shared/students";
import { RoomCore, type RoomIO, type StoredPhoto } from "./room";
import { wordsResponse } from "./words-api";

interface Env {
  ROOMS: DurableObjectNamespace;
  ASSETS: Fetcher;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const roomStub = (env: Env, code: string) => env.ROOMS.get(env.ROOMS.idFromName(code));

/** Waits up to this long use an in-memory timer; longer ones rely on the alarm alone. */
const TIMER_MAX_MS = 90_000;
/**
 * When the in-memory timer covers a wake-up, the alarm is only a backup in case the room restarts.
 * It's set this much later, so the free timer gets there first and moves the alarm on before it
 * fires: every alarm that runs is a billed request.
 */
const ALARM_BACKUP_MS = 3000;

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;
    try {
      if (path === "/api/rooms" && req.method === "POST") {
        // The page says which edition it is (students.doodlebattle.in, or ?students=1 for testing).
        const edition = parseEdition(url.searchParams.get("edition"));
        for (let i = 0; i < 6; i++) {
          const code = randomCode(Math.random);
          const res = await roomStub(env, code).fetch("https://room/claim", { method: "POST", headers: { "x-room": code, "x-edition": edition } });
          if (res.status === 200) return json({ code });
        }
        return json({ error: "Couldn't create a room right now. Try again." }, 503);
      }

      if (path === "/api/words" && req.method === "GET") return wordsResponse(parseEdition(url.searchParams.get("edition")));

      const info = path.match(/^\/api\/rooms\/([A-Za-z0-9]{5})$/);
      if (info && req.method === "GET") {
        const code = info[1].toUpperCase();
        if (!CODE_RE.test(code)) return json({ exists: false, players: 0, max: 0, phase: null });
        return roomStub(env, code).fetch("https://room/info", { headers: { "x-room": code } });
      }

      const ws = path.match(/^\/ws\/([A-Za-z0-9]{5})$/);
      if (ws) {
        if (req.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
          return new Response("Expected a WebSocket upgrade", { status: 426 });
        }
        const code = ws[1].toUpperCase();
        if (!CODE_RE.test(code)) return new Response("Bad room code", { status: 400 });
        const headers = new Headers(req.headers);
        headers.set("x-room", code);
        return roomStub(env, code).fetch(new Request("https://room/ws", { headers }));
      }

      if (path.startsWith("/api/")) return json({ error: "Not found" }, 404);
      return env.ASSETS.fetch(req);
    } catch (e) {
      console.error("worker error", e);
      return json({ error: "Something went wrong on our side. Try again." }, 500);
    }
  },
};

interface Attachment {
  cid: string;
  pid: string | null;
}

export class Room {
  private core!: RoomCore;
  private sockets = new Map<string, CfWebSocket>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private alarmAt: number | null = null;

  constructor(private ctx: DurableObjectState, _env: Env) {
    // Heartbeats are answered by the platform without waking (or billing time to) the room.
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair(HEARTBEAT, HEARTBEAT));
    void ctx.blockConcurrencyWhile(async () => {
      this.core = new RoomCore(this.io());
      const saved = await ctx.storage.get<unknown>(["state", "canvas"]);
      const photos = new Map<string, StoredPhoto>();
      if (saved.get("state")) {
        const list = await ctx.storage.list<StoredPhoto>({ prefix: "photo:" });
        for (const [key, ph] of list) photos.set(key.slice(6), ph);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.core.restore(saved.get("state") as any, saved.get("canvas") as any, photos);
      this.alarmAt = await ctx.storage.getAlarm();
      for (const ws of ctx.getWebSockets()) {
        const a = ws.deserializeAttachment() as Attachment | null;
        if (!a?.cid) {
          try { ws.close(CLOSE.CLOSED, "stale"); } catch { /* already closed */ }
          continue;
        }
        this.sockets.set(a.cid, ws);
        this.core.rebind(a.cid, a.pid);
      }
      this.core.onAlarm();
    });
  }

  private io(): RoomIO {
    return {
      send: (cid, data) => {
        const ws = this.sockets.get(cid);
        if (!ws) return;
        try { ws.send(data); } catch { /* socket is closing */ }
      },
      close: (cid, code, reason) => {
        const ws = this.sockets.get(cid);
        this.sockets.delete(cid);
        if (ws) {
          try { ws.close(code, reason); } catch { /* already closed */ }
        }
        queueMicrotask(() => this.core.onClose(cid));
      },
      bind: (cid, pid) => {
        const ws = this.sockets.get(cid);
        if (ws) ws.serializeAttachment({ cid, pid } satisfies Attachment);
      },
      schedule: (at, durable) => {
        if (this.timer) clearTimeout(this.timer);
        this.timer = null;
        if (at !== null) {
          const delay = Math.max(0, at - Date.now()) + 5;
          // Short waits use an in-memory timer for precision; the alarm below survives restarts.
          if (delay <= TIMER_MAX_MS) {
            this.timer = setTimeout(() => {
              this.timer = null;
              this.core.onAlarm();
            }, delay);
          }
        }
        const covered = durable !== null && durable - Date.now() + 5 <= TIMER_MAX_MS;
        const alarm = covered ? durable + ALARM_BACKUP_MS : durable;
        if (alarm !== this.alarmAt) {
          this.alarmAt = alarm;
          if (alarm === null) void this.ctx.storage.deleteAlarm();
          else void this.ctx.storage.setAlarm(alarm);
        }
      },
      save: (entries) => void this.ctx.storage.put(entries),
      remove: (keys) => {
        for (let i = 0; i < keys.length; i += 100) void this.ctx.storage.delete(keys.slice(i, i + 100));
      },
      lastHeartbeat: (cid) => {
        const ws = this.sockets.get(cid);
        if (!ws) return null;
        try {
          return this.ctx.getWebSocketAutoResponseTimestamp(ws)?.getTime() ?? null;
        } catch {
          return null; // socket is closing
        }
      },
      // An object, so Workers Logs indexes each field for filtering.
      log: (entry) => console.log(entry),
      sendGallery: (cid, turn) => {
        void this.ctx.storage.get(`gal:${turn}`).then((entry) => {
          const ws = this.sockets.get(cid);
          if (entry && ws) {
            try { ws.send(JSON.stringify({ t: "drawing", ...(entry as object) })); } catch { /* closing */ }
          }
        });
      },
      destroy: () => {
        if (this.timer) clearTimeout(this.timer);
        this.timer = null;
        this.alarmAt = null;
        void this.ctx.storage.deleteAlarm();
        void this.ctx.storage.deleteAll();
      },
      now: () => Date.now(),
      random: () => Math.random(),
    };
  }

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const code = req.headers.get("x-room") ?? "";
    if (url.pathname === "/claim") {
      const ok = this.core.claim(code, parseEdition(req.headers.get("x-edition")));
      this.core.note("http");
      return ok ? new Response("ok") : new Response("taken", { status: 409 });
    }
    if (url.pathname === "/info") {
      this.core.note("http");
      return json(this.core.info());
    }
    if (url.pathname === "/ws") {
      const pair = new WebSocketPair();
      const client = pair[0], server = pair[1];
      const cid = crypto.randomUUID();
      this.ctx.acceptWebSocket(server);
      server.serializeAttachment({ cid, pid: null } satisfies Attachment);
      this.sockets.set(cid, server);
      this.core.onOpen(cid);
      return new Response(null, { status: 101, webSocket: client });
    }
    return new Response("Not found", { status: 404 });
  }

  webSocketMessage(ws: CfWebSocket, message: string | ArrayBuffer) {
    const a = ws.deserializeAttachment() as Attachment | null;
    if (!a?.cid) return;
    if (!this.sockets.has(a.cid)) this.sockets.set(a.cid, ws);
    this.core.onMessage(a.cid, typeof message === "string" ? message : null);
  }

  webSocketClose(ws: CfWebSocket, code: number, reason: string) {
    this.dropSocket(ws);
    try { ws.close(code === 1005 || code === 1006 ? 1000 : code, reason); } catch { /* already closed */ }
  }

  webSocketError(ws: CfWebSocket) {
    this.dropSocket(ws);
  }

  private dropSocket(ws: CfWebSocket) {
    this.core.note("closes");
    const a = ws.deserializeAttachment() as Attachment | null;
    if (!a?.cid) return;
    if (this.sockets.get(a.cid) === ws) this.sockets.delete(a.cid);
    this.core.onClose(a.cid);
  }

  alarm() {
    this.alarmAt = null;
    this.core.note("alarms");
    this.core.onAlarm();
  }
}
