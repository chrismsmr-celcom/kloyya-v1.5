// lib/server/composio.ts

import "server-only";

import { Composio } from "@composio/core";

if (!process.env.COMPOSIO_API_KEY) {
  throw new Error("COMPOSIO_API_KEY is missing");
}

export const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
});

export const KLOYYA_TOOLKITS = [
  "gmail",
  "slack",
  "googlecalendar",
  "googledrive",
];

export const KLOYYA_GMAIL_TOOLS = [
  "GMAIL_FETCH_EMAILS",
  "GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID",
  "GMAIL_CREATE_EMAIL_DRAFT",
  "GMAIL_SEND_EMAIL",
];

export async function createKloyyaSession(userId: string) {
  return composio.sessions.create(userId, {
    toolkits: KLOYYA_TOOLKITS,
    tools: {
      gmail: {
        enable: KLOYYA_GMAIL_TOOLS,
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
  return composio.tools.execute(toolSlug, {
    userId,
    arguments: arguments_,
  });
}