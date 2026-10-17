import { DRAW_TIMES, INKS, LIMITS, type Settings, type View } from "../../shared/protocol";
import { CATEGORIES } from "../../shared/categories";
import { app, inviteLink, isHost, me, send, toast } from "../app";
import { avatarHtml } from "../avatar";
import { mountChat } from "../chat";
import { commitPhoto } from "../roomphoto";
import { mountProfile, profileName, renderProfile } from "../profile";
import { $, $$, copyText, esc } from "../util";

const CROWN = `<svg class="crown" viewBox="0 0 24 24" width="16" height="16" aria-label="Host"><path d="M3 18h18l-1.5-10-5 4L12 5l-2.5 7-5-4Z" fill="currentColor"/></svg>`;

let customTimer = 0;

export function initLobby(onLeave: () => void) {
  $("#copyLink").addEventListener("click", async () => {
    const ok = await copyText(inviteLink(), $<HTMLInputElement>("#copyFallback"));
    toast(ok ? "Invite link copied" : "Copy the link from the box below");
  });

  $("#lobbyLeave").addEventListener("click", onLeave);

  for (const st of $$(".stepper", $("#settings"))) {
    st.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>(".stepbtn");
      if (!b || !app.view || !isHost()) return;
      const key = st.dataset.key as keyof Settings;
      const d = Number(b.dataset.d);
      const s = app.view.settings;
      let patch: Partial<Settings> = {};
      if (key === "drawTime") {
        const i = DRAW_TIMES.indexOf(s.drawTime as (typeof DRAW_TIMES)[number]);
        const next = DRAW_TIMES[Math.min(DRAW_TIMES.length - 1, Math.max(0, i + d))];
        patch = { drawTime: next };
      } else if (key === "rounds" || key === "maxPlayers" || key === "hints") {
        patch = { [key]: (s[key] as number) + d };
      }
      send({ t: "settings", s: patch });
    });
  }
  $("#diffSeg").addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
    if (!b || !isHost()) return;
    send({ t: "settings", s: { difficulty: b.dataset.v as Settings["difficulty"] } });
  });
  const custom = $<HTMLTextAreaElement>("#customWords");
  custom.addEventListener("input", () => {
    if (!isHost()) return;
    clearTimeout(customTimer);
    customTimer = window.setTimeout(() => send({ t: "settings", s: { customWords: custom.value } }), 450);
  });
  custom.addEventListener("blur", () => {
    if (!isHost()) return;
    clearTimeout(customTimer);
    if (app.view && custom.value !== app.view.settings.customWords) send({ t: "settings", s: { customWords: custom.value } });
  });
  const cat = $<HTMLSelectElement>("#categorySel");
  cat.innerHTML = `<option value="all">All categories</option>${CATEGORIES.map((c) => `<option value="${c.id}">${c.label}</option>`).join("")}`;
  cat.addEventListener("change", () => {
    if (!isHost()) return;
    send({ t: "settings", s: { category: cat.value } });
  });
  $<HTMLInputElement>("#photosOn").addEventListener("change", (e) => {
    if (!isHost()) return;
    send({ t: "settings", s: { photos: (e.target as HTMLInputElement).checked } });
  });
  $<HTMLInputElement>("#customOnly").addEventListener("change", (e) => {
    if (!isHost()) return;
    send({ t: "settings", s: { customOnly: (e.target as HTMLInputElement).checked } });
  });

  $("#startBtn").addEventListener("click", () => {
    if (!send({ t: "start" })) toast("You're offline. Try again when you're reconnected.", true);
  });

  $("#lobbyPlayers").addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>(".kick");
    if (!b) return;
    if (b.classList.contains("armed")) {
      send({ t: "kick", pid: b.dataset.pid! });
      return;
    }
    b.classList.add("armed");
    b.textContent = "Remove?";
    setTimeout(() => {
      b.classList.remove("armed");
      b.textContent = "Remove";
    }, 2800);
  });

  $("#profileSave").addEventListener("click", () => {
    const name = profileName();
    if (!name) {
      toast("Pick a name first", true);
      return;
    }
    send({ t: "profile", name, color: app.profile.color, face: app.profile.face });
    commitPhoto();
    ($("#meEdit") as HTMLDetailsElement).open = false;
  });
  $("#meEdit").addEventListener("toggle", () => {
    const m = me();
    if (($("#meEdit") as HTMLDetailsElement).open && m) {
      app.profile.name = m.name;
      app.profile.color = m.color;
      app.profile.face = m.face;
      renderProfile();
    }
  });
}

export function showLobby() {
  mountChat("#lobbyChat");
  mountProfile("#lobbyProfile");
}

export function renderLobby(v: View) {
  $("#lobbyCode").textContent = v.code;
  const connected = v.players.filter((p) => !p.away).length;
  $("#lobbyCount").textContent = `${v.players.length} of ${v.settings.maxPlayers}`;
  const host = isHost();

  $("#lobbyPlayers").innerHTML = v.players
    .map((p) => {
      const mine = p.id === v.you;
      const status = p.away && !mine ? "Away" : mine ? "You" : p.id === v.host ? "Host" : "Ready";
      return `<li class="prow${mine ? " me" : ""}${p.away && !mine ? " off" : ""}" style="--pc:${INKS[p.color]}">
        ${avatarHtml(p, 36)}
        <div><span class="pname"><span>${esc(p.name)}</span>${p.id === v.host ? CROWN : ""}</span><span class="pmeta">${status}</span></div>
        <div class="pside">${host && !mine ? `<button type="button" class="kick" data-pid="${esc(p.id)}">Remove</button>` : ""}</div>
      </li>`;
    })
    .join("");

  // Settings
  const s = v.settings;
  const set = $("#settings");
  set.classList.toggle("readonly", !host);
  const hostName = v.players.find((p) => p.id === v.host)?.name ?? "the host";
  $("#hostNote").textContent = host ? "You're the host" : `Set by ${hostName}`;
  const val = (key: string, text: string, min: boolean, max: boolean) => {
    const st = set.querySelector<HTMLElement>(`.stepper[data-key="${key}"]`)!;
    st.querySelector("[data-val]")!.textContent = text;
    const [minus, plus] = st.querySelectorAll<HTMLButtonElement>(".stepbtn");
    minus.disabled = !host || min;
    plus.disabled = !host || max;
  };
  val("rounds", String(s.rounds), s.rounds <= LIMITS.minRounds, s.rounds >= LIMITS.maxRounds);
  val("drawTime", `${s.drawTime}s`, s.drawTime <= DRAW_TIMES[0], s.drawTime >= DRAW_TIMES[DRAW_TIMES.length - 1]);
  val("maxPlayers", String(s.maxPlayers), s.maxPlayers <= Math.max(LIMITS.minPlayers, v.players.length), s.maxPlayers >= LIMITS.maxPlayers);
  val("hints", s.hints === 0 ? "Off" : String(s.hints), s.hints <= 0, s.hints >= LIMITS.maxHints);
  for (const b of $$("button", $("#diffSeg"))) {
    b.setAttribute("aria-checked", String(b.dataset.v === s.difficulty));
    b.tabIndex = host ? 0 : -1;
  }
  const cat = $<HTMLSelectElement>("#categorySel");
  cat.value = s.category;
  cat.disabled = !host;
  const onlyMine = s.customOnly && v.customCount >= LIMITS.customOnlyMin;
  cat.closest(".setting")!.classList.toggle("muted", onlyMine);
  const custom = $<HTMLTextAreaElement>("#customWords");
  custom.readOnly = !host;
  if (document.activeElement !== custom) custom.value = s.customWords;
  custom.placeholder = host ? "office party, our dog Max, beach trip" : "No custom words";
  const photos = $<HTMLInputElement>("#photosOn");
  photos.checked = s.photos !== false;
  photos.disabled = !host;
  const only = $<HTMLInputElement>("#customOnly");
  only.checked = s.customOnly;
  only.disabled = !host;
  $("#customHint").textContent =
    v.customCount >= LIMITS.customOnlyMin
      ? `(${v.customCount} words)`
      : `(needs at least ${LIMITS.customOnlyMin}, you have ${v.customCount})`;

  // Start
  const start = $<HTMLButtonElement>("#startBtn");
  start.hidden = !host;
  start.disabled = connected < 2;
  $("#startHint").textContent = host
    ? connected < 2
      ? "Share the link. You need at least one more player to start."
      : `${connected} players ready. Start when everyone's in.`
    : `Waiting for ${hostName} to start the game.`;
}
