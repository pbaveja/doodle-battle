// The drawing surface: renders ops identically on every device, takes pointer input for the drawer,
// and smooths incoming strokes with a short playout buffer.

import { BRUSH_SIZES, CANVAS_H as H, CANVAS_W as W, LIMITS, PALETTE, PAPER, type Item, type Op } from "../shared/protocol";
import { applyOp } from "../shared/rules";

type Stroke = Extract<Item, { k: "s" }>;
type Ctx = CanvasRenderingContext2D;

const colorOf = (c: number) => (c < 0 ? PAPER : PALETTE[c] ?? PALETTE[0]);

function strokeStyle(ctx: Ctx, s: Stroke) {
  const col = colorOf(s.c);
  ctx.strokeStyle = col;
  ctx.fillStyle = col;
  ctx.lineWidth = s.w;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}
const pt = (s: Stroke, i: number): [number, number] => [s.p[i * 2], s.p[i * 2 + 1]];
const mid = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

function drawDot(ctx: Ctx, s: Stroke) {
  strokeStyle(ctx, s);
  const [x, y] = pt(s, 0);
  ctx.beginPath();
  ctx.arc(x, y, s.w / 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawSegment(ctx: Ctx, s: Stroke, i: number) {
  if (i < 1) return;
  strokeStyle(ctx, s);
  const p0 = pt(s, i - 1), p1 = pt(s, i);
  const a = i >= 2 ? mid(pt(s, i - 2), p0) : p0;
  const m = mid(p0, p1);
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.quadraticCurveTo(p0[0], p0[1], m[0], m[1]);
  ctx.stroke();
}

function drawEnd(ctx: Ctx, s: Stroke) {
  const n = s.p.length / 2;
  if (n < 2) return;
  strokeStyle(ctx, s);
  const a = mid(pt(s, n - 2), pt(s, n - 1));
  const l = pt(s, n - 1);
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(l[0], l[1]);
  ctx.stroke();
}

function drawStroke(ctx: Ctx, s: Stroke) {
  const n = s.p.length / 2;
  if (n === 1) return drawDot(ctx, s);
  strokeStyle(ctx, s);
  ctx.beginPath();
  ctx.moveTo(s.p[0], s.p[1]);
  for (let i = 1; i < n; i++) {
    const m = mid(pt(s, i - 1), pt(s, i));
    ctx.quadraticCurveTo(s.p[(i - 1) * 2], s.p[(i - 1) * 2 + 1], m[0], m[1]);
  }
  const l = pt(s, n - 1);
  ctx.lineTo(l[0], l[1]);
  ctx.stroke();
}

function hexToU32(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0; // little-endian RGBA in a Uint32Array
}

/** Scanline flood fill with a colour tolerance, then grows 1px to cover antialiased edges. */
export function floodFill(ctx: Ctx, x0: number, y0: number, hex: string) {
  const img = ctx.getImageData(0, 0, W, H);
  const data = new Uint32Array(img.data.buffer);
  const start = y0 * W + x0;
  const target = data[start];
  const fill = hexToU32(hex);
  if (target === fill) return;
  const tr = target & 255, tg = (target >> 8) & 255, tb = (target >> 16) & 255;
  const TOL = 60;
  const same = (i: number) => {
    const c = data[i];
    return Math.abs((c & 255) - tr) + Math.abs(((c >> 8) & 255) - tg) + Math.abs(((c >> 16) & 255) - tb) <= TOL;
  };
  const mask = new Uint8Array(W * H);
  const stack: number[] = [start];
  while (stack.length) {
    const i = stack.pop()!;
    let x = i % W;
    const y = (i - x) / W;
    let j = i;
    while (x > 0 && !mask[j - 1] && same(j - 1)) { j--; x--; }
    let up = false, down = false;
    while (x < W && !mask[j] && same(j)) {
      mask[j] = 1;
      if (y > 0) {
        const u = j - W;
        if (!mask[u] && same(u)) { if (!up) { stack.push(u); up = true; } } else up = false;
      }
      if (y < H - 1) {
        const d = j + W;
        if (!mask[d] && same(d)) { if (!down) { stack.push(d); down = true; } } else down = false;
      }
      j++; x++;
    }
  }
  for (let y = 0; y < H; y++) {
    const row = y * W;
    for (let x = 0; x < W; x++) {
      const i = row + x;
      if (mask[i] === 1) {
        data[i] = fill;
        if (x > 0 && !mask[i - 1]) { mask[i - 1] = 2; data[i - 1] = fill; }
        if (x < W - 1 && !mask[i + 1]) { mask[i + 1] = 2; data[i + 1] = fill; }
        if (y > 0 && !mask[i - W]) { mask[i - W] = 2; data[i - W] = fill; }
        if (y < H - 1 && !mask[i + W]) { mask[i + W] = 2; data[i + W] = fill; }
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

export function renderItems(ctx: Ctx, items: Item[]) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  let from = 0;
  for (let i = items.length - 1; i >= 0; i--) if (items[i].k === "x") { from = i + 1; break; }
  for (let i = from; i < items.length; i++) {
    const it = items[i];
    if (it.k === "s") drawStroke(ctx, it);
    else if (it.k === "f") floodFill(ctx, it.x, it.y, colorOf(it.c));
  }
}

/** Renders items to a small JPEG for the sketchbook. */
export function thumbnail(items: Item[] | null, source?: HTMLCanvasElement, width = 480): string {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = Math.round((width * H) / W);
  const x = c.getContext("2d")!;
  if (source) {
    x.drawImage(source, 0, 0, c.width, c.height);
  } else if (items) {
    const full = document.createElement("canvas");
    full.width = W;
    full.height = H;
    const fx = full.getContext("2d", { willReadFrequently: true })!;
    renderItems(fx, items);
    x.drawImage(full, 0, 0, c.width, c.height);
  }
  try {
    return c.toDataURL("image/jpeg", 0.85);
  } catch {
    return "";
  }
}

export type Tool = "brush" | "fill" | "eraser";

type Queued = { due: number; op: Op } | { due: number; pts: [number, number]; last: boolean };

/** The drawer sends new points this often; viewers spread each batch over the same time. */
const BATCH_MS = 400;
/**
 * Batches held up by a network hiccup arrive together and queue up behind each other. A viewer
 * with more than this still to play skips ahead and catches up.
 */
const MAX_LAG_MS = 1300;

export class Board {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: Ctx;
  items: Item[] = [];
  v = 0;
  turn = -1;
  enabled = false;
  tool: Tool = "brush";
  color = 0;
  size = 1;
  /** Return false when the message could not be sent (offline). */
  onSend: (v: number, ops: Op[]) => boolean = () => false;
  onDesync: () => void = () => {};
  onFull: () => void = () => {};
  onChange: () => void = () => {};

  private recvV = 0;
  private queue: Queued[] = [];
  private lastDue = 0;
  private raf = 0;
  private outbox: Op[] = [];
  private pending: number[] = [];
  private flushTimer = 0;
  private activeId: number | null = null;
  private last: [number, number] | null = null;
  private lastPen = 0;
  private points = 0;
  /** Where the drawer's pointer input comes from: the canvas itself, or a drawing pad that mirrors it. */
  private surface: HTMLElement;
  private bound = new Set<HTMLElement>();
  /** Goes up whenever the picture changes, so a mirror knows when to redraw. */
  paints = 0;

  constructor(canvas: HTMLCanvasElement, private cursor?: HTMLElement) {
    this.canvas = canvas;
    canvas.width = W;
    canvas.height = H;
    this.ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    this.clearPaper();
    this.surface = canvas;
    this.bindInput(canvas);
  }

  /**
   * Take drawing input from another element with the canvas's proportions (null for the canvas
   * itself). The canvas then ignores touches, so a sleeve brushing the big screen draws nothing.
   */
  setSurface(el: HTMLElement | null) {
    const next = el ?? this.canvas;
    if (next === this.surface) return;
    this.cancelInput();
    this.surface = next;
    if (this.cursor) this.cursor.hidden = true;
    if (!this.bound.has(next)) this.bindInput(next);
  }

  private clearPaper() {
    this.ctx.fillStyle = PAPER;
    this.ctx.fillRect(0, 0, W, H);
  }

  load(turn: number, v: number, items: Item[]) {
    this.turn = turn;
    this.items = structuredClone(items);
    this.v = this.recvV = v;
    this.queue = [];
    this.outbox = [];
    this.pending = [];
    this.activeId = null;
    this.points = 0;
    for (const it of this.items) if (it.k === "s") this.points += it.p.length / 2;
    renderItems(this.ctx, this.items);
    this.paints++;
    this.onChange();
  }

  get canUndo() {
    return this.items.length > 0;
  }

  get isEmpty() {
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (this.items[i].k === "x") return true;
      return false;
    }
    return true;
  }

  /* ---------- remote ops ---------- */

  remote(v: number, ops: Op[]) {
    if (v !== this.recvV) {
      this.onDesync();
      return;
    }
    this.recvV += ops.length;
    const now = performance.now();
    // A batch plays as soon as it arrives, or straight after the one before it. Holding it back
    // wouldn't hide a late batch (the line pauses either way), it would only add delay.
    let base = Math.max(now, this.lastDue);
    if (base - now > MAX_LAG_MS) base = now; // fell behind: catch up
    let total = 0;
    for (const op of ops) if (op.k === "m") total += op.p.length / 2;
    const step = total > 0 ? BATCH_MS / total : 0;
    let n = 0;
    for (const op of ops) {
      if (op.k === "m") {
        for (let i = 0; i < op.p.length; i += 2) {
          this.queue.push({ due: base + step * n++, pts: [op.p[i], op.p[i + 1]], last: i + 2 >= op.p.length });
        }
      } else {
        this.queue.push({ due: base + step * n, op });
      }
    }
    this.lastDue = base + step * n;
    if (!this.raf) this.raf = requestAnimationFrame(this.pump);
  }

  private pump = () => {
    this.raf = 0;
    const now = performance.now();
    while (this.queue.length && this.queue[0].due <= now) this.applyQueued(this.queue.shift()!);
    if (this.queue.length) this.raf = requestAnimationFrame(this.pump);
  };

  /** Apply everything still waiting in the playout buffer (before a snapshot or reveal). */
  drain() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    while (this.queue.length) this.applyQueued(this.queue.shift()!);
  }

  private applyQueued(q: Queued) {
    if ("op" in q) {
      this.applyAndRender(q.op);
      this.v++;
      return;
    }
    const last = this.items[this.items.length - 1];
    if (!last || last.k !== "s" || !last.o) {
      this.queue = [];
      this.onDesync();
      return;
    }
    last.p.push(q.pts[0], q.pts[1]);
    drawSegment(this.ctx, last, last.p.length / 2 - 1);
    this.paints++;
    if (q.last) this.v++;
  }

  private applyAndRender(op: Op) {
    switch (op.k) {
      case "b": {
        applyOp(this.items, op);
        drawDot(this.ctx, this.items[this.items.length - 1] as Stroke);
        break;
      }
      case "m": {
        const s = this.items[this.items.length - 1] as Stroke;
        const from = s.p.length / 2;
        if (applyOp(this.items, op) < 0) return;
        for (let i = from; i < s.p.length / 2; i++) drawSegment(this.ctx, s, i);
        break;
      }
      case "e": {
        const s = this.items[this.items.length - 1];
        applyOp(this.items, op);
        if (s && s.k === "s") drawEnd(this.ctx, s);
        break;
      }
      case "f":
        applyOp(this.items, op);
        floodFill(this.ctx, op.x, op.y, colorOf(op.c));
        break;
      case "u":
        applyOp(this.items, op);
        renderItems(this.ctx, this.items);
        break;
      case "x":
        applyOp(this.items, op);
        this.clearPaper();
        break;
    }
    this.paints++;
    this.onChange();
  }

  /* ---------- local drawing ---------- */

  private local(op: Op) {
    this.flushPending();
    this.applyAndRender(op);
    this.v++;
    this.recvV = this.v;
    this.outbox.push(op);
    if (op.k === "b") this.points += 1;
    // A stroke's start and end ride along with the next batch of points; fills, undo and clear go at once.
    if (op.k === "b" || op.k === "e") this.scheduleFlush();
    else this.flushOutbox();
  }

  private flushPending() {
    if (!this.pending.length) return;
    const max = LIMITS.maxPointsPerOp * 2;
    for (let i = 0; i < this.pending.length; i += max) {
      this.outbox.push({ k: "m", p: this.pending.slice(i, i + max) });
      this.v++;
    }
    this.recvV = this.v;
    this.pending = [];
  }

  private scheduleFlush() {
    if (this.flushTimer) return;
    this.flushTimer = window.setTimeout(() => {
      this.flushTimer = 0;
      this.flushPending();
      this.flushOutbox();
      if (this.activeId !== null) this.scheduleFlush();
    }, BATCH_MS);
  }

  private flushOutbox() {
    if (!this.outbox.length) return;
    const ops = this.outbox;
    this.outbox = [];
    this.onSend(this.v - ops.length, ops);
  }

  undo() {
    if (!this.enabled || !this.items.length) return;
    this.endStroke();
    this.local({ k: "u" });
  }

  clear() {
    if (!this.enabled || this.isEmpty) return;
    this.endStroke();
    this.local({ k: "x" });
  }

  private toCanvas(e: PointerEvent): [number, number] {
    const r = this.surface.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) * W) / r.width);
    const y = Math.round(((e.clientY - r.top) * H) / r.height);
    return [Math.max(-100, Math.min(W + 100, x)), Math.max(-100, Math.min(H + 100, y))];
  }

  private brushWidth() {
    const w = BRUSH_SIZES[this.size] ?? BRUSH_SIZES[1];
    return this.tool === "eraser" ? Math.round(w * 1.8) : w;
  }

  private endStroke() {
    if (this.activeId === null) return;
    try { this.surface.releasePointerCapture(this.activeId); } catch { /* ignore */ }
    this.activeId = null;
    this.last = null;
    this.local({ k: "e" });
  }

  /** Stop any stroke in progress (turn ended, lost connection). */
  cancelInput() {
    if (this.activeId !== null) this.endStroke();
    this.flushPending();
    this.flushOutbox();
  }

  private bindInput(c: HTMLElement) {
    this.bound.add(c);
    c.addEventListener("pointerdown", (e) => {
      if (c !== this.surface) return;
      if (e.pointerType === "pen") this.lastPen = performance.now();
      if (!this.enabled || this.activeId !== null) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (e.pointerType === "touch" && performance.now() - this.lastPen < 1500) return; // palm rejection
      e.preventDefault();
      const [x, y] = this.toCanvas(e);
      if (this.tool === "fill") {
        if (x >= 0 && x < W && y >= 0 && y < H) this.local({ k: "f", c: this.color, x, y });
        return;
      }
      if (this.points >= LIMITS.maxPointsPerTurn - 50) {
        this.onFull();
        return;
      }
      this.activeId = e.pointerId;
      try { c.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      this.last = [x, y];
      this.local({ k: "b", c: this.tool === "eraser" ? -1 : this.color, w: this.brushWidth(), x, y });
    });
    c.addEventListener("pointermove", (e) => {
      if (c !== this.surface) return;
      this.moveCursor(e);
      if (e.pointerId !== this.activeId) return;
      e.preventDefault();
      const s = this.items[this.items.length - 1];
      if (!s || s.k !== "s" || !s.o) return;
      const events = typeof e.getCoalescedEvents === "function" ? e.getCoalescedEvents() : [];
      for (const ev of events.length ? events : [e]) {
        const p = this.toCanvas(ev);
        if (this.last && Math.hypot(p[0] - this.last[0], p[1] - this.last[1]) < 2.2) continue;
        if (this.points >= LIMITS.maxPointsPerTurn - 10) {
          this.endStroke();
          this.onFull();
          return;
        }
        this.last = p;
        s.p.push(p[0], p[1]);
        this.pending.push(p[0], p[1]);
        this.points++;
        drawSegment(this.ctx, s, s.p.length / 2 - 1);
        this.paints++;
      }
    });
    const up = (e: PointerEvent) => {
      if (c === this.surface && e.pointerId === this.activeId) this.endStroke();
    };
    c.addEventListener("pointerup", up);
    c.addEventListener("pointercancel", up);
    c.addEventListener("lostpointercapture", up);
    c.addEventListener("pointerleave", () => this.cursor && (this.cursor.hidden = true));
    c.addEventListener("contextmenu", (e) => e.preventDefault());
    c.addEventListener("touchmove", (e) => { if (this.enabled && c === this.surface) e.preventDefault(); }, { passive: false });
  }

  private moveCursor(e: PointerEvent) {
    const cur = this.cursor;
    if (!cur) return;
    if (!this.enabled || e.pointerType === "touch" || this.tool === "fill" || this.surface !== this.canvas) {
      cur.hidden = true;
      return;
    }
    const r = this.canvas.getBoundingClientRect();
    const size = (this.brushWidth() * r.width) / W;
    cur.hidden = false;
    cur.style.width = cur.style.height = `${Math.max(4, size)}px`;
    cur.style.transform = `translate(${e.clientX - r.left - size / 2}px, ${e.clientY - r.top - size / 2}px)`;
    cur.style.borderColor = this.tool === "eraser" ? "#8a93a6" : colorOf(this.color);
  }
}
