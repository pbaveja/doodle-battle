// Classroom battle: phones paired with a class's seat play for that class.
import { describe, expect, test } from "bun:test";
import { RoomCore, type RoomIO } from "../src/server/room";
import { CLOSE, type ServerMsg, type View } from "../src/shared/protocol";
import { sanitizeSettings, defaultSettings } from "../src/shared/rules";

class Room {
  t = 1_000_000;
  inbox = new Map<string, ServerMsg[]>();
  closed = new Map<string, number>();
  bound = new Map<string, { pid: string | null; phone?: boolean }>();
  storage = new Map<string, unknown>();
  seed = 5;
  core: RoomCore;
  constructor() {
    this.core = new RoomCore(this.io());
    this.core.claim("ABCDE");
  }
  io(): RoomIO {
    return {
      send: (cid, data) => {
        if (this.closed.has(cid)) return;
        const list = this.inbox.get(cid) ?? [];
        list.push(JSON.parse(data));
        this.inbox.set(cid, list);
      },
      close: (cid, code) => {
        if (this.closed.has(cid)) return;
        this.closed.set(cid, code);
        queueMicrotask(() => this.core.onClose(cid));
      },
      bind: (cid, pid, phone) => { this.bound.set(cid, { pid, phone }); },
      schedule: () => {},
      save: (e) => { for (const [k, v] of Object.entries(e)) this.storage.set(k, structuredClone(v)); },
      remove: () => {},
      lastHeartbeat: () => null,
      log: () => {},
      sendGallery: () => {},
      destroy: () => {},
      now: () => this.t,
      random: () => ((this.seed = (this.seed * 16807) % 2147483647) / 2147483647),
    };
  }
  join(cid: string, pid: string, name: string) {
    this.core.onOpen(cid);
    this.send(cid, { t: "hello", v: 3, pid, secret: `secret-${pid}-0123456789`, name, color: 0, face: 1 });
  }
  phone(cid: string, pair: string) {
    this.core.onOpen(cid);
    this.send(cid, { t: "hello", v: 3, pair });
  }
  send(cid: string, msg: object) {
    this.core.onMessage(cid, JSON.stringify(msg));
  }
  msgs(cid: string) {
    return this.inbox.get(cid) ?? [];
  }
  view(cid: string): View {
    const s = this.msgs(cid).filter((m): m is Extract<ServerMsg, { t: "state" }> => m.t === "state");
    return s[s.length - 1].s;
  }
  errs(cid: string) {
    return this.msgs(cid).filter((m) => m.t === "err").map((m) => (m as { code: string }).code);
  }
}

const P = ["pid-class8a01", "pid-class8b02"];

function classes() {
  const r = new Room();
  r.join("b1", P[0], "8A");
  r.join("b2", P[1], "8B");
  return r;
}

function paired() {
  const r = classes();
  r.send("b1", { t: "pair" });
  const code = r.view("b1").pair!;
  r.phone("ph", code);
  return { r, code };
}

describe("pairing a phone", () => {
  test("a board gets a pairing code only when it asks, and only sees its own", () => {
    const r = classes();
    expect(r.view("b1").pair).toBeNull();
    r.send("b1", { t: "pair" });
    const code = r.view("b1").pair!;
    expect(code.length).toBeGreaterThanOrEqual(12);
    expect(r.view("b2").pair).toBeNull();
    r.send("b1", { t: "pair" });
    expect(r.view("b1").pair).toBe(code); // asking again keeps the same code
  });

  test("a phone joins the class's seat without taking a new one", () => {
    const { r } = paired();
    const welcome = r.msgs("ph").find((m) => m.t === "welcome") as Extract<ServerMsg, { t: "welcome" }>;
    expect(welcome).toMatchObject({ you: P[0], phone: true });
    expect(r.view("ph").players.length).toBe(2);
    expect(r.view("b2").players.find((p) => p.id === P[0])!.phones).toBe(1);
    expect(r.bound.get("ph")).toEqual({ pid: P[0], phone: true });
    expect(r.closed.has("b1")).toBe(false); // the board isn't replaced
  });

  test("a wrong code is refused", () => {
    const r = classes();
    r.phone("ph", "not-a-real-code");
    expect(r.closed.get("ph")).toBe(CLOSE.BAD_HELLO);
    expect(r.errs("ph")).toContain("bad_hello");
  });

  test("a new code unpairs the phones", () => {
    const { r, code } = paired();
    r.send("b1", { t: "pair", reset: true });
    expect(r.view("b1").pair).not.toBe(code);
    expect(r.closed.get("ph")).toBe(CLOSE.REPLACED);
    r.phone("ph2", code);
    expect(r.closed.get("ph2")).toBe(CLOSE.BAD_HELLO);
  });

  test("a seat takes at most three phones", () => {
    const { r, code } = paired();
    r.phone("ph2", code);
    r.phone("ph3", code);
    r.phone("ph4", code);
    expect(r.closed.has("ph3")).toBe(false);
    expect(r.closed.get("ph4")).toBe(CLOSE.FULL);
  });
});

describe("playing from a phone", () => {
  test("the phone gets the same updates as the board, and can't change who the class is", () => {
    const { r } = paired();
    r.send("ph", { t: "profile", name: "Hacker", color: 3, face: 2 });
    r.send("ph", { t: "away" });
    expect(r.view("b2").players.find((p) => p.id === P[0])).toMatchObject({ name: "8A", away: false });
    r.send("b2", { t: "chat", text: "hello class" });
    const chat = (cid: string) => r.msgs(cid).filter((m) => m.t === "chat").map((m) => (m as { m: { text: string } }).m.text);
    expect(chat("ph")).toContain("hello class");
    expect(chat("b1")).toContain("hello class");
  });

  test("the host's phone can start the game; the class draws and guesses from it", () => {
    const { r } = paired();
    r.send("ph", { t: "start" });
    expect(r.view("b1").phase).toBe("choosing");
    const seen = new Set<string>();
    for (let turn = 0; turn < 2; turn++) {
      const drawer = r.view("b1").drawer;
      seen.add(drawer!);
      if (drawer === P[0]) {
        // 8A draws from their phone: 8B gets the strokes, and so does 8A's own board.
        r.send("ph", { t: "choose", i: 0 });
        expect(r.view("ph").word).toBeTruthy();
        const draws = (cid: string) => r.msgs(cid).filter((m) => m.t === "draw").length;
        const before = [draws("b1"), draws("b2"), draws("ph")];
        r.send("ph", { t: "draw", v: 0, ops: [{ k: "b", c: 0, w: 12, x: 100, y: 100 }, { k: "m", p: [120, 120] }, { k: "e" }] });
        expect([draws("b1"), draws("b2"), draws("ph")]).toEqual([before[0] + 1, before[1] + 1, before[2]]);
        r.send("ph", { t: "skip" });
      } else {
        // 8B draws: 8A's phone guesses for the class.
        r.send("b2", { t: "choose", i: 0 });
        r.send("ph", { t: "chat", text: r.view("b2").word! });
        expect(r.view("b1").guessed).toContain(P[0]);
        expect(r.msgs("b1").some((m) => m.t === "chat" && m.m.k === "you")).toBe(true);
      }
      r.t += 20_000;
      r.core.onAlarm();
    }
    expect(seen.size).toBe(2);
  });

  test("leaving from the phone unpairs only the phone; removing the class closes its phones", () => {
    const { r, code } = paired();
    r.send("ph", { t: "leave" });
    expect(r.closed.get("ph")).toBe(CLOSE.LEFT);
    expect(r.view("b2").players.length).toBe(2);
    r.phone("ph2", code);
    r.send("b2", { t: "kick", pid: P[0] }); // not the host: refused
    expect(r.closed.has("ph2")).toBe(false);
    r.send("b1", { t: "kick", pid: P[1] });
    r.join("b3", "pid-class8c03", "8C");
    r.send("b3", { t: "pair" });
    r.phone("ph3", r.view("b3").pair!);
    r.send("b1", { t: "kick", pid: "pid-class8c03" });
    expect(r.closed.get("ph3")).toBe(CLOSE.KICKED);
  });

  test("a paired phone survives a room restart", () => {
    const { r } = paired();
    r.core.onAlarm();
    const fresh = new RoomCore(r.io());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fresh.restore(r.storage.get("state") as any, undefined);
    fresh.rebind("b1", P[0]);
    fresh.rebind("b2", P[1]);
    fresh.rebind("ph", P[0], true);
    r.core = fresh;
    r.send("b2", { t: "chat", text: "still here?" });
    expect(r.msgs("ph").some((m) => m.t === "chat" && m.m.text === "still here?")).toBe(true);
    expect(r.view("b1").pair).toBeTruthy(); // the code is saved with the seat
  });
});

describe("classroom setting", () => {
  test("the host can turn classroom battle on", () => {
    expect(defaultSettings().classroom).toBe(false);
    expect(sanitizeSettings({ classroom: true }, defaultSettings(), 2).classroom).toBe(true);
    expect(sanitizeSettings({ classroom: "yes" }, defaultSettings(), 2).classroom).toBe(false);
  });
});
