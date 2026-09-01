// app/api/integrations/connect/route.ts

import { NextResponse } from "next/server";
import { authorizeToolkit } from "@/lib/server/composio";
import { getKloyyaUserId } from "@/lib/server/auth";

// Doit correspondre exactement à la liste dans composio.ts
const ALLOWED_TOOLKITS = new Set([
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
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const toolkit = typeof body.toolkit === "string" ? body.toolkit.toLowerCase() : "";

    if (!ALLOWED_TOOLKITS.has(toolkit)) {
      return NextResponse.json(
        { error: `Unsupported toolkit: ${toolkit}` },
        { status: 400 }
      );
    }

    const userId = await getKloyyaUserId();
    const result = await authorizeToolkit(userId, toolkit);

    return NextResponse.json({
      ok: true,
      toolkit,
      redirectUrl: result.redirectUrl,
      sessionId: result.sessionId,
    });
  } catch (error) {
    console.error("[KLOYYA_CONNECT]", error);
    
    // Gestion d'erreur plus détaillée pour le débogage
    const errorMessage = error instanceof Error ? error.message : "Unable to connect integration";
    
    return NextResponse.json(
      {
        ok: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
