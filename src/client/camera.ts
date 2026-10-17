// The in-game camera: a live round viewfinder, a 3-2-1 countdown, then Original / Sketch / Ink.
// No gallery and no cropping: the circle shows exactly what's kept. The camera turns off as soon
// as the photo is taken or the sheet closes.

import { INKS } from "../shared/protocol";
import { LOOKS, renderLook, squareFrom, type Look } from "./looks";
import { sfx } from "./sound";
import { $ } from "./util";

export type CameraResult = { base: HTMLCanvasElement; look: Look } | "character" | null;

let stream: MediaStream | null = null;
let base: HTMLCanvasElement | null = null;
let look: Look = "original";
let color = 0;
let done: (r: CameraResult) => void = () => {};
let countTimer = 0;
let open = false;
let token = 0;

const video = () => $<HTMLVideoElement>("#camVideo");

function stop() {
  token++;
  clearInterval(countTimer);
  countTimer = 0;
  $("#camCount").hidden = true;
  if (stream) for (const t of stream.getTracks()) t.stop();
  stream = null;
  try { video().srcObject = null; } catch { /* ignore */ }
}

function mode(m: "live" | "review" | "fail", msg: string) {
  $("#camLive").hidden = m !== "live";
  $("#camReview").hidden = m !== "review";
  $("#camFail").hidden = m !== "fail";
  $("#camLooks").hidden = m !== "review";
  video().hidden = m === "review";
  $("#camShot").hidden = m !== "review";
  $("#camMsg").textContent = msg;
}

async function start() {
  base = null;
  mode("live", "Starting the camera…");
  const shoot = $<HTMLButtonElement>("#camShoot");
  shoot.disabled = true;
  const md = navigator.mediaDevices;
  if (!md?.getUserMedia) {
    mode("fail", window.isSecureContext ? "This browser can't use the camera." : "The camera needs a secure (https) address.");
    return;
  }
  const mine = ++token;
  try {
    const s = await md.getUserMedia({ video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } }, audio: false });
    if (mine !== token || !open) {
      for (const t of s.getTracks()) t.stop();
      return;
    }
    stream = s;
    const v = video();
    v.srcObject = s;
    await v.play().catch(() => {});
    for (const t of s.getVideoTracks()) {
      t.addEventListener("ended", () => {
        if (open && !base) mode("fail", "The camera stopped. Try again.");
      });
    }
    shoot.disabled = false;
    mode("live", "Put your face in the circle.");
    if (!matchMedia("(pointer: coarse)").matches) shoot.focus({ preventScroll: true });
  } catch (e) {
    if (mine !== token) return;
    const name = (e as { name?: string }).name ?? "";
    mode(
      "fail",
      name === "NotAllowedError" || name === "SecurityError"
        ? "Camera access is blocked. Allow the camera for this site in your browser settings, then try again."
        : name === "NotFoundError" || name === "OverconstrainedError"
          ? "No camera found on this device."
          : name === "NotReadableError"
            ? "The camera is busy in another app. Close it and try again."
            : "Couldn't start the camera. Try again.",
    );
  }
}

function shoot() {
  const v = video();
  if (!stream || countTimer) return;
  $<HTMLButtonElement>("#camShoot").disabled = true;
  let n = 3;
  const count = $("#camCount");
  count.hidden = false;
  count.textContent = String(n);
  sfx.tick(false);
  countTimer = window.setInterval(() => {
    n--;
    if (n > 0) {
      count.textContent = String(n);
      sfx.tick(n === 1);
      return;
    }
    clearInterval(countTimer);
    countTimer = 0;
    count.hidden = true;
    if (!v.videoWidth) {
      mode("fail", "Couldn't take the photo. Try again.");
      return;
    }
    base = squareFrom(v, true);
    sfx.pick();
    stop();
    look = "original";
    review();
  }, 800);
}

function review() {
  if (!base) return;
  const ink = INKS[color] ?? INKS[0];
  const box = $("#camLooks");
  box.innerHTML = LOOKS.map((l) => {
    const url = renderLook(base!, l.id, ink).toDataURL("image/jpeg", 0.85);
    return `<button type="button" class="cam-look" role="radio" data-look="${l.id}" aria-checked="${l.id === look}" data-url="${url}"><img src="${url}" alt=""><span>${l.name}</span></button>`;
  }).join("");
  showLook();
  mode("review", "Pick a look.");
}

function showLook() {
  const box = $("#camLooks");
  for (const b of box.querySelectorAll<HTMLButtonElement>(".cam-look")) {
    const on = b.dataset.look === look;
    b.setAttribute("aria-checked", String(on));
    if (on) $<HTMLImageElement>("#camShot").src = b.dataset.url!;
  }
}

function finish(r: CameraResult) {
  if (!open) return;
  open = false;
  stop();
  $("#camSheet").hidden = true;
  const cb = done;
  done = () => {};
  cb(r);
}

/** Open the camera. `inkColor` tints the Ink preview. */
export function openCamera(inkColor: number, onDone: (r: CameraResult) => void) {
  color = inkColor;
  done = onDone;
  open = true;
  $("#camRing").style.setProperty("--ring", INKS[color] ?? INKS[0]);
  $("#camSheet").hidden = false;
  void start();
}

export function cameraOpen() {
  return open;
}

export function initCamera() {
  $("#camShoot").addEventListener("click", shoot);
  $("#camRetake").addEventListener("click", () => void start());
  $("#camRetry").addEventListener("click", () => void start());
  $("#camUse").addEventListener("click", () => base && finish({ base, look }));
  $("#camChar").addEventListener("click", () => finish("character"));
  $("#camChar2").addEventListener("click", () => finish("character"));
  $("#camClose").addEventListener("click", () => finish(null));
  $("#camSheet").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) finish(null);
  });
  $("#camLooks").addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>(".cam-look");
    if (!b) return;
    look = b.dataset.look as Look;
    showLook();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open) finish(null);
  });
  // Phones stop the camera in the background; start it again when the page comes back.
  document.addEventListener("visibilitychange", () => {
    if (!open) return;
    if (document.visibilityState === "hidden" && !base) stop();
    else if (document.visibilityState === "visible" && !base && !stream) void start();
  });
}
