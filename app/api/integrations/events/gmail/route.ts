// app/api/events/gmail/route.ts

import { NextResponse } from "next/server";

import { executeComposioTool } from "@/lib/server/composio";
import { getKloyyaUserId } from "@/lib/server/auth";
import { getSupabaseAdmin } from "@/lib/server/supabase";

export async function POST(request: Request) {
  try {
    const userId = await getKloyyaUserId();
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json().catch(() => ({}));

    const query =
      typeof body.query === "string"
        ? body.query
        : "newer_than:1d";

    const maxResults =
      typeof body.maxResults === "number"
        ? Math.min(Math.max(body.maxResults, 1), 25)
        : 10;

    const result = await executeComposioTool(
      "GMAIL_FETCH_EMAILS",
      userId,
      {
        user_id: "me",
        query,
        max_results: maxResults,
        include_payload: true,
      },
    );

    const messages =
      (result as any)?.data?.messages ??
      (result as any)?.messages ??
      [];

    const inserted = [];

    for (const message of messages) {
      const externalId =
        message?.id ??
        message?.message_id ??
        message?.thread_id;

      if (!externalId) {
        continue;
      }

      const payload = {
        provider: "gmail",
        external_id: externalId,
        event_type: "email.received",
        payload: message,
        occurred_at:
          message?.internalDate
            ? new Date(Number(message.internalDate)).toISOString()
            : new Date().toISOString(),
      };

      const { data, error } = await supabaseAdmin
        .from("events")
        .upsert(payload, {
          onConflict: "provider,external_id",
          ignoreDuplicates: false,
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      inserted.push(data.id);
    }

    return NextResponse.json({
      ok: true,
      provider: "gmail",
      events: inserted.length,
      eventIds: inserted,
    });
  } catch (error) {
    console.error("[KLOYYA_GMAIL_INGEST]", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Gmail ingestion failed",
      },
      { status: 500 },
    );
  }
}
