# Doodle Battle

Real-time multiplayer drawing and guessing for 2–12 players, on any laptop, iPad or phone.
One player draws a secret word, everyone else races to guess it in the chat, and the
fastest guessers score the most. There's also a solo practice mode for warming up on your own.

## Deploy

You need Node 20+ and a `.env` file in this folder:

```
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-token        # "Edit Cloudflare Workers" template
```

Then run:

```
npm run ship
```

This installs the tools, builds the site and deploys it. Wrangler prints the address at the end,
something like `https://doodle-battle.<your-subdomain>.workers.dev`. After the first time,
`npm run deploy` is enough.

If the deploy asks you to register a `workers.dev` subdomain, open **Workers & Pages** in the
Cloudflare dashboard once, then run it again.

## Try changes on a preview first

```
npm run preview
```

This deploys a separate copy called `doodle-battle-preview` to
`https://doodle-battle-preview.<your-subdomain>.workers.dev`, with its own rooms, so the real game is
untouched. When it looks right, `npm run deploy` ships the same code to the real game. (Cloudflare's
built-in version previews don't work for Workers that use Durable Objects, which is why this is a
separate copy.)

## Your own domain (doodlebattle.in)

The game already handles the domain: `www.doodlebattle.in` forwards to `doodlebattle.in`, and the
`workers.dev` address keeps working as a backup. Connecting it is a one-time job in Cloudflare:

1. **Add the domain to Cloudflare.** Dashboard → **Add a domain** → `doodlebattle.in` → the **Free** plan.
   Cloudflare shows two nameservers (like `ada.ns.cloudflare.com`).
2. **Point the domain at Cloudflare.** At the company you bought it from, replace the domain's
   nameservers with those two. This takes from a few minutes to a few hours; Cloudflare emails you
   when the domain is active.
3. **Clear out parked records.** In Cloudflare → `doodlebattle.in` → **DNS**, delete any `A`, `AAAA` or
   `CNAME` records for `doodlebattle.in` and `www` that were copied over from the registrar's parking page.
4. **Attach it to the game.** **Workers & Pages** → `doodle-battle` → **Settings** → **Domains & Routes** →
   **Add** → **Custom domain** → `doodlebattle.in`. Do it again for `www.doodlebattle.in`.
   Cloudflare creates the records and the HTTPS certificate itself.

## Play locally

```
npm run dev
```

Opens the real Cloudflare runtime on <http://localhost:8787>. To play from your phone on the
same Wi-Fi, use your computer's local IP instead of `localhost`.

## How it works

- **One server per room.** Each room is a Cloudflare Durable Object: a tiny single-threaded
  server that owns the word, the timers and the scores. Guessers' devices never receive the
  word until the reveal, so nobody can peek in the browser's developer tools.
- **One address.** The same Worker serves the website (`public/`) and the game (`/api`, `/ws`).
  No database, no accounts.
- **Live drawing.** The drawer sees their own lines instantly. Points go out in batches about
  every 100 ms on a shared 1200×900 canvas, so every device shows the same picture at its own
  size. Viewers spread each batch over the next 100 ms, about a fifth of a second behind the
  drawer, so lines flow smoothly.
- **Same countdown everywhere.** The server sends one end time per phase. Each device measures
  its clock offset from the server with pings, so timers match without per-second messages.
- **Reconnecting.** The client reconnects on its own with growing gaps between tries (up to 8 s,
  easing off to 30 s after two minutes and a minute after ten, or in a background tab), sends a
  heartbeat every 10 s to catch dead mobile connections, and reconnects at once when the phone
  wakes or the network returns. Cloudflare answers the heartbeat itself, without waking the room.
  Every drawing message is numbered, and a gap triggers a full resync. Seats are held for
  3 minutes, so a refresh or a dropped connection costs nothing.
- **Stepping away.** When the page goes to the background (switching apps on a phone), the client
  tells the room. You show as "Away" with a moon, keep your seat and score, and your drawing turn is
  skipped if it comes up. The host role never moves during a game; in the lobby it passes only after
  the host has been away for a minute, and the room's creator gets it back on return. Connections that
  go silent for 90 s are dropped so a frozen phone can't hold up a turn.
- **Survives restarts.** Room state is saved to the Durable Object's storage. After a deploy or
  restart, devices reconnect and the turn carries on. Short waits run on in-memory timers, each
  backed by a durable alarm a few seconds later that only fires if the room restarted in between.
  Waits over 90 s use the alarm alone.

## Words and guessing

- **2,300+ English words in 14 categories** (Animals, Food & Drink, Movies & TV, Brands and more), each
  tagged easy, medium or hard. The host picks a difficulty and either one category or all of them, and
  can add their own words. On "mixed", the drawer always gets one easy, one medium and one hard word.
- **Easy and medium words show their category** next to the blanks, like "ANIMALS".
- **Spelling slips count.** `girafe`, `elefant`, `baot` and `spider man` all score. Short words need to be
  exact, except for swapped letters (`dgo`). A different real word (`goat` for `boat`) never counts.
- **Private nudges by meaning.** A synonym is *very close* (`puppy` for dog), as is part of a longer answer
  (`lion` for The Lion King) or a near-miss spelling. A related idea is *close* (`bone` for dog). Only the
  guesser sees these.
- **End my turn:** the drawer can skip from the menu. Clear wipes the page in one tap, and undo brings it back.

## Characters and photos

Everyone picks one of 48 characters (animals, sea creatures, fantasy, food and nature), shown in a thick
ring of their colour. Tap the big avatar to open the picker, or use the arrows. The camera badge takes a
photo instead: a round viewfinder, a 3-2-1 countdown, then a look (Original, Sketch or Ink, which tints the
photo in your colour), and Use photo, Retake or Use a character instead. There's no gallery and no cropping.

- **This visit only:** your photo is kept in the browser tab (sessionStorage), so a refresh keeps it and
  closing the tab forgets it. It's shrunk to about 160x160 (under 40 KB) on the device first.
- **In a room:** each photo is sent to the others once and kept in the room's storage only while you're in
  it. It's deleted when you remove it, leave, are removed, or the room closes.
- **Player photos switch:** the host can turn photos off in the lobby. Every photo in the room is deleted
  and everyone sees characters until it's turned back on.

## Practice

**Practice drawing** on the home screen is for one person warming up. Pick a category, difficulty, draw
time (or no timer) and how many words (or keep going). Choose one of three words, or tap **New words**, then
draw with the same canvas, tools, timer and sounds as the real game. **Done** finishes a drawing early and
**Skip** passes on a word. The clock pauses if you switch apps. At the end you get all your drawings, each
with a **Save** button.

Practice runs in the browser. The only thing it fetches is the word list (words and categories, without the
guess hints), once, and it keeps a copy, so practice also starts without a connection after the first time.
It doesn't use the game's free-tier allowance.

## Scoring

| Who | Points |
|---|---|
| Guesser | Order points (1st 200, 2nd 160, 3rd 130, 4th 110, then 100) plus up to 100 for speed, counted from the start of drawing |
| Drawer | 300 × the share of active players who guessed, × 1.25 for a medium word and × 1.5 for a hard one |

The speed bonus is measured from when drawing began, so it isn't cut short when the race shrinks the
clock. Players who are away don't count against the drawer. The bigger prize for harder words gives a
player who is behind a real gamble to catch up.

**The race:** the first correct guess drops the clock to 30 seconds for everyone (if more was left), with
a soft tick-tock every second until the end, and any letter hints still to come fold into one at 10
seconds left. When every active guesser has the word, the turn ends straight away with "Everyone got it!".

The first correct guesser always scores the most. After every turn a leaderboard shows the points
each player earned and slides everyone into their new position.

## Free tier

Cloudflare's free plan allows, each day, 100,000 Durable Object requests, 13,000 GB-seconds of
room time and 100,000 rows written to storage. Messages sent out to players are free, incoming ones
count 20 to a request, and heartbeats are answered without waking the room, so a full 8-player game
uses roughly 500 requests. Room time runs out first: a room stays awake for the whole game, which
works out to roughly 50 full 8-player games a day (more for shorter games). A quiet lobby sleeps
between messages. Limits reset at 00:00 UTC. The $5/month Workers Paid plan removes this
ceiling if you ever need it.

To see where a room's requests go, each room logs one `room_tally` line when a game ends and when
the room closes. It lists incoming messages by type, WebSocket connects and closes, alarms that
fired, HTTP lookups, wake-ups from storage, and a rough billed total. Find these lines in the
Cloudflare dashboard under Workers & Pages → doodle-battle → Logs (search for `room_tally`), or
watch them live with `npm run logs`. The dashboard's Requests chart counts every incoming message
as one request; billing counts 20 messages as one.

## Project layout

```
public/             website: index.html, styles.css, icons (app.js is built into public/assets)
src/shared/         protocol types, scoring and guess matching, word lists, practice word picking
src/server/room.ts  the game engine (no platform code)
src/server/worker.ts  Cloudflare Worker + Durable Object wrapper
src/client/         browser app: connection, canvas, screens (screens/practice.ts is solo practice)
dev/server.ts       a Bun stand-in for Cloudflare used in tests (adds latency, drops sockets)
tests/              unit tests (Bun) and multi-device browser tests (Playwright)
```

## Tests

The tests use [Bun](https://bun.sh) and [Playwright](https://playwright.dev) (install it with
`npm i -g playwright && npx playwright install chromium`, or point `PW_PATH` at an existing copy):

```
bun test                                  # engine, rules and the Durable Object wrapper
FAST=1 bun dev/server.ts &                # local server with short timers
node tests/e2e.mjs                        # laptop + iPad + phone play a full game
node tests/e2e-net.mjs                    # dropped, frozen and offline connections, server restart
node tests/e2e-v2.mjs                     # categories, nudges, leaderboard, end turn, phone keyboard layout
node tests/e2e-away.mjs                   # stepping away, host role, phone home screen and banner
node tests/e2e-practice.mjs               # practice on laptop, iPad and phones, upright and sideways
LAG=150 FAST=1 bun dev/server.ts          # add 150 ms each way to test under latency
```

## Troubleshooting

- **`Authentication error` on deploy:** the token needs the *Edit Cloudflare Workers* template
  (or *Workers: Admin* in the newer layout) and must include your account.
- **`Please reload` in the game:** the site was updated mid-game. Reloading picks up the new
  version and keeps your seat.
- **Logs:** `npm run logs` streams live logs from the deployed Worker.
