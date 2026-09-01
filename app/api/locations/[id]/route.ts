// app/api/locations/[id]/route.ts

import { NextResponse } from "next/server";

import { getKloyyaUserId } from "@/lib/server/auth";
import { getSupabaseAdmin } from "@/lib/server/supabase";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const userId = await getKloyyaUserId();
    const { id } = await params;
    const supabaseAdmin = getSupabaseAdmin();

    const { data: memberships, error: membershipError } =
      await supabaseAdmin
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", userId);

    if (membershipError) throw membershipError;

    const organizationIds =
      memberships?.map((item) => item.organization_id) ?? [];

    const { data: location, error: locationError } =
      await supabaseAdmin
        .from("locations")
        .select("*")
        .eq("id", id)
        .in("organization_id", organizationIds)
        .maybeSingle();

    if (locationError) throw locationError;

    if (!location) {
      return NextResponse.json(
        { ok: false, error: "Location not found" },
        { status: 404 },
      );
    }

    const [resourcesResult, workResult] = await Promise.all([
      supabaseAdmin.from("resources").select("*").eq("location_id", id),
      supabaseAdmin.from("work_items").select("*").eq("location_id", id),
    ]);

    if (resourcesResult.error) throw resourcesResult.error;
    if (workResult.error) throw workResult.error;

    return NextResponse.json({
      ok: true,
      location,
      resources: resourcesResult.data ?? [],
      work: workResult.data ?? [],
    });
  } catch (error) {
    console.error("[KLOYYA_LOCATION_DETAIL]", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load location",
      },
      { status: 500 },
    );
  }
}
