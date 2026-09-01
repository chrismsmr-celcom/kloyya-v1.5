import type {
  Location,
  Resource,
  WorkItem,
} from "./types";

export const organization = {
  name: "Acme Logistics",
  industry: "Logistics & Distribution",
  country: "Zambia",
  plan: "V1.5 — Operations",
};

// NOTE: `locations`, `resources`, `work` et `trend` restent des données de
// démonstration : le schema Supabase actuel (voir app/api/dashboard/route.ts)
// n'a pas de tables `locations` / `resources` / `work_items` / `trends`.
// `issues` et `outcomes` sont désormais chargés depuis /api/dashboard via
// lib/store.tsx — voir DemoStoreProvider.

export const locations: Location[] = [
  {
    id: "loc_depot_a",
    name: "Lusaka Depot A",
    type: "depot",
    city: "Lusaka",
    country: "ZM",
    activeWork: 14,
    openIssues: 2,
    health: 88,
  },
  {
    id: "loc_wh_b",
    name: "Ndola Warehouse B",
    type: "warehouse",
    city: "Ndola",
    country: "ZM",
    activeWork: 9,
    openIssues: 1,
    health: 93,
  },
  {
    id: "loc_customer_9",
    name: "Customer Site — Kabwe Foods",
    type: "customer_location",
    city: "Kabwe",
    country: "ZM",
    activeWork: 3,
    openIssues: 1,
    health: 76,
  },
  {
    id: "loc_office",
    name: "Head Office",
    type: "office",
    city: "Lusaka",
    country: "ZM",
    activeWork: 5,
    openIssues: 0,
    health: 97,
  },
];

export const resources: Resource[] = [
  {
    id: "res_truck_17",
    name: "Truck 17",
    type: "vehicle",
    status: "active",
    locationId: "loc_depot_a",
    health: 64,
    metrics: [
      { label: "Speed", value: "42 km/h" },
      { label: "Fuel", value: "58%" },
      { label: "Engine temp", value: "+18% (30 min)" },
    ],
    recentEvents: [
      "vehicle.delay.detected — 8 min ago",
      "vehicle.location.updated — 12 min ago",
      "maintenance.overdue — 3 days",
    ],
  },
  {
    id: "res_truck_23",
    name: "Truck 23",
    type: "vehicle",
    status: "idle",
    locationId: "loc_depot_a",
    health: 96,
    metrics: [
      { label: "Speed", value: "0 km/h" },
      { label: "Fuel", value: "91%" },
      { label: "Capacity free", value: "1,240 kg" },
    ],
    recentEvents: ["work.completed — 40 min ago", "vehicle.location.updated — 2 min ago"],
  },
  {
    id: "res_driver_mutale",
    name: "Mutale B. (Driver)",
    type: "driver",
    status: "active",
    locationId: "loc_depot_a",
    health: 100,
    metrics: [
      { label: "Shift", value: "6h 20m" },
      { label: "Deliveries today", value: "9" },
    ],
    recentEvents: ["work.assigned — 8 min ago"],
  },
  {
    id: "res_gen_5",
    name: "Generator 5",
    type: "machine",
    status: "maintenance",
    locationId: "loc_wh_b",
    health: 41,
    metrics: [
      { label: "Runtime hours", value: "3,204" },
      { label: "Fuel consumption", value: "+22%" },
    ],
    recentEvents: ["machine.temperature.high — 1h ago", "issue.detected — 1h ago"],
  },
  {
    id: "res_inv_cold",
    name: "Cold Storage Inventory",
    type: "inventory",
    status: "active",
    locationId: "loc_wh_b",
    health: 82,
    metrics: [
      { label: "Level", value: "17%" },
      { label: "Reorder threshold", value: "20%" },
    ],
    recentEvents: ["inventory.level.low — 22 min ago"],
  },
  {
    id: "res_wh_b",
    name: "Ndola Warehouse B",
    type: "warehouse",
    status: "active",
    locationId: "loc_wh_b",
    health: 90,
    metrics: [{ label: "Utilization", value: "74%" }],
    recentEvents: ["work.completed — 1h ago"],
  },
];

export const work: WorkItem[] = [
  {
    id: "wk_100",
    title: "Delivery #4821 — Kabwe Foods",
    type: "delivery",
    status: "blocked",
    priority: "high",
    assignee: "Mutale B.",
    locationId: "loc_customer_9",
    resourceIds: ["res_truck_17", "res_driver_mutale"],
    etaMinutes: 45,
    delayMinutes: 31,
  },
  {
    id: "wk_101",
    title: "Reorder cold storage inventory",
    type: "work_order",
    status: "open",
    priority: "medium",
    assignee: "Unassigned",
    locationId: "loc_wh_b",
    resourceIds: ["res_inv_cold"],
  },
  {
    id: "wk_102",
    title: "Generator 5 — overdue maintenance",
    type: "work_order",
    status: "assigned",
    priority: "high",
    assignee: "Chanda M.",
    locationId: "loc_wh_b",
    resourceIds: ["res_gen_5"],
  },
  {
    id: "wk_103",
    title: "Weekly safety inspection — Depot A",
    type: "inspection",
    status: "in_progress",
    priority: "low",
    assignee: "Bwalya K.",
    locationId: "loc_depot_a",
    resourceIds: [],
  },
  {
    id: "wk_104",
    title: "Delivery #4830 — Downtown Market",
    type: "delivery",
    status: "completed",
    priority: "medium",
    assignee: "Mutale B.",
    locationId: "loc_depot_a",
    resourceIds: ["res_truck_23"],
  },
];

export const trend = [
  { day: "Mon", resolved: 6, delayMinutes: 54 },
  { day: "Tue", resolved: 9, delayMinutes: 40 },
  { day: "Wed", resolved: 7, delayMinutes: 61 },
  { day: "Thu", resolved: 11, delayMinutes: 33 },
  { day: "Fri", resolved: 14, delayMinutes: 28 },
  { day: "Sat", resolved: 8, delayMinutes: 22 },
  { day: "Sun", resolved: 5, delayMinutes: 19 },
];


export function locationName(
  locations: { id: string; name: string }[],
  id?: string,
): string {
  if (!id) return "Unassigned location";
  return locations.find((l) => l.id === id)?.name ?? id;
}


export function resourceName(
  resources: { id: string; name: string }[],
  id?: string,
): string {
  if (!id) return "Unassigned resource";
  return resources.find((r) => r.id === id)?.name ?? id;
}
