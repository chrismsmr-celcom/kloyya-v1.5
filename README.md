# Kloyya — Interactive Prototype

A front-end-only demo of Kloyya's V1.5 product experience — an AI operating layer for
business operations. Built to show investors and design partners the product loop
(observe → understand → recommend → approve → act → verify → report) without a backend.

## Status: prototype, not production code

- **No backend, no database, no auth.** All data lives in `lib/demo-data.ts` and is
  mutated client-side via a React context (`lib/store.tsx`). Refreshing the page resets
  most state; org name, industry and onboarding completion persist to `localStorage`
  as a convenience, not a real persistence layer.
- **No real AI.** The "AI" chat and the industry-tailored issue in onboarding are
  keyword-matched canned responses (`app/onboarding/page.tsx`, `lib/store.tsx`), not a
  model call.
- **Payments are fake.** The card form on the pricing step accepts anything that looks
  card-shaped and never talks to a payment processor.

Treat this as a clickable spec for the real product, not a codebase to extend feature
by feature — the ERD/API design this UI is modeled on lives outside this repo.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 ·
Framer Motion · Recharts · lucide-react

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint    # eslint (react-hooks / react-compiler rules included)
```

## Structure

```
app/
  page.tsx                  Splash screen
  onboarding/                7–9 step signup flow (varies by business type):
                              business info → locations lookup → connect sources →
                              describe business → "learning" scan → first issue
                              resolved → autonomy permissions → plan → payment → ready
  (app)/                     Main product, behind the sidebar/topbar shell
    command-center/          Home dashboard: health, priorities, outcomes
    issues/[id]/             Issue → evidence → recommendation → action, with a
                              live step-by-step execution animation on approval
    approvals/                Human Approval Center
    work/                    Kanban-style work board
    locations/[id]/          Sites
    resources/[id]/          Vehicles, machines, inventory, etc.
    ai/                      Chat interface (canned, keyword-matched replies)
    outcomes/                 Business-impact reporting + trend chart

components/
  shell/                     Sidebar, topbar, toaster
  onboarding/
    primitives.tsx            Shared step chrome (Step, Eyebrow, Title, NextButton)
    scan-step.tsx              The "learning your business" count-up step
    confetti.tsx                Onboarding success moment
  ui/                        Card, Badge, Button, StatTile, HealthRing

lib/
  types.ts                   Domain types (Issue, WorkItem, Resource, ...)
  demo-data.ts                Seed data for the main app
  onboarding-data.ts          Pure data/logic for onboarding (industries, sources,
                              issue templates, plans, permissions, formatters) —
                              kept out of app/onboarding/page.tsx on purpose
  countries.ts                Country list, city pools, timezone-based country guess
  store.tsx                   Client-side "backend" — issue/action state machine,
                              chat, org profile, autonomy level, toasts
  format.ts / utils.ts        Small display helpers
```

## Design notes

- Dark, flat, restrained — no glassmorphism/gradient-blob "AI SaaS" styling. One accent
  color used sparingly. See `app/globals.css` for the token set (`--background`,
  `--surface`, `--accent`, etc.) — swap those to reskin.
- The onboarding flow's step sequence is dynamic (`activeSteps` in
  `app/onboarding/page.tsx`): it adds a "locations" step for physical/multi-site
  business types, and a "payment" step only when a paid (non-Enterprise) plan is chosen.
