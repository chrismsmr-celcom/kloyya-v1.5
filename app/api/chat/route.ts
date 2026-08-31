// app/api/chat/route.ts

import { NextResponse } from "next/server";

import { analyzeBusinessSignal } from "@/lib/server/ai";
import { getKloyyaUserId } from "@/lib/server/auth";
import { getSupabaseAdmin } from "@/lib/server/supabase";

export async function POST(request: Request) {
  try {
    const userId = await getKloyyaUserId();
    const body = await request.json();
    const supabaseAdmin = getSupabaseAdmin();
    
    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (!message) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 },
      );
    }

    const { data: memberships } = await supabaseAdmin
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", userId);

    const organizationIds =
      memberships?.map((x) => x.organization_id) ?? [];

    const { data: issues } =
      organizationIds.length > 0
        ? await supabaseAdmin
            .from("issues")
            .select(`
              id,
              title,
              description,
              severity,
              status,
              confidence,
              impact,
              evidence(*)
            `)
            .in("organization_id", organizationIds)
            .in("status", ["open", "investigating"])
            .order("created_at", { ascending: false })
            .limit(20)
        : { data: [] };

    const analysis = await analyzeBusinessSignal({
      source: "kloyya_chat",
      content: message,
      context: {
        activeIssues: issues ?? [],
      },
    });

    return NextResponse.json({
      ok: true,
      answer: [
        analysis.issue.description,
        "",
        `Recommendation: ${analysis.recommendation.title}`,
        analysis.recommendation.reason,
      ].join("\n"),
      issue: analysis.issue,
      impact: analysis.impact,
      recommendation: analysis.recommendation,
    });
  } catch (error) {
    console.error("[KLOYYA_CHAT]", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Chat failed",
      },
      { status: 500 },
    );
  }
}
