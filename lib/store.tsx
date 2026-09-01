"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type {
  ActionRecord,
  ActionStatus,
  AutonomyLevel,
  ChatMessage,
  EvidenceItem,
  Issue,
  IssueStatus,
  Location,
  OutcomeEntry,
  Recommendation,
  Resource,
  Severity,
  WorkItem,
} from "./types";

type Toast = {
  id: string;
  title: string;
  detail?: string;
};

export type OrgProfile = {
  name: string;
  industry: string;
};

type DemoStore = {
  issues: Issue[];
  work: WorkItem[];
  outcomes: OutcomeEntry[];
  locations: Location[];
  resources: Resource[];

  loadingDashboard: boolean;
  dashboardError: string | null;
  refreshDashboard: () => Promise<void>;

  autonomyLevel: AutonomyLevel;
  setAutonomyLevel: (level: AutonomyLevel) => void;

  approveAction: (issueId: string) => Promise<void>;
  rejectAction: (issueId: string) => Promise<void>;
  resolveIssue: (issueId: string) => Promise<void>;

  toasts: Toast[];
  pushToast: (title: string, detail?: string) => void;

  chat: ChatMessage[];
  sendChat: (text: string) => Promise<void>;
  chatBusy: boolean;

  orgProfile: OrgProfile;
  onboarded: boolean;

  completeOnboarding: (
    profile: OrgProfile & {
      description?: string;
    },
  ) => Promise<void>;

  resetOnboarding: () => void;
};

const DemoContext = createContext<DemoStore | null>(null);

// ---- Normalisation des lignes Supabase -> types front ----
// NB: les noms de colonnes sont déduits des routes API existantes.
// Ajuste les accès `row.xxx` si tes vraies colonnes diffèrent.

function normalizeIssue(row: any): Issue {
  const recommendationRow = Array.isArray(row.recommendations)
    ? row.recommendations[0]
    : row.recommendations;

  const actionRow = recommendationRow
    ? Array.isArray(recommendationRow.actions)
      ? recommendationRow.actions[0]
      : recommendationRow.actions
    : null;

  const steps: string[] = Array.isArray(actionRow?.action_steps)
    ? [...actionRow.action_steps]
        .sort(
          (a: any, b: any) =>
            (a.step_order ?? 0) - (b.step_order ?? 0),
        )
        .map(
          (step: any) =>
            step.description ?? step.tool_slug ?? "Step",
        )
    : [];

  const action: ActionRecord = {
    id: actionRow?.id ?? "",
    title:
      actionRow?.title ??
      recommendationRow?.title ??
      "Proposed action",
    steps,
    currentStep: actionRow?.current_step ?? 0,
    status: (actionRow?.status ?? "pending_approval") as ActionStatus,
    executionMode:
      actionRow?.execution_mode ?? "approval_required",
    estimatedImpact:
      actionRow?.estimated_impact ??
      recommendationRow?.estimated_impact ??
      "",
  };

  const recommendation: Recommendation = {
    id: recommendationRow?.id ?? "",
    title: recommendationRow?.title ?? "No recommendation yet",
    reason: recommendationRow?.reason ?? "",
    confidence: recommendationRow?.confidence ?? 0,
    estimatedSavings:
      recommendationRow?.estimated_impact ??
      recommendationRow?.estimated_savings ??
      "",
    action,
  };

  const evidence: EvidenceItem[] = Array.isArray(row.evidence)
    ? row.evidence.map((item: any) => ({
        label: item.label ?? item.description ?? "",
        confidence: item.confidence ?? 0,
      }))
    : [];

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    severity: (row.severity ?? "medium") as Severity,
    status: (row.status ?? "open") as IssueStatus,
    locationId: row.location_id ?? undefined,
    resourceId: row.resource_id ?? undefined,
    workId: row.work_item_id ?? row.work_id ?? undefined,
    detectedAt: row.created_at
      ? new Date(row.created_at).toLocaleString()
      : "just now",
    evidence,
    recommendation,
  };
}

function normalizeOutcome(row: any): OutcomeEntry {
  return {
    id: row.id,
    label: row.label ?? row.title ?? "",
    value: row.value ?? "",
    detail: row.detail ?? row.description ?? "",
  };
}

function normalizeLocation(row: any): Location {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    city: row.city ?? "",
    country: row.country ?? "",
    activeWork: row.activeWork ?? row.active_work ?? 0,
    openIssues: row.openIssues ?? row.open_issues ?? 0,
    health: row.health ?? 100,
  };
}

function normalizeResource(row: any): Resource {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    status: row.status,
    locationId: row.location_id ?? undefined,
    health: row.health ?? 100,
    metrics: Array.isArray(row.metrics) ? row.metrics : [],
    recentEvents: Array.isArray(row.recent_events)
      ? row.recent_events
      : [],
  };
}

function normalizeWorkItem(row: any): WorkItem {
  const resourceIds: string[] = Array.isArray(row.work_item_resources)
    ? row.work_item_resources
        .map((link: any) => link.resource_id)
        .filter(Boolean)
    : [];

  return {
    id: row.id,
    title: row.title,
    type: row.type,
    status: row.status,
    priority: row.priority,
    assignee: row.assignee ?? "Unassigned",
    locationId: row.location_id ?? undefined,
    resourceIds,
    etaMinutes: row.eta_minutes ?? undefined,
    delayMinutes: row.delay_minutes ?? undefined,
  };
}

export function DemoStoreProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [work, setWork] = useState<WorkItem[]>([]);
  const [outcomes, setOutcomes] = useState<OutcomeEntry[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [dashboardError, setDashboardError] = useState
    string | null
  >(null);

  const [autonomyLevel, setAutonomyLevel] =
    useState<AutonomyLevel>(2);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const [orgProfile, setOrgProfile] = useState<OrgProfile>({
    name: "",
    industry: "",
  });

  const [onboarded, setOnboarded] = useState(false);

  const timers = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const refreshDashboard = useCallback(async () => {
    setLoadingDashboard(true);
    setDashboardError(null);

    try {
      const [
        dashboardResponse,
        locationsResponse,
        resourcesResponse,
        workResponse,
      ] = await Promise.all([
        fetch("/api/dashboard", { cache: "no-store" }),
        fetch("/api/locations", { cache: "no-store" }),
        fetch("/api/resources", { cache: "no-store" }),
        fetch("/api/work", { cache: "no-store" }),
      ]);

      const [
        dashboardData,
        locationsData,
        resourcesData,
        workData,
      ] = await Promise.all([
        dashboardResponse.json(),
        locationsResponse.json(),
        resourcesResponse.json(),
        workResponse.json(),
      ]);

      if (!dashboardResponse.ok || !dashboardData.ok) {
        throw new Error(
          dashboardData.error ?? "Unable to load dashboard data",
        );
      }

      setIssues(
        Array.isArray(dashboardData.issues)
          ? dashboardData.issues.map(normalizeIssue)
          : [],
      );

      setOutcomes(
        Array.isArray(dashboardData.outcomes)
          ? dashboardData.outcomes.map(normalizeOutcome)
          : [],
      );

      setLocations(
        locationsResponse.ok && Array.isArray(locationsData.locations)
          ? locationsData.locations.map(normalizeLocation)
          : [],
      );

      setResources(
        resourcesResponse.ok && Array.isArray(resourcesData.resources)
          ? resourcesData.resources.map(normalizeResource)
          : [],
      );

      setWork(
        workResponse.ok && Array.isArray(workData.work)
          ? workData.work.map(normalizeWorkItem)
          : [],
      );
    } catch (error) {
      setDashboardError(
        error instanceof Error
          ? error.message
          : "Unable to load dashboard data",
      );
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const pushToast = useCallback(
    (title: string, detail?: string) => {
      const id = `toast_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      setToasts((current) => [
        ...current,
        {
          id,
          title,
          detail,
        },
      ]);

      const timeout = setTimeout(() => {
        setToasts((current) =>
          current.filter((toast) => toast.id !== id),
        );
      }, 4500);

      timers.current.push(timeout);
    },
    [],
  );

  const completeOnboarding = useCallback(
    async (
      profile: OrgProfile & {
        description?: string;
      },
    ) => {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile.name,
          industry: profile.industry,
          description: profile.description,
          autonomyLevel,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ?? "Unable to complete onboarding",
        );
      }

      setOrgProfile({
        name: profile.name,
        industry: profile.industry,
      });

      setOnboarded(true);

      refreshDashboard();
    },
    [autonomyLevel, refreshDashboard],
  );

  const resetOnboarding = useCallback(() => {
    setOnboarded(false);
    setOrgProfile({
      name: "",
      industry: "",
    });
  }, []);

  const updateAction = useCallback(
    (
      issueId: string,
      patch: Partial<ActionRecord>,
    ) => {
      setIssues((current) =>
        current.map((issue) =>
          issue.id === issueId
            ? {
                ...issue,
                recommendation: {
                  ...issue.recommendation,
                  action: {
                    ...issue.recommendation.action,
                    ...patch,
                  },
                },
              }
            : issue,
        ),
      );
    },
    [],
  );

  const approveAction = useCallback(
    async (issueId: string) => {
      const issue = issues.find(
        (item) => item.id === issueId,
      );

      if (!issue) {
        throw new Error("Issue not found");
      }

      const actionId =
        issue.recommendation.action.id;

      if (!actionId) {
        throw new Error(
          "This issue has no backend action ID",
        );
      }

      const response = await fetch(
        `/api/actions/${actionId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ?? "Action execution failed",
        );
      }

      updateAction(issueId, {
        status: "completed",
        currentStep:
          issue.recommendation.action.steps.length,
      });

      setIssues((current) =>
        current.map((item) =>
          item.id === issueId
            ? {
                ...item,
                status: "resolved",
              }
            : item,
        ),
      );

      pushToast(
        "Action completed",
        "The backend execution completed successfully.",
      );
    },
    [issues, pushToast, updateAction],
  );

  const rejectAction = useCallback(
    async (issueId: string) => {
      updateAction(issueId, {
        status: "rejected" as ActionStatus,
      });

      setIssues((current) =>
        current.map((issue) =>
          issue.id === issueId
            ? {
                ...issue,
                status: "dismissed",
              }
            : issue,
        ),
      );

      pushToast(
        "Action rejected",
        "Issue left open for manual handling.",
      );
    },
    [pushToast, updateAction],
  );

  const resolveIssue = useCallback(
    async (issueId: string) => {
      setIssues((current) =>
        current.map((issue) =>
          issue.id === issueId
            ? {
                ...issue,
                status: "resolved",
              }
            : issue,
        ),
      );

      pushToast("Issue resolved");
    },
    [pushToast],
  );

  const [chat, setChat] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "I'm Kloyya. Ask me what's going wrong right now, or what needs your attention across the business.",
    },
  ]);

  const [chatBusy, setChatBusy] = useState(false);

  const sendChat = useCallback(
    async (text: string) => {
      const userMessage: ChatMessage = {
        id: `u_${Date.now()}`,
        role: "user",
        text,
      };

      setChat((current) => [
        ...current,
        userMessage,
      ]);

      setChatBusy(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(
            data.error ?? "Chat request failed",
          );
        }

        setChat((current) => [
          ...current,
          {
            id: `a_${Date.now()}`,
            role: "assistant",
            text:
              data.message ??
              data.reply ??
              data.answer ??
              "I couldn't produce a response.",
            data: data.data,
          },
        ]);
      } catch (error) {
        setChat((current) => [
          ...current,
          {
            id: `a_${Date.now()}`,
            role: "assistant",
            text:
              error instanceof Error
                ? error.message
                : "Something went wrong.",
          },
        ]);
      } finally {
        setChatBusy(false);
      }
    },
    [],
  );

  const value: DemoStore = {
    issues,
    work,
    outcomes,
    locations,
    resources,

    loadingDashboard,
    dashboardError,
    refreshDashboard,

    autonomyLevel,
    setAutonomyLevel,

    approveAction,
    rejectAction,
    resolveIssue,

    toasts,
    pushToast,

    chat,
    sendChat,
    chatBusy,

    orgProfile,
    onboarded,

    completeOnboarding,
    resetOnboarding,
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoStore(): DemoStore {
  const context = useContext(DemoContext);

  if (!context) {
    throw new Error(
      "useDemoStore must be used within DemoStoreProvider",
    );
  }

  return context;
}
