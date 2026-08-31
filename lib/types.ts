export type Severity = "low" | "medium" | "high" | "critical";

export type LocationType =
  | "depot"
  | "warehouse"
  | "customer_location"
  | "office";

export type Location = {
  id: string;
  name: string;
  type: LocationType;
  city: string;
  country: string;
  activeWork: number;
  openIssues: number;
  health: number;
};

export type ResourceType =
  | "vehicle"
  | "driver"
  | "machine"
  | "inventory"
  | "warehouse";

export type ResourceStatus = "active" | "idle" | "maintenance" | "offline";

export type Resource = {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  locationId: string;
  health: number;
  metrics: { label: string; value: string }[];
  recentEvents: string[];
};

export type WorkStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "blocked"
  | "completed";

export type WorkItem = {
  id: string;
  title: string;
  type: "delivery" | "work_order" | "inspection" | "incident";
  status: WorkStatus;
  priority: "low" | "medium" | "high";
  assignee: string;
  locationId: string;
  resourceIds: string[];
  etaMinutes?: number;
  delayMinutes?: number;
};

export type EvidenceItem = { label: string; confidence: number };

export type ActionStatus =
  | "pending_approval"
  | "approved"
  | "executing"
  | "completed"
  | "rejected"
  | "failed";

export type ActionRecord = {
  id: string;
  title: string;
  steps: string[];
  currentStep: number;
  status: ActionStatus;
  executionMode: "manual" | "approval_required" | "autonomous";
  estimatedImpact: string;
};

export type Recommendation = {
  id: string;
  title: string;
  reason: string;
  confidence: number;
  estimatedSavings: string;
  action: ActionRecord;
};

export type IssueStatus = "open" | "investigating" | "resolved" | "dismissed";

export type Issue = {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: IssueStatus;
  // Pas de colonne location_id / resource_id / work_id dans le schema
  // Supabase actuel (voir app/api/dashboard/route.ts) : ces champs restent
  // optionnels tant que ces tables n'existent pas côté backend.
  locationId?: string;
  resourceId?: string;
  workId?: string;
  detectedAt: string;
  evidence: EvidenceItem[];
  recommendation: Recommendation;
};

export type OutcomeEntry = {
  id: string;
  label: string;
  value: string;
  detail: string;
};

export type AutonomyLevel = 0 | 1 | 2 | 3 | 4;

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  data?: {
    issues?: Issue[];
    actions?: ActionRecord[];
  };
};
