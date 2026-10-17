export const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document): T => {
  const el = root.querySelector(sel);
  if (!el) throw new Error(`Missing element ${sel}`);
  return el as T;
};

export const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document): T[] =>
  Array.from(root.querySelectorAll(sel)) as T[];

export const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

export const store = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem(key);
      return v == null ? fallback : (JSON.parse(v) as T);
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable (private mode) */
    }
  },
  del(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export function randomId(bytes = 16): string {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return btoa(String.fromCharCode(...a)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Two-tap confirmation for destructive buttons. */
export function twoTap(btn: HTMLButtonElement, confirmLabel: string, fn: () => void) {
  let armed = false;
  let t = 0;
  let label = "";
  const reset = () => {
    armed = false;
    btn.innerHTML = label;
    btn.classList.remove("armed");
  };
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (armed) {
      clearTimeout(t);
      reset();
      fn();
      return;
    }
    label = btn.innerHTML;
    armed = true;
    btn.textContent = confirmLabel;
    btn.classList.add("armed");
    t = window.setTimeout(reset, 2800);
  });
}

export async function copyText(text: string, fallbackInput?: HTMLInputElement): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    if (fallbackInput) {
      fallbackInput.value = text;
      fallbackInput.hidden = false;
      fallbackInput.select();
      try {
        return document.execCommand("copy");
      } catch {
        return false;
      }
    }
    return false;
  }
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
