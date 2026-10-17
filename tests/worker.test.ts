// Exercises the Cloudflare Durable Object wrapper (worker.ts) against a fake runtime:
// storage, alarms, hibernatable sockets with attachments, and waking from hibernation.
import { describe, expect, test } from "bun:test";

class FakeSocket {
  sent: string[] = [];
  closed: { code: number; reason: string } | null = null;
  attachment: unknown = null;
  peer: FakeSocket | null = null;
  send(d: string) {
    if (this.closed) throw new Error("closed");
    this.sent.push(d);
  }
  close(code = 1000, reason = "") {
    this.closed ??= { code, reason };
  }
  serializeAttachment(v: unknown) {
    this.attachment = structuredClone(v);
  }
  deserializeAttachment() {
    return structuredClone(this.attachment);
  }
}

(globalThis as any).WebSocketPair = class {
  0: FakeSocket;
  1: FakeSocket;
  constructor() {
    this[0] = new FakeSocket();
    this[1] = new FakeSocket();
  }
};
const RealResponse = Response;
(globalThis as any).Response = class extends RealResponse {
  webSocket: unknown;
  constructor(body: BodyInit | null, init?: ResponseInit & { webSocket?: unknown }) {
    super(body, init && init.status === 101 ? { ...init, status: 200 } : init);
    this.webSocket = init?.webSocket;
  }
};

function fakeCtx() {
  const data = new Map<string, unknown>();
  const sockets: FakeSocket[] = [];
  let alarm: number | null = null;
  const storage = {
    async get(k: string | string[]) {
      if (Array.isArray(k)) return new Map(k.filter((x) => data.has(x)).map((x) => [x, structuredClone(data.get(x))]));
      return structuredClone(data.get(k));
    },
    async list(o: { prefix?: string } = {}) { return new Map([...data].filter(([k]) => k.startsWith(o.prefix ?? "")).map(([k, v]) => [k, structuredClone(v)])); },
    async put(e: Record<string, unknown>) { for (const [k, v] of Object.entries(e)) data.set(k, structuredClone(v)); },
    async delete(keys: string[]) { let n = 0; for (const k of keys) if (data.delete(k)) n++; return n; },
    async deleteAll() { data.clear(); },
    async getAlarm() { return alarm; },
    async setAlarm(t: number) { alarm = t; },
    async deleteAlarm() { alarm = null; },
  };
  const ctx = {
    storage,
    blockConcurrencyWhile: async (fn: () => Promise<unknown>) => fn(),
    acceptWebSocket: (ws: FakeSocket) => { sockets.push(ws); },
    getWebSockets: () => sockets.filter((s) => !s.closed),
  };
  return { ctx, data, sockets, getAlarm: () => alarm };
}

const { Room, default: worker } = await import("../src/server/worker");
const tick = () => new Promise((r) => setTimeout(r, 5));

describe("Durable Object wrapper", () => {
  test("claim, join over a socket, play, and wake from hibernation", async () => {
    const f = fakeCtx();
    const room: any = new Room(f.ctx as any, {} as any);
    await tick();
    expect((await room.fetch(new Request("https://room/claim", { method: "POST", headers: { "x-room": "ABCDE" } }))).status).toBe(200);
    expect((await room.fetch(new Request("https://room/claim", { method: "POST", headers: { "x-room": "ABCDE" } }))).status).toBe(409);
    const info = await (await room.fetch(new Request("https://room/info"))).json();
    expect(info.exists).toBe(true);

    // Two players join
    const players: FakeSocket[] = [];
    for (const [i, name] of ["Asha", "Ben"].entries()) {
      await room.fetch(new Request("https://room/ws", { headers: { "x-room": "ABCDE" } }));
      const ws = f.sockets[f.sockets.length - 1];
      players.push(ws);
      room.webSocketMessage(ws, JSON.stringify({ t: "hello", v: 3, pid: `player-${i}-abcdef`, secret: "s".repeat(24), name, color: i, face: i }));
    }
    await tick();
    const last = (ws: FakeSocket, t: string) => ws.sent.map((s) => JSON.parse(s)).filter((m) => m.t === t).pop();
    expect(last(players[0], "state").s.players.length).toBe(2);
    expect((players[0].deserializeAttachment() as any).pid).toBe("player-0-abcdef");

    // Ping/pong carries server time
    room.webSocketMessage(players[1], JSON.stringify({ t: "ping", c: 123 }));
    expect(last(players[1], "pong").c).toBe(123);

    // Start and choose
    room.webSocketMessage(players[0], JSON.stringify({ t: "start" }));
    await tick();
    let v = last(players[0], "state").s;
    expect(v.phase).toBe("choosing");
    expect(f.getAlarm()).toBe(v.phaseEnds); // durable alarm set for the phase deadline
    const drawerWs = v.drawer === "player-0-abcdef" ? players[0] : players[1];
    const guesserWs = drawerWs === players[0] ? players[1] : players[0];
    room.webSocketMessage(drawerWs, JSON.stringify({ t: "choose", i: 0 }));
    await tick();
    const word = last(drawerWs, "state").s.word;
    room.webSocketMessage(drawerWs, JSON.stringify({ t: "draw", v: 0, ops: [{ k: "b", c: 0, w: 12, x: 10, y: 10 }, { k: "m", p: [20, 20] }, { k: "e" }] }));
    expect(last(guesserWs, "draw").ops.length).toBe(3);
    await new Promise((r) => setTimeout(r, 2100)); // canvas save debounce
    room.webSocketMessage(guesserWs, JSON.stringify({ t: "chat", text: "first wrong guess" }));
    await tick();
    expect(f.data.has("state")).toBe(true);
    expect((f.data.get("canvas") as any).items.length).toBe(1);

    // Hibernation: a fresh instance with the same storage and sockets picks up where it left off
    const room2: any = new Room(f.ctx as any, {} as any);
    await tick();
    room2.webSocketMessage(guesserWs, JSON.stringify({ t: "chat", text: word }));
    await tick();
    v = last(guesserWs, "state").s;
    expect(v.phase).toBe("reveal");
    expect(v.reason).toBe("all");
    expect(f.data.has("gal:0")).toBe(true);

    // Gallery fetch reads from storage
    room2.webSocketMessage(guesserWs, JSON.stringify({ t: "drawing", turn: 0 }));
    await tick();
    expect(last(guesserWs, "drawing").word).toBe(word);

    // Alarm handler advances the phase
    const ends = last(guesserWs, "state").s.phaseEnds;
    const realNow = Date.now;
    Date.now = () => ends + 10;
    room2.alarm();
    Date.now = realNow;
    expect(last(guesserWs, "state").s.phase).toBe("choosing");

    // Leaving closes the socket with the "left" code
    room2.webSocketMessage(guesserWs, JSON.stringify({ t: "leave" }));
    expect(guesserWs.closed?.code).toBe(4000);
    room2.webSocketClose(guesserWs, 4000, "left");
    await tick();
    expect(last(drawerWs, "state").s.players.length).toBe(1);
  });

  test("worker routes", async () => {
    const stubs = new Map<string, any>();
    const env = {
      ROOMS: {
        idFromName: (n: string) => n,
        get: (id: string) => {
          if (!stubs.has(id)) {
            const f = fakeCtx();
            const r: any = new Room(f.ctx as any, {} as any);
            stubs.set(id, { fetch: (u: string | Request, init?: RequestInit) => r.fetch(u instanceof Request ? u : new Request(u, init)) });
          }
          return stubs.get(id);
        },
      },
      ASSETS: { fetch: async () => new RealResponse("asset") },
    };
    const created = await (await worker.fetch(new Request("https://x/api/rooms", { method: "POST" }), env as any)).json();
    expect(created.code).toMatch(/^[A-Z0-9]{5}$/);
    const info = await (await worker.fetch(new Request(`https://x/api/rooms/${created.code}`), env as any)).json();
    expect(info.exists).toBe(true);
    const missing = await (await worker.fetch(new Request("https://x/api/rooms/ZZZZZ"), env as any)).json();
    expect(missing.exists).toBe(false);
    expect((await worker.fetch(new Request(`https://x/ws/${created.code}`), env as any)).status).toBe(426);
    expect((await worker.fetch(new Request("https://x/api/nope"), env as any)).status).toBe(404);
    expect(await (await worker.fetch(new Request("https://x/r/ABCDE"), env as any)).text()).toBe("asset");

    // Practice word list: words, levels and categories only, cacheable.
    const wres = await worker.fetch(new Request("https://x/api/words"), env as any);
    expect(wres.status).toBe(200);
    expect(wres.headers.get("cache-control")).toContain("max-age");
    const wl = await wres.json();
    expect(wl.words.length).toBeGreaterThan(900);
    // Each row is [word, level, category]: the "very close" and "close" lists stay on the server.
    expect(wl.words.every((r: unknown[]) => r.length === 3 && r.every((x) => typeof x === "string"))).toBe(true);
    expect(JSON.stringify(wl)).not.toContain("kennel");
  });
});
