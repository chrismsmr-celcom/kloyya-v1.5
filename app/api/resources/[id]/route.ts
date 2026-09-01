// app/api/resources/[id]/route.ts

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

    const { data: resource, error: resourceError } =
      await supabaseAdmin
        .from("resources")
        .select("*")
        .eq("id", id)
        .in("organization_id", organizationIds)
        .maybeSingle();

    if (resourceError) throw resourceError;

    if (!resource) {
      return NextResponse.json(
        { ok: false, error: "Resource not found" },
        { status: 404 },
      );
    }

    const { data: links, error: linksError } = await supabaseAdmin
      .from("work_item_resources")
      .select("work_item_id, work_items(*)")
      .eq("resource_id", id);

    if (linksError) throw linksError;

    const work = (links ?? [])
      .map((link: any) => link.work_items)
      .filter(Boolean);

    return NextResponse.json({ ok: true, resource, work });
  } catch (error) {
    console.error("[KLOYYA_RESOURCE_DETAIL]", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load resource",
      },
      { status: 500 },
    );
  }
}
