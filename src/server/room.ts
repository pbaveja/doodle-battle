// The authoritative game engine for one room. It has no platform code: the Cloudflare
// Durable Object (worker.ts) and the local dev server (dev/server.ts) both drive it
// through the small `RoomIO` interface below.

import {
  CLOSE, HEARTBEAT, INKS, LIMITS, PID_RE, PROTOCOL, TIMING,
  type ChatKind, type ChatMsg, type EndReason, type ErrCode, type GalleryEntry, type Item,
  type ClientMsg, type Phase, type PlayerView, type Result, type RoomInfo, type ServerMsg, type Settings,
  type Timing, type TurnScore, type View,
} from "../shared/protocol";
import {
  applyOp, cleanText, defaultSettings, drawerPoints, guessPoints, judgeGuess, maskWord,
  normalizeGuess, parseCustomWords, planHints, rankPlayers, sameName, sanitizeName,
  sanitizeSettings, validColor, validFace, validOp, validPhoto,
} from "../shared/rules";
import { WORD_ENTRIES } from "../shared/words";
import { categoryLabel } from "../shared/categories";
import { STUDENT_WORDS } from "../shared/student-words";
import { categoryMatches, gradeLevel, subjectLabel, type Edition } from "../shared/students";

/** A word as the room uses it: built-in words carry a category and related guesses. */
interface Entry {
  word: string;
  level: "easy" | "medium" | "hard" | "custom";
  category: string | null;
  very: string[];
  close: string[];
}

const BUILT_IN: Entry[] = WORD_ENTRIES.map((e) => ({ ...e }));
const MIXED_LEVELS = ["easy", "medium", "hard"] as const;
/** Every built-in word in either edition, so a different real word is never treated as a typo. */
const BUILT_IN_KEYS = new Set([...WORD_ENTRIES, ...STUDENT_WORDS].map((e) => normalizeGuess(e.word)));
const studentPools = new Map<number, Entry[]>();
/** Student words up to the given class, with a level relative to it (see gradeLevel). */
function studentEntries(grade: number): Entry[] {
  let pool = studentPools.get(grade);
  if (!pool) {
    pool = [];
    for (const w of STUDENT_WORDS) {
      const level = gradeLevel(w.grade, grade);
      if (level) pool.push({ word: w.word, level, category: w.subject, very: w.very, close: w.close });
    }
    studentPools.set(grade, pool);
  }
  return pool;
}
const customEntry = (word: string): Entry => ({ word, level: "custom", category: null, very: [], close: [] });

export interface RoomIO {
  send(cid: string, data: string): void;
  close(cid: string, code: number, reason: string): void;
  /** Remember which player a connection belongs to (survives hibernation on Cloudflare). */
  bind(cid: string, pid: string | null): void;
  /** Wake the room at `at` (in-memory timer) and durably at `durableAt` (alarm). */
  schedule(at: number | null, durableAt: number | null): void;
  save(entries: Record<string, unknown>): void;
  remove(keys: string[]): void;
  /** Read a saved drawing (key `gal:<turn>`) and send it to one connection. */
  sendGallery(cid: string, turn: number): void;
  /** When the platform last answered this connection's heartbeat without waking the room, if it does. */
  lastHeartbeat(cid: string): number | null;
  /** Write one structured log line (Workers Logs on Cloudflare). */
  log(entry: Record<string, unknown>): void;
  destroy(): void;
  now(): number;
  random(): number;
}

interface Player {
  id: string;
  secret: string;
  name: string;
  color: number;
  face: number;
  score: number;
  seat: number;
  cid: string | null;
  leftAt: number | null;
  /** The page is hidden (app in the background, tab switched). The seat and score are kept. */
  away?: boolean;
  awaySince?: number | null;
  /** Version of the player's photo (0 or missing: none). The image itself lives in `photos`. */
  photo?: number;
  /** In the voice chat. Each new connection starts outside it; the page joins again if it's still in. */
  voice?: boolean;
}

interface Turn {
  index: number;
  round: number;
  drawer: string;
  drawerName: string;
  drawerColor: number;
  choices: Entry[];
  entry?: Entry | null;
  word: string | null;
  guessed: { id: string; pts: number }[];
  hints: { at: number; idx: number }[];
  revealed: number[];
  reason: EndReason | null;
  scores: TurnScore[] | null;
  drawerAwaySince: number | null;
  firstInRound: boolean;
}

interface Conn {
  pid: string | null;
  opened: number;
  /** Last time anything arrived on this connection (clients ping every 10s). */
  seen: number;
  chat: number[];
  drawWindow: number;
  drawCount: number;
  /** Times of recent photo uploads, for rate limiting. */
  photo: number[];
  /** Times of recent voice handshakes passed on, for rate limiting. */
  rtc: number[];
}

type Vis = "all" | string[];
interface StoredChat {
  m: ChatMsg;
  vis: Vis;
}

interface Snapshot {
  v: 1;
  code: string;
  created: number;
  host: string;
  phase: Phase;
  settings: Settings;
  players: Player[];
  seatCounter: number;
  round: number;
  queue: string[];
  roundDrawn: string[];
  turn: Turn | null;
  turnCount: number;
  phaseEnds: number | null;
  phaseStarted: number | null;
  used: string[];
  /** Words shown as choices (picked or not). Optional: older snapshots lack it. */
  offered?: string[];
  kicked: string[];
  chat: StoredChat[];
  chatId: number;
  emptySince: number | null;
  results: Result[] | null;
  galleryTurns: number[];
  owner?: string;
  photoSeq?: number;
  tally?: Tally;
}

/**
 * What reached the room since the last report. It's logged when a game ends and when the room
 * closes, to show where the room's Durable Object requests come from. It rides along with state
 * saves, so a restart keeps it, but anything counted after the last save is lost if the room sleeps.
 */
interface Tally {
  since: number;
  /** Incoming WebSocket messages by type ("bad" for anything that isn't a client message). */
  types: Record<string, number>;
  /** WebSocket connections opened. */
  connects: number;
  /** WebSocket close and error events from the platform. */
  closes: number;
  /** Durable alarms that fired. The in-memory timer normally gets there first, so these follow restarts. */
  alarms: number;
  /** HTTP requests: claiming the room and looking it up before joining. */
  http: number;
  /** Times the room was loaded from storage: waking from hibernation, or after a restart or deploy. */
  wakes: number;
}
/** Events only the platform sees, counted through `RoomCore.note`. */
export type TallyEvent = "closes" | "alarms" | "http";

const newTally = (since: number): Tally => ({ since, types: {}, connects: 0, closes: 0, alarms: 0, http: 0, wakes: 0 });

/** Every message type a client sends. Anything else is counted as "bad". */
const CLIENT_TYPES: Record<ClientMsg["t"], true> = {
  hello: true, ping: true, hb: true, profile: true, settings: true, start: true, choose: true,
  draw: true, sync: true, chat: true, kick: true, leave: true, end: true, skip: true, away: true,
  back: true, lobby: true, drawing: true, photo: true, voice: true, rtc: true,
};

/** A player's photo. Stored under its own key (`photo:<pid>`) so the frequent state saves stay small. */
export interface StoredPhoto {
  v: number;
  data: string;
}

const CHAT_KEEP = 80;

export class RoomCore {
  code = "";
  created = 0;
  hostId = "";
  /** Whoever created the room. They get the host role back when they return. */
  ownerId = "";
  phase: Phase = "lobby";
  settings: Settings = defaultSettings();
  players = new Map<string, Player>();
  seatCounter = 0;
  round = 0;
  queue: string[] = [];
  roundDrawn = new Set<string>();
  turn: Turn | null = null;
  turnCount = 0;
  phaseEnds: number | null = null;
  phaseStarted: number | null = null;
  used = new Set<string>();
  offered = new Set<string>();
  kicked = new Set<string>();
  chat: StoredChat[] = [];
  chatId = 0;
  emptySince: number | null = null;
  results: Result[] | null = null;
  galleryTurns: number[] = [];
  /** Player photos by player id. Kept only while the player is in the room and photos are on. */
  photos = new Map<string, StoredPhoto>();
  /** Every photo gets a new version number, so clients never confuse an old picture with a new one. */
  photoSeq = 0;

  items: Item[] = [];
  canvasV = 0;
  points = 0;

  private conns = new Map<string, Conn>();
  private viewDirty = false;
  private stateDirty = false;
  private stateUrgent = false;
  private canvasDirty = false;
  private lastStateSave = 0;
  private lastCanvasSave = 0;
  private destroyed = false;
  private tally = newTally(0);

  constructor(private io: RoomIO, private timing: Timing = TIMING) {}

  /* =================== lifecycle =================== */

  exists() {
    return this.created > 0 && !this.destroyed;
  }

  claim(code: string, edition: Edition = "main"): boolean {
    if (this.exists()) return false;
    const now = this.io.now();
    this.reset();
    this.code = code;
    this.settings.edition = edition;
    // Student rooms are for children: photos stay off unless the host turns them on.
    if (edition === "students") this.settings.photos = false;
    this.created = now;
    this.emptySince = now;
    this.tally = newTally(now);
    this.stateDirty = this.stateUrgent = true;
    this.flush();
    return true;
  }

  private reset() {
    this.hostId = "";
    this.ownerId = "";
    this.phase = "lobby";
    this.settings = defaultSettings();
    this.players.clear();
    this.seatCounter = 0;
    this.round = 0;
    this.queue = [];
    this.roundDrawn.clear();
    this.turn = null;
    this.turnCount = 0;
    this.phaseEnds = this.phaseStarted = null;
    this.used.clear();
    this.offered.clear();
    this.kicked.clear();
    this.chat = [];
    this.chatId = 0;
    this.results = null;
    this.galleryTurns = [];
    this.photos.clear();
    this.photoSeq = 0;
    this.items = [];
    this.canvasV = 0;
    this.points = 0;
    this.destroyed = false;
  }

  info(): RoomInfo {
    if (!this.exists()) return { exists: false, players: 0, max: 0, phase: null };
    return { exists: true, players: this.players.size, max: this.settings.maxPlayers, phase: this.phase };
  }

  restore(
    snap: Snapshot | undefined,
    canvas: { turn: number; v: number; items: Item[] } | undefined,
    photos?: Map<string, StoredPhoto>,
  ) {
    if (!snap || snap.v !== 1) return;
    const now = this.io.now();
    this.code = snap.code;
    this.created = snap.created;
    this.hostId = snap.host;
    this.ownerId = snap.owner ?? snap.host;
    this.phase = snap.phase;
    this.settings = { ...defaultSettings(), ...snap.settings };
    // Away is kept: after waking from hibernation the sockets are still open and may still be in the background.
    this.players = new Map(snap.players.map((p) => [p.id, { ...p, cid: null, leftAt: p.leftAt ?? now }]));
    this.seatCounter = snap.seatCounter;
    this.round = snap.round;
    this.queue = snap.queue;
    this.roundDrawn = new Set(snap.roundDrawn);
    this.turn = snap.turn;
    if (this.turn) {
      const tt = this.turn as Turn & { choices: (Entry | string)[] };
      tt.choices = tt.choices.map((c) => (typeof c === "string" ? customEntry(c) : c));
      if (tt.word && !tt.entry) tt.entry = this.wordList().find((e) => e.word === tt.word) ?? customEntry(tt.word);
    }
    this.turnCount = snap.turnCount;
    this.phaseEnds = snap.phaseEnds;
    this.phaseStarted = snap.phaseStarted;
    this.used = new Set(snap.used);
    this.offered = new Set(snap.offered ?? []);
    this.kicked = new Set(snap.kicked);
    this.chat = snap.chat;
    this.chatId = snap.chatId;
    // Older saves have none; with null, step() starts the countdown and saves it.
    this.emptySince = snap.emptySince ?? null;
    this.results = snap.results;
    this.galleryTurns = snap.galleryTurns ?? [];
    this.photoSeq = snap.photoSeq ?? 0;
    this.tally = snap.tally ?? newTally(now);
    this.tally.wakes++;
    this.photos.clear();
    for (const p of this.players.values()) {
      const ph = this.settings.photos ? photos?.get(p.id) : undefined;
      if (ph && ph.v === p.photo && validPhoto(ph.data)) this.photos.set(p.id, ph);
      else p.photo = 0;
    }
    if (this.turn && this.turn.drawerAwaySince === null && (this.phase === "choosing" || this.phase === "drawing")) {
      this.turn.drawerAwaySince = now;
    }
    if (canvas && this.turn && canvas.turn === this.turn.index) {
      this.items = canvas.items;
      this.canvasV = canvas.v;
      this.points = 0;
      for (const it of this.items) if (it.k === "s") this.points += it.p.length / 2;
    }
  }

  /** Re-attach a live socket after the room was reloaded from storage. */
  rebind(cid: string, pid: string | null) {
    const now = this.io.now();
    this.conns.set(cid, { pid, opened: now, seen: now, chat: [], drawWindow: 0, drawCount: 0, photo: [], rtc: [] });
    if (!pid) return;
    const p = this.players.get(pid);
    if (p) {
      p.cid = cid;
      p.leftAt = null;
      if (this.turn?.drawer === pid && !p.away) this.turn.drawerAwaySince = null;
      this.emptySince = null;
    }
  }

  serialize(): Snapshot {
    return {
      v: 1,
      code: this.code,
      created: this.created,
      host: this.hostId,
      owner: this.ownerId,
      phase: this.phase,
      settings: this.settings,
      players: [...this.players.values()].map((p) => ({ ...p, cid: null })),
      seatCounter: this.seatCounter,
      round: this.round,
      queue: this.queue,
      roundDrawn: [...this.roundDrawn],
      turn: this.turn,
      turnCount: this.turnCount,
      phaseEnds: this.phaseEnds,
      phaseStarted: this.phaseStarted,
      used: [...this.used],
      offered: [...this.offered],
      kicked: [...this.kicked],
      chat: this.chat,
      chatId: this.chatId,
      emptySince: this.emptySince,
      results: this.results,
      galleryTurns: this.galleryTurns,
      photoSeq: this.photoSeq,
      tally: this.tally,
    };
  }

  /* =================== events =================== */

  onOpen(cid: string) {
    const now = this.io.now();
    this.tally.connects++;
    this.conns.set(cid, { pid: null, opened: now, seen: now, chat: [], drawWindow: 0, drawCount: 0, photo: [], rtc: [] });
    this.emptySince = null;
    this.flush();
  }

  onClose(cid: string) {
    this.dropConn(cid, this.io.now());
    this.flush();
  }

  /** Forget a connection; its player keeps their seat for a while. */
  private dropConn(cid: string, now: number) {
    const conn = this.conns.get(cid);
    this.conns.delete(cid);
    if (conn?.pid) {
      const p = this.players.get(conn.pid);
      if (p && p.cid === cid) {
        p.cid = null;
        p.leftAt = now;
        if (this.turn?.drawer === p.id && (this.phase === "choosing" || this.phase === "drawing")) {
          this.turn.drawerAwaySince ??= now;
        }
        this.markView(true);
      }
    }
    if (this.conns.size === 0) this.markEmpty(now);
  }

  onAlarm() {
    this.flush();
  }

  /** Count something only the platform sees (see `Tally`). */
  note(event: TallyEvent) {
    this.tally[event]++;
  }

  private countMsg(type: string) {
    this.tally.types[type] = (this.tally.types[type] ?? 0) + 1;
  }

  onMessage(cid: string, raw: unknown) {
    const conn = this.conns.get(cid);
    if (!conn) return;
    conn.seen = this.io.now();
    if (typeof raw !== "string") {
      this.countMsg("bad");
      return;
    }
    if (raw === HEARTBEAT) {
      // Cloudflare answers these before they reach the room; this covers anything that doesn't.
      this.countMsg("hb");
      this.io.send(cid, HEARTBEAT);
      return;
    }
    if (raw.length > 400_000) {
      this.countMsg("bad");
      this.io.close(cid, CLOSE.BAD_HELLO, "message too large");
      return;
    }
    let m: Record<string, unknown>;
    try {
      m = JSON.parse(raw);
    } catch {
      this.countMsg("bad");
      return;
    }
    if (!m || typeof m !== "object" || typeof m.t !== "string") {
      this.countMsg("bad");
      return;
    }
    this.countMsg(Object.hasOwn(CLIENT_TYPES, m.t) ? m.t : "bad");
    const now = this.io.now();

    if (m.t === "ping") {
      this.sendTo(cid, { t: "pong", c: typeof m.c === "number" ? m.c : 0, s: now });
      return;
    }

    this.tick(now);

    if (m.t === "hello") {
      this.hello(cid, conn, m, now);
      this.flush();
      return;
    }

    const p = conn.pid ? this.players.get(conn.pid) : undefined;
    if (!p || p.cid !== cid) return;

    switch (m.t) {
      case "draw":
        this.onDraw(cid, conn, p, m);
        break;
      case "chat":
        this.onChat(cid, conn, p, m.text, now);
        break;
      case "choose":
        this.onChoose(p, m.i, now);
        break;
      case "sync":
        this.sendCanvas(cid);
        break;
      case "profile":
        this.onProfile(cid, p, m);
        break;
      case "settings":
        if (!this.requireHost(cid, p)) break;
        if (this.phase !== "lobby" && this.phase !== "over") break;
        this.settings = sanitizeSettings(m.s, this.settings, this.players.size);
        // Turning photos off deletes them; players send them again if it's turned back on.
        if (!this.settings.photos && this.photos.size) this.clearPhotos();
        if (this.settings.voice === "off") for (const o of this.players.values()) o.voice = false;
        this.markView(false);
        break;
      case "photo":
        this.onPhoto(cid, conn, p, m.data, now);
        break;
      case "voice":
        this.onVoice(p, m.on);
        break;
      case "rtc":
        this.onRtc(conn, p, m, now);
        break;
      case "start":
        if (!this.requireHost(cid, p)) break;
        this.startGame(cid, now);
        break;
      case "kick":
        if (!this.requireHost(cid, p)) break;
        this.onKick(p, m.pid, now);
        break;
      case "leave":
        this.removePlayer(p, "left", now);
        this.io.bind(cid, null);
        conn.pid = null;
        this.io.close(cid, CLOSE.LEFT, "left");
        break;
      case "skip":
        this.onSkip(p, now);
        break;
      case "away":
        this.setAway(p, true, now);
        break;
      case "back":
        this.setAway(p, false, now);
        break;
      case "end":
        if (!this.requireHost(cid, p)) break;
        if (this.inGame()) {
          this.sys(`${p.name} ended the game.`);
          this.gameOver(now);
        }
        break;
      case "lobby":
        if (!this.requireHost(cid, p)) break;
        if (this.phase === "over") this.toLobby();
        break;
      case "drawing":
        if (typeof m.turn === "number" && this.galleryTurns.includes(m.turn)) this.io.sendGallery(cid, m.turn);
        break;
    }
    this.flush();
  }

  /* =================== joining =================== */

  private hello(cid: string, conn: Conn, m: Record<string, unknown>, now: number) {
    if (!this.exists()) {
      this.err(cid, "not_found", "This room doesn't exist any more.");
      this.io.close(cid, CLOSE.NOT_FOUND, "not found");
      return;
    }
    const pid = typeof m.pid === "string" && PID_RE.test(m.pid) ? m.pid : null;
    const secret = typeof m.secret === "string" && m.secret.length >= 16 && m.secret.length <= 128 ? m.secret : null;
    if (!pid || !secret || m.v !== PROTOCOL) {
      this.err(cid, "bad_hello", "Please reload the page to get the latest version.");
      this.io.close(cid, CLOSE.BAD_HELLO, "bad hello");
      return;
    }
    if (this.kicked.has(pid)) {
      this.err(cid, "kicked", "The host removed you from this room.");
      this.io.close(cid, CLOSE.KICKED, "kicked");
      return;
    }

    let p = this.players.get(pid);
    if (p) {
      if (p.secret !== secret) {
        this.err(cid, "bad_hello", "This seat belongs to someone else.");
        this.io.close(cid, CLOSE.BAD_HELLO, "bad secret");
        return;
      }
      if (p.cid && p.cid !== cid) {
        const old = p.cid;
        const oc = this.conns.get(old);
        if (oc) oc.pid = null;
        this.io.bind(old, null);
        this.err(old, "replaced", "You opened this game in another tab.");
        this.io.close(old, CLOSE.REPLACED, "replaced");
      }
      const since = p.leftAt ?? (p.away ? p.awaySince : null) ?? null;
      p.cid = cid;
      p.leftAt = null;
      p.away = false;
      p.awaySince = null;
      p.voice = false;
      if (since !== null && now - since > 20_000) this.sys(`${p.name} is back.`);
    } else {
      const name = sanitizeName(m.name);
      if (!name) {
        this.err(cid, "bad_name", "Pick a name with at least one letter.");
        this.io.close(cid, CLOSE.NAME_TAKEN, "bad name");
        return;
      }
      if ([...this.players.values()].some((o) => sameName(o.name, name))) {
        this.err(cid, "name_taken", `Someone in this room is already called ${name}.`);
        this.io.close(cid, CLOSE.NAME_TAKEN, "name taken");
        return;
      }
      if (this.players.size >= this.settings.maxPlayers) {
        this.err(cid, "room_full", `This room is full (${this.players.size} of ${this.settings.maxPlayers}).`);
        this.io.close(cid, CLOSE.FULL, "full");
        return;
      }
      p = {
        id: pid,
        secret,
        name,
        color: this.pickColor(validColor(m.color)),
        face: validFace(m.face),
        score: 0,
        seat: this.seatCounter++,
        cid,
        leftAt: null,
      };
      this.players.set(pid, p);
      if (!this.ownerId && this.players.size === 1) this.ownerId = pid;
      this.sys(`${name} joined.`);
    }

    conn.pid = pid;
    this.io.bind(cid, pid);
    this.emptySince = null;
    if (!this.hostId || !this.players.has(this.hostId)) this.hostId = pid;
    this.reclaimHost(p);
    if (this.turn?.drawer === pid) this.turn.drawerAwaySince = null;
    if (this.inGame() && !this.roundDrawn.has(pid) && !this.queue.includes(pid) && this.turn?.drawer !== pid) {
      this.queue.push(pid);
    }

    this.sendTo(cid, { t: "welcome", you: pid, code: this.code });
    // Everyone's photo once, before the state that refers to them.
    for (const [id, ph] of this.photos) this.sendTo(cid, { t: "photo", id, v: ph.v, data: ph.data });
    this.sendTo(cid, { t: "state", s: this.view(pid, now) });
    this.sendCanvas(cid);
    this.sendTo(cid, { t: "chatlog", list: this.chatFor(pid) });
    this.markView(true);
  }

  private pickColor(wanted: number | null): number {
    const used = new Set([...this.players.values()].map((p) => p.color));
    if (wanted !== null && !used.has(wanted)) return wanted;
    for (let i = 0; i < INKS.length; i++) if (!used.has(i)) return i;
    return wanted ?? 0;
  }

  private onProfile(cid: string, p: Player, m: Record<string, unknown>) {
    const name = sanitizeName(m.name);
    if (name && name !== p.name) {
      if (this.inGame()) {
        this.err(cid, "invalid", "You can change your name between games.");
      } else if ([...this.players.values()].some((o) => o.id !== p.id && sameName(o.name, name))) {
        this.err(cid, "name_taken", `Someone in this room is already called ${name}.`);
      } else {
        this.sys(`${p.name} is now ${name}.`);
        p.name = name;
      }
    }
    const c = validColor(m.color);
    if (c !== null) p.color = c;
    p.face = validFace(m.face);
    this.markView(false);
  }

  /* =================== photos =================== */

  private onPhoto(cid: string, conn: Conn, p: Player, raw: unknown, now: number) {
    if (raw === null) {
      if (p.photo) {
        this.dropPhoto(p);
        this.markView(false);
      }
      return;
    }
    if (!this.settings.photos) return; // the host turned photos off: nothing is kept
    const data = validPhoto(raw);
    if (!data) {
      this.err(cid, "invalid", "That photo couldn't be used. Try taking it again.");
      return;
    }
    if (this.photos.get(p.id)?.data === data) return; // the same photo again (after a reconnect)
    conn.photo = conn.photo.filter((at) => now - at < LIMITS.photoWindowMs);
    if (conn.photo.length >= LIMITS.photoBurst) {
      this.err(cid, "rate_limited", "Too many photo changes. Try again in a moment.");
      return;
    }
    conn.photo.push(now);
    const ph: StoredPhoto = { v: ++this.photoSeq, data };
    this.photos.set(p.id, ph);
    p.photo = ph.v;
    this.io.save({ [`photo:${p.id}`]: ph });
    this.broadcast({ t: "photo", id: p.id, v: ph.v, data });
    this.markView(false);
  }

  private dropPhoto(p: Player) {
    if (this.photos.delete(p.id) || p.photo) this.io.remove([`photo:${p.id}`]);
    p.photo = 0;
  }

  private clearPhotos() {
    for (const p of this.players.values()) if (p.photo || this.photos.has(p.id)) this.dropPhoto(p);
    this.photos.clear();
  }

  /* =================== voice =================== */

  private onVoice(p: Player, on: unknown) {
    const voice = on === true && this.settings.voice !== "off";
    if (!!p.voice === voice) return;
    p.voice = voice;
    this.markView(false);
  }

  /**
   * Pass a voice handshake to one other player. Nothing is kept, and it only goes between two
   * players who are both in the voice chat. The audio itself never comes through the room.
   */
  private onRtc(conn: Conn, p: Player, m: Record<string, unknown>, now: number) {
    const to = typeof m.to === "string" ? this.players.get(m.to) : undefined;
    if (!to?.cid || to === p || !p.voice || !to.voice) return;
    if (typeof m.d !== "string" || m.d.length > LIMITS.rtcMaxChars) return;
    conn.rtc = conn.rtc.filter((at) => now - at < LIMITS.rtcWindowMs);
    if (conn.rtc.length >= LIMITS.rtcBurst) return;
    conn.rtc.push(now);
    this.sendTo(to.cid, { t: "rtc", from: p.id, d: m.d });
  }

  private onKick(host: Player, target: unknown, now: number) {
    if (typeof target !== "string" || target === host.id) return;
    const t = this.players.get(target);
    if (!t) return;
    this.kicked.add(t.id);
    if (t.cid) {
      const cid = t.cid;
      this.err(cid, "kicked", "The host removed you from this room.");
      const c = this.conns.get(cid);
      if (c) c.pid = null;
      this.io.bind(cid, null);
      this.io.close(cid, CLOSE.KICKED, "kicked");
    }
    this.removePlayer(t, "kicked", now);
  }

  private removePlayer(p: Player, why: "left" | "kicked" | "timeout", now: number) {
    if (!this.players.has(p.id)) return;
    this.players.delete(p.id);
    this.dropPhoto(p);
    this.queue = this.queue.filter((id) => id !== p.id);
    this.sys(why === "kicked" ? `${p.name} was removed by the host.` : `${p.name} left.`);
    if (why !== "timeout" && this.ownerId === p.id) this.ownerId = "";
    if (this.hostId === p.id) this.migrateHost(now, true);
    if (this.turn?.drawer === p.id) {
      if (this.phase === "choosing") this.skipTurn(now, `${p.name} left, so their turn was skipped.`);
      else if (this.phase === "drawing") this.endTurn("drawer_left", now);
    }
    if (this.players.size === 0 && this.phase !== "lobby") this.toLobby();
    this.markView(true);
  }

  /** Pass the host role to the longest-present active player. */
  private migrateHost(now: number, force: boolean) {
    void now;
    const others = [...this.players.values()].filter((p) => p.id !== this.hostId).sort((a, b) => a.seat - b.seat);
    const next = others.find((p) => this.isActive(p)) ?? others.find((p) => p.cid) ?? (force ? others[0] : undefined);
    if (!next) {
      if (force) this.hostId = "";
      return false;
    }
    this.hostId = next.id;
    this.sys(`${next.name} is now the host.`);
    this.markView(true);
    return true;
  }

  /** The room's creator gets the host role back when they return. */
  private reclaimHost(p: Player) {
    if (p.id !== this.ownerId || this.hostId === p.id || !this.isActive(p)) return;
    this.hostId = p.id;
    this.sys(`${p.name} is the host again.`);
    this.markView(true);
  }

  private setAway(p: Player, away: boolean, now: number) {
    if (!!p.away === away) return;
    p.away = away;
    p.awaySince = away ? now : null;
    const t = this.turn;
    if (t && t.drawer === p.id && (this.phase === "choosing" || this.phase === "drawing")) {
      t.drawerAwaySince = away ? (t.drawerAwaySince ?? now) : null;
    }
    if (!away) {
      if (this.inGame() && !this.roundDrawn.has(p.id) && !this.queue.includes(p.id) && t?.drawer !== p.id) this.queue.push(p.id);
      this.reclaimHost(p);
    }
    this.markView(true);
  }

  /** Connected and looking at the game (not in the background). */
  private isActive(p: Player) {
    return !!p.cid && !p.away;
  }

  /* =================== game flow =================== */

  private inGame() {
    return this.phase === "choosing" || this.phase === "drawing" || this.phase === "reveal" || this.phase === "waiting";
  }

  private connectedPlayers() {
    return [...this.players.values()].filter((p) => this.isActive(p)).sort((a, b) => a.seat - b.seat);
  }

  /** Drawing order is random each round, so the host doesn't always go first. */
  private shuffled<T>(xs: T[]): T[] {
    for (let i = xs.length - 1; i > 0; i--) {
      const j = Math.floor(this.io.random() * (i + 1));
      [xs[i], xs[j]] = [xs[j], xs[i]];
    }
    return xs;
  }

  private connectedCount() {
    let n = 0;
    for (const p of this.players.values()) if (this.isActive(p)) n++;
    return n;
  }

  private startGame(cid: string, now: number) {
    if (this.phase !== "lobby" && this.phase !== "over") return;
    const ready = this.connectedPlayers();
    if (ready.length < 2) {
      this.err(cid, "need_players", "You need at least 2 players to start.");
      return;
    }
    for (const p of this.players.values()) p.score = 0;
    this.round = 1;
    this.turnCount = 0;
    this.results = null;
    if (this.galleryTurns.length) this.io.remove(this.galleryTurns.map((t) => `gal:${t}`));
    this.galleryTurns = [];
    this.queue = this.shuffled(ready.map((p) => p.id));
    this.roundDrawn.clear();
    this.turn = null;
    this.nextTurn(now, true);
  }

  private nextTurn(now: number, firstInRound = false) {
    let drawer: Player | undefined;
    let first = firstInRound;
    for (let guard = 0; guard < 50 && !drawer; guard++) {
      while (this.queue.length && !drawer) {
        const id = this.queue.shift()!;
        const p = this.players.get(id);
        if (p && this.isActive(p) && !this.roundDrawn.has(id)) drawer = p;
      }
      if (drawer) break;
      if (this.round >= this.settings.rounds) {
        this.gameOver(now);
        return;
      }
      this.round++;
      first = true;
      this.roundDrawn.clear();
      this.queue = this.shuffled(this.connectedPlayers().map((p) => p.id));
      if (!this.queue.length) break;
    }
    if (!drawer || this.connectedCount() < 2) {
      if (drawer) this.queue.unshift(drawer.id);
      this.phase = "waiting";
      this.turn = null;
      this.phaseStarted = now;
      this.phaseEnds = now + this.timing.waitMs;
      this.items = [];
      this.canvasV = 0;
      this.points = 0;
      this.markView(true);
      return;
    }

    this.roundDrawn.add(drawer.id);
    this.turn = {
      index: this.turnCount++,
      round: this.round,
      drawer: drawer.id,
      drawerName: drawer.name,
      drawerColor: drawer.color,
      choices: this.pickWords(LIMITS.wordChoices),
      word: null,
      guessed: [],
      hints: [],
      revealed: [],
      reason: null,
      scores: null,
      drawerAwaySince: null,
      firstInRound: first,
    };
    this.phase = "choosing";
    this.phaseStarted = now;
    this.phaseEnds = now + this.timing.chooseMs + (first ? this.timing.roundBannerMs : 0);
    this.items = [];
    this.canvasV = 0;
    this.points = 0;
    this.canvasDirty = true;
    this.broadcast({ t: "canvas", turn: this.turn.index, v: 0, items: [] });
    this.markView(true);
  }

  /** The room's built-in words: the main list, or the student words up to the chosen class. */
  private wordList(): Entry[] {
    return this.settings.edition === "students" ? studentEntries(this.settings.grade) : BUILT_IN;
  }

  /** Built-in words for the chosen category and difficulty, widening when a pool runs dry. */
  /** In mixed mode, choice i is easy, medium or hard, so the drawer can always gamble on a hard word. */
  private builtInPool(choice: number): Entry[][] {
    const cat = this.settings.category;
    const all = this.wordList();
    const inCat = all.filter((e) => categoryMatches(cat, e.category));
    const level = this.choiceLevel(choice);
    return [inCat.filter((e) => e.level === level), inCat, all];
  }

  private choiceLevel(choice: number) {
    const d = this.settings.edition === "students" ? "mixed" : this.settings.difficulty;
    return d === "mixed" ? MIXED_LEVELS[choice % MIXED_LEVELS.length] : d;
  }

  /**
   * Word history lasts across games in a room, so once every word at the chosen
   * category and difficulty has been drawn, start over rather than drift to other levels.
   */
  private refreshHistory(n: number) {
    for (let i = 0; i < Math.min(n, MIXED_LEVELS.length); i++) {
      const pool = this.builtInPool(i)[0];
      if (pool.length && pool.every((e) => this.used.has(normalizeGuess(e.word)))) {
        this.used.clear();
        this.offered.clear();
        return;
      }
    }
  }

  private pickWords(n: number): Entry[] {
    this.refreshHistory(n);
    const custom = parseCustomWords(this.settings.customWords).map(customEntry);
    const onlyCustom = this.settings.customOnly && custom.length >= LIMITS.customOnlyMin;
    const key = (e: Entry) => normalizeGuess(e.word);
    // Prefer words nobody has seen yet, then words shown but not drawn.
    const unseen = (list: Entry[]) => list.filter((e) => !this.used.has(key(e)) && !this.offered.has(key(e)));
    const fresh = (list: Entry[]) => list.filter((e) => !this.used.has(key(e)));
    const out: Entry[] = [];
    const take = (list: Entry[]) => {
      let options = list.filter((e) => !out.some((o) => key(o) === key(e)));
      // With all categories, prefer a different category for each choice.
      const varied = options.filter((e) => !e.category || !out.some((o) => o.category === e.category));
      if (varied.length) options = varied;
      if (!options.length) return false;
      out.push(options[Math.floor(this.io.random() * options.length)]);
      return true;
    };
    for (let i = 0; i < n; i++) {
      const useCustom = onlyCustom || (custom.length > 0 && this.io.random() < 0.5);
      if (useCustom && (take(unseen(custom)) || take(fresh(custom)))) continue;
      if (onlyCustom) {
        if (!take(custom)) break; // all custom words used: allow repeats
        continue;
      }
      const tiers = this.builtInPool(i);
      if (tiers.some((t) => take(unseen(t)) || take(fresh(t)))) continue;
      if (!take(tiers[1]) && !take(tiers[2])) break;
    }
    for (const e of out) this.offered.add(key(e));
    return out;
  }

  /** The drawer ends their own turn early. */
  private onSkip(p: Player, now: number) {
    const t = this.turn;
    if (!t || t.drawer !== p.id) return;
    if (this.phase === "choosing") this.skipTurn(now, `${p.name} skipped their turn.`);
    else if (this.phase === "drawing") {
      this.sys(`${p.name} ended their turn.`);
      this.endTurn("skipped", now);
    }
  }

  private onChoose(p: Player, i: unknown, now: number) {
    if (this.phase !== "choosing" || !this.turn || this.turn.drawer !== p.id) return;
    if (typeof i !== "number" || !Number.isInteger(i) || i < 0 || i >= this.turn.choices.length) return;
    this.startDrawing(this.turn.choices[i], now);
  }

  private startDrawing(entry: Entry, now: number) {
    const t = this.turn!;
    const word = entry.word;
    t.word = word;
    t.entry = entry;
    this.used.add(normalizeGuess(word));
    const drawMs = this.settings.drawTime * 1000;
    t.hints = planHints(word, this.settings.hints, now, drawMs, () => this.io.random());
    t.revealed = [];
    this.phase = "drawing";
    this.phaseStarted = now;
    this.phaseEnds = now + drawMs;
    this.markView(true);
  }

  private skipTurn(now: number, message: string) {
    this.sys(message);
    this.turn = null;
    this.nextTurn(now);
  }

  private endTurn(reason: EndReason, now: number) {
    const t = this.turn;
    if (!t || this.phase !== "drawing") return;
    t.reason = reason;
    const drawer = this.players.get(t.drawer);
    // Players who are away don't count against the drawer, unless they guessed first.
    const others = [...this.players.values()].filter((p) => p.id !== t.drawer && this.isActive(p)).length;
    const eligible = Math.max(t.guessed.length, others + t.guessed.filter((g) => !this.isActive(this.players.get(g.id)!)).length);
    const dpts = reason === "drawer_left" || !drawer ? 0 : drawerPoints(t.guessed.length, eligible, t.entry?.level);
    if (drawer) drawer.score += dpts;
    const scores: TurnScore[] = [];
    for (const p of this.players.values()) {
      if (p.id === t.drawer) scores.push({ id: p.id, pts: dpts });
      else scores.push({ id: p.id, pts: t.guessed.find((g) => g.id === p.id)?.pts ?? 0 });
    }
    scores.sort((a, b) => b.pts - a.pts);
    t.scores = scores;

    if (t.word && this.items.length) {
      const entry: GalleryEntry = {
        turn: t.index,
        word: t.word,
        by: t.drawer,
        name: t.drawerName,
        color: t.drawerColor,
        items: this.items.map((it) => (it.k === "s" ? { k: "s", c: it.c, w: it.w, p: it.p } : it)),
      };
      this.galleryTurns.push(t.index);
      this.io.save({ [`gal:${t.index}`]: entry });
    }

    if (t.word) this.sys(`The word was "${t.word}".`);
    this.phase = "reveal";
    this.phaseStarted = now;
    this.phaseEnds = now + this.timing.revealMs;
    this.markView(true);
  }

  private gameOver(now: number) {
    const ranked = rankPlayers([...this.players.values()].map((p) => ({
      id: p.id, name: p.name, color: p.color, face: p.face, score: p.score,
    })));
    this.results = ranked;
    this.phase = "over";
    this.turn = null;
    this.queue = [];
    this.phaseStarted = now;
    this.phaseEnds = null;
    this.items = [];
    this.canvasV = 0;
    this.points = 0;
    this.canvasDirty = true;
    const top = ranked.filter((r) => r.rank === 1);
    if (top.length === 1) this.sys(`${top[0].name} wins with ${top[0].score} points!`);
    else if (top.length > 1) this.sys(`It's a tie between ${top.map((r) => r.name).join(" and ")}!`);
    this.markView(true);
    this.report("game_over", now);
  }

  /** Log what reached the room since the last report (see `Tally`), then start counting again. */
  private report(why: "game_over" | "closed", now: number) {
    const { since, types, ...events } = this.tally;
    const msgs = Object.values(types).reduce((a, b) => a + b, 0);
    this.io.log({
      event: "room_tally",
      room: this.code,
      why,
      minutes: Math.round((now - since) / 6000) / 10,
      players: this.players.size,
      ...(why === "game_over" ? { rounds: this.round, turns: this.turnCount } : {}),
      msgs,
      types,
      ...events,
      // Roughly what Cloudflare bills: incoming messages count 1/20 each; connects, alarms and HTTP 1 each.
      // The dashboard's Requests chart counts every message as one.
      billed: Math.ceil(msgs / 20) + events.connects + events.alarms + events.http,
    });
    this.tally = newTally(now);
  }

  private toLobby() {
    this.phase = "lobby";
    this.turn = null;
    this.round = 0;
    this.queue = [];
    this.roundDrawn.clear();
    this.results = null;
    this.phaseEnds = null;
    this.phaseStarted = null;
    this.items = [];
    this.canvasV = 0;
    this.points = 0;
    this.canvasDirty = true;
    for (const p of this.players.values()) p.score = 0;
    this.markView(true);
  }

  /* =================== timers =================== */

  private tick(now: number) {
    for (let guard = 0; guard < 30; guard++) {
      if (!this.step(now)) break;
    }
  }

  private step(now: number): boolean {
    if (this.destroyed) return false;
    // Seats are held for a while after a disconnect, then released.
    for (const p of this.players.values()) {
      if (p.cid || p.leftAt === null) continue;
      const hold = this.inGame() ? this.timing.seatHoldGameMs : this.timing.seatHoldLobbyMs;
      if (now - p.leftAt >= hold) {
        this.removePlayer(p, "timeout", now);
        return true;
      }
    }
    // The host role only moves while people are waiting on the host (lobby or results),
    // and only after the host has been away for a while. Games run on their own.
    const host = this.players.get(this.hostId);
    if (!host) {
      if (this.players.size && this.migrateHost(now, true)) return true;
    } else if (!this.isActive(host) && !this.inGame() && this.connectedCount() > 0) {
      const since = host.cid ? host.awaySince : host.leftAt;
      if (since != null && now - since >= this.timing.hostGraceMs && this.migrateHost(now, false)) return true;
    }
    // Close connections that never said hello, or that went silent (a frozen phone).
    for (const [cid, c] of this.conns) {
      if (!c.pid && now - c.opened > this.timing.helloTimeoutMs) {
        this.conns.delete(cid);
        this.io.close(cid, CLOSE.BAD_HELLO, "no hello");
        return true;
      }
      // Heartbeats the platform answered count too: they never reach onMessage.
      if (c.pid && now - c.seen > this.timing.staleMs && now - (this.io.lastHeartbeat(cid) ?? 0) > this.timing.staleMs) {
        this.dropConn(cid, now);
        this.io.close(cid, 1001, "silent");
        return true;
      }
    }

    const t = this.turn;
    switch (this.phase) {
      case "choosing":
        if (!t) break;
        if (!this.players.has(t.drawer)) {
          this.skipTurn(now, `${t.drawerName} left, so their turn was skipped.`);
          return true;
        }
        if (t.drawerAwaySince !== null && now - t.drawerAwaySince >= this.timing.drawerGraceMs) {
          this.skipTurn(now, `${t.drawerName} lost connection, so their turn was skipped.`);
          return true;
        }
        if (this.phaseEnds !== null && now >= this.phaseEnds) {
          this.startDrawing(t.choices[Math.floor(this.io.random() * t.choices.length)] ?? customEntry("cat"), now);
          return true;
        }
        break;
      case "drawing": {
        if (!t) break;
        const due = t.hints.find((h) => h.at <= now && !t.revealed.includes(h.idx));
        if (due) {
          t.revealed.push(due.idx);
          this.markView(false);
          return true;
        }
        if (t.drawerAwaySince !== null && now - t.drawerAwaySince >= this.timing.drawerGraceMs) {
          this.sys(`${t.drawerName} lost connection, so the turn ended.`);
          this.endTurn("drawer_left", now);
          return true;
        }
        if (this.phaseEnds !== null && now >= this.phaseEnds) {
          this.endTurn("time", now);
          return true;
        }
        const guessers = [...this.players.values()].filter((p) => p.id !== t.drawer);
        if (guessers.length === 0) {
          this.endTurn("ended", now);
          return true;
        }
        const live = guessers.filter((p) => this.isActive(p));
        if (live.length > 0 && live.every((p) => t.guessed.some((g) => g.id === p.id))) {
          this.endTurn("all", now);
          return true;
        }
        break;
      }
      case "reveal":
        if (this.phaseEnds !== null && now >= this.phaseEnds) {
          this.turn = null;
          this.nextTurn(now);
          return true;
        }
        break;
      case "waiting":
        if (this.connectedCount() >= 2) {
          this.nextTurn(now);
          return true;
        }
        if (this.phaseEnds !== null && now >= this.phaseEnds) {
          this.sys("Not enough players, so the game went back to the lobby.");
          this.toLobby();
          return true;
        }
        break;
    }

    if (this.conns.size === 0) {
      this.markEmpty(now);
      if (now - this.emptySince! >= this.timing.emptyTtlMs) {
        this.report("closed", now);
        this.destroyed = true;
        this.io.destroy();
        return false;
      }
    }
    return false;
  }

  /**
   * Start the empty-room countdown and save it. A room is often evicted and reloaded from storage
   * while it waits, and a countdown kept only in memory would start over at every wake.
   */
  private markEmpty(now: number) {
    if (this.emptySince !== null) return;
    this.emptySince = now;
    if (this.exists()) this.stateDirty = this.stateUrgent = true;
  }

  private nextWake(now: number): { at: number | null; durable: number | null } {
    // A room that was never claimed (or was closed) has nothing to save, so its empty-room countdown
    // restarts on every wake. Asking for one would re-arm the alarm every emptyTtlMs, forever.
    if (!this.exists() && this.conns.size === 0) return { at: null, durable: null };
    const times: number[] = [];
    const add = (n: number | null | undefined) => {
      if (typeof n === "number" && Number.isFinite(n)) times.push(n);
    };
    if (this.phase !== "lobby" && this.phase !== "over") add(this.phaseEnds);
    const t = this.turn;
    if (t && this.phase === "drawing") {
      for (const h of t.hints) if (!t.revealed.includes(h.idx)) add(h.at);
    }
    if (t && t.drawerAwaySince !== null && (this.phase === "drawing" || this.phase === "choosing")) {
      add(t.drawerAwaySince + this.timing.drawerGraceMs);
    }
    const hold = this.inGame() ? this.timing.seatHoldGameMs : this.timing.seatHoldLobbyMs;
    for (const p of this.players.values()) if (!p.cid && p.leftAt !== null) add(p.leftAt + hold);
    const host = this.players.get(this.hostId);
    // Same rule as step(): the role only moves when someone active can take it.
    if (host && !this.isActive(host) && !this.inGame() && this.connectedCount() > 0) {
      const since = host.cid ? host.awaySince : host.leftAt;
      if (since != null) add(since + this.timing.hostGraceMs);
    }
    for (const c of this.conns.values()) if (!c.pid) add(c.opened + this.timing.helloTimeoutMs + 10);
    if (this.conns.size === 0 && this.emptySince !== null) add(this.emptySince + this.timing.emptyTtlMs);
    const durable = times.length ? Math.min(...times) : null;
    if (this.stateDirty) add(this.lastStateSave + this.timing.stateSaveMs);
    if (this.canvasDirty) add(this.lastCanvasSave + this.timing.canvasSaveMs);
    // Anything still due after tick() is something step() can't act on yet. Look again in a second
    // instead of asking for a wake-up in the past, which would re-fire the alarm in a tight loop.
    const notPast = (n: number | null) => (n !== null && n <= now ? now + 1000 : n);
    return { at: notPast(times.length ? Math.min(...times) : null), durable: notPast(durable) };
  }

  /* =================== drawing =================== */

  private onDraw(cid: string, conn: Conn, p: Player, m: Record<string, unknown>) {
    const t = this.turn;
    if (!t || t.drawer !== p.id || this.phase !== "drawing") return;
    const now = this.io.now();
    if (now - conn.drawWindow > 1000) {
      conn.drawWindow = now;
      conn.drawCount = 0;
    }
    if (++conn.drawCount > 90) return;
    const ops = m.ops;
    if (!Array.isArray(ops) || ops.length === 0 || ops.length > LIMITS.maxOpsPerMsg) return;
    if (m.v !== this.canvasV) {
      this.sendCanvas(cid);
      return;
    }
    const base = this.canvasV;
    let applied = 0;
    for (const op of ops) {
      if (!validOp(op)) break;
      if (op.k === "b" || op.k === "f") {
        if (this.items.length >= LIMITS.maxItemsPerTurn) break;
      }
      if (op.k === "m" && this.points + op.p.length / 2 > LIMITS.maxPointsPerTurn) {
        this.err(cid, "canvas_full", "This drawing is getting huge. Undo or clear to keep going.");
        break;
      }
      const before = op.k === "u" ? this.items[this.items.length - 1] : undefined;
      const added = applyOp(this.items, op);
      if (added < 0) break;
      if (op.k === "m" || op.k === "b") this.points += added;
      if (before && before.k === "s") this.points -= before.p.length / 2;
      applied++;
    }
    if (applied > 0) {
      this.canvasV += applied;
      this.canvasDirty = true;
      const relay = JSON.stringify({ t: "draw", v: base, ops: applied === ops.length ? ops : ops.slice(0, applied) } satisfies ServerMsg);
      for (const o of this.players.values()) if (o.cid && o.id !== p.id) this.io.send(o.cid, relay);
    }
    if (applied < ops.length) this.sendCanvas(cid);
  }

  private sendCanvas(cid: string) {
    const turn = this.turn?.index ?? -1;
    const show = this.phase === "drawing" || this.phase === "reveal" || this.phase === "choosing";
    this.sendTo(cid, { t: "canvas", turn, v: show ? this.canvasV : 0, items: show ? this.items : [] });
  }

  /* =================== chat =================== */

  private onChat(cid: string, conn: Conn, p: Player, raw: unknown, now: number) {
    const text = cleanText(raw, LIMITS.chatMax);
    if (!text) return;
    conn.chat = conn.chat.filter((at) => now - at < LIMITS.chatWindowMs);
    if (conn.chat.length >= LIMITS.chatBurst) {
      this.err(cid, "rate_limited", "Slow down a little. Try again in a moment.");
      return;
    }
    conn.chat.push(now);
    const t = this.turn;
    const live = (this.phase === "drawing" || this.phase === "choosing") && t;
    if (live && t.drawer === p.id) {
      this.err(cid, "drawer_chat", "You can't chat while it's your turn to draw.");
      return;
    }
    const base = { from: p.id, name: p.name, color: p.color };
    if (this.phase === "drawing" && t && t.word) {
      const already = t.guessed.some((g) => g.id === p.id);
      if (already) {
        const to = [t.drawer, ...t.guessed.map((g) => g.id)];
        this.pushChat({ k: "secret", ...base, text }, to);
        return;
      }
      const entry = t.entry ?? customEntry(t.word);
      const verdict = judgeGuess(text, entry, this.otherWords(entry.word));
      if (verdict.kind === "correct") {
        const pts = guessPoints(t.guessed.length, now - (this.phaseStarted ?? now), this.settings.drawTime * 1000);
        p.score += pts;
        t.guessed.push({ id: p.id, pts });
        this.pushChat({ k: "correct", ...base, text: `${p.name} guessed the word!` }, "all");
        this.pushChat({ k: "you", text: verdict.typo ? `You guessed it! +${pts} points ("${text}" was close enough)` : `You guessed it! +${pts} points` }, [p.id]);
        this.broadcast({ t: "scored", id: p.id, pts });
        if (t.guessed.length === 1) this.snapClock(t, p, now);
        this.markView(true);
        this.tick(now);
        return;
      }
      this.pushChat({ k: "msg", ...base, text }, "all");
      if (verdict.kind === "very") this.pushChat({ k: "close", text: `"${text}" is very close!` }, [p.id]);
      else if (verdict.kind === "close") this.pushChat({ k: "warm", text: `"${text}" is close. You're on the right track.` }, [p.id]);
      return;
    }
    this.pushChat({ k: "msg", ...base, text }, "all");
  }

  /**
   * The first correct guess starts the race: if more than 30 seconds are left, the clock drops to
   * 30, and any letter hints still to come are folded into one, 10 seconds before the end.
   */
  private snapClock(t: Turn, first: Player, now: number) {
    if (this.phaseEnds === null || this.phaseEnds - now <= this.timing.snapMs) return;
    this.phaseEnds = now + this.timing.snapMs;
    const pending = t.hints.filter((h) => !t.revealed.includes(h.idx));
    if (pending.length) {
      const shown = t.hints.filter((h) => t.revealed.includes(h.idx));
      t.hints = [...shown, { at: Math.max(now, this.phaseEnds - this.timing.snapHintMs), idx: pending[0].idx }];
    }
    this.sys(`${first.name} got it first! ${Math.round(this.timing.snapMs / 1000)} seconds left.`);
  }

  /** Every other word the room knows, so a different real word is never treated as a typo. */
  private otherWords(word: string) {
    const self = normalizeGuess(word);
    const custom = new Set(parseCustomWords(this.settings.customWords).map((w) => normalizeGuess(w)));
    return { has: (k: string) => k !== self && (BUILT_IN_KEYS.has(k) || custom.has(k)) };
  }

  private sys(text: string) {
    this.pushChat({ k: "sys", text }, "all");
  }

  private pushChat(msg: { k: ChatKind; text: string; from?: string; name?: string; color?: number }, vis: Vis) {
    const m: ChatMsg = { id: ++this.chatId, ...msg };
    this.chat.push({ m, vis });
    if (this.chat.length > CHAT_KEEP) this.chat.splice(0, this.chat.length - CHAT_KEEP);
    const data = JSON.stringify({ t: "chat", m } satisfies ServerMsg);
    for (const p of this.players.values()) {
      if (!p.cid) continue;
      if (vis === "all" || vis.includes(p.id)) this.io.send(p.cid, data);
    }
    this.stateDirty = true;
  }

  private chatFor(pid: string): ChatMsg[] {
    return this.chat.filter((c) => c.vis === "all" || c.vis.includes(pid)).map((c) => c.m);
  }

  /* =================== views & sending =================== */

  private label(category: string | null): string | null {
    return this.settings.edition === "students" ? subjectLabel(category, this.settings.grade) : categoryLabel(category);
  }

  /** A specific category is always shown. With all categories, the host's switch decides, and hard words stay hidden. */
  private showsCategory(entry: Entry): boolean {
    if (!entry.category) return false;
    if (this.settings.category !== "all") return true;
    return this.settings.showCategory && (entry.level === "easy" || entry.level === "medium");
  }

  view(pid: string, now: number): View {
    const t = this.turn;
    const isDrawer = t?.drawer === pid;
    const guessed = !!t?.guessed.some((g) => g.id === pid);
    const showWord = !!t?.word && (isDrawer || guessed || this.phase === "reveal");
    const players: PlayerView[] = [...this.players.values()]
      .sort((a, b) => a.seat - b.seat)
      .map((p) => ({
        id: p.id, name: p.name, color: p.color, face: p.face, score: p.score, connected: !!p.cid, away: !this.isActive(p),
        photo: this.settings.photos && this.photos.has(p.id) ? p.photo ?? 0 : 0,
        voice: !!p.voice && !!p.cid,
      }));
    const inLobby = this.phase === "lobby" || this.phase === "over";
    return {
      code: this.code,
      you: pid,
      host: this.hostId,
      phase: this.phase,
      settings: inLobby ? this.settings : { ...this.settings, customWords: "" },
      customCount: parseCustomWords(this.settings.customWords).length,
      round: this.round,
      rounds: this.settings.rounds,
      turn: t?.index ?? -1,
      turnsPlayed: this.turnCount,
      drawer: t?.drawer ?? null,
      phaseEnds: this.phaseEnds,
      phaseStarted: this.phaseStarted,
      word: showWord ? t!.word : null,
      mask: t?.word && this.phase === "drawing" ? maskWord(t.word, t.revealed) : null,
      choices: isDrawer && this.phase === "choosing" ? t!.choices.map((c) => ({ word: c.word, category: this.label(c.category), level: c.level })) : null,
      category: t?.entry && t.word && this.phase !== "choosing" && this.showsCategory(t.entry) ? this.label(t.entry.category) : null,
      players,
      guessed: t ? t.guessed.map((g) => g.id) : [],
      turnScores: this.phase === "reveal" ? t?.scores ?? null : null,
      reason: this.phase === "reveal" ? t?.reason ?? null : null,
      results: this.phase === "over" ? this.results : null,
      firstInRound: t?.firstInRound ?? false,
      now,
    };
  }

  private markView(urgent: boolean) {
    this.viewDirty = true;
    this.stateDirty = true;
    if (urgent) this.stateUrgent = true;
  }

  private requireHost(cid: string, p: Player) {
    if (p.id === this.hostId) return true;
    this.err(cid, "not_host", "Only the host can do that.");
    return false;
  }

  private sendTo(cid: string, msg: ServerMsg) {
    this.io.send(cid, JSON.stringify(msg));
  }

  private err(cid: string, code: ErrCode, msg: string) {
    this.sendTo(cid, { t: "err", code, msg });
  }

  private broadcast(msg: ServerMsg) {
    const data = JSON.stringify(msg);
    for (const p of this.players.values()) if (p.cid) this.io.send(p.cid, data);
  }

  /** Run due timers, push state to everyone, save, and schedule the next wake-up. */
  flush() {
    if (this.destroyed) return;
    const now = this.io.now();
    this.tick(now);
    if (this.destroyed) return;
    if (this.viewDirty) {
      this.viewDirty = false;
      for (const p of this.players.values()) if (p.cid) this.sendTo(p.cid, { t: "state", s: this.view(p.id, now) });
    }
    const writes: Record<string, unknown> = {};
    if (this.stateDirty && (this.stateUrgent || now - this.lastStateSave >= this.timing.stateSaveMs)) {
      writes.state = this.serialize();
      this.stateDirty = this.stateUrgent = false;
      this.lastStateSave = now;
    }
    if (this.canvasDirty && (this.phase !== "drawing" || now - this.lastCanvasSave >= this.timing.canvasSaveMs)) {
      writes.canvas = { turn: this.turn?.index ?? -1, v: this.canvasV, items: this.items };
      this.canvasDirty = false;
      this.lastCanvasSave = now;
    }
    if (Object.keys(writes).length) this.io.save(writes);
    const w = this.nextWake(now);
    this.io.schedule(w.at, w.durable);
  }
}

