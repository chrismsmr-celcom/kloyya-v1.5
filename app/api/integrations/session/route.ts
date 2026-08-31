// app/api/integrations/session/route.ts

import { NextResponse } from "next/server";

import { createKloyyaSession } from "@/lib/server/composio";
import { getKloyyaUserId } from "@/lib/server/auth";

export async function GET() {
  try {
    const userId = await getKloyyaUserId();

    const session = await createKloyyaSession(userId);

    const toolkits = await session.toolkits({
      toolkits: ["gmail", "slack", "googlecalendar", "googledrive"],
    });

    return NextResponse.json({
      ok: true,
      sessionId: session.sessionId,
      toolkits,
    });
  } catch (error) {
    console.error("[KLOYYA_SESSION]", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create Composio session",
      },
      { status: 500 },
    );
  }
}