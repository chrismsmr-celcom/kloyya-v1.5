// app/api/locations/route.ts

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
      return NextResponse.json({ ok: true, locations: [] });
    }

    const [locationsResult, workResult, issuesResult] =
      await Promise.all([
        supabaseAdmin
          .from("locations")
          .select("*")
          .in("organization_id", organizationIds)
          .order("name", { ascending: true }),

        supabaseAdmin
          .from("work_items")
          .select("id, location_id, status")
          .in("organization_id", organizationIds),

        supabaseAdmin
          .from("issues")
          .select("id, location_id, status")
          .in("organization_id", organizationIds),
      ]);

    if (locationsResult.error) throw locationsResult.error;
    if (workResult.error) throw workResult.error;
    if (issuesResult.error) throw issuesResult.error;

    const activeWorkByLocation = new Map<string, number>();
    for (const w of workResult.data ?? []) {
      if (!w.location_id || w.status === "completed") continue;
      activeWorkByLocation.set(
        w.location_id,
        (activeWorkByLocation.get(w.location_id) ?? 0) + 1,
      );
    }

    const openIssuesByLocation = new Map<string, number>();
    for (const i of issuesResult.data ?? []) {
      if (
        !i.location_id ||
        (i.status !== "open" && i.status !== "investigating")
      )
        continue;
      openIssuesByLocation.set(
        i.location_id,
        (openIssuesByLocation.get(i.location_id) ?? 0) + 1,
      );
    }

    const locations = (locationsResult.data ?? []).map((loc) => ({
      id: loc.id,
      name: loc.name,
      type: loc.type,
      city: loc.city,
      country: loc.country,
      health: loc.health,
      activeWork: activeWorkByLocation.get(loc.id) ?? 0,
      openIssues: openIssuesByLocation.get(loc.id) ?? 0,
    }));

    return NextResponse.json({ ok: true, locations });
  } catch (error) {
    console.error("[KLOYYA_LOCATIONS]", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load locations",
      },
      { status: 500 },
    );
  }
}
