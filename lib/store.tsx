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
import { issues as seedIssues, organization, work as seedWork } from "./demo-data";
import type { ActionRecord, ActionStatus, AutonomyLevel, ChatMessage, Issue, WorkItem } from "./types";

type Toast = { id: string; title: string; detail?: string };

export type OrgProfile = { name: string; industry: string };

const ORG_STORAGE_KEY = "kloyya.orgProfile";
const ONBOARDED_STORAGE_KEY = "kloyya.onboarded";

type DemoStore = {
  issues: Issue[];
  work: WorkItem[];
  autonomyLevel: AutonomyLevel;
  setAutonomyLevel: (level: AutonomyLevel) => void;
  approveAction: (issueId: string) => void;
  rejectAction: (issueId: string) => void;
  resolveIssue: (issueId: string) => void;
  toasts: Toast[];
  pushToast: (title: string, detail?: string) => void;
  chat: ChatMessage[];
  sendChat: (text: string) => void;
  chatBusy: boolean;
  orgProfile: OrgProfile;
  onboarded: boolean;
  completeOnboarding: (profile: OrgProfile) => void;
  resetOnboarding: () => void;
};

const DemoContext = createContext<DemoStore | null>(null);

const STEP_INTERVAL_MS = 700;

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>(seedIssues);
  const [work, setWork] = useState<WorkItem[]>(seedWork);
  const [autonomyLevel, setAutonomyLevel] = useState<AutonomyLevel>(2);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [orgProfile, setOrgProfile] = useState<OrgProfile>({
    name: organization.name,
    industry: organization.industry,
  });
  const [onboarded, setOnboarded] = useState(false);

  // Hydrating from localStorage must happen after mount (client-only) to avoid an
  // SSR/CSR markup mismatch, so this can't be computed during render or in a lazy
  // useState initializer. Mount-only, so it can't cascade into a render loop.
  useEffect(() => {
    try {
      const savedOrg = localStorage.getItem(ORG_STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (savedOrg) setOrgProfile(JSON.parse(savedOrg));
      setOnboarded(localStorage.getItem(ONBOARDED_STORAGE_KEY) === "1");
    } catch {
      // localStorage unavailable — fall back to defaults
    }
  }, []);

  const completeOnboarding = useCallback((profile: OrgProfile) => {
    setOrgProfile(profile);
    setOnboarded(true);
    try {
      localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(profile));
      localStorage.setItem(ONBOARDED_STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }, []);

  const resetOnboarding = useCallback(() => {
    setOnboarded(false);
    try {
      localStorage.removeItem(ONBOARDED_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);
  const [chat, setChat] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "I'm Kloyya. Ask me what's going wrong right now, or what needs your attention across the business.",
    },
  ]);
  const [chatBusy, setChatBusy] = useState(false);
  const timers = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const pushToast = useCallback((title: string, detail?: string) => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts((t) => [...t, { id, title, detail }]);
    const timeout = setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4200);
    timers.current.push(timeout);
  }, []);

  const updateAction = useCallback(
    (issueId: string, patch: Partial<ActionRecord>) => {
      setIssues((prev) =>
        prev.map((iss) =>
          iss.id === issueId
            ? { ...iss, recommendation: { ...iss.recommendation, action: { ...iss.recommendation.action, ...patch } } }
            : iss
        )
      );
    },
    []
  );

  const runExecution = useCallback(
    (issueId: string) => {
      const issue = issues.find((i) => i.id === issueId);
      if (!issue) return;
      const totalSteps = issue.recommendation.action.steps.length;
      let step = 0;
      updateAction(issueId, { status: "executing", currentStep: 0 });
      const tick = () => {
        step += 1;
        if (step >= totalSteps) {
          updateAction(issueId, { currentStep: totalSteps, status: "completed" });
          setIssues((prev) =>
            prev.map((iss) => (iss.id === issueId ? { ...iss, status: "resolved" } : iss))
          );
          if (issue.workId) {
            setWork((prev) =>
              prev.map((w) =>
                w.id === issue.workId
                  ? { ...w, status: "in_progress", delayMinutes: 0, assignee: w.assignee }
                  : w
              )
            );
          }
          pushToast("Action completed", issue.recommendation.action.estimatedImpact);
          return;
        }
        updateAction(issueId, { currentStep: step });
        const t = setTimeout(tick, STEP_INTERVAL_MS);
        timers.current.push(t);
      };
      const t = setTimeout(tick, STEP_INTERVAL_MS);
      timers.current.push(t);
    },
    [issues, pushToast, updateAction]
  );

  const approveAction = useCallback(
    (issueId: string) => {
      updateAction(issueId, { status: "approved" as ActionStatus });
      pushToast("Action approved", "Kloyya is executing the plan now.");
      const t = setTimeout(() => runExecution(issueId), 350);
      timers.current.push(t);
    },
    [pushToast, runExecution, updateAction]
  );

  const rejectAction = useCallback(
    (issueId: string) => {
      updateAction(issueId, { status: "rejected" as ActionStatus });
      setIssues((prev) =>
        prev.map((iss) => (iss.id === issueId ? { ...iss, status: "dismissed" } : iss))
      );
      pushToast("Action rejected", "Issue left open for manual handling.");
    },
    [pushToast, updateAction]
  );

  const resolveIssue = useCallback(
    (issueId: string) => {
      setIssues((prev) =>
        prev.map((iss) => (iss.id === issueId ? { ...iss, status: "resolved" } : iss))
      );
      pushToast("Issue resolved");
    },
    [pushToast]
  );

  const sendChat = useCallback(
    (text: string) => {
      const userMsg: ChatMessage = { id: `u_${Date.now()}`, role: "user", text };
      setChat((c) => [...c, userMsg]);
      setChatBusy(true);
      const t = setTimeout(() => {
        const open = issues.filter((i) => i.status === "open" || i.status === "investigating");
        const lower = text.toLowerCase();
        let reply = "";
        let attach: ChatMessage["data"] = undefined;
        if (lower.includes("wrong") || lower.includes("status") || lower.includes("happening")) {
          reply = `Right now there ${open.length === 1 ? "is" : "are"} ${open.length} open issue${
            open.length === 1 ? "" : "s"
          } across the business. The highest priority is "${open[0]?.title ?? "none"}" — I have a recommendation ready.`;
          attach = { issues: open.slice(0, 3) };
        } else if (lower.includes("delay") || lower.includes("delivery") || lower.includes("truck")) {
          const d = issues.find((i) => i.id === "iss_delay_4821");
          reply = d
            ? `${d.title}. ${d.recommendation.reason} I can reassign it to Truck 23 now if you approve — estimated impact: ${d.recommendation.action.estimatedImpact}.`
            : "No active delivery delays right now.";
          attach = d ? { issues: [d] } : undefined;
        } else if (lower.includes("approve") || lower.includes("action")) {
          const pending = issues.filter((i) => i.recommendation.action.status === "pending_approval");
          reply = `You have ${pending.length} action${pending.length === 1 ? "" : "s"} awaiting approval. Open the Approval Center to review and approve them.`;
          attach = { actions: pending.map((i) => i.recommendation.action) };
        } else if (lower.includes("save") || lower.includes("outcome") || lower.includes("roi")) {
          reply =
            "This week Kloyya reduced delivery delays by 4h 12m, prevented an est. $8,400 in downtime, and resolved 27 issues — 68% without human escalation.";
        } else {
          reply =
            "I looked across events, work, resources and issues connected to your business. Nothing else needs urgent attention beyond what's already flagged in the Command Center.";
        }
        setChat((c) => [...c, { id: `a_${Date.now()}`, role: "assistant", text: reply, data: attach }]);
        setChatBusy(false);
      }, 900);
      timers.current.push(t);
    },
    [issues]
  );

  const value: DemoStore = {
    issues,
    work,
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

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoStore(): DemoStore {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemoStore must be used within DemoStoreProvider");
  return ctx;
}
