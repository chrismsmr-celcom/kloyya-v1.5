// Pure data and helpers for the onboarding wizard (app/onboarding/page.tsx).
// Kept out of the component file so the step logic isn't buried under ~300 lines
// of constants, and so none of this is re-created on every render.

import {
  BarChart3,
  CalendarCheck,
  ClipboardList,
  DollarSign,
  FileText,
  Handshake,
  Heart,
  Map as MapIcon,
  Megaphone,
  Package,
  Radio,
  Star,
  Stethoscope,
  Truck,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { AutonomyLevel, Severity } from "./types";

export const INDUSTRIES = [
  "Startups",
  "Social Media",
  "Logistics & Distribution",
  "Manufacturing",
  "Retail & E-commerce",
  "Field Services",
  "Construction",
  "Healthcare Operations",
  "Agriculture",
  "Hospitality",
  "Professional Services",
  "Technology / SaaS",
  "Education",
  "Nonprofit",
  "Other",
];

export const LOCATION_BASED_INDUSTRIES = new Set([
  "Logistics & Distribution",
  "Manufacturing",
  "Retail & E-commerce",
  "Field Services",
  "Construction",
  "Healthcare Operations",
  "Agriculture",
  "Hospitality",
]);

export function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Kept outside the component so the randomness isn't treated as a render-impure call.
export function pickLocationCount(poolLength: number): number {
  return Math.min(poolLength, 3 + Math.round(Math.random()));
}

export const SOURCE_LIBRARY: Record<string, { label: string; icon: LucideIcon }> = {
  fleet: { label: "Fleet & GPS", icon: Truck },
  inventory: { label: "Inventory & Warehouse", icon: Package },
  team: { label: "Team & Scheduling", icon: Users },
  maintenance: { label: "Maintenance & IoT", icon: Wrench },
  orders: { label: "Customer Orders", icon: Radio },
  pos: { label: "POS & Sales", icon: DollarSign },
  marketing: { label: "Marketing & Promotions", icon: Megaphone },
  content: { label: "Content Calendar", icon: FileText },
  engagement: { label: "Audience & Engagement", icon: Heart },
  campaigns: { label: "Campaigns & Ads", icon: Megaphone },
  analytics: { label: "Analytics", icon: BarChart3 },
  pipeline: { label: "Customer Pipeline (CRM)", icon: Handshake },
  roadmap: { label: "Product Roadmap", icon: MapIcon },
  finance: { label: "Finance & Runway", icon: DollarSign },
  bookings: { label: "Bookings & Reservations", icon: CalendarCheck },
  supplies: { label: "Inventory & Supplies", icon: Package },
  patients: { label: "Patient Scheduling", icon: Stethoscope },
  compliance: { label: "Compliance & Records", icon: ClipboardList },
  feedback: { label: "Guest Feedback", icon: Star },
  documents: { label: "Documents & Knowledge", icon: FileText },
  calendar: { label: "Calendar & Tasks", icon: CalendarCheck },
};

const SOURCE_SETS: Record<string, string[]> = {
  Startups: ["roadmap", "pipeline", "team", "finance", "analytics"],
  "Social Media": ["content", "engagement", "campaigns", "analytics", "team"],
  "Logistics & Distribution": ["fleet", "inventory", "team", "maintenance", "orders"],
  Manufacturing: ["maintenance", "inventory", "team", "fleet", "compliance"],
  "Retail & E-commerce": ["inventory", "orders", "pos", "marketing", "team"],
  "Field Services": ["team", "fleet", "maintenance", "orders", "calendar"],
  Construction: ["team", "fleet", "maintenance", "compliance", "documents"],
  "Healthcare Operations": ["patients", "supplies", "team", "compliance", "documents"],
  Agriculture: ["fleet", "inventory", "maintenance", "team", "orders"],
  Hospitality: ["bookings", "supplies", "team", "feedback", "pos"],
  "Professional Services": ["pipeline", "team", "calendar", "documents", "analytics"],
  "Technology / SaaS": ["roadmap", "pipeline", "analytics", "team", "documents"],
  Education: ["calendar", "team", "documents", "compliance", "analytics"],
  Nonprofit: ["pipeline", "team", "finance", "documents", "calendar"],
};
const DEFAULT_SOURCE_IDS = ["team", "calendar", "documents", "analytics", "pipeline"];

export function getSourceIds(industry: string | null): string[] {
  if (!industry) return DEFAULT_SOURCE_IDS;
  return SOURCE_SETS[industry] ?? DEFAULT_SOURCE_IDS;
}

export const SCAN_LINES = [
  "Reading what you told us about the business…",
  "Mapping locations, people and connected systems…",
  "Cross-referencing the systems you connected…",
  "Building the operational graph…",
];

type IssueTemplate = {
  severity: Severity;
  title: string;
  reason: string;
  actionTitle: string;
  steps: string[];
  impact: string;
};

const ISSUE_TEMPLATES: Record<string, IssueTemplate> = {
  delivery: {
    severity: "high",
    title: "Delivery #4821 is running 31 minutes late",
    reason:
      "The vehicle on this route is overheating and maintenance is overdue. Another vehicle is idle nearby with enough capacity to take the load.",
    actionTitle: "Reassign the delivery to the idle vehicle",
    steps: ["Find an available vehicle", "Validate capacity", "Reassign the delivery", "Notify driver", "Notify customer", "Verify completion"],
    impact: "Delay reduced by ~31 minutes · customer notified automatically",
  },
  inventory: {
    severity: "medium",
    title: "Your best-selling item is about to sell out",
    reason:
      "Stock on your top SKU has dropped below the reorder threshold, and at the current rate it typically sells out within 2 days.",
    actionTitle: "Draft a reorder with your supplier",
    steps: ["Check supplier lead time", "Draft purchase order", "Route for approval", "Confirm ETA", "Update inventory"],
    impact: "Stockout avoided · ~2 days of runway protected",
  },
  engagement: {
    severity: "medium",
    title: "Engagement dropped 38% on your last 3 posts",
    reason:
      "Posting time shifted outside your audience's peak hours, and two of the last three posts were missing a clear call to action.",
    actionTitle: "Reschedule the next post & flag the pattern",
    steps: ["Analyze posting window", "Compare against audience activity", "Reschedule upcoming post", "Notify content owner"],
    impact: "Projected engagement recovery: +25% on the next post",
  },
  pipeline: {
    severity: "medium",
    title: "Your highest-value open deal has gone quiet for 4 days",
    reason:
      "This lead hasn't been followed up since Tuesday, which is past your usual response window — and it's your largest open opportunity.",
    actionTitle: "Draft a follow-up & notify the owner",
    steps: ["Pull deal history", "Draft follow-up message", "Notify deal owner", "Set a check-in reminder"],
    impact: "Response time back under 24 hours",
  },
  patients: {
    severity: "high",
    title: "Two appointments were double-booked for tomorrow",
    reason: "A scheduling conflict was introduced when a slot was rebooked without checking existing appointments.",
    actionTitle: "Resolve the scheduling conflict",
    steps: ["Identify conflicting bookings", "Offer an alternate slot", "Notify patient", "Confirm new time"],
    impact: "Conflict resolved before it reaches the front desk",
  },
  deadline: {
    severity: "medium",
    title: "A key report is due in 2 days and hasn't been started",
    reason: "Based on the last two cycles, this deliverable usually takes 3 days — and nothing has moved on it yet.",
    actionTitle: "Draft an outline & notify the owner",
    steps: ["Pull last cycle's report as a template", "Draft outline", "Notify owner", "Set daily reminders until done"],
    impact: "Back on track to submit on time",
  },
  generic: {
    severity: "medium",
    title: "A task has sat unassigned for 2 days",
    reason: "Nothing has moved on this since it was created, and it's now the oldest open item in the queue.",
    actionTitle: "Assign it & notify the team",
    steps: ["Identify best-fit owner", "Assign task", "Notify owner", "Set a follow-up check"],
    impact: "Oldest open item cleared",
  },
};

const INDUSTRY_TEMPLATE: Record<string, string> = {
  "Logistics & Distribution": "delivery",
  Manufacturing: "generic",
  "Retail & E-commerce": "inventory",
  "Field Services": "delivery",
  Construction: "generic",
  "Healthcare Operations": "patients",
  Agriculture: "delivery",
  Hospitality: "inventory",
  Startups: "pipeline",
  "Social Media": "engagement",
  "Professional Services": "pipeline",
  "Technology / SaaS": "pipeline",
  Education: "deadline",
  Nonprofit: "deadline",
};

export function pickIssueTemplate(industry: string, description: string) {
  const d = description.toLowerCase();
  let key: string | undefined;
  if (/late|delay|truck|shipment|overheat|fleet|driver/.test(d)) key = "delivery";
  else if (/stock|inventory|sell out|restock|supply|warehouse/.test(d)) key = "inventory";
  else if (/engagement|follower|post|content|social media|campaign/.test(d)) key = "engagement";
  else if (/lead|deal|pipeline|crm|sales|customer/.test(d)) key = "pipeline";
  else if (/patient|appointment|clinic|booking/.test(d)) key = "patients";
  else if (/deadline|report|grant|funding|due/.test(d)) key = "deadline";
  if (!key) key = INDUSTRY_TEMPLATE[industry];
  return ISSUE_TEMPLATES[key ?? "generic"] ?? ISSUE_TEMPLATES.generic;
}

export type Permission = { id: string; label: string; desc: string };

export const PERMISSIONS: Permission[] = [
  { id: "reassign", label: "Reassign work when something's blocked", desc: "e.g. swap in another resource automatically" },
  { id: "notify", label: "Notify customers & team", desc: "Keep people updated without you typing it" },
  { id: "create_work", label: "Create tasks & work orders", desc: "So nothing sits idle waiting on a human" },
  { id: "reorder", label: "Reorder low inventory or supplies", desc: "Within the limits you set" },
  { id: "escalate", label: "Escalate to the right person", desc: "Route urgent issues to whoever owns them" },
];

export function levelFromPermissionCount(n: number, total: number): AutonomyLevel {
  if (n <= 0) return 1;
  if (n >= total) return 4;
  if (n >= Math.ceil(total / 2)) return 3;
  return 2;
}

export const LEVEL_LABEL: Record<AutonomyLevel, { title: string; desc: string }> = {
  0: { title: "Observe", desc: "Kloyya watches only." },
  1: { title: "Recommend", desc: "Kloyya surfaces what to do — you decide and act." },
  2: { title: "Prepare", desc: "Kloyya drafts the fix and waits for your approval." },
  3: { title: "Execute", desc: "Low-risk actions run automatically; the rest wait for you." },
  4: { title: "Autonomous", desc: "Kloyya acts within policy and reports what it did." },
};

export const STEP_META: Record<string, string> = {
  business: "Business",
  locations: "Locations",
  connect: "Connect",
  describe: "Describe",
  learn: "Learn",
  "first-save": "First save",
  control: "Control",
  plan: "Plan",
  payment: "Payment",
  ready: "Ready",
};

export type Plan = {
  id: string;
  name: string;
  monthly: number | null;
  yearly: number | null;
  badge?: string;
  features: string[];
  custom?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    monthly: 99,
    yearly: 899,
    features: ["1 location", "Up to 10 people", "AI assistant & Approval Center", "Email support"],
  },
  {
    id: "team",
    name: "Team",
    monthly: 299,
    yearly: 2788,
    badge: "Most popular",
    features: ["Up to 5 locations", "Up to 50 people", "Autonomy levels & integrations", "Priority support"],
  },
  {
    id: "business",
    name: "Business",
    monthly: 799,
    yearly: 7300,
    features: ["Unlimited locations", "Up to 250 people", "Advanced workflows & automation", "Dedicated onboarding"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthly: null,
    yearly: null,
    custom: true,
    features: ["Unlimited everything", "Custom integrations", "Dedicated success manager", "Custom contract & SLA"],
  },
];

export function yearlyMonthlyPrice(plan: Plan): number {
  return plan.yearly === null ? 0 : Math.round(plan.yearly / 12);
}

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function firstSentence(text: string, maxLen = 160): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const match = trimmed.match(/^.*?[.!?](\s|$)/);
  const candidate = match ? match[0].trim() : trimmed;
  return candidate.length > maxLen ? `${candidate.slice(0, maxLen).trim()}…` : candidate;
}
