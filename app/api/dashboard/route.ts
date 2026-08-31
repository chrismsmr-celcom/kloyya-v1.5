// app/api/dashboard/route.ts

import { NextResponse } from "next/server";

import { getKloyyaUserId } from "@/lib/server/auth";
import { supabaseAdmin } from "@/lib/server/supabase";

export async function GET() {
  try {
    const userId = await getKloyyaUserId();

    const { data: memberships, error: membershipError } =
      await supabaseAdmin
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", userId);

    if (membershipError) {
      throw membershipError;
    }

    const organizationIds =
      memberships?.map((item) => item.organization_id) ?? [];

    if (organizationIds.length === 0) {
      return NextResponse.json({
        ok: true,
        issues: [],
        actions: [],
        outcomes: [],
        integrations: [],
      });
    }

    const [issues, actions, outcomes, integrations] =
      await Promise.all([
        supabaseAdmin
          .from("issues")
          .select(`
            *,
            evidence(*),
            recommendations(
              *,
              actions(*)
            )
          `)
          .in("organization_id", organizationIds)
          .order("created_at", { ascending: false })
          .limit(50),

        supabaseAdmin
          .from("actions")
          .select(`
            *,
            action_steps(*)
          `)
          .in("organization_id", organizationIds)
          .order("created_at", { ascending: false })
          .limit(50),

        supabaseAdmin
          .from("outcomes")
          .select("*")
          .in("organization_id", organizationIds)
          .order("created_at", { ascending: false })
          .limit(50),

        supabaseAdmin
          .from("integrations")
          .select("*")
          .in("organization_id", organizationIds)
          .order("created_at", { ascending: false }),
      ]);

    if (issues.error) throw issues.error;
    if (actions.error) throw actions.error;
    if (outcomes.error) throw outcomes.error;
    if (integrations.error) throw integrations.error;

    return NextResponse.json({
      ok: true,
      issues: issues.data ?? [],
      actions: actions.data ?? [],
      outcomes: outcomes.data ?? [],
      integrations: integrations.data ?? [],
    });
  } catch (error) {
    console.error("[KLOYYA_DASHBOARD]", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Dashboard loading failed",
      },
      { status: 500 },
    );
  }
}