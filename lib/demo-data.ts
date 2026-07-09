/**
 * Every piece of content in the demo lives here. Nothing is fetched, nothing is
 * generated. This file exists so that anyone auditing the prototype can see, in
 * one place, exactly what is real (the interface) and what is scripted (all of this).
 *
 * The dataset is written backwards from a single moment: the roadmap says GA
 * ships in eight days, the head of engineering said three days ago that it
 * slipped two weeks, and the investor update is on Thursday. No single tool in
 * the founder's stack can see all three facts at once. Kloyya can.
 */

import { getDemoDates, longDate, shortDate } from "./dates";

export const D = getDemoDates();

export type SourceId = "gmail" | "calendar" | "notion";

export const founder = {
  name: "Maya Osei",
  role: "Cofounder & CEO",
  email: "maya@halyard.dev",
  initials: "MO",
} as const;

export const company = {
  name: "Halyard",
  pitch: "Build infrastructure for teams shipping AI products",
  stage: "Series A",
  raised: "$12M",
  lead: "Amplify Partners",
  headcount: 14,
} as const;

/* ── Connectors ──────────────────────────────────────────────────────── */

export type Connector = {
  id: SourceId;
  name: string;
  detail: string;
  account: string;
  itemCount: number;
  /** ms of fake OAuth latency — tuned so three connects land near 12s total */
  latency: number;
};

export const connectors: Connector[] = [
  {
    id: "gmail",
    name: "Gmail",
    detail: "Threads, attachments, and who actually replied",
    account: founder.email,
    itemCount: 8412,
    latency: 1200,
  },
  {
    id: "calendar",
    name: "Google Calendar",
    detail: "Meetings, attendees, and what they were about",
    account: founder.email,
    itemCount: 1136,
    latency: 1100,
  },
  {
    id: "notion",
    name: "Notion",
    detail: "Docs, roadmaps, and when they last changed",
    account: "halyard.notion.site",
    itemCount: 2935,
    latency: 1300,
  },
];

export const connectorById = Object.fromEntries(
  connectors.map((c) => [c.id, c]),
) as Record<SourceId, Connector>;

export const totalIngested = connectors.reduce((n, c) => n + c.itemCount, 0);

/** Streamed line-by-line during "Building context…". */
export const ingestLog: { source: SourceId; line: string }[] = [
  { source: "gmail", line: "Reading 8,412 threads" },
  { source: "gmail", line: "Resolving 214 people to identities" },
  { source: "calendar", line: "Reading 1,136 events" },
  { source: "calendar", line: "Linking attendees to threads" },
  { source: "notion", line: "Reading 2,935 pages" },
  { source: "notion", line: "Extracting 47 dated commitments" },
  { source: "notion", line: "Cross-checking commitments against email" },
  { source: "gmail", line: "1 contradiction found" },
];

/* ── The risk. The whole demo points here. ───────────────────────────── */

export const risk = {
  id: "risk-ga-date",
  severity: "high" as const,
  title: "Your investor update contains a launch date engineering retracted",
  summary: `The roadmap still says GA ships ${longDate(D.roadmapGA)}. Priya moved the auth migration out ${D.slipDays} days in an email three days ago, which puts GA at ${longDate(D.revisedGA)}. Nobody updated the roadmap, and the investor update is ${longDate(D.investorUpdate)}.`,
  detectedIn: "Executive Brief · paragraph 2",
  correction: {
    from: longDate(D.roadmapGA),
    to: longDate(D.revisedGA),
  },
  citations: [
    { source: "gmail" as SourceId, label: "Priya Raghavan · revised timeline", when: "3d ago" },
    { source: "notion" as SourceId, label: "Halyard Roadmap — H2", when: "19d ago" },
    { source: "calendar" as SourceId, label: "Investor Update", when: "in 3d" },
  ],
};

/* ── People ──────────────────────────────────────────────────────────── */

export const people = [
  { id: "maya", name: "Maya Osei", role: "Cofounder & CEO" },
  { id: "priya", name: "Priya Raghavan", role: "Head of Engineering" },
  { id: "daniel", name: "Daniel Cho", role: "Design" },
  { id: "ife", name: "Ife Adeyemi", role: "GTM" },
  { id: "sam", name: "Sam Whitfield", role: "Amplify Partners · Board" },
];

/* ── Source records ──────────────────────────────────────────────────── */

export const threads = [
  {
    id: "t-auth",
    from: "Priya Raghavan",
    subject: "auth migration — revised timeline",
    preview: `Pushing the auth cutover out two weeks. The token rotation work is bigger than we scoped and I'd rather not ship it hot. Realistic GA is ${shortDate(D.revisedGA)}.`,
    when: "3d ago",
    unread: false,
    critical: true,
  },
  {
    id: "t-deck",
    from: "Sam Whitfield",
    subject: "Re: board sync",
    preview: "Can you get me the update deck a day early? Want to read it properly before we talk.",
    when: "1d ago",
    unread: true,
    critical: false,
  },
  {
    id: "t-trial",
    from: "Ife Adeyemi",
    subject: "Two enterprise trials converted 🎉",
    preview: "Riverbank and Optera both signed annual. That's $148k new ARR this week.",
    when: "2d ago",
    unread: true,
    critical: false,
  },
  {
    id: "t-design",
    from: "Daniel Cho",
    subject: "design review — moving to Monday",
    preview: "Half the team is out Friday. Moving the review so we actually get a decision.",
    when: "4d ago",
    unread: false,
    critical: false,
  },
];

export const events = [
  {
    id: "e-investor",
    title: "Investor Update — Amplify",
    when: `${longDate(D.investorUpdate)} · 10:00 AM`,
    attendees: ["Maya Osei", "Sam Whitfield"],
    critical: true,
  },
  {
    id: "e-standup",
    title: "Eng standup",
    when: "Tomorrow · 9:15 AM",
    attendees: ["Priya Raghavan", "+6"],
    critical: false,
  },
  {
    id: "e-review",
    title: "Design review",
    when: "Monday · 2:00 PM",
    attendees: ["Daniel Cho", "Maya Osei"],
    critical: false,
  },
];

export const docs = [
  {
    id: "d-roadmap",
    title: "Halyard Roadmap — H2",
    excerpt: `GA — ${longDate(D.roadmapGA)}. Auth migration complete, SOC 2 Type I in hand.`,
    edited: "19d ago",
    stale: true,
  },
  {
    id: "d-update",
    title: "Investor Update — draft",
    excerpt: "Metrics look strong. Need the launch paragraph before Thursday.",
    edited: "6d ago",
    stale: false,
  },
  {
    id: "d-soc2",
    title: "SOC 2 readiness",
    excerpt: "Type I evidence collection at 91%. Auditor call booked.",
    edited: "2d ago",
    stale: false,
  },
];

/* ── Dashboard metrics ───────────────────────────────────────────────── */

export const stats = [
  { label: "ARR", value: "$1.42M", delta: "+18.4%", positive: true },
  { label: "Net retention", value: "131%", delta: "+6pts", positive: true },
  { label: "Weekly active teams", value: "2,847", delta: "+11.2%", positive: true },
  { label: "Runway", value: "19 mo", delta: "-1 mo", positive: false },
];

/** Context items ingested per day, for the dashboard area chart. */
export const ingestSeries = [
  { day: "Mon", items: 1180 },
  { day: "Tue", items: 1642 },
  { day: "Wed", items: 1490 },
  { day: "Thu", items: 2130 },
  { day: "Fri", items: 2610 },
  { day: "Sat", items: 940 },
  { day: "Sun", items: 1210 },
];

/* ── Daily brief ─────────────────────────────────────────────────────── */

export const dailyBrief = [
  {
    id: "b-risk",
    heading: "The launch date in your roadmap is wrong",
    body: `Priya moved the auth cutover out two weeks. The roadmap still says ${shortDate(D.roadmapGA)}. Your investor update is ${longDate(D.investorUpdate)}.`,
    citations: [
      { source: "gmail" as SourceId, label: "revised timeline", when: "3d ago" },
      { source: "notion" as SourceId, label: "Roadmap — H2", when: "19d ago" },
    ],
    critical: true,
  },
  {
    id: "b-sam",
    heading: "Sam wants the deck a day early",
    body: "He asked yesterday and hasn't been answered. The update is Thursday, so he's asking for Wednesday.",
    citations: [{ source: "gmail" as SourceId, label: "Re: board sync", when: "1d ago" }],
    critical: false,
  },
  {
    id: "b-arr",
    heading: "$148k new ARR closed this week",
    body: "Riverbank and Optera both signed annual contracts. This is the strongest number in the update.",
    citations: [{ source: "gmail" as SourceId, label: "Ife Adeyemi", when: "2d ago" }],
    critical: false,
  },
  {
    id: "b-soc2",
    heading: "SOC 2 evidence is at 91%",
    body: "On track, and the auditor call is booked. Worth one line in the update.",
    citations: [{ source: "notion" as SourceId, label: "SOC 2 readiness", when: "2d ago" }],
    critical: false,
  },
];

/* ── Executive brief ─────────────────────────────────────────────────── */

export const execBrief = {
  title: `Investor Update — ${company.lead}`,
  meta: `Prepared for ${longDate(D.investorUpdate)} · ${company.name}`,
  sections: [
    {
      id: "s-summary",
      heading: "Summary",
      body: `We closed $148k of new ARR this week, taking us to $1.42M with 131% net retention. Two enterprise trials converted to annual contracts. Headcount is steady at ${company.headcount} and runway is 19 months.`,
      citations: [
        { source: "gmail" as SourceId, label: "Ife Adeyemi", when: "2d ago" },
        { source: "notion" as SourceId, label: "Metrics", when: "1d ago" },
      ],
    },
    {
      id: "s-launch",
      heading: "Launch",
      /** The paragraph that carries the wrong date. The risk scan targets this. */
      body: `Auth migration is the last blocker before GA. We are tracking to ship on ${longDate(D.roadmapGA)} with SOC 2 Type I evidence in hand.`,
      corrected: `Auth migration is the last blocker before GA. Engineering revised the cutover ${D.slipDays} days out, so GA now lands ${longDate(D.revisedGA)}. SOC 2 Type I evidence collection is at 91%.`,
      citations: [{ source: "notion" as SourceId, label: "Roadmap — H2", when: "19d ago" }],
      correctedCitations: [
        { source: "gmail" as SourceId, label: "Priya · revised timeline", when: "3d ago" },
        { source: "notion" as SourceId, label: "SOC 2 readiness", when: "2d ago" },
      ],
    },
    {
      id: "s-asks",
      heading: "Asks",
      body: "Two intros to platform engineering leaders at Series C+ companies. One senior infra hire — we are close on a candidate from Fly.io.",
      citations: [{ source: "notion" as SourceId, label: "Hiring", when: "5d ago" }],
    },
  ],
};

/* ── AI chat ─────────────────────────────────────────────────────────── */

export type Citation = { source: SourceId; label: string; when: string };

export type CannedAnswer = {
  question: string;
  answer: string;
  citations: Citation[];
};

export const suggestedQuestions = [
  "What should I know before the investor update?",
  "Who owns the auth migration and what's blocking it?",
  "What changed this week?",
];

export const cannedAnswers: CannedAnswer[] = [
  {
    question: suggestedQuestions[0],
    answer: `Three things.\n\nYour numbers are strong and they're the easy part: $148k of new ARR closed this week from Riverbank and Optera, putting you at $1.42M with 131% net retention.\n\nSam asked for the deck a day early and hasn't heard back. The update is ${longDate(D.investorUpdate)}, so he's expecting it Wednesday.\n\nThe one you need to fix first: your roadmap says GA ships ${longDate(D.roadmapGA)}, but Priya pushed the auth cutover out ${D.slipDays} days three days ago. The roadmap hasn't been touched in 19 days. If you present from it, you'll give investors a date engineering has already retracted.`,
    citations: [
      { source: "gmail", label: "Ife Adeyemi · trials converted", when: "2d ago" },
      { source: "gmail", label: "Sam Whitfield · board sync", when: "1d ago" },
      { source: "gmail", label: "Priya · revised timeline", when: "3d ago" },
      { source: "notion", label: "Halyard Roadmap — H2", when: "19d ago" },
    ],
  },
  {
    question: suggestedQuestions[1],
    answer: `Priya Raghavan owns it.\n\nThe blocker is token rotation — she scoped it smaller than it turned out to be, and she'd rather delay than ship it hot. She moved the cutover ${D.slipDays} days, which puts GA at ${longDate(D.revisedGA)} rather than ${longDate(D.roadmapGA)}.\n\nShe wrote this three days ago and nobody has updated the roadmap since.`,
    citations: [
      { source: "gmail", label: "Priya · revised timeline", when: "3d ago" },
      { source: "notion", label: "Halyard Roadmap — H2", when: "19d ago" },
    ],
  },
  {
    question: suggestedQuestions[2],
    answer: `Two enterprise trials converted to annual contracts — Riverbank and Optera, $148k combined.\n\nAuth migration slipped ${D.slipDays} days, which moves GA to ${longDate(D.revisedGA)}.\n\nSOC 2 Type I evidence collection reached 91% and the auditor call is booked. Design review moved to Monday because half the team is out Friday.`,
    citations: [
      { source: "gmail", label: "Ife Adeyemi", when: "2d ago" },
      { source: "gmail", label: "Priya · revised timeline", when: "3d ago" },
      { source: "notion", label: "SOC 2 readiness", when: "2d ago" },
      { source: "calendar", label: "Design review", when: "Monday" },
    ],
  },
];

/** Shown when the question falls outside the scripted dataset. Honest, not cute. */
export const fallbackAnswer =
  "I can only answer from the context you've connected. This prototype is loaded with a sample inbox, calendar, and Notion workspace — try one of the suggested questions.";

export function findAnswer(input: string): CannedAnswer | null {
  const q = input.toLowerCase().trim();
  if (!q) return null;

  const exact = cannedAnswers.find((a) => a.question.toLowerCase() === q);
  if (exact) return exact;

  const keyed: [string[], number][] = [
    [["investor", "update", "board", "prepare", "know before"], 0],
    [["auth", "migration", "owns", "blocking", "blocker", "priya"], 1],
    [["changed", "this week", "summary", "summarize", "recap"], 2],
  ];

  for (const [keys, idx] of keyed) {
    if (keys.some((k) => q.includes(k))) return cannedAnswers[idx];
  }
  return null;
}

/* ── Knowledge graph ─────────────────────────────────────────────────── */

export type GraphNodeKind = "core" | "source" | "person" | "doc" | "event" | "risk";

export const graphNodes: {
  id: string;
  kind: GraphNodeKind;
  label: string;
  sub?: string;
}[] = [
  { id: "core", kind: "core", label: "Halyard", sub: `${totalIngested.toLocaleString()} items` },

  { id: "src-gmail", kind: "source", label: "Gmail", sub: "8,412 threads" },
  { id: "src-calendar", kind: "source", label: "Calendar", sub: "1,136 events" },
  { id: "src-notion", kind: "source", label: "Notion", sub: "2,935 pages" },

  { id: "p-priya", kind: "person", label: "Priya Raghavan", sub: "Head of Engineering" },
  { id: "p-sam", kind: "person", label: "Sam Whitfield", sub: "Amplify · Board" },
  { id: "p-ife", kind: "person", label: "Ife Adeyemi", sub: "GTM" },

  { id: "doc-roadmap", kind: "doc", label: "Roadmap — H2", sub: "edited 19d ago" },
  { id: "doc-soc2", kind: "doc", label: "SOC 2 readiness", sub: "edited 2d ago" },

  { id: "ev-investor", kind: "event", label: "Investor Update", sub: longDate(D.investorUpdate) },

  { id: "risk", kind: "risk", label: "Date conflict", sub: "GA slipped, roadmap stale" },
];

export const graphEdges: { source: string; target: string; animated?: boolean }[] = [
  { source: "core", target: "src-gmail" },
  { source: "core", target: "src-calendar" },
  { source: "core", target: "src-notion" },

  { source: "src-gmail", target: "p-priya" },
  { source: "src-gmail", target: "p-sam" },
  { source: "src-gmail", target: "p-ife" },
  { source: "src-notion", target: "doc-roadmap" },
  { source: "src-notion", target: "doc-soc2" },
  { source: "src-calendar", target: "ev-investor" },

  { source: "p-sam", target: "ev-investor" },
  { source: "p-priya", target: "risk", animated: true },
  { source: "doc-roadmap", target: "risk", animated: true },
  { source: "ev-investor", target: "risk", animated: true },
];
