// Drives RoomCore directly with a fake clock and fake sockets.
import { describe, expect, test } from "bun:test";
import { RoomCore, type RoomIO } from "../src/server/room";
import { CLOSE, TIMING, type ChatMsg, type ServerMsg, type View } from "../src/shared/protocol";

class Harness {
  t = 1_000_000;
  timer: number | null = null;
  durable: number | null = null;
  storage = new Map<string, unknown>();
  inbox = new Map<string, ServerMsg[]>();
  closed = new Map<string, number>();
  seed = 7;
  core: RoomCore;
  pidOf = new Map<string, string>();
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
      bind: () => {},
      schedule: (at, durable) => { this.timer = at; this.durable = durable; },
      save: (e) => { for (const [k, v] of Object.entries(e)) this.storage.set(k, structuredClone(v)); },
      remove: (keys) => keys.forEach((k) => this.storage.delete(k)),
      sendGallery: (cid, turn) => {
        const e = this.storage.get(`gal:${turn}`);
        if (e) this.io().send(cid, JSON.stringify({ t: "drawing", ...(e as object) }));
      },
      destroy: () => { this.storage.clear(); },
      now: () => this.t,
      random: () => ((this.seed = (this.seed * 16807) % 2147483647) / 2147483647),
    };
  }
  /** Connections that stop sending anything (a frozen phone). */
  silent = new Set<string>();
  /** Advance the clock, firing scheduled wake-ups along the way. Live clients ping every 10s, like real ones. */
  advance(ms: number) {
    const end = this.t + ms;
    while (this.t < end) {
      const stepEnd = Math.min(end, this.t + 10_000);
      for (let guard = 0; guard < 1000; guard++) {
        if (this.timer !== null && this.timer <= stepEnd) {
          this.t = Math.max(this.t, this.timer);
          this.timer = null;
          this.core.onAlarm();
        } else break;
      }
      this.t = stepEnd;
      for (const cid of this.pidOf.keys()) {
        if (!this.closed.has(cid) && !this.silent.has(cid)) this.core.onMessage(cid, JSON.stringify({ t: "ping", c: this.t }));
      }
      this.core.onAlarm();
    }
  }
  join(cid: string, pid: string, name: string, color = 0) {
    this.core.onOpen(cid);
    this.pidOf.set(cid, pid);
    this.send(cid, { t: "hello", v: 3, pid, secret: `secret-${pid}-0123456789`, name, color, face: 1 });
  }
  send(cid: string, msg: object) {
    this.core.onMessage(cid, JSON.stringify(msg));
  }
  drop(cid: string) {
    this.closed.set(cid, 1006);
    this.core.onClose(cid);
  }
  msgs(cid: string) {
    return this.inbox.get(cid) ?? [];
  }
  view(cid: string): View {
    const s = this.msgs(cid).filter((m): m is Extract<ServerMsg, { t: "state" }> => m.t === "state");
    return s[s.length - 1].s;
  }
  chat(cid: string): ChatMsg[] {
    return this.msgs(cid).flatMap((m) => (m.t === "chat" ? [m.m] : m.t === "chatlog" ? m.list : []));
  }
  errs(cid: string) {
    return this.msgs(cid).filter((m) => m.t === "err").map((m) => (m as { code: string }).code);
  }
  flushMicro() {
    return new Promise((r) => setTimeout(r, 0));
  }
  drawerCid(): string {
    const v = this.view("c1");
    for (const [cid, pid] of this.pidOf) if (pid === v.drawer && !this.closed.has(cid)) return cid;
    throw new Error("no drawer");
  }
}

const P = ["pid-aaaaaaa1", "pid-bbbbbbb2", "pid-ccccccc3", "pid-ddddddd4"];

function lobby(n: number) {
  const h = new Harness();
  for (let i = 0; i < n; i++) h.join(`c${i + 1}`, P[i], ["Asha", "Ben", "Chen", "Dev"][i], i);
  return h;
}

describe("lobby", () => {
  test("first player is host; names must be unique; settings host-only", () => {
    const h = lobby(2);
    expect(h.view("c1").host).toBe(P[0]);
    expect(h.view("c2").players.map((p) => p.name)).toEqual(["Asha", "Ben"]);
    h.join("c9", "pid-zzzzzzz9", "  asha ");
    expect(h.errs("c9")).toContain("name_taken");
    expect(h.closed.get("c9")).toBe(CLOSE.NAME_TAKEN);
    h.send("c2", { t: "settings", s: { rounds: 5 } });
    expect(h.errs("c2")).toContain("not_host");
    h.send("c1", { t: "settings", s: { rounds: 5, drawTime: 45 } });
    expect(h.view("c2").settings.rounds).toBe(5);
    expect(h.view("c2").settings.drawTime).toBe(45);
  });

  test("room full and unknown rooms", () => {
    const h = lobby(2);
    h.send("c1", { t: "settings", s: { maxPlayers: 2 } });
    h.join("c3", P[2], "Chen");
    expect(h.closed.get("c3")).toBe(CLOSE.FULL);
    const empty = new RoomCore(h.io());
    empty.onOpen("x1");
    empty.onMessage("x1", JSON.stringify({ t: "hello", v: 3, pid: P[3], secret: "s".repeat(20), name: "Dev", color: 0, face: 0 }));
    expect(h.closed.get("x1")).toBe(CLOSE.NOT_FOUND);
  });

  test("start needs two connected players", () => {
    const h = lobby(1);
    h.send("c1", { t: "start" });
    expect(h.errs("c1")).toContain("need_players");
    expect(h.view("c1").phase).toBe("lobby");
  });
});

describe("a full game", () => {
  test("turns, guesses, scoring, rounds and results", async () => {
    const h = lobby(3);
    h.send("c1", { t: "settings", s: { rounds: 2, drawTime: 60, hints: 2 } });
    h.send("c1", { t: "start" });
    let v = h.view("c1");
    expect(v.phase).toBe("choosing");
    expect(v.round).toBe(1);
    expect(v.firstInRound).toBe(true);
    const d = h.drawerCid();
    expect(h.view(d).choices?.length).toBe(3);
    expect(h.view(d).choices!.map((c) => c.level)).toEqual(["easy", "medium", "hard"]); // mixed: one of each
    for (const c of ["c1", "c2", "c3"]) if (c !== d) expect(h.view(c).choices).toBeNull();

    h.send(d, { t: "choose", i: 1 });
    v = h.view(d);
    expect(v.phase).toBe("drawing");
    const word = v.word!;
    expect(word).toBeTruthy();
    const guessers = ["c1", "c2", "c3"].filter((c) => c !== d);
    for (const g of guessers) {
      expect(h.view(g).word).toBeNull();
      expect(h.view(g).mask!.filter((x) => x === null).length).toBeGreaterThan(0);
    }

    // Drawing ops are relayed to everyone else, with versions.
    h.send(d, { t: "draw", v: 0, ops: [{ k: "b", c: 0, w: 12, x: 100, y: 100 }, { k: "m", p: [110, 110, 120, 120] }] });
    h.send(d, { t: "draw", v: 2, ops: [{ k: "e" }] });
    const relays = h.msgs(guessers[0]).filter((m) => m.t === "draw");
    expect(relays.length).toBe(2);
    expect((relays[1] as { v: number }).v).toBe(2);
    // A stale version gets a full snapshot instead.
    h.send(d, { t: "draw", v: 0, ops: [{ k: "e" }] });
    expect(h.msgs(d).some((m) => m.t === "canvas" && m.v === 3)).toBe(true);

    // Wrong guess is public, close guess is private, correct guess is hidden.
    h.advance(10_000);
    h.send(guessers[0], { t: "chat", text: "banana split" });
    expect(h.chat(guessers[1]).some((m) => m.text === "banana split")).toBe(true);
    h.send(guessers[0], { t: "chat", text: word.toUpperCase() });
    expect(h.chat(guessers[1]).some((m) => m.text === word.toUpperCase())).toBe(false);
    expect(h.chat(guessers[1]).some((m) => m.k === "correct")).toBe(true);
    const first = h.view(guessers[0]).players.find((p) => p.id === h.pidOf.get(guessers[0]))!.score;
    expect(first).toBe(200 + Math.round(100 * (50 / 60)));
    expect(h.view(guessers[0]).word).toBe(word); // guessed players see the word

    // Guessed players chat privately with the drawer.
    h.send(guessers[0], { t: "chat", text: "nice drawing" });
    expect(h.chat(d).some((m) => m.k === "secret" && m.text === "nice drawing")).toBe(true);
    expect(h.chat(guessers[1]).some((m) => m.text === "nice drawing")).toBe(false);

    // Drawer cannot chat.
    h.send(d, { t: "chat", text: word });
    expect(h.errs(d)).toContain("drawer_chat");

    // Last guesser ends the turn early.
    h.advance(10_000);
    h.send(guessers[1], { t: "chat", text: word });
    v = h.view("c1");
    expect(v.phase).toBe("reveal");
    expect(v.reason).toBe("all");
    expect(v.word).toBe(word);
    const second = v.turnScores!.find((s) => s.id === h.pidOf.get(guessers[1]))!.pts;
    expect(second).toBeLessThan(first);
    expect(v.turnScores!.find((s) => s.id === v.drawer)!.pts).toBe(375); // choice 1 is the medium word: 300 × 1.25
    expect(h.storage.has("gal:0")).toBe(true);

    // Remaining turns run on timers (nobody guesses).
    const seen = new Set<string>([v.drawer!]);
    for (let turn = 1; turn < 6; turn++) {
      h.advance(TIMING.revealMs + 1);
      v = h.view("c1");
      expect(v.phase).toBe("choosing");
      seen.add(v.drawer!);
      if (turn === 3) expect(v.round).toBe(2);
      h.advance(TIMING.chooseMs + TIMING.roundBannerMs + 1); // auto-picks a word
      expect(h.view("c1").phase).toBe("drawing");
      h.advance(60_000 + 1);
      expect(h.view("c1").phase).toBe("reveal");
      expect(h.view("c1").reason).toBe("time");
    }
    expect(seen.size).toBe(3);
    h.advance(TIMING.revealMs + 1);
    v = h.view("c1");
    expect(v.phase).toBe("over");
    expect(v.results!.length).toBe(3);
    expect(v.results![0].rank).toBe(1);

    // Gallery drawings can be fetched after the game.
    h.send("c2", { t: "drawing", turn: 0 });
    expect(h.msgs("c2").some((m) => m.t === "drawing" && m.word === word)).toBe(true);

    h.send("c1", { t: "lobby" });
    expect(h.view("c2").phase).toBe("lobby");
    await h.flushMicro();
  });

  test("hints reveal letters over time", () => {
    const h = lobby(2);
    h.send("c1", { t: "settings", s: { drawTime: 100, hints: 2, customWords: "watermelon, pineapple, strawberry, blueberry, raspberry, blackberry, cranberry, gooseberry, elderberry, mulberry", customOnly: true } });
    h.send("c1", { t: "start" });
    const d = h.drawerCid();
    h.send(d, { t: "choose", i: 0 });
    const g = d === "c1" ? "c2" : "c1";
    const hidden = () => h.view(g).mask!.filter((x) => x === null).length;
    const start = hidden();
    h.advance(46_000);
    expect(hidden()).toBe(start - 1);
    h.advance(25_000);
    expect(hidden()).toBe(start - 2);
  });
});

describe("words, categories and guessing", () => {
  test("category and difficulty shape the choices, and easy words show their category", () => {
    const h = lobby(2);
    h.send("c1", { t: "settings", s: { category: "animals", difficulty: "easy" } });
    expect(h.view("c2").settings.category).toBe("animals");
    h.send("c1", { t: "settings", s: { category: "not-a-category" } });
    expect(h.view("c2").settings.category).toBe("animals");
    h.send("c1", { t: "start" });
    const d = h.drawerCid();
    const choices = h.view(d).choices!;
    expect(choices.length).toBe(3);
    for (const c of choices) {
      expect(c.category).toBe("Animals");
      expect(c.level).toBe("easy");
    }
    h.send(d, { t: "choose", i: 0 });
    const g = d === "c1" ? "c2" : "c1";
    expect(h.view(g).category).toBe("Animals");
    expect(h.view(g).word).toBeNull();
  });

  test("with all categories, hard words hide the category", () => {
    const h = lobby(2);
    h.send("c1", { t: "settings", s: { difficulty: "hard" } });
    h.send("c1", { t: "start" });
    const d = h.drawerCid();
    h.send(d, { t: "choose", i: 0 });
    expect(h.view(d === "c1" ? "c2" : "c1").category).toBeNull();
  });

  test("the host can hide the category, unless a specific category is chosen", () => {
    const guesserView = (settings: object) => {
      const h = lobby(2);
      h.send("c1", { t: "settings", s: { difficulty: "easy", ...settings } });
      h.send("c1", { t: "start" });
      const d = h.drawerCid();
      h.send(d, { t: "choose", i: 0 });
      return h.view(d === "c1" ? "c2" : "c1").category;
    };
    expect(guesserView({})).not.toBeNull(); // default: shown
    expect(guesserView({ showCategory: false })).toBeNull();
    expect(guesserView({ showCategory: true })).not.toBeNull();
    expect(guesserView({ category: "animals", showCategory: false })).toBe("Animals");
    expect(guesserView({ category: "movies", difficulty: "hard", showCategory: false })).toBe("Movies & TV");
  });

  test("typos score, near misses and related words get private nudges", () => {
    const h = lobby(3);
    const words = "watermelon, strawberry, blueberry, raspberry, blackberry, cranberry, gooseberry, elderberry, mulberry, boysenberry";
    h.send("c1", { t: "settings", s: { customWords: words, customOnly: true } });
    h.send("c1", { t: "start" });
    const d = h.drawerCid();
    h.send(d, { t: "choose", i: 0 });
    const word = h.view(d).word!;
    const [g1, g2] = ["c1", "c2", "c3"].filter((c) => c !== d);
    const near = word.slice(0, -3) + "xyz"; // three letters off
    h.send(g1, { t: "chat", text: near });
    expect(h.chat(g1).some((m) => m.k === "close" && m.text.includes("very close"))).toBe(true);
    expect(h.chat(g2).some((m) => m.k === "close")).toBe(false); // nudges are private
    const typo = word.slice(0, 2) + word[3] + word[2] + word.slice(4); // swap two letters
    h.send(g1, { t: "chat", text: typo });
    expect(h.chat(g1).some((m) => m.k === "you" && m.text.includes("close enough"))).toBe(true);
    expect(h.view(g1).guessed).toContain(h.pidOf.get(g1));
  });

  test("away players don't cut the drawer's points", () => {
    const h = lobby(4);
    h.send("c1", { t: "start" });
    const d = h.drawerCid();
    h.send(d, { t: "choose", i: 0 }); // the easy word
    const word = h.view(d).word!;
    const [away, ...rest] = ["c1", "c2", "c3", "c4"].filter((c) => c !== d);
    h.drop(away);
    for (const g of rest) h.send(g, { t: "chat", text: word });
    const v = h.view(d);
    expect(v.reason).toBe("all");
    expect(v.turnScores!.find((s) => s.id === v.drawer)!.pts).toBe(300);
  });

  test("the drawer can end their turn", () => {
    const h = lobby(3);
    h.send("c1", { t: "start" });
    let d = h.drawerCid();
    const other = ["c1", "c2", "c3"].find((c) => c !== d)!;
    h.send(other, { t: "skip" }); // only the drawer can
    expect(h.view("c1").phase).toBe("choosing");
    h.send(d, { t: "skip" }); // while choosing: straight to the next drawer
    expect(h.view("c1").phase).toBe("choosing");
    expect(h.drawerCid()).not.toBe(d);
    d = h.drawerCid();
    h.send(d, { t: "choose", i: 0 });
    h.send(d, { t: "skip" }); // while drawing: reveal the word
    expect(h.view("c1").phase).toBe("reveal");
    expect(h.view("c1").reason).toBe("skipped");
  });
});

describe("disconnects and recovery", () => {
  test("drawer gets a grace period, then the turn ends", () => {
    const h = lobby(3);
    h.send("c1", { t: "start" });
    const d = h.drawerCid();
    h.send(d, { t: "choose", i: 0 });
    h.drop(d);
    h.advance(TIMING.drawerGraceMs - 1000);
    expect(h.view("c1").phase === "drawing" || d === "c1").toBe(true);
    const other = ["c1", "c2", "c3"].find((c) => c !== d)!;
    h.advance(1500);
    expect(h.view(other).phase).toBe("reveal");
    expect(h.view(other).reason).toBe("drawer_left");
  });

  test("a refresh keeps your seat and score", () => {
    const h = lobby(2);
    h.send("c1", { t: "start" });
    const d = h.drawerCid();
    h.send(d, { t: "choose", i: 0 });
    const g = d === "c1" ? "c2" : "c1";
    const pid = h.pidOf.get(g)!;
    h.send(g, { t: "chat", text: h.view(d).word! });
    const score = h.view(d).players.find((p) => p.id === pid)!.score;
    expect(score).toBeGreaterThan(0);
    h.drop(g);
    h.advance(3000);
    h.join("c7", pid, "ignored");
    const back = h.view("c7");
    expect(back.players.find((p) => p.id === pid)!.score).toBe(score);
    expect(back.players.find((p) => p.id === pid)!.name).not.toBe("ignored");
    expect(h.msgs("c7").some((m) => m.t === "canvas")).toBe(true);
  });

  test("a second tab replaces the first", () => {
    const h = lobby(2);
    h.join("c5", P[1], "Ben");
    expect(h.closed.get("c2")).toBe(CLOSE.REPLACED);
    expect(h.view("c5").players.length).toBe(2);
  });

  test("wrong secret cannot take a seat", () => {
    const h = lobby(2);
    h.core.onOpen("evil");
    h.send("evil", { t: "hello", v: 3, pid: P[1], secret: "not-the-right-secret!!", name: "Ben", color: 0, face: 0 });
    expect(h.closed.get("evil")).toBe(CLOSE.BAD_HELLO);
    expect(h.closed.has("c2")).toBe(false);
  });

  test("host hands over after leaving", () => {
    const h = lobby(3);
    h.drop("c1");
    h.advance(TIMING.hostGraceMs + 100);
    expect(h.view("c2").host).toBe(P[1]);
  });

  test("kicked players cannot come back", () => {
    const h = lobby(3);
    h.send("c1", { t: "kick", pid: P[2] });
    expect(h.closed.get("c3")).toBe(CLOSE.KICKED);
    expect(h.view("c1").players.length).toBe(2);
    h.join("c8", P[2], "Chen");
    expect(h.closed.get("c8")).toBe(CLOSE.KICKED);
  });

  test("dropping below two players waits, then returns to the lobby", () => {
    const h = lobby(2);
    h.send("c1", { t: "start" });
    const d = h.drawerCid();
    h.send(d, { t: "choose", i: 0 });
    const g = d === "c1" ? "c2" : "c1";
    h.send(g, { t: "leave" });
    expect(h.view(d).phase).toBe("reveal");
    h.advance(TIMING.revealMs + 1);
    expect(h.view(d).phase).toBe("waiting");
    h.advance(TIMING.waitMs + 1);
    expect(h.view(d).phase).toBe("lobby");
  });

  test("waiting resumes when someone joins", () => {
    const h = lobby(2);
    h.send("c1", { t: "start" });
    h.drop("c2");
    for (let i = 0; i < 20 && h.view("c1").phase !== "waiting"; i++) h.advance(10_000);
    expect(h.view("c1").phase).toBe("waiting");
    h.join("c3", P[2], "Chen");
    expect(["choosing"]).toContain(h.view("c3").phase);
  });

  test("late joiners can guess and get a turn", () => {
    const h = lobby(2);
    h.send("c1", { t: "settings", s: { rounds: 1 } });
    h.send("c1", { t: "start" });
    h.join("c3", P[2], "Chen");
    const drawers = new Set<string>();
    for (let i = 0; i < 60 && h.view("c1").phase !== "over"; i++) {
      const v = h.view("c1");
      if (v.drawer) drawers.add(v.drawer);
      h.advance(20_000);
    }
    expect(drawers.has(P[2])).toBe(true);
  });

  test("state survives a restart", () => {
    const h = lobby(3);
    h.send("c1", { t: "start" });
    const d = h.drawerCid();
    h.send(d, { t: "choose", i: 0 });
    h.send(d, { t: "draw", v: 0, ops: [{ k: "b", c: 3, w: 12, x: 5, y: 5 }, { k: "e" }] });
    h.advance(3000); // let saves flush
    const before = h.view("c1");
    const core2 = new RoomCore(h.io());
    core2.restore(h.storage.get("state") as never, h.storage.get("canvas") as never);
    expect(core2.phase).toBe("drawing");
    expect(core2.items.length).toBe(1);
    expect(core2.turn?.word).toBe(h.view(d).word);
    expect(core2.players.size).toBe(before.players.length);
  });

  test("empty rooms are cleaned up", () => {
    const h = lobby(1);
    h.drop("c1");
    h.advance(TIMING.emptyTtlMs + TIMING.seatHoldLobbyMs + 1000);
    expect(h.core.exists()).toBe(false);
  });
});

describe("stepping away (app in the background)", () => {
  test("a short trip to another app keeps the seat and the host role", () => {
    const h = lobby(3);
    h.send("c1", { t: "away" });
    expect(h.view("c2").players.find((p) => p.id === P[0])!.away).toBe(true);
    h.drop("c1"); // the phone then drops the connection
    h.advance(45_000);
    expect(h.view("c2").host).toBe(P[0]);
    expect(h.view("c2").players.length).toBe(3);
    h.join("c4", P[0], "Asha"); // back after 45 seconds
    expect(h.view("c2").host).toBe(P[0]);
    expect(h.chat("c2").some((m) => m.text.includes("left"))).toBe(false);
  });

  test("in the lobby the host role moves after a minute away, and comes back with the room's creator", () => {
    const h = lobby(3);
    h.send("c1", { t: "away" });
    h.advance(TIMING.hostGraceMs + 100);
    expect(h.view("c2").host).toBe(P[1]);
    h.send("c1", { t: "back" });
    expect(h.view("c2").host).toBe(P[0]);
    expect(h.chat("c2").some((m) => m.text === "Asha is the host again.")).toBe(true);
  });

  test("during a game the host role never moves for being away", () => {
    const h = lobby(3);
    h.send("c1", { t: "start" });
    h.send("c1", { t: "away" });
    h.advance(120_000);
    expect(h.view("c2").host).toBe(P[0]);
  });

  test("seats are held for three minutes, then released", () => {
    const h = lobby(3);
    h.drop("c3");
    h.advance(150_000);
    expect(h.view("c1").players.length).toBe(3);
    expect(h.view("c1").players.find((p) => p.id === P[2])!.away).toBe(true);
    h.advance(40_000);
    expect(h.view("c1").players.length).toBe(2);
  });

  test("away players are skipped as drawer and don't hold up the turn", () => {
    const h = lobby(3);
    h.send("c1", { t: "start" });
    const d = h.drawerCid();
    const [g1, g2] = ["c1", "c2", "c3"].filter((c) => c !== d);
    h.send(g2, { t: "away" });
    h.send(d, { t: "choose", i: 0 });
    h.send(g1, { t: "chat", text: h.view(d).word! });
    expect(h.view(d).phase).toBe("reveal");
    expect(h.view(d).reason).toBe("all");
    h.advance(TIMING.revealMs + 1);
    const next = h.view(d).drawer;
    expect(next).not.toBe(h.pidOf.get(g2));
  });

  test("a drawer who steps away has a short grace period", () => {
    const h = lobby(3);
    h.send("c1", { t: "start" });
    const d = h.drawerCid();
    h.send(d, { t: "choose", i: 0 });
    h.send(d, { t: "away" });
    h.advance(TIMING.drawerGraceMs - 2000);
    h.send(d, { t: "back" });
    h.advance(5000);
    expect(h.view("c1").phase).toBe("drawing");
    h.send(d, { t: "away" });
    h.advance(TIMING.drawerGraceMs + 100);
    expect(h.view("c1").phase).toBe("reveal");
    expect(h.view("c1").reason).toBe("drawer_left");
  });

  test("a silent connection is dropped so it can't hold up the game", () => {
    const h = lobby(2);
    h.silent.add("c2");
    h.advance(100_000);
    expect(h.view("c1").players.find((p) => p.id === P[1])!.connected).toBe(false);
    expect(h.view("c1").players.find((p) => p.id === P[0])!.connected).toBe(true);
  });

  test("a creator who taps Leave gives up the room", () => {
    const h = lobby(3);
    h.send("c1", { t: "leave" });
    expect(h.view("c2").host).toBe(P[1]);
    h.join("c5", P[0], "Asha");
    expect(h.view("c2").host).toBe(P[1]);
  });
});

describe("abuse limits", () => {
  test("chat rate limit and oversize messages", () => {
    const h = lobby(2);
    for (let i = 0; i < 7; i++) h.send("c2", { t: "chat", text: `hi ${i}` });
    expect(h.errs("c2")).toContain("rate_limited");
    h.core.onMessage("c2", "x".repeat(500_000));
    expect(h.closed.get("c2")).toBe(CLOSE.BAD_HELLO);
  });
  test("invalid draw ops are rejected", () => {
    const h = lobby(2);
    h.send("c1", { t: "start" });
    const d = h.drawerCid();
    h.send(d, { t: "choose", i: 0 });
    const g = d === "c1" ? "c2" : "c1";
    h.send(d, { t: "draw", v: 0, ops: [{ k: "b", c: 0, w: 12, x: 1.5, y: 0 }] });
    expect(h.msgs(g).some((m) => m.t === "draw")).toBe(false);
    h.send(g, { t: "draw", v: 0, ops: [{ k: "b", c: 0, w: 12, x: 1, y: 0 }] });
    expect(h.msgs(d).filter((m) => m.t === "draw").length).toBe(0);
  });
});

describe("player photos", () => {
  const JPG = "data:image/jpeg;base64," + "A".repeat(400);
  const JPG2 = "data:image/jpeg;base64," + "B".repeat(400);
  const photosOf = (h: Harness, cid: string) => h.msgs(cid).filter((m) => m.t === "photo") as Extract<ServerMsg, { t: "photo" }>[];
  const lastState = (h: Harness, cid: string) => [...h.msgs(cid)].reverse().find((m) => m.t === "state") as Extract<ServerMsg, { t: "state" }>;

  test("a photo is shared once, versioned, and late joiners get it", () => {
    const h = new Harness();
    h.join("a", "pid-aaaaaaaa", "Asha");
    h.join("b", "pid-bbbbbbbb", "Ben");
    h.send("a", { t: "photo", data: JPG });
    expect(photosOf(h, "b").length).toBe(1);
    const v1 = photosOf(h, "b")[0].v;
    expect(lastState(h, "b").s.players.find((p) => p.id === "pid-aaaaaaaa")!.photo).toBe(v1);
    h.send("a", { t: "photo", data: JPG }); // same photo again (reconnect): ignored
    expect(photosOf(h, "b").length).toBe(1);
    h.send("a", { t: "photo", data: JPG2 });
    expect(photosOf(h, "b")[1].v).toBeGreaterThan(v1);
    h.join("c", "pid-cccccccc", "Chen");
    expect(photosOf(h, "c").map((m) => m.data)).toEqual([JPG2]);
    expect(h.storage.has("photo:pid-aaaaaaaa")).toBe(true);
  });

  test("bad images are refused", () => {
    const h = new Harness();
    h.join("a", "pid-aaaaaaaa", "Asha");
    for (const bad of ["data:image/png;base64,AAAA", "data:text/html;base64,AAAA", "javascript:alert(1)", "data:image/jpeg;base64," + "A".repeat(50_000), 42]) {
      h.send("a", { t: "photo", data: bad });
    }
    expect(h.core.photos.size).toBe(0);
    expect([...h.storage.keys()].some((k) => k.startsWith("photo:"))).toBe(false);
  });

  test("removing your photo, leaving, and the host turning photos off all delete it", () => {
    const h = new Harness();
    h.join("a", "pid-aaaaaaaa", "Asha");
    h.join("b", "pid-bbbbbbbb", "Ben");
    h.send("b", { t: "photo", data: JPG });
    h.send("b", { t: "photo", data: null });
    expect(h.storage.has("photo:pid-bbbbbbbb")).toBe(false);
    expect(lastState(h, "a").s.players.find((p) => p.id === "pid-bbbbbbbb")!.photo).toBe(0);
    h.send("b", { t: "photo", data: JPG });
    h.send("b", { t: "leave" });
    expect(h.storage.has("photo:pid-bbbbbbbb")).toBe(false);
    h.join("c", "pid-cccccccc", "Chen");
    h.send("c", { t: "photo", data: JPG });
    h.send("a", { t: "settings", s: { photos: false } });
    expect(h.core.photos.size).toBe(0);
    expect(h.storage.has("photo:pid-cccccccc")).toBe(false);
    h.send("c", { t: "photo", data: JPG2 }); // not kept while photos are off
    expect(h.core.photos.size).toBe(0);
    expect(lastState(h, "c").s.settings.photos).toBe(false);
  });

  test("photos survive a restart", () => {
    const h = new Harness();
    h.join("a", "pid-aaaaaaaa", "Asha");
    h.send("a", { t: "photo", data: JPG });
    h.advance(2000);
    const fresh = new RoomCore(h.io());
    const photos = new Map([...h.storage].filter(([k]) => k.startsWith("photo:")).map(([k, v]) => [k.slice(6), v as { v: number; data: string }]));
    fresh.restore(h.storage.get("state") as never, undefined, photos);
    expect(fresh.photos.get("pid-aaaaaaaa")?.data).toBe(JPG);
  });
});

describe("the race after the first guess", () => {
  function race(players: number, drawTime: number) {
    const h = lobby(players);
    h.send("c1", { t: "settings", s: { drawTime, hints: 3, customWords: "watermelon, pineapple, strawberry, blueberry, raspberry, blackberry, cranberry, gooseberry, elderberry, mulberry", customOnly: true } });
    h.send("c1", { t: "start" });
    const d = h.drawerCid();
    h.send(d, { t: "choose", i: 0 });
    const word = h.view(d).word!;
    const guessers = ["c1", "c2", "c3", "c4"].slice(0, players).filter((c) => c !== d);
    return { h, d, word, guessers };
  }

  test("the first correct guess snaps a long clock down to 30 seconds, once", () => {
    const { h, d, word, guessers } = race(3, 100);
    h.advance(5_000);
    h.send(guessers[0], { t: "chat", text: word });
    const v = h.view(d);
    expect(v.phaseEnds! - h.t).toBe(30_000);
    expect(h.chat(d).some((m) => m.k === "sys" && /got it first! 30 seconds left/.test(m.text))).toBe(true);
    h.advance(10_000);
    expect(h.view(d).phase).toBe("drawing");
    expect(h.view(d).phaseEnds).toBe(v.phaseEnds); // a later guess doesn't move it again
    h.advance(21_000);
    expect(h.view(d).phase).toBe("reveal");
    expect(h.view(d).reason).toBe("time");
  });

  test("hints still to come are folded into one, 10 seconds before the end", () => {
    const { h, d, word, guessers } = race(3, 100);
    const g = guessers[1];
    const hidden = () => h.view(g).mask!.filter((x) => x === null).length;
    const start = hidden();
    h.send(guessers[0], { t: "chat", text: word });
    h.advance(19_000);
    expect(hidden()).toBe(start);
    h.advance(2_000);
    expect(hidden()).toBe(start - 1);
    h.advance(8_000);
    expect(hidden()).toBe(start - 1);
    void d;
  });

  test("no snap when 30 seconds or less are left", () => {
    const { h, d, word, guessers } = race(3, 45);
    h.advance(20_000);
    const before = h.view(d).phaseEnds;
    h.send(guessers[0], { t: "chat", text: word });
    expect(h.view(d).phaseEnds).toBe(before);
    expect(h.chat(d).some((m) => /got it first/.test(m.text))).toBe(false);
  });

  test("when every active guesser has it, the turn ends at once", () => {
    const { h, d, word, guessers } = race(4, 100);
    h.send(guessers[0], { t: "chat", text: word });
    h.send(guessers[1], { t: "chat", text: word });
    expect(h.view(d).phase).toBe("drawing");
    h.send(guessers[2], { t: "chat", text: word });
    expect(h.view(d).phase).toBe("reveal");
    expect(h.view(d).reason).toBe("all");
  });
});
