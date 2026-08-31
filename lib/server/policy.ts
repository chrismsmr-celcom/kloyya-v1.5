// lib/server/policy.ts

import "server-only";

export type PolicyDecision =
  | {
      allowed: true;
      requiresApproval: boolean;
      reason: string;
    }
  | {
      allowed: false;
      requiresApproval: true;
      reason: string;
    };

const ALWAYS_APPROVAL = new Set([
  "GMAIL_SEND_EMAIL",
  "GMAIL_DELETE_MESSAGE",
  "GMAIL_DELETE_THREAD",
]);

const READ_ONLY = new Set([
  "GMAIL_FETCH_EMAILS",
  "GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID",
]);

export function evaluatePolicy(
  toolSlug: string,
  autonomyLevel: number,
): PolicyDecision {
  if (READ_ONLY.has(toolSlug)) {
    return {
      allowed: true,
      requiresApproval: false,
      reason: "Read-only operation.",
    };
  }

  if (ALWAYS_APPROVAL.has(toolSlug)) {
    if (autonomyLevel < 3) {
      return {
        allowed: true,
        requiresApproval: true,
        reason: "This operation can create an external side effect.",
      };
    }

    return {
      allowed: true,
      requiresApproval: false,
      reason: "Allowed by autonomy policy.",
    };
  }

  return {
    allowed: true,
    requiresApproval: autonomyLevel < 3,
    reason:
      autonomyLevel < 3
        ? "Action requires human approval at the current autonomy level."
        : "Action allowed by autonomy policy.",
  };
}