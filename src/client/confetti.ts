// A short confetti burst drawn on a full-screen canvas.

import { reducedMotion } from "./util";

export function confetti(colors: string[], duration = 3800) {
  if (reducedMotion()) return;
  const c = document.createElement("canvas");
  c.className = "confetti";
  c.setAttribute("aria-hidden", "true");
  document.body.appendChild(c);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = window.innerWidth, h = window.innerHeight;
  c.width = w * dpr;
  c.height = h * dpr;
  const x = c.getContext("2d")!;
  x.scale(dpr, dpr);
  const count = Math.min(220, Math.round(w / 5));
  const parts = Array.from({ length: count }, (_, i) => {
    const fromLeft = i % 2 === 0;
    return {
      x: fromLeft ? -10 : w + 10,
      y: h * (0.55 + Math.random() * 0.3),
      vx: (fromLeft ? 1 : -1) * (4 + Math.random() * 9),
      vy: -(9 + Math.random() * 11),
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      s: 6 + Math.random() * 7,
      col: colors[i % colors.length],
      shape: i % 3,
    };
  });
  const start = performance.now();
  const frame = (now: number) => {
    const t = now - start;
    x.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.vy += 0.32;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      x.save();
      x.globalAlpha = Math.max(0, 1 - Math.max(0, t - duration + 900) / 900);
      x.translate(p.x, p.y);
      x.rotate(p.r);
      x.fillStyle = p.col;
      if (p.shape === 0) x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      else if (p.shape === 1) { x.beginPath(); x.arc(0, 0, p.s / 3, 0, Math.PI * 2); x.fill(); }
      else { x.beginPath(); x.moveTo(0, -p.s / 2); x.lineTo(p.s / 2, p.s / 2); x.lineTo(-p.s / 2, p.s / 2); x.fill(); }
      x.restore();
    }
    if (t < duration) requestAnimationFrame(frame);
    else c.remove();
  };
  requestAnimationFrame(frame);
}
