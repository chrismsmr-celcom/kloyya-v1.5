// lib/server/composio.ts

import "server-only";
import { Composio } from "@composio/core";

// Liste étendue de tous les outils supportés par ton prototype
const TOOLKITS = [
  "gmail",
  "slack",
  "whatsapp",
  "googlecalendar",
  "googledrive",
  "googlesheets",
  "notion",
  "jira",
  "linear",
  "trello",
  "asana",
  "hubspot",
] as const;

function getComposio() {
  const apiKey = process.env.COMPOSIO_API_KEY;
  
  // Si la clé manque, on lève une erreur claire au lieu de planter silencieusement
  if (!apiKey) {
    throw new Error("COMPOSIO_API_KEY is missing in environment variables");
  }

  return new Composio({ apiKey });
}

export async function createKloyyaSession(userId: string) {
  return getComposio().sessions.create(userId, {
    toolkits: [...TOOLKITS],
    manageConnections: {
      enable: true,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/integrations`,
    },
  });
}

export async function authorizeToolkit(userId: string, toolkit: string) {
  const session = await createKloyyaSession(userId);
  
  const connection = await session.authorize(toolkit, {
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/integrations`,
  });

  return {
    redirectUrl: connection.redirectUrl,
    sessionId: session.sessionId,
  };
}

export async function executeComposioTool(
  toolSlug: string,
  userId: string,
  arguments_: Record<string, unknown>
) {
  const composio = getComposio();
  return composio.tools.execute(toolSlug, {
    userId,
    arguments: arguments_,
    dangerouslySkipVersionCheck: true,
  });
}
