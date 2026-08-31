import type {
  ActionRecord,
  Issue,
  Location,
  OutcomeEntry,
  Recommendation,
  Resource,
  WorkItem,
} from "./types";

export const organization = {
  name: "Acme Logistics",
  industry: "Logistics & Distribution",
  country: "Zambia",
  plan: "V1.5 — Operations",
};

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

function makeDelayAction(): ActionRecord {
  return {
    id: "act_reassign_4821",
    title: "Reassign Delivery #4821 to Truck 23",
    steps: [
      "Find available vehicle",
      "Validate capacity",
      "Reassign delivery",
      "Update schedule",
      "Notify driver",
      "Notify customer",
      "Verify completion",
    ],
    currentStep: 0,
    status: "pending_approval",
    executionMode: "approval_required",
    estimatedImpact: "Delay reduced by ~31 min · customer notified automatically",
  };
}

const recDelay: Recommendation = {
  id: "rec_delay_4821",
  title: "Reassign delivery to Truck 23",
  reason:
    "Truck 17 is delayed 31 minutes with rising engine temperature and overdue maintenance. Truck 23 is idle at the same depot with enough free capacity to take the load without affecting other scheduled stops.",
  confidence: 0.91,
  estimatedSavings: "31 min delay avoided",
  action: makeDelayAction(),
};

export const issues: Issue[] = [
  {
    id: "iss_delay_4821",
    title: "Delivery #4821 delayed — Truck 17 overheating",
    description:
      "Vehicle 17 is running 31 minutes behind schedule to Kabwe Foods. Engine temperature has climbed 18% over the last 30 minutes.",
    severity: "high",
    status: "open",
    locationId: "loc_customer_9",
    resourceId: "res_truck_17",
    workId: "wk_100",
    detectedAt: "8 minutes ago",
    evidence: [
      { label: "Engine temperature increased 18% over 30 minutes", confidence: 0.95 },
      { label: "Previous scheduled maintenance is overdue by 3 days", confidence: 0.88 },
      { label: "Coolant alert received from telematics feed", confidence: 0.82 },
      { label: "Vehicle operating under high load on route 4821", confidence: 0.77 },
    ],
    recommendation: recDelay,
  },
  {
    id: "iss_inventory_cold",
    title: "Cold storage inventory below reorder threshold",
    description:
      "Ndola Warehouse B cold storage has dropped to 17%, below the 20% reorder policy line.",
    severity: "medium",
    status: "open",
    locationId: "loc_wh_b",
    resourceId: "res_inv_cold",
    workId: "wk_101",
    detectedAt: "22 minutes ago",
    evidence: [
      { label: "Inventory level 17%, threshold 20%", confidence: 0.99 },
      { label: "Consumption rate steady over 7 days", confidence: 0.7 },
    ],
    recommendation: {
      id: "rec_reorder_cold",
      title: "Create reorder work order with supplier Coldline Ltd",
      reason:
        "Automation rule inventory.level.changed < 20% is configured to draft a reorder work order for review.",
      confidence: 0.84,
      estimatedSavings: "Stockout avoided",
      action: {
        id: "act_reorder_cold",
        title: "Create reorder work order — Cold Storage",
        steps: ["Draft purchase request", "Route to supplier", "Confirm ETA", "Update inventory"],
        currentStep: 0,
        status: "pending_approval",
        executionMode: "approval_required",
        estimatedImpact: "Prevents stockout in ~2 days",
      },
    },
  },
  {
    id: "iss_gen5",
    title: "Generator 5 overdue maintenance",
    description:
      "Generator 5 at Ndola Warehouse B is running hot and maintenance is overdue, risking unplanned downtime.",
    severity: "critical",
    status: "investigating",
    locationId: "loc_wh_b",
    resourceId: "res_gen_5",
    workId: "wk_102",
    detectedAt: "1 hour ago",
    evidence: [
      { label: "Runtime hours exceed maintenance interval by 340 hrs", confidence: 0.93 },
      { label: "Fuel consumption up 22% vs. baseline", confidence: 0.8 },
    ],
    recommendation: {
      id: "rec_gen5",
      title: "Dispatch technician Chanda M. for emergency service",
      reason:
        "Chanda M. is the nearest certified technician and is currently unassigned. Delaying service risks unplanned downtime affecting cold storage.",
      confidence: 0.87,
      estimatedSavings: "Downtime avoided",
      action: {
        id: "act_gen5",
        title: "Dispatch technician for Generator 5 service",
        steps: ["Assign technician", "Order replacement part", "Schedule service window", "Verify repair"],
        currentStep: 1,
        status: "approved",
        executionMode: "approval_required",
        estimatedImpact: "Avoids est. $3,200 unplanned downtime",
      },
    },
  },
];

export const outcomes: OutcomeEntry[] = [
  { id: "out_1", label: "Delays reduced", value: "4h 12m", detail: "This week, across 11 deliveries" },
  { id: "out_2", label: "Downtime prevented", value: "$8,400", detail: "Generator 5 + 2 other assets" },
  { id: "out_3", label: "Issues resolved by AI", value: "27", detail: "68% without escalation" },
  { id: "out_4", label: "Hours saved", value: "19.5", detail: "Manual coordination time" },
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

export function locationName(id: string): string {
  return locations.find((l) => l.id === id)?.name ?? id;
}

export function resourceName(id: string): string {
  return resources.find((r) => r.id === id)?.name ?? id;
}
