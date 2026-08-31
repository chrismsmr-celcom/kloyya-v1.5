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
  OutcomeEntry,
  Recommendation,
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
    status: (actionRow?.status ??
      "pending_approval") as ActionStatus,
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
    workId: row.work_id ?? undefined,
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

export function DemoStoreProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [work] = useState<WorkItem[]>([]);
  const [outcomes, setOutcomes] = useState<OutcomeEntry[]>([]);

  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [dashboardError, setDashboardError] =
    useState<string | null>(null);

  const [autonomyLevel, setAutonomyLevel] =
    useState<AutonomyLevel>(2);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const [orgProfile, setOrgProfile] = useState<OrgProfile>({
    name: "",
    industry: "",
  });

  const [onboarded, setOnboarded] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const refreshDashboard = useCallback(async () => {
    setLoadingDashboard(true);
    setDashboardError(null);

    try {
      const response = await fetch("/api/dashboard", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ?? "Unable to load dashboard data",
        );
      }

      setIssues(
        Array.isArray(data.issues)
          ? data.issues.map(normalizeIssue)
          : [],
      );

      setOutcomes(
        Array.isArray(data.outcomes)
          ? data.outcomes.map(normalizeOutcome)
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
    void refreshDashboard();
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

      await refreshDashboard();
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

      const actionId = issue.recommendation.action.id;

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
        status: "rejected",
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
