// app/api/ai/analyze/route.ts

import { NextResponse } from "next/server";

import { analyzeBusinessSignal } from "@/lib/server/ai";
import { getKloyyaUserId } from "@/lib/server/auth";
import { supabaseAdmin } from "@/lib/server/supabase";

export async function POST(request: Request) {
  try {
    const userId = await getKloyyaUserId();
    const body = await request.json();

    if (
      typeof body.source !== "string" ||
      typeof body.content !== "string"
    ) {
      return NextResponse.json(
        { error: "source and content are required" },
        { status: 400 },
      );
    }

    const analysis = await analyzeBusinessSignal({
      source: body.source,
      content: body.content,
      context: body.context,
    });

    if (!body.organizationId) {
      return NextResponse.json({
        ok: true,
        analysis,
      });
    }

    const { data: issue, error: issueError } =
      await supabaseAdmin
        .from("issues")
        .insert({
          organization_id: body.organizationId,
          title: analysis.issue.title,
          description: analysis.issue.description,
          severity: analysis.issue.severity,
          confidence: analysis.issue.confidence,
          impact: analysis.impact,
        })
        .select()
        .single();

    if (issueError) {
      throw issueError;
    }

    const { data: recommendation, error: recommendationError } =
      await supabaseAdmin
        .from("recommendations")
        .insert({
          issue_id: issue.id,
          title: analysis.recommendation.title,
          reason: analysis.recommendation.reason,
          confidence: analysis.recommendation.confidence,
          estimated_impact:
            analysis.recommendation.estimatedImpact,
          plan: [],
        })
        .select()
        .single();

    if (recommendationError) {
      throw recommendationError;
    }

    await supabaseAdmin
      .from("audit_logs")
      .insert({
        organization_id: body.organizationId,
        user_id: userId,
        actor_type: "kloyya",
        event_type: "issue.detected",
        resource_type: "issue",
        resource_id: issue.id,
        metadata: {
          source: body.source,
          confidence: analysis.issue.confidence,
        },
      });

    return NextResponse.json({
      ok: true,
      issue,
      recommendation,
      analysis,
    });
  } catch (error) {
    console.error("[KLOYYA_AI_ANALYZE]", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "AI analysis failed",
      },
      { status: 500 },
    );
  }
}