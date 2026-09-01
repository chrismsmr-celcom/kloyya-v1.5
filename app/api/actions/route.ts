import { NextResponse } from "next/server";
import { getKloyyaUserId } from "@/lib/server/auth";
import { getSupabaseAdmin } from "@/lib/server/supabase";

export async function GET() {
  try {
    const userId = await getKloyyaUserId();
    const supabaseAdmin = getSupabaseAdmin();

    const { data: memberships } = await supabaseAdmin
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", userId);

    const organizationIds = memberships?.map((m) => m.organization_id) ?? [];

    if (organizationIds.length === 0) {
      return NextResponse.json({ ok: true, actions: [] });
    }

    const { data: actions, error } = await supabaseAdmin
      .from("actions")
      .select(`
        *,
        action_steps(*),
        recommendations(*)
      `)
      .in("organization_id", organizationIds)
      .eq("status", "pending_approval")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ ok: true, actions: actions ?? [] });
  } catch (error) {
    console.error("[KLOYYA_ACTIONS]", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to load actions" },
      { status: 500 }
    );
  }
}
