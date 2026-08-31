import type { ActionStatus, Severity, WorkStatus } from "./types";

export function severityTone(s: Severity): "neutral" | "warn" | "bad" | "critical" {
  switch (s) {
    case "critical":
      return "critical";
    case "high":
      return "bad";
    case "medium":
      return "warn";
    default:
      return "neutral";
  }
}

export function workStatusTone(s: WorkStatus): "neutral" | "accent" | "good" | "warn" | "bad" {
  switch (s) {
    case "completed":
      return "good";
    case "blocked":
      return "bad";
    case "in_progress":
      return "accent";
    case "assigned":
      return "warn";
    default:
      return "neutral";
  }
}

export function actionStatusTone(s: ActionStatus): "neutral" | "accent" | "good" | "warn" | "bad" {
  switch (s) {
    case "completed":
      return "good";
    case "rejected":
      return "bad";
    case "executing":
      return "accent";
    case "approved":
      return "accent";
    default:
      return "warn";
  }
}

export function workStatusLabel(s: WorkStatus): string {
  return s.replace("_", " ");
}
