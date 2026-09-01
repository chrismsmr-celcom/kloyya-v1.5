// app/api/work/route.ts

import { NextResponse } from "next/server";

import { getKloyyaUserId } from "@/lib/server/auth";
import { getSupabaseAdmin } from "@/lib/server/supabase";

export async function GET() {
  try {
    const userId = await getKloyyaUserId();
    const supabaseAdmin = getSupabaseAdmin();

    const { data: memberships, error: membershipError } =
      await supabaseAdmin
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", userId);

    if (membershipError) throw membershipError;

    const organizationIds =
      memberships?.map((item) => item.organization_id) ?? [];

    if (organizationIds.length === 0) {
      return NextResponse.json({ ok: true, work: [] });
    }

    const { data, error } = await supabaseAdmin
      .from("work_items")
      .select(`
        *,
        work_item_resources(resource_id)
      `)
      .in("organization_id", organizationIds)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;

    return NextResponse.json({ ok: true, work: data ?? [] });
  } catch (error) {
    console.error("[KLOYYA_WORK]", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load work items",
      },
      { status: 500 },
    );
  }
}
