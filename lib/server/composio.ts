// lib/server/composio.ts

import "server-only";

import { Composio } from "@composio/core";

export const KLOYYA_TOOLKITS = [
  "gmail",
  "slack",
  "googlecalendar",
  "googledrive",
] as const;

export const KLOYYA_GMAIL_TOOLS = [
  "GMAIL_FETCH_EMAILS",
  "GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID",
  "GMAIL_CREATE_EMAIL_DRAFT",
  "GMAIL_SEND_EMAIL",
] as const;

function getComposio() {
  const apiKey = process.env.COMPOSIO_API_KEY;

  if (!apiKey) {
    throw new Error("COMPOSIO_API_KEY is missing");
  }

  return new Composio({
    apiKey,
  });
}

export async function createKloyyaSession(userId: string) {
  const composio = getComposio();

  return composio.sessions.create(userId, {
    toolkits: [...KLOYYA_TOOLKITS],
    tools: {
      gmail: {
        enable: [...KLOYYA_GMAIL_TOOLS],
      },
    },
    manageConnections: {
      enable: true,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/integrations`,
    },
  });
}

export async function authorizeToolkit(
  userId: string,
  toolkit: string,
) {
  const session = await createKloyyaSession(userId);

  const authorization = await session.authorize(toolkit);

  return {
    redirectUrl: authorization.redirectUrl,
    sessionId: session.sessionId,
  };
}

export async function executeComposioTool(
  toolSlug: string,
  userId: string,
  arguments_: Record<string, unknown>,
) {
  const composio = getComposio();

  return composio.tools.execute(toolSlug, {
    userId,
    arguments: arguments_,
  });
}
