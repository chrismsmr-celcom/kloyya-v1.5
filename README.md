# Kloyya — prototype

One context layer across a founder's email, calendar and docs.

This repository is a **demo prototype**, not a product. The interface is real and
built to production standards. Everything behind it is scripted. See
[What is real, what is not](#what-is-real-what-is-not) — the same disclosure is
shown in-product on the Settings page.

```bash
npm install
npm run dev     # http://localhost:3000
```

---

## The demo

Nine screens, presenter-driven, one click per step, about 90 seconds end to end.

| # | Screen | Beat |
|---|--------|------|
| 1 | Landing | Six ribbons converge; the iris opens |
| 2 | Login | Prefilled — one click |
| 3 | Dashboard | Empty. There is nothing to say yet |
| 4 | Connect apps | Gmail, Calendar, Notion → **Building context…** |
| 5 | Knowledge graph | Sources, records, and one node that belongs to none of them |
| 6 | Ask Kloyya | A question answered across all three, with citations |
| 7 | Executive brief | Kloyya drafts the investor update… |
| 8 | *(risk detected)* | …then catches the launch date it just wrote |
| 9 | Dashboard | The same screen, now telling you something it couldn't before |

Settings and Daily brief sit outside the scripted path.

**The whole demo is built backwards from one moment.** The Notion roadmap says GA
ships in eight days. The head of engineering emailed three days ago that the auth
migration slipped two weeks. The investor update is Thursday. No single tool in
the stack can see all three facts at once.

Press <kbd>⌘K</kbd> / <kbd>Ctrl K</kbd> at any point to jump to any screen, skip
straight to the risk, or reset the demo. It is also the presenter's parachute.

---

## What is real, what is not

**Simulated.** Do not represent any of this as working software.

- **Authentication.** There is no auth server. Any email and password signs you
  in. `@supabase/supabase-js` is a real dependency and its types are used, but
  [`lib/auth.ts`](lib/auth.ts) resolves a hand-built session after an 800 ms
  `setTimeout` and makes no network call.
- **Gmail, Google Calendar and Notion.** No OAuth is performed. No account is
  ever read. "Authorizing" is a timer.
- **Every AI response.** Chat answers, the daily brief, the executive brief and
  the detected risk are all written in advance in
  [`lib/demo-data.ts`](lib/demo-data.ts). No model is called. The typewriter
  effect is `requestAnimationFrame` over a fixed string.
- **All content.** Metrics, threads, events, documents and people are fictional.

**Actually built.** This part is ordinary production code.

- The interface, design system, and animation
- The demo state machine ([`lib/store.ts`](lib/store.ts)) that makes the
  dashboard render differently before and after the risk is found
- Knowledge graph rendering and layout (React Flow)
- Command palette and keyboard navigation
- Responsive down to 390 px; `prefers-reduced-motion` honored throughout

### Swapping in a real backend

`lib/auth.ts` mirrors Supabase's `signInWithPassword` / `signOut` / `getSession`
signatures exactly, so making auth real is a change to that one file. Everything
else reads from `lib/demo-data.ts`.

---

## Design

The brief asked for dark mode, glassmorphism and gradient glows — which is also,
verbatim, the most common AI-generated aesthetic. So the distinctiveness had to
come from the axes the brief left free.

**The aperture.** The logo is six violet-to-blue ribbons spiraling into one
center: fragmented sources converging into a single context. It is built once, in
[`components/aperture.tsx`](components/aperture.tsx), with geometry generated
parametrically, and it appears exactly four times — the splash, the "Building
context" state (each source lights its own two ribbons as it ingests), the core
node of the graph, and the skeleton loaders, which sweep like a turning iris
rather than shimmering.

**Provenance.** Every claim Kloyya makes names the record it came from. The
mono-set source chip is a structural device, not decoration: remove it and the
answers are indistinguishable from a chatbot guessing.

**One color escapes.** The entire product lives inside the violet→blue gradient.
Amber is reserved for detected risk and appears nowhere else — not on a chart,
not on a negative KPI delta, which is why the stat tiles encode direction with an
arrow glyph instead of a color. Because nothing competes with it, the risk card
reads as an alarm without needing size or motion.

**60 fps.** Only `transform` and `opacity` are ever animated. Gradient glows are
pre-rendered pseudo-elements whose opacity animates; nothing transitions
`box-shadow` or `filter`. `backdrop-filter` is capped to the app chrome and the
command palette rather than applied to every glass card.

Type is Bricolage Grotesque (display), Geist (body) and Geist Mono (data), all
self-hosted at build time via `next/font`. One easing curve,
`cubic-bezier(0.32, 0.72, 0, 1)`, is defined in [`lib/motion.ts`](lib/motion.ts)
and nothing overrides it.

---

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion
(`motion`) · React Flow (`@xyflow/react`) · Recharts 3 · Zustand · cmdk ·
Lucide · Supabase (auth adapter, stubbed)

Routes under `app/(app)` are `force-dynamic`: every date in the demo is derived
from *now*, so the story stays true whenever it's presented. Prerendering would
freeze it to the day it was compiled.

---

## Deploying

```bash
npx vercel
```

The build fetches Google Fonts once and self-hosts them, so it needs network
access at build time but not at runtime.
