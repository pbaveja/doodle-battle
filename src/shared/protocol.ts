// Shared types and constants for the Doodle Battle client and room server.

export const PROTOCOL = 3;

/** Every device draws on the same logical canvas, scaled to its screen. */
export const CANVAS_W = 1200;
export const CANVAS_H = 900;

export const DRAW_TIMES = [30, 45, 60, 80, 100, 120, 150, 180] as const;
export const DIFFICULTIES = ["easy", "medium", "hard", "mixed"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export interface Settings {
  rounds: number;
  drawTime: number;
  maxPlayers: number;
  hints: number;
  difficulty: Difficulty;
  customWords: string;
  customOnly: boolean;
  /** "all" or a category id from categories.ts */
  category: string;
  /** Players may use a photo of themselves. When off, photos aren't sent or kept at all. */
  photos: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  rounds: 3,
  drawTime: 80,
  maxPlayers: 8,
  hints: 2,
  difficulty: "mixed",
  customWords: "",
  customOnly: false,
  category: "all",
  photos: true,
};

export const LIMITS = {
  minRounds: 1,
  maxRounds: 10,
  minPlayers: 2,
  maxPlayers: 12,
  maxHints: 3,
  nameMax: 16,
  chatMax: 100,
  customMaxChars: 4000,
  customMaxWords: 300,
  customWordMax: 32,
  customOnlyMin: 10,
  wordChoices: 3,
  maxPointsPerTurn: 60000,
  maxItemsPerTurn: 3000,
  maxOpsPerMsg: 200,
  maxPointsPerOp: 800,
  chatBurst: 5,
  chatWindowMs: 3000,
  /** A photo is a small JPEG or WebP data URL (about 160x160). */
  photoMaxChars: 40_000,
  photoBurst: 6,
  photoWindowMs: 30_000,
};

/** Player ink colours. Each player picks one; it tints their name, avatar and buttons. */
export const INKS = [
  "#2a43cf", // blue
  "#d23f27", // red
  "#1f9d55", // green
  "#8a4cc8", // purple
  "#e0741a", // orange
  "#0f9488", // teal
  "#d6408a", // pink
  "#8a5a2b", // brown
  "#1c8ad6", // sky
  "#6d8a12", // olive
  "#c79100", // gold
  "#475569", // slate
] as const;
export const INK_NAMES = [
  "Blue", "Red", "Green", "Purple", "Orange", "Teal",
  "Pink", "Brown", "Sky", "Olive", "Gold", "Slate",
] as const;

/** Drawing palette. Index -1 is the eraser (paints paper white). */
export const PALETTE = [
  "#1b1f2a", "#6b7280", "#ffffff", "#e0322b", "#f28c1b", "#f3c614", "#25a24a",
  "#14b8a6", "#2463e6", "#8a4cc8", "#ec4899", "#8b5a36", "#f2c9a0", "#7dd3fc",
] as const;
export const PALETTE_NAMES = [
  "Black", "Grey", "White", "Red", "Orange", "Yellow", "Green",
  "Teal", "Blue", "Purple", "Pink", "Brown", "Peach", "Light blue",
] as const;
export const PAPER = "#ffffff";
export const BRUSH_SIZES = [6, 12, 24, 44] as const;
/** Number of characters to pick from (see client/characters.ts). */
export const FACE_COUNT = 48;

export const TIMING = {
  chooseMs: 15000,
  roundBannerMs: 1600,
  revealMs: 8500,
  drawerGraceMs: 10000,
  seatHoldGameMs: 180000,
  seatHoldLobbyMs: 180000,
  hostGraceMs: 60000,
  staleMs: 90000,
  waitMs: 60000,
  emptyTtlMs: 10 * 60 * 1000,
  helloTimeoutMs: 15000,
  stateSaveMs: 1500,
  canvasSaveMs: 2000,
  /** After the first correct guess, at most this much drawing time is left. */
  snapMs: 30000,
  /** Letter hints still to come are folded into one, this long before the end. */
  snapHintMs: 10000,
};
export type Timing = typeof TIMING;

export type Phase = "lobby" | "choosing" | "drawing" | "reveal" | "waiting" | "over";
export type EndReason = "time" | "all" | "drawer_left" | "ended" | "skipped";

/* ---------- drawing ---------- */

export type Op =
  | { k: "b"; c: number; w: number; x: number; y: number } // begin a stroke
  | { k: "m"; p: number[] } // more points for the open stroke [x,y,x,y...]
  | { k: "e" } // end the open stroke
  | { k: "f"; c: number; x: number; y: number } // bucket fill
  | { k: "u" } // undo the last item
  | { k: "x" }; // clear the page (undoable)

export type Item =
  | { k: "s"; c: number; w: number; p: number[]; o?: 1 }
  | { k: "f"; c: number; x: number; y: number }
  | { k: "x" };

/* ---------- views ---------- */

export interface PlayerView {
  id: string;
  name: string;
  color: number;
  face: number;
  score: number;
  connected: boolean;
  /** Not looking at the game right now: in the background, or reconnecting. */
  away: boolean;
  /** Version of this player's photo, 0 for none (or when the room has photos off). */
  photo: number;
}

export interface TurnScore {
  id: string;
  pts: number;
}

export interface Result {
  id: string;
  name: string;
  color: number;
  face: number;
  score: number;
  rank: number;
}

export interface WordChoice {
  word: string;
  /** Category label, e.g. "Animals". Null for the host's own words. */
  category: string | null;
  level: "easy" | "medium" | "hard" | "custom";
}

export interface View {
  code: string;
  you: string;
  host: string;
  phase: Phase;
  settings: Settings;
  customCount: number;
  round: number;
  rounds: number;
  turn: number;
  turnsPlayed: number;
  drawer: string | null;
  phaseEnds: number | null;
  phaseStarted: number | null;
  word: string | null;
  mask: (string | null)[] | null;
  choices: WordChoice[] | null;
  /** Category label of the current word, shown for easy and medium words. */
  category: string | null;
  players: PlayerView[];
  guessed: string[];
  turnScores: TurnScore[] | null;
  reason: EndReason | null;
  results: Result[] | null;
  firstInRound: boolean;
  now: number;
}

export type ChatKind = "msg" | "correct" | "close" | "warm" | "sys" | "secret" | "you";

export interface ChatMsg {
  id: number;
  k: ChatKind;
  from?: string;
  name?: string;
  color?: number;
  text: string;
}

/* ---------- messages ---------- */

export type ClientMsg =
  | { t: "hello"; v: number; pid: string; secret: string; name: string; color: number; face: number }
  | { t: "ping"; c: number }
  | { t: "profile"; name: string; color: number; face: number }
  | { t: "settings"; s: Partial<Settings> }
  | { t: "start" }
  | { t: "choose"; i: number }
  | { t: "draw"; v: number; ops: Op[] }
  | { t: "sync" }
  | { t: "chat"; text: string }
  | { t: "kick"; pid: string }
  | { t: "leave" }
  | { t: "end" }
  | { t: "skip" }
  | { t: "away" }
  | { t: "back" }
  | { t: "lobby" }
  | { t: "drawing"; turn: number }
  /** Set (data URL) or remove (null) your photo. */
  | { t: "photo"; data: string | null };

export type ErrCode =
  | "not_found"
  | "room_full"
  | "name_taken"
  | "bad_name"
  | "kicked"
  | "replaced"
  | "bad_hello"
  | "not_host"
  | "need_players"
  | "rate_limited"
  | "drawer_chat"
  | "canvas_full"
  | "invalid";

export interface GalleryEntry {
  turn: number;
  word: string;
  by: string;
  name: string;
  color: number;
  items: Item[];
}

export type ServerMsg =
  | { t: "welcome"; you: string; code: string }
  | { t: "state"; s: View }
  | { t: "canvas"; turn: number; v: number; items: Item[] }
  | { t: "draw"; v: number; ops: Op[] }
  | { t: "chat"; m: ChatMsg }
  | { t: "chatlog"; list: ChatMsg[] }
  | { t: "pong"; c: number; s: number }
  | { t: "err"; code: ErrCode; msg: string }
  | { t: "scored"; id: string; pts: number }
  | ({ t: "drawing" } & GalleryEntry)
  /** A player's photo, sent once per version. */
  | { t: "photo"; id: string; v: number; data: string };

/** WebSocket close codes. The client does not auto-reconnect after these. */
export const CLOSE = {
  LEFT: 4000,
  REPLACED: 4001,
  KICKED: 4003,
  NOT_FOUND: 4004,
  FULL: 4005,
  BAD_HELLO: 4006,
  NAME_TAKEN: 4007,
  CLOSED: 4008,
} as const;
export const FATAL_CLOSES: number[] = Object.values(CLOSE);

export const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const CODE_RE = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{5}$/;
export const PID_RE = /^[A-Za-z0-9_-]{8,64}$/;

export interface RoomInfo {
  exists: boolean;
  players: number;
  max: number;
  phase: Phase | null;
}
