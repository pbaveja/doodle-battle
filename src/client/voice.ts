// Voice chat. Audio goes straight between players' browsers (WebRTC). The room only passes on one
// offer and one answer per pair of players and keeps nothing. Mute states travel over a small data
// channel on the same connection, and who's speaking is measured on each device, so neither costs
// the room a message. Every device decides for itself whom it may hear (see canHear), and also stops
// sending to players who may not hear it.

import { LIMITS, type View } from "../shared/protocol";
import { app, send } from "./app";

const ICE: RTCIceServer[] = [{ urls: ["stun:stun.cloudflare.com:3478", "stun:stun.l.google.com:19302"] }];
/** Wait at most this long for connection candidates, then send the handshake with what there is. */
const GATHER_MS = 2500;
/** A handshake that hasn't connected by then has failed. */
const CONNECT_MS = 20_000;
/** The offering side tries again after these waits, then gives up until either player rejoins. */
const RETRY_MS = [2000, 8000, 20_000];
const LEVEL_MS = 120;
const SPEAKING_LEVEL = 0.02;
const SPEAKING_HOLD_MS = 350;

export type PeerState = "connecting" | "connected" | "failed";

interface Peer {
  id: string;
  /** The player with the lower id makes the offer, so two players never offer to each other at once. */
  offerer: boolean;
  /** Numbers each offer, so a late answer to an old one is ignored. */
  n: number;
  pc: RTCPeerConnection | null;
  dc: RTCDataChannel | null;
  sender: RTCRtpSender | null;
  audio: HTMLAudioElement | null;
  level: Level | null;
  state: PeerState;
  /** They turned their mic off. */
  muted: boolean;
  fails: number;
  timer: number;
}

interface Level {
  src: MediaStreamAudioSourceNode;
  an: AnalyserNode;
  buf: Float32Array<ArrayBuffer>;
  until: number;
}

let joined = false;
let mic: MediaStreamTrack | null = null;
let myLevel: Level | null = null;
let muted = false;
/** Waiting for the browser's mic permission. */
let asking = false;
let ctx: AudioContext | null = null;
let levelTimer = 0;
let blockedPlay = false;
/** What we last told the room on this connection. */
let told: boolean | undefined;
const peers = new Map<string, Peer>();
/** Players you muted for yourself. */
const silenced = new Set<string>();
const speaking = new Set<string>();
let onChange = () => {};
let onSpeaking = (_ids: Set<string>) => {};

export const voiceSupported = () => typeof RTCPeerConnection !== "undefined";

export function initVoice(handlers: { change: () => void; speaking: (ids: Set<string>) => void }) {
  onChange = handlers.change;
  onSpeaking = handlers.speaking;
}

export const voice = {
  get joined() { return joined; },
  get mic(): "on" | "muted" | "asking" | "none" { return asking ? "asking" : !mic ? "none" : muted ? "muted" : "on"; },
  peer: (id: string) => peers.get(id)?.state ?? "connecting",
  peerMuted: (id: string) => !!peers.get(id)?.muted,
  silenced: (id: string) => silenced.has(id),
};

/**
 * Whether `listener` may hear `speaker` right now. Between turns everyone hears everyone. During a
 * turn, "breaks" mutes everyone; "on" keeps the drawer and the players who've guessed from giving
 * the word away to those still guessing (the same rule as the chat).
 */
export function canHear(v: View, speaker: string, listener: string): boolean {
  const mode = v.settings.voice ?? "off";
  if (mode === "off") return false;
  if (v.phase !== "choosing" && v.phase !== "drawing") return true;
  if (mode === "breaks") return false;
  const knows = (id: string) => id === v.drawer || (v.phase === "drawing" && v.guessed.includes(id));
  return !knows(speaker) || knows(listener);
}

/* ---------------- joining and leaving ---------------- */

/** Join from a tap: browsers only allow the mic and audio playback after one. */
export async function joinVoice() {
  if (joined) return;
  joined = true;
  muted = false;
  startAudio();
  // Calls can start while the browser asks for the mic; it's added to them once it's allowed.
  syncVoice();
  await getMic();
}

export function leaveVoice() {
  if (!joined) return;
  stopAll();
  syncVoice();
}

/** Mute or unmute. Without a mic (it was blocked or taken away), try to get it again. */
export async function toggleMic(): Promise<boolean> {
  if (!mic) return getMic();
  muted = !muted;
  mic.enabled = !muted;
  for (const p of peers.values()) tell(p);
  onChange();
  return true;
}

export function toggleSilence(id: string) {
  if (!silenced.delete(id)) silenced.add(id);
  applyGates();
  onChange();
}

/** A new connection to the room: it forgets that we were in voice, and the others drop their calls to us. */
export function voiceWelcome() {
  told = undefined;
  for (const p of peers.values()) teardown(p);
  peers.clear();
}

/** Left the room. */
export function resetVoice() {
  stopAll();
  silenced.clear();
  told = undefined;
}

function stopAll() {
  joined = false;
  for (const p of peers.values()) teardown(p);
  peers.clear();
  mic?.stop();
  mic = null;
  dropLevel(myLevel);
  myLevel = null;
  clearInterval(levelTimer);
  levelTimer = 0;
  speaking.clear();
  onSpeaking(speaking);
  onChange();
}

async function getMic(): Promise<boolean> {
  if (asking) return false;
  asking = true;
  onChange();
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    const track = stream.getAudioTracks()[0];
    if (!joined || !track) {
      track?.stop();
      return false;
    }
    mic?.stop();
    mic = track;
    mic.enabled = !muted;
    // Another app took the mic, or it was unplugged: keep listening.
    mic.addEventListener("ended", () => {
      if (mic !== track) return;
      mic = null;
      dropLevel(myLevel);
      myLevel = null;
      applyGates();
      onChange();
    });
    dropLevel(myLevel);
    myLevel = measure(stream);
    applyGates();
    onChange();
    return true;
  } catch {
    return false; // blocked or no mic: listening only
  } finally {
    asking = false;
    onChange();
  }
}

function startAudio() {
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx ??= new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    ctx = null; // no speaking rings, but voice still plays
  }
  if (!levelTimer) levelTimer = window.setInterval(checkLevels, LEVEL_MS);
}

/* ---------------- keeping in step with the room ---------------- */

/** Call on every state from the room. Tells the room whether we're in, and calls the players we should. */
export function syncVoice() {
  const v = app.view;
  if (!v || !app.joined) return;
  if (joined && (v.settings.voice ?? "off") === "off") stopAll(); // the host turned voice off
  const me = v.players.find((p) => p.id === v.you);
  if (!me) return;
  // Only on a change, and once per change: a room that says no doesn't get asked again.
  if (me.voice !== joined && told !== joined && send({ t: "voice", on: joined })) told = joined;

  const want = new Set(joined && me.voice && app.conn?.live ? v.players.filter((p) => p.voice && p.id !== v.you).map((p) => p.id) : []);
  for (const [id, p] of peers) {
    if (want.has(id)) continue;
    teardown(p);
    peers.delete(id);
  }
  for (const id of want) {
    if (peers.has(id) || !(v.you < id)) continue;
    const p = newPeer(id, true);
    peers.set(id, p);
    void call(p);
  }
  applyGates();
  onChange();
}

/** A handshake from another player, passed on by the room. */
export function onRtc(from: string, d: string) {
  if (!joined) return;
  let m: { n?: unknown; type?: unknown; sdp?: unknown };
  try {
    m = JSON.parse(d);
  } catch {
    return;
  }
  if (typeof m.n !== "number" || typeof m.sdp !== "string") return;
  if (m.type === "offer" && from < app.you) void answer(from, m.n, m.sdp);
  else if (m.type === "answer") {
    const p = peers.get(from);
    if (p?.offerer && p.pc && p.n === m.n && p.pc.signalingState === "have-local-offer") {
      p.pc.setRemoteDescription({ type: "answer", sdp: m.sdp }).catch(() => fail(p));
    }
  }
}

/* ---------------- connections ---------------- */

function newPeer(id: string, offerer: boolean): Peer {
  return { id, offerer, n: 0, pc: null, dc: null, sender: null, audio: null, level: null, state: "connecting", muted: false, fails: 0, timer: 0 };
}

function open(p: Peer): RTCPeerConnection {
  teardown(p);
  const pc = new RTCPeerConnection({ iceServers: ICE });
  p.pc = pc;
  p.state = "connecting";
  // Both sides create this channel themselves, so it needs no handshake of its own.
  const dc = pc.createDataChannel("v", { negotiated: true, id: 0 });
  p.dc = dc;
  dc.onopen = () => tell(p);
  dc.onmessage = (e) => {
    try {
      p.muted = !!JSON.parse(String(e.data)).muted;
      onChange();
    } catch { /* ignore */ }
  };
  pc.ontrack = (e) => {
    if (p.pc === pc) hear(p, e.streams[0] ?? new MediaStream([e.track]));
  };
  pc.oniceconnectionstatechange = () => {
    if (p.pc !== pc) return;
    const s = pc.iceConnectionState;
    if (s === "connected" || s === "completed") {
      if (p.state === "connected") return;
      p.state = "connected";
      p.fails = 0;
      clearTimeout(p.timer);
      onChange();
    } else if (s === "failed") fail(p);
  };
  p.timer = window.setTimeout(() => p.pc === pc && p.state !== "connected" && fail(p), CONNECT_MS);
  return pc;
}

async function call(p: Peer) {
  const pc = open(p);
  const n = ++p.n;
  try {
    p.sender = pc.addTransceiver("audio", { direction: "sendrecv" }).sender;
    applyGates();
    await pc.setLocalDescription(await pc.createOffer());
    await gathered(pc);
    if (p.pc === pc) signal(p, n, pc.localDescription!);
  } catch {
    if (p.pc === pc) fail(p);
  }
}

async function answer(from: string, n: number, sdp: string) {
  let p = peers.get(from);
  if (!p) {
    p = newPeer(from, false);
    peers.set(from, p);
  }
  const pc = open(p);
  try {
    await pc.setRemoteDescription({ type: "offer", sdp });
    const tr = pc.getTransceivers().find((t) => t.receiver.track.kind === "audio");
    if (tr) {
      tr.direction = "sendrecv";
      p.sender = tr.sender;
    }
    applyGates();
    await pc.setLocalDescription(await pc.createAnswer());
    await gathered(pc);
    if (p.pc === pc) signal(p, n, pc.localDescription!);
  } catch {
    if (p.pc === pc) fail(p);
  }
}

/** Opus may skip silence (DTX): far less data while nobody's talking. */
const dtx = (sdp: string) => sdp.replace(/^(a=fmtp:\d+ .*useinbandfec=1)(?!.*usedtx)(.*)$/gm, "$1;usedtx=1$2");

function signal(p: Peer, n: number, desc: RTCSessionDescription) {
  const d = JSON.stringify({ n, type: desc.type, sdp: dtx(desc.sdp) });
  // Too big for the room to pass on: don't send what would only be dropped.
  if (d.length > LIMITS.rtcMaxChars) {
    p.fails = RETRY_MS.length;
    fail(p);
    return;
  }
  if (!send({ t: "rtc", to: p.id, d })) fail(p);
}

function gathered(pc: RTCPeerConnection): Promise<void> {
  if (pc.iceGatheringState === "complete") return Promise.resolve();
  return new Promise((done) => {
    const t = setTimeout(done, GATHER_MS);
    pc.addEventListener("icegatheringstatechange", () => {
      if (pc.iceGatheringState !== "complete") return;
      clearTimeout(t);
      done();
    });
  });
}

function fail(p: Peer) {
  if (peers.get(p.id) !== p) return;
  teardown(p);
  // Offline: start afresh once the room is back (the welcome clears every call).
  if (!app.conn?.live) {
    peers.delete(p.id);
    onChange();
    return;
  }
  p.fails++;
  p.state = p.fails > RETRY_MS.length ? "failed" : "connecting";
  // The answering side waits for the next offer.
  if (p.offerer && p.state === "connecting") {
    p.timer = window.setTimeout(() => {
      if (peers.get(p.id) === p && app.conn?.live) void call(p);
    }, RETRY_MS[p.fails - 1]);
  }
  onChange();
}

function teardown(p: Peer) {
  clearTimeout(p.timer);
  p.timer = 0;
  if (p.pc) {
    p.pc.oniceconnectionstatechange = null;
    p.pc.ontrack = null;
    p.pc.close();
  }
  p.pc = null;
  p.dc = null;
  p.sender = null;
  p.muted = false;
  dropLevel(p.level);
  p.level = null;
  if (p.audio) {
    p.audio.srcObject = null;
    p.audio.remove();
  }
  p.audio = null;
  if (speaking.delete(p.id)) onSpeaking(speaking);
}

/** Tell one player whether our mic is on. */
function tell(p: Peer) {
  if (p.dc?.readyState !== "open") return;
  try {
    p.dc.send(JSON.stringify({ muted: !mic || muted }));
  } catch { /* closing */ }
}

/* ---------------- hearing ---------------- */

function hear(p: Peer, stream: MediaStream) {
  if (!p.audio) {
    p.audio = document.createElement("audio");
    p.audio.dataset.id = p.id;
    p.audio.autoplay = true;
    p.audio.setAttribute("playsinline", "");
    document.body.appendChild(p.audio);
  }
  p.audio.srcObject = stream;
  play(p.audio);
  dropLevel(p.level);
  p.level = measure(stream);
  applyGates();
}

function play(audio: HTMLAudioElement) {
  audio.play().catch(() => {
    // The browser wants a tap before playing sound: play everything on the next one.
    if (blockedPlay) return;
    blockedPlay = true;
    window.addEventListener("pointerdown", () => {
      blockedPlay = false;
      void ctx?.resume();
      for (const q of peers.values()) if (q.audio) play(q.audio);
    }, { once: true, capture: true });
  });
}

/** Mute what we may not hear, and stop sending to players who may not hear us. */
function applyGates() {
  const v = app.view;
  for (const p of peers.values()) {
    const hearIt = !!v && canHear(v, p.id, v.you) && !silenced.has(p.id);
    if (p.audio) p.audio.muted = !hearIt;
    const out = v && mic && canHear(v, v.you, p.id) ? mic : null;
    if (p.sender && p.sender.track !== out) p.sender.replaceTrack(out).catch(() => {});
  }
}

function measure(stream: MediaStream): Level | null {
  if (!ctx) return null;
  try {
    const src = ctx.createMediaStreamSource(stream);
    const an = ctx.createAnalyser();
    an.fftSize = 512;
    src.connect(an);
    return { src, an, buf: new Float32Array(an.fftSize), until: 0 };
  } catch {
    return null;
  }
}

function dropLevel(l: Level | null) {
  try { l?.src.disconnect(); } catch { /* already gone */ }
}

function loud(l: Level | null, now: number): boolean {
  if (!l) return false;
  l.an.getFloatTimeDomainData(l.buf);
  let sum = 0;
  for (const x of l.buf) sum += x * x;
  if (Math.sqrt(sum / l.buf.length) > SPEAKING_LEVEL) l.until = now + SPEAKING_HOLD_MS;
  return l.until > now;
}

/** Who's speaking, as far as this device can hear. */
function checkLevels() {
  const v = app.view;
  const now = performance.now();
  const next = new Set<string>();
  if (v && mic && !muted && loud(myLevel, now)) next.add(v.you);
  for (const p of peers.values()) {
    if (v && p.audio && !p.audio.muted && loud(p.level, now)) next.add(p.id);
  }
  if (next.size === speaking.size && [...next].every((id) => speaking.has(id))) return;
  speaking.clear();
  for (const id of next) speaking.add(id);
  onSpeaking(speaking);
}
