// app/api/integrations/connect/route.ts

import { NextResponse } from "next/server";

import { authorizeToolkit } from "@/lib/server/composio";
import { getKloyyaUserId } from "@/lib/server/auth";

const ALLOWED_TOOLKITS = new Set([
  "gmail",
  "slack",
  "googlecalendar",
  "googledrive",
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const toolkit =
      typeof body.toolkit === "string"
        ? body.toolkit.toLowerCase()
        : "";

    if (!ALLOWED_TOOLKITS.has(toolkit)) {
      return NextResponse.json(
        { error: "Unsupported toolkit" },
        { status: 400 },
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

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to connect integration",
      },
      { status: 500 },
    );
  }
}