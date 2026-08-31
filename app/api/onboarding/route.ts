// app/api/onboarding/route.ts

import { NextResponse } from "next/server";
import { z } from "zod";

import { getKloyyaUserId } from "@/lib/server/auth";
import { getSupabaseAdmin } from "@/lib/server/supabase";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  industry: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  autonomyLevel: z.number().int().min(1).max(4).optional(),
});

export async function POST(request: Request) {
  try {
    const userId = await getKloyyaUserId();
    const body = schema.parse(await request.json());

    const supabase = getSupabaseAdmin();

    const { data: existingMembership } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    let organizationId =
      existingMembership?.organization_id ?? null;

    if (!organizationId) {
      const { data: organization, error } = await supabase
        .from("organizations")
        .insert({
          name: body.name,
          industry: body.industry,
        })
        .select("id")
        .single();

      if (error) throw error;

      organizationId = organization.id;

      const { error: membershipError } = await supabase
        .from("organization_members")
        .insert({
          organization_id: organizationId,
          user_id: userId,
          role: "owner",
        });

      if (membershipError) throw membershipError;
    } else {
      const { error } = await supabase
        .from("organizations")
        .update({
          name: body.name,
          industry: body.industry,
        })
        .eq("id", organizationId);

      if (error) throw error;
    }

    const { error: profileError } = await supabase
      .from("organization_profiles")
      .upsert(
        {
          organization_id: organizationId,
          description: body.description ?? null,
          autonomy_level: body.autonomyLevel ?? 2,
        },
        {
          onConflict: "organization_id",
        },
      );

    if (profileError) throw profileError;

    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      user_id: userId,
      actor_type: "user",
      event_type: "onboarding.completed",
      resource_type: "organization",
      resource_id: organizationId,
      metadata: {
        industry: body.industry,
        autonomyLevel: body.autonomyLevel ?? 2,
      },
    });

    return NextResponse.json({
      ok: true,
      organizationId,
    });
  } catch (error) {
    console.error("[KLOYYA_ONBOARDING]", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Onboarding failed",
      },
      { status: 500 },
    );
  }
}
