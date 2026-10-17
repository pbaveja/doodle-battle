// Reconnecting WebSocket with heartbeats and server clock sync.

import { FATAL_CLOSES, type ClientMsg, type ServerMsg } from "../shared/protocol";

export type ConnStatus = "connecting" | "open" | "retrying" | "closed" | "stopped";

const PING_EVERY = 10_000;
const PONG_TIMEOUT = 6_000;
const OPEN_TIMEOUT = 8_000;

export class Conn {
  status: ConnStatus = "connecting";
  attempt = 0;
  closeCode = 0;
  offline = typeof navigator !== "undefined" && navigator.onLine === false;
  downSince: number | null = null;
  rtt = 0;
  /** True once the room has answered our hello on the current socket. */
  ready = false;
  onMessage: (m: ServerMsg) => void = () => {};
  onOpen: () => void = () => {};
  onStatus: () => void = () => {};

  private ws: WebSocket | null = null;
  private retryTimer = 0;
  private openTimer = 0;
  private pingTimer = 0;
  private pongTimer = 0;
  private readyTimer = 0;
  private samples: { rtt: number; off: number }[] = [];
  private offset = 0;
  private haveSample = false;
  private stopped = false;
  private listeners: [EventTarget, string, EventListener][] = [];

  constructor(private url: string) {
    this.on(window, "online", () => {
      this.offline = false;
      this.onStatus();
      if (this.status !== "open") this.retryNow();
      else this.ping(3000);
    });
    this.on(window, "offline", () => {
      this.offline = true;
      // The network interface went down: the socket is dead even if it hasn't noticed yet.
      if (this.status === "open" || this.status === "connecting") this.fail();
      else this.onStatus();
    });
    this.on(document, "visibilitychange", () => {
      if (document.visibilityState !== "visible") return;
      if (this.status === "open") this.ping(3500);
      else if (this.status === "retrying") this.retryNow();
    });
    this.on(window, "pageshow", () => {
      if (this.status !== "open" && !this.stopped) this.retryNow();
    });
  }

  private on(t: EventTarget, ev: string, fn: EventListener) {
    t.addEventListener(ev, fn);
    this.listeners.push([t, ev, fn]);
  }

  start() {
    this.stopped = false;
    this.open();
  }

  /** Connected and welcomed by the room. */
  get live() {
    return this.status === "open" && this.ready;
  }

  /** Call when the room's welcome arrives. */
  markReady() {
    clearTimeout(this.readyTimer);
    this.ready = true;
    this.attempt = 0;
    this.downSince = null;
    this.offline = false;
    this.onStatus();
  }

  /** Server time in ms, corrected for this device's clock. */
  serverNow() {
    return Date.now() + this.offset;
  }

  hintServerTime(serverNow: number) {
    if (!this.haveSample) this.offset = serverNow - Date.now();
  }

  send(msg: ClientMsg): boolean {
    if (this.status !== "open" || !this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
    try {
      this.ws.send(JSON.stringify(msg));
      return true;
    } catch {
      return false;
    }
  }

  retryNow() {
    if (this.stopped || this.status === "closed") return;
    clearTimeout(this.retryTimer);
    if (this.status === "open" || this.status === "connecting") return;
    this.attempt = Math.max(0, this.attempt - 1);
    this.open();
  }

  stop(code = 1000) {
    this.stopped = true;
    this.status = "stopped";
    this.clearTimers();
    for (const [t, ev, fn] of this.listeners) t.removeEventListener(ev, fn);
    this.listeners = [];
    const ws = this.ws;
    this.ws = null;
    if (ws) {
      this.detach(ws);
      try { ws.close(code); } catch { /* ignore */ }
    }
  }

  private clearTimers() {
    clearTimeout(this.retryTimer);
    clearTimeout(this.openTimer);
    clearInterval(this.pingTimer);
    clearTimeout(this.pongTimer);
    clearTimeout(this.readyTimer);
  }

  private detach(ws: WebSocket) {
    ws.onopen = ws.onclose = ws.onerror = ws.onmessage = null;
  }

  private open() {
    if (this.stopped) return;
    this.clearTimers();
    this.ready = false;
    if (this.ws) {
      this.detach(this.ws);
      try { this.ws.close(); } catch { /* ignore */ }
    }
    this.status = this.attempt === 0 && this.downSince === null ? "connecting" : "retrying";
    this.onStatus();
    let ws: WebSocket;
    try {
      ws = new WebSocket(this.url);
    } catch {
      this.scheduleRetry();
      return;
    }
    this.ws = ws;
    this.openTimer = window.setTimeout(() => this.fail(), OPEN_TIMEOUT);
    ws.onopen = () => {
      clearTimeout(this.openTimer);
      this.status = "open";
      this.ready = false;
      this.onOpen();
      this.onStatus();
      // A socket that opens but never gets a welcome is treated as dead.
      this.readyTimer = window.setTimeout(() => this.fail(), OPEN_TIMEOUT);
      // A quick burst of pings gives a good clock estimate, then a steady heartbeat.
      [0, 300, 700, 1200].forEach((d) => setTimeout(() => this.ping(0), d));
      this.pingTimer = window.setInterval(() => this.ping(PONG_TIMEOUT), PING_EVERY);
    };
    ws.onmessage = (e) => {
      let m: ServerMsg;
      try {
        m = JSON.parse(typeof e.data === "string" ? e.data : "");
      } catch {
        return;
      }
      if (m.t === "pong") {
        this.onPong(m.c, m.s);
        return;
      }
      this.onMessage(m);
    };
    ws.onclose = (e) => {
      if (this.ws !== ws) return;
      this.ws = null;
      this.ready = false;
      this.clearTimers();
      if (this.stopped) return;
      if (FATAL_CLOSES.includes(e.code)) {
        this.status = "closed";
        this.closeCode = e.code;
        this.onStatus();
        return;
      }
      this.scheduleRetry();
    };
    ws.onerror = () => {
      /* onclose follows */
    };
  }

  private fail() {
    const ws = this.ws;
    this.ws = null;
    this.ready = false;
    if (ws) {
      this.detach(ws);
      try { ws.close(); } catch { /* ignore */ }
    }
    this.clearTimers();
    if (!this.stopped) this.scheduleRetry();
  }

  private scheduleRetry() {
    this.downSince ??= Date.now();
    this.attempt++;
    this.status = "retrying";
    this.onStatus();
    const base = Math.min(8000, 300 * Math.pow(1.6, this.attempt - 1));
    const delay = base * (0.8 + Math.random() * 0.4);
    this.retryTimer = window.setTimeout(() => this.open(), delay);
  }

  private ping(timeout: number) {
    if (!this.send({ t: "ping", c: Date.now() })) return;
    if (timeout > 0) {
      clearTimeout(this.pongTimer);
      this.pongTimer = window.setTimeout(() => this.fail(), timeout);
    }
  }

  private onPong(c: number, s: number) {
    clearTimeout(this.pongTimer);
    const now = Date.now();
    const rtt = now - c;
    if (rtt < 0 || rtt > 30_000) return;
    this.samples.push({ rtt, off: s - (c + rtt / 2) });
    if (this.samples.length > 8) this.samples.shift();
    const best = this.samples.reduce((a, b) => (b.rtt < a.rtt ? b : a));
    this.offset = best.off;
    this.haveSample = true;
    this.rtt = rtt;
    this.onStatus();
  }
}
