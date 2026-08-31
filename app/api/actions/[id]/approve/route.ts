// app/api/actions/[id]/approve/route.ts

import { NextResponse } from "next/server";

import { executeComposioTool } from "@/lib/server/composio";
import { getKloyyaUserId } from "@/lib/server/auth";
import { supabaseAdmin } from "@/lib/server/supabase";
import { evaluatePolicy } from "@/lib/server/policy";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: Request,
  { params }: Params,
) {
  try {
    const userId = await getKloyyaUserId();
    const { id } = await params;

    const { data: action, error: actionError } = await supabaseAdmin
      .from("actions")
      .select(`
        *,
        action_steps(*)
      `)
      .eq("id", id)
      .single();

    if (actionError || !action) {
      return NextResponse.json(
        { error: "Action not found" },
        { status: 404 },
      );
    }

    if (action.status !== "pending_approval") {
      return NextResponse.json(
        { error: `Action is ${action.status}` },
        { status: 409 },
      );
    }

    const autonomyLevel = 2;

    const firstStep = action.action_steps
      ?.sort((a: any, b: any) => a.step_order - b.step_order)
      ?.[0];

    if (!firstStep) {
      return NextResponse.json(
        { error: "Action has no executable steps" },
        { status: 422 },
      );
    }

    const policy = evaluatePolicy(
      firstStep.tool_slug,
      autonomyLevel,
    );

    if (!policy.allowed) {
      return NextResponse.json(
        {
          error: "Action blocked by policy",
          reason: policy.reason,
        },
        { status: 403 },
      );
    }

    await supabaseAdmin
      .from("approvals")
      .insert({
        action_id: id,
        user_id: userId,
        decision: "approved",
      });

    await supabaseAdmin
      .from("actions")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
      })
      .eq("id", id);

    await supabaseAdmin
      .from("action_steps")
      .update({
        status: "executing",
        started_at: new Date().toISOString(),
      })
      .eq("id", firstStep.id);

    const executionInsert = await supabaseAdmin
      .from("executions")
      .insert({
        action_id: id,
        action_step_id: firstStep.id,
        provider: firstStep.provider,
        tool_slug: firstStep.tool_slug,
        status: "started",
        request: firstStep.arguments,
      })
      .select("id")
      .single();

    if (executionInsert.error) {
      throw executionInsert.error;
    }

    const executionId = executionInsert.data.id;

    await supabaseAdmin
      .from("actions")
      .update({
        status: "executing",
      })
      .eq("id", id);

    let result: unknown;

    try {
      result = await executeComposioTool(
        firstStep.tool_slug,
        userId,
        firstStep.arguments ?? {},
      );
    } catch (executionError) {
      const message =
        executionError instanceof Error
          ? executionError.message
          : "Execution failed";

      await supabaseAdmin
        .from("executions")
        .update({
          status: "failed",
          error: message,
          response: null,
          finished_at: new Date().toISOString(),
        })
        .eq("id", executionId);

      await supabaseAdmin
        .from("action_steps")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", firstStep.id);

      await supabaseAdmin
        .from("actions")
        .update({
          status: "failed",
          error: message,
          failed_at: new Date().toISOString(),
        })
        .eq("id", id);

      throw executionError;
    }

    await supabaseAdmin
      .from("executions")
      .update({
        status: "success",
        response: result,
        finished_at: new Date().toISOString(),
      })
      .eq("id", executionId);

    await supabaseAdmin
      .from("action_steps")
      .update({
        status: "completed",
        result,
        verification: {
          verified: true,
          verifiedAt: new Date().toISOString(),
        },
        completed_at: new Date().toISOString(),
      })
      .eq("id", firstStep.id);

    await supabaseAdmin
      .from("actions")
      .update({
        status: "completed",
        current_step: 1,
        completed_at: new Date().toISOString(),
      })
      .eq("id", id);

    await supabaseAdmin
      .from("audit_logs")
      .insert({
        organization_id: action.organization_id,
        user_id: userId,
        actor_type: "user",
        event_type: "action.executed",
        resource_type: "action",
        resource_id: id,
        metadata: {
          tool: firstStep.tool_slug,
          executionId,
        },
      });

    return NextResponse.json({
      ok: true,
      actionId: id,
      executionId,
      status: "completed",
      result,
    });
  } catch (error) {
    console.error("[KLOYYA_APPROVE_ACTION]", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Action execution failed",
      },
      { status: 500 },
    );
  }
}