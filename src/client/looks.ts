// Photo looks. The camera frame is cropped to a 320px square (mirrored like a selfie), then each
// look renders a 160px picture: Original (lightly brightened in dim rooms), Sketch (pencil on paper)
// and Ink (shades of the player's colour). Everything happens on the device.

export type Look = "original" | "sketch" | "ink";
export const LOOKS: { id: Look; name: string }[] = [
  { id: "original", name: "Original" },
  { id: "sketch", name: "Sketch" },
  { id: "ink", name: "Ink" },
];

export const BASE = 320;
export const OUT = 160;
/** Keep the encoded photo well under the server's limit (40,000 characters). */
const MAX_CHARS = 36_000;

const canvas = (size: number) => {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return c;
};
const ctx2d = (c: HTMLCanvasElement) => c.getContext("2d", { willReadFrequently: true })!;

/** A centred square from a video frame or image, mirrored horizontally when it's a selfie. */
export function squareFrom(src: HTMLVideoElement | HTMLImageElement, mirror: boolean): HTMLCanvasElement {
  const w = src instanceof HTMLVideoElement ? src.videoWidth : src.naturalWidth;
  const h = src instanceof HTMLVideoElement ? src.videoHeight : src.naturalHeight;
  const m = Math.min(w, h);
  const c = canvas(BASE);
  const x = ctx2d(c);
  x.fillStyle = "#fff";
  x.fillRect(0, 0, BASE, BASE);
  if (mirror) {
    x.translate(BASE, 0);
    x.scale(-1, 1);
  }
  x.imageSmoothingQuality = "high";
  x.drawImage(src, (w - m) / 2, (h - m) / 2, m, m, 0, 0, BASE, BASE);
  return c;
}

function scaled(src: HTMLCanvasElement, size: number): HTMLCanvasElement {
  const c = canvas(size);
  const x = ctx2d(c);
  x.imageSmoothingQuality = "high";
  x.drawImage(src, 0, 0, size, size);
  return c;
}

function luminance(d: Uint8ClampedArray): Float32Array {
  const l = new Float32Array(d.length / 4);
  for (let i = 0; i < l.length; i++) l[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
  return l;
}

/** Two-pass box blur on a square greyscale image. */
function blur(a: Float32Array, n: number, r: number): Float32Array {
  const t = new Float32Array(a.length), o = new Float32Array(a.length), w = 2 * r + 1;
  const at = (v: number) => Math.min(n - 1, Math.max(0, v));
  for (let y = 0; y < n; y++) {
    let s = 0;
    for (let x = -r; x <= r; x++) s += a[y * n + at(x)];
    for (let x = 0; x < n; x++) {
      t[y * n + x] = s / w;
      s += a[y * n + at(x + r + 1)] - a[y * n + at(x - r)];
    }
  }
  for (let x = 0; x < n; x++) {
    let s = 0;
    for (let y = -r; y <= r; y++) s += t[at(y) * n + x];
    for (let y = 0; y < n; y++) {
      o[y * n + x] = s / w;
      s += t[at(y + r + 1) * n + x] - t[at(y - r) * n + x];
    }
  }
  return o;
}

function hexRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function original(base: HTMLCanvasElement): HTMLCanvasElement {
  const c = scaled(base, OUT);
  const x = ctx2d(c);
  const img = x.getImageData(0, 0, OUT, OUT);
  const l = luminance(img.data);
  let mean = 0;
  for (const v of l) mean += v;
  mean /= l.length;
  // Dim room: brighten gently, never more than 40%.
  if (mean < 115) {
    const gain = Math.min(1.4, 120 / Math.max(1, mean));
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = Math.min(255, d[i] * gain);
      d[i + 1] = Math.min(255, d[i + 1] * gain);
      d[i + 2] = Math.min(255, d[i + 2] * gain);
    }
    x.putImageData(img, 0, 0);
  }
  return c;
}

function sketch(base: HTMLCanvasElement): HTMLCanvasElement {
  const n = BASE;
  const big = canvas(n);
  const bx = ctx2d(big);
  const src = ctx2d(base).getImageData(0, 0, n, n);
  const l = luminance(src.data);
  const inv = l.map((v) => 255 - v);
  const b = blur(blur(inv, n, 4), n, 4);
  const out = bx.createImageData(n, n);
  for (let i = 0; i < l.length; i++) {
    // Colour dodge of the image over its blurred negative leaves pencil-like edges.
    let v = Math.min(255, (l[i] * 255) / Math.max(1, 256 - b[i]));
    v = 255 - (255 - v) * 1.6;
    v = Math.max(0, Math.min(255, v));
    out.data[i * 4] = Math.min(255, v * 0.99 + 3);
    out.data[i * 4 + 1] = Math.min(255, v * 0.98 + 4);
    out.data[i * 4 + 2] = Math.min(255, v * 0.95 + 9);
    out.data[i * 4 + 3] = 255;
  }
  bx.putImageData(out, 0, 0);
  return scaled(big, OUT);
}

function ink(base: HTMLCanvasElement, hex: string): HTMLCanvasElement {
  const c = scaled(base, OUT);
  const x = ctx2d(c);
  const img = x.getImageData(0, 0, OUT, OUT);
  const l = luminance(img.data);
  const sorted = Float32Array.from(l).sort();
  const lo = sorted[Math.floor(sorted.length * 0.02)], hi = sorted[Math.floor(sorted.length * 0.98)];
  const k = hexRgb(hex);
  const dark = k.map((v) => v * 0.35);
  const paper = k.map((v) => v + (255 - v) * 0.93);
  const d = img.data;
  for (let i = 0; i < l.length; i++) {
    let t = Math.max(0, Math.min(1, (l[i] - lo) / (hi - lo || 1)));
    t = t * t * (3 - 2 * t);
    for (let j = 0; j < 3; j++) {
      d[i * 4 + j] = t < 0.5 ? dark[j] + (k[j] - dark[j]) * t * 2 : k[j] + (paper[j] - k[j]) * (t - 0.5) * 2;
    }
  }
  x.putImageData(img, 0, 0);
  return c;
}

export function renderLook(base: HTMLCanvasElement, look: Look, inkHex: string): HTMLCanvasElement {
  if (look === "sketch") return sketch(base);
  if (look === "ink") return ink(base, inkHex);
  return original(base);
}

let webp: boolean | null = null;

/** Small JPEG or WebP data URL, shrinking quality (then size) until it fits. */
export function encode(c: HTMLCanvasElement): string {
  if (webp === null) webp = c.toDataURL("image/webp", 0.8).startsWith("data:image/webp");
  const type = webp ? "image/webp" : "image/jpeg";
  let src = c;
  for (let attempt = 0; attempt < 2; attempt++) {
    for (const q of [0.82, 0.72, 0.62, 0.52]) {
      const data = src.toDataURL(type, q);
      if (data.length <= MAX_CHARS) return data;
    }
    src = scaled(src, 120);
  }
  return src.toDataURL("image/jpeg", 0.45);
}
